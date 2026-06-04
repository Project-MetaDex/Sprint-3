package org.zapto.metadex.service;

import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.xmlbeans.impl.xb.xsdschema.ListDocument;
import org.zapto.metadex.Dao.Log;
import org.zapto.metadex.Dao.PokemonDAO;
import org.zapto.metadex.Dao.Tipos;
import org.zapto.metadex.config.S3Provider;
import org.zapto.metadex.model.Pokemon;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.S3Object;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

public class LeitorArquivos{

    protected static List<Pokemon> listPokemon = new ArrayList<>();

    private Double obterValorNumerico(Row row, int coluna) {
        if (row.getCell(coluna) == null) {
            return 0.0;
        }

        if (row.getCell(coluna).getCellType() == CellType.NUMERIC) {
            return row.getCell(coluna).getNumericCellValue();
        }

        return 0.0;
    }

    public List<Pokemon> extrairDados(InputStream arquivo) {
        List<Pokemon> pokemonExtraidos = new ArrayList<>();

        try (
                Workbook workbook = new XSSFWorkbook(arquivo);
        ) {

            System.out.println("Iniciando leitura do arquivo via stream S3");
            int Controw = 0;
            Sheet sheet = workbook.getSheetAt(0);
            for (Row row : sheet) {
                if (row.getRowNum() == 0) {
                    printarCabecalho(row);
                    continue;
                }

                Controw++;

                String nome = row.getCell(1).getStringCellValue();
                Double porcentagemUso = obterValorNumerico(row, 2);

                Pokemon pokemon = new Pokemon(nome, porcentagemUso);
                pokemonExtraidos.add(pokemon);
            }

            System.out.println("Total de linhas: " + Controw);


            printarLinhas();
            System.out.println("Leitura do arquivo finalizada");
            printarLinhas();

            return pokemonExtraidos;

        } catch (IOException e) {
            System.err.println("Erro ao ler arquivo Excel: " + e.getMessage());
            return pokemonExtraidos;
        }
    }

    private void printarCabecalho(Row row) {
        printarLinhas();
        System.out.println("Lendo cabeçalho");
        for (int i = 0; i < 4; i++) {
            String coluna = row.getCell(i).getStringCellValue();
            System.out.println("Coluna " + i + ": " + coluna);
        }
        printarLinhas();
    }

    public static void printarLinhas() {
        System.out.println("-".repeat(20));
    }

    public static void execLeituraArquivos(){

        S3Client s3Client = new S3Provider().getS3Client();
        String bucketName = "metadex-25042026";
        List<Pokemon> pokemonsRegistrados = new ArrayList<>();
        LeitorArquivos leitorArquivos = new LeitorArquivos();
        List<Pokemon> pokemonExtraidos = new ArrayList<>();

        try {

            ListObjectsRequest requisicao = ListObjectsRequest.builder()
                    .bucket(bucketName)
                    .build();
            List<S3Object> objects = s3Client.listObjects(requisicao).contents();

            for (S3Object object : objects) {

                GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(object.key())
                        .build();

                System.out.println("Lendo arquivo do S3: " + object.key());
                Log log = new Log("Lendo arquivo do S3: " + object.key(), Tipos.Registro);
                log.postLog(log);

                try (InputStream inputStream = s3Client.getObject(getObjectRequest, ResponseTransformer.toInputStream())) {
                    pokemonExtraidos.addAll(leitorArquivos.extrairDados(inputStream));
                }
            }

        } catch (IOException | S3Exception e) {
            System.err.println("Erro ao ler arquivos do S3: " + e.getMessage());
            Log log = new Log("Erro ao ler arquivos do S3: " + e.getMessage(), Tipos.Error);
            log.postLog(log);
        }

        for (Pokemon pokemon : pokemonExtraidos) {
            Boolean registrar = true;
            for (Pokemon pokemonRegistrado : pokemonsRegistrados) {
                if (pokemonRegistrado.getNome().equals(pokemon.getNome()) || pokemon.getNome().isBlank() || pokemon.getNome().isEmpty() || pokemon.getNome().equals("empty")){
                    registrar = false;
                }
            }
            if (registrar){
                PokemonDAO.postPokemon(pokemon);
            }
        }

        listPokemon.addAll(pokemonExtraidos);
    }
}
