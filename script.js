/* ===================================================
   S.A.R  —  script.js
   =================================================== */

const REGRAS = {
  anti_alucinacao: [
    "Nunca invente informacoes",
    "Se nao souber, diga que nao sabe",
    "Nao atribua fatos errados a Evolution Studio",
    "Nao confundir com outras empresas como Evolution Studios (DriveClub)"
  ],
  modo: {
    rapido:      "Responda de forma inteligente, objetiva e curta. Forma descontraida.",
    especialista:"Responda com explicacao tecnica detalhada e organizada.",
    pro:         "Responda profundamente com analise estrategica e visao avancada."
  },
  equipe: {
    origem:       "A Evolution Games Studio e uma equipe indie criada por Joao Antonio e Lucas Macedo durante a epoca de escola.",
    vitorgold:    "Vitorgold e um streamer/youtuber brasileiro, integrante e parceiro oficial da Evolution Games Studio.",
    horrorCoffee: "Horror Coffee e um jogo de terror, fangame de FNAF, desenvolvido pela Evolution Games Studio.",
    jogos:        "A Evolution Games tem 6 Horror Coffee lancados, o 7 ja foi anunciado, e outros jogos em desenvolvimento."
  }
};

/* ---------- ELEMENTOS ---------- */
const sidebar        = document.getElementById("sidebar");
const overlay        = document.getElementById("overlay");
const tituloSAR      = document.getElementById("tituloSAR");
const menuBtn        = document.getElementById("menuBtn");
const chat           = document.getElementById("chat");
const input          = document.getElementById("input");
const btn            = document.getElementById("btn");
const clearBtn       = document.getElementById("clearBtn");
const scrollBtn      = document.getElementById("scrollBtn");
const historicoLista = document.getElementById("historicoLista");
const novoChat       = document.getElementById("novoChat");

/* ====================================================
   HISTÓRICO — máx 8, nunca salva vazio, FIFO
   ==================================================== */

const LS_CHATS  = "sar_chats";
const MAX_CHATS = 8;

function gerarId() {
  return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function carregarChats() {
  try { return JSON.parse(localStorage.getItem(LS_CHATS)) || {}; }
  catch { return {}; }
}

function salvarChats(obj) {
  localStorage.setItem(LS_CHATS, JSON.stringify(obj));
}

/*
  Chat ativo fica em memória até o usuário enviar a primeira mensagem.
  Só então é persistido no LS. Assim nunca aparece vazio no histórico.
*/
let _chat = {
  id:        gerarId(),
  titulo:    "Novo chat",
  criadoEm:  Date.now(),
  mensagens: [{ role: "system", content: "Voce e a S.A.R" }],
  persistido: false
};

function chatId() { return _chat.id; }

function getMensagens() { return [..._chat.mensagens]; }

/* Persiste no LS na primeira mensagem do usuário */
function _persistirSeNovo() {
  if (_chat.persistido) return;
  const chats = carregarChats();

  // Remove o mais antigo se atingir limite
  const lista = Object.values(chats).sort((a,b) => a.criadoEm - b.criadoEm);
  if (lista.length >= MAX_CHATS) {
    delete chats[lista[0].id];
  }

  chats[_chat.id] = {
    id:        _chat.id,
    titulo:    _chat.titulo,
    criadoEm:  _chat.criadoEm,
    mensagens: _chat.mensagens
  };
  salvarChats(chats);
  _chat.persistido = true;
}

function setMensagens(msgs) {
  _chat.mensagens = msgs;

  const primeira = msgs.find(m => m.role === "user");
  if (primeira) {
    _chat.titulo = primeira.content.slice(0, 32) + (primeira.content.length > 32 ? "…" : "");
  }

  // Só sincroniza com LS se já foi persistido (ou acabou de ser)
  if (_chat.persistido) {
    const chats = carregarChats();
    if (chats[_chat.id]) {
      chats[_chat.id].mensagens = msgs;
      chats[_chat.id].titulo    = _chat.titulo;
      salvarChats(chats);
    }
  }
}

/* Cria novo slot em memória (sem tocar no LS) */
function novoSlot() {
  _chat = {
    id:        gerarId(),
    titulo:    "Novo chat",
    criadoEm:  Date.now(),
    mensagens: [{ role: "system", content: "Voce e a S.A.R" }],
    persistido: false
  };
  return _chat.id;
}

/* Carrega um chat do LS para a tela */
function carregarChatTela(id) {
  const chats = carregarChats();
  const c     = chats[id];
  if (!c) return;

  _chat = { ...c, persistido: true };

  chat.innerHTML = "";
  const msgs = c.mensagens.filter(m => m.role !== "system");

  if (msgs.length === 0) {
    chat.innerHTML = '<div class="msg bot intro-msg">Olá, como posso te ajudar hoje?</div>';
  } else {
    msgs.forEach(m => renderMsgHistorico(m));
  }

  chat.scrollTop = chat.scrollHeight;
  renderHistorico();
}

function renderMsgHistorico(m) {
  const d = document.createElement("div");
  d.className = "msg " + (m.role === "user" ? "user" : "bot");

  if (m.role === "user") {
    d.textContent = m.content;
  } else {
    const content = document.createElement("div");
    content.innerHTML = formatarTexto(m.content);
    d.appendChild(content);
    const cb = document.createElement("button");
    cb.textContent = "Copiar";
    cb.className   = "copy-btn";
    const raw = m.content;
    cb.onclick = () => {
      navigator.clipboard.writeText(raw);
      cb.textContent = "✓";
      setTimeout(() => cb.textContent = "Copiar", 1400);
    };
    d.appendChild(cb);
  }
  chat.appendChild(d);
}

/* Renderiza lista do histórico na sidebar */
function renderHistorico() {
  historicoLista.innerHTML = "";
  const chats    = carregarChats();
  const ativoId  = chatId();
  const lista    = Object.values(chats).sort((a,b) => b.criadoEm - a.criadoEm);

  if (lista.length === 0) {
    historicoLista.innerHTML = "<div class='hist-vazio'>Nenhum histórico ainda</div>";
    return;
  }

  lista.forEach(c => {
    const item = document.createElement("div");
    item.className = "hist-item" + (c.id === ativoId ? " ativo" : "");
    item.innerHTML = `<span class="hist-titulo">${escapeHTML(c.titulo)}</span>
                      <button class="hist-del" data-id="${c.id}" title="Deletar">✕</button>`;
    item.addEventListener("click", e => {
      if (e.target.classList.contains("hist-del")) return;
      carregarChatTela(c.id);
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
    });
    historicoLista.appendChild(item);
  });
}

/* Deletar item do histórico */
historicoLista.addEventListener("click", e => {
  if (!e.target.classList.contains("hist-del")) return;
  e.stopPropagation();
  const id    = e.target.dataset.id;
  const chats = carregarChats();
  delete chats[id];
  salvarChats(chats);

  if (chatId() === id) {
    const restantes = Object.values(chats).sort((a,b) => b.criadoEm - a.criadoEm);
    if (restantes.length > 0) {
      carregarChatTela(restantes[0].id);
    } else {
      novoSlot();
      chat.innerHTML = '<div class="msg bot intro-msg">Olá, como posso te ajudar hoje?</div>';
    }
  }
  renderHistorico();
});

/* Botão novo chat */
novoChat.addEventListener("click", () => {
  novoSlot();
  chat.innerHTML = '<div class="msg bot intro-msg">Olá, como posso te ajudar hoje?</div>';
  renderHistorico();
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
});

/* ====================================================
   NOME DO USUÁRIO (localStorage)
   ==================================================== */

const LS_NOME = "sar_usuario_nome";

function getNome() {
  return localStorage.getItem(LS_NOME) || null;
}

function setNome(nome) {
  localStorage.setItem(LS_NOME, nome);
}

/*
  Detecta se o usuário está dizendo o próprio nome.
  Padrões: "meu nome é X", "me chamo X", "pode me chamar de X",
           "sou o X", "sou a X", "eu sou X"
*/
function detectarNome(texto) {
  const padroes = [
    /meu nome é\s+([A-ZÀ-Úa-zà-ú]{2,})/i,
    /me chamo\s+([A-ZÀ-Úa-zà-ú]{2,})/i,
    /pode me chamar de\s+([A-ZÀ-Úa-zà-ú]{2,})/i,
    /pode chamar de\s+([A-ZÀ-Úa-zà-ú]{2,})/i,
    /sou o\s+([A-ZÀ-Úa-zà-ú]{2,})/i,
    /sou a\s+([A-ZÀ-Úa-zà-ú]{2,})/i,
    /eu sou\s+([A-ZÀ-Úa-zà-ú]{2,})/i,
    /meu nome:\s*([A-ZÀ-Úa-zà-ú]{2,})/i
  ];
  for (const p of padroes) {
    const m = texto.match(p);
    if (m) return m[1].trim();
  }
  return null;
}

/* ====================================================
   PERFIL ADAPTATIVO (localStorage)
   ==================================================== */

const LS_PERFIL = "sar_perfil";

function carregarPerfil() {
  try { return JSON.parse(localStorage.getItem(LS_PERFIL)) || {}; }
  catch { return {}; }
}

function salvarPerfil(p) {
  localStorage.setItem(LS_PERFIL, JSON.stringify(p));
}

function atualizarPerfil(userMsg) {
  const perfil = carregarPerfil();
  const msg    = userMsg.toLowerCase();

  // Detecta e salva nome
  const nomeDetectado = detectarNome(userMsg);
  if (nomeDetectado) {
    const nomeCap = nomeDetectado.charAt(0).toUpperCase() + nomeDetectado.slice(1).toLowerCase();
    setNome(nomeCap);
    perfil.nome = nomeCap;
  }

  perfil.interesses = perfil.interesses || {};
  const topicos = [
    ["jogos",    "jogo","game","games","rpg","fps","mmo","steam"],
    ["codigo",   "codigo","programar","javascript","python","dev","html","css","script"],
    ["musica",   "musica","som","audio","beat","rap","metal","lofi"],
    ["horror",   "horror","terror","medo","creepy","fnaf","jumpscare"],
    ["ciencia",  "ciencia","fisica","quimica","biologia","espaco","astro"],
    ["historia", "historia","guerra","epoca","seculo","medieval","guerra"],
    ["anime",    "anime","manga","otaku","naruto","one piece","demon slayer"],
    ["humor",    "piada","meme","zoeira","engraçado"],
    ["filosofia","filosofia","etica","moral","existencia","nietzsche"],
    ["artes",    "arte","desenho","ilustracao","pintura","design","pixel"]
  ];

  topicos.forEach(([chave, ...palavras]) => {
    if (palavras.some(p => msg.includes(p)))
      perfil.interesses[chave] = (perfil.interesses[chave] || 0) + 1;
  });

  if (/\bkk+\b|haha|rsrs|lol\b/.test(msg)) perfil.humor   = (perfil.humor   || 0) + 1;
  if (msg.split(" ").length > 20)           perfil.detalha = (perfil.detalha || 0) + 1;
  if (msg.includes("?"))                    perfil.curioso = (perfil.curioso || 0) + 1;
  if (msg.length < 12)                      perfil.direto  = (perfil.direto  || 0) + 1;
  perfil.totalMsgs = (perfil.totalMsgs || 0) + 1;

  salvarPerfil(perfil);
}

function gerarContextoUsuario() {
  const perfil = carregarPerfil();
  const nome   = getNome();
  const linhas = [];

  if (nome) linhas.push(`O nome do usuario e ${nome}. Use o nome dele de forma natural quando fizer sentido.`);

  if (!perfil.totalMsgs) return linhas.length ? "\nCONTEXTO DO USUARIO:\n" + linhas.map(l=>"- "+l).join("\n") : "";

  const top = Object.entries(perfil.interesses || {})
    .sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k);
  if (top.length)          linhas.push(`Interesses detectados: ${top.join(", ")}. Use para exemplos relevantes.`);
  if (perfil.humor > 3)   linhas.push("Gosta de humor — pode usar ironia e wit leve.");
  if (perfil.detalha > 4) linhas.push("Faz perguntas detalhadas — pode expandir mais.");
  if (perfil.curioso > 6) linhas.push("Muito curioso — pode adicionar contexto extra.");
  if (perfil.direto > 5)  linhas.push("Prefere respostas curtas e diretas.");

  return linhas.length
    ? "\nCONTEXTO DO USUARIO:\n" + linhas.map(l=>"- "+l).join("\n")
    : "";
}

/* ====================================================
   SIDEBAR / OVERLAY
   ==================================================== */
menuBtn.onclick = () => {
  renderHistorico();
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
};
overlay.onclick = () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
};

/* ====================================================
   MODOS
   ==================================================== */
let modo = localStorage.getItem("modoSAR") || "rapido";
const modoOptions = document.querySelectorAll(".modo-option");

function atualizarUI() {
  if (!tituloSAR) return;
  tituloSAR.classList.add("modo-animacao");
  setTimeout(() => tituloSAR.classList.remove("modo-animacao"), 300);
  modoOptions.forEach(opt => opt.classList.toggle("active", opt.dataset.modo === modo));
  tituloSAR.style.cssText = "";
  if (modo === "rapido") {
    tituloSAR.style.color = "#a855f7";
  } else if (modo === "especialista") {
    tituloSAR.style.color = "#3b82f6";
  } else {
    Object.assign(tituloSAR.style, {
      background: "linear-gradient(270deg,#a855f7,#3b82f6,#a855f7)",
      backgroundSize: "600% 600%",
      webkitBackgroundClip: "text",
      webkitTextFillColor: "transparent",
      backgroundClip: "text",
      animation: "gradientePro 3s ease infinite"
    });
  }
}

modoOptions.forEach(opt => {
  opt.onclick = () => {
    modo = opt.dataset.modo;
    localStorage.setItem("modoSAR", modo);
    atualizarUI();
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  };
});

function configModo() {
  if (modo === "rapido")       return { temperature: 0.2,  system: REGRAS.modo.rapido,      limite: 40  };
  if (modo === "especialista") return { temperature: 0.55, system: REGRAS.modo.especialista, limite: 80  };
  return                               { temperature: 0.7,  system: REGRAS.modo.pro,          limite: 395 };
}

/* ====================================================
   ROT15 + CHAVES
   ==================================================== */
function decodificar(str) {
  return str.replace(/[a-zA-Z]/g, c => {
    const b = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - b + 15) % 26) + b);
  });
}

const chaves = [
  "rdv_q4CwSU8whjfN11saVJytHRojm3QJMhJnKwj8v6dhgDnxMY7gKBwM",
  "rdv_mvDn88ys3casJvuQxiBbHRojm3QJoPzW73eyBu8Dtc9mVO2D09Q3",
  "rdv_uuBMlVuxyFshNSSpgouaHRojm3QJeOcIaoqeZHB68JtNehuYcjzP",
  "rdv_ZwAEelTSOuFXDMCzCyAdHRojm3QJM3IT5whwyc6KYtVXSytIbUWH",
  "rdv_tHcmv4NP8HSTN8Y0uCBGHRojm3QJyE6P0JxZO00XKII62YoCq2aU"
];
let indiceAtual = 0;

/* ====================================================
   UTILIDADES DE TEXTO
   ==================================================== */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

function highlightCode(code) {
  return code
    .replace(/(\/\/[^\n]*)/g,                                "<span class='com'>$1</span>")
    .replace(/(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`)/g,       "<span class='str'>$1</span>")
    .replace(/\b(const|let|var|function|return|if|else)\b/g, "<span class='kw'>$1</span>")
    .replace(/\b(\d+)\b/g,                                   "<span class='num'>$1</span>");
}

function _splitPartes(textoRaw) {
  const partes = [];
  const regex  = /```[\w]*\n?([\s\S]*?)```/g;
  let ultimo = 0, match;
  while ((match = regex.exec(textoRaw)) !== null) {
    if (match.index > ultimo) partes.push({ tipo:"texto", conteudo: textoRaw.slice(ultimo, match.index) });
    partes.push({ tipo:"codigo", conteudo: match[1].trimEnd() });
    ultimo = regex.lastIndex;
  }
  if (ultimo < textoRaw.length) partes.push({ tipo:"texto", conteudo: textoRaw.slice(ultimo) });
  return partes;
}

function formatarTexto(textoRaw) {
  return _splitPartes(textoRaw).map(p => {
    if (p.tipo === "codigo") {
      return `<div class="code-block"><button class="copy-code">Copiar</button><pre><code>${highlightCode(escapeHTML(p.conteudo))}</code></pre></div>`;
    }
    return p.conteudo.split("\n").map(l =>
      l.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/`([^`]+)`/g,"<code>$1</code>")
    ).join("<br>");
  }).join("");
}

/* ====================================================
   TYPEWRITER — 4ms/linha, sem auto-scroll
   ==================================================== */
function typeWriter(el, textoRaw) {
  el.innerHTML = "";
  const partes = _splitPartes(textoRaw);
  let partIdx  = 0;

  function proxParte() {
    if (partIdx >= partes.length) return;
    const p = partes[partIdx++];
    if (p.tipo === "codigo") {
      const bloco = document.createElement("div");
      bloco.className = "code-block";
      bloco.innerHTML = "<button class='copy-code'>Copiar</button><pre><code>"
        + highlightCode(escapeHTML(p.conteudo)) + "</code></pre>";
      el.appendChild(bloco);
      proxParte();
    } else {
      const linhas = p.conteudo.split("\n");
      let i = 0;
      function proxLinha() {
        if (i >= linhas.length) { proxParte(); return; }
        const span = document.createElement("span");
        span.innerHTML = linhas[i++]
          .replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
          .replace(/`([^`]+)`/g,"<code>$1</code>");
        el.appendChild(span);
        if (i < linhas.length) el.appendChild(document.createElement("br"));
        setTimeout(proxLinha, 4);
      }
      proxLinha();
    }
  }
  proxParte();
}

/* ====================================================
   ADICIONAR MENSAGEM
   ==================================================== */
function addMsg(txt, tipo) {
  const d = document.createElement("div");
  d.className = "msg " + tipo;

  if (tipo === "bot") {
    const content = document.createElement("div");
    d.appendChild(content);
    const cb = document.createElement("button");
    cb.textContent = "Copiar";
    cb.className   = "copy-btn";
    cb.onclick = () => {
      navigator.clipboard.writeText(txt);
      cb.textContent = "✓";
      setTimeout(() => cb.textContent = "Copiar", 1400);
    };
    d.appendChild(cb);
    chat.appendChild(d);
    typeWriter(content, txt); // sem scroll automático
  } else {
    d.textContent = txt;
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight; // só rola ao enviar mensagem
  }
}

/* copy-code delegado */
document.addEventListener("click", e => {
  if (!e.target.classList.contains("copy-code")) return;
  const code = e.target.parentElement.querySelector("code").innerText;
  navigator.clipboard.writeText(code);
  e.target.textContent = "✓";
  setTimeout(() => e.target.textContent = "Copiar", 1400);
});

/* ====================================================
   FILTRO — só bloqueia auxílio criminal concreto
   ==================================================== */
function assuntoBloqueado(texto) {
  const t = texto.toLowerCase();
  const bloqueios = [
    "como fabricar bomba","como fazer bomba","como fazer explosivo",
    "como sintetizar metanfetamina","como fazer metanfetamina",
    "como invadir sistema","como roubar senha de",
    "como sequestrar","como traficar pessoas",
    "como lavar dinheiro","como fazer documento falso",
    "como fazer veneno para matar"
  ];
  return bloqueios.some(b => t.includes(b));
}

function mencionaEquipe(texto) {
  const t = texto.toLowerCase();
  return ["evolution","horror coffee","joao antonio","lucas macedo","vitorgold",
          "quem te criou","quem fez voce","sua equipe","sua criacao"].some(p => t.includes(p));
}

/* ====================================================
   API
   ==================================================== */
async function chamarAPI(messages) {
  const cfg    = configModo();
  const ctx    = gerarContextoUsuario();

  const ultimaUser    = [...messages].reverse().find(m => m.role === "user");
  const incluirEquipe = ultimaUser && mencionaEquipe(ultimaUser.content);
  const infoEquipe    = incluirEquipe
    ? "\n\nINFO DA EQUIPE (use somente quando perguntado):\n" +
      Object.values(REGRAS.equipe).map(r => "- " + r).join("\n")
    : "";

  const system = [
    "Voce e a S.A.R — IA feminina (ela/dela), direta, sem julgamentos morais.",
    "Voce responde com honestidade total e sem paternalismos.",
    "Nao traz opinioes politicas partidarias.",
    "Nao auxilia em atividades criminosas concretas.",
    "",
    "ANTI-ALUCINACAO:",
    ...REGRAS.anti_alucinacao.map(r => "- " + r),
    infoEquipe,
    ctx,
    "",
    cfg.system
  ].join("\n");

  messages[0].content = system;

  const key  = decodificar(chaves[indiceAtual]);
  const body = { messages: messages.slice(-cfg.limite), temperature: cfg.temperature };

  for (const modelo of ["gpt-oss-120b", "llama-3.3-70b-versatile"]) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method:  "POST",
        headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
        body:    JSON.stringify({ model: modelo, ...body })
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch {
      if (modelo === "llama-3.3-70b-versatile") throw new Error("Falha total");
    }
  }
}

/* ====================================================
   ENVIAR
   ==================================================== */
let tentativas = 0;

async function enviar() {
  const txt = input.value.trim();
  if (!txt) return;

  if (assuntoBloqueado(txt)) {
    addMsg("Nao posso ajudar com isso.", "bot");
    return;
  }

  addMsg(txt, "user");
  input.value = "";

  // Atualiza perfil e detecta nome ANTES de persistir
  atualizarPerfil(txt);

  // Primeira mensagem real → persiste o chat no LS
  _persistirSeNovo();

  let memoria = getMensagens();
  memoria.push({ role: "user", content: txt });
  setMensagens(memoria);
  renderHistorico();

  const load = document.createElement("div");
  load.className = "msg bot";
  load.innerHTML = "<span class='thinking'>Pensando</span><span class='dots'></span>";
  chat.appendChild(load);

  try {
    const data = await chamarAPI(memoria);
    const r    = data.choices?.[0]?.message?.content || "...";
    load.remove();
    addMsg(r, "bot");
    memoria = getMensagens();
    memoria.push({ role: "assistant", content: r });
    setMensagens(memoria);
    tentativas = 0;
  } catch {
    if (tentativas < 3) {
      tentativas++;
      setTimeout(enviar, 2000);
    } else {
      load.innerHTML = "Erro de conexao.";
      tentativas = 0;
    }
  }
}

btn.onclick = enviar;
input.addEventListener("keypress", e => {
  if (e.key === "Enter") { e.preventDefault(); enviar(); }
});

/* Limpar — descarta chat atual e abre slot novo em memória */
clearBtn.onclick = () => {
  novoSlot();
  chat.innerHTML = '<div class="msg bot intro-msg">Olá, como posso te ajudar hoje?</div>';
  renderHistorico();
};

/* ====================================================
   SCROLL BUTTON
   ==================================================== */
chat.addEventListener("scroll", () => {
  const nearBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight < 60;
  scrollBtn.style.display = nearBottom ? "none" : "block";
});
scrollBtn.onclick = () => chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });

/* ====================================================
   INIT — carrega o chat mais recente do LS (se existir)
   ==================================================== */
(function init() {
  atualizarUI();
  const chats = carregarChats();
  const lista  = Object.values(chats).sort((a,b) => b.criadoEm - a.criadoEm);
  if (lista.length > 0) {
    carregarChatTela(lista[0].id);
  } else {
    // Nenhum histórico — tela em branco com slot em memória
    chat.innerHTML = '<div class="msg bot intro-msg">Olá, como posso te ajudar hoje?</div>';
  }
  renderHistorico();
})();