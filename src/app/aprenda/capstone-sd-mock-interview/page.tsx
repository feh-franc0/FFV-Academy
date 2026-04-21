import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-sd-mock-interview');
const accent = '#ea580c';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o ponto central de "Capstone: mock interview completo"?',
    options: [
      'Apenas detalhe de implementação — pouco relevante',
      'Simular interview 45min: dropbox-like OU booking-like OU youtube-like. Usar framework. Entregáveis: diagrama + back-of-envelope + trade-offs escritos.',
      'Moda passageira sem aplicação em produção',
      'Receita universal que resolve todo problema',
    ],
    correct: 1,
    explanation: 'Simular interview 45min: dropbox-like OU booking-like OU youtube-like. Usar framework. Entregáveis: diagrama + back-of-envelope + trade-offs escritos. Este é o núcleo pedagógico do módulo.',
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
      'Aplicar quando o problema casar com as palavras-chave do módulo (system design mock, sd interview capstone, whiteboard interview); fora desse contexto, soluções mais simples servem melhor',
      'Sempre, independente do contexto',
      'Apenas em projetos greenfield sem legado',
    ],
    correct: 1,
    explanation: 'Aplicação real casa características do problema com a ferramenta/técnica do módulo. Palavras-chave (system design mock, sd interview capstone, whiteboard interview) indicam quando o tema é relevante. Fora desse contexto, complexidade extra custa sem ganho.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-sd-mock-interview"
      title="Capstone: mock interview completo"
      icon="🏁"
      xp={85}
      readTime={20}
      trailName="System Design Interview Prep"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Mental model" accent={accent}>
        <p>Simular interview 45min: dropbox-like OU booking-like OU youtube-like.</p>
      </Section>

      <Section title="Em detalhes técnicos" accent={accent}>
        <p>Usar framework.</p>
        <p>
          <strong>Palavras-chave do módulo:</strong> system design mock, sd interview capstone, whiteboard interview.
        </p>
      </Section>

      <Section title="Take-aways" accent={accent}>
        <p>Entregáveis: diagrama + back-of-envelope + trade-offs escritos.</p>
        <Callout tone="success" icon="✅">
          Capstone system design mock interview — PT-BR.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
