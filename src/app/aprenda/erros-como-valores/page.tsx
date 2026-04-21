import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('erros-como-valores');

const accent = '#3178c6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que `throw` em TypeScript é considerado "goto tipado fraco"?',
    options: [
      'Por ser lento no runtime',
      'Porque o tipo de erro não aparece na assinatura da função — quem chama não sabe o que pode ser lançado, o que quebra inference, exhaustiveness e contratos',
      'Porque throw não existe em TypeScript',
      'Porque goto ainda existe em TS',
    ],
    correct: 1,
    explanation: 'A assinatura `function f(): T` mente quando f pode lançar. Quem chama não tem como saber que erros tratar. Em linguagens com checked exceptions (Java) ou Result types (Rust, Elm), isso está explícito. TS/JS não tem — daí Result como padrão emergente.',
  },
  {
    question: 'Quando `throw` AINDA faz sentido?',
    options: [
      'Nunca mais, bane throw',
      'Em situações unrecoverable (bug de lógica, invariante violado) onde você quer que o processo morra — fail-fast',
      'Apenas em testes',
      'Quando não tem tempo de pensar',
    ],
    correct: 1,
    explanation: 'Result é pra erros esperados (falha de rede, parse falhou, input inválido). Throw é pra erros de programação (null que nunca deveria ser null, switch que caiu no default impossível). Fail-fast nesse caso é desejável.',
  },
  {
    question: 'Em railway-oriented programming, o que faz `.map` em um Result?',
    options: [
      'Itera sobre array interno',
      'Transforma o VALUE se ok, passa o erro adiante se err — compõe operações sem if a cada passo',
      'Faz log',
      'Mapeia URLs',
    ],
    correct: 1,
    explanation: 'Result<T, E>.map((t) => t2) aplica a função só no caminho de sucesso. Se erro, o erro flui direto até o fim. Isso permite encadear várias transformações sem aninhamento de if — o "trilho" de sucesso separado do "trilho" de falha, como na metáfora railway-oriented.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="erros-como-valores"
      title="Erros como valores: Result, neverthrow e por que `throw` quebra"
      icon="🚨"
      xp={55}
      readTime={13}
      trailName="TypeScript Profissional"
      trailColor={accent}
      nextSlug="performance-em-node"
      nextTitle="Performance em Node: event loop, streams e backpressure"
      quiz={quiz}
    >
      <Section title="O problema com throw" accent={accent}>
        <p>
          A função <InlineCode>parseJson(s: string): User</InlineCode> parece limpa — mas é mentira. Ela pode lançar SyntaxError. Quem chama <em>não tem como saber</em> pela assinatura. Se você esqueceu o try/catch, o erro propaga silenciosamente até algum ancestor que pode ou não tratá-lo.
        </p>
        <Callout tone="warn" icon="⚠️">
          Em TS, <strong>throw é invisível ao sistema de tipos</strong>. Ao contrário de Java (checked exceptions) ou Rust (Result), a assinatura não obriga ninguém a tratar.
        </Callout>
      </Section>

      <Section title="Result&lt;T, E&gt;: o padrão" accent={accent}>
        <CodeBlock lang="typescript">{`type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function parseJson<T>(raw: string): Result<T, SyntaxError> {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (e) {
    return { ok: false, error: e as SyntaxError };
  }
}

// Uso — impossível esquecer de tratar
const r = parseJson<User>(raw);
if (r.ok) console.log(r.value.name);
else       handleError(r.error);`}</CodeBlock>
        <p>
          A assinatura mostra que pode falhar. O TS força você a narrowing. Impossível esquecer.
        </p>
      </Section>

      <Section title="neverthrow: biblioteca popular" accent={accent}>
        <CodeBlock lang="typescript">{`import { ok, err, Result, ResultAsync } from 'neverthrow';

function parse(raw: string): Result<User, Error> {
  try { return ok(JSON.parse(raw) as User); }
  catch (e) { return err(e as Error); }
}

// Railway: .map aplica transformação só se ok
const r = parse(raw)
  .map(u => u.email)
  .map(email => email.toLowerCase())
  .andThen(email => validateEmail(email));  // andThen = flatMap

if (r.isErr()) handleError(r.error);
else           console.log(r.value);`}</CodeBlock>
      </Section>

      <Section title="Quando throw é aceitável" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>Invariantes violados</strong>: &quot;isso nunca deveria acontecer&quot; — throw crash early. Ex: switch default impossível.</li>
          <li><strong>Bug de programação</strong>: null que foi garantido não-null, mas apareceu. Melhor crash do que continuar em estado corrompido.</li>
          <li><strong>Boundaries externos</strong> onde a lib já lança: <InlineCode>JSON.parse</InlineCode>, <InlineCode>fetch</InlineCode>. Aí você envolve <em>uma vez</em> num try/catch e retorna Result.</li>
        </ul>
        <Callout tone="info" icon="💡">
          Erros <em>esperados</em> (rede caiu, validação falhou, não autorizado) → Result. Erros <em>impossíveis</em> (assertion, bug) → throw.
        </Callout>
      </Section>

      <Section title="Por que FFV Academy segue essa filosofia" accent={accent}>
        <p>
          Este site usa padrão Result em <InlineCode>importState</InlineCode> (retorna <InlineCode>{'{ ok, error }'}</InlineCode>), <InlineCode>safeParseJSON</InlineCode>, <InlineCode>setUser</InlineCode>. Boundaries de input — onde falha é esperada e precisa ser tratada com mensagem ao usuário. Nenhum throw silencioso vaza pra UI.
        </p>
      </Section>
    </ModuleLayout>
  );
}
