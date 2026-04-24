import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('sd-twitter-feed');
const accent = '#ea580c';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o ponto central de "Case: Twitter feed / timeline"?',
    options: [
      'Apenas detalhe de implementação — pouco relevante',
      'Fan-out on write vs read vs hybrid. Celebrity problem. Pull model. Feed ranking. Timeline storage. Cache warming.',
      'Moda passageira sem aplicação em produção',
      'Receita universal que resolve todo problema',
    ],
    correct: 1,
    explanation: 'Fan-out on write vs read vs hybrid. Celebrity problem. Pull model. Feed ranking. Timeline storage. Cache warming. Este é o núcleo pedagógico do módulo.',
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
      'Aplicar quando o problema casar com as palavras-chave do módulo (twitter feed design, timeline fanout, celebrity problem, feed ranking); fora desse contexto, soluções mais simples servem melhor',
      'Sempre, independente do contexto',
      'Apenas em projetos greenfield sem legado',
    ],
    correct: 1,
    explanation: 'Aplicação real casa características do problema com a ferramenta/técnica do módulo. Palavras-chave (twitter feed design, timeline fanout, celebrity problem, feed ranking) indicam quando o tema é relevante. Fora desse contexto, complexidade extra custa sem ganho.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="sd-twitter-feed"
      title="Case: Twitter feed / timeline"
      icon="🐦"
      xp={60}
      readTime={14}
      trailName="System Design Interview Prep"
      trailColor={accent}
      nextSlug="sd-rate-limiter"
      nextTitle="Case: distributed rate limiter"
      quiz={quiz}
    >
      <Section title="Mental model" accent={accent}>
        <p>Fan-out on write vs read vs hybrid. Celebrity problem.</p>
      </Section>

      <Section title="Em detalhes técnicos" accent={accent}>
        <p>Pull model. Feed ranking.</p>
        <p>
          <strong>Palavras-chave do módulo:</strong> twitter feed design, timeline fanout, celebrity problem, feed ranking.
        </p>
      </Section>

      <Section title="Take-aways" accent={accent}>
        <p>Timeline storage. Cache warming.</p>
        <Callout tone="success" icon="✅">
          Twitter timeline system design fanout — PT-BR.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
