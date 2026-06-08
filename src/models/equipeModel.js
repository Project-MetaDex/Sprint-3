var database = require("../database/config")

function pokemonsMaisUsados(idUsuario) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function pokemonMaisUsados():", idUsuario);

    var instrucaoSql = `
        SELECT p.nome AS nomePokemon, COUNT(ep.fkPokemon) AS qtdUsado
        FROM Equipe e JOIN EquipePokemon ep ON e.idEquipe = ep.fkEquipe
            JOIN Pokemon p ON ep.fkPokemon = p.idPokemon
                WHERE e.fkUsuario = ${idUsuario} GROUP BY p.nome
                    ORDER BY qtdUsado DESC LIMIT 4;
    `;

    console.log("Puxando dados de pokemons usados: \n" + instrucaoSql);
        return database.executar(instrucaoSql);
}

function listarEquipes(idUsuario){
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function listarEquipes():", idUsuario);

    var instrucaoSql =`
    SELECT * FROM Equipe WHERE fkUsuario = ${idUsuario};
    `;

    console.log("Puxando lista de equipes do usuario: \n" + instrucaoSql);
        return database.executar(instrucaoSql);

}

function salvarEquipe(nome, idUsuario, pokemons){
    console.log("ACESSEI O EQUIPE MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function salvarEquipe():", nome, idUsuario, pokemons);

    var instrucaoSql = `
    INSERT INTO Equipe (nome, fkUsuario) VALUES (${formatarTexto(nome)}, ${idUsuario});
    `;

    console.log("Salvando equipe no sistema: \n" + instrucaoSql);

    return database.executar(instrucaoSql)
        .then(function(resultadoEquipe){
            var idEquipe = resultadoEquipe.insertId;
            var promessas = [];

            for (let i = 0; i < pokemons.length; i++) {
                promessas.push(salvarPokemonEquipe(idEquipe, pokemons[i]));
            }

            return Promise.all(promessas)
                .then(function(){
                    return {
                        idEquipe: idEquipe,
                        nome: nome,
                        fkUsuario: Number(idUsuario),
                        qtdPokemons: pokemons.length
                    };
                });
        });
}

function buscarEquipe(idEquipe, idUsuario){
    console.log("ACESSEI O EQUIPE MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function buscarEquipe():", idEquipe, idUsuario);

    var instrucaoSql = `
    SELECT 
        e.idEquipe,
        e.nome AS nomeEquipe,
        e.fkUsuario,
        p.idPokemon,
        p.nome AS nomePokemon,
        ep.Ataque1,
        ep.Ataque2,
        ep.Ataque3,
        ep.Ataque4,
        ep.Attack,
        ep.Defense,
        ep.SpAtk,
        ep.SpDef,
        ep.Speed
    FROM Equipe e
        INNER JOIN EquipePokemon ep ON e.idEquipe = ep.fkEquipe
        INNER JOIN Pokemon p ON ep.fkPokemon = p.idPokemon
    WHERE e.idEquipe = ${idEquipe} AND e.fkUsuario = ${idUsuario};
    `;

    console.log("Buscando equipe para edição: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function editarEquipe(idEquipe, nome, idUsuario, pokemons){
    console.log("ACESSEI O EQUIPE MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function editarEquipe():", idEquipe, nome, idUsuario, pokemons);

    var instrucaoSql = `
    UPDATE Equipe SET nome = ${formatarTexto(nome)} WHERE idEquipe = ${idEquipe} AND fkUsuario = ${idUsuario};
    `;

    console.log("Editando equipe: \n" + instrucaoSql);

    return database.executar(instrucaoSql)
        .then(function(resultadoEdicao){
            if(resultadoEdicao.affectedRows == 0){
                return Promise.reject("Equipe não encontrada para este usuário.");
            }

            var instrucaoDelete = `
            DELETE FROM EquipePokemon WHERE fkEquipe = ${idEquipe};
            `;

            console.log("Limpando Pokémon antigos da equipe: \n" + instrucaoDelete);
            return database.executar(instrucaoDelete);
        })
        .then(function(){
            var promessas = [];

            for (let i = 0; i < pokemons.length; i++) {
                promessas.push(salvarPokemonEquipe(idEquipe, pokemons[i]));
            }

            return Promise.all(promessas);
        })
        .then(function(){
            return {
                idEquipe: idEquipe,
                nome: nome,
                fkUsuario: Number(idUsuario),
                qtdPokemons: pokemons.length
            };
        });
}

function excluirEquipe(idEquipe, idUsuario){
    console.log("ACESSEI O EQUIPE MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function excluirEquipe():", idEquipe, idUsuario);

    var instrucaoBusca = `
    SELECT idEquipe FROM Equipe WHERE idEquipe = ${idEquipe} AND fkUsuario = ${idUsuario};
    `;

    console.log("Verificando equipe para exclusão: \n" + instrucaoBusca);

    return database.executar(instrucaoBusca)
        .then(function(resultadoBusca){
            if(resultadoBusca.length == 0){
                return Promise.reject("Equipe não encontrada para este usuário.");
            }

            var instrucaoDeletePokemons = `
            DELETE FROM EquipePokemon WHERE fkEquipe = ${idEquipe};
            `;

            console.log("Excluindo Pokémon da equipe: \n" + instrucaoDeletePokemons);
            return database.executar(instrucaoDeletePokemons);
        })
        .then(function(){
            var instrucaoDeleteEquipe = `
            DELETE FROM Equipe WHERE idEquipe = ${idEquipe} AND fkUsuario = ${idUsuario};
            `;

            console.log("Excluindo equipe: \n" + instrucaoDeleteEquipe);
            return database.executar(instrucaoDeleteEquipe);
        })
        .then(function(resultadoDelete){
            if(resultadoDelete.affectedRows == 0){
                return Promise.reject("Equipe não encontrada para este usuário.");
            }

            return {
                idEquipe: idEquipe,
                fkUsuario: Number(idUsuario),
                mensagem: "Equipe excluída com sucesso."
            };
        });
}

function salvarPokemonEquipe(idEquipe, pokemon){
    return garantirPokemonCadastrado(pokemon)
        .then(function(){
            var instrucaoSql = `
            INSERT INTO EquipePokemon (
                fkEquipe,
                fkPokemon,
                Ataque1,
                Ataque2,
                Ataque3,
                Ataque4,
                Attack,
                Defense,
                SpAtk,
                SpDef,
                Speed
            ) VALUES (
                ${idEquipe},
                ${pokemon.idPokemon},
                ${formatarTexto(pokemon.Ataque1)},
                ${formatarTexto(pokemon.Ataque2)},
                ${formatarTexto(pokemon.Ataque3)},
                ${formatarTexto(pokemon.Ataque4)},
                ${pokemon.Attack},
                ${pokemon.Defense},
                ${pokemon.SpAtk},
                ${pokemon.SpDef},
                ${pokemon.Speed}
            );
            `;

            console.log("Salvando Pokémon da equipe: \n" + instrucaoSql);
            return database.executar(instrucaoSql);
        });
}

function garantirPokemonCadastrado(pokemon){
    var instrucaoSql = `
    INSERT INTO Pokemon (idPokemon, nome) VALUES (${pokemon.idPokemon}, ${formatarTexto(pokemon.nome)})
        ON DUPLICATE KEY UPDATE nome = VALUES(nome);
    `;

    console.log("Garantindo Pokémon cadastrado: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function formatarTexto(valor){
    if(valor == undefined || valor == null || valor == ''){
        return 'NULL';
    }

    return `'${String(valor).replace(/'/g, "''")}'`;
}

function getPokemonEquipe(idEquipe){
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function getPokemonEquipe():", idEquipe);

    var instrucaoSql =`
    SELECT p.nome FROM Pokemon p
    INNER JOIN EquipePokemon ep ON p.idPokemon = ep.fkPokemon
    WHERE ep.fkEquipe = ${idEquipe};
    `;

    console.log(`Puxando dados de pokemons das equipe: ${idEquipe}\n` + instrucaoSql);
        return database.executar(instrucaoSql);
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