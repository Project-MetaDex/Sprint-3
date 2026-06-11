package org.zapto.metadex.config;

import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;

public class S3Provider {

    private final AwsCredentialsProvider credentials;

    public S3Provider() {
//        getCredentialsAws();
        this.credentials = DefaultCredentialsProvider.create();
    }

    private void getCredentialsAws(){
        Properties properties = new Properties();

        try (InputStream input = new FileInputStream("src/main/resources/config.properties")){
            if (input == null){
                System.out.println("Arquivo não encontrado");
                return;
            }

            properties.load(input);

            System.setProperty("aws.accessKeyId", properties.getProperty("aws_access_key_id"));
            System.setProperty("aws.secretAccessKey", properties.getProperty("aws_secret_access_key"));
            System.setProperty("aws.sessionToken", properties.getProperty("aws_session_token"));

        }catch (Exception ex){
            ex.printStackTrace();
        }

    }

    public S3Client getS3Client() {
        return S3Client.builder()
                .region(Region.US_EAST_1)
                .credentialsProvider(credentials)
                .build();
    }


}
