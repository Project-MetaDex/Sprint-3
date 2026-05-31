// ================================================
//  PerfilAluno.js — Lógica da página de perfil
// ================================================

window.onload = function () {
    console.log("Iniciando carregamento do perfil do Aluno...");

    // Carrega dados da sessão
    if (sessionStorage.NOME_USUARIO) {
        document.getElementById('nome').innerHTML = sessionStorage.NOME_USUARIO;
    }
    if (sessionStorage.NICK_USUARIO) {
        document.getElementById('nickname').innerHTML = '@' + sessionStorage.NICK_USUARIO;
    }

    // Pré-preenche os campos de edição com dados da sessão
    preencherCamposEdicao();
};

/**
 * Alterna entre a seção de visão geral e edição de perfil
 * @param {'visao-geral' | 'editar-perfil'} secao
 */
function mostrarSecao(secao) {
    const secaoVisao  = document.getElementById('secao-visao-geral');
    const secaoEditar = document.getElementById('secao-editar-perfil');
    const menuVisao   = document.getElementById('menu-visao');
    const menuEditar  = document.getElementById('menu-editar');

    if (secao === 'editar-perfil') {
        secaoVisao.style.display  = 'none';
        secaoEditar.style.display = 'flex';
        menuVisao.classList.remove('opcao-ativa');
        menuEditar.classList.add('opcao-ativa');
        preencherCamposEdicao();
    } else {
        secaoEditar.style.display = 'none';
        secaoVisao.style.display  = 'flex';
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
}

/**
 * Valida e salva as alterações do perfil
 */
function salvarPerfil() {
    const nome     = document.getElementById('edit-nome').value.trim();
    const nick     = document.getElementById('edit-nick').value.trim();
    const senhaAt  = document.getElementById('edit-senha-atual').value;
    const senhaNv  = document.getElementById('edit-senha-nova').value;
    const senhaCf  = document.getElementById('edit-senha-conf').value;
    const notifOn  = document.getElementById('toggle-notif').checked;

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
        if (senhaNv.length < 6) {
            mostrarToast('erro', '<i class="bi bi-exclamation-circle-fill"></i> A nova senha precisa ter pelo menos 6 caracteres.');
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

    mostrarToast('sucesso', '<i class="bi bi-check-circle-fill"></i> Perfil atualizado com sucesso!');

    // Limpa campos de senha após salvar
    ['edit-senha-atual', 'edit-senha-nova', 'edit-senha-conf'].forEach(id => {
        document.getElementById(id).value = '';
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
    }, 4000);
}

function esconderToast() {
    const toast = document.getElementById('toast-feedback');
    if (toast) toast.style.display = 'none';
}
