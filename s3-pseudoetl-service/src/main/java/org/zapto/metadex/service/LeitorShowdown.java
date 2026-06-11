package org.zapto.metadex.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.zapto.metadex.Dao.Log;
import org.zapto.metadex.Dao.Tipos;
import org.zapto.metadex.Dao.UsuarioDAO;
import org.zapto.metadex.model.Usuario;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

public class LeitorShowdown {

    private static final Logger log = LoggerFactory.getLogger(LeitorShowdown.class);

    public static List<Usuario> extrairDados(){

        UsuarioDAO getUser = new UsuarioDAO();
        List<Integer> id = new ArrayList<>();
        List<String> users = new ArrayList<>();

        id.addAll(getUser.getId());
        users.addAll(getUser.getString());

        String url = "https://replay.pokemonshowdown.com/search.json?user=";
        HttpClient client = HttpClient.newHttpClient();
        ObjectMapper mapper = new ObjectMapper();
        List<Usuario> usuarios = new ArrayList<>();

        try {
            for (int i = 0; i < users.size(); i++) {
                String user = users.get(i);
                Integer iduser = id.get(i);

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(url + user))
                        .GET()
                        .build();

                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                String result = response.body();

                List<Usuario> dadosExtraidos = mapper.readValue(result, new TypeReference<List<Usuario>>(){});

                for (int j = 0; j < dadosExtraidos.size(); j++) {
                    dadosExtraidos.get(j).setNome(user);
                    dadosExtraidos.get(j).setIdUser(iduser);
                }

                usuarios.addAll(dadosExtraidos);

            }
        }catch (Exception e) {
            System.err.println("Erro ao processar os dados do usuário: " + e.getMessage());
            Log log = new Log("Erro ao processar os dados do usuário: " + e.getMessage(), Tipos.Error);
        }

        return usuarios;
    }
    
    public static void execLeitorShowdown(){
        try {

            LeitorArquivos.printarLinhas();
            System.out.println("Iniciando Captura dos dados de batalhas do usuário");
            LeitorArquivos.printarLinhas();

            Log log = new Log("Iniciando Captura dos dados de batalhas do usuário", Tipos.Registro);
            log.postLog(log);

            List<Usuario> usuarios = LeitorShowdown.extrairDados();
            UsuarioDAO clientDAO = new UsuarioDAO();
            for (Usuario usuario : usuarios) {
                clientDAO.postDadosShowdown(usuario);
            }

            LeitorArquivos.printarLinhas();
            System.out.println("Captura dos dados de batalhas do usuário realizado com sucesso");
            LeitorArquivos.printarLinhas();

        }catch (Exception e){
            System.err.println("Erro ao extrair dados do usuário " + e.getMessage());
            Log log = new Log("Erro ao extrair dados do usuário " + e.getMessage(), Tipos.Error);
            log.postLog(log);
        }
    }

}
