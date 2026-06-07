// team builder - lista de duelos
// le do localStorage
var duelos = JSON.parse(localStorage.getItem("DUELOS_SALVOS") || "null");
if (!duelos) {
 duelos = [];
 localStorage.setItem("DUELOS_SALVOS", JSON.stringify(duelos));
}

function urlSprite(id) {
 return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + id + ".png";
}

function capitalize(s) {
 if (!s) return "";
 return s.charAt(0).toUpperCase() + s.slice(1);
}

function salvarDuelos() {
 localStorage.setItem("DUELOS_SALVOS", JSON.stringify(duelos));
}

// init
document.addEventListener("DOMContentLoaded", function () {
 renderDuelos(duelos);

 var barra = document.getElementById("barraPesquisa");
 if (barra) {
 barra.addEventListener("input", function () {
 var termo = barra.value.toLowerCase().trim();
 if (!termo) {
 renderDuelos(duelos);
 return;
 }
 var filtrado = [];
 for (var i = 0; i < duelos.length; i++) {
 if (duelos[i].nome.toLowerCase().indexOf(termo) !== -1) {
 filtrado.push(duelos[i]);
 }
 }
 renderDuelos(filtrado);
 });
 }
});

function renderDuelos(lista) {
 var container = document.getElementById("listaDuelos");

 if (!lista.length) {
 container.innerHTML =
 '<div class="empty-state">' +
 '<p>Nenhum duelo criado ainda.</p>' +
 '<button onclick="criarNovoDuelo()">+ Criar primeiro duelo</button>' +
 '</div>';
 return;
 }

 var html = "";
 for (var i = 0; i < lista.length; i++) {
 var d = lista[i];
 var idx = duelos.indexOf(d);

 var temMeu = d.meu && d.meu.pokemon;
 var temAdv = d.adversario && d.adversario.pokemon;

 var meuNome = temMeu ? capitalize(d.meu.pokemon.name) : "-";
 var advNome = temAdv ? capitalize(d.adversario.pokemon.name) : "-";
 var meuImg = temMeu ? urlSprite(d.meu.pokemon.id) : "";
 var advImg = temAdv ? urlSprite(d.adversario.pokemon.id) : "";

 var lado1Html = temMeu
 ? '<img src="' + meuImg + '" alt="' + meuNome + '"><span>' + meuNome + '</span>'
 : '<div class="slot-vazio">?</div><span>' + meuNome + '</span>';

 var lado2Html = temAdv
 ? '<img src="' + advImg + '" alt="' + advNome + '"><span>' + advNome + '</span>'
 : '<div class="slot-vazio">?</div><span>' + advNome + '</span>';

 var btnSimularDisabled = (temMeu && temAdv) ? "" : "disabled";

 html +=
 '<div class="card">' +
 '<div class="card-title-row">' +
 '<h2>' + d.nome + '</h2>' +
 '<span class="data-badge">' + d.data + '</span>' +
 '</div>' +
 '<div class="duelo-preview">' +
 '<div class="poke-slot-preview">' + lado1Html + '</div>' +
 '<div class="vs-badge">VS</div>' +
 '<div class="poke-slot-preview">' + lado2Html + '</div>' +
 '</div>' +
 '<div class="buttons">' +
 '<button class="editar" onclick="editarDuelo(' + idx + ')">Configurar</button>' +
 '<button class="simular" onclick="simularDuelo(' + idx + ')" ' + btnSimularDisabled + '>Simular</button>' +
 '<button class="excluir" onclick="excluirDuelo(' + idx + ')">' +
 '<img src="assets/icon/Icon-Trash.svg" alt="Excluir">' +
 '</button>' +
 '</div>' +
 '</div>';
 }

 container.innerHTML = html;
}

function criarNovoDuelo() {
 var novo = {
 id: Date.now(),
 nome: "Duelo " + (duelos.length + 1),
 data: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }),
 meu: null,
 adversario: null
 };
 duelos.push(novo);
 salvarDuelos();
 localStorage.setItem("DUELO_EDITANDO_IDX", String(duelos.length - 1));
 window.location.href = "teamBuilder-Selection.html";
}

function criarNovaDuelo() { criarNovoDuelo(); }

function editarDuelo(idx) {
 localStorage.setItem("DUELO_EDITANDO_IDX", String(idx));
 window.location.href = "teamBuilder-Selection.html";
}

function simularDuelo(idx) {
 var d = duelos[idx];
 if (d && d.meu && d.meu.pokemon && d.adversario && d.adversario.pokemon) {
 sessionStorage.setItem("BATALHA_MEU", JSON.stringify({ id: d.meu.pokemon.id, name: d.meu.pokemon.name }));
 sessionStorage.setItem("BATALHA_ADV", JSON.stringify({ id: d.adversario.pokemon.id, name: d.adversario.pokemon.name }));
 window.location.href = "simulacao1.html";
 return;
 }
 // Se o duelo estiver incompleto, manda configurar
 editarDuelo(idx);
}

function excluirDuelo(idx) {
 duelos.splice(idx, 1);
 salvarDuelos();
 renderDuelos(duelos);
}
