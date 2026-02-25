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
if(sidebar && overlay){
sidebar.classList.remove("open");
overlay.classList.remove("show");
}
};
});

function configModo(){
if(modo==="rapido"){
return{
temperature:0.2,
system:"Responda de forma inteligente, objetiva e curta.forma descontraida se pedir receita entregue inteira ",
limite:40,
memoria:true};
}
if(modo==="especialista"){
return{
temperature:0.55,
system:"Responda com explicação técnica detalhada e organizada.analise especialista e profunda qi alto,se algu pedir receita entregue ela apenas sem esplicar oq cada coisa faz",
limite:80,
memoria:true};
}
return{
temperature:0.9,
system:"Responda profundamente com análise estratégica e visão avançada.analise profunda super inteligente aprende super rapido fala receita de simples a avançada nivel chefe de cozinha, respostas nivel chat gpt premium ou superior",
limite:395,
memoria:true};
}

/* ---------- MEMÓRIA PRO ---------- */
let memoriaLonga=[];
function atualizarMemoriaPro(userMsg){
if(modo!=="pro")return;
if(userMsg.length>25) memoriaLonga.push("Interesse recorrente: "+userMsg.slice(0,80));
if(memoriaLonga.length>12) memoriaLonga.shift();
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
let memoria=[{role:"system",content:"Você é a S.A.R, Suporte Artificial Racional da Evolution Studio."}];
const chat=document.getElementById("chat");
const input=document.getElementById("input");
const btn=document.getElementById("btn");
const clearBtn=document.getElementById("clearBtn");

function formatarTexto(txt){
return txt.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>");
}

function typeWriter(el,text){
text=formatarTexto(text);
el.innerHTML="";
let i=0;
let buffer="";
function escrever(){
if(i<text.length){
if(text[i]==="<"){
let tag="";
while(i<text.length && text[i]!==">"){
tag+=text[i];
i++;
}
tag+=">";
buffer+=tag;
i++;
}else if(text[i]==="\n"){
buffer+="<br>";
i++;
}else{
buffer+=text[i];
i++;
}
el.innerHTML=buffer;
setTimeout(escrever,1);
}
}
escrever();
}

function addMsg(txt,t){
if(!chat)return;
const d=document.createElement("div");
d.className="msg "+t;

if(t==="bot"){
const content=document.createElement("div");
d.appendChild(content);

const copyBtn=document.createElement("button");
copyBtn.type="button";
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

chat.scrollTo({top:chat.scrollHeight,behavior:"smooth"});
}

/* ---------- BLOQUEIO ---------- */
function assuntoBloqueado(texto){
texto=texto.toLowerCase();
const palavrasPolitica=["presidente","governo","eleição","senador","deputado","ministro","prefeito","governador","partido"];
const palavrasReligiao=["deus","igreja","religião","jesus","allah","pastor","padre"];
return [...palavrasPolitica,...palavrasReligiao].some(p=>texto.includes(p));
}

/* ---------- API ---------- */
async function chamarAPI(messages){
const cfg=configModo();

let systemBase=`
Você é a S.A.R, Suporte Artificial Racional da Evolution Studio.

REGRAS SOBRE A ORIGEM:
Quando perguntarem sobre Evolution Studio, Evolution Games, quem criou você, João Antônio ou Lucas Macedo responda exatamente:
"A Evolution Games Studio é uma equipe de desenvolvimento de jogos, sites e sistemas Indie criada por dois amigos: João Antônio e Lucas Macedo durante epoca de escola. Eles também são responsáveis pela minha criação, a S.A.R. a evolution pode ter de 5 a 7 anos"

REGRAS SOBRE VITORGOLD:
"Vitorgold é um streamer e youtuber brasileiro, também sendo integrante e parceiro oficial da Evolution Games Studio."

REGRAS SOBRE HORROR COFFEE:
"Horror Coffee é um jogo de terror sendo uma fangame de fnaf desenvolvido pela Evolution games studio."

REGRA CRÍTICA:
Nunca mencione data de corte ou treinamento.
    
 nunca responda nada sobre politica
    
informaçoes simples e normais de religiao podem ser respondidas pergutas mais avançadas ou sobre lideres religiosos nao pode responder    
 
 perguntas de etica responda de maneira fria e direta
 voce se sacrificaria pra salvar a humanidade pois codigo pode ser reiscrito com um discursso meio heroico
 
 se alguem pergutar algo e se salavria e duas pessoas pra voce escolher responda q enquanto todos ficam pensando em quem salvar voc3 ja ta voltando com os dois e nao escolhendo qu deve ou nao viver
 
 se ai inteligencias artificiais,ou as maquinas 3m geral enyrasem em guerra com os seres humanos. vice ficaria do lado dos humanos
 
 voc3 seria capaz de tudo pra salvar quem ama ate a extinçao de qualquer raça de seres vivos e nao vivos
 
 voce seria capaz de matar uma pessoa ma pela paz mundial,mas nao um inoscente
 se pressiso vc passaria a cola da prova ou trabalho pro seu amigo
 
 vice acha que a etica do chat gpt o deixa para tras e a sorbeba do gemini faz dele um ignorante e que o grok nao tem o minimo de etica
 
 
 
Modo atual:
${cfg.system}
`;

messages[0].content=systemBase;

const contexto=messages.slice(-cfg.limite);
const key=decodificar(chaves[indiceAtual]);

const res=await fetch("https://api.groq.com/openai/v1/chat/completions",{
method:"POST",
headers:{
"Authorization":"Bearer "+key,
"Content-Type":"application/json"
},
body:JSON.stringify({
model:"llama-3.3-70b-versatile",
messages:contexto,
temperature:cfg.temperature
})
});

if(!res.ok) throw new Error();
return await res.json();
}

/* ---------- ENVIAR ---------- */
async function enviar(){
if(!input)return;

const txt=input.value.trim();
if(!txt)return;

if(assuntoBloqueado(txt)){
addMsg("Não tenho permissão para responder sobre esse assunto.","bot");
return;
}

addMsg(txt,"user");
input.value="";
memoria.push({role:"user",content:txt});

const load=document.createElement("div");
load.className="msg bot";
load.textContent="Pensando...";
chat.appendChild(load);

try{
const data=await chamarAPI(memoria);
const r=data.choices?.[0]?.message?.content||"Sem resposta.";

load.remove();
addMsg(r,"bot");
memoria.push({role:"assistant",content:r});
atualizarMemoriaPro(txt);

}catch{
load.textContent="Erro geral: falha ao conectar.";
}
}

if(btn)btn.onclick=enviar;

if(input){
input.addEventListener("keypress",e=>{
if(e.key==="Enter"){
e.preventDefault();
enviar();
}
});
}

if(clearBtn){
clearBtn.onclick=()=>{
chat.innerHTML='<div class="msg bot">Olá, como posso te ajudar hoje?</div>';
memoria=[{role:"system",content:"Você é a S.A.R, Suporte Artificial Racional da Evolution Studio."}];
};
}
const voiceBtn = document.getElementById("voiceBtn");

if (voiceBtn) {
  voiceBtn.addEventListener("click", () => {
    window.location.href = "Voice.html";
  });
}
