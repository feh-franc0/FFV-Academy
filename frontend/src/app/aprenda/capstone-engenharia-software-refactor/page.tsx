import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-engenharia-software-refactor');
const accent = '#e3b341';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o primeiro passo de refactor grande?',
    options: [
      'Reescrever do zero',
      'Characterization tests: escrever testes que capturam comportamento ATUAL (bugs incluídos) antes de mudar. Garantem que refactor não regride funcionalidade existente',
      'Deletar código',
      'Mudar tudo ao mesmo tempo',
    ],
    correct: 1,
    explanation: 'Refactor sem testes = jogada às cegas. Characterization (Michael Feathers) — testes que documentam comportamento real, sem julgamento sobre "deveria ser". Depois refatora sabendo que quebrou se teste vermelho.',
  },
  {
    question: 'O que é strangler fig pattern?',
    options: [
      'Nome de antipattern',
      'Migrar legacy gradualmente: novo código tipa side-by-side, gradualmente roteia tráfego. Old system "estrangulado" até morrer. Evita big-bang rewrite',
      'Refactor em produção',
      'Duplicar código',
    ],
    correct: 1,
    explanation: 'Martin Fowler publicou (2004). Clássico: API Gateway roteia 10% pro novo, 90% pro legacy; sobe gradual. Sem janela de risco de rewrite. Amazon usa pra migrar monólito → microservices há 20 anos.',
  },
  {
    question: 'O que é fitness function em arquitetura?',
    options: [
      'Função de teste',
      'Teste AUTOMATIZADO que valida propriedade arquitetural (ex: "camadas não podem importar ao contrário", "latency p99 < 200ms"). Roda em CI — quebra se regride',
      'Só pra microservices',
      'Subjetivo',
    ],
    correct: 1,
    explanation: 'Building Evolutionary Architectures (Neal Ford). Fitness function = teste da arquitetura. Ex: ArchUnit (Java), dependency-cruiser (JS). "Services em camada N não podem importar camada N+1". Impede decay arquitetural.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-engenharia-software-refactor"
      title="Capstone: refactor grande respeitando trilha"
      icon="🏁"
      xp={90}
      readTime={20}
      trailName="Engenharia de Software Moderna"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto" accent={accent}>
        <p>
          Pegue um repo legacy (próprio ou open-source com 50+ stars) e entregue:
        </p>
        <ol className="list-decimal pl-5 my-3 text-sm space-y-1">
          <li>Characterization tests cobrindo fluxo crítico.</li>
          <li>ADR documentando problema + opções + decisão.</li>
          <li>Refactor incremental em PRs pequenos (&lt;400 linhas cada).</li>
          <li>Fitness function em CI (ex: dependency-cruiser rule).</li>
          <li>Retrospectiva: o que ficou, o que falhou, próximos passos.</li>
        </ol>
        <Callout tone="success" icon="🎓">
          Entregável: link pro repo com commits + ADR + CI verde. Refactor REAL, com testes antes, PRs pequenos, documentado.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
