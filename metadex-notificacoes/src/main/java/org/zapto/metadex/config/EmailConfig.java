package org.zapto.metadex.config;

import javax.mail.Authenticator;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import java.util.Properties;

public class EmailConfig {
    private final String host;
    private final String port;
    private final String user;
    private final String password;

    public EmailConfig() {

        String smtpHost = System.getenv("SMTP_HOST");
        String smtpPort = System.getenv("SMTP_PORT");
        String smtpUser = System.getenv("SMTP_USER");
        String smtpPassword = System.getenv("SMTP_PASSWORD");

        if (smtpHost == null || smtpUser == null || smtpPassword == null) {
            throw new RuntimeException(
                    "Erro Fatal: Variáveis de ambiente do Docker (SMTP_HOST, SMTP_USER, SMTP_PASSWORD) não foram encontradas!");
        }

        if (smtpPort == null) {
            smtpPort = "587";
        }

        this.host = smtpHost;
        this.port = smtpPort;
        this.user = smtpUser;
        this.password = smtpPassword;
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
