package org.zapto.metadex;

import org.zapto.metadex.config.ConnectionFactory;
import org.zapto.metadex.config.EmailConfig;
import org.zapto.metadex.service.EmailService;

import java.util.List;

public class Main {
    public static void main(String[] args) {
        EmailConfig emailConfig = new EmailConfig();
        EmailService emailService = new EmailService(emailConfig);

        String sql = "SELECT email FROM Usuario WHERE notificacao = true";

        List<String> email = ConnectionFactory.createConnection().queryForList(sql, String.class);

        System.out.println("Iniciando envio de email");

        for (String s : email) {
            

            emailService.enviarEmail(
                    s,
                    "Novos conteúdos na plataforma Metadex",
                    "Olá,\n" +
                            "\n" +
                            "As bases de dados do Metadex foram atualizadas, cheque as novidades.\n" +
                            "\n" +
                            "O processamento da carga de metas referente ao mês corrente foi finalizado com sucesso. Todas as tabelas operacionais, históricos de performance e painéis de indicadores foram atualizados.\n" +
                            "\n" +
                            "Para checar os novos dados inseridos, acesse a plataforma.\n" +
                            "\n" +
                            "Atenciosamente,\n" +
                            "Metadex"
            );

            System.out.println("Email enviado para: " + s);
        }
    }
}
