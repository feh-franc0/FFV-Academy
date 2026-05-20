// Cliente do endpoint público GET /api/v1/bases.
// Usado por /bases (listagem) e potencialmente outras seções do app.

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
