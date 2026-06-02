var express = require("express");
var router = express.Router();

var equipeController = require("../controllers/equipeController");

// Rota focada em trazer os 4 Pokémons mais frequentes do usuário
router.get("/pokemonsMaisUsados/:idUsuario", function (req, res) {
    equipeController.pokemonsMaisUsados(req, res);
});

module.exports = router;
