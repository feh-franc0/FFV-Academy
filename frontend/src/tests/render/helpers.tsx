/**
 * Helpers compartilhados pelos testes de render.
 *
 * Não expõe vi.mock (precisa ser chamado direto no topo dos arquivos pra hoisting).
 * Exporta apenas componentes utilitários que são reusados nos mocks (ex: LinkMock).
 */
import React from 'react';
import '@testing-library/jest-dom/vitest';

export function LinkMock({
  children,
  href,
  ...rest
}: React.PropsWithChildren<{ href: string } & Record<string, unknown>>) {
  return (
    <a href={typeof href === 'string' ? href : '#'} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
      {children}
    </a>
  );
}
