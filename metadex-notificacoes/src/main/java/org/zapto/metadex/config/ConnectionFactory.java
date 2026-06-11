package org.zapto.metadex.config;

import org.apache.commons.dbcp2.BasicDataSource;
import org.springframework.jdbc.core.JdbcTemplate;

public class ConnectionFactory {

    private static JdbcTemplate jdbcTemplate;

    public static synchronized JdbcTemplate createConnection() {

        if (jdbcTemplate != null) {
            return jdbcTemplate;
        }

        String dbHost = System.getenv("DB_HOST");
        String dbPort = System.getenv("DB_PORT");
        String dbName = System.getenv("DB_NAME");
        String dbUser = System.getenv("DB_USER");
        String dbPassword = System.getenv("DB_PASSWORD");

        if (dbHost == null || dbName == null || dbUser == null) {
            System.err.println("Erro Fatal: Variáveis de ambiente do Docker (DB_HOST, DB_NAME, DB_USER) não foram encontradas!");
            return null;
        }

        if (dbPort == null) {
            dbPort = "3306";
        }

        String url = "jdbc:mysql://" + dbHost + ":" + dbPort + "/" + dbName
                + "?connectTimeout=5000&socketTimeout=30000&useSSL=false&allowPublicKeyRetrieval=true&autoReconnect=true";

        BasicDataSource dataSource = new BasicDataSource();
        dataSource.setUrl(url);
        dataSource.setUsername(dbUser);
        dataSource.setPassword(dbPassword);

        int maxTentativas = 10;
        for (int tentativa = 1; tentativa <= maxTentativas; tentativa++) {
            try {
                dataSource.getConnection().close();
                break;
            } catch (java.sql.SQLException e) {
                System.err.println("Tentativa " + tentativa + "/" + maxTentativas
                        + " de conexão com o banco falhou: " + e.getMessage());
                if (tentativa == maxTentativas) {
                    System.err.println("Erro Fatal: não foi possível conectar ao banco de dados após "
                            + maxTentativas + " tentativas.");
                    return null;
                }
                try {
                    Thread.sleep(5000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return null;
                }
            }
        }

        jdbcTemplate = new JdbcTemplate(dataSource);

        System.out.println("Conexão com o banco de dados inicializada com sucesso via Docker Compose!");
        return jdbcTemplate;
    }
}