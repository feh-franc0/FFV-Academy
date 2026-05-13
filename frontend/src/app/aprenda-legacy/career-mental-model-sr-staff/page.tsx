import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('career-mental-model-sr-staff');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual eixo melhor diferencia senior de staff engineer?',
    options: [
      'Anos de carreira',
      'Escopo de impacto: senior entrega sistema/componente com qualidade consistente; staff muda como o time/area opera — desbloqueia, prioriza, desenha, nao depende de ticket',
      'Linguagem que domina',
      'Titulo no LinkedIn',
    ],
    correct: 1,
    explanation: 'Will Larson (Staff Engineer) e Tanya Reilly (The Staff Engineer Path) convergem: staff e multiplicador. Senior pode ser brilhante individualmente; staff muda saida do time. Empresas serias tem ladder publica — leia Rent the Runway, Dropbox, Monzo, CircleCI.',
  },
  {
    question: 'Quais sao os arquetipos classicos de staff engineer (Will Larson)?',
    options: [
      'Frontend, backend, mobile',
      'Tech Lead (guia time), Architect (desenha area), Solver (ataca problema mais dificil da empresa), Right Hand (bracos de diretor/VP) — podem se misturar mas predomina um',
      'Junior, pleno, senior',
      'Manager, IC, CTO',
    ],
    correct: 1,
    explanation: 'Os quatro arquetipos estao no livro Staff Engineer e no blog lethain.com. Saber qual e o seu ajuda a calibrar o trabalho diario e o promo packet. Empresa que nao tem staff ladder formal ainda respeita esses rotulos informalmente.',
  },
  {
    question: 'IC vs manager track — qual o ponto honesto?',
    options: [
      'IC paga mais sempre',
      'Sao carreiras com skills diferentes. Manager investe em pessoas, unblock, performance management, decisoes estrategicas. IC senior+ investe em tecnica profunda, mentoria tecnica, arquitetura. Dinheiro em topo e comparavel',
      'Manager e facil',
      'Todo mundo vira manager',
    ],
    correct: 1,
    explanation: 'Camille Fournier (Manager&apos;s Path) e Gergely Orosz cobrem isso extensivamente. A troca e de musculo, nao hierarquia. Escolha baseada em que atividade te energiza. Muitas empresas permitem zigue-zague (switch cada 2-4 anos) — aproveite.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="career-mental-model-sr-staff"
      title="Mental model: junior → sr → staff"
      icon="📐"
      xp={40}
      readTime={9}
      trailName="Career Engineering"
      trailColor={accent}
      nextSlug="resume-tech-que-converte"
      nextTitle="Resume tech que converte"
      quiz={quiz}
    >
      <Section title="Escopo e impacto como eixos" accent={accent}>
        <CodeBlock lang="markdown">{`Escopo             | Impacto tipico
-------------------|-----------------------------
task               | self (L2-L3)
componente         | self + revisor (L3-L4)
sistema            | time (L4 senior)
area/multi-sistema | area inteira (L5 staff)
organizacao        | multiple teams (L6 senior staff / principal)
empresa            | empresa inteira (L7+ distinguished)`}</CodeBlock>
        <p>
          Ladders de empresas abertas (CircleCI, Monzo, Dropbox, Rent the Runway, Patreon) usam eixos parecidos: scope, autonomy, influence, craft. Staff nao e &quot;senior++&quot; — e mudanca qualitativa em como o trabalho e feito.
        </p>
      </Section>

      <Section title="Os quatro arquetipos de staff (Will Larson)" accent={accent}>
        <CodeBlock lang="markdown">{`Tech Lead
  guia time de 5-15 eng, conduz roadmap tecnico, faz code review estrategico
  dia a dia: 40% coding, 40% design/unblock, 20% alinhamento

Architect
  responsavel por direcao tecnica de area (1-5 times)
  dia a dia: 20% coding, 50% design docs + review, 30% influencia

Solver
  ataca o problema mais dificil ou critico da empresa por vez
  dia a dia: 70% coding + research, 30% escrita/documentacao

Right Hand
  bracos tecnicos de VP/CTO, representa engenharia em decisoes corporativas
  dia a dia: 20% coding, 60% reuniao e escrita, 20% mentoria`}</CodeBlock>
      </Section>

      <Section title="IC vs manager track" accent={accent}>
        <Callout tone="info">
          Empresas tier-1 (Big Tech + scaleups maduras) pagam IC staff e manager equivalente ate cerca de nivel senior staff / senior manager. Distinguished/Principal vs Director ainda equivalente. Acima disso os caminhos divergem. Se alguem te diz &quot;IC nao escala salario&quot;, essa pessoa parou de ler ladder de 2015.
        </Callout>
      </Section>

      <Section title="Referencias de leitura obrigatoria" accent={accent}>
        <CodeBlock lang="markdown">{`- Will Larson — Staff Engineer (livro) + lethain.com
- Tanya Reilly — The Staff Engineer Path (livro)
- Camille Fournier — The Manager's Path
- Gergely Orosz — Pragmatic Engineer (newsletter + livros)
- Julia Evans — jvns.ca (brag doc, learning public)
- Haseeb Qureshi — playbook de negotiation
- Levels.fyi — benchmark salarial real
- StaffEng.com — entrevistas com staff engineers`}</CodeBlock>
      </Section>
    </ModuleLayout>
  );
}
