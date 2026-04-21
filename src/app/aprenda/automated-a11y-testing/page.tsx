import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('automated-a11y-testing');

const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Quanto dos problemas de a11y axe detecta automaticamente?',
    options: [
      '100%',
      '~30-50% — detecta coisas estruturais (label faltando, contrast, ARIA errado). NÃO detecta: lógica (keyboard trap, focus order), semântica (texto certo pro contexto), experiência (user real consegue?). É piso, não teto',
      '5%',
      '95%',
    ],
    correct: 1,
    explanation: 'Deque Labs (criadores do axe) publicam: automated testing pega 30-50% dos issues. Resto precisa manual/user testing. Axe é ÓTIMO mas não é suficiente — PRs verdes com axe ainda podem ter a11y ruim. Integre axe + keyboard test + screen reader user testing.',
  },
  {
    question: 'Qual ferramenta é canonical em a11y automated testing?',
    options: [
      'Lighthouse',
      'axe-core (Deque) — engine underneath Lighthouse, jest-axe, Cypress-axe, axe DevTools browser extension. Open source, de facto standard. Regras alinhadas com WCAG',
      'Custom scripts',
      'Nada',
    ],
    correct: 1,
    explanation: 'axe-core é o motor. Consumers: Lighthouse (rodado pelo Google), Pa11y (CLI), jest-axe, Cypress-axe, Playwright @axe-core/playwright, axe DevTools (browser extension). Integrar em dev (extension), PR (Cypress+axe em e2e), deploy gate (Lighthouse CI).',
  },
  {
    question: 'Como integrar axe em CI de forma efetiva?',
    options: [
      'Só Lighthouse audit manual',
      'jest-axe em unit tests + Playwright/Cypress axe em e2e + Lighthouse-CI com budget. PR falha se novo issue (não apenas total). Catches regression antes de merge',
      'Rodar 1x por mês',
      'Não automatizar',
    ],
    correct: 1,
    explanation: 'jest-axe em component tests (pega problemas de component isolado). Cypress-axe em e2e (pega problemas de fluxo real). Lighthouse-ci em preview deploy (pega problemas full-page). Budget de 0 new issues — regressão bloqueia PR.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="automated-a11y-testing"
      title="Automated a11y testing: axe, Lighthouse, Pa11y"
      icon="🤖"
      xp={50}
      readTime={11}
      trailName="Accessibility & Inclusive Engineering"
      trailColor={accent}
      nextSlug="capstone-remediar-site-inacessivel"
      nextTitle="Capstone: remediar um site inacessível até nível AA"
      quiz={quiz}
    >
      <Section title="axe em component tests (jest-axe)" accent={accent}>
        <CodeBlock lang="typescript">{`import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';

expect.extend(toHaveNoViolations);

it('Button component é acessível', async () => {
  const { container } = render(<Button>Clique</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});`}</CodeBlock>
      </Section>

      <Section title="axe em Playwright e2e" accent={accent}>
        <CodeBlock lang="typescript">{`import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage has no a11y violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

// Executar em cada page crítica
// Report HTML com violations detalhadas`}</CodeBlock>
      </Section>

      <Section title="Lighthouse-CI com budget" accent={accent}>
        <CodeBlock lang="json">{`// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:accessibility": ["error", { "minScore": 0.95 }]
      }
    }
  }
}

// CI: run e falha se score < 95`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Pa11y (CLI) é alternativa simples: pa11y https://app.com retorna issues. Bom pra scans cross-pages (sitemap crawl). Complementar a axe in-CI.
        </Callout>
      </Section>

      <Section title="Não esqueça: manual testing" accent={accent}>
        <p>
          Axe tudo verde não significa acessível. Os 50% restantes precisam manual keyboard testing + screen reader testing (módulo anterior). Combine: automated pra regressão, manual periódico pra UX real.
        </p>
      </Section>
    </ModuleLayout>
  );
}
