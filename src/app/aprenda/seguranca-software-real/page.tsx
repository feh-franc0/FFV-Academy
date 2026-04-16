import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  QAItem,
  KeyValue,
  StackFlow,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Segurança de Software Real: do threat model ao SBOM — FFV Academy',
  description:
    'Segurança profissional em 2026: threat modeling STRIDE, OWASP Top 10 de verdade, secrets, supply chain (SBOM/SLSA), SAST/DAST/IAST, shift-left vs shift-right.',
};

const ACCENT = '#e3b341';

const quiz: QuizQuestion[] = [
  {
    question:
      'O que é STRIDE e por que ele importa pra dev sênior?',
    options: [
      'Um framework JavaScript',
      'Framework de threat modeling (Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege) que obriga você a pensar em cada tipo de ameaça por componente. É a forma estruturada de descobrir ameaças ANTES do código',
      'Um algoritmo de criptografia',
      'Um padrão de HTTP',
    ],
    correct: 1,
    explanation:
      'STRIDE (criado pela Microsoft) é checklist que força pensar "como esse componente pode ser atacado?" por categoria. Aplicado em design, pega falhas que custam muito caro em prod. É threat modeling leve — 30 min por feature nova.',
  },
  {
    question:
      'Qual é o risco mais subestimado em supply chain de software?',
    options: [
      'Código do time',
      'Dependência transitiva (pacote que seu pacote usa) comprometida: ex. event-stream 2018, ua-parser-js 2021, xz-utils 2024. Você não importa direto mas roda o código. Mitigação: lockfile, SBOM, SHA pin, auditoria (npm audit, Snyk, Dependabot)',
      'Código em produção',
      'Logs de deploy',
    ],
    correct: 1,
    explanation:
      'Em 2024, o backdoor em xz-utils quase comprometeu SSH global. O atacante se infiltrou como maintainer por 2 anos. Lição: SBOM, SHA pinning de actions/base images, automated vuln scanning (Dependabot/Snyk/Trivy) e revisão periódica de deps.',
  },
  {
    question:
      'Qual ferramenta encontra vulnerabilidade de SQL Injection COM MAIOR PRECISÃO em 2026?',
    options: [
      'Grep por string "SELECT"',
      'SAST moderno (CodeQL, Semgrep) entende fluxo de dados e detecta taint de input até sink perigoso. Combinado com DAST em staging + IAST em runtime, cobre o que regex nunca cobriu',
      'Apenas review manual',
      'Criar mais logs',
    ],
    correct: 1,
    explanation:
      'SAST com análise de fluxo de dados (taint analysis) rastreia de onde veio o dado até onde é usado em query. CodeQL do GitHub, Semgrep e SonarQube atuais fazem isso. Zero false positive absoluto é impossível, mas sinal/ruído melhorou muito.',
  },
  {
    question:
      'Qual é o melhor lugar para gerir secret em 2026?',
    options: [
      '.env commitado',
      'Secret manager (AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault) com acesso via identidade efêmera (IAM role, Workload Identity Federation). Secret nunca mora em repositório nem em disco sem rotação automática',
      'Variável de ambiente exportada manualmente',
      'Em logs protegidos',
    ],
    correct: 1,
    explanation:
      'Secret deve ser: (1) nunca no repo; (2) acessado via identidade efêmera (OIDC/WIF em CI, IAM role em runtime); (3) rotacionado automaticamente; (4) com audit log. .env é aceito em dev, NUNCA em prod.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="seguranca-software-real"
      title="Segurança de Software de Verdade: threat model ao SBOM"
      icon="🛡️"
      xp={90}
      readTime={19}
      trailName="Engenharia de Software Moderna"
      trailColor={ACCENT}
      nextSlug="arquitetura-software-moderna"
      nextTitle="Arquitetura Moderna: trade-offs, ADRs, C4 e evolução"
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
        Segurança não é dept de outra pessoa. É <strong>propriedade do código</strong>. Em 2026, com agents gerando muito código
        e stack distribuída por 10 vendors, atacar vira mais barato que defender. A boa notícia: as ferramentas para{' '}
        <em>shift-left</em> (prevenir em design/code) e <em>shift-right</em> (detectar em runtime) amadureceram. Este módulo
        monta o mínimo que uma pessoa sênior deve operar — sem viramentação de cerimônia.
      </p>

      <Section title="O modelo mental (Defense in Depth)" accent={ACCENT}>
        <StackFlow
          accent={ACCENT}
          title="Camadas que se defendem em sequência"
          items={[
            { icon: '🎨', label: 'Design', sub: 'threat model', detail: 'STRIDE, MITRE ATT&CK. Pense em ataques antes de codar.', connector: 'informa' },
            { icon: '⌨️', label: 'Code', sub: 'shift-left', detail: 'Linter de segurança, SAST, secret scanner em pre-commit.', connector: 'valida' },
            { icon: '🤖', label: 'CI', sub: 'gates', detail: 'SAST completo, SBOM, dependency audit, container scan.', connector: 'blinda' },
            { icon: '🚀', label: 'Deploy', sub: 'least privilege', detail: 'IAM mínimo, network policy, secrets via vault, image signing.', connector: 'observa' },
            { icon: '👁️', label: 'Runtime', sub: 'shift-right', detail: 'WAF, IAST, RASP, anomaly detection, SIEM.', connector: 'responde' },
            { icon: '🚨', label: 'Incident', sub: 'prepared', detail: 'Runbook, comunicação, forense, postmortem, lições pro threat model.' },
          ]}
        />
      </Section>

      <Section title="Threat Modeling com STRIDE" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Em reunião de design (30 min), pegue cada fluxo novo e passe a régua STRIDE. Para cada componente do diagrama,
          pergunte:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Sigla', 'Ameaça', 'Exemplo', 'Mitigação típica']}
          rows={[
            ['S', 'Spoofing', 'Atacante se passa por usuário ou serviço', 'Auth forte (MFA, mTLS), identidade verificada'],
            ['T', 'Tampering', 'Dados ou binário alterados em trânsito ou repouso', 'HTTPS, HMAC, assinatura, integridade'],
            ['R', 'Repudiation', 'Usuário nega ter feito uma ação', 'Audit log imutável, assinatura de ação'],
            ['I', 'Information disclosure', 'Vazamento de dado sensível', 'Criptografia, mascaramento, mínimo privilégio'],
            ['D', 'Denial of service', 'Indisponibilidade por ataque', 'Rate limit, WAF, autoscaling, circuit breaker'],
            ['E', 'Elevation of privilege', 'Baixo → alto privilégio', 'RBAC rigoroso, sandbox, patches'],
          ]}
        />
        <Callout tone="info">
          <strong>Quem escreve.</strong> Engenheiro responsável pela feature, em doc curto junto da spec (ver módulo SDD).
          Revisor do PR checa que ameaças relevantes foram endereçadas. Não é papel isolado de security team — é parte do
          design.
        </Callout>
      </Section>

      <Section title="OWASP Top 10 (2021, ainda vigente) em PT-BR" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'A01 Broken Access Control', v: 'Autorização falha (IDOR, path traversal, admin acessível sem papel). Hoje é o #1 em bug bounty. Teste específico pra autorização — não confie em "o front esconde o botão".' },
            { k: 'A02 Cryptographic Failures', v: 'Uso errado de crypto: ECB, MD5 em senha, JWT sem validar assinatura, HTTPS opcional. Use libs de alto nível (libsodium, Web Crypto), nunca implemente crypto.' },
            { k: 'A03 Injection', v: 'SQLi, NoSQLi, command injection, LDAP, XPath, prompt injection. Prepared statements, ORM com parâmetros, validação + sanitização.' },
            { k: 'A04 Insecure Design', v: 'Falha conceitual (sem MFA, sem rate limit, senha em logs). Threat modeling + revisão de arquitetura.' },
            { k: 'A05 Security Misconfiguration', v: 'Default credential, diretório indexado, header sem CSP/HSTS, admin panel exposto. Harden por default, security headers obrigatórios.' },
            { k: 'A06 Vulnerable Components', v: 'Dep conhecida vulnerável. Dependabot, Snyk, Trivy. SBOM obrigatório.' },
            { k: 'A07 Auth Failures', v: 'Sessão sem expiração, CSRF, brute force não limitado, recuperação de senha vulnerável. Use auth as a service (Auth0, Clerk, Cognito) quando possível.' },
            { k: 'A08 Software & Data Integrity', v: 'CI/CD inseguro, update não assinado, deserialization inseguro. SLSA, Sigstore, pickle banido para input externo.' },
            { k: 'A09 Logging & Monitoring', v: 'Sem log, sem alerta, tempo de detecção alto. Log estruturado + SIEM + detecção de anomalia.' },
            { k: 'A10 SSRF', v: 'Server-Side Request Forgery. App busca URL que atacante escolheu (metadata IMDS, rede interna). Allowlist de destinos, bloquear IPs privados.' },
          ]}
        />
      </Section>

      <Section title="Secrets: onde eles morram" accent={ACCENT}>
        <StackFlow
          accent={ACCENT}
          items={[
            { icon: '🏛️', label: 'Vault central', sub: 'source of truth', detail: 'AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault, Azure Key Vault.', connector: 'acessado por' },
            { icon: '🪪', label: 'Identidade efêmera', sub: 'sem chave estática', detail: 'IAM role em runtime, OIDC/WIF em CI. Token vive minutos.', connector: 'injeta em' },
            { icon: '📦', label: 'App em runtime', sub: 'lê em memória', detail: 'Nunca persiste em disco fora de tmpfs. Rotação periódica.', connector: 'audita' },
            { icon: '📜', label: 'Audit + Rotação', sub: 'cron', detail: 'Rotação 30-90 dias. Acesso logado. SIEM monitora padrão anômalo.' },
          ]}
        />
        <CodeBlock lang="bash">{`# Pre-commit hook: trufflehog ou gitleaks bloqueia secret antes do commit
# .pre-commit-config.yaml
- repo: https://github.com/gitleaks/gitleaks
  rev: v8.18.0
  hooks:
    - id: gitleaks

# CI
- name: Scan for secrets
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

# Em runtime (Node + AWS)
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
const client = new SecretsManagerClient({ region: 'us-east-1' });
const secret = await client.send(new GetSecretValueCommand({ SecretId: 'prod/db/password' }));
// nunca console.log(secret), nunca persiste em disco`}</CodeBlock>
        <Callout tone="danger">
          <strong>Red flags.</strong> (1) <InlineCode>.env</InlineCode> no repo. (2){' '}
          <InlineCode>console.log(process.env)</InlineCode> em dev deixado em prod. (3) Secret como variável de build que fica
          no histórico do Docker (<InlineCode>--build-arg</InlineCode> com senha → use <InlineCode>--secret</InlineCode>). (4)
          Token de service account com TTL infinito.
        </Callout>
      </Section>

      <Section title="Supply Chain: SBOM, SLSA, Sigstore" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'SBOM (Software Bill of Materials)', v: 'Lista de cada dependência direta e transitiva com versão e hash. Formatos: SPDX, CycloneDX. Gere em build (syft, cdxgen) e publique com o artefato.' },
            { k: 'SLSA (Supply-chain Levels for SA)', v: 'Framework do Google. Níveis 1-4 de garantia (source → build → provenance → two-party). SLSA 3+ é objetivo de org séria.' },
            { k: 'Sigstore / cosign', v: 'Assinar imagem Docker, artefato, módulo Go. Verificação na hora do deploy.' },
            { k: 'SHA pinning', v: 'GitHub Actions, container images, npm: fixar por SHA imutável, não por tag. Tag pode ser reassinada.' },
            { k: 'Dependency audit', v: 'Dependabot, Snyk, Trivy, Grype. Falha no CI em vuln HIGH+. Auto-PR para bump.' },
            { k: 'Rotina de revisão', v: 'Ler dependências novas no PR (quem mantém? popularidade? últimos commits?). Agent security-review do módulo anterior ajuda.' },
          ]}
        />
        <CodeBlock lang="bash">{`# Gerar SBOM
syft packages dir:. -o cyclonedx-json > sbom.json

# Scan de vuln contra SBOM
grype sbom:./sbom.json --fail-on high

# Assinar imagem Docker
cosign sign --key cosign.key ghcr.io/empresa/app:\${SHA}

# Verificar na hora do deploy (policy de admission)
cosign verify --key cosign.pub ghcr.io/empresa/app:\${SHA}`}</CodeBlock>
      </Section>

      <Section title="SAST, DAST, IAST, SCA" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Onde', 'O que pega', 'Ferramenta']}
          rows={[
            ['SAST', 'Código (static)', 'SQLi, XSS, command injection via taint analysis', 'CodeQL, Semgrep, SonarQube'],
            ['DAST', 'App rodando (black-box)', 'Vulns expostas via HTTP: XSS, injection, config', 'ZAP, Burp Suite, Nuclei'],
            ['IAST', 'App rodando (instrumentado)', 'Vulns reais com contexto de runtime', 'Contrast, Seeker'],
            ['SCA', 'Dependências', 'CVE em lib usada', 'Snyk, Dependabot, Trivy, Grype'],
            ['Fuzz', 'Código + input', 'Crash, UAF, overflow em parser', 'AFL, libFuzzer, go-fuzz, OSS-Fuzz'],
            ['Secret scan', 'Repo + commits', 'Token/chave esquecidos', 'gitleaks, trufflehog'],
            ['Container scan', 'Imagem Docker', 'Vuln em base image e binários', 'Trivy, Grype, Snyk Container'],
            ['Infra scan', 'IaC (Terraform, K8s)', 'Config errada, permissão frouxa', 'Checkov, tfsec, kubescape'],
          ]}
        />
      </Section>

      <Section title="Headers e defesas padrão" accent={ACCENT}>
        <CodeBlock lang="http">{`# Headers mínimos em toda resposta HTTP (API ou web)
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-...'; object-src 'none'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-site`}</CodeBlock>
        <Callout tone="info">
          <strong>Ferramenta.</strong> Rode <InlineCode>https://securityheaders.com</InlineCode> ou{' '}
          <InlineCode>observatory.mozilla.org</InlineCode> contra seu domínio. Grau A é pré-requisito.
        </Callout>
      </Section>

      <Section title="Autenticação e autorização sem dor" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Senha', v: 'Argon2id (OWASP recomenda) com salt por usuário. Nunca MD5/SHA1.' },
            { k: 'MFA', v: 'TOTP (Authy, Google Authenticator) + WebAuthn/Passkey como meta final.' },
            { k: 'Sessão', v: 'Cookie Secure + HttpOnly + SameSite=Lax/Strict. Expiração curta + rotation.' },
            { k: 'JWT', v: 'Assinado com RS256 ou EdDSA (nunca HS256 com secret compartilhado). Expira em minutos. Refresh token com rotation.' },
            { k: 'OAuth2/OIDC', v: 'Use provider (Auth0, Clerk, Cognito, Keycloak). Nunca implemente flow do zero.' },
            { k: 'Autorização', v: 'ABAC/RBAC bem desenhado. Teste IDOR em TODOS endpoints (usuário A tenta acessar recurso de B).' },
          ]}
        />
      </Section>

      <Section title="Dois cenários reais" accent={ACCENT}>
        <DecisionBox
          winnerColor={ACCENT}
          scenario="API nova de saúde com dados sensíveis (LGPD/PII)"
          winner="Threat model + Vault + SAST + SBOM + audit log + Data at Rest/Transit"
          why="Stack completa: STRIDE no design; AWS Secrets Manager + KMS; CodeQL no CI; SBOM publicado com artefato; audit log com HMAC de encadeamento (não-repúdio); TLS 1.3 e criptografia de coluna sensível no DB."
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Microserviço interno que consome webhook de parceiro"
          winner="HMAC + Idempotency + Rate Limit + WAF + Fuzz no parser"
          why="Input externo → trate como hostil. Validar HMAC do payload, idempotency-key, rate limit por parceiro, WAF bloqueia pattern conhecido, fuzz no parser do JSON/XML garante que input malicioso não quebra."
        />
      </Section>

      <Section title="Checklist de go-live de segurança" accent={ACCENT}>
        <ul className="flex flex-col gap-2" style={{ color: 'var(--ffv-muted)' }}>
          <li>✔ Threat model existe e foi revisado.</li>
          <li>✔ Secrets em vault + rotation + audit.</li>
          <li>✔ SAST sem HIGH/CRITICAL aberto.</li>
          <li>✔ SBOM gerado e publicado. SCA sem HIGH+ aberto.</li>
          <li>✔ Headers de segurança grau A.</li>
          <li>✔ Auth com MFA; sessão com expiração.</li>
          <li>✔ RBAC testado via testes de IDOR.</li>
          <li>✔ Rate limit + WAF em endpoints públicos.</li>
          <li>✔ Log estruturado + alerta em eventos críticos (login falho em massa, 5xx spike).</li>
          <li>✔ DR plan testado nos últimos 90 dias.</li>
          <li>✔ Runbook de incidente + contato responsável.</li>
          <li>✔ SLO e error budget conhecido.</li>
        </ul>
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Preciso de time de segurança dedicado?"
          a={
            <>
              Ajuda a partir de ~30 devs. Abaixo disso: 1 engenheiro sênior como security champion por time + parceiro externo
              pra pentest anual. Com agents modernos, um dev bom cobre 80% do que um júnior de security fazia.
            </>
          }
        />
        <QAItem
          q="Pentest anual é suficiente?"
          a="Não em 2026. Pentest anual pega a superfície atual. Dev frequente de features muda a superfície toda semana. SAST/DAST contínuo + bug bounty + threat model em cada feature nova é o mínimo pra org que mexe em dados sensíveis."
        />
        <QAItem
          q="Como lidar com CVE em dep sem fix?"
          a="Avaliar exploração real no seu contexto (CVSS não é tudo). Opções: pinar em versão segura, fork/patch temporário, isolar em processo/rede separada, remover a dep. Se nada serve, documentar risco aceito com validade."
        />
        <QAItem
          q="Agent pode fazer review de segurança?"
          a="Pode (vimos o security-review agent no módulo anterior). Mas é complemento, não substituto. Humano sênior vê o que agent não vê: contexto do negócio, lógica sutil, ataque encadeado. Use os dois."
        />
        <QAItem
          q="Certificações valem a pena?"
          a="CISSP/OSCP são sinais fortes pra profissionais de segurança dedicados. Pra dev: leia o OWASP Top 10, faça um CTF (picoCTF, HackTheBox) e entenda threat model. Vale mais que certificado."
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> (1) Segurança é responsabilidade do dev sênior — não do "time de segurança". (2) Threat
        model rápido em cada feature é barato e evita desastre. (3) Secrets em vault com identidade efêmera é inegociável em
        2026. (4) Supply chain (SBOM, SHA pin, signing) virou tão crítico quanto código próprio. (5) SAST/DAST/IAST/SCA/Fuzz
        cada um pega uma classe distinta — use em combinação. (6) Próximo e último: arquitetura moderna.
      </Callout>
    </div>
  );
}
