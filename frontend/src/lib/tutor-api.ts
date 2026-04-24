'use client';

/**
 * Tutor API adapter — suporta mock e streaming real via SSE.
 *
 * Mock: devolve as respostas estáticas de tutor-responses.ts.
 * Real: POST /api/v1/tutor/ask → Server-Sent Events (SSE).
 *
 * O backend aceita kind: "por-que" | "analogia" | "exemplo"
 * e retorna eventos `data: {"delta":"token"}\n\n` até `data: {"done":true}\n\n`.
 */

import { hasBackend, getAccessToken } from './api-client';
import { getTutorResponse, getFallbackResponse } from './tutor-responses';

// Re-export type para os componentes que precisam
export type { TutorResponse } from './tutor-responses';

export type TutorKind = 'por-que' | 'analogia' | 'exemplo';

interface TutorAskPayload {
  questionId: string;
  kind: TutorKind;
  questionStem: string;
  correctOptionText?: string;
}

/**
 * Pede resposta ao tutor.
 *
 * @param payload    Parâmetros da pergunta
 * @param onToken    Callback chamado a cada token recebido (streaming)
 * @returns          Texto completo da resposta
 */
export async function askTutor(
  payload: TutorAskPayload,
  onToken: (delta: string) => void,
): Promise<string> {
  if (!hasBackend()) {
    return mockResponse(payload, onToken);
  }
  return streamResponse(payload, onToken);
}

// ─── Mock ──────────────────────────────────────────────────────────────────

async function mockResponse(
  payload: TutorAskPayload,
  onToken: (delta: string) => void,
): Promise<string> {
  const responses = getTutorResponse(payload.questionId)
    ?? getFallbackResponse('Explicação não disponível neste modo demo.');

  const text =
    payload.kind === 'por-que' ? responses.defaultResponse :
    payload.kind === 'analogia' ? responses.analogyResponse :
    responses.exampleResponse;

  // Simula stream token-a-token
  const words = text.split(' ');
  let full = '';
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i];
    full += chunk;
    onToken(chunk);
    await new Promise(r => setTimeout(r, 20));
  }
  return full;
}

// ─── SSE streaming ────────────────────────────────────────────────────────

function getTutorApiBase(): string {
  return (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) || '';
}

async function streamResponse(
  payload: TutorAskPayload,
  onToken: (delta: string) => void,
): Promise<string> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${getTutorApiBase()}/api/v1/tutor/ask`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Tutor API error: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (!json) continue;
      try {
        const event = JSON.parse(json) as { delta?: string; done?: boolean };
        if (event.done) return full;
        if (event.delta) {
          full += event.delta;
          onToken(event.delta);
        }
      } catch { /* ignora linha malformada */ }
    }
  }

  return full;
}
