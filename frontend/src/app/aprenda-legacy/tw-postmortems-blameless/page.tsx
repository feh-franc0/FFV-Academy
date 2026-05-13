import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('tw-postmortems-blameless');
const accent = '#7c3aed';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o ponto central de "Postmortems blameless que viram aprendizado"?',
    options: [
      'Apenas detalhe de implementação — pouco relevante',
      'Summary, timeline, root cause (5 whys), impact, action items. Cultura blameless: Etsy, Google. Errar humano é expected. Templates Atlassian.',
      'Moda passageira sem aplicação em produção',
      'Receita universal que resolve todo problema',
    ],
    correct: 1,
    explanation: 'Summary, timeline, root cause (5 whys), impact, action items. Cultura blameless: Etsy, Google. Errar humano é expected. Templates Atlassian. Este é o núcleo pedagógico do módulo.',
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
      'Aplicar quando o problema casar com as palavras-chave do módulo (postmortem blameless, 5 whys, incident review, atlassian template); fora desse contexto, soluções mais simples servem melhor',
      'Sempre, independente do contexto',
      'Apenas em projetos greenfield sem legado',
    ],
    correct: 1,
    explanation: 'Aplicação real casa características do problema com a ferramenta/técnica do módulo. Palavras-chave (postmortem blameless, 5 whys, incident review, atlassian template) indicam quando o tema é relevante. Fora desse contexto, complexidade extra custa sem ganho.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="tw-postmortems-blameless"
      title="Postmortems blameless que viram aprendizado"
      icon="🕯️"
      xp={50}
      readTime={12}
      trailName="Technical Writing & RFCs"
      trailColor={accent}
      nextSlug="tw-readme-editorial"
      nextTitle="READMEs editoriais que adotam"
      quiz={quiz}
    >
      <Section title="Mental model" accent={accent}>
        <p>Summary, timeline, root cause (5 whys), impact, action items.</p>
      </Section>

      <Section title="Em detalhes técnicos" accent={accent}>
        <p>Cultura blameless: Etsy, Google.</p>
        <p>
          <strong>Palavras-chave do módulo:</strong> postmortem blameless, 5 whys, incident review, atlassian template.
        </p>
      </Section>

      <Section title="Take-aways" accent={accent}>
        <p>Errar humano é expected. Templates Atlassian.</p>
        <Callout tone="success" icon="✅">
          Postmortem blameless 5 whys template — PT-BR.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
