import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('type-systems-comparados');
const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre tipagem estrutural e nominal?',
    options: [
      'Só a sintaxe',
      'Estrutural aceita qualquer tipo com a mesma forma (TypeScript, Go); nominal exige declaração explícita de implementar/estender (Java, C#) — estrutural é mais flexível, nominal é mais rigoroso em fronteira de domínio',
      'Estrutural é dinâmica',
      'Nominal não existe mais',
    ],
    correct: 1,
    explanation: 'Em TS, { text: string } é satisfeito por qualquer objeto com name: string. Em Java, para implementar Namable você escreve implements Namable. Estrutural facilita composição e adaptação; nominal documenta intenção e evita colisão acidental. Times grandes costumam valorizar nominal em domain boundary.',
  },
  {
    question: 'Por que TypeScript é unsound e Rust é sound?',
    options: [
      'Questão de versão',
      'TS escolheu aceitar padrões JS comuns (any, casts, lookup type) em troca de adoção — o compilador tolera buracos. Rust bloqueia qualquer violação de memória no compile-time sem escapes — é sound por design',
      'Rust não tem genéricos',
      'TS é interpretado',
    ],
    correct: 1,
    explanation: 'Sound = se compila, não falha em runtime por motivo de tipo. TS tem any, type assertion, index access que podem retornar undefined sem marcar. Rust não aceita referência dangling, data race ou uso-depois-de-move no compile-time. A trade-off: Rust é mais rigoroso, TS migra codebases grandes mais fácil.',
  },
  {
    question: 'Quando type inference vira problema?',
    options: [
      'Nunca',
      'Quando o inferidor escolhe tipo mais específico ou mais amplo do que o autor quis (ex: readonly array inferido como tuple), ou quando a API pública perde documentação implícita — anote tipos em boundary público',
      'Só em Java',
      'Nunca em 2026',
    ],
    correct: 1,
    explanation: 'TS com noImplicitAny=true + const assertions ajudam. Kotlin/Scala herdam inferência do ML e às vezes inferem tipos que desagradam. Regra de ouro: anote sempre public API (função exportada, retorno de método público). Deixe inferência só em variável local — clareza vence sutileza.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="type-systems-comparados"
      title="Type systems comparados"
      icon="🏷️"
      xp={55}
      readTime={13}
      trailName="Comparação de Linguagens: Escolha Certa"
      trailColor={accent}
      nextSlug="concurrency-models"
      nextTitle="Concurrency models: threads, async, CSP, Actor"
      quiz={quiz}
    >
      <Section title="Type system é escolha de valor" accent={accent}>
        <p>
          Dinâmico (Python, Ruby, JS) prioriza velocidade de prototipação; estático (Java, Go, Rust, C#) prioriza garantia em refactor. A discussão "qual é melhor" não tem resposta única — depende do domínio, do tamanho do time, da longevidade do código. O que importa é entender as dimensões.
        </p>
      </Section>

      <Section title="Eixo 1: dinâmico vs estático" accent={accent}>
        <CodeBlock lang="python">{`# Python — dinâmico
def add(a, b):
    return a + b

add(1, 2)       # 3
add("a", "b")   # "ab"
add(1, "b")     # TypeError só em runtime`}</CodeBlock>
        <CodeBlock lang="ts">{`// TypeScript — estático
function add(a: number, b: number): number { return a + b; }
add(1, 2);     // ok
add(1, "b");   // erro em compile`}</CodeBlock>
        <p>Dinâmico paga a dívida em runtime e em teste. Estático paga adiantado no compile. Para código longevo, estático quase sempre ganha.</p>
      </Section>

      <Section title="Eixo 2: estrutural vs nominal" accent={accent}>
        <CodeBlock lang="ts">{`// TS é estrutural
interface Named { text: string; }
const u = { text: "Ana", age: 30 };
const n: Named = u;   // OK, mesma forma`}</CodeBlock>
        <CodeBlock lang="java">{`// Java é nominal
interface Named { String name(); }
class User { String name() { return "Ana"; } }
Named n = new User();   // erro: User não implements Named`}</CodeBlock>
      </Section>

      <Section title="Eixo 3: sound vs unsound" accent={accent}>
        <CodeBlock lang="ts">{`// TS unsound: any abre buraco
const x: any = 42;
const s: string = x;   // compila mas explode em runtime se usar .toUpperCase`}</CodeBlock>
        <CodeBlock lang="rust">{`// Rust sound: nenhum escape em segurança de memória
fn main() {
    let s = String::from("hi");
    let r = &s;
    drop(s);        // compilador barra: r ainda em uso
    println!("{}", r);
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Sound = se o compilador aprovou, tipo e memória são garantidos. Rust sacrifica conveniência para conseguir isso. TS aceita imperfeição para migrar JS existente.
        </Callout>
      </Section>

      <Section title="Eixo 4: inferência e verbosidade" accent={accent}>
        <CodeBlock lang="java">{`// Java antigo: Map<String, List<User>> m = new HashMap<String, List<User>>();
// Java 10+: var m = new HashMap<String, List<User>>();
// Kotlin:   val m = hashMapOf<String, List<User>>()
// Scala:    val m = HashMap.empty[String, List[User]]
// TS:       const m: Map<string, User[]> = new Map()`}</CodeBlock>
      </Section>

      <Section title="Mapa mental resumido" accent={accent}>
        <CodeBlock lang="bash">{`             Dinâmico           Estático
Estrutural   JS (loose)          TS, Go
Nominal      —                   Java, C#, C++, Kotlin, Rust
Sound        —                   Rust, Haskell, OCaml
Unsound      JS                  TS, Java (com casts), C#`}</CodeBlock>
      </Section>

      <Section title="Conclusão pragmática" accent={accent}>
        <Callout tone="success" icon="✅">
          Para código de produção que viverá anos: estático é quase sempre melhor, e a escolha entre estrutural/nominal depende de estilo do time. Sound (Rust, Haskell) é prêmio onde garantia vale mais que tempo de desenvolvimento. Dinâmico (Python, JS) segue rainha em notebooks, scripts e prototipação.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
