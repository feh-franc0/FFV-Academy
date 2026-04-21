import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('tw-adrs-na-pratica');
const accent = '#7c3aed';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o ponto central de "ADRs: decisões arquiteturais registradas"?',
    options: [
      'Apenas detalhe de implementação — pouco relevante',
      'Architecture Decision Records: context, decision, consequences. MADR template. Quando ADR vs design doc. Repositório /docs/adrs como linha do tempo viva.',
      'Moda passageira sem aplicação em produção',
      'Receita universal que resolve todo problema',
    ],
    correct: 1,
    explanation: 'Architecture Decision Records: context, decision, consequences. MADR template. Quando ADR vs design doc. Repositório /docs/adrs como linha do tempo viva. Este é o núcleo pedagógico do módulo.',
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
      'Aplicar quando o problema casar com as palavras-chave do módulo (adr, architecture decision record, madr template, arquitetura decisao); fora desse contexto, soluções mais simples servem melhor',
      'Sempre, independente do contexto',
      'Apenas em projetos greenfield sem legado',
    ],
    correct: 1,
    explanation: 'Aplicação real casa características do problema com a ferramenta/técnica do módulo. Palavras-chave (adr, architecture decision record, madr template, arquitetura decisao) indicam quando o tema é relevante. Fora desse contexto, complexidade extra custa sem ganho.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="tw-adrs-na-pratica"
      title="ADRs: decisões arquiteturais registradas"
      icon="🗂️"
      xp={45}
      readTime={10}
      trailName="Technical Writing & RFCs"
      trailColor={accent}
      nextSlug="tw-postmortems-blameless"
      nextTitle="Postmortems blameless que viram aprendizado"
      quiz={quiz}
    >
      <Section title="Mental model" accent={accent}>
        <p>Architecture Decision Records: context, decision, consequences.</p>
      </Section>

      <Section title="Em detalhes técnicos" accent={accent}>
        <p>MADR template.</p>
        <p>
          <strong>Palavras-chave do módulo:</strong> adr, architecture decision record, madr template, arquitetura decisao.
        </p>
      </Section>

      <Section title="Take-aways" accent={accent}>
        <p>Quando ADR vs design doc. Repositório /docs/adrs como linha do tempo viva.</p>
        <Callout tone="success" icon="✅">
          ADR architecture decision records MADR — PT-BR.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
