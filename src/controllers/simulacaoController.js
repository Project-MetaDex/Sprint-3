var simulacaoModel = require("../models/simulacaoModel");

function salvarSimulacao(req, res) {
    var idUsuario = Number(req.body.idUsuarioServer);
    var resultado = req.body.resultadoServer;
    var log = req.body.logServer;
    var usuario = req.body.usuarioServer;
    var adversario = req.body.adversarioServer;

    if (!idUsuario) {
        return res.status(400).send('O ID do usuário está undefined! Use o sessionStorage.ID_USUARIO.');
    }

    if (!usuario || !usuario.idPokemon || !usuario.nome) {
        return res.status(400).send('O Pokémon do usuário está sem id ou nome.');
    }

    if (!adversario || !adversario.idPokemon || !adversario.nome) {
        return res.status(400).send('O Pokémon adversário está sem id ou nome.');
    }

    if (resultado && ['vitoria', 'derrota', 'empate'].indexOf(resultado) === -1) {
        return res.status(400).send("O resultado precisa ser 'vitoria', 'derrota' ou 'empate'.");
    }

    var simulacao = {
        idUsuario: idUsuario,
        resultado: resultado,
        log: log,
        usuario: usuario,
        adversario: adversario
    };

    simulacaoModel.criarSimulacao(simulacao)
        .then(function (resultadoSimulacao) {
            res.status(201).json(resultadoSimulacao);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao salvar a simulação: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage || erro);
        });
}

function editarSimulacao(req, res) {
    var idSimulacao = Number(req.body.idSimulacaoServer);
    var idUsuario = Number(req.body.idUsuarioServer);
    var resultado = req.body.resultadoServer;
    var log = req.body.logServer;
    var usuario = req.body.usuarioServer;
    var adversario = req.body.adversarioServer;

    if (!idSimulacao) {
        return res.status(400).send('O ID da simulação está undefined!');
    }

    if (!idUsuario) {
        return res.status(400).send('O ID do usuário está undefined! Use o sessionStorage.ID_USUARIO.');
    }

    if (!usuario || !usuario.idPokemon || !usuario.nome) {
        return res.status(400).send('O Pokémon do usuário está sem id ou nome.');
    }

    if (!adversario || !adversario.idPokemon || !adversario.nome) {
        return res.status(400).send('O Pokémon adversário está sem id ou nome.');
    }

    if (resultado && ['vitoria', 'derrota', 'empate'].indexOf(resultado) === -1) {
        return res.status(400).send("O resultado precisa ser 'vitoria', 'derrota' ou 'empate'.");
    }

    var simulacao = {
        idSimulacao: idSimulacao,
        idUsuario: idUsuario,
        resultado: resultado,
        log: log,
        usuario: usuario,
        adversario: adversario
    };

    simulacaoModel.editarSimulacao(simulacao)
        .then(function (resultadoSimulacao) {
            res.status(200).json(resultadoSimulacao);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao editar a simulação: ", erro.sqlMessage || erro);

            if (typeof erro == 'string') {
                return res.status(404).send(erro);
            }

            res.status(500).json(erro.sqlMessage || erro);
        });
}

function listarSimulacoes(req, res) {
    var idUsuario = req.body.idUsuarioServer;

    if (!idUsuario) {
        return res.status(400).send('O ID do usuário está undefined!');
    }

    simulacaoModel.listarSimulacoes(idUsuario)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhuma simulação encontrada!");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao listar as simulações: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function buscarSimulacao(req, res) {
    var idSimulacao = Number(req.body.idSimulacaoServer);
    var idUsuario = Number(req.body.idUsuarioServer);

    if (!idSimulacao) {
        return res.status(400).send('O ID da simulação está undefined!');
    }

    if (!idUsuario) {
        return res.status(400).send('O ID do usuário está undefined!');
    }

    simulacaoModel.buscarSimulacao(idSimulacao, idUsuario)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado[0]);
            } else {
                res.status(204).send("Nenhuma simulação encontrada!");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar a simulação: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function excluirSimulacao(req, res) {
    var idSimulacao = Number(req.body.idSimulacaoServer);
    var idUsuario = Number(req.body.idUsuarioServer);

    if (!idSimulacao) {
        return res.status(400).send('O ID da simulação está undefined!');
    }

    if (!idUsuario) {
        return res.status(400).send('O ID do usuário está undefined!');
    }

    simulacaoModel.excluirSimulacao(idSimulacao, idUsuario)
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao excluir a simulação: ", erro.sqlMessage || erro);

            if (typeof erro == 'string') {
                return res.status(404).send(erro);
            }

            res.status(500).json(erro.sqlMessage || erro);
        });
}

module.exports = {
    salvarSimulacao,
    editarSimulacao,
    listarSimulacoes,
    buscarSimulacao,
    excluirSimulacao
}
