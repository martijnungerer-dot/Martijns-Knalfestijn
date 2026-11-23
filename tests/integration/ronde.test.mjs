// Drie deelnemers via echte HTTP-verzoeken tegen de server, met een nagemaakte klok.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../apps/server/app.mjs';

const content = JSON.parse(readFileSync(new URL('../../content/examples/ronde.json', import.meta.url), 'utf8'));
const RIGHT = [4, 6], WRONG = [8, 9];

async function setup(t) {
  let clock = 1_000_000, app, base;
  const store = new Map(); // blijft bestaan over een herstart heen, zoals Durable Object-opslag
  async function boot() {
    app = createApp({ content, now: () => clock, adminKey: '', tickMs: 0, store });
    await new Promise(r => app.server.listen(0, '127.0.0.1', r));
    base = `http://127.0.0.1:${app.server.address().port}`;
  }
  const stop = () => { app.server.closeAllConnections(); app.server.close(); };
  await boot();
  t.after(() => stop());

  async function call(method, path, body, headers = {}) {
    const res = await fetch(base + path, {
      method, headers: { 'Content-Type': 'application/json', ...headers }, body: body && JSON.stringify(body),
    });
    return { status: res.status, body: await res.json(), cookie: res.headers.get('set-cookie')?.split(';')[0] };
  }
  const created = await call('POST', '/api/sessions', {});
  const code = created.body.code;
  const admin = { 'X-Admin-Token': created.body.adminToken };

  async function player(name) {
    const r = await call('POST', `/api/sessions/${code}/join`, { name, color: 'blue' });
    assert.equal(r.status, 200, JSON.stringify(r.body));
    const h = { Cookie: r.cookie };
    return {
      cookie: r.cookie,
      state: () => call('GET', `/api/sessions/${code}/state`, undefined, h).then(x => x.body),
      answer: (answer, actionId = randomUUID()) => call('POST', `/api/sessions/${code}/rounds/r1/answer`, { actionId, answer }, h),
      choose: (blockId, actionId = randomUUID()) => call('POST', `/api/sessions/${code}/rounds/r1/choice`, { actionId, blockId }, h),
    };
  }
  const advance = async ms => { clock += ms; await app.tick(); };
  // Server weg, tijd verstrijkt, nieuwe server met dezelfde opslag. De nieuwe server tikt niet uit zichzelf.
  const restart = async downMs => { stop(); clock += downMs; await boot(); };
  return { get base() { return base; }, call, code, admin, player, advance, restart, start: () => call('POST', `/api/sessions/${code}/start`, {}, admin) };
}

test('volledige ronde: één goed, één fout, één herlaadt; iedereen ziet dezelfde winnaar, route en fase', async t => {
  const g = await setup(t);
  const [nina, sem, eva] = [await g.player('Nina'), await g.player('Sem'), await g.player('Eva')];
  assert.equal((await g.start()).status, 200);

  const view = await nina.state();
  assert.equal(view.phase, 'puzzle');
  assert.equal(view.round.puzzle.answer, undefined, 'antwoordsleutel blijft op de server');

  assert.equal((await sem.answer(WRONG)).body.correct, false);
  const win = await nina.answer(RIGHT);
  assert.deepEqual([win.body.correct, win.body.won], [true, true]);
  assert.equal((await nina.choose('swing')).status, 200);

  // Eva herlaadt: dezelfde cookie levert dezelfde identiteit en actuele toestand.
  const reloaded = await eva.state();
  assert.equal(reloaded.me.id, (await eva.state()).me.id);
  assert.equal(reloaded.round.chosenBlockId, 'swing');
  assert.equal(reloaded.players.find(p => p.id === reloaded.round.winnerId).name, 'Nina');

  await g.advance(60_000);
  for (const p of [nina, sem, eva]) assert.equal((await p.state()).phase, 'route');
  await g.advance(30_000);
  for (const p of [nina, sem, eva]) {
    const s = await p.state();
    assert.equal(s.phase, 'exercise');
    assert.equal(s.round.chosenBlockId, 'swing');
    assert.equal(s.walkOrder[0], s.round.winnerId);
  }
  await g.advance(120_000);
  const end = await sem.state();
  assert.equal(end.phase, 'completed');
  const ninaScore = end.players.find(p => p.name === 'Nina');
  assert.deepEqual([ninaScore.points, ninaScore.roundWins, ninaScore.coins], [1, 1, 15]);
  assert.equal(end.players.find(p => p.name === 'Sem').points, 0);
});

test('dubbele inzending: zelfde actie-id telt één keer, opnieuw oplossen geeft geen extra punt', async t => {
  const g = await setup(t);
  const nina = await g.player('Nina');
  await g.player('Sem');
  await g.start();
  const id = randomUUID();
  const first = await nina.answer(RIGHT, id);
  const again = await nina.answer(RIGHT, id);
  assert.deepEqual(again.body.won, first.body.won);
  assert.equal((await nina.answer(RIGHT)).body.code, 'already_solved');
  const me = (await nina.state()).players.find(p => p.name === 'Nina');
  assert.deepEqual([me.points, me.coins, me.roundWins], [1, 15, 1]);
});

test('twee goede antwoorden tegelijk: precies één winnaar, beide krijgen een punt', async t => {
  const g = await setup(t);
  const [nina, sem] = [await g.player('Nina'), await g.player('Sem')];
  await g.start();
  const results = await Promise.all([nina.answer(RIGHT), sem.answer(RIGHT)]);
  assert.equal(results.filter(r => r.body.won).length, 1);
  const s = await nina.state();
  assert.deepEqual(s.players.map(p => p.points), [1, 1]);
  assert.equal(s.players.reduce((n, p) => n + p.roundWins, 0), 1);
});

test('pogingen zijn beperkt tot drie', async t => {
  const g = await setup(t);
  const sem = await g.player('Sem');
  await g.start();
  for (let i = 0; i < 3; i++) assert.equal((await sem.answer(WRONG)).body.correct, false);
  assert.equal((await sem.answer(RIGHT)).body.code, 'no_attempts');
});

test('timeout zonder goed antwoord: systeem kiest en de ronde loopt zelf door', async t => {
  const g = await setup(t);
  const nina = await g.player('Nina');
  await g.start();
  await g.advance(60_000);
  let s = await nina.state();
  assert.equal(s.phase, 'route');
  assert.equal(s.round.winnerId, null);
  assert.deepEqual([s.round.chosenBlockId, s.round.chosenBy], ['row', 'system']);
  assert.equal((await nina.answer(RIGHT)).body.code, 'closed', 'te laat antwoorden telt niet');
  await g.advance(30_000 + 120_000);
  s = await nina.state();
  assert.equal(s.phase, 'completed');
});

test('winnaar kiest niet binnen 30 seconden: systeem kiest, winnaar blijft voorop, deadlines schuiven niet', async t => {
  const g = await setup(t);
  const [nina, sem] = [await g.player('Nina'), await g.player('Sem')];
  await g.start();
  await g.advance(10_000);
  await sem.answer(RIGHT);
  const before = (await nina.state()).round;
  await g.advance(30_000);
  const s = await nina.state();
  assert.equal(s.phase, 'puzzle', 'de rest heeft nog puzzeltijd');
  assert.deepEqual([s.round.chosenBlockId, s.round.chosenBy], ['row', 'system']);
  assert.equal((await sem.choose('swing')).body.code, 'already_chosen');
  assert.equal(s.walkOrder[0], s.round.winnerId);
  assert.deepEqual([s.round.puzzleEndsAt, s.round.exerciseStartsAt], [before.puzzleEndsAt, before.exerciseStartsAt]);
  assert.equal((await nina.answer(RIGHT)).body.correct, true, 'anderen kunnen nog punten halen');
});

test('onbevoegde blokkeuze: alleen de rondewinnaar mag kiezen', async t => {
  const g = await setup(t);
  const [nina, sem] = [await g.player('Nina'), await g.player('Sem')];
  await g.start();
  assert.equal((await sem.choose('swing')).status, 403, 'nog geen winnaar');
  await nina.answer(RIGHT);
  await sem.answer(RIGHT);
  const denied = await sem.choose('swing');
  assert.deepEqual([denied.status, denied.body.code], [403, 'not_winner']);
  const anonymous = await g.call('POST', `/api/sessions/${g.code}/rounds/r1/choice`, { actionId: randomUUID(), blockId: 'swing' });
  assert.equal(anonymous.status, 403);
  assert.equal((await nina.choose('bestaat-niet')).body.code, 'bad_block');
  assert.equal((await nina.state()).round.chosenBlockId, null);
});

test('starten vereist het beheertoken; naam overnemen of na de start meedoen kan niet', async t => {
  const g = await setup(t);
  const nina = await g.player('Nina');
  const sneaky = await g.call('POST', `/api/sessions/${g.code}/start`, {}, { 'X-Admin-Token': 'fout' });
  assert.equal(sneaky.status, 403);
  const dup = await g.call('POST', `/api/sessions/${g.code}/join`, { name: 'nina' });
  assert.equal(dup.body.code, 'name_taken');
  await g.start();
  assert.equal((await g.call('POST', `/api/sessions/${g.code}/join`, { name: 'Laat' })).body.code, 'started');
  assert.equal((await nina.state()).me.attemptsLeft, 3);
});

test('eventstream stuurt bij een wijziging de nieuwe toestand met revisie', async t => {
  const g = await setup(t);
  const nina = await g.player('Nina');
  assert.equal((await g.call('GET', `/api/sessions/${g.code}/state`)).body.me, undefined, 'zonder cookie geen identiteit');
  const controller = new AbortController();
  t.after(() => controller.abort());
  const stream = await fetch(`${g.base}/api/sessions/${g.code}/events`, { headers: { Cookie: nina.cookie }, signal: controller.signal });
  const reader = stream.body.getReader();
  const read = async () => new TextDecoder().decode((await reader.read()).value);
  assert.match(await read(), /"phase":"lobby"/);
  await g.start();
  const next = await read();
  assert.match(next, /^id: \d+\nevent: state\n/);
  assert.match(next, /"phase":"puzzle"/);
  assert.match(next, /"me":\{/);
});

test('serverherstart: zelfde deelnemers, score en deadlines; achterstallige fases worden ingehaald', async t => {
  const g = await setup(t);
  const [nina, sem] = [await g.player('Nina'), await g.player('Sem')];
  await g.start();
  await nina.answer(RIGHT);
  const before = (await nina.state()).round;

  await g.restart(5_000); // korte uitval tijdens de keuzetijd
  let s = await nina.state();
  assert.equal(s.me.id, s.round.winnerId, 'cookie geldt nog na herstart');
  assert.equal(s.players.find(p => p.name === 'Nina').points, 1);
  assert.deepEqual([s.round.puzzleEndsAt, s.round.exerciseEndsAt], [before.puzzleEndsAt, before.exerciseEndsAt]);
  assert.equal((await nina.answer(RIGHT)).body.code, 'already_solved');
  assert.equal((await nina.choose('swing')).status, 200);

  await g.restart(100_000); // lange uitval: puzzel en keuze zijn voorbij, oefenblok loopt al
  s = await sem.state();
  assert.equal(s.phase, 'exercise');
  assert.equal(s.round.chosenBlockId, 'swing');
  assert.equal(s.round.exerciseEndsAt, before.exerciseEndsAt, 'het einde schuift niet op');
  assert.equal((await sem.answer(RIGHT)).body.code, 'closed');
});

test('herstart tijdens open keuze zonder keuze: systeem kiest alsnog bij de juiste deadline', async t => {
  const g = await setup(t);
  const nina = await g.player('Nina');
  await g.start();
  await nina.answer(RIGHT);
  await g.restart(45_000); // winnaar viel weg; keuzetijd (30 s) is verlopen
  const s = await nina.state();
  assert.deepEqual([s.phase, s.round.chosenBlockId, s.round.chosenBy], ['puzzle', 'row', 'system']);
  assert.equal(s.walkOrder[0], s.round.winnerId);
});
