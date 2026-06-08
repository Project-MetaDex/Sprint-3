var times = [];

async function listarTimes() {
    var idUsuario = sessionStorage.ID_USUARIO;
    var cardEquipe = "";

    console.log(idUsuario)

    try {
        
        const res = await fetch("/equipes/listarEquipes/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idUsuarioServer: idUsuario }),
        });

        if (!res.ok) throw new Error("Erro na rede ao buscar times");
        if (res.status === 204) { // Correção para comparação
            console.log("Nenhum time cadastrado");
            return; // Encerra a função se não tiver time
        }

        const equipes = await res.json();
        console.log("Dados recebidos: ", equipes);

        // Usamos for...of para permitir o uso do await dentro do loop
        for (const equipe of equipes) {
        
            const pokemonEquipeHtml = await getPokemonEquipe(equipe.idEquipe);

            cardEquipe += `
            <div class="card" id="card-${equipe.idEquipe}">
                <div id="iconCard">
                    <img src="assets/icon/Icon_Poke.svg" alt="">
                </div>

                <div class="cardTitle">
                    <h2>${equipe.nome}</h2>
                    <p>Criado em ${equipe.dataCriacao}</p>
                </div>

                <div class="buttons">
                    <button class="editar" onclick="editarTime(${equipe.idEquipe})">Editar</button>
                    <button class="excluir" onclick="excluirTime(${equipe.idEquipe})">
                        <img id="imgExcluir" src="assets/icon/Icon-Trash.svg" alt="">
                    </button>
                </div>

                ${pokemonEquipeHtml}
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

    try {
        const res = await fetch("/equipes/getPokemonEquipe/", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fkPokemonEquipServer: idEquipe }), // Corrigido para a variável certa
        });

        if (!res.ok) throw new Error("Erro ao buscar Pokémons da equipe");
        if (res.status === 204) { // Corrigido para comparação estrita ===
            return `<ul class="imgList"><li>Sem Pokémons</li></ul>`;
        }

        console.log("Dados recebidos: ", res);

        const pokemons = await res.json();


        for (const pokemon of pokemons) {   
            // AWAIT: Espera a PokeAPI responder antes de seguir
            const pokemonData = await getPokemon(pokemon.nome);
            
            if (pokemonData) {
                // CORREÇÃO: Uso de colchetes ["official-artwork"]
                const imagem = pokemonData.sprites.other["official-artwork"].front_default;
                pokemonImg += `<li><img src="${imagem}" alt=""></li>`;
            }
        }

        pokemonImg += `</ul>`;
        return pokemonImg; // Agora retorna a string completa no tempo certo

    } catch (error) {
        console.error("Erro ao montar imagens da equipe:", error);
        return `<ul class="imgList"><li>Erro ao carregar imagens</li></ul>`;
    }
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
        return null; // Retorna nulo em caso de erro para não quebrar o layout
    }
}

function criarNovoTime() {
  // limparTimeSelecionado();
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
    }
  }

  sessionStorage.removeItem("TOTAL_POKEMONS_TIME");
  sessionStorage.removeItem("POKEMON_EDITANDO");
}

function excluirTime(id) {
  times.splice(id, 1);
  document.querySelector(`#card-${id + 1}`)?.remove();
}
