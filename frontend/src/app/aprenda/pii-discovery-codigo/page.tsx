import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, DecisionBox, StackFlow, AnnotatedFormula } from '@/components/article/primitives';

export const metadata = getModuleMetadata('pii-discovery-codigo');

const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual problema PII Discovery resolve que código-review não resolve?',
    options: [
      'Reduz a quantidade de PRs',
      'Achar PII em locais não óbvios — log statements (logger.info(user)), mensagens de exceção (Failed login for ${email}), payloads de webhook, snapshots de teste, dumps de debug, hardcoded em seeds/fixtures, parâmetros de URL, headers customizados, mensagens Kafka. Coisas que escapam de review humano',
      'Faz o build mais rápido',
      'Substitui o DPO',
    ],
    correct: 1,
    explanation:
      'Code review pega o "esperado". PII Discovery acha o "esquecido" — logs de produção com CPF, fixtures de teste com CPF real, screenshots em tickets do Jira. Em codebases > 100k LOC, é impossível sem ferramenta.',
  },
  {
    question: 'Como Bearer (open source) diferencia PII de string qualquer?',
    options: [
      'Usa apenas regex',
      'Combina: (1) class/struct annotations (TS types, Pydantic, GORM tags), (2) nome do campo (email, cpf, full_name) com fuzzy match, (3) padrão do valor em literais (regex CPF/CNPJ/email), (4) análise de fluxo de dados — se um campo PII chega num logger.info ou num arquivo de cache, sinaliza',
      'Pergunta para o desenvolvedor',
      'Faz hash de tudo e compara',
    ],
    correct: 1,
    explanation:
      'Bearer (github.com/Bearer/bearer) usa stack de heurísticas. A análise de fluxo (taint) é o diferencial — detecta "PII saiu da DB e foi para o stdout do container". Microsoft Presidio (github.com/microsoft/presidio) tem foco em NER (Named Entity Recognition) via spaCy/transformers.',
  },
  {
    question: 'Qual regex pega CPF formatado e não formatado com baixa taxa de falso positivo?',
    options: [
      '/\\d+/',
      '/(?:\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{11})\\b/ + validador de dígito verificador. Regex sozinho gera muito FP (qualquer 11 dígitos); validar DV (módulo 11) reduz drasticamente. Bearer e Presidio fazem isso',
      '/.+CPF.+/',
      '/[A-Z]+/',
    ],
    correct: 1,
    explanation:
      'CPF: 11 dígitos + DV módulo 11. Sem validação de DV, qualquer telefone vira FP. Bearer tem detector nativo "BR_CPF". Presidio: PIICompliance/presidio-br-recognizers contém recognizers para BR (CPF, CNPJ, RG, CNH).',
  },
  {
    question: 'Qual cenário gera mais FALSOS NEGATIVOS (PII passa batido)?',
    options: [
      'CPF em campo chamado "cpf"',
      'PII em coluna genérica — "metadata jsonb", "raw_payload text", "notes varchar(1000)". Discovery em schema falha; precisa de scan no conteúdo + classificação por amostragem. Também: PII em logs comprimidos no S3, PII em snapshots de teste, PII em columns como "external_id" que guarda CPF',
      'Email em campo "email"',
      'Telefone em campo "phone"',
    ],
    correct: 1,
    explanation:
      'Schemas livres (JSONB, text com qualquer coisa) são o ponto cego. Solução: AWS Macie ou Presidio rodando sample-based sobre o conteúdo. Macie é serviço gerenciado da AWS específico para isso em S3.',
  },
  {
    question: 'Quando rodar PII Discovery no CI vs em produção?',
    options: [
      'Apenas em produção',
      'CI: scan estático do código (configs, fixtures, hardcoded, schema). Produção: scan dinâmico — sampling de queries lentas em DB, scan de S3 buckets (Macie), análise de logs no DataDog/Elastic. Ambos. Estático pega antes; dinâmico pega o que mudou em runtime',
      'Apenas no CI',
      'Nunca em produção (compliance proíbe)',
    ],
    correct: 1,
    explanation:
      'Bearer/gitleaks no CI. Macie/Presidio em S3, BigQuery DLP, AWS DLP API. Datadog Sensitive Data Scanner em logs. Estratégia de defesa em profundidade — cada camada pega o que a outra perdeu.',
  },
  {
    question: 'Falso positivo aceitável em scanner de PII em CI?',
    options: [
      'Zero FP — qualquer FP quebra o build',
      'Calibre por contexto: bloqueio (fail build) em alta confidence (CPF/email com DV/format válido); warning em média (campo nome genérico); silencioso em baixa. Allowlist de testes fixtures controlada por revisão. SLA de FP em PR: < 5% — acima disso devs ignoram tudo (alert fatigue)',
      '20% FP é normal',
      'Não importa, é só roda',
    ],
    correct: 1,
    explanation:
      'Como em SAST: signal-to-noise é o tudo. Calibração por confidence + allowlist é o padrão. Gitleaks, Bearer e Presidio expõem confidence score.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="pii-discovery-codigo"
      title="PII Discovery: encontre dados pessoais escondidos no código"
      icon="🕵️"
      xp={60}
      readTime={12}
      trailName="Privacy & Compliance Engineering"
      trailColor={accent}
      nextSlug="crypto-rest-transit-pratica"
      nextTitle="Criptografia em rest e transit: TLS 1.3 ao envelope encryption"
      quiz={quiz}
    >
      <div className="flex flex-col gap-8 text-sm leading-7">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Você acha que conhece todo PII do seu sistema. Está errado. Em codebases de 100k+ LOC com 10+ anos, PII vaza
          para todo canto: logs, snapshots de teste, payloads de erro, seeds de banco, comentários, fixtures, cache,
          parâmetros de URL, headers customizados, mensagens em filas. <strong>PII Discovery</strong> é a prática de
          escanear isso continuamente. Ferramentas: <InlineCode>Bearer</InlineCode>,{' '}
          <InlineCode>Microsoft Presidio</InlineCode>, <InlineCode>Privado</InlineCode>, <InlineCode>AWS Macie</InlineCode>,{' '}
          <InlineCode>BigQuery DLP</InlineCode>, <InlineCode>Datadog Sensitive Data Scanner</InlineCode>.
        </p>

        <Section title="Onde PII se esconde" accent={accent}>
          <KeyValue
            accent={accent}
            items={[
              { k: 'Logs', v: 'logger.info(`user=${user}`) imprime objeto inteiro com CPF — é o caso #1' },
              { k: 'Mensagens de exceção', v: '"Failed login for user joao.silva@empresa.com.br" cai no Sentry/CloudWatch' },
              { k: 'Snapshots de teste', v: 'Vitest/Jest __snapshots__ com payloads de API contendo CPF reais' },
              { k: 'Seeds/fixtures', v: 'db/seeds.sql, factory_bot, faker mal configurado retornando dados reais' },
              { k: 'JSON colunas', v: 'metadata jsonb, raw_response, extra — schemless guarda qualquer coisa' },
              { k: 'URLs e query params', v: '/users?email=... aparece em access log do Nginx, no Plausible, no GA' },
              { k: 'Headers customizados', v: 'X-User-CPF, X-Tenant-Email enviados via fetch e logados em proxy' },
              { k: 'Filas e tópicos', v: 'Kafka, SQS, SNS — payload com PII passa por brokers de terceiros' },
              { k: 'Cache', v: 'Redis com chave por email/CPF — TTL longo, sem encriptação' },
              { k: 'Modelos de ML', v: 'Training set não anonimizado, embeddings que permitem inversão' },
              { k: 'Backups', v: 'Postgres pg_dump em S3 sem encryption ou retention indefinida' },
              { k: 'Debug dumps', v: 'core dumps, heap dumps, hprof — strings vivas com PII' },
            ]}
          />
        </Section>

        <Section title="Bearer — scanner open source que entende código" accent={accent}>
          <p>
            <a href="https://github.com/Bearer/bearer" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
              github.com/Bearer/bearer
            </a>{' '}
            (Apache 2.0). Detecta PII por: anotação de tipo, nome de campo, regex de literal e <strong>análise de fluxo
            de dados</strong> (taint). Suporta TS/JS, Ruby, Java, PHP, Python, Go, .NET. Mantido pela Bearer.sh
            (adquirida pela Cycode em 2023).
          </p>
          <CodeBlock lang="yaml" filename="bearer.yml">
{`# Configuração principal
scan:
  scanner:
    - secrets
    - sast
  skip-path:
    - node_modules
    - "**/__snapshots__"
    - "**/*.test.ts"   # cuidado: snapshots merecem scan
  severity:
    - critical
    - high
report:
  format: sarif       # integra com GitHub code scanning
  output: bearer.sarif
# Custom datatypes adicionais para Brasil
datatypes:
  - id: br_cpf
    name: CPF
    category: PII
    patterns:
      - "\\\\b\\\\d{3}\\\\.\\\\d{3}\\\\.\\\\d{3}-\\\\d{2}\\\\b"
      - "\\\\b\\\\d{11}\\\\b"   # exige validador externo
  - id: br_cnpj
    name: CNPJ
    category: PII
    patterns:
      - "\\\\b\\\\d{2}\\\\.\\\\d{3}\\\\.\\\\d{3}/\\\\d{4}-\\\\d{2}\\\\b"`}
          </CodeBlock>
          <CodeBlock lang="bash" filename=".github/workflows/privacy-scan.yml">
{`name: Privacy Scan
on: [pull_request]
jobs:
  bearer:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: bearer/bearer-action@v2
        with:
          format: sarif
          output: results.sarif
          severity: critical,high,medium
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif
      - name: Fail on critical PII risk
        run: |
          test "$(jq '.runs[0].results | map(select(.level == "error")) | length' results.sarif)" -eq 0`}
          </CodeBlock>
        </Section>

        <Section title="Microsoft Presidio — NER + recognizers" accent={accent}>
          <p>
            <a href="https://github.com/microsoft/presidio" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
              github.com/microsoft/presidio
            </a>{' '}
            (MIT). Foco diferente: <strong>detectar PII em texto não-estruturado</strong> (chats, transcrições, contratos)
            via NER de spaCy/transformers + recognizers regex. Tem também{' '}
            <InlineCode>presidio-anonymizer</InlineCode> para mascarar in-place.
          </p>
          <CodeBlock lang="python" filename="presidio_br.py">
{`from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

def cpf_validator(cpf: str) -> bool:
    digits = [int(d) for d in cpf if d.isdigit()]
    if len(digits) != 11 or len(set(digits)) == 1:
        return False
    for i in range(9, 11):
        s = sum(digits[j] * ((i + 1) - j) for j in range(i))
        d = (s * 10) % 11
        d = 0 if d == 10 else d
        if d != digits[i]:
            return False
    return True

cpf_pattern = Pattern(
    name="cpf_pattern",
    regex=r"\\b(?:\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{11})\\b",
    score=0.9,
)
cpf_recognizer = PatternRecognizer(
    supported_entity="BR_CPF",
    patterns=[cpf_pattern],
    context=["cpf", "documento", "cadastro"],
)

analyzer = AnalyzerEngine()
analyzer.registry.add_recognizer(cpf_recognizer)

text = "Cliente João Silva (CPF 123.456.789-09) reportou erro no app."
results = analyzer.analyze(text=text, lang="pt")
# valida DV — descarta FPs
results = [r for r in results if r.entity_type != "BR_CPF" or cpf_validator(text[r.start:r.end])]

anonymizer = AnonymizerEngine()
masked = anonymizer.anonymize(
    text=text,
    analyzer_results=results,
    operators={"BR_CPF": OperatorConfig("mask", {"chars_to_mask": 9, "masking_char": "*"})},
)
print(masked.text)
# Cliente João Silva (CPF *********-09) reportou erro no app.`}
          </CodeBlock>
        </Section>

        <Section title="Comparativo: qual ferramenta para qual problema" accent={accent}>
          <ComparisonTable
            accent={accent}
            headers={['Ferramenta', 'Foco', 'Open source?', 'Pontos fortes', 'Limitações']}
            rows={[
              ['Bearer', 'Código (TS/JS/Py/Ruby/Java/Go)', 'Sim (Apache 2.0)', 'Taint analysis, SARIF nativo, leve no CI', 'Não escaneia conteúdo de DB/S3'],
              ['Microsoft Presidio', 'Texto livre, chat, docs', 'Sim (MIT)', 'NER multi-idioma, anonimizador embutido, extensível', 'Não escaneia código; precisa rodar como service'],
              ['Privado.ai (Vista)', 'Código + scan dinâmico', 'Sim (community edition)', 'Foco em compliance reports, gera ROPA', 'Comunidade menor que Bearer'],
              ['AWS Macie', 'S3 + DynamoDB', 'Não — serviço gerenciado', 'Custos por GB analisado, classificadores prontos', 'Só AWS; não escaneia código'],
              ['GCP DLP', 'BigQuery, GCS, Pub/Sub, custom', 'Não', '150+ infoTypes prontos, sampling configurável, BR detectors', 'GCP only; pricing por API call'],
              ['Datadog Sensitive Data Scanner', 'Logs e traces (runtime)', 'Não', 'Scrubbing em tempo real, dashboards', 'Datadog only'],
              ['gitleaks', 'Secrets em git history', 'Sim (MIT)', 'Pre-commit fácil, perfis prontos', 'Foco em credenciais, não PII'],
            ]}
          />
        </Section>

        <Section title="Validação de CPF e CNPJ — reduzindo falsos positivos" accent={accent}>
          <p>
            Qualquer 11 dígitos pode parecer CPF. Validar o <strong>dígito verificador (módulo 11)</strong> derruba a
            taxa de FP de ~30% para &lt; 1%.
          </p>
          <AnnotatedFormula
            accent={accent}
            title="Cálculo do DV do CPF (resumido)"
            formula="DV_i = (10 - (Σ d_j × (i+1-j))  mod 11) mod 10"
            parts={[
              { text: 'd_j', annotation: 'j-ésimo dígito do CPF (0..i-1)', highlight: true },
              { text: 'i', annotation: 'posição do DV (9 e 10)' },
              { text: 'mod 11', annotation: 'resto da divisão por 11; se 10, DV = 0' },
            ]}
          />
          <CodeBlock lang="typescript" filename="validators.ts">
{`export function isValidCpf(input: string): boolean {
  const cpf = input.replace(/\\D/g, '');
  if (cpf.length !== 11 || /^(\\d)\\1{10}$/.test(cpf)) return false;
  const calcDV = (slice: string) => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += parseInt(slice[i], 10) * (slice.length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calcDV(cpf.slice(0, 9)) === parseInt(cpf[9], 10)
      && calcDV(cpf.slice(0, 10)) === parseInt(cpf[10], 10);
}`}
          </CodeBlock>
        </Section>

        <Section title="Estratégia de defesa em profundidade" accent={accent}>
          <StackFlow
            accent={accent}
            title="PII Discovery em camadas — cada uma pega o que a anterior perdeu"
            items={[
              { icon: '✍️', label: 'Pre-commit', sub: 'Local', detail: 'gitleaks + bearer (modo rápido) — bloqueia commit com PII óbvia', connector: 'Pre-push' },
              { icon: '🚥', label: 'CI / PR check', sub: 'GitHub Actions', detail: 'Bearer scan completo + Presidio em fixtures e snapshots — bloqueia merge', connector: 'Merge' },
              { icon: '🧪', label: 'Staging scan', sub: 'Periódico', detail: 'AWS Macie em S3 staging, Presidio sample em DB — captura schema livre', connector: 'Promote' },
              { icon: '🌍', label: 'Produção (data)', sub: 'Daily', detail: 'Macie em buckets prod, GCP DLP em BigQuery — descobre PII em campos JSON', connector: 'Runtime' },
              { icon: '📡', label: 'Produção (runtime)', sub: 'Streaming', detail: 'Datadog Sensitive Data Scanner em logs/traces — scrub antes de persistir', connector: 'Alert' },
              { icon: '🚨', label: 'Resposta', sub: 'On-call', detail: 'PII descoberta fora do esperado → ticket auto, rotate secret se aplicável, atualiza ROPA' },
            ]}
          />
        </Section>

        <Section title="Decisão: Bearer vs Presidio vs Macie" accent={accent}>
          <DecisionBox
            scenario="Time pequeno (3 devs), monorepo TS, dados em Postgres + S3, sem orçamento para SaaS"
            winner="Bearer no CI + Macie em S3 + Presidio sob demanda em texto livre"
            winnerColor={accent}
            why="Bearer cobre 80% do esforço (código + schemas). Macie tem preço baixo no AWS Free Tier inicial e cobre S3 direto. Presidio entra apenas onde tem texto livre de cliente (chat, formulários abertos). Sem vendor lock-in pesado."
            alternatives={[
              { name: 'Apenas Presidio', when: 'Faltaria scan do código — pega o "texto", não o "schema"' },
              { name: 'Privado.ai full', when: 'Bom mas comunidade menor; Bearer tem mais GitHub stars + Cycode atrás' },
              { name: 'Tudo via DLP do cloud', when: 'Vendor lock-in; cobertura de código fica buraco' },
            ]}
          />
        </Section>

        <Section title="Anti-pattern: scrubbing tardio em logger" accent={accent}>
          <p>
            Reagir a PII em logs com regex de scrubbing no agent (Datadog Pipelines, FluentBit redact) é última camada,
            não primeira. Razões:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-1">
            <li>Regex deixa passar variações (CPF com espaços, email em base64).</li>
            <li>PII já trafegou no payload do logger até o agent — qualquer crash dump entre os dois persiste.</li>
            <li>Não corrige o código; novo deploy reintroduz o problema.</li>
          </ul>
          <Callout tone="warn" icon="🛑">
            Correto: use <strong>structured logging</strong> com campos marcados (<InlineCode>@pii</InlineCode>) e
            redaction explícita no <em>sink do código</em>, não no agent. Datadog Sensitive Data Scanner é{' '}
            <em>guarda-corpo</em>, não estratégia.
          </Callout>
        </Section>

        <Section title="Métricas de saúde de PII Discovery" accent={accent}>
          <KeyValue
            accent={accent}
            items={[
              { k: 'PII detected per 1k LOC', v: 'Tendência mensal; queda indica que ROPA está estabilizando' },
              { k: 'FP rate', v: '< 5% após calibração; acima disso, dev ignora alerta' },
              { k: 'Mean time to remediate', v: 'Dias da detecção ao merge da correção; alvo: < 7d para HIGH' },
              { k: 'PII em prod fora de schema declarado', v: 'Macie/DLP em S3, BigQuery — alvo: zero' },
              { k: 'Cobertura de scan', v: '% de buckets/datasets escaneados nas últimas 24h' },
            ]}
          />
        </Section>

        <Section title="Recursos canônicos" accent={accent}>
          <KeyValue
            accent={accent}
            items={[
              {
                k: 'Bearer',
                v: (
                  <a href="https://github.com/Bearer/bearer" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
                    github.com/Bearer/bearer
                  </a>
                ),
              },
              {
                k: 'Microsoft Presidio',
                v: (
                  <a href="https://github.com/microsoft/presidio" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
                    github.com/microsoft/presidio
                  </a>
                ),
              },
              {
                k: 'Privado',
                v: (
                  <a href="https://github.com/Privado-Inc/privado" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
                    github.com/Privado-Inc/privado
                  </a>
                ),
              },
              {
                k: 'AWS Macie',
                v: (
                  <a href="https://aws.amazon.com/macie/" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
                    aws.amazon.com/macie
                  </a>
                ),
              },
              {
                k: 'GCP DLP',
                v: (
                  <a href="https://cloud.google.com/sensitive-data-protection" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
                    cloud.google.com/sensitive-data-protection
                  </a>
                ),
              },
              { k: 'OWASP ASVS V8', v: 'Data Protection Requirements — referência cruzada com LGPD' },
            ]}
          />
        </Section>
      </div>
    </ModuleLayout>
  );
}
