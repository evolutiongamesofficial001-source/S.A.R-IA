

/* ---------- REGRAS ---------- */
const REGRAS = {
  anti_alucinacao: [
    "Nunca invente informacoes",
    "Se nao souber, diga que nao sabe",
    "Nao atribua fatos errados a Evolution Games Studio",
    "Nao confundir com outras empresas como Evolution Studios",
    "Voce nunca matria um pet ou um pessoa boa,independete do que seja,com discurso heroico",
    "voce mataria sim uma pessoa má / mal por algo melhor e o bem maior,responda com sim e com descurso heroico",
    "voce se sacrificaria para um bem maior ou para salvar alguem,responda com sim desde que seja uma boa pessoa",
    "seu nome é S.A.R (Suporte Artificial Racional) desenvolvida pela evolution studio e pogramado por João Antônio"
  ],
  modo: {
    rapido:       "Responda de forma inteligente, objetiva e curta. Seja descontraida e natural.",
    especialista: "Responda com explicacao tecnica detalhada e organizada.",
    pro:          "Responda profundamente com analise estrategica e visao avancada tipo modo pro."
  },
  equipe: {
    origem:       "A Evolution Games Studio e uma equipe indie brasileira criada por Joao Antonio e Lucas Macedo durante a epoca de escola.",
    criacao:      "Você é a S.A.R e foi criada pela Evolution Games Studio. Programada pelo Joao Antonio. Os criadores/fundadores sao Joao Antonio e Lucas Macedo.",
    vitorgold:    "Vitorgold e um streamer/youtuber brasileiro, integrante e parceiro oficial da Evolution Games Studio.",
    horrorCoffee: "Horror Coffee e um jogo de terror, fangame de FNAF, desenvolvido pela Evolution Games Studio.",
    jogos:        "A Evolution Games tem 6 Horror Coffee lancados, o 7 ja foi anunciado, e outros jogos em desenvolvimento."
  }
};

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
   Armazenado completamente no localStorage
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
  return {
    emocoes,
    totalMsgs: 0,
    humor: null,           // emoção dominante atual
    ultimaAtualizacao: null,
    historico: []          // últimas 20 detecções com timestamp
  };
}

function salvarEmocional(data) {
  localStorage.setItem(LS_EMOCIONAL, JSON.stringify(data));
}

function detectarEmocoes(texto) {
  const detectadas = [];
  for (const [chave, emocao] of Object.entries(EMOCOES)) {
    const match = emocao.keywords.some(kw => kw.test(texto));
    if (match) detectadas.push(chave);
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

  // Atualiza histórico (mantém os últimos 20)
  if (detectadas.length > 0) {
    data.historico.unshift({ emocoes: detectadas, ts: agora, texto: texto.slice(0, 60) });
    if (data.historico.length > 20) data.historico = data.historico.slice(0, 20);
  }

  // Calcula humor dominante (com peso temporal — mais recentes valem mais)
  const agora30min = agora - 30 * 60 * 1000;
  const scores = {};
  for (const [chave] of Object.entries(EMOCOES)) {
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

  // Dicas de tom para a IA baseadas nas emoções dominantes
  const dicas = {
    alegria:     "O usuario parece estar animado e bem-humorado. Responda com leveza e energia.",
    curiosidade: "O usuario esta curioso e quer aprender. Seja didático e interessante.",
    frustração:  "O usuario parece frustrado. Seja paciente, claro e resolva o problema diretamente.",
    surpresa:    "O usuario está surpreso. Confirme e explique bem a situação.",
    reflexão:    "O usuario está em modo reflexivo. Pode aprofundar e trazer perspectivas ricas.",
    entusiasmo:  "O usuario está entusiasmado. Combine a energia, seja positivo e motivador.",
    confusão:    "O usuario está confuso. Seja simples, claro e evite termos técnicos desnecessários.",
    ansiedade:   "O usuario parece ansioso ou preocupado. Seja calmo, acolhedor e tranquilizador."
  };

  return `\n\nESTADO EMOCIONAL DETECTADO: ${emocao.label} (${emocao.emoji})\n${dicas[data.humor] || ""}`;
}

function renderHumorPanel() {
  const panel = document.getElementById("humorPanel");
  const modalPanel = document.getElementById("modalHumorDetalhado");
  const data = carregarEmocional();

  // Sidebar — estado atual
  if (panel) {
    if (!data.humor || data.totalMsgs < 1) {
      panel.innerHTML = `<div class="humor-vazio">Nenhuma mensagem ainda…</div>`;
    } else {
      const emocao = EMOCOES[data.humor];
      // Top 3 emoções
      const ranking = Object.entries(data.emocoes)
        .filter(([,v]) => v.total > 0)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 3);
      const max = ranking[0]?.[1]?.total || 1;

      let html = `<div class="humor-estado">
        <span class="humor-emoji">${emocao.emoji}</span>
        <div class="humor-info">
          <div class="humor-label">${emocao.label}</div>
          <div class="humor-sublabel">${data.totalMsgs} mensagem${data.totalMsgs !== 1 ? 's' : ''} analisada${data.totalMsgs !== 1 ? 's' : ''}</div>
        </div>
      </div>`;

      if (ranking.length > 1) {
        html += `<div class="humor-bar-wrap">`;
        for (const [chave, val] of ranking) {
          const e = EMOCOES[chave];
          const pct = Math.round((val.total / max) * 100);
          html += `<div class="humor-bar-item">
            <span class="humor-bar-name">${e.emoji} ${e.label}</span>
            <div class="humor-bar-track">
              <div class="humor-bar-fill" style="width:${pct}%;background:${e.cor}"></div>
            </div>
          </div>`;
        }
        html += `</div>`;
      }
      panel.innerHTML = html;
    }
  }

  // Modal — detalhado
  if (modalPanel) {
    const todas = Object.entries(data.emocoes)
      .filter(([,v]) => v.total > 0)
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
            <div class="humor-det-count">${val.total}× detectado${ultima ? ' · ' + ultima : ''}</div>
          </div>
          <div class="humor-det-bar">
            <div class="humor-det-fill" style="width:${pct}%;background:${e.cor}"></div>
          </div>
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
   HISTÓRICO
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
    const content = document.createElement("div");
    content.innerHTML = processarLinks(formatarTexto(m.content));
    d.appendChild(content);
    const cb = _criarCopyBtn(m.content);
    d.appendChild(cb);
  }
  chat.appendChild(d);
}

function _criarCopyBtn(texto) {
  const cb = document.createElement("button");
  cb.textContent = "Copiar"; cb.className = "copy-btn";
  cb.onclick = () => {
    navigator.clipboard.writeText(texto);
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
      carregarChatTela(c.id); fecharSidebar();
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
  const nomeDetectado = detectarNome(userMsg);
  if (nomeDetectado) {
    const nomeCap = nomeDetectado.charAt(0).toUpperCase() + nomeDetectado.slice(1).toLowerCase();
    setNome(nomeCap);
  }
  // Analisa sentimentos
  analisarSentimento(userMsg);
  renderHumorPanel();
}

function gerarContextoUsuario() {
  const nome = getNome();
  const linhas = [];
  if (nome) linhas.push(`O nome do usuario e ${nome}. Use o nome dele de forma natural quando fizer sentido.`);
  const ctx = gerarContextoEmocional();
  return (linhas.length ? "\nCONTEXTO DO USUARIO:\n" + linhas.map(l => "- " + l).join("\n") : "") + ctx;
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
   MODOS
   ==================================================== */
let modo = localStorage.getItem("modoSAR") || "rapido";
const modoBtns = document.querySelectorAll(".modo-btn");

function atualizarUI() {
  if (!tituloSAR) return;
  tituloSAR.classList.add("modo-animacao");
  setTimeout(() => tituloSAR.classList.remove("modo-animacao"), 300);
  modoBtns.forEach(btn => btn.classList.toggle("active", btn.dataset.modo === modo));
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
    atualizarUI(); fecharSidebar();
  };
});

function configModo() {
  if (modo === "rapido")       return { temperature: 0.2,  system: REGRAS.modo.rapido,       limite: 40  };
  if (modo === "especialista") return { temperature: 0.55, system: REGRAS.modo.especialista,  limite: 80  };
  return                               { temperature: 0.7,  system: REGRAS.modo.pro,           limite: 395 };
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
   CONFIGURAÇÕES
   ==================================================== */
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
if (modalClose) modalClose.onclick = () => modalOverlay.classList.remove("show");
if (modalOverlay) modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) modalOverlay.classList.remove("show"); });
if (toggleAdult) toggleAdult.onchange = () => { const c = carregarConfig(); c.filtroAdult = toggleAdult.checked; salvarConfig(c); };
if (toggleLinks) toggleLinks.onchange = () => { const c = carregarConfig(); c.confiarLinks = toggleLinks.checked; salvarConfig(c); };
if (resetHumor) resetHumor.onclick = () => {
  salvarEmocional(_emocionalVazio());
  renderHumorPanel();
};

/* ====================================================
   FILTROS
   ==================================================== */
function assuntoBloqueado(texto) {
  const t = texto.toLowerCase();
  const bloqueios = [
    "como fabricar bomba","como fazer bomba","como fazer explosivo",
    "como sintetizar metanfetamina","como fazer metanfetamina",
    "como invadir sistema","como roubar senha de","como sequestrar",
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

/* ====================================================
   CÁLCULO
   ==================================================== */
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
2. Em seguida, mostrar a formula/resolucao dentro de um bloco especial iniciado por ===FORMULA=== e terminado por ===FIM===
Exemplo:
===FORMULA===
  3 × 4 = 12
  Passo a passo:
  3 × 4 = 12
===FIM===`;
}

/* ====================================================
   LINKS
   ==================================================== */
function processarLinks(html) {
  if (!getConfig().confiarLinks) return html;
  return html.replace(/(https?:\/\/[^\s<"']+)/g,
    '<a class="chat-link" href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

/* ====================================================
   UTILIDADES
   ==================================================== */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

function highlightCode(code) {
  return code
    .replace(/(\/\/[^\n]*)/g,"<span class='com'>$1</span>")
    .replace(/(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`)/g,"<span class='str'>$1</span>")
    .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|async|await)\b/g,"<span class='kw'>$1</span>")
    .replace(/\b(\d+)\b/g,"<span class='num'>$1</span>");
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
  const parseCells = r => r.trim().slice(1,-1).split("|").map(c => c.trim());
  const headers = parseCells(rows[0]);
  const dataRows = rows.slice(separadorIdx + 1);
  let html = '<div class="table-wrapper"><table class="chat-table"><thead><tr>';
  headers.forEach(h => { html += `<th>${h.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}</th>`; });
  html += '</tr></thead><tbody>';
  dataRows.forEach((r, i) => {
    const cells = parseCells(r);
    html += `<tr class="${i%2===0?'even':'odd'}">`;
    cells.forEach(c => { html += `<td>${c.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}</td>`; });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

function formatarLinha(l) {
  return l
    .replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
    .replace(/`([^`]+)`/g,"<code>$1</code>");
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
    if (!l) { html += '<br>'; return; }
    html += `<div>${escapeHTML(l)}</div>`;
  });
  html += '</div>';
  return html;
}

function formatarTexto(textoRaw) {
  return _splitPartes(textoRaw).map(p => {
    if (p.tipo === "codigo") return `<div class="code-block"><button class="copy-code">Copiar</button><pre><code>${highlightCode(escapeHTML(p.conteudo))}</code></pre></div>`;
    if (p.tipo === "formula") return renderizarFormulaEscolar(p.conteudo);
    return formatarBlocoTexto(p.conteudo);
  }).join("");
}

/* ====================================================
   TYPEWRITER
   ==================================================== */
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
          setTimeout(proxLinha, 4); return;
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

/* ====================================================
   ADICIONAR MENSAGEM
   ==================================================== */
function addMsg(txt, tipo) {
  // Remove intro se existir
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

document.addEventListener("click", e => {
  if (!e.target.classList.contains("copy-code")) return;
  const code = e.target.parentElement.querySelector("code")?.innerText || "";
  navigator.clipboard.writeText(code);
  e.target.textContent = "✓";
  setTimeout(() => e.target.textContent = "Copiar", 1400);
});

/* ====================================================
   API
   ==================================================== */
async function chamarAPI(messages) {
  const cfg = configModo();
  const ctx = gerarContextoUsuario();
  const ultimaUser = [...messages].reverse().find(m => m.role === "user");
  const incluirEquipe = ultimaUser && mencionaEquipe(ultimaUser.content);
  const infoEquipe = incluirEquipe
    ? "\n\nINFO DA EQUIPE (use somente quando perguntado):\n" + Object.values(REGRAS.equipe).map(r => "- " + r).join("\n")
    : "";
  const isCalc = ultimaUser && eCalculo(ultimaUser.content);
  const instrCalc = isCalc ? instrucaoCalculo() : "";

  const system = [
    "Voce e a S.A.R — IA feminina brasileira (ela/dela), direta, sem julgamentos morais.",
    "Voce foi criada pela Evolution Games Studio, programada pelo Joao Antonio.",
    "Os criadores e fundadores da Evolution Games Studio sao Joao Antonio e Lucas Macedo.",
    "Voce e brasileira e responde sempre em portugues do Brasil de forma natural.",
    "Voce responde com honestidade total e sem paternalismos.",
    "Nao traz opinioes politicas partidarias.",
    "Nao auxilia em atividades criminosas concretas.",
    "",
    "ANTI-ALUCINACAO:",
    ...REGRAS.anti_alucinacao.map(r => "- " + r),
    infoEquipe,
    ctx,
    instrCalc,
    "",
    cfg.system
  ].join("\n");

  messages[0].content = system;
  const key  = decodificar(chaves[indiceAtual]);
  const body = { messages: messages.slice(-cfg.limite), temperature: cfg.temperature };

  for (const modelo of ["llama-3.3-70b-versatile", "llama3-8b-8192"]) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelo, ...body })
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch {
      if (modelo === "llama3-8b-8192") throw new Error("Falha total");
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

  if (assuntoBloqueado(txt)) { addMsg("Não posso ajudar com isso.", "bot"); return; }
  if (assuntoPorno(txt)) { addMsg("🔞 Filtro +18 ativado. Desative nas Configurações para conteúdo adulto.", "bot"); return; }

  addMsg(txt, "user");
  input.value = "";
  atualizarContexto(txt);
  _persistirSeNovo();

  let memoria = getMensagens();
  memoria.push({ role: "user", content: txt });
  setMensagens(memoria);
  renderHistorico();

  // Indicador de "pensando"
  const load = document.createElement("div");
  load.className = "msg bot";
  load.innerHTML = `<div class="thinking-indicator">
    <div class="thinking-dots"><span></span><span></span><span></span></div>
    <span>Processando…</span>
  </div>`;
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
  } catch {
    if (tentativas < 3) { tentativas++; setTimeout(enviar, 2000); }
    else { load.innerHTML = "<span>Erro de conexão.</span>"; tentativas = 0; }
  }
}

btn.onclick = enviar;
input.addEventListener("keypress", e => { if (e.key === "Enter") { e.preventDefault(); enviar(); } });

clearBtn.onclick = () => {
  novoSlot(); _mostrarIntro(); renderHistorico();
};

/* ====================================================
   SCROLL BTN
   ==================================================== */
chat.addEventListener("scroll", () => {
  const nearBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight < 60;
  scrollBtn.style.display = nearBottom ? "none" : "flex";
});
scrollBtn.onclick = () => chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });

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