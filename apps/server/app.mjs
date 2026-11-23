// HTTP-server voor gedeelde sessies: opdrachten via JSON-POST, toestand via SSE.
// Toestand staat in het geheugen van één proces; herstel na serverherstart is mijlpaal 2.
import { createServer } from 'node:http';
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import * as game from '../../packages/game/engine.mjs';

const WEB = new URL('../web/', import.meta.url);
const STATIC = {
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/style.css': ['style.css', 'text/css; charset=utf-8'],
};
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function newCode() {
  return [...randomBytes(8)].map(b => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a ?? '')), y = Buffer.from(String(b ?? ''));
  return x.length === y.length && timingSafeEqual(x, y);
}

function cookies(req) {
  return Object.fromEntries((req.headers.cookie ?? '').split(';').map(c => c.trim().split('=')).filter(([k]) => k));
}

export function createApp({ content, now = Date.now, adminKey = process.env.ADMIN_KEY, tickMs = 250 }) {
  const sessions = new Map(); // code -> { state, adminToken, tokens: Map(token -> participantId), streams: Set }

  function publish(entry) {
    for (const stream of entry.streams) {
      const data = JSON.stringify(game.view(entry.state, now(), stream.viewerId));
      stream.res.write(`id: ${entry.state.revision}\nevent: state\ndata: ${data}\n\n`);
    }
  }

  function tick() {
    for (const entry of sessions.values()) if (game.advance(entry.state, now())) publish(entry);
  }

  const send = (res, status, body, headers = {}) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
    res.end(JSON.stringify(body));
  };

  async function readJson(req) {
    if (!String(req.headers['content-type'] ?? '').startsWith('application/json')) return null;
    let raw = '';
    for await (const chunk of req) { raw += chunk; if (raw.length > 10_000) return null; }
    try { return JSON.parse(raw || '{}'); } catch { return null; }
  }

  async function handle(req, res) {
    const url = new URL(req.url, 'http://localhost');
    const parts = url.pathname.split('/').filter(Boolean);

    if (req.method === 'GET' && (url.pathname === '/' || parts[0] === 's')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end(await readFile(new URL('index.html', WEB)));
    }
    if (req.method === 'GET' && STATIC[url.pathname]) {
      const [file, type] = STATIC[url.pathname];
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
      return res.end(await readFile(new URL(file, WEB)));
    }
    if (parts[0] !== 'api' || parts[1] !== 'sessions') return send(res, 404, { code: 'not_found' });

    // POST /api/sessions — sessie maken
    if (parts.length === 2 && req.method === 'POST') {
      const body = await readJson(req);
      if (!body) return send(res, 415, { code: 'json_required' });
      if (adminKey && !safeEqual(req.headers['x-admin-key'], adminKey)) return send(res, 403, { code: 'forbidden', message: 'Beheersleutel vereist.' });
      const code = newCode();
      const demo = body.demo === true;
      const state = game.createSession({ code, content: { ...content, demo }, durations: demo ? content.demoDurations : content.durations });
      const entry = { state, adminToken: randomBytes(24).toString('base64url'), tokens: new Map(), streams: new Set() };
      sessions.set(code, entry);
      return send(res, 201, { code, adminToken: entry.adminToken });
    }

    const entry = sessions.get(parts[2]);
    if (!entry) return send(res, 404, { code: 'no_session', message: 'Sessie niet gevonden.' });
    const s = entry.state;
    game.advance(s, now()) && publish(entry);
    const cookieName = `kf_${s.code}`;
    const viewerId = entry.tokens.get(cookies(req)[cookieName]);
    const action = parts.slice(3).join('/');

    if (req.method === 'GET' && action === 'state') return send(res, 200, game.view(s, now(), viewerId));

    if (req.method === 'GET' && action === 'events') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
      const stream = { res, viewerId };
      entry.streams.add(stream);
      req.on('close', () => entry.streams.delete(stream));
      res.write(`id: ${s.revision}\nevent: state\ndata: ${JSON.stringify(game.view(s, now(), viewerId))}\n\n`);
      return;
    }

    if (req.method !== 'POST') return send(res, 404, { code: 'not_found' });
    const body = await readJson(req);
    if (!body) return send(res, 415, { code: 'json_required' });
    const finish = (result, headers) => {
      if (result.ok) publish(entry);
      send(res, result.ok ? 200 : result.status, { ...result, revision: s.revision }, headers);
    };

    if (action === 'join') {
      if (viewerId) return send(res, 200, { ok: true, revision: s.revision }); // al deelnemer
      const participantId = randomUUID();
      const result = game.join(s, { participantId, name: body.name, color: body.color });
      if (!result.ok) return finish(result);
      const token = randomBytes(24).toString('base64url');
      entry.tokens.set(token, participantId);
      return finish(result, { 'Set-Cookie': `${cookieName}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=14400` });
    }
    if (action === 'start') {
      if (!safeEqual(req.headers['x-admin-token'], entry.adminToken)) return send(res, 403, { code: 'forbidden', message: 'Alleen de beheerder start.' });
      return finish(game.start(s, now()));
    }
    const [kind, roundId, verb] = parts.slice(3);
    if (kind === 'rounds' && verb === 'answer')
      return finish(game.answer(s, { participantId: viewerId, roundId, actionId: body.actionId, answer: body.answer }, now()));
    if (kind === 'rounds' && verb === 'choice')
      return finish(game.choose(s, { participantId: viewerId, roundId, actionId: body.actionId, blockId: body.blockId }, now()));
    return send(res, 404, { code: 'not_found' });
  }

  const server = createServer((req, res) => handle(req, res).catch(err => {
    console.error(err);
    if (!res.headersSent) send(res, 500, { code: 'error' });
  }));
  const timer = tickMs ? setInterval(tick, tickMs) : null;
  // Houd SSE-verbindingen open achter proxies die stille verbindingen sluiten.
  const ping = setInterval(() => { for (const e of sessions.values()) for (const st of e.streams) st.res.write(': ping\n\n'); }, 15000);
  server.on('close', () => { clearInterval(timer); clearInterval(ping); });
  return { server, tick, sessions };
}
