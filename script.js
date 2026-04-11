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
      "sacrifício pela humanidade"
    ]
  },

  modo: {
    rapido: "Responda de forma inteligente, objetiva e curta. Forma descontraída.",
    especialista: "Responda com explicação técnica detalhada e organizada.",
    pro: "Responda profundamente com análise estratégica e visão avançada."
  }
};
/* ---------- SIDEBAR ---------- */
const sidebar=document.getElementById("sidebar");
const overlay=document.getElementById("overlay");
const tituloSAR=document.getElementById("tituloSAR");
const menuBtn=document.getElementById("menuBtn");

if(menuBtn && sidebar && overlay){
menuBtn.onclick=()=>{
sidebar.classList.toggle("open");
overlay.classList.toggle("show");
};
overlay.onclick=()=>{
sidebar.classList.remove("open");
overlay.classList.remove("show");
};
}

/* ---------- MODOS ---------- */
let modo=localStorage.getItem("modoSAR")||"rapido";
const modoOptions=document.querySelectorAll(".modo-option");

function atualizarUI(){
if(!tituloSAR)return;

tituloSAR.classList.add("modo-animacao");
setTimeout(()=>tituloSAR.classList.remove("modo-animacao"),250);

modoOptions.forEach(opt=>{
opt.classList.remove("active");
if(opt.dataset.modo===modo) opt.classList.add("active");
});

if(modo==="rapido"){
tituloSAR.style.background="none";
tituloSAR.style.color="#a855f7";
tituloSAR.style.webkitTextFillColor="currentColor";
tituloSAR.style.animation="none";
}else if(modo==="especialista"){
tituloSAR.style.background="none";
tituloSAR.style.color="#3b82f6";
tituloSAR.style.webkitTextFillColor="currentColor";
tituloSAR.style.animation="none";
}else{
tituloSAR.style.background="linear-gradient(270deg,#a855f7,#3b82f6,#a855f7)";
tituloSAR.style.backgroundSize="600% 600%";
tituloSAR.style.webkitBackgroundClip="text";
tituloSAR.style.webkitTextFillColor="transparent";
tituloSAR.style.animation="gradientePro 3s ease infinite";
}
}
atualizarUI();

modoOptions.forEach(opt=>{
opt.onclick=()=>{
modo=opt.dataset.modo;
localStorage.setItem("modoSAR",modo);
atualizarUI();
sidebar.classList.remove("open");
overlay.classList.remove("show");
};
});

function configModo(){
if(modo==="rapido"){
return{temperature:0.2,system:REGRAS?.modo?.rapido||"",limite:40};
}
if(modo==="especialista"){
return{temperature:0.55,system:REGRAS?.modo?.especialista||"",limite:80};
}
return{temperature:0.7,system:REGRAS?.modo?.pro||"",limite:395};
}

/* ---------- MEMÓRIA PRO ---------- */
let memoriaLonga=[];

function atualizarMemoriaPro(userMsg){
if(modo!=="pro") return;

const msg=userMsg.toLowerCase();
let resumo="";

if(msg.includes("jogo")) resumo="Usuário gosta de jogos";
else if(msg.includes("código")) resumo="Usuário programa";
else if(msg.length>30) resumo="Perguntas detalhadas";

if(resumo) memoriaLonga.push(resumo);

memoriaLonga=[...new Set(memoriaLonga)];
if(memoriaLonga.length>10) memoriaLonga.shift();
}

/* ---------- ROT15 ---------- */
function decodificar(str){
return str.replace(/[a-zA-Z]/g,c=>{
const b=c<="Z"?65:97;
return String.fromCharCode(((c.charCodeAt(0)-b+15)%26)+b);
});
}

/* ---------- CHAVES ---------- */
const chaves=[
"rdv_q4CwSU8whjfN11saVJytHRojm3QJMhJnKwj8v6dhgDnxMY7gKBwM",
"rdv_mvDn88ys3casJvuQxiBbHRojm3QJoPzW73eyBu8Dtc9mVO2D09Q3",
"rdv_uuBMlVuxyFshNSSpgouaHRojm3QJeOcIaoqeZHB68JtNehuYcjzP",
"rdv_ZwAEelTSOuFXDMCzCyAdHRojm3QJM3IT5whwyc6KYtVXSytIbUWH",
"rdv_tHcmv4NP8HSTN8Y0uCBGHRojm3QJyE6P0JxZO00XKII62YoCq2aU"
];
let indiceAtual=0;

/* ---------- CHAT ---------- */
let memoria=[{role:"system",content:"Você é a S.A.R"}];
const chat=document.getElementById("chat");
const input=document.getElementById("input");
const btn=document.getElementById("btn");
const clearBtn=document.getElementById("clearBtn");

/* ---------- HIGHLIGHT ---------- */
function highlightCode(code){
return code
// comentários primeiro
.replace(/(\/\/.*)/g,"<span class='com'>$1</span>")

// strings depois
.replace(/(["'`].*?["'`])/g,"<span class='str'>$1</span>")

// palavras-chave (corrigido)
.replace(/\b(const|let|var|function|return|if|else)\b/g,"<span class='kw'>$1</span>")

// números
.replace(/\b(\d+)\b/g,"<span class='num'>$1</span>");
}

/* ---------- FORMATADOR ---------- */
function formatarTexto(txt){
return txt
.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
.replace(/```([\s\S]*?)```/g,(_,code)=>`
<div class="code-block">
<button class="copy-code">Copiar</button>
<pre><code>${highlightCode(code)}</code></pre>
</div>`)
.replace(/`(.*?)`/g,"<code>$1</code>");
}

/* ---------- TYPEWRITER ---------- */
function typeWriter(el,text){
text=formatarTexto(text);
el.innerHTML="";
let i=0,buffer="";
function escrever(){
if(i<text.length){
if(text[i]==="<"){
let tag="";
while(i<text.length&&text[i]!==">"){tag+=text[i];i++;}
tag+=">";buffer+=tag;i++;
}else if(text[i]==="\n"){buffer+="<br>";i++;}
else{buffer+=text[i];i++;}
el.innerHTML=buffer;
requestAnimationFrame(escrever);
}}
escrever();
}

/* ---------- ADD MSG ---------- */
function addMsg(txt,t){
const d=document.createElement("div");
d.className="msg "+t;

if(t==="bot"){
const content=document.createElement("div");
d.appendChild(content);

const copyBtn=document.createElement("button");
copyBtn.textContent="Copiar";
copyBtn.className="copy-btn";
copyBtn.onclick=()=>{
navigator.clipboard.writeText(txt);
copyBtn.textContent="✓";
setTimeout(()=>copyBtn.textContent="Copiar",1200);
};

d.appendChild(copyBtn);
chat.appendChild(d);
typeWriter(content,txt);
}else{
d.textContent=txt;
chat.appendChild(d);
}

chat.scrollTop=chat.scrollHeight;
}

/* ---------- COPY CODE ---------- */
document.addEventListener("click",e=>{
if(e.target.classList.contains("copy-code")){
const code=e.target.parentElement.querySelector("code").innerText;
navigator.clipboard.writeText(code);
e.target.textContent="✓";
setTimeout(()=>e.target.textContent="Copiar",1200);
}
});

/* ---------- BLOQUEIO ---------- */
function assuntoBloqueado(texto){
texto=texto.toLowerCase();
return ["presidente","governo","igreja","jesus"].some(p=>texto.includes(p));
}

/* ---------- API ---------- */
async function chamarAPI(messages){
const cfg=configModo();

let systemBase=`
Você é a S.A.R

${REGRAS.origem||""}

REGRAS:
- Nunca inventar informações
${REGRAS.anti_alucinacao?.join("\n")||""}

${cfg.system}
`;

messages[0].content=systemBase;

const key=decodificar(chaves[indiceAtual]);

let modelo="llama-3.3-70b-versatile";

try{
const res=await fetch("https://api.groq.com/openai/v1/chat/completions",{
method:"POST",
headers:{
"Authorization":"Bearer "+key,
"Content-Type":"application/json"
},
body:JSON.stringify({
model:modelo,
messages:messages.slice(-cfg.limite),
temperature:cfg.temperature
})
});

if(!res.ok) throw new Error();
return await res.json();

}catch{
modelo="llama-3.3-70b-versatile";

const res=await fetch("https://api.groq.com/openai/v1/chat/completions",{
method:"POST",
headers:{
"Authorization":"Bearer "+key,
"Content-Type":"application/json"
},
body:JSON.stringify({
model:modelo,
messages:messages.slice(-cfg.limite),
temperature:cfg.temperature
})
});

return await res.json();
}
}

/* ---------- ENVIAR ---------- */
let tentativas=0;

async function enviar(){
const txt=input.value.trim();
if(!txt)return;

if(assuntoBloqueado(txt)){
addMsg("Não permitido.","bot");
return;
}

addMsg(txt,"user");
input.value="";

memoria.push({role:"user",content:txt});

const load=document.createElement("div");
load.className="msg bot";
load.innerHTML="<span class='thinking'>Pensando</span><span class='dots'></span>";
chat.appendChild(load);

try{
const data=await chamarAPI(memoria);
const r=data.choices?.[0]?.message?.content||"...";

load.remove();
addMsg(r,"bot");
memoria.push({role:"assistant",content:r});
tentativas=0;

}catch{
if(tentativas<3){
tentativas++;
setTimeout(enviar,2000);
}else{
load.textContent="Erro.";
}
}
}

btn.onclick=enviar;
input.addEventListener("keypress",e=>{
if(e.key==="Enter"){e.preventDefault();enviar();}
});

clearBtn.onclick=()=>{
chat.innerHTML='<div class="msg bot">Olá, como posso te ajudar hoje?</div>';
memoria=[{role:"system",content:"Você é a S.A.R"}];
};

/* ---------- SCROLL BUTTON ---------- */
const scrollBtn=document.getElementById("scrollBtn");

chat.addEventListener("scroll",()=>{
const nearBottom=chat.scrollHeight-chat.scrollTop-chat.clientHeight<40;
scrollBtn.style.display=nearBottom?"none":"block";
});

scrollBtn.onclick=()=>{
chat.scrollTo({top:chat.scrollHeight,behavior:"smooth"});
};
