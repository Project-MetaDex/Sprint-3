var database = require("../database/config")

function cadastrar(nome, email, senha, nickname, fkMentor) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", nome, email, senha, nickname, fkMentor);
    
    // Insira exatamente a query do banco aqui, lembrando da nomenclatura exata nos valores
    //  e na ordem de inserção dos dados.
    var instrucaoSql = `
        INSERT INTO usuario (nome, email, senha, nickname, fkMentor) VALUES ('${nome}', '${email}', '${senha}', '${nickname}', ${fkMentor});
    `;
    console.log("Cadastrando usuário no sistema: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function autenticar(nome, email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function autenticar(): ", nome, email, senha)
    var instrucaoSql = `
        SELECT idUsuario, nome, email, nickname, tokenMentor, dataCadastro FROM usuario 
        WHERE nome = '${nome}' AND email = '${email}' AND senha = '${senha}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarMentorPorToken(tokenMentor) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function buscarMentorPorToken():", tokenMentor);

    var instrucaoSql = `
        SELECT idUsuario FROM usuario WHERE tokenMentor = '${tokenMentor}';
    `;
    console.log("Buscando mentor pelo token: " + instrucaoSql);
    return database.executar(instrucaoSql);
}

function atualizarPerfil(nome, senha, nickname, idUsuario) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function atualizarPerfil():", nome, senha, nickname, idUsuario);

    var instrucaoSql = `
    UPDATE usuario SET nome = '${nome}', senha = '${senha}', nickname = '${nickname}' WHERE idUsuario = ${idUsuario};
    `;
    console.log("Atualizando usuário no sistema: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function deletarConta(idUsuario) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function deletarConta():", idUsuario);

    var instrucaoSql = `
    DELETE FROM usuario WHERE idUsuario = ${idUsuario};
    `;
    console.log("Deletando usuário do sistema: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listarAlunos(idMentor) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function listarAlunos():", idMentor);

    var instrucaoSql = `
        SELECT idUsuario, nome, posicaoRanking FROM usuario WHERE fkMentor = ${idMentor};
    `;
    console.log("Listando alunos do Mentor: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function dadosPerfilAluno(idUsuario) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function dadosPerfilMentor():", idUsuario);

    var instrucaoSql = `
        SELECT qtdVitorias, qtdDerrotas, posicaoRanking,
            (SELECT COUNT(*) FROM Equipe WHERE fkUsuario = idUsuario) AS timesSalvos
                FROM Usuario WHERE idUsuario = ${idUsuario};
    `;

    console.log("Puxando dados do Usuário: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


module.exports = {
    autenticar,
    cadastrar,
    buscarMentorPorToken,
    atualizarPerfil,
    deletarConta,
    listarAlunos,
    dadosPerfilAluno
};