import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  KeyValue,
  ComparisonTable,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('db-producao-ssh-tunnel');

const ACCENT = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Para um dev solo com uma VPS e um Mac, qual a forma mais segura de acessar o Postgres remotamente?',
    options: [
      'Abrir a porta 5432 na firewall e proteger só com senha forte',
      'SSH tunnel com chave ed25519 + Postgres escutando apenas em 127.0.0.1',
      'VPN corporativa com OpenVPN ou WireGuard configurada manualmente',
      'pgAdmin com SSL self-signed apontando para o IP público',
    ],
    correct: 1,
    explanation:
      'SSH tunnel + Postgres em 127.0.0.1 é o padrão da indústria para acesso pessoal a banco em VPS. A porta 5432 fica invisível para bots scanner — eles nem detectam que existe Postgres ali. VPN é overkill para um dev solo; só compensa para times.',
  },
  {
    question: 'Por que NUNCA reutilizar a mesma chave SSH do GitHub Actions para acessar a VPS pessoalmente?',
    options: [
      'Performance — chaves diferentes são mais rápidas',
      'Princípio do menor privilégio: chaves dedicadas por destino limitam o blast radius se uma for comprometida e simplificam revogação',
      'GitHub não permite usar a mesma chave em dois lugares',
      'A chave do GitHub expira sozinha após 30 dias',
    ],
    correct: 1,
    explanation:
      'Se a chave do CI vazar (ex: log de pipeline mal configurado), você revoga ela sem perder seu acesso pessoal. Chave dedicada por destino é uma prática de defesa em profundidade — você sempre quer poder revogar uma credencial sem derrubar outras.',
  },
  {
    question: 'O que `LocalForward 5433 127.0.0.1:5432` no ~/.ssh/config significa?',
    options: [
      'Redirecionar TODO tráfego do Mac para a VPS',
      'Toda vez que você conectar nesse host, automaticamente abre um túnel: localhost:5433 do Mac → 127.0.0.1:5432 da VPS',
      'Mudar a porta SSH da VPS para 5433',
      'Criar um alias DNS para 127.0.0.1',
    ],
    correct: 1,
    explanation:
      'LocalForward declara o port forwarding no config. Em vez de digitar -L 5433:127.0.0.1:5432 toda vez, basta rodar `ssh -fN ffv-vps`. O -f manda pra background e o -N não abre shell — fica só o túnel rodando.',
  },
  {
    question: 'Por que criar um usuário Postgres read-only separado para análise?',
    options: [
      'Para acelerar SELECTs',
      'Defesa contra erro humano: se você se conectar com o usuário read-only no DBeaver, um DELETE acidental falha com permission denied — o banco te protege de você mesmo',
      'Para conseguir mais conexões simultâneas',
      'Para evitar pagar licença do Postgres',
    ],
    correct: 1,
    explanation:
      'A maioria dos incidentes em banco de produção não é hack — é erro humano. Um SELECT mal copiado virando UPDATE sem WHERE pode destruir uma tabela inteira. Usuário read-only é uma rede de proteção barata: dois usuários, dois logins no DBeaver, e o "modo análise" não consegue causar dano.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="db-producao-ssh-tunnel"
      title="Acessando o banco de produção: SSH Tunnel e DBeaver"
      icon="🔑"
      xp={45}
      readTime={18}
      trailName="Deploy Full Stack: VPS, Docker e CI/CD"
      trailColor={ACCENT}
      nextSlug="capstone-mvp-fullstack"
      nextTitle="Capstone: MVP full stack do zero à produção"
      relatedSlugs={['vps-seguranca-ssh-firewall', 'secrets-env-producao', 'docker-compose-producao']}
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <>
      <Section title="O problema que vamos resolver">
        <p>
          Você precisa acessar o Postgres de produção do seu Mac — rodar queries de
          análise, debugar um bug, ver dados reais de usuários. A pergunta certa não
          é &quot;como conectar?&quot;, é <strong>&quot;como conectar sem expor o banco para a
          internet?&quot;</strong>.
        </p>
        <p>
          A resposta para um dev solo com uma VPS é direta: <strong>SSH tunnel com
          autenticação por chave ed25519</strong>, e o Postgres nunca exposto à
          internet. É o setup mais seguro que existe para esse cenário — mais simples
          que VPN, e a superfície de ataque é só a porta SSH (que vamos endurecer).
        </p>
        <Callout tone="info">
          Este módulo cobre o setup completo de produção: hardening do Postgres,
          firewall UFW, sshd_config endurecido, chave dedicada, ~/.ssh/config com
          LocalForward, usuário read-only para análise e backups automatizados. Tudo
          rodável em ~15 minutos uma única vez.
        </Callout>
      </Section>

      <Section title="Por que SSH tunnel é a escolha certa aqui (vs alternativas)">
        <ComparisonTable
          headers={['Solução', 'Quando faz sentido', 'Complexidade', 'Veredito para dev solo']}
          rows={[
            ['SSH tunnel', 'Acesso individual a banco/serviço em VPS', 'Mínima — SSH já vem no SO', '✅ Padrão da indústria'],
            ['Tailscale / WireGuard', 'Time com 5+ devs, múltiplos dispositivos, vários servidores', 'Média — gerenciar rede privada', '❌ Overkill para 1 pessoa'],
            ['VPN (OpenVPN, etc)', 'Empresas grandes com compliance específico', 'Alta — servidor VPN + certificados', '❌ Complexidade desnecessária'],
            ['Banco exposto + senha forte', 'Nunca em produção', 'Zero', '❌ Bots acham em minutos'],
            ['pgBouncer público + TLS', 'SaaS oferecendo banco como serviço', 'Alta — pool de conexões + TLS certs', '❌ Não é seu caso'],
          ]}
        />
        <Callout tone="success">
          <strong>Para você sozinho:</strong> SSH tunnel ganha por simplicidade,
          segurança e zero overhead operacional. Tailscale brilha quando o time cresce
          ou quando vários servidores precisam falar entre si — mas para um dev + uma
          VPS, é complexidade que não compra nada.
        </Callout>
      </Section>

      <Section title="Os 4 princípios de segurança aplicados aqui">
        <KeyValue
          items={[
            { k: 'Banco invisível pra internet', v: 'Postgres escuta só em 127.0.0.1. UFW fecha a porta 5432. Bot scanner nem detecta que existe banco ali.' },
            { k: 'Criptografia ponta-a-ponta', v: 'Todo o tráfego passa dentro do túnel SSH (AES-256). Wi-Fi público, café da esquina, hotel — irrelevante.' },
            { k: 'Autenticação por posse, não por conhecimento', v: 'Chave ed25519 + passphrase. Sem senha trafegando, sem brute force possível.' },
            { k: 'Auditável', v: 'Cada acesso fica em /var/log/auth.log da VPS — você sabe quem entrou, quando, de onde.' },
          ]}
        />
      </Section>

      <Section title="Passo 1 — Postgres só em localhost (na VPS)">
        <p>
          Primeiro garantimos que o Postgres não escuta em interfaces públicas. Mesmo
          se a firewall falhar, o banco simplesmente não responde para o IP externo.
        </p>
        <p><strong>Edite <InlineCode>/etc/postgresql/16/main/postgresql.conf</InlineCode>:</strong></p>
        <CodeBlock lang="conf">{`listen_addresses = 'localhost'
ssl = on`}</CodeBlock>
        <p><strong>Edite <InlineCode>/etc/postgresql/16/main/pg_hba.conf</InlineCode> — só estas duas linhas:</strong></p>
        <CodeBlock lang="conf">{`local   all   all                  scram-sha-256
host    all   all   127.0.0.1/32   scram-sha-256`}</CodeBlock>
        <p>Reinicie o serviço:</p>
        <CodeBlock lang="bash">{`sudo systemctl restart postgresql`}</CodeBlock>
        <Callout tone="info">
          No nosso setup Docker (visto no módulo &quot;Docker Compose em produção&quot;), isso
          já está feito via <InlineCode>ports: [&quot;127.0.0.1:5432:5432&quot;]</InlineCode>{' '}
          no <InlineCode>docker-compose.prod.yml</InlineCode>. Se for Postgres nativo
          (não Docker), siga os passos acima diretamente.
        </Callout>
      </Section>

      <Section title="Passo 2 — Firewall UFW fechando tudo menos SSH">
        <p>
          UFW (Uncomplicated Firewall) é o frontend amigável do iptables no Ubuntu.
          Política padrão: <em>nega tudo, libera só o necessário</em>.
        </p>
        <CodeBlock lang="bash">{`sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp        # SSH
sudo ufw allow 80/tcp        # HTTP (Let's Encrypt + redirect)
sudo ufw allow 443/tcp       # HTTPS
sudo ufw enable

# Confirme — 5432 NÃO deve aparecer:
sudo ufw status verbose`}</CodeBlock>
        <Callout tone="warn">
          Antes de rodar <InlineCode>ufw enable</InlineCode>, confirme que o SSH (22)
          está liberado — caso contrário você perde acesso à VPS e precisa entrar pelo
          console web da Hostinger para corrigir.
        </Callout>
      </Section>

      <Section title="Passo 3 — Endurecer o SSH (sshd_config)">
        <p>
          A porta SSH é a única superfície de ataque que sobra. Vamos endurecer.
        </p>
        <p><strong>Edite <InlineCode>/etc/ssh/sshd_config</InlineCode>:</strong></p>
        <CodeBlock lang="conf">{`PasswordAuthentication no       # só chave, nunca senha
PermitRootLogin no              # root nunca loga via SSH
PubkeyAuthentication yes        # autenticação por chave pública
MaxAuthTries 3                  # 3 tentativas e desconecta
ClientAliveInterval 300         # mata conexões idle após 5min
ClientAliveCountMax 0
Protocol 2                      # só SSH v2 (v1 é inseguro)`}</CodeBlock>
        <p>Aplique e instale fail2ban (bloqueia IPs que tentam força bruta):</p>
        <CodeBlock lang="bash">{`sudo systemctl restart ssh
sudo apt install fail2ban -y
sudo systemctl enable fail2ban --now`}</CodeBlock>
        <Callout tone="info">
          <InlineCode>fail2ban</InlineCode> monitora <InlineCode>/var/log/auth.log</InlineCode>{' '}
          e adiciona ao UFW IPs que falham N vezes em M minutos. Configuração padrão já
          é razoável (5 falhas em 10min → ban de 10min).
        </Callout>
      </Section>

      <Section title="Passo 4 — Chave SSH dedicada no Mac">
        <Callout tone="warn">
          <strong>NUNCA reutilize a chave do GitHub Actions para acesso pessoal.</strong>{' '}
          Princípio do menor privilégio: uma chave por destino. Se a do CI vazar, você
          revoga sem perder acesso ao seu workflow pessoal.
        </Callout>
        <CodeBlock lang="bash">{`# 1. Gerar chave dedicada com passphrase forte
ssh-keygen -t ed25519 -f ~/.ssh/ffv_vps -C "macbook-ffv"
# (digite uma passphrase forte — o macOS guarda no Keychain depois)

# 2. Copiar a chave pública para a VPS
ssh-copy-id -i ~/.ssh/ffv_vps.pub deploy@72.60.28.82

# 3. Testar
ssh -i ~/.ssh/ffv_vps deploy@72.60.28.82 "whoami"
# Esperado: deploy`}</CodeBlock>
        <KeyValue
          items={[
            { k: 'Por que ed25519 e não RSA?', v: 'ed25519 é mais rápido, mais curto e usa criptografia moderna baseada em curvas elípticas. RSA 2048 é OK, mas ed25519 é o padrão recomendado em 2026.' },
            { k: 'Por que passphrase?', v: 'Se alguém roubar seu Mac e tirar o arquivo da chave, sem a passphrase ela é inútil. macOS guarda no Keychain — você digita uma vez por sessão.' },
            { k: 'Comment (-C)', v: 'Aparece no authorized_keys da VPS, ajuda a identificar qual dispositivo é dono daquela chave quando você for revogar.' },
          ]}
        />
      </Section>

      <Section title="Passo 5 — ~/.ssh/config no Mac (o atalho mágico)">
        <p>
          Em vez de digitar <InlineCode>ssh -i ~/.ssh/ffv_vps -L 5433:127.0.0.1:5432 deploy@72.60.28.82</InlineCode>{' '}
          toda vez, declare o host uma vez:
        </p>
        <CodeBlock lang="conf" filename="~/.ssh/config">{`Host ffv-vps
    HostName 72.60.28.82
    User deploy
    Port 22
    IdentityFile ~/.ssh/ffv_vps
    IdentitiesOnly yes
    LocalForward 5433 127.0.0.1:5432
    ServerAliveInterval 60
    ServerAliveCountMax 3
    AddKeysToAgent yes
    UseKeychain yes`}</CodeBlock>
        <KeyValue
          items={[
            { k: 'IdentitiesOnly yes', v: 'Usa SÓ a chave especificada. Sem isso, o ssh-agent oferece todas as chaves e pode causar "Too many authentication failures".' },
            { k: 'LocalForward', v: 'Cria o túnel automaticamente toda vez que conectar nesse host. localhost:5433 (Mac) → 127.0.0.1:5432 (VPS).' },
            { k: 'ServerAliveInterval', v: 'Manda keep-alive a cada 60s — evita NAT timeout do roteador derrubando conexões idle.' },
            { k: 'AddKeysToAgent + UseKeychain', v: 'Guarda a passphrase no Keychain do macOS — você digita uma vez e ela fica desbloqueada até reboot.' },
          ]}
        />
      </Section>

      <Section title="Uso no dia a dia (depois de configurado)">
        <CodeBlock lang="bash">{`# Abrir o túnel (background, sem shell)
ssh -fN ffv-vps

# Verificar que está rodando
ps aux | grep "ssh -fN"

# Conectar do TablePlus / DBeaver / psql
#   Host:  127.0.0.1
#   Porta: 5433
#   User:  ffv
#   Senha: a POSTGRES_PASSWORD do .env

# Fechar quando terminar
pkill -f "ssh -fN ffv-vps"`}</CodeBlock>
        <Callout tone="info">
          <strong>E se o Wi-Fi cair? Use autossh para reconectar sozinho.</strong>{' '}
          Trocou de rede, café, voltou pra casa — o túnel cai. Para reconectar
          automaticamente, <InlineCode>autossh</InlineCode> monitora e reabre sozinho:
        </Callout>
        <CodeBlock lang="bash">{`brew install autossh
autossh -M 0 -fN ffv-vps`}</CodeBlock>
      </Section>

      <Section title="Configurando o DBeaver">
        <p>
          O DBeaver tem duas formas de conectar. Recomendo a <strong>Opção A</strong>{' '}
          (túnel externo) — fica mais simples e o mesmo túnel serve para psql, TablePlus, etc.
        </p>
        <p><strong>Opção A — Túnel aberto no terminal (recomendado):</strong></p>
        <CodeBlock lang="bash">{`# Terminal sempre aberto (ou em background com -f)
ssh -N ffv-vps
# (deixa rodando — o LocalForward do ~/.ssh/config já criou o túnel)`}</CodeBlock>
        <p>No DBeaver, apenas configure a conexão Postgres:</p>
        <KeyValue
          items={[
            { k: 'Host', v: '127.0.0.1' },
            { k: 'Port', v: '5433' },
            { k: 'Database', v: 'ffv_prod' },
            { k: 'Username', v: 'ffv (ou ffv_readonly — ver próxima seção)' },
            { k: 'Password', v: 'POSTGRES_PASSWORD do .env' },
          ]}
        />
        <p><strong>Opção B — SSH tunnel nativo do DBeaver:</strong></p>
        <p>
          Se preferir que o DBeaver gerencie o túnel internamente, vá em{' '}
          <InlineCode>Connection settings → SSH</InlineCode>:
        </p>
        <KeyValue
          items={[
            { k: 'Use SSH tunnel', v: '✅ marcado' },
            { k: 'Host/IP', v: '72.60.28.82' },
            { k: 'Port', v: '22' },
            { k: 'User', v: 'deploy' },
            { k: 'Auth method', v: 'Public key' },
            { k: 'Private key', v: '~/.ssh/ffv_vps' },
          ]}
        />
        <p>
          Na aba Main use <InlineCode>localhost:5432</InlineCode> — o DBeaver cria o
          túnel internamente quando a conexão abre.
        </p>
      </Section>

      <Section title="Camada extra: usuário Postgres read-only para análise">
        <Callout tone="warn">
          A maioria dos incidentes em banco de produção não é hack — é{' '}
          <strong>erro humano</strong>. Um <InlineCode>DELETE</InlineCode> sem{' '}
          <InlineCode>WHERE</InlineCode>, um <InlineCode>UPDATE</InlineCode> copiado de
          uma janela errada do DBeaver. Defesa: usuário read-only.
        </Callout>
        <CodeBlock lang="sql">{`-- Conecte como superuser (ffv) e crie um usuário só-leitura
CREATE USER ffv_readonly WITH PASSWORD 'senha_forte_diferente_aqui';

GRANT CONNECT ON DATABASE ffv_prod TO ffv_readonly;
GRANT USAGE   ON SCHEMA public      TO ffv_readonly;
GRANT SELECT  ON ALL TABLES   IN SCHEMA public TO ffv_readonly;
GRANT SELECT  ON ALL SEQUENCES IN SCHEMA public TO ffv_readonly;

-- Garante que tabelas FUTURAS também sejam acessíveis (sem precisar refazer GRANT)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO ffv_readonly;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON SEQUENCES TO ffv_readonly;`}</CodeBlock>
        <p>
          No DBeaver, crie <strong>duas conexões</strong>:
        </p>
        <KeyValue
          items={[
            { k: 'ffv-prod-readonly', v: 'Conexão padrão para análise. Um DELETE acidental falha com "permission denied".' },
            { k: 'ffv-prod-admin', v: 'Conexão com o usuário ffv. Só abrir quando você realmente precisa escrever.' },
          ]}
        />
        <Callout tone="success">
          Renomeie as conexões com cores diferentes no DBeaver (botão direito → Edit
          Connection → Connection Type → escolha &quot;Production&quot; em vermelho para a admin).
          Vermelho no header é um lembrete visual: cuidado com o que você está rodando.
        </Callout>
      </Section>

      <Section title="Camada extra: backups automatizados">
        <p>
          Segurança não é só impedir invasão — é também sobreviver a um{' '}
          <InlineCode>DROP TABLE</InlineCode> seu mesmo. Backup diário + retenção é o mínimo.
        </p>
        <CodeBlock lang="bash" filename="/opt/ffv/bin/backup-db.sh">{`#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/opt/ffv/backups"
RETENTION_DAYS=14
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ffv_prod_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

# Dump comprimido
docker compose -f /opt/ffv/docker-compose.prod.yml exec -T postgres \\
  pg_dump -U ffv -d ffv_prod --clean --if-exists \\
  | gzip > "$BACKUP_FILE"

# Remove backups mais antigos que RETENTION_DAYS
find "$BACKUP_DIR" -name "ffv_prod_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Opcional: upload pra S3/B2/Backblaze
# aws s3 cp "$BACKUP_FILE" s3://ffv-backups/$(basename "$BACKUP_FILE")

echo "Backup OK: $BACKUP_FILE"`}</CodeBlock>
        <p>Agende no cron da VPS (rodar como root):</p>
        <CodeBlock lang="bash">{`sudo chmod +x /opt/ffv/bin/backup-db.sh
sudo crontab -e

# Adicione (executa toda madrugada às 3h):
0 3 * * * /opt/ffv/bin/backup-db.sh >> /var/log/ffv-backup.log 2>&1`}</CodeBlock>
        <Callout tone="warn">
          <strong>Backup que você nunca testou não é backup.</strong> Uma vez por mês,
          restaure um dump num banco local de teste:{' '}
          <InlineCode>gunzip -c backup.sql.gz | psql -d ffv_test</InlineCode>. Se não
          rodar, você descobriu o problema antes de precisar de verdade.
        </Callout>
      </Section>

      <Section title="O que NÃO fazer (anti-padrões comuns)">
        <ComparisonTable
          headers={['❌ Anti-padrão', 'Por que é perigoso']}
          rows={[
            ['Abrir 5432 na firewall "só pra testar com pgAdmin"', 'Bots Shodan/Censys mapeiam IPs com portas Postgres abertas. Você aparece numa lista pública em minutos.'],
            ['"Ninguém vai descobrir o IP da minha VPS"', 'IPv4 é finito (~4 bilhões). Scanners varrem a internet inteira em <24h. Segurança por obscuridade = sem segurança.'],
            ['Autenticação SSH por senha (PasswordAuthentication yes)', 'Brute force é trivial. Mesmo senha de 16 chars cai com botnet. Chave é a única opção em 2026.'],
            ['Mesma chave SSH para GitHub Actions e acesso pessoal', 'Se a chave do CI vaza num log mal configurado, o atacante tem acesso a tudo. Chave dedicada por destino limita o estrago.'],
            ['Commitar .env no repositório', 'Search no GitHub por "STRIPE_SECRET_KEY=sk_live" retorna milhares de hits. Bots automatizam roubo de credenciais expostas.'],
            ['Postgres com senha "ffv2026" e listen_addresses = "*"', 'Mesmo com firewall, defesa em camadas exige que o banco também esteja blindado por si só.'],
          ]}
        />
      </Section>

      <Section title="Checklist final de segurança">
        <CodeBlock lang="bash">{`# 1. Postgres só em localhost
docker compose -f /opt/ffv/docker-compose.prod.yml exec postgres \\
  netstat -tlnp 2>/dev/null | grep 5432
# Esperado: 127.0.0.1:5432 (NUNCA 0.0.0.0:5432)

# 2. UFW ativo e 5432 fechada
sudo ufw status verbose
# Esperado: Status: active, 22/tcp ALLOW, 80/tcp ALLOW, 443/tcp ALLOW

# 3. SSH só por chave
sudo grep -E "^(PasswordAuthentication|PermitRootLogin)" /etc/ssh/sshd_config
# Esperado: PasswordAuthentication no / PermitRootLogin no

# 4. fail2ban rodando
sudo systemctl status fail2ban

# 5. Testar túnel completo
ssh -fN ffv-vps
psql -h 127.0.0.1 -p 5433 -U ffv -d ffv_prod -c "SELECT version();"
pkill -f "ssh -fN ffv-vps"

# 6. Backups rodando
ls -lh /opt/ffv/backups/
tail /var/log/ffv-backup.log`}</CodeBlock>
        <Callout tone="success">
          Depois de configurado, no dia a dia você só roda <InlineCode>ssh -fN ffv-vps</InlineCode>{' '}
          e abre o cliente. A segurança fica invisível, e a porta do Postgres permanece
          fechada para o mundo. Esse é o padrão da indústria para acesso pessoal a
          banco em VPS.
        </Callout>
      </Section>
    </>
  );
}
