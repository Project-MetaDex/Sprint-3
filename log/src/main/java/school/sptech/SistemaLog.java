package school.sptech;

import org.apache.commons.dbcp2.BasicDataSource;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

public class SistemaLog {

    private JdbcTemplate jdbcTemplate;

    public SistemaLog() {

        BasicDataSource dataSource = new BasicDataSource();

        dataSource.setUrl("jdbc:mysql://localhost:3306/metadex");
        dataSource.setUsername("root");
        dataSource.setPassword("Alvarez02$");

        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    // Registra log SEM usuário (evento de sistema)
    public void registrarLog(String mensagem, String tipo) {
        Log novoLog = new Log(mensagem, tipo);
        salvarNoBanco(novoLog);
    }

    // Registra log COM usuário (ação vinculada a alguém)
    public void registrarLog(String mensagem, String tipo, Integer fkUsuario) {
        Log novoLog = new Log(mensagem, tipo, fkUsuario);
        salvarNoBanco(novoLog);
    }

    // Criar um usuário para testes
    public void criarUsuarioTeste(String nome, String email, String senha) {
        String sql = "INSERT INTO Usuario (nome, email, senha) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, nome, email, senha);
        System.out.println("Usuário criado: " + nome);
    }

    // Método privado que faz o INSERT
    private void salvarNoBanco(Log novoLog) {
        String sql = "INSERT INTO Log (mensagem, tipo, dataHora, fkUsuario) VALUES (?, ?, ?, ?)";

        jdbcTemplate.update(
                sql,
                novoLog.getMensagem(),
                novoLog.getTipo(),
                novoLog.getDataHora(),
                novoLog.getFkUsuario()
        );

        System.out.println("Log salvo: " + novoLog.formatarLog());

        try {
            Thread.sleep(300); // 300ms entre cada log salvo
        } catch (InterruptedException e) {
            System.out.println("Erro ao pausar o sistema: " + e.getMessage());
        }
    }

    public void exibirLogs() {
        String sql = "SELECT idLog, mensagem, tipo, dataHora, fkUsuario FROM Log ORDER BY dataHora";

        List<Log> logs = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Log.class));

        if (logs.isEmpty()) {
            System.out.println("Nenhum log encontrado no banco.");
            return;
        }

        for (Log log : logs) {
            String usuario = log.getFkUsuario() != null ? "Usuário ID: " + log.getFkUsuario() : "sistema";
            System.out.println("[ID: " + log.getIdLog() + "] [" + usuario + "] " + log.formatarLog());

            try {
                Thread.sleep(400);
            } catch (InterruptedException e) {
                System.out.println("Erro ao pausar: " + e.getMessage());
            }
        }
    }
}