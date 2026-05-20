package school.sptech;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Log {

    private Integer idLog;
    private String mensagem;
    private String tipo;
    private LocalDateTime dataHora;
    private Integer fkUsuario;

    // Construtor SEM usuário (evento de sistema)
    public Log(String mensagem, String tipo) {
        this.mensagem = mensagem;
        this.tipo = tipo;
        this.dataHora = LocalDateTime.now();
        this.fkUsuario = null;
    }

    // Construtor COM usuário (ação vinculada a alguém)
    public Log(String mensagem, String tipo, Integer fkUsuario) {
        this.mensagem = mensagem;
        this.tipo = tipo;
        this.dataHora = LocalDateTime.now();
        this.fkUsuario = fkUsuario;
    }

    public Log() {
    }

    public String formatarLog() {
        DateTimeFormatter formato = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        return "[" + dataHora.format(formato) + "] [" + tipo + "] " + mensagem;
    }

    public Integer getIdLog() {
        return idLog;
    }

    public void setIdLog(Integer idLog) {
        this.idLog = idLog;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public Integer getFkUsuario() {
        return fkUsuario;
    }

    public void setFkUsuario(Integer fkUsuario) {
        this.fkUsuario = fkUsuario;
    }
}