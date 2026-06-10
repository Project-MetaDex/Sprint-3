// pokedex02 - detalhes do pokemon

// id do pokemon
var params = new URLSearchParams(window.location.search);
var vindoDoRanking = sessionStorage.getItem("RANKING_POKEMON_NAME");
var pokemonParam = params.get("id") || params.get("name") || vindoDoRanking || "1";

if (vindoDoRanking) {
 sessionStorage.removeItem("RANKING_POKEMON_NAME");
}

// tipos em pt-br
var tipoPt = {
 normal: "Normal", fire: "Fogo", water: "Agua", electric: "Eletrico",
 grass: "Grama", ice: "Gelo", fighting: "Lutador", poison: "Veneno",
 ground: "Terra", flying: "Voador", psychic: "Psiquico", bug: "Inseto",
 rock: "Pedra", ghost: "Fantasma", dragon: "Dragao", dark: "Sombrio",
 steel: "Aco", fairy: "Fada"
};

// stats em pt-br
var statLabel = {
 hp: "HP",
 attack: "Ataque",
 defense: "Defesa",
 "special-attack": "Ataque Esp.",
 "special-defense": "Defesa Esp.",
 speed: "Velocidade"
};

function formatId(id) {
 return "#" + String(id).padStart(3, "0");
}

function capitalize(s) {
 if (!s) return "";
 return s.charAt(0).toUpperCase() + s.slice(1);
}

function carregarPokemon() {
 var urlPoke = "https://pokeapi.co/api/v2/pokemon/" + pokemonParam;
 var urlSpec = "https://pokeapi.co/api/v2/pokemon-species/" + pokemonParam;

 Promise.all([
 fetch(urlPoke).then(function (r) { return r.json(); }),
 fetch(urlSpec).then(function (r) { return r.json(); })
 ])
 .then(function (resultados) {
 var poke = resultados[0];
 var spec = resultados[1];

 // Busca a cadeia de evolucao
 fetch(spec.evolution_chain.url)
 .then(function (r) { return r.json(); })
 .then(function (evoData) {
 var nomesEvo = pegarNomesEvolucao(evoData.chain);
 var pedidos = nomesEvo.map(function (nome) {
 return fetch("https://pokeapi.co/api/v2/pokemon/" + nome).then(function (r) { return r.json(); });
 });
 Promise.all(pedidos)
 .then(function (evoDetails) {
 buscarFraquezas(poke, function (fraquezas) {
 buscarDescricao(spec, function (descricao) {
 buscarAtaques(poke, function (ataques, tms) {
 desenharPagina(poke, spec, evoDetails, fraquezas, descricao, ataques, tms);
 });
 });
 });
 });
 })
 .catch(function () {
 // se nao tiver evolucao, segue sem ela
 buscarFraquezas(poke, function (fraquezas) {
 buscarDescricao(spec, function (descricao) {
 buscarAtaques(poke, function (ataques, tms) {
 desenharPagina(poke, spec, [], fraquezas, descricao, ataques, tms);
 });
 });
 });
 });
 })
 .catch(function () {
 document.getElementById("main-content").innerHTML =
 '<div style="display:flex;align-items:center;justify-content:center;min-height:60vh;color:#7760AE;font-size:1rem;font-weight:600;">' +
 'Erro ao carregar Pokemon. ' +
 '<a href="pokedex.html" style="color:#D84B36;margin-left:8px;">Voltar</a>' +
 '</div>';
 });
}

// le a chain (recursivo)
function pegarNomesEvolucao(chain) {
 var nomes = [];
 var atual = chain;
 while (atual) {
 nomes.push(atual.species.name);
 atual = atual.evolves_to[0] || null;
 }
 return nomes;
}

// fraquezas pelos tipos
function buscarFraquezas(poke, callback) {
 var pedidos = poke.types.map(function (t) {
 return fetch(t.type.url).then(function (r) { return r.json(); });
 });
 Promise.all(pedidos)
 .then(function (tipos) {
 var resultado = [];
 for (var i = 0; i < tipos.length; i++) {
 var fracosContra = tipos[i].damage_relations.double_damage_from;
 for (var j = 0; j < fracosContra.length; j++) {
 if (resultado.indexOf(fracosContra[j].name) === -1) {
 resultado.push(fracosContra[j].name);
 }
 }
 }
 callback(resultado);
 })
 .catch(function () { callback([]); });
}

// descricao em pt-br
function buscarDescricao(spec, callback) {
 var ptBr = null;
 var en = null;
 for (var i = 0; i < spec.flavor_text_entries.length; i++) {
 var entry = spec.flavor_text_entries[i];
 if (entry.language.name === "pt-br" && !ptBr) ptBr = entry;
 if (entry.language.name === "en" && !en) en = entry;
 }

 // Tem em portugues direto da PokeAPI? Usa.
 if (ptBr) {
 var t = ptBr.flavor_text.replace(/\f/g, " ").replace(/\n/g, " ");
 callback(t);
 return;
 }

 // Nao tem? Pega o ingles e traduz com o Google
 if (!en) {
 callback("Sem descricao disponivel.");
 return;
 }

 var textoEn = en.flavor_text.replace(/\f/g, " ").replace(/\n/g, " ");
 var urlTrad = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=" + encodeURIComponent(textoEn);

 fetch(urlTrad)
 .then(function (r) { return r.json(); })
 .then(function (dados) {
 // A resposta vem em arrays aninhados. O texto traduzido fica em dados[0][0][0]
 var traducao = "";
 if (dados && dados[0]) {
 for (var k = 0; k < dados[0].length; k++) {
 if (dados[0][k] && dados[0][k][0]) traducao += dados[0][k][0];
 }
 }
 callback(traducao || textoEn);
 })
 .catch(function () {
 // Se a traducao falhar, usa o ingles mesmo
 callback(textoEn);
 });
}

// ataques e tms
function buscarAtaques(poke, callback) {
 // Todos os movimentos aprendidos por level-up
 var movesLvl = poke.moves.filter(function (m) {
 return m.version_group_details.some(function (v) {
 return v.move_learn_method.name === "level-up";
 });
 });

 // Todos os TMs
 var movesTm = poke.moves.filter(function (m) {
 return m.version_group_details.some(function (v) {
 return v.move_learn_method.name === "machine";
 });
 });

 var pedidosLvl = movesLvl.map(function (m) {
 return fetch(m.move.url).then(function (r) { return r.json(); }).catch(function () { return null; });
 });
 var pedidosTm = movesTm.map(function (m) {
 return fetch(m.move.url).then(function (r) { return r.json(); }).catch(function () { return null; });
 });

 Promise.all(pedidosLvl).then(function (atks) {
 Promise.all(pedidosTm).then(function (tms) {
 callback(atks.filter(Boolean), tms.filter(Boolean));
 });
 });
}

function desenharPagina(poke, spec, evoDetails, fraquezas, descricao, ataques, tms) {
 var tipos = poke.types.map(function (t) { return t.type.name; });
 var imgPrincipal =
 (poke.sprites.other && poke.sprites.other["official-artwork"] && poke.sprites.other["official-artwork"].front_default)
 || poke.sprites.front_default;

 var habilidades = poke.abilities;
 var habilidadeOculta = null;
 var habilidadesNormais = [];
 for (var i = 0; i < habilidades.length; i++) {
 if (habilidades[i].is_hidden) habilidadeOculta = habilidades[i];
 else habilidadesNormais.push(habilidades[i]);
 }

 // Categoria (genus) - pt-BR ou en
 var genusPt = "-";
 if (spec.genera) {
 for (var g = 0; g < spec.genera.length; g++) {
 if (spec.genera[g].language.name === "pt-br") { genusPt = spec.genera[g].genus; break; }
 }
 if (genusPt === "-") {
 for (var h = 0; h < spec.genera.length; h++) {
 if (spec.genera[h].language.name === "en") { genusPt = spec.genera[h].genus; break; }
 }
 }
 }

 // Status base
 var statsHtml = "";
 for (var s = 0; s < poke.stats.length; s++) {
 var st = poke.stats[s];
 var pct = Math.min((st.base_stat / 255) * 100, 100).toFixed(1);
 statsHtml +=
 '<div class="linha-status">' +
 '<p>' + (statLabel[st.stat.name] || st.stat.name) + '</p>' +
 '<div class="barra-status"><div style="width:' + pct + '%"></div></div>' +
 '<span>' + st.base_stat + '</span>' +
 '</div>';
 }

 // Tipos (badges)
 var tiposHtml = "";
 for (var t = 0; t < tipos.length; t++) {
 var nomeTipo = (tipoPt[tipos[t]] || tipos[t]).toUpperCase();
 tiposHtml += '<span class="tipo-badge ' + tipos[t] + '">' + nomeTipo + '</span>';
 }

 // Fraquezas
 var fraqHtml = "";
 for (var f = 0; f < fraquezas.length; f++) {
 var nomeFraq = (tipoPt[fraquezas[f]] || fraquezas[f]).toUpperCase();
 fraqHtml += '<span class="fraqueza ' + fraquezas[f] + '">' + nomeFraq + '</span>';
 }
 if (!fraqHtml) {
 fraqHtml = '<span style="color:#aaa;font-size:.85rem">Nenhuma fraqueza conhecida.</span>';
 }

 // Linha evolutiva
 var evoHtml = "";
 if (evoDetails.length > 0) {
 for (var e = 0; e < evoDetails.length; e++) {
 var ep = evoDetails[e];
 if (e > 0) evoHtml += '<span class="seta-evolucao">&gt;</span>';
 var imgEvo = (ep.sprites.other && ep.sprites.other["official-artwork"] && ep.sprites.other["official-artwork"].front_default)
 || ep.sprites.front_default;
 evoHtml +=
 '<div class="card-evolucao" onclick="window.location.href=\'pokedex02.html?id=' + ep.id + '\'">' +
 '<img src="' + imgEvo + '" alt="' + ep.name + '">' +
 '<div>' +
 '<strong>' + capitalize(ep.name) + '</strong>' +
 '<span>' + formatId(ep.id) + '</span>' +
 '</div>' +
 '</div>';
 }
 }

 // Lista de ataques (level-up) - li simples
 var ataquesHtml = "";
 if (ataques.length > 0) {
 for (var a = 0; a < ataques.length; a++) {
 var mv = ataques[a];
 var nomeMv = capitalize(mv.name.replace(/-/g, " "));
 var tipoMv = mv.type.name;
 var tipoTxt = (tipoPt[tipoMv] || tipoMv);
 var poder = mv.power ? (" - " + mv.power + " pw") : "";
 ataquesHtml += '<li>' + nomeMv + ' (' + tipoTxt + ')' + poder + '</li>';
 }
 } else {
 ataquesHtml = '<li>Nenhum ataque disponivel.</li>';
 }

 // Lista de TMs - li simples
 var tmsHtml = "";
 if (tms.length > 0) {
 for (var m = 0; m < tms.length; m++) {
 var tm = tms[m];
 var nomeTm = capitalize(tm.name.replace(/-/g, " "));
 var tipoTm = tm.type.name;
 var tipoTmTxt = (tipoPt[tipoTm] || tipoTm);
 tmsHtml += '<li>' + nomeTm + ' (' + tipoTmTxt + ')</li>';
 }
 } else {
 tmsHtml = '<li>Nenhuma TM disponivel.</li>';
 }

 // Genero
 var generoTxt = "";
 if (spec.gender_rate < 0) {
 generoTxt = "Sem genero";
 } else {
 var macho = Math.round((8 - spec.gender_rate) / 8 * 100);
 var femea = Math.round(spec.gender_rate / 8 * 100);
 generoTxt = macho + "% Macho, " + femea + "% Femea";
 }

 // Botao voltar - se veio do ranking, volta pro ranking
 var voltarLabel = document.referrer.indexOf("ranking") !== -1
 ? "&lt; Voltar para o Ranking"
 : "&lt; Voltar para a Pokedex";

 // Habilidade normal/oculta - texto
 var habNormalHtml = "";
 if (habilidadesNormais[0]) {
 habNormalHtml =
 '<div class="item-dado"><span class="icone-dado icone-habilidade"></span>' +
 '<p><strong>Habilidade</strong>' + capitalize(habilidadesNormais[0].ability.name.replace(/-/g, " ")) + '</p></div>';
 }
 var habOcultaHtml = "";
 if (habilidadeOculta) {
 habOcultaHtml =
 '<div class="item-dado"><span class="icone-dado icone-oculta"></span>' +
 '<p><strong>Habilidade Oculta</strong>' + capitalize(habilidadeOculta.ability.name.replace(/-/g, " ")) + '</p></div>';
 }

 // Monta o HTML final
 document.getElementById("main-content").innerHTML =
 '<button class="botao-voltar" onclick="window.history.back()">' + voltarLabel + '</button>' +

 '<section class="area-principal">' +
 '<div class="card-imagem-pokemon">' +
 '<img src="' + imgPrincipal + '" alt="' + poke.name + '">' +
 '</div>' +

 '<div class="card-status">' +
 '<div class="titulo-pokemon">' +
 '<h1>' + capitalize(poke.name) + '</h1>' +
 '<span>' + formatId(poke.id) + '</span>' +
 '</div>' +
 '<div class="tipos-pokemon">' + tiposHtml + '</div>' +
 '<hr>' +
 '<h3>Status base</h3>' +
 statsHtml +
 '</div>' +

 '<div class="card-dados-gerais">' +
 '<h2>Dados Gerais</h2>' +
 '<div class="item-dado"><span class="icone-dado icone-categoria"></span><p><strong>Categoria</strong>' + genusPt + '</p></div>' +
 '<div class="item-dado"><span class="icone-dado icone-altura"></span><p><strong>Altura</strong>' + (poke.height / 10).toFixed(1) + ' m</p></div>' +
 '<div class="item-dado"><span class="icone-dado icone-peso"></span><p><strong>Peso</strong>' + (poke.weight / 10).toFixed(1) + ' kg</p></div>' +
 habNormalHtml +
 habOcultaHtml +
 '<div class="item-dado"><span class="icone-dado icone-genero"></span><p><strong>Genero</strong>' + generoTxt + '</p></div>' +
 '</div>' +
 '</section>' +

 '<section class="area-informacoes">' +
 '<div class="card-descricao">' +
 '<h2>Descricao</h2>' +
 '<p>' + (descricao || "Sem descricao disponivel.") + '</p>' +
 '</div>' +
 '<div class="card-fraquezas">' +
 '<h2>Fraquezas</h2>' +
 '<div class="lista-fraquezas">' + fraqHtml + '</div>' +
 '</div>' +
 '</section>' +

 (evoHtml ?
 '<section class="area-evolucao">' +
 '<h2>Linha evolutiva</h2>' +
 '<div class="lista-evolucao">' + evoHtml + '</div>' +
 '</section>' : ''
 ) +

 '<section class="area-listas">' +
 '<div class="card-lista">' +
 '<h2>Lista de Ataques</h2>' +
 '<ul class="lista-scroll">' + ataquesHtml + '</ul>' +
 '</div>' +
 '<div class="card-lista">' +
 '<h2>Lista de TMs</h2>' +
 '<ul class="lista-scroll">' + tmsHtml + '</ul>' +
 '</div>' +
 '</section>';
}

// init
document.addEventListener("DOMContentLoaded", carregarPokemon);
