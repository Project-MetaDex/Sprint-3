/* ─── STATE ─── */
const state = {
  allPokemon: [],
  rankingData: [],
  currentPoke: null,
};

/* ════════════════════════════════
   MOCK DATA
════════════════════════════════ */
const RANKING = [
  { name:'amoonguss',      id:591,  usage:62.4 },
  { name:'garchomp',       id:445,  usage:58.1 },
  { name:'thundurus',      id:642,  usage:51.3 },
  { name:'incineroar',     id:727,  usage:49.7 },
  { name:'flutter-mane',   id:1000, usage:45.2 },
  { name:'urshifu',        id:892,  usage:41.5 },
  { name:'rillaboom',      id:812,  usage:38.7 },
  { name:'landorus',       id:645,  usage:36.2 },
];

const TEAMS = [
  { player:'Ash Ketchum',  score:2840, wl:'34-6',  pokemon:[591,445,727,642,892,645] },
  { player:'Misty Rivers',  score:2710, wl:'31-9',  pokemon:[591,642,1000,727,812,445] },
  { player:'Brock Stone',   score:2560, wl:'28-12', pokemon:[445,727,642,892,376,242]  },
  { player:'Gary Oak',      score:2490, wl:'26-13', pokemon:[591,892,445,727,645,812] },
  { player:'Serena Blanc',  score:2350, wl:'24-15', pokemon:[282,448,334,350,591,727] },
];

const PLAYERS = [
  { name:'Ash Ketchum',  score:2840, wl:'34W · 6L'  },
  { name:'Misty Rivers',  score:2710, wl:'31W · 9L'  },
  { name:'Brock Stone',   score:2560, wl:'28W · 12L' },
  { name:'Gary Oak',      score:2490, wl:'26W · 13L' },
  { name:'Serena Blanc',  score:2350, wl:'24W · 15L' },
];

const ITEMS_GLOBAL = [
  { name:'Sitrus Berry', img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sitrus-berry.png', pct:52 },
  { name:'Rocky Helmet', img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rocky-helmet.png', pct:38 },
  { name:'Choice Scarf', img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-scarf.png', pct:31 },
  { name:'Life Orb',     img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/life-orb.png',     pct:24 },
  { name:'Assault Vest', img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/assault-vest.png', pct:18 },
];

const MOCK_MOVES = [
  { name:'Spore',        icon:'icon-grama',     pct:91 },
  { name:'Rage Powder',  icon:'icon-bug',        pct:78 },
  { name:'Pollen Puff',  icon:'icon-grama',     pct:65 },
  { name:'Protect',      icon:'icon-engrenagem', pct:54 },
];

const ITEMS_PER_POKE = {
  'amoonguss': [
    { name:'Rocky Helmet',  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rocky-helmet.png', pct:68 },
    { name:'Black Sludge',  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/black-sludge.png', pct:22 },
    { name:'Sitrus Berry',  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sitrus-berry.png', pct:10 },
  ],
  'garchomp': [
    { name:'Choice Scarf',  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-scarf.png', pct:55 },
    { name:'Rocky Helmet',  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rocky-helmet.png', pct:28 },
    { name:'Life Orb',      img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/life-orb.png',     pct:17 },
  ],
  'incineroar': [
    { name:'Assault Vest',  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/assault-vest.png', pct:72 },
    { name:'Lum Berry',     img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lum-berry.png',    pct:18 },
    { name:'Sitrus Berry',  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sitrus-berry.png', pct:10 },
  ],
  'flutter-mane': [
    { name:'Choice Specs',  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-specs.png', pct:50 },
    { name:'Booster Energy',img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/booster-energy.png', pct:35 },
    { name:'Focus Sash',    img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/focus-sash.png',   pct:15 },
  ],
};

const ITEMS_PER_POKE_DEFAULT = [
  { name:'Sitrus Berry',  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sitrus-berry.png', pct:44 },
  { name:'Choice Scarf',  img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-scarf.png', pct:30 },
  { name:'Life Orb',      img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/life-orb.png',     pct:26 },
];

const PARTNERS_PER_POKE = {
  'amoonguss': [
    { id:445, name:'garchomp',    pct:'44%' },
    { id:642, name:'thundurus',   pct:'38%' },
    { id:727, name:'incineroar',  pct:'31%' },
    { id:892, name:'urshifu',     pct:'25%' },
    { id:645, name:'landorus',    pct:'19%' },
    { id:812, name:'rillaboom',   pct:'14%' },
  ],
  'garchomp': [
    { id:591, name:'amoonguss',   pct:'48%' },
    { id:727, name:'incineroar',  pct:'36%' },
    { id:642, name:'thundurus',   pct:'28%' },
    { id:892, name:'urshifu',     pct:'22%' },
    { id:1000,name:'flutter-mane',pct:'16%' },
    { id:645, name:'landorus',    pct:'11%' },
  ],
  'incineroar': [
    { id:591, name:'amoonguss',   pct:'52%' },
    { id:445, name:'garchomp',    pct:'40%' },
    { id:1000,name:'flutter-mane',pct:'29%' },
    { id:812, name:'rillaboom',   pct:'21%' },
    { id:642, name:'thundurus',   pct:'17%' },
    { id:892, name:'urshifu',     pct:'12%' },
  ],
};

const PARTNERS_DEFAULT = [
  { id:591, name:'amoonguss',   pct:'40%' },
  { id:445, name:'garchomp',    pct:'34%' },
  { id:727, name:'incineroar',  pct:'27%' },
  { id:892, name:'urshifu',     pct:'20%' },
  { id:642, name:'thundurus',   pct:'15%' },
  { id:812, name:'rillaboom',   pct:'10%' },
];

const STARTER_CARDS = [
  { id:591,  name:'amoonguss'   },
  { id:445,  name:'garchomp'    },
  { id:727,  name:'incineroar'  },
  { id:642,  name:'thundurus'   },
];

/* ════════════════════════════════
   UTILS
════════════════════════════════ */
const artwork  = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const sprite   = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
const cap      = s  => s.split(/[-\s]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

function handleImgError(imgEl, id, placeholderId) {
  if (!imgEl._triedSprite) {
    imgEl._triedSprite = true;
    imgEl.src = sprite(id);
  } else {
    imgEl.style.display = 'none';
    if (placeholderId) {
      const ph = document.getElementById(placeholderId);
      if (ph) ph.style.display = 'flex';
    }
  }
}

function handleSpriteError(el) {
  el.style.opacity = '0.18';
  el.onerror = null;
}

const MAX_POKE_ID = 1025;
function isValidId(id) { return id > 0 && id <= MAX_POKE_ID; }

/* ════════════════════════════════
   API
════════════════════════════════ */
const apiCache = {};

async function fetchAllPokemons() {
  const r = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1010');
  const d = await r.json();
  return d.results.map((p, i) => ({ name: p.name, id: i + 1 }));
}

async function fetchPokemonByName(name) {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  if (apiCache[slug]) return apiCache[slug];
  const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`);
  if (!r.ok) throw new Error(`Not found: ${slug}`);
  const data = await r.json();
  apiCache[slug] = data;
  return data;
}

/* ════════════════════════════════
   SPA NAVIGATION
════════════════════════════════ */
function showRanking() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-ranking').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showDetail() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-detail').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ════════════════════════════════
   RANKING RENDERS
════════════════════════════════ */
async function initRanking() {
  const results = await Promise.allSettled(
    RANKING.map(p => fetchPokemonByName(p.name).then(d => ({
      ...p,
      apiId:    d.id,
      types:    d.types.map(t => t.type.name),
      stats:    d.stats,
      moves:    d.moves,
      abilities:d.abilities,
      _data:    d,
    })))
  );

  state.rankingData = results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : { ...RANKING[i], types: [], apiId: RANKING[i].id }
  );

  renderUsageList();
  renderTeamList();
  renderItemList();
  renderPlayersList();
}

function renderUsageList() {
  const el = document.getElementById('usage-list');
  if (!el) return;
  el.innerHTML = state.rankingData.map(p => {
    const id = p.apiId || p.id;
    const badges = (p.types || []).map(t =>
      `<span class="type-badge t-${t}" style="font-size:9.5px;padding:1px 7px">${cap(t)}</span>`
    ).join('');
    return `
      <div class="usage-row" onclick="openDetail('${p.name}')">
        <img class="usage-img" src="${artwork(id)}" alt="${p.name}"
             onerror="if(!this._tried){this._tried=true;this.src='${sprite(id)}'}else{this.style.opacity='0.2'}">
        <div class="usage-info">
          <div class="usage-name">${cap(p.name)} ${badges}</div>
          <div class="bar-background">
            <div class="bar-fill bar-purple" style="width:${p.usage}%"></div>
          </div>
        </div>
        <div class="usage-pct">${p.usage}%</div>
      </div>`;
  }).join('');
}

function renderTeamList() {
  const el = document.getElementById('team-list');
  if (!el) return;
  el.innerHTML = TEAMS.map((t, i) => {
    const cls = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    const spritesHtml = t.pokemon.filter(pid => isValidId(pid)).map(pid => {
        const found = state.allPokemon.find(p => p.id === pid) || state.rankingData.find(p => (p.apiId || p.id) === pid);
        const nameAttr = found ? `data-pokename="${found.name}"` : '';
        return `<img src="${sprite(pid)}" alt="pokemon" title="${found ? cap(found.name) : '#' + pid}" ${nameAttr} onclick="handleTeamSpriteClick(this, ${pid})" onerror="handleSpriteError(this)">`;
      }).join('');

    return `
      <div class="team-row">
        <div class="team-rank ${cls}">${i + 1}</div>
        <div class="team-player">${t.player}</div>
        <div class="team-score">${t.score.toLocaleString('pt-BR')} pts</div>
        <div class="team-wl">${t.wl}</div>
        <div class="team-sprites">${spritesHtml}</div>
      </div>`;
  }).join('');
}

async function handleTeamSpriteClick(imgEl, pokemonId) {
  const cached = imgEl.dataset.pokename;
  if (cached) { openDetail(cached); return; }

  const fromAll = state.allPokemon.find(p => p.id === pokemonId);
  if (fromAll) { openDetail(fromAll.name); return; }

  try {
    const data = await fetchPokemonByName(String(pokemonId));
    imgEl.dataset.pokename = data.name;
    openDetail(data.name);
  } catch {
    alert('Pokémon não encontrado. ID: ' + pokemonId);
  }
}

function renderItemList() {
  const el = document.getElementById('item-list');
  if (!el) return;
  el.innerHTML = ITEMS_GLOBAL.map(it => `
    <div class="item-row">
      <img class="item-img" src="${it.img}" alt="${it.name}" onerror="this.style.opacity='0.2'">
      <div class="item-name">${it.name}</div>
      <div style="flex:1">
        <div class="bar-background">
          <div class="bar-fill bar-purple" style="width:${it.pct}%"></div>
        </div>
      </div>
      <div class="usage-pct">${it.pct}%</div>
    </div>`).join('');
}

function renderPlayersList() {
  const el = document.getElementById('players-list');
  if (!el) return;
  el.innerHTML = PLAYERS.map(p => `
    <div class="player-row">
      <div class="player-avatar">${p.name.charAt(0)}</div>
      <div class="player-name">${p.name}</div>
      <div>
        <div class="player-score">${p.score.toLocaleString('pt-BR')} pts</div>
        <div class="player-wl">${p.wl}</div>
      </div>
    </div>`).join('');
}

/* ════════════════════════════════
   DETAIL PAGE
════════════════════════════════ */
async function openDetail(name) {
  showDetail();

  const heading = document.getElementById('detail-heading');
  if (heading) heading.textContent = cap(name);

  document.getElementById('detail-name').textContent = cap(name);
  document.getElementById('detail-types').innerHTML = '<div class="sk" style="width:110px;height:22px;border-radius:10px"></div>';
  document.getElementById('detail-stats').innerHTML = '<div class="sk" style="height:130px;border-radius:8px"></div>';
  document.getElementById('detail-moves').innerHTML = [0,1,2,3].map(() => '<div class="sk" style="height:52px;border-radius:14px"></div>').join('');
  document.getElementById('partners-grid').innerHTML = '<div class="detail-loading" style="grid-column:1/-1">Carregando parceiros…</div>';

  const img = document.getElementById('detail-img');
  const ph  = document.getElementById('detail-img-placeholder');
  img.style.display = 'none';
  img.src = '';
  img._triedSprite = false;
  if (ph) ph.style.display = 'flex';

  let cached = state.rankingData.find(r => r.name === name);

  try {
    const data = (cached && cached._data) ? cached._data : await fetchPokemonByName(name);

    if (!cached) {
      cached = { name, id: data.id, apiId: data.id, types: data.types.map(t => t.type.name), _data: data, usage: 0 };
      state.rankingData.push(cached);
    } else if (!cached._data) {
      cached._data = data;
    }

    state.currentPoke = cached;
    renderPokemonDetail(cached, data);
  } catch (e) {
    document.getElementById('detail-name').textContent = cap(name) + ' (erro ao carregar)';
    document.getElementById('detail-stats').innerHTML = '<div style="color:#D84B36;font-size:12px;padding:8px">Não foi possível carregar os dados deste Pokémon.</div>';
  }
}

function renderPokemonDetail(poke, data) {
  const id = data.id;

  const img = document.getElementById('detail-img');
  const ph  = document.getElementById('detail-img-placeholder');
  img._triedSprite = false;
  img.src = artwork(id);
  img.alt = poke.name;
  img.style.display = 'block';
  if (ph) ph.style.display = 'none';
  img.onerror = () => handleImgError(img, id, 'detail-img-placeholder');

  document.getElementById('detail-name').textContent = cap(poke.name);

  const types = Array.isArray(data.types) ? data.types.map(t => t.type.name) : [];
  document.getElementById('detail-types').innerHTML = types.length ? types.map(t => `<span class="type-badge t-${t}">${cap(t)}</span>`).join('') : '<span style="font-size:12px;color:#888">—</span>';

  renderStats(data.stats);
  renderMoves(data.moves || []);
  renderPokeCards();
  renderPartners(poke.name);
  renderItemsForPoke(poke.name);
  renderAtaquesTab(data.moves || []);
}

function renderStats(stats) {
  const defs = [
    { key:'hp',             label:'HP',      cls:'bar-hp'    },
    { key:'attack',         label:'Attack',  cls:'bar-atk'   },
    { key:'special-attack', label:'Sp. Atk', cls:'bar-spatk' },
    { key:'defense',        label:'Defense', cls:'bar-def'   },
    { key:'special-defense',label:'Sp. Def', cls:'bar-spdef' },
    { key:'speed',          label:'Speed',   cls:'bar-spd'   },
  ];

  if (!Array.isArray(stats) || !stats.length) {
    document.getElementById('detail-stats').innerHTML = '<div style="color:#aaa;font-size:12px">Stats indisponíveis</div>';
    return;
  }

  const map = {};
  stats.forEach(s => { if (s && s.stat && s.stat.name) map[s.stat.name] = s.base_stat || 0; });

  document.getElementById('detail-stats').innerHTML = defs.map(d => {
    const v = map[d.key] || 0;
    const p = Math.min(100, Math.round(v / 255 * 100));
    return `
      <div class="status-row">
        <span class="status-label">${d.label}</span>
        <span class="status-number">${v}</span>
        <div class="bar-background">
          <div class="bar-fill ${d.cls}" style="width:${p}%"></div>
        </div>
      </div>`;
  }).join('');
}

function renderMoves(apiMoves) {
  const safeApiMoves = Array.isArray(apiMoves) ? apiMoves : [];
  const moves = MOCK_MOVES.map((m, i) => ({
    name: safeApiMoves[i] ? cap(safeApiMoves[i].move.name) : m.name,
    icon: m.icon,
    pct:  m.pct,
  }));

  document.getElementById('detail-moves').innerHTML = moves.map(m => `
    <div class="button-ataque-selecionado">
      <div class="ataque">
        <div class="icon-container ${m.icon}">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        ${m.name}
        <span class="move-pct-badge">${m.pct}%</span>
      </div>
    </div>`).join('');
}

function renderPokeCards() {
  const grid = document.getElementById('poke-cards-grid');
  if (!grid) return;
  const cards = state.allPokemon.length ? state.allPokemon.slice(0, 8) : STARTER_CARDS;
  grid.innerHTML = cards.map(c => {
    const id = c.id;
    return `
      <div class="card-pokemon" onclick="openDetail('${c.name}')">
        <img src="${artwork(id)}" alt="${c.name}" onerror="if(!this._t){this._t=true;this.src='${sprite(id)}'}else{this.style.opacity='0.2'}">
        <span>${cap(c.name)}</span>
      </div>`;
  }).join('');
}

function renderPartners(currentName) {
  const grid = document.getElementById('partners-grid');
  if (!grid) return;

  const list = (PARTNERS_PER_POKE[currentName] || PARTNERS_DEFAULT).filter(p => p.name !== currentName).slice(0, 6);

  if (!list.length) {
    grid.innerHTML = '<div style="padding:20px;text-align:center;color:#888;font-size:12px">Sem dados de parceiros</div>';
    return;
  }

  grid.innerHTML = list.map(p => {
    const id = isValidId(p.id) ? p.id : 1;
    return `
      <div class="partner-card" onclick="openDetail('${p.name}')">
        <img src="${sprite(id)}" alt="${p.name}" onerror="handleSpriteError(this)">
        <div class="partner-name-text">${cap(p.name)}</div>
        <div class="partner-pct">${p.pct}</div>
      </div>`;
  }).join('');
}

function renderItemsForPoke(pokeName) {
  const el = document.getElementById('items-detail-list');
  if (!el) return;
  const items = ITEMS_PER_POKE[pokeName] || ITEMS_PER_POKE_DEFAULT;
  el.innerHTML = items.map(it => `
    <div class="item-row">
      <img class="item-img" src="${it.img}" alt="${it.name}" onerror="this.style.opacity='0.2'">
      <div class="item-name">${it.name}</div>
      <div style="flex:1">
        <div class="bar-background">
          <div class="bar-fill bar-purple" style="width:${it.pct}%"></div>
        </div>
      </div>
      <div class="usage-pct">${it.pct}%</div>
    </div>`).join('');
}

function renderAtaquesTab(apiMoves) {
  const safeApiMoves = Array.isArray(apiMoves) ? apiMoves : [];
  const moves = MOCK_MOVES.map((m, i) => ({
    name: safeApiMoves[i] ? cap(safeApiMoves[i].move.name) : m.name,
    icon: m.icon, pct: m.pct,
  }));
  document.getElementById('ataques-detail-list').innerHTML = moves.map(m => `
    <div class="button-ataque-selecionado">
      <div class="ataque">
        <div class="icon-container ${m.icon}">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        ${m.name}
        <span class="move-pct-badge">${m.pct}%</span>
      </div>
    </div>`).join('');
}

/* ════════════════════════════════
   TABS
════════════════════════════════ */
function switchTab(btn, panelId) {
  const tabsWrap = btn.closest('.tabs-wrap');
  tabsWrap.querySelectorAll('.button-troca button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  tabsWrap.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const panel = tabsWrap.querySelector('#' + panelId);
  if (panel) panel.classList.add('active');
}

/* ════════════════════════════════
   SEARCH
════════════════════════════════ */
let searchTimer = null;

function initSearch() {
  const input    = document.getElementById('global-search');
  const dropdown = document.getElementById('search-dropdown');

  input.addEventListener('input', () => {
    clearTimeout(searchTimer);
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { dropdown.classList.remove('open'); return; }
    searchTimer = setTimeout(() => showSearchResults(q), 200);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') triggerSearch();
    if (e.key === 'Escape') { dropdown.classList.remove('open'); input.blur(); }
  });

  document.addEventListener('click', e => {
    if (!document.getElementById('search-container').contains(e.target))
      dropdown.classList.remove('open');
  });
}

function showSearchResults(q) {
  const dropdown = document.getElementById('search-dropdown');
  const pool = state.allPokemon.length ? state.allPokemon : RANKING;
  const matches = pool.filter(p => p.name.includes(q)).slice(0, 8);

  if (!matches.length) {
    dropdown.innerHTML = `<div class="search-empty">Nenhum Pokémon encontrado para "${q}"</div>`;
  } else {
    dropdown.innerHTML = matches.map(p => {
      const id = p.apiId || p.id;
      return `
        <div class="search-result-item" onclick="selectSearch('${p.name}')">
          <img src="${sprite(id)}" alt="${p.name}" onerror="this.style.opacity='0.2'">
          <div class="search-result-name">${cap(p.name)}</div>
        </div>`;
    }).join('');
  }
  dropdown.classList.add('open');
}

function triggerSearch() {
  const q = document.getElementById('global-search').value.trim().toLowerCase();
  if (!q) return;
  const pool = state.allPokemon.length ? state.allPokemon : RANKING;
  const match = pool.find(p => p.name === q) || pool.find(p => p.name.startsWith(q));
  if (match) { selectSearch(match.name); }
  else { showSearchResults(q); }
}

function selectSearch(name) {
  document.getElementById('global-search').value = '';
  document.getElementById('search-dropdown').classList.remove('open');
  openDetail(name);
}

/* ════════════════════════════════
   FILTER POKE CARDS
════════════════════════════════ */
function filterPokeCards() {
  const q = document.getElementById('poke-search').value.trim().toLowerCase();
  const source = state.allPokemon.length ? state.allPokemon : STARTER_CARDS;
  const matches = (q ? source.filter(p => p.name.includes(q)) : source).slice(0, 8);
  const grid = document.getElementById('poke-cards-grid');
  if (!grid) return;
  grid.innerHTML = matches.map(c => {
    const id = c.id;
    return `
      <div class="card-pokemon" onclick="openDetail('${c.name}')">
        <img src="${artwork(id)}" alt="${c.name}" onerror="if(!this._t){this._t=true;this.src='${sprite(id)}'}else{this.style.opacity='0.2'}">
        <span>${cap(c.name)}</span>
      </div>`;
  }).join('');
}

/* ════════════════════════════════
   INIT
════════════════════════════════ */
async function init() {
  initSearch();
  initRanking();

  fetchAllPokemons()
    .then(list => {
      state.allPokemon = list;
      const grid = document.getElementById('poke-cards-grid');
      if (grid && !grid.querySelector('.card-pokemon')) renderPokeCards();
    })
    .catch(() => {});
}

init();