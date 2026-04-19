import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, FlowDiagram } from '@/components/article/primitives';

const accent = '#7c3aed';

export const metadata = getModuleMetadata('harness-anatomia-do-agente');

const quiz: QuizQuestion[] = [
  {
    question: 'O que significa, na prática, "harness" no contexto do Claude Code?',
    options: [
      'É o nome do modelo de IA que roda por trás (Claude Opus 4.7 é o harness padrão)',
      'O harness é o conjunto de engrenagens que envolve o LLM para transformá-lo em um agente operacional: system prompt, ferramentas disponíveis, política de permissões, hooks de ciclo de vida, skills, subagents, formato de output e statusline. O modelo (Claude) é um componente; o harness é tudo ao redor.',
      'Harness é sinônimo de CLI — significa apenas que você usa via terminal em vez de API',
      'É o nome técnico do contrato de entrega MCP — a forma como tools externos são expostos',
    ],
    correct: 1,
    explanation: 'Harness é o termo técnico para a infraestrutura que transforma um LLM (que só gera tokens) em um agente operacional (que decide, age e itera). Inclui: system prompt (instruções base), ferramentas (o que pode fazer), permissões (o que pode fazer sem perguntar), hooks (o que acontece automaticamente em eventos), skills (workflows reutilizáveis), subagents (delegação), output format e statusline (UX). O Claude Code tem harness opinioso mas CUSTOMIZÁVEL em cada eixo — é isso que permite adaptar a ferramenta a times e domínios específicos.',
  },
  {
    question: 'Qual dos seguintes NÃO faz parte do harness do Claude Code?',
    options: [
      'A arquitetura interna dos transformers que compõem o modelo Claude Opus 4.7',
      'O arquivo .claude/settings.json com permissions',
      'O CLAUDE.md na raiz do projeto',
      'Os hooks configurados em settings.json e em skills',
    ],
    correct: 0,
    explanation: 'A arquitetura interna do modelo (transformers, attention, MoE) é o LLM em si — não parte do harness. O harness é tudo ao redor do modelo que você pode customizar: settings.json (permissions, hooks, statusline), CLAUDE.md (instruções/contexto), skills, subagents, plugins. Você não muda os pesos do Claude; você muda como ele é invocado, o que ele pode fazer, como se comporta em eventos. Essa distinção é crítica: harness engineering é alta alavancagem (altera muito com pouco esforço); model fine-tuning é baixa alavancagem para a maioria dos casos.',
  },
  {
    question: 'Qual a diferença entre customizar CLAUDE.md e customizar skills/hooks/settings?',
    options: [
      'CLAUDE.md é equivalente a skills — apenas uma sintaxe diferente',
      'CLAUDE.md é instrução textual (comportamental) que Claude pode seguir ou interpretar flexivelmente. Skills/hooks/settings são mecanismos determinísticos: hooks rodam sempre (runtime-enforced), settings restringem tools/paths, skills são workflows invocáveis. Você usa CLAUDE.md para contexto e preferências; usa hooks/settings quando a regra precisa ser garantida.',
      'CLAUDE.md só funciona em projetos TypeScript; os outros funcionam em qualquer linguagem',
      'CLAUDE.md é deprecated — em 2026 tudo foi substituído por skills',
    ],
    correct: 1,
    explanation: 'A distinção é fundamental em harness engineering. CLAUDE.md é soft: instruções que Claude lê e INTERPRETA. Bom para convenções, stack, preferências. Pode ser ignorado em edge cases. Já hooks/settings/skills são hard: o runtime do Claude Code enforcea. Se um hook retorna exit 2 em PreToolUse Bash, a ação É bloqueada — não importa o que Claude quer fazer. Se settings.json define deny rules, elas VALEM. Skills são invocadas explicitamente. A regra prática: se você precisa GARANTIR algo (segurança, compliance, automação), use harness mechanisms. Se quer ORIENTAR comportamento (estilo de código, tom de PR), use CLAUDE.md.',
  },
];

export default function HarnessAnatomiaPage() {
  return (
    <ModuleLayout
      slug="harness-anatomia-do-agente"
      title="Anatomia do harness: o que é e o que dá pra customizar"
      icon="🗺️"
      xp={70}
      readTime={14}
      trailName="Claude Code Pro: Harness Engineering"
      trailColor={accent}
      nextSlug="harness-system-prompt-output-styles"
      nextTitle="System prompt, output styles e statusline"
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
        Um LLM, puro, só gera tokens. O que transforma Claude em um <em>agente</em> que lê arquivos, edita código, roda comandos, delega subagents, bloqueia ações perigosas e integra com Slack é o <strong>harness</strong> — a camada de engenharia ao redor do modelo. O Claude Code vem com harness opinioso mas radicalmente customizável em 7 eixos. Harness engineering é a disciplina de moldar esses eixos pro seu domínio, seu time, suas garantias. Esta trilha cobre os 7.
      </p>

      <Section accent={accent} title="Os 7 eixos de customização do harness">
        <FlowDiagram
          orientation="vertical"
          accent={accent}
          steps={[
            { icon: '🧠', label: '1. System prompt', desc: 'Instruções base + personalidade' },
            { icon: '🛠️', label: '2. Available tools', desc: 'Whitelist/blacklist de capacidades' },
            { icon: '🔐', label: '3. Permissions', desc: 'Allow/ask/deny rules (allowlist granular)' },
            { icon: '🪝', label: '4. Hooks', desc: '24+ eventos com 4 tipos de execução' },
            { icon: '⚡', label: '5. Skills', desc: 'Workflows com frontmatter + scripts' },
            { icon: '🤖', label: '6. Subagents', desc: 'Delegação com worktree isolation' },
            { icon: '🎨', label: '7. Output & UX', desc: 'Styles, statusline, themes, IDE integration' },
          ]}
        />
      </Section>

      <Section accent={accent} title="Por que customizar: três casos reais">
        <CodeBlock lang="text">{`━━━ Caso 1: Equipe de DevSecOps ━━━━━━━━━━━━━━━━━━━━━━━━
Problema: devs usam Claude Code em infra, mas pode acidentalmente
          deletar recursos de produção, exfiltrar secrets, etc.
Harness:
  - settings.json com deny rules agressivas (Bash(terraform apply:*) no ask)
  - Hook PreToolUse que valida presence de tag "prod-approved" em PRs
  - Skill /infra-change com checklist obrigatório
  - Subagent "security-reviewer" rodando em paralelo
Resultado: devs produtivos com rede de segurança determinística

━━━ Caso 2: Startup Full-Stack ━━━━━━━━━━━━━━━━━━━━━━━━
Problema: onboarding de novos devs leva 2 semanas,
          convenções ficam em wiki desatualizada.
Harness:
  - CLAUDE.md detalhado com stack + convenções + gotchas
  - Skills customizadas: /commit (padrão), /pr (template), /deploy (script)
  - Hook PostToolUse que roda lint automaticamente
  - Plugin compartilhado "our-stack-v2" distribuído para todos
Resultado: onboarding em 3 dias, convenções uniformes

━━━ Caso 3: Agência de Consultoria ━━━━━━━━━━━━━━━━━━━━
Problema: cada cliente tem stack diferente, precisa de agentes
          especializados por domínio (fintech, healthtech, ecom).
Harness:
  - settings.json por cliente em .claude/ (commitado no repo do cliente)
  - Subagents especializados: "pci-auditor", "hipaa-reviewer"
  - Output style customizado com header do cliente + compliance tag
  - MCP servers específicos (stripe, plaid, epic-fhir)
Resultado: um Claude Code adaptado por domínio, reusable por projeto`}</CodeBlock>
      </Section>

      <Section accent={accent} title="O mapa: onde cada eixo é configurado">
        <ComparisonTable
          headers={['Eixo', 'Arquivo/config', 'Granularidade']}
          rows={[
            ['System prompt', '--system-prompt, --append-system-prompt, --system-prompt-file', 'Por sessão ou flag persistente'],
            ['Tools disponíveis', '--allowedTools, permissions.allow em settings', 'Tool + pattern (Bash(git *))'],
            ['Permissions', 'settings.json (enterprise/user/project/local)', 'Tool+pattern, hierarquia com deny absoluta'],
            ['Hooks', 'settings.json.hooks + skill.hooks', '24+ eventos, 4 tipos (command/http/prompt/agent)'],
            ['Skills', '.claude/skills/*/SKILL.md (+scripts, refs)', 'Frontmatter rico: allowed-tools, context:fork, paths, hooks'],
            ['Subagents', '.claude/agents/*/AGENT.md', 'Frontmatter: tools, model, effort, isolation:worktree, skills:'],
            ['Output & UX', 'settings.json (statusLine, theme) + output-styles/', 'Global, por projeto ou por skill'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="Soft vs hard: quando usar cada mecanismo">
        <CodeBlock lang="text">{`┌───────────────────────────────────────────────────────────────────┐
│  SOFT — Claude interpreta e pode adaptar                         │
├───────────────────────────────────────────────────────────────────┤
│  CLAUDE.md       → contexto, stack, convenções, preferências      │
│  System prompt   → personalidade, tom, estilo de explicação       │
│  Skill prompt    → workflow desejado (mas não enforceado)         │
│                                                                   │
│  Use quando: orientar comportamento, padronizar output,           │
│              comunicar contexto que não muda com runtime          │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│  HARD — Runtime enforça independente de Claude                   │
├───────────────────────────────────────────────────────────────────┤
│  Permissions     → allow/deny absolutas                          │
│  Hooks           → exit 2 bloqueia, JSON decision:"deny" bloqueia │
│  --allowedTools  → whitelist de tools (fora dela: proibido)      │
│  Sandbox network → deniedDomains intransponíveis                 │
│                                                                   │
│  Use quando: segurança, compliance, automação garantida,         │
│              reduzir variância de comportamento                   │
└───────────────────────────────────────────────────────────────────┘

Exemplo: "não fazer git push sem revisar"
  Soft:  CLAUDE.md → "sempre confirme antes de git push"  (Claude PODE ignorar)
  Hard:  permissions.ask: Bash(git push:*)                (runtime FORÇA prompt)
  Hard+: hook PreToolUse que abre PR em vez de push       (substitui a ação)

Regra: risco baixo e preferência → soft. Segurança e compliance → hard.`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Ordem de prioridade: quem ganha em cada eixo">
        <CodeBlock lang="text">{`Enterprise managed policy        ⟵ ABSOLUTO em deny/sandbox
    ↓ (sobrescreve abaixo)
User (~/.claude/settings.json)   ⟵ suas prefs universais
    ↓
Project (.claude/settings.json)  ⟵ time (commitado)
    ↓
Local (.claude/settings.local.json)  ⟵ suas prefs neste projeto
    ↓ (mais específico ganha)

Permission-mode runtime override (Shift+Tab na sessão):
    plan → acceptEdits → default → auto → bypassPermissions
    (só até onde enterprise permitir)

CLAUDE.md hierarchy (TODAS carregadas):
  ~/.claude/CLAUDE.md               (user global)
  <projeto>/CLAUDE.md               (root do projeto)
  <projeto>/.claude/CLAUDE.md       (alt, equivalente)
  <projeto>/<subdir>/CLAUDE.md      (contexto específico do subdir)

Skills:
  enterprise skills > personal > project > plugin (com namespace)
  nome duplicado: último da lista acima ganha`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Mapa mental do harness:</strong> pense no Claude Code como um motor de agente com 7 interruptores ajustáveis. Você não muda o motor (o LLM), mas muda tudo ao redor. Nos próximos 6 módulos, atacamos cada eixo em profundidade. Ao final desta trilha, você não vai estar usando Claude Code — você vai estar ENGENHEIRANDO o seu agente customizado, versionado, distribuível para o time, e com garantias hard onde precisa e flexibilidade soft onde cabe.
      </Callout>

      <Callout>
        Próximo: <strong>System prompt, output styles e statusline</strong> — o primeiro eixo, a voz e o visual do agente. Como usar <code>--system-prompt</code> para construir personalidade, output styles para padronizar saída, statusline customizado pra informação ambiental e themes para o visual.
      </Callout>
    </div>
  );
}
