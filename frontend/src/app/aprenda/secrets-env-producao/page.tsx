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

export const metadata = getModuleMetadata('secrets-env-producao');

const ACCENT = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Você commitou acidentalmente um arquivo .env com credenciais de produção. O que fazer?',
    options: [
      'Deletar o arquivo e fazer um novo commit — isso apaga o histórico',
      'Revogar imediatamente todas as credenciais expostas (trocar senhas, regenerar tokens, revogar API keys), porque o histórico Git preserva o arquivo mesmo após deleção',
      'Fazer git reset --hard para desfazer o commit',
      'Tornar o repositório privado para esconder o histórico',
    ],
    correct: 1,
    explanation:
      'Git preserva todo o histórico. Mesmo que você delete o arquivo e force-push, o commit antigo pode ter sido cacheado por mirrors, GitHub, bots de scanning ou clones existentes. A única ação segura é revogar e regenerar todas as credenciais imediatamente.',
  },
  {
    question: 'Por que `openssl rand -hex 32` é uma boa forma de gerar um secret?',
    options: [
      'Porque openssl é a única ferramenta que gera números aleatórios',
      'Porque gera 32 bytes de entropia criptograficamente segura do /dev/urandom do sistema, resultando em 64 caracteres hexadecimais — imprevisível e com espaço de keyspace de 2^256',
      'Porque é mais rápido que outros geradores',
      'Porque o resultado é sempre o mesmo em qualquer sistema',
    ],
    correct: 1,
    explanation:
      'openssl rand usa o CSPRNG (Cryptographically Secure Pseudo-Random Number Generator) do sistema operacional. -hex 32 gera 32 bytes e os representa em hexadecimal (64 chars). Este é o método recomendado para gerar JWT secrets, chaves de sessão, tokens de API, etc.',
  },
  {
    question: 'Qual é a diferença entre passar variáveis com `environment:` e `env_file:` no Docker Compose?',
    options: [
      'São equivalentes — apenas sintaxes diferentes',
      '`environment:` embute valores diretamente no compose.yml (arriscado para secrets). `env_file:` lê de um arquivo separado que não deve ser commitado — mantém secrets fora do controle de versão',
      '`env_file:` é mais rápido para carregar variáveis',
      '`environment:` só funciona com variáveis do sistema operacional',
    ],
    correct: 1,
    explanation:
      'Se você usa `environment: DB_PASSWORD: minhasenha` no compose.yml e commita esse arquivo, a senha está exposta. Com `env_file: .env.production`, o arquivo com os valores reais fica no .gitignore e nunca é commitado. O compose.yml pode ir para o repositório com segurança.',
  },
  {
    question: 'O que é "separação de ambientes" no contexto de variáveis de ambiente?',
    options: [
      'Usar servidores físicos diferentes para dev e prod',
      'Ter valores diferentes para as mesmas variáveis em cada ambiente (dev/staging/prod) — ex: DATABASE_URL aponta para banco local em dev e banco de prod em produção',
      'Usar linguagens de programação diferentes em cada ambiente',
      'Ter repositórios Git separados para cada ambiente',
    ],
    correct: 1,
    explanation:
      'Separação de ambientes significa que .env.development tem configurações locais (banco local, log verboso, keys de sandbox do Stripe) e .env.production tem as configurações reais (banco remoto, log mínimo, keys de prod do Stripe). Ambos os arquivos estão no .gitignore.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="secrets-env-producao"
      title="Secrets e variáveis de ambiente em produção"
      icon="🗝️"
      xp={55}
      readTime={12}
      trailName="Deploy Full Stack: VPS, Docker e CI/CD"
      trailColor={ACCENT}
      nextSlug="frontend-deploy-ftp"
      nextTitle="Deploy do frontend estático: FTP e hospedagem compartilhada"
      relatedSlugs={['deploy-script-rollback', 'github-actions-deploy-vps', 'docker-compose-producao']}
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
        Credenciais hardcoded no código são a origem de incontáveis vazamentos de dados. Senhas de banco em commits,
        API keys no repositório, JWT secrets em arquivos de configuração — todos esses erros acontecem quando não há
        um processo claro para gerenciar secrets. Este módulo ensina o processo correto: como gerar secrets seguros,
        onde armazená-los, como passá-los para containers e como separar configurações por ambiente.
      </p>

      <Section title="A regra número um: nunca commite secrets" accent={ACCENT}>
        <p>
          Bots de scanning varrem repositórios públicos (e até privados via forks e leaks) em busca de padrões de
          credenciais. A AWS tem um sistema que detecta e notifica quando uma chave IAM aparece no GitHub — e bots
          maliciosos são mais rápidos que a notificação da AWS.
        </p>
        <Callout tone="danger">
          <strong>Se você commitou uma credencial:</strong> (1) Revogue imediatamente — troque a senha, regenere o token,
          invalide a API key. (2) Remover do Git NÃO é suficiente — o histórico preserva o arquivo. (3) Assuma que foi
          comprometido e tome ação preventiva.
        </Callout>
        <CodeBlock lang="bash">{`# O .gitignore MÍNIMO para projetos com variáveis de ambiente:
cat >> .gitignore << 'EOF'
# Variáveis de ambiente e secrets
.env
.env.*
!.env.example    # exceção: o arquivo de exemplo (sem valores reais)
.env.local
.env.production
.env.staging

# Nunca commite chaves privadas
*.pem
*.key
id_rsa
id_ed25519
EOF

# Verificar se um arquivo já está rastreado pelo git (e deveria ser removido):
git ls-files .env
# Se mostrar .env, execute:
git rm --cached .env
echo ".env" >> .gitignore
git commit -m "remove .env do rastreamento git"`}</CodeBlock>
      </Section>

      <Section title="War story: REDIS_URL esquecido derruba o boot" accent={ACCENT}>
        <Callout tone="danger">
          <strong>Aconteceu de verdade.</strong> No primeiro <InlineCode>.env</InlineCode> de produção da FFV, coloquei
          só <InlineCode>REDIS_PASSWORD=...</InlineCode> achando que bastava. A API Go subiu, ficou{' '}
          <em>unhealthy</em> em 3s e ficou em loop de restart. Os logs:{' '}
          <InlineCode>config: required key REDIS_URL missing value</InlineCode>.
        </Callout>
        <p>
          O backend usa <InlineCode>envconfig</InlineCode> em <InlineCode>internal/config/config.go</InlineCode> com
          campos marcados como <InlineCode>required:&quot;true&quot;</InlineCode>:
        </p>
        <CodeBlock lang="go" filename="internal/config/config.go (trecho)">{`type Config struct {
    DatabaseURL string \`envconfig:"DATABASE_URL" required:"true"\`
    RedisURL    string \`envconfig:"REDIS_URL"    required:"true"\`
    RedisPassword string \`envconfig:"REDIS_PASSWORD" required:"true"\`
    JWTSecret   string \`envconfig:"JWT_SECRET"   required:"true"\`
    // ...
}`}</CodeBlock>
        <p>
          Quando <InlineCode>required:&quot;true&quot;</InlineCode> e a variável não vem, a função{' '}
          <InlineCode>envconfig.Process</InlineCode> retorna erro fatal no startup. A solução é o{' '}
          <InlineCode>.env</InlineCode> de produção ter <em>todas</em> as variáveis exigidas pelo Go:
        </p>
        <CodeBlock lang="bash" filename="/opt/ffv/.env (mínimo viável)">{`# Banco
POSTGRES_PASSWORD=<hex 64 — gere com: openssl rand -hex 32>
DATABASE_URL=postgres://ffv:SENHA@postgres:5432/ffv_prod?sslmode=disable

# Redis — AMBOS são obrigatórios
REDIS_PASSWORD=<hex 64 — gere com: openssl rand -hex 32>
REDIS_URL=redis://:SENHA@redis:6379/0       # ← FÁCIL DE ESQUECER

# JWT
JWT_SECRET=<hex 64 — gere com: openssl rand -hex 32>

# Image
IMAGE_TAG=latest`}</CodeBlock>
        <Callout tone="info">
          <strong>Defesa-em-profundidade:</strong> sempre <em>grepe</em> o código por <InlineCode>required:&quot;true&quot;</InlineCode>{' '}
          (Go) ou padrões equivalentes em Node (<InlineCode>throw new Error(&apos;Missing &apos; + ...)</InlineCode>) e
          cruze com o seu <InlineCode>.env.example</InlineCode>. Qualquer divergência é uma war story esperando para
          acontecer no primeiro deploy.
        </Callout>
      </Section>

      <Section title="Criando o arquivo .env.example" accent={ACCENT}>
        <p>
          O arquivo <InlineCode>.env.example</InlineCode> documenta quais variáveis o projeto precisa, sem os valores reais.
          Este arquivo <em>vai</em> para o repositório:
        </p>
        <CodeBlock lang="bash">{`# .env.example — commite este arquivo no repositório
# Substituia pelos valores reais e salve como .env.production

# Banco de dados
DATABASE_URL=postgres://usuario:SENHA_AQUI@localhost:5432/nome_banco
DB_USER=app
DB_PASSWORD=GERE_COM_OPENSSL_RAND_HEX_32
DB_NAME=meu_app

# Autenticação
JWT_SECRET=GERE_COM_OPENSSL_RAND_HEX_32
JWT_EXPIRES_IN=7d

# API Keys externas (use as keys de sandbox em desenvolvimento)
STRIPE_SECRET_KEY=sk_live_SUBSTITUA_PELO_VALOR_REAL
STRIPE_WEBHOOK_SECRET=whsec_SUBSTITUA

# Redis
REDIS_URL=redis://localhost:6379

# Configurações de ambiente
NODE_ENV=production
LOG_LEVEL=info
PORT=3000`}</CodeBlock>
      </Section>

      <Section title="Gerando secrets seguros" accent={ACCENT}>
        <CodeBlock lang="bash">{`# Gerar um secret de 32 bytes em hexadecimal (64 chars) — para JWT, sessões, etc.
openssl rand -hex 32
# a3f8b2c4d1e9f0a7b3c5d8e2f4a1b6c9d3e7f0a2b5c8d1e4f7a0b3c6d9e2f5a8

# Gerar um secret de 32 bytes em base64 (mais curto que hex, mesmo entropia)
openssl rand -base64 32
# K3vB2mN8pQ7rS1tU4wX6yZ9aD5eG0hJ3kL6mP8qR2sT=

# Gerar uma senha alfanumérica legível (ex: para senhas de banco)
openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32
# xKj8mNvP3qRsT2uW5yZaB1cD7eGhJ0kL

# Para senhas de banco PostgreSQL (sem caracteres especiais que quebram URLs)
openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32

# Verificar a entropia do secret gerado (deve ser alto)
echo "a3f8b2c4d1e9f0a7b3c5d8e2f4a1b6c9" | tr -d '\\n' | wc -c
# 32 (bytes) × 8 bits = 256 bits de entropia — imprevisível`}</CodeBlock>
      </Section>

      <Section title="GitHub Secrets vs Repository Variables" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Visível nos logs?', 'Pode ser lido por PR de fork?', 'Quando usar']}
          rows={[
            ['Secret', 'Não (mascarado)', 'Não (por padrão)', 'Senhas, tokens, chaves SSH, API keys privadas'],
            ['Variable', 'Sim', 'Sim', 'URLs públicas, flags de feature, nomes de ambiente'],
            ['Environment Secret', 'Não', 'Não', 'Secrets específicos de um ambiente (prod, staging)'],
          ]}
        />
        <CodeBlock lang="yaml">{`# No workflow, acessando Secrets e Variables:
jobs:
  deploy:
    environment: production   # necessário para Environment Secrets/Variables
    steps:
      - name: Usar secrets e variables
        env:
          # Secret — valor nunca aparece nos logs
          DB_PASSWORD: ${'$'}{{ secrets.DB_PASSWORD }}
          # Variable — aparece nos logs (OK para configs não-sensíveis)
          API_URL: ${'$'}{{ vars.NEXT_PUBLIC_API_BASE_URL }}
          # Secret de ambiente (só disponível no environment "production")
          PROD_KEY: ${'$'}{{ secrets.STRIPE_LIVE_KEY }}`}</CodeBlock>
      </Section>

      <Section title="Passando secrets para containers Docker" accent={ACCENT}>
        <CodeBlock lang="bash">{`# Opção 1: arquivo .env.production (NÃO commitado)
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# Opção 2: env_file no docker-compose.yml (mais explícito)
# No compose.yml:
# services:
#   api:
#     env_file:
#       - .env.production

# Opção 3: variáveis de ambiente direto (útil no CI com secrets do GitHub)
DB_PASSWORD=${'$'}{{ secrets.DB_PASSWORD }} \
JWT_SECRET=${'$'}{{ secrets.JWT_SECRET }} \
docker compose -f docker-compose.prod.yml up -d

# ─── No CI (GitHub Actions), crie o .env.production dinamicamente: ───
- name: Criar .env.production na VPS
  uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${'$'}{{ secrets.VPS_HOST }}
    username: ${'$'}{{ secrets.VPS_USER }}
    key: ${'$'}{{ secrets.VPS_SSH_KEY }}
    script: |
      cat > /opt/meu-app/.env.production << 'ENVEOF'
      DB_PASSWORD=${'$'}{{ secrets.DB_PASSWORD }}
      JWT_SECRET=${'$'}{{ secrets.JWT_SECRET }}
      STRIPE_SECRET_KEY=${'$'}{{ secrets.STRIPE_SECRET_KEY }}
      NODE_ENV=production
      ENVEOF
      chmod 600 /opt/meu-app/.env.production`}</CodeBlock>
        <Callout tone="warn">
          <strong>Permissões do arquivo .env:</strong> configure o arquivo com <InlineCode>chmod 600</InlineCode> (leitura/escrita
          apenas pelo owner). Sem isso, outros usuários do sistema podem ler as credenciais de produção.
        </Callout>
      </Section>

      <Section title="Separação de ambientes: dev vs prod" accent={ACCENT}>
        <CodeBlock lang="bash">{`# Estrutura de arquivos de configuração por ambiente:
.
├── .env.example           ← commitado — documenta as variáveis
├── .env.development       ← NÃO commitado — dev local com valores de sandbox
├── .env.staging           ← NÃO commitado — staging com dados de teste
└── .env.production        ← NÃO commitado — produção real (fica só na VPS)

# .env.development (local, valores de sandbox):
# DATABASE_URL=postgres://app:senhalocal@localhost:5432/meu_app_dev
# STRIPE_SECRET_KEY=sk_test_xxx   ← chave de SANDBOX do Stripe
# LOG_LEVEL=debug
# NODE_ENV=development

# .env.production (na VPS, valores reais):
# DATABASE_URL=postgres://app:SenhaForte123@db:5432/meu_app
# STRIPE_SECRET_KEY=sk_live_xxx   ← chave REAL do Stripe
# LOG_LEVEL=warn
# NODE_ENV=production`}</CodeBlock>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Stripe keys', v: 'sk_test_* para dev (não cobra de verdade), sk_live_* para prod (cobra de verdade). NUNCA misture.' },
            { k: 'Banco de dados', v: 'Banco local em dev (pode apagar e recriar à vontade), banco de produção em prod (dados reais de usuários).' },
            { k: 'Log level', v: 'debug em dev (verboso, ajuda a depurar), warn/error em prod (não polui logs com debug de produção).' },
            { k: 'CORS origins', v: 'localhost:3000 em dev, https://seudominio.com em prod. Misturar é um risco de segurança.' },
          ]}
        />
      </Section>

      <Section title="Rotação de secrets: quando e como" accent={ACCENT}>
        <p>
          Secrets devem ser rotacionados periodicamente e imediatamente em caso de suspeita de comprometimento:
        </p>
        <CodeBlock lang="bash">{`# Rotina de rotação de secrets (recomendado: a cada 90 dias)

# 1. Gerar novo secret
NEW_JWT_SECRET=$(openssl rand -hex 32)

# 2. Atualizar no GitHub Secrets (via CLI do GitHub ou painel web)
gh secret set JWT_SECRET --body "$NEW_JWT_SECRET"

# 3. Atualizar na VPS (o CI fará isso automaticamente no próximo deploy)
# Ou manualmente:
ssh deploy@203.0.113.10 "sed -i 's/JWT_SECRET=.*/JWT_SECRET=$NEW_JWT_SECRET/' /opt/meu-app/.env.production"
ssh deploy@203.0.113.10 "docker compose -f /opt/meu-app/docker-compose.prod.yml restart api"

# 4. Verificar que a aplicação continua funcionando após a rotação
curl https://api.seudominio.com/health`}</CodeBlock>
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Posso usar o mesmo secret em dev e prod?"
          a="Não. Mesmo que tecnicamente funcione, misturar ambientes cria riscos. Um bug em dev pode usar dados de prod, operações de teste podem afetar dados reais, e a rotação de um secret afetaria ambos os ambientes. Sempre separe."
        />
        <QAItem
          q="O que fazer se não sei quais variáveis o projeto precisa?"
          a="Procure por process.env., os.Getenv(), ou config.get() no código. Todo acesso a variável de ambiente está em algum desses padrões. Também verifique docker-compose.yml e arquivos de CI existentes."
        />
        <QAItem
          q="Vault, AWS Secrets Manager, 1Password Secrets Automation — preciso de algo assim?"
          a="Para projetos pequenos e MVPs, GitHub Secrets + .env.production na VPS é suficiente. Para equipes maiores, múltiplos serviços e compliance, ferramentas como HashiCorp Vault ou AWS Secrets Manager fazem sentido — auditoria de acesso, rotação automática, controle granular. Comece simples e evolua conforme necessário."
        />
      </Section>

      <Callout tone="success">
        <strong>Secrets bem gerenciados.</strong> Nunca comite credenciais, gere com openssl rand, armazene no GitHub Secrets
        e no .env.production (chmod 600) na VPS, passe para containers via env_file, e separe dev de prod com arquivos
        diferentes. O próximo módulo fecha a trilha com o deploy do frontend estático via FTP.
      </Callout>
    </div>
  );
}
