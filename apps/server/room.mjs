// Eén sessie als "kamer": verwerkt Fetch-verzoeken (Request → Response), bewaart de toestand
// na iedere wijziging en verspreidt die via SSE. Dezelfde code draait in de lokale Node-server
// en in een Cloudflare Durable Object; alleen opslag en wekker verschillen.
import * as game from '../../packages/game/engine.mjs';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const enc = new TextEncoder();

function random(bytes) {
  return crypto.getRandomValues(new Uint8Array(bytes));
}
export function newCode() {
  return [...random(8)].map(b => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}
function token() {
  return btoa(String.fromCharCode(...random(24))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function safeEqual(a, b) {
  a = String(a ?? ''); b = String(b ?? '');
  if (!a || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function cookie(request, name) {
  for (const part of (request.headers.get('cookie') ?? '').split(';')) {
    const [k, v] = part.trim().split('=');
    if (k === name) return v;
  }
  return undefined;
}
const json = (status, body, headers = {}) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
});

async function readJson(request) {
  if (!(request.headers.get('content-type') ?? '').startsWith('application/json')) return null;
  const raw = await request.text();
  if (raw.length > 10_000) return null;
  try { return JSON.parse(raw || '{}'); } catch { return null; }
}

// Vroegste toekomstige deadline, voor de wekker van het Durable Object.
export function nextDeadline(s) {
  const r = s.round;
  const due = r && { puzzle: r.puzzleEndsAt, route: r.exerciseStartsAt, exercise: r.exerciseEndsAt }[s.phase];
  if (!due) return null;
  return r.winnerId && !r.chosenBlockId ? Math.min(due, r.choiceEndsAt) : due;
}

export class Room {
  // record: { state, adminToken, tokens: { [token]: participantId } }
  // storage: { save(record) } — wordt na iedere wijziging aangeroepen, vóór het publiceren.
  constructor({ record, storage, now = Date.now, schedule = () => {} }) {
    this.record = record;
    this.storage = storage;
    this.now = now;
    this.schedule = schedule;
    this.streams = new Set();
  }

  static create({ code, content, demo }) {
    const durations = demo ? content.demoDurations : content.durations;
    return { state: game.createSession({ code, content: { ...content, demo }, durations }), adminToken: token(), tokens: {} };
  }

  get state() { return this.record.state; }

  async commit() {
    await this.storage.save(this.record);
    this.schedule(nextDeadline(this.state));
    for (const stream of this.streams) this.push(stream);
  }

  push(stream) {
    const data = JSON.stringify(game.view(this.state, this.now(), stream.viewerId));
    try { stream.controller.enqueue(enc.encode(`id: ${this.state.revision}\nevent: state\ndata: ${data}\n\n`)); }
    catch { this.streams.delete(stream); }
  }

  ping() {
    for (const stream of this.streams) {
      try { stream.controller.enqueue(enc.encode(': ping\n\n')); } catch { this.streams.delete(stream); }
    }
  }

  // Verwerkt verstreken deadlines, ook na een herstart met achterstand.
  async tick() {
    if (game.advance(this.state, this.now())) await this.commit();
  }

  // action: het deel van het pad na /api/sessions/:code/
  async fetch(request, action) {
    await this.tick();
    const s = this.state;
    const cookieName = `kf_${s.code}`;
    const viewerId = this.record.tokens[cookie(request, cookieName)];

    if (request.method === 'GET' && action === 'state') return json(200, game.view(s, this.now(), viewerId));

    if (request.method === 'GET' && action === 'events') {
      let stream;
      const body = new ReadableStream({
        start: controller => { stream = { controller, viewerId }; this.streams.add(stream); this.push(stream); },
        cancel: () => this.streams.delete(stream),
      });
      return new Response(body, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' } });
    }

    if (request.method !== 'POST') return json(404, { code: 'not_found' });
    const body = await readJson(request);
    if (!body) return json(415, { code: 'json_required' });
    const knownActions = Object.keys(s.actions).length;
    const finish = async (result, headers) => {
      if (result.ok) await this.commit();
      // Ook een geweigerde actie-id bewaren: na een herstart moet dezelfde id dezelfde uitkomst geven.
      else if (Object.keys(s.actions).length !== knownActions) await this.storage.save(this.record);
      return json(result.ok ? 200 : result.status, { ...result, revision: s.revision }, headers);
    };

    if (action === 'join') {
      if (viewerId) return json(200, { ok: true, revision: s.revision }); // al deelnemer
      const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
      const setCookie = t => ({ 'Set-Cookie': `${cookieName}=${t}; HttpOnly; SameSite=Lax; Path=/; Max-Age=14400${secure}` });
      // Een herhaald join-verzoek (cookie kwam niet aan) met dezelfde geheime actie-id krijgt dezelfde identiteit terug.
      const joins = (this.record.joins ??= {});
      const joinKey = typeof body.actionId === 'string' && body.actionId.length >= 16 && body.actionId.length <= 64 ? body.actionId : null;
      if (joinKey && joins[joinKey]) return json(200, { ok: true, revision: s.revision }, setCookie(joins[joinKey]));
      const participantId = crypto.randomUUID();
      const result = game.join(s, { participantId, name: body.name, color: body.color });
      if (!result.ok) return finish(result);
      const t = token();
      this.record.tokens[t] = participantId;
      if (joinKey) joins[joinKey] = t;
      return finish(result, setCookie(t));
    }
    if (action === 'start') {
      if (!safeEqual(request.headers.get('x-admin-token'), this.record.adminToken))
        return json(403, { code: 'forbidden', message: 'Alleen de beheerder start.' });
      return finish(game.start(s, this.now()));
    }
    const [kind, roundId, verb] = action.split('/');
    if (kind === 'rounds' && verb === 'answer')
      return finish(game.answer(s, { participantId: viewerId, roundId, actionId: body.actionId, answer: body.answer }, this.now()));
    if (kind === 'rounds' && verb === 'choice')
      return finish(game.choose(s, { participantId: viewerId, roundId, actionId: body.actionId, blockId: body.blockId }, this.now()));
    return json(404, { code: 'not_found' });
  }
}
