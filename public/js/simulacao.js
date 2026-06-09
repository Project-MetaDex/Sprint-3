// selecao de pokemon para batalha
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

// gen ativa em cada lado
var genMeu = 0;
var genAdv = 0;

function capitalizar(texto) {
 if (!texto) return '';
 return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// sprite
function urlSprite(id) {
 return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + id + '.png';
}

// arte oficial
function urlArte(id) {
 return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + id + '.png';
}

document.addEventListener('DOMContentLoaded', iniciar);

function iniciar() {
 // Se veio do Team Builder com duelo salvo, pre-seleciona os dois
 carregarVindoDoTeamBuilder();
 // Se veio da Pokedex com um pokemon pre-escolhido
 carregarVindoDaPokedex();

 // Cria os botoes de geracao em cada lado
 criarAbasGen('abas-meu', 'meu');
 criarAbasGen('abas-adv', 'adv');

 // Carrega a Gen 1 em cada lado
 carregarGen(0, 'meu');
 carregarGen(0, 'adv');

 // Tecla Enter na busca chama buscarPokemon()
 var buscaMeu = document.getElementById('busca-meu');
 var buscaAdv = document.getElementById('busca-adv');
 buscaMeu.addEventListener('keydown', function(e) {
 if (e.key === 'Enter') buscarPokemon('meu');
 });
 buscaAdv.addEventListener('keydown', function(e) {
 if (e.key === 'Enter') buscarPokemon('adv');
 });

 atualizarBotaoIniciar();
}

// Le os pokemons do duelo salvo no Team Builder
function carregarVindoDoTeamBuilder() {
 var idx = localStorage.getItem('DUELO_SIMULAR_IDX');
 if (idx === null) return;

 try {
 var duelos = JSON.parse(localStorage.getItem('DUELOS_SALVOS') || '[]');
 var d = duelos[Number(idx)];
 if (!d) return;
 if (d.meu && d.meu.pokemon) {
 pokemonMeu = { id: d.meu.pokemon.id, name: d.meu.pokemon.name };
 }
 if (d.adversario && d.adversario.pokemon) {
 pokemonAdv = { id: d.adversario.pokemon.id, name: d.adversario.pokemon.name };
 }
 atualizarPreview('meu');
 atualizarPreview('adv');
 } catch (e) {
 // ignora se nao conseguir ler
 }
}

// Le um pokemon pre-escolhido pela Pokedex
function carregarVindoDaPokedex() {
 var dados = sessionStorage.getItem('SIM_PRESELECT_POKEMON');
 if (!dados) return;
 try {
 var p = JSON.parse(dados);
 if (p && p.id) {
 pokemonMeu = { id: p.id, name: p.name || 'pokemon-' + p.id };
 atualizarPreview('meu');
 }
 sessionStorage.removeItem('SIM_PRESELECT_POKEMON');
 } catch (e) {
 // ignora
 }
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
 // Marca a aba selecionada
 var botoes = document.querySelectorAll('#abas-' + lado + ' .aba-gen');
 for (var i = 0; i < botoes.length; i++) {
 if (i === indice) botoes[i].classList.add('ativo');
 else botoes[i].classList.remove('ativo');
 }

 // Guarda qual gen esta ativa naquele lado
 if (lado === 'meu') genMeu = indice;
 else genAdv = indice;

 carregarGen(indice, lado);
}

function carregarGen(indice, lado) {
 var gen = geracoes[indice];
 var chave = 'gen_' + gen.inicio + '_' + gen.fim;
 var grade = document.getElementById('grade-' + lado);

 // Ja tem no cache? Usa direto
 if (cacheListas[chave]) {
 desenharGrade(cacheListas[chave], grade, lado);
 return;
 }

 grade.innerHTML = '<div class="carregando-selecao"><div class="icone-carregando"></div> Carregando...</div>';

 // Monta a lista com IDs e sprites diretos (sem precisar fetch por pokemon)
 var lista = [];
 for (var id = gen.inicio; id <= gen.fim; id++) {
 lista.push({ id: id, name: 'pokemon-' + id, img: urlSprite(id) });
 }

 // Faz UMA unica requisicao para pegar todos os nomes
 var limite = gen.fim - gen.inicio + 1;
 var offset = gen.inicio - 1;
 var url = 'https://pokeapi.co/api/v2/pokemon?limit=' + limite + '&offset=' + offset;

 fetch(url)
 .then(function(r) { return r.json(); })
 .then(function(dados) {
 for (var i = 0; i < dados.results.length; i++) {
 if (lista[i]) lista[i].name = dados.results[i].name;
 }
 cacheListas[chave] = lista;
 desenharGrade(lista, grade, lado);
 })
 .catch(function() {
 // Se falhar, ainda mostra a lista com nomes "pokemon-XX"
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

 // Usa IIFE para capturar id e name corretos no loop
 (function(id, name) {
 div.addEventListener('click', function() {
 selecionarPokemon(id, name, lado);
 });
 })(p.id, p.name);

 grade.appendChild(div);
 }
}

function buscarPokemon(lado) {
 var input = document.getElementById('busca-' + lado);
 var termo = input.value.trim().toLowerCase();
 if (!termo) return;

 var grade = document.getElementById('grade-' + lado);
 grade.innerHTML = '<div class="carregando-selecao"><div class="icone-carregando"></div> Buscando...</div>';

 fetch('https://pokeapi.co/api/v2/pokemon/' + termo)
 .then(function(r) {
 if (!r.ok) throw new Error('nao achou');
 return r.json();
 })
 .then(function(dados) {
 var p = { id: dados.id, name: dados.name, img: urlSprite(dados.id) };
 desenharGrade([p], grade, lado);
 selecionarPokemon(p.id, p.name, lado);
 })
 .catch(function() {
 grade.innerHTML = '<div class="carregando-selecao" style="color:#D84B36">Pokemon "' + termo + '" nao encontrado.</div>';
 });
}

function selecionarPokemon(id, nome, lado) {
 if (lado === 'meu') pokemonMeu = { id: id, name: nome };
 else pokemonAdv = { id: id, name: nome };

 // Tira a marca de qualquer card que estava selecionado
 var cards = document.querySelectorAll('#grade-' + lado + ' .card-selecao');
 for (var i = 0; i < cards.length; i++) {
 cards[i].classList.remove('selecionado');
 }
 // Marca o card que foi clicado
 for (var j = 0; j < cards.length; j++) {
 var img = cards[j].querySelector('img');
 if (img && img.alt && nome && img.alt.toLowerCase() === nome.toLowerCase()) {
 cards[j].classList.add('selecionado');
 }
 }

 atualizarPreview(lado);
 atualizarBotaoIniciar();
}

// Atualiza a previa que aparece no header do painel
function atualizarPreview(lado) {
 var el = document.getElementById('preview-' + lado);
 var p = lado === 'meu' ? pokemonMeu : pokemonAdv;
 if (!p) { el.innerHTML = ''; return; }

 el.innerHTML =
 '<img src="' + urlSprite(p.id) + '" alt="' + p.name + '" ' +
 'onerror="if(!this._erro){this._erro=1;this.src=\'' + urlArte(p.id) + '\'}">' +
 '<span>' + capitalizar(p.name) + '</span>';
}

// O botao so liga quando os dois lados tem pokemon
function atualizarBotaoIniciar() {
 var btn = document.getElementById('btn-iniciar-batalha');
 btn.disabled = !(pokemonMeu && pokemonAdv);
}

// Limpa os dois lados
function limparSelecao() {
 pokemonMeu = null;
 pokemonAdv = null;
 atualizarPreview('meu');
 atualizarPreview('adv');
 var cards = document.querySelectorAll('.card-selecao.selecionado');
 for (var i = 0; i < cards.length; i++) cards[i].classList.remove('selecionado');
 atualizarBotaoIniciar();
}

// Guarda os dois pokemons e vai para a tela de batalha
function iniciarBatalha() {
 if (!pokemonMeu || !pokemonAdv) return;
 sessionStorage.setItem('BATALHA_MEU', JSON.stringify(pokemonMeu));
 sessionStorage.setItem('BATALHA_ADV', JSON.stringify(pokemonAdv));
 window.location.href = 'simulacao1.html';
}

function abrirMenu() {
 document.querySelector('.menu-lateral').style.display = 'block';
}

function fecharMenu() {
 document.querySelector('.menu-lateral').style.display = 'none';
}
