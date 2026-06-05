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

        String url = "jdbc:mysql://" + dbHost + ":" + dbPort + "/" + dbName;

        BasicDataSource dataSource = new BasicDataSource();
        dataSource.setUrl(url);
        dataSource.setUsername(dbUser);
        dataSource.setPassword(dbPassword);

        jdbcTemplate = new JdbcTemplate(dataSource);

        System.out.println("Conexão com o banco de dados inicializada com sucesso via Docker Compose!");
        return jdbcTemplate;
    }
}