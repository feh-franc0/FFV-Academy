'use client';

/**
 * PostReadSignupCta — convite suave de signup que aparece DEPOIS do user ter
 * lido um módulo (≥75% scroll + 30s na página + 3s sem interação).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * FUNDAMENTAÇÃO NEUROCIENTÍFICA (ver docs/PROMPT_DESIGN_NEUROCIENCIA.md)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Por que ESSE momento (75% scroll):
 *   - EFEITO PICO-FIM (Kahneman): o user acabou de absorver o pico de aprendizado.
 *     Sistema límbico em estado positivo (recompensa de "aprendi algo").
 *   - RECIPROCIDADE (Cialdini): user recebeu valor real gratuito (artigo
 *     completo). Cérebro sente leve obrigação de retribuir — pedido casa.
 *   - DOPAMINA ANTECIPATÓRIA (Schultz): mostramos o FUTURO (XP, trilha
 *     personalizada) — sistema dopaminérgico ativa.
 *   - PROVA SOCIAL (Cialdini): "1.200+ devs estudando" — ativa córtex
 *     pré-frontal medial e junção temporoparietal (regiões sociais).
 *
 * Por que NÃO um modal:
 *   - Modal bloqueia conteúdo → ativa reptiliano em modo ameaça → user
 *     fecha por reflexo. Banner blindness institucional.
 *   - Solução: INLINE no fluxo do conteúdo, parece parte do artigo.
 *
 * Por que dismiss tão visível quanto CTA:
 *   - Dark pattern (X minúsculo) cria associação negativa com a marca
 *     (amígdala etiqueta como armadilha). Pre-Suasion §10: persuasão
 *     ética NÃO esconde a saída.
 *
 * Por que cooldown de 72h:
 *   - TOLERÂNCIA DOPAMÍNICA: repetir mesmo estímulo perde força e gera
 *     irritação. 72h é folga suficiente pro user "esquecer" e ver com
 *     olho novo, mas curto o suficiente pra capturar leads.
 *
 * Por que limite de 1x por sessão:
 *   - Se já dismissou hoje, mostrar de novo na mesma sessão = punição
 *     dopamínica. Respeita a decisão tomada (Cialdini §3 compromisso).
 */

import { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '@/hooks/useAuth';
import { trackEvent } from '@/lib/tracking';

const STORAGE_KEY_DISMISSED = 'ffv:post_read_cta:dismissed_at';
const STORAGE_KEY_SESSION_SHOWN = 'ffv:post_read_cta:session_shown';
const COOLDOWN_DAYS = 3;

/** Verifica se está no cooldown pós-dismiss (3 dias). */
function isWithinCooldown(): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISMISSED);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return false;
    const ageMs = Date.now() - dismissedAt;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    return ageDays < COOLDOWN_DAYS;
  } catch {
    return false;
  }
}

/** Verifica se já mostrou nesta sessão (max 1x). */
function alreadyShownThisSession(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY_SESSION_SHOWN) === '1';
  } catch {
    return false;
  }
}

function markShownThisSession(): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY_SESSION_SHOWN, '1');
  } catch { /* private mode — silencia */ }
}

function markDismissed(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_DISMISSED, String(Date.now()));
  } catch { /* silencia */ }
}

interface Props {
  /** Slug do módulo onde estamos — vai no tracking. */
  moduleSlug: string;
  /** Ref pro container do conteúdo — usado pra calcular scroll depth. */
  contentRef: React.RefObject<HTMLElement | null>;
  /** Slug da base ativa (opcional). */
  baseSlug?: string;
}

export function PostReadSignupCta({ moduleSlug, contentRef, baseSlug }: Props) {
  const auth = useContext(AuthContext);
  const isLoggedIn = !!auth?.isLoggedIn;

  // Estado interno: 'hidden' (default), 'visible' (atendeu critérios), 'dismissed'.
  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef<number>(0);

  useEffect(() => {
    // Hard guards: nunca mostrar nessas condições.
    if (isLoggedIn) return;
    if (typeof window === 'undefined') return;
    if (isWithinCooldown()) return;
    if (alreadyShownThisSession()) return;

    const MOUNT_TIME = performance.now();
    const MIN_TIME_ON_PAGE_MS = 30_000;  // filtra scroll automático/bot
    const MIN_IDLE_MS = 3_000;           // espera user pausar de scrollar
    const TRIGGER_DEPTH_PCT = 75;

    let lastInteractionAt = performance.now();
    let triggered = false;

    function bumpInteraction() {
      lastInteractionAt = performance.now();
    }

    function computeDepth(): number {
      const el = contentRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const totalH = el.scrollHeight || rect.height;
      if (totalH <= 0) return 0;
      const viewportH = window.innerHeight;
      const scrolledPast = Math.max(0, -rect.top);
      const visibleAtEnd = Math.min(viewportH, rect.bottom);
      const consumed = Math.min(totalH, scrolledPast + visibleAtEnd);
      return Math.round((consumed / totalH) * 100);
    }

    function check() {
      if (triggered) return;
      const now = performance.now();
      const timeOnPage = now - MOUNT_TIME;
      const idleTime = now - lastInteractionAt;
      const depth = computeDepth();

      if (timeOnPage < MIN_TIME_ON_PAGE_MS) return;
      if (depth < TRIGGER_DEPTH_PCT) return;
      if (idleTime < MIN_IDLE_MS) return;

      triggered = true;
      shownAtRef.current = Date.now();
      markShownThisSession();
      setVisible(true);

      trackEvent({
        eventType: 'cta.shown',
        targetType: 'cta',
        targetId: 'post_read_signup',
        baseSlug,
        metadata: {
          module_slug: moduleSlug,
          trigger: 'scroll_75',
          time_on_page_sec: Math.round(timeOnPage / 1000),
          depth_pct: depth,
        },
      });
    }

    function onScrollOrMove() {
      bumpInteraction();
    }

    // Listeners passivos. Verificamos a cada 1s (não em scroll — não queremos
    // a CTA "competindo" pela atenção enquanto o user ainda lê ativamente).
    window.addEventListener('scroll', onScrollOrMove, { passive: true });
    window.addEventListener('mousemove', onScrollOrMove, { passive: true });
    window.addEventListener('keydown', onScrollOrMove, { passive: true });

    const interval = window.setInterval(check, 1000);

    return () => {
      window.removeEventListener('scroll', onScrollOrMove);
      window.removeEventListener('mousemove', onScrollOrMove);
      window.removeEventListener('keydown', onScrollOrMove);
      window.clearInterval(interval);
    };
  }, [isLoggedIn, moduleSlug, baseSlug, contentRef]);

  function handleSignup() {
    const timeVisibleSec = shownAtRef.current
      ? Math.round((Date.now() - shownAtRef.current) / 1000)
      : 0;
    trackEvent({
      eventType: 'cta.click',
      targetType: 'cta',
      targetId: 'post_read_signup',
      baseSlug,
      metadata: {
        module_slug: moduleSlug,
        outcome: 'signup_started',
        time_visible_sec: timeVisibleSec,
      },
    });
    // Abre o LoginModal via useAuth.requireLogin
    auth?.requireLogin('salvar seu progresso de leitura').catch(() => {
      /* user cancelou — sem ação extra */
    });
  }

  function handleDismiss() {
    const timeVisibleSec = shownAtRef.current
      ? Math.round((Date.now() - shownAtRef.current) / 1000)
      : 0;
    markDismissed();
    setVisible(false);
    trackEvent({
      eventType: 'cta.dismissed',
      targetType: 'cta',
      targetId: 'post_read_signup',
      baseSlug,
      metadata: {
        module_slug: moduleSlug,
        time_visible_sec: timeVisibleSec,
      },
    });
  }

  if (isLoggedIn || !visible) return null;

  return (
    <aside
      role="complementary"
      aria-label="Convite pra criar conta gratuita"
      data-testid="post-read-signup-cta"
      className="my-12 rounded-2xl p-6 md:p-7"
      style={{
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--ffv-blue) 8%, var(--ffv-bg2)) 0%, var(--ffv-bg2) 100%)',
        border: '1px solid color-mix(in srgb, var(--ffv-blue) 28%, var(--ffv-border))',
        animation: 'ffv-fade-in-up 480ms cubic-bezier(0.25, 1, 0.5, 1)',
      }}
    >
      <div className="flex items-start gap-4">
        <span style={{ fontSize: 28, flexShrink: 0 }} aria-hidden>🎯</span>
        <div className="flex-1 min-w-0">
          <h3
            style={{
              fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.015em',
              lineHeight: 1.25,
              marginBottom: 6,
              color: 'var(--foreground)',
            }}
          >
            Que tal salvar esse progresso de leitura?
          </h3>
          <p
            className="text-sm"
            style={{ color: 'var(--ffv-muted)', lineHeight: 1.55, marginBottom: 14 }}
          >
            Você leu até aqui — crie conta gratuita pra continuar de onde parou,
            ganhar XP e receber uma trilha personalizada.
          </p>

          {/* 3 bullets curtos — Lei de Hick (≤7 itens) e ancoragem positiva */}
          <ul
            className="flex flex-col gap-1.5 mb-4"
            style={{ listStyle: 'none', padding: 0, margin: 0 }}
          >
            <BenefitBullet text="Continuar de onde parou em qualquer dispositivo" />
            <BenefitBullet text="Ganhar XP e badges por cada módulo lido" />
            <BenefitBullet text="Sua própria trilha personalizada" />
          </ul>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSignup}
              className="font-bold text-sm py-2.5 px-5 rounded-xl transition-all"
              style={{
                background: 'var(--ffv-blue)',
                color: '#fff',
                boxShadow:
                  '0 8px 24px -6px color-mix(in srgb, var(--ffv-blue) 45%, transparent)',
              }}
              data-testid="post-read-signup-cta-primary"
            >
              Criar conta grátis →
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="font-semibold text-sm py-2.5 px-4 rounded-xl transition-all"
              style={{
                background: 'transparent',
                color: 'var(--ffv-muted)',
                border: '1px solid var(--ffv-border)',
              }}
              data-testid="post-read-signup-cta-dismiss"
            >
              Continuar sem conta
            </button>
            <p
              className="text-[11px] ml-auto"
              style={{ color: 'var(--ffv-muted)', letterSpacing: '0.02em' }}
            >
              30s · sem cartão · sem senha
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** BenefitBullet — checkmark + texto. Inline pra evitar ImportCycle. */
function BenefitBullet({ text }: { text: string }) {
  return (
    <li
      className="flex items-start gap-2 text-xs"
      style={{ color: 'var(--foreground)', lineHeight: 1.5 }}
    >
      <span
        aria-hidden
        style={{
          color: 'var(--ffv-green)',
          fontWeight: 800,
          fontSize: 13,
          marginTop: 1,
          flexShrink: 0,
        }}
      >
        ✓
      </span>
      <span>{text}</span>
    </li>
  );
}
