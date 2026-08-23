// ===================================================
// Quadro de Estudos — lógica
// ===================================================

const campoMateria = document.getElementById('campoMateria');
const campoTipo    = document.getElementById('campoTipo');
const addBtn       = document.getElementById('addBtn');
const limparBtn    = document.getElementById('limparBtn');
const cartoesEl    = document.getElementById('cartoes');
const vazioMsg     = document.getElementById('vazioMsg');
const resumoEl     = document.getElementById('resumo');
const numMaterias  = document.getElementById('numMaterias');
const numSessoes   = document.getElementById('numSessoes');
const numHoras     = document.getElementById('numHoras');
const semanaWrap   = document.getElementById('semanaWrap');
const semanaGrade  = document.getElementById('semanaGrade');
const planoWrap    = document.getElementById('planoWrap');
const planoLista   = document.getElementById('planoLista');

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const CORES = ['yellow', 'pink', 'blue', 'mint', 'coral', 'lilac'];

// perfis de estudo por palavra-chave no "tipo" digitado
const PERFIS = [
  {
    chave: ['zero', 'iniciante', 'nunca vi', 'começar'],
    nome: 'Do zero', sessoes: 3, duracao: 50,
    tecnica: 'Estudo ativo: primeiro entenda o conceito com exemplos simples, depois refaça sem olhar e crie um resumo esquemático.',
    etapas: ['Assistir/ler a explicação do conceito', 'Refazer 3 exemplos junto com a explicação', 'Fazer um resumo esquemático próprio', 'Resolver 5 exercícios simples sozinho']
  },
  {
    chave: ['reforç', 'reforc', 'dificuldade', 'fraco'],
    nome: 'Reforço', sessoes: 2, duracao: 45,
    tecnica: 'Foque nos erros recorrentes: refaça exercícios que você já errou antes, entendendo o motivo de cada erro.',
    etapas: ['Listar os 3 erros mais comuns', 'Revisar a teoria só dessas partes', 'Fazer exercícios direcionados', 'Repetir os que ainda errar']
  },
  {
    chave: ['revis', 'relembrar', 'manter'],
    nome: 'Revisão', sessoes: 2, duracao: 30,
    tecnica: 'Revisão espaçada com flashcards: revise em intervalos crescentes para fixar na memória de longo prazo.',
    etapas: ['Criar flashcards dos pontos-chave', 'Revisar os flashcards', 'Resolver 3 questões rápidas', 'Anotar o que ainda travou']
  },
  {
    chave: ['prova', 'teste em breve', 'amanhã', 'semana que vem'],
    nome: 'Prova em breve', sessoes: 4, duracao: 40,
    tecnica: 'Simulados cronometrados todos os dias, revisando imediatamente cada erro logo depois.',
    etapas: ['Simulado cronometrado curto', 'Corrigir e entender cada erro', 'Revisar só os pontos fracos', 'Repetir questões parecidas']
  },
  {
    chave: ['enem', 'vestibular', 'fuvest'],
    nome: 'Enem / Vestibular', sessoes: 3, duracao: 60,
    tecnica: 'Questões de provas anteriores + treino de tempo, unindo teoria com prática de banca.',
    etapas: ['Revisar teoria do tópico do dia', 'Resolver questões de provas anteriores', 'Cronometrar o tempo de resposta', 'Praticar redação/argumentação quando fizer sentido']
  },
  {
    chave: ['redaç', 'redac', 'trabalho', 'texto', 'tcc', 'artigo'],
    nome: 'Redação / Trabalho', sessoes: 2, duracao: 50,
    tecnica: 'Divida em etapas: pesquisa, estrutura (introdução, desenvolvimento, conclusão) e depois escrita corrida.',
    etapas: ['Pesquisar e organizar ideias', 'Montar a estrutura/esqueleto do texto', 'Escrever um rascunho sem parar para corrigir', 'Revisar clareza, coesão e ortografia']
  }
];

const PERFIL_PADRAO = {
  nome: 'Estudo geral', sessoes: 2, duracao: 40,
  tecnica: 'Sessões curtas e frequentes rendem mais que uma única maratona. Alterne teoria e prática.',
  etapas: ['Ler/assistir o conteúdo do dia', 'Fazer anotações próprias', 'Resolver exercícios relacionados', 'Revisar o que ficou confuso']
};

let materias = []; // { materia, tipoTexto, perfil, cor }

function detectarPerfil(tipoTexto) {
  const t = tipoTexto.toLowerCase();
  for (const p of PERFIS) {
    if (p.chave.some(k => t.includes(k))) return p;
  }
  return PERFIL_PADRAO;
}

function adicionarMateria() {
  const materia = campoMateria.value.trim();
  const tipoTexto = campoTipo.value.trim();
  if (!materia) { campoMateria.focus(); return; }

  const perfil = detectarPerfil(tipoTexto || '');
  const cor = CORES[materias.length % CORES.length];

  materias.push({
    materia,
    tipoTexto: tipoTexto || perfil.nome,
    perfil,
    cor,
    rot: (Math.random() * 4 - 2).toFixed(1)
  });

  campoMateria.value = '';
  campoTipo.value = '';
  campoMateria.focus();
  render();
}

function removerMateria(i) {
  materias.splice(i, 1);
  render();
}

function limparTudo() {
  if (materias.length && !confirm('Apagar todas as matérias do quadro?')) return;
  materias = [];
  render();
}

// ---- renderização ----
function render() {
  renderCartoes();
  renderResumo();
  renderSemana();
  renderPlano();
}

function renderCartoes() {
  cartoesEl.innerHTML = '';
  vazioMsg.style.display = materias.length ? 'none' : 'block';

  materias.forEach((m, i) => {
    const card = document.createElement('div');
    card.className = 'cartao';
    card.style.setProperty('--cor', `var(--${m.cor})`);
    card.style.setProperty('--rot', `${m.rot}deg`);
    card.innerHTML = `
      <button class="cartao-remover" aria-label="Remover">✕</button>
      <span class="cartao-materia">${escapeHtml(m.materia)}</span>
      <span class="cartao-tipo">${escapeHtml(m.tipoTexto)}</span>
    `;
    card.querySelector('.cartao-remover').addEventListener('click', () => removerMateria(i));
    cartoesEl.appendChild(card);
  });
}

function renderResumo() {
  if (!materias.length) { resumoEl.hidden = true; return; }
  resumoEl.hidden = false;
  const totalSessoes = materias.reduce((s, m) => s + m.perfil.sessoes, 0);
  const totalMin = materias.reduce((s, m) => s + m.perfil.sessoes * m.perfil.duracao, 0);
  numMaterias.textContent = materias.length;
  numSessoes.textContent = totalSessoes;
  numHoras.textContent = (totalMin / 60).toFixed(1).replace('.0', '') + 'h';
}

function renderSemana() {
  if (!materias.length) { semanaWrap.hidden = true; return; }
  semanaWrap.hidden = false;

  // distribui sessões pelos dias, evitando empilhar tudo no mesmo dia
  const diasSlots = DIAS.map(() => []); // cada dia guarda blocos {materia, cor, hora}
  const horaBase = {}; // controla próximo horário livre por dia

  let cursorDia = 0;
  materias.forEach(m => {
    for (let s = 0; s < m.perfil.sessoes; s++) {
      const dia = cursorDia % 7;
      const horaAtual = horaBase[dia] ?? 19; // começa 19h
      diasSlots[dia].push({
        materia: m.materia,
        cor: m.cor,
        hora: formatarHora(horaAtual),
        duracao: m.perfil.duracao
      });
      horaBase[dia] = horaAtual + Math.ceil(m.perfil.duracao / 60 * 10) / 10;
      cursorDia++;
    }
  });

  semanaGrade.innerHTML = '';
  DIAS.forEach((nome, i) => {
    const col = document.createElement('div');
    col.className = 'dia-coluna';
    const blocos = diasSlots[i].map(b => `
      <div class="bloco-sessao" style="background:var(--${b.cor})">
        ${escapeHtml(b.materia)}
        <span class="bloco-hora">${b.hora} · ${b.duracao}min</span>
      </div>
    `).join('');
    col.innerHTML = `<span class="dia-nome">${nome}</span>${blocos}`;
    semanaGrade.appendChild(col);
  });
}

function formatarHora(h) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function renderPlano() {
  if (!materias.length) { planoWrap.hidden = true; return; }
  planoWrap.hidden = false;

  planoLista.innerHTML = materias.map(m => `
    <div class="plano-card" style="--cor:var(--${m.cor})">
      <div class="plano-card-topo">
        <span class="plano-materia">${escapeHtml(m.materia)}</span>
        <span class="plano-tipo">${escapeHtml(m.perfil.nome)}</span>
      </div>
      <div class="plano-meta">${m.perfil.sessoes}x por semana · ${m.perfil.duracao}min por sessão · ${(m.perfil.sessoes * m.perfil.duracao / 60).toFixed(1).replace('.0','')}h/semana</div>
      <p class="plano-tecnica"><b>Técnica:</b> ${escapeHtml(m.perfil.tecnica)}</p>
      <div class="plano-etapas">
        ${m.perfil.etapas.map((e, idx) => `<div class="plano-etapa"><span class="num">${idx + 1}.</span>${escapeHtml(e)}</div>`).join('')}
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- eventos ----
addBtn.addEventListener('click', adicionarMateria);
[campoMateria, campoTipo].forEach(el => {
  el.addEventListener('keydown', e => { if (e.key === 'Enter') adicionarMateria(); });
});
document.querySelectorAll('.sug').forEach(b => {
  b.addEventListener('click', () => {
    campoTipo.value = b.dataset.tipo;
    campoMateria.focus();
  });
});
limparBtn.addEventListener('click', limparTudo);

render();
