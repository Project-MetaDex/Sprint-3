let pokemonList = [];
let pokemonListOriginal = [];

const containerCard = document.querySelector(".containerCard");
const inputPesquisa = document.getElementById("barraPesquisa");

window.addEventListener("load", () => {
    GetPokemonList(151, 1);

    inputPesquisa.addEventListener("input", pesquisarPokemon);
});

async function GetPokemonList(regulamento, inicio) {
    pokemonList = [];
    pokemonListOriginal = [];

    containerCard.innerHTML = `<p class="mensagemCarregando">Carregando Pokémon...</p>`;

    const promises = [];

    for (let i = inicio; i <= regulamento; i++) {
        promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}`).then(res => res.json()));
    }   

    try {
        pokemonList = await Promise.all(promises);
        pokemonListOriginal = [...pokemonList];

        ConstruirCardList(pokemonList);
    } catch (error) {
        console.error(error);
        containerCard.innerHTML = `<p class="mensagemErro">Erro ao carregar os Pokémon. Tente novamente.</p>`;
    }
}

async function Filter(type) {
    document.querySelector(".filterSelected")?.classList.remove("filterSelected");
    document.querySelector(`#${type}`)?.classList.add("filterSelected");

    pokemonList = [];
    pokemonListOriginal = [];

    containerCard.innerHTML = `<p class="mensagemCarregando">Carregando Pokémon do tipo ${type}...</p>`;

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`).then(resp => resp.json());

        const promises = res.pokemon.map(item => {
            return fetch(item.pokemon.url).then(response => response.json());
        });

        pokemonList = await Promise.all(promises);

        pokemonList.sort((a, b) => a.id - b.id);

        pokemonListOriginal = [...pokemonList];

        ConstruirCardList(pokemonList);
    } catch (error) {
        console.error(error);
        containerCard.innerHTML = `<p class="mensagemErro">Erro ao filtrar os Pokémon. Tente novamente.</p>`;
    }
}

function pesquisarPokemon() {
    const textoPesquisa = inputPesquisa.value.trim().toLowerCase();

    if (textoPesquisa === "") {
        ConstruirCardList(pokemonListOriginal);
        return;
    }

    const resultadoBusca = pokemonListOriginal.filter(pokemon => {
        const nomePokemon = pokemon.name.toLowerCase();
        const idPokemon = String(pokemon.id);

        return nomePokemon.includes(textoPesquisa) || idPokemon.includes(textoPesquisa);
    });

    ConstruirCardList(resultadoBusca);
}

function ConstruirCardList(lista) {
    let cards = "";

    if (!lista.length) {
        containerCard.innerHTML = `<p class="mensagemErro">Nenhum Pokémon encontrado.</p>`;
        return;
    }

    for (let i = 0; i < lista.length; i++) {
        const element = lista[i];

        const type1 = element.types[0].type.name;
        const type2 = element.types[1] ? element.types[1].type.name : "";

        cards += `
            <div class="pokemonCard">
                <div class="pokemonContainer">
                    <img src="${element.sprites.front_default}" alt="Imagem do Pokémon ${element.name}">
                    
                    <div class="detalhes">
                        <h3>${element.name}</h3>
                        <span class="tipo1 ${type1}">${type1}</span>
                        <span class="tipo2 ${type2}">${type2}</span>
                    </div>
                </div>

                <button onclick="SelecionarPokemon(${element.id})" class="addButton">
                    Selecionar
                </button>
            </div>
        `;
    }

    containerCard.innerHTML = cards;
}

function SelecionarPokemon(idPokemon) {
    const pokemonEscolhido = pokemonListOriginal.find(pokemon => pokemon.id === idPokemon);

    if (!pokemonEscolhido) {
        alert("Erro ao selecionar Pokémon.");
        return;
    }

    const pokemonParaSalvar = {
        id: pokemonEscolhido.id,
        nome: pokemonEscolhido.name,
        imagem: pokemonEscolhido.sprites.front_default,
        tipos: pokemonEscolhido.types.map(item => item.type.name)
    };

    sessionStorage.setItem("POKEMON_SELECIONADO", JSON.stringify(pokemonParaSalvar));

    location.href = "simulacao-batalha.html";
}