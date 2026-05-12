'use client';

export interface TeamMember {
  id: string;
  name: string;
  joinedAt: string;
  xp: number;
  level: number;
  completedModules: number;
  streak: number;
  badges: number;
  weeklyXp: number;
  role: 'admin' | 'member';
}

export interface Team {
  code: string;
  name: string;
  createdAt: string;
  goal?: string;
  members: TeamMember[];
}

const TEAM_KEY_PREFIX = 'ffv_team_';
const MY_TEAM_KEY = 'ffv_my_team';

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function createTeam(teamName: string, adminName: string, goal: string, snapshot: TeamMember): Team {
  const code = generateCode();
  const team: Team = {
    code,
    name: teamName,
    createdAt: new Date().toISOString(),
    goal: goal || undefined,
    members: [{ ...snapshot, id: generateCode(), name: adminName, role: 'admin', joinedAt: new Date().toISOString() }],
  };
  localStorage.setItem(TEAM_KEY_PREFIX + code, JSON.stringify(team));
  localStorage.setItem(MY_TEAM_KEY, code);
  return team;
}

export function joinTeam(code: string, memberName: string, snapshot: TeamMember): Team | null {
  const raw = localStorage.getItem(TEAM_KEY_PREFIX + code.toUpperCase());
  if (!raw) return null;
  try {
    const team: Team = JSON.parse(raw);
    const existingIdx = team.members.findIndex(m => m.id === snapshot.id);
    const member: TeamMember = { ...snapshot, name: memberName, role: 'member', joinedAt: new Date().toISOString() };
    if (existingIdx >= 0) {
      team.members[existingIdx] = { ...team.members[existingIdx], ...member };
    } else {
      team.members.push(member);
    }
    localStorage.setItem(TEAM_KEY_PREFIX + code.toUpperCase(), JSON.stringify(team));
    localStorage.setItem(MY_TEAM_KEY, code.toUpperCase());
    return team;
  } catch {
    return null;
  }
}

export function getMyTeam(): Team | null {
  if (typeof window === 'undefined') return null;
  const code = localStorage.getItem(MY_TEAM_KEY);
  if (!code) return null;
  const raw = localStorage.getItem(TEAM_KEY_PREFIX + code);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Team;
  } catch {
    return null;
  }
}

export function updateMyStats(snapshot: Omit<TeamMember, 'id' | 'name' | 'role' | 'joinedAt'>): void {
  if (typeof window === 'undefined') return;
  const team = getMyTeam();
  if (!team) return;
  // Find member by checking stored member id
  const memberId = localStorage.getItem('ffv_team_member_id');
  if (!memberId) return;
  const idx = team.members.findIndex(m => m.id === memberId);
  if (idx < 0) return;
  team.members[idx] = { ...team.members[idx], ...snapshot };
  localStorage.setItem(TEAM_KEY_PREFIX + team.code, JSON.stringify(team));
}

export function leaveTeam(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MY_TEAM_KEY);
}

export function exportTeamReport(team: Team): string {
  const lines = [
    `# Relatório do Time: ${team.name}`,
    `Código: ${team.code}`,
    `Criado em: ${new Date(team.createdAt).toLocaleDateString('pt-BR')}`,
    team.goal ? `Objetivo: ${team.goal}` : '',
    '',
    '## Membros',
    ...team.members
      .sort((a, b) => b.weeklyXp - a.weeklyXp)
      .map((m, i) =>
        `${i + 1}. ${m.name} — ${m.xp} XP total · Nível ${m.level} · ${m.completedModules} módulos · Streak ${m.streak}d`
      ),
    '',
    `Total XP do time: ${team.members.reduce((s, m) => s + m.xp, 0)}`,
    `Módulos concluídos (soma): ${team.members.reduce((s, m) => s + m.completedModules, 0)}`,
  ].filter(l => l !== undefined);
  return lines.join('\n');
}
