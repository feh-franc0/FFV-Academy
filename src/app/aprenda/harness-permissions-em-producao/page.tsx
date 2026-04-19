import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#7c3aed';

export const metadata = getModuleMetadata('harness-permissions-em-producao');

const quiz: QuizQuestion[] = [
  {
    question: 'Você tem enterprise policy que define "Bash(curl:*)" no deny. Um desenvolvedor adiciona "Bash(curl:*)" no allow do settings.json local. O que acontece?',
    options: [
      'Allow local ganha — settings mais específicos sobrescrevem',
      'As duas regras coexistem — Claude pergunta a cada uso',
      'Enterprise deny é ABSOLUTO — níveis inferiores não podem sobrescrever deny rules de enterprise. A regra local é efetivamente ignorada. Essa é a garantia que permite compliance em empresas grandes.',
      'O settings.json local falha ao carregar com erro',
    ],
    correct: 2,
    explanation: 'A hierarquia de settings em 2026 preserva uma garantia crítica: enterprise deny rules são absolutas. Níveis inferiores (user, project, local) podem ADICIONAR denies adicionais, mas nunca PERMITIR o que enterprise negou. Isso é o que viabiliza adoção em ambientes regulados: a equipe de segurança define guardrails no enterprise policy, e devs individuais têm liberdade dentro daquele espaço. Allow rules são aditivas normalmente, mas o conjunto efetivo de denies é a UNION de todos os níveis — e deny sempre vence allow no mesmo nível.',
  },
  {
    question: 'O comando "find src/ -exec rm {} \\;" é matchado por qual regra em 2026?',
    options: [
      'Bash(find:*) matcha e é auto-aprovado se estiver no allow',
      'Bash(find:*) NÃO auto-aprova comandos com -exec ou -delete em 2026. A expansão do matcher trata -exec/-delete como ação separada que requer sua própria regra explícita. rm via find segue o mesmo tratamento de rm direto — você precisa allow para Bash(rm:*) também.',
      'Só Bash(rm:*) é verificado — find é sempre permitido',
      'find com -exec é sempre negado, independente de regras',
    ],
    correct: 1,
    explanation: 'Uma correção de segurança crítica em 2026: permissions reconhecem que find -exec/-delete são formas de executar outros comandos. Bash(find:*) não mais auto-aprova essas variantes. Similar para sudo/env/watch/ionice/setsid — eles são tratados como wrappers e a regra deve matchar o comando inner. Se você quer permitir "find src/ -exec ls {} \\;", adicione tanto Bash(find:*) quanto Bash(ls:*), ou use um matcher específico Bash(find * -exec ls:*). Essa mudança eliminou uma classe inteira de bypass acidental.',
  },
  {
    question: 'Qual a forma mais eficiente de reduzir prompts repetitivos sem comprometer segurança?',
    options: [
      '--dangerously-skip-permissions em todas as sessões',
      'Rodar /fewer-permission-prompts: scaneia transcripts históricos, identifica comandos aprovados consistentemente, gera allowlist específica (Bash(git status), Bash(npm test:*)) em .claude/settings.json. Você revisa, edita se necessário, e commita. Time inteiro ganha fluidez sem bypass total.',
      'Adicionar Bash(*) no allow — o wildcard cobre tudo',
      'Rodar com --permission-mode bypassPermissions sempre que possível',
    ],
    correct: 1,
    explanation: '/fewer-permission-prompts é a solução idiomática de 2026 para o pain de prompts repetitivos. Ele é inteligente: analisa sua aprovação histórica, identifica patterns específicos (não wildcards), sugere regras granulares (Bash(git status) em vez de Bash(git:*)), e gera allowlist que você revisa antes de commitar. Preserva segurança porque é granular e auditável. Muito superior a wildcards amplos (Bash(*)) ou bypass total (--dangerously-skip-permissions), que eliminam guardrails e são incompatíveis com compliance em times profissionais.',
  },
];

export default function HarnessPermissionsPage() {
  return (
    <ModuleLayout
      slug="harness-permissions-em-producao"
      title="Permissions em produção: allowlist, deny rules, sandbox e auto mode"
      icon="🔐"
      xp={85}
      readTime={17}
      trailName="Claude Code Pro: Harness Engineering"
      trailColor={accent}
      nextSlug="harness-skills-avancado-com-scripts"
      nextTitle="Skills avançadas: scripts, dynamic context e hooks scoped"
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
        Permission engineering é o eixo mais importante em ambientes profissionais. O time precisa de fluidez (não aprovar git status 40 vezes por dia) <em>e</em> garantias (nunca rodar curl num ambiente corporativo). Em 2026 o Claude Code oferece allowlist granular com patterns, deny rules absolutas por camada, sandbox de rede, reconhecimento de wrappers, auto mode com classifier e <code>/fewer-permission-prompts</code> pra gerar políticas do uso real. Este módulo mostra como construir uma política defensável que não trava ninguém.
      </p>

      <Section accent={accent} title="Allowlist granular: patterns que cobrem 80% do workflow">
        <CodeBlock lang="json">{`// .claude/settings.json — allowlist típica de projeto ativo
{
  "permissions": {
    "allow": [
      // Git read-only (nunca-pergunta)
      "Bash(git status)",
      "Bash(git status --porcelain)",
      "Bash(git diff)",
      "Bash(git diff:*)",
      "Bash(git log)",
      "Bash(git log:*)",
      "Bash(git branch)",
      "Bash(git branch:*)",
      "Bash(git blame:*)",
      "Bash(git show:*)",

      // Git write-safe
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git stash:*)",
      "Bash(git switch:*)",

      // NPM/PNPM seguros
      "Bash(npm test)",
      "Bash(npm test:*)",
      "Bash(npm run lint:*)",
      "Bash(npm run build)",
      "Bash(npm run typecheck)",
      "Bash(pnpm:*)",

      // File operations
      "Read(**)",
      "Glob(**)",
      "Grep(**)",
      "Edit(src/**)",
      "Edit(tests/**)",
      "Edit(docs/**)",
      "Write(src/**)",
      "Write(tests/**)",

      // Dev tools
      "Bash(ls:*)",
      "Bash(cat:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(wc:*)",
      "Bash(pwd)",
      "Bash(which:*)"
    ],
    "ask": [
      // Write-risco: pede confirmação sempre
      "Bash(git push)",
      "Bash(git push:*)",
      "Bash(docker:*)",
      "Bash(npm install:*)",
      "Bash(pnpm install:*)",
      "Edit(package.json)",
      "Edit(Dockerfile)",
      "Edit(.github/**)"
    ],
    "deny": [
      // Proibido absoluto
      "Bash(rm -rf:*)",
      "Bash(sudo:*)",
      "Bash(curl:*)",
      "Bash(wget:*)",
      "Bash(ssh:*)",
      "Bash(git push --force:*)",
      "Bash(git push -f:*)",
      "Bash(git reset --hard:*)",
      "Bash(npm publish:*)",
      "Bash(terraform apply:*)",
      "Edit(.env*)",
      "Edit(**/secrets/**)",
      "Edit(**/credentials/**)",
      "Write(/etc/**)",
      "Write(~/.ssh/**)",
      "Write(~/.aws/**)",
      "Write(~/.gnupg/**)"
    ]
  }
}`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Padrões de pattern matching">
        <ComparisonTable
          headers={['Pattern', 'Matcha', 'Não matcha']}
          rows={[
            ['Bash(git status)', '"git status"', '"git status --porcelain"'],
            ['Bash(git status:*)', '"git status", "git status -s", "git status --porcelain"', '"git statusfoo"'],
            ['Bash(git:*)', 'qualquer subcomando git', 'comandos sem git'],
            ['Bash(npm test:*)', '"npm test", "npm test -- --watch"', '"npm run test" (diferente!)'],
            ['Read(**)', 'qualquer path', '—'],
            ['Edit(src/**)', '"src/a/b.ts"', '"tests/a.ts"'],
            ['Edit(src/**/*.ts)', '"src/a.ts", "src/a/b.ts"', '"src/a.py"'],
            ['Edit(!src/legacy/**)', 'fora de src/legacy/', 'src/legacy/**'],
          ]}
          accent={accent}
        />
        <Callout tone="warn">
          <strong>Mudança crítica em 2026:</strong> <code>Bash(find:*)</code> NÃO mais auto-aprova <code>find -exec</code> ou <code>-delete</code> — são tratados como ações separadas. Similar: <code>sudo/env/watch/ionice/setsid</code> matchados corretamente como wrappers (não bypass do match do comando inner).
        </Callout>
      </Section>

      <Section accent={accent} title="Sandbox de rede: deniedDomains como última linha">
        <CodeBlock lang="json">{`// Evita exfiltração mesmo se Claude for enganado por prompt injection
{
  "sandbox": {
    "network": {
      "deniedDomains": [
        "pastebin.com",
        "transfer.sh",
        "ngrok.io",
        "*.ngrok.io",
        "*.glitch.me",
        "webhook.site",
        "ipinfo.io",
        "*.tunnel.dev"
      ]
    }
  }
}

// Qualquer conexão a esses domínios é bloqueada no nível do sandbox,
// independente de Claude ter ou não permissão para Bash(curl:*).
// Camada de defesa em profundidade: deny rules bloqueiam curl;
// sandbox bloqueia o destino mesmo que curl fosse permitido.

// Caso real: dev instala ferramenta suspeita que usa ngrok.io para exfiltrar.
// Mesmo sem saber, sandbox bloqueia a conexão.`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Permission modes: plan → auto → bypassPermissions">
        <ComparisonTable
          headers={['Modo', 'Comportamento', 'Quando usar']}
          rows={[
            ['plan', 'Read-only + planning, nunca edita/executa', 'Exploração inicial, research'],
            ['default', 'Pergunta pra ações de risco (padrão)', 'Dev local seguro'],
            ['acceptEdits', 'Auto-aprova Edit/Write; pergunta pra Bash', 'Iteração rápida em feature'],
            ['auto', 'Classifier decide: pergunta só em alto risco', 'Dev experiente, projeto conhecido'],
            ['bypassPermissions', 'Aprova TUDO — sandbox/container only', 'Docker descartável, nunca local'],
          ]}
          accent={accent}
        />
        <CodeBlock lang="shell">{`# Iniciar com modo específico:
claude --permission-mode plan                # exploração
claude --permission-mode acceptEdits         # dev de feature
claude --permission-mode auto                # dev experiente

# Durante a sessão, Shift+Tab cicla modos
# (só até onde enterprise policy permitir)

# bypassPermissions em sandbox isolado:
docker run --rm -v $(pwd):/workspace anthropic/claude-code \\
  --permission-mode bypassPermissions \\
  -p "rode testes e corrija falhas" \\
  --max-budget-usd 5

# Default para projeto (em settings.json):
{
  "defaultMode": "plan"
}
# Dev começa em plan toda vez → segurança por padrão`}</CodeBlock>
      </Section>

      <Section accent={accent} title="/fewer-permission-prompts: políticas do uso real">
        <CodeBlock lang="shell">{`# No projeto onde você já usa Claude Code:
/fewer-permission-prompts

# O que acontece:
# 1. Claude Code analisa transcripts históricos (últimas N sessões)
# 2. Identifica comandos que você aprovou consistentemente
#    (ex: "git diff" aprovado 47/47 vezes = candidato forte)
# 3. Identifica comandos ocasionalmente aprovados
#    (ex: "docker run" aprovado 8/20 = provavelmente NÃO incluir)
# 4. Gera proposta em formato:

{
  "permissions": {
    "allow": [
      "Bash(git status)",           // aprovado 47× sem exceção
      "Bash(git diff:*)",           // aprovado 47× sem exceção
      "Bash(npm test:*)",           // aprovado 23× sem exceção
      "Bash(pnpm:*)",               // aprovado 31× sem exceção
      "Read(**)",                   // nunca causou problema
      "Glob(**)",
      "Grep(**)"
    ],
    "ask": [
      "Bash(docker:*)"              // às vezes aprovado, às vezes não
    ]
  }
}

# 5. Você revisa, edita, e o Claude Code oferece commitar.
# 6. Próximas sessões: reduction dramática de prompts repetitivos.

# Rodar periodicamente:
# - A cada 2 semanas em projeto ativo
# - Após onboard de nova feature/stack
# - Quando novos padrões se estabilizam`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Enterprise policy: a camada inviolável">
        <CodeBlock lang="json">{`// Managed via SSO/IDP, distribuída automaticamente para todos os devs
// Localização: varia por OS (macOS: /Library/Application Support/ClaudeCode/)
// Devs NÃO podem editar; administração central controla.

{
  "permissions": {
    "deny": [
      "Bash(curl:*)",               // nunca egresso HTTP
      "Bash(wget:*)",
      "Bash(ssh:*)",
      "Bash(scp:*)",
      "Bash(rsync:*)",
      "Bash(nc:*)",
      "Bash(netcat:*)",
      "Bash(npm publish:*)",        // nunca publish em npm
      "Bash(pnpm publish:*)",
      "Bash(docker push:*)",        // nunca push em registry
      "Bash(git push --force:*)",
      "Bash(git push -f:*)",
      "Write(/etc/**)",
      "Write(~/.ssh/**)",
      "Write(~/.aws/**)",
      "Write(~/.kube/**)"
    ]
  },
  "sandbox": {
    "network": {
      "deniedDomains": [
        "pastebin.com",
        "*.ngrok.io",
        "*.tunnel.dev",
        "webhook.site",
        "transfer.sh"
      ]
    }
  },
  "disableSkillShellExecution": false,    // skills com !\`cmd\` permitidas
  "forceRemoteSettingsRefresh": true      // devs não podem cachear policy antiga
}

// Propriedades INVIOLÁVEIS:
// - denies enterprise são aditivos (não sobrescrevíveis)
// - sandbox.network.deniedDomains é ABSOLUTO
// - flags como disableSkillShellExecution vencem níveis inferiores

// Distribuição: admin central push via MDM/GPO/Intune.
// Devs veem via /doctor se estão em compliance.`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Permission engineering balanceada:</strong> allowlist granular para fluidez do dia-a-dia (<code>/fewer-permission-prompts</code> gera do uso real). Deny rules absolutas para guardrails (rm -rf, curl, sudo). Ask para ações com impacto moderado (push, docker). Sandbox.network.deniedDomains para defender contra prompt injection. Enterprise policy como camada inviolável em ambientes regulados. Auto mode com classifier para dev experiente. Plan mode como default para novos projetos. Resultado: time produtivo com compliance garantido.
      </Callout>

      <Callout>
        Próximo: <strong>Skills avançadas</strong> — o quarto eixo. Skills com pastas completas (scripts/, reference.md), frontmatter rico (<code>allowed-tools</code>, <code>context: fork</code>, <code>agent:</code>, <code>paths</code>), dynamic context injection com <code>!`cmd`</code>, hooks scoped que só rodam durante a skill. A diferença entre scripts glorificados e workflows profissionais.
      </Callout>
    </div>
  );
}
