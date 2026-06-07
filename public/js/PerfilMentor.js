window.onload = function () {
    var nomeSalvo = sessionStorage.getItem('NOME_USUARIO');
    if (nomeSalvo) {
        document.getElementById('nome').textContent = nomeSalvo;
    }
};

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

    sessionStorage.setItem('NOME_USUARIO', nome);
    sessionStorage.setItem('NOTIF_ATIVA', notifOn ? 'true' : 'false');

    document.getElementById('nome').textContent = nome;

    limparSenhas();
    mostrarToast('sucesso', '<i class="bi bi-check-circle-fill"></i> Perfil atualizado com sucesso!');
}

function deletarConta() {
    var confirmado = window.confirm('Deseja mesmo deletar sua conta?');
    if (confirmado) {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}

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
