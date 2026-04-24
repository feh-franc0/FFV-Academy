import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, LayerStack } from '@/components/article/primitives';

const accent = '#cc785c';

export const metadata = getModuleMetadata('claude-code-multi-projeto-multi-contexto');

const quiz: QuizQuestion[] = [
  {
    question: 'Sua empresa tem um settings.json enterprise definindo deny rules obrigatórias. Seu settings.json de usuário em ~/.claude/ define um modelo padrão. O projeto tem .claude/settings.json. Você criou .claude/settings.local.json para suas preferências pessoais. Em caso de conflito (ex: modelo definido em vários), qual ganha?',
    options: [
      'O primeiro carregado sempre ganha (enterprise)',
      'O último carregado sempre ganha (settings.local.json)',
      'A hierarquia 2026 é: enterprise > user > project > local — mas "deny rules" nunca são overrideadas por níveis inferiores. Model, effort, tema vêm da mesma camada mais alta que define cada chave. settings.local.json (não commitado) sobrescreve settings.json (commitado) do projeto para suas preferências pessoais, exceto onde enterprise proibiu.',
      'Tudo é mesclado por union — não há conflito possível',
    ],
    correct: 2,
    explanation: 'A hierarquia é: enterprise (managed policy) > user (~/.claude/) > project (.claude/settings.json) > local (.claude/settings.local.json). Para chaves como model/effort/theme, o nível mais específico ganha (local sobrescreve project sobrescreve user). PORÉM, deny rules de enterprise são absolutas: níveis inferiores só podem ADICIONAR deny, nunca permitir o que enterprise negou. allowlists são merge aditivo. settings.local.json nunca é commitado (deve estar no .gitignore) e serve pra suas preferências pessoais que não viram para o time. É crítico entender isso em ambientes corporativos.',
  },
  {
    question: 'Você está trabalhando no repo A, mas precisa acessar docs do repo B (que não é submódulo) durante a sessão. Qual é a forma idiomática?',
    options: [
      'Copie os arquivos de B para dentro de A antes de rodar claude',
      'Use cd ../repoB && claude --continue — continua a sessão no outro cwd',
      'Dentro da sessão, use /add-dir /path/to/repoB (ou lançar com claude --add-dir /path/to/repoB). Claude passa a ter acesso de leitura ao repo B sem sair da sessão do repo A. Múltiplos --add-dir são permitidos.',
      'Crie um symlink em A apontando pra B — Claude segue symlinks automaticamente',
    ],
    correct: 2,
    explanation: '/add-dir (como slash command dentro da sessão) ou --add-dir (como flag ao iniciar) expande o escopo de diretórios acessíveis. Claude pode ler arquivos desse dir adicional sem você perder o contexto da sessão principal. Use múltiplos --add-dir para vários repos (monorepos cross-reference, docs em repo separado, scripts compartilhados). Permissões de escrita dependem da configuração: por padrão só leitura adicional, mas settings pode liberar Edit em paths específicos. É a forma correta de trabalho cross-repo em 2026.',
  },
  {
    question: 'Você está há 3 semanas em "migration-v2" e quer experimentar uma abordagem radicalmente diferente sem perder o trabalho atual. Qual a forma correta?',
    options: [
      '/clear para começar do zero — você perde o contexto mas começa limpo',
      'Copie manualmente todos os arquivos para uma branch nova antes de continuar',
      'Use claude --resume "migration-v2" --fork-session. Cria uma nova session-id a partir do estado atual, sem sobrescrever a original. A "migration-v2" continua intacta e retomável, enquanto a forked ganha caminho próprio.',
      'Rode /branch — cria uma branch do git mas a sessão segue igual',
    ],
    correct: 2,
    explanation: '--fork-session é a feature desenhada pra esse caso: experimentar em paralelo sem destruir a linha principal. Sem fork, um --resume retoma e continua sobrescrevendo a session-id; com fork, você ganha uma cópia independente. A original permanece clean para rollback. Dentro da sessão, /branch tem propósito similar mas diferente: cria fork da CONVERSA no ponto atual (útil pra "e se eu tivesse respondido X naquele momento"). --fork-session é pra fork no momento de retomar. Ambos aparecem agrupados no picker de sessions.',
  },
];

export default function ClaudeCodeMultiProjetoPage() {
  return (
    <ModuleLayout
      slug="claude-code-multi-projeto-multi-contexto"
      title="Multi-projeto e contextos persistentes: sessions, settings hierarchy e team onboarding"
      icon="🗂️"
      xp={80}
      readTime={16}
      trailName="Claude Code: do zero ao poder total"
      trailColor="#cc785c"
      nextSlug="harness-anatomia-do-agente"
      nextTitle="Claude Code Pro: Anatomia do harness"
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
        Dev sênior não trabalha em um repo só. Tem a feature principal em um, o hotfix em outro, a lib compartilhada em um terceiro, e o config do time numa organização enterprise. O Claude Code em 2026 resolve isso com três mecanismos: <strong>settings hierarchy</strong> (enterprise → user → project → local), <strong>sessions persistentes</strong> (retomáveis por nome, PR, ou fork) e <strong>/add-dir</strong> pra trabalho cross-repo. Junto com <code>/team-onboarding</code>, <code>/memory</code> e CLAUDE.md hierarchy, você tem um ambiente portátil que segue você entre projetos.
      </p>

      <Section accent={accent} title="Settings hierarchy: quem ganha em caso de conflito">
        <LayerStack
          accent={accent}
          title="Ordem de resolução (mais específico ganha)"
          variant="compact"
          layers={[
            { label: 'Enterprise', instruction: 'Managed policy (SSO/IDP)', note: 'Absoluto em deny rules' },
            { label: 'User', instruction: '~/.claude/settings.json', note: 'Suas preferências em todo projeto' },
            { label: 'Project', instruction: '.claude/settings.json (commitado)', note: 'Política do time — git tracked' },
            { label: 'Local', instruction: '.claude/settings.local.json', note: 'Suas pref pessoais neste projeto (NÃO commite)' },
          ]}
        />
        <CodeBlock lang="json">{`// Exemplo: como as 4 camadas se combinam

// Enterprise (managed, imutável)
{
  "permissions": {
    "deny": ["Bash(curl:*)", "Bash(npm publish:*)"]
  },
  "sandbox": {
    "network": { "deniedDomains": ["*.suspeito.com"] }
  }
}

// User (~/.claude/settings.json)
{
  "model": "claude-opus-4-7",
  "effortLevel": "high",
  "theme": "dark"
}

// Project (.claude/settings.json — commitado)
{
  "defaultMode": "plan",
  "permissions": {
    "allow": ["Bash(npm test:*)", "Read(**)", "Edit(src/**)"]
  },
  "hooks": { /* automação do time */ }
}

// Local (.claude/settings.local.json — NÃO commitado)
{
  "model": "claude-sonnet-4-6",      // override pessoal
  "statusLine": { /* seu statusline */ }
}

// Resultado efetivo na sua sessão:
// - deny rules: Bash(curl:*), Bash(npm publish:*) (enterprise)
// - allow: Bash(npm test:*), Read(**), Edit(src/**) (project)
// - model: claude-sonnet-4-6 (local sobrescreve user)
// - effortLevel: high (user)
// - theme: dark (user)
// - defaultMode: plan (project)
// - hooks do project + statusLine do local
// - sandbox.network.deniedDomains: enterprise (imutável)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Controle explícito com --setting-sources">
        <CodeBlock lang="shell">{`# Carregar APENAS settings específicas (útil em CI):
claude --setting-sources project            # ignora user + local
claude --setting-sources user,project       # padrão
claude --setting-sources ''                 # ignora todas (usa defaults)

# Caso de uso em CI:
# Você quer que o pipeline use EXATAMENTE as regras do projeto,
# sem poluição do user local do runner:
claude -p "revise este diff" \\
  --setting-sources project \\
  --allowedTools "Read" \\
  --output-format json

# Outro caso: experimentar config alternativa
claude --settings ./config-experimental.json
# Usa esse arquivo, ignora hierarchy padrão`}</CodeBlock>
      </Section>

      <Section accent={accent} title="CLAUDE.md hierarchy: contexto em camadas">
        <CodeBlock lang="shell">{`# Hierarquia de CLAUDE.md (todas carregadas):
~/.claude/CLAUDE.md                    # Global — todos os projetos
/path/to/project/CLAUDE.md             # Project root (prioritário)
/path/to/project/.claude/CLAUDE.md     # Alt location, equivalente

# Auto-discovery: ao abrir arquivo em subdir, Claude sobe a árvore
# e carrega CLAUDE.md de cada nível até a raiz do projeto

# Exemplo de divisão:
# ~/.claude/CLAUDE.md → suas preferências pessoais universais
#   "Sempre explique raciocínio antes de propor código"
#   "Prefira Python 3.12 syntax com type hints"
#   "Nunca use black — eu uso ruff format"

# /path/to/projeto-A/CLAUDE.md → contexto do projeto A
#   "Stack: Next.js 16 + Tailwind + Supabase"
#   "Não usar next/image — build é estático"
#   "Deploy: npm run build && bash scripts/deploy.sh"

# /path/to/projeto-A/src/api/CLAUDE.md → contexto específico desse módulo
#   "Este módulo segue padrão Result<T,E> — não usar try/catch"
#   "Validação via zod, nunca yup"

# /memory comando:
/memory          # UI pra view/edit CLAUDE.md + auto-memory entries
# Auto-memory (2026): Claude aprende padrões das sessões e grava
# em memory/ files (não no CLAUDE.md). Você controla o que persiste.`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Sessions nomeadas: persistência e retomada">
        <CodeBlock lang="shell">{`# Criar sessão com nome:
claude --name "migration-v2"
# (alias: -n "migration-v2")

# Retomar depois:
claude --resume "migration-v2"           # por nome
claude --resume <uuid>                    # por UUID
claude -r "migration-v2"                  # short form
claude -c                                 # continue última sessão deste cwd

# Retomar uma sessão linkada a PR:
claude --from-pr 123                      # pesca sessões associadas ao PR

# Sem destruir a original (experimentar em paralelo):
claude --resume "migration-v2" --fork-session
# Novo session-id, estado copiado; original intacta

# Picker interativo:
claude --resume                           # sem argumento → picker
# Controles do picker:
#   Ctrl+A   widening (mostra mais sessões)
#   Ctrl+W   filtra só worktrees
#   Ctrl+B   filtra por branch
#   Space    preview da conversa
#   Enter    retoma
#   Ctrl+R   rename
#   /        search por texto

# Forked sessions aparecem agrupadas visualmente no picker
# → você vê a "árvore de experimentos" a partir de uma sessão-pai

# Exportar e arquivar:
/export session-archive.txt               # exporta como texto
# Útil pra post-mortems, handoff pra outro dev, documentação

# Sessions são gravadas em:
# ~/.claude/sessions/<uuid>/
# Com transcript em JSONL + metadata`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Trabalho cross-repo com --add-dir">
        <CodeBlock lang="shell">{`# Cenário 1: Monorepo federado
# Você está no cwd do repo app-frontend, mas precisa dos schemas
# que moram no repo shared-types em um path adjacent
claude --add-dir ../shared-types \\
       --add-dir ../shared-utils \\
       --name "frontend-work"

# Claude agora tem acesso a:
# - ./src, ./tests (cwd padrão)
# - ../shared-types (adicional, leitura por padrão)
# - ../shared-utils (adicional)

# Dentro da sessão, expandir mais:
/add-dir /Users/me/code/documentation
# Adiciona em tempo real; permanece até /clear ou fim da sessão

# Cenário 2: Consultar docs externos
# Você está em projeto-A e quer referência de projeto-B (read-only)
claude --add-dir /path/to/projeto-B \\
       --permission-mode plan
# --plan evita edição acidental no outro repo

# Cenário 3: Scripts compartilhados por toda a org
# ~/.claude/CLAUDE.md aponta pra /opt/org-scripts
claude --add-dir /opt/org-scripts
# /deploy-standard, /monitoring-alert, etc. disponíveis em toda sessão`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Team onboarding automatizado">
        <CodeBlock lang="shell">{`# Scenario: novo dev entra no time. Ao invés de enviar 3 docs + slack,
# você roda:
/team-onboarding

# O que acontece:
# Claude Code analisa:
# - CLAUDE.md do projeto (convenções, stack, gotchas)
# - .claude/settings.json (permissions, hooks, statusline)
# - .claude/skills/ (slash commands do time)
# - .claude/agents/ (subagents customizados)
# - Últimos commits e PRs (padrões recentes)
# - package.json, tsconfig, eslint config (stack real)

# Gera um GUIA em markdown com:
# 1. Setup rápido: o que instalar, como clonar, primeiros comandos
# 2. Skills disponíveis e quando usar cada uma
# 3. Subagents customizados e seus propósitos
# 4. Convenções de código específicas desse time
# 5. Hooks ativos e o que acontece automaticamente
# 6. Fluxo de PR/review padronizado
# 7. Gotchas documentados

# O novo dev ganha um onboarding consistente, atualizado
# (gerado do código-fonte atual, não de wiki defasada)

# Commite o output:
/team-onboarding > docs/ONBOARDING.md
git add docs/ONBOARDING.md
git commit -m "chore: atualizar guia de onboarding (gerado por /team-onboarding)"`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Padrões de workflow multi-contexto">
        <ComparisonTable
          headers={['Cenário', 'Comando']}
          rows={[
            ['Começar o dia continuando o que estava ontem', 'claude -c'],
            ['Retomar sessão específica de 2 semanas atrás', 'claude --resume "feature-X"'],
            ['Experimentar abordagem nova sem destruir trabalho', 'claude --resume "X" --fork-session'],
            ['Preciso de docs do repo vizinho (leitura)', 'claude --add-dir ../docs --permission-mode plan'],
            ['Nova feature em branch isolada', 'claude --worktree feature-Y --name "feat-Y"'],
            ['Debug de um PR aberto', 'claude --from-pr 456'],
            ['Explorar codebase sem risco de editar', 'claude --permission-mode plan --agent Explore'],
            ['Contexto limpo mas mantendo ~/.claude/', 'claude --clear + /add-dir'],
            ['Boot rápido sem discovery (query one-shot)', 'claude --bare -p "pergunta"'],
            ['Share task list entre projetos', 'export CLAUDE_CODE_TASK_LIST_ID=my-team'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="Gotchas do multi-contexto (ordem de prioridade)">
        <CodeBlock lang="text">{`1. settings.local.json — SEMPRE no .gitignore
   Se você commitar por acidente, há chance de vazar caminhos
   locais, API keys (não devem estar lá, mas erros acontecem),
   preferências que confundem outros devs.

2. Enterprise > tudo — entenda as deny rules
   Se você tenta algo em CI e é bloqueado, verifique
   política enterprise antes de debugar app code.

3. --setting-sources em CI é essencial
   Runner pode ter ~/.claude/ contaminado com config de outro
   cliente. --setting-sources project isola.

4. CLAUDE.md descoberto em subdirs pode conflitar com root
   Se adicionar CLAUDE.md específicos por módulo, teste que
   contextualiza bem sem anular instrução global.

5. --add-dir não expande permissions automaticamente
   Por padrão, leitura no dir adicional. Pra escrita, configure
   explicitamente em settings: Edit(/path/to/other/repo/**).

6. Forks proliferam: limpe sessions antigas
   --resume picker fica congestionado. Use /export pra arquivar
   sessões importantes e delete as obsoletas de
   ~/.claude/sessions/ periodicamente.

7. /add-dir dentro da sessão é cumulativo
   Se adicionar 5 dirs cresce context de discovery. /clear
   ou encerrar e reabrir com flags certas é mais limpo.`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>O ambiente portátil:</strong> ~/.claude/CLAUDE.md + ~/.claude/settings.json + ~/.claude/skills/ seguem você entre projetos — é a sua &ldquo;personalidade&rdquo; com o Claude Code. .claude/ do projeto é a &ldquo;personalidade do time&rdquo;. Sessions persistentes + --worktree + --add-dir são o que permite trabalhar em N frentes simultâneas sem friction. /team-onboarding transforma esse ambiente em documentação viva e atualizada automaticamente. É o estado-da-arte de trabalhar com IA em times profissionais.
      </Callout>

      <Callout>
        Você completou a trilha 13. Próximo nível: <strong>Claude Code Pro — Harness Engineering</strong>, onde saímos de &ldquo;usar Claude Code&rdquo; para &ldquo;construir o agente customizado&rdquo;: system prompt engineering, plugins, SDK em produção, hooks cookbook executivo e mais.
      </Callout>
    </div>
  );
}
