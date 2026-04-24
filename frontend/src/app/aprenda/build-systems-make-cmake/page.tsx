import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('build-systems-make-cmake');
const accent = '#a8b1c0';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que CMake virou padrão de facto em projetos C/C++ modernos?',
    options: [
      'É o mais simples',
      'Gera arquivos nativos (Makefiles, Ninja, MSBuild, Xcode) a partir de descrição declarativa: um só CMakeLists funciona em Linux/macOS/Windows, IDE e CI. Targets, dependências transitivas e pacotes via find_package. find_package/FetchContent resolvem deps',
      'É o mais rápido',
      'Obrigatório pelo padrão C',
    ],
    correct: 1,
    explanation: 'CMake é meta-build: você descreve targets + deps, ele gera build do sistema nativo. Ninja é backend recomendado (muito mais rápido que make em grandes projetos). Biblioteca moderna exporta CMake targets com INTERFACE include dirs — consumer faz find_package e linka, zero flags manuais.',
  },
  {
    question: 'Qual conjunto mínimo de flags você deve ligar em build de dev?',
    options: [
      '-O3 apenas',
      '-Wall -Wextra -Wpedantic -Werror -g -O1 -fsanitize=address,undefined. Ativa quase todos os warnings, trata warning como erro (força correção), preserva debug info, otimiza o suficiente pra sanitizers funcionarem',
      'Sem flags',
      'Só -O2',
    ],
    correct: 1,
    explanation: 'Build moderno tem dois perfis: Debug (-g -O1 + sanitizers) para dev/CI, Release (-O2 -g -DNDEBUG) para produção. -Werror em Debug força equipes a resolver warning na mesma PR. -Wpedantic pega portabilidade (GNU extensions). ASan + UBSan são padrão em Debug.',
  },
  {
    question: 'O que diferencia Ninja de Make?',
    options: [
      'Sintaxe bonita',
      'Ninja é backend minimalista otimizado para velocidade e paralelismo. Não foi feito para ser escrito à mão: CMake/Meson/gn geram o ninja.build. Rebuilds incrementais 3-10x mais rápidos em projetos grandes; parsing quase instantâneo',
      'Funciona só em Windows',
      'Escreve em Python',
    ],
    correct: 1,
    explanation: 'Ninja assume que um gerador criou o arquivo e foca no scheduler. Chrome/LLVM/Blink usam Ninja em produção. Você nunca escreve ninja.build manualmente — só CMakeLists.txt e chama cmake -GNinja. Em projeto de 10k arquivos, rebuild incremental em Ninja é segundos; em Make, minutos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="build-systems-make-cmake"
      title="Build systems: make, CMake, Ninja, Meson"
      icon="🔨"
      xp={50}
      readTime={12}
      trailName="C Moderno: Systems Programming"
      trailColor={accent}
      nextSlug="debugging-gdb-valgrind"
      nextTitle="Debugging: gdb, lldb, Valgrind, sanitizers"
      quiz={quiz}
    >
      <Section title="Make: o patriarca" accent={accent}>
        <p>
          Make (1977) é ubíquo, presente em qualquer Unix. Sintaxe baseada em regras (target: deps + shell). Para projeto pequeno (&lt;50 arquivos, uma plataforma), Makefile escrito à mão é direto ao ponto.
        </p>
        <CodeBlock lang="bash">{`CC := clang
CFLAGS := -Wall -Wextra -Werror -g -O1
SRCS := $(wildcard src/*.c)
OBJS := $(SRCS:.c=.o)

app: $(OBJS)
\t$(CC) $(CFLAGS) -o $@ $^

%.o: %.c
\t$(CC) $(CFLAGS) -c -o $@ $<

clean:
\trm -f app $(OBJS)`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Make usa TAB como separador (não espaços). É fonte de bug clássico em editor que auto-converte.
        </Callout>
      </Section>

      <Section title="CMake: padrão moderno" accent={accent}>
        <p>
          Descreve o projeto uma vez, gera build nativo para qualquer plataforma. A partir da versão 3.x o idioma "modern CMake" baseado em targets virou a recomendação — evite variáveis globais e comandos <code>include_directories</code>/<code>add_definitions</code>.
        </p>
        <CodeBlock lang="c">{`cmake_minimum_required(VERSION 3.20)
project(meuapp C)

set(CMAKE_C_STANDARD 17)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

add_executable(meuapp src/main.c src/util.c)

target_compile_options(meuapp PRIVATE
    -Wall -Wextra -Wpedantic -Werror
    $<$<CONFIG:Debug>:-g -O1 -fsanitize=address,undefined>
    $<$<CONFIG:Release>:-O2 -DNDEBUG>
)

target_link_options(meuapp PRIVATE
    $<$<CONFIG:Debug>:-fsanitize=address,undefined>
)`}</CodeBlock>
        <CodeBlock lang="bash">{`# Build out-of-source com Ninja
cmake -S . -B build -GNinja -DCMAKE_BUILD_TYPE=Debug
cmake --build build
./build/meuapp`}</CodeBlock>
      </Section>

      <Section title="Ninja: só o backend" accent={accent}>
        <p>
          Ninja executa os comandos que o CMake/Meson descreveu. Parsing instantâneo, scheduler com paralelismo máximo. Você raramente lê o <code>build.ninja</code>; deixa a ferramenta gerar.
        </p>
      </Section>

      <Section title="Meson: alternativa pythônica" accent={accent}>
        <p>
          Sintaxe mais limpa que CMake, velocidade comparável, fallback para WrapDB (package manager minimalista). Adotado por GNOME, systemd, QEMU. Em projeto novo é opção válida se o time já não domina CMake.
        </p>
        <CodeBlock lang="bash">{`project('meuapp', 'c', default_options: ['c_std=c17', 'warning_level=3'])
executable('meuapp', 'src/main.c', 'src/util.c')`}</CodeBlock>
      </Section>

      <Section title="Flags que nunca faltam" accent={accent}>
        <CodeBlock lang="bash">{`# Dev / CI
-Wall -Wextra -Wpedantic -Wshadow -Wconversion
-Werror
-g -O1
-fsanitize=address,undefined
-fno-omit-frame-pointer

# Release
-O2 -g -DNDEBUG
-flto           # link-time optimization quando binário importa
-fstack-protector-strong`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Padronize em CMake helper: função <code>enable_warnings(target)</code> chamada em todos os targets do projeto. Assim ninguém esquece.
        </Callout>
      </Section>

      <Section title="Checklist de projeto novo" accent={accent}>
        <Callout tone="info" icon="💡">
          (1) CMake mínimo 3.20. (2) Out-of-source build (<code>build/</code> git-ignored). (3) Ninja como gerador. (4) Debug = warnings fatais + sanitizers. (5) Release = -O2 + LTO. (6) <code>compile_commands.json</code> exportado para clangd funcionar no editor.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
