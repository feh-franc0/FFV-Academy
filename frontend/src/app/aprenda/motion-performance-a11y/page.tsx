import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue } from '@/components/article/primitives';

export const metadata = getModuleMetadata('motion-performance-a11y');

const accent = '#f472b6';

const quiz: QuizQuestion[] = [
  { question: 'Quais propriedades CSS são "composite-only" (não disparam reflow nem paint, só composite na GPU)?', options: ['width, height, margin', 'transform, opacity, filter (alguns valores) — animá-las é grátis em performance porque pula layout e paint pipeline', 'top, left', 'border'], correct: 1, explanation: 'Composite-only properties são animadas no compositor (GPU), sem reflow/repaint. Por isso transform + opacity são o pão-com-manteiga de motion performance. Anime top/left e você dispara reflow do documento inteiro.' },
  { question: 'will-change deveria ser usado:', options: ['Em todos elementos', 'Com cautela — sinaliza ao browser para promover elemento a GPU layer ANTES da animação começar. Mas custa memória; usar em tudo destrói performance. Aplique imediatamente antes da animação e remova depois', 'Nunca', 'Apenas em texto'], correct: 1, explanation: 'will-change é poderoso e perigoso. Promove layer GPU, custa VRAM. Use só onde anima de fato; remova após. Pattern: adicionar em :hover, remover ao final da animação.' },
  { question: 'prefers-reduced-motion respeitado em motion lib:', options: ['Não precisa', 'OBRIGATÓRIO. ~35% de usuários com vestibular disorders relatam náusea/tontura com motion. CSS @media (prefers-reduced-motion: reduce); JS lib check matchMedia. Motion deve cair para fade ou no-op', 'Apenas em mobile', 'Opcional'], correct: 1, explanation: 'WCAG 2.3.3 + experience real. Usuários com motion sensitivity usam OS-level setting. Sua animação flashy = experiência hostil. Sempre teste com prefers-reduced-motion: reduce ativo.' },
  { question: 'FPS budget para animação smooth:', options: ['30fps', '60fps mínimo (16.67ms/frame), idealmente 120fps em ProMotion / monitor 144Hz. Cada frame tem que cumprir o budget OU o usuário vê stutter', '15fps', '100fps'], correct: 1, explanation: '60fps = 16.67ms total por frame para JS + style + layout + paint + composite. Ultrapassar = frame drop, jitter visível. 120Hz/144Hz = 8.33ms / 6.94ms. Use Performance panel do DevTools.' },
  { question: 'Lighthouse "Avoid non-composited animations" alerta sobre:', options: ['Cor', 'Animações que disparam layout/paint (animar width, top, padding). Solução: refatorar para transform/opacity, usar will-change quando necessário', 'Apenas vídeo', 'Inexistente'], correct: 1, explanation: 'Audit clássico Lighthouse. Mostra quais animações são non-composite e custosas. Refatorar resolvendo isso melhora INP (Interaction to Next Paint) — Core Web Vital.' },
];

export default function Page() {
  return (
    <ModuleLayout slug="motion-performance-a11y" title="Motion performance + A11y: prefers-reduced-motion" icon="⚡" xp={60} readTime={12}
      trailName="Animation & Motion Engineering" trailColor={accent} quiz={quiz}>
      <Section title="O budget de 16.67ms" accent={accent}>
        <p className="text-sm leading-6">60fps = 16.67ms por frame. Nesse tempo, browser precisa: rodar JS, computar style, layout (se necessário), paint (se necessário), composite. Ultrapassou = janked. Em 120Hz (ProMotion), são apenas 8.33ms. Motion bonita em ProMotion é mais difícil.</p>
      </Section>
      <Section title="As propriedades caras vs baratas" accent={accent}>
        <ComparisonTable accent={accent} headers={['Property', 'Custo', 'Por quê']} rows={[
          ['transform', 'Composite-only (barato)', 'GPU compositor — sem reflow/repaint'],
          ['opacity', 'Composite-only (barato)', 'GPU compositor'],
          ['filter (alguns)', 'Composite-only quando GPU-friendly', 'Depende do filtro'],
          ['top / left / right / bottom', 'Reflow + paint + composite (caro)', 'Mexe geometria do documento'],
          ['width / height', 'Reflow + paint (caro)', 'Layout invalidation propaga'],
          ['margin / padding', 'Reflow + paint (caro)', 'Layout invalidation'],
          ['background-color', 'Paint + composite (médio)', 'Repaint sem reflow'],
          ['box-shadow', 'Paint (caro)', 'Especialmente em shadows grandes/blur'],
        ]} />
      </Section>
      <Section title="will-change com cautela" accent={accent}>
        <CodeBlock lang="css">{`/* ❌ NÃO faça */
* {
  will-change: transform, opacity;  /* destrói memory */
}

/* ✅ Aplicação cirúrgica */
.card {
  /* sem will-change por default */
}
.card.is-animating {
  will-change: transform;  /* só durante animação */
}`}</CodeBlock>
        <CodeBlock lang="typescript">{`// JS pattern: add antes, remove depois
function animateCard(card: HTMLElement) {
  card.style.willChange = 'transform';
  card.animate(
    [{ transform: 'translateY(0)' }, { transform: 'translateY(-20px)' }],
    { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
  ).addEventListener('finish', () => {
    card.style.willChange = 'auto';  // libera
  });
}`}</CodeBlock>
      </Section>
      <Section title="prefers-reduced-motion — implementação" accent={accent}>
        <CodeBlock lang="css">{`/* CSS — fallback global */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`}</CodeBlock>
        <CodeBlock lang="typescript">{`// JS — em motion libs
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduced) {
  // Pular animação ou cair para fade simples
  element.style.opacity = '1';
} else {
  // Animação completa
  element.animate(/* ... */);
}

// Em Framer Motion / Motion lib
import { useReducedMotion } from 'framer-motion';
const shouldReduce = useReducedMotion();`}</CodeBlock>
      </Section>
      <Section title="Performance debugging" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'DevTools Performance panel', v: 'Grava trace, identifica long tasks > 50ms, Layout shifts, paint storms' },
          { k: 'Rendering tab', v: 'Frame Rendering Stats (FPS overlay), Paint Flashing (highlights repaints), Layer Borders' },
          { k: 'Lighthouse', v: 'Audit "Avoid non-composited animations" + INP/CLS scores' },
          { k: 'web-vitals.js', v: 'Logar INP em produção, identificar páginas com motion problemático' },
          { k: 'Chrome Frame Timing API', v: 'PerformanceObserver para measure custom em produção' },
        ]} />
      </Section>
      <Section title="Checklist final de motion" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: '✅ Usar transform/opacity sempre que possível', v: 'Não animar top/left/width/height' },
          { k: '✅ prefers-reduced-motion respeitado', v: 'CSS @media + JS matchMedia' },
          { k: '✅ Durações curtas (150-300ms)', v: 'Motion longa cansa em uso repetitivo' },
          { k: '✅ Easing curves apropriadas', v: 'cubic-bezier(0.4, 0, 0.2, 1) é o "Material standard"' },
          { k: '✅ Test em low-end device', v: 'Chrome DevTools throttling CPU 6x slowdown' },
          { k: '✅ Não bloquear interação durante animação', v: 'pointer-events em elementos animados — cuidado' },
        ]} />
      </Section>
      <Callout tone="success" icon="🎓">Trilha Animation & Motion Engineering concluída. Badge <b>Motion Engineer</b> desbloqueado.</Callout>
    </ModuleLayout>
  );
}
