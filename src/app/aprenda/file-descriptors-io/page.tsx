import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#6e7681';

export const metadata: Metadata = {
  title: 'File descriptors e I/O: o que todo processo compartilha — FFV Academy',
  description: 'stdin/stdout/stderr como file descriptors, por que tudo é arquivo no Linux, pipes, redirecionamento e como isso afeta performance de I/O.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'O que acontece quando um processo filho (via fork()) herda os file descriptors do pai?',
    options: [
      'O filho recebe cópias independentes — fechar no filho não afeta o pai',
      'O filho herda cópias dos descritores apontando para os mesmos objetos de arquivo no kernel (same open file description). Ambos compartilham a posição de leitura (offset). Se o pai tiver um socket aberto, o filho também pode ler/escrever. Cada fd tem um ref count — o arquivo só fecha quando todos os fds apontando para ele são fechados.',
      'O filho não herda file descriptors — começa com apenas stdin/stdout/stderr',
      'File descriptors herdados são automaticamente fechados no fork()',
    ],
    correct: 1,
    explanation: 'fork() duplica a process table do pai — incluindo a fd table. O flag O_CLOEXEC (close-on-exec) fecha o fd automaticamente quando exec() é chamado — evita que subprocessos herdem sockets desnecessariamente. Em Python: subprocess.Popen() fecha fds do pai por padrão (close_fds=True). Isso evita file descriptor leaks em servidores que forkam processos.',
  },
  {
    question: 'Como o pipe `ls | grep .py` é implementado em nível de file descriptor?',
    options: [
      'O shell escreve a saída do ls num arquivo temporário e grep lê esse arquivo',
      'O shell cria um pipe (par de fds: leitura e escrita), faz fork duas vezes. Processo ls: fecha fd de leitura, redireciona stdout (fd 1) para fd de escrita do pipe. Processo grep: fecha fd de escrita, redireciona stdin (fd 0) para fd de leitura do pipe. Os dados fluem diretamente entre os processos via kernel buffer sem arquivo temporário.',
      'ls e grep se comunicam via socket de rede local',
      'O kernel detecta o pipe automaticamente sem intervenção do shell',
    ],
    correct: 1,
    explanation: 'pipe() cria um buffer circular de ~65KB no kernel. write() no fd de escrita enche o buffer; read() no fd de leitura esvazia. Se buffer cheio: write() bloqueia. Se buffer vazio: read() bloqueia. Isso implementa back-pressure natural. Named pipes (FIFOs) persistem no filesystem: mkfifo myfifo. socketpair() cria pipe bidirecional para comunicação pai-filho.',
  },
  {
    question: 'Por que `/proc/PID/fd/` lista todos os file descriptors de um processo?',
    options: [
      '/proc é o diretório onde o Linux armazena arquivos temporários',
      '/proc é um filesystem virtual (procfs) que expõe informações do kernel como arquivos. /proc/PID/fd/ contém symlinks para cada file descriptor aberto do processo. ls -la /proc/$PID/fd/ mostra: 0→stdin, 1→stdout, 2→stderr, 3→arquivo, 4→socket. Permite diagnóstico sem debugger — lsof usa /proc internamente.',
      '/proc/PID/fd/ só existe em sistemas com SELinux ativado',
      'File descriptors são armazenados no disco em /proc para persistência',
    ],
    correct: 1,
    explanation: '/proc (e /sys) são pseudo-filesystems: o kernel gera conteúdo dinamicamente quando você lê os "arquivos". cat /proc/cpuinfo executa código do kernel que formata a saída — nenhum arquivo real. /proc/PID/maps, /proc/PID/status, /proc/PID/net/tcp são usados por ferramentas como ps, netstat, lsof, top. Ferramentas de observabilidade leem /proc continuamente.',
  },
];

export default function FileDescriptorsIoPage() {
  return (
    <ModuleLayout
      slug="file-descriptors-io"
      title="File descriptors e I/O: o que todo processo compartilha"
      icon="📁"
      xp={65}
      readTime={13}
      trailName="Como o Computador Funciona"
      trailColor="#6e7681"
      nextSlug="io-bloqueante-nao-bloqueante"
      nextTitle="I/O bloqueante, não-bloqueante, async: select/poll/epoll"
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
        "Everything is a file" é o princípio unificador do Unix. File descriptors são handles inteiros que representam arquivos, sockets, pipes, dispositivos e até o próprio processo — todos acessados pelas mesmas syscalls read/write.
      </p>

      <Section accent={accent} title="File descriptors: inteiros que representam tudo">
        <CodeBlock>{`# Todo processo começa com 3 fds abertos:
# 0 = stdin  (leitura)
# 1 = stdout (escrita)
# 2 = stderr (escrita)

import os

# Abrir arquivo retorna o próximo fd disponível:
fd = os.open("/etc/hostname", os.O_RDONLY)
print(fd)   # 3 (próximo após stderr)

# Ler usando o fd diretamente:
dados = os.read(fd, 256)
print(dados)

# Redirecionar stdout para arquivo (fd 1 aponta para o arquivo):
fd_arquivo = os.open("/tmp/saida.txt", os.O_WRONLY | os.O_CREAT, 0o644)
os.dup2(fd_arquivo, 1)      # fd 1 agora aponta para o arquivo
os.close(fd_arquivo)        # fechar o fd original (fd 1 ainda aponta)
print("Isso vai para o arquivo!")
os.dup2(2, 1)               # restaurar stdout apontando para stderr

# Verificar fds abertos do processo atual:
import os
pid = os.getpid()
# ls -la /proc/{pid}/fd
fd_dir = f"/proc/{pid}/fd"
for fd_name in os.listdir(fd_dir):
    try:
        alvo = os.readlink(f"{fd_dir}/{fd_name}")
        print(f"fd {fd_name} → {alvo}")
    except:
        pass
# fd 0 → /dev/pts/0   (terminal)
# fd 1 → /dev/pts/0   (terminal)
# fd 2 → /dev/pts/0   (terminal)
# fd 3 → /etc/hostname (arquivo aberto)

# Limite de fds por processo:
import resource
soft, hard = resource.getrlimit(resource.RLIMIT_NOFILE)
print(f"Max fds: {soft} (soft) / {hard} (hard)")   # tipicamente 1024/4096
# ulimit -n 65536  # aumentar para servidores com muitas conexões`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Pipes: comunicação entre processos">
        <CodeBlock>{`import os, subprocess

# Pipe anônimo — comunicação pai-filho
r_fd, w_fd = os.pipe()   # retorna par (leitura, escrita)

pid = os.fork()
if pid == 0:
    # Filho: fecha fd de leitura, escreve no pipe
    os.close(r_fd)
    os.write(w_fd, b"mensagem do filho\n")
    os.close(w_fd)
    os._exit(0)
else:
    # Pai: fecha fd de escrita, lê do pipe
    os.close(w_fd)
    dados = os.read(r_fd, 1024)
    os.close(r_fd)
    os.waitpid(pid, 0)
    print(f"Pai recebeu: {dados.decode()}")

# subprocess.Popen — shell pipes via Python:
proc = subprocess.Popen(
    ["ls", "-la"],
    stdout=subprocess.PIPE,    # cria pipe, conecta stdout do ls
    stderr=subprocess.PIPE
)
stdout, stderr = proc.communicate()
print(stdout.decode())

# Pipe nomeado (FIFO) — persiste no filesystem
os.mkfifo("/tmp/meu_pipe")
# Processo A: open("/tmp/meu_pipe", "w") — bloqueia até B abrir
# Processo B: open("/tmp/meu_pipe", "r") — ambos desbloqueiam`}</CodeBlock>
      </Section>

      <Section accent={accent} title="tudo é arquivo: exemplos práticos">
        <ComparisonTable
          headers={['O que parece', 'O que é no Linux', 'Exemplo']}
          rows={[
            ['Arquivo regular', 'Arquivo em filesystem', '/etc/hosts, main.py'],
            ['Diretório', 'Arquivo especial com entradas', '/home/user/'],
            ['Terminal', 'Character device', '/dev/tty, /dev/pts/0'],
            ['Disco', 'Block device', '/dev/sda, /dev/nvme0n1'],
            ['Socket de rede', 'File descriptor', 'TCP socket, Unix socket'],
            ['Pipe', 'File descriptor', 'ls | grep → pipe anônimo'],
            ['Timer', 'timerfd — file descriptor!', 'epoll pode monitorar timers'],
            ['Sinal', 'signalfd — file descriptor!', 'Receber SIGTERM via read()'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# /dev: dispositivos como arquivos
with open("/dev/urandom", "rb") as f:
    random_bytes = f.read(16)    # lê 16 bytes de ruído do hardware

# /dev/null: descarta tudo que escrever
import subprocess
subprocess.run(["ls"], stdout=open("/dev/null", "w"))  # silencia saída

# /proc: informações do kernel como arquivos
with open("/proc/cpuinfo") as f:
    cpu_info = f.read()    # kernel gera dinamicamente

with open("/proc/loadavg") as f:
    load = f.read()        # "0.45 0.32 0.28 1/234 12345"

# /sys: controle de hardware como arquivos
with open("/sys/class/thermal/thermal_zone0/temp") as f:
    temp_mc = int(f.read().strip())  # temperatura em milligraus
    print(f"CPU: {temp_mc / 1000:.1f}°C")`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Modelo mental:</strong> file descriptor é um inteiro indexando a fd table do processo. Todos os I/Os (arquivos, rede, pipes) usam as mesmas syscalls read/write. <code>dup2()</code> implementa redirecionamento. Pipes são buffers do kernel com back-pressure natural. Limite de fds por processo deve ser aumentado para servidores com muitas conexões (<code>ulimit -n</code>).
      </Callout>

      <Callout>
        Próximo: <strong>I/O bloqueante vs não-bloqueante</strong> — o fundamento de event loops como asyncio e por que epoll escala para milhares de conexões.
      </Callout>
    </div>
  );
}
