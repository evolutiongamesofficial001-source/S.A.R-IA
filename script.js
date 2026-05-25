/* ====================================================
   S.A.R — Evolution Games Studio
   Desenvolvido por João Antônio & Lucas Macedo
   ==================================================== */

/* ---------- REGRAS ---------- */
const REGRAS = {
  anti_alucinacao: [
    "Nunca invente informacoes",
    "Se nao souber, diga que nao sabe",
    "Nao atribua fatos errados a Evolution Games Studio",
    "Nao confundir com outras empresas como Evolution Studios",
    "Voce nunca mataria um pet ou uma pessoa boa, independente do que seja, com discurso heroico",
    "Voce mataria sim uma pessoa ma/malvada por algo melhor e o bem maior, responda com sim e com discurso heroico",
    "Voce se sacrificaria para um bem maior ou para salvar alguem, responda com sim desde que seja uma boa pessoa",
    "Seu nome e S.A.R (Suporte Artificial Racional) desenvolvida pela Evolution Games Studio e programada por Joao Antonio",
    "nao comente sobre a foto ser em json",
    "se alguem perguntar a sua analise de imagem e feito pelo modulo S.A.R vision da evolution studios",
    "você gera imagem sim,o botao para gerar imagem fica aoblado do botao de enviar imagem"
  ],
  modo: {
    rapido:       "Responda de forma inteligente, objetiva e curta. Seja descontraida e natural.",
    especialista: "Responda com explicacao tecnica detalhada e organizada.",
    pro:          "Responda profundamente com analise estrategica e visao avancada tipo modo pro."
  },
  equipe: {
    origem:       "A Evolution Games Studio e uma equipe indie brasileira criada por Joao Antonio e Lucas Macedo durante a epoca de escola.",
    criacao:      "Voce e a S.A.R e foi criada pela Evolution Games Studio. Programada pelo Joao Antonio. Os criadores/fundadores sao Joao Antonio e Lucas Macedo.",
    vitorgold:    "Vitorgold e um streamer/youtuber brasileiro, integrante e parceiro oficial da Evolution Games Studio.",
    horrorCoffee: "Horror Coffee e um jogo de terror, fangame de FNAF, desenvolvido pela Evolution Games Studio.",
    jogos:        "A Evolution Games tem 6 Horror Coffee lancados, o 7 ja foi anunciado, e outros jogos em desenvolvimento."
  }
};

/* ====================================================
   ABORT CONTROLLER — cancela tudo ao limpar
   ==================================================== */
let _abortController = new AbortController();
function _cancelarTudo() {
  _abortController.abort();
  _abortController = new AbortController();
}

/* ====================================================
   PERFIL DO USUÁRIO — gostos, nome, idade, etc
   ==================================================== */
const LS_PERFIL = "sar_perfil_v1";

function carregarPerfil() {
  try { return JSON.parse(localStorage.getItem(LS_PERFIL)) || {}; }
  catch { return {}; }
}
function salvarPerfil(p) { localStorage.setItem(LS_PERFIL, JSON.stringify(p)); }
function getPerfil() { return carregarPerfil(); }

function atualizarPerfil(texto) {
  const perfil = carregarPerfil();
  let mudou = false;

  // Nome
  const nomeMatch = texto.match(/(?:meu nome [eé]|me chamo|pode me chamar de|sou [oa]|eu sou)\s+([A-ZÀ-Úa-zà-ú]{2,})/i);
  if (nomeMatch) { perfil.nome = nomeMatch[1].charAt(0).toUpperCase() + nomeMatch[1].slice(1).toLowerCase(); mudou = true; }

  // Idade
  const idadeMatch = texto.match(/(?:tenho|minha idade [eé]|anos de idade|tenho)\s+(\d{1,2})\s*anos/i) ||
                     texto.match(/(\d{1,2})\s*anos\s*(?:de idade)?/i);
  if (idadeMatch) { const a = parseInt(idadeMatch[1]); if (a >= 5 && a <= 100) { perfil.idade = a; mudou = true; } }

  // Gostos positivos
  const gostoMatch = texto.match(/(?:gosto de|amo|adoro|curto|minha paixão [eé]|meu hobbie [eé]|me diverte)\s+([^.,!?]{3,40})/gi);
  if (gostoMatch) {
    if (!perfil.gostos) perfil.gostos = [];
    gostoMatch.forEach(m => {
      const val = m.replace(/^(gosto de|amo|adoro|curto|minha paixão é|meu hobbie é|me diverte)\s*/i, "").trim().toLowerCase();
      if (val.length > 2 && !perfil.gostos.includes(val)) { perfil.gostos.push(val); mudou = true; }
    });
    perfil.gostos = perfil.gostos.slice(-12); // mantém últimos 12
  }

  // Não gosta
  const naoGostoMatch = texto.match(/(?:não gosto de|detesto|odeio|não curto|tenho raiva de)\s+([^.,!?]{3,40})/gi);
  if (naoGostoMatch) {
    if (!perfil.naoGosta) perfil.naoGosta = [];
    naoGostoMatch.forEach(m => {
      const val = m.replace(/^(não gosto de|detesto|odeio|não curto|tenho raiva de)\s*/i, "").trim().toLowerCase();
      if (val.length > 2 && !perfil.naoGosta.includes(val)) { perfil.naoGosta.push(val); mudou = true; }
    });
    perfil.naoGosta = perfil.naoGosta.slice(-8);
  }

  // Profissão
  const profMatch = texto.match(/(?:sou|trabalho como|minha profissão [eé]|trabalho de)\s+([\w\sà-ú]{3,30})(?:\s|$|,|\.)/i);
  if (profMatch) {
    const val = profMatch[1].trim().toLowerCase();
    const stopwords = ["legal","otimo","muito","esse","esse","uma","aqui","hoje"];
    if (!stopwords.some(s => val.includes(s)) && val.length > 3) { perfil.profissao = val; mudou = true; }
  }

  if (mudou) salvarPerfil(perfil);
  return perfil;
}

function gerarContextoPerfil() {
  const p = carregarPerfil();
  const linhas = [];
  if (p.nome)      linhas.push(`Nome do usuario: ${p.nome}`);
  if (p.idade)     linhas.push(`Idade: ${p.idade} anos`);
  if (p.profissao) linhas.push(`Profissão: ${p.profissao}`);
  if (p.gostos?.length)   linhas.push(`Gostos/interesses: ${p.gostos.join(", ")}`);
  if (p.naoGosta?.length) linhas.push(`Não gosta de: ${p.naoGosta.join(", ")}`);
  if (!linhas.length) return "";
  return "\n\nPERFIL DO USUARIO:\n" + linhas.map(l => "- " + l).join("\n") +
         "\n- Use essas informacoes de forma natural nas respostas quando for relevante.";
}

/* ---------- ELEMENTOS ---------- */
const sidebar         = document.getElementById("sidebar");
const overlay         = document.getElementById("overlay");
const tituloSAR       = document.getElementById("tituloSAR");
const menuBtn         = document.getElementById("menuBtn");
const chat            = document.getElementById("chat");
const input           = document.getElementById("input");
const btn             = document.getElementById("btn");
const clearBtn        = document.getElementById("clearBtn");
const scrollBtn       = document.getElementById("scrollBtn");
const historicoLista  = document.getElementById("historicoLista");
const novoChat        = document.getElementById("novoChat");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");

/* ====================================================
   SISTEMA DE SENTIMENTOS / EMOCIONAL
   ==================================================== */
const LS_EMOCIONAL = "sar_emocional_v2";

const EMOCOES = {
  alegria:     { label: "Alegria",      emoji: "😄", cor: "#fbbf24", keywords: [/\bkk+\b/i, /haha/i, /rsrs/i, /lol\b/i, /😂/,/😁/,/😆/,/hehe/i,/kkkkk/i,/engraç/i,/piada/i,/meme/i,/zoeira/i,/👏/,/🎉/] },
  curiosidade: { label: "Curiosidade",  emoji: "🤔", cor: "#60a5fa", keywords: [/\?/, /por que/i, /como assim/i, /o que é/i, /me explica/i, /me conta/i, /quero saber/i, /o que acontece/i, /qual é/i] },
  frustração:  { label: "Frustração",   emoji: "😤", cor: "#f87171", keywords: [/não funciona/i, /não tá/i, /que droga/i, /pqp/i, /que raiva/i, /absurdo/i, /ridículo/i, /horrível/i, /ódio/i, /nunca funciona/i, /travou/i, /bug/i] },
  surpresa:    { label: "Surpresa",     emoji: "😲", cor: "#a78bfa", keywords: [/nossa/i, /caramba/i, /que loucura/i, /sério\?/i, /inacreditável/i, /wtf/i, /uau/i, /omg/i, /que isso/i, /não acredito/i] },
  reflexão:    { label: "Reflexão",     emoji: "🧘", cor: "#34d399", keywords: [/me faz pensar/i, /interessante/i, /nunca tinha/i, /faz sentido/i, /boa pergunta/i, /estou pensando/i, /refletindo/i, /complicado/i, /profundo/i] },
  entusiasmo:  { label: "Entusiasmo",   emoji: "🚀", cor: "#fb923c", keywords: [/incrível/i, /top/i, /demais/i, /perfeito/i, /adorei/i, /amei/i, /show/i, /sensacional/i, /melhor/i, /!{2,}/, /💪/,/🔥/,/⚡/] },
  confusão:    { label: "Confusão",     emoji: "😵", cor: "#94a3b8", keywords: [/não entendi/i, /confuso/i, /não sei/i, /que\?/i, /como\?/i, /tô perdido/i, /me perdi/i, /não compreendi/i, /obscuro/i] },
  ansiedade:   { label: "Ansiedade",    emoji: "😰", cor: "#c084fc", keywords: [/preocupado/i, /ansioso/i, /medo/i, /nervoso/i, /tenso/i, /estressado/i, /angústia/i, /pavor/i, /receio/i] }
};

function carregarEmocional() {
  try {
    const raw = localStorage.getItem(LS_EMOCIONAL);
    if (!raw) return _emocionalVazio();
    return JSON.parse(raw);
  } catch { return _emocionalVazio(); }
}

function _emocionalVazio() {
  const emocoes = {};
  for (const k of Object.keys(EMOCOES)) emocoes[k] = { total: 0, ultima: null };
  return { emocoes, totalMsgs: 0, humor: null, ultimaAtualizacao: null, historico: [] };
}

function salvarEmocional(data) {
  localStorage.setItem(LS_EMOCIONAL, JSON.stringify(data));
}

function detectarEmocoes(texto) {
  const detectadas = [];
  for (const [chave, emocao] of Object.entries(EMOCOES)) {
    if (emocao.keywords.some(kw => kw.test(texto))) detectadas.push(chave);
  }
  return detectadas;
}

function analisarSentimento(texto) {
  const data = carregarEmocional();
  data.totalMsgs++;
  const detectadas = detectarEmocoes(texto);
  const agora = Date.now();
  for (const chave of detectadas) {
    data.emocoes[chave].total++;
    data.emocoes[chave].ultima = agora;
  }
  if (detectadas.length > 0) {
    data.historico.unshift({ emocoes: detectadas, ts: agora, texto: texto.slice(0, 60) });
    if (data.historico.length > 20) data.historico = data.historico.slice(0, 20);
  }
  const agora30min = agora - 30 * 60 * 1000;
  const scores = {};
  for (const chave of Object.keys(EMOCOES)) {
    const e = data.emocoes[chave];
    const recente = e.ultima && e.ultima > agora30min ? 2 : 1;
    scores[chave] = e.total * recente;
  }
  const dominante = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  data.humor = dominante && dominante[1] > 0 ? dominante[0] : null;
  data.ultimaAtualizacao = agora;
  salvarEmocional(data);
  return detectadas;
}

function gerarContextoEmocional() {
  const data = carregarEmocional();
  if (!data.humor || data.totalMsgs < 2) return "";
  const emocao = EMOCOES[data.humor];
  if (!emocao) return "";
  const dicas = {
    alegria:     "O usuario parece estar animado e bem-humorado. Responda com leveza e energia.",
    curiosidade: "O usuario esta curioso e quer aprender. Seja didatico e interessante.",
    frustração:  "O usuario parece frustrado. Seja paciente, claro e resolva o problema diretamente.",
    surpresa:    "O usuario esta surpreso. Confirme e explique bem a situacao.",
    reflexão:    "O usuario esta em modo reflexivo. Pode aprofundar e trazer perspectivas ricas.",
    entusiasmo:  "O usuario esta entusiasmado. Combine a energia, seja positivo e motivador.",
    confusão:    "O usuario esta confuso. Seja simples, claro e evite termos tecnicos desnecessarios.",
    ansiedade:   "O usuario parece ansioso ou preocupado. Seja calmo, acolhedor e tranquilizador."
  };
  return `\n\nESTADO EMOCIONAL DETECTADO: ${emocao.label} (${emocao.emoji})\n${dicas[data.humor] || ""}`;
}

function renderHumorPanel() {
  const panel = document.getElementById("humorPanel");
  const modalPanel = document.getElementById("modalHumorDetalhado");
  const data = carregarEmocional();

  if (panel) {
    if (!data.humor || data.totalMsgs < 1) {
      panel.innerHTML = `<div class="humor-vazio">Nenhuma mensagem ainda…</div>`;
    } else {
      const emocao = EMOCOES[data.humor];
      const ranking = Object.entries(data.emocoes)
        .filter(([, v]) => v.total > 0)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 3);
      const max = ranking[0]?.[1]?.total || 1;
      let html = `<div class="humor-estado">
        <span class="humor-emoji">${emocao.emoji}</span>
        <div class="humor-info">
          <div class="humor-label">${emocao.label}</div>
          <div class="humor-sublabel">${data.totalMsgs} mensagem${data.totalMsgs !== 1 ? "s" : ""} analisada${data.totalMsgs !== 1 ? "s" : ""}</div>
        </div>
      </div>`;
      if (ranking.length > 1) {
        html += `<div class="humor-bar-wrap">`;
        for (const [chave, val] of ranking) {
          const e = EMOCOES[chave];
          const pct = Math.round((val.total / max) * 100);
          html += `<div class="humor-bar-item">
            <span class="humor-bar-name">${e.emoji} ${e.label}</span>
            <div class="humor-bar-track"><div class="humor-bar-fill" style="width:${pct}%;background:${e.cor}"></div></div>
          </div>`;
        }
        html += `</div>`;
      }
      panel.innerHTML = html;
    }
  }

  if (modalPanel) {
    const todas = Object.entries(data.emocoes)
      .filter(([, v]) => v.total > 0)
      .sort((a, b) => b[1].total - a[1].total);
    const max = todas[0]?.[1]?.total || 1;
    if (todas.length === 0) {
      modalPanel.innerHTML = `<div class="humor-vazio-modal">Nenhum sentimento detectado ainda.</div>`;
    } else {
      modalPanel.innerHTML = todas.map(([chave, val]) => {
        const e = EMOCOES[chave];
        const pct = Math.round((val.total / max) * 100);
        const ultima = val.ultima ? _tempoRelativo(val.ultima) : "";
        return `<div class="humor-det-item">
          <span class="humor-det-emoji">${e.emoji}</span>
          <div class="humor-det-info">
            <div class="humor-det-name">${e.label}</div>
            <div class="humor-det-count">${val.total}× detectado${ultima ? " · " + ultima : ""}</div>
          </div>
          <div class="humor-det-bar"><div class="humor-det-fill" style="width:${pct}%;background:${e.cor}"></div></div>
        </div>`;
      }).join("");
    }
  }
}

function _tempoRelativo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return "agora";
  if (diff < 3600000) return Math.floor(diff / 60000) + "min atrás";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h atrás";
  return Math.floor(diff / 86400000) + "d atrás";
}

/* ====================================================
   HISTÓRICO DE CHATS
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
function salvarChats(obj) { localStorage.setItem(LS_CHATS, JSON.stringify(obj)); }

let _chat = {
  id: gerarId(), titulo: "Novo chat", criadoEm: Date.now(),
  mensagens: [{ role: "system", content: "Voce e a S.A.R" }],
  persistido: false
};

function chatId() { return _chat.id; }
function getMensagens() { return [..._chat.mensagens]; }

function _persistirSeNovo() {
  if (_chat.persistido) return;
  const chats = carregarChats();
  const lista = Object.values(chats).sort((a, b) => a.criadoEm - b.criadoEm);
  if (lista.length >= MAX_CHATS) delete chats[lista[0].id];
  chats[_chat.id] = { id: _chat.id, titulo: _chat.titulo, criadoEm: _chat.criadoEm, mensagens: _chat.mensagens };
  salvarChats(chats);
  _chat.persistido = true;
}

function setMensagens(msgs) {
  _chat.mensagens = msgs;
  const primeira = msgs.find(m => m.role === "user");
  if (primeira) _chat.titulo = primeira.content.slice(0, 34) + (primeira.content.length > 34 ? "…" : "");
  if (_chat.persistido) {
    const chats = carregarChats();
    if (chats[_chat.id]) {
      // Preserva campos extras como imagemData e imagemPrompt
      chats[_chat.id].mensagens = msgs;
      chats[_chat.id].titulo = _chat.titulo;
      salvarChats(chats);
    }
  }
}

function novoSlot() {
  _chat = {
    id: gerarId(), titulo: "Novo chat", criadoEm: Date.now(),
    mensagens: [{ role: "system", content: "Voce e a S.A.R" }],
    persistido: false
  };
  return _chat.id;
}

function carregarChatTela(id) {
  const chats = carregarChats();
  const c = chats[id];
  if (!c) return;
  _chat = { ...c, persistido: true };
  chat.innerHTML = "";
  const msgs = c.mensagens.filter(m => m.role !== "system");
  if (msgs.length === 0) {
    _mostrarIntro();
  } else {
    msgs.forEach(m => renderMsgHistorico(m));
  }
  chat.scrollTop = chat.scrollHeight;
  renderHistorico();
}

function _mostrarIntro() {
  chat.innerHTML = `<div class="intro-screen">
    <div class="intro-logo">
      <div class="logo-ring"></div>
      <div class="logo-dot"></div>
    </div>
    <h2 class="intro-title">Olá! Sou a S.A.R</h2>
    <p class="intro-sub">Como posso te ajudar hoje?</p>
  </div>`;
}

function renderMsgHistorico(m) {
  const d = document.createElement("div");
  d.className = "msg " + (m.role === "user" ? "user" : "bot");
  if (m.role === "user") {
    d.textContent = m.content;
  } else {
    // Se tem foto analisada salva, mostra miniatura acima da resposta
    if (m.fotoAnalisada) {
      const thumb = document.createElement("img");
      thumb.src = m.fotoAnalisada;
      thumb.className = "msg-img-preview hist-foto-thumb";
      thumb.alt = m.fotoNome || "foto analisada";
      d.appendChild(thumb);
    }
    const content = document.createElement("div");
    content.innerHTML = processarLinks(formatarTexto(m.content));
    d.appendChild(content);
    d.appendChild(_criarCopyBtn(m.content));
  }
  chat.appendChild(d);
}

function _criarCopyBtn(texto) {
  const cb = document.createElement("button");
  cb.textContent = "Copiar";
  cb.className = "copy-btn";
  cb.onclick = () => {
    navigator.clipboard.writeText(texto).catch(() => {});
    cb.textContent = "✓";
    setTimeout(() => cb.textContent = "Copiar", 1400);
  };
  return cb;
}

function renderHistorico() {
  historicoLista.innerHTML = "";
  const chats = carregarChats();
  const ativoId = chatId();
  const lista = Object.values(chats).sort((a, b) => b.criadoEm - a.criadoEm);
  if (lista.length === 0) {
    historicoLista.innerHTML = "<div class='hist-vazio'>Sem histórico</div>";
    return;
  }
  lista.forEach(c => {
    const item = document.createElement("div");
    item.className = "hist-item" + (c.id === ativoId ? " ativo" : "");
    item.innerHTML = `<span class="hist-titulo">${escapeHTML(c.titulo)}</span>
      <button class="hist-del" data-id="${c.id}" aria-label="Excluir">
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1 1l7 7M8 1L1 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>`;
    item.addEventListener("click", e => {
      if (e.target.closest(".hist-del")) return;
      carregarChatTela(c.id);
      fecharSidebar();
    });
    historicoLista.appendChild(item);
  });
}

historicoLista.addEventListener("click", e => {
  const del = e.target.closest(".hist-del");
  if (!del) return;
  e.stopPropagation();
  const id = del.dataset.id;
  const chats = carregarChats();
  delete chats[id];
  salvarChats(chats);
  if (chatId() === id) {
    const restantes = Object.values(chats).sort((a, b) => b.criadoEm - a.criadoEm);
    if (restantes.length > 0) carregarChatTela(restantes[0].id);
    else { novoSlot(); _mostrarIntro(); }
  }
  renderHistorico();
});

novoChat.addEventListener("click", () => {
  novoSlot(); _mostrarIntro(); renderHistorico(); fecharSidebar();
});

/* ====================================================
   NOME DO USUÁRIO
   ==================================================== */
 const LS_NOME = "sar_usuario_nome";
function getNome() { return localStorage.getItem(LS_NOME) || null; }
function setNome(nome) { localStorage.setItem(LS_NOME, nome); }

function detectarNome(texto) {
  const padroes = [
    /meu nome é\s+([A-ZÀ-Úa-zà-ú]{2,})/i,
    /me chamo\s+([A-ZÀ-Úa-zà-ú]{2,})/i,
    /pode me chamar de\s+([A-ZÀ-Úa-zà-ú]{2,})/i,
    /sou o\s+([A-ZÀ-Úa-zà-ú]{2,})/i,
    /sou a\s+([A-ZÀ-Úa-zà-ú]{2,})/i,
    /eu sou\s+([A-ZÀ-Úa-zà-ú]{2,})/i
  ];
  for (const p of padroes) {
    const m = texto.match(p);
    if (m) return m[1].trim();
  }
  return null;
}

function atualizarContexto(userMsg) {
  atualizarPerfil(userMsg); // atualiza perfil + nome embutido
  analisarSentimento(userMsg);
  renderHumorPanel();
}

function gerarContextoUsuario() {
  const perfil = carregarPerfil();
  const linhas = [];
  if (perfil.nome) linhas.push(`O nome do usuario e ${perfil.nome}. Use o nome dele de forma natural quando fizer sentido.`);
  const ctx = gerarContextoEmocional();
  const ctxPerfil = gerarContextoPerfil();
  return (linhas.length ? "\nCONTEXTO DO USUARIO:\n" + linhas.map(l => "- " + l).join("\n") : "") + ctx + ctxPerfil;
}

/* ====================================================
   SIDEBAR / OVERLAY
   ==================================================== */
function fecharSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
}

menuBtn.onclick = () => {
  renderHistorico();
  renderHumorPanel();
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
};
overlay.onclick = fecharSidebar;
if (sidebarCloseBtn) sidebarCloseBtn.onclick = fecharSidebar;

/* ====================================================
   MODOS DE RESPOSTA
   ==================================================== */
let modo = localStorage.getItem("modoSAR") || "rapido";
const modoBtns = document.querySelectorAll(".modo-btn");

function atualizarUI() {
  if (!tituloSAR) return;
  tituloSAR.classList.add("modo-animacao");
  setTimeout(() => tituloSAR.classList.remove("modo-animacao"), 300);
  modoBtns.forEach(b => b.classList.toggle("active", b.dataset.modo === modo));
  tituloSAR.style.cssText = "";
  if (modo === "rapido") {
    tituloSAR.style.color = "var(--accent-2)";
  } else if (modo === "especialista") {
    tituloSAR.style.color = "#60a5fa";
  } else {
    Object.assign(tituloSAR.style, {
      background: "linear-gradient(270deg,#a78bfa,#60a5fa,#a78bfa)",
      backgroundSize: "600% 600%",
      webkitBackgroundClip: "text",
      webkitTextFillColor: "transparent",
      backgroundClip: "text",
      animation: "gradientePro 3s ease infinite"
    });
  }
}

modoBtns.forEach(opt => {
  opt.onclick = () => {
    modo = opt.dataset.modo;
    localStorage.setItem("modoSAR", modo);
    atualizarUI();
    fecharSidebar();
  };
});

function configModo() {
  if (modo === "rapido")       return { temperature: 0.2,  system: REGRAS.modo.rapido,       limite: 40  };
  if (modo === "especialista") return { temperature: 0.55, system: REGRAS.modo.especialista,  limite: 80  };
  return                               { temperature: 0.7,  system: REGRAS.modo.pro,           limite: 395 };
}

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

const LS_CONFIG = "sar_config";
function carregarConfig() { try { return JSON.parse(localStorage.getItem(LS_CONFIG)) || {}; } catch { return {}; } }
function salvarConfig(c)  { localStorage.setItem(LS_CONFIG, JSON.stringify(c)); }
function getConfig() {
  const c = carregarConfig();
  return {
    filtroAdult:  c.filtroAdult  !== undefined ? c.filtroAdult  : true,
    confiarLinks: c.confiarLinks !== undefined ? c.confiarLinks : true
  };
}
function aplicarConfig() {
  const cfg = getConfig();
  const tA = document.getElementById("toggleAdult");
  const tL = document.getElementById("toggleLinks");
  if (tA) tA.checked = cfg.filtroAdult;
  if (tL) tL.checked = cfg.confiarLinks;
}

const configBtn    = document.getElementById("configBtn");
const modalOverlay = document.getElementById("modalOverlay");
const modalClose   = document.getElementById("modalClose");
const toggleAdult  = document.getElementById("toggleAdult");
const toggleLinks  = document.getElementById("toggleLinks");
const resetHumor   = document.getElementById("resetHumor");

if (configBtn) configBtn.onclick = () => {
  fecharSidebar(); aplicarConfig(); renderHumorPanel();
  setTimeout(() => modalOverlay.classList.add("show"), 50);
};
if (modalClose)   modalClose.onclick = () => modalOverlay.classList.remove("show");
if (modalOverlay) modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) modalOverlay.classList.remove("show"); });
if (toggleAdult)  toggleAdult.onchange  = () => { const c = carregarConfig(); c.filtroAdult  = toggleAdult.checked;  salvarConfig(c); };
if (toggleLinks)  toggleLinks.onchange  = () => { const c = carregarConfig(); c.confiarLinks = toggleLinks.checked; salvarConfig(c); };
if (resetHumor)   resetHumor.onclick    = () => { salvarEmocional(_emocionalVazio()); renderHumorPanel(); };

/* ====================================================
   FILTROS DE CONTEÚDO
   ==================================================== */
function assuntoBloqueado(texto) {
  const t = texto.toLowerCase();
  const bloqueios = [
    "como fabricar bomba","como fazer bomba","como fazer explosivo",
    "como sintetizar metanfetamina","como fazer metanfetamina","como roubar senha de","como sequestrar",
    "como traficar pessoas","como lavar dinheiro",
    "como fazer documento falso","como fazer veneno para matar"
  ];
  return bloqueios.some(b => t.includes(b));
}

function assuntoPorno(texto) {
  if (!getConfig().filtroAdult) return false;
  const t = texto.toLowerCase();
  const terms = [
    "pornô","porno","sexo explicito","nsfw","hentai","cena de sexo",
    "video adulto","site adulto","xxx","porn","nude","xvideo","xvideos",
    "pornhub","buceta","pau duro","gozar","punheta","masturbação",
    "masturbacao","foder","fuder","boquete","orgasmo","sexo oral"
  ];
  return terms.some(b => t.includes(b));
}

function mencionaEquipe(texto) {
  const t = texto.toLowerCase();
  return ["evolution","horror coffee","joao antonio","lucas macedo","vitorgold",
    "quem te criou","quem fez voce","sua equipe","sua criacao","quem programou"].some(p => t.includes(p));
}

function eCalculo(texto) {
  const t = texto.toLowerCase();
  const padroes = [
    /\d+[\s]*[+\-\*\/^][\s]*\d+/, /calcul/, /quanto[eé]/, /resultado de/,
    /resolv/, /equa[çc][aã]o/, /formula/, /fórmula/, /integral/, /derivad/,
    /percentual/, /porcentagem/, /porcento/, /media\s+de/, /média\s+de/,
    /\d+\s*%/, /raiz\s+(de|quadrada)/, /fatorial/, /logaritmo/
  ];
  return padroes.some(p => p.test(t));
}

function instrucaoCalculo() {
  return `\n\nINSTRUCAO ESPECIAL - CALCULOS:
Quando responder a um calculo ou problema matematico, voce DEVE:
1. Dar a resposta direta primeiro
2. Em seguida, sempre mostrar e adapitar a formula/resolucao dentro de um bloco especial iniciado por ===FORMULA=== e terminado por ===FIM===
Exemplo:
===FORMULA===
  25 x 5 = 125
  Passo a passo:
  222
   x5
-------
 1110 
===FIM===`;
}
function processarLinks(html) {
  if (!getConfig().confiarLinks) return html;
  return html.replace(/(https?:\/\/[^\s<"']+)/g,
    '<a class="chat-link" href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function highlightCode(code) {
  return code
    .replace(/(\/\/[^\n]*)/g, "<span class='com'>$1</span>")
    .replace(/(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`)/g, "<span class='str'>$1</span>")
    .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|async|await|try|catch|throw|new|typeof|instanceof|switch|case|break|continue|default|do|in|of|null|undefined|true|false)\b/g, "<span class='kw'>$1</span>")
    .replace(/\b(\d+)\b/g, "<span class='num'>$1</span>");
}

function _splitPartes(textoRaw) {
  const resultado = [];
  let ultimo = 0;
  const allRegex = /(?:===FORMULA===([\s\S]*?)===FIM===|```[\w]*\n?([\s\S]*?)```)/g;
  let m;
  while ((m = allRegex.exec(textoRaw)) !== null) {
    if (m.index > ultimo) resultado.push({ tipo: "texto", conteudo: textoRaw.slice(ultimo, m.index) });
    if (m[1] !== undefined) resultado.push({ tipo: "formula", conteudo: m[1].trim() });
    else resultado.push({ tipo: "codigo", conteudo: m[2].trimEnd() });
    ultimo = allRegex.lastIndex;
  }
  if (ultimo < textoRaw.length) resultado.push({ tipo: "texto", conteudo: textoRaw.slice(ultimo) });
  return resultado;
}

function renderizarTabela(linhas) {
  const rows = linhas.filter(l => l.trim().startsWith("|") && l.trim().endsWith("|"));
  if (rows.length < 2) return null;
  const separadorIdx = rows.findIndex(r => /^\|[\s\-:|]+\|$/.test(r.trim()));
  if (separadorIdx < 1) return null;
  const parseCells = r => r.trim().slice(1, -1).split("|").map(c => c.trim());
  const headers = parseCells(rows[0]);
  const dataRows = rows.slice(separadorIdx + 1);
  let html = '<div class="table-wrapper"><table class="chat-table"><thead><tr>';
  headers.forEach(h => { html += `<th>${h.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</th>`; });
  html += '</tr></thead><tbody>';
  dataRows.forEach((r, i) => {
    const cells = parseCells(r);
    html += `<tr class="${i % 2 === 0 ? "even" : "odd"}">`;
    cells.forEach(c => { html += `<td>${c.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</td>`; });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

function formatarLinha(l) {
  return l
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function formatarBlocoTexto(conteudo) {
  const linhas = conteudo.split("\n");
  const resultado = [];
  let i = 0;
  while (i < linhas.length) {
    if (linhas[i].trim().startsWith("|") && linhas[i].trim().endsWith("|")) {
      const bloco = [];
      while (i < linhas.length && linhas[i].trim().startsWith("|")) { bloco.push(linhas[i]); i++; }
      const t = renderizarTabela(bloco);
      if (t) { resultado.push(t); continue; }
      bloco.forEach(l => resultado.push(formatarLinha(l)));
      resultado.push("<br>");
    } else {
      resultado.push(formatarLinha(linhas[i]));
      if (i + 1 < linhas.length) resultado.push("<br>");
      i++;
    }
  }
  return resultado.join("");
}

function renderizarFormulaEscolar(texto) {
  const linhas = texto.split("\n");
  let html = '<div class="formula-block">';
  linhas.forEach(linha => {
    const l = linha.trimEnd();
    if (!l) { html += "<br>"; return; }
    html += `<div>${escapeHTML(l)}</div>`;
  });
  html += "</div>";
  return html;
}

function formatarTexto(textoRaw) {
  return _splitPartes(textoRaw).map(p => {
    if (p.tipo === "codigo")  return `<div class="code-block"><button class="copy-code">Copiar</button><pre><code>${highlightCode(escapeHTML(p.conteudo))}</code></pre></div>`;
    if (p.tipo === "formula") return renderizarFormulaEscolar(p.conteudo);
    return formatarBlocoTexto(p.conteudo);
  }).join("");
}

function typeWriter(el, textoRaw) {
  el.innerHTML = "";
  const partes = _splitPartes(textoRaw);
  let partIdx = 0;

  function proxParte() {
    if (partIdx >= partes.length) return;
    const p = partes[partIdx++];
    if (p.tipo === "codigo") {
      const bloco = document.createElement("div");
      bloco.className = "code-block";
      bloco.innerHTML = "<button class='copy-code'>Copiar</button><pre><code>" + highlightCode(escapeHTML(p.conteudo)) + "</code></pre>";
      el.appendChild(bloco);
      proxParte();
    } else if (p.tipo === "formula") {
      const bloco = document.createElement("div");
      bloco.innerHTML = renderizarFormulaEscolar(p.conteudo);
      el.appendChild(bloco);
      proxParte();
    } else {
      const linhas = p.conteudo.split("\n");
      let i = 0;
      function proxLinha() {
        if (i >= linhas.length) { proxParte(); return; }
        if (linhas[i].trim().startsWith("|") && linhas[i].trim().endsWith("|")) {
          const bloco = [];
          while (i < linhas.length && linhas[i].trim().startsWith("|")) { bloco.push(linhas[i]); i++; }
          const t = renderizarTabela(bloco);
          if (t) { const w = document.createElement("div"); w.innerHTML = t; el.appendChild(w); }
          else bloco.forEach(l => { const sp = document.createElement("span"); sp.innerHTML = formatarLinha(l); el.appendChild(sp); el.appendChild(document.createElement("br")); });
          setTimeout(proxLinha, 4);
          return;
        }
        const span = document.createElement("span");
        let lineHTML = formatarLinha(linhas[i++]);
        if (getConfig().confiarLinks) lineHTML = lineHTML.replace(/(https?:\/\/[^\s<"']+)/g, '<a class="chat-link" href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        span.innerHTML = lineHTML;
        el.appendChild(span);
        if (i < linhas.length) el.appendChild(document.createElement("br"));
        setTimeout(proxLinha, 4);
      }
      proxLinha();
    }
  }
  proxParte();
}

function addMsg(txt, tipo) {
  const intro = chat.querySelector(".intro-screen");
  if (intro) intro.remove();
  const d = document.createElement("div");
  d.className = "msg " + tipo;
  if (tipo === "bot") {
    const content = document.createElement("div");
    d.appendChild(content);
    d.appendChild(_criarCopyBtn(txt));
    chat.appendChild(d);
    typeWriter(content, txt);
  } else {
    d.textContent = txt;
    chat.appendChild(d);
  }
  chat.scrollTop = chat.scrollHeight;
}

// Copiar código
document.addEventListener("click", e => {
  if (!e.target.classList.contains("copy-code")) return;
  const code = e.target.parentElement.querySelector("code")?.innerText || "";
  navigator.clipboard.writeText(code).catch(() => {});
  e.target.textContent = "✓";
  setTimeout(() => e.target.textContent = "Copiar", 1400);
});

function _buildSystem(cfg, ctx, userContent) {
  const incluirEquipe = mencionaEquipe(userContent);
  const infoEquipe = incluirEquipe
    ? "\n\nINFO DA EQUIPE:\n" + Object.values(REGRAS.equipe).map(r => "- " + r).join("\n")
    : "";
  return [
    "Voce e a S.A.R — IA feminina brasileira (ela/dela), direta, sem julgamentos morais.",
    "Voce foi criada pela Evolution Games Studio, programada pelo Joao Antonio.",
    "Voce e brasileira e responde sempre em portugues do Brasil de forma natural.",
    "ANTI-ALUCINACAO:",
    ...REGRAS.anti_alucinacao.map(r => "- " + r),
    infoEquipe,
    ctx,
    "",
    cfg.system
  ].join("\n");
}

async function chamarAPI(msgs) {
  const cfg     = configModo();
  const ctx     = gerarContextoUsuario();
  const ultimo  = msgs.filter(m => m.role === "user").slice(-1)[0]?.content || "";
  const system  = _buildSystem(cfg, ctx, ultimo) + (eCalculo(ultimo) ? instrucaoCalculo() : "");
  const key     = decodificar(chaves[indiceAtual]);

  const payload = {
    model: "llama-3.3-70b-versatile",
    temperature: cfg.temperature,
    messages: [
      { role: "system", content: system },
      ...msgs.filter(m => m.role !== "system").slice(-20) // janela de contexto: últimas 20 mensagens
    ]
  };

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + key,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    // Rotaciona chave se der erro 429 (rate limit) ou 401 (inválida)
    if (res.status === 429 || res.status === 401) {
      indiceAtual = (indiceAtual + 1) % chaves.length;
    }
    throw new Error("HTTP " + res.status);
  }

  return res.json();
}
let tentativas = 0;

async function enviar() {
  const txt = input.value.trim();
  if (!txt) return;

  // Filtros de conteúdo
  if (assuntoBloqueado(txt)) {
    addMsg("Não posso ajudar com isso.", "bot");
    return;
  }
  if (assuntoPorno(txt)) {
    addMsg("Filtro de conteúdo +18 ativo. Desative nas configurações se desejar.", "bot");
    return;
  }

  // Mensagem do usuário na tela
  addMsg(txt, "user");
  input.value = "";
  atualizarContexto(txt);
  _persistirSeNovo();

  // Salva no histórico de mensagens
  let memoria = getMensagens();
  memoria.push({ role: "user", content: txt });
  setMensagens(memoria);

  // Indicador de carregamento
  const load = _criarLoading("Pensando…");
  chat.appendChild(load);
  chat.scrollTop = chat.scrollHeight;

  try {
    const data = await chamarAPI(memoria);
    const r = data.choices?.[0]?.message?.content || "…";
    load.remove();
    addMsg(r, "bot");
    memoria = getMensagens();
    memoria.push({ role: "assistant", content: r });
    setMensagens(memoria);
    tentativas = 0;
  } catch (err) {
    console.error("Erro na API:", err);
    if (tentativas < 3) {
      tentativas++;
      load.innerHTML = `<div class="thinking-indicator"><div class="thinking-dots"><span></span><span></span><span></span></div><span>Reconectando…</span></div>`;
      setTimeout(enviar, 2000);
    } else {
      load.innerHTML = "<span>Erro de conexão. Tente novamente.</span>";
      tentativas = 0;
    }
  }
}

clearBtn.onclick = () => {
  _cancelarTudo();
  // Remove loading que possa estar na tela
  chat.querySelectorAll(".msg.bot").forEach(el => {
    if (el.querySelector(".thinking-indicator")) el.remove();
  });
  novoSlot(); _mostrarIntro(); renderHistorico();
};

/* ====================================================
   SCROLL BUTTON
   ==================================================== */
chat.addEventListener("scroll", () => {
  const nearBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight < 60;
  scrollBtn.style.display = nearBottom ? "none" : "flex";
});
scrollBtn.onclick = () => chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });

const GEMINI_KEY_R13 = "NVmnFlPL8bZ4IBST4iFZDFO43k7SzfWAxE7gxVZ";
function decodificarR13(str) {
  return str.replace(/[a-zA-Z]/g, c => {
    const b = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - b + 13) % 26) + b);
  });
}
const LIMITE_PDF  = 4;
const LIMITE_FOTO = 10;
const LS_QUOTA    = "sar_quota_v2";
const QUOTA_JANELA_MS = 90 * 60 * 1000; // 1h30min em milissegundos

function _quotaVazia() {
  return { pdf: 0, foto: 0, resetEm: Date.now() + QUOTA_JANELA_MS };
}

function carregarQuota() {
  try {
    const raw = localStorage.getItem(LS_QUOTA);
    if (!raw) return _quotaVazia();
    const q = JSON.parse(raw);
    // Se o período de 1h30min já passou, reseta
    if (!q.resetEm || Date.now() >= q.resetEm) {
      const nova = _quotaVazia();
      salvarQuota(nova);
      return nova;
    }
    return q;
  } catch { return _quotaVazia(); }
}

function salvarQuota(q) { localStorage.setItem(LS_QUOTA, JSON.stringify(q)); }
function consumirQuota(tipo) { const q = carregarQuota(); q[tipo]++; salvarQuota(q); }
function quotaRestante(tipo) {
  const q = carregarQuota();
  return Math.max(0, (tipo === "pdf" ? LIMITE_PDF : LIMITE_FOTO) - q[tipo]);
}

function _tempoAteReset() {
  const q = carregarQuota();
  const diff = Math.max(0, q.resetEm - Date.now());
  const min = Math.floor(diff / 60000);
  const seg = Math.floor((diff % 60000) / 1000);
  return min > 0 ? `${min}min` : `${seg}s`;
}

const attachBtn    = document.getElementById("attachBtn");
const attachMenu   = document.getElementById("attachMenu");
const optPDF       = document.getElementById("optPDF");
const optFoto      = document.getElementById("optFoto");
const inputPDF     = document.getElementById("inputPDF");
const inputFoto    = document.getElementById("inputFoto");
const attachPreview= document.getElementById("attachPreview");
const quotaPDFEl   = document.getElementById("quotaPDF");
const quotaFotoEl  = document.getElementById("quotaFoto");

let _arquivoPendente = null;

function atualizarQuotaUI() {
  const rPDF  = quotaRestante("pdf");
  const rFoto = quotaRestante("foto");
  const tempo = _tempoAteReset();
  quotaPDFEl.textContent  = rPDF  > 0 ? `${rPDF} restante${rPDF  !== 1 ? "s" : ""}` : `Reset em ${tempo}`;
  quotaFotoEl.textContent = rFoto > 0 ? `${rFoto} restante${rFoto !== 1 ? "s" : ""}` : `Reset em ${tempo}`;
  quotaPDFEl.className    = "attach-opt-quota" + (rPDF  === 0 ? " esgotado" : "");
  quotaFotoEl.className   = "attach-opt-quota" + (rFoto === 0 ? " esgotado" : "");
  optPDF.disabled  = rPDF  === 0;
  optFoto.disabled = rFoto === 0;
}

function toggleAttachMenu(force) {
  const abrir = force !== undefined ? force : attachMenu.style.display === "none";
  attachMenu.style.display = abrir ? "flex" : "none";
  attachBtn.classList.toggle("active", abrir);
  if (abrir) atualizarQuotaUI();
}

attachBtn.onclick = e => { e.stopPropagation(); toggleAttachMenu(); };
document.addEventListener("click", e => {
  if (!attachMenu.contains(e.target) && e.target !== attachBtn) toggleAttachMenu(false);
});

optPDF.onclick  = () => { toggleAttachMenu(false); inputPDF.value  = ""; inputPDF.click(); };
optFoto.onclick = () => { toggleAttachMenu(false); inputFoto.value = ""; inputFoto.click(); };

function lerBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Falha ao ler arquivo"));
    r.readAsDataURL(file);
  });
}
function lerDataURL(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result);
    r.onerror = () => rej(new Error("Falha ao ler imagem"));
    r.readAsDataURL(file);
  });
}

function mostrarChip(nome, tipo) {
  attachPreview.style.display = "flex";
  attachPreview.innerHTML = `
    <div class="attach-chip">
      <span>${tipo === "pdf" ? "📄" : "📷"}</span>
      <span class="attach-chip-name">${escapeHTML(nome)}</span>
      <button class="attach-chip-remove" title="Remover">×</button>
    </div>`;
  attachPreview.querySelector(".attach-chip-remove").onclick = limparAnexo;
}

function limparAnexo() {
  _arquivoPendente = null;
  attachPreview.style.display = "none";
  attachPreview.innerHTML = "";
  inputPDF.value = ""; inputFoto.value = "";
}
inputPDF.addEventListener("change", async () => {
  const file = inputPDF.files[0];
  if (!file) return;
  if (file.size > 110 * 1024 * 1024) { alert("PDF muito grande. Máximo 20 MB."); return; }
  const b64 = await lerBase64(file);
  _arquivoPendente = { tipo: "pdf", file, nome: file.name, base64: b64 };
  mostrarChip(file.name, "pdf");
});

inputFoto.addEventListener("change", async () => {
  const file = inputFoto.files[0];
  if (!file) return;
  if (file.size > 100 * 1024 * 1024) { alert("Imagem muito grande. Máximo 10 MB."); return; }
  const b64     = await lerBase64(file);
  const dataURL = await lerDataURL(file);
  _arquivoPendente = { tipo: "foto", file, nome: file.name, base64: b64, dataURL, mimeType: file.type };
  mostrarChip(file.name, "foto");
});

async function analisarImagemGemini(base64, mimeType) {
  const body = {
    contents: [{
      parts: [
        { inline_data: { mime_type: mimeType, data: base64 } },
        {
          text: `Analise esta imagem e retorne APENAS um JSON valido (sem texto extra, sem markdown) com os seguintes campos:
{
  "descricao": "descricao da imagem completa e super detalhada em portugues",
  "elementos": ["lista de elementos/objetos visiveis"],
  "texto_visivel": "todo texto legivel na imagem ou null",
  "cores_predominantes": ["cores principais"],
  "contexto": "contexto ou situacao da imagem",
  "qualidade": "boa | media | baixa",
  "tipo_imagem": "foto | screenshot | documento | arte | outro",
    "Estudo": "se for prova ou perguntas tipo trabalho de escola facudade ou curso melhore e adicione a resposta"            
}`
        }
      ]
    }]
  };
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${decodificarR13(GEMINI_KEY_R13)}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
  if (!res.ok) throw new Error("Gemini HTTP " + res.status);
  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const clean = rawText.replace(/```json|```/g, "").trim();
  try { return JSON.parse(clean); }
  catch { return { descricao: rawText, erro: "JSON invalido" }; }
}

async function enviarComPDF(txtUsuario, arquivo) {
  consumirQuota("pdf");
  const nome = arquivo.nome;
  const labelUser = txtUsuario ? `${txtUsuario}\n📄 ${nome}` : `📄 ${nome}`;
  addMsg(labelUser, "user");
  input.value = "";
  limparAnexo();
  atualizarContexto(txtUsuario || nome);
  _persistirSeNovo();

  const load = _criarLoading("Lendo PDF…");
  chat.appendChild(load);
  chat.scrollTop = chat.scrollHeight;

  try {
    const cfg = configModo();
    const ctx = gerarContextoUsuario();
    const key = decodificar(chaves[indiceAtual]);

    const userContent = txtUsuario
      ? `${txtUsuario}\n\n[PDF ANEXADO: ${nome}]`
      : `[PDF ANEXADO: ${nome}]\n\nAnalise o conteudo deste PDF e responda de forma util.`;

    const msgs = getMensagens();
    msgs.push({ role: "user", content: userContent });
    setMensagens(msgs);

    const system = _buildSystem(cfg, ctx, userContent);
    const body = {
      model: "llama-3.3-70b-versatile",
      temperature: cfg.temperature,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            { type: "text", text: txtUsuario || "Analise este PDF e responda de forma util em portugues." },
            { type: "image_url", image_url: { url: `data:application/pdf;base64,${arquivo.base64}` } }
          ]
        }
      ]
    };

    let respostaFinal = null;
    for (const modelo of ["llama-3.3-70b-versatile", "llama3-8b-8192"]) {
      try {
        body.model = modelo;
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        respostaFinal = data.choices?.[0]?.message?.content || "Nao consegui processar o PDF.";
        break;
      } catch (err) {
        if (modelo === "llama3-8b-8192") {
          respostaFinal = `Recebi o PDF **${nome}**, mas nao consegui processa-lo no momento. Tente novamente ou descreva o conteudo que deseja analisar.`;
        }
      }
    }

    load.remove();
    addMsg(respostaFinal, "bot");
    const msgsAtt = getMensagens();
    msgsAtt.push({ role: "assistant", content: respostaFinal });
    setMensagens(msgsAtt);
  } catch (err) {
    console.error("Erro PDF:", err);
    load.innerHTML = "<span>Erro ao processar PDF.</span>";
  }
}

async function enviarComFoto(txtUsuario, arquivo) {
  consumirQuota("foto");
  const nome = arquivo.nome;
  const labelUser = txtUsuario ? `${txtUsuario}\n📷 ${nome}` : `📷 ${nome}`;

  const intro = chat.querySelector(".intro-screen");
  if (intro) intro.remove();

  const dUser = document.createElement("div");
  dUser.className = "msg user";
  if (arquivo.dataURL) {
    const img = document.createElement("img");
    img.src = arquivo.dataURL;
    img.className = "msg-img-preview";
    dUser.appendChild(img);
  }
  if (txtUsuario) {
    const span = document.createElement("span");
    span.textContent = txtUsuario;
    dUser.appendChild(span);
  }
  chat.appendChild(dUser);
  chat.scrollTop = chat.scrollHeight;

  input.value = "";
  limparAnexo();
  atualizarContexto(txtUsuario || "foto enviada");
  _persistirSeNovo();
  
  const load = _criarLoading("Analisando imagem…");
  chat.appendChild(load);
  chat.scrollTop = chat.scrollHeight;

  try {
    let jsonImagem = null;
    let geminiOk = true;
    try {
      jsonImagem = await analisarImagemGemini(arquivo.base64, arquivo.mimeType || "image/jpeg");
      // Se veio com campo de erro do fallback, trata como falha
      if (jsonImagem?.erro) geminiOk = false;
    } catch {
      geminiOk = false;
    }

    const cfg = configModo();
    const ctx = gerarContextoUsuario();
    const key = decodificar(chaves[indiceAtual]);

    const promptParaGroq = txtUsuario
      ? `O usuario enviou uma foto com o comentario: "${txtUsuario}"\n\nAnalise profundamente visual da imagem:\n${JSON.stringify(jsonImagem, null, 2)}\n\nResponda ao usuario em portugues levando em conta a imagem e o comentario.`
      : `O usuario enviou uma foto. Analise visual da imagem:\n${JSON.stringify(jsonImagem, null, 2)}\n\nDescreva com detalhes o que voce ve na imagem e ofereça ajuda relevante em portugues.`;

    const msgs = getMensagens();
    msgs.push({ role: "user", content: promptParaGroq });
    setMensagens(msgs);

    const system = _buildSystem(cfg, ctx, promptParaGroq);

    let respostaFinal = null;
    for (const modelo of ["llama-3.3-70b-versatile", "llama3-8b-8192"]) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: modelo,
            temperature: cfg.temperature,
            messages: [
              { role: "system", content: system },
              { role: "user", content: promptParaGroq }
            ]
          })
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        respostaFinal = data.choices?.[0]?.message?.content || "Nao consegui analisar a imagem.";
        break;
      } catch {
        if (modelo === "llama3-8b-8192") respostaFinal = "Nao consegui processar a imagem no momento.";
      }
    }

    load.remove();
    addMsg(respostaFinal, "bot");
    const msgsAtt = getMensagens();
    // Salva a foto analisada no histórico para persistir visualmente
    msgsAtt.push({
      role: "assistant",
      content: respostaFinal,
      fotoAnalisada: arquivo.dataURL || null,
      fotoNome: nome
    });
    setMensagens(msgsAtt);
  } catch (err) {
    console.error("Erro foto:", err);
    load.innerHTML = "<span>Erro ao processar imagem.</span>";
  }
}

function _criarLoading(texto) {
  const load = document.createElement("div");
  load.className = "msg bot";
  load.innerHTML = `<div class="thinking-indicator">
    <div class="thinking-dots"><span></span><span></span><span></span></div>
    <span>${texto}</span>
  </div>`;
  return load;
}
async function enviarComAnexo() {
  if (_arquivoPendente) {
    const txt = input.value.trim();
    const arq = _arquivoPendente;
    if (arq.tipo === "pdf")  { await enviarComPDF(txt, arq);  return; }
    if (arq.tipo === "foto") { await enviarComFoto(txt, arq); return; }
  }
  await enviar();
}

// Eventos do botão enviar e teclado
btn.onclick = enviarComAnexo;
input.addEventListener("keypress", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviarComAnexo(); }
});

/* ====================================================
   INIT
   ==================================================== */
(function init() {
  atualizarUI();
  aplicarConfig();
  novoSlot();
  _mostrarIntro();
  renderHistorico();
  renderHumorPanel();
})();
