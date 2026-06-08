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
    persistirTimeSelecionado();

    location.href = "teamBuilder-Pokemon.html"

}

function persistirTimeSelecionado(){
    sessionStorage.setItem("TOTAL_POKEMONS_TIME", String(pokemonSelected.length));

    for (let i = 0; i < 6; i++) {
        sessionStorage.removeItem(`POKEMON${i}`);
    }

    for (let i = 0; i < pokemonSelected.length; i++) {
        sessionStorage.setItem(`POKEMON${i}`, JSON.stringify(pokemonSelected[i]));
    }
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


function salvarSelecao() {
    if (!pokemonSelected.length) {
        alert("Selecione pelo menos um Pokémon antes de continuar.");
        return;
    }

    location.href = "teamBuilder-List.html"
}