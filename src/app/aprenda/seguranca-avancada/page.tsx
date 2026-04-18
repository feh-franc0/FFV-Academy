import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout, type QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  StackFlow,
  QAItem,
  ExamDomainBadge,
  KeyValue,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('seguranca-avancada');

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Uma aplicação precisa rotacionar automaticamente credenciais de um banco RDS a cada 30 dias, com a rotação aplicada também no banco (não só no segredo armazenado). Qual serviço escolher?',
    options: [
      'Systems Manager Parameter Store com versioning',
      'Secrets Manager com rotation Lambda pré-configurada para RDS',
      'IAM Database Authentication',
      'KMS com key rotation',
    ],
    correct: 1,
    explanation: 'Secrets Manager tem rotation automática via Lambda com templates para RDS/Aurora/Redshift/DocumentDB — ele muda a senha no banco e atualiza o secret. Parameter Store não faz rotation automática (requer código). IAM Database Auth é token-based, não gerencia senha estática. KMS key rotation roda atrás do backing key, não muda dados.',
  },
  {
    question: 'Objeto de 5GB precisa ser criptografado no S3 com KMS, mas altíssima taxa de PUT/GET está gerando throttle no KMS. Solução mais adequada?',
    options: [
      'Trocar para SSE-S3 (AES-256 gerenciado)',
      'Habilitar S3 Bucket Keys',
      'Criar múltiplas CMK e rotacionar por objeto',
      'Passar para SSE-C (chave cliente)',
    ],
    correct: 1,
    explanation: 'S3 Bucket Keys reduzem as chamadas ao KMS em ~99%: em vez de uma chamada KMS por objeto, o S3 gera uma bucket-level key que criptografa os data keys dos objetos. Mantém SSE-KMS com auditoria. Trocar para SSE-S3 perde o controle de chave. Múltiplas CMKs adiciona complexidade sem resolver throttle. SSE-C tira a responsabilidade de gestão de chave da AWS — não desejável.',
  },
  {
    question: 'Qual combinação protege melhor uma API pública contra ataques DDoS camada 7 (HTTP flood) + SQL injection?',
    options: [
      'Security Groups restritivos + GuardDuty',
      'NACLs + VPC Flow Logs',
      'AWS WAF + AWS Shield Advanced + CloudFront',
      'Network Firewall + ALB access logs',
    ],
    correct: 2,
    explanation: 'WAF para regras de aplicação (SQLi, XSS, rate limiting). Shield Advanced para DDoS L3/L4/L7 com mitigação 24/7. CloudFront absorve tráfego globalmente na borda. Security Groups/NACLs são L3/L4. GuardDuty é detecção de anomalias (não previne). Network Firewall é L3/L4 na VPC.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="seguranca-avancada"
      title="Segurança Avançada: KMS, Secrets, WAF, Shield"
      icon="🛡️"
      xp={80}
      readTime={15}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="disaster-recovery"
      nextTitle="Disaster Recovery: RPO, RTO e 4 Estratégias"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Segurança é o <strong>maior domínio</strong> do SAA-C03 (30%). Não é &ldquo;só IAM&rdquo;: envolve criptografia de
        dados (KMS), gestão de segredos (Secrets Manager/Parameter Store), proteção de borda (WAF/Shield/CloudFront),
        detecção (GuardDuty/Macie/Inspector/CloudTrail), compliance (Config, Audit Manager) e governança
        (Organizations SCPs). Vamos focar nos que o exame cobra mais.
      </p>

      <div className="flex flex-wrap gap-2">
        <ExamDomainBadge domain="Secure" weight="30%" color={ACCENT} />
      </div>

      <Section title="KMS — o coração da criptografia" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          KMS gera, armazena e controla chaves criptográficas. A chave mestre (CMK ou KMS Key) nunca sai do KMS em claro.
          Aplicações usam <strong>envelope encryption</strong>: KMS gera uma data key para a operação, retorna versão
          em claro (usada para criptografar dados) e versão encrypted (armazenada junto com os dados).
        </p>
        <StackFlow
          title="Envelope encryption — encrypt"
          accent={ACCENT}
          items={[
            { icon: '🔑', label: 'GenerateDataKey', sub: 'App → KMS (CMK, 256)', detail: 'App chama KMS pedindo uma chave de dados de 256 bits derivada da CMK.' },
            { icon: '📦', label: 'KMS responde', sub: 'DataKey plaintext + encrypted', detail: 'KMS retorna duas versões: plaintext (uso imediato) e encrypted (armazenar).' },
            { icon: '🔐', label: 'AES-256 local', sub: 'data × plaintext key', detail: 'App criptografa o dado (1GB+) localmente — KMS nunca vê o payload.' },
            { icon: '💾', label: 'Armazena', sub: '[Ciphertext + EncryptedKey]', detail: 'Salva o ciphertext ao lado do encrypted data key. Plaintext é zerado da memória.' },
          ]}
        />
        <StackFlow
          title="Envelope encryption — decrypt"
          accent={ACCENT}
          items={[
            { icon: '📂', label: 'Lê armazenamento', sub: '[Ciphertext, EncryptedKey]', detail: 'Recupera os dois blobs salvos juntos.' },
            { icon: '🔓', label: 'KMS Decrypt', sub: 'EncryptedKey → Plaintext', detail: 'Chama KMS:Decrypt no data key encriptado. KMS valida policy e retorna plaintext.' },
            { icon: '📄', label: 'AES-256 decrypt', sub: 'Ciphertext × plaintext key', detail: 'Descriptografa localmente. Plaintext key é usada e imediatamente descartada.' },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo de CMK', 'Gestão', 'Rotação', 'Cross-account?', 'Caso']}
          rows={[
            ['AWS Owned', 'AWS (não visível)', 'AWS', 'Não', 'Default de alguns serviços'],
            ['AWS Managed (aws/s3 etc)', 'AWS', 'Automática anual', 'Não', 'Serviços AWS que criptografam sem config'],
            ['Customer Managed (symmetric)', 'Cliente', 'Opcional anual (automática) ou on-demand', 'Sim via key policy', 'Quando você precisa de controle/auditoria'],
            ['Customer Managed (asymmetric)', 'Cliente', 'Manual (assinar binário ou criptografar fora da AWS)', 'Sim', 'Assinatura digital, cripto com clientes sem AWS'],
            ['Imported Key Material', 'Você importa', 'Manual', 'Sim', 'BYOK — compliance exige origem externa'],
            ['CloudHSM-backed', 'HSM dedicado', 'Manual', 'Sim', 'FIPS 140-2 Level 3, chave nunca sai do HSM'],
          ]}
        />
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Key Policy', v: 'Principal policy da CMK — quem pode usar/administrar. Se não permitir IAM, IAM não funciona.' },
            { k: 'Grants', v: 'Delegação temporária para principal usar a chave sem alterar policy. Comum entre serviços AWS.' },
            { k: 'Aliases', v: 'Nome amigável (alias/my-app) para a chave. Permite rotacionar backing key sem mudar código.' },
            { k: 'Key Rotation', v: 'Automática anual (só symmetric customer-managed). Cria novo backing material; aliases continuam apontando igual.' },
            { k: 'Multi-Region Keys', v: 'Replica a CMK para outras regiões mantendo mesmo Key ID. Essencial para cross-region encryption consistente.' },
            { k: 'Deletion', v: 'Mínimo 7 dias de waiting period. Você cancela antes se mudou de ideia — não existe delete imediato.' },
          ]}
        />
      </Section>

      <Section title="Secrets Manager vs Parameter Store" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Feature', 'Secrets Manager', 'SSM Parameter Store']}
          rows={[
            ['Custo', '$0,40/segredo/mês + $0,05 por 10k API', 'Gratuito (Standard) / $0,05/10k (Advanced)'],
            ['Rotação automática', 'Sim (via Lambda, templates RDS/Aurora/etc)', 'Não (você implementa)'],
            ['Tamanho máx', '64KB', '4KB (Standard) / 8KB (Advanced)'],
            ['Criptografia', 'KMS obrigatório', 'Opcional (SecureString = KMS)'],
            ['Versioning', 'Sim (labels AWSCURRENT, AWSPREVIOUS, AWSPENDING)', 'Sim (histórico)'],
            ['Cross-account', 'Sim via resource policy', 'Sim via resource policy (Advanced)'],
            ['Replicação multi-region', 'Sim (replicate secret)', 'Manual'],
            ['Hierarquia de paths', 'Não nativo', 'Sim (/prod/db/password)'],
            ['Caso ideal', 'Credenciais de banco com rotation', 'Configs, feature flags, endpoints'],
          ]}
        />
        <Callout tone="info">
          <strong>Decisão simples:</strong> precisa de rotation automática? Secrets Manager. Caso contrário, Parameter
          Store com SecureString é mais barato e suficiente para 90% dos casos.
        </Callout>
        <CodeBlock lang="bash">{`# Secrets Manager — buscar segredo em app
aws secretsmanager get-secret-value --secret-id prod/db/credentials

# Parameter Store — hierárquico
aws ssm get-parameters-by-path --path /prod/api/ --with-decryption --recursive`}</CodeBlock>
      </Section>

      <Section title="WAF — Web Application Firewall" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          WAF roda na frente de CloudFront, ALB, API Gateway, AppSync ou App Runner. Inspeciona requests HTTP(S) e
          aplica regras.
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Web ACL', v: 'Container de regras. Anexa ao ALB/CloudFront/etc.' },
            { k: 'Managed Rule Groups', v: 'Regras pré-prontas da AWS e parceiros (OWASP Top 10, bot control, anonymous IP, known bad inputs).' },
            { k: 'Custom Rules', v: 'Match em IP, país, header, URI, body, query string + operadores (contains, regex, size).' },
            { k: 'Rate-based rules', v: 'Bloqueia IP que excede N requests em 5min. Base para mitigação de L7 DDoS.' },
            { k: 'CAPTCHA / Challenge', v: 'Intercepta request suspeito e exige CAPTCHA silencioso ou visível.' },
            { k: 'Scopes', v: 'CLOUDFRONT (global) vs REGIONAL (ALB/APIGW/AppSync).' },
            { k: 'IP Sets / Regex Pattern Sets', v: 'Listas reutilizáveis. Útil para whitelists corporativas ou blocklists dinâmicas.' },
          ]}
        />
      </Section>

      <Section title="Shield — proteção DDoS" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Feature', 'Shield Standard', 'Shield Advanced']}
          rows={[
            ['Custo', 'Grátis', '$3.000/mês por organization'],
            ['Proteção L3/L4', 'Automática (CloudFront, Route 53, Global Accelerator)', 'Expandida + ALB, EC2, EIP'],
            ['Proteção L7', 'Não', 'Sim (via WAF integrado)'],
            ['Shield Response Team (SRT)', 'Não', '24/7'],
            ['Cost Protection', 'Não', 'Reembolso de surto de EC2/ELB/CloudFront devido a DDoS'],
            ['Visibility', 'Nenhuma', 'Métricas e relatórios detalhados'],
          ]}
        />
        <Callout tone="warn">
          <strong>SAA cobra:</strong> Shield Standard já vem ativo em tudo, de graça. Shield Advanced só quando
          exposição a ataques é crítica (financeiro, e-commerce em pico, gov). Não recomenda em workloads pequenos.
        </Callout>
      </Section>

      <Section title="Detecção e compliance — o que cada um faz" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Serviço', 'O que detecta', 'Fonte de dados']}
          rows={[
            ['GuardDuty', 'Anomalias de comportamento, malware, exfiltração, mineração', 'CloudTrail, VPC Flow Logs, DNS logs, S3 events, EKS audit'],
            ['Macie', 'Dados sensíveis (PII, PCI, PHI) em S3', 'Object scanning'],
            ['Inspector', 'Vulnerabilidades em EC2, ECR, Lambda (CVEs, network reachability)', 'Agent SSM + container scanning'],
            ['Detective', 'Investigação forense cross-service', 'GuardDuty, CloudTrail, VPC Flow'],
            ['Security Hub', 'Agregador central de findings + CIS/PCI benchmarks', 'GuardDuty, Macie, Inspector, Config, third-party'],
            ['Config', 'Conformidade de recursos com regras (ex: "bucket S3 não-público")', 'Config snapshots + change events'],
            ['CloudTrail', 'Log de todas as API calls na conta', 'Management events + Data events'],
            ['Audit Manager', 'Geração de evidências para auditorias (SOC2, PCI, HIPAA)', 'Todos os acima'],
          ]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Precisa de visão única de postura de segurança da organização inteira"
          winner="Security Hub + delegação em Organizations"
          why="Security Hub agrega findings de todos os serviços em todas as contas com 1 dashboard. Aplica benchmarks (CIS, AWS FSBP)."
          alternatives={[
            { name: 'Detective', note: 'investigação após o fato, não visão de postura.' },
          ]}
        />
      </Section>

      <Section title="Cenários arquiteturais" accent={ACCENT}>
        <DecisionBox
          winnerColor={ACCENT}
          scenario="RDS contém dados financeiros — regulação exige criptografia, auditoria de acesso à chave, rotação anual"
          winner="RDS encrypted com Customer Managed CMK + key rotation + CloudTrail"
          why="CMK customer-managed dá controle, rotation automática atende regulação, CloudTrail loga cada Encrypt/Decrypt."
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Aplicação lambda precisa acessar senha de DB sem hardcode"
          winner="Secrets Manager + IAM execution role com secretsmanager:GetSecretValue"
          why="Zero credenciais no código/env. Rotation automática. Lambda lê em runtime."
          alternatives={[
            { name: 'Parameter Store SecureString', note: 'alternativa se rotation não necessária.' },
          ]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="API pública global sofre ataque de bots preenchendo formulário de cadastro"
          winner="CloudFront + WAF com Managed Rule Group 'Bot Control' + rate-based rule"
          why="Bot Control ML-based. Rate-based bloqueia IPs que excedem threshold. CloudFront absorve tráfego na borda."
        />
      </Section>

      <Section title="Q&A estilo exame" accent={ACCENT}>
        <QAItem
          q="Uso SSE-KMS e percebo throttling em alta carga. Fix?"
          a={
            <span>
              Ative S3 Bucket Keys — reduz chamadas KMS em ~99%. Se isso não bastar, pedir aumento de cota KMS via
              Service Quotas ou usar KMS-managed key separada para cada carga.
            </span>
          }
        />
        <QAItem
          q="Como auditar quem usou uma CMK específica e quando?"
          a={
            <span>
              CloudTrail registra cada chamada KMS (Encrypt, Decrypt, GenerateDataKey) com principal, timestamp, recurso
              criptografado. Queries com Athena ou CloudWatch Insights.
            </span>
          }
        />
        <QAItem
          q="Shield Standard ou Advanced para um SaaS B2B pequeno?"
          a={
            <span>
              Standard é suficiente — já protege CloudFront/Route 53/GA contra DDoS L3/L4 automaticamente, de graça.
              Advanced só em casos de ataques frequentes ou SLA crítico com clientes.
            </span>
          }
        />
        <QAItem
          q="IAM Database Authentication vs credencial no Secrets Manager?"
          a={
            <span>
              IAM DB Auth usa token IAM (15min) em vez de senha. Ideal para aplicações dentro da AWS. Sem rotation necessária.
              Limita a ~200 conexões/s por instância. Secrets Manager com rotation é mais comum em apps legacy.
            </span>
          }
        />
      </Section>

      <Callout tone="warn">
        <strong>Armadilhas:</strong> (1) KMS CMK é region-scoped exceto Multi-Region Keys; (2) Key Policy precede IAM —
        se a policy não dá acesso, IAM não compensa; (3) deletion tem waiting period mínimo 7d (não &ldquo;delete agora&rdquo;);
        (4) Secrets Manager cobra por segredo, então não crie um por ambiente se pode ser um com paths; (5) WAF em CloudFront
        escopo CLOUDFRONT; em ALB escopo REGIONAL — não se misturam.
      </Callout>

      <Callout tone="success">
        <strong>Take-aways:</strong> KMS = chaves + envelope encryption; Secrets Manager = credenciais com rotation;
        Parameter Store = config barato; WAF = L7 rules; Shield = DDoS; GuardDuty/Macie/Inspector = detecção; Security
        Hub = agregador; CloudTrail = log de API calls; Config = compliance contínuo.
      </Callout>
    </div>
  );
}
