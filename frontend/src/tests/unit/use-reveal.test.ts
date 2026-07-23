/**
 * Regressão: BasesClient renderiza <ul> de cards SÓ depois do fetch async.
 * O padrão antigo (`useRef + useEffect([])`) criava o IntersectionObserver
 * ANTES do <ul> existir → observer nunca anexava → cards ficavam invisíveis
 * (opacity:0) permanentemente. Bug reportado 2026-05-21.
 *
 * useReveal agora retorna callback ref — React invoca quando o nó monta.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReveal } from '@/lib/use-reveal';

describe('useReveal — callback ref que funciona com lazy-mount', () => {
  let observerSpy: ReturnType<typeof vi.fn>;
  let disconnectSpy: ReturnType<typeof vi.fn>;
  let unobserveSpy: ReturnType<typeof vi.fn>;
  let triggerIntersect: ((target: Element) => void) | null = null;

  beforeEach(() => {
    observerSpy = vi.fn();
    disconnectSpy = vi.fn();
    unobserveSpy = vi.fn();
    triggerIntersect = null;

    // Stub IntersectionObserver — guarda callback pra disparar manualmente.
    class MockIO {
      callback: IntersectionObserverCallback;
      constructor(cb: IntersectionObserverCallback) {
        this.callback = cb;
        triggerIntersect = (target: Element) => {
          // jsdom não tem IntersectionObserverEntry — mock mínimo.
          const entry = { isIntersecting: true, target } as unknown as IntersectionObserverEntry;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cb([entry], this as any);
        };
      }
      observe = observerSpy;
      disconnect = disconnectSpy;
      unobserve = unobserveSpy;
      takeRecords = () => [];
      root = null;
      rootMargin = '';
      thresholds = [];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).IntersectionObserver = MockIO as any;
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).IntersectionObserver;
  });

  it('cria observer quando o ref recebe um nó DOM (callback ref)', () => {
    const { result } = renderHook(() => useReveal<HTMLDivElement>());
    const refCb = result.current;
    expect(typeof refCb).toBe('function');

    const node = document.createElement('div');
    act(() => { refCb(node); });

    expect(observerSpy).toHaveBeenCalledTimes(1);
    expect(observerSpy).toHaveBeenCalledWith(node);
  });

  it('NÃO cria observer quando ref recebe null (cleanup safe)', () => {
    const { result } = renderHook(() => useReveal());
    act(() => { result.current(null); });
    expect(observerSpy).not.toHaveBeenCalled();
  });

  it('seta data-reveal="in" quando o elemento intersecta', () => {
    const { result } = renderHook(() => useReveal());
    const node = document.createElement('div');
    act(() => { result.current(node); });

    expect(node.dataset.reveal).toBeUndefined();
    act(() => { triggerIntersect?.(node); });
    expect(node.dataset.reveal).toBe('in');
  });

  it('desconecta observer anterior quando o ref recebe novo nó (cleanup)', () => {
    const { result } = renderHook(() => useReveal());
    const a = document.createElement('div');
    const b = document.createElement('div');
    act(() => { result.current(a); });
    expect(observerSpy).toHaveBeenCalledTimes(1);
    expect(disconnectSpy).not.toHaveBeenCalled();

    act(() => { result.current(b); });
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    expect(observerSpy).toHaveBeenCalledTimes(2);
    expect(observerSpy).toHaveBeenLastCalledWith(b);
  });

  it('desmonte: ref(null) desconecta o observer ativo', () => {
    const { result } = renderHook(() => useReveal());
    const node = document.createElement('div');
    act(() => { result.current(node); });
    act(() => { result.current(null); });
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });

  it('REGRESSÃO 2026-05-21: hook chamado ANTES do elemento existir → observer cria quando elemento monta depois', () => {
    // Simula o caso BasesClient: hook é chamado no render inicial mas o
    // <ul> dos cards só monta depois do fetch async. Com useRef+useEffect[]
    // antigo, esse caso QUEBRAVA — observer nunca era criado.
    const { result } = renderHook(() => useReveal());
    // Estado inicial: nenhum nó ainda — nada de observer.
    expect(observerSpy).not.toHaveBeenCalled();

    // Algum tempo depois (após fetch resolver), o <ul> é renderizado.
    const lateNode = document.createElement('ul');
    act(() => { result.current(lateNode); });
    expect(observerSpy).toHaveBeenCalledTimes(1);
    expect(observerSpy).toHaveBeenCalledWith(lateNode);

    // E o reveal funciona normalmente quando intersecta.
    act(() => { triggerIntersect?.(lateNode); });
    expect(lateNode.dataset.reveal).toBe('in');
  });

  it('fallback graceful em ambientes sem IntersectionObserver (SSR/jsdom puro)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).IntersectionObserver;

    const { result } = renderHook(() => useReveal());
    const node = document.createElement('div');
    act(() => { result.current(node); });

    // Sem IntersectionObserver, marca como "in" imediatamente —
    // melhor mostrar o conteúdo do que esconder pra sempre.
    expect(node.dataset.reveal).toBe('in');
  });
});
