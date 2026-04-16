/**
 * FFV Academy — Game Engine
 * Motor de gamificação: XP, níveis, streak, badges, progresso
 * Tudo em localStorage — 100% client-side
 */

'use strict';

const ENGINE_KEY = 'ffv_academy';

// ─── Estrutura de dados base ───────────────────────────────
const DEFAULT_STATE = {
  xp: 0,
  level: 1,
  streak: 0,
  lastStudyDate: null,
  completedModules: [],   // slugs dos módulos concluídos
  quizScores: {},         // { slug: { score, total, perfect } }
  badges: [],             // ids das badges desbloqueadas
  totalStudyTime: 0,      // em minutos
  startedAt: null,
};

// ─── Configuração de níveis ────────────────────────────────
const LEVELS = [
  { level: 1, name: 'Curioso',        xpMin: 0,    xpMax: 100,  color: '#8b949e', icon: '🌱' },
  { level: 2, name: 'Aprendiz',       xpMin: 100,  xpMax: 250,  color: '#58a6ff', icon: '📚' },
  { level: 3, name: 'Praticante',     xpMin: 250,  xpMax: 500,  color: '#3fb950', icon: '⚡' },
  { level: 4, name: 'Desenvolvedor',  xpMin: 500,  xpMax: 800,  color: '#ffa657', icon: '🔧' },
  { level: 5, name: 'Especialista',   xpMin: 800,  xpMax: 1200, color: '#d2a8ff', icon: '🧠' },
  { level: 6, name: 'Arquiteto de IA',xpMin: 1200, xpMax: 1800, color: '#f78166', icon: '🏗️' },
  { level: 7, name: 'Mestre da IA',   xpMin: 1800, xpMax: 9999, color: '#ffa657', icon: '🚀' },
];

// ─── Badges disponíveis ────────────────────────────────────
const BADGES_DEF = [
  { id: 'first_step',    name: 'Primeiro Passo',    icon: '👣', desc: 'Completou seu primeiro módulo',          xpBonus: 10 },
  { id: 'quiz_perfect',  name: 'Gabarito',           icon: '🎯', desc: 'Acertou todas as questões de um quiz',  xpBonus: 20 },
  { id: 'streak_3',      name: '3 Dias Seguidos',    icon: '🔥', desc: '3 dias de estudo consecutivos',         xpBonus: 30 },
  { id: 'streak_7',      name: 'Semana Perfeita',    icon: '💪', desc: '7 dias de estudo consecutivos',         xpBonus: 75 },
  { id: 'streak_30',     name: 'Mês Dedicado',       icon: '🏆', desc: '30 dias de estudo consecutivos',        xpBonus: 200 },
  { id: 'trail1_done',   name: 'Fundamentos Sólidos',icon: '🏅', desc: 'Completou a Trilha 1 completa',         xpBonus: 100 },
  { id: 'trail2_done',   name: 'Arquitetura Profunda',icon:'🥇', desc: 'Completou a Trilha 2 completa',         xpBonus: 150 },
  { id: 'all_done',      name: 'Mestre Completo',    icon: '👑', desc: 'Completou TODAS as trilhas',             xpBonus: 300 },
  { id: 'speed_run',     name: 'Speed Run',          icon: '⚡', desc: 'Completou 3 módulos no mesmo dia',      xpBonus: 50  },
  { id: 'curious',       name: 'Muito Curioso',      icon: '🔍', desc: 'Revisitou um módulo já concluído',      xpBonus: 5   },
];

// ─── Currículo completo — ordem sequencial ─────────────────
const CURRICULUM = {
  trails: [
    {
      id: 'trail1',
      name: 'Fundamentos da IA',
      color: '#58a6ff',
      icon: '🧠',
      desc: 'Do zero ao LLM — entenda como a IA realmente funciona',
      modules: [
        {
          slug: 'o-que-e-ia',
          title: 'O que é Inteligência Artificial?',
          icon: '🤖',
          xp: 30,
          readTime: 6,
          desc: 'Do conceito à realidade: o que é IA, o que não é, e por que você precisa entender isso agora.',
          seoDesc: 'Entenda o que é Inteligência Artificial de verdade, sem buzzwords. Definição clara, exemplos práticos e histórico.',
          keywords: 'o que é inteligencia artificial, IA para iniciantes, definição IA',
        },
        {
          slug: 'dados-o-combustivel',
          title: 'Dados: o Combustível da IA',
          icon: '⛽',
          xp: 30,
          readTime: 7,
          desc: 'Por que "dados são o novo petróleo" — e o que isso significa na prática para treinar um modelo.',
          seoDesc: 'Entenda por que dados são essenciais para a IA funcionar, como datasets são criados e o que é qualidade de dados.',
          keywords: 'dados inteligencia artificial, dataset machine learning, treinamento IA',
        },
        {
          slug: 'como-ia-aprende',
          title: 'Como a IA Aprende (Machine Learning)',
          icon: '📈',
          xp: 40,
          readTime: 8,
          desc: 'Gradiente descendente, loss function, backpropagation — explicados sem complicar.',
          seoDesc: 'Como machine learning funciona na prática: treinamento, gradiente descendente e otimização explicados de forma simples.',
          keywords: 'como machine learning funciona, gradiente descendente explicado, treinamento modelo IA',
        },
        {
          slug: 'redes-neurais',
          title: 'Redes Neurais: o Cérebro Artificial',
          icon: '🕸️',
          xp: 50,
          readTime: 10,
          desc: 'Neurônios, camadas, ativações — a arquitetura que imita (e supera) o cérebro em tarefas específicas.',
          seoDesc: 'O que são redes neurais artificiais, como funcionam neurônios artificiais, camadas e funções de ativação explicadas.',
          keywords: 'redes neurais artificiais, deep learning, como funciona rede neural',
        },
        {
          slug: 'o-que-e-llm',
          title: 'O que é um LLM?',
          icon: '💬',
          xp: 50,
          readTime: 9,
          desc: 'Large Language Models: o que os torna diferentes, como foram treinados e por que o ChatGPT foi um divisor de águas.',
          seoDesc: 'O que é um LLM (Large Language Model), como funciona o ChatGPT, Claude e Gemini. Explicação completa e prática.',
          keywords: 'o que é LLM, large language model explicado, como funciona chatgpt',
        },
        {
          slug: 'tokens',
          title: 'Tokens e Tokenização',
          icon: '🔤',
          xp: 40,
          readTime: 7,
          desc: 'A IA não lê palavras — ela lê tokens. Entenda o que isso muda em custo, velocidade e limites de contexto.',
          seoDesc: 'O que são tokens em IA, como funciona tokenização BPE, por que contexto é medido em tokens e como isso afeta o custo.',
          keywords: 'tokens IA, tokenização LLM, contexto tokens, BPE tokenizacao',
        },
        {
          slug: 'transformers',
          title: 'Transformers e Mecanismo de Atenção',
          icon: '⚙️',
          xp: 60,
          readTime: 12,
          desc: 'A arquitetura que mudou tudo em 2017 — Attention Is All You Need e por que o "transformer" é onipresente.',
          seoDesc: 'Como funciona o Transformer e mecanismo de atenção (attention). A arquitetura por trás de GPT, Claude e BERT explicada.',
          keywords: 'transformer arquitetura IA, mecanismo atencao IA, attention is all you need',
        },
      ],
    },
    {
      id: 'trail2',
      name: 'IA Além do LLM',
      color: '#d2a8ff',
      icon: '🏗️',
      desc: 'KV Cache, MoE, Tool Calling, avaliação — como modelos funcionam em produção',
      unlockAfter: 'trail1',
      modules: [
        {
          slug: 'kv-cache',
          title: 'KV Cache: Memória Eficiente',
          icon: '⚡',
          xp: 60,
          readTime: 8,
          desc: 'Por que um modelo de 30GB pode precisar de 60GB de VRAM — e como o KV Cache resolve isso.',
          seoDesc: 'O que é KV Cache em transformers, como funciona Key-Value Cache, por que é essencial para inferência eficiente.',
          keywords: 'kv cache transformers, key value cache LLM, memoria eficiente IA',
        },
        {
          slug: 'mixture-of-experts',
          title: 'Mixture of Experts (MoE)',
          icon: '🧩',
          xp: 70,
          readTime: 10,
          desc: '200B parâmetros que não cabem na GPU — veja como o MoE ativa só o que é necessário.',
          seoDesc: 'O que é Mixture of Experts (MoE), como funciona o roteamento de experts, Mixtral e modelos MoE explicados.',
          keywords: 'mixture of experts MoE, mixtral arquitetura, sparse model IA',
        },
        {
          slug: 'tool-calling',
          title: 'Tool Calling e Agentes',
          icon: '🔧',
          xp: 70,
          readTime: 9,
          desc: 'Como a IA aprendeu a usar ferramentas externas — e por que isso transformou LLMs em agentes.',
          seoDesc: 'O que é tool calling em IA, como agentes usam ferramentas, function calling na API do Claude e OpenAI.',
          keywords: 'tool calling IA, function calling LLM, agentes IA ferramentas',
        },
        {
          slug: 'ia-alem-do-llm',
          title: 'Harness: a Infraestrutura do Agente',
          icon: '🏗️',
          xp: 80,
          readTime: 15,
          desc: 'O artigo completo: os 6 componentes que fazem um agente de IA funcionar de verdade.',
          seoDesc: 'O que é um coding harness para agentes de IA, os 6 componentes de um agente de programação, Claude Code vs Cursor.',
          keywords: 'harness agente IA, componentes agente programacao, claude code vs cursor',
          externalUrl: '../ia-alem-do-llm.html', // já existe!
        },
        {
          slug: 'como-avaliar-modelos',
          title: 'Como Avaliar Modelos de IA',
          icon: '📊',
          xp: 60,
          readTime: 8,
          desc: 'MMLU, HumanEval, benchmark contamination — como saber se um modelo é realmente melhor.',
          seoDesc: 'Como avaliar modelos de IA, o que são benchmarks MMLU HumanEval, como LM Eval Harness funciona.',
          keywords: 'avaliar modelos IA, benchmarks LLM, MMLU HumanEval, lm evaluation harness',
        },
      ],
    },
  ],
};

// ─── Engine class ──────────────────────────────────────────
class AcademyEngine {
  constructor() {
    this.state = this._load();
    this._checkStreak();
  }

  _load() {
    try {
      const raw = localStorage.getItem(ENGINE_KEY);
      if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    } catch {}
    return { ...DEFAULT_STATE, startedAt: new Date().toISOString() };
  }

  _save() {
    try {
      localStorage.setItem(ENGINE_KEY, JSON.stringify(this.state));
    } catch {}
  }

  _checkStreak() {
    const today = new Date().toDateString();
    const last  = this.state.lastStudyDate;
    if (!last) return;

    const lastDate  = new Date(last);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastDate.toDateString() !== yesterday.toDateString() &&
        lastDate.toDateString() !== today) {
      // Streak quebrado
      if (this.state.streak > 0) {
        this.state.streak = 0;
        this._save();
      }
    }
  }

  // Marca hoje como dia de estudo
  _touchStreak() {
    const today = new Date().toDateString();
    if (this.state.lastStudyDate !== today) {
      const last = this.state.lastStudyDate;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (last && new Date(last).toDateString() === yesterday.toDateString()) {
        this.state.streak += 1;
      } else if (!last || new Date(last).toDateString() !== today) {
        this.state.streak = 1;
      }
      this.state.lastStudyDate = today;
      this._checkStreakBadges();
    }
  }

  _checkStreakBadges() {
    if (this.state.streak >= 3)  this.unlockBadge('streak_3');
    if (this.state.streak >= 7)  this.unlockBadge('streak_7');
    if (this.state.streak >= 30) this.unlockBadge('streak_30');
  }

  // Adiciona XP e atualiza nível
  addXP(amount, reason = '') {
    this.state.xp += amount;
    const newLevel = this._calcLevel();
    const leveled  = newLevel > this.state.level;
    this.state.level = newLevel;
    this._save();
    return { xp: amount, leveled, newLevel, reason };
  }

  _calcLevel() {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (this.state.xp >= LEVELS[i].xpMin) return LEVELS[i].level;
    }
    return 1;
  }

  getLevelInfo() {
    const l = LEVELS.find(l => l.level === this.state.level) || LEVELS[0];
    const next = LEVELS.find(l => l.level === this.state.level + 1);
    const progress = next
      ? Math.round(((this.state.xp - l.xpMin) / (next.xpMin - l.xpMin)) * 100)
      : 100;
    return { ...l, nextXP: next ? next.xpMin : l.xpMax, progress, currentXP: this.state.xp };
  }

  // Completa um módulo
  completeModule(slug, xpAmount) {
    this._touchStreak();
    const isNew = !this.state.completedModules.includes(slug);

    if (isNew) {
      this.state.completedModules.push(slug);

      // Badge primeiro módulo
      if (this.state.completedModules.length === 1) this.unlockBadge('first_step');

      // Speed run: 3 módulos no mesmo dia
      const todayCompleted = this.state.completedModules.filter(s => {
        const q = this.state.quizScores[s];
        return q && q.date === new Date().toDateString();
      }).length;
      if (todayCompleted >= 2) this.unlockBadge('speed_run');

      // Verificar trails completas
      this._checkTrailCompletion();

    } else {
      this.unlockBadge('curious'); // revisitou
    }

    const result = this.addXP(isNew ? xpAmount : Math.floor(xpAmount * 0.2), `Módulo: ${slug}`);
    this._save();
    return { ...result, isNew };
  }

  _checkTrailCompletion() {
    for (const trail of CURRICULUM.trails) {
      const all = trail.modules.map(m => m.slug);
      const done = all.every(s => this.state.completedModules.includes(s));
      if (done) {
        if (trail.id === 'trail1') this.unlockBadge('trail1_done');
        if (trail.id === 'trail2') this.unlockBadge('trail2_done');
      }
    }
    const totalModules = CURRICULUM.trails.flatMap(t => t.modules).map(m => m.slug);
    if (totalModules.every(s => this.state.completedModules.includes(s))) {
      this.unlockBadge('all_done');
    }
  }

  // Salva resultado de quiz
  saveQuizScore(slug, score, total) {
    const perfect = score === total;
    this.state.quizScores[slug] = {
      score, total, perfect,
      date: new Date().toDateString(),
      ts: Date.now(),
    };
    if (perfect) this.unlockBadge('quiz_perfect');
    const bonus = perfect ? Math.round(total * 10) : Math.round(score * 5);
    this._save();
    return this.addXP(bonus, `Quiz: ${slug}`);
  }

  // Desbloqueia uma badge
  unlockBadge(id) {
    if (this.state.badges.includes(id)) return null;
    const badge = BADGES_DEF.find(b => b.id === id);
    if (!badge) return null;
    this.state.badges.push(id);
    this.addXP(badge.xpBonus, `Badge: ${badge.name}`);
    this._save();
    return badge;
  }

  isModuleDone(slug)    { return this.state.completedModules.includes(slug); }
  isTrailUnlocked(trail) {
    if (!trail.unlockAfter) return true;
    const prevTrail = CURRICULUM.trails.find(t => t.id === trail.unlockAfter);
    if (!prevTrail) return true;
    return prevTrail.modules.every(m => this.isModuleDone(m.slug));
  }

  getNextModule() {
    for (const trail of CURRICULUM.trails) {
      if (!this.isTrailUnlocked(trail)) continue;
      for (const mod of trail.modules) {
        if (!this.isModuleDone(mod.slug)) return { ...mod, trailId: trail.id };
      }
    }
    return null;
  }

  getStats() {
    const totalModules = CURRICULUM.trails.flatMap(t => t.modules).length;
    const done = this.state.completedModules.length;
    return {
      xp: this.state.xp,
      level: this.getLevelInfo(),
      streak: this.state.streak,
      modulesCompleted: done,
      totalModules,
      progressPct: Math.round((done / totalModules) * 100),
      badges: this.state.badges.map(id => BADGES_DEF.find(b => b.id === id)).filter(Boolean),
      quizScores: this.state.quizScores,
    };
  }

  reset() {
    localStorage.removeItem(ENGINE_KEY);
    this.state = { ...DEFAULT_STATE, startedAt: new Date().toISOString() };
    this._save();
  }
}

// ─── Exporta globalmente ───────────────────────────────────
window.FFV = window.FFV || {};
window.FFV.engine     = new AcademyEngine();
window.FFV.CURRICULUM = CURRICULUM;
window.FFV.LEVELS     = LEVELS;
window.FFV.BADGES     = BADGES_DEF;

// ─── Toast de notificação ──────────────────────────────────
window.FFV.toast = function(msg, type = 'info', duration = 3500) {
  const colors = { info: '#58a6ff', success: '#3fb950', xp: '#ffa657', badge: '#d2a8ff', level: '#f78166' };
  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:#161b22; border:1px solid ${colors[type] || colors.info};
    color:#e6edf3; padding:14px 20px; border-radius:12px;
    font-size:14px; font-family:'Segoe UI',system-ui,sans-serif;
    box-shadow:0 8px 32px rgba(0,0,0,0.4); max-width:320px;
    transform:translateY(80px); opacity:0;
    transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    line-height:1.5;
  `;
  t.innerHTML = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => {
    t.style.transform = 'translateY(0)';
    t.style.opacity   = '1';
  });
  setTimeout(() => {
    t.style.transform = 'translateY(80px)';
    t.style.opacity   = '0';
    setTimeout(() => t.remove(), 300);
  }, duration);
};
