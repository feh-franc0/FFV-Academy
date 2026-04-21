import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('code-review-pedagogico');
const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que prefixar comentários com nit:, suggestion:, blocking: (conventional comments) reduz atrito em code review?',
    options: [
      'Fica mais bonito',
      'Remove a ambiguidade: o autor sabe instantaneamente se é obrigatório mergear ou não. Sem prefixo, todo comentário parece blocker, gerando ansiedade e ciclos de review intermináveis',
      'Obriga o autor a responder cada comentário',
      'Só organiza visualmente',
    ],
    correct: 1,
    explanation: 'A maior fonte de atrito em review é não saber o peso do comentário. "Talvez renomear essa var?" — bloqueia? É opinião? Conventional comments (nit, praise, suggestion, question, blocking) declaram a intenção. Autor resolve blocking, considera suggestion, ignora nit sem culpa. Ciclo de review cai de 3–4 round-trips para 1–2.',
  },
  {
    question: 'Qual a forma mais pedagógica de apontar um bug real em review?',
    options: [
      'Reescrever o código na sugestão do GitHub',
      'Fazer pergunta que leve o autor a enxergar sozinho: "blocking: o que acontece se user vier null aqui?" — força o autor a raciocinar, fixa o aprendizado. Se depois de 2 rodadas ainda não pegou, aí sim mostra o diff',
      'Pedir pra reverter o PR inteiro',
      'Comentar só "bug"',
    ],
    correct: 1,
    explanation: 'Pergunta socrática ensina; correção direta só transfere o resultado. Se o autor descobre sozinho, memoriza o padrão e não repete. Se você dá o diff pronto, ele copia e esquece. Exceção: se o PR é urgente (incident hotfix), direto ao ponto. Em review normal, pergunta sempre primeiro. Corrija em DM quando é crítico e a pessoa está aprendendo ainda.',
  },
  {
    question: 'Por que PRs pequenos (< 400 linhas) recebem review de qualidade muito maior?',
    options: [
      'Preferência estética do reviewer',
      'Estudos do Google/SmartBear mostram que defect detection cai exponencialmente acima de ~400 LOC modificadas: o reviewer começa a skimar. PRs pequenos permitem atenção real a cada linha e ciclos mais rápidos',
      'Não há diferença mensurável',
      'Só importa se o código está formatado',
    ],
    correct: 1,
    explanation: 'Dado de pesquisa: reviewer encontra ~70–90% dos defeitos em PR de 200 LOC; cai pra ~30–40% em PR de 1000 LOC. Fadiga cognitiva é real. Solução: stacked PRs (Graphite, Sapling), feature flags pra mergear incompleto com segurança, ou quebrar em 4–5 PRs concatenados. Extra: PR pequeno merge 10x mais rápido — menos conflitos, mais velocidade do time.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="code-review-pedagogico"
      title="Code review como ferramenta pedagógica"
      icon="🔍"
      xp={50}
      readTime={12}
      trailName="Tech Leadership & Staff Engineering"
      trailColor={accent}
      nextSlug="estimativas-sem-mentir"
      nextTitle="Estimativas sem mentir: Hofstadter + cone of uncertainty"
      quiz={quiz}
    >
      <Section title="Review é teaching moment, não gatekeeping" accent={accent}>
        <p>
          Em times saudáveis, review não é defender main contra bugs — é transferência de contexto e crescimento mútuo. Reviewer senior aprende padrões emergentes do time; autor júnior aprende o modelo mental do reviewer. Cada PR é um microtreino. Se review é vivido como &quot;posto policial&quot;, você tem problema cultural antes de técnico.
        </p>
      </Section>

      <Section title="Conventional comments" accent={accent}>
        <CodeBlock lang="markdown">{`# Prefixos (conventionalcomments.org)
praise:      # elogio sincero, não gratuito
nit:         # opinião, ignorar sem custo ("nitpick")
suggestion:  # recomendação, autor decide
question:    # genuína, não retórica
issue:       # defeito que deve ser discutido
blocking:    # bloqueador, precisa resolver antes de merge
thought:     # reflexão futura, não pra esse PR

# Exemplos
praise: Essa refatoração do parser ficou muito mais legível.
nit: talvez "fetchUser" seja mais consistente com o resto do módulo.
suggestion: poderíamos mover isso pra um hook? Reusa em 3 lugares.
blocking: se user for null aqui, crasha. Precisa guardar.
question: por que optamos por async aqui em vez de stream?`}</CodeBlock>
      </Section>

      <Section title="Praise in public, correct in DM" accent={accent}>
        <p>
          Comentário público no PR é permanente e visível ao time. Use pra elogiar padrões bons (reforço positivo multiplica cultura) e pra discutir trade-offs técnicos que o time todo deve ler. Feedback sensível — &quot;você está fazendo isso errado há 3 PRs&quot; — vai pra DM, pra reunião 1:1. Publicizar correção pessoal humilha e cala contribuições futuras.
        </p>
        <Callout tone="warn" icon="⚠️">
          Anti-padrão clássico: senior escreve 40 comentários técnicos em um PR de júnior, todos públicos, sem um único elogio. Júnior ou some ou vira ansioso crônico. Regra prática: razão 1:3 entre crítica e elogio sincero.
        </Callout>
      </Section>

      <Section title="Perguntas socráticas > correções" accent={accent}>
        <CodeBlock lang="ts">{`// ❌ Corretivo direto (pedagogicamente fraco)
// "Use Map aqui em vez de object."

// ✅ Pergunta que leva ao insight
// "question: o que acontece se a key tiver um caractere tipo '__proto__'?
//  Map vs Object aqui faz diferença?"

// Autor pensa, pesquisa, aprende prototype pollution.
// Próximo PR, já vem com Map. Aprendizado fixado.`}</CodeBlock>
      </Section>

      <Section title="Automatize o trivial" accent={accent}>
        <p>
          Reviewer não deve discutir formatação, imports desordenados, linting básico. Tudo isso vai pra CI: Prettier + ESLint + Biome no pre-commit e bloqueador na pipeline. Review humano sobra pra o que importa: arquitetura, trade-offs, invariantes, clareza de intenção, testes.
        </p>
        <Callout tone="success" icon="✅">
          Sinal de time maduro: reviews técnicos discutem modelo de domínio, não vírgulas. Se seu review toda semana tem comentário de estilo, o problema é tooling, não pessoa — corrija no CI e nunca mais veja.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
