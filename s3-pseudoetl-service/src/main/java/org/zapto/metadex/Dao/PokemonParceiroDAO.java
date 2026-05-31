package org.zapto.metadex.Dao;

import org.springframework.jdbc.core.JdbcTemplate;
import org.zapto.metadex.config.ConnectionFactory;
import org.zapto.metadex.config.DaoConfig;
import org.zapto.metadex.model.Pokemon;
import org.zapto.metadex.model.PokemonParceiro;

import java.util.List;

public class PokemonParceiroDAO extends DaoConfig {

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

        if (id.isEmpty()){
            return null;
        }

        return id.get(0);
    }

    public static void postPokemon(Pokemon pokemon, PokemonParceiro pokemonParceiro){

        if (pokemon.getNome().equals("empty") || pokemonParceiro.getNome().equals("empty")){
            return;
        }

        String sql = "INSERT INTO PokemonParceiro (fkPokemon, fkPokemonParceiro, txUso) VALUES (?, ?, ?);";

        PokemonParceiroDAO pokemonParceiroDAO = new PokemonParceiroDAO();
        PokemonDAO pokemonDAO = new PokemonDAO();

        ConnectionFactory.createConnection().update(
                sql,
                pokemonDAO.getId(pokemon.getNome()),
                pokemonParceiroDAO.getId(pokemonParceiro.getNome()),
                pokemonParceiro.getTxUso()
        );
    }
}
