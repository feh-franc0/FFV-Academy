export type Level = 'foundational' | 'beginner' | 'intermediate' | 'advanced';

export interface Module {
  slug: string;
  title: string;
  icon: string;
  xp: number;
  readTime: number;
  desc: string;
  keywords: string;
  externalUrl?: string;
  /** Slugs de módulos que devem ser estudados antes deste. */
  prerequisites?: string[];
  /** Slugs de próximos passos sugeridos (pode atravessar trilhas). */
  nextSuggested?: string[];
  /** Nível de dificuldade didática. */
  level?: Level;
  /**
   * O que o leitor consegue FAZER ao terminar — resultado, não conteúdo.
   * Mesmo contrato que `EtapaJornada.resultado` (`curriculum/jornada.ts`) já
   * aplica às 5 etapas da jornada; faltava no grão do módulo.
   *
   * Achado da auditoria pedagógica de 12/ago/2026: 472 de 490 `desc` (96%)
   * listam conteúdo ("ls, cd, grep, find, pipe, redireção") em vez de
   * declarar resultado. `desc` continua existindo — é usado por SEO, busca,
   * cards de trilha — e não deve virar outra coisa por baixo dos pés de quem
   * já depende do formato dele. `objetivo` é um campo NOVO, opcional,
   * preenchido por ratchet (ver `scripts/validate_cobertura_objetivo.py`) —
   * começou pelos 38 módulos de ENTRADA de trilha (maior alavanca: é o
   * primeiro contato do leitor com aquele assunto).
   */
  objetivo?: string;
}

export interface Trail {
  id: string;
  name: string;
  color: string;
  icon: string;
  desc: string;
  unlockAfter?: string;
  modules: Module[];
  /** IDs de trilhas que idealmente vêm antes desta. */
  prerequisites?: string[];
  /** Nível da trilha como um todo. */
  level?: Level;
  /** Rota da trilha (ex: "/fundamentos-da-ia"). Usado por HomeClient/CommandPalette. */
  href?: string;
}

export interface Hub {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  href: string;
  color: string;
  icon: string;
  tagline: string;
  desc: string;
  trailIds: string[];
}
