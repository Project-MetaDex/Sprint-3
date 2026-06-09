var abas = [];
var pokemonList = [];
var pokemonListCompleta = [];
var pokemonSelected = [];
var geracoes = [
    { inicio: 1, fim: 151 },
    { inicio: 152, fim: 251 },
    { inicio: 252, fim: 386 },
    { inicio: 387, fim: 493 },
    { inicio: 494, fim: 649 },
    { inicio: 650, fim: 721 },
    { inicio: 722, fim: 809 },
    { inicio: 810, fim: 905 },
    { inicio: 906, fim: 1025 }
];

const containerSelected = document.querySelector(".containerCardSelected")
const containerCard = document.querySelector(".containerCard")

window.addEventListener("load", () => {
    restaurarTimeSelecionado();
    carregarEquipeEditando();

    const nomeTime = document.getElementById("nomeTime");

    if (nomeTime) {
        const nomeSalvo = sessionStorage.getItem("NOME_TIME_SELECIONADO");

        if (nomeSalvo) {
            nomeTime.value = nomeSalvo;
        }

        nomeTime.oninput = () => {
            sessionStorage.setItem("NOME_TIME_SELECIONADO", nomeTime.value);
        };
    }

    const botaoSalvar = document.getElementById("btnSalvar");
    if (botaoSalvar) {
        botaoSalvar.onclick = salvarSelecao;
    }
});


function SelecionarAba(Aba){

   document.querySelector(".selectedAba")?.classList.remove("selectedAba")

   var abaSelecionada = document.querySelector(`#aba${Aba}`)
    var indiceGeracao = Number(abaSelecionada.dataset.geracao)
    var geracaoSelecionada = geracoes[indiceGeracao]

   abaSelecionada.classList.add("selectedAba")

    GetPokemonList(geracaoSelecionada.fim, geracaoSelecionada.inicio)

}

async function Filter(type) {

    document.querySelector(".selectedAba")?.classList.remove("selectedAba")
    document.querySelector(".filterSelected")?.classList.remove("filterSelected")
    document.querySelector(`#${type}`)?.classList.add("filterSelected")


    pokemonList = []
    const promises = []

    try{

        var res = await fetch(`https://pokeapi.co/api/v2/type/${type}`).then(resp => resp.json())

        for (let i = 0; i < res.pokemon.length; i++) {
            promises.push(fetch(res.pokemon[i].pokemon.url).then(response => response.json()))
        }

        pokemonListCompleta = await Promise.all(promises);
        pokemonList = pokemonListCompleta;

        PesquisarPokemon()

    }catch (error){

        console.error(error)

    }
        
}

async function GetPokemonList (fim, inicio) {

    pokemonList = []
    pokemonListCompleta = []
    const promises = [] 

    for (let i = inicio; i <= fim; i++) {
        promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}`).then(res => res.json()));
    }

    try {
        pokemonListCompleta = await Promise.all(promises);
        pokemonList = pokemonListCompleta;

        PesquisarPokemon()
    }catch (error){
        console.error(error);
    }

}

function PesquisarPokemon(){

    var pesquisa = document.getElementById("barraPesquisa").value.toLowerCase().trim()

    if (pesquisa == "") {
        pokemonList = pokemonListCompleta
    } else {
        pokemonList = pokemonListCompleta.filter(pokemon => pokemon.name.toLowerCase().includes(pesquisa))
    }

    ConstruirCardList()

}

function ConstruirCardList(){

    var list = "";

    for (let i = 0; i < pokemonList.length; i++) {
        let element = pokemonList[i];
        const type1 = element.types[0].type.name
        const type2 = element.types[1] ? element.types[1].type.name : null

        list += `
        <div class="pokemonCard">

            <div class="pokemonContainer">
              <img src="${element.sprites.front_default}" alt="">
              <div class="detalhes">
                <h3>${element.name}</h3>
                <span class="tipo1 ${type1}">${type1}</span>
                <span class="tipo2 ${type2? type2 : "" }">${type2? type2 : ""}</span>
              </div>
            </div>

            <Button onclick="Adicionar(${i})" class="addButton">Adicionar</Button>
          </div>
        `
    }

    containerCard.innerHTML = list;

}

function Adicionar(pokemon){
    if (pokemonSelected.length < 6){
        pokemonSelected.push(pokemonList[pokemon])
        ConstruirCardSelectd()
        persistirTimeSelecionado()
    }else{
        var continuar = confirm("Seu time esta cheio deseja deseja continuar ?")
        if(continuar){
            pokemonSelected.splice(0, 1)
            pokemonSelected.push(pokemonList[pokemon])
            document.querySelector(".cardSelecionado").remove()
            ConstruirCardSelectd()
            persistirTimeSelecionado()
        }   
    }
}

function ConstruirCardSelectd(){

    var time = ""
    containerSelected.innerHTML = "";

    for (let i = 0; i < pokemonSelected.length; i++) {
        const element = pokemonSelected[i];
        const type1 = element.types[0].type.name
        const type2 = element.types[1] ? element.types[1].type.name : null

        time = `
        <div id="IdPokemon${i}" class="cardSelecionado">
            <img src="${element.sprites.front_default}" alt="">
            <div class="selecionadosDetalhes">
                <h3><a href="#" onclick="EditarPokemon(${i})">${element.name}</a></h3>
                <span class="tipos tipo1 ${type1}">${type1}</span>
                <span class="tipos tipo2 ${type2? type2 : "" }">${type2? type2 : ""}</span>
            </div>
            <button class="excluir" onclick="RemoverPokemon('IdPokemon${i}', ${i})"><img id="imgExcluir" src="assets/icon/Icon-Trash.svg" alt=""></button>
        </div>
        `

        containerSelected.innerHTML += time;
    }

}

function RemoverPokemon(pokemon, index){

    pokemonSelected.splice(index, 1)
    ConstruirCardSelectd()
    persistirTimeSelecionado()

}

function EditarPokemon(index){  

    sessionStorage.setItem("POKEMON_EDITANDO", String(index));
    persistirNomeTime();
    persistirTimeSelecionado();

    location.href = "teamBuilder-Pokemon.html"

}

function persistirNomeTime(){
    const nomeTime = document.getElementById("nomeTime");

    if (nomeTime) {
        sessionStorage.setItem("NOME_TIME_SELECIONADO", nomeTime.value);
    }
}

function persistirTimeSelecionado(){
    sessionStorage.setItem("TOTAL_POKEMONS_TIME", String(pokemonSelected.length));

    for (let i = 0; i < 6; i++) {
        sessionStorage.removeItem(`POKEMON${i}`);
        sessionStorage.removeItem(`pokemon${i + 1}`);
    }

    for (let i = 0; i < pokemonSelected.length; i++) {
        sessionStorage.setItem(`POKEMON${i}`, JSON.stringify(pokemonSelected[i]));
        sessionStorage.setItem(`pokemon${i + 1}`, JSON.stringify(montarPokemonParaSalvar(pokemonSelected[i])));
    }
}

function limparPokemonsTemporarios(){
    for (let i = 0; i < 6; i++) {
        sessionStorage.removeItem(`POKEMON${i}`);
        sessionStorage.removeItem(`pokemon${i + 1}`);
    }

    sessionStorage.removeItem("TOTAL_POKEMONS_TIME");
    sessionStorage.removeItem("POKEMON_EDITANDO");
}

function montarPokemonParaSalvar(pokemon){
    var ataques = pokemon.ataquesSelecionados || [];
    var status = pokemon.statusSelecionados || {};

    return {
        idPokemon: Number(pokemon.idPokemon || pokemon.fkPokemon || pokemon.id),
        nome: pokemon.nome || pokemon.name,
        Ataque1: pegarNomeAtaque(ataques[0]),
        Ataque2: pegarNomeAtaque(ataques[1]),
        Ataque3: pegarNomeAtaque(ataques[2]),
        Ataque4: pegarNomeAtaque(ataques[3]),
        HP: Number(status.HP ?? status.hp ?? 0),
        Attack: Number(status.Attack ?? status.attack ?? status.ataque ?? 0),
        Defense: Number(status.Defense ?? status.defense ?? status.defesa ?? 0),
        SpAtk: Number(status.SpAtk ?? status.ataqueEsp ?? 0),
        SpDef: Number(status.SpDef ?? status.defesaEsp ?? 0),
        Speed: Number(status.Speed ?? status.velocidade ?? 0)
    };
}

function pegarNomeAtaque(ataque){
    if (!ataque) {
        return null;
    }

    return ataque.nome || ataque.name || ataque.move?.name || ataque;
}

function montarPokemonsParaSalvar(){
    var totalSalvo = Number(sessionStorage.getItem("TOTAL_POKEMONS_TIME"));
    var pokemonsParaSalvar = [];

    for (let i = 0; i < totalSalvo; i++) {
        var pokemonSalvo = sessionStorage.getItem(`pokemon${i + 1}`);

        if (!pokemonSalvo) {
            var pokemonCompleto = sessionStorage.getItem(`POKEMON${i}`);
            pokemonSalvo = pokemonCompleto ? JSON.stringify(montarPokemonParaSalvar(JSON.parse(pokemonCompleto))) : null;
        }

        if (pokemonSalvo) {
            pokemonsParaSalvar.push(JSON.parse(pokemonSalvo));
        }
    }

    return pokemonsParaSalvar;
}

function restaurarTimeSelecionado(){
    pokemonSelected = [];

    const totalSalvo = Number(sessionStorage.getItem("TOTAL_POKEMONS_TIME"));

    for (let i = 0; i < totalSalvo; i++) {
        const pokemonSalvo = sessionStorage.getItem(`POKEMON${i}`);

        if (pokemonSalvo) {
            pokemonSelected.push(JSON.parse(pokemonSalvo));
        }
    }

    ConstruirCardSelectd();
}

async function carregarEquipeEditando(){
    var idEquipe = sessionStorage.getItem("TIME_EDITANDO");
    var idUsuario = sessionStorage.ID_USUARIO;

    if (!idEquipe || !idUsuario) {
        return;
    }

    try {
        const resposta = await fetch("/equipes/buscarEquipe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idEquipeServer: idEquipe,
                idUsuarioServer: idUsuario
            })
        });

        if (resposta.status === 204) {
            return;
        }

        if (!resposta.ok) {
            throw new Error("Erro ao buscar equipe para edição.");
        }

        const equipe = await resposta.json();
        const nomeTime = document.getElementById("nomeTime");

        if (nomeTime && equipe[0]) {
            nomeTime.value = equipe[0].nomeEquipe;
            sessionStorage.setItem("NOME_TIME_SELECIONADO", equipe[0].nomeEquipe);
        }

        pokemonSelected = [];

        for (let i = 0; i < equipe.length; i++) {
            const pokemonBanco = equipe[i];
            const pokemonApi = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonBanco.idPokemon}`).then(res => res.json());
            const ataquesBanco = [pokemonBanco.Ataque1, pokemonBanco.Ataque2, pokemonBanco.Ataque3, pokemonBanco.Ataque4];

            pokemonApi.ataquesSelecionados = ataquesBanco.map((ataqueBanco, index) => {
                var ataqueApi = pokemonApi.moves.find(ataque => ataque.move.name == ataqueBanco) || pokemonApi.moves[index];

                return {
                    nome: ataqueBanco || ataqueApi.move.name,
                    url: ataqueApi.move.url,
                    tipo: null
                };
            });

            pokemonApi.statusSelecionados = {
                hp: pokemonBanco.HP,
                attack: pokemonBanco.Attack,
                defense: pokemonBanco.Defense,
                ataqueEsp: pokemonBanco.SpAtk,
                defesaEsp: pokemonBanco.SpDef,
                velocidade: pokemonBanco.Speed
            };

            pokemonSelected.push(pokemonApi);
        }

        ConstruirCardSelectd();
        persistirTimeSelecionado();
    } catch (error) {
        console.error("Erro ao carregar equipe para edição:", error);
        alert("Não foi possível carregar a equipe para edição.");
    }
}


async function salvarSelecao() {
    persistirTimeSelecionado();

    var pokemonsParaSalvar = montarPokemonsParaSalvar();

    if (!pokemonsParaSalvar.length) {
        alert("Selecione pelo menos um Pokémon antes de continuar.");
        return;
    }

    var nomeTime = document.getElementById("nomeTime").value.trim();
    var idUsuario = sessionStorage.ID_USUARIO;

    if (!nomeTime) {
        alert("Informe o nome do time antes de salvar.");
        return;
    }

    if (!idUsuario) {
        alert("Faça login antes de salvar uma equipe.");
        return;
    }

    try {
        var idEquipeEditando = sessionStorage.getItem("TIME_EDITANDO");
        var rota = idEquipeEditando ? "/equipes/editarEquipe" : "/equipes/salvarEquipe";

        const resposta = await fetch(rota, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idEquipeServer: idEquipeEditando,
                nomeServer: nomeTime,
                idUsuarioServer: idUsuario,
                pokemonsServer: pokemonsParaSalvar
            })
        });

        if (!resposta.ok) {
            const mensagemErro = await resposta.text();
            throw new Error(mensagemErro || "Erro ao salvar equipe.");
        }

        sessionStorage.removeItem("TIME_EDITANDO");
        sessionStorage.removeItem("NOME_TIME_SELECIONADO");
        limparPokemonsTemporarios();
        location.href = "teamBuilder-List.html";
    } catch (error) {
        console.error("Erro ao salvar equipe:", error);
        alert("Não foi possível salvar a equipe.");
    }

}