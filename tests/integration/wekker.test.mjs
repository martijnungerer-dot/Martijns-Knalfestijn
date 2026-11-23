// De wekker van het Durable Object moet altijd op de eerstvolgende deadline staan;
// anders loopt een ronde zonder verzoeken van telefoons niet door.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as game from '../../packages/game/engine.mjs';
import { nextDeadline } from '../../apps/server/room.mjs';

const content = JSON.parse(readFileSync(new URL('../../content/examples/ronde.json', import.meta.url), 'utf8'));

test('wekker volgt puzzel, keuze, oefenblok en stopt na afloop', () => {
  const s = game.createSession({ code: 'TEST2345', content, durations: content.durations });
  assert.equal(nextDeadline(s), null, 'lobby heeft geen deadline');
  game.join(s, { participantId: 'a', name: 'Nina' });
  game.start(s, 0);
  assert.equal(nextDeadline(s), 60_000);
  game.answer(s, { participantId: 'a', roundId: 'r1', actionId: 'actie-0001', answer: [4, 6] }, 5_000);
  assert.equal(nextDeadline(s), 35_000, 'keuzedeadline komt eerst');
  game.advance(s, 35_000);
  assert.equal(nextDeadline(s), 60_000);
  game.advance(s, 60_000);
  assert.equal(nextDeadline(s), 90_000);
  game.advance(s, 90_000);
  assert.equal(nextDeadline(s), 210_000);
  game.advance(s, 210_000);
  assert.equal(nextDeadline(s), null);
});

test('keuzedeadline na het puzzeleinde: wekker gaat eerst op de keuze af', () => {
  const s = game.createSession({ code: 'TEST2345', content, durations: content.durations });
  game.join(s, { participantId: 'a', name: 'Nina' });
  game.start(s, 0);
  game.answer(s, { participantId: 'a', roundId: 'r1', actionId: 'actie-0001', answer: [4, 6] }, 50_000);
  game.advance(s, 60_000);
  assert.equal(s.phase, 'route');
  assert.equal(nextDeadline(s), 80_000);
});
