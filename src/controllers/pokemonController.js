var pokemonModel = require("../models/pokemonModel");

function rankingMaisUsados(req, res) {
    pokemonModel.rankingMaisUsados()
        .then(function (resultadoPokemon) {
            if (resultadoPokemon.length > 0) {
                res.status(200).json(resultadoPokemon);
            } else {
                res.status(204).send("Nenhum Pokémon encontrado para o ranking.");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao pegar o ranking de Pokémon! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    rankingMaisUsados
}
