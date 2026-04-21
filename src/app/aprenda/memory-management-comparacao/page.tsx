import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('memory-management-comparacao');
const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual problema o borrow checker do Rust resolve em compile-time?',
    options: [
      'Velocidade',
      'Data race e use-after-free: apenas uma referência mutável ou N imutáveis por vez, e referências não sobrevivem ao dono — sem custo em runtime, sem GC, sem pause',
      'Só type checking',
      'Inlining',
    ],
    correct: 1,
    explanation: 'Regras de ownership: cada valor tem um dono, pode ser emprestado imutavelmente (N) ou mutavelmente (1), referência não vive mais que o dono. Resultado: zero data race e zero use-after-free sem custo runtime. O preço: curva de aprendizado real, às vezes refactor profundo.',
  },
  {
    question: 'O que GC generacional otimiza?',
    options: [
      'Velocidade de CPU',
      'A observação de que "a maioria dos objetos morre jovem" — heap é dividido em young/old, young é coletado rapidamente com copy collector, objetos sobreviventes migram para old',
      'Compilação',
      'Inlining',
    ],
    correct: 1,
    explanation: 'HotSpot JVM (G1/ZGC), V8 (JS), CLR (C#) usam generational. Young gen tem collector rápido otimizado para alta taxa de alocação curta. Old gen roda menos mas é mais caro. A hipótese empírica (80%+ objetos morrem em <100ms de vida) dirige todo o design e é o motivo de GC moderno ser barato.',
  },
  {
    question: 'Quando memory manual (C/C++) ainda vale em 2026?',
    options: [
      'Nunca',
      'Em kernel, embarcado com RAM apertada, driver, engine de jogo hot path, e onde o trade-off é determinismo absoluto — Rust também cobre a maioria desses, sendo a alternativa moderna',
      'Em web',
      'Em CLI',
    ],
    correct: 1,
    explanation: 'Manual oferece controle absoluto: zero pause, footprint mínimo, alocator custom. Ainda rainha em Linux kernel, firmware, engine de jogo, HFT. Rust disputa o mesmo espaço com safety, e em 2026 ganha terreno — mas C/C++ continuam em codebase legado e em nichos onde ABI ou toolchain C++ mandam.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="memory-management-comparacao"
      title="Memory management: manual, GC, borrow checker"
      icon="💾"
      xp={55}
      readTime={13}
      trailName="Comparação de Linguagens: Escolha Certa"
      trailColor={accent}
      nextSlug="performance-real-linguagens"
      nextTitle="Performance real: benchmarks honestos"
      quiz={quiz}
    >
      <Section title="Quatro abordagens, quatro trade-offs" accent={accent}>
        <p>
          Gerenciar memória é escolher onde pagar o custo. Manual: pagar em bugs potenciais e complexidade. GC: pagar em CPU contínuo e pauses. Borrow checker: pagar em curva de aprendizado e regras restritivas. Reference counting: pagar em ciclo e overhead atomic. Nenhum é gratuito.
        </p>
      </Section>

      <Section title="Manual (C/C++)" accent={accent}>
        <CodeBlock lang="rust">{`// C idiomático
char* buf = malloc(1024);
if (!buf) return -1;
strncpy(buf, src, 1023);
// ... use
free(buf);
// Esqueceu free? leak. Usou depois de free? crash ou CVE.`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Manual é rei em performance e determinismo. Também é fonte histórica de 70%+ das CVEs em software de sistema (Microsoft e Google confirmam). Responsabilidade total do programador.
        </Callout>
      </Section>

      <Section title="Garbage collector (Java, C#, Go, JS, Python)" accent={accent}>
        <CodeBlock lang="java">{`List<User> users = new ArrayList<>();
for (var id : ids) users.add(load(id));
// sem free: GC coleta quando ninguém aponta mais`}</CodeBlock>
        <p>Automático, seguro, produtivo. Custo: CPU contínuo em collection, pause potencial, heap maior que o necessário. GC moderno (ZGC, Shenandoah, Go runtime) manteve pauses abaixo de 10 ms mesmo em heaps grandes — a queixa dos anos 2000 está obsoleta.</p>
      </Section>

      <Section title="Borrow checker (Rust)" accent={accent}>
        <CodeBlock lang="rust">{`fn biggest<'a>(list: &'a [i32]) -> &'a i32 {
    list.iter().max().unwrap()
}

let v = vec![1, 2, 3];
let r = biggest(&v);     // empresta imutável
// v.push(4);            // erro: não pode mutar enquanto r empresta
println!("{}", r);`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Regras: um dono por valor, N imutable OR 1 mutable, referência &lt;= vida do dono. Resultado: zero runtime cost, zero data race, zero use-after-free. Preço: anos para fluência total, refactor orientado a ownership.
        </Callout>
      </Section>

      <Section title="Reference counting (Swift, ObjC, Python parcial)" accent={accent}>
        <CodeBlock lang="python">{`# Swift ARC: cada objeto tem contador, free quando chega a zero
class Node { var child: Node? }
var a = Node()
var b = Node()
a.child = b
b.child = a     // ciclo: nenhum chega a zero, vaza
                // solução: weak reference para quebrar`}</CodeBlock>
        <p>Previsível (free acontece quando rc=0), mas ciclo exige atenção manual (weak/unowned). Swift usa ARC (atomic rc para thread-safety), custo embutido em cada strong assignment.</p>
      </Section>

      <Section title="Resumo por eixo" accent={accent}>
        <CodeBlock lang="bash">{`                  Safety       Perf         Pause         Curva         Uso em 2026
Manual (C/C++)    Baixa        Máxima       Zero          Alta          Legacy, kernel, engine
GC (Java/C#/Go)   Alta         Boa          ~10ms         Baixa         Backend, apps, web
Borrow (Rust)    Máxima        Máxima       Zero          Alta          Systems moderno, WASM, crypto
RC (Swift/ObjC)   Alta         Boa          Zero          Média         iOS/macOS`}</CodeBlock>
      </Section>

      <Section title="Decisão prática" accent={accent}>
        <Callout tone="success" icon="✅">
          Default 2026: GC (Go/Java/C#) para 80% dos backends. Rust quando perf + safety são não-negociáveis. C/C++ em legacy ou quando ABI/toolchain C++ mandam. Manual puro em kernel. A escolha não é dogmática — é perfil de risco vs velocidade de entrega.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
