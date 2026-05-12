import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, DecisionBox, StackFlow } from '@/components/article/primitives';

export const metadata = getModuleMetadata('secret-scanning-pre-commit');

const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença prática entre gitleaks e trufflehog?',
    options: [
      'São o mesmo software',
      'gitleaks: foco em padrões (regex + entropia) sobre commits e working tree; rápido e bom para pre-commit. trufflehog: além de regex, faz VERIFICAÇÃO do secret (testa se o token AWS/GitHub/Stripe ainda funciona via API call) — alta confiança, mas mais lento. Combine: gitleaks no pre-commit, trufflehog no CI',
      'gitleaks só funciona em GitLab',
      'Trufflehog não escaneia código',
    ],
    correct: 1,
    explanation:
      'gitleaks (github.com/gitleaks/gitleaks) — Go, rápido, regex-based + entropy. trufflehog (github.com/trufflesecurity/trufflehog) — Go, 700+ detectors com verificação ativa. GitHub Advanced Security (GHAS) cobre push protection nativa para secrets de partners.',
  },
  {
    question: 'Por que secret hardcoded em código JS bundled é "remediado" pela rotação, não pela remoção do código?',
    options: [
      'Não precisa rotacionar',
      'Uma vez commitado, está no histórico git imutavelmente. Build pipelines, mirrors, forks, caches de CI, IDE recents, package registries (npm, Docker Hub) já têm cópias. A única defesa é tratar o secret como comprometido: REVOKE/ROTATE imediato. Remover o arquivo do HEAD não remove o segredo da cadeia',
      'JS bundled é seguro',
      'Apenas remover o arquivo basta',
    ],
    correct: 1,
    explanation:
      'Mantra: "se vazou, está vazado". Rotação primeiro, BFG depois. Limpeza de histórico (BFG Repo-Cleaner, git filter-repo) só vale para cleanup cosmético; força-push só funciona se nenhum fork/clone copiou.',
  },
  {
    question: 'Quando GitHub Advanced Security (GHAS) Secret Scanning é melhor que ferramenta OSS no CI?',
    options: [
      'Nunca',
      'GHAS tem partnership com 100+ provedores (AWS, GCP, Azure, Stripe, OpenAI, Snowflake) que ACEITAM webhooks de revogação automática quando GitHub detecta token deles vazado. Detecção happens push-side (push protection bloqueia o push). OSS local detecta mas não revoga. Para org grande, GHAS reduz MTTR de horas para segundos',
      'Apenas em GitHub Free',
      'Não tem advantage',
    ],
    correct: 1,
    explanation:
      'GHAS Push Protection (GA jun/2023) bloqueia push contendo token de partner. Auto-revogation: AWS, Stripe, GitHub PAT, Slack, npm, Atlassian. Stack OSS é complementar, não substituto, em orgs grandes.',
  },
  {
    question: 'AWS Macie comparado a gitleaks/trufflehog — qual problema cada um resolve?',
    options: [
      'Todos fazem a mesma coisa',
      'gitleaks/trufflehog: secrets em CÓDIGO (git history, working tree, CI logs). Macie: PII em S3 (data at rest) — descobre CPF/email/cartão em buckets, dashboards de exposição, integra com EventBridge. Você precisa dos dois — secret scanning é diferente de PII scanning',
      'gitleaks substitui Macie',
      'Macie escaneia git',
    ],
    correct: 1,
    explanation:
      'Macie é DLP gerenciado para S3 e DynamoDB. Secret scanning é DLP para repositórios git. Funções diferentes, ambas necessárias. GCP DLP equivalente para GCS/BigQuery.',
  },
  {
    question: 'O que BFG Repo-Cleaner faz e quando usar?',
    options: [
      'Compila o código',
      'Reescreve histórico git removendo arquivos/strings específicas (10-100x mais rápido que git filter-branch). Use após rotação do secret, para limpar referências em clones futuros. AINDA EXIGE force-push (--force) e coordenação com todo o time (nova base de clone). Não dá "des-vazamento" se já há forks',
      'É só um linter',
      'Cria backups',
    ],
    correct: 1,
    explanation:
      'rtyley.github.io/bfg-repo-cleaner. Alternativa moderna: git filter-repo (mantido oficialmente). Sempre após rotação do segredo, nunca antes. Force-push em main exige bypass de branch protection — registre no audit log.',
  },
  {
    question: 'Allowlist em scanner — quando faz sentido e quando vira buraco?',
    options: [
      'Sempre permitir tudo',
      'Allowlist legítima: hash de exemplo em README, mock token em teste, exemplo em documentação. Use comentário inline (#gitleaks:allow) ou arquivo .gitleaksignore com hash do commit. Buraco: allowlist sem revisão de PR (=disable scanner). Política: cada item allowlisted exige aprovação de revisor sênior e comentário com justificativa',
      'Allowlist é proibido',
      'Sempre 100% strict',
    ],
    correct: 1,
    explanation:
      'Cada bypass vira dívida técnica. Use specificity: hash do achado, não regex global. Revise allowlist trimestralmente. gitleaks v8+ tem --baseline-path para snapshot inicial em repos legacy.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="secret-scanning-pre-commit"
      title="Secret scanning: gitleaks, trufflehog, GitHub Advanced Security"
      icon="🔑"
      xp={50}
      readTime={10}
      trailName="Privacy & Compliance Engineering"
      trailColor={accent}
      nextSlug="anpd-incident-response"
      nextTitle="ANPD incident response: 72h para notificar, como não fritar"
      quiz={quiz}
    >
      <div className="flex flex-col gap-8 text-sm leading-7">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Secret vazado em git é o incidente mais comum e o mais subestimado. Em 2024, GitGuardian reportou{' '}
          <strong>23 milhões de secrets</strong> detectados em commits públicos. Para LGPD: token AWS = chave do reino;
          se atacante acessa S3 com PII, vira incidente notificável (Art. 48). Defesa em camadas: pre-commit, CI,
          push protection, scan periódico, rotação programada.
        </p>

        <Section title="Camadas — onde scaning entra" accent={accent}>
          <StackFlow
            accent={accent}
            title="Defense in depth para secrets"
            items={[
              { icon: '✍️', label: 'Pre-commit', sub: 'Local', detail: 'gitleaks pre-commit hook — bloqueia commit antes do push. Falha rápida.', connector: 'Push' },
              { icon: '🚥', label: 'Push protection', sub: 'GitHub GHAS', detail: 'Servidor recusa push com partner secret detectado. Auto-revogação em parceiros (AWS, Stripe).', connector: 'Aceito' },
              { icon: '🤖', label: 'CI scan', sub: 'PR', detail: 'gitleaks ou trufflehog full history em PR. SARIF integrado ao GitHub.', connector: 'Merge' },
              { icon: '📚', label: 'Scan periódico', sub: 'Diário', detail: 'trufflehog em todo o histórico, todos os repos. Cron ou GHAS.', connector: 'Drift' },
              { icon: '🌐', label: 'Cloud DLP', sub: 'S3/GCS', detail: 'Macie, GCP DLP para PII em data — complementar.', connector: 'Alert' },
              { icon: '🚨', label: 'Rotação', sub: 'On detection', detail: 'KMS, Secrets Manager, Vault — rotate automático onde possível.' },
            ]}
          />
        </Section>

        <Section title="gitleaks — pre-commit + CI" accent={accent}>
          <CodeBlock lang="yaml" filename=".pre-commit-config.yaml">
{`repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.21.2
    hooks:
      - id: gitleaks
        args: ['protect', '--staged', '--verbose']
# Instale: pipx install pre-commit && pre-commit install`}
          </CodeBlock>
          <CodeBlock lang="yaml" filename=".gitleaks.toml">
{`title = "Acme custom rules"

[extend]
useDefault = true

# Custom rule: nosso token interno tem prefixo acme_
[[rules]]
id = "acme-internal-token"
description = "Acme internal API token"
regex = '''acme_(?:test|live)_[A-Za-z0-9]{32}'''
keywords = ["acme_test_", "acme_live_"]
entropy = 3.5

# Allowlist controlada — exemplo em README
[allowlist]
description = "documentation examples"
paths = [
  '''^docs/.*\\.md$''',
]
commits = ["abc123...", "def456..."]  # hashes específicos`}
          </CodeBlock>
          <CodeBlock lang="yaml" filename=".github/workflows/secrets.yml">
{`name: Secret Scan
on: [pull_request]
permissions:
  contents: read
  security-events: write
jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: \${'$'}{{ secrets.GITHUB_TOKEN }}
          GITLEAKS_LICENSE: \${'$'}{{ secrets.GITLEAKS_LICENSE }}  # gitleaks-action é gratuita para repos públicos`}
          </CodeBlock>
        </Section>

        <Section title="trufflehog — verificação ativa do secret" accent={accent}>
          <p>
            Diferencial: para 700+ detectors, trufflehog faz <strong>verified scan</strong> — testa via API se o secret
            ainda funciona. Reduz drasticamente FP e prioriza remediação.
          </p>
          <CodeBlock lang="bash" filename="ci/scripts/trufflehog.sh">
{`#!/usr/bin/env bash
set -euo pipefail

# Scan completo do histórico em PR; --only-verified retorna só secrets validados
trufflehog git file://. \\
  --only-verified \\
  --no-update \\
  --json > /tmp/findings.json

count=$(jq '. | length' /tmp/findings.json)
if [ "$count" -gt 0 ]; then
  echo "❌ $count secret(s) verificado(s) encontrado(s):"
  jq -r '.[] | "  - \\(.DetectorName) em \\(.SourceMetadata.Data.Git.file):\\(.SourceMetadata.Data.Git.line)"' /tmp/findings.json
  exit 1
fi`}
          </CodeBlock>
          <Callout tone="info" icon="📚">
            <a href="https://github.com/trufflesecurity/trufflehog" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
              github.com/trufflesecurity/trufflehog
            </a>{' '}
            — escaneia git, S3, GCS, filesystem, Docker images, Postman, Jira, Confluence. Suporte a custom detectors em
            Go.
          </Callout>
        </Section>

        <Section title="GitHub Advanced Security — push protection" accent={accent}>
          <p>
            GHAS expande para Push Protection (jul/2024 GA para todos os repos públicos gratuito). Para repos privados,
            requer licença. Detecta no momento do push e bloqueia. Para tokens de partners (AWS, Stripe, npm, OpenAI),
            o GitHub notifica o provider que <strong>revoga automaticamente</strong>.
          </p>
          <ComparisonTable
            accent={accent}
            headers={['Recurso', 'GHAS', 'gitleaks OSS', 'trufflehog OSS']}
            rows={[
              ['Push protection (block na origem)', 'Sim', 'Não (só pre-commit cliente-side)', 'Não'],
              ['Auto-revogação em parceiros', 'Sim (100+ providers)', 'Não', 'Não'],
              ['Detectors verificados (API call)', 'Limitado', 'Não', 'Sim (700+)'],
              ['Patterns custom', 'Sim (Enterprise)', 'Sim (TOML)', 'Sim (Go)'],
              ['Dashboard centralizado', 'Sim (Security tab)', 'Manual', 'Manual'],
              ['Custo', 'Licença per-committer', 'Gratuito', 'Gratuito'],
              ['Histórico antigo', 'Sim', 'Sim', 'Sim'],
            ]}
          />
        </Section>

        <Section title="Quando o secret JÁ vazou — playbook" accent={accent}>
          <FlowDiagram
            accent={accent}
            title="Resposta a secret vazado"
            orientation="vertical"
            steps={[
              { icon: '🔔', label: 'Detecção', desc: 'Alerta de gitleaks/trufflehog/GHAS/auditoria interna' },
              { icon: '🚨', label: 'Trate como comprometido', desc: 'Mesmo se "apagou rápido". Histórico, forks, cache CI já copiaram' },
              { icon: '🔄', label: 'Rotação imediata', desc: 'KMS rotate, Secrets Manager rotate, Vault rotate. Para AWS: ELEVE access analyzer, veja uso recente do token, considere CloudTrail' },
              { icon: '🔍', label: 'Forense', desc: 'CloudTrail/Audit Logs: o token foi USADO entre vazamento e revogação? Por quem? De onde?' },
              { icon: '🧼', label: 'Cleanup', desc: 'BFG ou git filter-repo para reescrever histórico (cosmético). Force-push em main com coordenação' },
              { icon: '📋', label: 'Notificação', desc: 'Se uso indevido confirmado e PII afetada → ANPD em 72h (Art. 48). Sem indício, registrar incidente interno' },
              { icon: '🛡️', label: 'Post-mortem', desc: 'Como vazou? Por que pre-commit não pegou? Add detector novo, treine time' },
            ]}
          />
        </Section>

        <Section title="BFG Repo-Cleaner — reescrita de histórico" accent={accent}>
          <CodeBlock lang="bash" filename="bfg-cleanup.sh">
{`#!/usr/bin/env bash
# Pré-condição: secret JÁ FOI ROTACIONADO. BFG é cleanup cosmético.
set -euo pipefail

# 1. Clone bare do repo
git clone --mirror git@github.com:acme/app.git
cd app.git

# 2. Coloque o secret em um arquivo
cat > ../secrets.txt <<EOF
AKIAIOSFODNN7EXAMPLE
wJalrXUtnFEMI/K7MDENG/bCYEXAMPLEKEY
EOF

# 3. Roda BFG (substitui por ***REMOVED***)
java -jar bfg-1.14.0.jar --replace-text ../secrets.txt

# 4. Limpa reflog e GC
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force-push (coordene com time! Branch protection requer bypass)
git push --force

# 6. Avise o time para reclone:
#   "git fetch + git reset --hard origin/main não basta — faça fresh clone"`}
          </CodeBlock>
          <Callout tone="warn" icon="⚠️">
            BFG <strong>não des-vaza</strong>. Forks, clones locais, caches de CI, IDE recents, Docker images do build —
            todos guardam cópias. Rotação é a única remediação real. Trate BFG como faxina, não como cura.
          </Callout>
        </Section>

        <Section title="Anti-pattern: .env commitado" accent={accent}>
          <KeyValue
            accent={accent}
            items={[
              { k: '.env / .env.local', v: 'Sempre em .gitignore. Adicione ao template "git config core.excludesfile"' },
              { k: '.env.example', v: 'OK commitar — apenas keys com valores fake (xxx). gitleaks reconhece padrão' },
              { k: 'Secret em CI YAML', v: 'NUNCA hardcoded. Use GitHub secrets, GitLab variables, ou OIDC + IAM role' },
              { k: 'Secret em Dockerfile ARG', v: 'Anti-pattern — fica no histórico da imagem. Use build secrets (--mount=type=secret) ou runtime injection' },
              { k: 'Secret em build args do CDK/Terraform', v: 'Use AWS Secrets Manager + IAM. Não interpole secret no template' },
              { k: 'Print/console.log de objeto com secret', v: 'Logs ficam em CloudWatch/Datadog — vira vazamento. Configure structured logging com redaction' },
            ]}
          />
        </Section>

        <Section title="Decisão: stack de scanning" accent={accent}>
          <DecisionBox
            scenario="Startup ~10 devs, monorepo, repos privados no GitHub, orçamento limitado"
            winner="gitleaks pre-commit + gitleaks-action em PR + GHAS Push Protection (gratuito para parceiros)"
            winnerColor={accent}
            why="Cobre 90% dos casos: pre-commit pega antes de push, CI pega o que escapou, GHAS Push Protection é gratuita e revoga tokens AWS/Stripe automaticamente. Trufflehog entra trimestral em scan completo do histórico para validação ativa."
            alternatives={[
              { name: 'GHAS Enterprise', when: 'Org grande (50+ devs); ROI vem do dashboard + custom patterns + reporting' },
              { name: 'GitGuardian SaaS', when: 'Quando precisa monitorar pacotes públicos (npm, PyPI) buscando seus secrets que vazaram fora' },
              { name: 'Só pre-commit', when: 'Insuficiente — pre-commit é cliente; pode ser desabilitado. Precisa de gate no servidor' },
            ]}
          />
        </Section>

        <Section title="Métricas de saúde" accent={accent}>
          <KeyValue
            accent={accent}
            items={[
              { k: 'MTTR de secret leak', v: 'Detecção → rotação completa. Alvo: < 1h com auto-revogação' },
              { k: 'Cobertura pre-commit', v: '% de devs com hook instalado (descoberta via git hook ou audit)' },
              { k: 'Allowlist size + idade', v: 'Cresce sem revisão = sinal de alerta. Revise trimestralmente' },
              { k: 'Secret push attempts (GHAS)', v: 'Tentativas bloqueadas — sinal de educação necessária' },
              { k: 'False positive rate', v: '< 5% após calibração; acima disso devs ignoram' },
            ]}
          />
        </Section>

        <Section title="Recursos canônicos" accent={accent}>
          <KeyValue
            accent={accent}
            items={[
              {
                k: 'gitleaks',
                v: (
                  <a href="https://github.com/gitleaks/gitleaks" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
                    github.com/gitleaks/gitleaks
                  </a>
                ),
              },
              {
                k: 'trufflehog',
                v: (
                  <a href="https://github.com/trufflesecurity/trufflehog" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
                    github.com/trufflesecurity/trufflehog
                  </a>
                ),
              },
              {
                k: 'GitHub Advanced Security',
                v: (
                  <a href="https://docs.github.com/en/code-security/secret-scanning" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
                    docs.github.com/en/code-security/secret-scanning
                  </a>
                ),
              },
              { k: 'BFG Repo-Cleaner', v: 'rtyley.github.io/bfg-repo-cleaner' },
              { k: 'git filter-repo', v: 'github.com/newren/git-filter-repo (recomendado pelo git oficial)' },
              { k: 'OWASP — Secrets Management Cheat Sheet', v: 'cheatsheetseries.owasp.org' },
            ]}
          />
        </Section>
      </div>
    </ModuleLayout>
  );
}
