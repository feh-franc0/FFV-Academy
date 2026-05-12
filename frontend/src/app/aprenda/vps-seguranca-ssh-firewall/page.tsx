import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  KeyValue,
  QAItem,
  ComparisonTable,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('vps-seguranca-ssh-firewall');

const ACCENT = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que é importante criar um usuário não-root e desativar login SSH como root?',
    options: [
      'Para economizar recursos do servidor',
      'Para reduzir a superfície de ataque: bots atacam o usuário "root" por padrão; com root desativado, precisam descobrir o nome do usuário além da chave/senha',
      'Porque o root não consegue instalar pacotes',
      'Porque a Hostinger exige isso nos termos de serviço',
    ],
    correct: 1,
    explanation:
      'Bots de força bruta tentam "root" como primeiro usuário em 99% dos ataques. Se root não pode logar via SSH, essa classe de ataques falha antes de começar. Combinado com autenticação por chave SSH (sem senha), o vetor de ataque via SSH cai para quase zero.',
  },
  {
    question: 'O que o UFW faz quando você executa `ufw default deny incoming`?',
    options: [
      'Bloqueia todo tráfego de saída do servidor',
      'Define que qualquer porta de entrada não explicitamente liberada será bloqueada — política de "deny all, allow specific"',
      'Desativa todas as regras existentes',
      'Reinicia o firewall para as configurações de fábrica',
    ],
    correct: 1,
    explanation:
      'UFW (Uncomplicated Firewall) usa iptables por baixo. `default deny incoming` significa que todo tráfego de entrada é bloqueado por padrão. Você então abre apenas as portas que precisa: 22 (SSH), 80 (HTTP), 443 (HTTPS). Toda outra porta fica inacessível.',
  },
  {
    question: 'O que o fail2ban faz quando detecta múltiplas tentativas de login SSH falhas?',
    options: [
      'Envia um email de alerta para o administrador',
      'Bane temporariamente o IP de origem criando uma regra de iptables que descarta conexões daquele IP por um período configurável',
      'Desativa o serviço SSH temporariamente',
      'Reinicia o servidor',
    ],
    correct: 1,
    explanation:
      'fail2ban monitora arquivos de log (ex: /var/log/auth.log) e, ao detectar N tentativas falhas em T segundos, cria uma regra de iptables que bloqueia o IP por X minutos (bantime). Isso elimina a maioria dos ataques de força bruta automatizados.',
  },
  {
    question: 'Você executou `ufw enable` mas esqueceu de liberar a porta 22 antes. O que acontece?',
    options: [
      'O UFW libera a porta 22 automaticamente',
      'Você perde o acesso SSH ao servidor — próxima vez que desconectar, não consegue mais reconectar',
      'O UFW solicita confirmação antes de bloquear SSH',
      'O servidor reinicia automaticamente',
    ],
    correct: 1,
    explanation:
      'Este é um erro clássico e devastador. O UFW começa a bloquear tudo, incluindo SSH. A conexão atual sobrevive (TCP keepalive), mas ao desconectar, não há como reconectar via SSH. Solução: sempre `ufw allow 22` antes de `ufw enable`. Ou use o console VNC da Hostinger para recuperar acesso.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="vps-seguranca-ssh-firewall"
      title="Segurança do servidor: SSH, UFW e fail2ban"
      icon="🔒"
      xp={60}
      readTime={13}
      trailName="Deploy Full Stack: VPS, Docker e CI/CD"
      trailColor={ACCENT}
      nextSlug="docker-compose-producao"
      nextTitle="Docker Compose em produção: réplicas e health checks"
      relatedSlugs={['vps-primeiro-servidor', 'docker-compose-producao', 'nginx-proxy-reverso-ssl']}
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
        Bots automatizados começam a varrer IPs novos em menos de 5 minutos. Se você deixar sua VPS com as configurações
        padrão — login root via SSH habilitado, sem firewall — em poucas horas você vai ver centenas de tentativas de
        invasão nos logs. Este módulo cobre as três camadas de segurança mínimas para um servidor Linux: criar um usuário
        não-root, configurar o firewall UFW e instalar o fail2ban. Cada etapa protege contra um vetor de ataque diferente.
      </p>

      <Section title="Por que o servidor recém-criado já é alvo" accent={ACCENT}>
        <p>
          Operadores de botnets monitoram novas alocações de IP (via BGP, registros WHOIS, varreduras ativas) e começam
          a atacar automaticamente. Veja como fica o log de um servidor sem proteção:
        </p>
        <CodeBlock lang="bash">{`# Apenas 2 horas após criar uma VPS sem proteção:
grep "Failed password" /var/log/auth.log | head -20
# Failed password for root from 45.33.49.119 port 54321 ssh2
# Failed password for root from 103.89.12.45 port 22123 ssh2
# Failed password for root from 185.234.219.3 port 44201 ssh2
# ... centenas de linhas

# Contar tentativas nas últimas 24h
grep "Failed password" /var/log/auth.log | wc -l
# 2847`}</CodeBlock>
        <Callout tone="danger">
          <strong>Atenção:</strong> isso não é hipotético. É o que acontece com qualquer IP novo exposto na internet.
          Proteja o servidor <em>antes</em> de instalar qualquer aplicação.
        </Callout>
      </Section>

      <Section title="Passo 1: Criar um usuário não-root" accent={ACCENT}>
        <p>
          O primeiro passo é criar um usuário comum com poderes de sudo. Esse será o usuário que você usará para todas
          as operações no servidor a partir de agora.
        </p>
        <CodeBlock lang="bash">{`# Conectado como root, crie um novo usuário
adduser deploy
# Vai pedir nome completo e senha — preencha a senha, o resto pode deixar vazio

# Adicione o usuário ao grupo sudo (permite usar sudo para comandos privilegiados)
usermod -aG sudo deploy

# Verifique que o usuário foi criado e está no grupo sudo
id deploy
# uid=1000(deploy) gid=1000(deploy) groups=1000(deploy),27(sudo)

# Crie o diretório SSH para o novo usuário
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh

# Copie a chave pública autorizada do root para o novo usuário
cp /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh

# IMPORTANTE: teste o login com o novo usuário ANTES de desativar o root
# Abra um NOVO terminal (não feche o atual) e tente:
# ssh deploy@203.0.113.10
# Se funcionar, continue para o próximo passo`}</CodeBlock>
        <Callout tone="warn">
          <strong>Nunca feche a sessão root atual antes de confirmar que o novo usuário funciona.</strong>
          Se algo der errado, você ainda tem a sessão root aberta para corrigir.
        </Callout>
      </Section>

      <Section title="Passo 2: Desativar login SSH como root" accent={ACCENT}>
        <p>
          Com o usuário <InlineCode>deploy</InlineCode> funcionando, desative o acesso root direto via SSH:
        </p>
        <CodeBlock lang="bash">{`# Edite a configuração do SSH daemon
nano /etc/ssh/sshd_config

# Encontre e altere as seguintes linhas:
# PermitRootLogin yes → PermitRootLogin no
# PasswordAuthentication yes → PasswordAuthentication no
# (desativar senha força autenticação por chave apenas)

# Você pode fazer isso com sed para evitar erros de digitação:
sed -i 's/^PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# Adicione configurações extras de segurança SSH
cat >> /etc/ssh/sshd_config << 'EOF'

# Segurança adicional
MaxAuthTries 3
LoginGraceTime 20
AllowUsers deploy
EOF

# Valide a configuração antes de aplicar (evita deixar SSH inacessível)
sshd -t
# Se não mostrar erro, está OK

# Reinicie o serviço SSH para aplicar mudanças
systemctl restart sshd

# Teste novamente em um novo terminal antes de fechar a sessão atual:
# ssh deploy@203.0.113.10`}</CodeBlock>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'PermitRootLogin no', v: 'Bloqueia login direto como root via SSH. Root ainda existe no sistema, mas não via SSH.' },
            { k: 'PasswordAuthentication no', v: 'Desativa autenticação por senha. Só chaves SSH funcionam — elimina força bruta de senhas.' },
            { k: 'MaxAuthTries 3', v: 'Desconecta após 3 tentativas de autenticação falhas na mesma conexão.' },
            { k: 'AllowUsers deploy', v: 'Apenas o usuário "deploy" pode logar via SSH. Qualquer outro usuário é rejeitado automaticamente.' },
          ]}
        />
      </Section>

      <Section title="Passo 3: Configurar o firewall UFW" accent={ACCENT}>
        <p>
          UFW (Uncomplicated Firewall) é um front-end para o iptables do Linux. É mais simples de usar e suficiente
          para a maioria dos casos.
        </p>
        <Callout tone="danger">
          <strong>Ordem crítica:</strong> libere a porta 22 <em>antes</em> de ativar o UFW. Se ativar antes de liberar o SSH,
          você perde o acesso ao servidor quando a sessão atual fechar.
        </Callout>
        <CodeBlock lang="bash">{`# 1. Definir política padrão: bloquear tudo que entra, permitir tudo que sai
ufw default deny incoming
ufw default allow outgoing

# 2. PRIMEIRO libere o SSH (porta 22) — CRÍTICO
ufw allow 22/tcp

# 3. Libere HTTP e HTTPS para o servidor web
ufw allow 80/tcp
ufw allow 443/tcp

# 4. Ative o firewall
# O UFW vai avisar que pode interromper conexões SSH existentes — digita "y"
ufw enable

# 5. Verifique o status
ufw status verbose
# Status: active
# To                         Action      From
# --                         ------      ----
# 22/tcp                     ALLOW IN    Anywhere
# 80/tcp                     ALLOW IN    Anywhere
# 443/tcp                    ALLOW IN    Anywhere

# Ver regras numeradas (útil para remover regras específicas)
ufw status numbered`}</CodeBlock>
        <Callout tone="info">
          <strong>Dica:</strong> se você instalar o PostgreSQL ou Redis, <em>não</em> abra as portas 5432 e 6379 no firewall.
          Esses serviços devem ser acessíveis apenas localmente (via rede interna do Docker) — jamais expostos na internet.
        </Callout>
        <CodeBlock lang="bash">{`# Comandos úteis do UFW
ufw allow from 192.168.1.100 to any port 5432   # libera PostgreSQL apenas de um IP específico
ufw delete allow 80/tcp                          # remove uma regra
ufw delete 3                                     # remove regra pelo número
ufw reload                                       # recarrega regras sem desativar
ufw disable                                      # desativa (cuidado em prod)
ufw reset                                        # reseta tudo para o padrão (cuidado)`}</CodeBlock>
      </Section>

      <Section title="Passo 4: Instalar e configurar o fail2ban" accent={ACCENT}>
        <p>
          fail2ban monitora logs do sistema e bane IPs que fazem muitas tentativas de login falhas. É a defesa contra
          ataques de força bruta automatizados.
        </p>
        <CodeBlock lang="bash">{`# Instalar o fail2ban
apt install -y fail2ban

# O fail2ban usa arquivos de configuração em /etc/fail2ban/
# Nunca edite jail.conf diretamente (é sobrescrito em atualizações)
# Crie um arquivo local que sobrescreve as configurações:
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edite as configurações principais:
nano /etc/fail2ban/jail.local

# Localize e ajuste a seção [DEFAULT]:
# bantime  = 10m  → mude para 1h (3600 segundos) ou mais
# findtime = 10m
# maxretry = 5    → após 5 tentativas no findtime, bane
# ignoreip = 127.0.0.1/8 ::1  → adicione seu IP pessoal aqui!

# Ou configure via um arquivo separado mais simples:`}</CodeBlock>
        <CodeBlock lang="bash">{`# Criar configuração personalizada:
cat > /etc/fail2ban/jail.d/custom.conf << 'EOF'
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 5
# IMPORTANTE: adicione seu IP pessoal para nunca ser banido
ignoreip = 127.0.0.1/8 ::1 SEU_IP_AQUI

[sshd]
enabled = true
port    = 22
logpath = %(sshd_log)s
backend = %(sshd_backend)s
maxretry = 3
bantime  = 7200
EOF

# Reiniciar e habilitar o fail2ban
systemctl restart fail2ban
systemctl enable fail2ban

# Verificar status
systemctl status fail2ban
fail2ban-client status
# Status
# |- Number of jail: 1
# \`- Jail list: sshd`}</CodeBlock>
        <CodeBlock lang="bash">{`# Comandos de gerenciamento do fail2ban
fail2ban-client status sshd          # ver status do jail SSH
fail2ban-client get sshd banip       # listar IPs banidos
fail2ban-client set sshd unbanip IP  # desbanir um IP específico
fail2ban-client reload               # recarregar configuração

# Ver log de ações do fail2ban
tail -f /var/log/fail2ban.log
# 2026-05-10 10:23:45 INFO [sshd] Ban 45.33.49.119
# 2026-05-10 10:25:01 INFO [sshd] Ban 103.89.12.45`}</CodeBlock>
      </Section>

      <Section title="Bônus: atualizações automáticas de segurança" accent={ACCENT}>
        <p>
          Configure o sistema para instalar atualizações de segurança automaticamente. Isso é o mínimo para manter
          o servidor seguro sem intervenção manual constante:
        </p>
        <CodeBlock lang="bash">{`# Instalar o unattended-upgrades
apt install -y unattended-upgrades

# Configurar para instalar atualizações de segurança automaticamente
dpkg-reconfigure -plow unattended-upgrades
# Selecione "Yes" quando perguntado

# Verificar a configuração
cat /etc/apt/apt.conf.d/20auto-upgrades
# APT::Periodic::Update-Package-Lists "1";
# APT::Periodic::Unattended-Upgrade "1";

# Ver o log de atualizações automáticas
cat /var/log/unattended-upgrades/unattended-upgrades.log`}</CodeBlock>
      </Section>

      <Section title="Verificação final: checklist de segurança" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Item', 'Comando de verificação', 'Resultado esperado']}
          rows={[
            ['Usuário não-root existe', 'id deploy', 'uid=1000(deploy) ...'],
            ['Usuário está no sudo', 'groups deploy', 'deploy sudo'],
            ['Root SSH desativado', 'grep PermitRootLogin /etc/ssh/sshd_config', 'PermitRootLogin no'],
            ['Senha SSH desativada', 'grep PasswordAuth /etc/ssh/sshd_config', 'PasswordAuthentication no'],
            ['UFW ativo', 'ufw status', 'Status: active'],
            ['Porta 22 liberada', 'ufw status', '22/tcp ALLOW Anywhere'],
            ['Porta 80/443 liberada', 'ufw status', '80,443/tcp ALLOW Anywhere'],
            ['fail2ban rodando', 'systemctl is-active fail2ban', 'active'],
            ['SSH funciona com usuário deploy', 'ssh deploy@IP (outro terminal)', 'Login bem-sucedido'],
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Ativei o UFW e perdi o acesso SSH. O que faço?"
          a="Acesse o console VNC da Hostinger (painel → VPS → Console). Logue com o usuário deploy ou root. Execute: ufw allow 22/tcp && ufw reload. Se o UFW não estava ativo antes, talvez precise: ufw disable → ufw allow 22 → ufw enable."
        />
        <QAItem
          q="Meu próprio IP foi banido pelo fail2ban. Como desbanir?"
          a="Via console VNC ou outra conexão (4G do celular, por exemplo): fail2ban-client set sshd unbanip SEU_IP. Para evitar que aconteça novamente, adicione seu IP na lista ignoreip do fail2ban."
        />
        <QAItem
          q="Preciso abrir alguma porta especial para o Docker?"
          a="Não. Docker gerencia suas próprias regras de iptables internamente. Containers que precisam de acesso externo usam o -p do docker run ou ports no Compose — o Docker adiciona as regras de NAT diretamente no iptables, bypass do UFW. Por isso, não exponha portas de banco de dados no -p sem necessidade."
        />
      </Section>

      <Callout tone="success">
        <strong>Servidor protegido.</strong> Com estes três passos — usuário não-root, SSH seguro (só chaves, root desativado)
        e firewall UFW com fail2ban — você tem a proteção mínima para um servidor de produção. O próximo módulo instala
        Docker Compose para orquestrar sua aplicação em containers.
      </Callout>
    </div>
  );
}
