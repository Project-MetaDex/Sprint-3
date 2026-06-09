var times = [];

window.addEventListener("load", () => {
    const barraPesquisa = document.getElementById("barraPesquisa");

    if (barraPesquisa) {
        barraPesquisa.oninput = pesquisarTimes;
    }
});

async function listarTimes() {
    var idUsuario = sessionStorage.ID_USUARIO;
    var cardEquipe = "";
    times = [];

    console.log(idUsuario)

    try {
        
        const res = await fetch("/equipes/listarEquipes/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idUsuarioServer: idUsuario }),
        });

        if (res.status === 204) { // Correção para comparação
            console.log("Nenhum time cadastrado");
            times = [];
            document.querySelector(".cardTimes").innerHTML = "<p>Nenhum time cadastrado</p>";
            return; // Encerra a função se não tiver time
        }
        if (!res.ok) throw new Error("Erro na rede ao buscar times");

        const equipes = await res.json();
        console.log("Dados recebidos: ", equipes);

        // Usamos for...of para permitir o uso do await dentro do loop
        for (const equipe of equipes) {
        
            const pokemonEquipe = await getPokemonEquipe(equipe.idEquipe);

            const dataFormatada = new Date(equipe.dataCriacao).toLocaleDateString('pt-BR');
            const textoPesquisa = normalizarTexto(`${equipe.nome} ${pokemonEquipe.nomes.join(" ")}`);

            times.push({
                idEquipe: equipe.idEquipe,
                textoPesquisa: textoPesquisa
            });

            cardEquipe += `
            <div class="card" id="card-${equipe.idEquipe}" data-pesquisa="${textoPesquisa}">
                <div id="iconCard">
                    <img src="assets/icon/Icon_Poke.svg" alt="">
                </div>

                <div class="cardTitle">
                    <h2>${equipe.nome}</h2>
                    <p>Criado em ${dataFormatada}</p>
                </div>

                <div class="buttons">
                    <button class="editar" onclick="editarTime(${equipe.idEquipe})">Editar</button>
                    <button class="excluir" onclick="excluirTime(${equipe.idEquipe})">
                        <img id="imgExcluir" src="assets/icon/Icon-Trash.svg" alt="">
                    </button>
                </div>

                ${pokemonEquipe.html}
            </div>
            `;
        }

        
        document.querySelector(".cardTimes").innerHTML = cardEquipe;

    } catch (error) {
        console.error("Erro ao listar times:", error);
    }
}

async function getPokemonEquipe(idEquipe) {
    let pokemonImg = `<ul class="imgList">`;
    let nomesPokemon = [];

    try {
        const res = await fetch("/equipes/getPokemonEquipe/", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fkPokemonEquipServer: idEquipe }), 
        });

        if (!res.ok) throw new Error("Erro ao buscar Pokémons da equipe");
        if (res.status === 204) { 
            return {
                html: `<ul class="imgList"><li>Sem Pokémons</li></ul>`,
                nomes: []
            };
        }

        console.log("Dados recebidos: ", res);

        const pokemons = await res.json();


        for (const pokemon of pokemons) {   
            nomesPokemon.push(pokemon.nome);
            
            const pokemonData = await getPokemon(pokemon.nome);
            
            if (pokemonData) {
                const imagem = pokemonData.sprites.other["official-artwork"].front_default;
                pokemonImg += `<li><img src="${imagem}" alt=""></li>`;
            }
        }

        pokemonImg += `</ul>`;
        return {
            html: pokemonImg,
            nomes: nomesPokemon
        }; 

    } catch (error) {
        console.error("Erro ao montar imagens da equipe:", error);
        return {
            html: `<ul class="imgList"><li>Erro ao carregar imagens</li></ul>`,
            nomes: nomesPokemon
        };
    }
}

function pesquisarTimes() {
    const pesquisa = normalizarTexto(document.getElementById("barraPesquisa").value);
    const cards = document.querySelectorAll(".cardTimes .card");
    var qtdVisivel = 0;

    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const textoCard = card.dataset.pesquisa || "";
        const encontrou = textoCard.includes(pesquisa);

        card.style.display = encontrou ? "" : "none";

        if (encontrou) {
            qtdVisivel++;
        }
    }

    let avisoPesquisa = document.getElementById("avisoPesquisaTimes");

    if (!avisoPesquisa) {
        avisoPesquisa = document.createElement("p");
        avisoPesquisa.id = "avisoPesquisaTimes";
        document.querySelector(".cardTimes").appendChild(avisoPesquisa);
    }

    avisoPesquisa.innerText = pesquisa && qtdVisivel == 0 ? "Nenhum time encontrado" : "";
}

function normalizarTexto(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

async function getPokemon(pokemon) {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);

        if (!res.ok) {
            throw new Error(`Pokémon não encontrado Status: ${res.status}`);
        }

        const pokemonData = await res.json();
        return pokemonData;

    } catch (error) {
        console.error("Falha ao buscar os dados do pokemon:", error);
        return null; 
    }
}

function criarNovoTime() {
    limparTimeSelecionado();
    sessionStorage.removeItem("TIME_EDITANDO");
        sessionStorage.removeItem("NOME_TIME_SELECIONADO");
  location.href = "teamBuilder-Selection.html";
}

function editarTime(index) {
  sessionStorage.setItem("TIME_EDITANDO", String(index));
  location.href = "teamBuilder-Selection.html";
}

function limparTimeSelecionado() {
  const totalSalvo = Number(sessionStorage.getItem("TOTAL_POKEMONS_TIME"));

  if (totalSalvo) {
    for (let i = 0; i < totalSalvo; i++) {
      sessionStorage.removeItem(`POKEMON${i}`);
            sessionStorage.removeItem(`pokemon${i + 1}`);
    }
  }

    for (let i = 0; i < 6; i++) {
        sessionStorage.removeItem(`POKEMON${i}`);
        sessionStorage.removeItem(`pokemon${i + 1}`);
    }

  sessionStorage.removeItem("TOTAL_POKEMONS_TIME");
  sessionStorage.removeItem("POKEMON_EDITANDO");
}

async function excluirTime(id) {
    var confirmarExclusao = confirm("Deseja excluir esta equipe?");

    if (!confirmarExclusao) {
        return;
    }

    var idUsuario = sessionStorage.ID_USUARIO;

    if (!idUsuario) {
        alert("Usuário não encontrado. Faça login novamente.");
        return;
    }

    try {
        const res = await fetch("/equipes/excluirEquipe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idEquipeServer: id,
                idUsuarioServer: idUsuario,
            }),
        });

        if (!res.ok) {
            const mensagemErro = await res.text();
            throw new Error(mensagemErro || "Erro ao excluir equipe");
        }

        document.querySelector(`#card-${id}`)?.remove();
        await listarTimes();
    } catch (error) {
        console.error("Erro ao excluir time:", error);
        alert("Não foi possível excluir a equipe.");
    }
}
