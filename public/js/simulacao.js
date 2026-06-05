// ═══════════════════════════════════════════════════════════════
//  METADEX · Battle Simulator — simulacao.js
//  VGC Regulation Set I (ativo desde Abril 2026)
//  Pokémon permitidos: Pokédexes Paldea + Kitakami + Blueberry
// ═══════════════════════════════════════════════════════════════

// ─── ESTADO GLOBAL ────────────────────────────────────────────────────────────
let listaPokemons   = [];
let pokemonAtual    = null;
let movesDoAtual    = [];
let slotsAtaque     = [null, null, null, null];
let evs             = { hp:0, attack:0, defense:0, 'special-attack':0, 'special-defense':0, speed:0 };
let ivs             = { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 };
let slotEditando    = -1;
let slotAlvoAtual   = 0;
let movesCarregados = [];
const moveCache     = {};
let buscaModalTimer = null;
let buscaMoveTimer  = null;

const MAX_EVS     = 508;
const MAX_EV_STAT = 252;
const EV_STEP     = 4;
const MAX_IV_STAT = 31;

// ─── MAPEAMENTO DE TIPOS ──────────────────────────────────────────────────────
const TIPO = {
  normal:   { pt:'Normal',    badge:'tipo-normal',   icone:'icone-normal'   },
  fire:     { pt:'Fogo',      badge:'tipo-fogo',     icone:'icone-fogo'     },
  water:    { pt:'Água',      badge:'tipo-agua',     icone:'icone-agua'     },
  electric: { pt:'Elétrico',  badge:'tipo-eletrico', icone:'icone-eletrico' },
  grass:    { pt:'Grama',     badge:'tipo-grama',    icone:'icone-grama'    },
  ice:      { pt:'Gelo',      badge:'tipo-gelo',     icone:'icone-gelo'     },
  fighting: { pt:'Lutador',   badge:'tipo-lutador',  icone:'icone-lutador'  },
  poison:   { pt:'Veneno',    badge:'tipo-veneno',   icone:'icone-veneno'   },
  ground:   { pt:'Terra',     badge:'tipo-terra',    icone:'icone-terra'    },
  flying:   { pt:'Voador',    badge:'tipo-voador',   icone:'icone-voador'   },
  psychic:  { pt:'Psíquico',  badge:'tipo-psiquico', icone:'icone-psiquico' },
  bug:      { pt:'Inseto',    badge:'tipo-inseto',   icone:'icone-inseto'   },
  rock:     { pt:'Pedra',     badge:'tipo-pedra',    icone:'icone-pedra'    },
  ghost:    { pt:'Fantasma',  badge:'tipo-fantasma', icone:'icone-fantasma' },
  dragon:   { pt:'Dragão',    badge:'tipo-draco',    icone:'icone-draco'    },
  dark:     { pt:'Sombrio',   badge:'tipo-sombrio',  icone:'icone-sombrio'  },
  steel:    { pt:'Aço',       badge:'tipo-aco',      icone:'icone-aco'      },
  fairy:    { pt:'Fada',      badge:'tipo-fada',     icone:'icone-fada'     },
};

const STAT_LABEL = {
  hp:'HP', attack:'Attack', defense:'Defense',
  'special-attack':'Sp. Atk', 'special-defense':'Sp. Def', speed:'Speed',
};

const STAT_BARRA = {
  hp:'barra-hp', attack:'barra-atk', defense:'barra-def',
  'special-attack':'barra-spatk', 'special-defense':'barra-spdef', speed:'barra-spd',
};

const TIPO_EMOJI = {
  normal:'●', fire:'🔥', water:'💧', electric:'⚡', grass:'🌿', ice:'❄',
  fighting:'✊', poison:'☣', ground:'⛰', flying:'🌪', psychic:'🔮', bug:'🐛',
  rock:'◆', ghost:'👻', dragon:'🐉', dark:'◼', steel:'⚙', fairy:'✨',
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const cap      = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const nomePT   = t => TIPO[t]?.pt    || cap(t);
const badgeCls = t => TIPO[t]?.badge || 'tipo-normal';
const iconeCls = t => TIPO[t]?.icone || 'icone-normal';
const emoji    = t => TIPO_EMOJI[t]  || '●';
const totalEvs = () => Object.values(evs).reduce((s,v) => s+v, 0);
const moveName = m => cap(m.name.replace(/-/g,' '));

// ─── INJETAR CSS EXTRA ────────────────────────────────────────────────────────
function injetarEstilos() {
  if (document.getElementById('sim-extra-styles')) return;
  const s = document.createElement('style');
  s.id = 'sim-extra-styles';
  s.textContent = `
    /* ── Stats ── */
    .linha-estatistica { display:flex; align-items:center; gap:5px; margin-bottom:5px; }
    .rotulo-estatistica { font-size:11px; font-weight:700; color:#666; min-width:52px; flex-shrink:0; }
    .numero-estatistica { font-size:12px; font-weight:800; color:#333; min-width:32px; text-align:right; flex-shrink:0; }
    .fundo-barra { flex:1; height:7px; background:rgba(0,0,0,0.08); border-radius:4px; overflow:hidden; }
    .preenchimento-barra { height:100%; border-radius:4px; transition:width 0.4s cubic-bezier(0.34,1.56,0.64,1); }
    .barra-hp    { background:#4caf50; }
    .barra-atk   { background:#f44336; }
    .barra-def   { background:#2196f3; }
    .barra-spatk { background:#9c27b0; }
    .barra-spdef { background:#00bcd4; }
    .barra-spd   { background:#ff9800; }

    /* ── Controles EV/IV ── */
    .controles-stat { display:flex; flex-direction:column; align-items:center; gap:2px; flex-shrink:0; }
    .label-ev-iv { font-size:8px; font-weight:700; color:#aaa; letter-spacing:.5px; text-transform:uppercase; }
    .controles-ev { display:flex; align-items:center; gap:2px; }
    .btn-ev {
      width:18px; height:18px; border-radius:50%;
      background:rgba(45,48,95,0.1); border:1.5px solid rgba(45,48,95,0.2);
      color:#444; font-size:13px; font-weight:700;
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; line-height:1; transition:background .15s,transform .1s;
      user-select:none; padding:0;
    }
    .btn-ev:hover  { background:rgba(45,48,95,0.22); transform:scale(1.15); }
    .btn-ev:active { transform:scale(0.9); }
    .btn-ev:disabled { opacity:.25; cursor:default; transform:none; }
    .ev-valor { font-size:10px; font-weight:700; color:#555; min-width:24px; text-align:center; }
    .ev-total {
      font-size:11px; color:#888; font-weight:600;
      margin-top:8px; padding-top:6px; border-top:1px solid rgba(0,0,0,.07);
      display:flex; justify-content:space-between;
    }
    .ev-total span { color:#e53935; font-weight:800; }
    .ev-total-ok span { color:#43a047; }
    .tabs-stat { display:flex; gap:4px; margin-bottom:10px; }
    .tab-stat {
      padding:4px 12px; border-radius:20px;
      border:1.5px solid rgba(45,48,95,0.2); background:transparent;
      font-size:11px; font-weight:700; cursor:pointer; transition:all .15s; color:#666;
    }
    .tab-stat.ativo { background:rgba(45,48,95,0.85); color:#fff; border-color:transparent; }

    /* ── Slots de ataque ── */
    .slot-ataque-vazio {
      cursor:pointer; transition:background .2s, border-color .2s;
      border:2px dashed rgba(45,48,95,0.2); border-radius:10px;
      padding:12px; display:flex; align-items:center; justify-content:center;
      color:#aaa; font-size:12px;
    }
    .slot-ataque-vazio:hover { background:rgba(255,255,255,0.65); border-color:rgba(45,48,95,0.4); }
    .slot-ataque-vazio.slot-ativo { border-color:rgba(45,48,95,0.6); border-style:solid; background:rgba(255,255,255,0.4); }
    .botao-ataque-slot.slot-ativo { outline:2px solid rgba(45,48,95,0.55); outline-offset:2px; }

    /* ── Painel de moves lateral ── */
    .lista-moves-aprendidos { display:flex; flex-direction:column; gap:4px; max-height:400px; overflow-y:auto; }
    .item-move-aprendido {
      display:flex; align-items:center; gap:8px;
      padding:7px 10px; border-radius:8px;
      background:rgba(255,255,255,0.55); border:1px solid rgba(0,0,0,0.06);
      cursor:pointer; transition:background .15s, transform .1s, box-shadow .15s;
      user-select:none;
    }
    .item-move-aprendido:hover { background:rgba(255,255,255,0.9); transform:translateX(3px); box-shadow:0 2px 8px rgba(0,0,0,0.08); }
    .item-move-aprendido.em-slot { opacity:.4; pointer-events:none; }
    .nome-move-aprendido { flex:1; font-size:12px; font-weight:600; color:#333; text-transform:capitalize; }
    .poder-move { font-size:10px; font-weight:700; color:#888; white-space:nowrap; }
    .categoria-move {
      font-size:9px; font-weight:700; padding:2px 5px; border-radius:8px;
      text-transform:uppercase; letter-spacing:.3px; flex-shrink:0;
    }
    .cat-physical { background:#fbe9e7; color:#bf360c; }
    .cat-special  { background:#ede7f6; color:#4a148c; }
    .cat-status   { background:#e8f5e9; color:#1b5e20; }
    .circulo-tipo-mini {
      width:22px; height:22px; border-radius:50%;
      display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0;
    }
    .slot-destino-badge {
      font-size:9px; background:rgba(45,48,95,0.75); color:#fff;
      border-radius:10px; padding:2px 6px; font-weight:700; flex-shrink:0;
    }
    .barra-busca-moves { display:flex; gap:6px; margin-bottom:8px; }
    .barra-busca-moves input {
      flex:1; padding:6px 10px; border-radius:8px;
      border:1.5px solid rgba(0,0,0,0.12); font-size:12px;
      background:rgba(255,255,255,0.8); outline:none;
    }
    .barra-busca-moves input:focus { border-color:rgba(45,48,95,0.4); }
    .selector-slot { display:flex; gap:5px; margin-bottom:10px; flex-wrap:wrap; }
    .btn-slot-alvo {
      padding:4px 10px; border-radius:20px;
      border:2px solid rgba(45,48,95,0.2); background:transparent;
      font-size:11px; font-weight:700; cursor:pointer; color:#666; transition:all .15s;
      white-space:nowrap; max-width:110px; overflow:hidden; text-overflow:ellipsis;
    }
    .btn-slot-alvo.ativo { background:rgba(45,48,95,0.85); color:#fff; border-color:transparent; }
    .btn-slot-alvo.tem-move { border-color:rgba(45,48,95,0.45); color:#444; }
    .moves-carregando { text-align:center; padding:20px; color:#aaa; font-size:12px; }

    /* ── Aviso fora do VGC ── */
    .aviso-fora-vgc {
      text-align:center; padding:7px 10px; font-size:11px;
      color:#e67e22; font-weight:700; background:rgba(230,126,34,0.08);
      border-radius:8px; margin-bottom:6px; border:1px solid rgba(230,126,34,0.2);
    }

    /* ── Modal tipo badge ── */
    .circulo-tipo-modal {
      width:28px; height:28px; border-radius:50%;
      display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0;
    }
  `;
  document.head.appendChild(s);
}

// ─── INICIALIZAÇÃO ────────────────────────────────────────────────────────────
async function init() {
  injetarEstilos();
  await carregarListaVGC();

  document.getElementById('campo-busca-pokemon')
    .addEventListener('keydown', e => { if (e.key === 'Enter') filtrarCartoesPokemon(); });

  const campoModal = document.getElementById('campo-busca-ataque');
  if (campoModal) {
    campoModal.addEventListener('input', e => {
      clearTimeout(buscaModalTimer);
      buscaModalTimer = setTimeout(
        () => renderizarListaModal(e.target.value.trim().toLowerCase()), 300
      );
    });
  }
}

// ─── CARREGAR LISTA VGC (Regulation I = Paldea + Kitakami + Blueberry) ────────
async function carregarListaVGC() {
  const grade = document.getElementById('grade-cartoes-pokemon');
  grade.innerHTML = `<div class="carregando-pokemon"><div class="icone-carregando"></div>Carregando Pokémon VGC Reg. I…</div>`;

  try {
    const [paldea, kitakami, blueberry] = await Promise.all([
      fetch('https://pokeapi.co/api/v2/pokedex/paldea').then(r => r.json()),
      fetch('https://pokeapi.co/api/v2/pokedex/kitakami').then(r => r.json()),
      fetch('https://pokeapi.co/api/v2/pokedex/blueberry').then(r => r.json()),
    ]);

    const vistos = new Set();
    const todos  = [];

    for (const dex of [paldea, kitakami, blueberry]) {
      for (const entry of dex.pokemon_entries) {
        const nome = entry.pokemon_species.name;
        if (!vistos.has(nome)) {
          vistos.add(nome);
          todos.push({
            name: nome,
            url: `https://pokeapi.co/api/v2/pokemon/${nome}/`,
          });
        }
      }
    }

    todos.sort((a, b) => a.name.localeCompare(b.name));
    listaPokemons = todos;
    renderizarCartoes(listaPokemons);
  } catch (err) {
    console.error(err);
    grade.innerHTML = `<div class="carregando-pokemon">Erro ao carregar. Tente recarregar a página.</div>`;
  }
}

// ─── FILTRAR / PESQUISAR POKÉMON ──────────────────────────────────────────────
async function filtrarCartoesPokemon() {
  const q = document.getElementById('campo-busca-pokemon').value.trim().toLowerCase();
  if (!q) { renderizarCartoes(listaPokemons); return; }

  const grade = document.getElementById('grade-cartoes-pokemon');

  // Busca na lista VGC primeiro
  const found = listaPokemons.filter(p => p.name.includes(q));
  if (found.length) { renderizarCartoes(found); return; }

  // Fallback: API direta (pode ser fora do VGC)
  grade.innerHTML = `<div class="carregando-pokemon"><div class="icone-carregando"></div>Buscando "${q}"…</div>`;
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${q}`);
    if (!res.ok) throw new Error();
    const pok = await res.json();
    renderizarCartoes([{ name: pok.name, url: `https://pokeapi.co/api/v2/pokemon/${pok.id}/` }], true);
  } catch {
    grade.innerHTML = `<div class="carregando-pokemon">Nenhum Pokémon encontrado para "${q}".</div>`;
  }
}

// ─── RENDERIZAR CARTÕES DA GRADE ──────────────────────────────────────────────
function renderizarCartoes(lista, foraVGC = false) {
  const grade = document.getElementById('grade-cartoes-pokemon');
  if (!lista?.length) {
    grade.innerHTML = `<div class="carregando-pokemon">Nenhum resultado.</div>`;
    return;
  }
  grade.innerHTML = '';

  if (foraVGC) {
    const aviso = document.createElement('div');
    aviso.className = 'aviso-fora-vgc';
    aviso.textContent = '⚠ Este Pokémon não está na lista VGC Reg. I';
    grade.appendChild(aviso);
  }

  lista.forEach(p => {
    const id  = idDaUrl(p.url);
    const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    const sel = pokemonAtual?.id == id ? ' selecionado' : '';
    const div = document.createElement('div');
    div.className  = `cartao-pokemon-escolha${sel}`;
    div.dataset.id = id;
    div.innerHTML  = `
      <img src="${img}" alt="${p.name}" loading="lazy"
           onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png'">
      <span>${cap(p.name)}</span>`;
    div.addEventListener('click', () => selecionarPokemon(id));
    grade.appendChild(div);
  });
}

function idDaUrl(url) {
  const pts = url.replace(/\/$/, '').split('/');
  return pts[pts.length - 1];
}

// ─── SELECIONAR POKÉMON ───────────────────────────────────────────────────────
async function selecionarPokemon(id) {
  const imgEl  = document.getElementById('imagem-pokemon-detalhe');
  const phEl   = document.getElementById('placeholder-imagem');
  const nomeEl = document.getElementById('nome-pokemon-detalhe');

  nomeEl.textContent = 'Carregando…';
  imgEl.style.display = 'none';
  phEl.style.display  = 'flex';
  phEl.textContent    = '⏳';
  document.getElementById('tipos-pokemon-detalhe').innerHTML = `<span class="badge-tipo-vazio">—</span>`;
  document.getElementById('container-estatisticas').innerHTML = `<div class="estado-vazio-stats"><p>Carregando dados…</p></div>`;
  document.getElementById('grade-slots-ataque').innerHTML = `<div class="slot-ataque-vazio"><span>Carregando…</span></div>`;
  document.getElementById('lista-resumo-ataques').innerHTML = `<div class="moves-carregando"><div class="icone-carregando"></div> Carregando moveset…</div>`;

  document.querySelectorAll('.cartao-pokemon-escolha').forEach(c =>
    c.classList.toggle('selecionado', c.dataset.id == id));

  try {
    const res  = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    pokemonAtual = data;

    evs = { hp:0, attack:0, defense:0, 'special-attack':0, 'special-defense':0, speed:0 };
    ivs = { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 };

    const artwork = data.sprites?.other?.['official-artwork']?.front_default
                 || data.sprites?.front_default;
    if (artwork) {
      imgEl.src = artwork;
      imgEl.alt = data.name;
      imgEl.style.display = 'block';
      phEl.style.display  = 'none';
    } else {
      phEl.textContent = '?';
    }

    nomeEl.textContent = cap(data.name);
    renderizarTipos(data.types);
    renderizarStats(data.stats);

    movesDoAtual    = data.moves;
    movesCarregados = [];
    slotsAtaque     = [null, null, null, null];
    slotAlvoAtual   = 0;

    renderizarSlotsAtaque();

    // Carrega moves progressivamente em background
    preCarregarMoves();

  } catch (err) {
    console.error(err);
    phEl.textContent   = '❌';
    nomeEl.textContent = 'Erro ao carregar';
  }
}

// ─── PRÉ-CARREGAR MOVES (progressivo) ────────────────────────────────────────
async function preCarregarMoves() {
  const lista = document.getElementById('lista-resumo-ataques');
  lista.innerHTML = `<div class="moves-carregando"><div class="icone-carregando"></div> Carregando ${movesDoAtual.length} ataques…</div>`;

  // Ordena: level-up primeiro
  const ordenados = [...movesDoAtual].sort((a, b) => {
    const lvlA = a.version_group_details.some(v => v.move_learn_method.name === 'level-up') ? 0 : 1;
    const lvlB = b.version_group_details.some(v => v.move_learn_method.name === 'level-up') ? 0 : 1;
    return lvlA - lvlB;
  });

  const LOTE = 20;
  movesCarregados = [];

  // Guarda referência ao pokemon atual para não atualizar UI de pokemon trocado
  const snapPokemon = pokemonAtual;

  for (let i = 0; i < ordenados.length; i += LOTE) {
    if (pokemonAtual !== snapPokemon) return; // pokemon mudou, para
    const lote     = ordenados.slice(i, i + LOTE);
    const detalhes = await Promise.all(lote.map(m => fetchMoveDetails(m.move.name, m.move.url)));
    movesCarregados.push(...detalhes.filter(Boolean));

    // Atualiza o painel após cada lote
    if (pokemonAtual === snapPokemon) {
      movesCarregados.sort((a, b) => (b.power || 0) - (a.power || 0));
      renderizarPainelMovesLateral();
    }
  }
}

// ─── TIPOS ───────────────────────────────────────────────────────────────────
function renderizarTipos(tipos) {
  document.getElementById('tipos-pokemon-detalhe').innerHTML = tipos
    .map(t => `<span class="badge-tipo ${badgeCls(t.type.name)}">${nomePT(t.type.name)}</span>`)
    .join('');
}

// ─── STATS EDITÁVEIS ─────────────────────────────────────────────────────────
let modoStat = 'ev';

function renderizarStats(stats) {
  const cont = document.getElementById('container-estatisticas');
  cont.innerHTML = '';

  const tabs = document.createElement('div');
  tabs.className = 'tabs-stat';
  tabs.innerHTML = `
    <button class="tab-stat ${modoStat === 'ev' ? 'ativo' : ''}" onclick="trocarModoStat('ev')">EVs</button>
    <button class="tab-stat ${modoStat === 'iv' ? 'ativo' : ''}" onclick="trocarModoStat('iv')">IVs</button>`;
  cont.appendChild(tabs);

  stats.forEach(s => {
    const stat  = s.stat.name;
    const base  = s.base_stat;
    const ev    = evs[stat]  || 0;
    const iv    = ivs[stat]  !== undefined ? ivs[stat] : 31;
    const total = calcTotal(base, ev, iv);
    const pct   = pctBarra(base);

    const div = document.createElement('div');
    div.className    = 'linha-estatistica';
    div.dataset.stat = stat;

    if (modoStat === 'ev') {
      div.innerHTML = `
        <span class="rotulo-estatistica">${STAT_LABEL[stat] || stat}</span>
        <span class="numero-estatistica" id="val-${stat}">${total}</span>
        <div class="fundo-barra"><div class="preenchimento-barra ${STAT_BARRA[stat]}" id="barra-${stat}" style="width:${pct}%"></div></div>
        <div class="controles-stat">
          <span class="label-ev-iv">EV</span>
          <div class="controles-ev">
            <button class="btn-ev" id="btn-menos-ev-${stat}" onclick="ajustarEV('${stat}',-${EV_STEP})">−</button>
            <span class="ev-valor" id="ev-${stat}">${ev}</span>
            <button class="btn-ev" id="btn-mais-ev-${stat}" onclick="ajustarEV('${stat}',+${EV_STEP})">+</button>
          </div>
        </div>`;
    } else {
      div.innerHTML = `
        <span class="rotulo-estatistica">${STAT_LABEL[stat] || stat}</span>
        <span class="numero-estatistica" id="val-${stat}">${total}</span>
        <div class="fundo-barra"><div class="preenchimento-barra ${STAT_BARRA[stat]}" id="barra-${stat}" style="width:${pct}%"></div></div>
        <div class="controles-stat">
          <span class="label-ev-iv">IV</span>
          <div class="controles-ev">
            <button class="btn-ev" id="btn-menos-iv-${stat}" onclick="ajustarIV('${stat}',-1)">−</button>
            <span class="ev-valor" id="iv-${stat}">${iv}</span>
            <button class="btn-ev" id="btn-mais-iv-${stat}" onclick="ajustarIV('${stat}',+1)">+</button>
          </div>
        </div>`;
    }
    cont.appendChild(div);
  });

  if (modoStat === 'ev') {
    const restantes = MAX_EVS - totalEvs();
    const rodape = document.createElement('div');
    rodape.id        = 'ev-rodape';
    rodape.className = `ev-total${restantes >= 0 ? ' ev-total-ok' : ''}`;
    rodape.innerHTML = `<span>EVs: ${totalEvs()}/${MAX_EVS}</span><span>Restantes: <span>${restantes}</span></span>`;
    cont.appendChild(rodape);
  }

  atualizarBotoesEV();
  atualizarBotoesIV();
}

function trocarModoStat(modo) {
  modoStat = modo;
  if (pokemonAtual) renderizarStats(pokemonAtual.stats);
}

function calcTotal(base, ev, iv = 31, nivel = 50) {
  return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * nivel) / 100) + (nivel + 10);
}

function pctBarra(base) {
  return Math.min(100, Math.round((base / 255) * 100));
}

function ajustarEV(stat, delta) {
  const cur   = evs[stat] || 0;
  const total = totalEvs();
  if (delta > 0) {
    if (total + delta > MAX_EVS || cur + delta > MAX_EV_STAT) return;
    evs[stat] = cur + delta;
  } else {
    if (cur + delta < 0) return;
    evs[stat] = cur + delta;
  }
  atualizarStatDisplay(stat);
  const rodapeEl = document.getElementById('ev-rodape');
  if (rodapeEl) {
    const restantes = MAX_EVS - totalEvs();
    rodapeEl.className = `ev-total${restantes >= 0 ? ' ev-total-ok' : ''}`;
    rodapeEl.innerHTML = `<span>EVs: ${totalEvs()}/${MAX_EVS}</span><span>Restantes: <span>${restantes}</span></span>`;
  }
  atualizarBotoesEV();
}

function ajustarIV(stat, delta) {
  const cur = ivs[stat] !== undefined ? ivs[stat] : 31;
  const novo = cur + delta;
  if (novo < 0 || novo > MAX_IV_STAT) return;
  ivs[stat] = novo;
  atualizarStatDisplay(stat);
  atualizarBotoesIV();
}

function atualizarStatDisplay(stat) {
  if (!pokemonAtual) return;
  const s = pokemonAtual.stats.find(x => x.stat.name === stat);
  if (!s) return;
  const ev    = evs[stat]  || 0;
  const iv    = ivs[stat]  !== undefined ? ivs[stat] : 31;
  const total = calcTotal(s.base_stat, ev, iv);
  const pct   = pctBarra(s.base_stat);
  const valEl   = document.getElementById(`val-${stat}`);
  const barraEl = document.getElementById(`barra-${stat}`);
  const evEl    = document.getElementById(`ev-${stat}`);
  const ivEl    = document.getElementById(`iv-${stat}`);
  if (valEl)   valEl.textContent   = total;
  if (barraEl) barraEl.style.width = pct + '%';
  if (evEl)    evEl.textContent    = ev;
  if (ivEl)    ivEl.textContent    = iv;
}

function atualizarBotoesEV() {
  const restantes = MAX_EVS - totalEvs();
  Object.keys(evs).forEach(stat => {
    const mais  = document.getElementById(`btn-mais-ev-${stat}`);
    const menos = document.getElementById(`btn-menos-ev-${stat}`);
    if (mais)  mais.disabled  = (restantes < EV_STEP) || (evs[stat] + EV_STEP > MAX_EV_STAT);
    if (menos) menos.disabled = evs[stat] <= 0;
  });
}

function atualizarBotoesIV() {
  Object.keys(ivs).forEach(stat => {
    const mais  = document.getElementById(`btn-mais-iv-${stat}`);
    const menos = document.getElementById(`btn-menos-iv-${stat}`);
    if (mais)  mais.disabled  = ivs[stat] >= MAX_IV_STAT;
    if (menos) menos.disabled = ivs[stat] <= 0;
  });
}

// ─── FETCH MOVE COM CACHE ─────────────────────────────────────────────────────
async function fetchMoveDetails(name, url) {
  if (moveCache[name]) return moveCache[name];
  try {
    const res  = await fetch(url || `https://pokeapi.co/api/v2/move/${name}`);
    if (!res.ok) return null;
    const data = await res.json();
    moveCache[name] = data;
    return data;
  } catch { return null; }
}

// ─── RENDERIZAR SLOTS DE ATAQUE (topo) ───────────────────────────────────────
function renderizarSlotsAtaque() {
  const grade = document.getElementById('grade-slots-ataque');
  grade.innerHTML = '';

  slotsAtaque.forEach((move, i) => {
    const ativo = i === slotAlvoAtual;

    if (!move) {
      const div = document.createElement('div');
      div.className = `slot-ataque-vazio${ativo ? ' slot-ativo' : ''}`;
      div.innerHTML = `<span>${ativo ? '▶ ' : ''}Slot ${i+1} — selecione na lista abaixo</span>`;
      div.addEventListener('click', () => selecionarSlotAlvo(i));
      grade.appendChild(div);
      return;
    }

    const tipo  = move.type?.name || 'normal';
    const poder = move.power      || '—';
    const btn   = document.createElement('button');
    btn.className = `botao-ataque-slot${ativo ? ' slot-ativo' : ''}`;
    btn.innerHTML = `
      <div class="conteudo-ataque">
        <div class="circulo-tipo-ataque ${iconeCls(tipo)}"
             style="font-size:14px;display:flex;align-items:center;justify-content:center;">
          ${emoji(tipo)}
        </div>
        <span style="flex:1;text-align:left;text-transform:capitalize">${moveName(move)}</span>
        <span class="badge-porcentagem-ataque">${poder !== '—' ? poder+' pw' : 'Status'}</span>
        <span class="btn-remover-slot" title="Remover" style="font-size:11px;color:#ccc;margin-left:4px;padding:0 4px;">✕</span>
      </div>`;
    btn.addEventListener('click', e => {
      if (e.target.classList.contains('btn-remover-slot') || e.target.title === 'Remover') {
        slotsAtaque[i] = null;
        renderizarSlotsAtaque();
        renderizarPainelMovesLateral(_filtroPainelAtual());
      } else {
        selecionarSlotAlvo(i);
      }
    });
    grade.appendChild(btn);
  });
}

function _filtroPainelAtual() {
  return document.getElementById('campo-busca-move-lateral')?.value?.toLowerCase() || '';
}

function selecionarSlotAlvo(i) {
  slotAlvoAtual = i;
  renderizarSlotsAtaque();
  renderizarPainelMovesLateral(_filtroPainelAtual());
}

// ─── PAINEL LATERAL: LISTA DE MOVES CLICÁVEIS ────────────────────────────────
// Substitui "Ataques mais utilizados" — agora é a lista completa de moves
// que o pokemon PODE aprender, clicáveis para colocar no slot alvo.
function renderizarPainelMovesLateral(filtro = '') {
  const lista = document.getElementById('lista-resumo-ataques');
  if (!pokemonAtual) {
    lista.innerHTML = `<div class="moves-carregando">Nenhum Pokémon selecionado.</div>`;
    return;
  }

  lista.innerHTML = '';

  // Seletor de qual slot está sendo preenchido
  const selector = document.createElement('div');
  selector.className = 'selector-slot';
  for (let i = 0; i < 4; i++) {
    const btn = document.createElement('button');
    const labelMove = slotsAtaque[i] ? moveName(slotsAtaque[i]).slice(0, 10) : `vazio`;
    btn.className   = `btn-slot-alvo${i === slotAlvoAtual ? ' ativo' : ''}${slotsAtaque[i] ? ' tem-move' : ''}`;
    btn.textContent = `Slot ${i+1}: ${labelMove}`;
    btn.title       = slotsAtaque[i] ? moveName(slotsAtaque[i]) : `Slot ${i+1} vazio`;
    btn.addEventListener('click', () => selecionarSlotAlvo(i));
    selector.appendChild(btn);
  }
  lista.appendChild(selector);

  // Barra de busca
  const buscaDiv = document.createElement('div');
  buscaDiv.className = 'barra-busca-moves';
  buscaDiv.innerHTML = `<input type="text" id="campo-busca-move-lateral" placeholder="Filtrar ataques do Pokémon…" autocomplete="off" value="${filtro}">`;
  lista.appendChild(buscaDiv);

  setTimeout(() => {
    const inp = document.getElementById('campo-busca-move-lateral');
    if (inp) {
      inp.addEventListener('input', e => {
        clearTimeout(buscaMoveTimer);
        buscaMoveTimer = setTimeout(
          () => renderizarPainelMovesLateral(e.target.value.trim().toLowerCase()), 200
        );
      });
      inp.focus();
    }
  }, 0);

  // Se ainda não carregou nenhum move, mostra loading
  if (!movesCarregados.length) {
    const loading = document.createElement('div');
    loading.className = 'moves-carregando';
    loading.innerHTML = `<div class="icone-carregando"></div> Carregando ataques…`;
    lista.appendChild(loading);
    return;
  }

  // Filtra por nome
  const nomesNosSlots  = new Set(slotsAtaque.filter(Boolean).map(m => m.name));
  const movesFiltrados = filtro
    ? movesCarregados.filter(m => m.name.includes(filtro))
    : movesCarregados;

  if (!movesFiltrados.length) {
    const vazio = document.createElement('div');
    vazio.className   = 'moves-carregando';
    vazio.textContent = 'Nenhum ataque encontrado.';
    lista.appendChild(vazio);
    return;
  }

  const container = document.createElement('div');
  container.className = 'lista-moves-aprendidos';

  movesFiltrados.forEach(move => {
    const tipo     = move.type?.name        || 'normal';
    const poder    = move.power             || null;
    const pp       = move.pp                || '—';
    const cat      = move.damage_class?.name || 'status';
    const catCls   = cat === 'physical' ? 'cat-physical' : cat === 'special' ? 'cat-special' : 'cat-status';
    const catPT    = cat === 'physical' ? 'Físico' : cat === 'special' ? 'Especial' : 'Status';
    const jaNoSlot = nomesNosSlots.has(move.name);

    const item = document.createElement('div');
    item.className = `item-move-aprendido${jaNoSlot ? ' em-slot' : ''}`;
    item.title     = jaNoSlot ? 'Já está em um slot' : `→ Slot ${slotAlvoAtual + 1}`;
    item.innerHTML = `
      <div class="circulo-tipo-mini ${iconeCls(tipo)}">${emoji(tipo)}</div>
      <span class="nome-move-aprendido">${moveName(move)}</span>
      <span class="categoria-move ${catCls}">${catPT}</span>
      <span class="poder-move">${poder ? poder + ' pw · ' : ''}${pp}PP</span>
      <span class="slot-destino-badge">→ ${slotAlvoAtual + 1}</span>`;

    item.addEventListener('click', () => {
      if (jaNoSlot) return;
      slotsAtaque[slotAlvoAtual] = move;

      // Avança automaticamente para o próximo slot vazio
      const proxVazio = slotsAtaque.findIndex((s, idx) => idx > slotAlvoAtual && !s);
      if (proxVazio !== -1) {
        slotAlvoAtual = proxVazio;
      } else {
        const qualquer = slotsAtaque.findIndex(s => !s);
        if (qualquer !== -1) slotAlvoAtual = qualquer;
        // Se todos preenchidos, mantém o slot atual
      }

      renderizarSlotsAtaque();
      renderizarPainelMovesLateral(_filtroPainelAtual());
    });

    container.appendChild(item);
  });

  lista.appendChild(container);

  // Info de total carregado
  const total = movesCarregados.length;
  const mostrando = movesFiltrados.length;
  if (mostrando < total || total < movesDoAtual.length) {
    const info = document.createElement('div');
    info.style.cssText = 'text-align:center;padding:6px;font-size:10px;color:#bbb;';
    info.textContent = total < movesDoAtual.length
      ? `Carregados ${total} de ${movesDoAtual.length} ataques…`
      : `${mostrando} de ${total} ataques`;
    lista.appendChild(info);
  }
}

// ─── MODAL (fallback — mantido para compatibilidade com HTML original) ────────
function abrirModalAtaque(slotIndex) {
  if (!pokemonAtual) return;
  slotEditando  = slotIndex;
  slotAlvoAtual = slotIndex;
  document.getElementById('titulo-modal').textContent = `Slot ${slotIndex+1} · Escolher Ataque`;
  document.getElementById('campo-busca-ataque').value = '';
  document.getElementById('sobreposicao-modal').classList.add('aberta');
  renderizarListaModal('');
}

async function renderizarListaModal(filtro) {
  if (!pokemonAtual) return;
  const lista = document.getElementById('lista-ataques-modal');
  lista.innerHTML = `<div class="carregando-pokemon"><div class="icone-carregando"></div>Buscando…</div>`;

  const refs = filtro
    ? movesDoAtual.filter(m => m.move.name.includes(filtro))
    : movesDoAtual;

  const lote     = refs.slice(0, 40);
  const detalhes = await Promise.all(lote.map(m => fetchMoveDetails(m.move.name, m.move.url)));
  const moves    = detalhes.filter(Boolean).sort((a, b) => (b.power || 0) - (a.power || 0));

  lista.innerHTML = '';
  if (!moves.length) {
    lista.innerHTML = `<div class="carregando-pokemon">Nenhum ataque encontrado.</div>`;
    return;
  }

  moves.forEach(move => {
    const tipo  = move.type?.name        || 'normal';
    const poder = move.power             || '—';
    const pp    = move.pp                || '—';
    const cat   = move.damage_class?.name || 'status';
    const catCls = cat === 'physical' ? 'cat-physical' : cat === 'special' ? 'cat-special' : 'cat-status';
    const catPT  = cat === 'physical' ? 'Físico' : cat === 'special' ? 'Especial' : 'Status';

    const item = document.createElement('div');
    item.className = 'item-ataque-modal';
    item.innerHTML = `
      <div class="circulo-tipo-modal ${iconeCls(tipo)}">${emoji(tipo)}</div>
      <span class="nome-ataque-modal">${moveName(move)}</span>
      <span class="badge-tipo-modal ${badgeCls(tipo)}">${nomePT(tipo)}</span>
      <span class="categoria-move ${catCls}">${catPT}</span>
      <div class="info-ataque-modal">
        <span>${poder !== '—' ? poder+' pw' : 'Status'}</span>
        <span>${pp} PP</span>
      </div>`;
    item.addEventListener('click', () => {
      slotsAtaque[slotEditando] = move;
      fecharModalDireto();
      renderizarSlotsAtaque();
      renderizarPainelMovesLateral();
    });
    lista.appendChild(item);
  });

  if (refs.length > 40) {
    const aviso = document.createElement('div');
    aviso.style.cssText = 'text-align:center;padding:10px;font-size:11px;color:#aaa;';
    aviso.textContent   = `Mostrando 40 de ${refs.length}. Use a busca para refinar.`;
    lista.appendChild(aviso);
  }
}

function fecharModal(event) {
  const modal = document.getElementById('sobreposicao-modal');
  if (event.target === modal) modal.classList.remove('aberta');
}
function fecharModalDireto() {
  document.getElementById('sobreposicao-modal').classList.remove('aberta');
}

// ─── MENU LATERAL ─────────────────────────────────────────────────────────────
function abrirMenu()  { document.querySelector('.menu-lateral').style.display = 'block'; }
function fecharMenu() { document.querySelector('.menu-lateral').style.display = 'none';  }

// ─── START ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);