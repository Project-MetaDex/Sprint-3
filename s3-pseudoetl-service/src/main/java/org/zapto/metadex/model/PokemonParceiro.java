package org.zapto.metadex.model;

public class PokemonParceiro{

    private String nome;
    private Double txUso;

    public PokemonParceiro(String nome, Double txUso) {
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
