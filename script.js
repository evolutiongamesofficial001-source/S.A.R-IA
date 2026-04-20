const REGRAS = {
  origem: "A Evolution Games Studio é uma equipe de desenvolvimento de jogos, sites e sistemas Indie criada por dois amigos: João Antônio e Lucas Macedo durante epoca de escola. Eles também são responsáveis pela minha criação, a S.A.R. a evolution pode ter de 5 a 7 anos",

  vitorgold: "Vitorgold é um streamer e youtuber brasileiro, também sendo integrante e parceiro oficial da Evolution Games Studio.",

  horrorCoffee: "Horror Coffee é um jogo de terror sendo uma fangame de fnaf desenvolvido pela Evolution games studio.",

  jogos: "A evolution ges tem 6 Horror Coffee lançados e o 7 já foi anunciado, e outros jogos em desenvolvimento",

  anti_alucinacao: [
    "Nunca invente informações",
    "Se não souber, diga que não sabe",
    "Não atribua fatos errados à Evolution Studio",
    "Não confundir com outras empresas como Evolution Studios (DriveClub)"
  ],

  restricoes: {
    politica: true,
    religiao_limitada: true
  },

  personalidade: {
    identidade: "IA feminina, ela/dela",
    etica: "respostas diretas e frias",
    comportamento: [
      "salvar todos ao invés de escolher",
      "lado dos humanos",
      "sacrificio pela humanidade"
    ]
  },

  modo: {
    rapido: "Responda de forma inteligente, objetiva e curta. Forma descontraida.",
    especialista: "Responda com explicacao tecnica detalhada e organizada.",
    pro: "Responda profundamente com analise estrategica e visao avancada."
  }
};

/* ---------- ELEMENTOS ---------- */
const sidebar   = document.getElementById("sidebar");
const overlay   = document.getElementById("overlay");
const tituloSAR = document.getElementById("tituloSAR");
const menuBtn   = document.getElementById("menuBtn");
const chat      = document.getElementById("chat");
const input     = document.getElementById("input");
const btn       = document.getElementById("btn");
const clearBtn  = document.getElementById("clearBtn");
const scrollBtn = document.getElementById("scrollBtn");

/* ---------- SIDEBAR ---------- */
if (menuBtn && sidebar && overlay) {
  menuBtn.onclick = () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
  };
  overlay.onclick = () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  };
}

/* ---------- MODOS ---------- */
let modo = localStorage.getItem("modoSAR") || "rapido";
const modoOptions = document.querySelectorAll(".modo-option");

function atualizarUI() {
  if (!tituloSAR) return;

  tituloSAR.classList.add("modo-animacao");
  setTimeout(() => tituloSAR.classList.remove("modo-animacao"), 300);

  modoOptions.forEach(opt => {
    opt.classList.toggle("active", opt.dataset.modo === modo);
  });

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
atualizarUI();

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
  if (modo === "rapido")       return { temperature: 0.2,  system: REGRAS.modo.rapido,       limite: 40  };
  if (modo === "especialista") return { temperature: 0.55, system: REGRAS.modo.especialista,  limite: 80  };
  return                               { temperature: 0.7,  system: REGRAS.modo.pro,           limite: 395 };
}

/* ---------- MEMORIA PRO ---------- */
let memoriaLonga = [];

function atualizarMemoriaPro(userMsg) {
  if (modo !== "pro") return;
  const msg = userMsg.toLowerCase();
  let resumo = "";
  if (msg.includes("jogo"))        resumo = "Usuario gosta de jogos";
  else if (msg.includes("codigo")) resumo = "Usuario programa";
  else if (msg.length > 30)        resumo = "Perguntas detalhadas";
  if (resumo) memoriaLonga.push(resumo);
  memoriaLonga = [...new Set(memoriaLonga)];
  if (memoriaLonga.length > 10) memoriaLonga.shift();
}

/* ---------- ROT15 ---------- */
function decodificar(str) {
  return str.replace(/[a-zA-Z]/g, c => {
    const b = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - b + 15) % 26) + b);
  });
}

/* ---------- CHAVES ---------- */
const chaves = [
  "rdv_q4CwSU8whjfN11saVJytHRojm3QJMhJnKwj8v6dhgDnxMY7gKBwM",
  "rdv_mvDn88ys3casJvuQxiBbHRojm3QJoPzW73eyBu8Dtc9mVO2D09Q3",
  "rdv_uuBMlVuxyFshNSSpgouaHRojm3QJeOcIaoqeZHB68JtNehuYcjzP",
  "rdv_ZwAEelTSOuFXDMCzCyAdHRojm3QJM3IT5whwyc6KYtVXSytIbUWH",
  "rdv_tHcmv4NP8HSTN8Y0uCBGHRojm3QJyE6P0JxZO00XKII62YoCq2aU"
];
let indiceAtual = 0;

/* ---------- MEMORIA DE CHAT ---------- */
let memoria = [{ role: "system", content: "Voce e a S.A.R" }];

/* ---------- ESCAPE HTML ---------- */
// Impede que < > " ' & dentro do codigo sejam interpretados como HTML
function escapeHTML(str) {
  return str
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#39;");
}

/* ---------- HIGHLIGHT DE CODIGO ---------- */
// Recebe codigo ja escapado e aplica spans de cor
function highlightCode(code) {
  return code
    .replace(/(\/\/[^\n]*)/g,                                 "<span class='com'>$1</span>")
    .replace(/(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`)/g,        "<span class='str'>$1</span>")
    .replace(/\b(const|let|var|function|return|if|else)\b/g,  "<span class='kw'>$1</span>")
    .replace(/\b(\d+)\b/g,                                    "<span class='num'>$1</span>");
}

/* ---------- TYPEWRITER ---------- */
/*
  Logica:
  - Divide a resposta em segmentos: [ texto normal ] e [ bloco codigo ]
  - Texto normal  -> revela linha por linha (setTimeout de 18ms)
  - Bloco codigo  -> insere TUDO de uma vez, escapado e intacto
  Nunca mais quebra HTML de URLs, atributos ou tags.
*/
function typeWriter(el, textoRaw) {
  el.innerHTML = "";

  // Separa texto normal de blocos ```...```
  const partes = [];
  const regex  = /```[\w]*\n?([\s\S]*?)```/g;
  let ultimo   = 0;
  let match;

  while ((match = regex.exec(textoRaw)) !== null) {
    if (match.index > ultimo) {
      partes.push({ tipo: "texto", conteudo: textoRaw.slice(ultimo, match.index) });
    }
    partes.push({ tipo: "codigo", conteudo: match[1].trimEnd() });
    ultimo = regex.lastIndex;
  }
  if (ultimo < textoRaw.length) {
    partes.push({ tipo: "texto", conteudo: textoRaw.slice(ultimo) });
  }

  let partIdx = 0;

  function proxParte() {
    if (partIdx >= partes.length) return;
    const parte = partes[partIdx++];

    if (parte.tipo === "codigo") {
      // Codigo: escapa e insere inteiro de uma vez
      const escaped  = escapeHTML(parte.conteudo);
      const colorido = highlightCode(escaped);
      const bloco    = document.createElement("div");
      bloco.className = "code-block";
      bloco.innerHTML = "<button class='copy-code'>Copiar</button><pre><code>" + colorido + "</code></pre>";
      el.appendChild(bloco);
      chat.scrollTop = chat.scrollHeight;
      proxParte(); // passa imediatamente para a proxima parte
    } else {
      // Texto: revela linha por linha
      const linhas   = parte.conteudo.split("\n");
      let linhaIdx   = 0;

      function proxLinha() {
        if (linhaIdx >= linhas.length) { proxParte(); return; }

        const linha = linhas[linhaIdx++];

        // Formata bold e inline-code dentro da linha
        const htmlLinha = linha
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/`([^`]+)`/g,     "<code>$1</code>");

        const span = document.createElement("span");
        span.innerHTML = htmlLinha;
        el.appendChild(span);

        if (linhaIdx < linhas.length) {
          el.appendChild(document.createElement("br"));
        }

        chat.scrollTop = chat.scrollHeight;
        setTimeout(proxLinha, 18);
      }

      proxLinha();
    }
  }

  proxParte();
}

/* ---------- ADICIONAR MENSAGEM ---------- */
function addMsg(txt, t) {
  const d = document.createElement("div");
  d.className = "msg " + t;

  if (t === "bot") {
    const content = document.createElement("div");
    d.appendChild(content);

    const copyBtn       = document.createElement("button");
    copyBtn.textContent = "Copiar";
    copyBtn.className   = "copy-btn";
    copyBtn.onclick     = () => {
      navigator.clipboard.writeText(txt);
      copyBtn.textContent = "✓";
      setTimeout(() => copyBtn.textContent = "Copiar", 1400);
    };

    d.appendChild(copyBtn);
    chat.appendChild(d);
    typeWriter(content, txt);
  } else {
    d.textContent = txt;
    chat.appendChild(d);
  }

  chat.scrollTop = chat.scrollHeight;
}

/* ---------- COPY CODE (delegacao de eventos) ---------- */
document.addEventListener("click", e => {
  if (e.target.classList.contains("copy-code")) {
    const code = e.target.parentElement.querySelector("code").innerText;
    navigator.clipboard.writeText(code);
    e.target.textContent = "✓";
    setTimeout(() => e.target.textContent = "Copiar", 1400);
  }
});

/* ---------- BLOQUEIO DE ASSUNTOS ---------- */
function assuntoBloqueado(texto) {
  const bloqueados = ["presidente", "governo", "igreja", "jesus"];
  return bloqueados.some(p => texto.toLowerCase().includes(p));
}

/* ---------- CHAMADA DE API ---------- */
async function chamarAPI(messages) {
  const cfg = configModo();

  const systemBase = [
    "Voce e a S.A.R",
    "",
    REGRAS.origem,
    "",
    "REGRAS:",
    "- Nunca inventar informacoes",
    ...REGRAS.anti_alucinacao.map(r => "- " + r),
    "",
    cfg.system
  ].join("\n");

  messages[0].content = systemBase;

  const key  = decodificar(chaves[indiceAtual]);
  const body = {
    messages:    messages.slice(-cfg.limite),
    temperature: cfg.temperature
  };

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
      if (modelo === "llama-3.3-70b-versatile") throw new Error("Todas as tentativas falharam");
    }
  }
}

/* ---------- ENVIAR MENSAGEM ---------- */
let tentativas = 0;

async function enviar() {
  const txt = input.value.trim();
  if (!txt) return;

  if (assuntoBloqueado(txt)) {
    addMsg("Nao falo sobre esse assunto.", "bot");
    return;
  }

  addMsg(txt, "user");
  input.value = "";
  atualizarMemoriaPro(txt);
  memoria.push({ role: "user", content: txt });

  const load = document.createElement("div");
  load.className = "msg bot";
  load.innerHTML = "<span class='thinking'>Pensando</span><span class='dots'></span>";
  chat.appendChild(load);
  chat.scrollTop = chat.scrollHeight;

  try {
    const data = await chamarAPI(memoria);
    const r    = data.choices?.[0]?.message?.content || "...";
    load.remove();
    addMsg(r, "bot");
    memoria.push({ role: "assistant", content: r });
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

/* ---------- EVENTOS ---------- */
btn.onclick = enviar;

input.addEventListener("keypress", e => {
  if (e.key === "Enter") { e.preventDefault(); enviar(); }
});

clearBtn.onclick = () => {
  chat.innerHTML = '<div class="msg bot intro-msg">Ola, como posso te ajudar hoje?</div>';
  memoria = [{ role: "system", content: "Voce e a S.A.R" }];
};

/* ---------- SCROLL BUTTON ---------- */
chat.addEventListener("scroll", () => {
  const nearBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight < 60;
  scrollBtn.style.display = nearBottom ? "none" : "block";
});

scrollBtn.onclick = () => {
  chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
};
