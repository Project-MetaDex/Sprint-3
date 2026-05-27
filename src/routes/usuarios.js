var express = require("express");
var router = express.Router();

var usuarioController = require("../controllers/usuarioController");

// Rota para Cadastro de Usuário
router.post("/cadastrar", function (req, res) {
    usuarioController.cadastrar(req, res);
});

// Rota para Logar na conta
router.post("/autenticar", function (req, res) {
    usuarioController.autenticar(req, res);
});

// Rota para atualizar dados do Perfil
router.put("/atualizarPerfil/:idUsuario", function(req, res) {
    usuarioController.atualizarPerfil(req, res);
});

// Rota para deletar conta
router.delete("/deletarConta/:idUsuario", function (req, res) {
    usuarioController.deletarConta(req, res);
});

// Rota para listar alunos do Mentor a partir da fkMentor
router.get("/listarAlunos/:idMentor", function (req, res) {
    usuarioController.listarAlunos(req, res);
});

router.get("/dadosPerfilAluno/:idUsuario", function (req, res) {
    usuarioController.dadosPerfilAluno(req, res);
});

router.get("/dadosPerfilMentor/:idUsuario", function(req, res) {
    usuarioController.dadosPerfilMentor(req, res);
});

module.exports = router;