import type { Metadata } from 'next';
import { DiffDeConhecimentoClient } from './DiffDeConhecimentoClient';

export const metadata: Metadata = {
  title: 'Diff de Conhecimento — FFV Academy',
  description:
    'Veja quanto você sabe vs ChatGPT e Gemini no MESMO quiz. Evidência matemática de calibração — algo que nenhuma outra plataforma faz.',
};

/**
 * /diff-de-conhecimento — Feature defensável #1 do MARKET_REFRESH_2026-05.md
 *
 * Estratégico: única plataforma que mostra MATEMATICAMENTE onde o aluno
 * vence o ChatGPT/Gemini no mesmo material. Honestidade competitiva como
 * arma (EXECUTIVE_PLAN_2026-05.md).
 *
 * V1: dados mockados representativos (lib/diff-de-conhecimento.ts).
 * V2: backend POST /api/v1/diff-de-conhecimento chama Claude+Gemini APIs
 *     com o quiz real do aluno.
 */
export default function DiffDeConhecimentoPage() {
  return <DiffDeConhecimentoClient />;
}
