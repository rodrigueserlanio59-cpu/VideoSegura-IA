const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const gTTS = require("google-tts-api");
const PORT = process.env.PORT || 3000;

// Configurações
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// E-mail autorizado
const EMAIL_AUTORIZADO = "rodrigueserlanio59@gmail.com";

// Palavras/expressões que merecem revisão.
// O objetivo é reduzir riscos, não garantir aprovação das plataformas.
const EXPRESSOES_RISCO = [
  "garantido",
  "resultado garantido",
  "dinheiro fácil",
  "fique rico",
  "enriqueça",
  "cura",
  "milagre",
  "100% garantido",
  "sem esforço",
  "perca peso rapidamente",
  "resultado imediato",
  "antes e depois"
];

// Página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Verificação de acesso
app.post("/api/login", (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();

  if (email === EMAIL_AUTORIZADO) {
    return res.json({
      autorizado: true,
      mensagem: "Acesso autorizado."
    });
  }

  return res.status(403).json({
    autorizado: false,
    mensagem: "Este aplicativo é exclusivo do proprietário."
  });
});

// Verificador de risco
app.post("/api/verificar", (req, res) => {
  const texto = String(req.body.texto || "").toLowerCase();

  const encontrados = EXPRESSOES_RISCO.filter((expressao) =>
    texto.includes(expressao)
  );

  let nivel = "baixo";

  if (encontrados.length >= 4) {
    nivel = "alto";
  } else if (encontrados.length >= 1) {
    nivel = "atenção";
  }

  res.json({
    nivel,
    encontrados,
    quantidade: encontrados.length,
    mensagem:
      encontrados.length === 0
        ? "Nenhuma expressão de risco foi identificada."
        : "Revise as expressões identificadas antes de publicar."
  });
});

// Gerador básico
app.post("/api/gerar", (req, res) => {
  const {
    produto = "produto",
    categoria = "geral",
    plataforma = "TikTok",
    objetivo = "vendas"
  } = req.body;

  const roteiro = `
🎬 ROTEIRO — ${plataforma}

GANCHO:
Você já conheceu o ${produto}?

APRESENTAÇÃO:
Hoje vou mostrar alguns detalhes do ${produto} e por que ele pode ser uma opção interessante para quem procura algo na categoria ${categoria}.

DEMONSTRAÇÃO:
Mostre o produto de perto, seus principais detalhes, acabamento, funcionamento e formas de utilização.

BENEFÍCIOS:
Destaque características reais do produto e explique como ele pode ser utilizado no dia a dia.

CTA:
Confira os detalhes do produto e veja se ele combina com o que você procura.
`;

  const titulo = `${produto}: conheça os principais detalhes`;

  const legenda =
    `Conheça o ${produto}! ` +
    `Neste vídeo mostramos seus principais detalhes e características. ` +
    `Confira as informações do produto e veja se ele é ideal para você.`;

  const tags = [
    `#${limparTag(categoria)}`,
    "#produto",
    "#oferta",
    "#comprasonline",
    "#achadinhos"
  ].join(" ");

  const textoCompleto = `
${roteiro}

📝 TÍTULO
${titulo}

💬 LEGENDA
${legenda}

🏷️ TAGS
${tags}
`;

  res.json({
    sucesso: true,
    produto,
    categoria,
    plataforma,
    objetivo,
    roteiro,
    titulo,
    legenda,
    tags,
    textoCompleto
  });
});

function limparTag(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

// Rota para verificar se o servidor está funcionando
app.get("/api/status", (req, res) => {
  res.json({
    online: true,
    aplicativo: "VideoSegura IA",
    versao: "1.0.0"
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`VideoSegura IA rodando na porta ${PORT}`);
});
