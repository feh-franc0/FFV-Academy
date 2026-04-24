import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('a11y-por-que-agora');

const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'O que aconteceu em junho de 2025 na EU que torna a11y obrigatório?',
    options: [
      'Nada em particular',
      'European Accessibility Act entrou em vigor — ecommerce, banking, telecom, transporte, ebooks com >10 funcionários OBRIGADOS a conformidade. Multas pesadas por não-conformidade',
      'Cookie banner law',
      'GDPR extensão',
    ],
    correct: 1,
    explanation: 'EAA de 2019 teve 6 anos de grace; em 28 jun 2025 aplicou. Escopo: produtos digitais voltados ao consumidor EU. Conformidade exigida: WCAG 2.2 AA minimo. Similar ADA em US gera milhares de lawsuits/ano. Empresa global → ambas aplicam.',
  },
  {
    question: 'O que são os 4 princípios POUR do WCAG?',
    options: [
      'Random acronym',
      'Perceivable (percebível — alt text, contrast), Operable (operável — keyboard, time limits), Understandable (entendível — lang, clear errors), Robust (robusto — válido pra assistive tech)',
      'Performance Optimization...',
      'Only pair of...',
    ],
    correct: 1,
    explanation: 'POUR é o framework do WCAG. Perceivable: info acessível por múltiplos sentidos (visual + audio + textual). Operable: interação não depende só de mouse (keyboard, voice). Understandable: conteúdo claro, erros explicados. Robust: parseable por assistive tech agora e no futuro.',
  },
  {
    question: 'Qual nível de conformidade WCAG é o "bar legal" padrão?',
    options: [
      'A (mínimo)',
      'AA — meio, é o exigido por EAA, ADA-compliant, federal US agencies. AAA é aspirational (contrast 7:1 é difícil em UI colorida)',
      'AAA (máximo)',
      'D',
    ],
    correct: 1,
    explanation: 'WCAG tem 3 níveis: A (mínimo), AA (standard — 50 critérios a mais), AAA (excelente — impraticável em todo lugar). AA é o defaults legal. Ex: contrast 4.5:1 pra texto normal (AA) vs 7:1 (AAA, quase só text-on-white).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="a11y-por-que-agora"
      title="Accessibility por que agora: WCAG, POUR e legal landscape"
      icon="🌍"
      xp={45}
      readTime={11}
      trailName="Accessibility & Inclusive Engineering"
      trailColor={accent}
      nextSlug="semantic-html-o-basico-que-todo-mundo-ignora"
      nextTitle="Semantic HTML: o básico que todo mundo ignora"
      quiz={quiz}
    >
      <Section title="Legal landscape 2026" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Jurisdição', 'Lei', 'Escopo', 'Padrão']}
          rows={[
            ['EU', 'European Accessibility Act (2025)', 'Ecommerce, banking, telecom, transport, ebooks > 10 funcionários', 'WCAG 2.2 AA'],
            ['US', 'ADA + Section 508', 'Gov + qualquer site com US customers (interpretação ampliada)', 'WCAG 2.1 AA (508)'],
            ['Canada', 'ACA + AODA (Ontario)', 'Federal + Ontario', 'WCAG 2.0 AA'],
            ['UK', 'Equality Act 2010', 'Todo site público', 'WCAG 2.2 AA'],
            ['BR', 'LBI Lei 13.146 + CGU', 'Gov federal', 'e-MAG / WCAG 2.0'],
          ]}
        />
      </Section>

      <Section title="POUR — os 4 pilares" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>Perceivable</strong>: alt text em imagem, captions em vídeo, contrast adequado, text scalable.</li>
          <li><strong>Operable</strong>: keyboard-accessible, time limits adjustable, no flashes (seizure), nav lógica.</li>
          <li><strong>Understandable</strong>: lang attribute, labels claros, error messages específicos, consistent nav.</li>
          <li><strong>Robust</strong>: HTML válido, ARIA apropriado, compatível com assistive tech atual + futura.</li>
        </ul>
      </Section>

      <Section title="Por que importa além do legal" accent={accent}>
        <Callout tone="info" icon="💡">
          15% população mundial tem alguma disability. Mas a11y melhora UX PRA TODOS: keyboard shortcuts aceleram power users, alt text ajuda SEO, semantic HTML melhora performance parse, ARIA clara ajuda automation. A11y bem feita = produto melhor.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
