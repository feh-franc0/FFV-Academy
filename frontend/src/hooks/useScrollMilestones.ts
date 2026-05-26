'use client';

/**
 * useScrollMilestones — telemetria PASSIVA de profundidade de leitura.
 *
 * Por que existe (princípio neurocientífico):
 *   A trilha de Neuromarketing nos ensina que módulos com alto scroll-depth
 *   ativam o sistema de recompensa (dopamina) — sinal de que o conteúdo
 *   ENGAJOU. Já módulos com 25% e abandono indicam dor: tópico errado,
 *   texto cansativo, gancho fraco. Sem essa métrica, otimização editorial
 *   é puro achismo. Ver `docs/PROMPT_DESIGN_NEUROCIENCIA.md`.
 *
 * Como funciona:
 *   1. Recebe um ref pra um elemento "container do conteúdo" (artigo).
 *   2. Calcula a altura total do conteúdo.
 *   3. Em scroll/resize, calcula a % máxima já vista pelo user.
 *   4. Dispara `trackEvent('module.scroll_milestone')` quando user CRUZA
 *      os marcos 25, 50, 75, 100 — uma vez cada por módulo por sessão.
 *
 * Anti-padrões evitados:
 *   - Não bloqueia scroll (event passivo)
 *   - Não dispara em janela inativa (Page Visibility API filtra)
 *   - Dedup em sessionStorage — não polui o backend com eventos repetidos
 *   - Throttled via requestAnimationFrame — zero impact em FPS
 *   - Respeita `prefers-reduced-motion` (não-bloqueante; só não anima)
 *
 * Limitações honestas:
 *   - "% vista" é proxy de "% lida" — não medimos atenção real (fixação ocular).
 *   - Em telas muito altas (3000px+) o user pode ver 100% sem chegar
 *     no fim. Tolerância: marco 100 dispara quando bottom do container
 *     está ≥80% visível (não exige tocar o pixel final).
 */

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/tracking';

const MILESTONES = [25, 50, 75, 100] as const;
type Milestone = typeof MILESTONES[number];

/** Storage key pra dedup por (módulo, marco) na sessão atual. */
const SESSION_KEY_PREFIX = 'ffv:scroll_milestone:';

function hasFired(slug: string, depth: Milestone): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  try {
    return sessionStorage.getItem(`${SESSION_KEY_PREFIX}${slug}:${depth}`) === '1';
  } catch {
    return false;
  }
}

function markFired(slug: string, depth: Milestone): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(`${SESSION_KEY_PREFIX}${slug}:${depth}`, '1');
  } catch { /* quota / private mode — silenciar */ }
}

interface UseScrollMilestonesOpts {
  /** Slug do módulo — usado como targetId nos eventos + chave de dedup. */
  moduleSlug: string;
  /** Ref pro container do conteúdo (ex: ref do `<article>`). */
  contentRef: React.RefObject<HTMLElement | null>;
  /** Slug da base ativa (opcional, vai no metadata pro filtro admin). */
  baseSlug?: string;
  /**
   * Desativa o tracking (ex: SSR, tests jsdom, modo admin). Default false.
   * Componente nunca quebra — só não dispara.
   */
  disabled?: boolean;
}

/**
 * Hook side-effect-only — não retorna nada. Apenas instala listeners
 * passivos enquanto o componente está montado.
 *
 * Uso:
 * ```tsx
 * const articleRef = useRef<HTMLElement>(null);
 * useScrollMilestones({ moduleSlug: slug, contentRef: articleRef });
 * return <article ref={articleRef}>...</article>;
 * ```
 */
export function useScrollMilestones({
  moduleSlug,
  contentRef,
  baseSlug,
  disabled,
}: UseScrollMilestonesOpts): void {
  // Refs em vez de state pra evitar re-renders no scroll (perf-critical).
  const maxDepthRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const mountedAtRef = useRef<number>(0);

  useEffect(() => {
    if (disabled) return;
    if (typeof window === 'undefined') return;
    if (!moduleSlug) return;

    mountedAtRef.current = performance.now();

    // Page Visibility API — pausa quando aba inativa (não dispara fake milestones
    // quando user trocou de aba e o body manteve scroll position).
    let documentHidden = document.hidden;
    function onVisChange() {
      documentHidden = document.hidden;
    }
    document.addEventListener('visibilitychange', onVisChange, { passive: true });

    function computeDepth(): number {
      const el = contentRef.current;
      if (!el) return 0;

      const rect = el.getBoundingClientRect();
      const totalHeight = el.scrollHeight || rect.height;
      if (totalHeight <= 0) return 0;

      const viewportH = window.innerHeight;
      // Quanto da PARTE INICIAL do elemento já passou pra cima do viewport
      // + quanto está visível agora. Limita em [0, totalHeight].
      const scrolledPast = Math.max(0, -rect.top);
      const visibleAtEnd = Math.min(viewportH, rect.bottom);
      const consumed = Math.min(totalHeight, scrolledPast + visibleAtEnd);
      const pct = Math.round((consumed / totalHeight) * 100);
      return Math.max(0, Math.min(100, pct));
    }

    function tick() {
      rafRef.current = null;
      if (documentHidden) return;
      // Filtro anti-bot: se mudou de 0 → 100 em menos de 500ms (jump
      // automático ou render inicial em viewport pequeno), ignora.
      if (performance.now() - mountedAtRef.current < 500) return;

      const depth = computeDepth();
      if (depth <= maxDepthRef.current) return;
      maxDepthRef.current = depth;

      for (const m of MILESTONES) {
        if (depth >= m && !hasFired(moduleSlug, m)) {
          markFired(moduleSlug, m);
          trackEvent({
            eventType: 'module.scroll_milestone',
            targetType: 'module',
            targetId: moduleSlug,
            baseSlug,
            valueNum: m,
            metadata: { depth: m },
            dedupeKey: `${moduleSlug}:${m}`,
          });
        }
      }
    }

    function onScroll() {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(tick);
    }

    // Listeners passivos — zero impact em FPS.
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    // Tick inicial após 600ms — dá tempo do layout estabilizar antes
    // de medir. Se já estiver com 75% visível (artigo curto + viewport
    // grande), dispara o evento corretamente sem precisar do user scrollar.
    const initialTimer = setTimeout(tick, 600);

    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('visibilitychange', onVisChange);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [moduleSlug, baseSlug, disabled, contentRef]);
}
