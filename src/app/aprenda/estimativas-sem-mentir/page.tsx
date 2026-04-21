import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('estimativas-sem-mentir');
const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que Hofstadter\'s Law ("sempre demora mais do que você espera, mesmo levando Hofstadter em conta") é tão robusta?',
    options: [
      'Porque programadores são preguiçosos',
      'Por viés sistemático: lembramos das vezes que deu certo, esquecemos as que falharam (survivorship bias), subestimamos integrações, dependências externas, corner cases e imprevistos — e o próprio ajuste para isso também subestima',
      'Porque Hofstadter é pessimista',
      'Não é robusta, é só anedota',
    ],
    correct: 1,
    explanation: 'Viés de planejamento documentado desde Kahneman. A mente humana constrói cenário ideal por default e adiciona buffer linear pequeno ("adiciono 20%"). A realidade tem cauda longa: 1 item crítico trava tudo. Por isso multiplicar por 2 (ou 3 em domínios novos) geralmente acerta mais que "eu conheço bem, 2 semanas".',
  },
  {
    question: 'O que é cone of uncertainty e como usá-lo honestamente?',
    options: [
      'Um gráfico bonito',
      'Modelo de Boehm: no início do projeto a estimativa tem variância de ~4x (0.25x a 4x); só após design detalhado cai para ~1.5x. Estimar como "ranges" (best/worst/likely) em vez de ponto único reflete a realidade do estágio',
      'Ferramenta de Gantt chart',
      'Sinônimo de padding',
    ],
    correct: 1,
    explanation: 'Tradicionalmente mostrado como funil: quanto mais cedo, mais largo. Erro clássico é dar estimativa pontual ("3 semanas") no início quando honestamente é "entre 1 e 12 semanas". Melhor: "best case 2 semanas, likely 5, worst 10 — vamos saber melhor após o spike técnico de 3 dias". Gestão adulta aceita ranges. Gestão imatura exige número único e depois fica brava quando erra.',
  },
  {
    question: 'O que é reference class forecasting e por que bate intuição?',
    options: [
      'Estimativa baseada em otimismo',
      'Em vez de estimar "este projeto" do zero, olhar uma classe de projetos similares históricos: "migrações de DB parecidas levaram 6–12 semanas nos últimos 5 casos aqui". Dados reais corrigem o otimismo sistemático',
      'Técnica de copiar planejamento antigo',
      'Só funciona em construção civil',
    ],
    correct: 1,
    explanation: 'Kahneman popularizou. Em vez da "inside view" (imagine o plano), usar "outside view" (histórico de projetos similares). Requer métricas: quanto tempo realmente levaram as últimas 5 features desse porte? Se você não tem histórico, está chutando. Engineer maduro mantém registro mínimo de "estimativa original vs real" e usa pra calibrar próximas estimativas.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="estimativas-sem-mentir"
      title="Estimativas sem mentir: Hofstadter + cone of uncertainty"
      icon="📊"
      xp={55}
      readTime={13}
      trailName="Tech Leadership & Staff Engineering"
      trailColor={accent}
      nextSlug="lidando-com-legacy"
      nextTitle="Lidar com legacy: Chesterton fence + strangler"
      quiz={quiz}
    >
      <Section title="O problema: estimativa como compromisso" accent={accent}>
        <p>
          Gestão pede estimativa. Engenheiro dá número. Número vira deadline. Deadline vira promessa. Deadline estoura. Culpa cai no engenheiro que &quot;não entregou&quot;. O defeito do processo é confundir três coisas distintas: <strong>estimativa</strong> (melhor palpite técnico), <strong>target</strong> (data desejada pelo negócio) e <strong>compromisso</strong> (promessa contratual).
        </p>
        <Callout tone="warn" icon="⚠️">
          Quando você é pressionado a dar um número, pergunte: &quot;isso é estimativa (meu palpite) ou compromisso (prazo contratual)?&quot;. Se for compromisso, precisa de buffer grande. Misturar os três é onde todo projeto de software morre.
        </Callout>
      </Section>

      <Section title="Hofstadter e o viés de planejamento" accent={accent}>
        <p>
          Douglas Hofstadter, 1979: &quot;Sempre vai demorar mais do que você espera, mesmo quando você leva em conta a Lei de Hofstadter&quot;. Não é piada — é viés cognitivo documentado. Nossa mente monta o cenário feliz por default; corner cases, integrações, revisões, bugs imprevistos, fork no requisito, ficam invisíveis até virarem realidade.
        </p>
      </Section>

      <Section title="Cone of uncertainty" accent={accent}>
        <CodeBlock lang="markdown">{`# Cone de incerteza (Boehm, 1981)

Fase                          Variância de estimativa
────────────────────────────────────────────────────
Conceito inicial              0.25x — 4.00x   (16x gap)
Aprovação do requisito        0.50x — 2.00x   (4x gap)
Design de alto nível          0.67x — 1.50x   (2.25x gap)
Design detalhado              0.80x — 1.25x   (1.5x gap)
Implementação iniciada        0.90x — 1.10x   (estável)

Implicação prática:
- Antes do spike técnico, NUNCA dê número único
- Dê range: "entre 3 e 12 semanas, depende de X"
- Após spike curto (3–5 dias), estreite: "entre 6 e 9"
- Só vire compromisso após design detalhado`}</CodeBlock>
      </Section>

      <Section title="Estimativa em range (best/likely/worst)" accent={accent}>
        <CodeBlock lang="ts">{`// Template de resposta honesta a "quanto demora?"
type Estimate = {
  best: number;        // cenário ideal, tudo flui
  likely: number;      // realista, 50% de chance
  worst: number;       // Murphy ligado
  assumptions: string[];
  unknowns: string[];
};

const migrateAuth: Estimate = {
  best: 10,    // dias
  likely: 20,
  worst: 35,
  assumptions: [
    'API do IdP novo é compatível com nosso modelo de claims',
    'Time dedicado 80% sem outros incêndios',
  ],
  unknowns: [
    'Volume de usuários com session legacy precisando migração',
    'Se o módulo de billing depende do JWT atual',
  ],
};

// Outside: "likely 20, worst 35 se A ou B acontecer.
// Posso estreitar em 3 dias de spike se precisar compromisso."`}</CodeBlock>
      </Section>

      <Section title="Reference class forecasting" accent={accent}>
        <p>
          Inside view (&quot;vou pensar nesse projeto&quot;) é otimista. Outside view (&quot;projetos parecidos no histórico levaram X&quot;) é calibrada. Na prática: mantenha planilha simples com <em>estimativa original vs real</em> das últimas 10–20 features. Surpresa comum: a razão média é 1.8x–2.2x. Use esse fator explícito em estimativas novas.
        </p>
        <Callout tone="success" icon="✅">
          &quot;Nos últimos 12 projetos parecidos aqui, estimamos em média 1.9x menos. Estimativa crua é 4 semanas, ajustada pelo fator: 7–8 semanas&quot;. Adultos entendem. Adolescentes organizacionais não — e gestão que não entende é sinal pra procurar outro time.
        </Callout>
      </Section>

      <Section title="'Não sei ainda' é resposta profissional" accent={accent}>
        <p>
          O instinto é dar número pra parecer competente. O oposto é verdade: engenheiro senior diz &quot;ainda não sei, preciso de 3 dias de spike pra reduzir incerteza&quot;. Chutar e errar destrói credibilidade muito mais que pedir tempo pra investigar.
        </p>
      </Section>
    </ModuleLayout>
  );
}
