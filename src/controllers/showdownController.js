var showdownModel = require("../models/showdownModel");

function dadosShowdown(req, res) {
    var idUsuario = req.params.idUsuario;

    if (idUsuario == undefined) {
        return res.status(400).send('O ID do Aluno está undefined!');
    } else {

        showdownModel.dadosShowdown(idUsuario)
            .then(function (resultado) {
                if (resultado.length > 0) {
                    res.status(200).json(resultado);
                } else {
                    res.status(204).send("Nenhum dado encontrado para este ID.");
                }
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao pegar dados do Aluno! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            })
    }
}

module.exports = {
    dadosShowdown
}