import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  KeyValue,
  Timeline,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('vps-primeiro-servidor');

const ACCENT = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que você deve configurar uma chave SSH durante o provisionamento da VPS, em vez de usar senha?',
    options: [
      'Porque chaves SSH são obrigatórias na Hostinger',
      'Porque autenticação por chave SSH é mais segura (criptografia assimétrica) e elimina o risco de ataques de força bruta contra senha',
      'Porque é mais fácil de lembrar',
      'Porque chaves SSH são mais rápidas para digitar',
    ],
    correct: 1,
    explanation:
      'Chaves SSH usam criptografia de chave pública (RSA ou Ed25519). O servidor guarda a chave pública; você usa a privada para autenticar. Sem a chave privada, não há como autenticar — não há "senha" para adivinhar em ataques de força bruta.',
  },
  {
    question: 'Você recebe sua VPS e tenta fazer SSH: `ssh root@IP`. O que é o usuário root neste contexto?',
    options: [
      'Um usuário comum com senha padrão',
      'O superusuário do sistema Linux com acesso irrestrito — pode fazer qualquer coisa, incluindo apagar o sistema operacional',
      'Um usuário criado pela Hostinger sem permissões especiais',
      'O usuário do banco de dados',
    ],
    correct: 1,
    explanation:
      'Root é o UID 0 no Linux — acesso total ao sistema sem restrições. Qualquer comando roda com permissão máxima. Por isso o próximo passo após receber uma VPS é criar um usuário não-root e desativar o login SSH como root.',
  },
  {
    question: 'Qual a diferença entre VPS KVM e VPS compartilhada (shared hosting)?',
    options: [
      'Não há diferença técnica',
      'VPS KVM tem virtualização completa com recursos garantidos (CPU, RAM, disco dedicados). Shared hosting compartilha recursos do servidor entre dezenas/centenas de sites',
      'Shared hosting é mais rápida que VPS',
      'VPS KVM só funciona com Windows',
    ],
    correct: 1,
    explanation:
      'KVM (Kernel-based Virtual Machine) cria uma VM completa com recursos dedicados. Na hospedagem compartilhada, um único servidor físico serve muitos clientes — se um site tem pico de tráfego, afeta os outros. Na VPS, seus recursos são seus.',
  },
  {
    question: 'Por que Ubuntu 24.04 LTS é a escolha recomendada para servidores?',
    options: [
      'Porque é a única distro compatível com Docker',
      'Porque LTS (Long Term Support) garante atualizações de segurança por 5 anos, e o Ubuntu tem a maior comunidade e documentação disponível',
      'Porque é a mais leve em termos de uso de memória',
      'Porque o Ubuntu é obrigatório para usar Nginx',
    ],
    correct: 1,
    explanation:
      'Ubuntu LTS (Long Term Support) recebe patches de segurança por 5 anos. Isso é crítico em servidores — você não quer migrar o sistema operacional todo ano. Além disso, a vasta documentação e comunidade do Ubuntu facilitam resolver problemas rapidamente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="vps-primeiro-servidor"
      title="Provisionando sua primeira VPS na Hostinger"
      icon="🖥️"
      xp={55}
      readTime={12}
      trailName="Deploy Full Stack: VPS, Docker e CI/CD"
      trailColor={ACCENT}
      nextSlug="vps-seguranca-ssh-firewall"
      nextTitle="Segurança do servidor: SSH, UFW e fail2ban"
      relatedSlugs={['deploy-por-que-vps', 'vps-seguranca-ssh-firewall', 'docker-compose-producao']}
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
        Provisionar uma VPS é o primeiro ato concreto de colocar uma aplicação no mundo. Neste módulo vamos desde a escolha do
        plano correto até o primeiro login SSH com usuário root — com explicações do que acontece em cada etapa. Use Ubuntu 24.04
        LTS (escolha sempre LTS para servidores) e fique atento ao processo de geração e configuração de chaves SSH, que é o
        ponto onde mais pessoas tropeçam pela primeira vez.
      </p>

      <Section title="Entendendo os planos de VPS" accent={ACCENT}>
        <p>
          A Hostinger oferece planos VPS com virtualização KVM — cada VPS tem recursos dedicados, não compartilhados. Para
          esta trilha, o plano <strong>KVM 2 (2 vCPU, 8 GB RAM, 100 GB NVMe, 8 TB de banda)</strong> é o sweet spot: roda
          API + Postgres + Redis + Nginx com margem confortável. O custo gira em torno de €7-10/mês dependendo do período
          de contratação.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Plano', 'vCPU', 'RAM', 'Disco NVMe', 'Banda', 'Para que serve']}
          rows={[
            ['KVM 1', '1 vCPU', '4 GB', '50 GB', '4 TB', 'Sites estáticos, bots leves, projetos pessoais'],
            ['KVM 2 (recomendado)', '2 vCPU', '8 GB', '100 GB', '8 TB', 'API + Postgres + Redis + Nginx — ideal para esta trilha'],
            ['KVM 4', '4 vCPU', '16 GB', '200 GB', '16 TB', 'Apps com tráfego relevante, múltiplos serviços'],
            ['KVM 8', '8 vCPU', '32 GB', '400 GB', '32 TB', 'Cargas pesadas, múltiplas apps em produção'],
          ]}
        />
        <Callout tone="info">
          Com 8 GB de RAM você roda muito confortavelmente: Docker Engine (~100 MB), Nginx (~20 MB), 2 réplicas da API
          em Go (~50-150 MB cada), PostgreSQL (~200-500 MB em uso real) e Redis (~50-256 MB com maxmemory configurado).
          Sobra margem para picos de tráfego, jobs assíncronos e o sistema operacional.
        </Callout>
        <Callout tone="warn">
          <strong>Atenção — Hostinger NÃO tem datacenter na América do Sul.</strong> Para audiência brasileira, a melhor
          escolha é <strong>EUA / Boston</strong> (latência ~120ms do Brasil) ou Europa Central / Frankfurt (~200ms).
          Não existe São Paulo no painel — quem te disser o contrário está confundindo com outra hospedagem (shared web
          hosting da Hostinger tem datacenter BR, mas VPS não).
        </Callout>
      </Section>

      <Section title="Passo a passo: provisionando a VPS" accent={ACCENT}>
        <Timeline
          accent={ACCENT}
          events={[
            {
              when: 'Passo 1',
              label: 'Crie sua conta na Hostinger',
              detail: 'Acesse hostinger.com.br → VPS → selecione o plano KVM 2. Pague com cartão ou boleto.',
            },
            {
              when: 'Passo 2',
              label: 'Selecione o sistema operacional',
              detail: 'No painel de configuração, escolha Ubuntu 24.04 (Minimal). "Minimal" usa menos RAM e tem menos pacotes desnecessários.',
              highlight: true,
            },
            {
              when: 'Passo 3',
              label: 'Configure autenticação SSH',
              detail: 'Escolha "SSH Key" ao invés de senha. Vamos gerar a chave no próximo passo.',
              highlight: true,
            },
            {
              when: 'Passo 4',
              label: 'Escolha a localização do datacenter',
              detail: 'Hostinger VPS não tem South America. Para audiência BR: EUA / Boston (~120ms). Para Europa: Frankfurt. Evite Ásia (latência alta para BR).',
              highlight: true,
            },
            {
              when: 'Passo 5',
              label: 'Aguarde o provisionamento',
              detail: 'Leva 1-3 minutos. Você receberá um email com o IP da VPS quando estiver pronta.',
            },
          ]}
        />
      </Section>

      <Section title="Gerando sua chave SSH" accent={ACCENT}>
        <p>
          Se ainda não tem um par de chaves SSH, gere agora. Use Ed25519 — é mais seguro e produz chaves menores que RSA.
        </p>
        <CodeBlock lang="bash">{`# Gere o par de chaves Ed25519 (recomendado)
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"

# O terminal vai perguntar onde salvar (aceite o default: ~/.ssh/id_ed25519)
# e pedir uma passphrase (recomendado — adiciona uma camada extra de segurança)

# Listar as chaves geradas
ls -la ~/.ssh/
# id_ed25519        ← sua chave PRIVADA — nunca compartilhe
# id_ed25519.pub    ← sua chave PÚBLICA — o que vai para o servidor

# Ver o conteúdo da chave pública (para copiar para a Hostinger)
cat ~/.ssh/id_ed25519.pub
# Saída: ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA... seu-email@exemplo.com`}</CodeBlock>
        <Callout tone="danger">
          <strong>A chave privada (<InlineCode>id_ed25519</InlineCode>) nunca sai da sua máquina.</strong> É como sua senha
          master — quem tiver ela consegue acessar qualquer servidor onde você colocou a chave pública. Não a copie para
          servidores, não a comite no Git, não a envie por email ou Slack.
        </Callout>
        <CodeBlock lang="bash">{`# Se já tem chaves RSA antigas e quer manter ambas, gere com nome diferente:
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_hostinger -C "hostinger-vps"

# E configure o ~/.ssh/config para usar a chave certa:
Host minha-vps
  HostName 123.456.789.000  # IP da sua VPS
  User ubuntu               # usuário que criaremos depois
  IdentityFile ~/.ssh/id_ed25519_hostinger`}</CodeBlock>
      </Section>

      <Section title="Adicionando a chave pública na Hostinger" accent={ACCENT}>
        <p>
          No painel da Hostinger, durante o provisionamento ou nas configurações da VPS, há um campo para adicionar chave SSH pública.
          Cole o conteúdo do arquivo <InlineCode>id_ed25519.pub</InlineCode> — apenas a linha que começa com <InlineCode>ssh-ed25519</InlineCode>.
        </p>
        <Callout tone="info">
          <strong>Alternativa se já provisionou sem chave SSH:</strong> acesse o console VNC da Hostinger (painel web → VPS → Console)
          e adicione a chave manualmente depois de logar como root:
        </Callout>
        <CodeBlock lang="bash">{`# No console VNC da Hostinger (ou após login com senha temporária):
# Crie o diretório de chaves autorizadas do root
mkdir -p /root/.ssh
chmod 700 /root/.ssh

# Cole sua chave pública aqui
echo "ssh-ed25519 AAAAC3Nz... seu-email@exemplo.com" >> /root/.ssh/authorized_keys

# Ajuste permissões (importante — SSH rejeita arquivos com permissões abertas)
chmod 600 /root/.ssh/authorized_keys`}</CodeBlock>
      </Section>

      <Section title="Primeiro login na VPS" accent={ACCENT}>
        <p>
          Com a VPS provisionada e o IP em mãos, faça o primeiro login:
        </p>
        <CodeBlock lang="bash">{`# Primeiro login como root (IP de exemplo)
ssh root@203.0.113.10

# Na primeira conexão, o SSH vai perguntar sobre a fingerprint do servidor:
# The authenticity of host '203.0.113.10' can't be established.
# ED25519 key fingerprint is SHA256:abc123xyz...
# Are you sure you want to continue connecting (yes/no/[fingerprint])? yes

# Digite "yes" — isso adiciona o servidor ao seu known_hosts
# ~/.ssh/known_hosts — evita o aviso em próximas conexões

# Bem-vindo ao servidor!
# root@ubuntu-server:~$`}</CodeBlock>
        <Callout tone="warn">
          <strong>Sobre a fingerprint:</strong> se você receber o aviso de fingerprint em uma conexão que já estabeleceu antes,
          pode indicar ataque man-in-the-middle (alguém interceptando sua conexão) ou que o servidor foi recriado.
          Verifique com o suporte da Hostinger antes de continuar.
        </Callout>
      </Section>

      <Section title="Explorando o sistema recém-provisionado" accent={ACCENT}>
        <p>
          Antes de instalar qualquer coisa, entenda o estado do sistema:
        </p>
        <CodeBlock lang="bash">{`# Informações do sistema
uname -a
# Linux ubuntu-server 6.8.0-... x86_64 x86_64 x86_64 GNU/Linux

# Versão do Ubuntu
lsb_release -a
# Distributor ID: Ubuntu
# Description: Ubuntu 24.04.1 LTS
# Release: 24.04

# Recursos disponíveis
free -h
#               total        used        free
# Mem:          7.8Gi       400Mi       7.2Gi   ← 8 GB RAM KVM2
# Swap:         2.0Gi       0           2.0Gi

df -h
# Filesystem      Size  Used Avail  Use% Mounted on
# /dev/vda1       100G  3.0G   96G   3%  /          ← 100 GB NVMe KVM2

# CPUs
nproc
# 2

# Processos em execução
ps aux --sort=-%mem | head -15

# Portas escutando (serviços ativos)
ss -tlnp

# Atualizações disponíveis
apt list --upgradable 2>/dev/null | wc -l`}</CodeBlock>
      </Section>

      <Section title="Primeira coisa a fazer: atualizar o sistema" accent={ACCENT}>
        <p>
          Toda nova VPS tem pacotes desatualizados. Atualize antes de instalar qualquer coisa:
        </p>
        <CodeBlock lang="bash">{`# Atualizar lista de pacotes e instalar atualizações disponíveis
apt update && apt upgrade -y

# Instalar pacotes essenciais que vamos precisar
apt install -y \
  curl \
  wget \
  git \
  vim \
  htop \
  unzip \
  ca-certificates \
  gnupg \
  lsb-release

# Verificar se há reinicialização necessária após atualizações de kernel
ls /var/run/reboot-required 2>/dev/null && echo "REINICIALIZAÇÃO NECESSÁRIA" || echo "OK"

# Se necessário, reiniciar
# reboot
# (espere ~30s e reconecte com ssh root@IP)`}</CodeBlock>
        <Callout tone="info">
          <strong>Por que atualizar imediatamente?</strong> Imagens de VPS são preparadas com antecedência — podem ter
          semanas ou meses de atraso. Manter o sistema desatualizado significa rodar com vulnerabilidades conhecidas.
          Configure atualizações automáticas de segurança depois (módulo de segurança).
        </Callout>
      </Section>

      <Section title="Entendendo o usuário root" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'UID 0', v: 'Root tem UID (User ID) 0. O kernel trata UID 0 diferente de qualquer outro — sem restrições de permissão.' },
            { k: 'Sem confirmação', v: 'rm -rf / como root apaga o sistema operacional sem pedir confirmação. Não há "are you sure?".' },
            { k: 'Por que não usar root no dia-a-dia', v: 'Um erro de digitação pode destruir o servidor. Um exploit em qualquer processo rodando como root compromete tudo. Por isso criaremos um usuário normal no próximo módulo.' },
            { k: 'sudo', v: 'O padrão é criar um usuário não-root com sudo. Você usa o sudo quando precisa de privilégios — e o sistema registra o que foi feito com sudo (auditoria).' },
          ]}
        />
        <CodeBlock lang="bash">{`# Verify que você é root
whoami
# root

id
# uid=0(root) gid=0(root) groups=0(root)

# Ver o histórico de comandos do root (para auditoria)
history

# O prompt do root termina com # (hash)
# root@servidor:~#

# O prompt de usuário normal termina com $ (cifrão)
# ubuntu@servidor:~$`}</CodeBlock>
      </Section>

      <Section title="DNS: aponte o domínio para a VPS antes do certbot" accent={ACCENT}>
        <p>
          Antes de tentar emitir certificado SSL ou subir o Nginx em produção, configure os registros DNS apontando
          para o IP da VPS. Este passo é fácil de esquecer — e quebra o certbot no passo do challenge HTTP-01 sem
          mensagem clara.
        </p>
        <Callout tone="info">
          No painel Hostinger: <strong>Domínios → seudominio.com → DNS / Nameservers → Gerenciar registros DNS</strong>.
          Se o domínio foi comprado em outro registrador (Registro.br, Namecheap, Cloudflare), faça lá mesmo.
        </Callout>
        <CodeBlock lang="bash">{`# Registros A necessários (IP da VPS = 72.60.28.82 no exemplo real):
# Tipo   Nome    Valor           TTL
# A      @       72.60.28.82     300     ← root: seudominio.com
# A      api     72.60.28.82     300     ← api.seudominio.com (backend)
# A      www     72.60.28.82     300     ← opcional: www.seudominio.com
#
# TTL 300 (5min) durante setup; depois pode subir para 3600 (1h) ou 86400 (24h).

# Verificar propagação a partir do seu Mac (geralmente < 5min):
dig api.seudominio.com +short
# 72.60.28.82   ← se mostrar o IP da VPS, propagado

# Verificar de DNS público (Google):
dig @8.8.8.8 api.seudominio.com +short

# Checar o DNS resolvendo a partir da VPS também:
ssh root@72.60.28.82 'getent hosts api.seudominio.com'`}</CodeBlock>
        <Callout tone="warn">
          <strong>Por que isso vem antes do certbot:</strong> o desafio HTTP-01 do Let&apos;s Encrypt funciona assim — a
          CA recebe o pedido, faz uma consulta DNS para resolver o domínio, e depois bate uma requisição HTTP no IP
          resolvido. Sem o A record apontando, o certbot falha com{' '}
          <InlineCode>DNS problem: NXDOMAIN looking up A for api.seudominio.com</InlineCode>. Configure o DNS,
          espere propagar, e só então rode o certbot.
        </Callout>
      </Section>

      <Section title="Configurando o hostname" accent={ACCENT}>
        <p>
          Dê um nome significativo ao servidor. Isso aparece no prompt e nos logs, facilitando identificar de qual servidor
          vêm as mensagens quando você tem mais de um.
        </p>
        <CodeBlock lang="bash">{`# Ver o hostname atual (geralmente um hash aleatório da Hostinger, ex: srv1660277)
hostname
# srv1660277

# Mudar o hostname
hostnamectl set-hostname meu-servidor

# Atualizar /etc/hosts para apontar o novo hostname para localhost
echo "127.0.1.1 meu-servidor" >> /etc/hosts

# Verificar
hostnamectl
# Static hostname: meu-servidor
# Operating System: Ubuntu 24.04.1 LTS
# Kernel: Linux 6.8.0-31-generic
# Architecture: x86-64

# O novo hostname aparece no prompt após relogin:
# root@meu-servidor:~#`}</CodeBlock>
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Esqueci de adicionar a chave SSH durante o provisionamento. O que faço?"
          a="Acesse o console VNC da Hostinger (painel → VPS → Console). Logue com a senha inicial do root (enviada por email). Então adicione a chave pública em /root/.ssh/authorized_keys como mostrado acima."
        />
        <QAItem
          q="Posso usar senhas em vez de chaves SSH?"
          a="Sim, mas não é recomendado. Senhas são vulneráveis a ataques de força bruta — bots vão testar combinações 24/7. Chaves SSH são praticamente imunes a esse tipo de ataque. Se insistir em senha, use ao menos fail2ban (próximo módulo)."
        />
        <QAItem
          q="O que é o arquivo ~/.ssh/known_hosts?"
          a="É um banco de fingerprints de servidores que você já conectou. Na primeira conexão, o SSH pergunta se você confia no servidor e salva a fingerprint. Se a fingerprint mudar em conexões futuras, o SSH alerta — pode indicar ataque ou que o servidor foi reinstalado."
        />
        <QAItem
          q="Posso adicionar múltiplas chaves SSH ao servidor?"
          a="Sim — adicione uma linha por chave pública no arquivo authorized_keys. Isso permite que múltiplos computadores (ou membros da equipe) acessem o servidor com suas próprias chaves. Cada um tem sua própria chave privada."
        />
      </Section>

      <Callout tone="success">
        <strong>Próximos passos.</strong> Você tem uma VPS Ubuntu 24.04 atualizada e acesso root via SSH. O próximo passo
        crítico é <strong>proteger o servidor antes de colocar qualquer aplicação</strong>: criar um usuário não-root,
        desativar login SSH como root, configurar o firewall UFW e instalar o fail2ban. Bots começam a varrer novos IPs
        em minutos — não espere.
      </Callout>
    </div>
  );
}
