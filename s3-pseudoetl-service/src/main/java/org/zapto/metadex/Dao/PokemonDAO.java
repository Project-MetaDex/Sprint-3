package org.zapto.metadex.Dao;

import org.zapto.metadex.config.ConnectionFactory;
import org.zapto.metadex.config.DaoConfig;
import org.zapto.metadex.model.Ataque;
import org.zapto.metadex.model.Pokemon;
import org.zapto.metadex.model.Usuario;

import java.util.List;

public class PokemonDAO extends DaoConfig {

    @Override
    public List<String> getString(String chave) {
        String sqlNome = "SELECT nome FROM Pokemon ORDER BY idPokemon;";

        List<String> nome = ConnectionFactory.createConnection().queryForList(sqlNome, String.class);

        return nome;
    }

    @Override
    public Integer getId(String chave) {

        String sqlId = "SELECT idPokemon FROM Pokemon WHERE nome = ?;";
        List<Integer> id = ConnectionFactory.createConnection().queryForList(sqlId, Integer.class, chave);

        return id.get(0);
    }

    public static void postPokemon(Pokemon pokemon){
        String sql = "INSERT INTO Pokemon (nome, txUso) VALUES (?, ?);";

        ConnectionFactory.createConnection().update(
                sql,
                pokemon.getNome(),
                (pokemon.getTxUso() * 100)
        );
    }

    public  static void postPokemonAtaque(Pokemon pokemon, Ataque ataque){
        String sql = "INSERT INTO PokemonAtaque (fkPokemon, fkAtaque, txUso) VALUES (?, ?, ?);";

        PokemonDAO pokemonDAO = new PokemonDAO();
        AtaqueDAO ataqueDAO = new AtaqueDAO();
        ConnectionFactory.createConnection().update(
                sql,
                pokemonDAO.getId(pokemon.getNome()),
                ataqueDAO.getId(ataque.getNome()),
                ataque.getTxUso()
        );
    }

}
