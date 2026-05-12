import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, DecisionBox, StackFlow, AnnotatedFormula } from '@/components/article/primitives';

export const metadata = getModuleMetadata('log-auditoria-imutavel');

const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual artigo da LGPD obriga registro das operações de tratamento?',
    options: [
      'Art. 18',
      'Art. 37 — o controlador e o operador devem manter registro das operações de tratamento de dados pessoais que realizarem, especialmente quando baseado em legítimo interesse. ANPD pode requisitar a qualquer tempo',
      'Art. 9º',
      'Art. 33',
    ],
    correct: 1,
    explanation:
      'Art. 37 é a base do audit log. Combine com Art. 38 (DPIA) e Art. 46 (segurança). Em incidente, ausência de log credível costuma agravar a sanção (Res. CD/ANPD 4/2023 — circunstâncias atenuantes vs agravantes).',
  },
  {
    question: 'O que diferencia "log de aplicação" de "audit log"?',
    options: [
      'Nada, é o mesmo',
      'Audit log é append-only, autenticado e imutável: registra QUEM (subject), FEZ O QUÊ (action), EM QUAL DADO (resource), QUANDO (timestamp), DE ONDE (IP/agent), POR QUE (purpose/legal_basis), e o resultado. Não pode ser editado nem deletado. Log de aplicação é debug/operacional, pode rotacionar e perder',
      'Audit log é mais curto',
      'Logs de auditoria são opcionais',
    ],
    correct: 1,
    explanation:
      'Estrutura WHO/WHAT/WHEN/WHERE/WHY é o consenso (ver NIST SP 800-92, ISO/IEC 27002 §8.15). Imutabilidade técnica vem de S3 Object Lock, write-once tabelas, hash chain ou ledger DBs (QLDB, ImmuDB).',
  },
  {
    question: 'O que é hash chain (estilo blockchain leve) e por que aplicar em audit log?',
    options: [
      'É blockchain pra pagamento',
      'Cada entrada armazena hash = SHA-256(prev_hash || entry). Se uma entrada antiga for alterada, todas as subsequentes invalidam. Detecção de tampering O(n) em verificação, O(1) na escrita. ImmuDB, AWS QLDB, hyperledger usam variantes. Em Postgres dá pra implementar com trigger e coluna prev_hash',
      'É só backup',
      'Substitui criptografia',
    ],
    correct: 1,
    explanation:
      'Não confunda com blockchain pública (PoW, consenso distribuído). Hash chain é estrutura de dados — Merkle log também (Certificate Transparency usa). AWS QLDB usa journal Merkle. Simples de implementar e auditar.',
  },
  {
    question: 'S3 Object Lock — qual modo escolher para audit log de LGPD?',
    options: [
      'Governance — admin pode remover',
      'Compliance — nem o root account remove até expirar a retention. Combine com Bucket Versioning, Lifecycle policy e log de bucket access. Modo Governance permite remoção com permissão especial (bom para dev). Compliance é o que ANPD/SOX/HIPAA esperam ver',
      'Não importa',
      'Sempre Legal Hold sozinho',
    ],
    correct: 1,
    explanation:
      'Compliance mode + retention de 6 anos é padrão (Lei 12.965 + CTN). Legal Hold é flag independente para preservar em litígio. AWS publicou whitepaper "S3 Object Lock and SEC 17a-4(f)" — compliance mode atende SEC, FINRA, equivalente para ANPD.',
  },
  {
    question: 'Qual problema clássico ocorre com audit log em Postgres sem trigger append-only?',
    options: [
      'Nenhum',
      'DBA com permissão de UPDATE/DELETE pode alterar o log e ocultar trace. Solução: tabela com REVOKE UPDATE, DELETE FROM PUBLIC; usar SECURITY DEFINER function para INSERT; trigger BEFORE UPDATE/DELETE que RAISE EXCEPTION; replicação para WORM externo (S3 Object Lock)',
      'Postgres não suporta logs',
      'Performance',
    ],
    correct: 1,
    explanation:
      'Insider threat é o maior risco em audit log. Defesa em profundidade: revogar permissões DML + trigger antifraude + replicação para storage imutável externo + verificação contínua de hash chain.',
  },
  {
    question: 'Audit log deve incluir PII?',
    options: [
      'Sim, todo conteúdo',
      'NÃO no payload — guarde IDENTIFIERS (user_id, record_id), CHANGED_FIELDS (lista de campos), mas pseudoanonimize valores. Se precisa do valor antigo para audit, criptografe com chave separada. Audit log é alvo atrativo, e PII no log multiplica blast radius do vazamento',
      'Apenas IPs',
      'Tanto faz',
    ],
    correct: 1,
    explanation:
      'Princípio: o log deve provar "operação X aconteceu" sem reproduzir o dado pessoal completo. NIST SP 800-92 e ISO 27002 §8.15 enfatizam minimização também no log. Para reconstrução de incidente, mantenha índice → cofre criptografado separado.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="log-auditoria-imutavel"
      title="Log de auditoria imutável: append-only, hash chain, WORM"
      icon="📋"
      xp={60}
      readTime={12}
      trailName="Privacy & Compliance Engineering"
      trailColor={accent}
      nextSlug="right-to-erasure-tecnico"
      nextTitle="Right to erasure no código: backups, replicas, search index"
      quiz={quiz}
    >
      <div className="flex flex-col gap-8 text-sm leading-7">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Art. 37 LGPD: controlador e operador <strong>devem manter registro</strong> das operações. Em fiscalização, é
          o documento mais pedido. Em incidente, é a única prova de cadeia de eventos. Audit log é{' '}
          <strong>append-only, autenticado, imutável e auditável</strong> — três garantias técnicas, não três
          intenções.
        </p>

        <Section title="O que registrar — schema canônico" accent={accent}>
          <KeyValue
            accent={accent}
            items={[
              { k: 'event_id', v: 'UUID v7 (ordenado no tempo) — único, ordenável' },
              { k: 'timestamp', v: 'ISO 8601 UTC com precisão microssegundo' },
              { k: 'actor', v: '{ type: user|service|cron, id, ip, session_id, user_agent }' },
              { k: 'action', v: 'enum verb (read, write, update, delete, export, login, consent_grant, consent_revoke)' },
              { k: 'resource', v: '{ type: user_profile|transaction|kyc_doc, id, owner_user_id }' },
              { k: 'changes', v: 'lista de campos alterados (nomes); valor antigo/novo criptografado separado' },
              { k: 'context', v: '{ purpose, legal_basis, dpia_ref, request_id, correlation_id }' },
              { k: 'result', v: 'success | denied | error + reason_code' },
              { k: 'prev_hash', v: 'SHA-256 do registro anterior — hash chain' },
              { k: 'self_hash', v: 'SHA-256 de (prev_hash || canonical_json(payload))' },
              { k: 'signature', v: 'Opcional — assinatura HSM/KMS sobre self_hash; força não-repúdio externo' },
            ]}
          />
          <CodeBlock lang="sql" filename="migrations/audit_log.sql">
{`CREATE TABLE audit_log (
  event_id        UUID PRIMARY KEY,
  ts              TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  actor           JSONB NOT NULL,
  action          TEXT NOT NULL,
  resource        JSONB NOT NULL,
  changes         TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  context         JSONB NOT NULL,
  result          TEXT NOT NULL,
  prev_hash       BYTEA NOT NULL,
  self_hash       BYTEA NOT NULL,
  signature       BYTEA
);

-- Imutabilidade no DB: revoga DML; INSERT só via função SECURITY DEFINER
REVOKE INSERT, UPDATE, DELETE ON audit_log FROM PUBLIC;

-- Trigger antifraude — nega UPDATE/DELETE mesmo de roles privilegiadas
CREATE OR REPLACE FUNCTION audit_log_block_mutation() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only (event_id=%)', OLD.event_id;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_no_update BEFORE UPDATE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_log_block_mutation();
CREATE TRIGGER audit_log_no_delete BEFORE DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_log_block_mutation();

CREATE INDEX idx_audit_actor ON audit_log USING GIN (actor jsonb_path_ops);
CREATE INDEX idx_audit_resource ON audit_log USING GIN (resource jsonb_path_ops);
CREATE INDEX idx_audit_ts ON audit_log (ts);`}
          </CodeBlock>
        </Section>

        <Section title="Hash chain — detecção de tampering em O(n)" accent={accent}>
          <AnnotatedFormula
            accent={accent}
            title="Hash chain de logs"
            formula="self_hash_i = SHA-256( prev_hash_{i-1} || canonical_json(entry_i) )"
            parts={[
              { text: 'entry_i', annotation: 'Registro i', highlight: true },
              { text: 'prev_hash', annotation: 'self_hash do anterior; primeiro = zero' },
              { text: 'canonical_json', annotation: 'JSON ordenado, sem espaços — determinístico' },
              { text: 'SHA-256', annotation: '32 bytes; resistente a colisão' },
            ]}
          />
          <CodeBlock lang="typescript" filename="lib/audit.ts">
{`import { createHash } from 'crypto';
import { canonicalize } from 'json-canonicalize'; // RFC 8785 JCS

export type AuditEntry = {
  event_id: string;
  ts: string;
  actor: object; action: string; resource: object;
  changes: string[]; context: object; result: string;
};

export function hashEntry(prevHash: Buffer, entry: AuditEntry): Buffer {
  const payload = canonicalize(entry);
  return createHash('sha256').update(prevHash).update(payload).digest();
}

export async function appendAudit(db: Pool, entry: AuditEntry) {
  // SELECT FOR UPDATE serializa appends (1 writer); para alta vazão, particione por dia
  const { rows } = await db.query<{ self_hash: Buffer }>(
    'SELECT self_hash FROM audit_log ORDER BY ts DESC LIMIT 1 FOR UPDATE'
  );
  const prev = rows[0]?.self_hash ?? Buffer.alloc(32);
  const selfHash = hashEntry(prev, entry);
  await db.query(
    \`INSERT INTO audit_log (event_id, ts, actor, action, resource, changes, context, result, prev_hash, self_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)\`,
    [entry.event_id, entry.ts, entry.actor, entry.action, entry.resource,
     entry.changes, entry.context, entry.result, prev, selfHash]
  );
}

export async function verifyChain(db: Pool, fromTs?: string): Promise<{ ok: boolean; brokenAt?: string }> {
  const cur = db.query(
    \`DECLARE c CURSOR FOR SELECT * FROM audit_log WHERE ts >= COALESCE($1, '-infinity') ORDER BY ts\`,
    [fromTs]
  );
  let prev = Buffer.alloc(32);
  for await (const row of cur as unknown as AsyncIterable<{ event_id: string; self_hash: Buffer; [k: string]: unknown }>) {
    const expected = hashEntry(prev, row as unknown as AuditEntry);
    if (!expected.equals(row.self_hash)) return { ok: false, brokenAt: row.event_id };
    prev = row.self_hash;
  }
  return { ok: true };
}`}
          </CodeBlock>
        </Section>

        <Section title="WORM externo — S3 Object Lock" accent={accent}>
          <p>
            Hash chain detecta tampering, mas não impede deleção física. Replique o log para storage WORM (Write Once
            Read Many) em outra conta/região. S3 Object Lock no modo <strong>Compliance</strong> impede deleção até a
            retention expirar — nem o root account remove.
          </p>
          <FlowDiagram
            accent={accent}
            title="Pipeline de audit log → WORM"
            orientation="vertical"
            steps={[
              { icon: '🧩', label: 'App grava entry', desc: 'INSERT em audit_log (Postgres) com hash chain' },
              { icon: '🛰️', label: 'CDC stream', desc: 'Debezium → Kafka topic audit.append (idempotente por event_id)' },
              { icon: '📦', label: 'Sink S3', desc: 'Particionado por dia: s3://audit/prod/dt=2026-05-10/part-*.parquet' },
              { icon: '🔒', label: 'Object Lock Compliance', desc: 'Retention 6 anos. Account dedicado (não root). MFA Delete ativo' },
              { icon: '🛡️', label: 'Verificação diária', desc: 'Job lê do S3, recalcula hash chain, alerta se mismatch' },
            ]}
          />
          <CodeBlock lang="bash" filename="setup-object-lock.sh">
{`# Bucket dedicado para audit, Object Lock habilitado na criação (irreversível)
aws s3api create-bucket --bucket acme-audit-prod-sa-east-1 \\
  --create-bucket-configuration LocationConstraint=sa-east-1 \\
  --object-lock-enabled-for-bucket

aws s3api put-object-lock-configuration --bucket acme-audit-prod-sa-east-1 \\
  --object-lock-configuration '{
    "ObjectLockEnabled": "Enabled",
    "Rule": {
      "DefaultRetention": { "Mode": "COMPLIANCE", "Years": 6 }
    }
  }'

# Bucket Policy: nega DeleteObjectVersion para todos exceto role específico
aws s3api put-public-access-block --bucket acme-audit-prod-sa-east-1 \\
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

aws s3api put-bucket-versioning --bucket acme-audit-prod-sa-east-1 \\
  --versioning-configuration Status=Enabled,MFADelete=Enabled \\
  --mfa "arn:aws:iam::ACCOUNT:mfa/audit-admin 123456"`}
          </CodeBlock>
        </Section>

        <Section title="Alternativas: ledger databases" accent={accent}>
          <ComparisonTable
            accent={accent}
            headers={['Solução', 'Modelo', 'Trade-off', 'Quando faz sentido']}
            rows={[
              ['Postgres + hash chain + S3 Lock', 'DIY', 'Controle total, código simples, dependência baixa', 'Maioria dos casos LGPD'],
              ['AWS QLDB', 'Managed ledger (Merkle)', 'Verificação criptográfica nativa, query SQL-like (PartiQL)', 'Audit compliance heavy (finanças)'],
              ['AWS CloudTrail Lake', 'Managed query layer', 'Apenas eventos AWS; agora aceita custom events', 'Ambiente AWS-centric'],
              ['ImmuDB', 'Open source Merkle ledger', 'API K/V e SQL, prova criptográfica, self-host', 'Você precisa rodar, mas quer ledger pronto'],
              ['Azure Confidential Ledger', 'Managed, com SGX', 'Hardware attestation', 'Compliance regulado pesado'],
              ['Hyperledger Fabric', 'Blockchain consortium', 'Pesado, multi-org', 'Apenas se múltiplas entidades co-auditam'],
            ]}
          />
        </Section>

        <Section title="O que NÃO logar — minimização também aqui" accent={accent}>
          <Callout tone="warn" icon="⚠️">
            Audit log é alvo de alta atratividade — atacante quer apagar trace. Minimize o blast radius caso
            comprometido.
          </Callout>
          <KeyValue
            accent={accent}
            items={[
              { k: 'Não logar', v: 'Senha (mesmo hash), token, cookie, número de cartão, CVV, conteúdo de mensagens privadas, biometria' },
              { k: 'Logar referência', v: 'Em vez de "old_email=joao@x.com", logue "field=email, changed=true"; cofre auxiliar guarda valor cifrado se precisar' },
              { k: 'PII pseudoanonimizada', v: 'Use user_id (UUID), não CPF/email no payload do log' },
              { k: 'Retenção', v: '6 anos é típico (Lei 12.965 + ANPD); documente no DPIA. Após, deletar — apesar de WORM, retention expira' },
            ]}
          />
        </Section>

        <Section title="AWS CloudTrail + Lake — para infra" accent={accent}>
          <p>
            Para eventos de infraestrutura (RDS snapshot, IAM AssumeRole, S3 GetObject de PII), use{' '}
            <strong>CloudTrail Lake</strong>. É audit log gerenciado pela AWS, com retenção até 10 anos, SQL queryable e
            integrity validation built-in.
          </p>
          <StackFlow
            accent={accent}
            title="Camadas de audit log"
            items={[
              { icon: '🧩', label: 'App-level audit', sub: 'L7', detail: 'Postgres audit_log com hash chain — quem leu PII X, quem revogou consent', connector: 'CDC' },
              { icon: '🛰️', label: 'Infra audit', sub: 'AWS CloudTrail Lake', detail: 'API calls AWS — quem assumiu role, leu secret, mudou IAM', connector: 'Convergir' },
              { icon: '🌐', label: 'Network audit', sub: 'VPC Flow Logs + WAF logs', detail: 'Fluxo de pacotes, requests bloqueados; útil em incidente', connector: 'Sink' },
              { icon: '📦', label: 'WORM externo', sub: 'S3 Object Lock', detail: 'Sink final imutável; conta separada; retention 6+ anos' },
              { icon: '🔎', label: 'Query / SIEM', sub: 'Athena, OpenSearch', detail: 'Investigação forense; integra com Datadog Security, Splunk' },
            ]}
          />
        </Section>

        <Section title="Decisão: tabela Postgres vs QLDB vs CloudTrail Lake" accent={accent}>
          <DecisionBox
            scenario="Startup BR, foco LGPD, stack Postgres + AWS, ainda sem requisitos de auditoria externa pesada"
            winner="Postgres append-only + hash chain + sink S3 Object Lock"
            winnerColor={accent}
            why="Custo baixo, controle total, código simples e auditável por você mesmo. Hash chain dá tamper detection, S3 Object Lock dá WORM. ANPD aceita. Se virar banco/fintech sob BCB, migra para QLDB ou amplia. Não comece com complexidade que pode não precisar."
            alternatives={[
              { name: 'AWS QLDB', when: 'Setor financeiro/saúde com exigência regulatória explícita de ledger criptográfico' },
              { name: 'CloudTrail Lake', when: 'Foco em audit de infra; ótimo complemento, não substituto do app-level' },
              { name: 'Apenas logs em CloudWatch', when: 'Insuficiente — não é imutável, não há prova de integridade' },
            ]}
          />
        </Section>

        <Section title="Verificação periódica — sem isso, audit log é teatro" accent={accent}>
          <CodeBlock lang="bash" filename="verify-audit.sh">
{`#!/usr/bin/env bash
# Roda diariamente via cron. Falha = alerta P1 (potential tampering)
set -euo pipefail
RESULT=$(psql "$DB_URL" -At -c "SELECT * FROM verify_audit_chain();")
if [ "$RESULT" != "ok" ]; then
  echo "AUDIT CHAIN BROKEN: $RESULT" >&2
  # Notifica PagerDuty
  curl -X POST -H "Authorization: Token token=$PD_TOKEN" \\
    -d "{\\"event_action\\":\\"trigger\\",\\"payload\\":{\\"summary\\":\\"Audit hash chain broken: $RESULT\\"}}" \\
    https://events.pagerduty.com/v2/enqueue
  exit 1
fi
# Verifica sink S3 — checksum recalculado
aws s3 sync s3://acme-audit-prod-sa-east-1/dt=$(date -d yesterday +%F)/ ./tmp/audit/
python verify_s3_chain.py ./tmp/audit/`}
          </CodeBlock>
        </Section>

        <Section title="Recursos canônicos" accent={accent}>
          <KeyValue
            accent={accent}
            items={[
              { k: 'NIST SP 800-92', v: 'Guide to Computer Security Log Management' },
              { k: 'ISO/IEC 27002:2022 §8.15', v: 'Logging' },
              { k: 'RFC 8785', v: 'JSON Canonicalization Scheme (JCS) — base para hash determinístico' },
              { k: 'S3 Object Lock', v: 'docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html' },
              { k: 'AWS QLDB', v: 'aws.amazon.com/qldb' },
              { k: 'ImmuDB', v: 'codenotary.com/technologies/immudb' },
              { k: 'Certificate Transparency (RFC 6962)', v: 'Merkle log distribuído — referência conceitual' },
            ]}
          />
        </Section>
      </div>
    </ModuleLayout>
  );
}
