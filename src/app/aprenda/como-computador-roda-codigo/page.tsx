import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#8b949e';

export const metadata: Metadata = {
  title: 'Como o computador roda seu código — FFV Academy',
  description: 'Do clique de tecla ao pixel na tela: CPU, memória, SO, processos e chamadas de sistema — o modelo mental que todo programador precisa ter.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Quando você executa `python script.py`, qual é a ordem correta das camadas envolvidas?',
    options: [
      'Script → CPU → memória → tela',
      'Shell chama fork() para criar processo filho → exec() carrega o interpretador Python → Python lê o script → CPU executa instruções em loop — com chamadas de sistema (syscalls) para I/O em cada etapa',
      'O script vai direto para a GPU processar',
      'O SO lê o script e traduz para binário automaticamente',
    ],
    correct: 1,
    explanation: 'O shell faz fork() + exec() para criar o processo Python. O interpretador carrega o script, compila para bytecode, e o loop de avaliação (eval loop) executa instrução por instrução. I/O (disco, tela, rede) sempre passa por syscalls que trocam de user-space para kernel-space.',
  },
  {
    question: 'Por que um programa "trava" quando faz I/O de disco sem usar async?',
    options: [
      'Porque o disco é mais lento que a CPU',
      'Porque o processo entra em estado bloqueado (blocked/sleeping) enquanto aguarda a syscall de I/O completar — a CPU fica liberada para outros processos, mas este processo não avança',
      'Porque a memória RAM fica cheia',
      'Porque o SO mata processos lentos automaticamente',
    ],
    correct: 1,
    explanation: 'I/O bloqueante faz o processo emitir uma syscall (read/write) e bloquear: o SO coloca o processo na fila de espera e escala outro na CPU. Async I/O (epoll, io_uring) evita isso usando callbacks/eventos — o processo não bloqueia, registra interesse e é notificado quando o I/O completa.',
  },
  {
    question: 'O que é o "endereço de memória" que você vê em um crash dump (ex: 0x7fff...)? Esse endereço é o endereço físico na RAM?',
    options: [
      'Sim, é o endereço físico exato na RAM',
      'Não — é um endereço virtual. Cada processo tem seu próprio espaço de endereçamento virtual (ex: 0x0 a 0x7fffffff). A MMU (Memory Management Unit) traduz endereço virtual → físico a cada acesso de memória. O processo não sabe onde está na RAM de verdade',
      'É o endereço no disco rígido',
      'É um número aleatório sem significado real',
    ],
    correct: 1,
    explanation: 'Memória virtual é uma das abstrações mais importantes do SO. Cada processo enxerga um espaço de endereços exclusivo e contíguo. A MMU + page tables fazem a tradução virtual→físico em hardware (TLB como cache dessa tradução). Isso permite isolamento entre processos, swap para disco, e memory mapping de arquivos.',
  },
];

export default function ComoComputadorRodaCodigoPage() {
  return (
    <ModuleLayout
      slug="como-computador-roda-codigo"
      title="Como o computador roda seu código (do teclado ao pixel)"
      icon="💻"
      xp={50}
      readTime={10}
      trailName="Fundamentos Técnicos"
      trailColor="#8b949e"
      nextSlug="linux-terminal-basico"
      nextTitle="Linux no terminal: os 30 comandos que valem por 300"
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
        Você abre o editor, escreve código, aperta Run — e algo acontece. Mas <em>o quê exatamente</em>? Entre o seu texto e o pixel na tela existem cinco camadas de abstração que a maioria dos programadores nunca explora. Esse artigo desfaz a magia de dentro pra fora.
      </p>

      <Section accent={accent} title="A pilha completa: 5 camadas que ninguém te ensina">
        <p>
          Todo computador moderno funciona em camadas de abstração empilhadas. Cada camada oferece uma interface para a camada acima e esconde a complexidade da camada abaixo:
        </p>
        <CodeBlock>{`Hardware (transistores, voltagem, física)
     ↑  ↓
Microarquitetura (pipeline de CPU, cache, branch prediction)
     ↑  ↓
Sistema Operacional (kernel: processos, memória, I/O)
     ↑  ↓
Runtime/Interpretador (VM da JVM, CPython, Node.js V8)
     ↑  ↓
Seu código (Python, JavaScript, Java, Go...)`}</CodeBlock>
        <p>
          Quando você escreve <code>print("olá")</code>, o interpretador Python traduz para bytecode, o bytecode vira instruções de CPU, as instruções acessam memória e fazem chamadas de sistema para I/O. São literalmente bilhões de operações em frações de segundo.
        </p>
        <Callout tone="info">
          Saber onde você está na pilha é o que separa quem depura "colocando print" de quem encontra o problema em minutos. Cada bug mora em uma camada específica.
        </Callout>
      </Section>

      <Section accent={accent} title="CPU: o único lugar onde código realmente executa">
        <p>
          A CPU executa um ciclo infinito: <strong>Fetch → Decode → Execute → Write Back</strong>. Nada mais acontece sem esse ciclo.
        </p>
        <div className="flex flex-col gap-2">
          {[
            { step: 'Fetch', desc: 'Busca a próxima instrução na memória, no endereço apontado pelo Instruction Pointer (IP/PC). A instrução pode ser ADD, MOV, JMP, CALL, SYSCALL...', color: accent },
            { step: 'Decode', desc: 'Decodifica os bits da instrução: qual operação é, quais registradores ou endereços de memória usa, qual é o tamanho.', color: accent },
            { step: 'Execute', desc: 'A ALU (Arithmetic Logic Unit) executa: soma, subtrai, compara, move dados. Operações de memória acionam a MMU (Memory Management Unit).', color: accent },
            { step: 'Write Back', desc: 'Escreve o resultado de volta no registrador ou memória. O IP avança para a próxima instrução (ou salta se foi um JMP).', color: accent },
          ].map(item => (
            <div key={item.step} className="p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <p className="font-semibold text-xs mb-1" style={{ color: item.color }}>{item.step}</p>
              <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <p>
          CPUs modernas executam várias instruções <em>ao mesmo tempo</em> via <strong>pipeline</strong> e <strong>execução fora de ordem</strong> (out-of-order execution). Enquanto uma instrução está na fase Execute, a próxima já está em Decode e a seguinte em Fetch — isso é paralelismo implícito que você nunca precisa gerenciar, mas que explica por que CPUs modernas processam bilhões de instruções por segundo.
        </p>
      </Section>

      <Section accent={accent} title="Memória: RAM, cache e a hierarquia que define performance">
        <p>
          Acesso à memória é o maior gargalo de performance em software moderno. Por quê? Porque existe uma hierarquia de memória com velocidades e tamanhos radicalmente diferentes:
        </p>
        <ComparisonTable
          headers={['Tipo', 'Latência', 'Tamanho típico', 'Onde fica']}
          rows={[
            ['Registradores', '< 1 ns', '< 1 KB', 'Dentro da CPU'],
            ['Cache L1', '~1 ns', '32–64 KB', 'Dentro do core'],
            ['Cache L2', '~4 ns', '256–512 KB', 'Por core'],
            ['Cache L3', '~10 ns', '8–64 MB', 'Compartilhado'],
            ['RAM (DRAM)', '~100 ns', '8–64 GB', 'Placa-mãe'],
            ['SSD NVMe', '~100 µs', '256 GB – 4 TB', 'Periférico'],
            ['HDD', '~10 ms', '1–16 TB', 'Periférico'],
          ]}
          accent={accent}
        />
        <p>
          A RAM é 100× mais lenta que o cache L1. Por isso a CPU tem <strong>cache hierárquico</strong>: tenta L1 primeiro, depois L2, L3 e só então vai à RAM. Se seu código acessa memória de forma previsível e sequencial (array de structs, por exemplo), o prefetcher da CPU carrega os dados antes de você pedir — isso é <strong>cache-friendly</strong>. Padrões aleatórios (linked lists, hash maps com muita colisão) causam <strong>cache misses</strong> e destroem performance.
        </p>
        <CodeBlock>{`# Cache-friendly: acesso sequencial, o prefetcher adora
soma = sum(arr[i] for i in range(len(arr)))

# Cache-unfriendly: saltos aleatórios em memória
soma = sum(arr[random_indices[i]] for i in range(n))

# Em arrays grandes, a versão sequencial pode ser
# 10-100x mais rápida — mesma operação, só o padrão muda`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Sistema Operacional: o árbitro de todos os recursos">
        <p>
          O SO (kernel) é o programa mais privilegiado do sistema. Ele controla tudo que o hardware oferece e decide quem pode usar o quê. Sua interface com o mundo é via <strong>chamadas de sistema (syscalls)</strong>.
        </p>
        <p>
          Quando seu código faz <code>open("arquivo.txt")</code>, <code>print("olá")</code>, ou <code>requests.get(url)</code>, não está acessando hardware diretamente. Está pedindo permissão ao SO via syscall. O processo entra em <strong>modo kernel</strong> brevemente, o SO executa a operação com privilégio total, e devolve o resultado para o processo em <strong>mode usuário</strong>.
        </p>
        <CodeBlock>{`# O que seu Python faz:
with open("dados.txt", "r") as f:
    content = f.read()

# O que acontece por baixo (strace mostra isso):
# openat(AT_FDCWD, "dados.txt", O_RDONLY) = 3   ← syscall, retorna fd=3
# fstat(3, {st_mode=S_IFREG, st_size=1234}) = 0  ← syscall
# read(3, "conteúdo...", 4096) = 1234            ← syscall, lê até 4096 bytes
# close(3) = 0                                   ← syscall

# Cada linha acima é uma troca user-space ↔ kernel-space
# Custo: ~100-1000 ns por syscall (mais que uma instrução, menos que I/O real)`}</CodeBlock>
        <Callout tone="info">
          <strong>strace</strong> (Linux) mostra todas as syscalls de um processo: <code>strace python script.py</code>. É a ferramenta certa para entender por que um processo está lento, travado, ou o que está acessando em disco/rede.
        </Callout>
      </Section>

      <Section accent={accent} title="Processos: o container de execução do SO">
        <p>
          Um <strong>processo</strong> é a abstração do SO para um programa em execução. Não confunda com o arquivo executável — o executável é estático (bytes em disco); o processo é dinâmico (em execução, com memória, estado, recursos).
        </p>
        <p>
          Cada processo recebe do SO:
        </p>
        <div className="flex flex-col gap-1 text-xs" style={{ color: 'var(--ffv-muted)' }}>
          <p>→ <strong>PID</strong> (Process ID) — número único de identificação</p>
          <p>→ <strong>Espaço de endereçamento virtual</strong> — memória privada (stack, heap, código, dados)</p>
          <p>→ <strong>File descriptors</strong> — tabela de arquivos/sockets abertos (0=stdin, 1=stdout, 2=stderr)</p>
          <p>→ <strong>Variáveis de ambiente</strong> — copiadas do processo pai</p>
          <p>→ <strong>Permissões</strong> — UID/GID que determinam o que pode acessar</p>
        </div>
        <p>
          Como processos são criados? No Linux, quase sempre via <strong>fork + exec</strong>: <code>fork()</code> cria um clone do processo pai (copy-on-write), e <code>exec()</code> substitui o espaço de memória pelo novo programa. É assim que o shell cria processos filhos para rodar comandos.
        </p>
        <CodeBlock>{`# Quando você roda:
$ python script.py

# O shell (bash/zsh) faz:
pid = fork()          # cria clone do shell
if pid == 0:          # filho executa:
    exec("python", ["python", "script.py"])  # substitui shell por python
else:                 # pai (shell) aguarda:
    waitpid(pid)      # bloqueia até filho terminar`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Memória virtual: por que 0x7fff... não é RAM física">
        <p>
          Quando um programa acessa memória no endereço <code>0x7fff5fbff8a0</code>, esse não é o endereço físico na RAM. É um <strong>endereço virtual</strong> — cada processo vê um espaço de endereços completamente privado e contíguo, como se tivesse a memória toda para si.
        </p>
        <p>
          A <strong>MMU (Memory Management Unit)</strong>, em hardware dentro da CPU, traduz endereços virtuais em físicos a cada acesso. A tabela de tradução (<strong>page table</strong>) fica em RAM e é gerenciada pelo SO. O <strong>TLB (Translation Lookaside Buffer)</strong> é um cache dessa tradução dentro da CPU.
        </p>
        <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: `1px solid ${accent}30` }}>
          <p className="font-semibold text-xs mb-2" style={{ color: accent }}>POR QUE MEMÓRIA VIRTUAL EXISTE</p>
          <div className="flex flex-col gap-1 text-xs" style={{ color: 'var(--ffv-muted)' }}>
            <p>→ <strong>Isolamento:</strong> processo A não pode acessar memória do processo B — segfault se tentar</p>
            <p>→ <strong>Swap:</strong> SO pode mover páginas para disco quando RAM está cheia, transparentemente</p>
            <p>→ <strong>mmap:</strong> arquivos podem ser mapeados para memória — acessar bytes do arquivo como se fossem RAM</p>
            <p>→ <strong>Shared memory:</strong> dois processos podem mapear a mesma página física (IPC eficiente)</p>
            <p>→ <strong>Lazy allocation:</strong> <code>malloc(1GB)</code> não aloca fisicamente — só reserva; SO aloca on demand (page fault)</p>
          </div>
        </div>
        <Callout tone="success">
          <strong>Take-away:</strong> todo endereço que você vê em código, debugger, ou crash dump é virtual. O SO e a MMU cuidam da tradução. Isso é por design — isolamento e flexibilidade.
        </Callout>
      </Section>

      <Callout>
        Próximo passo: <strong>Linux no terminal</strong> — agora que você sabe o que roda por baixo, os comandos do terminal vão fazer muito mais sentido.
      </Callout>
    </div>
  );
}
