import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#6e7681';

export const metadata: Metadata = {
  title: 'CPU: pipeline, cache L1/L2/L3, branch prediction — FFV Academy',
  description: 'Fetch-Decode-Execute em detalhe. Por que cache miss mata performance. Como branch prediction funciona e o que isso significa para o código que você escreve.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Por que acessar elementos de um array sequencialmente é muito mais rápido que acesso aleatório?',
    options: [
      'Arrays têm índices, então o acesso é sempre O(1) independente do padrão',
      'Acesso sequencial dispara prefetching: a CPU detecta o padrão e carrega linhas de cache antecipadamente antes do programa solicitar. Cada linha de cache tem 64 bytes — carregar um int32 carrega os 15 próximos também. Acesso aleatório causa cache misses: cada elemento exige nova busca na memória (~100ns vs ~0.5ns de L1 hit). Arrays são cache-friendly; linked lists, pointer-chasing e trees são cache-unfriendly.',
      'Acesso sequencial usa instruções SIMD automaticamente',
      'Arrays são armazenados na L1 cache sempre, por isso são mais rápidos',
    ],
    correct: 1,
    explanation: 'A hierarquia de latência de memória é dramática: L1 ~0.5ns, L2 ~5ns, L3 ~30ns, RAM ~100ns, SSD ~100µs. Para processar 1M elementos: acessos sequenciais podem rodar com L1/L2 hits — poucas centenas de ms. Acessos aleatórios causam L3 ou RAM misses para cada elemento — dezenas de segundos. Data-Oriented Design e estruturas de dados cache-friendly são otimizações de alto impacto.',
  },
  {
    question: 'O que é branch prediction e por que um branch misprediction tem custo alto?',
    options: [
      'Branch prediction é uma feature do compilador que elimina ifs no código',
      'Para maximizar throughput, CPUs modernas executam instruções em pipeline e fazem speculative execution — adivinham o resultado de um branch (if/while) e executam antes da condição ser avaliada. Se errou (misprediction), descarta ~15-20 ciclos de trabalho especulativo e reinicia. Para código com padrão imprevisível de branches, isso é significativo.',
      'Branch prediction só afeta loops, não código com if/else',
      'Misprediction custa apenas 1-2 ciclos extras — é negligenciável',
    ],
    correct: 1,
    explanation: 'CPUs modernas têm Branch Prediction Units com histórico de até 4KB de branches. Loops simples têm >99% de acerto. Código com condições baseadas em dados aleatórios (sort comparison) pode ter 50% de acerto — pior caso. A famosa vulnerabilidade Spectre (2018) explorou a execução especulativa para ler memória privilegiada — a segurança e a performance estão intrinsecamente ligadas ao design da CPU.',
  },
  {
    question: 'O que é "false sharing" em multi-core e por que degrada performance mesmo sem lock contention?',
    options: [
      'False sharing é quando dois threads compartilham a mesma variável',
      'Linhas de cache têm 64 bytes. Se thread A escreve na variável X e thread B escreve na variável Y, mas ambas estão na mesma linha de cache, cada write invalida a linha de cache do outro core — forçando recarregamento (~100ns). O dado não é compartilhado, mas a linha de cache sim ("false" sharing). Solução: alinhar variáveis em fronteiras de cache (padding).',
      'False sharing é um bug no compilador que gera código incorreto',
      'False sharing só ocorre com mais de 8 cores',
    ],
    correct: 1,
    explanation: 'MESI protocol coordena coerência de cache entre cores: Modified, Exclusive, Shared, Invalid. Cada write para um endereço em uma linha compartilhada dispara uma invalidação para todos os outros cores com aquela linha. Em alto throughput com muitos cores, false sharing pode reduzir performance em 10-100x. Solução em C/Rust: `#[repr(align(64))]`. Em Java: padding com longs dummy. Em Python: menos relevante por causa do GIL.',
  },
];

export default function CpuPipelineCachePage() {
  return (
    <ModuleLayout
      slug="cpu-pipeline-cache"
      title="CPU: pipeline, cache L1/L2/L3, branch prediction"
      icon="⚙️"
      xp={85}
      readTime={17}
      trailName="Como o Computador Funciona"
      trailColor="#6e7681"
      nextSlug="memoria-stack-heap-virtual"
      nextTitle="Memória: stack, heap, virtual memory, page fault"
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
        A CPU não executa instruções uma por vez — usa pipeline, execução especulativa e hierarquia de cache para processamento altamente paralelizado. Entender esse modelo mental transforma intuições vagas de performance em previsões verificáveis.
      </p>

      <Section accent={accent} title="O ciclo Fetch-Decode-Execute e o pipeline">
        <p>
          Cada instrução passa por estágios: <strong>Fetch</strong> (buscar da memória), <strong>Decode</strong> (interpretar), <strong>Execute</strong> (calcular), <strong>Memory</strong> (acessar memória), <strong>Writeback</strong> (salvar resultado). CPUs modernas têm pipelines de 14-24 estágios — múltiplas instruções em estágios diferentes simultaneamente.
        </p>
        <CodeBlock>{`# Impacto do pipeline na prática — medindo com timeit
import timeit

# Acesso sequencial vs aleatório (cache-friendly vs cache-unfriendly)
import random

SIZE = 10_000_000
dados_sequenciais = list(range(SIZE))
dados_aleatorios = dados_sequenciais.copy()
random.shuffle(dados_aleatorios)

# Criar índices para acesso
indices_seq = list(range(SIZE))
indices_rand = list(range(SIZE))
random.shuffle(indices_rand)

def acesso_sequencial():
    total = 0
    for i in indices_seq:
        total += dados_sequenciais[i]
    return total

def acesso_aleatorio():
    total = 0
    for i in indices_rand:
        total += dados_aleatorios[i]
    return total

# Resultado típico:
# sequencial: ~0.8s
# aleatório:  ~1.5s (2x mais lento — cache misses)

# Melhor em numpy (acesso vetorizado + SIMD):
import numpy as np
arr = np.arange(SIZE, dtype=np.int64)
# np.sum(arr) → ~5ms  (vs 800ms Python puro — 160x mais rápido)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Hierarquia de cache: latências reais">
        <ComparisonTable
          headers={['Nível', 'Tamanho típico', 'Latência', 'Compartilhado?']}
          rows={[
            ['Registradores', '~1 KB total', '<1 ns', 'Por thread (não compartilhado)'],
            ['L1 (instrução + dado)', '32-64 KB por core', '~0.5 ns', 'Por core (privado)'],
            ['L2', '256 KB - 1 MB por core', '~5 ns', 'Por core (privado)'],
            ['L3 (LLC)', '6-64 MB total', '~30 ns', 'Todos os cores (compartilhado)'],
            ['RAM (DRAM)', 'GBs', '~100 ns', 'Todos os cores'],
            ['SSD NVMe', 'TBs', '~100 µs', 'Todos os processos'],
            ['HDD', 'TBs', '~10 ms', 'Todos os processos'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Demonstrando cache miss em Python
# (números são relativos — Python tem overhead grande de intérprete)
import timeit

# Lista de listas — péssimo para cache (pointer chasing)
matriz_ruim = [[i * 1000 + j for j in range(1000)] for i in range(1000)]

# Numpy array — contíguo na memória (cache-friendly)
import numpy as np
matriz_boa = np.zeros((1000, 1000), dtype=np.int64)

# Row-major (C order, NumPy default) — acesso por linhas é rápido
t1 = timeit.timeit(lambda: np.sum(matriz_boa[0, :]), number=10000)  # linha
t2 = timeit.timeit(lambda: np.sum(matriz_boa[:, 0]), number=10000)  # coluna
# t1 << t2 (acesso por coluna pula 1000 elementos na memória — mais cache misses)

# Linha de cache tem 64 bytes = 8 × int64
# Carregar um elemento de numpy float64 carrega os 7 vizinhos na mesma linha de cache`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Branch prediction: código amigável ao preditor">
        <CodeBlock>{`import timeit
import random

# Branch prediction favorece padrões previsíveis
dados = list(range(10_000))

def com_branch_previsivel():
    # loop sem if imprevisível — quase sempre mesmo caminho
    total = 0
    for x in dados:
        total += x  # sem branch aqui
    return total

dados_aleatorios = [random.randint(0, 100) for _ in range(10_000)]

def com_branch_imprevisivel():
    # condição depende de dados aleatórios — preditor erra ~50%
    total = 0
    for x in dados_aleatorios:
        if x > 50:    # ← branch imprevisível
            total += x
    return total

def sem_branch():
    # elimina o branch com operação vetorizada
    return sum(x for x in dados_aleatorios if x > 50)

# Numpy elimina branches com operações vetorizadas:
import numpy as np
arr = np.array(dados_aleatorios)
# np.sum(arr[arr > 50]) — sem Python branch, operação SIMD na CPU

# Estratégias para código cache/branch-friendly:
# 1. Prefira loops sobre arrays contíguos (numpy, bytearray) vs listas de objetos
# 2. Estruture condições para o caso comum primeiro (profiling ajuda)
# 3. Use numpy/pandas para operações vetorizadas que evitam Python branching
# 4. Evite linked lists para dados que serão iterados — use arrays
# 5. Prefira struct-of-arrays vs array-of-structs para SIMD efficiency`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Modelo mental:</strong> cache miss é o inimigo número 1 de performance em código com dados grandes. Prefira acesso sequencial a aleatório. Use numpy/pandas que alocam arrays contíguos. Evite estruturas com pointer-chasing (linked list, dict de dicts) em hot paths. O profiler é seu amigo — sempre meça antes de otimizar.
      </Callout>

      <Callout>
        Próximo: <strong>Memória: stack, heap e virtual memory</strong> — como o SO gerencia memória para todos os processos simultaneamente.
      </Callout>
    </div>
  );
}
