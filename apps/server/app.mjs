// Lokale Node-server: dezelfde kamers als op Cloudflare, met een eenvoudige opslag.
// `store` is een Map(code -> JSON-tekst); geef dezelfde Map door om een herstart na te bootsen.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { Room, newCode } from './room.mjs';

const WEB = new URL('../web/', import.meta.url);
const STATIC = {
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/style.css': ['style.css', 'text/css; charset=utf-8'],
};

export function createApp({ content, now = Date.now, adminKey = process.env.ADMIN_KEY, tickMs = 250, store = new Map() }) {
  const rooms = new Map();

  function room(code) {
    if (!rooms.has(code)) {
      if (!store.has(code)) return null;
      const storage = { save: record => store.set(code, JSON.stringify(record)) };
      rooms.set(code, new Room({ record: JSON.parse(store.get(code)), storage, now }));
    }
    return rooms.get(code);
  }

  async function tick() {
    for (const code of store.keys()) await room(code).tick();
  }

  async function handle(request) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);
    if (request.method === 'GET' && (url.pathname === '/' || parts[0] === 's'))
      return new Response(await readFile(new URL('index.html', WEB)), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
    if (request.method === 'GET' && STATIC[url.pathname]) {
      const [file, type] = STATIC[url.pathname];
      return new Response(await readFile(new URL(file, WEB)), { headers: { 'Content-Type': type, 'Cache-Control': 'no-store' } });
    }
    if (parts[0] !== 'api' || parts[1] !== 'sessions') return Response.json({ code: 'not_found' }, { status: 404 });

    if (parts.length === 2 && request.method === 'POST') {
      if (!(request.headers.get('content-type') ?? '').startsWith('application/json')) return Response.json({ code: 'json_required' }, { status: 415 });
      if (adminKey && request.headers.get('x-admin-key') !== adminKey) return Response.json({ code: 'forbidden', message: 'Beheersleutel vereist.' }, { status: 403 });
      const body = await request.json().catch(() => ({}));
      const code = newCode();
      const record = Room.create({ code, content, demo: body.demo === true });
      store.set(code, JSON.stringify(record));
      return Response.json({ code, adminToken: record.adminToken }, { status: 201 });
    }
    const r = room(parts[2]);
    if (!r) return Response.json({ code: 'no_session', message: 'Sessie niet gevonden.' }, { status: 404 });
    return r.fetch(request, parts.slice(3).join('/'));
  }

  const server = createServer(async (req, res) => {
    try {
      const request = new Request(`http://${req.headers.host ?? 'localhost'}${req.url}`, {
        method: req.method, headers: req.headers,
        ...(req.method === 'GET' || req.method === 'HEAD' ? {} : { body: Readable.toWeb(req), duplex: 'half' }),
      });
      const response = await handle(request);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      if (!response.body) return res.end();
      const reader = response.body.getReader();
      req.on('close', () => reader.cancel().catch(() => {}));
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } catch (err) {
      console.error(err);
      if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 'error' }));
    }
  });
  const timer = tickMs ? setInterval(tick, tickMs) : null;
  const ping = setInterval(() => { for (const r of rooms.values()) r.ping(); }, 15000);
  server.on('close', () => { clearInterval(timer); clearInterval(ping); });
  return { server, tick };
}
