package org.zapto.metadex.service;

import org.zapto.metadex.config.EmailConfig;

import javax.mail.Message;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

public class EmailService {

    private final EmailConfig emailConfig;

    public EmailService(EmailConfig emailConfig) {
        this.emailConfig = emailConfig;
    }

    public void enviarEmail(String destinatario, String assunto, String corpo){
        try {
            MimeMessage message = new MimeMessage(emailConfig.criarSessao());

            message.setFrom(new InternetAddress(emailConfig.getRemetente()));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(destinatario));
            message.setSubject(assunto);
            message.setText(corpo);

            Transport.send(message);

            System.out.println("         E-mail enviado com sucesso para: " + destinatario);

        }catch (Exception e) {
            throw new RuntimeException("Falha ao enviar e-mail de notificação", e);
        }


    }
}
