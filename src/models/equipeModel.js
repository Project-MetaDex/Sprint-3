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
    getPokemonEquipe
}