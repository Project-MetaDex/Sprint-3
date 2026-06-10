-- ================================================================
-- METADEX — Script de criação do banco de dados
-- Gerado a partir do arquivo DER-MetaDex.mwb
-- ================================================================

CREATE USER IF NOT EXISTS 'admin_metadex'@'%' IDENTIFIED BY 'Meta2309';
GRANT ALL PRIVILEGES ON *.* TO 'admin_metadex'@'%';
FLUSH PRIVILEGES;

DROP DATABASE IF EXISTS metadex;
CREATE DATABASE metadex;
USE metadex;

-- ================================================================
-- TABELA: Log
-- ================================================================
CREATE TABLE Log (
    idLog       INT          NOT NULL PRIMARY KEY AUTO_INCREMENT,
    tipo        VARCHAR(10)      NULL,
    dataHora    DATETIME         NULL,
    mensagem    VARCHAR(150)     NULL
);

-- ================================================================
-- TABELA: Usuario
-- ================================================================
CREATE TABLE Usuario (
    idUsuario       INT          NOT NULL PRIMARY KEY AUTO_INCREMENT,
    nome            VARCHAR(50)  NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    senha           VARCHAR(45)  NOT NULL,
    fkMentor        INT,
    tokenMentor     VARCHAR(8),
    nickname        VARCHAR(50),
    dataCadastro   DATETIME DEFAULT CURRENT_TIMESTAMP,
    posicaoRanking  INT DEFAULT 0,
    totalBatalhas   INT DEFAULT 0,
    qtdVitorias     INT DEFAULT 0,
    qtdDerrotas     INT DEFAULT 0,
    qtsEmpates      INT DEFAULT 0,
    notificacao     TINYINT DEFAULT true,
    CONSTRAINT fk_usuario_mentor
        FOREIGN KEY (fkMentor) REFERENCES Usuario (idUsuario)
			ON DELETE CASCADE
);

-- ================================================================
-- TABELA: dadosShowdown
-- ================================================================
CREATE TABLE dadosShowdown (
    idDadosShowdown INT                               NOT NULL PRIMARY KEY AUTO_INCREMENT,
    fkUsuario       INT                               NOT NULL,
    dataPartida     DATETIME,
    resultado       ENUM('vitoria','derrota','empate'),
    adversarioNick  VARCHAR(50),
    replayId        VARCHAR(60)                       UNIQUE,
    formatoPartida  VARCHAR(50),
    CONSTRAINT fk_showdown_usuario
        FOREIGN KEY (fkUsuario) REFERENCES Usuario (idUsuario)
			ON DELETE CASCADE
);


-- ================================================================
-- TABELA: Pokemon
-- ================================================================
CREATE TABLE Pokemon (
    idPokemon   INT              NOT NULL PRIMARY KEY AUTO_INCREMENT,
    nome        VARCHAR(50),
    txUso       DECIMAL(20,10)
);

-- ================================================================
-- TABELA: Ataque
-- ================================================================
CREATE TABLE Ataque (
    idAtaque    INT          NOT NULL PRIMARY KEY AUTO_INCREMENT,
    nome        VARCHAR(45)
);

-- ================================================================
-- TABELA: PokemonAtaque
-- ================================================================
CREATE TABLE PokemonAtaque (
    fkPokemon   INT  NOT NULL,
    fkAtaque     INT  NOT NULL,
    txUso       DECIMAL(20,10),
    PRIMARY KEY (fkPokemon, fkAtaque),
    CONSTRAINT fk_pokemonPokemon_ataque
        FOREIGN KEY (fkPokemon) REFERENCES Pokemon (idPokemon),
    CONSTRAINT fk_AtaquePokemon_ataque
        FOREIGN KEY (fkAtaque) REFERENCES Ataque (idAtaque)
        
);

-- ================================================================
-- TABELA: PokemonParceiro
-- ================================================================
CREATE TABLE PokemonParceiro (
    fkPokemon           INT              NOT NULL,
    fkPokemonParceiro   INT              NOT NULL,
    txUso               DECIMAL(20,10),
    PRIMARY KEY (fkPokemon, fkPokemonParceiro),
    CONSTRAINT fk_parceiro_pokemon
        FOREIGN KEY (fkPokemon) REFERENCES Pokemon (idPokemon),
    CONSTRAINT fk_parceiro_pokemon2
        FOREIGN KEY (fkPokemonParceiro) REFERENCES Pokemon (idPokemon)
);

-- ================================================================
-- TABELA: Equipe
-- ================================================================
CREATE TABLE Equipe (
    idEquipe        INT          NOT NULL PRIMARY KEY AUTO_INCREMENT,
    nome            VARCHAR(50)  NOT NULL,
    fkUsuario       INT          NOT NULL,
    dataCriacao		DATE DEFAULT 	(CURRENT_DATE()),
    CONSTRAINT fk_equipe_usuario
        FOREIGN KEY (fkUsuario) REFERENCES Usuario (idUsuario)
			ON DELETE CASCADE
);

-- ================================================================
-- TABELA: EquipePokemon
-- ================================================================
CREATE TABLE EquipePokemon (
    fkEquipe    INT          NOT NULL,
    fkPokemon   INT          NOT NULL,
    Ataque1     VARCHAR(45),
    Ataque2     VARCHAR(45),
    Ataque3     VARCHAR(45),
    Ataque4     VARCHAR(45),
    HP          INT          NOT NULL,
    Attack      INT          NOT NULL,
    Defense     INT          NOT NULL,
    SpAtk       INT          NOT NULL,
    SpDef       INT          NOT NULL,
    Speed       INT          NOT NULL,
    PRIMARY KEY (fkEquipe, fkPokemon),
    CONSTRAINT fk_equipepokemon_equipe
        FOREIGN KEY (fkEquipe) REFERENCES Equipe (idEquipe)
			ON DELETE CASCADE,
    CONSTRAINT fk_equipepokemon_pokemon
        FOREIGN KEY (fkPokemon) REFERENCES Pokemon (idPokemon)
);

-- ================================================================
-- TABELA: SimulacaoUsuario
-- ================================================================
CREATE TABLE SimulacaoUsuario (
    idSimulacaoUsuario  INT          NOT NULL AUTO_INCREMENT,
    fkUsuario           INT          NOT NULL,
    fkPokemonUsuario    INT          NOT NULL,
    Resultado           ENUM('vitoria','derrota','empate') NULL,
    DataBatalha         DATETIME         NULL DEFAULT CURRENT_TIMESTAMP,
    Ataque1             VARCHAR(45)  NOT NULL,
    Ataque2             VARCHAR(45)  NOT NULL,
    Ataque3             VARCHAR(45)  NOT NULL,
    Ataque4             VARCHAR(45)  NOT NULL,
    HP                  INT          NOT NULL DEFAULT 0,
    Attack              INT          NOT NULL,
    Defense             INT          NOT NULL,
    SpAtk               INT          NOT NULL,
    SpDef               INT          NOT NULL,
    Speed               INT          NOT NULL,
    Log                 TEXT,
    PRIMARY KEY (idSimulacaoUsuario),
    CONSTRAINT fk_simulacao_usuario
        FOREIGN KEY (fkUsuario) REFERENCES Usuario (idUsuario)
			ON DELETE CASCADE,
    CONSTRAINT fk_simulacao_pokemon_usuario
        FOREIGN KEY (fkPokemonUsuario) REFERENCES Pokemon (idPokemon)
);

-- ================================================================
-- TABELA: SimlacaoAdversario
-- ================================================================
CREATE TABLE SimulacaoAdversario (
    fkSimulacao         INT          NOT NULL,
    PokemonAdversario   INT          NOT NULL,
    Ataque1             VARCHAR(50)  NOT NULL,
    Ataque2             VARCHAR(45)  NOT NULL,
    Ataque3             VARCHAR(45)  NOT NULL,
    Ataque4             VARCHAR(45)  NOT NULL,
    HP                  INT          NOT NULL DEFAULT 0,
    Attack              INT          NOT NULL,
    Defense             INT          NOT NULL,
    SpAtk               INT          NOT NULL,
    SpDef               INT          NOT NULL,
    Speed               INT          NOT NULL,
    PRIMARY KEY (fkSimulacao, PokemonAdversario),
    CONSTRAINT fk_adversario_simulacao
        FOREIGN KEY (fkSimulacao) REFERENCES SimulacaoUsuario (idSimulacaoUsuario)
			ON DELETE CASCADE,
    CONSTRAINT fk_adversario_pokemon
        FOREIGN KEY (PokemonAdversario) REFERENCES Pokemon (idPokemon)
);

-- ================================================================
-- INSERT: Usuario Mentor
-- ================================================================
INSERT INTO Usuario (nome, email, senha, fkMentor, tokenMentor, notificacao) 
VALUES ('Gleison', 'gleisonfreitas11@gmail.com', '123456789', null, "testeT", true);