import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('c-historia-compilador-diferencial');
const accent = '#a8b1c0';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que C continua dominando kernel, drivers e runtimes de outras linguagens em 2026?',
    options: [
      'Inércia de mercado apenas',
      'C mapeia quase 1:1 para o hardware, não exige runtime nem GC, e seu ABI estável serve como lingua franca entre sistemas — por isso o kernel Linux, CPython, PostgreSQL, Redis, SQLite e praticamente todo runtime de linguagem moderna têm o núcleo em C',
      'Porque é a linguagem mais fácil de escrever',
      'Porque tem o melhor sistema de tipos',
    ],
    correct: 1,
    explanation: 'C tem três propriedades que competidores raramente combinam: zero runtime (o binário só depende da libc e do SO), ABI estável (C calling convention é o contrato universal de FFI), e correspondência direta com o hardware (ponteiros são endereços, structs são layout de memória). Isso torna C a escolha default onde você precisa falar com o SO, com hardware ou expor biblioteca consumível por outras linguagens.',
  },
  {
    question: 'O que exatamente acontece entre um arquivo .c e o binário executável?',
    options: [
      'O compilador transforma tudo em código de máquina em um único passo',
      'Pré-processador (cpp) expande #include e macros → compilador (gcc/clang) gera assembly → assembler produz object files (.o) com símbolos não resolvidos → linker (ld) amarra os .o com a libc e produz o executável ELF/Mach-O/PE',
      'Interpreta linha a linha como Python',
      'Compila direto para bytecode de uma VM',
    ],
    correct: 1,
    explanation: 'O pipeline clássico de C é quatro etapas distintas, cada uma com uma ferramenta dedicada. Entender isso ajuda a diagnosticar erros: "undefined reference" é falha de link, não de compilação; erro em #include é pré-processador; warning de tipos é o compilador. Flags como -E (só pré-processa), -S (gera asm) e -c (para no object) permitem inspecionar cada estágio.',
  },
  {
    question: 'Qual versão do padrão C é o patamar realista em produção em 2026?',
    options: [
      'C89 — todo mundo ainda usa ANSI',
      'C99 é o padrão de facto: suporte universal em GCC, Clang e MSVC, traz designated initializers, //-comentários, VLAs, stdint.h e inline. C11 e C17 agregam threads e correções; C23 (ratificado em 2024) traz nullptr, constexpr, bool nativo e [[attributes]], mas adoção ainda é parcial',
      'C23 já é o default em todos os projetos grandes',
      'Todos compiladores usam C++ por baixo dos panos',
    ],
    correct: 1,
    explanation: 'C99 é o denominador comum confiável: kernel Linux migrou para C11 com extensões GNU em 2022, mas projetos portáveis miram C99. C11 adicionou _Atomic e threads.h (suporte incompleto no MSVC). C23 é a modernização mais profunda em décadas, mas exigir C23 ainda quebra builds em toolchains embarcadas. Default prático 2026: -std=c11 ou -std=gnu11 com flags de sanitizer.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="c-historia-compilador-diferencial"
      title="C: história, compilador e por que ainda domina em 2026"
      icon="©️"
      xp={50}
      readTime={12}
      trailName="C Moderno: Systems Programming"
      trailColor={accent}
      nextSlug="c-sem-medo-pointers"
      nextTitle="C sem medo: pointers, arrays, strings"
      quiz={quiz}
    >
      <Section title="1972, Bell Labs, e uma linguagem para escrever um sistema operacional" accent={accent}>
        <p>
          C foi criada por <strong>Dennis Ritchie</strong> em 1972, nos Bell Labs, com um objetivo pragmático: reescrever o Unix (antes em assembly PDP-7) em uma linguagem portável. A dupla Ken Thompson / Ritchie precisava de algo tão próximo do hardware quanto assembly, mas com abstrações mínimas — funções, structs, controle de fluxo — que permitissem mover o SO para outras arquiteturas sem reescrever tudo.
        </p>
        <p>
          Marcos essenciais: <strong>K&amp;R C</strong> (1978, livro de Kernighan e Ritchie — de facto o primeiro "standard"), <strong>ANSI C / C89</strong> (1989, primeiro padrão formal, depois ratificado como ISO C90), <strong>C99</strong> (1999, modernização mais significativa), <strong>C11</strong> (2011, threads e atomics), <strong>C17</strong> (2018, apenas correções), e <strong>C23</strong> (ratificado em 2024, maior salto desde C99). Em 2026 o comitê ISO WG14 já rascunha C2y.
        </p>
      </Section>

      <Section title="Filosofia: trust the programmer, expose the machine" accent={accent}>
        <Callout tone="info" icon="🎯">
          <strong>C não protege você.</strong> Pointers nus, aritmética sem bounds check, memória manual. Em troca, você recebe controle total e previsibilidade: cada linha tem um custo mensurável em ciclos e em bytes. É a linguagem que assume que quem escreve sabe o que está fazendo — e que vai usar sanitizers e revisão para não se matar.
        </Callout>
        <p>
          Essa filosofia explica tanto a durabilidade da linguagem quanto seus problemas clássicos (use-after-free, buffer overflow, UB). É também por isso que Rust existe: a aposta é que dá para preservar a performance de C com garantias em compile-time.
        </p>
      </Section>

      <Section title="Como o .c vira binário" accent={accent}>
        <CodeBlock lang="bash">{'# pipeline canonico com gcc (ou clang, equivalente)\nmain.c\n  |-- cpp       --> main.i   (pre-processado: #include expandido, macros)\n  |-- cc1       --> main.s   (assembly especifico da arquitetura)\n  |-- as        --> main.o   (object file ELF, simbolos nao resolvidos)\n  |-- ld (+libc)--> a.out    (executavel ELF, com dynamic linking pra libc.so)\n\n# voce pode parar em cada etapa:\ngcc -E main.c -o main.i   # so pre-processa\ngcc -S main.c -o main.s   # so gera asm\ngcc -c main.c -o main.o   # so gera object\ngcc main.c -o app         # pipeline completo'}</CodeBlock>
        <p>
          Compiladores em 2026: <strong>GCC 14</strong> (padrão em Linux/BSD), <strong>Clang 18</strong> (LLVM-based, melhores mensagens de erro, sanitizers de primeira linha), <strong>MSVC</strong> (Windows nativo, adoção C23 atrasada). Para embedded: arm-none-eabi-gcc, xc8/xc16/xc32 (Microchip), IAR, Keil.
        </p>
      </Section>

      <Section title="Versões que importam até 2026" accent={accent}>
        <CodeBlock lang="c">{'// C89 (ANSI C): o minimo denominador comum\n// - declaracoes no topo do bloco\n// - sem //-comentarios, sem bool, sem long long\n\n// C99: modernizacao que mudou o jogo\n// - // comentarios, declaracao no meio do bloco\n// - designated initializers: struct Point p = { .x = 1, .y = 2 };\n// - VLAs (variable length arrays, opcional em C11+)\n// - stdint.h (int32_t, uint64_t...), stdbool.h, inline\n\n// C11: concorrencia no padrao\n// - _Atomic, stdatomic.h\n// - threads.h (implementacao opcional, MSVC nao suporta)\n// - _Generic (primeira forma de overloading)\n// - anonymous structs/unions\n\n// C17: apenas bug fixes sobre C11\n\n// C23 (2024): o maior salto em decadas\n// - bool, true, false nativos (sem stdbool.h)\n// - constexpr para constantes\n// - nullptr (substitui NULL macro)\n// - [[nodiscard]], [[deprecated]], [[maybe_unused]] attributes\n// - #embed para incluir bytes de arquivo no binario\n// - decimal floating point (_Decimal32/64/128)\n// - typeof oficial (antes era extensao GNU)'}</CodeBlock>
      </Section>

      <Section title="Diferencial técnico: o que só C entrega" accent={accent}>
        <p>
          Três atributos sustentam C em 2026 e fazem com que, mesmo com Rust avançando, C continue insubstituível em muitos domínios:
        </p>
        <CodeBlock lang="bash">{'1. ABI estavel e universal\n   - C calling convention eh a lingua franca de FFI\n   - Python, Ruby, Node, Java JNI, Go cgo, Rust extern "C" — todos falam C\n   - libc eh o contrato do SO com userspace\n\n2. Zero runtime, zero GC\n   - binario so precisa de libc (ou nem isso, com -static / freestanding)\n   - tempo de startup irrisorio, footprint em KB\n   - previsivel: sem pausa de GC, sem JIT warmup\n\n3. Mapeamento direto ao hardware\n   - volatile, inline asm, memory barriers\n   - struct alignment e packing controlaveis\n   - ponteiros sao enderecos reais (sem abstracao)\n   - ideal pra kernel, driver, firmware, bootloader'}</CodeBlock>
        <Callout tone="success" icon="✅">
          Por isso, em 2026, o núcleo de tudo que importa ainda é C: kernel Linux e BSD, CPython, Ruby MRI, PostgreSQL, Redis, SQLite, nginx, curl, OpenSSL, FFmpeg, Git, Vim. Novas linguagens (Zig, Rust) competem, mas herdam o ABI de C para poder conversar com o mundo.
        </Callout>
      </Section>

      <Section title="Versão mais usada no mercado em 2026" accent={accent}>
        <Callout tone="neutral" icon="🧭">
          <strong>C99 é o padrão de facto</strong> em 2026: suportado universalmente, com ferramental maduro, e o denominador comum entre toolchains embarcadas e servidores. Projetos novos em Linux já miram <strong>C11</strong> (ou GNU11) pelos atomics e threads. <strong>C23</strong> entra gradualmente em código novo onde a toolchain permite, mas ainda não é default em builds portáveis. Kernel Linux migrou para C11 com extensões GNU em 2022 — indicador claro do estado real da indústria.
        </Callout>
        <p>
          Flags mínimas recomendadas em 2026: <code>-std=c11 -Wall -Wextra -Wpedantic -Werror -O2 -g -fsanitize=address,undefined</code>. Sem ASan e UBSan em CI, você está deixando bugs reais passarem para produção.
        </p>
      </Section>

      <Section title="O que esperar desta trilha" accent={accent}>
        <Callout tone="info" icon="🗺️">
          Próximos módulos: pointers sem medo (modelo mental sólido), memory management (stack vs heap, malloc/free, Valgrind), undefined behavior na prática, build systems (make/CMake/Ninja), debugging com gdb e sanitizers, threads (pthreads + C11), C moderno (C11/C23), e capstone de systems programming.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
