import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#8b949e';

export const metadata = getModuleMetadata('processos-jobs-sinais');

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre SIGTERM (kill -15) e SIGKILL (kill -9)?',
    options: [
      'São equivalentes — ambos terminam o processo imediatamente',
      'SIGTERM é um pedido educado — o processo pode capturar, limpar recursos e encerrar graciosamente. SIGKILL é forçado pelo kernel e não pode ser capturado ou ignorado — o processo é eliminado imediatamente sem cleanup',
      'SIGKILL é mais seguro porque avisa o processo antes',
      'SIGTERM só funciona como root',
    ],
    correct: 1,
    explanation: 'Sempre tente SIGTERM primeiro — dá chance ao processo de fechar conexões, flush de buffers, salvar estado. Se não responder em alguns segundos, aí usa SIGKILL. Servidores web, bancos de dados e apps bem escritas implementam graceful shutdown via SIGTERM.',
  },
  {
    question: 'Você roda `python servidor.py &` e fecha o terminal. O que acontece com o processo?',
    options: [
      'O processo continua rodando indefinidamente',
      'O processo recebe SIGHUP (hang up) quando o terminal fecha e, por padrão, termina. Para persistir: usar `nohup python servidor.py &` ou `disown` após iniciar, ou um process manager como systemd/supervisor',
      'O processo vai para o background do sistema automaticamente',
      'O terminal não pode ser fechado enquanto há processos em background',
    ],
    correct: 1,
    explanation: 'SIGHUP era originalmente o sinal de "terminal desconectado" (modem caiu). Hoje é enviado para processos do grupo quando o shell líder termina. nohup ignora SIGHUP e redireciona stdout/stderr para nohup.out. systemd/supervisor são soluções profissionais para serviços de longa duração.',
  },
  {
    question: 'O que acontece com processos filhos quando o processo pai termina abruptamente (sem wait)?',
    options: [
      'Os filhos terminam junto com o pai automaticamente',
      'Os filhos viram processos "órfãos" e são adotados pelo PID 1 (init/systemd), que periodicamente recolhe seus exit codes (wait). Processos que terminaram mas ainda não foram "coletados" pelo pai são chamados de "zombies" (Z no ps aux)',
      'Os filhos continuam executando normalmente sem nenhum efeito',
      'O kernel termina todos os filhos imediatamente',
    ],
    correct: 1,
    explanation: 'Zombies (Z no ps aux) são processos que terminaram mas cujo exit code ainda não foi lido pelo pai via wait(). São inofensivos mas ocupam PID. Órfãos são adotados pelo init. Em containers, o processo PID 1 precisa fazer reaping correto — por isso usar um init mínimo (tini) em containers é boa prática.',
  },
];

export default function ProcessosJobsSinaisPage() {
  return (
    <ModuleLayout
      slug="processos-jobs-sinais"
      title="Processos, jobs, sinais: como o SO organiza execução"
      icon="⚙️"
      xp={55}
      readTime={11}
      trailName="Fundamentos Técnicos"
      trailColor="#8b949e"
      nextSlug="ssh-chaves-acesso-remoto"
      nextTitle="SSH e chaves: como acessar máquinas remotas com segurança"
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
        Todo programa que roda é um processo. Entender como o SO cria, organiza e termina processos — e como você se comunica com eles via sinais — é essencial para depurar, operar e escrever software que se comporta corretamente em produção.
      </p>

      <Section accent={accent} title="Processos: identidade e estado">
        <p>
          Cada processo tem um <strong>PID</strong> (Process ID) único, e um <strong>PPID</strong> (Parent PID) — todo processo tem um pai. O processo 1 (init/systemd) é o ancestral de todos.
        </p>
        <CodeBlock>{`# Listar processos
ps aux                    # todos os processos do sistema
ps aux | grep python      # filtrar por nome
ps -ef --forest           # árvore de processos (mostra hierarquia pai-filho)
pstree                    # árvore visual bonita
pstree -p                 # com PIDs

# ps aux output:
# USER  PID  %CPU %MEM  VSZ   RSS  TTY  STAT  START  TIME  COMMAND
# fernando 1234  2.1  0.5 12345 4096  pts/0  S+  10:00  0:01  python app.py
#                                              └── estado:
#   R = running (na CPU agora)
#   S = sleeping (esperando I/O ou sinal)
#   D = uninterruptible sleep (I/O crítico, não pode ser interrompido)
#   Z = zombie (terminou, aguardando pai coletar)
#   T = stopped (SIGSTOP aplicado)
#   + = foreground

# Monitorar em tempo real
top                       # monitor clássico (q para sair)
htop                      # versão moderna e interativa (F10 para sair)
# Atalhos no htop: F5 = árvore, F9 = kill, F4 = filtro`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Criando processos: fork + exec">
        <p>
          No Linux, há exatamente uma forma de criar um processo: <code>fork()</code>. Ele cria uma cópia quase idêntica do processo atual. Depois, o filho geralmente chama <code>exec()</code> para substituir sua imagem pelo novo programa.
        </p>
        <CodeBlock>{`# O modelo fork+exec em shell (o que acontece quando você roda um comando):
$ python script.py

# O shell:
# 1. fork() → cria filho (clone do shell, mesmo código, mesma memória por CoW)
# 2. No filho: exec("python", ["python", "script.py"]) → substituí espaço de memória
# 3. No pai: wait(filho) → bloqueia até filho terminar
# 4. Filho termina → pai lê exit code → shell pronto para próximo comando

# Copy-on-Write (CoW): fork() não copia memória imediatamente
# O filho só recebe uma cópia real de uma página quando a modifica
# Por isso fork() é rápido mesmo para processos com GB de memória`}</CodeBlock>
        <p>
          O exit code de um processo (0 = sucesso, ≠0 = erro) é como o processo comunica o resultado. Scripts shell dependem disso: <code>&amp;&amp;</code> executa o próximo só se o anterior retornou 0; <code>||</code> executa só se retornou ≠0.
        </p>
        <CodeBlock>{`echo $?              # exit code do último comando
npm install && npm test   # test só roda se install OK
npm install || exit 1     # aborta se install falhar`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Foreground, background e jobs">
        <CodeBlock>{`# Foreground (padrão): comando ocupa o terminal
python servidor.py        # terminal bloqueado até o processo terminar
# Ctrl+C → envia SIGINT (interrompe)
# Ctrl+Z → envia SIGTSTP (pausa, processo vai para background stopped)

# Background: adiciona & no final
python servidor.py &      # roda em background, retorna PID
# [1] 12345  ← job number e PID

# Gerenciar jobs do shell atual
jobs                      # lista jobs em background
jobs -l                   # com PIDs
fg %1                     # traz job 1 para foreground
bg %1                     # resume job 1 pausado em background
disown %1                 # remove da lista de jobs (não recebe SIGHUP ao fechar terminal)

# Para processos persistirem além do terminal:
nohup python servidor.py &           # imune a SIGHUP, saída vai para nohup.out
nohup python servidor.py > app.log 2>&1 &  # com log específico

# Solução profissional: systemd ou supervisor
# Não use nohup em produção — use um process manager`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Sinais: comunicação com processos">
        <p>
          Sinais são notificações assíncronas enviadas a processos. O processo pode capturar a maioria e decidir o que fazer — exceto SIGKILL e SIGSTOP, que são tratados pelo kernel.
        </p>
        <ComparisonTable
          headers={['Sinal', 'Número', 'Ação padrão', 'Uso']}
          rows={[
            ['SIGHUP', '1', 'Terminar', 'Recarregar config (nginx, sshd)'],
            ['SIGINT', '2', 'Terminar', 'Ctrl+C — interrupção do usuário'],
            ['SIGQUIT', '3', 'Core dump', 'Ctrl+\\ — quit com dump'],
            ['SIGTERM', '15', 'Terminar', 'Pedido gracioso de encerramento'],
            ['SIGKILL', '9', 'Terminar (kernel)', 'Forçado, não pode ser capturado'],
            ['SIGSTOP', '19', 'Parar (kernel)', 'Pausa, não pode ser capturado'],
            ['SIGCONT', '18', 'Continuar', 'Retoma processo pausado'],
            ['SIGUSR1', '10', 'Terminar', 'Definido pelo app (log rotate, etc)'],
            ['SIGUSR2', '12', 'Terminar', 'Definido pelo app'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Enviar sinais
kill PID              # SIGTERM (padrão) — pedido gracioso
kill -15 PID          # SIGTERM explícito
kill -9 PID           # SIGKILL — força (último recurso)
kill -1 PID           # SIGHUP — nginx usa isso para reload sem downtime
kill -USR1 PID        # SIGUSR1 — log rotate em nginx/apache

# Por nome do processo
killall nginx         # SIGTERM para todos os processos chamados nginx
killall -9 python     # SIGKILL para todos os pythons
pkill -f "python app" # por padrão no nome completo do comando

# SIGKILL é o ÚLTIMO recurso — não permite cleanup:
# → conexões de banco de dados ficam abertas
# → buffers de arquivo não são flushed
# → dados em memória são perdidos
# → state corrompido é possível`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Capturando sinais em Python (graceful shutdown)">
        <CodeBlock>{`import signal
import sys

def graceful_shutdown(signum, frame):
    print(f"\\nRecebeu sinal {signum}. Encerrando graciosamente...")
    # 1. Parar de aceitar novas requisições
    # 2. Aguardar requisições em andamento terminarem
    # 3. Fechar conexões com banco de dados
    # 4. Flush de logs
    sys.exit(0)

# Registra handlers
signal.signal(signal.SIGTERM, graceful_shutdown)
signal.signal(signal.SIGINT, graceful_shutdown)

# Loop principal
print(f"Servidor rodando PID={os.getpid()}")
while True:
    # ... processar requisições
    pass`}</CodeBlock>
        <Callout tone="info">
          Containers Docker enviam SIGTERM quando você faz <code>docker stop</code>. Se o processo não tratar SIGTERM, Docker espera 10 segundos e envia SIGKILL. Aplicar graceful shutdown reduz dados corrompidos e conexões zumbis.
        </Callout>
      </Section>

      <Section accent={accent} title="Depurando processos problemáticos">
        <CodeBlock>{`# Processo consome muita CPU?
top              # ordena por CPU (pressione P)
htop             # interativo, F5 para árvore

# Processo usa muita memória?
ps aux --sort=-%mem | head -10    # top 10 por memória
cat /proc/PID/status | grep VmRSS # RAM usada pelo processo

# Processo travado (D state = uninterruptible sleep)?
# Geralmente esperando I/O de disco com problema
# Não responde a sinais, nem SIGKILL — precisa resolver o I/O ou reiniciar o sistema

# O que um processo está fazendo?
strace -p PID          # syscalls em tempo real
lsof -p PID            # arquivos e sockets abertos
cat /proc/PID/cmdline | tr '\0' ' '  # comando completo

# Processos zombie acumulando?
# Indica bug no processo pai (não está fazendo wait)
ps aux | grep Z        # lista zombies
# Zombies não usam CPU/memória, só PID
# Corrigir: fix no pai, ou matar o pai (zombies são adotados pelo init que faz wait)`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Fluxo correto para encerrar um processo em produção:</strong> kill PID (SIGTERM) → aguardar 5-10s → se ainda vivo: kill -9 PID (SIGKILL). Nunca vá direto para -9 sem tentar SIGTERM primeiro.
      </Callout>

      <Callout>
        Próximo: <strong>SSH e chaves</strong> — como acessar máquinas remotas com segurança, sem nunca mais digitar senha.
      </Callout>
    </div>
  );
}
