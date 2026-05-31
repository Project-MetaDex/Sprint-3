document.addEventListener("DOMContentLoaded", () => {
    const pokemonSelecionado = "bulbasaur";

    const listaAtaques = document.querySelector("#lista-ataques-pokeapi");
    const listaTms = document.querySelector("#lista-tms-pokeapi");

    if (!listaAtaques || !listaTms) {
        console.error("As listas de ataques ou TMs não foram encontradas no HTML.");
        return;
    }

    carregarDadosDoPokemon(pokemonSelecionado, listaAtaques, listaTms);
});

async function carregarDadosDoPokemon(nomePokemon, listaAtaques, listaTms) {
    try {
        listaAtaques.innerHTML = "<li class='mensagem-lista'>Carregando ataques...</li>";
        listaTms.innerHTML = "<li class='mensagem-lista'>Carregando TMs...</li>";

        const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nomePokemon}`);

        if (!resposta.ok) {
            throw new Error("Não foi possível buscar o Pokémon selecionado.");
        }

        const pokemon = await resposta.json();

        const ataquesDoPokemon = obterMovimentosPorMetodo(pokemon.moves, "level-up");
        const tmsDoPokemon = obterMovimentosPorMetodo(pokemon.moves, "machine");

        await criarCardsDeAtaques(ataquesDoPokemon, listaAtaques);
        await criarCardsDeTms(tmsDoPokemon, listaTms);

    } catch (erro) {
        listaAtaques.innerHTML = "<li class='mensagem-lista erro'>Erro ao carregar ataques.</li>";
        listaTms.innerHTML = "<li class='mensagem-lista erro'>Erro ao carregar TMs.</li>";
        console.error(erro);
    }
}

function obterMovimentosPorMetodo(movimentos, metodo) {
    const movimentosFiltrados = movimentos.filter((movimento) => {
        return movimento.version_group_details.some((detalhe) => {
            return detalhe.move_learn_method.name === metodo;
        });
    });

    const movimentosSemRepeticao = [];

    movimentosFiltrados.forEach((movimento) => {
        const jaExiste = movimentosSemRepeticao.some((item) => {
            return item.move.name === movimento.move.name;
        });

        if (!jaExiste) {
            movimentosSemRepeticao.push(movimento);
        }
    });

    return movimentosSemRepeticao;
}

async function criarCardsDeAtaques(ataques, listaAtaques) {
    listaAtaques.innerHTML = "";

    if (ataques.length === 0) {
        listaAtaques.innerHTML = "<li class='mensagem-lista'>Nenhum ataque encontrado.</li>";
        atualizarContador(listaAtaques, 0);
        return;
    }

    const detalhesAtaques = await Promise.all(
        ataques.map((ataque) => buscarDetalhesDoMovimento(ataque.move.url))
    );

    detalhesAtaques
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((ataque) => {
            const card = document.createElement("li");
            card.classList.add("card-movimento");

            card.innerHTML = `
                <div class="movimento-cabecalho">
                    <h3>${formatarNome(ataque.name)}</h3>
                    <span class="tipo-mini ${ataque.type.name}">
                        ${traduzirTipo(ataque.type.name)}
                    </span>
                </div>

                <div class="movimento-info">
                    <p><strong>Poder</strong>${ataque.power ?? "-"}</p>
                    <p><strong>Precisão</strong>${ataque.accuracy ?? "-"}</p>
                    <p><strong>PP</strong>${ataque.pp ?? "-"}</p>
                    <p><strong>Classe</strong>${formatarNome(ataque.damage_class.name)}</p>
                </div>
            `;

            listaAtaques.appendChild(card);
        });

    atualizarContador(listaAtaques, detalhesAtaques.length);
}

async function criarCardsDeTms(tms, listaTms) {
    listaTms.innerHTML = "";

    if (tms.length === 0) {
        listaTms.innerHTML = "<li class='mensagem-lista'>Nenhuma TM encontrada.</li>";
        atualizarContador(listaTms, 0);
        return;
    }

    const detalhesTms = await Promise.all(
        tms.map((tm) => buscarDetalhesDoMovimento(tm.move.url))
    );

    detalhesTms
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((tm) => {
            const card = document.createElement("li");
            card.classList.add("card-movimento");

            card.innerHTML = `
                <div class="movimento-cabecalho">
                    <h3>${formatarNome(tm.name)}</h3>
                    <span class="tipo-mini ${tm.type.name}">
                        ${traduzirTipo(tm.type.name)}
                    </span>
                </div>

                <div class="movimento-info">
                    <p><strong>Poder</strong>${tm.power ?? "-"}</p>
                    <p><strong>Precisão</strong>${tm.accuracy ?? "-"}</p>
                    <p><strong>PP</strong>${tm.pp ?? "-"}</p>
                    <p><strong>Classe</strong>${formatarNome(tm.damage_class.name)}</p>
                </div>
            `;

            listaTms.appendChild(card);
        });

    atualizarContador(listaTms, detalhesTms.length);
}

async function buscarDetalhesDoMovimento(url) {
    const resposta = await fetch(url);

    if (!resposta.ok) {
        throw new Error("Erro ao buscar detalhes do movimento.");
    }

    return await resposta.json();
}

function atualizarContador(lista, total) {
    const cardLista = lista.closest(".card-lista");

    if (!cardLista) {
        return;
    }

    const contador = cardLista.querySelector(".contador-lista");

    if (contador) {
        contador.textContent = total;
    }
}

function formatarNome(nome) {
    return nome
        .split("-")
        .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
        .join(" ");
}

function traduzirTipo(tipo) {
    const tipos = {
        normal: "NORMAL",
        fire: "FOGO",
        water: "ÁGUA",
        electric: "ELÉTRICO",
        grass: "GRAMA",
        ice: "GELO",
        fighting: "LUTADOR",
        poison: "VENENO",
        ground: "TERRA",
        flying: "VOADOR",
        psychic: "PSÍQUICO",
        bug: "INSETO",
        rock: "PEDRA",
        ghost: "FANTASMA",
        dragon: "DRAGÃO",
        dark: "SOMBRIO",
        steel: "AÇO",
        fairy: "FADA"
    };

    return tipos[tipo] || tipo.toUpperCase();
}