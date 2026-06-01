var equipeModel = require("../models/equipeModel");

    function pokemonsMaisUsados(req, res) {
        var idUsuario = req.params.idUsuario;

        if (idUsuario == undefined) {
                return res.status(400).send('O ID do Aluno está undefined!');
            } else {
        
                equipeModel.pokemonsMaisUsados(idUsuario)
                    .then(function (resultadoPokemon) {
                        if (resultadoPokemon.length > 0) {
                            res.status(200).json(resultadoPokemon);
                        } else {
                            res.status(204).send("Nenhum Pokémon encontrado para este usuário.");
                        }
                    })
                    .catch(function (erro) {
                        console.log(erro);
                        console.log("\nHouve um erro ao pegar dados do Aluno! Erro: ", erro.sqlMessage);
                        res.status(500).json(erro.sqlMessage);
                    });
            }
    }

module.exports = {
    pokemonsMaisUsados
}