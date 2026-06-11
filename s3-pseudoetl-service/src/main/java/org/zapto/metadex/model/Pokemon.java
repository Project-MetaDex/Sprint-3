package org.zapto.metadex.model;

import java.util.ArrayList;
import java.util.List;

public class Pokemon {

    private String nome;
    private Double txUso;
    private List<Ataque> ataques = new ArrayList<>();
    private List<PokemonParceiro> pokemonParceiros = new ArrayList<>();


    public Pokemon(String nome, Double txUso) {
        this.nome = nome;
        this.txUso = txUso;
    }

    public void addAtaque(Ataque ataque){
        ataques.add(ataque);
    }

    public void addParceiro(PokemonParceiro parceiro){
        pokemonParceiros.add(parceiro);
    }

    public String getNome() {
        return nome;
    }

    public Double getTxUso() {
        return txUso;
    }

    @Override
    public String toString() {
        return String.format("nome= '%s', txUso= %.2f", nome, txUso * 100);
    }
}
