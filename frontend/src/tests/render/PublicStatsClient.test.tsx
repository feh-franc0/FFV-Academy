import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';

// Mock do fetch global pra controlar respostas do /api/v1/stats
const fetchMock = vi.hoisted(() => vi.fn());
global.fetch = fetchMock as unknown as typeof fetch;

import { PublicStatsClient } from '@/app/stats-publicas/PublicStatsClient';

beforeEach(() => {
  fetchMock.mockReset();
});
afterEach(cleanup);

describe('<PublicStatsClient> — KPIs públicos com backend real', () => {
  it('estado loading: mostra "Sincronizando…" enquanto fetch está em voo', () => {
    fetchMock.mockImplementation(() => new Promise(() => { /* never resolves */ }));
    render(<PublicStatsClient />);
    expect(screen.getByText(/Sincronizando…/i)).toBeInTheDocument();
    // Mas KPIs estáticos ainda renderizam (skeleton com valores fallback)
    expect(screen.getByText(/Bases ativas/i)).toBeInTheDocument();
  });

  it('estado ready: substitui fallback pelos números reais do backend', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totalUsers: 100,
        activeWeekly: 20,
        totalXpAwarded: 5000,
        basesLive: 2,
        studyRequestsTotal: 50,
        studyRequestsDelivered: 47,
      }),
    });
    render(<PublicStatsClient />);
    await waitFor(() => {
      expect(screen.getByText(/47\/50 entregues no SLA/i)).toBeInTheDocument();
    });
    // 94% derivado
    expect(screen.getByText('94')).toBeInTheDocument();
  });

  it('estado ready com amostra <5: mostra "—" em vez de inflate', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totalUsers: 10,
        activeWeekly: 5,
        totalXpAwarded: 100,
        basesLive: 2,
        studyRequestsTotal: 3,
        studyRequestsDelivered: 3,
      }),
    });
    render(<PublicStatsClient />);
    await waitFor(() => {
      expect(screen.getByText(/aguardando amostra/i)).toBeInTheDocument();
    });
  });

  it('estado error: mostra microcopy informando fallback', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });
    render(<PublicStatsClient />);
    await waitFor(() => {
      expect(screen.getByText(/backend indisponível/i)).toBeInTheDocument();
    });
  });

  it('KPIs estáticos sempre presentes: custo, treinar IA, AB30', () => {
    fetchMock.mockImplementation(() => new Promise(() => {}));
    render(<PublicStatsClient />);
    expect(screen.getByText(/Custo médio por base/i)).toBeInTheDocument();
    expect(screen.getByText(/Material treinou IA/i)).toBeInTheDocument();
    expect(screen.getByText(/AB30/i)).toBeInTheDocument();
    expect(screen.getByText(/<R\$ 10/)).toBeInTheDocument();
    expect(screen.getByText('Não')).toBeInTheDocument();
  });

  it('data de atualização + compromisso semanal sempre visíveis', () => {
    fetchMock.mockImplementation(() => new Promise(() => {}));
    render(<PublicStatsClient />);
    expect(screen.getByText(/Atualizado em/)).toBeInTheDocument();
    expect(screen.getByText(/segunda-feira/)).toBeInTheDocument();
  });

  it('cancela fetch em unmount (evita memory leak / setState após unmount)', () => {
    const abort = vi.fn();
    fetchMock.mockImplementation((_url, opts) => {
      // Quando o signal abortar, registra
      opts?.signal?.addEventListener('abort', abort);
      return new Promise(() => {});
    });
    const { unmount } = render(<PublicStatsClient />);
    unmount();
    expect(abort).toHaveBeenCalled();
  });
});
