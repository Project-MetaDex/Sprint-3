var database = require("../database/config")

function dadosShowdown(idUsuario) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function dadosShowdown():", idUsuario);

    var instrucaoSql = `
        SELECT DATE_FORMAT(dataPartida, '%b') AS mes,
        COUNT(*) AS totalBatalhas, 
        SUM(CASE WHEN resultado = 'Vitória' THEN 1 ELSE 0 END) AS vitorias,
        ROUND((SUM(CASE WHEN resultado = 'Vitória' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) AS winRate
            FROM dadosShowdown WHERE fkUsuario = ${idUsuario} AND dataPartida >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                GROUP BY MONTH(dataPartida), DATE_FORMAT(dataPartida, '%b') ORDER BY MONTH(dataPartida) ASC;

    `;

    console.log("Puxando dados da tabela dadosShowdown: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    dadosShowdown
}