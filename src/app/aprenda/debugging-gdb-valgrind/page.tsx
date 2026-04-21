import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('debugging-gdb-valgrind');
const accent = '#a8b1c0';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença prática entre Valgrind e AddressSanitizer?',
    options: [
      'Nenhuma',
      'Valgrind: runtime puro (não precisa recompilar), instrumenta via JIT-translate, ~20x slowdown. ASan: compile-time (requer -fsanitize=address), ~2x slowdown, melhor diagnóstico. Moderno usa ASan em CI e Valgrind em debug forense quando ASan passa',
      'Valgrind é mais rápido',
      'ASan detecta menos bugs',
    ],
    correct: 1,
    explanation: 'ASan é padrão moderno: tão rápido que você roda toda a suite de testes com ele em CI. Valgrind continua útil quando você não pode rebuildar (binário de produção com core dump), ou quando precisa de detectores específicos como Memcheck + DRD + Helgrind. Ambos dão stack traces precisos.',
  },
  {
    question: 'O que significa `bt` no gdb?',
    options: [
      'Break thread',
      'Backtrace — imprime a stack de chamadas até o ponto atual (top = função corrente, bottom = main). Essencial em crash analysis. `bt full` adiciona locais de cada frame; `frame N` navega até um frame específico pra inspecionar',
      'Build target',
      'Binary test',
    ],
    correct: 1,
    explanation: 'Primeiro comando ao atacar crash: rodar até abortar, dar bt. Você vê a cadeia real de chamadas. Combina com `frame 3` + `list` + `print variavel` pra inspecionar estado em qualquer nível. Aprender bem bt + frame + print cobre 80% das sessões de debug reais.',
  },
  {
    question: 'Quando usar core dump em vez de debugar ao vivo?',
    options: [
      'Nunca',
      'Produção: crash raro, reprodutível só com certo estado. Sistema gera core (ativa com ulimit -c unlimited ou systemd configuration), você traz pra dev box e abre com gdb -c core binary. Vê stack + locais como no momento do abort, sem precisar reproduzir',
      'Só em teste',
      'Em todo caso',
    ],
    correct: 1,
    explanation: 'Core dump = snapshot da memória do processo no momento do crash. Ferramenta canônica para bugs difíceis de reproduzir em produção. Moderno: systemd-coredump coleta em /var/lib/systemd/coredump. coredumpctl list/debug abre direto no gdb com símbolos do binário original.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="debugging-gdb-valgrind"
      title="Debugging: gdb, lldb, Valgrind, sanitizers"
      icon="🐛"
      xp={55}
      readTime={13}
      trailName="C Moderno: Systems Programming"
      trailColor={accent}
      nextSlug="threads-pthreads"
      nextTitle="Threads: pthreads e C11 threads"
      quiz={quiz}
    >
      <Section title="gdb: o canivete" accent={accent}>
        <p>
          gdb (ou lldb no macOS) é essencial. Compile com <code>-g</code>, rode sob o debugger, pare em falha, inspecione. Dominar 10 comandos cobre quase tudo.
        </p>
        <CodeBlock lang="bash">{`gdb ./meuapp
(gdb) run arg1 arg2      # executa até crash ou break
(gdb) bt                 # stack trace
(gdb) frame 2            # vai pro frame 2 do bt
(gdb) list               # mostra código
(gdb) print variavel     # inspeciona
(gdb) print *ptr         # derefere
(gdb) break func         # breakpoint em func
(gdb) next               # próxima linha (sem entrar em calls)
(gdb) step               # entra na call
(gdb) continue           # retoma execução`}</CodeBlock>
      </Section>

      <Section title="Receita para bug de crash" accent={accent}>
        <CodeBlock lang="bash">{`# 1. Rebuild com símbolos
cmake --build build --config Debug

# 2. Rodar sob gdb até reproduzir
gdb ./build/app
(gdb) run
# ... crash ...

# 3. Backtrace
(gdb) bt

# 4. Ir ao frame onde o dado é seu
(gdb) frame 2
(gdb) print minha_struct
(gdb) print minha_struct->filho

# 5. Reexecutar com breakpoint antes do ponto suspeito
(gdb) break arquivo.c:42
(gdb) run
(gdb) watch x            # para quando x mudar`}</CodeBlock>
      </Section>

      <Section title="Core dumps" accent={accent}>
        <p>
          Em produção Linux com systemd, core dumps são coletados automaticamente. Use <code>coredumpctl</code> para inspecionar depois, sem precisar reproduzir.
        </p>
        <CodeBlock lang="bash">{`# Habilitar em sessão
ulimit -c unlimited

# Listar cores recentes
coredumpctl list

# Abrir o mais recente direto no gdb
coredumpctl debug

# Ou manual
gdb ./meuapp /var/lib/systemd/coredump/core.meuapp.*.lz4`}</CodeBlock>
      </Section>

      <Section title="Valgrind: memcheck detalhado" accent={accent}>
        <p>
          Quando ASan passou mas você ainda suspeita de leak sutil em alocador custom, Valgrind Memcheck inspeciona byte a byte. Também tem Helgrind (race detector) e DRD (thread error).
        </p>
        <CodeBlock lang="bash">{`valgrind --leak-check=full \\
         --show-leak-kinds=all \\
         --track-origins=yes \\
         --error-exitcode=1 \\
         ./meuapp`}</CodeBlock>
      </Section>

      <Section title="Sanitizers: o kit moderno" accent={accent}>
        <CodeBlock lang="bash">{`# AddressSanitizer: heap/stack overflow, UAF, double-free
clang -fsanitize=address -g -O1 *.c -o asan.bin

# UndefinedBehaviorSanitizer: signed overflow, null deref, shift...
clang -fsanitize=undefined -g -O1 *.c -o ubsan.bin

# ThreadSanitizer: data races
clang -fsanitize=thread -g -O1 *.c -o tsan.bin

# MemorySanitizer: uninitialized reads (Clang only)
clang -fsanitize=memory -g -O1 *.c -o msan.bin`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Sanitizers não se combinam livremente: ASan + UBSan OK. ASan + TSan não. MSan requer libc instrumentada. Na prática: rode builds separados para cada um no CI.
        </Callout>
      </Section>

      <Section title="printf debugging: legítimo" accent={accent}>
        <p>
          Não tenha vergonha de <code>fprintf(stderr, "chk %d\\n", x)</code> quando o bug está em loop apertado onde gdb atrasa muito. Principal para multi-thread ou real-time. Remova antes do commit.
        </p>
      </Section>

      <Section title="Stack de debug pragmática" accent={accent}>
        <Callout tone="success" icon="✅">
          Ordem típica: (1) rodar testes com ASan/UBSan, (2) se ainda falhar em produção, coletar core dump, (3) abrir com gdb + bt + print, (4) se suspeito for thread, rodar TSan, (5) se suspeito for leak sutil, Valgrind.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
