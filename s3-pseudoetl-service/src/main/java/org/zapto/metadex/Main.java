package org.zapto.metadex;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.zapto.metadex.service.LeitorArquivos;
import org.zapto.metadex.service.LeitorShowdown;
import org.zapto.metadex.service.LeitorSmogon;


public class Main {
    private static final Logger log = LoggerFactory.getLogger(Main.class);

    public static void main(String[] args) {
        // Extração S3 Bucket
        LeitorArquivos.execLeituraArquivos();

        // Extração Smogon Ataques
        LeitorSmogon.execLeitorSmogonAtaques();

        // Extração Smogon Parceiro
        LeitorSmogon.execLeitorSmogonParceiros();

        // Extração Showdown
        LeitorShowdown.execLeitorShowdown();

    }
}
