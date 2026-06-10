// controla a navbar conforme o usuario esta logado ou nao
// le do sessionStorage as chaves: TIPO_USUARIO, NOME_USUARIO, FOTO_USUARIO

(function () {

  // helpers
  function getUsuario() {
    var tipo = sessionStorage.getItem("TIPO_USUARIO");
    var nome = sessionStorage.getItem("NOME_USUARIO");
    if (!tipo && !nome) return null;
    return {
      tipo: (tipo || "Aluno").toLowerCase(),
      nome: nome || "Treinador",
      foto: sessionStorage.getItem("FOTO_USUARIO") || ""
    };
  }

  function destinoPerfil(tipo) {
    return tipo === "mentor" ? "PerfilMentor.html" : "PerfilAluno.html";
  }

  function ehHome(texto) {
    var t = (texto || "").trim().toLowerCase();
    return t === "home";
  }

  // logout: limpa sessao e volta pro home
  window.fazerLogout = function () {
    sessionStorage.clear();
    window.location.href = "index.html";
  };

  document.addEventListener("DOMContentLoaded", function () {
    var user = getUsuario();
    var logado = !!user;

    // STYLE A: <nav class="Nav-Container">
    var navA = document.querySelector("nav.Nav-Container");
    if (navA) ajustarStyleA(navA, user, logado);

    // STYLE B: <nav class="nav-container"> (paginas novas: simulacao, simulacao1, teamBuilder-Selection)
    var navB = document.querySelector("nav.nav-container");
    if (navB) ajustarStyleB(navB, user, logado);

    // menu lateral (Side-Container) - acompanha style A
    var sideA = document.querySelector(".Side-Container");
    if (sideA) ajustarSideA(sideA, user, logado);

    // menu lateral novo (menu-lateral) - acompanha style B
    var sideB = document.querySelector(".menu-lateral");
    if (sideB) ajustarSideB(sideB, user, logado);
  });

  // STYLE A (Nav-Container original)
  function ajustarStyleA(nav, user, logado) {
    var opts = nav.querySelector(".Nav-Options");
    var btnCont = nav.querySelector(".Button-Container");

    if (opts) {
      var items = opts.querySelectorAll("li");
      for (var i = 0; i < items.length; i++) {
        var a = items[i].querySelector("a");
        if (!a) continue;
        var home = ehHome(a.textContent);
        items[i].style.display = (home || logado) ? "" : "none";
      }
    }

    if (btnCont) {
      if (logado) {
        var foto = user.foto || "./assets/icon/Icon-User.svg";
        var dest = destinoPerfil(user.tipo);
        btnCont.innerHTML =
          '<div class="user-perfil" onclick="location.href=\'' + dest + '\'" ' +
            'style="display:flex;align-items:center;gap:10px;cursor:pointer">' +
            '<span style="color:#fff;font-size:.8rem;font-weight:600">' + user.nome + '</span>' +
            '<img class="user" src="' + foto + '" alt="" ' +
                 'onerror="this.src=\'./assets/icon/Icon-User.svg\'" ' +
                 'style="cursor:pointer;border-radius:50%;background:#fff;width:36px;height:36px;padding:2px;object-fit:cover">' +
          '</div>' +
          '<button onclick="fazerLogout()" ' +
            'style="margin-left:10px;background:transparent;border:1px solid #fff;color:#fff;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:.72rem;font-weight:600">' +
            'Sair</button>';
      }
      // se nao logado, deixa os botoes Cadastre-se / Entrar como ja estao
    }
  }

  // SIDE A (menu lateral antigo)
  function ajustarSideA(side, user, logado) {
    var opts = side.querySelector(".Side-Options");
    var perfil = side.querySelector(".Perfil");

    if (opts) {
      var items = opts.querySelectorAll("li");
      for (var i = 0; i < items.length; i++) {
        var a = items[i].querySelector("a");
        if (!a) continue;
        var home = ehHome(a.textContent);
        items[i].style.display = (home || logado) ? "" : "none";
      }
    }

    if (perfil && logado) {
      var foto = user.foto || "assets/icon/Icon-User.svg";
      var dest = destinoPerfil(user.tipo);
      perfil.innerHTML =
        '<img src="' + foto + '" alt="" ' +
             'onerror="this.src=\'assets/icon/Icon-User.svg\'" ' +
             'style="width:48px;height:48px;border-radius:50%;cursor:pointer;background:#fff" ' +
             'onclick="location.href=\'' + dest + '\'">' +
        '<div style="display:flex;flex-direction:column;gap:6px;flex:1">' +
          '<span style="color:#fff;font-weight:600">' + user.nome + '</span>' +
          '<button onclick="fazerLogout()" ' +
            'style="background:transparent;border:1px solid #fff;color:#fff;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:.72rem">' +
            'Sair</button>' +
        '</div>';
    }
  }

  // STYLE B (nav-container novo)
  function ajustarStyleB(nav, user, logado) {
    var opts = nav.querySelector(".nav-opcoes");
    var btnNav = nav.querySelector(".container-botoes-nav");

    if (opts) {
      var items = opts.querySelectorAll("li");
      for (var i = 0; i < items.length; i++) {
        var a = items[i].querySelector("a");
        if (!a) continue;
        var home = ehHome(a.textContent);
        items[i].style.display = (home || logado) ? "" : "none";
      }
    }

    if (btnNav) {
      if (logado) {
        var foto = user.foto || "assets/icon/Icon-User.svg";
        var dest = destinoPerfil(user.tipo);
        btnNav.innerHTML =
          '<div onclick="location.href=\'' + dest + '\'" ' +
            'style="display:flex;align-items:center;gap:10px;cursor:pointer;color:#fff">' +
            '<span style="font-size:.8rem;font-weight:600">' + user.nome + '</span>' +
            '<img class="usuario-nav" src="' + foto + '" ' +
                 'onerror="this.src=\'assets/icon/Icon-User.svg\'">' +
          '</div>' +
          '<button onclick="fazerLogout()" ' +
            'style="margin-left:10px;background:transparent;color:#fff;border:1px solid rgba(255,255,255,0.5);padding:6px 12px;border-radius:8px;cursor:pointer;font-size:.72rem;font-weight:600">' +
            'Sair</button>';
      } else {
        btnNav.innerHTML =
          '<button onclick="location.href=\'login.html\'" ' +
            'style="background:#fff;color:#333;padding:8px 18px;border:none;border-radius:20px;font-weight:700;cursor:pointer;font-family:inherit">' +
            'Entrar</button>';
      }
    }
  }

  // SIDE B (menu-lateral novo)
  function ajustarSideB(side, user, logado) {
    var opts = side.querySelector(".opcoes-laterais");
    var perfil = side.querySelector(".perfil-lateral");

    if (opts) {
      var items = opts.querySelectorAll("li");
      for (var i = 0; i < items.length; i++) {
        var a = items[i].querySelector("a");
        if (!a) continue;
        var home = ehHome(a.textContent);
        items[i].style.display = (home || logado) ? "" : "none";
      }
    }

    if (perfil && logado) {
      var foto = user.foto || "assets/icon/Icon-User.svg";
      var dest = destinoPerfil(user.tipo);
      perfil.innerHTML =
        '<img src="' + foto + '" ' +
             'onerror="this.src=\'assets/icon/Icon-User.svg\'" ' +
             'style="width:48px;height:48px;border-radius:50%;cursor:pointer;background:#fff" ' +
             'onclick="location.href=\'' + dest + '\'">' +
        '<div style="display:flex;flex-direction:column;gap:4px">' +
          '<span style="color:#fff;font-weight:600">' + user.nome + '</span>' +
          '<button onclick="fazerLogout()" ' +
            'style="background:transparent;border:1px solid #fff;color:#fff;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:.72rem">' +
            'Sair</button>' +
        '</div>';
    }
  }

})();
