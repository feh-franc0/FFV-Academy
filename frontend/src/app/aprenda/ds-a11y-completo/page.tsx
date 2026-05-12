import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ds-a11y-completo');

const accent = '#a855f7';

const quiz: QuizQuestion[] = [
  {
    question: 'WAI-ARIA Authoring Practices Guide (APG) é:',
    options: [
      'Apenas opinião',
      'Documento oficial do W3C WAI com padrões de design para componentes acessíveis (combobox, menu, dialog, tabs, etc) — keyboard interactions, ARIA roles/states, focus management. Referência canônica para devs e DS designers',
      'Substituto do HTML',
      'Apenas para Angular',
    ],
    correct: 1,
    explanation: 'APG (w3.org/WAI/ARIA/apg/) define como cada widget deveria se comportar. Cada padrão tem código de exemplo + WAI-ARIA roles/properties recomendados. Radix UI e Ark UI seguem APG fielmente — por isso são padrão.',
  },
  {
    question: 'Focus trap em modal — qual o requisito mínimo?',
    options: [
      'Esconder tudo atrás',
      'Quando modal abre: focus vai para primeiro elemento focável dentro; Tab/Shift+Tab circulam DENTRO do modal; Escape fecha; ao fechar, focus volta para elemento que abriu o modal. inert attribute no resto da página em browsers modernos',
      'Apenas estilo CSS',
      'Não precisa',
    ],
    correct: 1,
    explanation: 'Modal sem focus trap é catastrófico para teclado/screen reader — usuário tabula para "fora" do modal sem perceber. Solução moderna: <dialog>, ou inert no resto + tab containment manual. Radix Dialog faz tudo isso.',
  },
  {
    question: 'aria-live regions servem para:',
    options: [
      'Esconder elementos',
      'Anunciar mudanças dinâmicas no conteúdo (notificações toast, status de form submit, contador de carrinho) para screen readers que não detectam mudanças DOM por padrão. polite (espera fala atual terminar) vs assertive (interrompe)',
      'Layout',
      'Animação',
    ],
    correct: 1,
    explanation: 'Sem aria-live, um toast "Salvo!" não chega ao screen reader. Adiciona role="status" (polite) ou role="alert" (assertive). aria-live="polite" é o default sensato; "assertive" só para emergências (errors críticos).',
  },
  {
    question: 'Axe core vs Lighthouse — qual usar?',
    options: [
      'Apenas Lighthouse',
      'Ambos — Axe (Deque) tem o motor mais robusto, integra em Storybook/Playwright/Cypress; Lighthouse usa Axe por baixo + métricas adicionais. Axe em CI, Lighthouse em audit pontual',
      'Apenas Axe',
      'Nenhum',
    ],
    correct: 1,
    explanation: 'Axe é o motor de a11y mais usado da indústria. @axe-core/playwright e @axe-core/react integram em test suites. Lighthouse roda Axe + métricas Web Vitals. Em DS, axe roda em Storybook stories (@storybook/addon-a11y).',
  },
  {
    question: 'Testar com screen reader real é necessário?',
    options: [
      'Nunca',
      'Sim — Axe captura ~40-50% dos problemas de a11y. O resto (semântica enganosa, ordem de leitura confusa, anúncio de mudança) só humano com SR percebe. NVDA (Windows, free), VoiceOver (Mac/iOS), JAWS (Windows, pago) — testar pelo menos em um',
      'Apenas mobile',
      'Apenas em Windows',
    ],
    correct: 1,
    explanation: 'Ferramenta automática é o piso, não o teto. Issue real: button sem text que parece visualmente um X — screen reader anuncia "botão" sem contexto. Axe não pega; SR test sim. Padrão maduro: dev liga VoiceOver/NVDA pelo menos 1×/semana.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ds-a11y-completo"
      title="A11y no DS: WAI-ARIA, focus management, screen reader test"
      icon="♿"
      xp={70}
      readTime={14}
      trailName="Design Systems Engineering"
      trailColor={accent}
      nextSlug="figma-to-code-pipeline"
      nextTitle="Figma → código"
      quiz={quiz}
    >
      <Section title="Por que A11y começa no DS" accent={accent}>
        <p className="text-sm leading-6">
          Se o seu Dialog do DS é acessível, todo Dialog do produto será. Se for inacessível, todo Dialog do produto será. <b>O DS é o lugar mais barato para fazer A11y certo</b> — uma correção, milhares de usos. É também o lugar mais caro para errar — uma regressão silenciosa, milhares de fluxos quebrados para usuários reais.
        </p>
        <Callout tone="warn">
          No Brasil, a LGPD não fala diretamente de A11y, mas o Estatuto da Pessoa com Deficiência (Lei 13.146/2015) sim. Para produto público / governo / setores regulados, é obrigatório.
        </Callout>
      </Section>

      <Section title="WAI-ARIA APG — referência canônica" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'URL', v: <a href="https://www.w3.org/WAI/ARIA/apg/" target="_blank" rel="noreferrer">w3.org/WAI/ARIA/apg/</a> },
            { k: 'Para cada widget', v: 'Padrão de keyboard interaction, ARIA roles/states/properties, código de exemplo' },
            { k: 'Bons exemplos', v: 'Combobox (autocomplete), Listbox, Menu, Disclosure, Dialog, Tabs, Tree, Grid' },
            { k: 'Implementações fiéis', v: 'Radix UI, Ark UI (Zag.js), Headless UI (Tailwind Labs)' },
          ]}
        />
      </Section>

      <Section title="Focus trap em Modal — código completo" accent={accent}>
        <CodeBlock lang="typescript">{`// Usando <dialog> nativo (suporte universal em 2026)
function Modal({ open, onClose, children }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();           // Focus trap automático!
      // Foco vai pro primeiro [autofocus] dentro
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog ref={ref} onClose={onClose}>
      <button autoFocus>Confirmar</button>
      <button onClick={onClose}>Cancelar</button>
    </dialog>
  );
}

// <dialog>.showModal() já implementa:
// - Focus trap (Tab circula dentro)
// - inert no resto da página
// - Escape fecha
// - Backdrop click (opcional, customize)`}</CodeBlock>
        <Callout tone="success">
          Em 2026, <InlineCode>{'<dialog>'}</InlineCode> nativo é a melhor escolha. Suporte universal. Funcionalidade de focus trap built-in.
        </Callout>
      </Section>

      <Section title="aria-live em toast" accent={accent}>
        <CodeBlock lang="tsx">{`function ToastContainer({ toasts }) {
  return (
    <div
      role="status"           // role implica aria-live="polite"
      aria-live="polite"      // explicit para clareza
      aria-atomic="true"      // lê o container inteiro
      className="toast-area"
    >
      {toasts.map(t => (
        <div key={t.id} className={\`toast toast-\${t.kind}\`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// Para erro crítico (algo falhou irrecuperavelmente)
<div role="alert" aria-live="assertive">
  Falha ao salvar — verifique sua conexão.
</div>`}</CodeBlock>
      </Section>

      <Section title="Storybook a11y addon" accent={accent}>
        <CodeBlock lang="bash">{`npm i -D @storybook/addon-a11y

# .storybook/main.ts
addons: ['@storybook/addon-a11y']`}</CodeBlock>
        <CodeBlock lang="tsx">{`// Em cada story, axe roda automaticamente
export default {
  title: 'Button',
  component: Button,
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'aria-required-attr', enabled: true },
        ],
      },
    },
  },
};`}</CodeBlock>
      </Section>

      <Section title="Axe em Playwright (CI gating)" accent={accent}>
        <CodeBlock lang="typescript">{`import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage não tem violação a11y', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toHaveLength(0);
});`}</CodeBlock>
        <Callout tone="info">
          Adicione esse teste em CI. PR que adiciona violação falha o pipeline. Atinge 50% da batalha sem revisão humana.
        </Callout>
      </Section>

      <Section title="Screen reader testing — checklist semanal" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'macOS', v: 'VoiceOver — Cmd+F5 para ligar' },
            { k: 'Windows', v: 'NVDA (free, nvaccess.org) ou JAWS (pago)' },
            { k: 'iOS', v: 'VoiceOver — Settings > Accessibility > VoiceOver' },
            { k: 'Android', v: 'TalkBack' },
            { k: 'Checklist', v: 'Conseguir completar fluxo principal só com teclado/SR; saber em que tela está; entender o que cada controle faz; receber confirmação de ações' },
          ]}
        />
      </Section>

      <Section title="WCAG 2.2 — o que precisa cumprir" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Critério', 'O que significa']}
          rows={[
            ['1.4.3 Contrast (AA)', 'Texto regular ≥ 4.5:1, grande ≥ 3:1'],
            ['1.4.11 Non-text Contrast (AA)', 'UI elements (border, icon) ≥ 3:1'],
            ['2.1.1 Keyboard', 'Todo funcional acessível por teclado'],
            ['2.4.7 Focus Visible', 'Indicador de foco sempre visível'],
            ['2.4.11 Focus Not Obscured (novo 2.2)', 'Foco não pode ficar atrás de cookie banner / sticky'],
            ['2.5.7 Dragging Movements', 'Drag tem alternativa não-drag'],
            ['2.5.8 Target Size', 'Targets ≥ 24×24 CSS pixels'],
            ['3.3.7 Redundant Entry', 'Não pedir info já fornecida'],
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
