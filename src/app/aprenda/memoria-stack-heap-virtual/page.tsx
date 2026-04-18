import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#6e7681';

export const metadata = getModuleMetadata('memoria-stack-heap-virtual');

const quiz: QuizQuestion[] = [
  {
    question: 'Por que variáveis locais de função são armazenadas na stack e não no heap?',
    options: [
      'É uma escolha arbitrária — ambos funcionariam',
      'Stack usa alocação LIFO determinística: ao chamar uma função, um "stack frame" é criado com espaço para todas as variáveis locais; ao retornar, o frame é destruído ajustando apenas o stack pointer (operação de 1 instrução). Não há overhead de gerenciamento. Heap requer alocação dinâmica (encontrar bloco livre) e liberação explícita ou GC. Stack é O(1) alloc/dealloc; heap é mais lento mas permite vida arbitrária.',
      'Stack é mais seguro porque o SO protege contra escrita',
      'Variáveis locais ficam na stack apenas em C — Python usa heap para tudo',
    ],
    correct: 1,
    explanation: 'Em CPython, quase tudo vai para o heap (Python objects). Stack frames Python também vivem no heap (são objetos). Em C/Rust/Go: variáveis locais com tamanho conhecido em compile time vão para a stack. Objetos com vida dinâmica (malloc, Box<T>, new) vão para o heap. O stack pointer (RSP no x86-64) simplesmente avança/recua. Stack overflow ocorre quando a stack cresce além do limite (padrão 8MB no Linux).',
  },
  {
    question: 'O que é virtual memory e por que permite que processos "vejam" mais memória do que existe fisicamente?',
    options: [
      'Virtual memory é memória temporária armazenada no disco',
      'Virtual memory é uma abstração do SO: cada processo tem seu próprio espaço de endereçamento (ex: 0 a 2^48 bytes em 64-bit) mapeado pela MMU para páginas físicas reais. Páginas não precisam existir na RAM até serem acessadas (demand paging). Permite: isolamento entre processos, overcommit (alocar mais do que existe), mmap de arquivos, e shared libraries com uma cópia na RAM compartilhada por N processos.',
      'Virtual memory é apenas uma camada de nomenclatura — acessa RAM diretamente',
      'Virtual memory existe apenas em sistemas com mais de 4GB de RAM',
    ],
    correct: 1,
    explanation: 'A MMU (Memory Management Unit) traduz endereços virtuais para físicos via Page Tables mantidas pelo kernel. Uma página tem tipicamente 4KB. TLB (Translation Lookaside Buffer) cacheia traduções recentes — TLB miss adiciona ~30 ciclos. Huge pages (2MB/1GB) reduzem TLB pressure para aplicações com working set grande (bancos, JVMs). Linux overcommit: permite alocar mais RAM do que existe — o OOM killer mata processos se realmente ficar sem memória.',
  },
  {
    question: 'O que é um page fault e quando é bom vs quando é ruim?',
    options: [
      'Page fault é sempre um erro que causa crash do processo',
      'Page fault é uma interrupção quando o processo acessa um endereço virtual sem mapeamento físico atual. "Minor fault" (boa): página existe mas não está na TLB ou precisa ser mapeada — kernel resolve em microsegundos. "Major fault" (ruim): página foi paginada para disco (swap) — kernel busca do disco em milissegundos. Muitos major faults = swap thrashing = sistema inoperante.',
      'Page fault ocorre apenas em código C — Python usa garbage collection em vez disso',
      'Page fault é resolvido pelo processo, não pelo sistema operacional',
    ],
    correct: 1,
    explanation: 'mmap() de arquivo causa page faults quando as páginas são acessadas pela primeira vez — o kernel carrega do arquivo. Isso é como executáveis e shared libraries funcionam: apenas as partes acessadas são carregadas. `cat /proc/$PID/status | grep VmRSS` mostra RAM física usada vs `VmVirt` que é o total virtual alocado. Diferença entre VmVirt e VmRSS pode ser 10-100x em processos que allocam muito mas usam pouco.',
  },
];

export default function MemoriaStackHeapVirtualPage() {
  return (
    <ModuleLayout
      slug="memoria-stack-heap-virtual"
      title="Memória: stack, heap, virtual memory, page fault"
      icon="🧠"
      xp={80}
      readTime={16}
      trailName="Como o Computador Funciona"
      trailColor="#6e7681"
      nextSlug="syscalls-user-kernel"
      nextTitle="Syscalls: a fronteira entre user-space e kernel"
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
        Todo processo "acredita" que tem acesso a gigabytes de memória — mas a maioria não existe fisicamente. Virtual memory é a ilusão que o SO mantém para cada processo, permitindo isolamento, overcommit e mapeamento de arquivos sem copiar dados.
      </p>

      <Section accent={accent} title="Stack vs Heap: dois modelos de alocação">
        <ComparisonTable
          headers={['Aspecto', 'Stack', 'Heap']}
          rows={[
            ['Alocação', 'Automática (LIFO)', 'Explícita (malloc/new/alloc)'],
            ['Liberação', 'Automática (ao retornar da função)', 'Explícita ou GC'],
            ['Velocidade', 'O(1) — apenas mover stack pointer', 'O(log n) para encontrar bloco livre'],
            ['Tamanho', 'Limitado (~8MB Linux default)', 'Limitado pela RAM + swap'],
            ['Fragmentação', 'Nenhuma', 'Pode fragmentar com muitos alloc/free'],
            ['Thread', 'Uma stack por thread', 'Heap compartilhado (com lock)'],
            ['Em Python', 'Call stack do interpretador', 'Todos os objetos Python vivem aqui'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Stack overflow: recursão infinita ou stack frame muito grande
import sys
print(sys.getrecursionlimit())   # 1000 por default

def recursao_infinita(n):
    return recursao_infinita(n + 1)   # RecursionError após ~1000 calls

# Aumentar limite com cuidado (cada frame ocupa ~1-4KB na stack):
sys.setrecursionlimit(10_000)    # 10MB de stack frames

# Ver tamanho da stack em bytes (Unix):
import resource
stack_size = resource.getrlimit(resource.RLIMIT_STACK)
# (8388608, -1) = 8MB soft limit, unlimited hard limit

# Em Python, objetos vivem no heap
# sys.getsizeof() mostra o tamanho do objeto Python no heap:
import sys
print(sys.getsizeof([]))          # 56 bytes (lista vazia)
print(sys.getsizeof([1, 2, 3]))   # 88 bytes (3 ponteiros + overhead)
print(sys.getsizeof("hello"))     # 54 bytes
print(sys.getsizeof(42))          # 28 bytes (int Python é um objeto!)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Virtual Memory: o layout do espaço de endereçamento">
        <CodeBlock>{`# Layout do espaço de endereçamento virtual de um processo Linux (64-bit):
#
# 0xFFFFFFFFFFFFFFFF  ← endereço mais alto
# ┌─────────────────┐
# │  Kernel space   │  ← inacessível ao userspace (protegido pelo MMU)
# ├─────────────────┤ 0x7FFFFFFFFFFFFFFF
# │  Stack          │  ← cresce para baixo (LIFO)
# │  ↓              │
# ├─────────────────┤
# │  (vazio)        │  ← espaço não mapeado — qualquer acesso = segfault
# ├─────────────────┤
# │  ↑              │
# │  Heap           │  ← cresce para cima (malloc/mmap)
# ├─────────────────┤
# │  BSS / Data     │  ← variáveis globais inicializadas / zero
# ├─────────────────┤
# │  Text (código)  │  ← executável mapeado aqui (read-only)
# └─────────────────┘ 0x0000000000000000

# Inspecionar mapeamento de memória de um processo:
import os
pid = os.getpid()
# cat /proc/{pid}/maps mostra todos os mapeamentos virtuais

# mmap: mapear arquivo diretamente no espaço de endereçamento
import mmap

with open("dados.bin", "rb") as f:
    # Mapeia o arquivo — não copia para RAM imediatamente
    # Página só é carregada quando acessada (demand paging)
    mm = mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ)
    dados = mm[1000:2000]    # lê bytes 1000-2000 (pode disparar page fault)
    mm.close()

# Shared memory entre processos (sem serialização):
from multiprocessing import shared_memory
shm = shared_memory.SharedMemory(create=True, size=1024)
# Múltiplos processos podem mapear o mesmo shm — dados compartilhados sem IPC`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Page faults e swap: quando a memória acaba">
        <CodeBlock>{`# Monitorar page faults de um processo
import resource
import time

# getrusage retorna estatísticas de uso de recursos
uso_antes = resource.getrusage(resource.RUSAGE_SELF)

# ... código que aloca e acessa memória ...
dados = bytearray(100 * 1024 * 1024)    # 100MB
for i in range(0, len(dados), 4096):
    dados[i] = 1                          # acessa cada página (4KB)

uso_depois = resource.getrusage(resource.RUSAGE_SELF)
minor_faults = uso_depois.ru_minflt - uso_antes.ru_minflt
major_faults = uso_depois.ru_majflt - uso_antes.ru_majflt
print(f"Minor page faults: {minor_faults}")   # ~25600 (100MB / 4KB)
print(f"Major page faults: {major_faults}")   # 0 (dados não foram para swap)

# Verificar uso de memória do processo atual
def memoria_atual_mb() -> float:
    with open(f"/proc/{os.getpid()}/status") as f:
        for linha in f:
            if linha.startswith("VmRSS:"):
                return int(linha.split()[1]) / 1024

print(f"RSS: {memoria_atual_mb():.1f} MB")

# Swap: quando RAM está cheia, o kernel move páginas para o disco
# /proc/swaps mostra partições de swap em uso
# Verificar swap:
import subprocess
resultado = subprocess.run(["free", "-h"], capture_output=True, text=True)
print(resultado.stdout)
# Mem:  15.5Gi  12.1Gi  1.2Gi  ...
# Swap: 2.0Gi   0B      2.0Gi  ← swap não está sendo usado`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Modelo mental:</strong> processos operam em endereços virtuais — a MMU traduz para físico. Stack é rápida e automática mas limitada (~8MB). Heap é flexível mas requer gerenciamento. Virtual memory permite isolamento entre processos e mapeamento lazy de arquivos. Major page faults (swap) são caros — monitor com <code>vmstat</code> e <code>sar</code> em produção.
      </Callout>

      <Callout>
        Próximo: <strong>Syscalls</strong> — a fronteira entre código de aplicação e o kernel que gerencia hardware.
      </Callout>
    </div>
  );
}
