import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('tw-rfcs-como-escrever');
const accent = '#7c3aed';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o ponto central de "RFCs: quando escrever e como"?',
    options: [
      'Apenas detalhe de implementação — pouco relevante',
      'RFC = Request for Comments. Python PEPs, Rust RFCs, IETF como referência. Diferença vs design doc. Process: draft → discussão → ratify. Templates.',
      'Moda passageira sem aplicação em produção',
      'Receita universal que resolve todo problema',
    ],
    correct: 1,
    explanation: 'RFC = Request for Comments. Python PEPs, Rust RFCs, IETF como referência. Diferença vs design doc. Process: draft → discussão → ratify. Templates. Este é o núcleo pedagógico do módulo.',
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
      'Aplicar quando o problema casar com as palavras-chave do módulo (rfc request for comments, python pep, rust rfc, ietf rfc); fora desse contexto, soluções mais simples servem melhor',
      'Sempre, independente do contexto',
      'Apenas em projetos greenfield sem legado',
    ],
    correct: 1,
    explanation: 'Aplicação real casa características do problema com a ferramenta/técnica do módulo. Palavras-chave (rfc request for comments, python pep, rust rfc, ietf rfc) indicam quando o tema é relevante. Fora desse contexto, complexidade extra custa sem ganho.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="tw-rfcs-como-escrever"
      title="RFCs: quando escrever e como"
      icon="📜"
      xp={50}
      readTime={12}
      trailName="Technical Writing & RFCs"
      trailColor={accent}
      nextSlug="tw-adrs-na-pratica"
      nextTitle="ADRs: decisões arquiteturais registradas"
      quiz={quiz}
    >
      <Section title="Mental model" accent={accent}>
        <p>RFC = Request for Comments.</p>
      </Section>

      <Section title="Em detalhes técnicos" accent={accent}>
        <p>Python PEPs, Rust RFCs, IETF como referência.</p>
        <p>
          <strong>Palavras-chave do módulo:</strong> rfc request for comments, python pep, rust rfc, ietf rfc.
        </p>
      </Section>

      <Section title="Take-aways" accent={accent}>
        <p>Diferença vs design doc. Process: draft → discussão → ratify. Templates.</p>
        <Callout tone="success" icon="✅">
          RFC como escrever Python PEP Rust RFC — PT-BR.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
