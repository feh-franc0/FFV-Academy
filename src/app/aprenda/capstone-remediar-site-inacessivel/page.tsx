import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-remediar-site-inacessivel');

const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a primeira fase de um audit de a11y?',
    options: [
      'Fix tudo',
      'Inventário: lista ALL pages críticas do app, priorize por volume + legal risk. Testa 1 página de cada tipo (home, login, form, checkout) — não precisa testar 100 páginas idênticas',
      'Abrir lawsuit',
      'Pedir ARIA',
    ],
    correct: 1,
    explanation: 'Site com 500 páginas: 80% são repetição de template. Audite templates, não instâncias. Priorize páginas monetárias (checkout), legais (privacy), funcionais (login). Time/budget limited — cover biggest risk first.',
  },
  {
    question: 'Como documentar achados de a11y profissionalmente?',
    options: [
      'Screenshot',
      'Report estruturado: cada issue = WCAG criterion violado + severity (CVSS-like) + reproduction steps + screenshot/video + fix recomendado + owner. Rastreável em backlog',
      'Só reclamar em Slack',
      'Não documentar',
    ],
    correct: 1,
    explanation: 'Template: ID, URL, WCAG criterion (2.4.1), severity (P0-P3), description, reproduction, expected behavior, current behavior, recommendation, owner, status. Gerado via axe automated + manual. Linka direto pra issue no Jira/Linear. Profissional.',
  },
  {
    question: 'Qual é a diferença entre remediation e VPAT?',
    options: [
      'Sinônimos',
      'Remediation: fix dos issues encontrados. VPAT (Voluntary Product Accessibility Template): documento formal que empresa publica DECLARANDO conformidade — usado em procurement gov e enterprise',
      'VPAT é legal obrigatório',
      'Não existe VPAT',
    ],
    correct: 1,
    explanation: 'VPAT é template padronizado (ITI) preenchido por vendor: pra cada WCAG criterion, supports/partial/does not support + notes. Gov US pede VPAT antes de comprar software. ACR (Accessibility Conformance Report) é versão mais moderna. Remediation acontece pra poder publicar VPAT honesto.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-remediar-site-inacessivel"
      title="Capstone: remediar um site inacessível até nível AA"
      icon="🏁"
      xp={80}
      readTime={18}
      trailName="Accessibility & Inclusive Engineering"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="O projeto" accent={accent}>
        <p>
          Pegue site real (próprio, voluntário non-profit, open-source com UI) e entregue jornada completa: audit → report → PRs de fix → retest → VPAT.
        </p>
      </Section>

      <Section title="Fase 1 — Audit (1-2 dias)" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>Inventário: 10 páginas/templates críticos</li>
          <li>axe DevTools em cada — lista issues</li>
          <li>Keyboard-only manual test em 3 fluxos principais</li>
          <li>NVDA/VoiceOver test em signup + checkout</li>
          <li>Contrast check (WebAIM Contrast Checker)</li>
        </ul>
      </Section>

      <Section title="Fase 2 — Report (1 dia)" accent={accent}>
        <CodeBlock lang="markdown">{`# A11Y-001: Botão sem nome acessível

**WCAG**: 4.1.2 Name, Role, Value (Level A)
**Severity**: P1 — bloqueia uso
**URL**: /checkout
**Discovered**: axe automated + NVDA manual

## Reproduction
1. Navegue /checkout com NVDA ativo
2. Tab até ícone "x" de remover item
3. NVDA anuncia "button" sem nome

## Fix
\`\`\`tsx
- <button onClick={remove}><XIcon /></button>
+ <button onClick={remove} aria-label="Remover item">
+   <XIcon aria-hidden="true" />
+ </button>
\`\`\`

## Regression test
\`\`\`tsx
it('remove button has accessible name', () => {
  render(<RemoveButton />);
  expect(screen.getByRole('button', { name: /remover/i })).toBeInTheDocument();
});
\`\`\``}</CodeBlock>
      </Section>

      <Section title="Fase 3 — Remediation (1-2 sprints)" accent={accent}>
        <p>
          PRs organizados por severidade. Cada PR tem: fix + regression test (jest-axe ou RTL query by role) + screenshot before/after. Reviewers validam keyboard + NVDA.
        </p>
      </Section>

      <Section title="Fase 4 — VPAT/ACR" accent={accent}>
        <Callout tone="success" icon="🎓">
          Entregável final: repo com fixes mergeados, axe CI configurado, ACR document (50 critérios WCAG 2.2 AA com status). Produto agora pode ser pitched pra gov/enterprise que exigem a11y compliance.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
