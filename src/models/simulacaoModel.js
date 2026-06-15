var database = require("../database/config")

function logDeAcesso(funcao, dados) {
    console.log("ACESSEI O SIMULACAO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n " + funcao + ":", dados);
}

function criarSimulacao(simulacao) {
    logDeAcesso("function criarSimulacao()", simulacao);

    var usuario = simulacao.usuario;
    var adversario = simulacao.adversario;

    return garantirPokemonCadastrado(usuario)
        .then(function () {
            return garantirPokemonCadastrado(adversario);
        })
        .then(function () {
            var instrucaoSql = `
            INSERT INTO SimulacaoUsuario (
                fkUsuario,
                fkPokemonUsuario,
                Resultado,
                Ataque1,
                Ataque2,
                Ataque3,
                Ataque4,
                HP,
                Attack,
                Defense,
                SpAtk,
                SpDef,
                Speed,
                Log
            ) VALUES (
                ${Number(simulacao.idUsuario)},
                ${Number(usuario.idPokemon)},
                ${formatarTexto(simulacao.resultado)},
                ${formatarObrigatorio(usuario.Ataque1)},
                ${formatarObrigatorio(usuario.Ataque2)},
                ${formatarObrigatorio(usuario.Ataque3)},
                ${formatarObrigatorio(usuario.Ataque4)},
                ${Number(usuario.HP) || 0},
                ${Number(usuario.Attack) || 0},
                ${Number(usuario.Defense) || 0},
                ${Number(usuario.SpAtk) || 0},
                ${Number(usuario.SpDef) || 0},
                ${Number(usuario.Speed) || 0},
                ${formatarTexto(simulacao.log)}
            );
            `;

            console.log("Salvando simulação no sistema: \n" + instrucaoSql);
            return database.executar(instrucaoSql);
        })
        .then(function (resultadoSimulacao) {
            var idSimulacao = resultadoSimulacao.insertId;

            return inserirAdversario(idSimulacao, adversario)
                .then(function () {
                    return {
                        idSimulacao: idSimulacao,
                        fkUsuario: Number(simulacao.idUsuario),
                        resultado: simulacao.resultado
                    };
                });
        });
}

function listarSimulacoes(idUsuario) {
    logDeAcesso("function listarSimulacoes()", idUsuario);

    var instrucaoSql = `
    SELECT
        s.idSimulacaoUsuario,
        s.Resultado,
        s.DataBatalha,
        pu.idPokemon AS idPokemonUsuario,
        pu.nome AS nomePokemonUsuario,
        pa.idPokemon AS idPokemonAdversario,
        pa.nome AS nomePokemonAdversario
    FROM SimulacaoUsuario s
        INNER JOIN Pokemon pu ON s.fkPokemonUsuario = pu.idPokemon
        LEFT JOIN SimulacaoAdversario adv ON adv.fkSimulacao = s.idSimulacaoUsuario
        LEFT JOIN Pokemon pa ON adv.PokemonAdversario = pa.idPokemon
    WHERE s.fkUsuario = ${Number(idUsuario)}
    ORDER BY s.idSimulacaoUsuario DESC;
    `;

    console.log("Puxando lista de simulações do usuário: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarSimulacao(idSimulacao, idUsuario) {
    logDeAcesso("function buscarSimulacao()", idSimulacao);

    var instrucaoSql = `
    SELECT
        s.idSimulacaoUsuario,
        s.fkUsuario,
        s.Resultado,
        s.DataBatalha,
        s.Log,
        s.Ataque1 AS usuarioAtaque1,
        s.Ataque2 AS usuarioAtaque2,
        s.Ataque3 AS usuarioAtaque3,
        s.Ataque4 AS usuarioAtaque4,
        s.HP AS usuarioHP,
        s.Attack AS usuarioAttack,
        s.Defense AS usuarioDefense,
        s.SpAtk AS usuarioSpAtk,
        s.SpDef AS usuarioSpDef,
        s.Speed AS usuarioSpeed,
        pu.idPokemon AS idPokemonUsuario,
        pu.nome AS nomePokemonUsuario,
        adv.PokemonAdversario AS idPokemonAdversario,
        pa.nome AS nomePokemonAdversario,
        adv.Ataque1 AS adversarioAtaque1,
        adv.Ataque2 AS adversarioAtaque2,
        adv.Ataque3 AS adversarioAtaque3,
        adv.Ataque4 AS adversarioAtaque4,
        adv.HP AS adversarioHP,
        adv.Attack AS adversarioAttack,
        adv.Defense AS adversarioDefense,
        adv.SpAtk AS adversarioSpAtk,
        adv.SpDef AS adversarioSpDef,
        adv.Speed AS adversarioSpeed
    FROM SimulacaoUsuario s
        INNER JOIN Pokemon pu ON s.fkPokemonUsuario = pu.idPokemon
        LEFT JOIN SimulacaoAdversario adv ON adv.fkSimulacao = s.idSimulacaoUsuario
        LEFT JOIN Pokemon pa ON adv.PokemonAdversario = pa.idPokemon
    WHERE s.idSimulacaoUsuario = ${Number(idSimulacao)} AND s.fkUsuario = ${Number(idUsuario)};
    `;

    console.log("Buscando simulação: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function excluirSimulacao(idSimulacao, idUsuario) {
    logDeAcesso("function excluirSimulacao()", idSimulacao);

    var instrucaoSql = `
    DELETE FROM SimulacaoUsuario WHERE idSimulacaoUsuario = ${Number(idSimulacao)} AND fkUsuario = ${Number(idUsuario)};
    `;

    console.log("Excluindo simulação: \n" + instrucaoSql);
    return database.executar(instrucaoSql)
        .then(function (resultado) {
            if (resultado.affectedRows == 0) {
                return Promise.reject("Simulação não encontrada para este usuário.");
            }

            return {
                idSimulacao: Number(idSimulacao),
                fkUsuario: Number(idUsuario),
                mensagem: "Simulação excluída com sucesso."
            };
        });
}

function editarSimulacao(simulacao) {
    logDeAcesso("function editarSimulacao()", simulacao);

    var idSimulacao = Number(simulacao.idSimulacao);
    var idUsuario = Number(simulacao.idUsuario);
    var usuario = simulacao.usuario;
    var adversario = simulacao.adversario;

    var instrucaoBusca = `
    SELECT idSimulacaoUsuario FROM SimulacaoUsuario
        WHERE idSimulacaoUsuario = ${idSimulacao} AND fkUsuario = ${idUsuario};
    `;

    console.log("Verificando simulação para edição: \n" + instrucaoBusca);

    return database.executar(instrucaoBusca)
        .then(function (resultadoBusca) {
            if (resultadoBusca.length == 0) {
                return Promise.reject("Simulação não encontrada para este usuário.");
            }

            return garantirPokemonCadastrado(usuario);
        })
        .then(function () {
            return garantirPokemonCadastrado(adversario);
        })
        .then(function () {
            var instrucaoUpdate = `
            UPDATE SimulacaoUsuario SET
                fkPokemonUsuario = ${Number(usuario.idPokemon)},
                Resultado = ${formatarTexto(simulacao.resultado)},
                Ataque1 = ${formatarObrigatorio(usuario.Ataque1)},
                Ataque2 = ${formatarObrigatorio(usuario.Ataque2)},
                Ataque3 = ${formatarObrigatorio(usuario.Ataque3)},
                Ataque4 = ${formatarObrigatorio(usuario.Ataque4)},
                HP = ${Number(usuario.HP) || 0},
                Attack = ${Number(usuario.Attack) || 0},
                Defense = ${Number(usuario.Defense) || 0},
                SpAtk = ${Number(usuario.SpAtk) || 0},
                SpDef = ${Number(usuario.SpDef) || 0},
                Speed = ${Number(usuario.Speed) || 0},
                Log = ${formatarTexto(simulacao.log)}
            WHERE idSimulacaoUsuario = ${idSimulacao} AND fkUsuario = ${idUsuario};
            `;

            console.log("Editando simulação: \n" + instrucaoUpdate);
            return database.executar(instrucaoUpdate);
        })
        .then(function () {
            var instrucaoDelete = `
            DELETE FROM SimulacaoAdversario WHERE fkSimulacao = ${idSimulacao};
            `;

            console.log("Limpando adversário antigo da simulação: \n" + instrucaoDelete);
            return database.executar(instrucaoDelete);
        })
        .then(function () {
            return inserirAdversario(idSimulacao, adversario);
        })
        .then(function () {
            return {
                idSimulacao: idSimulacao,
                fkUsuario: idUsuario,
                resultado: simulacao.resultado
            };
        });
}

function inserirAdversario(idSimulacao, adversario) {
    var instrucaoAdversario = `
    INSERT INTO SimulacaoAdversario (
        fkSimulacao,
        PokemonAdversario,
        Ataque1,
        Ataque2,
        Ataque3,
        Ataque4,
        HP,
        Attack,
        Defense,
        SpAtk,
        SpDef,
        Speed
    ) VALUES (
        ${Number(idSimulacao)},
        ${Number(adversario.idPokemon)},
        ${formatarObrigatorio(adversario.Ataque1)},
        ${formatarObrigatorio(adversario.Ataque2)},
        ${formatarObrigatorio(adversario.Ataque3)},
        ${formatarObrigatorio(adversario.Ataque4)},
        ${Number(adversario.HP) || 0},
        ${Number(adversario.Attack) || 0},
        ${Number(adversario.Defense) || 0},
        ${Number(adversario.SpAtk) || 0},
        ${Number(adversario.SpDef) || 0},
        ${Number(adversario.Speed) || 0}
    );
    `;

    console.log("Salvando adversário da simulação: \n" + instrucaoAdversario);
    return database.executar(instrucaoAdversario);
}

function garantirPokemonCadastrado(pokemon) {
    var instrucaoSql = `
    INSERT INTO Pokemon (idPokemon, nome) VALUES (${Number(pokemon.idPokemon)}, ${formatarTexto(pokemon.nome)})
        ON DUPLICATE KEY UPDATE nome = VALUES(nome);
    `;

    console.log("Garantindo Pokémon cadastrado: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function formatarTexto(valor) {
    if (valor == undefined || valor == null || valor == '') {
        return 'NULL';
    }

    return `'${String(valor).replace(/'/g, "''")}'`;
}

function formatarObrigatorio(valor) {
    if (valor == undefined || valor == null) {
        return `''`;
    }

    return `'${String(valor).replace(/'/g, "''")}'`;
}

module.exports = {
    criarSimulacao,
    editarSimulacao,
    listarSimulacoes,
    buscarSimulacao,
    excluirSimulacao
}
