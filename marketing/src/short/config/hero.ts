import type { HeroConfig } from './types';
import { COLORS } from '../styles/short-tokens';

/**
 * HeroConfig — base compartilhada pelas 4 variantes.
 *
 * Storytelling:
 *   0-3s   HOOK   — "QUER APRENDER IA DE VERDADE?"
 *   3-7s   PAIN   — cursos caros, paywall, enrolacao
 *   7-11s  REVEAL — FFV ACADEMY aparece com brand + sub-linha
 *   11-41s DEMO   — 8 features em corte rapido:
 *     1. Hub IA
 *     2. Hub AWS
 *     3. Hub Engenharia
 *     4. Hub Claude
 *     5. Artigo tecnico (TOC)
 *     6. Quiz + XP
 *     7. Dashboard progresso
 *     8. Revisao espacada (SM-2)
 *   41-51s PROOF  — 4 numeros com explosao
 *   51-60s CTA    — logo + URL + "ACESSE AGORA"
 */
export const hero: HeroConfig = {
  title: 'Hero 60s — Comercial FFV Academy',
  accentColor: COLORS.accentHero,
  accentSecondary: COLORS.accentGold,
  track: '/audio/background.mp3',
  trackVolume: 0.24,

  beats: [
    // HOOK (0-3s = 90 frames)
    { id: 'h-01-hook', slot: 'hook', motion: 'punchIn', durationFrames: 90, trimEnd: 3 },

    // PAIN (3-7s = 120 frames)
    { id: 'h-02-pain', slot: 'pain', motion: 'kenBurns', durationFrames: 120, trimEnd: 4 },

    // REVEAL (7-11s = 120 frames)
    { id: 'h-03-reveal', slot: 'reveal', motion: 'floatTilt', durationFrames: 120, trimEnd: 4 },

    // DEMO FIRE (11-41s = 900 frames, 8 beats × 112-116 frames)
    { id: 'h-04-hub-ia',         slot: 'demo', motion: 'punchIn',  durationFrames: 112, trimEnd: 3.7 },
    { id: 'h-05-hub-aws',        slot: 'demo', motion: 'panLeft',  durationFrames: 112, trimEnd: 3.7 },
    { id: 'h-06-hub-eng',        slot: 'demo', motion: 'panRight', durationFrames: 112, trimEnd: 3.7 },
    { id: 'h-07-hub-claude',     slot: 'demo', motion: 'punchIn',  durationFrames: 112, trimEnd: 3.7 },
    { id: 'h-08-artigo-toc',     slot: 'demo', motion: 'kenBurns', durationFrames: 112, trimEnd: 3.7 },
    { id: 'h-09-quiz-xp',        slot: 'demo', motion: 'clickZoom', durationFrames: 116, trimEnd: 4.0, playbackRate: 1.3 },
    { id: 'h-10-progresso',      slot: 'demo', motion: 'punchIn',  durationFrames: 112, trimEnd: 3.7 },
    { id: 'h-11-srs',            slot: 'demo', motion: 'clickZoom', durationFrames: 112, trimEnd: 3.7 },

    // PROOF (41-51s = 300 frames) — video em background
    { id: 'h-12-home-final',     slot: 'proof', motion: 'kenBurns', durationFrames: 300, trimEnd: 10 },
  ],

  captions: [
    // HOOK — 2 captions alternadas
    { text: 'QUER APRENDER',     slot: 'hook', style: 'hook',   enter: 'glitch',  position: 'middle', offsetFrames: 0,  durationFrames: 40 },
    { text: 'IA DE VERDADE?',    slot: 'hook', style: 'hook',   enter: 'punch',   position: 'middle', offsetFrames: 40, durationFrames: 50 },

    // PAIN — 3 pills empilhadas que dizem "sem"
    { text: 'SEM curso de 2 mil', slot: 'pain', style: 'pill',  enter: 'bounce',  position: 'bottom', offsetFrames: 0,  durationFrames: 40, accent: COLORS.accentHot },
    { text: 'SEM paywall',        slot: 'pain', style: 'pill',  enter: 'bounce',  position: 'middle', offsetFrames: 40, durationFrames: 40, accent: COLORS.accentHot },
    { text: 'SEM enrolação',      slot: 'pain', style: 'pill',  enter: 'punch',   position: 'top',    offsetFrames: 80, durationFrames: 40, accent: COLORS.accentHot },

    // REVEAL — linha de apoio depois do logo formar
    { text: 'a plataforma gratuita para devs sérios', slot: 'reveal', style: 'normal', enter: 'maskReveal', position: 'bottom', offsetFrames: 85, durationFrames: 35 },

    // DEMO — caption por feature
    { text: 'INTELIGÊNCIA ARTIFICIAL', slot: 'demo', style: 'feature', enter: 'slideUp',    position: 'top',    offsetFrames: 0,    durationFrames: 90 },
    { text: 'AWS CLOUD',               slot: 'demo', style: 'feature', enter: 'slideUp',    position: 'top',    offsetFrames: 112,  durationFrames: 90 },
    { text: 'ENGENHARIA DE SOFTWARE',  slot: 'demo', style: 'feature', enter: 'slideUp',    position: 'top',    offsetFrames: 224,  durationFrames: 90 },
    { text: 'CLAUDE · ANTHROPIC',      slot: 'demo', style: 'feature', enter: 'slideUp',    position: 'top',    offsetFrames: 336,  durationFrames: 90 },
    { text: 'artigos técnicos profundos',            slot: 'demo', style: 'normal',  enter: 'maskReveal', position: 'bottom', offsetFrames: 448,  durationFrames: 100 },
    { text: 'quiz + XP a cada aula',                 slot: 'demo', style: 'normal',  enter: 'punch',      position: 'bottom', offsetFrames: 560,  durationFrames: 100 },
    { text: 'streak · nível · badges',               slot: 'demo', style: 'normal',  enter: 'slideUp',    position: 'bottom', offsetFrames: 676,  durationFrames: 100 },
    { text: 'revisão espaçada SM-2',                 slot: 'demo', style: 'normal',  enter: 'slideUp',    position: 'bottom', offsetFrames: 788,  durationFrames: 100 },
  ],

  numbers: [
    // 4 numeros com explosao, 75 frames cada (300 total)
    { value: 157, label: 'ARTIGOS',   offsetFrames: 0,   durationFrames: 75, countFrames: 50, color: COLORS.accentHero,   icon: '📚' },
    { value: 16,  label: 'TRILHAS',   offsetFrames: 75,  durationFrames: 75, countFrames: 40, color: COLORS.accentGold,   icon: '🎯' },
    { value: 4,   label: 'HUBS',      offsetFrames: 150, durationFrames: 75, countFrames: 25, color: COLORS.accentSecondary, icon: '🧠' },
    { value: 100, label: 'GRATUITO',  offsetFrames: 225, durationFrames: 75, countFrames: 45, suffix: '%', color: COLORS.accentGreen, icon: '🔥' },
  ],

  cta: {
    url: 'fernandofrancovalle.com',
    primary: 'GRATUITO · SEM CADASTRO · SEM PAYWALL',
    secondary: 'fernandofrancovalle.com',
    tagline: 'ACESSE AGORA',
  },
};
