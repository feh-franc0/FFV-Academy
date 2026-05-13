import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#6e7681';

export const metadata = getModuleMetadata('containers-namespaces-cgroups');

const quiz: QuizQuestion[] = [
  {
    question: 'Por que containers são muito mais leves que VMs em termos de startup e overhead?',
    options: [
      'Containers usam hardware emulado mais eficiente que VMs',
      'VMs emulam hardware completo e rodam kernel separado — boot leva 30-60s, cada VM usa centenas de MB de RAM apenas para o kernel e OS. Containers compartilham o kernel do host — apenas o processo e seus namespaces são isolados. Startup de container = startup do processo (~100ms). Sem hypervisor overhead. Troca: menor isolamento — containers no mesmo host compartilham o mesmo kernel.',
      'Containers têm otimizações de CPU que VMs não têm',
      'A diferença de peso é mínima — VMs modernas são tão rápidas quanto containers',
    ],
    correct: 1,
    explanation: 'VM: kernel guest + hypervisor = ~500MB RAM overhead antes do app. Container: ~0 overhead de kernel (compartilha o host). Para segurança máxima: VMs (Firecracker, gVisor) isolam melhor. Para eficiência: containers. Kubernetes suporta ambos — kata-containers usa VMs leves para workloads que exigem isolamento forte (multi-tenant, untrusted code). Docker Desktop no Mac/Windows roda uma VM Linux leve por baixo.',
  },
  {
    question: 'O que são Linux namespaces e que tipos existem?',
    options: [
      'Namespaces são diretórios de configuração do Docker',
      'Namespace isola uma visão de recurso do sistema: PID namespace (processo 1 dentro do container, sem ver os do host), Network namespace (interface de rede própria), Mount namespace (filesystem próprio), UTS (hostname próprio), User namespace (UIDs mapeados — root no container pode ser não-root no host), IPC, Time. Cada container recebe novos namespaces — eles não veem os do host.',
      'Namespaces são apenas para rede — não afetam processos ou arquivos',
      'Linux tem apenas 2 tipos de namespace: rede e processo',
    ],
    correct: 1,
    explanation: 'unshare(1) cria novos namespaces sem Docker: `unshare --pid --mount --net --uts --fork bash` — um shell com PID namespace próprio. O container "1" que aparece dentro de um PID namespace é na verdade outro PID no host (mapeado pelo kernel). `lsns` lista todos os namespaces do sistema. `ls -la /proc/PID/ns/` mostra os namespaces de um processo específico.',
  },
  {
    question: 'O que são cgroups e qual a relação com `--memory` e `--cpus` do Docker?',
    options: [
      'cgroups são apenas para monitoramento — não limitam recursos',
      'cgroups (control groups) limitam recursos físicos de grupos de processos: CPU (cpu.max = "200000 1000000" = 20% de 1 CPU), memória (memory.max = 512MB — OOM killer age dentro do container), I/O (blkio throttle), rede (tc qdisc). `docker run --memory=512m --cpus=0.5` cria cgroups com esses limites. Kubernetes usa cgroups para garantir QoS e evitar "noisy neighbors".',
      'cgroups só funcionam com Docker, não com containerd ou podman',
      '--memory do Docker é apenas uma sugestão que o kernel pode ignorar',
    ],
    correct: 1,
    explanation: 'cgroups v2 (default no Linux 5.0+) unificou a hierarquia. Em /sys/fs/cgroup/ você vê os grupos. `systemd-cgls` mostra a árvore de cgroups. Kubernetes: Guaranteed QoS (requests=limits) → cgroup sem burst. Burstable → cgroup com burst. BestEffort → sem limites → primeiro a ser morto em pressão de memória. Um container que passa o memory.max recebe SIGKILL do OOM killer — não aviso.',
  },
];

export default function ContainersNamespacesCgroupsPage() {
  return (
    <ModuleLayout
      slug="containers-namespaces-cgroups"
      title="Containers por baixo: namespaces e cgroups no Linux"
      icon="📦"
      xp={80}
      readTime={16}
      trailName="Como o Computador Funciona"
      trailColor="#6e7681"
      nextSlug="serializacao-endianness"
      nextTitle="Serialização, endianness, UTF-8: os bytes que viajam"
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
        Docker popularizou containers, mas a tecnologia são primitivos Linux: namespaces para isolamento de visão e cgroups para limite de recursos. Entender isso explica por que containers iniciam em milissegundos, o que "root no container" significa, e como Kubernetes gerencia recursos.
      </p>

      <Section accent={accent} title="Os primitivos: namespaces e cgroups">
        <CodeBlock>{`# Criar namespace de PID sem Docker:
# unshare --pid --fork --mount-proc bash
# Dentro: ps aux mostra apenas os processos do novo namespace
# No host: pstree -p mostra o processo real com PID diferente

# Verificar namespaces de um container em execução:
# docker inspect container_id | grep Pid
# ls -la /proc/PID/ns/
# lrwxrwxrwx pid  → pid:[4026531836]     ← namespace ID
# lrwxrwxrwx net  → net:[4026532008]     ← namespace ID (diferente do host)
# lrwxrwxrwx mnt  → mnt:[4026532009]

# Verificar cgroups de um container:
# docker stats container_id
# cat /sys/fs/cgroup/docker/CONTAINER_ID/memory.current   ← uso atual
# cat /sys/fs/cgroup/docker/CONTAINER_ID/memory.max       ← limite

# Criar cgroup manualmente (sem Docker):
# mkdir /sys/fs/cgroup/meu_grupo
# echo 512M > /sys/fs/cgroup/meu_grupo/memory.max
# echo $$ > /sys/fs/cgroup/meu_grupo/cgroup.procs   # adiciona shell atual
# Agora o shell e seus filhos não podem usar mais de 512MB

# Namespace de rede — cada container tem suas interfaces:
# docker exec container ip addr show
# eth0 → 172.17.0.2/16 (rede Docker bridge)
# Isso é uma veth pair: um lado no container, outro no host como veth0

import subprocess
# Ver configuração de rede dos containers:
# ip link show     ← veth pairs visíveis no host
# brctl show       ← bridge docker0`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Union filesystem: layers de imagem Docker">
        <CodeBlock>{`# Uma imagem Docker é uma pilha de layers:
# Layer 5 (topo, read-write): container layer
# Layer 4: COPY requirements.txt + RUN pip install
# Layer 3: COPY . /app
# Layer 2: FROM python:3.12-slim  ← layers da imagem base
# Layer 1 (base): filesystem mínimo do Debian

# Union filesystem (OverlayFS no Linux moderno) monta todas as layers
# como um único filesystem — copy-on-write:
# - Leitura: busca da camada mais alta para baixo
# - Escrita: copia arquivo para o container layer (CoW)
# - Deleção: cria "whiteout" na camada superior

# Ver layers de uma imagem:
# docker image inspect python:3.12-slim | jq '.[0].RootFS.Layers'
# docker history python:3.12-slim

# OverlayFS montagem:
# mount -t overlay overlay -o lowerdir=layer1:layer2:layer3,upperdir=container,workdir=work /merged
# lowerdir = layers de imagem (read-only)
# upperdir = container layer (read-write)
# merged = visão unificada do container

# Inspecionar overlay do container:
# docker inspect container_id | jq '.[0].GraphDriver'
# {
#   "Name": "overlay2",
#   "Data": {
#     "LowerDir": "/var/lib/docker/overlay2/.../diff:...",
#     "MergedDir": "/var/lib/docker/overlay2/.../merged",
#     "UpperDir": "/var/lib/docker/overlay2/.../diff",
#     "WorkDir": "/var/lib/docker/overlay2/.../work"
#   }
# }`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Container runtime: OCI e o que Docker realmente faz">
        <ComparisonTable
          headers={['Componente', 'Papel', 'Exemplos']}
          rows={[
            ['OCI Image Spec', 'Formato de imagem padronizado', 'docker build, buildkit'],
            ['OCI Runtime Spec', 'Como executar um container', 'runc, crun, kata-runtime'],
            ['Container Runtime', 'Gerencia containers', 'containerd, CRI-O, podman'],
            ['Container Engine', 'Interface do usuário', 'Docker, Podman, nerdctl'],
            ['Kubernetes CRI', 'Interface K8s → runtime', 'containerd, CRI-O'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# runc: executa containers OCI diretamente sem Docker
# runc é o que Docker usa internamente

# Criar um container OCI manualmente:
# 1. Extrair filesystem base
# mkdir rootfs && docker export $(docker create busybox) | tar -xC rootfs/
# 2. Gerar config.json (spec OCI)
# runc spec
# 3. Executar
# runc run meu-container

# Dockerfile → imagem → container: o caminho completo
# docker build → buildkit → OCI image (layers + config.json)
# docker run → containerd → runc → namespaces + cgroups + overlayfs
# Resultado: processo isolado no host

# Security: seccomp filtra syscalls permitidas no container
# docker run --security-opt seccomp=perfil.json
# Default: 44 syscalls bloqueadas (inclui clone, ptrace, kexec)
# Privileged: --privileged remove todos os limites (root real no host!)`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Modelo mental:</strong> container = processo com namespaces (visão isolada) + cgroups (recursos limitados) + overlayfs (filesystem em layers). Não é uma VM — compartilha o kernel do host. Root num container é root no namespace do container, mapeado para um UID não-privilegiado no host (com user namespaces). Containers não adicionam overhead de CPU/memória para o processo — overhead é de I/O do overlay e latência de rede virtual.
      </Callout>

      <Callout>
        Próximo: <strong>Serialização e endianness</strong> — os bytes que viajam pela rede e o que UTF-8 realmente é.
      </Callout>
    </div>
  );
}
