var database = require("../database/config")

function rankingMaisUsados() {
    console.log("ACESSEI O POKEMON MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function rankingMaisUsados():");

    var instrucaoSql = `
        SELECT p.idPokemon, p.nome AS nomePokemon, p.txUso AS taxaUso
        FROM Pokemon p
            WHERE p.txUso IS NOT NULL
                ORDER BY p.txUso DESC LIMIT 10;
    `;

    console.log("Puxando ranking de pokemons mais usados: \n" + instrucaoSql);
        return database.executar(instrucaoSql);
}

module.exports = {
    rankingMaisUsados
}
