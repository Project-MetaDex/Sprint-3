var express = require("express");
var router = express.Router();

var simulacaoController = require("../controllers/simulacaoController");

// Rota para salvar uma simulação de batalha
router.post("/salvarSimulacao", function (req, res) {
    simulacaoController.salvarSimulacao(req, res);
});

// Rota para editar uma simulação existente
router.post("/editarSimulacao", function (req, res) {
    simulacaoController.editarSimulacao(req, res);
});

// Rota para listar as simulações de um usuário
router.post("/listarSimulacoes", function (req, res) {
    simulacaoController.listarSimulacoes(req, res);
});

// Rota para buscar uma simulação específica
router.post("/buscarSimulacao", function (req, res) {
    simulacaoController.buscarSimulacao(req, res);
});

// Rota para excluir uma simulação
router.post("/excluirSimulacao", function (req, res) {
    simulacaoController.excluirSimulacao(req, res);
});

module.exports = router;
