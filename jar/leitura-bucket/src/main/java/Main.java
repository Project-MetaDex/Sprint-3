import client.S3Provider;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.S3Object;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {

        S3Client s3Client = new S3Provider().getS3Client();
        String bucketName = "metadex-25042026";
        String caminhoArquivos = "arquivos/";
        List<String> arquivos = new ArrayList<>();

        try {

            Files.createDirectories(new File(caminhoArquivos).toPath());

            ListObjectsRequest requisicao = ListObjectsRequest.builder()
                    .bucket(bucketName)
                    .build();
            List<S3Object> objects = s3Client.listObjects(requisicao).contents();
            for (S3Object object : objects) {
                GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(object.key())
                        .build();

                try (InputStream inputStream = s3Client.getObject(getObjectRequest, ResponseTransformer.toInputStream())) {
                    Files.copy(inputStream, new File(caminhoArquivos + object.key()).toPath(), StandardCopyOption.REPLACE_EXISTING);
                }
                System.out.println("Arquivo baixado: " + object.key());
                arquivos.add(caminhoArquivos + object.key());
            }
        } catch (IOException | S3Exception e) {
            System.err.println("Erro ao fazer download dos arquivos: " + e.getMessage());
        }

        LeitorExcel leitorExcel = new LeitorExcel();
        List<Pokemon> pokemonExtraidos = new ArrayList<>();
        for (String arquivo : arquivos) {
            pokemonExtraidos.addAll(leitorExcel.extrairPokemon(arquivo));
        }

        System.out.println("Pokemon extraídos:");
        for (Pokemon pokemon : pokemonExtraidos) {
                System.out.println(pokemon);
        }
    }
}

