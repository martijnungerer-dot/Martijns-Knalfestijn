// Telefoonweergave. De server beslist; deze pagina toont de toestand en stuurt handelingen in.
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const code = location.pathname.match(/^\/s\/([A-Z0-9]+)/)?.[1];
const adminKey = code && `kf_admin_${code}`;
let state = null, offset = 0, selected = [], note = '', infoOpen = false, events = null;

const serverNow = () => Date.now() + offset;
const secondsLeft = t => Math.max(0, Math.ceil((t - serverNow()) / 1000));
const fmt = s => s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : String(s);
const nameOf = id => state.players.find(p => p.id === id)?.name ?? '';
const blockOf = id => state.round?.blocks.find(b => b.id === id);
function storage(fn) { try { return fn(localStorage); } catch { return null; } }

// Bij netwerkverlies hetzelfde verzoek (met dezelfde actie-id) opnieuw sturen; de server verwerkt het maar één keer.
async function post(path, body, headers = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(`/api/sessions${path}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
      });
      return await res.json();
    } catch {
      if (attempt === 3) return { ok: false, message: 'Geen verbinding. Probeer het opnieuw.' };
      $('[data-conn]').hidden = false;
      await new Promise(r => setTimeout(r, 700 * (attempt + 1)));
    }
  }
}

function connect() {
  events?.close();
  events = new EventSource(`/api/sessions/${code}/events`);
  events.addEventListener('state', e => receive(JSON.parse(e.data)));
  events.onopen = () => { $('[data-conn]').hidden = true; };
  events.onerror = () => { $('[data-conn]').hidden = false; }; // EventSource maakt zelf opnieuw verbinding
}

function receive(next) {
  if (state && next.revision < state.revision) return; // oud bericht, negeren
  offset = next.serverNow - Date.now();
  if (state?.round?.id !== next.round?.id) selected = [];
  state = next;
  render();
}

function show(view, overlay) {
  $$('[data-view]').forEach(el => { el.hidden = el.dataset.view !== view; });
  $$('[data-overlay]').forEach(el => { el.hidden = el.dataset.overlay !== (infoOpen ? 'info' : overlay); });
}

function currentOverlay() {
  const { phase, round: r, me } = state;
  if (phase === 'exercise') return 'exercise';
  if (!me) return null;
  if (r?.winnerId === me.id && !r.chosenBlockId && serverNow() < r.choiceEndsAt) return 'choice';
  if (phase === 'puzzle' && !me.solved && me.attemptsLeft > 0) return 'puzzle';
  return null;
}

function timerTarget(overlay) {
  const r = state.round;
  if (overlay === 'puzzle') return r.puzzleEndsAt;
  if (overlay === 'choice') return r.choiceEndsAt;
  if (overlay === 'exercise') return r.exerciseEndsAt;
  if (state.phase === 'route') return r.exerciseStartsAt;
  if (state.phase === 'puzzle') return r.puzzleEndsAt;
  return null;
}

function statusText() {
  const { phase, round: r, me, players } = state;
  if (phase === 'lobby') return `${players.length} ${players.length === 1 ? 'speler' : 'spelers'} klaar. Wachten op start.`;
  if (phase === 'completed') return `Klaar! ${players[0] ? `${players[0].name} staat bovenaan.` : ''}`;
  if (!me) return 'De sessie is al begonnen.';
  if (r.chosenBlockId) return `Op weg naar ${blockOf(r.chosenBlockId).name}`;
  if (r.winnerId) return `${nameOf(r.winnerId)} kiest`;
  if (me.solved) return 'Goed! Even wachten op de rest.';
  if (phase === 'puzzle') return 'Geen pogingen meer.';
  return '';
}

function render() {
  if (!state) return;
  if (!state.me && state.phase === 'lobby') return show('join', null);
  const overlay = currentOverlay();
  show('game', overlay);
  const r = state.round;

  $('[data-ranking]').innerHTML = '';
  for (const p of state.players) {
    const li = document.createElement('li');
    li.innerHTML = `<span class="dot ${p.color}"></span><span></span><b>${p.points}</b>`;
    li.children[1].textContent = p.name + (p.id === state.me?.id ? ' (jij)' : '');
    $('[data-ranking]').append(li);
  }
  const group = $('[data-group]');
  group.innerHTML = '';
  for (const id of state.walkOrder) {
    const p = state.players.find(x => x.id === id);
    const span = document.createElement('span');
    span.className = `dot ${p.color}`;
    span.title = p.name;
    group.append(span);
  }
  const blocks = r?.blocks ?? [];
  $$('[data-block]').forEach((el, i) => {
    const b = blocks[i];
    el.textContent = b ? b.name : '?';
    el.classList.toggle('chosen', !!b && r.chosenBlockId === b.id);
  });
  group.dataset.at = state.phase === 'exercise' ? 'block' : state.phase === 'completed' ? 'end' : 'start';

  $('[data-status]').textContent = statusText();
  const adminToken = storage(s => s.getItem(adminKey));
  $('[data-admin]').hidden = !(adminToken && state.phase === 'lobby');
  $('[data-code]').textContent = state.code;
  $('[data-link]').textContent = location.origin + location.pathname;

  if (overlay === 'puzzle') renderPuzzle(r.puzzle);
  if (overlay === 'choice') renderChoice(r.blocks);
  if (overlay === 'exercise') {
    const b = blockOf(r.chosenBlockId);
    $('[data-ex-name]').textContent = b.name;
    $('[data-ex-work]').textContent = b.work;
  }
  tick();
}

function renderPuzzle(puzzle) {
  $('[data-puzzle-prompt]').textContent = puzzle.prompt;
  const box = $('[data-numbers]');
  box.innerHTML = '';
  for (const n of puzzle.options) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = n;
    b.setAttribute('aria-pressed', String(selected.includes(n)));
    b.onclick = () => {
      selected = selected.includes(n) ? selected.filter(x => x !== n) : [...selected, n].slice(-puzzle.pick);
      renderPuzzle(puzzle);
    };
    box.append(b);
  }
  $('[data-submit]').disabled = selected.length !== puzzle.pick;
  $('[data-puzzle-note]').textContent = note || `${state.me.attemptsLeft} pogingen${state.demo ? ' · demotijden' : ''}`;
}

function renderChoice(blocks) {
  const box = $('[data-choices]');
  box.innerHTML = '';
  for (const b of blocks) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice';
    btn.innerHTML = '<b></b><span></span>';
    btn.children[0].textContent = b.name;
    btn.children[1].textContent = b.work;
    btn.onclick = async () => {
      btn.disabled = true;
      await post(`/${code}/rounds/${state.round.id}/choice`, { actionId: crypto.randomUUID(), blockId: b.id });
    };
    box.append(btn);
  }
}

function tick() {
  if (!state?.round) return;
  const overlay = currentOverlay();
  const target = timerTarget(overlay);
  $$('[data-timer]').forEach(el => { el.textContent = target ? fmt(secondsLeft(target)) : ''; });
  // De keuzedeadline verloopt lokaal; dan valt het keuzescherm weg tot de server bevestigt.
  const visible = $$('[data-overlay]').find(el => !el.hidden)?.dataset.overlay ?? null;
  if (overlay !== visible && !infoOpen) render();
}

$('[data-submit]').onclick = async () => {
  const answer = selected;
  $('[data-submit]').disabled = true;
  const result = await post(`/${code}/rounds/${state.round.id}/answer`, { actionId: crypto.randomUUID(), answer });
  selected = [];
  note = result.ok && !result.correct ? `Niet goed. Nog ${result.attemptsLeft} ${result.attemptsLeft === 1 ? 'poging' : 'pogingen'}.` : result.ok ? '' : result.message;
  render();
};

$('[data-join-form]').onsubmit = async e => {
  e.preventDefault();
  const form = new FormData(e.target);
  const result = await post(`/${code}/join`, { name: form.get('name'), color: form.get('color') });
  $('[data-join-error]').textContent = result.ok ? '' : result.message;
  if (result.ok) connect(); // opnieuw verbinden zodat de stroom de eigen deelname kent
};

$('[data-start]').onclick = async () => {
  const result = await post(`/${code}/start`, {}, { 'X-Admin-Token': storage(s => s.getItem(adminKey)) ?? '' });
  if (!result.ok) $('[data-status]').textContent = result.message;
};

$('[data-create]').onclick = async () => {
  const key = $('[data-admin-key]').value;
  const result = await post('', { demo: $('[data-demo]').checked }, key ? { 'X-Admin-Key': key } : {});
  if (result.code === 'forbidden') $('[data-key-label]').hidden = false; // server vraagt een beheersleutel
  if (!result.adminToken) return void ($('[data-create-error]').textContent = result.message ?? 'Sessie maken mislukt.');
  storage(s => s.setItem(`kf_admin_${result.code}`, result.adminToken));
  location.href = `/s/${result.code}`;
};

$('[data-open-info]').onclick = () => { infoOpen = true; state ? render() : show('home', null); };
$('[data-close-info]').onclick = () => { infoOpen = false; state ? render() : show('home', null); };

if (code) { connect(); setInterval(tick, 250); }
else show('home', null);
