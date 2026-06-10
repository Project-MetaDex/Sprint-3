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
                    <button class="editar" onc// team builder - lista de duelos
// le do localStorage
var duelos = JSON.parse(localStorage.getItem("DUELOS_SALVOS") || "null");
if (!duelos) {
 duelos = [];
 localStorage.setItem("DUELOS_SALVOS", JSON.stringify(duelos));
}

function urlSprite(id) {
 return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + id + ".png";
}

function capitalize(s) {
 if (!s) return "";
 return s.charAt(0).toUpperCase() + s.slice(1);
}

function salvarDuelos() {
 localStorage.setItem("DUELOS_SALVOS", JSON.stringify(duelos));
}

// init
document.addEventListener("DOMContentLoaded", function () {
 renderDuelos(duelos);

 var barra = document.getElementById("barraPesquisa");
 if (barra) {
 barra.addEventListener("input", function () {
 var termo = barra.value.toLowerCase().trim();
 if (!termo) {
 renderDuelos(duelos);
 return;
 }
 var filtrado = [];
 for (var i = 0; i < duelos.length; i++) {
 if (duelos[i].nome.toLowerCase().indexOf(termo) !== -1) {
 filtrado.push(duelos[i]);
 }
 }
 renderDuelos(filtrado);
 });
 }
});

function renderDuelos(lista) {
 var container = document.getElementById("listaDuelos");

 if (!lista.length) {
 container.innerHTML =
 '<div class="empty-state">' +
 '<p>Nenhum duelo criado ainda.</p>' +
 '<button onclick="criarNovoDuelo()">+ Criar primeiro duelo</button>' +
 '</div>';
 return;
 }

 var html = "";
 for (var i = 0; i < lista.length; i++) {
 var d = lista[i];
 var idx = duelos.indexOf(d);

 var temMeu = d.meu && d.meu.pokemon;
 var temAdv = d.adversario && d.adversario.pokemon;

 var meuNome = temMeu ? capitalize(d.meu.pokemon.name) : "-";
 var advNome = temAdv ? capitalize(d.adversario.pokemon.name) : "-";
 var meuImg = temMeu ? urlSprite(d.meu.pokemon.id) : "";
 var advImg = temAdv ? urlSprite(d.adversario.pokemon.id) : "";

 var lado1Html = temMeu
 ? '<img src="' + meuImg + '" alt="' + meuNome + '"><span>' + meuNome + '</span>'
 : '<div class="slot-vazio">?</div><span>' + meuNome + '</span>';

 var lado2Html = temAdv
 ? '<img src="' + advImg + '" alt="' + advNome + '"><span>' + advNome + '</span>'
 : '<div class="slot-vazio">?</div><span>' + advNome + '</span>';

 var btnSimularDisabled = (temMeu && temAdv) ? "" : "disabled";

 html +=
 '<div class="card">' +
 '<div class="card-title-row">' +
 '<h2>' + d.nome + '</h2>' +
 '<span class="data-badge">' + d.data + '</span>' +
 '</div>' +
 '<div class="duelo-preview">' +
 '<div class="poke-slot-preview">' + lado1Html + '</div>' +
 '<div class="vs-badge">VS</div>' +
 '<div class="poke-slot-preview">' + lado2Html + '</div>' +
 '</div>' +
 '<div class="buttons">' +
 '<button class="editar" onclick="editarDuelo(' + idx + ')">Configurar</button>' +
 '<button class="simular" onclick="simularDuelo(' + idx + ')" ' + btnSimularDisabled + '>Simular</button>' +
 '<button class="excluir" onclick="excluirDuelo(' + idx + ')">' +
 '<img src="assets/icon/Icon-Trash.svg" alt="Excluir">' +
 '</button>' +
 '</div>' +
 '</div>';
 }

 container.innerHTML = html;
}

function criarNovoDuelo() {
 var novo = {
 id: Date.now(),
 nome: "Duelo " + (duelos.length + 1),
 data: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }),
 meu: null,
 adversario: null
 };
 duelos.push(novo);
 salvarDuelos();
 localStorage.setItem("DUELO_EDITANDO_IDX", String(duelos.length - 1));
 window.location.href = "teamBuilder-Selection.html";
}

function criarNovaDuelo() { criarNovoDuelo(); }

function editarDuelo(idx) {
 localStorage.setItem("DUELO_EDITANDO_IDX", String(idx));
 window.location.href = "teamBuilder-Selection.html";
}

function simularDuelo(idx) {
 var d = duelos[idx];
 if (d && d.meu && d.meu.pokemon && d.adversario && d.adversario.pokemon) {
 sessionStorage.setItem("BATALHA_MEU", JSON.stringify({ id: d.meu.pokemon.id, name: d.meu.pokemon.name }));
 sessionStorage.setItem("BATALHA_ADV", JSON.stringify({ id: d.adversario.pokemon.id, name: d.adversario.pokemon.name }));
 window.location.href = "simulacao1.html";
 return;
 }
 // Se o duelo estiver incompleto, manda configurar
 editarDuelo(idx);
}

function excluirDuelo(idx) {
 duelos.splice(idx, 1);
 salvarDuelos();
 renderDuelos(duelos);
}
lick="editarTime(${equipe.idEquipe})">Editar</button>
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
