const EMAIL_AUTORIZADO = "rodrigueserlanio59@gmail.com";

let ultimoConteudo = "";

// LOGIN
async function entrar() {
  const emailInput = document.getElementById("email");
  const mensagem = document.getElementById("loginMensagem");

  const email = emailInput.value.trim().toLowerCase();

  if (!email) {
    mensagem.textContent = "Digite seu e-mail.";
    return;
  }

  mensagem.textContent = "⏳ Verificando acesso...";

  try {
    const resposta = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: email })
    });

    const dados = await resposta.json();

    if (resposta.ok && dados.autorizado === true) {
      localStorage.setItem("videoSeguraLogin", email);

      document.getElementById("loginTela").style.display = "none";
      document.getElementById("app").style.display = "block";

      mensagem.textContent = "";
    } else {
      mensagem.textContent =
        "❌ " + (dados.mensagem || "Acesso não autorizado.");
    }

  } catch (erro) {
    console.error(erro);
    mensagem.textContent =
      "❌ Não foi possível conectar ao servidor.";
  }
}


// VERIFICAR LOGIN AO ABRIR
window.addEventListener("DOMContentLoaded", function () {

  const emailSalvo = localStorage.getItem("videoSeguraLogin");

  if (emailSalvo === EMAIL_AUTORIZADO) {
    document.getElementById("loginTela").style.display = "none";
    document.getElementById("app").style.display = "block";
  }

});


// SAIR
function sair() {

  localStorage.removeItem("videoSeguraLogin");

  document.getElementById("app").style.display = "none";
  document.getElementById("loginTela").style.display = "flex";

  document.getElementById("email").value = "";
}


// GERAR CONTEÚDO
async function gerarConteudo() {

  const produto = document.getElementById("produto").value.trim();
  const categoria = document.getElementById("categoria").value;
  const plataforma = document.getElementById("plataforma").value;
  const objetivo = document.getElementById("objetivo").value;

  if (!produto) {
    alert("Digite o nome do produto.");
    return;
  }

  const botao = document.querySelector(".gerar");

  botao.disabled = true;
  botao.textContent = "⏳ Gerando...";

  try {

    const resposta = await fetch("/api/gerar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        produto,
        categoria,
        plataforma,
        objetivo
      })
    });

    const dados = await resposta.json();

    if (!dados.sucesso) {
      alert("Não foi possível gerar o conteúdo.");
      return;
    }

    document.getElementById("resultado").style.display = "block";

    document.getElementById("roteiro").textContent = dados.roteiro;
    document.getElementById("titulo").textContent = dados.titulo;
    document.getElementById("legenda").textContent = dados.legenda;
    document.getElementById("tags").textContent = dados.tags;

    ultimoConteudo = dados.textoCompleto;

    await analisarGerado(dados.textoCompleto);

    document.getElementById("resultado").scrollIntoView({
      behavior: "smooth"
    });

  } catch (erro) {

    console.error(erro);
    alert("Erro ao gerar conteúdo.");

  } finally {

    botao.disabled = false;
    botao.textContent = "✨ GERAR CONTEÚDO";

  }
}


// ANALISAR CONTEÚDO GERADO
async function analisarGerado(texto) {

  try {

    const resposta = await fetch("/api/verificar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ texto: texto })
    });

    const dados = await resposta.json();

    const area = document.getElementById("statusSeguranca");

    if (dados.nivel === "baixo") {

      area.innerHTML =
        "🟢 <strong>Risco baixo</strong><br>" +
        dados.mensagem;

    } else if (dados.nivel === "atenção") {

      area.innerHTML =
        "🟡 <strong>Atenção</strong><br>" +
        dados.mensagem +
        "<br><br>Expressões encontradas: " +
        dados.encontrados.join(", ");

    } else {

      area.innerHTML =
        "🔴 <strong>Risco alto</strong><br>" +
        dados.mensagem +
        "<br><br>Expressões encontradas: " +
        dados.encontrados.join(", ");

    }

  } catch (erro) {

    console.error(erro);

    document.getElementById("statusSeguranca").textContent =
      "Não foi possível realizar a análise.";

  }
}


// VERIFICAR TEXTO
async function verificarTexto() {

  const texto =
    document.getElementById("textoVerificar").value.trim();

  const resultado =
    document.getElementById("resultadoVerificacao");

  if (!texto) {
    resultado.innerHTML =
      '<div class="alerta atencao">Digite ou cole um texto para analisar.</div>';
    return;
  }

  resultado.innerHTML =
    '<div class="alerta">🔎 Analisando...</div>';

  try {

    const resposta = await fetch("/api/verificar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ texto: texto })
    });

    const dados = await resposta.json();

    let classe = "baixo";
    let emoji = "🟢";

    if (dados.nivel === "atenção") {
      classe = "atencao";
      emoji = "🟡";
    }

    if (dados.nivel === "alto") {
      classe = "alto";
      emoji = "🔴";
    }

    let detalhes = "";

    if (dados.encontrados.length > 0) {
      detalhes =
        "<br><br><strong>Expressões para revisar:</strong><br>" +
        dados.encontrados.join(", ");
    }

    resultado.innerHTML =
      '<div class="alerta ' + classe + '">' +
      emoji +
      " <strong>Nível: " +
      dados.nivel.toUpperCase() +
      "</strong><br>" +
      dados.mensagem +
      detalhes +
      "</div>";

  } catch (erro) {

    console.error(erro);

    resultado.innerHTML =
      '<div class="alerta alto">Erro ao analisar o texto.</div>';

  }
}


// COPIAR TUDO
async function copiarTudo() {

  if (!ultimoConteudo) {
    alert("Gere um conteúdo primeiro.");
    return;
  }

  try {

    await navigator.clipboard.writeText(ultimoConteudo);

    alert("✅ Conteúdo copiado!");

  } catch (erro) {

    const area = document.createElement("textarea");

    area.value = ultimoConteudo;

    document.body.appendChild(area);

    area.select();

    document.execCommand("copy");

    area.remove();

    alert("✅ Conteúdo copiado!");

  }
}


// MODELOS
function modelo(categoria) {

  document.getElementById("categoria").value =
    categoria.toLowerCase();

  document.getElementById("produto").focus();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}
