var database = require("../database/config")

function autenticar(nome, email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ", nome, email, senha)
    var instrucaoSql = `
        SELECT idUsuario, nome, email, nickname, fkMentor, tokenMentor, posicaoRanking, qtdVitorias, qtdDerrotas FROM usuario 
        WHERE nome = '${nome}' AND email = '${email}' AND senha = '${senha}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// FUNÇÃO NOVA PARA BUSCAR O ID DO MENTOR PELO TOKEM
function buscarMentorPorToken(tokenMentor) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function buscarMentorPorToken():", tokenMentor);

    var instrucaoSql = `
        SELECT idUsuario FROM usuario WHERE tokenMentor = '${tokenMentor}';
    `;
    console.log("Buscando mentor pelo token: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Coloque os mesmos parâmetros aqui. Vá para a var instrucaoSql
function cadastrar(nome, email, senha, nickname, fkMentor) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", nome, email, senha, nickname, fkMentor);
    
    // Insira exatamente a query do banco aqui, lembrando da nomenclatura exata nos valores
    //  e na ordem de inserção dos dados.
    var instrucaoSql = `
        INSERT INTO usuario (nome, email, senha, nickname, fkMentor) VALUES ('${nome}', '${email}', '${senha}', '${nickname}', '${fkMentor}');
    `;
    console.log("Cadastrando usuário no sistema: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    autenticar,
    cadastrar,
    buscarMentorPorToken
};