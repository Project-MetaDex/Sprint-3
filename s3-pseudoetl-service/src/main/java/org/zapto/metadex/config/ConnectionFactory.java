package org.zapto.metadex.config;

import org.apache.commons.dbcp2.BasicDataSource;
import org.springframework.jdbc.core.JdbcTemplate;

import java.io.InputStream;
import java.util.Properties;

public class ConnectionFactory {

    private static JdbcTemplate jdbcTemplate;

    public static synchronized JdbcTemplate createConnection() {

        if (jdbcTemplate != null) {
            return jdbcTemplate;
        }

        Properties properties = new Properties();
        BasicDataSource dataSource = new BasicDataSource();

        try (InputStream input = ConnectionFactory.class.getClassLoader().getResourceAsStream("config.properties")){
            if (input == null){
                System.out.println("Arquivo não encontrado");
                return null;
            }

            properties.load(input);

        }catch (Exception ex){
            ex.printStackTrace();
            return null;
        }

        dataSource.setUrl(properties.getProperty("db-url"));
        dataSource.setUsername(properties.getProperty("db-user"));
        dataSource.setPassword(properties.getProperty("db-password"));

        jdbcTemplate = new JdbcTemplate(dataSource);

        return jdbcTemplate;
    }

}
