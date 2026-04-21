import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('c-sem-medo-pointers');
const accent = '#a8b1c0';

const quiz: QuizQuestion[] = [
  {
    question: 'O que significa exatamente a expressão `int *p = arr;` quando `arr` é `int arr[10]`?',
    options: [
      'Copia o array para p',
      'Array decai para ponteiro para o primeiro elemento (&arr[0]); p aponta para a mesma região de memória, não há cópia, e sizeof(p) vira o tamanho do ponteiro, não do array',
      'Cria um novo array de 10 ints',
      'É erro de compilação porque tipos diferem',
    ],
    correct: 1,
    explanation: 'Array decay é o comportamento central: em quase todo contexto (passagem para função, atribuição, aritmética), um array T[N] é convertido implicitamente para T*. Por isso sizeof dentro de uma função que recebe int arr[] dá 8 (ou 4) em vez do tamanho real. É a fonte de 70% dos bugs de iniciante em C.',
  },
  {
    question: 'Por que `strcpy(dest, src)` é proibido em código moderno?',
    options: [
      'É lento',
      'Não verifica tamanho do destino: se src for maior que dest, escreve além do buffer (overflow), corrompendo stack/heap e abrindo porta para exploits. Usar strncpy com cuidado, snprintf, ou strlcpy em sistemas que expõem',
      'Não está no padrão',
      'Só funciona com ASCII',
    ],
    correct: 1,
    explanation: 'strcpy copia byte a byte até encontrar \\0 em src, sem olhar o espaço de dest. Um atacante que controla src controla quantos bytes escreve — clássico buffer overflow. snprintf(dest, sizeof dest, "%s", src) é a forma segura e portátil. Nunca aceite strcpy em review moderno.',
  },
  {
    question: 'O que é const correctness em C?',
    options: [
      'Usar #define',
      'Marcar como const tudo que a função não deve modificar: `int strlen(const char *s)` comunica ao compilador e ao leitor que s é read-only; tentativas de mutação viram erro, permite aceitar strings literais',
      'Só proteção contra concorrência',
      'Nada útil',
    ],
    correct: 1,
    explanation: 'const é documentação executável: deixa explícito o contrato da função. Sem const, passar uma string literal ("hello") para uma função que aceita char* é undefined behavior se ela tentar escrever. Com const char*, compilador rejeita escrita. Bom código C é denso em const nos parâmetros de entrada.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="c-sem-medo-pointers"
      title="C sem medo: pointers, arrays, strings"
      icon="👉"
      xp={55}
      readTime={13}
      trailName="C Moderno: Systems Programming"
      trailColor={accent}
      nextSlug="memory-management-malloc-free"
      nextTitle="Memory management: malloc, free, stack vs heap"
      quiz={quiz}
    >
      <Section title="Pointer é um endereço, não mágica" accent={accent}>
        <p>
          Em C, um pointer é simplesmente um inteiro que o hardware interpreta como endereço. <code>int *p</code> declara uma variável que guarda o endereço de algum <code>int</code>. Dereferenciar (<code>*p</code>) diz ao processador: vá até esse endereço, leia/escreva sizeof(int) bytes.
        </p>
        <CodeBlock lang="c">{`#include <stdio.h>

int main(void) {
    int x = 42;
    int *p = &x;         // p aponta pra x
    printf("%d\\n", *p);  // 42
    *p = 100;            // altera x indiretamente
    printf("%d\\n", x);   // 100
    return 0;
}`}</CodeBlock>
      </Section>

      <Section title="Array decai para pointer" accent={accent}>
        <p>
          Arrays em C são contíguos em memória e, em quase todo contexto, decaem para um pointer ao primeiro elemento. Isso explica por que <code>sizeof</code> muda de comportamento dentro de funções.
        </p>
        <CodeBlock lang="c">{`void f(int arr[10]) {
    // aqui arr é int*, não array: sizeof(arr) == sizeof(int*)
    printf("%zu\\n", sizeof arr);   // 8 em 64-bit
}

int main(void) {
    int v[10];
    printf("%zu\\n", sizeof v);      // 40 (10 * sizeof(int))
    f(v);
}`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Para conhecer o tamanho do array dentro da função, você precisa passar o comprimento como parâmetro explícito. Não existe atalho seguro.
        </Callout>
      </Section>

      <Section title="Strings: nada mais do que char* terminadas em \0" accent={accent}>
        <p>
          Uma string em C é um array de <code>char</code> terminado por byte zero. Todas as funções da libc dependem desse contrato — se ele quebra, você lê memória alheia.
        </p>
        <CodeBlock lang="c">{`const char *s = "hello";
// Layout em memória: 'h','e','l','l','o','\\0'
// strlen(s) == 5, mas o buffer ocupa 6 bytes`}</CodeBlock>
      </Section>

      <Section title="Aritmética de pointer" accent={accent}>
        <p>
          Somar 1 a um <code>int*</code> avança <code>sizeof(int)</code> bytes, não um byte. O compilador escala pelo tipo apontado. Isso torna a iteração idiomática.
        </p>
        <CodeBlock lang="c">{`int v[5] = {10, 20, 30, 40, 50};
for (int *p = v; p < v + 5; p++) {
    printf("%d ", *p);
}`}</CodeBlock>
      </Section>

      <Section title="Pointer para pointer" accent={accent}>
        <p>
          <code>char **argv</code> é array de pointers para char: cada argv[i] é uma string. O padrão aparece em qualquer CLI e em estruturas de dados dinâmicas (matrizes irregulares, listas encadeadas).
        </p>
        <CodeBlock lang="c">{`int main(int argc, char **argv) {
    for (int i = 0; i < argc; i++) {
        printf("%d: %s\\n", i, argv[i]);
    }
}`}</CodeBlock>
      </Section>

      <Section title="const correctness" accent={accent}>
        <p>
          Marque parâmetros de entrada como <code>const</code>. É contrato: eu não vou modificar. Compilador vira aliado e você pode passar string literal sem UB.
        </p>
        <CodeBlock lang="c">{`size_t count_spaces(const char *s) {
    size_t n = 0;
    for (; *s; s++) if (*s == ' ') n++;
    return n;
}`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Regra prática: todo pointer de entrada vai com const até que você precise mesmo mutar. Revisor lê menos código para entender o fluxo de escrita.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
