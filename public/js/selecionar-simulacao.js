var simulacoesList = [];
var pokemonList = [];

const containerCard = document.querySelector(".containerCard");
const barraPesquisa = document.querySelector("#barraPesquisa");

window.addEventListener("load", () => {
 carregarSimulacoes();
});

function getIdUsuario() {
 return sessionStorage.getItem("ID_USUARIO");
}

if (barraPesquisa) {
 barraPesquisa.addEventListener("input", () => {
 ConstruirCardList();
 });
}

function carregarSimulacoes() {
 var idUsuario = getIdUsuario();

 if (!idUsuario) {
 simulacoesList = [];
 if (containerCard) {
 containerCard.innerHTML = `<p class="mensagemCard">Faça login para visualizar suas simulações.</p>`;
 }
 return;
 }

 fetch("/simulacoes/listarSimulacoes", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ idUsuarioServer: idUsuario })
 })
 .then(function (resposta) {
 if (resposta.status === 204) {
 return [];
 }

 if (!resposta.ok) {
 throw new Error("Falha ao listar simulações: " + resposta.status);
 }

 return resposta.json();
 })
 .then(function (dados) {
 simulacoesList = dados.map(function (simulacao, index) {
 return normalizarSimulacao(simulacao, index);
 });
 GetPokemonList();
 })
 .catch(function (erro) {
 console.error("Erro ao carregar simulações do banco:", erro);
 if (containerCard) {
 containerCard.innerHTML = `<p class="mensagemCard">Não foi possível carregar as simulações.</p>`;
 }
 });
}

function normalizarSimulacao(simulacao, index) {
 return {
 id: simulacao.idSimulacaoUsuario || simulacao.id || simulacao.idSimulacao || index + 1,
 pokemonUsuario: simulacao.nomePokemonUsuario || simulacao.pokemonUsuario || simulacao.usuario,
 pokemonAdversario: simulacao.nomePokemonAdversario || simulacao.pokemonAdversario || simulacao.adversario,
 resultado: simulacao.Resultado || simulacao.resultado || null
 };
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
 window.location.href = `simulacao1.html?simId=${idSimulacao}`;
}

function RemoverSimulacao(idSimulacao) {
 var idUsuario = getIdUsuario();

 if (!idUsuario) {
 alert("Faça login para excluir simulações.");
 return;
 }

 fetch("/simulacoes/excluirSimulacao", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 idSimulacaoServer: idSimulacao,
 idUsuarioServer: idUsuario
 })
 })
 .then(function (resposta) {
 if (!resposta.ok) {
 throw new Error("Falha ao excluir simulação: " + resposta.status);
 }

 simulacoesList = simulacoesList.filter(function (simulacao) {
 return String(simulacao.id) !== String(idSimulacao);
 });
 GetPokemonList();
 })
 .catch(function (erro) {
 console.error("Erro ao excluir simulação:", erro);
 alert("Não foi possível excluir a simulação.");
 });
}
