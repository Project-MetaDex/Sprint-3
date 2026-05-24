var usuarioModel = require("../models/usuarioModel");

function cadastrar(req, res) {
    // Crie uma variável que vá recuperar os valores do arquivo cadastro.html
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;
    var nickname = req.body.nicknameServer;
    var tokenMentor = req.body.fkMentorServer;

    // Faça as validações dos valores
    if (nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    } else if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está undefined!");
    } else if (nickname == undefined) {
        res.status(400).send("Seu nickname está undefined!");
    } else if (tokenMentor === undefined) {
        res.status(400).send("Seu tokenMentor está undefined!");
    } else {

        // Primeiro Procurar o ID do mentor usando o token informado 
        usuarioModel.buscarMentorPorToken(tokenMentor)
            .then(function (resultadoBusca) {

                // Se a lista vier vazia, o token não existe no banco
                if (resultadoBusca.length == 0) {
                    return res.status(400).send("Token do mentor inválido ou não encontrado!");
                } else if (resultadoBusca.length > 1) {
                    return res.status(400).send("Mais de um mentor com o mesmo tokem!")
                }

                // Pegando o ID do Mentor
                console.log(resultadoBusca)
                var fkMentor = resultadoBusca[0].idUsuario;


                usuarioModel.cadastrar(nome, email, senha, nickname, fkMentor)
                    .then(
                        function (resultado) {
                            res.json(resultado);
                        }
                    ).catch(
                        function (erro) {
                            console.log(erro);
                            console.log(
                                "\nHouve um erro ao realizar o cadastro! Erro: ",
                                erro.sqlMessage
                            );
                            res.status(500).json(erro.sqlMessage);
                        });

            })
            .catch(function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function autenticar(req, res) {
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    if (nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    } else if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está indefinida!");
    } else {

        usuarioModel.autenticar(nome, email, senha)
            .then(
                function (resultadoAutenticar) {
                    console.log(`\nResultados encontrados: ${resultadoAutenticar.length}`);
                    console.log(`Resultados: ${JSON.stringify(resultadoAutenticar)}`); // transforma JSON em String

                    if (resultadoAutenticar.length == 0) {
                        return res.status(403).send("Nome, Email e/ou senha inválido(s)");
                    } else if (resultadoAutenticar.length > 1) {
                        return res.status(403).send("Mais de um usuário com o mesmo login e senha!");
                    }

                    var tipoConta = resultadoAutenticar[0].tokenMentor != null ? "Mentor" : "Aluno";

                    // Retorna dos dados para salvar na sessionStorage do front-end
                    res.json({
                        idUsuario: resultadoAutenticar[0].idUsuario,
                        nome: resultadoAutenticar[0].nome,
                        email: resultadoAutenticar[0].email,
                        nickname: resultadoAutenticar[0].nickname,
                        fkMentor: resultadoAutenticar[0].fkMentor,
                        tokenMentor: resultadoAutenticar[0].tokenMentor,
                        tipoConta: tipoConta,
                        posicaoRanking: resultadoAutenticar[0].posicaoRanking,
                        qtdVitorias: resultadoAutenticar[0].qtdVitorias,
                        qtdDerrotas: resultadoAutenticar.qtdDerrotas
                    });

                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("\nHouve um erro ao realizar o login! Erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }

}

function atualizarPerfil(req, res) {
    var nome = req.body.nomeServer;
    var senha = req.body.senhaServer;
    var nickname = req.body.nicknameServer;
    var idUsuario = req.params.idUsuario;

    if (nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Seu senha está undefined!");
    } else if (nickname == undefined) {
        res.status(400).send("Sua nickname está undefined!");
    } else if (idUsuario == undefined) {
        res.status(400).send("Seu idUsuario está undefined!");
    } else {

        usuarioModel.atualizarPerfil(nome, senha, nickname, idUsuario)
            .then(
                function (resultadoAtualizar) {
                    res.json(resultadoAtualizar);
                }
            )
            .catch(
                function (erro) {
                    console.log(erro);
                    console.log("\nHouve um erro ao atualizar cadastro! Erro: ",erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            )
    }

}

function deletarConta(req, res) {
    var idUsuario = req.params.idUsuario;

    if (idUsuario === undefined) {
        res.status(400).send("Seu idUsuario está undefined!");
    } else {

        usuarioModel.deletarConta(idUsuario)
            .then(
                function (resultadoDeletar) {
                    res.json(resultadoDeletar);
            }
        ).catch(
            function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao deletar a conta! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            })


    }
}

function listarAlunos(req, res) {
    var idMentor = req.params.idMentor;

    if (idMentor == undefined) {
        return res.status(400).send("O ID do mentor está undefined!");
    } else {

        usuarioModel.listarAlunos(idMentor)
            .then(function (resultadoLista) {
                if (resultadoLista.length > 0) {
                    res.status(200).json(resultadoLista);
                } else {
                    res.status(204).send("Nenhum aluno cadastrado para este mentor.");
                }
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao listar alunos! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

module.exports = {
    autenticar,
    cadastrar,
    atualizarPerfil,
    deletarConta,
    listarAlunos
}