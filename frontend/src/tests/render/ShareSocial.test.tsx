import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShareSocial } from '@/components/ShareSocial';

describe('<ShareSocial> URLs', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('LinkedIn share usa intent URL com URL encoded do artigo', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<ShareSocial slug="rag-internals" title="RAG por dentro" />);
    fireEvent.click(screen.getByText('LinkedIn'));
    expect(openSpy).toHaveBeenCalled();
    const url = (openSpy.mock.calls[0]?.[0] as string) ?? '';
    expect(url).toContain('linkedin.com/sharing/share-offsite');
    expect(url).toContain(encodeURIComponent('fernandofrancovalle.com/aprenda/rag-internals'));
  });

  it('Twitter share inclui título e URL pre-fill', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<ShareSocial slug="ai-101" title="IA 101" />);
    fireEvent.click(screen.getByText('X / Twitter'));
    const url = (openSpy.mock.calls[0]?.[0] as string) ?? '';
    expect(url).toContain('twitter.com/intent/tweet');
    expect(url).toContain(encodeURIComponent('IA 101'));
  });

  it('WhatsApp share inclui texto + URL no parâmetro text', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<ShareSocial slug="cf-workers" title="CF Workers" />);
    fireEvent.click(screen.getByText('WhatsApp'));
    const url = (openSpy.mock.calls[0]?.[0] as string) ?? '';
    expect(url).toContain('wa.me');
    expect(url).toContain(encodeURIComponent('CF Workers'));
  });

  it('renderiza variante compact sem o título', () => {
    render(<ShareSocial slug="x" title="Y" variant="compact" />);
    expect(screen.queryByText(/Curtiu/)).not.toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
  });
});
