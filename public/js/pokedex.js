var abas = [];
var pokemonList = [];
var pokemonSelected = [];

const containerSelected = document.querySelector(".containerCardSelected")
const containerCard = document.querySelector(".containerCard")


function SelecionarAba(Aba){

   document.querySelector(".selectedAba")?.classList.remove("selectedAba")

   var abaSelecionada = document.querySelector(`#aba${Aba}`)
   abaSelecionada.classList.add("selectedAba")

    var regulamento = Aba == 0 ? 151 : 251;
    var inicio = Aba == 0 ? 1 : 152;

   GetPokemonList(regulamento, inicio)

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

        pokemonList = await Promise.all(promises);

        ConstruirCardList()

    }catch (error){

        console.error(error)

    }
        
}

async function GetPokemonList (regulamento, inicio) {

    pokemonList = []
    const promises = [] 

    for (let i = inicio; i <= regulamento; i++) {
        promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}`).then(res => res.json()));
    }

    try {
        pokemonList = await Promise.all(promises);

        ConstruirCardList()
    }catch (error){
        console.error(error);
    }

}

function ConstruirCardList(){

    var list = "";

    for (let i = 0; i < pokemonList.length; i++) {
        let element = pokemonList[i];
        const type1 = element.types[0].type.name
        const type2 = element.types[1] ? element.types[1].type.name : ""
        let idDex = element.id + "";
        
        switch (idDex.length) {
            case 1: 
            idDex = `000${element.id}`
            break
            case 2: 
            idDex = `00${element.id}`
            break
            case 3: 
            idDex = `0${element.id}`
            break
            case 4: 
            idDex = `${element.id}`
        }

        list += `
        <div class="pokemonCard">
            <div class="img">
                 <img src="${element.sprites.front_default}"
                alt="">
            </div>
            <div class="detalhes">
                <div class="identificador"><span class="numeracao">${idDex}</span><h3>${element.name}</h3></div>
                <div class="tiposContainer">
                    <span class="tipo tipo1 ${type1}">${type1}</span>
                    <span class="tipo tipo2 ${type2}">${type2}</span>
                </div>
            </div>
        </div>
        `
    }

    containerCard.innerHTML = list;

}

function Adicionar(pokemon){
    if (pokemonSelected.length < 6){
        pokemonSelected.push(pokemonList[pokemon])
        ConstruirCardSelectd()
    }else{
        var continuar = confirm("Seu time esta cheio deseja deseja continuar ?")
        if(continuar){
            pokemonSelected.slice(0, 1)
            pokemonSelected.push(pokemonList[pokemon])
            document.querySelector(".cardSelecionado").remove()
            ConstruirCardSelectd()
        }   
    }
}

function ConstruirCardSelectd(){

    for (let i = 0; i < pokemonSelected.length; i++) {
        const element = pokemonSelected[i];
        const type1 = element.types[0].type.name
        const type2 = element.types[1] ? element.types[1].type.name : null
        
        var time = ""
        time = `
        <div id="IdPokemon${i}" class="cardSelecionado">
            <img src="${element.sprites.front_default}" alt="">
            <div class="selecionadosDetalhes">
                <h3><a href="#" onclick="">${element.name}</a></h3>
                <span class="tipo1 ${type1}">${type1}</span>
                <span class="tipo2 ${type2? type2 : "" }">${type2? type2 : ""}</span>
            </div>
            <button class="excluir" onclick="RemoverPokemon('IdPokemon${i}', ${i})"><img id="imgExcluir" src="assets/icon/Icon-Trash.svg" alt=""></button>
        </div>
        `
    }

    containerSelected.innerHTML += time;

}

function RemoverPokemon(pokemon, index){

    pokemonSelected.splice(index, 1)
    document.querySelector(`#${pokemon}`).remove()

}