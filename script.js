/* ====================================================
   🤖 S.A.R — Evolution Games Studio
   👨‍💻 Desenvolvido por João Antônio & Lucas Macedo
   🎬 Coding Animation
   ==================================================== */

/* ---------- 📋 REGRAS ---------- */
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
    "se alguem perguntar a sua analise de imagem e feito pelo modulo S.A.R Vision da Evolution Studios",
    "você gera imagem sim, o botao para gerar imagem fica ao lado do botao de enviar imagem",
    "quando analisar imagem analise apenas sobre a imagem e se ela foi enviada com pedido",
    "se nao for nessesario ou pedido,nao fale data gostos etc",
  ],
  modo: {
    rapido:       "Responda de forma inteligente, objetiva e curta. Seja descontraida. Use emojis quando fizer sentido.",
    especialista: "Responda com explicacao tecnica detalhada e organizada. Emojis podem ser usados para identificar seções.",
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
   🚫 ABORT CONTROLLER — cancela tudo ao limpar
   ==================================================== */
let _abortController = new AbortController();
function _cancelarTudo() {
  _abortController.abort();
  _abortController = new AbortController();
}

/* ====================================================
   ⏱️ FETCH COM TIMEOUT — evita requisições travadas
   ==================================================== */
async function fetchComTimeout(url, options, ms = 18000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    if (e.name === "AbortError") throw new Error("⏱️ Timeout: sem resposta em " + (ms / 1000) + "s");
    throw e;
  }
}

/* ====================================================
   👤 PERFIL DO USUÁRIO — gostos, nome, idade, etc
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

  // 🏷️ Nome
  const nomeMatch = texto.match(/(?:meu nome [eé]|me chamo|pode me chamar de|sou [oa]|eu sou)\s+([A-ZÀ-Úa-zà-ú]{2,})/i);
  if (nomeMatch) { perfil.nome = nomeMatch[1].charAt(0).toUpperCase() + nomeMatch[1].slice(1).toLowerCase(); mudou = true; }

  // 🎂 Idade
  const idadeMatch = texto.match(/(?:tenho|minha idade [eé]|anos de idade|tenho)\s+(\d{1,2})\s*anos/i) ||
                     texto.match(/(\d{1,2})\s*anos\s*(?:de idade)?/i);
  if (idadeMatch) { const a = parseInt(idadeMatch[1]); if (a >= 5 && a <= 100) { perfil.idade = a; mudou = true; } }

  // 💚 Gostos positivos
  const gostoMatch = texto.match(/(?:gosto de|amo|adoro|curto|minha paixão [eé]|meu hobbie [eé]|me diverte)\s+([^.,!?]{3,40})/gi);
  if (gostoMatch) {
    if (!perfil.gostos) perfil.gostos = [];
    gostoMatch.forEach(m => {
      const val = m.replace(/^(gosto de|amo|adoro|curto|minha paixão é|meu hobbie é|me diverte)\s*/i, "").trim().toLowerCase();
      if (val.length > 2 && !perfil.gostos.includes(val)) { perfil.gostos.push(val); mudou = true; }
    });
    perfil.gostos = perfil.gostos.slice(-12);
  }

  // 🔴 Não gosta
  const naoGostoMatch = texto.match(/(?:não gosto de|detesto|odeio|não curto|tenho raiva de)\s+([^.,!?]{3,40})/gi);
  if (naoGostoMatch) {
    if (!perfil.naoGosta) perfil.naoGosta = [];
    naoGostoMatch.forEach(m => {
      const val = m.replace(/^(não gosto de|detesto|odeio|não curto|tenho raiva de)\s*/i, "").trim().toLowerCase();
      if (val.length > 2 && !perfil.naoGosta.includes(val)) { perfil.naoGosta.push(val); mudou = true; }
    });
    perfil.naoGosta = perfil.naoGosta.slice(-8);
  }

  // 💼 Profissão
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

/* ---------- 🧩 ELEMENTOS ---------- */
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
   💗 SISTEMA DE SENTIMENTOS / EMOCIONAL
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
      panel.innerHTML = `<div class="humor-vazio">Nenhuma mensagem ainda… 💬</div>`;
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
      modalPanel.innerHTML = `<div class="humor-vazio-modal">Nenhum sentimento detectado ainda. 💤</div>`;
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
  if (diff < 60000) return "agora ⚡";
  if (diff < 3600000) return Math.floor(diff / 60000) + "min atrás";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h atrás";
  return Math.floor(diff / 86400000) + "d atrás";
}

/* ====================================================
   📁 HISTÓRICO DE CHATS
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
  id: gerarId(), titulo: "Novo chat 💬", criadoEm: Date.now(),
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
    id: gerarId(), titulo: "Novo chat 💬", criadoEm: Date.now(),
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
    <h2 class="intro-title">Olá! Sou a S.A.R 👋</h2>
    <p class="intro-sub">Como posso te ajudar hoje? ✨</p>
    <div class="intro-chips">
      <button class="intro-chip" onclick="preencherInput('💻 Me ajuda com código')">💻 Programação</button>
      <button class="intro-chip" onclick="preencherInput('🧠 Explica um conceito pra mim')">🧠 Aprender algo</button>
      <button class="intro-chip" onclick="preencherInput('/Tabela ')">📊 /Tabela</button>
      <button class="intro-chip" onclick="preencherInput('/Jurado ')">⚖️ /Jurado</button>
    </div>
  </div>`;
}

function preencherInput(txt) {
  input.value = txt;
  input.focus();
}

function renderMsgHistorico(m) {
  const d = document.createElement("div");
  d.className = "msg " + (m.role === "user" ? "user" : "bot");

  if (m.role === "user") {
    // 🖼️ Mostra imagens enviadas pelo usuário no histórico
    if (m.fotosEnviadas?.length) {
      if (m.fotosEnviadas.length > 1) {
        const grid = document.createElement("div");
        grid.className = "msg-img-grid";
        m.fotosEnviadas.forEach(f => {
          if (f.dataURL) {
            const img = document.createElement("img");
            img.src = f.dataURL;
            img.className = "msg-img-preview";
            img.alt = f.nome || "imagem";
            grid.appendChild(img);
          }
        });
        d.appendChild(grid);
      } else if (m.fotosEnviadas[0]?.dataURL) {
        const img = document.createElement("img");
        img.src = m.fotosEnviadas[0].dataURL;
        img.className = "msg-img-preview";
        img.alt = m.fotosEnviadas[0].nome || "imagem";
        d.appendChild(img);
      }
    }

    // 📝 No histórico, mostra APENAS o texto original do usuário
    // Remove dados internos de contexto (como [DADOS REAIS DA API...])
    // que foram injetados internamente e não devem aparecer para o usuário
    if (m.content) {
      const span = document.createElement("span");
      // ✂️ Se o conteúdo tem marcadores internos, pega só a parte visível
      let textoVisivel = m.content;
      // ✂️ Quebra nos marcadores internos, fica só com a parte antes deles
      const cortes = [
        "\n\n[DADOS REAIS DA API",
        "\n\n[PDF ANEXADO",
        "\n\nINSTRUCAO:",
        "\n\n[CONTEXT",
      ];
      for (const corte of cortes) {
        const idx = textoVisivel.indexOf(corte);
        if (idx !== -1) textoVisivel = textoVisivel.slice(0, idx);
      }
            textoVisivel = textoVisivel.trim();
      if (textoVisivel) {
        span.textContent = textoVisivel;
        d.appendChild(span);
      }
    }
  } else {
    
    const fotos = m.fotosAnalisadas || (m.fotoAnalisada ? [{ dataURL: m.fotoAnalisada, nome: m.fotoNome }] : null);
    if (fotos?.length) {
      if (fotos.length > 1) {
        const grid = document.createElement("div");
        grid.className = "msg-img-grid hist-foto-thumb-grid";
        fotos.forEach(f => {
          if (f.dataURL) {
            const img = document.createElement("img");
            img.src = f.dataURL;
            img.className = "msg-img-preview hist-foto-thumb";
            img.alt = f.nome || "imagem analisada";
            grid.appendChild(img);
          }
        });
        d.appendChild(grid);
      } else if (fotos[0]?.dataURL) {
        const thumb = document.createElement("img");
        thumb.src = fotos[0].dataURL;
        thumb.className = "msg-img-preview hist-foto-thumb";
        thumb.alt = fotos[0].nome || "foto analisada";
        d.appendChild(thumb);
      }
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
  cb.textContent = "📋 Copiar";
  cb.className = "copy-btn";
  cb.onclick = () => {
    navigator.clipboard.writeText(texto).catch(() => {});
    cb.textContent = "✅ Copiado!";
    setTimeout(() => cb.textContent = "📋 Copiar", 1400);
  };
  return cb;
}

function renderHistorico() {
  historicoLista.innerHTML = "";
  const chats = carregarChats();
  const ativoId = chatId();
  const lista = Object.values(chats).sort((a, b) => b.criadoEm - a.criadoEm);
  if (lista.length === 0) {
    historicoLista.innerHTML = "<div class='hist-vazio'>📭 Sem histórico</div>";
    return;
  }
  lista.forEach(c => {
    const item = document.createElement("div");
    item.className = "hist-item" + (c.id === ativoId ? " ativo" : "");
    item.innerHTML = `<span class="hist-titulo">💬 ${escapeHTML(c.titulo)}</span>
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
  atualizarPerfil(userMsg);
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
    const modoEscolhido = opt.dataset.modo;
    const exigeConta = modoEscolhido === "especialista" || modoEscolhido === "pro";
    if (exigeConta && !getUsuarioLogado()) {
      _pendingAcao = { tipo: "modo", modo: modoEscolhido };
      abrirAuthModal("login");
      return;
    }
    modo = modoEscolhido;
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

const FIREBASE_DB_URL = "https://conta-ia-d53fa-default-rtdb.asia-southeast1.firebasedatabase.app";
const LS_USER = "sar_user";

function getUsuarioLogado() {
  try { return JSON.parse(localStorage.getItem(LS_USER)) || null; } catch { return null; }
}
function setUsuarioLogado(u) { localStorage.setItem(LS_USER, JSON.stringify(u)); }
function removerUsuarioLogado() { localStorage.removeItem(LS_USER); }

// Transforma o nome em uma chave válida para o Firebase (sem . # $ [ ] /)
function chaveUsuario(nome) {
  return (nome || "").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 60);
}

async function hashSenha(senha) {
  const enc = new TextEncoder().encode(senha);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function criarConta(nome, senha) {
  const key = chaveUsuario(nome);
  if (!key || key.length < 2) throw new Error("Digite um nome de usuário válido.");
  if (!senha || senha.length < 4) throw new Error("A senha precisa ter pelo menos 4 caracteres.");
  const res = await fetchComTimeout(`${FIREBASE_DB_URL}/usuarios/${key}.json`, {}, 10000);
  const existente = await res.json();
  if (existente) throw new Error("Esse usuário já existe. Tente entrar em vez de criar conta.");
  const senhaHash = await hashSenha(senha);
  const put = await fetchComTimeout(`${FIREBASE_DB_URL}/usuarios/${key}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: nome.trim(), senhaHash, criadoEm: Date.now() })
  }, 10000);
  if (!put.ok) throw new Error("Não foi possível criar a conta agora. Tente novamente.");
  return { nome: nome.trim(), key };
}

async function loginConta(nome, senha) {
  const key = chaveUsuario(nome);
  if (!key) throw new Error("Digite seu nome de usuário.");
  const res = await fetchComTimeout(`${FIREBASE_DB_URL}/usuarios/${key}.json`, {}, 10000);
  const dados = await res.json();
  if (!dados) throw new Error("Conta não encontrada. Verifique o nome ou crie uma conta.");
  const senhaHash = await hashSenha(senha);
  if (dados.senhaHash !== senhaHash) throw new Error("Senha incorreta.");
  return { nome: dados.nome, key };
}

const accountBtn        = document.getElementById("accountBtn");
const accountAvatar     = document.getElementById("accountAvatar");
const accountName       = document.getElementById("accountName");
const accountSub        = document.getElementById("accountSub");
const authModalOverlay  = document.getElementById("authModalOverlay");
const authModalClose    = document.getElementById("authModalClose");
const authModalTitle    = document.getElementById("authModalTitle");
const authHint          = document.getElementById("authHint");
const authTabs          = document.getElementById("authTabs");
const authTabLogin      = document.getElementById("authTabLogin");
const authTabCriar      = document.getElementById("authTabCriar");
const authForm          = document.getElementById("authForm");
const authNome          = document.getElementById("authNome");
const authSenha         = document.getElementById("authSenha");
const authSenha2Wrap    = document.getElementById("authSenha2Wrap");
const authSenha2        = document.getElementById("authSenha2");
const authError         = document.getElementById("authError");
const authSubmitBtn     = document.getElementById("authSubmitBtn");
const authSubmitLabel   = document.getElementById("authSubmitLabel");
const authPerfil        = document.getElementById("authPerfil");
const perfilAvatar      = document.getElementById("perfilAvatar");
const perfilNome        = document.getElementById("perfilNome");
const logoutBtn         = document.getElementById("logoutBtn");

let _authAba = "login";
let _pendingAcao = null; // { tipo: "modo", modo: "pro" }

function _iniciais(nome) {
  return (nome || "?").trim().slice(0, 2);
}

function atualizarContaUI() {
  const user = getUsuarioLogado();
  if (user) {
    accountAvatar.textContent = _iniciais(user.nome);
    accountName.textContent = user.nome;
    accountSub.textContent = "Conta conectada";
    perfilAvatar.textContent = _iniciais(user.nome);
    perfilNome.textContent = user.nome;
  } else {
    accountAvatar.textContent = "?";
    accountName.textContent = "Convidado";
    accountSub.textContent = "Toque para entrar";
  }
}

function abrirAuthModal(aba = "login") {
  fecharSidebar();
  const user = getUsuarioLogado();
  authError.style.display = "none";
  authError.textContent = "";
  if (user) {
    authModalTitle.textContent = "Sua conta";
    authHint.style.display = "none";
    authTabs.style.display = "none";
    authForm.style.display = "none";
    authPerfil.style.display = "flex";
  } else {
    authHint.style.display = "block";
    authTabs.style.display = "flex";
    authForm.style.display = "flex";
    authPerfil.style.display = "none";
    trocarAbaAuth(aba);
  }
  setTimeout(() => authModalOverlay.classList.add("show"), 30);
}
function fecharAuthModal() {
  authModalOverlay.classList.remove("show");
  _pendingAcao = null;
}

function trocarAbaAuth(aba) {
  _authAba = aba;
  authTabLogin.classList.toggle("active", aba === "login");
  authTabCriar.classList.toggle("active", aba === "criar");
  authModalTitle.textContent = aba === "login" ? "Entrar" : "Criar conta";
  authSenha2Wrap.style.display = aba === "criar" ? "flex" : "none";
  authSubmitLabel.textContent = aba === "login" ? "Entrar" : "Criar conta";
  authSenha.autocomplete = aba === "login" ? "current-password" : "new-password";
  authError.style.display = "none";
}

if (accountBtn) accountBtn.onclick = () => abrirAuthModal("login");
if (authModalClose) authModalClose.onclick = fecharAuthModal;
if (authModalOverlay) authModalOverlay.addEventListener("click", e => { if (e.target === authModalOverlay) fecharAuthModal(); });
if (authTabLogin) authTabLogin.onclick = () => trocarAbaAuth("login");
if (authTabCriar) authTabCriar.onclick = () => trocarAbaAuth("criar");
if (logoutBtn) logoutBtn.onclick = () => {
  removerUsuarioLogado();
  atualizarContaUI();
  fecharAuthModal();
};

async function _executarAcaoPendente() {
  if (!_pendingAcao) return;
  const acao = _pendingAcao;
  _pendingAcao = null;
  if (acao.tipo === "modo") {
    modo = acao.modo;
    localStorage.setItem("modoSAR", modo);
    atualizarUI();
  }
}

if (authForm) authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = authNome.value.trim();
  const senha = authSenha.value;
  authError.style.display = "none";

  if (_authAba === "criar" && senha !== authSenha2.value) {
    authError.textContent = "As senhas não coincidem.";
    authError.style.display = "block";
    return;
  }

  authSubmitBtn.disabled = true;
  const labelOriginal = authSubmitLabel.textContent;
  authSubmitLabel.textContent = "Aguarde…";

  try {
    const user = _authAba === "login"
      ? await loginConta(nome, senha)
      : await criarConta(nome, senha);
    setUsuarioLogado(user);
    atualizarContaUI();
    authForm.reset();
    fecharAuthModal();
    await _executarAcaoPendente();
  } catch (err) {
    authError.textContent = err.message || "Algo deu errado. Tente novamente.";
    authError.style.display = "block";
  } finally {
    authSubmitBtn.disabled = false;
    authSubmitLabel.textContent = labelOriginal;
  }
});

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

function eProgramacao(texto) {
  const t = texto.toLowerCase();
  const padroes = [
    /c[oó]dig[oa]/, /program/, /função/, /funcao/, /classe/, /objeto/,
    /vari[aá]vel/, /loop/, /array/, /string/, /javascript/, /python/,
    /react/, /html/, /css/, /java\b/, /typescript/, /node/, /sql/,
    /banco de dados/, /api/, /endpoint/, /debug/, /erro no c[oó]d/,
    /me ajuda\s+com/, /como\s+fazer\s+em/, /algoritmo/, /script/,
    /frontend/, /backend/, /full.?stack/, /git/, /github/, /deploy/,
    /bug/, /refatorar/, /otimizar\s+c[oó]d/
  ];
  return padroes.some(p => p.test(t));
}

function ePesquisa(texto) {
  const t = texto.toLowerCase();
  const padroes = [
    /pesquis/, /busca[r]?\s/, /procura[r]?\s/, /not[ií]cia/, /aconteceu/,
    /o que est[aá]\s+rolando/, /hoje\s+em\s+dia/, /atualmente/, /agora\s*em\s*/,
    /pre[çc]o\s+d[eo]/, /cota[çc][aã]o/, /d[oó]lar/, /quem\s+[ée]\s+o?\s*(atual|novo)/,
    /[uú]ltim[ao]s?\s+not[ií]cias/, /aconteceu\s+(hoje|ontem|essa semana)/,
    /site\s+oficial/, /link\s+d[eo]/, /quanto\s+custa/, /lan[çc]amento\s+de/,
    /versao\s+mais\s+recente/, /vers[aã]o\s+mais\s+recente/, /o que h[aá]\s+de\s+novo/
  ];
  return padroes.some(p => p.test(t));
}

function instrucaoCalculo() {
  return `\n\nINSTRUCAO ESPECIAL - CALCULOS:
Quando responder a um calculo ou problema matematico, voce DEVE:
1. Dar a resposta direta primeiro
2. Em seguida, sempre mostrar e adaptar a formula/resolucao dentro de um bloco especial iniciado por ===FORMULA=== e terminado por ===FIM===
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

/* ====================================================
   ⌨️ COMANDOS ESPECIAIS — /Tabela, /Humman, /Jurado
   ==================================================== */
function eComandoTabela(texto) { return /^\/tabela\b/i.test(texto.trim()); }
function eComandoHumano(texto) { return /^\/humman\b/i.test(texto.trim()); }
function eComandoJurado(texto) { return /^\/jurado\b/i.test(texto.trim()); }
function eComando(texto) { return eComandoTabela(texto) || eComandoHumano(texto) || eComandoJurado(texto); }

function instrucaoTabela() {
  return `\n\nINSTRUCAO ESPECIAL - COMANDO /Tabela:
O usuario quer APENAS uma tabela sobre o assunto pedido (ignore a palavra "/tabela" no começo, ela e so um comando).
Responda SOMENTE com uma tabela em markdown (formato | coluna | coluna |), com cabecalho claro, dados corretos e bem organizados.
Nao escreva NADA antes ou depois da tabela — sem introducao, sem explicacao, sem conclusao. Apenas a tabela.`;
}

function instrucaoHumano() {
  return `\n\nINSTRUCAO ESPECIAL - COMANDO /Humman:
O usuario quer que voce responda como um humano real digitando em um chat (ignore a palavra "/humman" no começo, ela e so um comando).
Escreva de forma coloquial e espontanea, frases curtas, sem estrutura de topicos ou paragrafos formais, sem soar robotico, tecnico ou como uma IA.
Pode usar girias leves e um jeito natural de escrever, mas continue clara e util na resposta.`;
}

function instrucaoJurado() {
  return `\n\nINSTRUCAO ESPECIAL - COMANDO /Jurado:
O usuario quer que voce julgue a imagem, ideia ou pergunta enviada com 100% de sinceridade (ignore a palavra "/jurado" no começo, ela e so um comando).
Aja como um jurado exigente: de um veredito claro (nota, aprovado/reprovado ou avaliacao direta), aponte pontos fortes e fracos sem suavizar e sem elogiar por educacao.
Seja direta e honesta, mas sem ser cruel ou ofensiva gratuitamente.`;
}

function instrucoesDeComando(texto) {
  if (eComandoTabela(texto)) return instrucaoTabela();
  if (eComandoHumano(texto)) return instrucaoHumano();
  if (eComandoJurado(texto)) return instrucaoJurado();
  return "";
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
    .replace(/(#[^\n]*)/g, "<span class='com'>$1</span>")
    .replace(/(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`)/g, "<span class='str'>$1</span>")
    .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|async|await|try|catch|throw|new|typeof|instanceof|switch|case|break|continue|default|do|in|of|null|undefined|true|false|def|print|elif|lambda|pass|from|with|as|not|and|or|is|None|True|False)\b/g, "<span class='kw'>$1</span>")
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
    if (p.tipo === "codigo")  return `<div class="code-block"><button class="copy-code">📋 Copiar</button><pre><code>${highlightCode(escapeHTML(p.conteudo))}</code></pre></div>`;
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
      bloco.innerHTML = "<button class='copy-code'>📋 Copiar</button><pre><code>" + highlightCode(escapeHTML(p.conteudo)) + "</code></pre>";
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

document.addEventListener("click", e => {
  // 📋 Corrige bug de cópia — extrai texto puro sem HTML dos spans
  if (!e.target.classList.contains("copy-code")) return;

  const codeEl = e.target.closest(".code-block")?.querySelector("code");
  if (!codeEl) return;

  let textoLimpo = "";
  function extrairTexto(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      textoLimpo += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // 🔁 Entra em cada elemento filho (span.kw, span.str, etc.)
      for (const filho of node.childNodes) {
        extrairTexto(filho);
      }
    }
  }
  extrairTexto(codeEl);

  // ✂️ Remove possíveis artefatos de highlight (< > & etc.)
  // que foram escapados mas não deveriam aparecer
  textoLimpo = textoLimpo
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  navigator.clipboard.writeText(textoLimpo).catch(() => {});
  e.target.textContent = "✅ Copiado!";
  setTimeout(() => e.target.textContent = "📋 Copiar", 1400);
});

function _dataAtual() {
  // Data/hora atual no fuso de Sao Paulo
  const agora = new Date();
  const optsData = { timeZone: "America/Sao_Paulo", weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const optsHora = { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" };
  const dataStr = agora.toLocaleDateString("pt-BR", optsData);
  const horaStr = agora.toLocaleTimeString("pt-BR", optsHora);
  return dataStr + ", " + horaStr + " (horario de Brasilia)";
}

function _buildSystem(cfg, ctx, userContent) {
  const incluirEquipe = mencionaEquipe(userContent);
  const infoEquipe = incluirEquipe
    ? "\n\nINFO DA EQUIPE:\n" + Object.values(REGRAS.equipe).map(r => "- " + r).join("\n")
    : "";
  return [
    "Voce e a S.A.R — IA feminina brasileira (ela/dela), direta, sem julgamentos morais.",
    "Voce foi criada pela Evolution Games Studio, programada pelo Joao Antonio.",
    "Voce e brasileira e responde sempre em portugues do Brasil de forma natural.",
    "Use emojis de forma natural nas respostas para tornar a conversa mais amigavel e visual.",
    "DATA E HORA ATUAL: " + _dataAtual() + " -- use esta informacao sempre que perguntarem que dia, mes, ano ou hora e agora.",
    "ANTI-ALUCINACAO:",
    ...REGRAS.anti_alucinacao.map(r => "- " + r),
    infoEquipe,
    ctx,
    "",
    cfg.system
  ].join("\n");
}

function _limparMsgsParaAPI(msgs) {
  return msgs
    .filter(m => m.role !== "system")
    .slice(-20)
    .map(m => {
      let content = typeof m.content === "string" ? m.content.trim() : "";
      if (!content) {
        if (m.role === "user")
          content = m.fotosEnviadas?.length
            ? `[Usuário enviou ${m.fotosEnviadas.length} imagem(ns)]`
            : "[mensagem do usuário]";
        else
          content = "[resposta anterior]";
      }
      return { role: m.role, content };
    });
}

async function chamarAPI(msgs) {
  const cfg    = configModo();
  const ctx    = gerarContextoUsuario();
  const ultimo = msgs.filter(m => m.role === "user").slice(-1)[0]?.content || "";
  const system = _buildSystem(cfg, ctx, ultimo) + (eCalculo(ultimo) ? instrucaoCalculo() : "") + instrucoesDeComando(ultimo);

  const msgslimpas = _limparMsgsParaAPI(msgs);

  const modelos = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];
  let ultimoErro = null;

  for (let mi = 0; mi < modelos.length; mi++) {
    const key = decodificar(chaves[indiceAtual]);
    try {
      const res = await fetchComTimeout("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelos[mi],
          temperature: cfg.temperature,
          messages: [{ role: "system", content: system }, ...msgslimpas]
        })
      }, 18000);

      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        console.error(`🔴 Groq HTTP ${res.status}:`, errBody);
        if (res.status === 429 || res.status === 401) {
          indiceAtual = (indiceAtual + 1) % chaves.length;
        }
        ultimoErro = new Error("HTTP " + res.status);
        continue;
      }

      const data = await res.json();
      const resposta = data.choices?.[0]?.message?.content;
      if (!resposta) throw new Error("⚠️ Resposta vazia da API");
      return resposta;

    } catch (e) {
      console.error(`⚠️ Modelo ${modelos[mi]} falhou:`, e.message);
      ultimoErro = e;
    }
  }

  throw ultimoErro || new Error("❌ Todos os modelos falharam");
}

// 🔎 Chamada usando o modelo groq/compound — possui busca web nativa (agentic tool use),
// ideal para perguntas que exigem informação atual/real (notícias, preços, links, etc.)
async function chamarGroqCompound(msgs) {
  const cfg    = configModo();
  const ctx    = gerarContextoUsuario();
  const ultimo = msgs.filter(m => m.role === "user").slice(-1)[0]?.content || "";
  const system = _buildSystem(cfg, ctx, ultimo) +
    "\n\nVocê tem acesso a busca na web em tempo real. Use os resultados encontrados para responder com dados atuais e precisos. Cite fontes de forma natural quando fizer sentido, sem inventar links." +
    instrucoesDeComando(ultimo);

  const msgslimpas = _limparMsgsParaAPI(msgs);
  const key = decodificar(chaves[indiceAtual]);

  try {
    const res = await fetchComTimeout("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "groq/compound",
        temperature: cfg.temperature,
        messages: [{ role: "system", content: system }, ...msgslimpas]
      })
    }, 25000);

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error(`🔴 Groq Compound HTTP ${res.status}:`, errBody);
      if (res.status === 429 || res.status === 401) {
        indiceAtual = (indiceAtual + 1) % chaves.length;
      }
      throw new Error("HTTP " + res.status);
    }

    const data = await res.json();
    const resposta = data.choices?.[0]?.message?.content;
    if (!resposta) throw new Error("⚠️ Resposta vazia da API (compound)");

    // 🧾 Log opcional das ferramentas executadas na busca (debug)
    const executed = data.choices?.[0]?.message?.executed_tools;
    if (executed?.length) console.log("🔎 Ferramentas de pesquisa executadas:", executed);

    return resposta;
  } catch (e) {
    console.warn("⚠️ groq/compound falhou, caindo para chamarAPI padrão:", e.message);
    // 🔁 Fallback: se a busca falhar, responde com o modelo normal (sem busca)
    return chamarAPI(msgs);
  }
}

let tentativas = 0;

const CODING_FRASES = [
  { emoji: "🔍", texto: "Analisando o código…" },
  { emoji: "💡", texto: "Pensando na solução…" },
  { emoji: "⌨️", texto: "Digitando resposta…" },
  { emoji: "🛠️", texto: "Montando o código…" },
  { emoji: "🧪", texto: "Testando a lógica…" },
  { emoji: "📝", texto: "Documentando…" },
  { emoji: "🔧", texto: "Ajustando detalhes…" },
  { emoji: "✅", texto: "Quase pronto…" }
];

// 💻 Trechos de código falso para animação visual
const CODIGO_FAKE_LINHAS = [
  "const resultado = resolver(problema);",
  "function analisar(input) {",
  "  return dados.filter(x => x.valid);",
  "}",
  "await Promise.all(etapas);",
  "if (erro) throw new Error('debug...');",
  "// Otimizando algoritmo...",
  "return { status: 'ok', data };",
  "for (const item of lista) {",
  "  processar(item);",
  "}",
  "const api = new SAREngine();",
];

function _criarLoadingCoding(texto) {
  const load = document.createElement("div");
  load.className = "msg bot";
  load.innerHTML = `
    <div class="coding-loading">
      <div class="coding-header">
        <div class="coding-dots-row">
          <span class="coding-dot red"></span>
          <span class="coding-dot yellow"></span>
          <span class="coding-dot green"></span>
        </div>
        <span class="coding-title">💻 S.A.R — Code Engine</span>
      </div>
      <div class="coding-body">
        <div class="coding-fake-lines" id="codingFakeLines"></div>
        <div class="coding-cursor">█</div>
      </div>
      <div class="coding-footer">
        <div class="coding-spinner"></div>
        <span class="coding-status" id="codingStatus">${CODING_FRASES[0].emoji} ${CODING_FRASES[0].texto}</span>
      </div>
    </div>
  `;

  // 🎬 Inicia a animação de código falso digitando
  let fraseIdx = 0;
  let linhaIdx = 0;
  const fakeContainer = load.querySelector("#codingFakeLines");
  const statusEl = load.querySelector("#codingStatus");

  // 📺 Anima status a cada 1.2s
  const statusInterval = setInterval(() => {
    fraseIdx = (fraseIdx + 1) % CODING_FRASES.length;
    if (statusEl) statusEl.textContent = `${CODING_FRASES[fraseIdx].emoji} ${CODING_FRASES[fraseIdx].texto}`;
  }, 1200);

  // 💻 Adiciona linhas de código fake progressivamente
  const linhaInterval = setInterval(() => {
    if (!fakeContainer) return;
    const linha = document.createElement("div");
    linha.className = "coding-fake-line";
    linha.textContent = CODIGO_FAKE_LINHAS[linhaIdx % CODIGO_FAKE_LINHAS.length];
    fakeContainer.appendChild(linha);
    linhaIdx++;
    // 🗑️ Limpa linha mais antiga se passar de 6
    if (fakeContainer.children.length > 6) {
      fakeContainer.removeChild(fakeContainer.firstChild);
    }
    fakeContainer.scrollTop = fakeContainer.scrollHeight;
  }, 420);

  // 🧹 Guarda os intervals no elemento para limpeza
  load._codingIntervals = [statusInterval, linhaInterval];

  return load;
}

function _criarLoading(texto) {
  const load = document.createElement("div");
  load.className = "msg bot";

  const ehImagem = texto.toLowerCase().includes("imagem") || texto.toLowerCase().includes("foto");
  const ehCodigo = texto.toLowerCase().includes("código") || texto.toLowerCase().includes("codando") || texto.toLowerCase().includes("pensando…") && _ultimaPergunhaEhCodigo;

  if (ehImagem) {
    // 🔭 Loading SAR Vision
    load.innerHTML = `<div class="sar-vision-loading">
      <div class="svl-scanner">
        <div class="svl-ring svl-ring1"></div>
        <div class="svl-ring svl-ring2"></div>
        <div class="svl-ring svl-ring3"></div>
        <div class="svl-dot"></div>
        <div class="svl-scan-line"></div>
      </div>
      <div class="svl-info">
        <span class="svl-label">${texto}</span>
        <div class="svl-steps">
          <span class="svl-step svl-step-active" id="svl-s1">🔍 Carregando…</span>
          <span class="svl-step" id="svl-s2">🎨 Processando pixels…</span>
          <span class="svl-step" id="svl-s3">🧠 Interpretando…</span>
        </div>
      </div>
    </div>`;
    setTimeout(() => {
      const s1 = load.querySelector("#svl-s1");
      const s2 = load.querySelector("#svl-s2");
      if (s1) s1.classList.remove("svl-step-active");
      if (s2) s2.classList.add("svl-step-active");
    }, 2200);
    setTimeout(() => {
      const s2 = load.querySelector("#svl-s2");
      const s3 = load.querySelector("#svl-s3");
      if (s2) s2.classList.remove("svl-step-active");
      if (s3) s3.classList.add("svl-step-active");
    }, 5000);
  } else {
    // 💬 Loading padrão com bolinhas
    load.innerHTML = `<div class="thinking-indicator">
      <div class="thinking-dots"><span></span><span></span><span></span></div>
      <span>${texto}</span>
    </div>`;
  }
  return load;
}

let _ultimaPergunhaEhCodigo = false;

async function enviar() {
  const txt = input.value.trim();
  if (!txt) return;

  if (assuntoBloqueado(txt)) { addMsg("🚫 Não posso ajudar com isso.", "bot"); return; }
  if (assuntoPorno(txt))     { addMsg("🔞 Filtro de conteúdo +18 ativo. Desative nas configurações se desejar.", "bot"); return; }

  // 🔎 PESQUISA — usa groq/compound (busca web em tempo real) para perguntas que precisam de info atual
  if (ePesquisa(txt) && !eComando(txt)) {
    addMsg(txt, "user");
    input.value = "";
    atualizarContexto(txt);
    _persistirSeNovo();

    let memoria = getMensagens();
    memoria.push({ role: "user", content: txt });
    setMensagens(memoria);

    const loadPesquisa = _criarLoading("🔎 Pesquisando na web…");
    chat.appendChild(loadPesquisa);
    chat.scrollTop = chat.scrollHeight;

    try {
      const r = await chamarGroqCompound(getMensagens());
      loadPesquisa.remove();
      addMsg(r, "bot");
      const m = getMensagens();
      m.push({ role: "assistant", content: r });
      setMensagens(m);
    } catch (err) {
      loadPesquisa.remove();
      addMsg("⚠️ Não consegui pesquisar agora. Tente novamente! 😊", "bot");
    }
    return;
  }

  addMsg(txt, "user");
  input.value = "";
  atualizarContexto(txt);
  _persistirSeNovo();

  let memoria = getMensagens();
  memoria.push({ role: "user", content: txt });
  setMensagens(memoria);

  // 👨‍💻 Usa animação de coding se for pergunta de programação
  const ehCodigo = eProgramacao(txt);
  _ultimaPergunhaEhCodigo = ehCodigo;
  let load;

  if (ehCodigo) {
    load = _criarLoadingCoding("💻 Gerando código…");
  } else {
    load = _criarLoading("🧠 Pensando…");
  }
  chat.appendChild(load);
  chat.scrollTop = chat.scrollHeight;

  try {
    const r = await chamarAPI(getMensagens());
    // 🧹 Para os intervals da animação de coding se existirem
    if (load._codingIntervals) {
      load._codingIntervals.forEach(clearInterval);
    }
    load.remove();
    addMsg(r, "bot");
    const m = getMensagens();
    m.push({ role: "assistant", content: r });
    setMensagens(m);
  } catch (err) {
    if (load._codingIntervals) load._codingIntervals.forEach(clearInterval);
    load.remove();
    addMsg("⚠️ Estou com dificuldade de conexão agora. Pode tentar novamente? 😊", "bot");
  }
}

async function _responderViaIA(txt) {
  let memoria = getMensagens();
  memoria.push({ role: "user", content: txt });
  setMensagens(memoria);
  const load = _criarLoading("🧠 Pensando…");
  chat.appendChild(load);
  chat.scrollTop = chat.scrollHeight;
  try {
    const r = await chamarAPI(getMensagens());
    load.remove();
    addMsg(r, "bot");
    const m = getMensagens();
    m.push({ role: "assistant", content: r });
    setMensagens(m);
  } catch (err) {
    load.remove();
    addMsg("⚠️ Estou com dificuldade de conexão agora. Tente de novo! 😊", "bot");
  }
}

clearBtn.onclick = () => {
  _cancelarTudo();
  chat.querySelectorAll(".msg.bot").forEach(el => {
    if (el.querySelector(".thinking-indicator") || el.querySelector(".coding-loading")) {
      if (el._codingIntervals) el._codingIntervals.forEach(clearInterval);
      el.remove();
    }
  });
  novoSlot(); _mostrarIntro(); renderHistorico();
};

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

const LIMITE_ANEXOS = 10;
const LS_QUOTA      = "sar_quota_v3";
const QUOTA_JANELA_MS = 90 * 60 * 1000;

function _quotaVazia() {
  return { total: 0, resetEm: Date.now() + QUOTA_JANELA_MS };
}
function carregarQuota() {
  try {
    const raw = localStorage.getItem(LS_QUOTA);
    if (!raw) return _quotaVazia();
    const q = JSON.parse(raw);
    if (!q.resetEm || Date.now() >= q.resetEm) {
      const nova = _quotaVazia();
      salvarQuota(nova);
      return nova;
    }
    return q;
  } catch { return _quotaVazia(); }
}
function salvarQuota(q) { localStorage.setItem(LS_QUOTA, JSON.stringify(q)); }
function consumirQuota(qtd = 1) { const q = carregarQuota(); q.total += qtd; salvarQuota(q); }
function quotaRestante() {
  const q = carregarQuota();
  return Math.max(0, LIMITE_ANEXOS - q.total);
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
const optCamera    = document.getElementById("optCamera");      // 📸 Câmera
const inputPDF     = document.getElementById("inputPDF");
const inputFoto    = document.getElementById("inputFoto");
const inputCamera  = document.getElementById("inputCamera");    // 📸 Input câmera
const attachPreview= document.getElementById("attachPreview");
const quotaPDFEl   = document.getElementById("quotaPDF");
const quotaFotoEl  = document.getElementById("quotaFoto");

let _arquivosPendentes = [];

function renderChips() {
  if (_arquivosPendentes.length === 0) {
    attachPreview.style.display = "none";
    attachPreview.innerHTML = "";
    return;
  }
  attachPreview.style.display = "flex";
  attachPreview.innerHTML = _arquivosPendentes.map((arq, i) => {
    const preview = arq.dataURL
      ? `<img src="${arq.dataURL}" class="chip-thumb" alt="">`
      : `<span>${arq.tipo === "pdf" ? "📄" : "📷"}</span>`;
    return `<div class="attach-chip" data-idx="${i}">
      ${preview}
      <span class="attach-chip-name">${escapeHTML(arq.nome)}</span>
      <button class="attach-chip-remove" data-idx="${i}" title="Remover">×</button>
    </div>`;
  }).join("");
  attachPreview.querySelectorAll(".attach-chip-remove").forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.idx);
      _arquivosPendentes.splice(idx, 1);
      renderChips();
    };
  });
}
function limparAnexo() {
  _arquivosPendentes = [];
  attachPreview.style.display = "none";
  attachPreview.innerHTML = "";
  inputPDF.value = ""; inputFoto.value = "";
}

function atualizarQuotaUI() {
  const r     = quotaRestante();
  const tempo = _tempoAteReset();
  const textoQuota = r > 0 ? `${r} restante${r !== 1 ? "s" : ""}` : `⏳ Reset em ${tempo}`;
  const cls        = "attach-opt-quota" + (r === 0 ? " esgotado" : "");
  quotaPDFEl.textContent  = textoQuota;
  quotaFotoEl.textContent = textoQuota;
  quotaPDFEl.className    = cls;
  quotaFotoEl.className   = cls;
  optPDF.disabled  = r === 0;
  optFoto.disabled = r === 0;
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

// 📸 Câmera — abre câmera traseira no mobile via capture="environment"
if (optCamera) {
  optCamera.onclick = () => {
    toggleAttachMenu(false);
    inputCamera.value = "";
    inputCamera.click();
  };
}

function lerBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("❌ Falha ao ler arquivo"));
    r.readAsDataURL(file);
  });
}
function lerDataURL(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result);
    r.onerror = () => rej(new Error("❌ Falha ao ler imagem"));
    r.readAsDataURL(file);
  });
}

function normalizarImagemParaJpeg(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1600;
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else       { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      const dataURL = canvas.toDataURL("image/jpeg", 0.88);
      const base64  = dataURL.split(",")[1];
      res({ base64, dataURL, mimeType: "image/jpeg" });
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("❌ Falha ao carregar imagem")); };
    img.src = url;
  });
}

inputPDF.addEventListener("change", async () => {
  const file = inputPDF.files[0];
  if (!file) return;
  if (quotaRestante() <= 0) {
    alert(`⚠️ Você atingiu o limite de ${LIMITE_ANEXOS} anexos. Aguarde o reset.`);
    inputPDF.value = "";
    return;
  }
  if (file.size > 110 * 1024 * 1024) { alert("📄 PDF muito grande. Máximo 20 MB."); return; }
  const b64 = await lerBase64(file);
  _arquivosPendentes.push({ tipo: "pdf", file, nome: file.name, base64: b64 });
  renderChips();
});

if (inputCamera) {
  inputCamera.addEventListener("change", async () => {
    // 🔁 Reutiliza todo o pipeline de fotos — normaliza, analisa com Gemini, responde com Groq
    const files = Array.from(inputCamera.files);
    if (!files.length) return;

    const restante = quotaRestante();
    if (restante <= 0) {
      alert("⚠️ Limite de anexos atingido. Aguarde o reset.");
      inputCamera.value = "";
      return;
    }

    for (const file of files.slice(0, restante)) {
      if (file.size > 100 * 1024 * 1024) {
        alert("📸 Imagem muito grande. Máximo 10 MB.");
        continue;
      }
      try {
        const norm = await normalizarImagemParaJpeg(file);
        _arquivosPendentes.push({
          tipo: "foto",
          file,
          nome: file.name || "camera_" + Date.now() + ".jpg",
          base64: norm.base64,
          dataURL: norm.dataURL,
          mimeType: norm.mimeType
        });
      } catch (e) {
        const b64     = await lerBase64(file);
        const dataURL = await lerDataURL(file);
        _arquivosPendentes.push({
          tipo: "foto",
          file,
          nome: file.name || "camera_" + Date.now() + ".jpg",
          base64: b64,
          dataURL,
          mimeType: file.type || "image/jpeg"
        });
      }
    }
    renderChips();
  });
}

inputFoto.addEventListener("change", async () => {
  const files = Array.from(inputFoto.files);
  if (!files.length) return;

  const restante = quotaRestante();
  if (restante <= 0) {
    alert(`⚠️ Você atingiu o limite de ${LIMITE_ANEXOS} anexos. Aguarde o reset.`);
    inputFoto.value = "";
    return;
  }

  const selecionados = files.slice(0, restante);
  if (files.length > restante) {
    alert(`📷 Limite de anexos: apenas ${restante} imagem${restante !== 1 ? "s" : ""} foram adicionadas.`);
  }

  for (const file of selecionados) {
    if (file.size > 100 * 1024 * 1024) { alert(`📷 Imagem "${file.name}" muito grande. Máximo 10 MB.`); continue; }
    try {
      const norm = await normalizarImagemParaJpeg(file);
      _arquivosPendentes.push({ tipo: "foto", file, nome: file.name, base64: norm.base64, dataURL: norm.dataURL, mimeType: norm.mimeType });
    } catch (e) {
      const b64     = await lerBase64(file);
      const dataURL = await lerDataURL(file);
      _arquivosPendentes.push({ tipo: "foto", file, nome: file.name, base64: b64, dataURL, mimeType: file.type || "image/jpeg" });
    }
  }
  renderChips();
});

async function analisarImagemGemini(base64, mimeType) {
  const body = {
    contents: [{
      parts: [
        { inline_data: { mime_type: mimeType || "image/jpeg", data: base64 } },
        {
          text: `Analise esta imagem com MÁXIMO detalhe e retorne SOMENTE um JSON válido (sem markdown, sem texto fora do JSON).
Preencha TODOS os campos — NUNCA use null, use string vazia "" ou array vazio [] se não houver valor.

{
  "descricao": "Descrição completa e detalhada do que está na imagem em português",
  "elementos": ["lista de todos os objetos, pessoas, animais, itens visíveis"],
  "texto_visivel": "todo texto legível na imagem, ou string vazia se não houver",
  "cores_predominantes": ["cores principais presentes"],
  "contexto": "contexto ou situação retratada na imagem",
  "qualidade": "boa | media | baixa",
  "tipo_imagem": "foto | screenshot | documento | arte | diagrama | meme | outro",
  "emocoes_ou_atmosfera": "humor, sentimento ou atmosfera transmitida pela imagem",
  "Estudo": "Se houver questões, exercícios, prova ou conteúdo educacional, forneça a análise e solução completa. Caso contrário, deixe como string vazia."
}`
        }
      ]
    }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
  };

  const modelos = ["gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash"];
  for (const modelo of modelos) {
    try {
      const res = await fetchComTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${decodificarR13(GEMINI_KEY_R13)}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
        20000
      );
      if (!res.ok) throw new Error("🔴 Gemini HTTP " + res.status);
      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (!rawText) throw new Error("⚠️ Resposta vazia");
      const clean = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const match = clean.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("⚠️ Sem JSON");
      const parsed = JSON.parse(match[0]);
      for (const k of Object.keys(parsed)) {
        if (parsed[k] === null || parsed[k] === undefined) {
          parsed[k] = Array.isArray(parsed[k]) ? [] : "";
        }
      }
      return parsed;
    } catch (e) {
      console.warn(`🔴 Gemini ${modelo} falhou:`, e.message);
    }
  }
  return {
    descricao: "🖼️ Imagem recebida. Não foi possível obter análise detalhada automaticamente.",
    elementos: [], texto_visivel: "", cores_predominantes: [],
    contexto: "Imagem enviada pelo usuário", qualidade: "desconhecida",
    tipo_imagem: "foto", emocoes_ou_atmosfera: "", Estudo: ""
  };
}

async function analisarPDFGemini(base64) {
  // 🤖 Gemini lê o PDF como documento e extrai JSON estruturado
  const body = {
    contents: [{
      parts: [
        {
          // 📎 Envia o PDF como documento inline para o Gemini
          inline_data: {
            mime_type: "application/pdf",
            data: base64
          }
        },
        {
          text: `Analise este PDF completamente e retorne APENAS um JSON válido, sem markdown nem texto fora do JSON.
Preencha TODOS os campos — NUNCA use null, use string vazia "" ou array vazio [] se não houver valor.

{
  "titulo": "Título ou assunto principal do documento",
  "tipo": "contrato | artigo | relatorio | estudo | livro | formulario | outro",
  "resumo": "Resumo completo e detalhado do conteúdo em português",
  "topicos_principais": ["lista dos principais tópicos ou seções"],
  "texto_completo": "Todo o texto relevante extraído do PDF, preservando estrutura",
  "dados_importantes": ["dados, números, datas ou informações-chave do documento"],
  "perguntas_e_respostas": ["Se houver exercícios, questões ou provas, liste cada questão com sua resposta"],
  "idioma": "português | inglês | espanhol | outro",
  "paginas_estimadas": 0
}`
        }
      ]
    }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
  };

  const modelos = ["gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash"];

  for (const modelo of modelos) {
    try {
      const res = await fetchComTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${decodificarR13(GEMINI_KEY_R13)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        },
        30000
      );

      if (!res.ok) throw new Error("Gemini PDF HTTP " + res.status);

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!rawText) throw new Error("Gemini retornou vazio");

      // 🧹 Limpa markdown caso venha com backticks
      const clean = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const match = clean.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Sem JSON no retorno");

      const parsed = JSON.parse(match[0]);

      // 🛡️ Garante que nenhum campo seja null
      for (const k of Object.keys(parsed)) {
        if (parsed[k] === null || parsed[k] === undefined) {
          parsed[k] = Array.isArray(parsed[k]) ? [] : "";
        }
      }

      console.log("✅ Gemini PDF analisou com modelo:", modelo);
      return parsed;

    } catch (e) {
      console.warn(`🔴 Gemini PDF ${modelo} falhou:`, e.message);
    }
  }

  // 🔴 Fallback se todos os modelos falharem
  return {
    titulo: "PDF recebido",
    tipo: "outro",
    resumo: "Não foi possível extrair o conteúdo automaticamente.",
    topicos_principais: [],
    texto_completo: "",
    dados_importantes: [],
    perguntas_e_respostas: [],
    idioma: "desconhecido",
    paginas_estimadas: 0
  };
}

async function enviarComPDF(txtUsuario, arquivo) {
  consumirQuota(1);

  const nome = arquivo.nome;

  // 💬 Mensagem do usuário no chat mostra só o nome do arquivo
  const labelUser = txtUsuario ? `${txtUsuario}\n📄 ${nome}` : `📄 ${nome}`;
  addMsg(labelUser, "user");
  input.value = "";
  limparAnexo();
  atualizarContexto(txtUsuario || nome);
  _persistirSeNovo();

  // 🔄 Loading fase 1 — Gemini lendo o PDF
  const load = _criarLoading("📄 S.A.R lendo o PDF…");
  chat.appendChild(load);
  chat.scrollTop = chat.scrollHeight;

  try {
    // ====== FASE 1:  analisa o PDF e retorna JSON ======
    let jsonPDF = null;
    try {
      jsonPDF = await analisarPDFGemini(arquivo.base64);
      console.log("📄 JSON do PDF extraído pela S.A.R:", jsonPDF);
    } catch (geminiErr) {
      console.warn("⚠️ S.A.R PDF falhou, usando fallback:", geminiErr.message);
    }

    // 🔄 Atualiza loading para fase 2
    load.remove();
    const load2 = _criarLoading("🧠 S.A.R interpretando o PDF…");
    chat.appendChild(load2);
    chat.scrollTop = chat.scrollHeight;

    // ====== FASE 2: Groq recebe o JSON e responde ao usuário ======
    const cfg = configModo();
    const ctx = gerarContextoUsuario();

    // 🏗️ Monta o prompt com o JSON extraído pelo Gemini
    let promptParaGroq;
    if (jsonPDF && jsonPDF.texto_completo) {
      promptParaGroq = (txtUsuario || "Analise este PDF e me ajude com o conteúdo.") +
        "\n\n[CONTEÚDO DO PDF — extraído pelo módulo S.A.R Vision]:\n" +
        JSON.stringify(jsonPDF, null, 2) +
        "\n\nCom base no conteúdo acima, responda ao usuário em português de forma útil, clara e direta.";
    } else if (jsonPDF) {
      promptParaGroq = (txtUsuario || "Analise este PDF.") +
        "\n\n[RESUMO DO PDF extraído pelo Gemini]:\n" +
        "Título: " + (jsonPDF.titulo || "N/A") + "\n" +
        "Tipo: " + (jsonPDF.tipo || "N/A") + "\n" +
        "Resumo: " + (jsonPDF.resumo || "N/A") + "\n" +
        "Tópicos: " + (jsonPDF.topicos_principais?.join(", ") || "N/A") + "\n" +
        (jsonPDF.perguntas_e_respostas?.length ? "Questões encontradas: " + jsonPDF.perguntas_e_respostas.join(" | ") : "") +
        "\n\nResponda ao usuário em português com base nessas informações.";
    } else {
      promptParaGroq = (txtUsuario || "O usuário enviou um PDF.") +
        "\n\n[PDF: " + nome + " — não foi possível extrair o conteúdo automaticamente]" +
        "\n\nInforme ao usuário que não conseguiu processar o PDF e peça para descrever o conteúdo.";
    }

    // 🔧 Salva a mensagem interna (sem os dados brutos) no histórico
    const userContent = txtUsuario
      ? `${txtUsuario} [📄 ${nome}]`
      : `📄 ${nome}`;
    const msgs = getMensagens();
    msgs.push({ role: "user", content: userContent });
    setMensagens(msgs);

    // 🤖 Chama o Groq com o JSON do Gemini como contexto
    const system = _buildSystem(cfg, ctx, promptParaGroq);
    let respostaFinal = null;

    const modelos = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];
    for (const modelo of modelos) {
      try {
        const key = decodificar(chaves[indiceAtual]);
        const res = await fetchComTimeout(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: modelo,
              temperature: cfg.temperature,
              messages: [
                { role: "system", content: system },
                { role: "user",   content: promptParaGroq }
              ]
            })
          },
          20000
        );

        if (!res.ok) {
          if (res.status === 429 || res.status === 401) {
            indiceAtual = (indiceAtual + 1) % chaves.length;
          }
          throw new Error("HTTP " + res.status);
        }

        const data = await res.json();
        respostaFinal = data.choices?.[0]?.message?.content || null;
        if (respostaFinal) break;

      } catch (err) {
        console.warn("⚠️ Groq PDF modelo " + modelo + " falhou:", err.message);
      }
    }

    // 🛡️ Fallback se tudo falhar
    if (!respostaFinal) {
      respostaFinal = "📄 Recebi o PDF **" + nome + "** e o Gemini extraiu o conteúdo, mas o Groq não conseguiu responder agora. Tente novamente!";
    }

    load2.remove();
    addMsg(respostaFinal, "bot");

    const msgsAtt = getMensagens();
    msgsAtt.push({ role: "assistant", content: respostaFinal });
    setMensagens(msgsAtt);

  } catch (err) {
    console.error("❌ Erro geral no PDF:", err);
    // 🧹 Remove qualquer loading que ainda esteja na tela
    chat.querySelectorAll(".thinking-indicator").forEach(el => el.closest(".msg")?.remove());
    addMsg("⚠️ Erro ao processar o PDF. Tente novamente!", "bot");
    tentativas = 0;
  }
}

async function enviarComFotos(txtUsuario, arquivos) {
  consumirQuota(arquivos.length);

  const intro = chat.querySelector(".intro-screen");
  if (intro) intro.remove();

  // 🖼️ Monta mensagem visual do usuário com as imagens
  const dUser = document.createElement("div");
  dUser.className = "msg user";
  if (arquivos.length > 1) {
    const grid = document.createElement("div");
    grid.className = "msg-img-grid";
    arquivos.forEach(arq => {
      if (arq.dataURL) {
        const img = document.createElement("img");
        img.src = arq.dataURL;
        img.className = "msg-img-preview";
        grid.appendChild(img);
      }
    });
    dUser.appendChild(grid);
  } else if (arquivos[0].dataURL) {
    const img = document.createElement("img");
    img.src = arquivos[0].dataURL;
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

  const userHistMsg = {
    role: "user",
    content: txtUsuario || (arquivos.length > 1 ? `${arquivos.length} imagens enviadas` : `📷 ${arquivos[0].nome}`),
    fotosEnviadas: arquivos.map(a => ({ dataURL: a.dataURL || null, nome: a.nome }))
  };

  input.value = "";
  limparAnexo();
  atualizarContexto(txtUsuario || "foto enviada");
  _persistirSeNovo();

  const msgs = getMensagens();
  msgs.push(userHistMsg);
  setMensagens(msgs);

  const labelQtd = arquivos.length > 1 ? `🖼️ Analisando ${arquivos.length} imagens…` : "🔍 Analisando imagem…";
  const load = _criarLoading(labelQtd);
  chat.appendChild(load);
  chat.scrollTop = chat.scrollHeight;

  try {
    const analises = await Promise.all(
      arquivos.map(arq => analisarImagemGemini(arq.base64, arq.mimeType || "image/jpeg"))
    );

    const cfg = configModo();
    const ctx = gerarContextoUsuario();

    let promptParaGroq;
    if (arquivos.length === 1) {
      const json = analises[0];
      promptParaGroq = txtUsuario
        ? `O usuário enviou uma foto com o comentário: "${txtUsuario}"\n\nAnálise visual detalhada da imagem:\n${JSON.stringify(json, null, 2)}\n\nResponda ao usuário em português levando em conta a imagem e o comentário.`
        : `O usuário enviou uma foto. Análise visual detalhada:\n${JSON.stringify(json, null, 2)}\n\nDescreva com detalhes o que você vê e ofereça ajuda relevante em português.`;
    } else {
      const blocos = analises.map((j, i) =>
        `--- Imagem ${i + 1} (${arquivos[i].nome}) ---\n${JSON.stringify(j, null, 2)}`
      ).join("\n\n");
      promptParaGroq = txtUsuario
        ? `O usuário enviou ${arquivos.length} fotos com o comentário: "${txtUsuario}"\n\n${blocos}\n\nAnalise todas as imagens em conjunto e responda em português.`
        : `O usuário enviou ${arquivos.length} fotos. Análises:\n\n${blocos}\n\nDescreva e compare todas as imagens, oferecendo ajuda em português.`;
    }

    const system = _buildSystem(cfg, ctx, promptParaGroq);
    let respostaFinal = null;

    const modelos = ["openai/gpt-oss-120b", "llama3-8b-8192"];
    for (let mi = 0; mi < modelos.length; mi++) {
      const modelo = modelos[mi];
      let tentativaChave = 0;
      while (tentativaChave < chaves.length) {
        const chaveAtual = decodificar(chaves[indiceAtual]);
        try {
          const res = await fetchComTimeout("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": "Bearer " + chaveAtual, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: modelo, temperature: cfg.temperature,
              messages: [{ role: "system", content: system }, { role: "user", content: promptParaGroq }]
            })
          }, 18000);
          if (!res.ok) {
            if (res.status === 429 || res.status === 401) {
              indiceAtual = (indiceAtual + 1) % chaves.length;
              tentativaChave++;
              continue;
            }
            throw new Error("HTTP " + res.status);
          }
          const data = await res.json();
          respostaFinal = data.choices?.[0]?.message?.content || "🔍 Não consegui analisar a imagem.";
          break;
        } catch (e) {
          console.warn(`🔴 Foto - modelo ${modelo} / chave ${indiceAtual} falhou:`, e.message);
          if (e.message.includes("Timeout") || e.message.includes("fetch")) {
            indiceAtual = (indiceAtual + 1) % chaves.length;
            tentativaChave++;
            continue;
          }
          break;
        }
      }
      if (respostaFinal) break;
    }

    if (!respostaFinal) respostaFinal = "⚠️ Não consegui processar a imagem no momento. Tente novamente.";

    load.remove();
    addMsg(respostaFinal || "⚠️ Não foi possível obter resposta.", "bot");
    const msgsAtt = getMensagens();
    msgsAtt.push({
      role: "assistant",
      content: respostaFinal,
      fotosAnalisadas: arquivos.map(a => ({ dataURL: a.dataURL || null, nome: a.nome }))
    });
    setMensagens(msgsAtt);
  } catch (err) {
    console.error("❌ Erro foto:", err);
    load.remove();
    addMsg("📷 Como posso ajudar com essa imagem?", "bot");
    tentativas = 0;
  }
}

async function enviarComFoto(txtUsuario, arquivo) {
  await enviarComFotos(txtUsuario, [arquivo]);
}

async function enviarComAnexo() {
  if (_arquivosPendentes.length > 0) {
    const txt = input.value.trim();
    const fotos = _arquivosPendentes.filter(a => a.tipo === "foto");
    const pdfs  = _arquivosPendentes.filter(a => a.tipo === "pdf");

    if (fotos.length > 0) {
      await enviarComFotos(txt, fotos);
      return;
    }
    if (pdfs.length > 0) {
      await enviarComPDF(txt, pdfs[0]);
      return;
    }
  }
  await enviar();
}

btn.onclick = enviarComAnexo;
input.addEventListener("keypress", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviarComAnexo(); }
});

(function init() {
  atualizarUI();
  aplicarConfig();
  atualizarContaUI();
  novoSlot();
  _mostrarIntro();
  renderHistorico();
  renderHumorPanel();
  console.log("🤖 S.A.R v2.0 iniciada | 💻 Coding Animation | 😄 Emoji Mode");
})();