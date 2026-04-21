import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-tech-writing-rfc');
const accent = '#7c3aed';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o ponto central de "Capstone: RFC completo para mudança real"?',
    options: [
      'Apenas detalhe de implementação — pouco relevante',
      'Escrever RFC para mudança arquitetural do próprio projeto (migrar de X pra Y). Entregáveis: RFC completo + thread de discussão simulada + decisão final + ADR.',
      'Moda passageira sem aplicação em produção',
      'Receita universal que resolve todo problema',
    ],
    correct: 1,
    explanation: 'Escrever RFC para mudança arquitetural do próprio projeto (migrar de X pra Y). Entregáveis: RFC completo + thread de discussão simulada + decisão final + ADR. Este é o núcleo pedagógico do módulo.',
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
      'Aplicar quando o problema casar com as palavras-chave do módulo (capstone rfc, technical writing rfc, adr decision); fora desse contexto, soluções mais simples servem melhor',
      'Sempre, independente do contexto',
      'Apenas em projetos greenfield sem legado',
    ],
    correct: 1,
    explanation: 'Aplicação real casa características do problema com a ferramenta/técnica do módulo. Palavras-chave (capstone rfc, technical writing rfc, adr decision) indicam quando o tema é relevante. Fora desse contexto, complexidade extra custa sem ganho.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-tech-writing-rfc"
      title="Capstone: RFC completo para mudança real"
      icon="🏁"
      xp={80}
      readTime={18}
      trailName="Technical Writing & RFCs"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Mental model" accent={accent}>
        <p>Escrever RFC para mudança arquitetural do próprio projeto (migrar de X pra Y).</p>
      </Section>

      <Section title="Em detalhes técnicos" accent={accent}>
        <p>Entregáveis: RFC completo + thread de discussão simulada + decisão final + ADR.</p>
        <p>
          <strong>Palavras-chave do módulo:</strong> capstone rfc, technical writing rfc, adr decision.
        </p>
      </Section>

      <Section title="Take-aways" accent={accent}>
        <p>Aplicação prática: integrar este módulo com o próximo na trilha e revisitar quando encontrar problemas reais.</p>
        <Callout tone="success" icon="✅">
          Capstone technical writing RFC completo — PT-BR.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
