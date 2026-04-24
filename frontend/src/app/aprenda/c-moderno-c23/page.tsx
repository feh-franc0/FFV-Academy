import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('c-moderno-c23');
const accent = '#a8b1c0';

const quiz: QuizQuestion[] = [
  {
    question: 'O que `_Generic` resolve em C11?',
    options: [
      'Nada novo',
      'Seleção em tempo de compilação baseada no tipo do argumento, permitindo macros "genéricas" com type safety. Ex: tgmath.h implementa cos()/sin() que escolhem a função correta pra float/double/long double sem overhead runtime',
      'Só usa em games',
      'É hack obsoleto',
    ],
    correct: 1,
    explanation: '_Generic é switch sobre tipo, avaliado pelo compilador. Habilita macros type-safe como #define abs(x) _Generic((x), int: abs, long: labs, float: fabsf, double: fabs)(x). Resolvido antes do codegen — zero overhead. Base de tgmath.h e de APIs genéricas em C moderno.',
  },
  {
    question: 'O que muda em C23?',
    options: [
      'Nada relevante',
      'bool como keyword (sem <stdbool.h>), nullptr, constexpr pra constantes, #embed para incluir binário, atributos [[nodiscard]] [[deprecated]] no padrão, typeof, static_assert sem mensagem, decimal floats, u8string literal melhorada',
      'Só remove features',
      'Obriga reescrita',
    ],
    correct: 1,
    explanation: 'C23 (ratificado 2024) é a maior modernização desde C99. bool/true/false nativo, nullptr (sem warnings NULL vs 0), constexpr, [[attributes]] padrões, #embed (resolve o "como incluir um blob?"), auto em inicializador tipo C++. GCC 13+/Clang 16+ já suportam com -std=c23.',
  },
  {
    question: 'Quando usar anonymous structs/unions (C11)?',
    options: [
      'Sempre',
      'Para expor campos de struct aninhada sem qualifier extra. Útil em variant types (tagged unions), I/O registers em embedded, abstração POO-like mantendo ABI plana. Evite aninhar fundo — legibilidade sofre',
      'Nunca',
      'Só em kernel',
    ],
    correct: 1,
    explanation: 'struct { int type; union { int i; float f; char *s; }; } variant; deixa escrever variant.i em vez de variant.u.i. Reduz verbosidade em estruturas POD com muitos casos. Linux kernel e APIs Win32 usam para representar registros com overlays.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="c-moderno-c23"
      title="C moderno: C11, C23, e o futuro"
      icon="✨"
      xp={50}
      readTime={12}
      trailName="C Moderno: Systems Programming"
      trailColor={accent}
      nextSlug="capstone-sistema-c"
      nextTitle="Capstone: tool de sistema em C"
      quiz={quiz}
    >
      <Section title="C11 (2011): modernização discreta" accent={accent}>
        <p>
          C99 ficou como baseline por 12 anos. C11 adicionou features opcionais (VLAs viraram opcionais), threads, atomics, <code>_Generic</code>, anonymous structs. Nem tudo foi adotado pelos grandes compilers — <code>&lt;threads.h&gt;</code> ainda tem suporte irregular.
        </p>
        <CodeBlock lang="c">{`// _Generic — macro type-safe
#define abs(x) _Generic((x),        \\
    int:    abs,                    \\
    long:   labs,                   \\
    float:  fabsf,                  \\
    double: fabs)(x)

// _Static_assert (C11) / static_assert (C23)
_Static_assert(sizeof(int) == 4, "plataforma exótica");

// Anonymous union dentro de struct
struct Variant {
    int tag;
    union {
        int i;
        float f;
        const char *s;
    };  // sem nome
};`}</CodeBlock>
      </Section>

      <Section title="C17 (2018): patch" accent={accent}>
        <p>
          Apenas bug fixes no padrão. Semântica igual a C11. Use como "C11 limpo" se seu compilador defaulta para ele.
        </p>
      </Section>

      <Section title="C23 (2024): o novo baseline" accent={accent}>
        <CodeBlock lang="c">{`// bool, true, false direto — sem <stdbool.h>
bool ok = true;

// nullptr — tipo distinto, sem warnings
void *p = nullptr;

// constexpr em declarações de objeto
constexpr int MAX = 1024;

// [[attributes]] padrão
[[nodiscard]] int compute(void);
[[deprecated("use nova_api()")]] void velha_api(void);

// typeof padrão (antes só extensão GCC)
int x = 10;
typeof(x) y = x + 1;

// #embed — inclui binário literal
const unsigned char logo[] = {
    #embed "logo.png"
};

// static_assert sem mensagem
static_assert(sizeof(void*) == 8);`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Ligar <code>-std=c23</code> no GCC 13+/Clang 16+ já funciona. Para lib pública, <code>-std=c17</code> ainda é o denominador comum; para aplicação interna, C23 é viável em 2026.
        </Callout>
      </Section>

      <Section title="Atributos: documentação que o compilador entende" accent={accent}>
        <CodeBlock lang="c">{`[[nodiscard]] int fallible(void);

[[maybe_unused]] static int DEBUG_BUILD_VERSION = 42;

[[noreturn]] void panic(const char *msg);`}</CodeBlock>
        <p>
          <code>[[nodiscard]]</code> emite warning se o chamador ignora retorno. Ideal em APIs de alocação e I/O.
        </p>
      </Section>

      <Section title="Safe libc moderno" accent={accent}>
        <p>
          Evite <code>strcpy</code>, <code>strcat</code>, <code>sprintf</code>, <code>gets</code>. Prefira variantes com tamanho: <code>snprintf</code>, <code>strncat</code>, <code>fgets</code>. Em BSD/macOS, <code>strlcpy</code>/<code>strlcat</code> são a forma idiomática e estão sendo incorporadas ao C23.
        </p>
      </Section>

      <Section title="Ecossistema em 2026" accent={accent}>
        <Callout tone="info" icon="💡">
          C continua mandatório em kernel (Linux, xnu, NT), drivers, embedded, interpretadores (CPython, Lua), libs críticas (OpenSSL, SQLite). Rust pressiona por segurança, mas C tem 50 anos de ABI estável e ninguém reescreve libc. Conhecer C moderno (C17/C23 + sanitizers + CMake) é ponte para systems programming profissional.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
