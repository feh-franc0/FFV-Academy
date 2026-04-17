import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#6e7681';

export const metadata: Metadata = {
  title: 'Syscalls: a fronteira entre user-space e kernel — FFV Academy',
  description: 'O que é uma syscall, por que trocar entre user mode e kernel mode tem custo, como strace revela o que seu programa faz de verdade.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Por que a transição entre user mode e kernel mode tem custo de performance?',
    options: [
      'Não tem custo — é uma operação de hardware instantânea',
      'Context switch para kernel: (1) salva registradores do user process; (2) muda modo de proteção da CPU (Ring 3 → Ring 0); (3) carrega contexto do kernel; (4) executa a syscall; (5) restaura registradores e retorna ao Ring 3. Isso custa ~100-300ns por syscall. Para operações como write(), o dado também precisa ser copiado do buffer do userspace para o kernel buffer (copy_from_user).',
      'O custo existe apenas para syscalls de I/O, não para syscalls de memória',
      'O custo é apenas de latência de rede — não afeta operações locais',
    ],
    correct: 1,
    explanation: 'A CPU tem rings de proteção: Ring 0 (kernel) acessa hardware diretamente, Ring 3 (userspace) não pode. SYSCALL/SYSRET são instruções x86-64 para troca eficiente (mais rápido que o antigo INT 0x80). Meltdown (2018) explorou a execução especulativa durante syscalls para ler memória do kernel — a mitigação (KPTI) adiciona overhead de ~5-30% para syscall-heavy workloads.',
  },
  {
    question: 'O que o strace revela sobre um programa e por que é útil para debugging?',
    options: [
      'strace mostra o código-fonte do programa em runtime',
      'strace intercepta e loga todas as syscalls que um processo faz: open(), read(), write(), mmap(), socket(), connect(). Revela: quais arquivos o programa abre, conexões de rede que faz, como ele usa memória. Útil para: debugging de "por que trava?", entender o que uma lib de terceiros faz, verificar se um programa acessa arquivos inesperados (segurança).',
      'strace só funciona em programas C, não em Python ou Java',
      'strace para o programa enquanto monitora — só usável em desenvolvimento',
    ],
    correct: 1,
    explanation: 'strace usa a syscall ptrace() para interceptar. Impacto: ~30-100x mais lento durante o trace. Para produção: use perf ou eBPF (bpftrace) que têm overhead de <5%. `strace -c python script.py` mostra sumário das syscalls mais chamadas. `strace -e trace=network python script.py` filtra apenas syscalls de rede.',
  },
  {
    question: 'Por que funções como `printf()` em C e `print()` em Python não fazem uma syscall por chamada?',
    options: [
      'Elas fazem uma syscall por chamada — não há diferença',
      'A libc (e io.IOBase em Python) tem buffers em userspace. printf() acumula dados no buffer e só chama write() (syscall) quando o buffer enche ou no flush explícito (newline em modo line-buffered). Isso reduz drasticamente o número de syscalls — de 1 por char para 1 a cada ~8KB de dados. Buffering é uma das otimizações mais impactantes em I/O.',
      'printf e print são implementadas no kernel — não precisam de syscall',
      'Buffering só acontece para arquivos, não para stdout',
    ],
    correct: 1,
    explanation: 'Modos de buffering: unbuffered (stderr — cada write é imediato), line-buffered (stdout para terminal — flush em \\n), fully-buffered (stdout para arquivo/pipe — flush quando buffer cheio, ~8KB). `fflush(stdout)` ou `sys.stdout.flush()` força flush. Python 3: `print("msg", flush=True)`. Em produção, reduzir syscalls via buffers maiores é otimização padrão (O_DIRECT para I/O sem buffer de kernel).',
  },
];

export default function SyscallsUserKernelPage() {
  return (
    <ModuleLayout
      slug="syscalls-user-kernel"
      title="Syscalls: a fronteira entre user-space e kernel"
      icon="🚧"
      xp={70}
      readTime={14}
      trailName="Como o Computador Funciona"
      trailColor="#6e7681"
      nextSlug="file-descriptors-io"
      nextTitle="File descriptors e I/O: o que todo processo compartilha"
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
        Toda vez que seu programa abre um arquivo, faz uma requisição de rede ou aloca memória, ele pede ao kernel para fazer isso em seu nome. Syscalls são o único ponto de entrada para o kernel — entender esse mecanismo explica latência, segurança e por que buffering importa.
      </p>

      <Section accent={accent} title="Ring protection e o modelo de proteção da CPU">
        <CodeBlock>{`# Syscalls comuns que Python faz internamente:
# read()      — ler arquivo/socket
# write()     — escrever em arquivo/socket/stdout
# open()      — abrir arquivo
# close()     — fechar file descriptor
# mmap()      — mapear memória
# brk()/mmap()— alocar memória heap (malloc usa esses)
# socket()    — criar socket de rede
# connect()   — conectar a servidor TCP
# accept()    — aceitar conexão TCP
# epoll_*()   — multiplexação de I/O (usado pelo asyncio)
# clone()     — criar processo/thread
# execve()    — executar programa
# exit()      — terminar processo

# Python não expõe syscalls diretamente (use ctypes/cffi ou a lib os)
import os

# open() Python → sys.call open() → retorna file descriptor (int)
fd = os.open("/etc/hostname", os.O_RDONLY)
dados = os.read(fd, 256)
os.close(fd)
print(dados.decode())

# Verificar syscall number no Linux x86-64:
# /usr/include/asm/unistd_64.h ou ausyscall --list
# read   = 0
# write  = 1
# open   = 2
# close  = 3
# mmap   = 9
# exit   = 60`}</CodeBlock>
      </Section>

      <Section accent={accent} title="strace: observando syscalls em tempo real">
        <CodeBlock>{`# Usar strace para observar um programa Python:
# strace -f python meu_script.py 2>&1 | head -50

# Output de exemplo (strace de python -c "open('/tmp/x', 'w')"):
# execve("/usr/bin/python3", ["python3", "-c", "open(...)"], envp) = 0
# ... inicialização do interpretador ...
# openat(AT_FDCWD, "/tmp/x", O_WRONLY|O_CREAT|O_TRUNC|O_CLOEXEC, 0666) = 3
# fstat(3, {st_mode=S_IFREG|0644, st_size=0, ...}) = 0
# ioctl(3, TCGETS, 0x...) = -1 ENOTTY (not a tty) ← detecta se é terminal
# close(3) = 0

# Comandos úteis do strace:
# strace -p PID                        # attach a processo rodando
# strace -c python script.py           # sumário de contagem por syscall
# strace -e trace=file python script.py # filtra syscalls relacionadas a arquivo
# strace -e trace=network python script.py # syscalls de rede
# strace -T python script.py           # mostra tempo de cada syscall

# Exemplo de output de strace -c:
# % time   seconds  usecs/call     calls    errors syscall
# ------ --------- ----------- --------- --------- --------
#  40.12    0.001234         123        10           read
#  25.45    0.000783          78        10           write
#  10.23    0.000314          31        10           mmap
# ...

# perf (sem overhead de strace):
# perf stat python script.py    # contadores de hardware (cache misses, etc.)
# perf top                      # profiling em tempo real de qualquer processo`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Buffering: reduzindo syscalls">
        <ComparisonTable
          headers={['Modo', 'Quando flush', 'Syscalls', 'Uso']}
          rows={[
            ['Unbuffered', 'A cada write()', 'Muitas', 'stderr, I/O crítico'],
            ['Line-buffered', 'A cada \\n', 'Moderadas', 'stdout em terminal'],
            ['Fully-buffered', 'Buffer cheio (~8KB)', 'Poucas', 'stdout em arquivo/pipe'],
            ['O_DIRECT', 'A cada write() sem cache kernel', 'Muitas mas sem double-copy', 'Bancos de dados'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`import os, sys

# Ver e controlar buffering em Python
print(sys.stdout.buffer.raw.name)      # '<stdout>'
# stdout em terminal: line-buffered
# stdout em pipe/arquivo: fully-buffered

# Forçar escrita imediata
print("mensagem urgente", flush=True)  # flush=True na chamada
sys.stdout.flush()                      # flush manual

# O_DIRECT: escrever sem cache do kernel (bancos de dados usam isso)
# O banco gerencia seu próprio cache (buffer pool) e não quer dupla cópia
import ctypes

# Syscall vread/write com O_DIRECT bypassa page cache
# Requer alinhamento de 512 bytes no buffer e offset
# Usado por PostgreSQL para wal_sync_method = open_sync

# Medir overhead de syscalls com perf:
# perf stat -e syscalls:sys_enter_read,syscalls:sys_enter_write python script.py`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Takeaways:</strong> cada syscall custa ~100-300ns de overhead de troca de contexto. Minimize syscalls com buffering (padrão em Python). Use <code>strace -c</code> para identificar quais syscalls dominam o tempo. eBPF/bpftrace são alternativas de produção com overhead mínimo. <code>seccomp</code> limita syscalls disponíveis para containers — base do Docker sandboxing.
      </Callout>

      <Callout>
        Próximo: <strong>File descriptors e I/O</strong> — por que "tudo é arquivo" no Linux e como processos compartilham file descriptors.
      </Callout>
    </div>
  );
}
