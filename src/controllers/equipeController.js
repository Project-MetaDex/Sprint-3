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

    function listarEquipes(req, res){
        var idUsuario = req.body.idUsuarioServer;

        console.log(idUsuario)

        if(!idUsuario){
            return res.status(400).send('O ID está undefined!');
        }

        equipeModel.listarEquipes(idUsuario)
        .then(
            function (resultado) {
                if (resultado.length > 0){

                    res.status(200).json(resultado);

                }else {

                    res.status(204).send("Nenhum resultado encontrado!")

                }

            }
        )
        .catch(
            function (erro){
                console.log(erro)
                console.log(
                    "Houve um erro ao buscar as equipes: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);

            }
        );
    }


function getPokemonEquipe(req, res){
    var idEquipe = req.body.fkPokemonEquipServer

    console.log(`Buscando pokemons da equipe: ${idEquipe}`)

    if(!idEquipe){
            return res.status(400).send('O ID está undefined!');
        }

        equipeModel.getPokemonEquipe(idEquipe)
        .then(
            function (resultado) {
                if (resultado.length > 0){

                    res.status(200).json(resultado);

                }else {

                    res.status(204).send("Nenhum resultado encontrado!")

                }

            }
        )
        .catch(
            function (erro){
                console.log(erro)
                console.log(
                    "Houve um erro ao buscar os Pókemon: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);

            }
        );

}

module.exports = {
    pokemonsMaisUsados,
    listarEquipes,
    getPokemonEquipe
}