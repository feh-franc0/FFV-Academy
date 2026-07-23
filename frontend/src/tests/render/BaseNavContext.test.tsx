import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { BaseNavProvider, useBaseNav } from '@/components/base/BaseNavContext';
import { TECH_NAV_ITEMS } from '@/lib/bases/tecnologia/nav';
import { MEDVET_NAV_ITEMS } from '@/lib/bases/medvet/nav';

function NavConsumer() {
  const { hubNavItems, hideGlobalContentNav } = useBaseNav();
  return (
    <ul>
      {hubNavItems.map(item => (
        <li key={item.href} data-href={item.href}>
          {item.label}
        </li>
      ))}
      <li data-testid="hide-flag">{hideGlobalContentNav ? 'yes' : 'no'}</li>
    </ul>
  );
}

describe('BaseNavContext', () => {
  it('default value: hubNavItems vazio quando sem provider', () => {
    render(<NavConsumer />);
    expect(screen.queryByText('IA')).not.toBeInTheDocument();
    expect(screen.getByTestId('hide-flag')).toHaveTextContent('no');
  });

  it('TECH_NAV_ITEMS injeta os 4 hubs', () => {
    render(
      <BaseNavProvider value={{ hubNavItems: TECH_NAV_ITEMS }}>
        <NavConsumer />
      </BaseNavProvider>,
    );
    expect(screen.getByText('IA')).toBeInTheDocument();
    expect(screen.getByText('AWS')).toBeInTheDocument();
    expect(screen.getByText('Engenharia')).toBeInTheDocument();
    expect(screen.getByText('Claude')).toBeInTheDocument();
  });

  it('MEDVET_NAV_ITEMS injeta apenas Simulado', () => {
    render(
      <BaseNavProvider value={{ hubNavItems: MEDVET_NAV_ITEMS }}>
        <NavConsumer />
      </BaseNavProvider>,
    );
    // Medvet não tem hubs tech
    expect(screen.queryByText('IA')).not.toBeInTheDocument();
    expect(screen.queryByText('AWS')).not.toBeInTheDocument();
    // Tem o atalho do simulado
    expect(screen.getByText('Simulado')).toBeInTheDocument();
  });

  it('TECH_NAV_ITEMS apontam para os hrefs corretos', () => {
    expect(TECH_NAV_ITEMS.map(i => i.href)).toEqual([
      '/ia',
      '/aws',
      '/engenharia',
      '/claude-anthropic',
    ]);
  });

  it('MEDVET_NAV_ITEMS aponta para o simulado da base', () => {
    expect(MEDVET_NAV_ITEMS).toHaveLength(1);
    expect(MEDVET_NAV_ITEMS[0].href).toBe('/medicina-veterinaria/simulado-genetica');
  });
});
