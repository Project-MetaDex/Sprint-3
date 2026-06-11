package org.zapto.metadex.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.zapto.metadex.Dao.*;
import org.zapto.metadex.model.Ataque;
import org.zapto.metadex.model.Pokemon;
import org.zapto.metadex.model.PokemonParceiro;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class LeitorSmogon {
    public static JsonNode extrairDados(String url){
        try{

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String resposta = response.body();

            ObjectMapper mapper = new ObjectMapper();

            JsonNode dadosExtraidos = mapper.readTree(resposta);

            return dadosExtraidos;
        }catch (Exception e) {
            System.err.println("Erro ao processar o JSON: " + e.getMessage());
            return null;
        }
    }
    
    public static void execLeitorSmogonAtaques(){
        List<Ataque> ataquesRegistrados = new ArrayList<>();
        List<Pokemon> pokemonExtraidos = LeitorArquivos.listPokemon;


        try {

            JsonNode dadosSmog = LeitorSmogon.extrairDados("https://www.smogon.com/stats/2026-04/chaos/gen9vgc2026regi-0.json");

            List<Ataque> ataques = new ArrayList<>();

            LeitorArquivos.printarLinhas();
            System.out.println("Iniciando Extração de Ataques");
            LeitorArquivos.printarLinhas();

            for (Pokemon pokemon : pokemonExtraidos) {
                ataques.clear();
                JsonNode moves = dadosSmog.get("data").get(pokemon.getNome()) != null ? dadosSmog.get("data").get(pokemon.getNome()).get("Moves") : null;
                Integer rawCount = dadosSmog.get("data").get(pokemon.getNome()) != null ? dadosSmog.get("data").get(pokemon.getNome()).get("Raw count").intValue() : null;

                if (moves == null || rawCount == null){
                    Log log = new Log("Problemas ao extrair ataque do Pokémon " + pokemon.getNome(), Tipos.Alerta);
                    log.postLog(log);
                    continue;
                }

                Iterator<Map.Entry<String, JsonNode>> campos = moves.fields();

                while (campos.hasNext()){
                    Map.Entry<String, JsonNode> campoAtual = campos.next();
                    ataques.add(new Ataque(campoAtual.getKey(), (campoAtual.getValue().asDouble() / rawCount * 100)));
                }

                for (Ataque ataque : ataques) {
                    Boolean registrarAtaque = true;
                    pokemon.addAtaque(ataque);
                    for (Ataque ataqueRegistrado : ataquesRegistrados) {
                        if (ataque.getNome().equals(ataqueRegistrado.getNome())){
                            registrarAtaque = false;
                        }
                    }
                    if (registrarAtaque){
                        AtaqueDAO.postAtaque(ataque);
                        PokemonDAO.postPokemonAtaque(pokemon, ataque);
                    }
                }
            }

            LeitorArquivos.printarLinhas();
            System.out.println("Ataques extraidos com sucesso");
            LeitorArquivos.printarLinhas();

            Log log = new Log("Golpes Extraidos com sucesso", Tipos.Registro);
            log.postLog(log);

        }catch (Exception e){
            System.err.println("Erro ao extrair ataques" + e.getMessage());
            Log log = new Log("Erro ao extrair ataques " + e.getMessage(), Tipos.Error);
            log.postLog(log);
        }
    }
    
    public static void execLeitorSmogonParceiros(){
        List<Pokemon> pokemonExtraidos = LeitorArquivos.listPokemon;

        try {

            JsonNode dadosSmog = LeitorSmogon.extrairDados("https://www.smogon.com/stats/2026-04/chaos/gen9vgc2026regi-0.json");

            List<PokemonParceiro> parceiros = new ArrayList<>();

            LeitorArquivos.printarLinhas();
            System.out.println("Iniciando Extração de parceiros");
            LeitorArquivos.printarLinhas();

            for (Pokemon pokemon : pokemonExtraidos) {
                parceiros.clear();
                JsonNode teammates = dadosSmog.get("data").get(pokemon.getNome()) != null ? dadosSmog.get("data").get(pokemon.getNome()).get("Teammates") : null;
                Integer rawCount = dadosSmog.get("data").get(pokemon.getNome()) != null ? dadosSmog.get("data").get(pokemon.getNome()).get("Raw count").intValue() : null;

                if (teammates == null || rawCount == null){
                    Log log = new Log("Problemas ao extrair Pokemon parceiros do Pokémon " + pokemon.getNome(), Tipos.Alerta);
                    log.postLog(log);
                    continue;
                }

                Iterator<Map.Entry<String, JsonNode>> campos = teammates.fields();

                while (campos.hasNext()){
                    Map.Entry<String, JsonNode> campoAtual = campos.next();
                    parceiros.add(new PokemonParceiro(campoAtual.getKey(), campoAtual.getValue().asDouble() / rawCount * 100));
                }

                for (PokemonParceiro parceiro : parceiros) {
                    pokemon.addParceiro(parceiro);
                    PokemonParceiroDAO pokemonParceiroDAO = new PokemonParceiroDAO();
                    Integer validação =  pokemonParceiroDAO.getId(parceiro.getNome());
                    if (validação == null){
                        continue;
                    }
                    PokemonParceiroDAO.postPokemon(pokemon, parceiro);
                }

            }
            LeitorArquivos.printarLinhas();
            System.out.println("Parceiros extraidos com sucesso");
            LeitorArquivos.printarLinhas();

            Log log = new Log("Parceiros Extraidos com sucesso", Tipos.Registro);
            log.postLog(log);


        }catch (Exception e ){
            System.err.println("Erro ao extrair parceiro " + e.getMessage());
            Log log = new Log("Erro ao extrair parceiro " + e.getMessage(), Tipos.Error);
            log.postLog(log);
        }
    }

}
