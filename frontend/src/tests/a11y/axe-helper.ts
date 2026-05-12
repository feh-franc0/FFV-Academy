import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Wrapper sobre axe-core nativo (sem jest-axe) — implementa um matcher
 * inline `toHaveNoCriticalViolations` para uso com Vitest.
 *
 * Por que não jest-axe? jest-axe ainda não está instalado neste worktree
 * (deps adicionadas no package.json mas npm install bloqueado). Usar a API
 * nativa do axe-core é equivalente e remove a dependência.
 *
 * Uso:
 *   const results = await runAxe(container);
 *   expect(results).toHaveNoCriticalViolations();
 */
export async function runAxe(node: Element | Document): Promise<axe.AxeResults> {
  return axe.run(node as Element, {
    rules: {
      // O componente raiz montado em jsdom não está dentro de <main>;
      // a regra de region/landmark é responsabilidade do layout, não dos clients.
      region: { enabled: false },
    },
    resultTypes: ['violations'],
  });
}

interface AssertionLike {
  pass: boolean;
  message: () => string;
}

expect.extend({
  toHaveNoCriticalViolations(received: axe.AxeResults): AssertionLike {
    const critical = received.violations.filter(v => v.impact === 'critical');
    if (critical.length === 0) {
      return { pass: true, message: () => 'expected violations but found none' };
    }
    const lines = critical.map(v => ` - [${v.id}] ${v.help} (${v.nodes.length} node(s))`);
    return {
      pass: false,
      message: () => `Expected zero critical a11y violations. Found ${critical.length}:\n${lines.join('\n')}`,
    };
  },
});

declare module 'vitest' {
  interface Assertion {
    toHaveNoCriticalViolations(): void;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoCriticalViolations(): void;
  }
}

export async function expectNoCriticalA11yViolations(node: Element | Document): Promise<void> {
  const results = await runAxe(node);
  // @ts-expect-error matcher custom registrado acima
  expect(results).toHaveNoCriticalViolations();
}
