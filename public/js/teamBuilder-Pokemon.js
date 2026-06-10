var pokemon = [];
var pokemonEditandoIndex = 0;
var ataqueEditandoIndex = null;

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
        <div id="IdPokemon${i}" class="cardSelecionado ${i == pokemonEditandoIndex ? 'pokemonSelecionadoEditando' : ''}" onclick="EditarPokemon(${i})">
            <img src="${element.sprites.front_default}" alt="">
            <div class="selecionadosDetalhes">
                <h3><a href="#" onclick="event.stopPropagation(); EditarPokemon(${i})">${element.name}</a></h3>
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
            salvarStatusPokemonAtual();
            location.href = "teamBuilder-Selection.html";
        };
    }
}

function EditarPokemon(index) {
    pokemonEditandoIndex = index;
    ataqueEditandoIndex = null;
    sessionStorage.setItem("POKEMON_EDITANDO", String(index));
    fecharListaAtaques();
    renderizarPokemonEmEdicao();
}

async function renderizarPokemonEmEdicao() {
    const indexSalvo = Number(sessionStorage.getItem("POKEMON_EDITANDO"));

    if (!Number.isNaN(indexSalvo)) {
        pokemonEditandoIndex = indexSalvo;
    }

    ConstruirCardSelectd();

    if (pokemonEditandoIndex >= pokemon.length) {
        pokemonEditandoIndex = 0;
        sessionStorage.setItem("POKEMON_EDITANDO", "0");
    }

    const pokemonAtual = pokemon[pokemonEditandoIndex] || pokemon[0];
    if (!pokemonAtual) {
        return;
    }

    carregarStatusPokemonAtual(pokemonAtual);

    const nomePokemon = document.querySelector(".nomePokemon");
    const imagemPokemon = document.querySelector(".imgPokemon");
    const tipos = document.querySelectorAll(".tipos .etiqueta");
    const statusBase = document.querySelectorAll(".statusGridBase .statusLinha strong");

    if (nomePokemon) {
        nomePokemon.textContent = formatarNome(pokemonAtual.name);
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

    await renderizarAtaques(pokemonAtual);
}

async function renderizarAtaques(pokemonAtual){
    const listaAtaques = document.querySelector(".containerGolpes ul");

    if (!listaAtaques) {
        return;
    }

    garantirAtaquesSelecionados(pokemonAtual);

    const ataques = pokemonAtual.ataquesSelecionados;
    let htmlAtaques = "";

    for (let i = 0; i < ataques.length; i++) {
        const ataque = ataques[i];
        let tipoAtaque = pokemonAtual.types[0]?.type.name || "normal";

        if (ataque.tipo) {
            tipoAtaque = ataque.tipo;
        } else if (ataque.url) {
            tipoAtaque = await buscarTipoAtaque(ataque.url, tipoAtaque);
            ataque.tipo = tipoAtaque;
        }

        htmlAtaques += `
            <li class="ataques" onclick="abrirListaAtaques(${i})">
                <img src="${pegarIconeTipo(tipoAtaque)}" alt="${tipoAtaque}">
                <span>${formatarNome(ataque.nome)}</span>
                <span>></span>
            </li>
        `;
    }

    listaAtaques.innerHTML = htmlAtaques;
}

function garantirAtaquesSelecionados(pokemonAtual){
    if (pokemonAtual.ataquesSelecionados && pokemonAtual.ataquesSelecionados.length == 4) {
        return;
    }

    pokemonAtual.ataquesSelecionados = pokemonAtual.moves.slice(0, 4).map((ataque) => {
        return {
            nome: ataque.move.name,
            url: ataque.move.url,
            tipo: null
        };
    });
}

async function buscarTipoAtaque(url, tipoPadrao){
    try {
        const resposta = await fetch(url);
        const dadosAtaque = await resposta.json();
        return dadosAtaque.type?.name || tipoPadrao;
    } catch (error) {
        console.error("Erro ao buscar dados do ataque:", error);
        return tipoPadrao;
    }
}

function abrirListaAtaques(index){
    ataqueEditandoIndex = index;

    const pokemonAtual = pokemon[pokemonEditandoIndex];
    const containerGolpes = document.querySelector(".containerGolpes");

    if (!pokemonAtual || !containerGolpes) {
        return;
    }

    let lista = document.querySelector(".listaAtaquesPokemon");

    if (!lista) {
        lista = document.createElement("div");
        lista.classList.add("listaAtaquesPokemon");
        containerGolpes.appendChild(lista);
    }

    let conteudo = `
        <div class="listaAtaquesTitulo">
            <span>Escolha o ataque</span>
            <button onclick="fecharListaAtaques()">x</button>
        </div>
    `;

    for (let i = 0; i < pokemonAtual.moves.length; i++) {
        const ataque = pokemonAtual.moves[i].move;

        conteudo += `
            <button class="opcaoAtaque" onclick="selecionarAtaque(${i})">
                ${formatarNome(ataque.name)}
            </button>
        `;
    }

    lista.innerHTML = conteudo;
    lista.style.display = "flex";
}

function fecharListaAtaques(){
    const lista = document.querySelector(".listaAtaquesPokemon");

    if (lista) {
        lista.style.display = "none";
    }
}

async function selecionarAtaque(indexAtaque){
    const pokemonAtual = pokemon[pokemonEditandoIndex];

    if (!pokemonAtual || ataqueEditandoIndex == null) {
        return;
    }

    const ataqueSelecionado = pokemonAtual.moves[indexAtaque].move;
    const tipoPadrao = pokemonAtual.types[0]?.type.name || "normal";
    const tipoAtaque = await buscarTipoAtaque(ataqueSelecionado.url, tipoPadrao);

    garantirAtaquesSelecionados(pokemonAtual);

    pokemonAtual.ataquesSelecionados[ataqueEditandoIndex] = {
        nome: ataqueSelecionado.name,
        url: ataqueSelecionado.url,
        tipo: tipoAtaque
    };

    pokemon[pokemonEditandoIndex] = pokemonAtual;
    sessionStorage.setItem(`POKEMON${pokemonEditandoIndex}`, JSON.stringify(pokemonAtual));
    fecharListaAtaques();
    await renderizarAtaques(pokemonAtual);
}

function formatarNome(nome){
    return nome.replace(/-/g, " ").replace(/\b\w/g, letra => letra.toUpperCase());
}

function pegarIconeTipo(tipo){
    const icones = {
        water: "Agua.svg",
        dragon: "Dragão.svg",
        electric: "Eletrico.svg",
        fairy: "Fada.svg",
        ghost: "Fantasma.svg",
        fire: "Fogo.svg",
        ice: "Gelo.svg",
        grass: "Grama.svg",
        bug: "Inseto.svg",
        fighting: "Lutador.svg",
        steel: "Metal.svg",
        normal: "Normal.svg",
        dark: "Noturno.svg",
        rock: "Pedra.svg",
        psychic: "Psiquico.svg",
        ground: "Terra.svg",
        poison: "Veneno.svg",
        flying: "Voador.svg"
    };

    return `assets/icon/tipo/${icones[tipo] || icones.normal}`;
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
    salvarStatusPokemonAtual();
}

function definirStatus(status, valor) {
    var novoValor = Number(valor);

    if (Number.isNaN(novoValor) || novoValor < 0) {
        novoValor = 0;
    }

    if (novoValor > limitePorStatus) {
        novoValor = limitePorStatus;
    }

    const valorAnterior = statusPokemon[status];
    const totalSemStatusAtual = calcularTotalStatus() - valorAnterior;

    if (totalSemStatusAtual + novoValor > limitePontos) {
        novoValor = limitePontos - totalSemStatusAtual;
    }

    statusPokemon[status] = novoValor;
    atualizarStatusTela();
    salvarStatusPokemonAtual();
}

function carregarStatusPokemonAtual(pokemonAtual) {
    statusPokemon.hp = Number(pokemonAtual.statusSelecionados?.hp || 0);
    statusPokemon.ataque = Number(pokemonAtual.statusSelecionados?.ataque || pokemonAtual.statusSelecionados?.attack || 0);
    statusPokemon.defesa = Number(pokemonAtual.statusSelecionados?.defesa || pokemonAtual.statusSelecionados?.defense || 0);
    statusPokemon.ataqueEsp = Number(pokemonAtual.statusSelecionados?.ataqueEsp || 0);
    statusPokemon.defesaEsp = Number(pokemonAtual.statusSelecionados?.defesaEsp || 0);
    statusPokemon.velocidade = Number(pokemonAtual.statusSelecionados?.velocidade || 0);

    atualizarStatusTela();
}

function salvarStatusPokemonAtual() {
    const pokemonAtual = pokemon[pokemonEditandoIndex];

    if (!pokemonAtual) {
        return;
    }

    pokemonAtual.statusSelecionados = {
        hp: statusPokemon.hp,
        HP: statusPokemon.hp,
        ataque: statusPokemon.ataque,
        defesa: statusPokemon.defesa,
        attack: statusPokemon.ataque,
        defense: statusPokemon.defesa,
        Attack: statusPokemon.ataque,
        Defense: statusPokemon.defesa,
        SpAtk: statusPokemon.ataqueEsp,
        SpDef: statusPokemon.defesaEsp,
        Speed: statusPokemon.velocidade,
        ataqueEsp: statusPokemon.ataqueEsp,
        defesaEsp: statusPokemon.defesaEsp,
        velocidade: statusPokemon.velocidade
    };

    pokemon[pokemonEditandoIndex] = pokemonAtual;
    sessionStorage.setItem(`POKEMON${pokemonEditandoIndex}`, JSON.stringify(pokemonAtual));
    sessionStorage.setItem(`pokemon${pokemonEditandoIndex + 1}`, JSON.stringify({
        idPokemon: Number(pokemonAtual.idPokemon || pokemonAtual.fkPokemon || pokemonAtual.id),
        nome: pokemonAtual.nome || pokemonAtual.name,
        Ataque1: pokemonAtual.ataquesSelecionados?.[0]?.nome || null,
        Ataque2: pokemonAtual.ataquesSelecionados?.[1]?.nome || null,
        Ataque3: pokemonAtual.ataquesSelecionados?.[2]?.nome || null,
        Ataque4: pokemonAtual.ataquesSelecionados?.[3]?.nome || null,
        HP: statusPokemon.hp,
        Attack: statusPokemon.ataque,
        Defense: statusPokemon.defesa,
        SpAtk: statusPokemon.ataqueEsp,
        SpDef: statusPokemon.defesaEsp,
        Speed: statusPokemon.velocidade
    }));
}

function calcularTotalStatus() {
    return Object.values(statusPokemon).reduce((total, valor) => total + valor, 0);
}

function atualizarStatusTela() {
    document.getElementById("hp").value = statusPokemon.hp;
    document.getElementById("ataque").value = statusPokemon.ataque;
    document.getElementById("defesa").value = statusPokemon.defesa;
    document.getElementById("ataqueEsp").value = statusPokemon.ataqueEsp;
    document.getElementById("defesaEsp").value = statusPokemon.defesaEsp;
    document.getElementById("velocidade").value = statusPokemon.velocidade;

    const pontosRestantes = limitePontos - calcularTotalStatus();
    document.getElementById("pontosRestantes").innerText = pontosRestantes;
}