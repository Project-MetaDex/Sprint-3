# 🌐 Documentação da API (Back-End)

## 👤 Entidade: Usuários (`/usuarios`)

### 1. Cadastro de Aluno
* **Descrição:** Realiza o registro de um novo aluno associado a um mentor através de um token válido.
* **URL:** `/usuarios/cadastrar`
* **Método:** `POST`

#### 📥 Requisição (Corpo - JSON)
```json
{
  "nomeServer": "Gleison Freitas",
  "emailServer": "gleison@metadex.com",
  "senhaServer": "senha123",
  "nicknameServer": "GleisonVGC",
  "tokenMentorServer": "6f54e84a" 
}
```


| Campo | Tipo | Descrição | Opcional? |
| :--- | :--- | :--- | :--- |
| `nomeServer` | String | Nome completo do usuário. | Não |
| `emailServer` | String | E-mail exclusivo para acesso ao sistema. | Não |
| `senhaServer` | String | Senha de acesso. | Não |
| `nicknameServer` | String | Apelido do jogador no ecossistema Pokémon. | Não |
| `tokenMentorServer` | String | Código de 8 dígitos gerado pelo Mentor. | Não |

#### 📤 Respostas (Responses)
* **`200 OK` (Sucesso):** Cadastro efetuado com sucesso no MySQL.
* **`400 Bad Request` (Erro de Negócio):** Algum campo obrigatório não foi enviado ou o token do mentor é inválido.
* **`500 Internal Server Error` (Erro Técnico):** Falha na comunicação com o banco de dados (ex: e-mail duplicado).

---

### 2. Autenticação (Login)
* **Descrição:** Valida as credenciais de acesso do usuário e retorna seus dados de perfil para controle de sessão.
* **URL:** `/usuarios/autenticar`
* **Método:** `POST`

#### 📥 Requisição (Corpo - JSON)
```json
{
  "nomeServer": "Gleison Freitas",
  "emailServer": "gleison@metadex.com",
  "senhaServer": "senha123"
}
```

#### 📤 Resposta de Sucesso (`200 OK` - JSON)
Retorna os dados mapeados do banco prontos para serem salvos na `sessionStorage` do navegador.
```json
{
  "idUsuario": 4,
  "nome": "Gleison Freitas",
  "email": "gleison@metadex.com",
  "nickname": "GleisonVGC",
  "fkMentor": 1,
  "tokenMestre": null,
  "tipo": "Aluno",
  "posicaoRanking": null,
  "totalBatalhas": 0,
  "qtdVitorias": 0,
  "qtdDerrotas": 0
}
```


| Propriedade | Tipo | Descrição |
| :--- | :--- | :--- |
| `idUsuario` | Integer | Chave primária do usuário no banco. |
| `fkMentor` | Integer | ID do mentor associado (retorna `null` se for conta de um Mentor). |
| `tokenMestre` | String | Token gerado pelo usuário (retorna `null` se for conta de um Aluno). |
| `tipo` | String | Define a interface do site. Retorna `"Mentor"` ou `"Aluno"`. |
| `posicaoRanking` | Integer | Posição atual do jogador na tabela classificatória geral. |

#### 📤 Respostas de Erro
* **`403 Forbidden`:** Nome, E-mail e/ou senha inválido(s) ou credenciais duplicadas.
* **`400 Bad Request`:** Um ou mais campos obrigatórios não foram preenchidos.

---


### 3. Atualização de Perfil
* **Descrição:** Altera os dados cadastrais básicos de um usuário específico pelo ID.
* **URL:** `/usuarios/atualizarPerfil/:idUsuario`
* **Método:** `PUT`

#### 📥 Requisição
* **Parâmetro de URL (Params):** ID do usuário a ser alterado (Ex: `/usuarios/atualizarPerfil/1`).
* **Corpo (JSON):**
```json
{
  "nomeServer": "Mentor Master",
  "senhaServer": "Teste456",
  "nicknameServer": "MentorMasterVGC"
}
```

#### 📤 Resposta de Sucesso (`200 OK` - JSON)
```json
{
  "fieldCount": 0,
  "affectedRows": 1,
  "insertId": 0,
  "serverStatus": 2,
  "warningCount": 0,
  "message": "(Rows matched: 1 Changed: 1 Warnings: 0",
  "protocol41": true,
  "changedRows": 1
}
```

---

### 4. Exclusão de Conta (Cascata)
* **Descrição:** Remove permanentemente um usuário pelo ID. Se for mentor, apaga todos os seus alunos e dados dependentes vinculados via `ON DELETE CASCADE`.
* **URL:** `/usuarios/deletarConta/:idUsuario`
* **Método:** `DELETE`

#### 📥 Requisição
* **Body:** Vazio.
* **Parâmetro de URL (Params):** ID do usuário a ser excluído (Ex: `/usuarios/deletarConta/4`).

#### 📤 Resposta de Sucesso (`200 OK` - JSON)
```json
{
  "fieldCount": 0,
  "affectedRows": 1,
  "insertId": 0,
  "serverStatus": 2,
  "warningCount": 0,
  "message": "",
  "protocol41": true,
  "changedRows": 0
}
```