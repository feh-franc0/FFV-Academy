import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('memory-management-malloc-free');
const accent = '#a8b1c0';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença central entre stack e heap em C?',
    options: [
      'Só velocidade',
      'Stack: alocação automática LIFO pelo compilador (variáveis locais), liberação automática no return, tamanho limitado (~8MB default). Heap: alocação manual via malloc, liberação manual via free, size limitado por RAM disponível, fragmentação possível',
      'São o mesmo',
      'Heap é mais rápido',
    ],
    correct: 1,
    explanation: 'Stack é gerenciado pelo compilador: entrar numa função empurra um frame, sair desempilha. Zero overhead runtime. Heap é pool gerenciado pela libc: malloc precisa achar bloco livre, free marca livre, allocator pode fragmentar. Variáveis grandes ou com lifetime além do escopo vão ao heap.',
  },
  {
    question: 'O que é use-after-free e por que é crítico?',
    options: [
      'Warning inofensivo',
      'Acessar memória depois de free: o bloco pode ter sido reutilizado por outra alocação, então você lê/escreve dados alheios. Comum em exploits de segurança. ASan detecta em runtime com shadow memory, nomeando stack trace do free e do uso',
      'Só vazamento',
      'Só em multi-thread',
    ],
    correct: 1,
    explanation: 'Depois de free(p), p virou pointer dangling. Qualquer uso é UB. O allocator pode ter reciclado o bloco para outra estrutura, então você corrompe dados ou exfiltra. Padrão defensivo: p = NULL logo após free. Ferramenta: AddressSanitizer dá relatório preciso com stack traces.',
  },
  {
    question: 'Por que `char *s = malloc(strlen(input))` é bug?',
    options: [
      'Não é bug',
      'strlen não conta o byte \\0 terminador: falta 1 byte. Ao copiar com strcpy, o \\0 cai em memória alheia, causando corrupção. Forma correta: malloc(strlen(input) + 1)',
      'Malloc não aceita expressão',
      'Falta cast',
    ],
    correct: 1,
    explanation: 'Bug clássico off-by-one. strlen("abc") é 3, mas o buffer ocupa 4 bytes (abc\\0). Esquecer o +1 é fonte recorrente de overflow detectável por ASan. Em código moderno prefira snprintf/strdup que cuidam do sizing.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="memory-management-malloc-free"
      title="Memory management: malloc, free, stack vs heap"
      icon="💾"
      xp={55}
      readTime={13}
      trailName="C Moderno: Systems Programming"
      trailColor={accent}
      nextSlug="undefined-behavior-reais"
      nextTitle="Undefined behavior: os casos reais em C"
      quiz={quiz}
    >
      <Section title="Stack: rápido, automático, limitado" accent={accent}>
        <p>
          Cada chamada de função empurra um frame na stack: argumentos, endereço de retorno, variáveis locais. O compilador reserva tudo estaticamente. Sair da função remove o frame. Zero custo runtime, mas tamanho restrito (tipicamente 8MB no Linux).
        </p>
        <CodeBlock lang="c">{`void f(void) {
    int buf[1024];          // 4KB no stack — OK
    // int huge[10000000];  // stack overflow garantido
}`}</CodeBlock>
      </Section>

      <Section title="Heap: flexível, manual, custoso" accent={accent}>
        <p>
          <code>malloc</code> pede ao allocator um bloco de N bytes. Você é dono: precisa chamar <code>free</code> exatamente uma vez quando terminar. Retorno <code>NULL</code> indica falha (raro em desktop Linux, comum em embedded).
        </p>
        <CodeBlock lang="c">{`#include <stdlib.h>
#include <string.h>

char *duplicate(const char *s) {
    size_t n = strlen(s) + 1;   // +1 pro \\0
    char *copy = malloc(n);
    if (!copy) return NULL;     // checar sempre
    memcpy(copy, s, n);
    return copy;                // caller vira dono
}`}</CodeBlock>
      </Section>

      <Section title="Bugs recorrentes" accent={accent}>
        <p>
          Memory bugs em C caem em 4 categorias. Cada uma tem detector nativo:
        </p>
        <CodeBlock lang="c">{`// 1. Memory leak: esqueceu free
char *s = malloc(100);
// ... função retorna sem free — Valgrind detecta

// 2. Double free: free chamado 2x no mesmo pointer
free(p); free(p);     // corrompe allocator metadata

// 3. Use-after-free: usa depois de liberar
free(p);
printf("%s\\n", p);    // ASan detecta

// 4. Buffer overflow: escreve além do tamanho
char buf[10];
strcpy(buf, "string muito longa"); // clobbers stack`}</CodeBlock>
      </Section>

      <Section title="calloc, realloc" accent={accent}>
        <p>
          <code>calloc(n, size)</code> aloca e zera — use para structs e buffers onde zero é estado válido. <code>realloc(p, newsize)</code> redimensiona (pode mover o bloco): sempre atribua o retorno a variável temporária antes de sobrescrever p, senão você vaza se falhar.
        </p>
        <CodeBlock lang="c">{`int *v = calloc(10, sizeof *v);      // zeros garantidos

int *tmp = realloc(v, 20 * sizeof *v);
if (!tmp) { free(v); return -1; }    // v ainda válido
v = tmp;`}</CodeBlock>
      </Section>

      <Section title="Valgrind + AddressSanitizer" accent={accent}>
        <p>
          Não confie em revisão humana para pegar memory bugs. Rode a suíte de testes sob Valgrind (instrumentação pesada, ~20x slowdown) ou ASan (compile-time, ~2x slowdown). ASan é padrão moderno.
        </p>
        <CodeBlock lang="bash">{`# Valgrind: zero instrumentação no binário, slow
valgrind --leak-check=full --error-exitcode=1 ./meu_programa

# AddressSanitizer: rebuild com flag, rápido o suficiente pra CI
clang -fsanitize=address -g -O1 main.c -o app
./app   # aborta com diagnóstico preciso no primeiro bug`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Política sã: CI roda toda suíte de testes com ASan + UBSan habilitados. Bug de memória vira build red antes do merge.
        </Callout>
      </Section>

      <Section title="Regra de ouro: dono claro" accent={accent}>
        <Callout tone="info" icon="💡">
          Para cada <code>malloc</code> documente quem chama <code>free</code>. Funções que retornam memória alocada devem dizer no comentário: caller owns. Sem contrato de ownership, o código vira mina de leaks.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
