'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useActiveBase } from '@/components/base/ActiveBaseContext';

/**
 * BaseTour — tour interativo de 3 passos pra novos usuários de uma base.
 *
 * Dispara quando:
 *  - Usuário tem `interestedBases` configurado (silent-activated em uma base
 *    OR completou onboarding)
 *  - Nunca viu o tour antes (ffv_tour_seen no localStorage)
 *  - Está na home de uma base (não em rota global/marketing)
 *
 * 3 passos:
 *  1. Chip de base no header (indicador "você está em X")
 *  2. Botão "Progresso" no header (dashboard pessoal)
 *  3. CTA primário da base (começar primeiro módulo)
 *
 * Estilo: overlay com spotlight em cada elemento. Skip/dismiss salva o flag
 * pra nunca aparecer de novo nessa máquina.
 *
 * Posicionamento (2026-05-21): mede altura REAL do tooltip via ref +
 * auto-FLIP entre top/bottom quando não couber no placement preferido.
 * Antes assumia altura fixa de 200px → tooltip cobria o alvo.
 */

const TOUR_STORAGE_KEY = 'ffv_tour_seen';
const TIP_GAP = 16; // gap entre tooltip e alvo
const VIEWPORT_PAD = 16; // distância mínima das bordas

interface TourStep {
  /** CSS selector do elemento alvo. */
  target: string;
  title: string;
  body: string;
  /** Posição preferida do tooltip relativa ao alvo. Pode FLIPar em runtime. */
  placement: 'bottom' | 'top';
}

type ComputedPlacement = 'top' | 'bottom';

export function BaseTour() {
  const { base: activeBase, isPathnameDerived } = useActiveBase();
  const [stepIndex, setStepIndex] = useState(0);
  const [active, setActive] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [computedPlacement, setComputedPlacement] = useState<ComputedPlacement>('bottom');

  const tipRef = useRef<HTMLDivElement | null>(null);

  const steps: TourStep[] = [
    {
      target: '[aria-label*="Trocar base"], [aria-label*="Home da base"]',
      title: `Você está em ${activeBase.name}`,
      body: 'Esse chip indica em qual base você está — e te leva pra home dela em 1 clique. Se houver mais bases, abre um menu pra trocar.',
      placement: 'bottom',
    },
    {
      target: 'a[href="/progresso"]',
      title: 'Seu progresso é por base',
      body: 'Aqui você vê XP, badges, trilhas e cards de revisão — sempre filtrado pela base atual. Nada de mistura.',
      placement: 'bottom',
    },
    {
      target: 'main a[href*="modulo"], main a[href*="/aprenda/"], main a[href*="/medicina-veterinaria/"]',
      title: 'Comece pelo primeiro módulo',
      body: 'Cada módulo traz teoria, exercícios e questões que viram cards de revisão espaçada. SM-2, o mesmo do Anki.',
      placement: 'top',
    },
  ];

  // Decide se mostra o tour ao montar.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(TOUR_STORAGE_KEY) === '1') return;
    if (!isPathnameDerived) return; // só dispara dentro de uma base
    const params = new URLSearchParams(window.location.search);
    if (params.get('skipTour') === '1' || params.get('skipOnboarding') === '1') return;
    const t = setTimeout(() => setActive(true), 1200);
    return () => clearTimeout(t);
  }, [isPathnameDerived]);

  // Recalcula a posição do alvo quando o passo muda.
  useEffect(() => {
    if (!active) return;
    function locate() {
      const step = steps[stepIndex];
      if (!step) return;
      const el = document.querySelector<HTMLElement>(step.target);
      if (!el) {
        setStepIndex(i => i + 1);
        return;
      }
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      if (rect.top < 80 || rect.bottom > window.innerHeight - 80) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    locate();
    window.addEventListener('resize', locate);
    window.addEventListener('scroll', locate, { passive: true });
    return () => {
      window.removeEventListener('resize', locate);
      window.removeEventListener('scroll', locate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIndex]);

  // Decide placement REAL (com flip) medindo altura do tooltip + espaço
  // disponível acima/abaixo do alvo. Roda em useLayoutEffect pra evitar
  // flash visual de "cobre o alvo → ajusta posição".
  useLayoutEffect(() => {
    if (!active || !targetRect || !tipRef.current) return;
    const tipH = tipRef.current.offsetHeight;
    const step = steps[stepIndex];
    if (!step) return;

    const spaceAbove = targetRect.top - TIP_GAP - VIEWPORT_PAD;
    const spaceBelow = window.innerHeight - targetRect.bottom - TIP_GAP - VIEWPORT_PAD;
    const fitsAbove = spaceAbove >= tipH;
    const fitsBelow = spaceBelow >= tipH;

    // Preferência do step se couber; senão FLIP; senão fica do lado com
    // mais espaço.
    let next: ComputedPlacement;
    if (step.placement === 'top' && fitsAbove) next = 'top';
    else if (step.placement === 'bottom' && fitsBelow) next = 'bottom';
    else if (fitsAbove) next = 'top';
    else if (fitsBelow) next = 'bottom';
    else next = spaceAbove > spaceBelow ? 'top' : 'bottom';

    setComputedPlacement(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIndex, targetRect]);

  function finish() {
    try { window.localStorage.setItem(TOUR_STORAGE_KEY, '1'); } catch { /* */ }
    setActive(false);
  }

  function next() {
    if (stepIndex >= steps.length - 1) {
      finish();
      return;
    }
    setStepIndex(i => i + 1);
  }

  function skip() {
    finish();
  }

  if (!active || stepIndex >= steps.length) return null;

  const currentStep = steps[stepIndex];
  if (!currentStep) return null;

  // Posição do tooltip — usa altura medida + gap fixo. Quando não couber
  // de jeito nenhum (alvo gigante), cai centralizado na tela.
  const tipH = tipRef.current?.offsetHeight ?? 240;
  const TIP_WIDTH = 320;

  // Centraliza horizontalmente acima do alvo, com clamp pras bordas.
  const horizontalLeft = targetRect
    ? Math.max(
        VIEWPORT_PAD,
        Math.min(
          window.innerWidth - TIP_WIDTH - VIEWPORT_PAD,
          targetRect.left + targetRect.width / 2 - TIP_WIDTH / 2,
        ),
      )
    : window.innerWidth / 2 - TIP_WIDTH / 2;

  const tipStyle: React.CSSProperties = targetRect
    ? computedPlacement === 'bottom'
      ? {
          position: 'fixed',
          top: targetRect.bottom + TIP_GAP,
          left: horizontalLeft,
        }
      : {
          position: 'fixed',
          top: Math.max(VIEWPORT_PAD, targetRect.top - tipH - TIP_GAP),
          left: horizontalLeft,
        }
    : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };

  // Posição da seta (aponta pro alvo).
  const arrowStyle: React.CSSProperties | null = targetRect
    ? {
        position: 'absolute',
        left: Math.max(
          16,
          Math.min(
            TIP_WIDTH - 16,
            targetRect.left + targetRect.width / 2 - horizontalLeft,
          ),
        ) - 6,
        width: 12,
        height: 12,
        background: 'var(--ffv-bg2)',
        border: '1px solid var(--ffv-border)',
        transform: 'rotate(45deg)',
        ...(computedPlacement === 'bottom'
          ? { top: -7, borderRight: 'none', borderBottom: 'none' }
          : { bottom: -7, borderLeft: 'none', borderTop: 'none' }),
      }
    : null;

  return (
    <div
      role="dialog"
      aria-label={`Tour de boas-vindas — passo ${stepIndex + 1} de ${steps.length}`}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}
    >
      {/* Overlay escurecido */}
      <div
        aria-hidden
        onClick={skip}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          pointerEvents: 'auto',
          cursor: 'pointer',
        }}
      />

      {/* Spotlight no alvo */}
      {targetRect && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            borderRadius: 12,
            boxShadow:
              '0 0 0 9999px rgba(15, 23, 42, 0.55), 0 0 0 4px color-mix(in srgb, var(--ffv-blue) 60%, transparent)',
            pointerEvents: 'none',
            transition: 'top 200ms ease, left 200ms ease, width 200ms ease, height 200ms ease',
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        ref={tipRef}
        style={{
          ...tipStyle,
          width: TIP_WIDTH,
          maxWidth: 'calc(100vw - 32px)',
          padding: '20px 22px',
          borderRadius: 14,
          background: 'var(--ffv-bg2)',
          border: '1px solid var(--ffv-border)',
          boxShadow: '0 24px 60px -12px rgba(0,0,0,0.45)',
          pointerEvents: 'auto',
          color: 'var(--foreground)',
        }}
      >
        {arrowStyle && <span aria-hidden style={arrowStyle} />}

        <p
          className="font-mono uppercase"
          style={{
            fontSize: 10,
            color: 'var(--ffv-muted)',
            letterSpacing: '0.18em',
            marginBottom: 8,
            fontWeight: 700,
          }}
        >
          Tour · {stepIndex + 1} de {steps.length}
        </p>
        <h3
          style={{
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: '-0.01em',
            marginBottom: 8,
          }}
        >
          {currentStep.title}
        </h3>
        <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--ffv-muted)', marginBottom: 18 }}>
          {currentStep.body}
        </p>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={skip}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ffv-muted)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Pular tour
          </button>
          <button
            type="button"
            onClick={next}
            autoFocus
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              background: 'var(--ffv-blue)',
              color: '#0d1117',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {stepIndex >= steps.length - 1 ? 'Concluir' : 'Próximo →'}
          </button>
        </div>
      </div>
    </div>
  );
}
