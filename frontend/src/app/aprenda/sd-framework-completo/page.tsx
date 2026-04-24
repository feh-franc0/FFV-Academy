import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('sd-framework-completo');
const accent = '#ea580c';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o ponto central de "Framework de system design interview"?',
    options: [
      'Apenas detalhe de implementação — pouco relevante',
      'FRAME: Functional requirements, Non-functional (scale, latency, consistency), API, Model (data), Estimate. 5 passos que estruturam qualquer interview.',
      'Moda passageira sem aplicação em produção',
      'Receita universal que resolve todo problema',
    ],
    correct: 1,
    explanation: 'FRAME: Functional requirements, Non-functional (scale, latency, consistency), API, Model (data), Estimate. 5 passos que estruturam qualquer interview. Este é o núcleo pedagógico do módulo.',
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
      'Aplicar quando o problema casar com as palavras-chave do módulo (system design framework, sd interview estrutura, sd requirements scale); fora desse contexto, soluções mais simples servem melhor',
      'Sempre, independente do contexto',
      'Apenas em projetos greenfield sem legado',
    ],
    correct: 1,
    explanation: 'Aplicação real casa características do problema com a ferramenta/técnica do módulo. Palavras-chave (system design framework, sd interview estrutura, sd requirements scale) indicam quando o tema é relevante. Fora desse contexto, complexidade extra custa sem ganho.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="sd-framework-completo"
      title="Framework de system design interview"
      icon="🗺️"
      xp={50}
      readTime={12}
      trailName="System Design Interview Prep"
      trailColor={accent}
      nextSlug="sd-back-of-envelope"
      nextTitle="Back-of-envelope: cálculos que convencem"
      quiz={quiz}
    >
      <Section title="Mental model" accent={accent}>
        <p>FRAME: Functional requirements, Non-functional (scale, latency, consistency), API, Model (data), Estimate.</p>
      </Section>

      <Section title="Em detalhes técnicos" accent={accent}>
        <p>5 passos que estruturam qualquer interview.</p>
        <p>
          <strong>Palavras-chave do módulo:</strong> system design framework, sd interview estrutura, sd requirements scale.
        </p>
      </Section>

      <Section title="Take-aways" accent={accent}>
        <p>Aplicação prática: integrar este módulo com o próximo na trilha e revisitar quando encontrar problemas reais.</p>
        <Callout tone="success" icon="✅">
          System design framework interview FRAME — PT-BR.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
