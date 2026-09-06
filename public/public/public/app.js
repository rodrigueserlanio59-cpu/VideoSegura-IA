const EMAIL_AUTORIZADO = "rodrigueserlanio59@gmail.com";

let ultimoConteudo = "";


// ================================
// LOGIN
// ================================

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
      body: JSON.stringify({ email })
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


// ================================
// VERIFICAR LOGIN
// ================================

window.addEventListener("DOMContentLoaded", function () {

  const emailSalvo =
    localStorage.getItem("videoSeguraLogin");

  if (emailSalvo === EMAIL_AUTORIZADO) {

    document.getElementById("loginTela").style.display = "none";
    document.getElementById("app").style.display = "block";

  }

});


// ================================
// SAIR
// ================================

function sair() {

  localStorage.removeItem("videoSeguraLogin");

  document.getElementById("app").style.display = "none";
  document.getElementById("loginTela").style.display = "flex";

  document.getElementById("email").value = "";

}


// ================================
// GERAR CONTEÚDO
// ================================

async function gerarConteudo() {

  const produto =
    document.getElementById("produto").value.trim();

  const categoria =
    document.getElementById("categoria").value;

  const plataforma =
    document.getElementById("plataforma").value;

  const objetivo =
    document.getElementById("objetivo").value;

  if (!produto) {

    alert("Digite o nome do produto.");
    return;

  }

  const botao =
    document.querySelector(".gerar");

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

    document.getElementById("roteiro").textContent =
      dados.roteiro;

    document.getElementById("titulo").textContent =
      dados.titulo;

    document.getElementById("legenda").textContent =
      dados.legenda;

    document.getElementById("tags").textContent =
      dados.tags;

    ultimoConteudo =
      dados.textoCompleto;

    await analisarGerado(
      dados.textoCompleto
    );

    document.getElementById("resultado")
      .scrollIntoView({
        behavior: "smooth"
      });

  } catch (erro) {

    console.error(erro);

    alert("Erro ao gerar conteúdo.");

  } finally {

    botao.disabled = false;

    botao.textContent =
      "✨ GERAR CONTEÚDO";

  }

}


// ================================
// ANALISAR CONTEÚDO
// ================================

async function analisarGerado(texto) {

  try {

    const resposta =
      await fetch("/api/verificar", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          texto
        })

      });

    const dados =
      await resposta.json();

    const area =
      document.getElementById(
        "statusSeguranca"
      );

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

    document.getElementById(
      "statusSeguranca"
    ).textContent =
      "Não foi possível realizar a análise.";

  }

}


// ================================
// VERIFICAR TEXTO
// ================================

async function verificarTexto() {

  const texto =
    document.getElementById(
      "textoVerificar"
    ).value.trim();

  const resultado =
    document.getElementById(
      "resultadoVerificacao"
    );

  if (!texto) {

    resultado.innerHTML =
      '<div class="alerta atencao">' +
      'Digite ou cole um texto para analisar.' +
      '</div>';

    return;

  }

  resultado.innerHTML =
    '<div class="alerta">' +
    '🔎 Analisando...' +
    '</div>';

  try {

    const resposta =
      await fetch("/api/verificar", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          texto
        })

      });

    const dados =
      await resposta.json();

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
        "<br><br><strong>" +
        "Expressões para revisar:" +
        "</strong><br>" +
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
      '<div class="alerta alto">' +
      "Erro ao analisar o texto." +
      "</div>";

  }

}


// ================================
// COPIAR TUDO
// ================================

async function copiarTudo() {

  if (!ultimoConteudo) {

    alert("Gere um conteúdo primeiro.");
    return;

  }

  try {

    await navigator.clipboard
      .writeText(ultimoConteudo);

    alert("✅ Conteúdo copiado!");

  } catch (erro) {

    const area =
      document.createElement("textarea");

    area.value =
      ultimoConteudo;

    document.body.appendChild(area);

    area.select();

    document.execCommand("copy");

    area.remove();

    alert("✅ Conteúdo copiado!");

  }

}


// ================================
// MODELOS
// ================================

function modelo(categoria) {

  document.getElementById(
    "categoria"
  ).value =
    categoria.toLowerCase();

  document.getElementById(
    "produto"
  ).focus();

  window.scrollTo({

    top: 0,

    behavior: "smooth"

  });

}


// ==================================================
// NOVO: PRÉVIA DA FOTO DO PRODUTO
// ==================================================

function mostrarFotoProduto(event) {

  const arquivo =
    event.target.files[0];

  const preview =
    document.getElementById(
      "previewProduto"
    );

  const imagem =
    document.getElementById(
      "imagemPreview"
    );

  if (!arquivo) {

    preview.style.display = "none";
    imagem.src = "";

    return;

  }

  if (!arquivo.type.startsWith("image/")) {

    alert("Escolha uma imagem válida.");

    event.target.value = "";

    return;

  }

  const url =
    URL.createObjectURL(arquivo);

  imagem.src = url;

  preview.style.display = "block";

}


// ==================================================
// NOVO: CRIAR VÍDEO DO ANÚNCIO
// ==================================================

async function criarVideoAnuncio() {

  const arquivoInput =
    document.getElementById(
      "fotoProduto"
    );

  const arquivo =
    arquivoInput.files[0];

  const preco =
    document.getElementById(
      "precoProduto"
    ).value.trim();

  const texto =
    document.getElementById(
      "textoAnuncio"
    ).value.trim();

  const duracao =
    Number(
      document.getElementById(
        "duracaoVideo"
      ).value
    );

  const status =
    document.getElementById(
      "statusVideo"
    );

  const video =
    document.getElementById(
      "videoResultado"
    );

  if (!arquivo) {

    alert(
      "📸 Envie uma foto do produto primeiro."
    );

    return;

  }

  if (!texto) {

    alert(
      "📝 Digite o texto principal do anúncio."
    );

    return;

  }

  status.style.display = "block";

  status.innerHTML =
    "⏳ Preparando seu vídeo...";

  video.style.display = "none";

  try {

    const url =
      URL.createObjectURL(arquivo);

    const imagem =
      new Image();

    imagem.src = url;

    await new Promise(
      function(resolve, reject) {

        imagem.onload = resolve;
        imagem.onerror = reject;

      }
    );

    const canvas =
      document.createElement("canvas");

    canvas.width = 720;
    canvas.height = 1280;

    const ctx =
      canvas.getContext("2d");
// Áudio da narração
const audioContext =
  new AudioContext();

const destinoAudio =
  audioContext.createMediaStreamDestination();

let audioStream =
  destinoAudio.stream;
    const stream =
      canvas.captureStream(30);

    const gravador =
      new MediaRecorder(
        stream,
        {
          mimeType:
            "video/webm;codecs=vp9"
        }
      );

    const partes = [];

    gravador.ondataavailable =
      function(event) {

        if (event.data.size > 0) {

          partes.push(event.data);

        }

      };

    const terminou =
      new Promise(
        function(resolve) {

          gravador.onstop =
            function() {

              resolve();

            };

        }
      );

    gravador.start();

    const inicio =
      performance.now();

    function desenhar(agora) {

      const tempo =
        (agora - inicio) / 1000;

      const progresso =
        Math.min(
          tempo / duracao,
          1
        );

      // FUNDO
      ctx.fillStyle =
        "#0f172a";

      ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      // ZOOM SUAVE
      const escala =
        1 +
        progresso * 0.08;

      const largura =
        canvas.width * escala;

      const altura =
        canvas.height * escala;

      const x =
        (canvas.width - largura) / 2;

      const y =
        (canvas.height - altura) / 2;

      ctx.save();

      ctx.beginPath();

      ctx.roundRect(
        40,
        150,
        640,
        650,
        25
      );

      ctx.clip();

      ctx.drawImage(
        imagem,
        x,
        y,
        largura,
        altura
      );

      ctx.restore();

      // TÍTULO
      ctx.fillStyle =
        "#ffffff";

      ctx.textAlign =
        "center";

      ctx.font =
        "bold 48px Arial";

      ctx.fillText(
        "🔥 OFERTA ESPECIAL",
        360,
        90
      );

      // TEXTO DO ANÚNCIO
      ctx.font =
        "bold 38px Arial";

      const linhas =
        quebrarTexto(
          texto,
          600,
          ctx
        );

      linhas.forEach(
        function(linha, index) {

          ctx.fillText(
            linha,
            360,
            900 +
            index * 50
          );

        }
      );

      // PREÇO
      if (preco) {

        ctx.fillStyle =
          "#22c55e";

        ctx.font =
          "bold 55px Arial";

        ctx.fillText(
          preco,
          360,
          1080
        );

      }

      // CTA
      ctx.fillStyle =
        "#ffffff";

      ctx.font =
        "bold 36px Arial";

      ctx.fillText(
        "👉 SAIBA MAIS",
        360,
        1180
      );

      if (progresso < 1) {

        requestAnimationFrame(
          desenhar
        );

      } else {

        gravador.stop();

      }

    }

    requestAnimationFrame(
      desenhar
    );

    await terminou;

    const blob =
      new Blob(
        partes,
        {
          type: "video/webm"
        }
      );

    const videoUrl =
      URL.createObjectURL(blob);

    video.src =
      videoUrl;

    video.style.display =
      "block";

    status.innerHTML =
      "✅ Vídeo criado com sucesso!";

    adicionarBotaoDownload(
      videoUrl
    );

    URL.revokeObjectURL(url);

  } catch (erro) {

    console.error(erro);

    status.innerHTML =
      "❌ Não foi possível criar o vídeo. " +
      "Seu navegador pode não suportar este formato.";

  }

}


// ==================================================
// QUEBRAR TEXTO
// ==================================================

function quebrarTexto(
  texto,
  larguraMaxima,
  ctx
) {

  const palavras =
    texto.split(" ");

  const linhas = [];

  let linhaAtual = "";

  palavras.forEach(
    function(palavra) {

      const teste =
        linhaAtual
          ? linhaAtual + " " + palavra
          : palavra;

      if (
        ctx.measureText(teste).width
        <= larguraMaxima
      ) {

        linhaAtual =
          teste;

      } else {

        linhas.push(
          linhaAtual
        );

        linhaAtual =
          palavra;

      }

    }
  );

  if (linhaAtual) {

    linhas.push(
      linhaAtual
    );

  }

  return linhas.slice(0, 4);

}


// ==================================================
// BOTÃO DE DOWNLOAD
// ==================================================

function adicionarBotaoDownload(
  videoUrl
) {

  const antigo =
    document.getElementById(
      "botaoDownloadVideo"
    );

  if (antigo) {

    antigo.remove();

  }

  const botao =
    document.createElement(
      "a"
    );

  botao.id =
    "botaoDownloadVideo";

  botao.href =
    videoUrl;

  botao.download =
    "anuncio-videosegura.webm";

  botao.textContent =
    "⬇️ SALVAR VÍDEO";

  botao.style.display =
    "block";

  botao.style.marginTop =
    "15px";

  botao.style.textAlign =
    "center";

  botao.style.padding =
    "14px";

  botao.style.borderRadius =
    "10px";

  botao.style.background =
    "#22c55e";

  botao.style.color =
    "#ffffff";

  botao.style.textDecoration =
    "none";

  botao.style.fontWeight =
    "bold";

  document
    .getElementById(
      "statusVideo"
    )
    .parentNode
    .appendChild(
      botao
    );

}
// GRAVADOR DE ÁUDIO E VÍDEO
let mediaRecorder;
let recordedChunks = [];

async function iniciarGravacao() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });

    recordedChunks = [];

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = function (event) {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = function () {
      const blob = new Blob(recordedChunks, {
        type: "video/webm"
      });

      const videoUrl = URL.createObjectURL(blob);

      const botao = document.createElement("a");
      botao.id = "botaoDownloadVideo";
      botao.href = videoUrl;
      botao.download = "anuncio-videosegura.webm";
      botao.textContent = "⬇️ Baixar gravação";

      document.body.appendChild(botao);

      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();

    console.log("🔴 Gravação iniciada");

  } catch (erro) {
    console.error("Erro ao iniciar gravação:", erro);
    alert("Não foi possível acessar a câmera e o microfone.");
  }
}

function pararGravacao() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    console.log("⏹️ Gravação finalizada");
  }
}
