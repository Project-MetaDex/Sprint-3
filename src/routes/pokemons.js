var express = require("express");
var router = express.Router();

var pokemonController = require("../controllers/pokemonController");

// Rota focada em trazer os 10 Pokémons com maior taxa de uso
router.get("/rankingMaisUsados", function (req, res) {
    pokemonController.rankingMaisUsados(req, res);
});

module.exports = router;
