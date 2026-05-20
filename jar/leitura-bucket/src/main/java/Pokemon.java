import java.util.List;

public class Pokemon {

    private String nome;
    private Double porcentagemUso;

    public Pokemon(String nome, Double porcentagemUso) {
        this.nome = nome;
        this.porcentagemUso = porcentagemUso;
    }

    public String getNome() {
        return nome;
    }

    public Double getPorcentagemUso() {
        return porcentagemUso;
    }

    @Override
    public String toString() {
        return "Pokemon{" +
                "nome='" + nome + '\'' +
                ", porcentagemUso=" + String.format("%.2f", porcentagemUso) +
                '}';
    }
}
