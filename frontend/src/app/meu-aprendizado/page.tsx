import type { Metadata } from 'next';
import { LearningMirrorClient } from './LearningMirrorClient';

export const metadata: Metadata = {
  title: 'Meu aprendizado — FFV Academy',
  description:
    'O que você consolidou de verdade. Memória de longo prazo, próxima revisão e pontos cegos detectados pelo SRS — Spotify Wrapped do seu estudo. Defensável vs ChatGPT e NotebookLM, que esquecem você no dia seguinte.',
};

/**
 * /meu-aprendizado — Espelho de Aprendizado.
 *
 * Feature defensável #1 do EXECUTIVE_PLAN_2026-05.md:
 * "Cada usuário recebe email semanal com: você sabia X módulos. Hoje sabe Y.
 * Esqueceu Z (já agendado pra revisão). Seus 3 pontos cegos: …
 * Dado defensável: somos os únicos com memória longitudinal real do que o
 * aluno sabe — NotebookLM/ChatGPT não persistem isso."
 *
 * V1: página personalizada que lê do GameState local. Shareable card
 * (sem upload de imagem ainda — só visual). V2: email semanal automático
 * via cron Go.
 */
export default function MeuAprendizadoPage() {
  return <LearningMirrorClient />;
}
