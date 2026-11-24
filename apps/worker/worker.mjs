// Cloudflare Worker: statische telefoonpagina via Workers Assets, elke sessie in een eigen Durable Object.
// Het Durable Object verwerkt alle opdrachten van één sessie na elkaar, bewaart de toestand
// en zet een wekker op de eerstvolgende deadline, zodat de ronde ook zonder verzoeken doorloopt.
import { DurableObject } from 'cloudflare:workers';
import content from '../../content/examples/ronde.json';
import { Room, newCode, nextDeadline } from '../server/room.mjs';

const json = (status, body) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export class SessionObject extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.room = null;
    ctx.blockConcurrencyWhile(async () => {
      const record = await ctx.storage.get('record');
      if (record) this.load(record);
    });
  }

  load(record) {
    this.room = new Room({
      record,
      storage: { save: r => this.ctx.storage.put('record', r) },
      schedule: () => this.reschedule(),
    });
  }

  // Eén wekker per object: de eerstvolgende deadline, of eerder een SSE-ping zolang er telefoons verbonden zijn.
  reschedule() {
    const times = [nextDeadline(this.room.state)];
    if (this.room.streams.size) times.push(Date.now() + 15_000);
    const at = Math.min(...times.filter(Boolean));
    return Number.isFinite(at) ? this.ctx.storage.setAlarm(at) : this.ctx.storage.deleteAlarm();
  }

  // Alleen via de Worker aangeroepen (RPC), niet bereikbaar via een URL.
  async init(code, demo) {
    if (this.room) throw new Error('Sessie bestaat al');
    const record = Room.create({ code, content, demo });
    await this.ctx.storage.put('record', record);
    this.load(record);
    return record.adminToken;
  }

  async fetch(request) {
    if (!this.room) return json(404, { code: 'no_session', message: 'Sessie niet gevonden.' });
    const action = new URL(request.url).pathname.split('/').slice(4).join('/');
    const response = await this.room.fetch(request, action);
    if (action === 'events') await this.reschedule();
    return response;
  }

  async alarm() {
    if (!this.room) return;
    await this.room.tick();
    this.room.ping();
    await this.reschedule();
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0] !== 'api' || parts[1] !== 'sessions') return env.ASSETS.fetch(request);

    if (parts.length === 2 && request.method === 'POST') {
      if (!(request.headers.get('content-type') ?? '').startsWith('application/json')) return json(415, { code: 'json_required' });
      if (env.ADMIN_KEY && request.headers.get('x-admin-key') !== env.ADMIN_KEY) return json(403, { code: 'forbidden', message: 'Beheersleutel vereist.' });
      const body = await request.json().catch(() => ({}));
      const code = newCode();
      const adminToken = await env.SESSIONS.get(env.SESSIONS.idFromName(code)).init(code, body.demo === true);
      return json(201, { code, adminToken });
    }
    if (!/^[A-Z0-9]{8}$/.test(parts[2] ?? '')) return json(404, { code: 'no_session', message: 'Sessie niet gevonden.' });
    return env.SESSIONS.get(env.SESSIONS.idFromName(parts[2])).fetch(request);
  },
};
