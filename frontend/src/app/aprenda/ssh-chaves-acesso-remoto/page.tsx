import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#8b949e';

export const metadata = getModuleMetadata('ssh-chaves-acesso-remoto');

const quiz: QuizQuestion[] = [
  {
    question: 'Por que Ed25519 é preferível a RSA-2048 para novas chaves SSH?',
    options: [
      'Ed25519 é mais antigo e portanto mais testado',
      'Ed25519 usa curva elíptica (ECDSA) e oferece segurança equivalente com chaves muito menores (256 bits vs 2048 bits), operações mais rápidas, e é resistente a ataques de timing. RSA-4096 ainda é OK, mas Ed25519 é o padrão moderno.',
      'RSA é mais seguro e sempre deve ser preferido',
      'Ed25519 funciona apenas no Linux, RSA é universal',
    ],
    correct: 1,
    explanation: 'Ed25519 é baseado na curva de Edwards sobre o campo de Curve25519. Projetado para resistência a ataques de canal lateral e sem os problemas de implementação que RSA tem. Todos os sistemas modernos suportam Ed25519. Use-o para novas chaves — o `ssh-keygen -t ed25519` já gera no formato correto.',
  },
  {
    question: 'Qual é o propósito do ssh-agent e quando ele ajuda?',
    options: [
      'ssh-agent é um servidor SSH que roda na sua máquina local',
      'ssh-agent mantém chaves privadas descriptografadas em memória durante a sessão. Sem ele: você digita a passphrase da chave a cada conexão SSH. Com ele: digita uma vez por sessão e ele fornece a chave para o ssh-client automaticamente. ssh-add adiciona a chave ao agent.',
      'ssh-agent redireciona portas automaticamente',
      'ssh-agent é opcional e não oferece benefícios reais',
    ],
    correct: 1,
    explanation: 'O fluxo: `ssh-agent` inicia e expõe um socket Unix. `ssh-add ~/.ssh/id_ed25519` carrega a chave (pede passphrase uma vez). Depois, `ssh` automaticamente consulta o agent via $SSH_AUTH_SOCK — sem pedir passphrase novamente. Agent forwarding (`ssh -A`) permite usar sua chave local ao conectar de um servidor intermediário.',
  },
  {
    question: 'O que é port forwarding SSH local (`ssh -L 5432:db-interno:5432 bastion`) e quando usar?',
    options: [
      'Cria um VPN completo entre os dois servidores',
      'Cria um túnel: conexões na sua máquina local na porta 5432 são redirecionadas pelo SSH para db-interno:5432 via bastion. Útil para acessar bancos de dados ou serviços internos sem expô-los na internet — você conecta o DBeaver/psql em localhost:5432 como se o banco fosse local.',
      'Redireciona o tráfego do servidor remoto para sua máquina',
      'Só funciona para bancos de dados PostgreSQL',
    ],
    correct: 1,
    explanation: 'Local port forwarding: `ssh -L [bind_address:]local_port:remote_host:remote_port jump_host`. Todo tráfego para localhost:local_port vai pelo túnel SSH até o jump_host, que então conecta em remote_host:remote_port. Remote forwarding (`-R`) faz o inverso: expõe uma porta da sua máquina no servidor remoto.',
  },
];

export default function SshChavesAcessoRemotoPage() {
  return (
    <ModuleLayout
      slug="ssh-chaves-acesso-remoto"
      title="SSH e chaves: como acessar máquinas remotas com segurança"
      icon="🔑"
      xp={50}
      readTime={10}
      trailName="Fundamentos Técnicos"
      trailColor="#8b949e"
      nextSlug="git-de-verdade"
      nextTitle="Git de verdade: commit, branch, merge, rebase, reflog"
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
        SSH (Secure Shell) é o protocolo que permite controlar servidores remotos com segurança. Entender como funciona a autenticação por chave — não só como usar, mas por quê funciona — é o que separa quem acessa servidores de quem realmente os administra.
      </p>

      <Section accent={accent} title="Como a autenticação por chave funciona">
        <p>
          Autenticação por senha tem um problema fundamental: a senha trafega pela rede (cifrada, mas ainda um segredo compartilhado). Autenticação por chave usa criptografia assimétrica — você prova que tem a chave privada sem nunca enviá-la.
        </p>
        <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: `1px solid ${accent}30` }}>
          <p className="font-semibold text-xs mb-3" style={{ color: accent }}>PROTOCOLO DE AUTENTICAÇÃO (SIMPLIFICADO)</p>
          <div className="flex flex-col gap-2 text-xs" style={{ color: 'var(--ffv-muted)' }}>
            <p>1. Cliente envia sua chave pública ao servidor</p>
            <p>2. Servidor verifica se está em <code>~/.ssh/authorized_keys</code></p>
            <p>3. Servidor gera número aleatório (challenge), cifra com a chave pública</p>
            <p>4. Cliente decifra com sua chave privada (só quem tem a chave privada consegue)</p>
            <p>5. Cliente envia a resposta + hash da sessão para provar que tem a chave privada</p>
            <p>6. Servidor verifica — autenticado. A chave privada nunca saiu da máquina do cliente.</p>
          </div>
        </div>
      </Section>

      <Section accent={accent} title="Gerando e instalando chaves">
        <CodeBlock>{`# Gerar par de chaves (Ed25519 é o padrão moderno)
ssh-keygen -t ed25519 -C "fernando@trabalho"
# → Pergunta onde salvar (padrão: ~/.ssh/id_ed25519)
# → Pergunta passphrase (use uma boa! é a senha da sua chave privada)

# Gera dois arquivos:
~/.ssh/id_ed25519        # chave PRIVADA — nunca compartilhe, nunca suba para git
~/.ssh/id_ed25519.pub   # chave PÚBLICA — pode compartilhar à vontade

# Ver o conteúdo da chave pública
cat ~/.ssh/id_ed25519.pub
# ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBcf... fernando@trabalho

# Instalar no servidor (método automático)
ssh-copy-id usuario@servidor.com
# → copia sua chave pública para ~/.ssh/authorized_keys no servidor

# Instalar manualmente (quando ssh-copy-id não está disponível)
cat ~/.ssh/id_ed25519.pub | ssh usuario@servidor "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
# Ou: copie o conteúdo e cole no servidor em ~/.ssh/authorized_keys

# Permissões corretas (SSH recusa chaves com permissões erradas)
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub`}</CodeBlock>
      </Section>

      <Section accent={accent} title="ssh-agent: digitar passphrase apenas uma vez por sessão">
        <CodeBlock>{`# Iniciar o ssh-agent (geralmente já está rodando em desktops)
eval "$(ssh-agent -s)"     # inicia agent e seta $SSH_AUTH_SOCK
# → Agent pid 12345

# Adicionar sua chave ao agent
ssh-add ~/.ssh/id_ed25519  # pede passphrase UMA vez
ssh-add -t 3600 ~/.ssh/id_ed25519  # expira em 1 hora

# Ver chaves carregadas no agent
ssh-add -l

# Remover chaves do agent
ssh-add -D                 # remove todas
ssh-add -d ~/.ssh/id_ed25519  # remove uma específica

# No macOS, integrar com Keychain (persiste entre reinicializações)
# ~/.ssh/config:
Host *
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_ed25519`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Arquivo ~/.ssh/config: chega de decorar flags">
        <p>
          O arquivo <code>~/.ssh/config</code> é onde você configura aliases e opções por host — evita digitar flags toda vez.
        </p>
        <CodeBlock>{`# ~/.ssh/config
# Criar se não existir: touch ~/.ssh/config && chmod 600 ~/.ssh/config

# Servidor de produção
Host prod
  HostName 203.0.113.10
  User ubuntu
  IdentityFile ~/.ssh/id_ed25519_prod
  Port 22

# Servidor de staging via bastion
Host staging
  HostName 10.0.1.50           # IP interno
  User app
  ProxyJump bastion            # passa pelo bastion primeiro
  IdentityFile ~/.ssh/id_ed25519

# Bastion (jump server)
Host bastion
  HostName bastion.empresa.com
  User ec2-user
  IdentityFile ~/.ssh/id_ed25519
  ForwardAgent yes             # permite usar sua chave local nos servidores atrás do bastion

# GitHub (útil quando tem múltiplas contas)
Host github-pessoal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_pessoal

Host github-trabalho
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_trabalho

# Padrão para todos os hosts
Host *
  ServerAliveInterval 60      # envia keepalive a cada 60s (evita desconexão)
  ServerAliveCountMax 3       # 3 tentativas antes de desconectar
  AddKeysToAgent yes`}</CodeBlock>
        <p>
          Com esse config, <code>ssh prod</code> conecta em <code>ubuntu@203.0.113.10</code> com a chave certa. <code>ssh staging</code> pula pelo bastion automaticamente. <code>git clone git@github-pessoal:user/repo.git</code> usa a chave pessoal.
        </p>
      </Section>

      <Section accent={accent} title="Port forwarding: túneis SSH para serviços internos">
        <ComparisonTable
          headers={['Tipo', 'Comando', 'Uso típico']}
          rows={[
            ['Local (-L)', 'ssh -L 5432:db:5432 bastion', 'Acessar DB interno via localhost'],
            ['Remote (-R)', 'ssh -R 8080:localhost:3000 servidor', 'Expor app local no servidor'],
            ['Dynamic (-D)', 'ssh -D 1080 servidor', 'SOCKS proxy para todo tráfego'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# LOCAL: acessa banco interno via túnel
ssh -L 5432:db-interno.vpc:5432 bastion.empresa.com
# Agora: psql -h localhost -p 5432 -U admin mydb
# (funciona como se o banco fosse local)

# LOCAL com config file (permanente):
Host tunnel-db
  HostName bastion.empresa.com
  LocalForward 5432 db-interno.vpc:5432
  User ec2-user

# REMOTE: expõe sua máquina local no servidor (útil para demos/webhooks)
ssh -R 8080:localhost:3000 servidor.com
# No servidor: curl localhost:8080 → responde sua app local na porta 3000

# Manter túnel ativo (sem executar comando)
ssh -N -L 5432:db:5432 bastion &   # -N não executa comando, -f vai para background`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Segurança: configuração do servidor SSH">
        <CodeBlock>{`# /etc/ssh/sshd_config — configurações críticas de segurança

# Desabilitar login por senha (use apenas chaves!)
PasswordAuthentication no
ChallengeResponseAuthentication no

# Desabilitar login como root diretamente
PermitRootLogin no

# Usar apenas usuários específicos
AllowUsers ubuntu deploy

# Porta não-padrão (security by obscurity, reduz ruído nos logs)
Port 2222

# Timeout para sessões inativas
ClientAliveInterval 300
ClientAliveCountMax 2

# Após editar:
sudo systemctl reload ssh    # recarrega sem derrubar conexões ativas

# Testar configuração sem reiniciar
sudo sshd -t   # valida syntax, não reinicia`}</CodeBlock>
        <Callout tone="warn">
          Nunca feche a sessão SSH antes de abrir uma segunda janela e confirmar que consegue reconectar com as novas configurações. Muitos sysadmins já se trancaram para fora do próprio servidor por fechar prematuramente.
        </Callout>
      </Section>

      <Callout tone="success">
        <strong>Setup completo em 5 passos:</strong> (1) ssh-keygen -t ed25519, (2) ssh-copy-id servidor, (3) configurar ~/.ssh/config com aliases, (4) eval "$(ssh-agent -s)" + ssh-add, (5) desabilitar PasswordAuthentication no servidor.
      </Callout>

      <Callout>
        Próximo: <strong>Git de verdade</strong> — o modelo mental de commits como snapshots, DAG de objetos, e por que rebase não é assustador quando você entende o que está acontecendo.
      </Callout>
    </div>
  );
}
