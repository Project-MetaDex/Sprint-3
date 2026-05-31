package org.zapto.metadex.Dao;

import org.zapto.metadex.config.ConnectionFactory;
import org.zapto.metadex.config.DaoConfig;
import org.zapto.metadex.model.Usuario;

import java.util.List;

public class UsuarioDAO {

    public List<String> getString() {
        String sqlNome = "SELECT nickname FROM Usuario ORDER BY idUsuario;";

        List<String> nome = ConnectionFactory.createConnection().queryForList(sqlNome, String.class);

        return nome;
    }


    public List<Integer> getId() {
        String sqlId = "SELECT idUsuario FROM Usuario order by idUsuario;";
        List<Integer> id = ConnectionFactory.createConnection().queryForList(sqlId, Integer.class);

        return id;
    }

    public void postDadosShowdown(Usuario user){
        String sql = "INSERT INTO dadosshowdown (fkUsuario, dataPartida, replayId, formatoPartida) VALUES (?, ?, ?, ?);";

        ConnectionFactory.createConnection().update(
                sql,
                user.getIdUser(),
                user.getDataPartida(),
                user.getIdPartida(),
                user.getFormatoPartida()
        );
    }
}
