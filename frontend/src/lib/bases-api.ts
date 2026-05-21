// Cliente dos endpoints públicos /api/v1/bases.
//
// Usado por:
//   - /bases (listagem de bases — fetchBases)
//   - /tecnologia, /medicina-veterinaria e futuras bases (fetchBasePage)
//
// Em modo SSR/ISR, o Next cacheia a resposta por 60-300s. Em modo client
// (CSR), o componente decide o caching.

export type BaseStatus = 'live' | 'queued' | 'in_production';

export interface KnowledgeBase {
  slug: string;
  name: string;
  areaLabel: string;
  description: string;
  icon: string;
  status: BaseStatus;
  url?: string;
  modules?: number;
  trails?: number;
  hubs?: number;
  demandCount: number;
}

export interface BasesResponse {
  bases: KnowledgeBase[];
  totalLive: number;
  totalQueued: number;
}

// `||` em vez de `??` porque o frontend pode rodar com NEXT_PUBLIC_API_BASE_URL=""
// (modo mock do Playwright). Empty string deve cair pro default local também.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export async function fetchBases(opts: { signal?: AbortSignal } = {}): Promise<BasesResponse> {
  const res = await fetch(`${API_BASE}/api/v1/bases`, {
    signal: opts.signal,
    // ISR-friendly: cache curto, alinhado com o Cache-Control do backend (60s).
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`fetchBases: HTTP ${res.status}`);
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────
// BasePageDTO — descritor completo da home de uma base.
//
// Mapeia 1:1 o handler Go (`BasePageDTO` em bases_handler.go). Quando o
// backend não preenche algum bloco, o KnowledgeBaseHome cai em defaults
// internos (TECH_PATHS, TECH_HUBS, etc.).
//
// Ver UNIFICATION_PLAN.md.
// ─────────────────────────────────────────────────────────────────────────

export interface BaseThemeDTO {
  ink: string;
  paper: string;
  cream: string;
  border: string;
  muted: string;
  accent: string;
  accentLight: string;
  success: string;
  hubColors: string[];
}

export interface BaseHeroDTO {
  kicker?: string;
  badgeText?: string;
  title?: string;
  description?: string;
  ctas?: { href: string; label: string; variant?: string }[];
  stats?: { value: string; label: string }[];
  showGameDemo?: boolean;
}

export interface BasePathDTO {
  icon: string;
  title: string;
  desc: string;
  href: string;
  cta: string;
  color: string;
}

export interface BaseHubCardDTO {
  id: string;
  name: string;
  icon: string;
  color: string;
  tagline: string;
  href: string;
  trailCount: number;
  moduleCount: number;
}

export interface BasePlaylistCardDTO {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  moduleCount: number;
  href: string;
}

export interface BaseFinalCtaDTO {
  kicker?: string;
  title?: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
  footnote?: string;
}

export interface BaseFeaturesDTO {
  gamification?: 'global' | 'scoped' | 'off';
  srs?: boolean;
  quizzes?: boolean;
  community?: boolean;
}

export interface BasePageDTO {
  slug: string;
  name: string;
  status: BaseStatus;
  url?: string;
  theme?: BaseThemeDTO;
  hero?: BaseHeroDTO;
  paths?: BasePathDTO[];
  hubs?: BaseHubCardDTO[];
  playlists?: BasePlaylistCardDTO[];
  finalCta?: BaseFinalCtaDTO;
  stats: { modules?: number; trails?: number; hubs?: number };
  microcopy?: Record<string, string>;
  slogans?: Record<string, string>;
  features?: BaseFeaturesDTO;
  flags: {
    hideRanking: boolean;
    hideComunidade: boolean;
    hideGlobalContentNav: boolean;
  };
}

/**
 * Busca o descritor completo da página de uma base.
 *
 * Retorna `null` se o backend estiver offline OU se a base não existir —
 * a chamada de SSR usa esse null como sinal pra cair no fallback estático
 * (registry.ts + adapters/medvet/tecnologia). Isso preserva o SSR mesmo
 * sem API.
 */
export async function fetchBasePage(
  slug: string,
  opts: { signal?: AbortSignal } = {},
): Promise<BasePageDTO | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/bases/${encodeURIComponent(slug)}/page`, {
      signal: opts.signal,
      // Backend retorna Cache-Control: public, max-age=300 — alinhamos o ISR.
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as BasePageDTO;
  } catch {
    return null;
  }
}
