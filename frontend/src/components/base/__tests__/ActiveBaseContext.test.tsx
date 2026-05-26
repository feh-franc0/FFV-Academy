/**
 * ActiveBaseProvider tests
 *
 * Garante o invariante crítico: a base "ativa" é determinada pelo pathname
 * quando o usuário está em uma base, e cai pra persistência localStorage
 * quando ele navega para rotas globais.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { ActiveBaseProvider, useActiveBase } from '../ActiveBaseContext';

const STORAGE_KEY = 'ffv_active_base_slug';

let mockPathname = '/';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return <ActiveBaseProvider>{children}</ActiveBaseProvider>;
}

beforeEach(() => {
  window.localStorage.clear();
  mockPathname = '/';
});

describe('ActiveBaseProvider — derivação por pathname', () => {
  it('em /tecnologia → base ativa é tecnologia (pathname-derived)', async () => {
    mockPathname = '/tecnologia';
    const { result } = renderHook(() => useActiveBase(), { wrapper });
    await waitFor(() => expect(result.current.base.slug).toBe('tecnologia'));
    expect(result.current.isPathnameDerived).toBe(true);
  });

  it('em /medicina-veterinaria/foo → base ativa é medvet', async () => {
    mockPathname = '/medicina-veterinaria/genetica-mendel';
    const { result } = renderHook(() => useActiveBase(), { wrapper });
    await waitFor(() => expect(result.current.base.slug).toBe('medicina-veterinaria'));
    expect(result.current.isPathnameDerived).toBe(true);
  });

  it('em /aprenda/foo (legado tech) → base ativa é tecnologia', async () => {
    mockPathname = '/aprenda/qualquer-modulo';
    const { result } = renderHook(() => useActiveBase(), { wrapper });
    await waitFor(() => expect(result.current.base.slug).toBe('tecnologia'));
  });
});

describe('ActiveBaseProvider — persistência via localStorage', () => {
  it('persiste a base assim que o usuário entra em uma rota da base', async () => {
    mockPathname = '/medicina-veterinaria';
    renderHook(() => useActiveBase(), { wrapper });
    await waitFor(() => expect(window.localStorage.getItem(STORAGE_KEY)).toBe('medicina-veterinaria'));
  });

  it('em rota global, herda a base do storage (sticky)', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'medicina-veterinaria');
    mockPathname = '/progresso';
    const { result } = renderHook(() => useActiveBase(), { wrapper });
    await waitFor(() => expect(result.current.base.slug).toBe('medicina-veterinaria'));
    expect(result.current.isPathnameDerived).toBe(false);
  });

  it('em rota global sem storage → cai no default (tecnologia)', async () => {
    mockPathname = '/progresso';
    const { result } = renderHook(() => useActiveBase(), { wrapper });
    await waitFor(() => expect(result.current.base.slug).toBe('tecnologia'));
    expect(result.current.isPathnameDerived).toBe(false);
  });

  it('rota global NÃO sobrescreve o storage (não polui)', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'medicina-veterinaria');
    mockPathname = '/progresso';
    renderHook(() => useActiveBase(), { wrapper });
    await new Promise(resolve => setTimeout(resolve, 30));
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('medicina-veterinaria');
  });

  it('rota de marketing NÃO sobrescreve o storage', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'medicina-veterinaria');
    mockPathname = '/';
    renderHook(() => useActiveBase(), { wrapper });
    await new Promise(resolve => setTimeout(resolve, 30));
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('medicina-veterinaria');
  });
});

describe('ActiveBaseProvider — fluxo realista do usuário', () => {
  it('medvet → /progresso → tecnologia → /progresso: storage acompanha', async () => {
    // 1. Usuário entra em medvet
    mockPathname = '/medicina-veterinaria';
    const { result, rerender } = renderHook(() => useActiveBase(), { wrapper });
    await waitFor(() => expect(result.current.base.slug).toBe('medicina-veterinaria'));

    // 2. Navega para /progresso — fica como medvet (sticky)
    mockPathname = '/progresso';
    rerender();
    await waitFor(() => expect(result.current.base.slug).toBe('medicina-veterinaria'));
    expect(result.current.isPathnameDerived).toBe(false);

    // 3. Entra em tecnologia
    mockPathname = '/tecnologia';
    rerender();
    await waitFor(() => expect(result.current.base.slug).toBe('tecnologia'));

    // 4. Volta pra /progresso — agora é tech (storage atualizado)
    mockPathname = '/progresso';
    rerender();
    await waitFor(() => expect(result.current.base.slug).toBe('tecnologia'));
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('tecnologia');
  });
});

describe('useActiveBase — fallback fora do provider', () => {
  it('sem provider → devolve default tecnologia em vez de quebrar', () => {
    const { result } = renderHook(() => useActiveBase());
    expect(result.current.base.slug).toBe('tecnologia');
    expect(result.current.isPathnameDerived).toBe(false);
  });
});

describe('setBaseSlug — switcher manual', () => {
  it('permite trocar a base ativa programaticamente', async () => {
    mockPathname = '/progresso';
    const { result } = renderHook(() => useActiveBase(), { wrapper });
    await waitFor(() => expect(result.current.base.slug).toBe('tecnologia'));

    act(() => {
      result.current.setBaseSlug('medicina-veterinaria');
    });

    await waitFor(() => expect(result.current.base.slug).toBe('medicina-veterinaria'));
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('medicina-veterinaria');
  });

  it('ignora slug inexistente — não quebra nem polui storage', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'medicina-veterinaria');
    mockPathname = '/progresso';
    const { result } = renderHook(() => useActiveBase(), { wrapper });
    await waitFor(() => expect(result.current.base.slug).toBe('medicina-veterinaria'));

    act(() => {
      result.current.setBaseSlug('fantasma-que-nao-existe');
    });

    await new Promise(resolve => setTimeout(resolve, 30));
    expect(result.current.base.slug).toBe('medicina-veterinaria');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('medicina-veterinaria');
  });
});

describe('ActiveBaseProvider — renderização', () => {
  it('renderiza children sem crashar', () => {
    mockPathname = '/medicina-veterinaria';
    const { getByText } = render(
      <ActiveBaseProvider>
        <span>inside</span>
      </ActiveBaseProvider>
    );
    expect(getByText('inside')).toBeTruthy();
  });
});
