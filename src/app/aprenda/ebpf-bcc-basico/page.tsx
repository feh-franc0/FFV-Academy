import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ebpf-bcc-basico');

const accent = '#eab308';

const quiz: QuizQuestion[] = [
  {
    question: 'O que torna eBPF seguro para rodar código no kernel?',
    options: [
      'Revisão manual',
      'Verifier estático do kernel: antes do programa anexar, verifica bounded loops, memory access dentro de bounds, no unbounded recursion. Rejeita qualquer programa que possa travar ou ler memória arbitrária',
      'Sandbox userspace',
      'Compilação AOT',
    ],
    correct: 1,
    explanation: 'eBPF verifier (Alexei Starovoitov) analisa grafo de controle do programa antes de JIT-ar. Garante término, acesso bounded, stack máx 512B, instruções limitadas. Isso permite rodar código de terceiros no kernel sem comprometer estabilidade — diferença crítica vs module kernel tradicional.',
  },
  {
    question: 'Quando usar bpftrace em vez de escrever eBPF C puro?',
    options: [
      'Nunca',
      'bpftrace é DSL alto nível (estilo awk) para one-liners e scripts curtos de observability. Produção ou lógica complexa pede programa C compilado via bcc/libbpf. Para investigar &quot;quais arquivos esse processo abre?&quot; um one-liner bpftrace resolve em segundos',
      'Só em dev',
      'bpftrace é mais lento',
    ],
    correct: 1,
    explanation: 'bpftrace (Alastair Robertson + Gregg) é o awk do kernel: sintaxe concisa, compila para eBPF automaticamente. Ideal para ad-hoc tracing. Para tools reutilizáveis ou produção, libbpf + CO-RE (BPF CO-RE, Compile Once Run Everywhere) em C é mais robusto.',
  },
  {
    question: 'Quando eBPF resolve um problema sem modificar código do app?',
    options: [
      'Nunca',
      'Tracing de syscalls, latência de I/O, conexões TCP, open de arquivos, stack traces de slow path — tudo visível no kernel. Exemplo: descobrir qual processo está latindo o disco em produção sem instrumentar nada no app',
      'Só com recompilação',
      'Só em kernels antigos',
    ],
    correct: 1,
    explanation: 'Superpoder do eBPF: tracepoints, kprobes e uprobes deixam você observar qualquer ponto do kernel (e userland via uprobe) sem patch. Tools como opensnoop, execsnoop, tcpconnect, biolatency rodam em produção e respondem perguntas que exigiriam strace (caro) ou instrumentação de código.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ebpf-bcc-basico"
      title="eBPF / bcc / bpftrace básico"
      icon="🐝"
      xp={60}
      readTime={14}
      trailName="Performance Engineering"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="eBPF: a revolução silenciosa do Linux" accent={accent}>
        <p>
          eBPF (extended Berkeley Packet Filter) permite rodar programas sandboxed no kernel sem recompilar ou carregar módulo. Começou como filtro de pacotes nos anos 90, virou plataforma genérica em 2014 com Alexei Starovoitov. Hoje suporta Cilium (networking), Falco (security), Pixie (observability), e a maioria das ferramentas modernas de perf.
        </p>
        <Callout tone="info" icon="💡">
          Verifier do kernel garante segurança: programa não pode travar, não pode ler memória arbitrária, não pode ter loops não-bounded. Falha na verificação = programa rejeitado, kernel intacto.
        </Callout>
      </Section>

      <Section title="bcc tools: investigação pronta pra usar" accent={accent}>
        <p>
          bcc (BPF Compiler Collection, IO Visor) vem com dezenas de tools prontas. Instale o pacote bpfcc-tools e tenha arsenal inteiro.
        </p>
        <CodeBlock lang="bash">{`# Quem abre quais arquivos (execve + openat)
sudo /usr/share/bcc/tools/opensnoop

# Latência de I/O por dispositivo (histograma)
sudo /usr/share/bcc/tools/biolatency -m 10 1

# Conexões TCP outbound em tempo real
sudo /usr/share/bcc/tools/tcpconnect

# Latência de TCP connect
sudo /usr/share/bcc/tools/tcpconnlat

# execve snooping (todo processo iniciado)
sudo /usr/share/bcc/tools/execsnoop

# Off-CPU time por stack (quem bloqueia mais)
sudo /usr/share/bcc/tools/offcputime -p $(pgrep myapp) 10`}</CodeBlock>
      </Section>

      <Section title="bpftrace one-liners (o awk do kernel)" accent={accent}>
        <p>
          bpftrace é linguagem DSL inspirada em DTrace. One-liners respondem perguntas de produção em segundos.
        </p>
        <CodeBlock lang="bash">{`# Contar syscalls por processo em 10s
sudo bpftrace -e 'tracepoint:raw_syscalls:sys_enter { @[comm] = count(); }'

# Histograma de latência de read() em ms
sudo bpftrace -e '
  tracepoint:syscalls:sys_enter_read { @start[tid] = nsecs; }
  tracepoint:syscalls:sys_exit_read  /@start[tid]/ {
    @us = hist((nsecs - @start[tid]) / 1000);
    delete(@start[tid]);
  }'

# Novos processos (execve)
sudo bpftrace -e 'tracepoint:syscalls:sys_enter_execve { printf("%s %s\\n", comm, str(args-&gt;filename)); }'

# Slow file open (&gt; 10ms)
sudo bpftrace -e '
  kprobe:do_sys_openat2 { @t[tid] = nsecs; }
  kretprobe:do_sys_openat2 /@t[tid]/ {
    $dur = (nsecs - @t[tid]) / 1000000;
    if ($dur &gt; 10) { printf("%s %dms\\n", comm, $dur); }
    delete(@t[tid]);
  }'`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Atenção ao overhead: probes em syscalls de alta frequência (read, write) podem custar 5-15%. Use filtros (/pid == 1234/) para reduzir. Em prod, prefira tracepoints (estáveis) a kprobes (função kernel pode sumir entre versões).
        </Callout>
      </Section>

      <Section title="Programa eBPF em C com libbpf + CO-RE" accent={accent}>
        <p>
          Para tools reutilizáveis em produção, libbpf + CO-RE é o padrão moderno. CO-RE (Compile Once, Run Everywhere) permite binário único rodar em kernels diferentes via BTF.
        </p>
        <CodeBlock lang="c">{`// hello.bpf.c — conta execve por comm
#include "vmlinux.h"
#include &lt;bpf/bpf_helpers.h&gt;
#include &lt;bpf/bpf_tracing.h&gt;

struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 1024);
    __type(key, char[16]);
    __type(value, u64);
} exec_count SEC(".maps");

SEC("tracepoint/syscalls/sys_enter_execve")
int handle_execve(void *ctx) {
    char comm[16];
    bpf_get_current_comm(&amp;comm, sizeof(comm));
    u64 zero = 0, *val;
    val = bpf_map_lookup_elem(&amp;exec_count, &amp;comm);
    if (!val) { bpf_map_update_elem(&amp;exec_count, &amp;comm, &amp;zero, BPF_ANY); }
    else { __sync_fetch_and_add(val, 1); }
    return 0;
}

char LICENSE[] SEC("license") = "GPL";`}</CodeBlock>
      </Section>

      <Section title="Casos reais onde eBPF ganhou de tudo" accent={accent}>
        <p>
          Netflix usa eBPF para tracing contínuo de latência de disco em milhões de hosts. Cloudflare usa para DDoS mitigation a line rate. Meta usa para enforcement de security policies. Facebook BPF team escreveu katran (L4 LB) — toda a ingress da Meta passa por eBPF.
        </p>
        <Callout tone="success" icon="✅">
          Referências: &quot;Learning eBPF&quot; (Liz Rice, 2023), BPF Performance Tools (Gregg), https://ebpf.io. bpftrace reference: https://github.com/bpftrace/bpftrace/blob/master/docs/reference_guide.md.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
