// =========================================================
// INICIALIZAÇÃO — roda quando a página carrega
// =========================================================
window.onload = function () {

     var nomeSalvo = sessionStorage.getItem('NOME_USUARIO');
 if (nomeSalvo) {
 document.getElementById('nome').textContent = nomeSalvo;
 }

    // Preenche o nome do mentor vindo do sessionStorage
    var nomeSalvo = sessionStorage.getItem('NOME_USUARIO');
    if (nomeSalvo) {
        document.getElementById('nome').textContent = nomeSalvo;
    }

    // Formata e exibe a data de cadastro (ex: "Junho 2025")
    var dataCadastro = sessionStorage.getItem('DATA_CADASTRO');
    if (dataCadastro) {
        var dataFormatada = new Date(dataCadastro).toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC'
        });
        document.getElementById('dtCadastro').textContent =
            dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
    }

    // Busca os dados dos alunos do mentor para preencher os cards de estatística
    dadosPerfilMentor();
};

// =========================================================
// FETCH — busca alunos do mentor e preenche os cards
// =========================================================
function dadosPerfilMentor() {
    fetch(`/usuarios/listarAlunos/${sessionStorage.ID_USUARIO}`, {
        method: 'GET'
    })
        .then(function (resposta) {
            if (resposta.ok) {
                resposta.json().then(function (listaAlunos) {
                    console.log('Dados recebidos com sucesso:', listaAlunos);

                    document.getElementById('qtdAlunos').textContent = listaAlunos.length;

                    var qtdRisco = 0;
                    var qtdDestaque = 0;

                    // Conta alunos em risco (winRate < 50) e em destaque (winRate >= 70)
                    for (var i = 0; i < listaAlunos.length; i++) {
                        if (listaAlunos[i].winRate < 50) {
                            qtdRisco++;
                        } else if (listaAlunos[i].winRate >= 70) {
                            qtdDestaque++;
                        }
                    }

                    document.getElementById('qtdAlunosRisco').textContent = qtdRisco;
                    document.getElementById('qtdAlunosDestaque').textContent = qtdDestaque;
                });
            } else {
                console.log('Erro ao buscar alunos: ' + resposta.status);
            }
        })
        .catch(function (erroDeRede) {
            console.log('Erro de conexão com o servidor:', erroDeRede);
        });
}

// =========================================================
// NAVEGAÇÃO ENTRE SEÇÕES
// =========================================================
function mostrarSecao(secao) {
    var secaoVisao  = document.getElementById('secao-visao-geral');
    var secaoEditar = document.getElementById('secao-editar-perfil');
    var menuVisao   = document.getElementById('menu-visao');
    var menuEditar  = document.getElementById('menu-editar');

    if (secao === 'editar-perfil') {
        secaoVisao.style.display  = 'none';
        secaoEditar.style.display = 'flex';
        menuVisao.classList.remove('opcao-ativa');
        menuEditar.classList.add('opcao-ativa');

        var nomeSalvo = sessionStorage.getItem('NOME_USUARIO');
        if (nomeSalvo) {
            document.getElementById('edit-nome').value = nomeSalvo;
        }

        limparSenhas();
        esconderToast();
    } else {
        secaoEditar.style.display = 'none';
        secaoVisao.style.display  = 'flex';
        menuEditar.classList.remove('opcao-ativa');
        menuVisao.classList.add('opcao-ativa');
        esconderToast();
    }
}

// =========================================================
// SALVAR PERFIL
// =========================================================
function salvarPerfil() {
    var nome    = document.getElementById('edit-nome').value.trim();
    var senhaAt = document.getElementById('edit-senha-atual').value;
    var senhaNv = document.getElementById('edit-senha-nova').value;
    var senhaCf = document.getElementById('edit-senha-conf').value;
    var notifOn = document.getElementById('toggle-notif').checked;

    if (!nome) {
        mostrarToast('erro', '<i class="bi bi-exclamation-circle-fill"></i> O nome não pode ficar vazio.');
        return;
    }

    var tentouTrocarSenha = senhaAt || senhaNv || senhaCf;
    if (tentouTrocarSenha) {
        if (!senhaAt) {
            mostrarToast('erro', '<i class="bi bi-exclamation-circle-fill"></i> Informe sua senha atual para alterá-la.');
            return;
        }
        if (senhaNv.length < 6) {
            mostrarToast('erro', '<i class="bi bi-exclamation-circle-fill"></i> A nova senha precisa ter pelo menos 6 caracteres.');
            return;
        }
        if (senhaNv !== senhaCf) {
            mostrarToast('erro', '<i class="bi bi-exclamation-circle-fill"></i> As senhas não coincidem.');
            return;
        }
    }

    var notificacao = notifOn ? 1 : 0;

    fetch('/usuarios/atualizarPerfil/' + sessionStorage.getItem('ID_USUARIO'), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nomeServer: nome,
            senhaAtualServer: senhaAt,
            senhaNovaServer: senhaNv,
            notificacaoServer: notificacao,
            nicknameServer: sessionStorage.NICK_USUARIO
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                console.log('Perfil do mentor atualizado com sucesso!');

                sessionStorage.setItem('NOME_USUARIO', nome);
                sessionStorage.setItem('NOTIF_ATIVA', notifOn ? 'true' : 'false');
                sessionStorage.setItem('NOTIFICACAO', notificacao);

                document.getElementById('nome').textContent = nome;

                limparSenhas();
                mostrarToast('sucesso', '<i class="bi bi-check-circle-fill"></i> Perfil atualizado com sucesso!');

                setTimeout(function () {
                    mostrarSecao('visao-geral');
                }, 2000);

            } else {
                resposta.text().then(function (mensagemErro) {
                    console.log('Erro retornado pelo servidor:', mensagemErro);
                    mostrarToast('erro', '<i class="bi bi-exclamation-circle-fill"></i> ' + mensagemErro);
                });
            }
        })
        .catch(function (erroDeRede) {
            console.log('Erro de conexão com o servidor:', erroDeRede);
        });
}

// =========================================================
// SAIR DA CONTA
// =========================================================
function sairDaConta() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// =========================================================
// DELETAR CONTA (fetch será implementado posteriormente)
// =========================================================
function deletarConta() {
    var confirmado = window.confirm('Deseja mesmo deletar sua conta?');
    if (confirmado) {

        fetch(`/usuarios/deletarConta/${sessionStorage.ID_USUARIO}`, {
            method: 'DELETE'
        })
            .then(function (resposta) {
                if (resposta.ok) {
                    console.log('Conta deletada com sucesso!');
                    sessionStorage.clear();
                    window.location.href = 'index.html';
                } else {
                    resposta.text().then(function (mensagemErro) {
                        console.log('Erro ao deletar conta:', mensagemErro);
                        mostrarToast('erro', '<i class="bi bi-exclamation-circle-fill"></i> Não foi possível deletar a conta.');
                    }); 
                }
            })
            .catch(function (erroDeRede) {
                console.log('Erro de conexão com o servidor:', erroDeRede);
                mostrarToast('erro', '<i class="bi bi-exclamation-circle-fill"></i> Erro de conexão. Tente novamente.');
            });

    }
}

// =========================================================
// UTILITÁRIOS
// =========================================================
function toggleSenha(inputId, btn) {
    var input = document.getElementById(inputId);
    var icone = btn.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icone.classList.replace('bi-eye', 'bi-eye-slash');
    } else {
        input.type = 'password';
        icone.classList.replace('bi-eye-slash', 'bi-eye');
    }
}

function mostrarToast(tipo, mensagem) {
    var toast = document.getElementById('toast-feedback');
    toast.className = 'toast-feedback ' + tipo;
    toast.innerHTML = mensagem;
    toast.style.display = 'flex';

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function () {
        toast.style.display = 'none';
    }, 4000);
}

function esconderToast() {
    var toast = document.getElementById('toast-feedback');
    if (toast) toast.style.display = 'none';
}

function limparSenhas() {
    ['edit-senha-atual', 'edit-senha-nova', 'edit-senha-conf'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
    });
}