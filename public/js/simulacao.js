/* ════════════════════════════════════════════════
   SIMULADOR DE BATALHA · VGC
   Metadex — js/simulacao.js
════════════════════════════════════════════════ */

/* ── Estado global ── */
const estado = {
  todosPokemon: [],       // lista completa da PokeAPI
  pokemonAtual: null,     // objeto com dados do Pokémon selecionado
  dadosPokemon: null,     // resposta bruta da PokeAPI
  movimentosDisponiveis: [], // todos os moves que o Pokémon pode aprender
  slotsSelecionados: [null, null, null, null], // 4 slots de ataque
  slotEmEdicao: null,     // índice do slot sendo editado
};

/* ── Cache ── */
const cachePokemon  = {}; // name → data
const cacheMoves    = {}; // name → { tipo, categoria, poder, pp }

/* ═══════════════════════════════════════════════
   UTILITÁRIOS
═══════════════════════════════════════════════ */
const artwork = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const sprite  = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
const cap     = s  => s.split(/[-\s]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/** Mapeia tipo (en) → classe CSS de ícone (pt) */
const MAPA_ICONE_TIPO = {
  normal:   'icone-normal',
  fire:     'icone-fogo',
  water:    'icone-agua',
  electric: 'icone-eletrico',
  grass:    'icone-grama',
  ice:      'icone-gelo',
  fighting: 'icone-lutador',
  poison:   'icone-veneno',
  ground:   'icone-terra',
  flying:   'icone-voador',
  psychic:  'icone-psiquico',
  bug:      'icone-inseto',
  rock:     'icone-pedra',
  ghost:    'icone-fantasma',
  dragon:   'icone-draco',
  dark:     'icone-sombrio',
  steel:    'icone-aco',
  fairy:    'icone-fada',
};

/** Mapeia tipo (en) → classe CSS de badge (pt) */
const MAPA_BADGE_TIPO = {
  normal:   'tipo-normal',
  fire:     'tipo-fogo',
  water:    'tipo-agua',
  electric: 'tipo-eletrico',
  grass:    'tipo-grama',
  ice:      'tipo-gelo',
  fighting: 'tipo-lutador',
  poison:   'tipo-veneno',
  ground:   'tipo-terra',
  flying:   'tipo-voador',
  psychic:  'tipo-psiquico',
  bug:      'tipo-inseto',
  rock:     'tipo-pedra',
  ghost:    'tipo-fantasma',
  dragon:   'tipo-draco',
  dark:     'tipo-sombrio',
  steel:    'tipo-aco',
  fairy:    'tipo-fada',
};

/** Nome do tipo em PT para exibição */
const NOME_TIPO_PT = {
  normal:   'Normal',
  fire:     'Fogo',
  water:    'Água',
  electric: 'Elétrico',
  grass:    'Grama',
  ice:      'Gelo',
  fighting: 'Lutador',
  poison:   'Veneno',
  ground:   'Terra',
  flying:   'Voador',
  psychic:  'Psíquico',
  bug:      'Inseto',
  rock:     'Pedra',
  ghost:    'Fantasma',
  dragon:   'Draco',
  dark:     'Sombrio',
  steel:    'Aço',
  fairy:    'Fada',
};

function nomeTipoPt(tipo) {
  return NOME_TIPO_PT[tipo] || cap(tipo);
}

/* ═══════════════════════════════════════════════
   API — POKÉMON
═══════════════════════════════════════════════ */

/** Busca a lista completa de Pokémon (até 1010) */
async function buscarTodosPokemon() {
  try {
    const r = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1010&offset=0');
    const d = await r.json();
    return d.results.map((p, i) => ({ nome: p.name, id: i + 1 }));
  } catch (e) {
    console.error('Erro ao buscar lista de Pokémon:', e);
    return [];
  }
}

/** Busca dados completos de um Pokémon pelo nome ou id */
async function buscarPokemon(nomeOuId) {
  const chave = String(nomeOuId).toLowerCase();
  if (cachePokemon[chave]) return cachePokemon[chave];

  const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${chave}`);
  if (!r.ok) throw new Error(`Pokémon não encontrado: ${chave}`);
  const dados = await r.json();
  cachePokemon[chave] = dados;
  cachePokemon[String(dados.id)] = dados; // cache por id também
  return dados;
}

/* ═══════════════════════════════════════════════
   API — MOVES
═══════════════════════════════════════════════ */

/** Busca dados de um move pelo nome */
async function buscarMove(nomeMove) {
  const chave = nomeMove.toLowerCase();
  if (cacheMoves[chave]) return cacheMoves[chave];

  try {
    const r = await fetch(`https://pokeapi.co/api/v2/move/${chave}`);
    if (!r.ok) throw new Error('Move não encontrado');
    const d = await r.json();
    const info = {
      nome:      d.name,
      tipo:      d.type.name,
      categoria: d.damage_class.name,
      poder:     d.power,
      pp:        d.pp,
    };
    cacheMoves[chave] = info;
    return info;
  } catch {
    const fallback = { nome: chave, tipo: 'normal', categoria: 'status', poder: null, pp: null };
    cacheMoves[chave] = fallback;
    return fallback;
  }
}

/* ═══════════════════════════════════════════════
   RENDERIZAÇÃO — GRADE DE POKÉMON
═══════════════════════════════════════════════ */

function renderizarCartoesPokemon(lista) {
  const grade = document.getElementById('grade-cartoes-pokemon');
  if (!grade) return;

  if (!lista.length) {
    grade.innerHTML = '<div class="carregando-pokemon" style="grid-column:1/-1">Nenhum Pokémon encontrado.</div>';
    return;
  }

  grade.innerHTML = lista.slice(0, 8).map(p => {
    const ehSelecionado = estado.pokemonAtual && estado.pokemonAtual.name === p.nome ? 'selecionado' : '';
    return `
      <div class="cartao-pokemon-escolha ${ehSelecionado}" onclick="selecionarPokemon('${p.nome}')">
        <img
          src="${artwork(p.id)}"
          alt="${p.nome}"
          loading="lazy"
          onerror="if(!this._t){this._t=true;this.src='${sprite(p.id)}'}else{this.style.opacity='0.25'}"
        >
        <span>${cap(p.nome)}</span>
      </div>`;
  }).join('');
}

function filtrarCartoesPokemon() {
  const q = document.getElementById('campo-busca-pokemon').value.trim().toLowerCase();
  const fonte = estado.todosPokemon.length ? estado.todosPokemon : [];
  const lista = q ? fonte.filter(p => p.nome.includes(q)) : fonte;
  renderizarCartoesPokemon(lista);
}

/* ═══════════════════════════════════════════════
   RENDERIZAÇÃO — DETALHES DO POKÉMON
═══════════════════════════════════════════════ */

async function selecionarPokemon(nome) {
  // Feedback visual imediato
  const imgEl   = document.getElementById('imagem-pokemon-detalhe');
  const phEl    = document.getElementById('placeholder-imagem');
  const nomeEl  = document.getElementById('nome-pokemon-detalhe');
  const tiposEl = document.getElementById('tipos-pokemon-detalhe');
  const statsEl = document.getElementById('container-estatisticas');

  nomeEl.textContent   = cap(nome);
  tiposEl.innerHTML    = '<div class="esqueleto" style="width:80px;height:22px;border-radius:10px"></div>';
  statsEl.innerHTML    = '<div class="esqueleto" style="height:130px;border-radius:8px;margin-top:4px"></div>';
  imgEl.style.display  = 'none';
  imgEl.src            = '';
  if (phEl) phEl.style.display = 'flex';

  // Limpar slots enquanto carrega
  renderizarSlotsAtaque();
  renderizarResumoAtaques();

  try {
    const dados = await buscarPokemon(nome);
    estado.pokemonAtual = dados;
    estado.dadosPokemon = dados;

    // Extrair lista de moves disponíveis para este Pokémon
    estado.movimentosDisponiveis = dados.moves.map(m => m.move.name);

    // Selecionar automaticamente os 4 primeiros moves
    const primeiros4 = estado.movimentosDisponiveis.slice(0, 4);

    // Buscar dados dos 4 primeiros moves em paralelo
    const infoMoves = await Promise.allSettled(primeiros4.map(buscarMove));
    estado.slotsSelecionados = infoMoves.map((r, i) =>
      r.status === 'fulfilled' ? r.value : { nome: primeiros4[i], tipo: 'normal', categoria: 'status', poder: null, pp: null }
    );

    renderizarDetalhesPokemon(dados);

  } catch (e) {
    nomeEl.textContent = cap(nome) + ' (erro)';
    statsEl.innerHTML  = '<div style="color:#D84B36;font-size:12px;padding:8px">Não foi possível carregar este Pokémon.</div>';
  }
}

function renderizarDetalhesPokemon(dados) {
  const imgEl   = document.getElementById('imagem-pokemon-detalhe');
  const phEl    = document.getElementById('placeholder-imagem');
  const nomeEl  = document.getElementById('nome-pokemon-detalhe');
  const tiposEl = document.getElementById('tipos-pokemon-detalhe');

  // Imagem
  imgEl.src = artwork(dados.id);
  imgEl.alt = dados.name;
  imgEl._triedSprite = false;
  imgEl.onerror = () => {
    if (!imgEl._triedSprite) {
      imgEl._triedSprite = true;
      imgEl.src = sprite(dados.id);
    } else {
      imgEl.style.display = 'none';
      if (phEl) phEl.style.display = 'flex';
    }
  };
  imgEl.onload = () => {
    imgEl.style.display = 'block';
    if (phEl) phEl.style.display = 'none';
  };

  // Nome
  nomeEl.textContent = cap(dados.name);

  // Tipos
  const tipos = dados.types.map(t => t.type.name);
  tiposEl.innerHTML = tipos.map(t =>
    `<span class="badge-tipo ${MAPA_BADGE_TIPO[t] || ''}">${nomeTipoPt(t)}</span>`
  ).join('');

  // Stats
  renderizarEstatisticas(dados.stats);

  // Ataques
  renderizarSlotsAtaque();
  renderizarResumoAtaques();

  // Destacar cartão selecionado na grade
  document.querySelectorAll('.cartao-pokemon-escolha').forEach(el => el.classList.remove('selecionado'));
  const cartaoAtivo = [...document.querySelectorAll('.cartao-pokemon-escolha')]
    .find(el => el.querySelector('span')?.textContent.toLowerCase() === cap(dados.name).toLowerCase());
  if (cartaoAtivo) cartaoAtivo.classList.add('selecionado');
}

function renderizarEstatisticas(stats) {
  const el = document.getElementById('container-estatisticas');
  if (!el) return;

  const definicoes = [
    { chave: 'hp',              rotulo: 'HP',      classe: 'barra-hp'    },
    { chave: 'attack',          rotulo: 'Attack',  classe: 'barra-atk'   },
    { chave: 'special-attack',  rotulo: 'Sp. Atk', classe: 'barra-spatk' },
    { chave: 'defense',         rotulo: 'Defense', classe: 'barra-def'   },
    { chave: 'special-defense', rotulo: 'Sp. Def', classe: 'barra-spdef' },
    { chave: 'speed',           rotulo: 'Speed',   classe: 'barra-spd'   },
  ];

  const mapa = {};
  stats.forEach(s => { mapa[s.stat.name] = s.base_stat; });

  el.innerHTML = definicoes.map(d => {
    const valor = mapa[d.chave] || 0;
    const pct   = Math.min(100, Math.round((valor / 255) * 100));
    return `
      <div class="linha-estatistica">
        <span class="rotulo-estatistica">${d.rotulo}</span>
        <span class="numero-estatistica">${valor}</span>
        <div class="fundo-barra">
          <div class="preenchimento-barra ${d.classe}" style="width:0%" data-alvo="${pct}%"></div>
        </div>
      </div>`;
  }).join('');

  // Animar barras após render
  requestAnimationFrame(() => {
    el.querySelectorAll('.preenchimento-barra').forEach(barra => {
      barra.style.width = barra.dataset.alvo;
    });
  });
}

/* ═══════════════════════════════════════════════
   RENDERIZAÇÃO — SLOTS DE ATAQUE EDITÁVEIS
═══════════════════════════════════════════════ */

const SVG_RAIO = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round">
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
</svg>`;

function renderizarSlotsAtaque() {
  const grade = document.getElementById('grade-slots-ataque');
  if (!grade) return;

  const slots = estado.slotsSelecionados;
  const temPokemon = estado.pokemonAtual !== null;

  if (!temPokemon) {
    grade.innerHTML = `<div class="slot-ataque-vazio"><span>Selecione um Pokémon para ver seus ataques</span></div>`;
    return;
  }

  grade.innerHTML = slots.map((move, i) => {
    if (!move) {
      return `
        <button class="botao-ataque-slot" onclick="abrirModalAtaque(${i})" title="Clique para escolher um ataque">
          <div class="conteudo-ataque">
            <div class="circulo-tipo-ataque icone-normal">${SVG_RAIO}</div>
            <span style="color:#aaa;font-size:13px">— Slot vazio —</span>
            <span class="badge-porcentagem-ataque" style="opacity:0.4">?</span>
          </div>
        </button>`;
    }

    const classeIcone = MAPA_ICONE_TIPO[move.tipo] || 'icone-normal';
    const poderTexto  = move.poder ? `${move.poder} pw` : 'Status';

    return `
      <button class="botao-ataque-slot" onclick="abrirModalAtaque(${i})" title="Clique para editar este ataque">
        <div class="conteudo-ataque">
          <div class="circulo-tipo-ataque ${classeIcone}">${SVG_RAIO}</div>
          ${cap(move.nome)}
          <span class="badge-porcentagem-ataque">${poderTexto}</span>
        </div>
      </button>`;
  }).join('');
}

/* ═══════════════════════════════════════════════
   RENDERIZAÇÃO — RESUMO DOS ATAQUES (painel direito)
═══════════════════════════════════════════════ */

function renderizarResumoAtaques() {
  const lista = document.getElementById('lista-resumo-ataques');
  if (!lista) return;

  const slots = estado.slotsSelecionados;
  const temAlgum = slots.some(s => s !== null);

  if (!estado.pokemonAtual || !temAlgum) {
    lista.innerHTML = `
      <div class="estado-vazio-ataques">
        <p>Nenhum Pokémon selecionado ainda.</p>
      </div>`;
    return;
  }

  lista.innerHTML = slots.map((move, i) => {
    if (!move) {
      return `
        <div class="item-resumo-ataque" style="opacity:0.5">
          <div class="numero-slot-ataque">${i + 1}</div>
          <span class="nome-ataque-resumo" style="color:#aaa">Slot vazio</span>
        </div>`;
    }

    const classeBadge = MAPA_BADGE_TIPO[move.tipo] || 'tipo-normal';
    const ppTexto     = move.pp ? `PP: ${move.pp}` : '';
    const poderTexto  = move.poder ? `Poder: ${move.poder}` : 'Status';

    return `
      <div class="item-resumo-ataque">
        <div class="numero-slot-ataque">${i + 1}</div>
        <div style="flex:1">
          <div class="nome-ataque-resumo">${cap(move.nome)}</div>
          <div style="font-size:10.5px;color:#888;margin-top:2px">${poderTexto}${ppTexto ? ' · ' + ppTexto : ''}</div>
        </div>
        <span class="badge-tipo-ataque-resumo ${classeBadge}">${nomeTipoPt(move.tipo)}</span>
      </div>`;
  }).join('');
}

/* ═══════════════════════════════════════════════
   MODAL DE EDIÇÃO DE ATAQUE
═══════════════════════════════════════════════ */

let todosMovesCarregados = []; // cache da lista filtrada atual no modal

function abrirModalAtaque(indiceSlot) {
  if (!estado.pokemonAtual) return;

  estado.slotEmEdicao = indiceSlot;

  const modal   = document.getElementById('sobreposicao-modal');
  const titulo  = document.getElementById('titulo-modal');
  const busca   = document.getElementById('campo-busca-ataque');

  titulo.textContent = `Slot ${indiceSlot + 1} · Escolher Ataque`;
  busca.value = '';
  modal.classList.add('aberta');
  busca.focus();

  renderizarListaMovesModal(estado.movimentosDisponiveis);
  carregarTiposMovesModal();
}

function fecharModal(evento) {
  // Fechar apenas se clicar na sobreposição (fora da janela)
  if (evento && evento.target !== document.getElementById('sobreposicao-modal')) return;
  fecharModalDireto();
}

function fecharModalDireto() {
  const modal = document.getElementById('sobreposicao-modal');
  modal.classList.remove('aberta');
  estado.slotEmEdicao = null;
}

/** Renderiza a lista de moves no modal (com ou sem tipo já carregado) */
function renderizarListaMovesModal(listaMoves) {
  const lista = document.getElementById('lista-ataques-modal');
  if (!lista) return;

  todosMovesCarregados = listaMoves;

  if (!listaMoves.length) {
    lista.innerHTML = '<div style="padding:20px;text-align:center;color:#888;font-size:13px">Nenhum ataque encontrado.</div>';
    return;
  }

  lista.innerHTML = listaMoves.map(nomeMove => {
    const info        = cacheMoves[nomeMove];
    const classeIcone = info ? (MAPA_ICONE_TIPO[info.tipo] || 'icone-normal') : 'icone-normal';
    const classeBadge = info ? (MAPA_BADGE_TIPO[info.tipo] || 'tipo-normal')  : '';
    const poderTxt    = info?.poder ? `${info.poder} pw` : (info ? 'Status' : '...');
    const ppTxt       = info?.pp ? `PP ${info.pp}` : '';

    return `
      <div class="item-ataque-modal" onclick="selecionarAtaqueDoModal('${nomeMove}')" id="item-modal-${nomeMove.replace(/[^a-z0-9]/g,'-')}">
        <div class="circulo-tipo-ataque ${classeIcone}" style="width:28px;height:28px;flex-shrink:0">${SVG_RAIO}</div>
        <span class="nome-ataque-modal">${cap(nomeMove)}</span>
        ${info ? `<span class="badge-tipo-modal ${classeBadge}">${nomeTipoPt(info.tipo)}</span>` : '<span style="font-size:10px;color:#ccc">—</span>'}
        <div class="info-ataque-modal">
          <span>${poderTxt}</span>
          ${ppTxt ? `<span>${ppTxt}</span>` : ''}
        </div>
      </div>`;
  }).join('');
}

/** Carrega tipos dos moves em lotes em background e atualiza a UI */
async function carregarTiposMovesModal() {
  const lista = estado.movimentosDisponiveis;

  // Lotes de 10 para não sobrecarregar a API
  const LOTE = 10;
  for (let i = 0; i < lista.length; i += LOTE) {
    const lote = lista.slice(i, i + LOTE);
    await Promise.allSettled(lote.map(buscarMove));
    atualizarItensModalComTipo(lote);

    // Pausa entre lotes para não martelar a API
    if (i + LOTE < lista.length) {
      await new Promise(res => setTimeout(res, 120));
    }
  }
}

/** Atualiza visualmente os itens do modal cujos tipos já foram carregados */
function atualizarItensModalComTipo(nomesMove) {
  nomesMove.forEach(nomeMove => {
    const info = cacheMoves[nomeMove];
    if (!info) return;

    const idSanitizado = nomeMove.replace(/[^a-z0-9]/g, '-');
    const itemEl = document.getElementById(`item-modal-${idSanitizado}`);
    if (!itemEl) return;

    const classeIcone = MAPA_ICONE_TIPO[info.tipo] || 'icone-normal';
    const classeBadge = MAPA_BADGE_TIPO[info.tipo] || 'tipo-normal';
    const poderTxt    = info.poder ? `${info.poder} pw` : 'Status';
    const ppTxt       = info.pp    ? `PP ${info.pp}`    : '';

    itemEl.innerHTML = `
      <div class="circulo-tipo-ataque ${classeIcone}" style="width:28px;height:28px;flex-shrink:0">${SVG_RAIO}</div>
      <span class="nome-ataque-modal">${cap(nomeMove)}</span>
      <span class="badge-tipo-modal ${classeBadge}">${nomeTipoPt(info.tipo)}</span>
      <div class="info-ataque-modal">
        <span>${poderTxt}</span>
        ${ppTxt ? `<span>${ppTxt}</span>` : ''}
      </div>`;
  });
}

/** Filtra a lista do modal conforme texto digitado */
function filtrarMovesModal(q) {
  const disponíveis = estado.movimentosDisponiveis;
  const filtrados   = q ? disponíveis.filter(m => m.includes(q)) : disponíveis;
  renderizarListaMovesModal(filtrados);
}

/** Seleciona um move para o slot em edição */
async function selecionarAtaqueDoModal(nomeMove) {
  if (estado.slotEmEdicao === null) return;

  // Garantir que o tipo esteja carregado
  const info = await buscarMove(nomeMove);
  estado.slotsSelecionados[estado.slotEmEdicao] = info;

  fecharModalDireto();
  renderizarSlotsAtaque();
  renderizarResumoAtaques();
}

/* ═══════════════════════════════════════════════
   PESQUISA DE POKÉMON (campo na grade)
═══════════════════════════════════════════════ */

let timerBusca = null;

function configurarBuscaPokemon() {
  const campo = document.getElementById('campo-busca-pokemon');
  if (!campo) return;

  campo.addEventListener('input', () => {
    clearTimeout(timerBusca);
    timerBusca = setTimeout(filtrarCartoesPokemon, 250);
  });

  campo.addEventListener('keydown', e => {
    if (e.key === 'Enter') filtrarCartoesPokemon();
  });
}

/* ═══════════════════════════════════════════════
   PESQUISA NO MODAL DE ATAQUE
═══════════════════════════════════════════════ */

function configurarBuscaModal() {
  const campo = document.getElementById('campo-busca-ataque');
  if (!campo) return;

  campo.addEventListener('input', () => {
    const q = campo.value.trim().toLowerCase();
    filtrarMovesModal(q);
  });
}

/* ═══════════════════════════════════════════════
   MENU LATERAL (mobile)
═══════════════════════════════════════════════ */

function abrirMenu() {
  const aside = document.querySelector('.menu-lateral');
  if (aside) aside.style.display = 'block';
}

function fecharMenu() {
  const aside = document.querySelector('.menu-lateral');
  if (aside) aside.style.display = 'none';
}

/* ═══════════════════════════════════════════════
   INICIALIZAÇÃO
═══════════════════════════════════════════════ */

async function inicializar() {
  configurarBuscaPokemon();
  configurarBuscaModal();

  // Fechar modal com ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharModalDireto();
  });

  // Buscar lista completa de Pokémon
  const gradeEl = document.getElementById('grade-cartoes-pokemon');
  if (gradeEl) {
    gradeEl.innerHTML = '<div class="carregando-pokemon" style="grid-column:1/-1"><div class="icone-carregando"></div>Carregando lista de Pokémon...</div>';
  }

  estado.todosPokemon = await buscarTodosPokemon();
  renderizarCartoesPokemon(estado.todosPokemon);

  // Pré-carregar Amoonguss como exemplo
  if (estado.todosPokemon.length) {
    selecionarPokemon('amoonguss');
  }
}

inicializar();
