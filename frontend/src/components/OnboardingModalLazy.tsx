'use client';

import dynamic from 'next/dynamic';

/**
 * Casca cliente para carregar o onboarding sob demanda.
 *
 * Ela existe por uma restrição do framework: `ssr: false` não é permitido em
 * Server Component, e o layout raiz é um. Sem esta casca, a única forma de
 * manter o modal no layout seria importá-lo de forma estática — que é
 * exatamente o que se quer evitar.
 *
 * O que se ganha: o `OnboardingModal` usa `CURRICULUM` para recomendar hub e
 * trilha, e só aparece na PRIMEIRA visita. Estático, ele colocava os 224 KB do
 * currículo no primeiro carregamento de todas as 95 rotas — para todo mundo,
 * inclusive quem passou pelo onboarding meses atrás e nunca mais o verá.
 */
const OnboardingModal = dynamic(
  () => import('./OnboardingModal').then(m => ({ default: m.OnboardingModal })),
  { ssr: false },
);

export function OnboardingModalLazy() {
  return <OnboardingModal />;
}
