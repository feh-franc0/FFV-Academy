import { describe, it, expect, beforeEach, vi } from 'vitest';
import { track } from '@/lib/analytics';

describe('analytics — track helper', () => {
  beforeEach(() => {
    delete (window as { plausible?: unknown }).plausible;
  });

  it('chama window.plausible quando disponível', () => {
    const spy = vi.fn();
    (window as { plausible?: unknown }).plausible = spy;

    track('module_completed', { slug: 'rag' });

    expect(spy).toHaveBeenCalledWith('module_completed', { props: { slug: 'rag' } });
  });

  it('chama sem props quando não passados', () => {
    const spy = vi.fn();
    (window as { plausible?: unknown }).plausible = spy;

    track('signup_clicked');

    expect(spy).toHaveBeenCalledWith('signup_clicked', undefined);
  });

  it('não crasha quando plausible não existe (fail silent)', () => {
    expect(() => track('search_performed', { query_length: 5 })).not.toThrow();
  });

  it('engole exceções do plausible silenciosamente', () => {
    (window as { plausible?: unknown }).plausible = () => {
      throw new Error('Plausible blocked');
    };

    expect(() => track('cta_clicked', { id: 'test' })).not.toThrow();
  });
});
