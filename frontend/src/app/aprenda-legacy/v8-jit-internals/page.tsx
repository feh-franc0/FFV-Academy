import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  KeyValue,
  FlowDiagram,
  Timeline,
  DecisionBox,
  StackFlow,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('v8-jit-internals');

const ACCENT = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o V8 tem 4 tiers (Ignition, Sparkplug, Maglev, TurboFan) e não simplesmente compila tudo com o melhor otimizador?',
    options: [
      'Para suportar diferentes versões de ECMAScript em fallback',
      'Trade-off entre tempo de compilação e qualidade do código. TurboFan produz código quase ótimo mas leva milissegundos por função; Ignition começa a executar em microssegundos. Funções quentes “graduam” pelos tiers à medida que provam que valem o custo de compilação',
      'Cada tier é responsável por um subset de operações (aritmética, objetos, async) que rodam em paralelo',
      'É uma exigência da especificação ECMAScript desde 2017',
    ],
    correct: 1,
    explanation:
      'V8 usa multi-tier porque compilação otimizante é cara. Ignition (interpreter de bytecode) gasta ~0 setup e roda “rapidinho”. Sparkplug (2021, v9.1) compila bytecode → machine code sem otimização em microssegundos — ganha ~5–15% sem custo de profiling. Maglev (2023, v11.7) é otimizador mid-tier rápido sem inline pesado. TurboFan (top-tier) faz inlining, escape analysis, redundant load elimination — caro, só vale para funções comprovadamente hot. Ver v8.dev/blog/sparkplug e v8.dev/blog/maglev.',
  },
  {
    question: 'O que é uma hidden class (também chamada Map ou Shape) no V8 e por que ela é crítica para performance?',
    options: [
      'Uma classe ES6 marcada como private — só acessível dentro do mesmo módulo',
      'Estrutura interna que descreve o layout de propriedades de um objeto. V8 atribui hidden classes idênticas a objetos com o mesmo conjunto de propriedades na mesma ordem, permitindo property access em O(1) via offset fixo em vez de hash lookup',
      'Cache de protótipos compartilhado entre instâncias de uma mesma função construtora',
      'Versão otimizada de Map nativo do JavaScript com lookup mais rápido',
    ],
    correct: 1,
    explanation:
      'Em JS objetos são bags de propriedades dinâmicos, mas o V8 finge que eles têm structs C++. Quando você cria `{x: 1}` e depois `{x: 2}`, ambos compartilham a mesma hidden class. Adicionar propriedades fora de ordem (primeiro `x` num e `y` em outro, depois inverter) cria classes diferentes e quebra inline caches. Mathias Bynens documentou em mathiasbynens.be/notes/shapes-ics — leitura obrigatória.',
  },
  {
    question: 'O que significa “deopt” (deoptimization) e qual é a consequência prática?',
    options: [
      'Garbage collector liberando memória de funções compiladas raramente usadas',
      'TurboFan abandona o código otimizado e volta para Ignition porque uma assunção feita na otimização foi violada (ex: tipo mudou, hidden class mudou). Custa centenas de microssegundos e zera o trabalho de compilação',
      'Browser entra em modo low-power e baixa a frequência da CPU',
      'V8 pausa o JIT durante minor GC para evitar contention',
    ],
    correct: 1,
    explanation:
      'TurboFan especula. Se ele otimizou `add(a, b)` assumindo SMI (Small Integer), e você passa um float ou string, o código otimizado é descartado e a execução pula para Ignition. Múltiplos deopts disparam “bailout” — V8 marca a função como não-otimizável. Use `--trace-deopt` no node para diagnosticar. Vyacheslav Egorov (mrale.ph) tem posts seminais sobre isso.',
  },
  {
    question: 'Qual destas práticas mais ajuda o V8 a otimizar seu código?',
    options: [
      'Usar `var` em vez de `let`/`const` (mais antigo, mais otimizado)',
      'Inicializar todas as propriedades de um objeto no construtor, na mesma ordem, com tipos consistentes (monomorphic call sites)',
      'Evitar funções pequenas porque o overhead de chamada é caro',
      'Substituir `for…of` por `for` clássico — `for…of` aloca iterator',
    ],
    correct: 1,
    explanation:
      'Monomorphism é rei. Quando uma call site sempre vê o mesmo tipo (mesma hidden class), o V8 instala inline cache monomórfica — uma comparação rápida e jump direto. Polymorphic (2–4 tipos) é OK. Megamorphic (>4) cai para lookup genérico no hashtable. Ver “What’s up with monomorphism?” (mrale.ph/blog/2015/01/11/whats-up-with-monomorphism.html).',
  },
  {
    question: 'O que Sparkplug faz que Ignition já não fazia, e por que ele foi adicionado em 2021?',
    options: [
      'Sparkplug é um GC concurrent mais rápido que o Orinoco',
      'Sparkplug é um baseline JIT non-optimizing que compila bytecode Ignition direto em machine code em ~uma única passagem linear, sem IR intermediária. Ganha ~5–15% em workloads reais (Speedometer 2) com custo de compilação muito baixo',
      'Sparkplug substitui o parser/lazy-compilation para JavaScript moderno (top-level await)',
      'Sparkplug é a versão WASM do TurboFan',
    ],
    correct: 1,
    explanation:
      'Sparkplug (Leszek Swirski, v8.dev/blog/sparkplug, 2021) traduz bytecode → machine code num passe linear sem montar grafo IR. Cada bytecode vira um handler chamado por dispatch table; Sparkplug inline-replica esses handlers gerando código que “parece” o interpreter rodando, mas sem o overhead da máquina de despacho. Trade-off magnífico de simplicidade vs ganho.',
  },
  {
    question: 'Por que adicionar/remover propriedades dinamicamente de objetos prejudica performance?',
    options: [
      'Force layout no engine de renderização',
      'Cada mutação cria uma nova hidden class — “transitioning”. Objetos similares acabam com hidden classes diferentes, tornando call sites polimórficos/megamórficos e invalidando inline caches',
      'O GC precisa rodar a cada modificação para reescanear referências',
      'Apenas afeta `Object.defineProperty`, não atribuição normal',
    ],
    correct: 1,
    explanation:
      'Cada novo nome de propriedade cria uma transition tree. Se duas instâncias “evoluem” diferente (uma ganha `a` depois `b`, outra `b` depois `a`), elas terminam em hidden classes diferentes apesar de terem o mesmo shape lógico. Use `class` com inicialização completa no construtor para canonizar a forma desde o início.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="v8-jit-internals"
      title="V8 JIT: Ignition, TurboFan e como JS vira asm"
      icon="⚡"
      xp={70}
      readTime={14}
      trailName="Browser & Web Internals Profundo"
      trailColor={ACCENT}
      nextSlug="js-garbage-collection"
      nextTitle="GC do V8: Orinoco, generational, concurrent, incremental"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        O V8 não “interpreta JavaScript”. Ele transforma seu código em quatro camadas
        progressivamente mais otimizadas — Ignition, Sparkplug, Maglev e TurboFan — cada uma
        com um trade-off explícito entre tempo de compilação e qualidade do código gerado.
        Entender essa pipeline é a diferença entre escrever código que parece rápido e código
        que <em>realmente</em> é rápido.
      </p>

      <Section title="A pipeline de execução em 2026" accent={ACCENT}>
        <p>
          Desde a v11.7 (2023) o V8 expõe quatro tiers públicos. Cada função começa no Ignition
          e só sobe quando o feedback de execução prova que vale o investimento de compilação.
          O critério é simples: invocations frequentes + tipos estáveis = candidato a TurboFan.
        </p>
        <StackFlow
          title="Os 4 tiers do V8 (top-down, do mais barato ao mais otimizado)"
          accent={ACCENT}
          items={[
            {
              icon: '📜',
              label: 'Ignition',
              sub: 'Interpreter de bytecode',
              detail: 'Compila source → bytecode register-machine (uma vez por função, sob demanda). Roda direto. Setup quase zero. Coleta type feedback em inline caches para os tiers superiores.',
              connector: 'hot? (~1k invocations)',
            },
            {
              icon: '🔌',
              label: 'Sparkplug',
              sub: 'Baseline JIT (v9.1, 2021)',
              detail: 'Compila bytecode → machine code em um único passe linear, sem IR intermediária, sem otimização. Ganho ~5–15% em workloads reais quase grátis (custo ~microssegundos por função).',
              connector: 'mais hot?',
            },
            {
              icon: '🚀',
              label: 'Maglev',
              sub: 'Mid-tier (v11.7, 2023)',
              detail: 'Otimizador rápido com IR SSA simplificada. Inline básico, redução de checagens, fast paths para SMI/strings. Compila em ~1ms. Ganha ~20% em código tipicamente hot mas não-hot-de-verdade.',
              connector: 'realmente hot?',
            },
            {
              icon: '🏎️',
              label: 'TurboFan',
              sub: 'Optimizing JIT top-tier',
              detail: 'IR “Sea of Nodes”, inlining agressivo, escape analysis, redundant load elimination, range analysis. Compila em ~10–100ms, mas produz código quase ótimo. Pode deoptar (fall back para Ignition) se assunções falharem.',
            },
          ]}
        />
        <Callout tone="info" icon="📚">
          Leitura primária: <InlineCode>v8.dev/blog/sparkplug</InlineCode>,{' '}
          <InlineCode>v8.dev/blog/maglev</InlineCode>,{' '}
          <InlineCode>v8.dev/blog/turbofan-jit</InlineCode>. Para profundidade técnica,
          “Sea of Nodes” em <InlineCode>v8.dev/docs/ignition</InlineCode> e o paper original do
          TurboFan de 2016 (Titzer et al, ECOOP).
        </Callout>
      </Section>

      <Section title="Hidden classes (Shapes/Maps)" accent={ACCENT}>
        <p>
          JavaScript pretende que objetos são bags de propriedades dinâmicos. V8 finge que
          eles são structs C++. Cada objeto aponta para uma <strong>hidden class</strong> que
          descreve seu layout: nomes de propriedades, ordem e offsets. Objetos com o mesmo
          shape compartilham a mesma hidden class — e isso permite property access em O(1).
        </p>
        <CodeBlock lang="javascript" filename="hidden-classes.js">{`// ✅ Objetos compartilham a mesma hidden class
function Point(x, y) {
  this.x = x;  // transition: empty → {x}
  this.y = y;  // transition: {x} → {x, y}
}

const p1 = new Point(1, 2);
const p2 = new Point(3, 4);
// p1 e p2 têm a mesma hidden class → call sites monomórficos

// ❌ Ordem diferente cria hidden classes diferentes
const a = {};
a.x = 1;
a.y = 2;        // shape: {x, y}

const b = {};
b.y = 2;        // shape: {y}
b.x = 1;        // shape: {y, x} ≠ {x, y}!

// ❌ Adicionar propriedade depois quebra a forma
p1.z = 5;       // p1 muda de shape; ICs que viam Point ficam polimórficos
`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Adicionar propriedades fora do construtor causa “transition” de hidden class. Se isso
          acontecer em call sites já otimizados, eles deoptam. Padrão correto: inicialize TODAS
          as propriedades no construtor/classe, na mesma ordem, sempre.
        </Callout>
        <p>
          Mathias Bynens (engenheiro V8) documentou em{' '}
          <InlineCode>mathiasbynens.be/notes/shapes-ics</InlineCode> com diagramas que
          merecem ser lidos antes de qualquer “otimização” especulativa.
        </p>
      </Section>

      <Section title="Inline Caches (ICs) — o coração da especulação" accent={ACCENT}>
        <p>
          Toda operação em JS é polimórfica em potencial: <InlineCode>obj.x</InlineCode> pode
          ser SMI, double, string, getter, proxy. V8 mantém um <strong>inline cache</strong>{' '}
          por call site que memoriza “o tipo que vi da última vez” e o caminho rápido.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Estado do IC', 'O que significa', 'Performance']}
          rows={[
            ['Uninitialized', 'Call site nunca executou', 'Neutro (primeira vez)'],
            ['Monomorphic', 'Sempre o mesmo shape', '🚀 Ótimo — jump direto pelo offset'],
            ['Polymorphic (2–4)', 'Pequena handful de shapes', 'OK — pequena linear search'],
            ['Megamorphic (>4)', 'Muitos shapes diferentes', '🐌 Cai para hash lookup genérico'],
            ['Generic', 'Não otimizável (proxy, etc)', '🐌🐌 Caminho lento full'],
          ]}
        />
        <Callout tone="tip" icon="🎯">
          Objetivo: manter call sites <strong>monomórficos</strong>. Funções genéricas que
          recebem múltiplos tipos sofrem. Quebrar em duas funções específicas (uma para SMI,
          outra para Float64Array) frequentemente acelera 2–5×.
        </Callout>
      </Section>

      <Section title="Deoptimization — quando TurboFan desiste" accent={ACCENT}>
        <p>
          TurboFan especula. Se ele assumiu que <InlineCode>x</InlineCode> é sempre SMI e você
          passa um string, o código otimizado é descartado e a execução pula para Ignition no
          meio da função (on-stack replacement). Custa centenas de microssegundos.
        </p>
        <CodeBlock lang="bash" filename="trace-deopt.sh">{`# Node.js: trace deopts para diagnosticar
node --trace-deopt --trace-opt app.js

# Saída típica:
# [marking <function add> for non-concurrent optimization]
# [compiling method <function add> using TurboFan]
# [deoptimizing (DEOPT eager): begin <function add>
#   (opt #4) @1, FP to SP delta: 32, caller sp: ...
#   reason: not a Smi]

# Inspecionar bytecode Ignition
node --print-bytecode --print-bytecode-filter=add app.js`}</CodeBlock>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'DEOPT eager', v: 'Imediato — TurboFan saiu do código otimizado agora' },
            { k: 'DEOPT lazy', v: 'Adiado — invalidado mas só acontece na próxima entrada' },
            { k: 'DEOPT soft', v: 'Recuperável — TurboFan vai tentar reotimizar com novo feedback' },
            { k: 'Bailout', v: 'Após N deopts seguidos, função é marcada como não-otimizável' },
          ]}
        />
        <p>
          Vyacheslav “mraleph” Egorov (ex-V8) tem a melhor literatura sobre isso em{' '}
          <InlineCode>mrale.ph</InlineCode> — “What’s up with monomorphism?” e “Performance
          Tips for JavaScript in V8” são canônicos.
        </p>
      </Section>

      <Section title="Timeline da pipeline V8" accent={ACCENT}>
        <Timeline
          accent={ACCENT}
          events={[
            { when: '2008', label: 'Crankshaft (RIP)', detail: 'Primeiro JIT otimizante do V8. Vibrantemente complexo, gerava código diretamente do AST. Removido em 2017.' },
            { when: '2016', label: 'TurboFan + Ignition shipam', detail: 'TurboFan com IR “Sea of Nodes”, Ignition como interpreter de bytecode. Mudança arquitetural fundamental (v5.9).' },
            { when: '2021', label: 'Sparkplug', detail: 'Baseline JIT non-optimizing. Compila bytecode em machine code em um passe linear. v9.1.', highlight: true },
            { when: '2023', label: 'Maglev', detail: 'Mid-tier optimizer rápido. Preenche o gap entre Sparkplug e TurboFan. v11.7.', highlight: true },
            { when: '2024–26', label: 'Refinamentos contínuos', detail: 'Maglev expandido para mais arquiteturas (ARM64), tuning de heurísticas de tier-up, melhorias de inline cache em Records & Tuples (estágio 3).' },
          ]}
        />
      </Section>

      <Section title="Padrões que ajudam o V8" accent={ACCENT}>
        <DecisionBox
          scenario="Você está otimizando uma hot function que é chamada milhões de vezes por segundo"
          winner="Mantenha tipos monomórficos e inicialize tudo no construtor"
          winnerColor={ACCENT}
          why="Monomorphic call sites permitem inline cache rápido e TurboFan inline. Tipos estáveis evitam deopt. Inicialização completa fixa hidden class desde o início."
          alternatives={[
            { name: 'Micro-otimizar (--, ++, bitwise)', note: 'V8 já faz essas otimizações; foco em macro estrutura' },
            { name: 'Escrever em WASM', note: 'Só vale para CPU-bound real (ver módulo wasm-do-typescript)' },
          ]}
        />
        <CodeBlock lang="javascript" filename="patterns.js">{`// ✅ BOM: classe canônica, tipos estáveis
class Vector {
  constructor(x, y, z) {
    this.x = +x;   // força SMI/double, evita string
    this.y = +y;
    this.z = +z;
  }
  add(other) {
    return new Vector(this.x + other.x, this.y + other.y, this.z + other.z);
  }
}

// ❌ RUIM: shape varia, tipos misturados
function makeVector(x, y, z) {
  const v = {};
  if (z !== undefined) v.z = z;  // shape condicional!
  v.x = x;
  v.y = y;
  return v;
}

// ❌ RUIM: função megamórfica (recebe muitos shapes)
function getX(obj) { return obj.x; }
getX({x: 1});                    // shape A
getX({x: 1, y: 2});               // shape B
getX({x: 1, y: 2, z: 3});         // shape C
getX(new Vector(1, 2, 3));        // shape D
getX({a: 'oi', x: 1});            // shape E → megamorphic!`}</CodeBlock>
      </Section>

      <Section title="Ferramentas práticas" accent={ACCENT}>
        <FlowDiagram
          title="Workflow para diagnosticar performance V8"
          accent={ACCENT}
          orientation="vertical"
          steps={[
            { icon: '1️⃣', label: 'Profile', desc: 'Chrome DevTools Performance ou node --prof' },
            { icon: '2️⃣', label: 'Identifique hot functions', desc: 'Self time > 1% no flame chart' },
            { icon: '3️⃣', label: 'Trace IC + deopt', desc: '--trace-ic --trace-deopt --trace-opt-verbose' },
            { icon: '4️⃣', label: 'Inspecione hidden classes', desc: '%HaveSameMap(a, b) com --allow-natives-syntax' },
            { icon: '5️⃣', label: 'Refatore para monomorphism', desc: 'Classes canônicas, tipos estáveis' },
            { icon: '6️⃣', label: 'Valide ganho', desc: 'Microbenchmark com tinybench ou mitata' },
          ]}
        />
        <CodeBlock lang="javascript" filename="natives-syntax.js">{`// rode com: node --allow-natives-syntax
const a = { x: 1, y: 2 };
const b = { x: 3, y: 4 };
const c = { y: 5, x: 6 };  // ordem invertida!

console.log(%HaveSameMap(a, b));  // true
console.log(%HaveSameMap(a, c));  // false — shapes diferentes

// Forçar otimização e ver status
function add(a, b) { return a + b; }
for (let i = 0; i < 1e5; i++) add(1, 2);
%OptimizeFunctionOnNextCall(add);
add(1, 2);
console.log(%GetOptimizationStatus(add));`}</CodeBlock>
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Vale escrever JS pensando no V8 quando meu código também roda em Safari (JavaScriptCore) e Firefox (SpiderMonkey)?"
          a={
            <span>
              Os princípios são universais: todos os engines modernos usam tiered JIT, hidden classes
              (Shapes em JSC, Shapes em SpiderMonkey), inline caches e especulação de tipo. Otimizar
              para V8 quase sempre ajuda nos outros. Diferenças aparecem em microbenchmarks específicos
              (string concat, regex, certos GC patterns), não em macro estrutura.
            </span>
          }
        />
        <QAItem
          q="TypeScript ajuda o V8 a otimizar?"
          a={
            <span>
              Não diretamente — o V8 vê apenas o JS transpilado, sem types. Mas TS <em>encoraja</em>{' '}
              padrões que o V8 ama: classes com shapes estáveis, parâmetros monomórficos, evitar{' '}
              <InlineCode>any</InlineCode>. O ganho é indireto via disciplina.
            </span>
          }
        />
        <QAItem
          q="Por que `try/catch` historicamente era “lento”?"
          a={
            <span>
              Até o V8 v6.0 (2017), TurboFan se recusava a otimizar funções com{' '}
              <InlineCode>try/catch</InlineCode>. Hoje otimiza normalmente. O mito persiste mas é
              folclore — use try/catch normalmente.
            </span>
          }
        />
        <QAItem
          q="`delete obj.prop` ainda é um problema?"
          a={
            <span>
              Sim. <InlineCode>delete</InlineCode> muda o objeto para “dictionary mode” (hashtable),
              perdendo o layout de shape. Em hot paths, atribua <InlineCode>undefined</InlineCode>{' '}
              em vez de deletar.
            </span>
          }
        />
      </Section>

      <Callout tone="success" icon="✅">
        Próximo passo: entender como o V8 gerencia memória — o GC Orinoco com generational
        collection, incremental marking e concurrent sweeping. Veja{' '}
        <InlineCode>js-garbage-collection</InlineCode>.
      </Callout>
    </div>
  );
}
