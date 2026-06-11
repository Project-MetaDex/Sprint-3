package org.zapto.metadex.config;

import javax.mail.Authenticator;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import java.io.IOException;
import java.util.Properties;

public class EmailConfig {
    private final Properties prop = new Properties();
    private final String host;
    private final String port;
    private final String user;
    private final String password;

    public EmailConfig() {

        try {
            prop.load(EmailConfig.class.getClassLoader().getResourceAsStream("config.properties"));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        this.host = prop.getProperty("host");
        this.port = prop.getProperty("port");
        this.user = prop.getProperty("user");
        this.password = prop.getProperty("password");
    }

    public Session criarSessao(){
        Properties properties = new Properties();
        properties.put("mail.smtp.host", this.host);
        properties.put("mail.smtp.port", this.port);
        properties.put("mail.smtp.auth", "true");
        properties.put("mail.smtp.starttls.enable", "true");

        Session session = Session.getDefaultInstance(properties, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication(){
                return new PasswordAuthentication(user, password);
            }
        });

        return session;
    }

    public String getRemetente() {
        return user;
    }
}
