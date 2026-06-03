var simulacoesList = [
    {
        id: 1,
        nome: "Simulação 01",
        pokemonUsuario: "charmander",
        pokemonAdversario: "pikachu"
    }
];

var pokemonList = [];

const containerCard = document.querySelector(".containerCard");

window.addEventListener("load", () => {
    GetPokemonList();
});

async function GetPokemonList() {

    pokemonList = [];
    const promises = [];

    for (let i = 0; i < simulacoesList.length; i++) {
        let simulacao = simulacoesList[i];

        promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${simulacao.pokemonUsuario.toLowerCase()}`).then(res => res.json()));
        promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${simulacao.pokemonAdversario.toLowerCase()}`).then(res => res.json()));
    }

    try {
        pokemonList = await Promise.all(promises);

        ConstruirCardList();

    } catch (error) {
        console.error(error);
    }
}

function ConstruirCardList() {

    var list = "";

    for (let i = 0; i < simulacoesList.length; i++) {
        let simulacao = simulacoesList[i];

        let pokemonUsuario = pokemonList[i * 2];
        let pokemonAdversario = pokemonList[i * 2 + 1];

        list += `
            <div class="pokemonCard" id="simulacao-${simulacao.id}">
                <div class="detalhes">
                    <div class="identificador">
                        <h3>${simulacao.nome}</h3>
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

                    <button class="btnSimular" onclick="simular(${simulacao.id})">
                        Simular
                    </button>

                    <button class="btnExcluir" onclick="RemoverSimulacao(${simulacao.id}, ${i})">
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

function RemoverSimulacao(idSimulacao, index) {

    simulacoesList.splice(index, 1);

    const cardSimulacao = document.querySelector(`#simulacao-${idSimulacao}`);

    if (cardSimulacao) {
        cardSimulacao.remove();
    }

    GetPokemonList();
}