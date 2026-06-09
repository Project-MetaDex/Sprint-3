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

function salvarEquipe(req, res) {
    var nome = req.body.nomeServer;
    var idUsuario = Number(req.body.idUsuarioServer);
    var pokemons = req.body.pokemonsServer;

    if (!nome) {
        return res.status(400).send('O nome da equipe está undefined!');
    }

    if (!idUsuario) {
        return res.status(400).send('O ID do usuário está undefined! Use o sessionStorage.ID_USUARIO.');
    }

    if (!pokemons || !Array.isArray(pokemons) || pokemons.length == 0) {
        return res.status(400).send('A equipe precisa ter pelo menos um Pokémon.');
    }

    if (pokemons.length > 6) {
        return res.status(400).send('A equipe pode ter no máximo 6 Pokémon.');
    }

    var idsPokemon = [];
    var pokemonsNormalizados = [];

    for (let i = 0; i < pokemons.length; i++) {
        var pokemon = pokemons[i];
        var idPokemon = Number(pokemon.idPokemon || pokemon.fkPokemon || pokemon.id);
        var nomePokemon = pokemon.nome || pokemon.name;

        if (!idPokemon || !nomePokemon) {
            return res.status(400).send(`O Pokémon da posição ${i + 1} está sem id ou nome.`);
        }

        if (idsPokemon.includes(idPokemon)) {
            return res.status(400).send(`O Pokémon ${nomePokemon} já foi adicionado nesta equipe.`);
        }

        idsPokemon.push(idPokemon);

        pokemonsNormalizados.push({
            idPokemon: idPokemon,
            nome: nomePokemon,
            Ataque1: pegarAtaque(pokemon, 0),
            Ataque2: pegarAtaque(pokemon, 1),
            Ataque3: pegarAtaque(pokemon, 2),
            Ataque4: pegarAtaque(pokemon, 3),
            Attack: Number(pegarValorStatus(pokemon, 'Attack', 'attack', 'attack')),
            Defense: Number(pegarValorStatus(pokemon, 'Defense', 'defense', 'defense')),
            SpAtk: Number(pegarValorStatus(pokemon, 'SpAtk', 'ataqueEsp', 'special-attack')),
            SpDef: Number(pegarValorStatus(pokemon, 'SpDef', 'defesaEsp', 'special-defense')),
            Speed: Number(pegarValorStatus(pokemon, 'Speed', 'velocidade', 'speed'))
        });
    }

    equipeModel.salvarEquipe(nome, idUsuario, pokemonsNormalizados)
        .then(
            function (resultado) {
                res.status(201).json(resultado);
            }
        )
        .catch(
            function (erro) {
                console.log(erro)
                console.log(
                    "Houve um erro ao salvar a equipe: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage || erro);
            }
        );
}

function buscarEquipe(req, res) {
    var idEquipe = Number(req.body.idEquipeServer);
    var idUsuario = Number(req.body.idUsuarioServer);

    if (!idEquipe) {
        return res.status(400).send('O ID da equipe está undefined!');
    }

    if (!idUsuario) {
        return res.status(400).send('O ID do usuário está undefined!');
    }

    equipeModel.buscarEquipe(idEquipe, idUsuario)
        .then(
            function (resultado) {
                if (resultado.length > 0) {
                    res.status(200).json(resultado);
                } else {
                    res.status(204).send("Nenhuma equipe encontrada!");
                }
            }
        )
        .catch(
            function (erro) {
                console.log(erro)
                console.log(
                    "Houve um erro ao buscar a equipe: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);
            }
        );
}

function editarEquipe(req, res) {
    var idEquipe = Number(req.body.idEquipeServer);
    var nome = req.body.nomeServer;
    var idUsuario = Number(req.body.idUsuarioServer);
    var pokemons = req.body.pokemonsServer;

    if (!idEquipe) {
        return res.status(400).send('O ID da equipe está undefined!');
    }

    if (!nome) {
        return res.status(400).send('O nome da equipe está undefined!');
    }

    if (!idUsuario) {
        return res.status(400).send('O ID do usuário está undefined! Use o sessionStorage.ID_USUARIO.');
    }

    if (!pokemons || !Array.isArray(pokemons) || pokemons.length == 0) {
        return res.status(400).send('A equipe precisa ter pelo menos um Pokémon.');
    }

    if (pokemons.length > 6) {
        return res.status(400).send('A equipe pode ter no máximo 6 Pokémon.');
    }

    var idsPokemon = [];
    var pokemonsNormalizados = [];

    for (let i = 0; i < pokemons.length; i++) {
        var pokemon = pokemons[i];
        var idPokemon = Number(pokemon.idPokemon || pokemon.fkPokemon || pokemon.id);
        var nomePokemon = pokemon.nome || pokemon.name;

        if (!idPokemon || !nomePokemon) {
            return res.status(400).send(`O Pokémon da posição ${i + 1} está sem id ou nome.`);
        }

        if (idsPokemon.includes(idPokemon)) {
            return res.status(400).send(`O Pokémon ${nomePokemon} já foi adicionado nesta equipe.`);
        }

        idsPokemon.push(idPokemon);

        pokemonsNormalizados.push({
            idPokemon: idPokemon,
            nome: nomePokemon,
            Ataque1: pegarAtaque(pokemon, 0),
            Ataque2: pegarAtaque(pokemon, 1),
            Ataque3: pegarAtaque(pokemon, 2),
            Ataque4: pegarAtaque(pokemon, 3),
            Attack: Number(pegarValorStatus(pokemon, 'Attack', 'attack', 'attack')),
            Defense: Number(pegarValorStatus(pokemon, 'Defense', 'defense', 'defense')),
            SpAtk: Number(pegarValorStatus(pokemon, 'SpAtk', 'ataqueEsp', 'special-attack')),
            SpDef: Number(pegarValorStatus(pokemon, 'SpDef', 'defesaEsp', 'special-defense')),
            Speed: Number(pegarValorStatus(pokemon, 'Speed', 'velocidade', 'speed'))
        });
    }

    equipeModel.editarEquipe(idEquipe, nome, idUsuario, pokemonsNormalizados)
        .then(
            function (resultado) {
                res.status(200).json(resultado);
            }
        )
        .catch(
            function (erro) {
                console.log(erro)
                console.log(
                    "Houve um erro ao editar a equipe: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage || erro);
            }
        );
}

function excluirEquipe(req, res) {
    var idEquipe = Number(req.body.idEquipeServer);
    var idUsuario = Number(req.body.idUsuarioServer);

    if (!idEquipe) {
        return res.status(400).send('O ID da equipe está undefined!');
    }

    if (!idUsuario) {
        return res.status(400).send('O ID do usuário está undefined!');
    }

    equipeModel.excluirEquipe(idEquipe, idUsuario)
        .then(
            function (resultado) {
                res.status(200).json(resultado);
            }
        )
        .catch(
            function (erro) {
                console.log(erro)
                console.log(
                    "Houve um erro ao excluir a equipe: ",
                    erro.sqlMessage || erro
                );

                if (typeof erro == 'string') {
                    return res.status(404).send(erro);
                }

                res.status(500).json(erro.sqlMessage || erro);
            }
        );
}

function pegarAtaque(pokemon, index) {
    if (pokemon.ataquesSelecionados && pokemon.ataquesSelecionados[index]) {
        return pokemon.ataquesSelecionados[index].nome || pokemon.ataquesSelecionados[index].name || pokemon.ataquesSelecionados[index];
    }

    if (pokemon.ataques && pokemon.ataques[index]) {
        return pokemon.ataques[index].nome || pokemon.ataques[index].name || pokemon.ataques[index];
    }

    if (pokemon.movesSelecionados && pokemon.movesSelecionados[index]) {
        return pokemon.movesSelecionados[index].nome || pokemon.movesSelecionados[index].name || pokemon.movesSelecionados[index];
    }

    if (pokemon.moves && pokemon.moves[index]) {
        return pokemon.moves[index].move.name;
    }

    return null;
}

function pegarValorStatus(pokemon, campoBanco, campoSelecionado, nomeStatApi) {
    if (pokemon[campoBanco] != undefined) {
        return pokemon[campoBanco];
    }

    if (pokemon.statusSelecionados && pokemon.statusSelecionados[campoSelecionado] != undefined) {
        return pokemon.statusSelecionados[campoSelecionado];
    }

    if (pokemon.stats) {
        var statEncontrada = pokemon.stats.find(stat => stat.stat && stat.stat.name == nomeStatApi);
        return statEncontrada ? statEncontrada.base_stat : 0;
    }

    return 0;
}

function listarEquipes(req, res) {
    var idUsuario = req.body.idUsuarioServer;

    console.log(idUsuario)

    if (!idUsuario) {
        return res.status(400).send('O ID está undefined!');
    }

    equipeModel.listarEquipes(idUsuario)
        .then(
            function (resultado) {
                if (resultado.length > 0) {

                    res.status(200).json(resultado);

                } else {

                    res.status(204).send("Nenhum resultado encontrado!")

                }

            }
        )
        .catch(
            function (erro) {
                console.log(erro)
                console.log(
                    "Houve um erro ao buscar as equipes: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);

            }
        );
}


function getPokemonEquipe(req, res) {
    var idEquipe = req.body.fkPokemonEquipServer

    console.log(`Buscando pokemons da equipe: ${idEquipe}`)

    if (!idEquipe) {
        return res.status(400).send('O ID está undefined!');
    }

    equipeModel.getPokemonEquipe(idEquipe)
        .then(
            function (resultado) {
                if (resultado.length > 0) {

                    res.status(200).json(resultado);

                } else {

                    res.status(204).send("Nenhum resultado encontrado!")

                }

            }
        )
        .catch(
            function (erro) {
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
    salvarEquipe,
    buscarEquipe,
    editarEquipe,
    excluirEquipe,
    getPokemonEquipe
}