var express = require("express");
var router = express.Router();

var showdownController = require("../controllers/showdownController");

router.get("/dadosShowdown/:idUsuario", function(req, res){
    showdownController.dadosShowdown(req, res)
});

module.exports = router;
