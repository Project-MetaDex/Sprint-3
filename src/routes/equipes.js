var express = require("express");
var router = express.Router();

var equipeController = require("../controllers/equipeController");

// Rota focada em trazer os 4 Pokémons mais frequentes do usuário
router.get("/pokemonsMaisUsados/:idUsuario", function (req, res) {
    equipeController.pokemonsMaisUsados(req, res);
});

// Rota focada em trazer a lista de times de um usuario
router.post("/listarEquipes", function(req, res){
    equipeController.listarEquipes(req, res)
})

router.post("/salvarEquipe", function(req, res){
    equipeController.salvarEquipe(req, res)
})

router.post("/buscarEquipe", function(req, res){
    equipeController.buscarEquipe(req, res)
})

router.post("/editarEquipe", function(req, res){
    equipeController.editarEquipe(req, res)
})

router.post("/excluirEquipe", function(req, res){
    equipeController.excluirEquipe(req, res)
})

router.post("/getPokemonEquipe", function(req, res){
    equipeController.getPokemonEquipe(req, res)
})

module.exports = router;



