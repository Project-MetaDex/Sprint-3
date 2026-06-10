// tela de batalha
// geracoes
var listaGeracoes = [
 "Gen 1", "Gen 2", "Gen 3", "Gen 4", "Gen 5",
 "Gen 6", "Gen 7", "Gen 8", "Gen 9"
];

// grupos de jogos por gen (mapping da pokeapi)
var versoesDaGeracao = {
 0: null, // 0 = todas as gens
 1: ["red-blue", "yellow"],
 2: ["gold-silver", "crystal"],
 3: ["ruby-sapphire", "emerald", "firered-leafgreen"],
 4: ["diamond-pearl", "platinum", "heartgold-soulsilver"],
 5: ["black-white", "black-2-white-2"],
 6: ["x-y", "omega-ruby-alpha-sapphire"],
 7: ["sun-moon", "ultra-sun-ultra-moon", "lets-go-pikachu-lets-go-eevee"],
 8: ["sword-shield", "brilliant-diamond-and-shining-pearl", "legends-arceus"],
 9: ["scarlet-violet"]
};

// cor por tipo
var corDoTipo = {
 normal: "#7d7d85", fire: "#ee4d25", water: "#2079d1", electric: "#d4b000",
 grass: "#43a657", ice: "#37a9b4", fighting: "#c0392b", poison: "#8736b7",
 ground: "#c08b28", flying: "#6b4fd1", psychic: "#dc4c91", bug: "#718000",
 rock: "#9a8b31", ghost: "#533878", dragon: "#4c1fd1", dark: "#4f392c",
 steel: "#5f5f86", fairy: "#a94676"
};

// tipos em pt-br
var tipoEmPt = {
 normal: "Normal", fire: "Fogo", water: "Agua", electric: "Eletrico",
 grass: "Grama", ice: "Gelo", fighting: "Lutador", poison: "Veneno",
 ground: "Terra", flying: "Voador", psychic: "Psiquico", bug: "Inseto",
 rock: "Pedra", ghost: "Fantasma", dragon: "Dragao", dark: "Sombrio",
 steel: "Aco", fairy: "Fada"
};

// label das stats
var nomeDaStat = {
 hp: "HP", attack: "ATK", defense: "DEF",
 "special-attack": "SpAtk", "special-defense": "SpDef", speed: "VEL"
};

// limites de iv/ev
var MAX_EVS_TOTAL = 508;
var MAX_EV_POR_STAT = 252;
var PASSO_EV = 4;
var MAX_IV = 31;

// estado dos dois lados
var lados = {
 meu: {
 id: null,
 name: null,
 dados: null, // dados completos da api
 evs: {}, // EVs por stat
 ivs: {}, // IVs por stat
 slots: [null, null, null, null], // 4 slots de ataque
 modo: "ev", // tab atual: "ev" ou "iv"
 movesCarregados: false,
 moves: []
 },
 adv: {
 id: null, name: null, dados: null, evs: {}, ivs: {},
 slots: [null, null, null, null], modo: "ev",
 movesCarregados: false, moves: []
 }
};

// cache de ataques
var cacheMoves = {};

// gen ativa no filtro
var genFiltro = 0;

// simulacao salva sendo carregada via ?simId
var simSalvaPendente = null;
var simSalvaAplicada = false;

// guarda o resultado da ultima simulacao executada (para salvar no banco)
var ultimoResultado = null;
var ultimoLog = "";

// quem o modal esta editando
var slotEditandoLado = null;
var slotEditandoIdx = null;

function capitalizar(s) {
 if (!s) return "";
 return s.charAt(0).toUpperCase() + s.slice(1);
}

function urlSprite(id) {
 return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + id + ".png";
}

function urlArte(id) {
 return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + id + ".png";
}

// calculo de stat no nivel 50
function calcularStatTotal(base, ev, iv) {
 var nivel = 50;
 return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * nivel) / 100) + (nivel + 10);
}

document.addEventListener("DOMContentLoaded", iniciar);

function iniciar() {
 criarFiltroGen();

 // Listener da busca de ataques (no modal)
 document.getElementById("busca-modal").addEventListener("input", function (e) {
 filtrarListaModal(e.target.value.trim().toLowerCase());
 });

 // Se veio da lista com uma simulacao salva (?simId), carrega do banco
 var params = new URLSearchParams(window.location.search);
 var simId = params.get("simId");
 if (simId) {
 carregarSimulacaoSalva(simId);
 return;
 }

 // Le os dois pokemons escolhidos na simulacao.html
 var meu = null;
 var adv = null;
 try { meu = JSON.parse(sessionStorage.getItem("BATALHA_MEU")); } catch (e) {}
 try { adv = JSON.parse(sessionStorage.getItem("BATALHA_ADV")); } catch (e) {}

 // Se nao tem nada, tenta ler do Team Builder
 if (!meu || !adv) {
 var idx = localStorage.getItem("DUELO_SIMULAR_IDX");
 if (idx !== null) {
 try {
 var duelos = JSON.parse(localStorage.getItem("DUELOS_SALVOS") || "[]");
 var d = duelos[Number(idx)];
 if (d && d.meu && d.meu.pokemon && !meu) {
 meu = { id: d.meu.pokemon.id, name: d.meu.pokemon.name };
 }
 if (d && d.adversario && d.adversario.pokemon && !adv) {
 adv = { id: d.adversario.pokemon.id, name: d.adversario.pokemon.name };
 }
 } catch (e) {}
 }
 }

 // Se ainda falta algum, manda voltar
 if (!meu || !adv) {
 document.getElementById("corpo-meu").innerHTML =
 '<p style="text-align:center;color:#D84B36;font-size:0.85rem">Volte para selecionar os Pokemons.</p>';
 document.getElementById("corpo-adv").innerHTML = "";
 return;
 }

 iniciarBatalha(meu, adv);
}

// Inicia a batalha com dois pokemons {id, name}
function iniciarBatalha(meu, adv) {
 lados.meu.id = meu.id;
 lados.meu.name = meu.name;
 lados.adv.id = adv.id;
 lados.adv.name = adv.name;

 // Carrega os dois pokemons
 carregarPokemon("meu");
 carregarPokemon("adv");
}

// Carrega uma simulacao salva no banco e pre-preenche a tela
function carregarSimulacaoSalva(simId) {
 var idUsuario = sessionStorage.getItem("ID_USUARIO");

 if (!idUsuario) {
 document.getElementById("corpo-meu").innerHTML =
 '<p style="text-align:center;color:#D84B36;font-size:0.85rem">Faça login para abrir simulações salvas.</p>';
 document.getElementById("corpo-adv").innerHTML = "";
 return;
 }

 fetch("/simulacoes/buscarSimulacao", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ idSimulacaoServer: simId, idUsuarioServer: idUsuario })
 })
 .then(function (r) {
 if (r.status === 204) throw new Error("Simulação não encontrada.");
 if (!r.ok) throw new Error("Falha ao buscar simulação: " + r.status);
 return r.json();
 })
 .then(function (sim) {
 simSalvaPendente = {
 resultado: sim.Resultado,
 log: sim.Log,
 meuAtaques: [sim.usuarioAtaque1, sim.usuarioAtaque2, sim.usuarioAtaque3, sim.usuarioAtaque4],
 advAtaques: [sim.adversarioAtaque1, sim.adversarioAtaque2, sim.adversarioAtaque3, sim.adversarioAtaque4]
 };
 iniciarBatalha(
 { id: sim.idPokemonUsuario, name: sim.nomePokemonUsuario },
 { id: sim.idPokemonAdversario, name: sim.nomePokemonAdversario }
 );
 })
 .catch(function (erro) {
 console.error(erro);
 document.getElementById("corpo-meu").innerHTML =
 '<p style="text-align:center;color:#D84B36;font-size:0.85rem">Não foi possível abrir a simulação salva.</p>';
 document.getElementById("corpo-adv").innerHTML = "";
 });
}

function criarFiltroGen() {
 var c = document.getElementById("filtro-gen");
 var html = '<button class="aba-gen ativo" onclick="setGen(0)">Todas Gens</button>';
 for (var i = 0; i < listaGeracoes.length; i++) {
 html += '<button class="aba-gen" onclick="setGen(' + (i + 1) + ')">' + listaGeracoes[i] + '</button>';
 }
 c.innerHTML = html;
}

function setGen(g) {
 genFiltro = g;
 var botoes = document.querySelectorAll("#filtro-gen .aba-gen");
 for (var i = 0; i < botoes.length; i++) {
 if (i === g) botoes[i].classList.add("ativo");
 else botoes[i].classList.remove("ativo");
 }
 // Se o modal estiver aberto, refiltra
 if (document.getElementById("modal-ataques").classList.contains("aberta")) {
 renderListaModal();
 }
}

function carregarPokemon(lado) {
 var L = lados[lado];
 var cont = document.getElementById("corpo-" + lado);
 cont.innerHTML = '<p class="placeholder-loading">Carregando dados...</p>';

 fetch("https://pokeapi.co/api/v2/pokemon/" + L.id)
 .then(function (r) { return r.json(); })
 .then(function (dados) {
 L.dados = dados;
 L.name = dados.name;
 L.evs = { hp:0, attack:0, defense:0, "special-attack":0, "special-defense":0, speed:0 };
 L.ivs = { hp:31, attack:31, defense:31, "special-attack":31, "special-defense":31, speed:31 };
 desenharLado(lado);
 atualizarBotaoSimular();
 tentarAplicarSimSalva();
 })
 .catch(function () {
 cont.innerHTML = '<p class="placeholder-loading" style="color:#D84B36">Erro ao carregar.</p>';
 });
}

function desenharLado(lado) {
 var L = lados[lado];
 if (!L.dados) return;
 var d = L.dados;
 var cont = document.getElementById("corpo-" + lado);

 // Tipos
 var tipos = d.types.map(function (t) { return t.type.name; });
 var tiposHtml = "";
 for (var i = 0; i < tipos.length; i++) {
 tiposHtml += '<span style="background:' + (corDoTipo[tipos[i]] || "#888") + '">' + (tipoEmPt[tipos[i]] || tipos[i]) + '</span>';
 }

 // Imagem (com fallback)
 var img =
 (d.sprites.other && d.sprites.other["official-artwork"] && d.sprites.other["official-artwork"].front_default)
 || urlSprite(d.id);

 var classeEv = L.modo === "ev" ? "tab-ev-iv ativo" : "tab-ev-iv";
 var classeIv = L.modo === "iv" ? "tab-ev-iv ativo" : "tab-ev-iv";

 cont.innerHTML =
 '<div class="header-poke">' +
 '<img src="' + img + '" alt="' + d.name + '" ' +
 'onerror="this.src=\'' + urlSprite(d.id) + '\'">' +
 '<div class="header-info">' +
 '<h2>' + capitalizar(d.name) + ' <span style="color:#a98ff3;font-size:0.75rem">#' + String(d.id).padStart(3, "0") + '</span></h2>' +
 '<div class="tipos">' + tiposHtml + '</div>' +
 '</div>' +
 '</div>' +

 '<div class="tabs-ev-iv">' +
 '<button class="' + classeEv + '" onclick="setModo(\'' + lado + '\', \'ev\')">EVs</button>' +
 '<button class="' + classeIv + '" onclick="setModo(\'' + lado + '\', \'iv\')">IVs</button>' +
 '</div>' +

 '<div id="stats-' + lado + '"></div>' +

 '<div class="titulo-ataques">Ataques</div>' +
 '<div class="slots-ataque" id="slots-' + lado + '"></div>';

 desenharStats(lado);
 desenharSlots(lado);
}

function setModo(lado, modo) {
 lados[lado].modo = modo;
 desenharLado(lado);
}

function desenharStats(lado) {
 var L = lados[lado];
 var cont = document.getElementById("stats-" + lado);
 if (!cont || !L.dados) return;

 var html = "";
 for (var i = 0; i < L.dados.stats.length; i++) {
 var s = L.dados.stats[i];
 var stat = s.stat.name;
 var base = s.base_stat;
 var ev = L.evs[stat] || 0;
 var iv = L.ivs[stat] !== undefined ? L.ivs[stat] : 31;
 var total = calcularStatTotal(base, ev, iv);
 var pct = Math.min(100, Math.round((base / 255) * 100));
 var valor = L.modo === "ev" ? ev : iv;
 var passo = L.modo === "ev" ? PASSO_EV : 1;
 var tipoStat = L.modo === "ev" ? "EV" : "IV";

 html +=
 '<div class="linha-stat">' +
 '<span class="stat-label">' + (nomeDaStat[stat] || stat) + '</span>' +
 '<span class="stat-total">' + total + '</span>' +
 '<div class="stat-bar-bg"><div class="stat-bar-fill" style="width:' + pct + '%"></div></div>' +
 '<div class="controles-ev" title="' + tipoStat + '">' +
 '<button class="btn-ev" onclick="ajustarStat(\'' + lado + '\', \'' + stat + '\', -' + passo + ')">-</button>' +
 '<span class="ev-val">' + valor + '</span>' +
 '<button class="btn-ev" onclick="ajustarStat(\'' + lado + '\', \'' + stat + '\', ' + passo + ')">+</button>' +
 '</div>' +
 '</div>';
 }

 // Rodape com total de EVs gastos
 if (L.modo === "ev") {
 var total = 0;
 for (var k in L.evs) { total += L.evs[k]; }
 var restantes = MAX_EVS_TOTAL - total;
 var classeRodape = restantes < 0 ? "ev-total-rodape estouro" : "ev-total-rodape";
 html += '<div class="' + classeRodape + '">' +
 '<span>EVs: ' + total + '/' + MAX_EVS_TOTAL + '</span>' +
 '<span>Restantes: <b>' + restantes + '</b></span>' +
 '</div>';
 }

 cont.innerHTML = html;
}

function ajustarStat(lado, stat, delta) {
 var L = lados[lado];

 if (L.modo === "ev") {
 var atual = L.evs[stat] || 0;
 var total = 0;
 for (var k in L.evs) { total += L.evs[k]; }
 var novo = atual + delta;
 if (novo < 0 || novo > MAX_EV_POR_STAT) return;
 if (delta > 0 && total + delta > MAX_EVS_TOTAL) return;
 L.evs[stat] = novo;
 } else {
 var atualIv = L.ivs[stat] !== undefined ? L.ivs[stat] : 31;
 var novoIv = atualIv + delta;
 if (novoIv < 0 || novoIv > MAX_IV) return;
 L.ivs[stat] = novoIv;
 }
 desenharStats(lado);
}

function desenharSlots(lado) {
 var L = lados[lado];
 var cont = document.getElementById("slots-" + lado);
 if (!cont) return;

 var html = "";
 for (var i = 0; i < L.slots.length; i++) {
 var mv = L.slots[i];
 if (!mv) {
 html += '<div class="slot-mv" onclick="abrirModal(\'' + lado + '\', ' + i + ')">+ Slot ' + (i + 1) + '</div>';
 } else {
 var cor = corDoTipo[mv.type.name] || "#888";
 var nomeMv = capitalizar(mv.name.replace(/-/g, " "));
 html += '<div class="slot-mv preenchido" onclick="abrirModal(\'' + lado + '\', ' + i + ')" style="border-color:' + cor + '">' + nomeMv + '</div>';
 }
 }
 cont.innerHTML = html;
}

function abrirModal(lado, slotIdx) {
 slotEditandoLado = lado;
 slotEditandoIdx = slotIdx;
 document.getElementById("titulo-modal").textContent =
 capitalizar(lados[lado].name) + " - Slot " + (slotIdx + 1);
 document.getElementById("busca-modal").value = "";
 document.getElementById("modal-ataques").classList.add("aberta");
 renderListaModal();

 // Carrega os ataques desse lado, se ainda nao carregou
 if (!lados[lado].movesCarregados) {
 lados[lado].movesCarregados = true;
 carregarMoves(lado);
 }
}

function fecharModal() {
 document.getElementById("modal-ataques").classList.remove("aberta");
 slotEditandoLado = null;
 slotEditandoIdx = null;
}

// carrega ataques em lotes
function carregarMoves(lado) {
 var L = lados[lado];
 if (!L.dados) return;
 var refs = L.dados.moves;
 var LOTE = 20;
 var indice = 0;
 L.moves = [];

 function proximoLote() {
 if (indice >= refs.length) return;
 var fim = Math.min(indice + LOTE, refs.length);
 var pedidos = [];
 var ehDessaTurma = refs.slice(indice, fim);

 for (var i = 0; i < ehDessaTurma.length; i++) {
 var nome = ehDessaTurma[i].move.name;
 var url = ehDessaTurma[i].move.url;
 pedidos.push(buscarMove(nome, url, ehDessaTurma[i]));
 }

 Promise.all(pedidos).then(function (detalhes) {
 for (var j = 0; j < detalhes.length; j++) {
 if (detalhes[j]) L.moves.push(detalhes[j]);
 }
 // Atualiza a lista no modal, se for esse lado
 if (slotEditandoLado === lado) renderListaModal();
 indice = fim;
 proximoLote();
 });
 }

 proximoLote();
}

function buscarMove(nome, url, refOriginal) {
 if (cacheMoves[nome]) {
 var copia = cacheMoves[nome];
 copia._ref = refOriginal;
 return Promise.resolve(copia);
 }
 return fetch(url || "https://pokeapi.co/api/v2/move/" + nome)
 .then(function (r) { return r.ok ? r.json() : null; })
 .then(function (d) {
 if (!d) return null;
 d._ref = refOriginal;
 cacheMoves[nome] = d;
 return d;
 })
 .catch(function () { return null; });
}

function renderListaModal() {
 if (!slotEditandoLado) return;
 var L = lados[slotEditandoLado];
 var lista = document.getElementById("lista-modal");
 if (!L.moves || L.moves.length === 0) {
 lista.innerHTML = '<div class="placeholder-loading">Carregando ataques...</div>';
 return;
 }
 filtrarListaModal(document.getElementById("busca-modal").value.trim().toLowerCase());
}

function filtrarListaModal(termo) {
 if (!slotEditandoLado) return;
 var L = lados[slotEditandoLado];
 var lista = document.getElementById("lista-modal");
 if (!L.moves) return;

 // Filtra por geracao (Gen 1 a 9), usando os version_groups da PokeAPI
 var versoes = versoesDaGeracao[genFiltro];
 var arr = L.moves;

 if (versoes) {
 arr = arr.filter(function (m) {
 if (!m._ref || !m._ref.version_group_details) return false;
 return m._ref.version_group_details.some(function (v) {
 return versoes.indexOf(v.version_group.name) !== -1;
 });
 });
 }

 // Filtra por nome digitado
 if (termo) {
 arr = arr.filter(function (m) {
 return m.name.indexOf(termo) !== -1;
 });
 }

 // Ordena por poder
 arr = arr.sort(function (a, b) { return (b.power || 0) - (a.power || 0); }).slice(0, 60);

 if (!arr.length) {
 lista.innerHTML = '<div class="placeholder-loading">Nenhum ataque encontrado.</div>';
 return;
 }

 var html = "";
 for (var i = 0; i < arr.length; i++) {
 var m = arr[i];
 var tipoMv = m.type ? m.type.name : "normal";
 var cor = corDoTipo[tipoMv] || "#888";
 var nomeMv = capitalizar(m.name.replace(/-/g, " "));
 var poder = m.power ? (m.power + " pw") : "Status";
 html +=
 '<div class="item-move-modal" onclick="escolherAtaque(\'' + m.name + '\')">' +
 '<span class="nome">' + nomeMv + '</span>' +
 '<span class="tipo" style="background:' + cor + '">' + (tipoEmPt[tipoMv] || tipoMv) + '</span>' +
 '<span class="pwr">' + poder + '</span>' +
 '</div>';
 }
 lista.innerHTML = html;
}

function escolherAtaque(nome) {
 var L = lados[slotEditandoLado];
 var mv = null;
 for (var i = 0; i < L.moves.length; i++) {
 if (L.moves[i].name === nome) { mv = L.moves[i]; break; }
 }
 if (!mv) return;
 L.slots[slotEditandoIdx] = mv;
 desenharSlots(slotEditandoLado);
 fecharModal();
 atualizarBotaoSimular();
}

function atualizarBotaoSimular() {
 var btn = document.getElementById("btn-simular");
 btn.disabled = !(lados.meu.dados && lados.adv.dados);
}

// vantagens de tipo
var vantagens = {
 fire: { grass:2, ice:2, bug:2, steel:2, water:.5, rock:.5, fire:.5, dragon:.5 },
 water: { fire:2, ground:2, rock:2, grass:.5, water:.5, dragon:.5 },
 grass: { water:2, ground:2, rock:2, fire:.5, grass:.5, poison:.5, flying:.5, bug:.5, dragon:.5, steel:.5 },
 electric:{ water:2, flying:2, grass:.5, electric:.5, dragon:.5, ground:0 },
 ice: { grass:2, ground:2, flying:2, dragon:2, fire:.5, water:.5, ice:.5, steel:.5 },
 fighting:{ normal:2, ice:2, rock:2, dark:2, steel:2, poison:.5, bug:.5, psychic:.5, flying:.5, fairy:.5, ghost:0 },
 poison: { grass:2, fairy:2, poison:.5, ground:.5, rock:.5, ghost:.5, steel:0 },
 ground: { fire:2, electric:2, poison:2, rock:2, steel:2, grass:.5, bug:.5, flying:0 },
 flying: { grass:2, fighting:2, bug:2, electric:.5, rock:.5, steel:.5 },
 psychic: { fighting:2, poison:2, psychic:.5, steel:.5, dark:0 },
 bug: { grass:2, psychic:2, dark:2, fire:.5, fighting:.5, poison:.5, flying:.5, ghost:.5, steel:.5, fairy:.5 },
 rock: { fire:2, ice:2, flying:2, bug:2, fighting:.5, ground:.5, steel:.5 },
 ghost: { psychic:2, ghost:2, dark:.5, normal:0 },
 dragon: { dragon:2, steel:.5, fairy:0 },
 dark: { psychic:2, ghost:2, fighting:.5, dark:.5, fairy:.5 },
 steel: { ice:2, rock:2, fairy:2, fire:.5, water:.5, electric:.5, steel:.5 },
 fairy: { fighting:2, dragon:2, dark:2, fire:.5, poison:.5, steel:.5 },
 normal: { rock:.5, steel:.5, ghost:0 }
};

function calcularVantagem(tiposAtacante, tiposDefensor) {
 var mult = 1;
 for (var i = 0; i < tiposAtacante.length; i++) {
 for (var j = 0; j < tiposDefensor.length; j++) {
 var v = vantagens[tiposAtacante[i]];
 if (v && v[tiposDefensor[j]] !== undefined) {
 mult = mult * v[tiposDefensor[j]];
 }
 }
 }
 if (mult === 0) return 0.1;
 if (mult > 2) return 2;
 if (mult < 0.5) return 0.5;
 return mult;
}

function totalCalculado(lado) {
 var L = lados[lado];
 var soma = 0;
 for (var i = 0; i < L.dados.stats.length; i++) {
 var s = L.dados.stats[i];
 var ev = L.evs[s.stat.name] || 0;
 var iv = L.ivs[s.stat.name] !== undefined ? L.ivs[s.stat.name] : 31;
 soma += calcularStatTotal(s.base_stat, ev, iv);
 }
 return soma;
}

function bonusDosAtaques(lado) {
 var L = lados[lado];
 var soma = 0;
 for (var i = 0; i < L.slots.length; i++) {
 if (L.slots[i]) soma += (L.slots[i].power || 30);
 }
 return soma;
}

function simular() {
 if (!lados.meu.dados || !lados.adv.dados) return;

 var tM = lados.meu.dados.types.map(function (t) { return t.type.name; });
 var tA = lados.adv.dados.types.map(function (t) { return t.type.name; });
 var vM = calcularVantagem(tM, tA);
 var vA = calcularVantagem(tA, tM);

 var sM = totalCalculado("meu") * vM + bonusDosAtaques("meu") + Math.random() * 50;
 var sA = totalCalculado("adv") * vA + bonusDosAtaques("adv") + Math.random() * 50;

 var empate = Math.abs(sM - sA) < 25;
 var meuVenceu = sM >= sA;
 var venc = empate ? null : (meuVenceu ? lados.meu : lados.adv);

 var res = document.getElementById("resultado");
 var html = "";

 if (empate) {
 html =
 '<div class="resultado-titulo">Empate tecnico</div>' +
 '<p class="resultado-detalhe">' +
 capitalizar(lados.meu.name) + ' e ' + capitalizar(lados.adv.name) + ' ficaram muito equilibrados.<br>' +
 'Tente ajustar EVs, IVs ou ataques.' +
 '</p>';
 } else {
 var perd = meuVenceu ? lados.adv : lados.meu;
 var imgV =
 (venc.dados.sprites.other && venc.dados.sprites.other["official-artwork"] && venc.dados.sprites.other["official-artwork"].front_default)
 || urlSprite(venc.dados.id);
 html =
 '<div class="resultado-titulo">' + capitalizar(venc.name) + ' venceu!</div>' +
 '<img src="' + imgV + '" alt="' + venc.name + '" class="vencedor-img" ' +
 'onerror="this.src=\'' + urlSprite(venc.dados.id) + '\'">' +
 '<p class="resultado-detalhe">' +
 '<b>' + capitalizar(venc.name) + '</b> derrotou <b>' + capitalizar(perd.name) + '</b><br>' +
 'Total calculado - ' + capitalizar(lados.meu.name) + ': ' + Math.round(sM) + ' | ' + capitalizar(lados.adv.name) + ': ' + Math.round(sA) + '<br>' +
 'Vantagem de tipo - ' + capitalizar(lados.meu.name) + ' x' + vM.toFixed(1) + ' | ' + capitalizar(lados.adv.name) + ' x' + vA.toFixed(1) +
 '</p>';
 }

 // Resultado pela perspectiva do usuario (meu pokemon)
 ultimoResultado = empate ? "empate" : (meuVenceu ? "vitoria" : "derrota");
 ultimoLog =
 "Total calculado - " + capitalizar(lados.meu.name) + ": " + Math.round(sM) +
 " | " + capitalizar(lados.adv.name) + ": " + Math.round(sA) +
 ". Vantagem de tipo - " + capitalizar(lados.meu.name) + " x" + vM.toFixed(1) +
 " | " + capitalizar(lados.adv.name) + " x" + vA.toFixed(1) + ".";

 html += '<button class="btn-simular" style="margin-top:14px" onclick="salvarSimulacaoNoBanco()">Salvar simulação</button>';

 res.innerHTML = html;
 res.classList.add("visivel");
 res.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Aplica os ataques de uma simulacao salva, assim que os dois pokemons carregam
function tentarAplicarSimSalva() {
 if (!simSalvaPendente || simSalvaAplicada) return;
 if (!lados.meu.dados || !lados.adv.dados) return;
 simSalvaAplicada = true;

 aplicarAtaquesSalvos("meu", simSalvaPendente.meuAtaques);
 aplicarAtaquesSalvos("adv", simSalvaPendente.advAtaques);
 mostrarResultadoSalvo(simSalvaPendente);
}

function aplicarAtaquesSalvos(lado, ataques) {
 if (!ataques) return;
 for (var i = 0; i < ataques.length; i++) {
 (function (idx, nome) {
 if (!nome) return;
 var slug = String(nome).toLowerCase().replace(/\s+/g, "-");
 buscarMove(slug, null, null).then(function (mv) {
 if (mv) {
 lados[lado].slots[idx] = mv;
 desenharSlots(lado);
 }
 });
 })(i, ataques[i]);
 }
}

function mostrarResultadoSalvo(sim) {
 var res = document.getElementById("resultado");
 if (!res) return;

 var rotulo = "Resultado salvo";
 if (sim.resultado === "vitoria") rotulo = capitalizar(lados.meu.name) + " venceu!";
 else if (sim.resultado === "derrota") rotulo = capitalizar(lados.adv.name) + " venceu!";
 else if (sim.resultado === "empate") rotulo = "Empate tecnico";

 var html = '<div class="resultado-titulo">' + rotulo + '</div>';
 if (sim.log) html += '<p class="resultado-detalhe">' + sim.log + '</p>';

 res.innerHTML = html;
 res.classList.add("visivel");
}

// Monta o objeto de um lado no formato esperado pelo backend
function montarLadoParaBanco(lado) {
 var L = lados[lado];
 var statValor = {};
 for (var i = 0; i < L.dados.stats.length; i++) {
 var s = L.dados.stats[i];
 var ev = L.evs[s.stat.name] || 0;
 var iv = L.ivs[s.stat.name] !== undefined ? L.ivs[s.stat.name] : 31;
 statValor[s.stat.name] = calcularStatTotal(s.base_stat, ev, iv);
 }

 return {
 idPokemon: L.dados.id,
 nome: L.name,
 Ataque1: L.slots[0] ? L.slots[0].name : "",
 Ataque2: L.slots[1] ? L.slots[1].name : "",
 Ataque3: L.slots[2] ? L.slots[2].name : "",
 Ataque4: L.slots[3] ? L.slots[3].name : "",
 HP: statValor["hp"] || 0,
 Attack: statValor["attack"] || 0,
 Defense: statValor["defense"] || 0,
 SpAtk: statValor["special-attack"] || 0,
 SpDef: statValor["special-defense"] || 0,
 Speed: statValor["speed"] || 0
 };
}

function salvarSimulacaoNoBanco() {
 var idUsuario = sessionStorage.getItem("ID_USUARIO");

 if (!idUsuario) {
 alert("Faça login para salvar a simulação.");
 return;
 }

 if (!lados.meu.dados || !lados.adv.dados || !ultimoResultado) {
 alert("Execute a simulação antes de salvar.");
 return;
 }

 var payload = {
 idUsuarioServer: idUsuario,
 resultadoServer: ultimoResultado,
 logServer: ultimoLog,
 usuarioServer: montarLadoParaBanco("meu"),
 adversarioServer: montarLadoParaBanco("adv")
 };

 fetch("/simulacoes/salvarSimulacao", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(payload)
 })
 .then(function (r) {
 if (!r.ok) throw new Error("Falha ao salvar: " + r.status);
 return r.json();
 })
 .then(function () {
 alert("Simulação salva com sucesso!");
 window.location.href = "selecionar-simulacao.html";
 })
 .catch(function (erro) {
 console.error(erro);
 alert("Não foi possível salvar a simulação.");
 });
}

function abrirMenu() { document.querySelector(".menu-lateral").style.display = "block"; }
function fecharMenu() { document.querySelector(".menu-lateral").style.display = "none"; }
