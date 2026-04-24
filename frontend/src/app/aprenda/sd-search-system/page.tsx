import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('sd-search-system');
const accent = '#ea580c';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o ponto central de "Case: search system (Google-like)"?',
    options: [
      'Apenas detalhe de implementação — pouco relevante',
      'Inverted index, tokenization, ranking (BM25 + learning-to-rank), query suggest, autocomplete. Elasticsearch arch. Vector search hybrid.',
      'Moda passageira sem aplicação em produção',
      'Receita universal que resolve todo problema',
    ],
    correct: 1,
    explanation: 'Inverted index, tokenization, ranking (BM25 + learning-to-rank), query suggest, autocomplete. Elasticsearch arch. Vector search hybrid. Este é o núcleo pedagógico do módulo.',
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
      'Aplicar quando o problema casar com as palavras-chave do módulo (search system design, inverted index, elasticsearch arch, ranking); fora desse contexto, soluções mais simples servem melhor',
      'Sempre, independente do contexto',
      'Apenas em projetos greenfield sem legado',
    ],
    correct: 1,
    explanation: 'Aplicação real casa características do problema com a ferramenta/técnica do módulo. Palavras-chave (search system design, inverted index, elasticsearch arch, ranking) indicam quando o tema é relevante. Fora desse contexto, complexidade extra custa sem ganho.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="sd-search-system"
      title="Case: search system (Google-like)"
      icon="🔍"
      xp={60}
      readTime={14}
      trailName="System Design Interview Prep"
      trailColor={accent}
      nextSlug="capstone-sd-mock-interview"
      nextTitle="Capstone: mock interview completo"
      quiz={quiz}
    >
      <Section title="Mental model" accent={accent}>
        <p>Inverted index, tokenization, ranking (BM25 + learning-to-rank), query suggest, autocomplete.</p>
      </Section>

      <Section title="Em detalhes técnicos" accent={accent}>
        <p>Elasticsearch arch.</p>
        <p>
          <strong>Palavras-chave do módulo:</strong> search system design, inverted index, elasticsearch arch, ranking.
        </p>
      </Section>

      <Section title="Take-aways" accent={accent}>
        <p>Vector search hybrid.</p>
        <Callout tone="success" icon="✅">
          Search system design Elasticsearch BM25 — PT-BR.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
