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
  FlowDiagram,
  DecisionBox,
  StackFlow,
  ArchFlow,
  AnnotatedFormula,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('crypto-rest-transit-pratica');

const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que TLS 1.3 (RFC 8446) é obrigatório em 2026 para sistemas com PII?',
    options: [
      'É mais bonito',
      'TLS 1.3 elimina handshakes vulneráveis (sem RSA key exchange estático, sem CBC, sem RC4), reduz round-trip a 1 RTT (0-RTT opcional com riscos), exige forward secrecy, e protege SNI via ECH (Encrypted Client Hello, RFC 9180). PCI DSS 4.0, NIST SP 800-52r2 e maioria das homologações exigem',
      'É o único TLS que existe',
      'Tem suporte só em Linux',
    ],
    correct: 1,
    explanation:
      'TLS 1.2 ainda é aceito mas com cipher suites restritas. TLS 1.0/1.1 são proibidos desde 2020. TLS 1.3 simplifica drasticamente (5 cipher suites vs dezenas) e fecha vetores como BEAST, POODLE, ROBOT.',
  },
  {
    question: 'O que é envelope encryption e por que usar em vez de criptografar diretamente com a master key?',
    options: [
      'Envelope é só estética',
      'Envelope: gera DEK (Data Encryption Key) por objeto/registro, criptografa o dado com DEK (AES-256-GCM rápido), criptografa a DEK com a KEK (Key Encryption Key) no KMS, armazena o ciphertext + DEK criptografada juntos. Vantagens: (1) rotação de KEK não exige re-encryption dos dados; (2) crypto operations no KMS por evento, não por byte (latência e custo); (3) DEK pode ter granularidade por tenant/objeto',
      'Só serve para email',
      'É o mesmo que TLS',
    ],
    correct: 1,
    explanation:
      'AWS KMS, Vault Transit, GCP KMS — todos usam envelope. Master key (KEK) nunca sai do HSM. DEK vive milisegundos em memória e some. Rotacionar KEK = re-encriptar apenas as DEKs (microssegundos), não terabytes de dados.',
  },
  {
    question: 'AES-256-GCM vs AES-256-CBC: por que GCM é o padrão em 2026?',
    options: [
      'CBC é mais rápido',
      'GCM é AEAD (Authenticated Encryption with Associated Data): provê confidencialidade + integridade + autenticação em uma operação. CBC precisa de HMAC separado e é vulnerável a padding oracle (BEAST, Lucky 13). NIST SP 800-38D recomenda GCM. Atenção: NUNCA reuse nonce com mesma chave (catastrofic — vaza chave)',
      'CBC tem mais bits',
      'GCM é proprietário',
    ],
    correct: 1,
    explanation:
      'GCM é AEAD padrão para TLS 1.3. ChaCha20-Poly1305 é alternativa para CPUs sem AES-NI (ARM mobile antigos). Para storage: AES-256-GCM com nonce random de 96 bits + KMS gerando nonces únicos.',
  },
  {
    question: 'Quando usar mTLS interno entre microsserviços?',
    options: [
      'Nunca, é over-engineering',
      'Quando você tem ambiente zero-trust: cada serviço autentica o outro via cert X.509 emitido por CA interna (cert-manager + Vault PKI, AWS Private CA, Linkerd/Istio service mesh). Substitui shared secret/JWT entre serviços e identifica caller no audit log. Padrão em finanças (BCB 4.658 exige) e saúde',
      'Apenas para chamadas externas',
      'Substitui IAM',
    ],
    correct: 1,
    explanation:
      'mTLS resolve "service identity" — quem chamou quem, com prova criptográfica. SPIFFE/SPIRE padroniza identidade. Istio, Linkerd, Consul Connect injetam mTLS automaticamente via sidecar. AWS App Mesh, GCP Anthos similar.',
  },
  {
    question: 'O que significa BYOK (Bring Your Own Key) e HYOK (Hold Your Own Key)?',
    options: [
      'Mesma coisa',
      'BYOK: você gera a chave on-premises (HSM próprio) e a importa para o KMS do cloud — provider opera a chave mas você controla a origem. HYOK: chave nunca sai do seu HSM; cloud envia o material a ser criptografado para você e recebe o resultado (raro, alta latência). BYOK é o pragmático para LGPD em setores regulados',
      'BYOK = backup, HYOK = história',
      'São termos AWS apenas',
    ],
    correct: 1,
    explanation:
      'AWS KMS BYOK (External Key Store/XKS, 2022), Azure Key Vault BYOK, Google Cloud EKM. HYOK existe em alguns produtos (M365 HYOK, EKM com KACLS). Setor financeiro BR e seguros usam BYOK pra atender BCB e SUSEP.',
  },
  {
    question: 'Qual frequência de rotação de KEK é razoável para PII de longo prazo?',
    options: [
      'Anual obrigatório',
      'Depende do risco. NIST SP 800-57 sugere cryptoperiod 1-2 anos para keys de armazenamento. AWS KMS auto-rotation: 1 ano (CMK simétrica). Vault Transit: configurável. Em incidente, rotação imediata. Para PII LGPD: anual + on-incident é razoável. Lembre: envelope torna rotação barata',
      'Mensal sempre',
      'Nunca',
    ],
    correct: 1,
    explanation:
      'NIST SP 800-57 Part 1 Rev 5 define cryptoperiods por tipo. Curto demais → operação cara e sem ganho. Longo demais → impacto de incidente é maior. Mantenha auditável e documente no DPIA.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="crypto-rest-transit-pratica"
      title="Criptografia em rest e transit: TLS 1.3 ao envelope encryption"
      icon="🔐"
      xp={70}
      readTime={14}
      trailName="Privacy & Compliance Engineering"
      trailColor={accent}
      nextSlug="log-auditoria-imutavel"
      nextTitle="Log de auditoria imutável: append-only, hash chain, WORM"
      quiz={quiz}
    >
      <div className="flex flex-col gap-8 text-sm leading-7">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Criptografia é a única medida do Art. 46 LGPD (segurança técnica) que ANPD inspeciona objetivamente —{' '}
          <em>existe ou não, com força x ou y</em>. Este módulo é o playbook prático: TLS 1.3 nas pontas, mTLS interno
          quando faz sentido, AES-256-GCM em storage com envelope encryption, KMS gerenciando KEK, rotação configurada,
          e a fronteira BYOK/HYOK quando regulação exige. Sem mistificação.
        </p>

        <Section title="Camadas — onde a criptografia mora" accent={accent}>
          <StackFlow
            accent={accent}
            title="Defense in depth: cada camada cobre o que a outra não vê"
            items={[
              { icon: '📱', label: 'App ↔ Edge', sub: 'TLS 1.3', detail: 'Browser/mobile → CDN/ALB. HSTS, ECH, certificate pinning em mobile.', connector: 'Termina TLS' },
              { icon: '🛡️', label: 'Edge ↔ Gateway', sub: 'TLS 1.3 ou mTLS', detail: 'CDN → API Gateway dentro da VPC. Algumas arquiteturas re-criptografam.', connector: 'mTLS' },
              { icon: '🧩', label: 'Service ↔ Service', sub: 'mTLS', detail: 'Istio/Linkerd injeta sidecar. Identity via SPIFFE/SPIRE.', connector: 'TLS' },
              { icon: '🗄️', label: 'Service ↔ DB', sub: 'TLS + IAM', detail: 'Postgres rds.force_ssl=1, MongoDB requireTLS, Redis 6+ TLS.', connector: 'At rest' },
              { icon: '💾', label: 'Storage', sub: 'AES-256-GCM', detail: 'KMS-managed (envelope) — RDS/EBS/S3/DDB. App-level para PII sensível.', connector: 'Backup' },
              { icon: '📦', label: 'Backups', sub: 'AES-256-GCM + KMS', detail: 'Encryption obrigatório + chave separada da prod.', connector: 'Off-site' },
            ]}
          />
        </Section>

        <Section title="TLS 1.3 — o mínimo aceitável" accent={accent}>
          <KeyValue
            accent={accent}
            items={[
              { k: 'Versão mínima', v: 'TLS 1.2 com cipher suites AEAD apenas (ECDHE + AES-GCM ou ChaCha20-Poly1305); TLS 1.3 preferido' },
              { k: 'Cipher suites TLS 1.3', v: 'TLS_AES_128_GCM_SHA256, TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256' },
              { k: 'HSTS', v: 'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload' },
              { k: 'Certificate transparency', v: 'Mandatory em browsers (Chrome desde 2018) — use Let’s Encrypt ou AWS ACM' },
              { k: 'OCSP stapling', v: 'Reduz latência e privacidade do user — revocation check no servidor' },
              { k: 'SNI', v: 'Encrypted Client Hello (ECH, RFC 9180) onde suportado — Cloudflare/CDN' },
              { k: '0-RTT', v: 'Aceito apenas em requests idempotentes; replay protection ativa' },
              { k: 'Auditoria', v: 'Rodar testssl.sh, SSL Labs (qualys), Mozilla Observatory regularmente' },
            ]}
          />
          <CodeBlock lang="nginx" filename="nginx.conf">
{`# TLS 1.3 only (em 2026 já dá pra exigir)
ssl_protocols TLSv1.3;
ssl_ciphers TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256;
ssl_prefer_server_ciphers off;       # TLS 1.3 client preference
ssl_session_tickets off;             # forward secrecy
ssl_stapling on;
ssl_stapling_verify on;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
# Mozilla Modern: https://ssl-config.mozilla.org/`}
          </CodeBlock>
        </Section>

        <Section title="Envelope encryption — o padrão de storage" accent={accent}>
          <ArchFlow
            accent={accent}
            title="Fluxo de encrypt + decrypt com envelope"
            columns={[
              {
                header: 'Encrypt',
                items: [
                  '1. App chama KMS.GenerateDataKey(KeyId=KEK)',
                  '2. KMS retorna { plaintext_dek, ciphertext_dek }',
                  '3. App AES-GCM(plaintext_dek, dado) → ciphertext',
                  '4. App descarta plaintext_dek (zerar memória)',
                  '5. Persiste: ciphertext + ciphertext_dek + nonce + AAD',
                ],
                footer: 'CRIPTOGRAFIA',
              },
              {
                header: 'Decrypt',
                items: [
                  '1. App lê ciphertext + ciphertext_dek',
                  '2. App chama KMS.Decrypt(ciphertext_dek)',
                  '3. KMS retorna plaintext_dek',
                  '4. App AES-GCM-Decrypt(plaintext_dek, ciphertext, nonce, AAD)',
                  '5. Plaintext disponível por μs; descartar',
                ],
                footer: 'DECRIPTOGRAFIA',
              },
              {
                header: 'Rotação',
                items: [
                  '1. KMS rotaciona KEK (auto 1y ou manual)',
                  '2. Versões antigas mantidas para decrypt',
                  '3. Re-encrypt DEK opcional (KMS.ReEncrypt)',
                  '4. Não toca no ciphertext do dado',
                  '5. Auditoria via CloudTrail por GenerateDataKey/Decrypt',
                ],
                footer: 'KEY LIFECYCLE',
              },
            ]}
          />
          <CodeBlock lang="typescript" filename="lib/envelope.ts">
{`import { KMSClient, GenerateDataKeyCommand, DecryptCommand } from '@aws-sdk/client-kms';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const kms = new KMSClient({ region: 'sa-east-1' });
const KEK_ARN = process.env.KMS_KEK_ARN!;

export interface EncryptedPayload {
  ciphertext: Buffer;
  ciphertextDek: Buffer;
  nonce: Buffer;
  tag: Buffer;
  aad?: Buffer;
}

export async function encrypt(plaintext: Buffer, aad?: Buffer): Promise<EncryptedPayload> {
  const { Plaintext, CiphertextBlob } = await kms.send(new GenerateDataKeyCommand({
    KeyId: KEK_ARN, KeySpec: 'AES_256',
  }));
  const dek = Buffer.from(Plaintext!);
  const nonce = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', dek, nonce);
  if (aad) cipher.setAAD(aad);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  // CRITICAL: zerar DEK em memória
  dek.fill(0);
  return { ciphertext, ciphertextDek: Buffer.from(CiphertextBlob!), nonce, tag, aad };
}

export async function decrypt(p: EncryptedPayload): Promise<Buffer> {
  const { Plaintext } = await kms.send(new DecryptCommand({ CiphertextBlob: p.ciphertextDek }));
  const dek = Buffer.from(Plaintext!);
  const decipher = createDecipheriv('aes-256-gcm', dek, p.nonce);
  if (p.aad) decipher.setAAD(p.aad);
  decipher.setAuthTag(p.tag);
  const result = Buffer.concat([decipher.update(p.ciphertext), decipher.final()]);
  dek.fill(0);
  return result;
}`}
          </CodeBlock>
          <Callout tone="warn" icon="⚠️">
            AAD (Additional Authenticated Data) <em>não</em> é criptografado, mas é autenticado. Use para amarrar
            ciphertext ao contexto: <InlineCode>{`AAD = user_id || record_type`}</InlineCode>. Impede swap attack
            (mover ciphertext entre registros).
          </Callout>
        </Section>

        <Section title="AES-GCM — anatomia e armadilhas" accent={accent}>
          <AnnotatedFormula
            accent={accent}
            title="AES-256-GCM"
            formula="C = AES_CTR(K, N, P) ;  T = GHASH(H, A, C)"
            parts={[
              { text: 'K', annotation: 'Chave AES-256 (DEK)', highlight: true },
              { text: 'N', annotation: 'Nonce 96 bits — ÚNICO por (K, mensagem)', highlight: true },
              { text: 'P', annotation: 'Plaintext' },
              { text: 'A', annotation: 'AAD (não criptografado, autenticado)' },
              { text: 'C', annotation: 'Ciphertext (mesmo tamanho de P)' },
              { text: 'T', annotation: 'Tag de autenticação 128 bits' },
            ]}
          />
          <Callout tone="danger" icon="🚫">
            <strong>Nonce reuse com mesma chave em GCM é catastrófico</strong>: vaza XOR de keystreams e permite forjar
            mensagens autenticadas. NUNCA gere nonce com PRNG fraco. Use{' '}
            <InlineCode>crypto.randomBytes(12)</InlineCode> (CSPRNG) ou contador atômico monotônico por chave. Em alta
            volume, considere AES-256-GCM-SIV (RFC 8452) — resistente a nonce reuse.
          </Callout>
        </Section>

        <Section title="Comparativo KMS — AWS, GCP, Azure, Vault" accent={accent}>
          <ComparisonTable
            accent={accent}
            headers={['Recurso', 'AWS KMS', 'GCP Cloud KMS', 'Azure Key Vault', 'HashiCorp Vault Transit']}
            rows={[
              ['HSM nível', 'FIPS 140-2 L3 (CloudHSM L3)', 'FIPS 140-2 L3 opcional', 'Managed HSM FIPS L3', 'FIPS 140-2 L3 com seal HSM'],
              ['Auto-rotation', 'Sim, 1 ano', 'Configurável', 'Sim, configurável', 'Sim, configurável'],
              ['BYOK', 'External Key Store (XKS)', 'External Key Manager (EKM)', 'BYOK suportado', 'Não aplicável (você opera)'],
              ['Audit', 'CloudTrail', 'Cloud Audit Logs', 'Activity Log', 'Audit device'],
              ['Custo (USD)', '$1/key/mês + $0.03/10k', '$0.06/key/mês + $0.03/10k', '~$1/key + ops', 'Self-host'],
              ['Per-record encrypt', 'GenerateDataKey + DEK', 'GenerateRandomBytes + AEAD local', 'wrap/unwrap', 'Encrypt API'],
              ['Multi-region', 'KMS multi-region keys', 'Replicated keysets', 'Geo-replicated', 'Replication enterprise'],
            ]}
          />
        </Section>

        <Section title="mTLS interno — service mesh ou manual?" accent={accent}>
          <DecisionBox
            scenario="Cluster Kubernetes com 30 serviços, precisa autenticação service-to-service auditável"
            winner="Service Mesh (Istio ou Linkerd) com mTLS automático"
            winnerColor={accent}
            why="Sidecar injeta TLS sem mudança de código, identidade via SPIFFE (spiffe://cluster/ns/sa), rotação automática de certs (1h–24h via cert-manager + Vault PKI), audit log com identidade real do caller. Manual exige boilerplate em cada serviço e divergência inevitável."
            alternatives={[
              { name: 'Manual TLS no app', when: 'Frota pequena (< 5 serviços) e time muito sênior' },
              { name: 'JWT entre serviços', when: 'Falha em autenticidade — qualquer um com a chave forja; ok para autorização, não autenticação' },
              { name: 'Apenas IAM/VPC', when: 'Insuficiente para zero-trust; perímetro caiu há 10 anos' },
            ]}
          />
        </Section>

        <Section title="Quando criptografia at-rest não basta" accent={accent}>
          <p>
            EBS-encrypted, RDS-encrypted, S3 SSE — todos protegem contra <em>roubo de disco</em>. Não protegem contra
            credencial vazada nem contra insider com acesso de leitura legítimo. Para PII sensível (CPF + biometria,
            saúde, dados financeiros), aplique <strong>application-layer encryption</strong> com chave por tenant ou por
            campo. Operações analíticas ficam mais complexas — use Searchable Encryption (CipherStash) ou Tokenization
            (Vault, AWS Payment Cryptography) se precisar buscar/joinar.
          </p>
          <FlowDiagram
            accent={accent}
            title="Token vs Encrypt vs Hash — para CPF"
            orientation="horizontal"
            steps={[
              { icon: '🔢', label: 'Tokenize', desc: 'CPF → token estável (vault map). Busca por token, sem chave em prod app. Recomendado para CPF.' },
              { icon: '🔐', label: 'Encrypt (envelope)', desc: 'Cifra reversível. Use quando precisar do valor original na app. Não permite busca exata.' },
              { icon: '#️⃣', label: 'Hash (HMAC-SHA-256)', desc: 'Irreversível. Permite igualdade. Use quando precisa apenas comparar (lookup).' },
            ]}
          />
        </Section>

        <Section title="Erros frequentes em produção" accent={accent}>
          <KeyValue
            accent={accent}
            items={[
              { k: 'KMS sem CloudTrail/audit', v: 'Sem log, ANPD não aceita controle. Habilite CloudTrail data events ou equivalente' },
              { k: 'DEK em cache eterno', v: 'Some defeated. Limite TTL (segundos a minutos) e descarte na memória após uso' },
              { k: 'Reuso de IV/nonce', v: 'Catastrófico em GCM/CTR. Sempre random ou contador único por chave' },
              { k: 'TLS internal opt-out', v: '"Está na VPC, não precisa" — falacioso. VPC peering, side-channel, sidecar comprometido' },
              { k: 'Chaves no env var sem KMS', v: 'Aparece em `ps`, em /proc, em core dump. Sempre referenciar via KMS/Secrets Manager' },
              { k: 'Backup sem encryption', v: 'O backup é cópia perfeita; viola Art. 46 se prod tem encryption e backup não' },
              { k: 'Mesma chave em prod e backup', v: 'Compromisso de uma compromete outro. Separe explicitamente' },
              { k: 'Sem rotação ou rotação manual', v: 'Habilite automatic rotation; documente cryptoperiods no DPIA' },
            ]}
          />
        </Section>

        <Section title="Checklist de auditoria pre-incidente" accent={accent}>
          <ol className="list-decimal pl-6 flex flex-col gap-2">
            <li>TLS 1.3 (ou 1.2 com AEAD only) em todo endpoint público? Rode <InlineCode>testssl.sh</InlineCode>.</li>
            <li>HSTS preload, OCSP stapling, cert auto-renew (ACM/Let’s Encrypt)?</li>
            <li>mTLS entre serviços internos críticos? Service mesh com SPIFFE?</li>
            <li>RDS/Aurora <InlineCode>storage_encrypted=true</InlineCode> + <InlineCode>rds.force_ssl=1</InlineCode>?</li>
            <li>S3 buckets com SSE-KMS + Bucket Key + Block Public Access?</li>
            <li>EBS volumes encrypted by default no account?</li>
            <li>Envelope encryption em app-layer para PII sensível?</li>
            <li>KMS key rotation habilitada? CloudTrail data events ligados?</li>
            <li>Backups com encryption + chave separada da prod?</li>
            <li>Plano de rotação de emergência documentado (24h)?</li>
            <li>Algorithms aprovados (NIST SP 800-131A Rev 2)? Sem MD5/SHA-1/RC4/3DES?</li>
            <li>Tokenização para CPF/cartão onde plaintext na app é desnecessário?</li>
          </ol>
        </Section>

        <Section title="Recursos canônicos" accent={accent}>
          <KeyValue
            accent={accent}
            items={[
              { k: 'RFC 8446', v: 'TLS 1.3' },
              { k: 'RFC 8452', v: 'AES-GCM-SIV (nonce-misuse-resistant)' },
              { k: 'NIST SP 800-57', v: 'Key Management — cryptoperiods' },
              { k: 'NIST SP 800-131A r2', v: 'Algoritmos aprovados' },
              { k: 'NIST SP 800-38D', v: 'GCM Mode' },
              { k: 'OWASP Cryptographic Storage Cheat Sheet', v: 'cheatsheetseries.owasp.org' },
              { k: 'Mozilla SSL Config', v: 'ssl-config.mozilla.org' },
              { k: 'SPIFFE/SPIRE', v: 'spiffe.io — identidade para mTLS' },
            ]}
          />
        </Section>
      </div>
    </ModuleLayout>
  );
}
