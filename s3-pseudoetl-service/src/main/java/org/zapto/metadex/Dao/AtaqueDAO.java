package org.zapto.metadex.Dao;

import org.zapto.metadex.config.ConnectionFactory;
import org.zapto.metadex.config.DaoConfig;
import org.zapto.metadex.model.Ataque;
import org.zapto.metadex.model.Pokemon;

import java.util.List;

public class AtaqueDAO extends DaoConfig {

    @Override
    public List<String> getString(String chave) {
        String sqlNome = "SELECT nome FROM Ataque ORDER BY idAtaque;";

        List<String> nome = ConnectionFactory.createConnection().queryForList(sqlNome, String.class);

        return nome;
    }

    @Override
    public Integer getId(String chave) {
        String sqlId = "SELECT idAtaque FROM Ataque where nome = ?;";
        List<Integer> id = ConnectionFactory.createConnection().queryForList(sqlId, Integer.class, chave);

        return id.get(0);
    }

    public static void postAtaque(Ataque ataque){
        String sql = "INSERT INTO Ataque (nome) VALUES (?);";

        ConnectionFactory.createConnection().update(
                sql,
                ataque.getNome()
        );
    }
}
