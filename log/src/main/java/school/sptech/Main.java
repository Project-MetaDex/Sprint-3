package school.sptech;

public class Main {

    public static void main(String[] args) {

        SistemaLog sistema = new SistemaLog();

        // ============================================
        // Criando usuários de teste
        // ============================================
        sistema.criarUsuarioTeste("Josué Avendano", "javendano@metadex.com", "pikachu123");
        sistema.criarUsuarioTeste("Cintia Azevedo", "cazevedo@metadex.com", "water456");
        sistema.criarUsuarioTeste("Lucas Lima", "llima@metadex.com", "rock789");

        // ============================================
        // Logs de sistema (sem usuário vinculado)
        // ============================================
        sistema.registrarLog("Sistema iniciado com sucesso", "INFO");
        sistema.registrarLog("Conexão com banco de dados estabelecida", "INFO");
        sistema.registrarLog("Limite de requisições da PokeAPI atingido", "WARN");

        // ============================================
        // Usuário 1 (ID 1)
        // ============================================
        sistema.registrarLog("Tentativa de login com senha incorreta", "ERROR", 1);
        sistema.registrarLog("Login realizado com sucesso", "INFO", 1);
        sistema.registrarLog("Time 'Lendários Kanto' criado com sucesso", "INFO", 1);

        // ============================================
        // Usuário 2 (ID 2)
        // ============================================
        sistema.registrarLog("Time 'Aqua Force' criado com sucesso", "INFO", 2);
        sistema.registrarLog("Pokémon Starmie adicionado ao time", "INFO", 2);
        sistema.registrarLog("Derrota registrada no campeonato", "INFO", 2);

        // ============================================
        // Usuário 3  (ID 3)
        // ============================================
        sistema.registrarLog("Login realizado com sucesso", "INFO", 3);
        sistema.registrarLog("Dados do perfil atualizados", "INFO", 3);
        sistema.registrarLog("Pokémon Onix adicionado ao time", "INFO", 3);

        // ============================================
        // Exibindo todos os logs salvos no banco
        // ============================================
        System.out.println("\n===== LOGS DO SISTEMA (buscados do banco) =====");
        sistema.exibirLogs();
    }
}