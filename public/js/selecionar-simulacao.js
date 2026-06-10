var simulacoesList = carregarSimulacoes();
var pokemonList = [];

const containerCard = document.querySelector(".containerCard");
const barraPesquisa = document.querySelector("#barraPesquisa");

window.addEventListener("load", () => {
 GetPokemonList();
});

if (barraPesquisa) {
 barraPesquisa.addEventListener("input", () => {
 ConstruirCardList();
 });
}

function carregarSimulacoes() {
 const simulacoesStorage = sessionStorage.getItem("simulacoesList") || sessionStorage.getItem("simulacoes");

 if (simulacoesStorage) {
 try {
 const simulacoes = JSON.parse(simulacoesStorage);

 if (Array.isArray(simulacoes)) {
 return simulacoes.map((simulacao, index) => normalizarSimulacao(simulacao, index));
 }
 } catch (error) {
 console.error("Erro ao carregar simulações do sessionStorage:", error);
 }
 }

 return [
 {
 id: 1,
 pokemonUsuario: "charmander",
 pokemonAdversario: "pikachu"
 }
 ];
}

function normalizarSimulacao(simulacao, index) {
 return {
 id: simulacao.id || simulacao.idSimulacao || index + 1,
 pokemonUsuario: simulacao.pokemonUsuario || simulacao.usuario || simulacao.pokemonEscolhido,
 pokemonAdversario: simulacao.pokemonAdversario || simulacao.adversario || simulacao.pokemonInimigo
 };
}

function salvarSimulacoes() {
 sessionStorage.setItem("simulacoesList", JSON.stringify(simulacoesList));
}

function formatarNumeroSimulacao(numero) {
 return String(numero).padStart(2, "0");
}

function buscarPokemon(nomePokemon) {
 return fetch(`https://pokeapi.co/api/v2/pokemon/${nomePokemon.toLowerCase()}`)
 .then(res => {
 if (!res.ok) {
 throw new Error(`Pokémon não encontrado: ${nomePokemon}`);
 }

 return res.json();
 });
}

async function GetPokemonList() {
 pokemonList = [];
 const promises = [];

 for (let i = 0; i < simulacoesList.length; i++) {
 let simulacao = simulacoesList[i];

 promises.push(buscarPokemon(simulacao.pokemonUsuario));
 promises.push(buscarPokemon(simulacao.pokemonAdversario));
 }

 try {
 pokemonList = await Promise.all(promises);
 ConstruirCardList();
 } catch (error) {
 console.error(error);
 containerCard.innerHTML = `<p class="mensagemCard">Não foi possível carregar as simulações.</p>`;
 }
}

function removerAcentos(texto) {
 return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function filtrarSimulacoes() {
 const textoPesquisa = barraPesquisa ? removerAcentos(barraPesquisa.value.trim().toLowerCase()) : "";

 return simulacoesList
 .map((simulacao, index) => ({ simulacao, indexOriginal: index }))
 .filter(item => {
 if (textoPesquisa === "") {
 return true;
 }

 const numeroSimulacao = formatarNumeroSimulacao(item.indexOriginal + 1);
 const nomeSimulacao = removerAcentos(`simulação ${numeroSimulacao}`.toLowerCase());
 const pokemonUsuario = removerAcentos(item.simulacao.pokemonUsuario.toLowerCase());
 const pokemonAdversario = removerAcentos(item.simulacao.pokemonAdversario.toLowerCase());

 return nomeSimulacao.includes(textoPesquisa) ||
 pokemonUsuario.includes(textoPesquisa) ||
 pokemonAdversario.includes(textoPesquisa);
 });
}

function ConstruirCardList() {
 const simulacoesFiltradas = filtrarSimulacoes();

 if (simulacoesFiltradas.length === 0) {
 containerCard.innerHTML = `<p class="mensagemCard">Nenhuma simulação encontrada.</p>`;
 return;
 }

 var list = "";

 for (let i = 0; i < simulacoesFiltradas.length; i++) {
 let item = simulacoesFiltradas[i];
 let simulacao = item.simulacao;
 let indexOriginal = item.indexOriginal;

 let pokemonUsuario = pokemonList[indexOriginal * 2];
 let pokemonAdversario = pokemonList[indexOriginal * 2 + 1];
 let numeroSimulacao = formatarNumeroSimulacao(indexOriginal + 1);

 list += `
 <div class="pokemonCard" id="simulacao-${simulacao.id}">
 <div class="detalhes">
 <div class="identificador">
 <h3>Simulação ${numeroSimulacao}</h3>
 </div>

 <div class="pokemonsContainer">
 <div class="pokemonSimulacao">
 <img src="${pokemonUsuario.sprites.front_default}" alt="${pokemonUsuario.name}">
 <span>${pokemonUsuario.name}</span>
 </div>

 <span class="versus">VS</span>

 <div class="pokemonSimulacao">
 <img src="${pokemonAdversario.sprites.front_default}" alt="${pokemonAdversario.name}">
 <span>${pokemonAdversario.name}</span>
 </div>
 </div>

 <button class="btnSimular" onclick="simular('${simulacao.id}')">
 Simular
 </button>

 <button class="btnExcluir" onclick="RemoverSimulacao('${simulacao.id}')">
 <i class="fa-solid fa-trash"></i>
 </button>
 </div>
 </div>
 `;
 }

 containerCard.innerHTML = list;
}

function simular(idSimulacao) {
 window.location.href = `simulacao.html?id=${idSimulacao}`;
}

function RemoverSimulacao(idSimulacao) {
 simulacoesList = simulacoesList.filter(simulacao => String(simulacao.id) !== String(idSimulacao));
 salvarSimulacoes();
 GetPokemonList();
}
