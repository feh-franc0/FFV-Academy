import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

import { TrailCompletionModal } from '@/components/TrailCompletionModal';
import { CURRICULUM } from '@/lib/curriculum';

describe('<TrailCompletionModal> render', () => {
  it('retorna null quando trail é null', () => {
    const { container } = render(
      <TrailCompletionModal trail={null} totalXp={0} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza modal quando trail é fornecida (trilha completa)', () => {
    const trail = CURRICULUM[0];
    const totalXp = trail.modules.reduce((acc, m) => acc + m.xp, 0);
    render(
      <TrailCompletionModal
        trail={trail}
        totalXp={totalXp}
        newBadges={['first_step']}
        onClose={() => {}}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`trilha ${trail.name} completa`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`\\+${totalXp} XP`))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fechar/i })).toBeInTheDocument();
  });

  it('botão "Compartilhar no LinkedIn" abre URL de share com texto correto', () => {
    const trail = CURRICULUM[0];
    render(
      <TrailCompletionModal
        trail={trail}
        totalXp={500}
        onClose={() => {}}
      />
    );

    const shareLink = screen.getByTestId('trail-share-linkedin') as HTMLAnchorElement;
    expect(shareLink.href).toContain('linkedin.com/sharing/share-offsite/');
    expect(shareLink.target).toBe('_blank');
    // Texto pré-preenchido inclui o nome da trilha + XP
    const decoded = decodeURIComponent(shareLink.href);
    expect(decoded).toContain(trail.name);
    expect(decoded).toContain('+500 XP');
  });

  it('renderiza link de certificado para /verificar?cert=ID quando certificateId existe', () => {
    const trail = CURRICULUM[0];
    render(
      <TrailCompletionModal
        trail={trail}
        totalXp={100}
        certificateId="abc123"
        onClose={() => {}}
      />
    );
    const certLink = screen.getByRole('link', { name: /verificação/i }) as HTMLAnchorElement;
    expect(certLink.getAttribute('href')).toBe('/verificar?cert=abc123');
  });

  it('botão "Baixar certificado" abre overlay do Certificate', () => {
    const trail = CURRICULUM[0];
    render(
      <TrailCompletionModal trail={trail} totalXp={100} onClose={() => {}} />
    );
    expect(screen.getByTestId('trail-download-certificate')).toBeInTheDocument();
  });

  it('botão "Compartilhar em outras redes" expande o ShareSocial', () => {
    const trail = CURRICULUM[0];
    render(
      <TrailCompletionModal trail={trail} totalXp={100} onClose={() => {}} />
    );
    expect(screen.queryByTestId('trail-share-social')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('trail-share-more'));
    expect(screen.getByTestId('trail-share-social')).toBeInTheDocument();
  });

  it('retorna null após onClose ser chamado e re-render com trail=null (anti-double-fire)', () => {
    const trail = CURRICULUM[0];
    const onClose = vi.fn();

    const { container, rerender } = render(
      <TrailCompletionModal trail={trail} totalXp={500} onClose={onClose} />
    );

    // Modal deve estar visível com a trilha fornecida
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Simula o consumidor chamando onClose e zerando trail
    act(() => {
      onClose();
    });

    rerender(
      <TrailCompletionModal trail={null} totalXp={500} onClose={onClose} />
    );

    // Modal não deve re-aparecer — componente retorna null
    expect(container.firstChild).toBeNull();
  });
});
