import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('tw-design-docs');
const accent = '#7c3aed';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o ponto central de "Design docs: estrutura que funciona"?',
    options: [
      'Apenas detalhe de implementação — pouco relevante',
      'TL;DR, context, goals/non-goals, proposed solution, alternatives considered, risks, rollout. Templates Google, Uber, Stripe. Quando precisa design doc.',
      'Moda passageira sem aplicação em produção',
      'Receita universal que resolve todo problema',
    ],
    correct: 1,
    explanation: 'TL;DR, context, goals/non-goals, proposed solution, alternatives considered, risks, rollout. Templates Google, Uber, Stripe. Quando precisa design doc. Este é o núcleo pedagógico do módulo.',
  },
  {
    question: 'Qual é o anti-pattern mais comum relacionado a este tema?',
    options: [
      'Seguir especificação à risca sem desvios',
      'Copiar receita sem entender contexto, otimizar cedo sem medir, ou ignorar trade-offs reais — os três canônicos em engenharia sênior',
      'Documentar demais',
      'Estudar fundamentos antes de implementar',
    ],
    correct: 1,
    explanation: 'Engenharia sênior é sobre decisão consciente baseada em restrições reais, não receita mágica. O módulo destaca os cuidados específicos do tema. Medir antes de otimizar, conhecer o contexto antes de copiar padrão.',
  },
  {
    question: 'Quando aplicar o conteúdo deste módulo em produção?',
    options: [
      'Nunca — é só acadêmico',
      'Aplicar quando o problema casar com as palavras-chave do módulo (design doc, technical design document, tldr design doc, template design doc); fora desse contexto, soluções mais simples servem melhor',
      'Sempre, independente do contexto',
      'Apenas em projetos greenfield sem legado',
    ],
    correct: 1,
    explanation: 'Aplicação real casa características do problema com a ferramenta/técnica do módulo. Palavras-chave (design doc, technical design document, tldr design doc, template design doc) indicam quando o tema é relevante. Fora desse contexto, complexidade extra custa sem ganho.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="tw-design-docs"
      title="Design docs: estrutura que funciona"
      icon="📐"
      xp={50}
      readTime={12}
      trailName="Technical Writing & RFCs"
      trailColor={accent}
      nextSlug="tw-rfcs-como-escrever"
      nextTitle="RFCs: quando escrever e como"
      quiz={quiz}
    >
      <Section title="Mental model" accent={accent}>
        <p>TL;DR, context, goals/non-goals, proposed solution, alternatives considered, risks, rollout.</p>
      </Section>

      <Section title="Em detalhes técnicos" accent={accent}>
        <p>Templates Google, Uber, Stripe.</p>
        <p>
          <strong>Palavras-chave do módulo:</strong> design doc, technical design document, tldr design doc, template design doc.
        </p>
      </Section>

      <Section title="Take-aways" accent={accent}>
        <p>Quando precisa design doc.</p>
        <Callout tone="success" icon="✅">
          Design doc estrutura template Google — PT-BR.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
