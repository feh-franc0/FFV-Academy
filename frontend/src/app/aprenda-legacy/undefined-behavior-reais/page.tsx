import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('undefined-behavior-reais');
const accent = '#a8b1c0';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que compiladores modernos "otimizam de forma agressiva" código com undefined behavior?',
    options: [
      'Para punir o programador',
      'O padrão diz que UB não pode acontecer em programa correto. Otimizador assume que o caminho que causaria UB é inalcançável e elimina código relacionado. Ex: if (p != NULL) depois de *p pode virar if (true) porque se p fosse NULL seria UB',
      'Por acidente',
      'Compiladores não fazem isso',
    ],
    correct: 1,
    explanation: 'UB é "licença" do padrão para o otimizador. Se você escreve *p e depois testa p == NULL, o GCC/Clang elimina o teste porque *p seria UB se p == NULL. Resultado: código que "funcionava em O0" quebra em O2. Por isso UB não é bug benigno — vira exploit no release.',
  },
  {
    question: 'O que UBSan detecta em runtime?',
    options: [
      'Só overflow',
      'Integer signed overflow, divisão por zero, shift além do tamanho do tipo, null pointer dereference, alignment violations, unreachable code, bool com valor != 0/1, enum fora do range — aborta com diagnóstico no primeiro caso',
      'Memory leaks',
      'Race conditions',
    ],
    correct: 1,
    explanation: 'UndefinedBehaviorSanitizer injeta checks em pontos suspeitos durante compilação. Zero false positives (só dispara em UB real). Combine com ASan (que cobre memory) e você elimina 90% dos bugs sutis em C antes da produção. Flag: -fsanitize=undefined.',
  },
  {
    question: 'Por que strict aliasing é importante?',
    options: [
      'Só convenção',
      'Compilador assume que pointers de tipos incompatíveis não apontam para a mesma memória, permitindo reordenar/caching loads. Violar (ex: reinterpretar float como int via *(int*)&f) é UB. Correto: usar memcpy ou union para type punning',
      'Não importa',
      'Só em C++',
    ],
    correct: 1,
    explanation: 'Regra: você pode ler um float via float*, via char*, mas não via int*. O otimizador explora isso: se escreve via int* e lê via float*, pode assumir que o load do float é independente e cacheá-lo antes da escrita. Solução moderna: memcpy(&dst, &src, sizeof dst) que o compilador reconhece e compila como move.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="undefined-behavior-reais"
      title="Undefined behavior: os casos reais em C"
      icon="⚠️"
      xp={55}
      readTime={13}
      trailName="C Moderno: Systems Programming"
      trailColor={accent}
      nextSlug="build-systems-make-cmake"
      nextTitle="Build systems: make, CMake, Ninja, Meson"
      quiz={quiz}
    >
      <Section title="O que é UB (de verdade)" accent={accent}>
        <p>
          Undefined behavior não é apenas um bug: é uma licença para o compilador assumir que aquele caminho nunca acontece. O padrão ISO C lista dezenas de casos. Na prática, você precisa memorizar os 8 principais.
        </p>
      </Section>

      <Section title="1. Signed integer overflow" accent={accent}>
        <p>
          Overflow em <code>int</code>/<code>long</code> é UB. Em <code>unsigned</code> tem semântica definida (wraps). Otimizador aproveita: se você escreve <code>if (x + 1 &lt; x)</code>, o compilador deduz "false sempre" e remove o código. Teste de overflow com subtração — ou <code>__builtin_add_overflow</code>.
        </p>
        <CodeBlock lang="c">{`// ❌ Tentativa ingênua de detectar overflow
int safe_add(int a, int b) {
    if (a + b < a) return -1;  // otimizador remove essa linha
    return a + b;
}

// ✅ Builtin do GCC/Clang
int safe_add_ok(int a, int b, int *out) {
    return __builtin_add_overflow(a, b, out);  // retorna 1 se overflow
}`}</CodeBlock>
      </Section>

      <Section title="2. Null pointer dereference" accent={accent}>
        <p>
          <code>*p</code> quando <code>p == NULL</code> é UB. Se você derefere antes de testar, o compilador assume que p não pode ser NULL e pode eliminar o teste posterior — vulnerabilidade clássica (CVE-2009-1897 no Linux kernel).
        </p>
      </Section>

      <Section title="3. Use-after-free" accent={accent}>
        <p>
          Já coberto no módulo anterior. UB grave. AddressSanitizer detecta com shadow memory.
        </p>
      </Section>

      <Section title="4. Strict aliasing" accent={accent}>
        <p>
          Tipos incompatíveis não podem apontar para a mesma memória. Quebra: type punning via cast.
        </p>
        <CodeBlock lang="c">{`// ❌ UB: viola strict aliasing
float f = 3.14f;
int bits = *(int*)&f;

// ✅ Portátil, zero custo com otimização
int bits_ok;
memcpy(&bits_ok, &f, sizeof bits_ok);`}</CodeBlock>
      </Section>

      <Section title="5. Uninitialized memory" accent={accent}>
        <p>
          Ler variável local sem inicializar é UB. Stack pode ter lixo de função anterior — às vezes parece "determinístico", muda com nova versão do compilador.
        </p>
        <CodeBlock lang="c">{`int x;
printf("%d\\n", x);   // UB — pode imprimir qualquer coisa, pode crashar`}</CodeBlock>
      </Section>

      <Section title="6. Shift além do tamanho" accent={accent}>
        <p>
          <code>1 &lt;&lt; 32</code> para int 32-bit é UB. Mesmo <code>1 &lt;&lt; 31</code> em signed int é UB (overflow). Use unsigned e fique abaixo do size.
        </p>
      </Section>

      <Section title="7. Division by zero" accent={accent}>
        <p>
          Inteira: UB. Float IEEE 754: bem definida (NaN/Inf). Sempre valide o divisor antes.
        </p>
      </Section>

      <Section title="8. Out-of-bounds access" accent={accent}>
        <p>
          Ler/escrever <code>arr[N]</code> onde arr tem N elementos é UB (índices válidos vão de 0 a N-1). Mas &arr[N] é legal como sentinela de fim.
        </p>
      </Section>

      <Section title="Defesa: sanitizers em CI" accent={accent}>
        <CodeBlock lang="bash">{`# Build de teste com todos os sanitizers juntos
clang -fsanitize=address,undefined -g -O1 *.c -o test_bin

# Rodar suite
ASAN_OPTIONS=detect_leaks=1 ./test_bin

# Adicional: MSan detecta uninitialized reads (clang only)
clang -fsanitize=memory -g -O1 *.c -o msan_bin`}</CodeBlock>
        <Callout tone="danger" icon="🚨">
          UB não é "funciona às vezes". É tempo perdido depurando comportamento que muda com versão do compilador, nível de otimização e input. Sanitizers viram não-negociáveis em CI.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
