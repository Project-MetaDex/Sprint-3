package org.zapto.metadex.Dao;

import org.zapto.metadex.config.ConnectionFactory;

import java.time.LocalDateTime;
import java.util.List;

public class Log {

    private String mensagem;
    private Tipos tipo;
    private LocalDateTime dataHora;

    public Log(String mensagem, Tipos tipo) {
        this.mensagem = mensagem;
        this.tipo = tipo;
        this.dataHora = LocalDateTime.now();
    }

    public void postLog(Log log) {
        String sql = "INSERT INTO Log (mensagem, tipo, dataHora) VALUES (?, ?, ?)";
        String tipo = String.valueOf(log.getTipo());

        ConnectionFactory.createConnection().update(
                sql,
                log.getMensagem(),
                tipo,
                log.getDataHora()
        );
    }

    public static void getLog(){
        String sql = "SELECT CONCAT('[', DATE_FORMAT(dataHora, '%d/%m/%Y %H:%i:%s'), '] [', tipo, '] ', mensagem) " +
                "FROM log ORDER BY dataHora";

        List<String> logs = ConnectionFactory.createConnection().queryForList(sql, String.class);

        if (logs.isEmpty()) {
            System.out.println("Nenhum log encontrado no banco.");
            return;
        }

        for (String log : logs) {
            System.out.println(log);
            try {
                Thread.sleep(400);
            } catch (InterruptedException e) {
                System.out.println("Erro ao pausar: " + e.getMessage());
            }
        }

    }

    public String getMensagem() {
        return mensagem;
    }

    public Tipos getTipo() {
        return tipo;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }
}
