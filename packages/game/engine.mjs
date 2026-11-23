// Spelregels voor één gedeelde ronde. Geen browser, database of klok:
// tijd komt binnen als `now` (milliseconden), de toestand als gewoon object.
// De server is de enige eigenaar van de toestand en roept deze functies na elkaar aan.
// Gelijktijdigheidsregel: de volgorde waarin de server opdrachten verwerkt beslist.

export const MAX_ATTEMPTS = 3;
export const COLORS = ['red', 'blue', 'purple', 'green'];

export function createSession({ code, content, durations }) {
  return {
    code,
    contentVersion: content.version,
    content,
    durations, // { puzzle, choice, exercise } in ms
    revision: 1,
    phase: 'lobby',
    startedAt: null,
    participants: {},
    order: [],
    round: null,
    actions: {},
  };
}

const fail = (status, code, message) => ({ ok: false, status, code, message });

export function join(s, { participantId, name, color }) {
  if (s.phase !== 'lobby') return fail(409, 'started', 'De sessie is al begonnen.');
  const clean = String(name ?? '').trim().replace(/\s+/g, ' ');
  if (clean.length < 1 || clean.length > 20) return fail(400, 'bad_name', 'Kies een naam van 1 tot 20 tekens.');
  const taken = Object.values(s.participants).some(p => p.name.toLowerCase() === clean.toLowerCase());
  if (taken) return fail(409, 'name_taken', 'Deze naam is al in gebruik.');
  s.participants[participantId] = {
    id: participantId,
    name: clean,
    color: COLORS.includes(color) ? color : COLORS[s.order.length % COLORS.length],
    points: 0,
    roundWins: 0,
    coins: 0,
  };
  s.order.push(participantId);
  s.revision++;
  return { ok: true };
}

export function start(s, now) {
  if (s.phase !== 'lobby') return fail(409, 'started', 'De sessie is al begonnen.');
  if (s.order.length === 0) return fail(409, 'empty', 'Er doet nog niemand mee.');
  const { puzzle, choice, exercise } = s.durations;
  const exerciseStartsAt = now + puzzle + choice; // vast tijdvak, nooit verlengd
  s.startedAt = now;
  s.phase = 'puzzle';
  s.round = {
    id: 'r1',
    puzzleEndsAt: now + puzzle,
    exerciseStartsAt,
    exerciseEndsAt: exerciseStartsAt + exercise,
    winnerId: null,
    wonAt: null,
    choiceEndsAt: null,
    chosenBlockId: null,
    chosenBy: null,
    solved: {},
    attempts: {},
  };
  s.revision++;
  return { ok: true };
}

function systemChoice(s) {
  // Vaste, uitlegbare regel: het systeem neemt de eerste geldige optie.
  s.round.chosenBlockId = s.content.blocks[0].id;
  s.round.chosenBy = 'system';
}

// Verwerkt alle verstreken deadlines. Geeft true terug als er iets veranderde.
export function advance(s, now) {
  const r = s.round;
  if (!r) return false;
  const before = s.revision;
  if (r.winnerId && !r.chosenBlockId && now >= r.choiceEndsAt) { systemChoice(s); s.revision++; }
  if (s.phase === 'puzzle' && now >= r.puzzleEndsAt) {
    s.phase = 'route';
    if (!r.winnerId && !r.chosenBlockId) systemChoice(s);
    s.revision++;
  }
  if (s.phase === 'route' && now >= r.exerciseStartsAt) {
    if (!r.chosenBlockId) systemChoice(s);
    s.phase = 'exercise';
    s.revision++;
  }
  if (s.phase === 'exercise' && now >= r.exerciseEndsAt) { s.phase = 'completed'; s.revision++; }
  return s.revision !== before;
}

// Dezelfde actie-id van dezelfde deelnemer levert dezelfde uitkomst, zonder tweede verwerking.
function once(s, participantId, actionId, fn) {
  if (typeof actionId !== 'string' || actionId.length < 8 || actionId.length > 64)
    return fail(400, 'bad_action', 'Ontbrekende actie-id.');
  const key = `${participantId}:${actionId}`;
  if (s.actions[key]) return s.actions[key];
  const result = fn();
  s.actions[key] = result;
  return result;
}

function sameAnswer(given, expected) {
  if (!Array.isArray(given) || given.length !== expected.length) return false;
  const a = given.map(Number).sort((x, y) => x - y);
  const b = [...expected].sort((x, y) => x - y);
  return a.every((v, i) => v === b[i]);
}

export function answer(s, { participantId, roundId, actionId, answer: given }, now) {
  const p = s.participants[participantId];
  if (!p) return fail(403, 'not_joined', 'Je doet niet mee aan deze sessie.');
  return once(s, participantId, actionId, () => {
    const r = s.round;
    if (!r || r.id !== roundId) return fail(409, 'wrong_round', 'Deze ronde is niet actief.');
    if (s.phase !== 'puzzle' || now >= r.puzzleEndsAt) return fail(409, 'closed', 'De puzzeltijd is voorbij.');
    if (r.solved[participantId]) return fail(409, 'already_solved', 'Je hebt deze puzzel al opgelost.');
    const used = r.attempts[participantId] ?? 0;
    if (used >= MAX_ATTEMPTS) return fail(409, 'no_attempts', 'Je pogingen zijn op.');
    r.attempts[participantId] = used + 1;
    s.revision++;
    if (!sameAnswer(given, s.content.puzzle.answer))
      return { ok: true, correct: false, attemptsLeft: MAX_ATTEMPTS - used - 1 };
    r.solved[participantId] = true;
    p.points += 1;
    p.coins += 10;
    const won = !r.winnerId;
    if (won) {
      r.winnerId = participantId;
      r.wonAt = now;
      r.choiceEndsAt = now + s.durations.choice;
      p.roundWins += 1;
      p.coins += 5;
    }
    return { ok: true, correct: true, won };
  });
}

export function choose(s, { participantId, roundId, actionId, blockId }, now) {
  if (!s.participants[participantId]) return fail(403, 'not_joined', 'Je doet niet mee aan deze sessie.');
  return once(s, participantId, actionId, () => {
    const r = s.round;
    if (!r || r.id !== roundId) return fail(409, 'wrong_round', 'Deze ronde is niet actief.');
    if (r.winnerId !== participantId) return fail(403, 'not_winner', 'Alleen de rondewinnaar kiest.');
    if (r.chosenBlockId) return fail(409, 'already_chosen', 'Het blok is al gekozen.');
    if (now >= r.choiceEndsAt) return fail(409, 'closed', 'De keuzetijd is voorbij.');
    if (!s.content.blocks.some(b => b.id === blockId)) return fail(400, 'bad_block', 'Onbekend blok.');
    r.chosenBlockId = blockId;
    r.chosenBy = 'winner';
    s.revision++;
    return { ok: true };
  });
}

// Wat een deelnemer mag zien: geen antwoordsleutel, wel de eigen voortgang.
export function view(s, now, viewerId) {
  const r = s.round;
  const players = s.order.map(id => s.participants[id]);
  const ranking = [...players].sort((a, b) => b.points - a.points || b.roundWins - a.roundWins);
  const walkOrder = r?.winnerId
    ? [s.participants[r.winnerId], ...ranking.filter(p => p.id !== r.winnerId)]
    : ranking;
  const me = s.participants[viewerId];
  const { answer: _secret, ...puzzle } = s.content.puzzle;
  return {
    code: s.code,
    revision: s.revision,
    serverNow: now,
    phase: s.phase,
    durations: s.durations,
    demo: !!s.content.demo,
    players: ranking.map(({ id, name, color, points, roundWins, coins }) => ({ id, name, color, points, roundWins, coins })),
    walkOrder: walkOrder.map(p => p.id),
    round: r && {
      id: r.id,
      puzzle,
      blocks: s.content.blocks,
      puzzleEndsAt: r.puzzleEndsAt,
      exerciseStartsAt: r.exerciseStartsAt,
      exerciseEndsAt: r.exerciseEndsAt,
      winnerId: r.winnerId,
      choiceEndsAt: r.choiceEndsAt,
      chosenBlockId: r.chosenBlockId,
      chosenBy: r.chosenBy,
    },
    me: me && {
      id: me.id,
      solved: !!r?.solved[me.id],
      attemptsLeft: MAX_ATTEMPTS - (r?.attempts[me.id] ?? 0),
    },
  };
}
