// team builder - selecao do duelo
// geracoes
var geracoes = [
 { nome: 'Gen 1', inicio: 1, fim: 151 },
 { nome: 'Gen 2', inicio: 152, fim: 251 },
 { nome: 'Gen 3', inicio: 252, fim: 386 },
 { nome: 'Gen 4', inicio: 387, fim: 493 },
 { nome: 'Gen 5', inicio: 494, fim: 649 },
 { nome: 'Gen 6', inicio: 650, fim: 721 },
 { nome: 'Gen 7', inicio: 722, fim: 809 },
 { nome: 'Gen 8', inicio: 810, fim: 905 },
 { nome: 'Gen 9', inicio: 906, fim: 1025 }
];

// cache
var cacheListas = {};

// pokemons escolhidos
var pokemonMeu = null;
var pokemonAdv = null;

// gen ativa
var genMeu = 0;
var genAdv = 0;

// indice do duelo
var dueloIdx = Number(localStorage.getItem("DUELO_EDITANDO_IDX") || "0");

// duelos salvos
var duelos = JSON.parse(localStorage.getItem("DUELOS_SALVOS") || "[]");

// duelo atual
var duelo = duelos[dueloIdx] || {
 id: Date.now(),
 nome: "Duelo " + (duelos.length + 1),
 data: new Date().toLocaleDateString("pt-BR"),
 meu: null,
 adversario: null
};

function capitalizar(texto) {
 if (!texto) return '';
 return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function urlSprite(id) {
 return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + id + '.png';
}

function urlArte(id) {
 return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + id + '.png';
}

document.addEventListener('DOMContentLoaded', iniciar);

function iniciar() {
 // Se o duelo ja tem pokemons, pre-seleciona eles
 if (duelo.meu && duelo.meu.pokemon) {
 pokemonMeu = { id: duelo.meu.pokemon.id, name: duelo.meu.pokemon.name };
 }
 if (duelo.adversario && duelo.adversario.pokemon) {
 pokemonAdv = { id: duelo.adversario.pokemon.id, name: duelo.adversario.pokemon.name };
 }
 atualizarPreview('meu');
 atualizarPreview('adv');

 // Cria os botoes de geracao
 criarAbasGen('abas-meu', 'meu');
 criarAbasGen('abas-adv', 'adv');

 // Carrega a Gen 1 em cada lado
 carregarGen(0, 'meu');
 carregarGen(0, 'adv');

 // Enter na busca
 document.getElementById('busca-meu').addEventListener('keydown', function (e) {
 if (e.key === 'Enter') buscarPokemon('meu');
 });
 document.getElementById('busca-adv').addEventListener('keydown', function (e) {
 if (e.key === 'Enter') buscarPokemon('adv');
 });

 atualizarBotaoSalvar();
}

function criarAbasGen(idDoContainer, lado) {
 var container = document.getElementById(idDoContainer);
 var html = '';
 for (var i = 0; i < geracoes.length; i++) {
 var classe = i === 0 ? 'aba-gen ativo' : 'aba-gen';
 html += '<button class="' + classe + '" onclick="selecionarGen(' + i + ', \'' + lado + '\')">' + geracoes[i].nome + '</button>';
 }
 container.innerHTML = html;
}

function selecionarGen(indice, lado) {
 var botoes = document.querySelectorAll('#abas-' + lado + ' .aba-gen');
 for (var i = 0; i < botoes.length; i++) {
 if (i === indice) botoes[i].classList.add('ativo');
 else botoes[i].classList.remove('ativo');
 }
 if (lado === 'meu') genMeu = indice;
 else genAdv = indice;
 carregarGen(indice, lado);
}

function carregarGen(indice, lado) {
 var gen = geracoes[indice];
 var chave = 'gen_' + gen.inicio + '_' + gen.fim;
 var grade = document.getElementById('grade-' + lado);

 if (cacheListas[chave]) {
 desenharGrade(cacheListas[chave], grade, lado);
 return;
 }

 grade.innerHTML = '<div class="carregando-selecao"><div class="icone-carregando"></div> Carregando...</div>';

 // Monta a lista direto com sprites (sem precisar de fetch por pokemon)
 var lista = [];
 for (var id = gen.inicio; id <= gen.fim; id++) {
 lista.push({ id: id, name: 'pokemon-' + id, img: urlSprite(id) });
 }

 // Uma unica requisicao para pegar todos os nomes da geracao
 var limite = gen.fim - gen.inicio + 1;
 var offset = gen.inicio - 1;
 var url = 'https://pokeapi.co/api/v2/pokemon?limit=' + limite + '&offset=' + offset;

 fetch(url)
 .then(function (r) { return r.json(); })
 .then(function (dados) {
 for (var i = 0; i < dados.results.length; i++) {
 if (lista[i]) lista[i].name = dados.results[i].name;
 }
 cacheListas[chave] = lista;
 desenharGrade(lista, grade, lado);
 })
 .catch(function () {
 cacheListas[chave] = lista;
 desenharGrade(lista, grade, lado);
 });
}

function desenharGrade(lista, grade, lado) {
 var selecionado = lado === 'meu' ? pokemonMeu : pokemonAdv;
 grade.innerHTML = '';

 for (var i = 0; i < lista.length; i++) {
 var p = lista[i];
 var div = document.createElement('div');
 var ehSelecionado = selecionado && selecionado.id === p.id;
 div.className = ehSelecionado ? 'card-selecao selecionado' : 'card-selecao';

 div.innerHTML =
 '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy" ' +
 'onerror="if(!this._erro){this._erro=1;this.src=\'' + urlArte(p.id) + '\'}else{this.style.opacity=\'0.2\'}">' +
 '<span class="id-poke">#' + String(p.id).padStart(3, '0') + '</span>' +
 '<span>' + capitalizar(p.name) + '</span>';

 (function (id, name) {
 div.addEventListener('click', function () {
 selecionarPokemon(id, name, lado);
 });
 })(p.id, p.name);

 grade.appendChild(div);
 }
}

function buscarPokemon(lado) {
 var termo = document.getElementById('busca-' + lado).value.trim().toLowerCase();
 if (!termo) return;

 var grade = document.getElementById('grade-' + lado);
 grade.innerHTML = '<div class="carregando-selecao"><div class="icone-carregando"></div> Buscando...</div>';

 fetch('https://pokeapi.co/api/v2/pokemon/' + termo)
 .then(function (r) {
 if (!r.ok) throw new Error('nao achou');
 return r.json();
 })
 .then(function (dados) {
 var p = { id: dados.id, name: dados.name, img: urlSprite(dados.id) };
 desenharGrade([p], grade, lado);
 selecionarPokemon(p.id, p.name, lado);
 })
 .catch(function () {
 grade.innerHTML = '<div class="carregando-selecao" style="color:#D84B36">Pokemon "' + termo + '" nao encontrado.</div>';
 });
}

function selecionarPokemon(id, nome, lado) {
 if (lado === 'meu') pokemonMeu = { id: id, name: nome };
 else pokemonAdv = { id: id, name: nome };

 var cards = document.querySelectorAll('#grade-' + lado + ' .card-selecao');
 for (var i = 0; i < cards.length; i++) cards[i].classList.remove('selecionado');
 for (var j = 0; j < cards.length; j++) {
 var img = cards[j].querySelector('img');
 if (img && img.alt && nome && img.alt.toLowerCase() === nome.toLowerCase()) {
 cards[j].classList.add('selecionado');
 }
 }

 atualizarPreview(lado);
 atualizarBotaoSalvar();
}

function atualizarPreview(lado) {
 var el = document.getElementById('preview-' + lado);
 var p = lado === 'meu' ? pokemonMeu : pokemonAdv;
 if (!p) { el.innerHTML = ''; return; }

 el.innerHTML =
 '<img src="' + urlSprite(p.id) + '" alt="' + p.name + '" ' +
 'onerror="if(!this._erro){this._erro=1;this.src=\'' + urlArte(p.id) + '\'}">' +
 '<span>' + capitalizar(p.name) + '</span>';
}

function atualizarBotaoSalvar() {
 var btn = document.getElementById('btn-iniciar-batalha');
 btn.disabled = !(pokemonMeu && pokemonAdv);
}

function limparSelecao() {
 pokemonMeu = null;
 pokemonAdv = null;
 atualizarPreview('meu');
 atualizarPreview('adv');
 var cards = document.querySelectorAll('.card-selecao.selecionado');
 for (var i = 0; i < cards.length; i++) cards[i].classList.remove('selecionado');
 atualizarBotaoSalvar();
}

// salva e volta
function salvarDuelo() {
 if (!pokemonMeu || !pokemonAdv) return;

 duelo.meu = {
 pokemon: { id: pokemonMeu.id, name: pokemonMeu.name }
 };
 duelo.adversario = {
 pokemon: { id: pokemonAdv.id, name: pokemonAdv.name }
 };

 duelos[dueloIdx] = duelo;
 localStorage.setItem("DUELOS_SALVOS", JSON.stringify(duelos));

 alert("Duelo salvo!");
 window.location.href = "teamBuilder-List.html";
}

function abrirMenu() { document.querySelector('.menu-lateral').style.display = 'block'; }
function fecharMenu() { document.querySelector('.menu-lateral').style.display = 'none'; }
