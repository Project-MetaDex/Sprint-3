// ================================================
//  PerfilAluno.js — Lógica da página de perfil
// ================================================
function sairDaConta() {
    // Limpando o sessionStorage
    sessionStorage.clear();

    // Redirecionando para a tela de index
    window.location.href = "index.html";
}

async function buscarElo(){
        var nickName = sessionStorage.NICK_USUARIO;

        try{

            const res = await fetch(`https://pokemonshowdown.com/users/${nickName}.json`);

            if(!res.ok){
                throw new Error(`Usuário não encontrado Status: ${res.status}`);
                return;
            }

            var user = await res.json()

            var elo = user.ratings?.gen9championsvgc2026regma?.elo;

            if(elo !== undefined ){
                document.querySelector("#elo").innerHTML = Math.round(elo)
            }else{
                console.log("Usuário ainda nao possue elo")
                document.querySelector("#elo").innerHTML = "---";
            }


        }catch (error) {
            console.error("Falha ao buscar os dados de Usuário:", error);
        }
        
    }

window.onload = function () {
    console.log("Iniciando carregamento do perfil do Aluno...");

    // Carrega dados da sessão
    if (sessionStorage.NOME_USUARIO) {
        document.getElementById('nome').innerHTML = sessionStorage.NOME_USUARIO;
    }
    if (sessionStorage.NICK_USUARIO) {
        document.getElementById('nickname').innerHTML = '@' + sessionStorage.NICK_USUARIO;
        buscarElo()
    }

    // Pré-preenche os campos de edição com dados da sessão
    preencherCamposEdicao();

    fetch(`/usuarios/dadosPerfilAluno/${sessionStorage.ID_USUARIO}`, {
        method: "GET"
    })
        .then(function (resposta) {
            if (resposta.ok) {

                resposta.json().then(function (dadosAluno) {
                    console.log("Dados do perfil recebidos com sucesso:", dadosAluno);

                    document.getElementById("qtdVitorias").innerHTML = dadosAluno.qtdVitorias;
                    document.getElementById("qtdDerrotas").innerHTML = dadosAluno.qtdDerrotas;
                    document.getElementById("posicaoRanking").innerHTML = dadosAluno.posicaoRanking;
                    document.getElementById("qtdTimes").innerHTML = dadosAluno.timesSalvos;
                    document.getElementById("totalBatalhas").innerHTML = dadosAluno.totalBatalhas;
                });
            } else {
                console.error("Erro na resposta do servidor ao carregar dados do perfil.");
            }
        })
        .catch(function (erroDeRede) {
            console.log("Erro de conexão com o servidor:", erroDeRede);
        });

    fetch(`/equipes/pokemonsMaisUsados/${sessionStorage.ID_USUARIO}`, {
        method: "GET"
    })
        .then(function (resposta) {
            if (resposta.ok) {
                resposta.json().then(function (listaPokemons) {
                    console.log("Seus 4 Pokémons mais usados:", listaPokemons);

                    for (var i = 0; i < listaPokemons.length; i++) {

                        var nomeDoBanco = listaPokemons[i].nomePokemon;

                        var numeroCard = i + 1;

                        buscarDadosNaPokeAPI(nomeDoBanco, numeroCard);
                    }

                });
            }

        }).catch(function (erroDeRede) {
            console.log("Erro de conexão com o servidor:", erroDeRede);
        });


    const coresTipos = {
        fire: { borda: "#f08030", fundo1: "#fff2eb", fundo2: "#ffd8c8", badge: "#f08030" },
        water: { borda: "#6890f0", fundo1: "#eef7ff", fundo2: "#dbeeff", badge: "#6890f0" },
        grass: { borda: "#78c850", fundo1: "#eefbea", fundo2: "#daf5d6", badge: "#78c850" },
        electric: { borda: "#f8d030", fundo1: "#fffbe4", fundo2: "#fff1b8", badge: "#f8d030" },
        ghost: { borda: "#705898", fundo1: "#f3efff", fundo2: "#e2dcff", badge: "#705898" },
        dragon: { borda: "#7038f8", fundo1: "#f2f2ff", fundo2: "#dcdcff", badge: "#7038f8" },
        dark: { borda: "#705848", fundo1: "#f1ece8", fundo2: "#e1d8d0", badge: "#705848" },
        psychic: { borda: "#f85888", fundo1: "#ffe8f1", fundo2: "#ffd3e5", badge: "#f85888" },
        ice: { borda: "#98d8d8", fundo1: "#efffff", fundo2: "#d9ffff", badge: "#98d8d8" },
        fighting: { borda: "#c03028", fundo1: "#ffe9e7", fundo2: "#ffd4d0", badge: "#c03028" }
    };

    const iconesTipos = {
        fire: "bi-fire",
        water: "bi-droplet-fill",
        grass: "bi-flower1",
        electric: "bi-lightning-fill",
        ghost: "bi-moon-stars-fill",
        dragon: "bi-stars",
        psychic: "bi-eye-fill",
        rock: "bi-triangle-fill",
        ground: "bi-globe",
        flying: "bi-wind",
        steel: "bi-shield-fill",
        fairy: "bi-stars",
        dark: "bi-moon-fill",
        ice: "bi-snow",
        fighting: "bi-hand-index-thumb-fill"
    };

    function buscarDadosNaPokeAPI(nomePokemon, numeroCard) {
        // Faz a requisição na API pública usando o nome textual em minúsculo
        fetch(`https://pokeapi.co/api/v2/pokemon/${nomePokemon.toLowerCase()}`)
            .then(function (respostaAPI) {
                if (respostaAPI.ok) {
                    respostaAPI.json().then(function (dadosPoke) {
                        console.log(`Dados da PokéAPI para ${nomePokemon}:`, dadosPoke);

                        var urlImagemOficial = dadosPoke.sprites.front_default;
                        // var urlImagemOficial = dadosPoke.sprites.other["official-artwork"].front_default;

                        var tipoIngles = dadosPoke.types[0].type.name;

                        var card = document.getElementById(`card_${numeroCard}`);
                        var cores = coresTipos[tipoIngles];
                        if (cores) {
                            card.style.setProperty("--cor-borda", cores.borda);
                            card.style.setProperty("--cor-fundo1", cores.fundo1);
                            card.style.setProperty("--cor-fundo2", cores.fundo2);
                            card.style.setProperty("--cor-badge", cores.badge);
                        }

                        var tipoFormatado = tipoIngles.toUpperCase();

                        var nomeFormatado = nomePokemon.charAt(0).toUpperCase() + nomePokemon.slice(1);

                        // ícones do Bootstrap baseado no elemento
                        var icone = iconesTipos[tipoIngles] || "bi-app-indicator";

                        document.getElementById(`poke_img_${numeroCard}`).src = urlImagemOficial;
                        document.getElementById(`poke_nome_${numeroCard}`).innerHTML = nomeFormatado;
                        document.getElementById(`poke_tipo_${numeroCard}`).innerHTML = `<i class="bi ${icone}"></i> ${tipoFormatado}`;
                    });
                } else {
                    console.error(`Pokémon ${nomePokemon} não encontrado na PokéAPI.`);
                }
            })
            .catch(function (erro) {
                console.error("Erro de rede ao conectar na PokéAPI:", erro);
            });
    }

};

/**
 * Alterna entre a seção de visão geral e edição de perfil
 * @param {'visao-geral' | 'editar-perfil'} secao
 */
function mostrarSecao(secao) {
    const secaoVisao = document.getElementById('secao-visao-geral');
    const secaoEditar = document.getElementById('secao-editar-perfil');
    const menuVisao = document.getElementById('menu-visao');
    const menuEditar = document.getElementById('menu-editar');

    if (secao === 'editar-perfil') {
        secaoVisao.style.display = 'none';
        secaoEditar.style.display = 'flex';
        menuVisao.classList.remove('opcao-ativa');
        menuEditar.classList.add('opcao-ativa');
        preencherCamposEdicao();
    } else {
        secaoEditar.style.display = 'none';
        secaoVisao.style.display = 'flex';
        menuEditar.classList.remove('opcao-ativa');
        menuVisao.classList.add('opcao-ativa');
        esconderToast();
    }
}

/**
 * Pré-preenche os campos do formulário com os dados salvos na sessão
 */
function preencherCamposEdicao() {
    const campoNome = document.getElementById('edit-nome');
    const campoNick = document.getElementById('edit-nick');

    if (campoNome && sessionStorage.NOME_USUARIO) {
        campoNome.value = sessionStorage.NOME_USUARIO;
    }
    if (campoNick && sessionStorage.NICK_USUARIO) {
        campoNick.value = sessionStorage.NICK_USUARIO;
    }

    // Limpa campos de senha
    ['edit-senha-atual', 'edit-senha-nova', 'edit-senha-conf'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    var statusNotificacaoBanco = sessionStorage.NOTIFICACAO;
    document.getElementById("toggle-notif").checked = (statusNotificacaoBanco == 1);
}

/**
 * Valida e salva as alterações do perfil
 */
function salvarPerfil() {
    const nome = document.getElementById('edit-nome').value.trim();
    const nick = document.getElementById('edit-nick').value.trim();
    const senhaAt = document.getElementById('edit-senha-atual').value;
    const senhaNv = document.getElementById('edit-senha-nova').value;
    const senhaCf = document.getElementById('edit-senha-conf').value;
    const notifOn = document.getElementById('toggle-notif').checked;

    // Validação básica
    if (!nome) {
        mostrarToast('erro', '<i class="bi bi-exclamation-circle-fill"></i> O nome não pode ficar vazio.');
        return;
    }

    // Validação de senha: só exige se o usuário preencheu algum campo de senha
    const tentouTrocarSenha = senhaAt || senhaNv || senhaCf;
    if (tentouTrocarSenha) {
        if (!senhaAt) {
            mostrarToast('erro', '<i class="bi bi-exclamation-circle-fill"></i> Informe sua senha atual para alterá-la.');
            return;
        }
        if (senhaNv.length < 8) {
            mostrarToast('erro', '<i class="bi bi-exclamation-circle-fill"></i> A nova senha precisa ter pelo menos 8 caracteres.');
            return;
        }
        if (senhaNv !== senhaCf) {
            mostrarToast('erro', '<i class="bi bi-exclamation-circle-fill"></i> As senhas não coincidem. Verifique e tente novamente.');
            return;
        }
    }

    // Salva na sessão (substituir por chamada à API quando disponível)
    sessionStorage.NOME_USUARIO = nome;
    if (nick) sessionStorage.NICK_USUARIO = nick;
    sessionStorage.NOTIF_ATIVA = notifOn ? 'true' : 'false';

    // Atualiza o nome/nick exibidos no sidebar imediatamente
    document.getElementById('nome').innerHTML = nome;
    document.getElementById('nickname').innerHTML = '@' + (nick || sessionStorage.NICK_USUARIO || 'nickname');

    var isCheckedNotif = document.getElementById("toggle-notif").checked;

    const notificacao = isCheckedNotif ? 1 : 0;

    fetch(`/usuarios/atualizarPerfil/${sessionStorage.ID_USUARIO}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nomeServer: nome,
            nicknameServer: nick,
            senhaAtualServer: senhaAt,
            senhaNovaServer: senhaNv,
            notificacaoServer: notificacao
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {

                console.log("Perfil atualizado com sucesso!");

                // Atualiza os dados da sessão
                sessionStorage.NOME_USUARIO = nome;
                sessionStorage.NICK_USUARIO = nick;
                sessionStorage.NOTIFICACAO = notificacao;

                mostrarToast('sucesso', '<i class="bi bi-check-circle-fill"></i> Perfil atualizado com sucesso!');

                // Limpa campos de senha após salvar
                ['edit-senha-atual', 'edit-senha-nova', 'edit-senha-conf'].forEach(id => {
                    document.getElementById(id).value = '';
                });

                setTimeout(function () {
                    mostrarSecao('secao-visao-geral');
                }, 2000);

            } else {
                resposta.text().then(function (mensagemErro) {

                    console.log("Erro retornado pelo servidor:");
                    console.log(mensagemErro);

                    mostrarToast(
                        'erro',
                        `<i class="bi bi-exclamation-circle-fill"></i> ${mensagemErro}`
                    );

                });
            }
        })
        .catch(function (erroDeRede) {
            console.log("Erro de conexão com o servidor:", erroDeRede);
        });

}

/**
 * Exibe ou esconde a senha em um input
 * @param {string} inputId  — ID do campo de senha
 * @param {HTMLElement} btn — Botão que acionou a função
 */
function toggleSenha(inputId, btn) {
    const input = document.getElementById(inputId);
    const icone = btn.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icone.classList.replace('bi-eye', 'bi-eye-slash');
    } else {
        input.type = 'password';
        icone.classList.replace('bi-eye-slash', 'bi-eye');
    }
}

/**
 * Exibe o toast de feedback
 * @param {'sucesso' | 'erro'} tipo
 * @param {string} mensagem — HTML da mensagem
 */
function mostrarToast(tipo, mensagem) {
    const toast = document.getElementById('toast-feedback');
    toast.className = 'toast-feedback ' + tipo;
    toast.innerHTML = mensagem;
    toast.style.display = 'flex';

    // Remove automaticamente após 4 segundos
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}

function esconderToast() {
    const toast = document.getElementById('toast-feedback');
    if (toast) toast.style.display = 'none';
}
