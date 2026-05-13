import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, DecisionBox, NodeGraph, StackFlow } from '@/components/article/primitives';

export const metadata = getModuleMetadata('right-to-erasure-tecnico');

const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'O Art. 18 V LGPD garante ao titular qual direito específico sobre os próprios dados?',
    options: [
      'Apenas anonimização',
      'Eliminação dos dados pessoais tratados com o consentimento do titular — também aplica-se quando os dados forem desnecessários, excessivos ou tratados em desconformidade. Não é absoluto: dados podem ser mantidos para cumprimento de obrigação legal/regulatória (Art. 16) ou exercício regular de direitos',
      'Direito ao código-fonte',
      'Devolução em papel',
    ],
    correct: 1,
    explanation:
      'Art. 18 V (eliminação por revogação de consentimento) e Art. 16 (eliminação de dados desnecessários/excessivos). O Art. 16 também lista hipóteses em que a manutenção é autorizada (obrigação legal, estudo, transferência a terceiro, uso exclusivo do controlador desde que anonimizado).',
  },
  {
    question: 'Qual é o problema técnico mais comum ao implementar right to erasure?',
    options: [
      'Custo de CPU',
      'Fan-out de cópias: PII existe no RDS, em réplicas, em ElasticSearch, em backups, em data warehouse, em ML training set, em Kafka topics, em S3 (arquivos de export), em terceiros (processadores). Deletar do "principal" é o fácil; sincronizar a deleção pela topologia é o difícil',
      'Falta de SDK',
      'O Postgres não deleta',
    ],
    correct: 1,
    explanation:
      'Modelagem distribuída quase sempre quebra o erasure. Mantenha um "PII map" do DPIA atualizado. Cada nova feature que copia PII para outro lugar precisa criar handler de deleção naquele lugar.',
  },
  {
    question: 'Soft delete vs hard delete: qual escolher?',
    options: [
      'Sempre soft',
      'Soft delete (deleted_at) é útil para audit e undo, mas NÃO atende right to erasure se o dado fica acessível. Padrão: soft delete temporário (7-30 dias para undo) + tombstone + hard delete agendado + propagação para search/cache/DW. Soft delete ETERNO viola o direito',
      'Hard delete sempre',
      'Tanto faz',
    ],
    correct: 1,
    explanation:
      'Soft delete sem TTL é a violação mais comum. ANPD não aceita "o dado ainda está lá mas com uma flag". Defina janela curta (ex: 14 dias undo) e depois execute hard delete em todas as cópias.',
  },
  {
    question: 'Anonimização vs pseudoanonimização — qual atende LGPD para reter dados pós-erasure?',
    options: [
      'Pseudoanonimização',
      'Anonimização irreversível (Art. 5º XI) — dado que não pode ser associado, direta ou indiretamente, ao titular considerando o estado da arte. Após anonimização, o dado sai do escopo da LGPD (Art. 12). Pseudoanonimização (hash, tokenização) mantém possibilidade de reidentificação → continua sendo dado pessoal',
      'Hash MD5',
      'Soft delete',
    ],
    correct: 1,
    explanation:
      'Anonimização requer k-anonimidade (Sweeney 2002), l-diversity, ou Differential Privacy. Tokenização com vault reverso = pseudoanonimização. Em datasets de treino de ML, considerem differential privacy (Apple, Google adotaram).',
  },
  {
    question: 'Backups full do Postgres com PII — como atender erasure sem restaurar e reapagar?',
    options: [
      'Restaurar, deletar, fazer backup novamente — toda semana',
      'Crypto-shredding: cada usuário tem (ou um grupo tem) chave própria gerenciada em KMS. Backup mantém ciphertext; ao deletar usuário, destrua a chave no KMS. Ciphertext fica permanentemente ilegível. NIST SP 800-88 reconhece como sanitização válida em mídia que não pode ser fisicamente apagada',
      'Apenas comprimir',
      'Excluir backup todo',
    ],
    correct: 1,
    explanation:
      'Crypto-shredding (também "cryptographic erasure") é a única forma prática em backups históricos. Granularidade fina (chave por usuário) é cara, mas para PII alto risco vale. Documente no DPIA como medida de erasure.',
  },
  {
    question: 'ML training set já consumido por modelo — como tratar erasure?',
    options: [
      'Retreinar do zero',
      'Avalie: (1) modelo memoriza? (membership inference attack viável?). Se sim, retreine sem o registro ou aplique machine unlearning (SISA, certified unlearning). (2) Para LLMs grandes, retreinar é caro — use técnicas de unlearning + bloqueios de output. (3) Documente no DPIA o trade-off. Apenas tirar do dataset futuro não basta se o modelo atual já aprendeu',
      'Ignorar',
      'Trocar de algoritmo',
    ],
    correct: 1,
    explanation:
      'Machine unlearning é campo ativo (Cao & Yang 2015, Bourtoule et al 2021 SISA). Em LLMs, unlearning é open problem; ANPD ainda não tem precedente firme, mas o tema entra em DPIA de sistemas com Art. 20.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="right-to-erasure-tecnico"
      title="Right to erasure no código: backups, replicas, search index"
      icon="🗑️"
      xp={65}
      readTime={13}
      trailName="Privacy & Compliance Engineering"
      trailColor={accent}
      nextSlug="transferencia-internacional-dados"
      nextTitle="Transferência internacional: Cláusulas-padrão ANPD, Schrems II"
      quiz={quiz}
    >
      <div className="flex flex-col gap-8 text-sm leading-7">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Titular pede exclusão (Art. 18 V LGPD). Você tem <strong>15 dias</strong> (Art. 19) para responder. Em
          arquitetura moderna, "DELETE FROM users" não basta — PII vive em 8 a 20 lugares, e esquecer um deles é
          violação. Este módulo mapeia onde PII se espalha, padrões para sincronizar deleção, e quando crypto-shredding
          é a única opção viável.
        </p>

        <Section title="O mapa de propagação de PII" accent={accent}>
          <NodeGraph
            accent={accent}
            title="Onde os dados de um usuário podem estar"
            columns={[
              {
                label: 'Online',
                nodes: [
                  { icon: '🗄️', label: 'Postgres / Aurora', sub: 'Tabela users, profiles, transactions', tone: 'emphasis' },
                  { icon: '🪞', label: 'Réplicas read', sub: 'Async; deleção propaga via WAL' },
                  { icon: '⚡', label: 'Redis cache', sub: 'Por TTL ou DEL explícito' },
                  { icon: '🔍', label: 'Elasticsearch / OpenSearch', sub: 'Por documento; reindex se schema mudou' },
                ],
              },
              {
                label: 'Analytics',
                nodes: [
                  { icon: '🏭', label: 'Data warehouse', sub: 'BigQuery / Redshift / Snowflake — DML lento, particionado', tone: 'emphasis' },
                  { icon: '🤖', label: 'Feature store ML', sub: 'Feast, Tecton — TTL ou DELETE direcionado' },
                  { icon: '📊', label: 'BI tools', sub: 'Tableau, Metabase — cache de queries' },
                  { icon: '🎓', label: 'Training set ML', sub: 'Já consumido pelo modelo; ver unlearning', tone: 'danger' },
                ],
              },
              {
                label: 'Operacional / 3rd party',
                nodes: [
                  { icon: '📨', label: 'Filas (Kafka, SQS)', sub: 'Retention curta; aceitar TTL ou tombstone', tone: 'muted' },
                  { icon: '💾', label: 'Backups RDS / S3', sub: 'Crypto-shredding', tone: 'danger' },
                  { icon: '📂', label: 'Logs / audit', sub: 'Pseudonimizado; retenção legal' },
                  { icon: '🤝', label: 'Processadores (CRM, email, KYC)', sub: 'API/contrato; SLA de deleção', tone: 'emphasis' },
                ],
              },
            ]}
            legend="Cada nó precisa de um handler de deleção. O mapa vive no DPIA."
          />
        </Section>

        <Section title="Pipeline de erasure — orquestração" accent={accent}>
          <FlowDiagram
            accent={accent}
            title="DSR (Data Subject Request) — fluxo de deleção"
            orientation="vertical"
            steps={[
              { icon: '📝', label: 'Solicitação do titular', desc: 'Portal DSR, suporte, email DPO — identidade verificada' },
              { icon: '🎫', label: 'Cria ticket DSR', desc: 'erasure_request{id, user_id, ts, scope, status} — audit logged' },
              { icon: '⏸️', label: 'Soft delete imediato', desc: 'deleted_at no Postgres; PII oculta do app; janela 14 dias para undo legítimo' },
              { icon: '📤', label: 'Fan-out async', desc: 'Publica evento user.erased em Kafka; consumers por sistema (ES, DW, CRM)' },
              { icon: '🔁', label: 'Cada handler confirma', desc: 'Idempotente; persiste em erasure_request_steps com status' },
              { icon: '✂️', label: 'Hard delete após janela', desc: 'CRON +14d: DELETE físico em Postgres + sweep em sistemas restantes' },
              { icon: '🔐', label: 'Crypto-shred backups', desc: 'Marca user-key como destroyed no KMS; backup vira ilegível' },
              { icon: '✅', label: 'Notifica titular', desc: 'Email confirmando deleção + lista de sistemas (transparência Art. 9º)' },
            ]}
          />
        </Section>

        <Section title="Handler idempotente — código de referência" accent={accent}>
          <CodeBlock lang="typescript" filename="services/erasure-handler.ts">
{`import { Kafka } from 'kafkajs';
import { Client as ES } from '@elastic/elasticsearch';
import { destroyKey } from './kms';
import { db } from './db';

type ErasureEvent = { request_id: string; user_id: string; scope: 'full' | 'consented_only' };

export async function handle(event: ErasureEvent) {
  const stepKey = \`\${event.request_id}:postgres\`;
  // idempotência: se já processou, skip
  const alreadyDone = await db.query(
    'SELECT 1 FROM erasure_step WHERE step_key = $1 AND status = $2',
    [stepKey, 'done']
  );
  if (alreadyDone.rows.length) return;

  await db.tx(async (tx) => {
    // 1. Hard delete em tabelas com PII
    await tx.query('DELETE FROM user_addresses WHERE user_id = $1', [event.user_id]);
    await tx.query('DELETE FROM user_devices  WHERE user_id = $1', [event.user_id]);
    // 2. Anonimiza transações (retidas por obrigação fiscal)
    await tx.query(
      \`UPDATE transactions SET cardholder_name = NULL, masked_pan = NULL,
       email = NULL, ip_address = NULL WHERE user_id = $1\`,
      [event.user_id]
    );
    // 3. Tombstone na users (para audit) — mantém id, marca anonymized_at
    await tx.query(
      \`UPDATE users SET full_name = NULL, cpf = NULL, email = NULL, phone = NULL,
       anonymized_at = NOW() WHERE id = $1\`,
      [event.user_id]
    );
    await tx.query(
      \`INSERT INTO erasure_step (step_key, request_id, status, finished_at)
       VALUES ($1, $2, 'done', NOW())
       ON CONFLICT (step_key) DO UPDATE SET status='done', finished_at=NOW()\`,
      [stepKey, event.request_id]
    );
  });
}

// ES handler: deleta documentos + invalida cache
export async function handleES(event: ErasureEvent) {
  const es = new ES({ node: process.env.ES_URL });
  await es.deleteByQuery({
    index: ['users-*', 'transactions-*'],
    refresh: true,
    body: { query: { term: { user_id: event.user_id } } },
  });
}

// Backups: destrói chave per-tenant
export async function handleBackupCryptoShred(event: ErasureEvent) {
  if (event.scope !== 'full') return;
  await destroyKey(\`user/\${event.user_id}/dek\`);  // KMS schedule deletion (7-30d window)
}`}
          </CodeBlock>
        </Section>

        <Section title="Crypto-shredding — quando não dá para apagar fisicamente" accent={accent}>
          <p>
            Backup mensal de RDS em snapshot S3 de 5 anos. Cliente pede erasure. Restaurar, deletar, gerar backup novo é
            inviável (custo, RPO, complexidade). Solução: <strong>crypto-shredding</strong> — granularidade de chave
            permite "destruir" o dado destruindo a chave.
          </p>
          <StackFlow
            accent={accent}
            title="Crypto-shred — modelo de chave por usuário (ou grupo)"
            items={[
              { icon: '🆔', label: 'KMS gera KEK master', sub: 'Por ambiente', detail: 'Master key (não exposta), usada para envelope encryption', connector: 'Encrypts' },
              { icon: '👤', label: 'DEK por usuário', sub: 'Encriptada pela KEK', detail: 'Armazenada no Postgres como ciphertext; metadata key_id = user_id', connector: 'Encrypts' },
              { icon: '💾', label: 'PII no DB e backup', sub: 'AES-256-GCM', detail: 'Backups carregam ciphertext + ciphertext_dek juntos', connector: 'Erasure' },
              { icon: '💥', label: 'Destruir DEK ciphertext', sub: 'KMS Schedule Delete', detail: 'Após janela de 7-30d (NIST SP 800-88), KMS apaga material; ciphertext vira ilegível em todos os locais — inclusive backups antigos' },
            ]}
          />
          <Callout tone="warn" icon="⚠️">
            Granularidade per-user é cara em KMS (custo por chave). Para volume alto, agrupe em tenants/cohorts e use
            re-encryption + chave de grupo. Documente no DPIA a granularidade efetiva.
          </Callout>
        </Section>

        <Section title="Data warehouse: como deletar em colunar particionado" accent={accent}>
          <ComparisonTable
            accent={accent}
            headers={['Plataforma', 'Estratégia']}
            rows={[
              ['BigQuery', 'DML DELETE (cota: 1000/dia por tabela). Para volume: MERGE INTO ... DELETE ou recriação de partição. Time Travel até 7 dias — flush após'],
              ['Snowflake', 'DELETE FROM eficiente; Time Travel até 90 dias (Enterprise); precisa OFFSET para limpar antes do prazo via "Fail-safe" disable ou re-create'],
              ['Redshift', 'DELETE + VACUUM. Pode ser caro; alternativa: copy-replace com WHERE'],
              ['Databricks / Delta Lake', 'DELETE FROM (MERGE-on-read); VACUUM com retention < default para limpar Parquet antigo'],
              ['S3 + Athena (Iceberg)', 'Iceberg suporta DELETE eficiente; Hive não — exige re-escrever partições'],
            ]}
          />
          <Callout tone="info" icon="📚">
            BigQuery tem documento{' '}
            <a href="https://cloud.google.com/blog/topics/developers-practitioners/right-to-be-forgotten-bigquery" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
              "Right to be forgotten in BigQuery"
            </a>{' '}
            — referência oficial para GDPR/LGPD.
          </Callout>
        </Section>

        <Section title="Kafka / SQS — PII em filas" accent={accent}>
          <p>
            Mensagens com PII em fila são pesadelo de erasure. Estratégias:
          </p>
          <KeyValue
            accent={accent}
            items={[
              { k: 'Não colocar PII no payload', v: 'Padrão: payload = { user_id }; consumer faz lookup. Reduz blast radius e simplifica erasure' },
              { k: 'Retention curta', v: '7 dias máx para tópicos com PII. Reduz janela de exposição' },
              { k: 'Tombstone para compacted topics', v: 'Em tópicos com log.compaction, envie key+null para apagar (compaction event)' },
              { k: 'Crypto-shred por mensagem', v: 'Encripte payload com DEK por user; destrua DEK → mensagem ilegível mesmo no broker' },
              { k: 'Documente no DPIA', v: 'Se nada acima é prático, documente a justificativa técnica e o cryptoperiod efetivo' },
            ]}
          />
        </Section>

        <Section title="ML training set e modelos treinados" accent={accent}>
          <p>
            Item mais controverso. Frameworks de <strong>machine unlearning</strong>:
          </p>
          <KeyValue
            accent={accent}
            items={[
              { k: 'SISA (Bourtoule et al. 2021)', v: 'Sharded, Isolated, Sliced, Aggregated — treina shards independentes; deleção exige re-treinar só um shard' },
              { k: 'Certified Unlearning', v: 'Garantia matemática (Δ no modelo é provavelmente igual a "nunca viu o dado"); custoso' },
              { k: 'Influence functions', v: 'Estima impacto de remover registro; aproximação rápida quando não preciso de garantia' },
              { k: 'Output filtering', v: 'Para LLMs grandes, bloqueio em inferência (refuse to generate); paliativo, não cura' },
              { k: 'Retrain from scratch', v: 'Caro, mas único garantido. Janelas de retreino (mensal) podem viabilizar' },
            ]}
          />
          <Callout tone="info" icon="📚">
            Papers de referência: Cao &amp; Yang (2015) "Towards Making Systems Forget with Machine Unlearning"; Bourtoule
            et al. (2021) "Machine Unlearning" (arxiv 1912.03817).
          </Callout>
        </Section>

        <Section title="Exceções legais — quando NÃO apagar" accent={accent}>
          <p>
            Art. 16 LGPD permite a conservação para hipóteses específicas. Não invente exceção — cite a norma.
          </p>
          <ComparisonTable
            accent={accent}
            headers={['Categoria', 'Base para retenção', 'Prazo típico']}
            rows={[
              ['Logs de acesso a aplicação', 'Marco Civil (Lei 12.965) Art. 15', '6 meses'],
              ['Registros fiscais', 'CTN + Lei 9.430', '5 anos'],
              ['KYC bancário', 'Lei 9.613 antibranqueamento; Resolução BCB 4.753', '10 anos pós-término'],
              ['Documentos contratuais', 'CC Art. 206 §5º III prescrição', '5 anos pós-término'],
              ['Defesa em processo', 'Art. 7º VI / Art. 16 III LGPD', 'Até trânsito em julgado + prescrição'],
              ['Estudo por órgão de pesquisa', 'Art. 7º IV / Art. 11 II c', 'Anonimização "sempre que possível"'],
            ]}
          />
          <Callout tone="warn" icon="🛑">
            Em todas as exceções, a finalidade fica <em>limitada</em> à que sustenta a retenção. Não use dado "retido
            para fiscal" para marketing. Acesso lógico segregado e logado.
          </Callout>
        </Section>

        <Section title="DSR portal — interface mínima" accent={accent}>
          <CodeBlock lang="typescript" filename="app/api/me/erasure/route.ts">
{`import { NextRequest, NextResponse } from 'next/server';
import { authenticate, verifyStepUp } from '@/lib/auth';
import { db } from '@/lib/db';
import { publishToKafka } from '@/lib/kafka';

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  // Step-up MFA para operação destrutiva
  const stepUpOk = await verifyStepUp(req, { factor: 'totp_or_webauthn' });
  if (!stepUpOk) return NextResponse.json({ error: 'step_up_required' }, { status: 403 });

  const { scope = 'full', reason } = await req.json();
  const { rows: [request] } = await db.query(
    \`INSERT INTO erasure_request (user_id, scope, reason, status, requested_at)
     VALUES ($1, $2, $3, 'received', NOW()) RETURNING id\`,
    [user.id, scope, reason]
  );

  // 1. Soft delete imediato
  await db.query('UPDATE users SET deleted_at = NOW() WHERE id = $1', [user.id]);

  // 2. Publica evento; downstream consumers processam idempotente
  await publishToKafka('user.erased', { request_id: request.id, user_id: user.id, scope });

  // Logout imediato; sessão revogada
  return NextResponse.json({
    request_id: request.id,
    eta_days: 14,
    notice: 'Sua solicitação foi recebida. Dados serão anonimizados em 15 dias úteis conforme Art. 19 LGPD.',
  }, { status: 202 });
}`}
          </CodeBlock>
        </Section>

        <Section title="Decisão: hard delete imediato ou janela de undo?" accent={accent}>
          <DecisionBox
            scenario="Plataforma e-commerce, suporte recebe casos de erasure por engano (cliente confunde excluir conta com excluir pedido)"
            winner="Soft delete imediato + hard delete em 14 dias"
            winnerColor={accent}
            why="LGPD não fixa janela mínima — 15 dias é o prazo de RESPOSTA, não de execução. Janela de undo curta protege titular de erro próprio e protege controlador de re-cadastros caros. Acima de 30 dias começa a virar retenção indevida — documente a janela no DPIA e Política de Privacidade."
            alternatives={[
              { name: 'Hard delete instantâneo', when: 'Setor altamente sensível (saúde mental, política); aceite custo de erro' },
              { name: 'Janela 90 dias', when: 'Em geral excessivo; só com base sólida documentada' },
              { name: 'Sem hard delete (soft eterno)', when: 'Viola Art. 18 V — não fazer' },
            ]}
          />
        </Section>

        <Section title="Recursos canônicos" accent={accent}>
          <KeyValue
            accent={accent}
            items={[
              { k: 'LGPD Art. 16, 18, 19', v: 'planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm' },
              { k: 'NIST SP 800-88 Rev 1', v: 'Guidelines for Media Sanitization (crypto erase reconhecido)' },
              { k: 'AWS — DSAR architecture', v: 'aws.amazon.com/blogs/security/architect-personal-data-deletion' },
              { k: 'BigQuery RtbF', v: 'cloud.google.com/blog/topics/developers-practitioners/right-to-be-forgotten-bigquery' },
              { k: 'Machine Unlearning (Bourtoule et al.)', v: 'arxiv.org/abs/1912.03817' },
              { k: 'Sweeney 2002 k-anonymity', v: 'Foundational paper para anonimização' },
            ]}
          />
        </Section>
      </div>
    </ModuleLayout>
  );
}
