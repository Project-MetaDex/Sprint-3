package org.zapto.metadex;

import org.zapto.metadex.config.ConnectionFactory;
import org.zapto.metadex.config.EmailConfig;
import org.zapto.metadex.service.EmailService;

import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

public class Main {
    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("  Metadex - Serviço de Notificações");
        System.out.println("========================================");

        System.out.println("[1/4] Carregando configurações de e-mail (SMTP)...");
        EmailConfig emailConfig = new EmailConfig();
        EmailService emailService = new EmailService(emailConfig);
        System.out.println("      Configurações de e-mail carregadas com sucesso.");

        System.out.println("[2/4] Conectando ao banco de dados...");
        JdbcTemplate jdbcTemplate = ConnectionFactory.createConnection();
        if (jdbcTemplate == null) {
            System.err.println("Erro Fatal: não foi possível inicializar a conexão com o banco de dados.");
            return;
        }

        System.out.println("[3/4] Buscando usuários com notificação ativa...");
        String sql = "SELECT email FROM Usuario WHERE notificacao = true";

        List<String> email = jdbcTemplate.queryForList(sql, String.class);
        System.out.println("      " + email.size() + " usuário(s) encontrado(s) para notificação.");

        if (email.isEmpty()) {
            System.out.println("[4/4] Nenhum e-mail a ser enviado. Encerrando.");
            return;
        }

        System.out.println("[4/4] Enviando e-mails de notificação...");
        int enviados = 0;
        for (String s : email) {
            System.out.println("      -> Enviando e-mail para: " + s + " (" + (enviados + 1) + "/" + email.size() + ")");
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
            enviados++;
        }

        System.out.println("========================================");
        System.out.println("  Processo finalizado: " + enviados + " e-mail(s) enviado(s).");
        System.out.println("========================================");
    }
}
