package org.zapto.metadex.model;

public class Ataque {

    private String nome;
    private Double txUso;

    public Ataque(String nome, Double txUso) {
        this.nome = nome;
        this.txUso = txUso;
    }

    public String getNome() {
        return nome;
    }

    public Double getTxUso() {
        return txUso;
    }
}
