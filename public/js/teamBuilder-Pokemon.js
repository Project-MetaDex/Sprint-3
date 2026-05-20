var pokemon = [];
var pokemonEditandoIndex = 0;

window.addEventListener("load", () => {
    conectarNavegacao();
    renderizarPokemonEmEdicao();
});

function ConstruirCardSelectd(){

    pokemon = []
    var time = ""
    const containerSelected = document.querySelector(".containerCardSelected")
    containerSelected.innerHTML = "";

    const totalSalvo = Number(sessionStorage.getItem("TOTAL_POKEMONS_TIME"));

    for (let i = 0; i < totalSalvo; i++) {
        const element = sessionStorage.getItem(`POKEMON${i}`)
        if (element) {
            pokemon.push(JSON.parse(element))
        }
    }

    for (let i = 0; i < pokemon.length; i++) {
        const element = pokemon[i];
        const type1 = element.types[0].type.name
        const type2 = element.types[1] ? element.types[1].type.name : null
        
        time += `
        <div id="IdPokemon${i}" class="cardSelecionado">
            <img src="${element.sprites.front_default}" alt="">
            <div class="selecionadosDetalhes">
                <h3><a href="#" onclick="EditarPokemon(${i})">${element.name}</a></h3>
                <span class="tipos tipo1 ${type1}">${type1}</span>
                <span class="tipos tipo2 ${type2? type2 : "" }">${type2? type2 : ""}</span>
            </div>
        </div>
        `
    }

    containerSelected.innerHTML += time;

}

function conectarNavegacao() {
    const botaoVoltar = document.getElementById("btnVoltar");
    const botaoSalvar = document.getElementById("btnSalvar");

    if (botaoVoltar) {
        botaoVoltar.onclick = () => {
            location.href = "teamBuilder-Selection.html";
        };
    }

    if (botaoSalvar) {
        botaoSalvar.onclick = () => {
            location.href = "teamBuilder-List.html";
        };
    }
}

function EditarPokemon(index) {
    pokemonEditandoIndex = index;
    sessionStorage.setItem("POKEMON_EDITANDO", String(index));
    renderizarPokemonEmEdicao();
}

function renderizarPokemonEmEdicao() {
    const indexSalvo = Number(sessionStorage.getItem("POKEMON_EDITANDO"));

    if (!Number.isNaN(indexSalvo)) {
        pokemonEditandoIndex = indexSalvo;
    }

    if (!pokemon.length) {
        ConstruirCardSelectd();
    }

    const pokemonAtual = pokemon[pokemonEditandoIndex] || pokemon[0];
    if (!pokemonAtual) {
        return;
    }

    const nomePokemon = document.querySelector(".nomePokemon");
    const imagemPokemon = document.querySelector(".imgPokemon");
    const tipos = document.querySelectorAll(".tipos .etiqueta");
    const statusBase = document.querySelectorAll(".statusGridBase .statusLinha strong");

    if (nomePokemon) {
        nomePokemon.textContent = pokemonAtual.name;
    }

    if (imagemPokemon) {
        imagemPokemon.src = pokemonAtual.sprites.other?.['official-artwork']?.front_default || pokemonAtual.sprites.front_default;
        imagemPokemon.alt = pokemonAtual.name;
    }

    if (tipos[0]) {
        const tipoPrincipal = pokemonAtual.types[0]?.type.name || "";
        tipos[0].textContent = tipoPrincipal;
        tipos[0].className = `etiqueta tipo1 ${tipoPrincipal}`;
    }

    if (tipos[1]) {
        const tipoSecundario = pokemonAtual.types[1]?.type.name || "";
        tipos[1].textContent = tipoSecundario || "Sem tipo";
        tipos[1].className = `etiqueta tipo2 ${tipoSecundario || 'normal'}`;
    }

    const mapaStatus = ["hp", "attack", "defense", "special-defense", "special-attack", "speed"];
    mapaStatus.forEach((nomeStatus, index) => {
        if (statusBase[index]) {
            const valor = pokemonAtual.stats.find((status) => status.stat.name === nomeStatus)?.base_stat || 0;
            statusBase[index].textContent = valor;
        }
    });
}

const statusPokemon = {
    hp: 0,
    ataque: 0,
    defesa: 0,
    ataqueEsp: 0,
    defesaEsp: 0,
    velocidade: 0
};

const limitePontos = 508;
const limitePorStatus = 252;

function alterarStatus(status, valor) {
    const totalAtual = calcularTotalStatus();
    const valorAtual = statusPokemon[status];

    if (valor > 0) {
        if (totalAtual >= limitePontos) return;
        if (valorAtual >= limitePorStatus) return;

        statusPokemon[status]++;
    }

    if (valor < 0) {
        if (valorAtual <= 0) return;

        statusPokemon[status]--;
    }

    atualizarStatusTela();
}

function calcularTotalStatus() {
    return Object.values(statusPokemon).reduce((total, valor) => total + valor, 0);
}

function atualizarStatusTela() {
    document.getElementById("hp").innerText = statusPokemon.hp;
    document.getElementById("ataque").innerText = statusPokemon.ataque;
    document.getElementById("defesa").innerText = statusPokemon.defesa;
    document.getElementById("ataqueEsp").innerText = statusPokemon.ataqueEsp;
    document.getElementById("defesaEsp").innerText = statusPokemon.defesaEsp;
    document.getElementById("velocidade").innerText = statusPokemon.velocidade;

    const pontosRestantes = limitePontos - calcularTotalStatus();
    document.getElementById("pontosRestantes").innerText = pontosRestantes;
}