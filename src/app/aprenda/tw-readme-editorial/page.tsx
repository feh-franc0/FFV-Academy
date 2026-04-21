import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('tw-readme-editorial');
const accent = '#7c3aed';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o ponto central de "READMEs editoriais que adotam"?',
    options: [
      'Apenas detalhe de implementação — pouco relevante',
      'Hero paragraph, quickstart, install, exemplos, API overview, contributing. Anti-patterns. Shields.io. Social proof (users). Projetos famosos como referência.',
      'Moda passageira sem aplicação em produção',
      'Receita universal que resolve todo problema',
    ],
    correct: 1,
    explanation: 'Hero paragraph, quickstart, install, exemplos, API overview, contributing. Anti-patterns. Shields.io. Social proof (users). Projetos famosos como referência. Este é o núcleo pedagógico do módulo.',
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
      'Aplicar quando o problema casar com as palavras-chave do módulo (readme editorial, readme profissional, quickstart readme, shields.io); fora desse contexto, soluções mais simples servem melhor',
      'Sempre, independente do contexto',
      'Apenas em projetos greenfield sem legado',
    ],
    correct: 1,
    explanation: 'Aplicação real casa características do problema com a ferramenta/técnica do módulo. Palavras-chave (readme editorial, readme profissional, quickstart readme, shields.io) indicam quando o tema é relevante. Fora desse contexto, complexidade extra custa sem ganho.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="tw-readme-editorial"
      title="READMEs editoriais que adotam"
      icon="📖"
      xp={45}
      readTime={10}
      trailName="Technical Writing & RFCs"
      trailColor={accent}
      nextSlug="tw-docs-api-vivas"
      nextTitle="tw-docs-api-vivas"
      quiz={quiz}
    >
      <Section title="Mental model" accent={accent}>
        <p>Hero paragraph, quickstart, install, exemplos, API overview, contributing.</p>
      </Section>

      <Section title="Em detalhes técnicos" accent={accent}>
        <p>Anti-patterns.</p>
        <p>
          <strong>Palavras-chave do módulo:</strong> readme editorial, readme profissional, quickstart readme, shields.io.
        </p>
      </Section>

      <Section title="Take-aways" accent={accent}>
        <p>Shields.io. Social proof (users). Projetos famosos como referência.</p>
        <Callout tone="success" icon="✅">
          README editorial quickstart hero paragraph — PT-BR.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
