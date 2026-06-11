package org.zapto.metadex.config;

import java.util.List;

public abstract class DaoConfig {

    public abstract List<String> getString(String chave);

    public abstract Integer getId(String chave);

}
