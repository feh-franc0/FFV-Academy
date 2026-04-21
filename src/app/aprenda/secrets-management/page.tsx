import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('secrets-management');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que "secret em .env commitado" é pior que sem segredo?',
    options: [
      'Não é pior',
      'Porque vira histórico permanente no git — remover depois é impossível sem rewrite (e cópias clonadas não mudam). Vaza uma vez, vazou pra sempre. GitHub Secret Scanning detecta milhões por ano',
      'Por ser lento',
      'Por causa do encoding',
    ],
    correct: 1,
    explanation: '.env no git = ruína. git filter-branch não apaga de forks/clones. Assume que vazou e rotaciona TUDO. Defesa: .env.example com placeholders; secret real em cofre (Vault/SOPS/AWS SM); pre-commit hook (gitleaks) pra bloquear.',
  },
  {
    question: 'O que são "dynamic secrets" do Vault?',
    options: [
      'Secrets que mudam de valor aleatoriamente',
      'Secrets gerados ON-DEMAND com TTL curto (ex: DB credentials que expiram em 1h). Se vazam, impacto limitado. Revogação global automática',
      'Secrets animados',
      'Variáveis de ambiente dinâmicas',
    ],
    correct: 1,
    explanation: 'Dynamic secrets = Vault gera DB user/password/IAM role sob demanda com lease. Expira automaticamente. Aplicação pede a cada deploy/restart. Se vazar, dura minutos. Game-changer pra security em escala. Alternativa: AWS Secrets Manager + rotation.',
  },
  {
    question: 'O que SOPS resolve em GitOps?',
    options: [
      'Nada',
      'Permite armazenar secrets CRIPTOGRAFADOS NO GIT (via AWS KMS, GCP KMS, age, PGP) — diff-friendly, revisável em PR, mas só quem tem acesso à chave descriptografa',
      'É apenas pra Kubernetes',
      'Gera secrets aleatórios',
    ],
    correct: 1,
    explanation: 'SOPS (Mozilla) criptografa só os VALORES do YAML/JSON, mantendo estrutura pra git diff. Chaves em KMS/age/PGP. CD pipeline descriptografa on apply. Simples, git-native. Alternativa a Vault pra times pequenos/médios.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="secrets-management"
      title="Secrets management: Vault, SOPS e AWS Secrets Manager"
      icon="🗝️"
      xp={55}
      readTime={12}
      trailName="Security Engineering"
      trailColor={accent}
      nextSlug="supply-chain-security"
      nextTitle="Supply chain: SBOM, sigstore e dependency confusion"
      quiz={quiz}
    >
      <Section title="Ferramentas comparadas" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Tool', 'Quando usar', 'Pros', 'Contras']}
          rows={[
            ['HashiCorp Vault', 'Empresa, multi-cloud', 'Dynamic secrets, auditing, policies', 'Ops overhead'],
            ['AWS Secrets Manager', 'AWS-heavy', 'Rotation automática, IAM integration', '$0.40/secret, AWS-only'],
            ['SOPS + age/KMS', 'GitOps, times pequenos', 'Git-native, simple', 'Sem rotation automática'],
            ['Doppler', 'Times SaaS pequenos', 'DX ótima, multi-env', 'Vendor lock-in, custo em escala'],
            ['1Password Connect', 'Dev local + CI', 'Já no fluxo do time', 'Limite em produção'],
            ['Kubernetes Secrets', 'NÃO (base64 ≠ encrypted)', '—', 'Precisa SealedSecrets ou SOPS por cima'],
          ]}
        />
      </Section>

      <Section title="Dynamic secrets com Vault" accent={accent}>
        <CodeBlock lang="bash">{`# Setup Vault DB engine (uma vez)
vault secrets enable database
vault write database/config/my-postgres \\
  plugin_name=postgresql-database-plugin \\
  connection_url="postgresql://admin:pass@db:5432/" \\
  allowed_roles="app-readonly,app-readwrite"

vault write database/roles/app-readonly \\
  db_name=my-postgres \\
  creation_statements="CREATE USER \\"{{name}}\\" WITH PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT ON ALL TABLES IN SCHEMA public TO \\"{{name}}\\";" \\
  default_ttl="1h" \\
  max_ttl="24h"

# App pede credentials on demand
vault read database/creds/app-readonly
# → { username: "v-root-app-rd-...", password: "...", lease_duration: 3600 }`}</CodeBlock>
      </Section>

      <Section title="SOPS em 3 comandos" accent={accent}>
        <CodeBlock lang="bash">{`# .sops.yaml — define quais arquivos + qual chave
creation_rules:
  - path_regex: secrets/.*\\.yaml
    age: age1abcd...  # sua public key age

# Criptografar arquivo com values sensíveis
sops -e -i secrets/prod.yaml

# O arquivo fica com VALUES criptografados mas KEYS legíveis:
# database_password: ENC[AES256_GCM,data:...,iv:...,tag:...,type:str]
# Commit no git — tudo bem.

# Descriptografar na máquina autorizada (tem age private key)
sops -d secrets/prod.yaml > .env

# CD pipeline (com chave KMS/age): sops exec-env`}</CodeBlock>
      </Section>

      <Section title="AWS Secrets Manager com rotation" accent={accent}>
        <CodeBlock lang="typescript">{`import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'us-east-1' });

async function getDbCredentials() {
  const res = await client.send(new GetSecretValueCommand({ SecretId: 'prod/db' }));
  return JSON.parse(res.SecretString!);
}

// Lambda extension: cache local (~/opt/secrets-manager) reduz latency + cost
// Rotation: função Lambda rotaciona credencial a cada N dias, atualiza secret`}</CodeBlock>
      </Section>

      <Section title="Anti-padrões" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>Secret em docker image</strong>: layers são cacheadas; dá pra extrair com <InlineCode>docker history</InlineCode>. Use build args sem persistir ou BuildKit secrets.</li>
          <li><strong>Secret em CI logs</strong>: <InlineCode>echo $TOKEN</InlineCode> num script vaza em log público de PR. Use <InlineCode>::add-mask::</InlineCode> no Actions.</li>
          <li><strong>.env versionado</strong>: proibido. <InlineCode>.env.example</InlineCode> com placeholders OK.</li>
          <li><strong>Base64 ≠ encryption</strong>: Kubernetes Secrets default é só base64. Use SOPS ou SealedSecrets por cima.</li>
          <li><strong>Tokens sem expiração</strong>: GitHub PAT, API keys custom — sempre com TTL e rotation.</li>
        </ul>
        <Callout tone="warn" icon="⚠️">
          Install <InlineCode>gitleaks</InlineCode> ou <InlineCode>trufflehog</InlineCode> como pre-commit hook. Bloqueia secret vazando antes do push.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
