import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('tw-por-que-escrever-bem');
const accent = '#7c3aed';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o ponto central de "Por que escrita técnica é alavanca sênior"?',
    options: [
      'Apenas detalhe de implementação — pouco relevante',
      'Escrita escala decisões. 1h escrevendo = 10h de reunião. Staff engineer vira staff escrevendo. Anti-pattern: "ninguém lê". Solução: write like a journalist, inverted pyramid.',
      'Moda passageira sem aplicação em produção',
      'Receita universal que resolve todo problema',
    ],
    correct: 1,
    explanation: 'Escrita escala decisões. 1h escrevendo = 10h de reunião. Staff engineer vira staff escrevendo. Anti-pattern: "ninguém lê". Solução: write like a journalist, inverted pyramid. Este é o núcleo pedagógico do módulo.',
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
      'Aplicar quando o problema casar com as palavras-chave do módulo (escrita tecnica, technical writing, staff engineer escrita, writing software); fora desse contexto, soluções mais simples servem melhor',
      'Sempre, independente do contexto',
      'Apenas em projetos greenfield sem legado',
    ],
    correct: 1,
    explanation: 'Aplicação real casa características do problema com a ferramenta/técnica do módulo. Palavras-chave (escrita tecnica, technical writing, staff engineer escrita, writing software) indicam quando o tema é relevante. Fora desse contexto, complexidade extra custa sem ganho.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="tw-por-que-escrever-bem"
      title="Por que escrita técnica é alavanca sênior"
      icon="📝"
      xp={40}
      readTime={9}
      trailName="Technical Writing & RFCs"
      trailColor={accent}
      nextSlug="tw-design-docs"
      nextTitle="Design docs: estrutura que funciona"
      quiz={quiz}
    >
      <Section title="Mental model" accent={accent}>
        <p>Escrita escala decisões.</p>
      </Section>

      <Section title="Em detalhes técnicos" accent={accent}>
        <p>1h escrevendo = 10h de reunião.</p>
        <p>
          <strong>Palavras-chave do módulo:</strong> escrita tecnica, technical writing, staff engineer escrita, writing software.
        </p>
      </Section>

      <Section title="Take-aways" accent={accent}>
        <p>Staff engineer vira staff escrevendo. Anti-pattern: "ninguém lê". Solução: write like a journalist, inverted pyramid.</p>
        <Callout tone="success" icon="✅">
          Por que escrita técnica importa staff engineer — PT-BR.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
