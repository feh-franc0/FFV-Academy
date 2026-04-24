import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('supply-chain-security');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é "dependency confusion"?',
    options: [
      'Bug em npm install',
      'Atacante publica no REGISTRO PÚBLICO (npm.com) uma lib com o mesmo nome de uma lib privada sua (ex: @empresa/internal-lib). Se o resolver está mal-configurado, puxa a pública — com código malicioso',
      'Duas versões de package',
      'Conflito de peer dependency',
    ],
    correct: 1,
    explanation: 'Ataque real (2021, Alex Birsan). Se seu .npmrc não especifica scope → registry privado explicitamente, pip/npm/etc. preferem versão pública mais nova. Defesa: sempre `@scope:registry=https://private.com/` no .npmrc; usar GitHub Packages ou Artifactory com scope protegido.',
  },
  {
    question: 'O que é SBOM e por que importa?',
    options: [
      'Bill of Materials — inventário de todas as deps (transitive incluído), em formato padrão (CycloneDX, SPDX). Permite responder "estou vulnerável ao CVE X?" em segundos',
      'Apenas documentação',
      'Formato proprietário',
      'Só pra auditoria financeira',
    ],
    correct: 0,
    explanation: 'SBOM (Software Bill of Materials) lista TUDO que tá rodando (nome, versão, licença, hash). Executive Order 14028 (US, 2021) tornou requerimento para gov. CycloneDX (OWASP) é o formato dominante. Gerar com `syft`, consumir com `grype` pra scan de CVEs.',
  },
  {
    question: 'O que sigstore resolve?',
    options: [
      'Cache de dependências',
      'Assinatura verificável de artefatos sem gerenciar chaves PGP — usa OIDC (GitHub/Google) pra identidade, cosign pra assinar, rekor como transparency log. Permite "prove que este binário veio desta pipeline, não de atacante"',
      'Compress de imagem Docker',
      'Monitoring de pipeline',
    ],
    correct: 1,
    explanation: 'sigstore (Linux Foundation) é o "Let&apos;s Encrypt de assinatura de software". cosign assina container image / artifact com short-lived cert. fulcio emite cert baseado em OIDC. rekor é log público imutável. Zero gerenciamento de chave. npm provenance (2023) usa sigstore.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="supply-chain-security"
      title="Supply chain: SBOM, sigstore e dependency confusion"
      icon="📦"
      xp={60}
      readTime={13}
      trailName="Security Engineering"
      trailColor={accent}
      nextSlug="zero-trust-e-mtls"
      nextTitle="Zero Trust e mTLS: verificar sempre, nunca confiar na rede"
      quiz={quiz}
    >
      <Section title="Por que supply chain virou o front principal" accent={accent}>
        <p>
          SolarWinds (2020, Rússia injetou backdoor em update), Log4Shell (2021, lib ubíqua), XZ backdoor (2024, maintainer malicioso por anos), eslint-scope (2018, token roubado de maintainer) — todos ataques via dependência, não via código seu. Atacante moderno prefere subir na árvore: comprometer 1 lib popular vale milhares de alvos.
        </p>
      </Section>

      <Section title="Defesas em camadas" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>Lockfiles commitados</strong>: package-lock.json/pnpm-lock.yaml fixam hash. <InlineCode>npm ci</InlineCode> em CI (não install) — falha se lockfile divergir.</li>
          <li><strong>Audit regular</strong>: <InlineCode>npm audit</InlineCode>, Dependabot/Renovate automatizado com security updates auto-merge.</li>
          <li><strong>SBOM no build</strong>: gerar com syft, publicar junto com release, scanear com grype.</li>
          <li><strong>Signature verification</strong>: npm provenance (2023) mostra badge verificado pras libs de CI público.</li>
          <li><strong>Scope protegido</strong>: <InlineCode>@empresa</InlineCode> em registro privado; .npmrc com mapeamento.</li>
          <li><strong>Scanning continuous</strong>: Snyk, Socket.dev (catches malicious behavior, não só CVE), Trivy pra container.</li>
          <li><strong>Freezing em produção</strong>: postinstall scripts podem executar código. <InlineCode>--ignore-scripts</InlineCode> em CI, whitelist dos scripts que podem rodar.</li>
        </ul>
      </Section>

      <Section title="SBOM hands-on" accent={accent}>
        <CodeBlock lang="bash">{`# Gerar SBOM do projeto Node
syft packages dir:. -o cyclonedx-json > sbom.json

# Scan de vulnerabilidades conhecidas
grype sbom:./sbom.json

# Para container:
syft packages docker:my-image:latest -o cyclonedx-json
grype docker:my-image:latest

# CI step (.github/workflows/sec.yml):
- uses: anchore/sbom-action@v0
- uses: anchore/scan-action@v3
  with:
    sbom: sbom.json
    fail-build: true
    severity-cutoff: high`}</CodeBlock>
      </Section>

      <Section title="sigstore + cosign" accent={accent}>
        <CodeBlock lang="bash">{`# CI assina imagem com OIDC do GitHub Actions
- name: Sign container
  run: cosign sign --yes ghcr.io/org/app@$DIGEST

# Identidade fica em rekor (transparency log) automaticamente:
# cert subject: https://github.com/org/app/.github/workflows/ci.yml@refs/heads/main

# Deploy verifica antes de subir
cosign verify \\
  --certificate-identity-regexp='https://github.com/org/app/.github/workflows/ci.yml@.*' \\
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com \\
  ghcr.io/org/app@$DIGEST`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Zero chave pra gerenciar. Identidade vem do OIDC da pipeline. Se atacante rouba token de GitHub Actions, ainda assim o rekor tem registro imutável do que foi assinado legitimamente.
        </Callout>
      </Section>

      <Section title="Checklist realista pra time pequeno" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>☐ Lockfile commitado + <InlineCode>npm ci</InlineCode> em CI.</li>
          <li>☐ Dependabot/Renovate ativo com auto-merge de patches.</li>
          <li>☐ <InlineCode>npm audit --production</InlineCode> como gate de PR.</li>
          <li>☐ gitleaks/trufflehog em pre-commit.</li>
          <li>☐ SBOM gerado por build (syft action).</li>
          <li>☐ grype em CI como gate de deploy.</li>
          <li>☐ Scope privado protegido (se relevante).</li>
          <li>☐ <InlineCode>--ignore-scripts</InlineCode> em install de CI + whitelist manual.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
