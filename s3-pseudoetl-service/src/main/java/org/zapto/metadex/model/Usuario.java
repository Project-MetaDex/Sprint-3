package org.zapto.metadex.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import org.zapto.metadex.config.TimeConverter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Usuario {

    private String nome;
    private Integer idUser;

    @JsonProperty("uploadtime")
    @JsonDeserialize(using = TimeConverter.class)
    private LocalDate dataPartida;

    @JsonProperty("id")
    private String idPartida;

    @JsonProperty("format")
    private String formatoPartida;

    public Usuario() {
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Integer getIdUser() {
        return idUser;
    }

    public void setIdUser(Integer idUser) {
        this.idUser = idUser;
    }

    public LocalDate getDataPartida() {
        return dataPartida;
    }

    public void setDataPartida(LocalDate dataPartida) {
        this.dataPartida = dataPartida;
    }

    public String getIdPartida() {
        return idPartida;
    }

    public void setIdPartida(String idPartida) {
        this.idPartida = idPartida;
    }

    public String getFormatoPartida() {
        return formatoPartida;
    }

    public void setFormatoPartida(String formatoPartida) {
        this.formatoPartida = formatoPartida;
    }
}
