import { CURRICULUM } from './curriculum';
import type { Trail } from './curriculum';
import type { StudyDay } from './engine';

export type GoalType =
  | 'aws-saa'
  | 'aws-clf'
  | 'backend-senior'
  | 'ml-engineer'
  | 'fullstack'
  | 'devops-sre'
  | 'frontend-senior'
  | 'open';

export interface PlanGoal {
  type: GoalType;
  hoursPerWeek: number; // 1–20
  weeksAvailable: number; // 4–52
}

export interface PlanModule {
  slug: string;
  title: string;
  trailName: string;
  trailColor: string;
  xp: number;
  readTime: number;
  isCompleted: boolean;
  reason: string;
}

export interface WeekPlan {
  weekNumber: number;
  theme: string;
  modules: PlanModule[];
  srsSessionsTarget: number;
  estimatedMinutes: number;
  milestone?: string;
}

export interface StudyPlan {
  goal: PlanGoal;
  generatedAt: string;
  totalModules: number;
  completedModules: number;
  weeks: WeekPlan[];
  summary: string;
  keyMilestones: Array<{ week: number; description: string }>;
}

// ---------- goal configurations ----------

interface GoalConfig {
  label: string;
  trailPriority: string[]; // trail IDs in order
  milestones: Array<{ afterTrailId: string; description: string }>;
  finalMilestone: string;
}

const GOAL_CONFIGS: Record<GoalType, GoalConfig> = {
  'aws-clf': {
    label: 'AWS Cloud Practitioner',
    trailPriority: ['trail4', 'trail12', 'trail8'],
    milestones: [
      { afterTrailId: 'trail4', description: 'Pronto para o simulado AWS CLF' },
    ],
    finalMilestone: 'Certificado AWS Cloud Practitioner ao alcance',
  },
  'aws-saa': {
    label: 'AWS Solutions Architect Associate',
    trailPriority: ['trail4', 'trail5', 'trail12', 'trail10', 'trail8'],
    milestones: [
      { afterTrailId: 'trail4', description: 'Base AWS CLF concluída — pronto para nível SAA' },
      { afterTrailId: 'trail5', description: 'Conteúdo SAA-C03 completo — hora de simular a prova' },
    ],
    finalMilestone: 'Certificado AWS SAA ao alcance',
  },
  'backend-senior': {
    label: 'Backend Engineer Sênior',
    trailPriority: ['trail12', 'trail14', 'trail8', 'trail10', 'trail11', 'trail4', 'trail47'],
    milestones: [
      { afterTrailId: 'trail12', description: 'Fundamentos técnicos sólidos' },
      { afterTrailId: 'trail14', description: 'SQL & Databases dominados' },
      { afterTrailId: 'trail10', description: 'Sistemas distribuídos compreendidos' },
    ],
    finalMilestone: 'Perfil completo de Backend Engineer Sênior',
  },
  'ml-engineer': {
    label: 'ML/AI Engineer',
    trailPriority: ['trail1', 'trail2', 'trail9', 'trail12', 'trail50', 'trail51', 'trail36'],
    milestones: [
      { afterTrailId: 'trail1', description: 'Fundamentos de IA consolidados' },
      { afterTrailId: 'trail2', description: 'Arquiteturas LLM compreendidas' },
      { afterTrailId: 'trail9', description: 'Engenharia AI-Native em prática' },
    ],
    finalMilestone: 'Pronto para atuar como ML/AI Engineer',
  },
  'fullstack': {
    label: 'Full-Stack Developer',
    trailPriority: ['trail12', 'trail31', 'trail19', 'trail8', 'trail4', 'trail14'],
    milestones: [
      { afterTrailId: 'trail12', description: 'Fundamentos técnicos consolidados' },
      { afterTrailId: 'trail31', description: 'Frontend moderno dominado' },
      { afterTrailId: 'trail19', description: 'Backend Node.js produtivo' },
    ],
    finalMilestone: 'Perfil Full-Stack completo e competitivo',
  },
  'devops-sre': {
    label: 'DevOps / SRE',
    trailPriority: ['trail12', 'trail7', 'trail4', 'trail11', 'trail10', 'trail5'],
    milestones: [
      { afterTrailId: 'trail7', description: 'Docker + Kubernetes dominados' },
      { afterTrailId: 'trail11', description: 'Observabilidade & SRE implementados' },
      { afterTrailId: 'trail4', description: 'Base AWS sólida para infraestrutura cloud' },
    ],
    finalMilestone: 'Perfil DevOps/SRE pronto para produção',
  },
  'frontend-senior': {
    label: 'Frontend Sênior',
    trailPriority: ['trail12', 'trail31', 'trail18', 'trail8', 'trail40', 'trail60'],
    milestones: [
      { afterTrailId: 'trail12', description: 'Fundamentos técnicos sólidos' },
      { afterTrailId: 'trail31', description: 'Frontend moderno dominado' },
      { afterTrailId: 'trail18', description: 'TypeScript profissional consolidado' },
    ],
    finalMilestone: 'Perfil Frontend Sênior completo',
  },
  'open': {
    label: 'Aprendizado Livre Otimizado',
    trailPriority: ['trail12', 'trail1', 'trail8', 'trail14', 'trail18', 'trail10'],
    milestones: [],
    finalMilestone: 'Jornada de aprendizado contínuo consolidada',
  },
};

// ---------- reason generator ----------

function moduleReason(trailName: string, goalType: GoalType, index: number, trailIndex: number): string {
  const priorityLabels: Record<string, string> = {
    'trail1': 'fundacional para IA',
    'trail2': 'cobre arquiteturas LLM',
    'trail4': 'essencial para AWS CLF',
    'trail5': 'núcleo do SAA-C03',
    'trail7': 'infraestrutura de containers',
    'trail8': 'engenharia de software moderna',
    'trail9': 'IA aplicada em produção',
    'trail10': 'sistemas distribuídos',
    'trail11': 'observabilidade e SRE',
    'trail12': 'fundamentos técnicos',
    'trail14': 'banco de dados essencial',
    'trail18': 'TypeScript avançado',
    'trail19': 'backend Node.js',
    'trail31': 'frontend moderno',
    'trail36': 'Python para IA',
    'trail47': 'Go para backend',
    'trail50': 'machine learning clássico',
    'trail51': 'ML em produção',
    'trail60': 'performance web',
    'trail40': 'produtividade de dev',
  };

  const goalLabels: Record<GoalType, string> = {
    'aws-saa': 'AWS SAA',
    'aws-clf': 'AWS CLF',
    'backend-senior': 'Backend Sênior',
    'ml-engineer': 'ML Engineer',
    'fullstack': 'Full-Stack',
    'devops-sre': 'DevOps/SRE',
    'frontend-senior': 'Frontend Sênior',
    'open': 'aprendizado contínuo',
  };

  if (trailIndex === 0 && index < 3) {
    return `Ponto de partida — ${priorityLabels[trailName] ?? trailName}`;
  }
  if (index === 0) {
    return `Início da trilha ${priorityLabels[trailName] ?? trailName}`;
  }
  return `Parte da sequência para ${goalLabels[goalType]}`;
}

// ---------- main generator ----------

export function generateStudyPlan(
  goal: PlanGoal,
  completedModules: string[],
  quizScores: Record<string, { score: number; total: number }>,
  studyDays: Array<Pick<StudyDay, 'date' | 'minutes'>>
): StudyPlan {
  const config = GOAL_CONFIGS[goal.type];
  const completedSet = new Set(completedModules);

  // Build ordered trail list
  const priorityIds = config.trailPriority;
  const otherTrails = CURRICULUM
    .filter(t => !priorityIds.includes(t.id))
    .sort((a, b) => {
      // For 'open' goal, prefer trails with partial progress
      const aDone = a.modules.filter(m => completedSet.has(m.slug)).length;
      const bDone = b.modules.filter(m => completedSet.has(m.slug)).length;
      const aRatio = a.modules.length > 0 ? aDone / a.modules.length : 0;
      const bRatio = b.modules.length > 0 ? bDone / b.modules.length : 0;
      return bRatio - aRatio;
    });

  const orderedTrails: Trail[] = [
    ...priorityIds.map(id => CURRICULUM.find(t => t.id === id)).filter((t): t is Trail => !!t),
    ...otherTrails,
  ];

  // Flatten modules with metadata, skip completed
  interface FlatModule {
    slug: string;
    title: string;
    trailId: string;
    trailName: string;
    trailColor: string;
    xp: number;
    readTime: number;
    prerequisites: string[];
    isCompleted: boolean;
    trailIndex: number;
    moduleIndexInTrail: number;
  }

  const allModules: FlatModule[] = [];
  orderedTrails.forEach((trail, trailIndex) => {
    trail.modules.forEach((mod, modIndex) => {
      allModules.push({
        slug: mod.slug,
        title: mod.title,
        trailId: trail.id,
        trailName: trail.name,
        trailColor: trail.color,
        xp: mod.xp,
        readTime: mod.readTime,
        prerequisites: mod.prerequisites ?? [],
        isCompleted: completedSet.has(mod.slug),
        trailIndex,
        moduleIndexInTrail: modIndex,
      });
    });
  });

  // Topological sort respecting prerequisites
  const sorted: FlatModule[] = [];
  const visited = new Set<string>();

  function visit(slug: string) {
    if (visited.has(slug)) return;
    visited.add(slug);
    const mod = allModules.find(m => m.slug === slug);
    if (!mod) return;
    for (const prereq of mod.prerequisites) {
      visit(prereq);
    }
    sorted.push(mod);
  }

  for (const mod of allModules) {
    visit(mod.slug);
  }

  // Separate completed from pending
  const pendingModules = sorted.filter(m => !m.isCompleted);
  const completedInPlan = sorted.filter(m => m.isCompleted);

  // Minutes per week available (hoursPerWeek × 60)
  const minutesPerWeek = goal.hoursPerWeek * 60;
  // Assume ~15min for quiz per module
  const minutesPerModule = (m: FlatModule) => m.readTime + 15;

  // Build weeks
  const weeks: WeekPlan[] = [];
  const moduleQueue = [...pendingModules];
  let weekNumber = 1;

  // Track trailing study velocity for SRS estimate
  const recentMinutes = studyDays
    .slice(-14)
    .reduce((sum, d) => sum + d.minutes, 0);
  const avgDailyMinutes = recentMinutes > 0 ? recentMinutes / 14 : (goal.hoursPerWeek * 60) / 7;

  // Week theme generator based on majority trail
  function weekTheme(mods: FlatModule[]): string {
    if (mods.length === 0) return 'Revisão';
    const trailCounts = new Map<string, number>();
    for (const m of mods) {
      trailCounts.set(m.trailName, (trailCounts.get(m.trailName) ?? 0) + 1);
    }
    let topTrail = '';
    let topCount = 0;
    for (const [name, count] of trailCounts) {
      if (count > topCount) { topCount = count; topTrail = name; }
    }
    return topTrail;
  }

  // Milestone tracking
  const trailCompletedInPlan = new Map<string, boolean>();
  const milestonesByWeek = new Map<number, string>();
  const keyMilestones: Array<{ week: number; description: string }> = [];

  while (moduleQueue.length > 0 && weekNumber <= goal.weeksAvailable) {
    let minutesLeft = minutesPerWeek;
    const weekMods: FlatModule[] = [];

    while (moduleQueue.length > 0 && minutesLeft > 0) {
      const next = moduleQueue[0];
      const cost = minutesPerModule(next);
      if (cost > minutesLeft && weekMods.length > 0) break;
      weekMods.push(next);
      moduleQueue.shift();
      minutesLeft -= cost;
    }

    // SRS: 1 session per 2 study days estimated this week
    const studyDaysThisWeek = Math.round((avgDailyMinutes * 7) / 30);
    const srsSessionsTarget = Math.max(1, Math.floor(studyDaysThisWeek / 2));

    const estimatedMinutes = weekMods.reduce((sum, m) => sum + minutesPerModule(m), 0)
      + srsSessionsTarget * 15;

    const theme = weekTheme(weekMods);

    // Check if any priority trail completes this week
    let weekMilestone: string | undefined;
    for (const mod of weekMods) {
      const trail = orderedTrails.find(t => t.id === mod.trailId);
      if (!trail) continue;
      if (!trailCompletedInPlan.has(mod.trailId)) {
        const remaining = trail.modules.filter(m => !completedSet.has(m.slug));
        const willComplete = remaining.every(m =>
          completedSet.has(m.slug) || weekMods.some(wm => wm.slug === m.slug)
        );
        if (willComplete) {
          trailCompletedInPlan.set(mod.trailId, true);
          const mc = config.milestones.find(ms => ms.afterTrailId === mod.trailId);
          if (mc && !weekMilestone) {
            weekMilestone = mc.description;
            milestonesByWeek.set(weekNumber, mc.description);
            keyMilestones.push({ week: weekNumber, description: mc.description });
          }
        }
      }
    }

    weeks.push({
      weekNumber,
      theme,
      modules: weekMods.map((m, i) => ({
        slug: m.slug,
        title: m.title,
        trailName: m.trailName,
        trailColor: m.trailColor,
        xp: m.xp,
        readTime: m.readTime,
        isCompleted: false,
        reason: moduleReason(m.trailId, goal.type, i, m.trailIndex),
      })),
      srsSessionsTarget,
      estimatedMinutes,
      milestone: weekMilestone,
    });

    weekNumber++;
  }

  // Final milestone
  if (weeks.length > 0) {
    const lastWeek = weeks[weeks.length - 1];
    lastWeek.milestone = lastWeek.milestone ?? config.finalMilestone;
    const existing = keyMilestones.find(k => k.week === lastWeek.weekNumber);
    if (!existing) {
      keyMilestones.push({ week: lastWeek.weekNumber, description: config.finalMilestone });
    }
  }

  const totalPlanModules = pendingModules.length + completedInPlan.length;
  const plannedModules = weeks.reduce((sum, w) => sum + w.modules.length, 0);

  const summary = moduleQueue.length > 0
    ? `Com ${goal.hoursPerWeek}h/semana você cobre ${plannedModules} módulos em ${goal.weeksAvailable} semanas (${moduleQueue.length} ficam para depois)`
    : `Com ${goal.hoursPerWeek}h/semana você conclui ${plannedModules} módulos em ${weeks.length} semanas`;

  return {
    goal,
    generatedAt: new Date().toISOString(),
    totalModules: totalPlanModules,
    completedModules: completedInPlan.length,
    weeks,
    summary,
    keyMilestones,
  };
}

export const GOAL_LABELS: Record<GoalType, { icon: string; title: string; desc: string }> = {
  'aws-clf': {
    icon: '☁️',
    title: 'AWS Cloud Practitioner',
    desc: 'Fundamentos AWS, certificação CLF-C02',
  },
  'aws-saa': {
    icon: '🏆',
    title: 'AWS Solutions Architect',
    desc: 'Certificação SAA-C03 — o padrão de mercado',
  },
  'backend-senior': {
    icon: '🔧',
    title: 'Backend Engineer Sênior',
    desc: 'SQL, sistemas distribuídos, APIs robustas',
  },
  'ml-engineer': {
    icon: '🤖',
    title: 'ML / AI Engineer',
    desc: 'LLMs, RAG, MLOps, IA em produção',
  },
  'fullstack': {
    icon: '🌐',
    title: 'Full-Stack Developer',
    desc: 'Frontend + backend + cloud básico',
  },
  'devops-sre': {
    icon: '🚀',
    title: 'DevOps / SRE',
    desc: 'Kubernetes, CI/CD, observabilidade',
  },
  'frontend-senior': {
    icon: '🎨',
    title: 'Frontend Sênior',
    desc: 'React, TypeScript, performance avançada',
  },
  'open': {
    icon: '✨',
    title: 'Aprendizado Livre',
    desc: 'Trilha personalizada, seu ritmo',
  },
};
