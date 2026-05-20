import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

public class LeitorExcel {

    private Double calcUserRate(List<Double> listUserRate){

        Double somaUserRateList = 0.0;

        for (Double v : listUserRate) {
            somaUserRateList += v;
        }

        return (somaUserRateList / listUserRate.size());
    }

    private Double obterValorNumerico(Row row, int coluna) {
        if (row.getCell(coluna) == null) {
            return 0.0;
        }

        if (row.getCell(coluna).getCellType() == CellType.NUMERIC) {
            return row.getCell(coluna).getNumericCellValue();
        }

        return 0.0;
    }

    public List<Pokemon> extrairPokemon (String caminhoArquivo){
        List<Pokemon> pokemonExtraidos = new ArrayList<>();

        try(
                InputStream arquivo = new FileInputStream(caminhoArquivo);
                Workbook workbook = new XSSFWorkbook(arquivo);
                ){

            System.out.printf("Iniciando leitura do arquivo %s%n", caminhoArquivo);

            Sheet sheet = workbook.getSheetAt(0);
            for (Row row : sheet) {
                if (row.getRowNum() == 0){
                    printarCabecalho(row);
                    continue;
                }

                System.out.println("Lendo linha " + row.getRowNum());

                String nome = row.getCell(1).getStringCellValue();
                List<Double> porcentagemUso = new ArrayList<>();
                porcentagemUso.add(obterValorNumerico(row,17));
                porcentagemUso.add(obterValorNumerico(row,18));
                porcentagemUso.add(obterValorNumerico(row,19));
                porcentagemUso.add(obterValorNumerico(row,20));
                porcentagemUso.add(obterValorNumerico(row,21));
                porcentagemUso.add(obterValorNumerico(row,22));

                Pokemon pokemon = new Pokemon(nome, calcUserRate(porcentagemUso));
                pokemonExtraidos.add(pokemon);
            }

            printarLinhas();
            System.out.println("Leitura do arquivo finalizada");
            printarLinhas();

            return pokemonExtraidos;

        }catch (IOException e) {
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

    private void printarLinhas() {
        System.out.println("-".repeat(20));
    }

}
