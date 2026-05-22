# Rota (URL): /usuarios/cadastrar
# Método: POST

Requisição
{
  "nomeServer": "",
  "emailServer": "",
  "senhaServer": "",
  "nicknameServer": "",
  "tokenMentorServer": "" 
}


# Rota (URL): /usuarios/autenticar
# Método: POST

Requisição
{
  "nomeServer": "",
  "emailServer": "",
  "senhaServer": ""
}

Resposta
{
  "idUsuario": ,
  "nome": "",
  "email": "",
  "nickname": "",
  "fkMentor": ,
  "tokenMestre": ,
  "tipo": "",
  "posicaoRanking": ,
  "totalBatalhas": ,
  "qtdVitorias": ,
  "qtdDerrotas": 
}






# Estrutura de Controller

function minhaAcao(req, res) {
    // 1. RECEBER: Pego o que o front-end me mandou (do req.body ou req.params)
    var dadoDoFront = req.body.campoDoSite;

    // 2. VALIDAR: Verifico se o usuário não deixou o campo em branco
    if (dadoDoFront == undefined) {
        return res.status(400).send("Ei, preencha o campo!");
    }

    // 3. DELEGAR: Chamo o Model para fazer o trabalho sujo no MySQL
    modelEspecialista.fazerQueryNoBanco(dadoDoFront)
        .then(function (dadosQueOBancoDevolveu) {
            
            // 4. RESPONDER SUCESSO: O banco deu certo! Envio os dados de volta pro site
            res.json(dadosQueOBancoDevolveu);

        })
        .catch(function (erroGraveDoBanco) {
            
            // 5. RESPONDER ERRO: O teto desabou! Aviso que deu erro interno 500
            res.status(500).json(erroGraveDoBanco.sqlMessage);

        });
}
