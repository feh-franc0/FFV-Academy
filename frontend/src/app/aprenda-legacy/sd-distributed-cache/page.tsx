import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('sd-distributed-cache');
const accent = '#ea580c';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o ponto central de "Case: distributed cache (Redis/Memcached)"?',
    options: [
      'Apenas detalhe de implementação — pouco relevante',
      'Hash ring (consistent hashing), replication, failover. Cache patterns (aside, through, back). Eviction policies. Hot keys, thundering herd.',
      'Moda passageira sem aplicação em produção',
      'Receita universal que resolve todo problema',
    ],
    correct: 1,
    explanation: 'Hash ring (consistent hashing), replication, failover. Cache patterns (aside, through, back). Eviction policies. Hot keys, thundering herd. Este é o núcleo pedagógico do módulo.',
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
      'Aplicar quando o problema casar com as palavras-chave do módulo (distributed cache design, consistent hashing, cache patterns, hot keys); fora desse contexto, soluções mais simples servem melhor',
      'Sempre, independente do contexto',
      'Apenas em projetos greenfield sem legado',
    ],
    correct: 1,
    explanation: 'Aplicação real casa características do problema com a ferramenta/técnica do módulo. Palavras-chave (distributed cache design, consistent hashing, cache patterns, hot keys) indicam quando o tema é relevante. Fora desse contexto, complexidade extra custa sem ganho.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="sd-distributed-cache"
      title="Case: distributed cache (Redis/Memcached)"
      icon="⚡"
      xp={55}
      readTime={13}
      trailName="System Design Interview Prep"
      trailColor={accent}
      nextSlug="sd-search-system"
      nextTitle="Case: search system (Google-like)"
      quiz={quiz}
    >
      <Section title="Mental model" accent={accent}>
        <p>Hash ring (consistent hashing), replication, failover.</p>
      </Section>

      <Section title="Em detalhes técnicos" accent={accent}>
        <p>Cache patterns (aside, through, back).</p>
        <p>
          <strong>Palavras-chave do módulo:</strong> distributed cache design, consistent hashing, cache patterns, hot keys.
        </p>
      </Section>

      <Section title="Take-aways" accent={accent}>
        <p>Eviction policies. Hot keys, thundering herd.</p>
        <Callout tone="success" icon="✅">
          Distributed cache Redis consistent hashing — PT-BR.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
