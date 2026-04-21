import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('key-management-kms-vault');

const accent = '#dc2626';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é envelope encryption no AWS KMS e por que dominou a indústria?',
    options: [
      'Tudo é cifrado pela CMK diretamente',
      'CMK (Customer Master Key) fica no HSM do KMS e nunca sai. Para cifrar objeto, gera-se Data Key efêmero, cifra-se o objeto com Data Key em AES-GCM, e armazena-se Data Key cifrado pela CMK junto. Rotaciona-se CMK sem re-cifrar terabytes',
      'CMK cifra envelopes físicos',
      'Não é real',
    ],
    correct: 1,
    explanation: 'Envelope encryption permite escalar: um GenerateDataKey retorna par (plaintext, ciphertext) do Data Key; app cifra dados com plaintext em memória, descarta plaintext, guarda ciphertext junto com os dados. Rotação de CMK apenas re-envelopa os Data Keys pequenos, não os gigabytes de dados. S3 SSE-KMS, RDS, EBS, Secrets Manager todos usam esse padrão. AWS Encryption SDK expõe a API pronta para apps custom.',
  },
  {
    question: 'Qual a diferença fundamental entre AWS KMS e HashiCorp Vault Transit?',
    options: [
      'São a mesma coisa com nomes diferentes',
      'KMS é managed (FIPS 140-2 Level 3 HSM), multi-tenant, opera com chave policy+IAM AWS. Vault Transit é self-hosted (você roda), ofereça crypto-as-a-service para qualquer ambiente (on-prem, multi-cloud), com policy ACL própria. Transit não armazena dados, só cifra/decifra o que recebe',
      'KMS é gratuito',
      'Vault só cifra texto',
    ],
    correct: 1,
    explanation: 'Escolha depende de governança. AWS-only: KMS é default natural, integra com 200+ serviços AWS sem código. Multi-cloud/on-prem: Vault Transit dá abstração única. Regulated industries sem tolerância para managed HSM: HSM próprio (CloudHSM, Thales, YubiHSM) controlado pela empresa. Vault também tem PKI engine (emite certs ACME-like internos) e database secrets (credenciais dinâmicas).',
  },
  {
    question: 'Qual estratégia de rotation é padrão em 2026?',
    options: [
      'Nunca rotacionar',
      'Automatic rotation anual para CMK em KMS (gera nova key material, mantém antigas para decrypt). Re-envelope de data keys on-read quando possível. Secrets de app (DB passwords): rotação automática via Secrets Manager ou Vault dynamic secrets (credencial por request, TTL curto)',
      'Rotacionar a cada commit',
      'Só rotacionar quando vazar',
    ],
    correct: 1,
    explanation: 'AWS KMS faz rotation de material interno transparente (a ARN da CMK continua igual). Dynamic secrets do Vault são o estado da arte: em vez de senha DB fixa, app pede credencial por request, Vault cria usuário PostgreSQL temporário (lease 1h), revoga no expiry. Zero senha longa em .env. Para chaves de assinatura JWT, rotacione com overlap (novo + antigo aceitos) via JWKS endpoint. Regra: chaves devem ter ciclo de vida, não existir para sempre.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="key-management-kms-vault"
      title="Key management: KMS, Vault, HSM"
      icon="🗄️"
      xp={60}
      readTime={14}
      trailName="Cryptography Applied"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="O problema que nunca some" accent={accent}>
        <p>
          Você pode escolher AES-256-GCM, Ed25519 e TLS 1.3 corretamente e ainda vazar tudo se o segredo da master key estiver em git, em .env commitado, em variável Jenkins ou em memória de processo que crashou e gerou core dump. Key management é o elo fraco em 90% dos breaches reais.
        </p>
        <Callout tone="danger" icon="🚨">
          Never roll your own crypto, e definitivamente never roll your own key management. HSM, KMS e Vault existem porque armazenar/distribuir/rotacionar chaves com segurança é um problema operacional imenso.
        </Callout>
      </Section>

      <Section title="AWS KMS na prática" accent={accent}>
        <CodeBlock lang="python">{`# boto3 - envelope encryption manual com AWS Encryption SDK
import boto3, aws_encryption_sdk
from aws_encryption_sdk import CommitmentPolicy, StrictAwsKmsMasterKeyProvider

client = aws_encryption_sdk.EncryptionSDKClient(
    commitment_policy=CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT,
)

kms_kwargs = dict(key_ids=["arn:aws:kms:us-east-1:123:key/abcd-efgh"])
key_provider = StrictAwsKmsMasterKeyProvider(**kms_kwargs)

plaintext = b"numero cartao: 4111 1111 1111 1111"
ciphertext, header = client.encrypt(
    source=plaintext,
    key_provider=key_provider,
    encryption_context={"app": "billing", "tenant": "acme"},
)

# Para decifrar, ambient deve ter IAM permitindo kms:Decrypt
decrypted, _ = client.decrypt(source=ciphertext, key_provider=key_provider)
assert decrypted == plaintext`}</CodeBlock>
        <CodeBlock lang="bash">{`# CLI direto - gerar Data Key, cifrar arquivo localmente
aws kms generate-data-key \\
  --key-id alias/ffv-main \\
  --key-spec AES_256 \\
  --encryption-context app=billing \\
  --output json > dk.json

# plaintext (base64) cifra dados; armazene apenas ciphertext do data key
PT=$(jq -r .Plaintext dk.json | base64 -d)
CT=$(jq -r .CiphertextBlob dk.json)

# Rotation automatica da CMK
aws kms enable-key-rotation --key-id alias/ffv-main`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Encryption context é autenticated-associated-data (AAD) do AEAD: não cifra, mas precisa bater no decrypt. Use para bind lógico (tenant, purpose) — se alguém move ciphertext para outro contexto, decrypt falha.
        </Callout>
      </Section>

      <Section title="HashiCorp Vault para multi-cloud" accent={accent}>
        <CodeBlock lang="bash">{`# Habilitar transit engine (crypto as a service)
vault secrets enable transit

# Criar chave de signing JWT
vault write -f transit/keys/jwt-signer type=ed25519

# App assina sem nunca ver a chave privada
vault write transit/sign/jwt-signer \\
  input=$(echo -n '{"sub":"user123"}' | base64)

# Dynamic database credentials (lease 1h, Vault cria e destroi user)
vault write database/config/postgres-ffv \\
  plugin_name=postgresql-database-plugin \\
  allowed_roles=app-readonly \\
  connection_url="postgresql://{{username}}:{{password}}@db.internal:5432/ffv" \\
  username=vault_admin password=$ADMIN_PASS

vault write database/roles/app-readonly \\
  db_name=postgres-ffv \\
  creation_statements="CREATE ROLE \\"{{name}}\\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT ON ALL TABLES IN SCHEMA public TO \\"{{name}}\\";" \\
  default_ttl=1h max_ttl=24h

# App pede credencial fresca por request
vault read database/creds/app-readonly
# -> username=v-app-readonly-xYz...  password=A1B2C3...  lease_duration=1h`}</CodeBlock>
      </Section>

      <Section title="Quando HSM dedicado vale a pena" accent={accent}>
        <p>
          CloudHSM (AWS) ou YubiHSM2 (on-prem) são cartas finais quando: (a) regulação exige FIPS 140-2 Level 3 com controle single-tenant; (b) você é CA raiz e não pode terceirizar; (c) signing de firmware em escala de OS vendor. Custo e complexidade operacional são altos — para 99% dos apps, KMS managed resolve.
        </p>
        <CodeBlock lang="yaml">{`# Matriz de decisao 2026
app_aws_only_sem_compliance_especial:    KMS (default)
app_multi_cloud_ou_on_prem:              Vault Transit
secrets_app_rotacao_dinamica:            Vault dynamic secrets ou AWS Secrets Manager
assinatura_firmware_ou_CA_raiz:          HSM dedicado (CloudHSM / Thales / YubiHSM)
dev_local_nao_producao:                  sops + age, dotenv-vault (nunca .env em git)
rotacao_jwt_signing_key:                 JWKS endpoint com overlap kid (n-1 e n)`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Key ceremony: emissão de root CA ou master HSM deve ser gravada em vídeo, com quorum M-of-N (Shamir Secret Sharing), testemunhas e auditor. Parece teatro — não é. Quando der merda, a gravação prova que o processo foi seguido.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
