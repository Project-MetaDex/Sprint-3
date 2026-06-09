// pokedex

// geracoes
var geracoes = [
 { rotulo: "Gen I", inicio: 1, fim: 151 },
 { rotulo: "Gen II", inicio: 152, fim: 251 },
 { rotulo: "Gen III", inicio: 252, fim: 386 },
 { rotulo: "Gen IV", inicio: 387, fim: 493 },
 { rotulo: "Gen V", inicio: 494, fim: 649 },
 { rotulo: "Gen VI", inicio: 650, fim: 721 },
 { rotulo: "Gen VII", inicio: 722, fim: 809 },
 { rotulo: "Gen VIII", inicio: 810, fim: 905 },
 { rotulo: "Gen IX", inicio: 906, fim: 1025 }
];

// cache
var cache = {};

// lista atual
var pokemonList = [];

// aba ativa
var abaAtual = 0;

function getContainerCard() {
 return document.querySelector(".containerCard");
}

// sprite url
function urlSprite(id) {
 return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + id + ".png";
}

function capitalize(texto) {
 if (!texto) return "";
 return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatarId(id) {
 return "#" + String(id).padStart(3, "0");
}

function SelecionarAba(aba) {
 abaAtual = aba;

 // Tira marcacao da aba antiga
 var abaAntiga = document.querySelector(".selectedAba");
 if (abaAntiga) abaAntiga.classList.remove("selectedAba");

 // Marca a aba nova
 var abaNova = document.querySelector("#aba" + aba);
 if (abaNova) abaNova.classList.add("selectedAba");

 // Tira selecao de filtro de tipo, se houver
 var filtroAtivo = document.querySelector(".filterSelected");
 if (filtroAtivo) filtroAtivo.classList.remove("filterSelected");

 var gen = geracoes[aba];
 GetPokemonList(gen.inicio, gen.fim);
}

function GetPokemonList(inicio, fim) {
 var chave = "gen_" + inicio + "_" + fim;
 var container = getContainerCard();

 // Ja carregou antes? usa do cache
 if (cache[chave]) {
 pokemonList = cache[chave];
 ConstruirCardList();
 return;
 }

 container.innerHTML =
 '<div class="loading-msg">' +
 '<div class="loading-spinner"></div>' +
 'Carregando Pokemons...' +
 '</div>';

 pokemonList = [];

 // Busca os nomes da geracao em UMA unica requisicao (leve)
 var limite = fim - inicio + 1;
 var offset = inicio - 1;
 var url = "https://pokeapi.co/api/v2/pokemon?limit=" + limite + "&offset=" + offset;

 fetch(url)
 .then(function (r) { return r.json(); })
 .then(function (dados) {
 // Para cada nome, monta um item simples com id, name e tipos vazios
 var lista = [];
 for (var i = 0; i < dados.results.length; i++) {
 var id = inicio + i;
 lista.push({
 id: id,
 name: dados.results[i].name,
 tipos: [] // tipos serao buscados sob demanda em lote
 });
 }

 // Mostra os cards JA com sprite (sprite vem direto da URL, sem fetch)
 pokemonList = lista;
 ConstruirCardList();
 cache[chave] = lista;

 // Em paralelo, busca os tipos em lotes pequenos para mostrar as cores
 buscarTiposEmLote(lista);
 })
 .catch(function () {
 container.innerHTML = '<div class="loading-msg">Erro ao carregar.</div>';
 });
}

// fetch dos tipos em lotes
function buscarTiposEmLote(lista) {
 var LOTE = 20;
 var indice = 0;

 function proximoLote() {
 if (indice >= lista.length) return;

 var fim = Math.min(indice + LOTE, lista.length);
 var promessas = [];

 for (var i = indice; i < fim; i++) {
 var url = "https://pokeapi.co/api/v2/pokemon/" + lista[i].id;
 promessas.push(
 fetch(url)
 .then(function (r) { return r.json(); })
 .catch(function () { return null; })
 );
 }

 Promise.all(promessas).then(function (resultados) {
 for (var j = 0; j < resultados.length; j++) {
 var dados = resultados[j];
 if (!dados) continue;
 var posicao = indice + j;
 if (lista[posicao]) {
 lista[posicao].tipos = dados.types.map(function (t) { return t.type.name; });
 }
 }
 ConstruirCardList();
 indice = fim;
 proximoLote();
 });
 }

 proximoLote();
}

function Filter(tipo) {
 var abaAtiva = document.querySelector(".selectedAba");
 if (abaAtiva) abaAtiva.classList.remove("selectedAba");
 var filtroAntigo = document.querySelector(".filterSelected");
 if (filtroAntigo) filtroAntigo.classList.remove("filterSelected");
 var filtroNovo = document.querySelector("#" + tipo);
 if (filtroNovo) filtroNovo.classList.add("filterSelected");

 var chave = "type_" + tipo;
 var container = getContainerCard();

 if (cache[chave]) {
 pokemonList = cache[chave];
 ConstruirCardList();
 return;
 }

 container.innerHTML =
 '<div class="loading-msg">' +
 '<div class="loading-spinner"></div>' +
 'Filtrando...' +
 '</div>';

 fetch("https://pokeapi.co/api/v2/type/" + tipo)
 .then(function (r) { return r.json(); })
 .then(function (res) {
 var pokemons = res.pokemon.slice(0, 60);
 var lista = [];

 // Monta a lista basica (id + nome) extraindo da URL
 for (var i = 0; i < pokemons.length; i++) {
 var url = pokemons[i].pokemon.url;
 var partes = url.replace(/\/$/, "").split("/");
 var id = parseInt(partes[partes.length - 1], 10);
 lista.push({ id: id, name: pokemons[i].pokemon.name, tipos: [tipo] });
 }

 pokemonList = lista;
 ConstruirCardList();
 cache[chave] = lista;
 })
 .catch(function () {
 container.innerHTML = '<div class="loading-msg">Erro ao filtrar.</div>';
 });
}

function ConstruirCardList(lista) {
 var fonte = lista || pokemonList;
 var container = getContainerCard();

 if (!fonte.length) {
 container.innerHTML = '<div class="loading-msg">Nenhum Pokemon encontrado.</div>';
 return;
 }

 var html = "";

 for (var i = 0; i < fonte.length; i++) {
 var p = fonte[i];
 var nome = capitalize(p.name);
 var idFmt = formatarId(p.id);
 var img = urlSprite(p.id);

 // Tipos
 var tiposHtml = "";
 if (p.tipos && p.tipos.length > 0) {
 tiposHtml += '<span class="tipo tipo1 ' + p.tipos[0] + '">' + p.tipos[0] + '</span>';
 if (p.tipos[1]) {
 tiposHtml += '<span class="tipo tipo2 ' + p.tipos[1] + '">' + p.tipos[1] + '</span>';
 }
 }

 html +=
 '<div class="pokemonCard" onclick="AbrirDetalhes(' + p.id + ')" ' +
 'style="width:100%;min-height:200px;background:#fff;border-radius:16px;border:1px solid #ede5ff;display:flex;flex-direction:column;align-items:center;padding-bottom:12px;cursor:pointer;overflow:hidden;box-shadow:0 2px 12px rgba(119,96,174,0.10);">' +
 '<div class="img" ' +
 'style="width:100%;height:140px;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#f3eeff 0%,#e8deff 100%);border-radius:14px 14px 0 0;overflow:hidden;flex-shrink:0;">' +
 '<img src="' + img + '" alt="' + nome + '" loading="lazy" ' +
 'style="width:100px;height:100px;max-width:90%;max-height:90%;object-fit:contain;display:block;" ' +
 'onerror="this.style.opacity=\'0.25\'">' +
 '</div>' +
 '<div class="detalhes" style="width:calc(100% - 20px);margin-top:8px;display:flex;flex-direction:column;gap:6px;">' +
 '<div class="identificador">' +
 '<span class="numeracao">' + idFmt + '</span>' +
 '<h3>' + nome + '</h3>' +
 '</div>' +
 '<div class="tiposContainer">' + tiposHtml + '</div>' +
 '</div>' +
 '</div>';
 }

 container.innerHTML = html;
}

function AbrirDetalhes(id) {
 window.location.href = "pokedex02.html?id=" + id;
}

document.addEventListener("DOMContentLoaded", function () {
 var barra = document.getElementById("barraPesquisa");
 if (!barra) return;

 var timer;
 barra.addEventListener("input", function () {
 clearTimeout(timer);
 timer = setTimeout(function () {
 var termo = barra.value.toLowerCase().trim();
 if (!termo) {
 ConstruirCardList(pokemonList);
 return;
 }
 var filtrado = [];
 for (var i = 0; i < pokemonList.length; i++) {
 var p = pokemonList[i];
 if (p.name.toLowerCase().indexOf(termo) !== -1 || String(p.id).indexOf(termo) !== -1) {
 filtrado.push(p);
 }
 }
 ConstruirCardList(filtrado);
 }, 200);
 });
});
