import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#cc785c';

export const metadata = getModuleMetadata('claude-code-github-integration');

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre usar Claude Code com o MCP do GitHub versus simplesmente usar Claude Code em um repositório Git local?',
    options: [
      'Não há diferença — Claude Code tem acesso ao GitHub automaticamente quando detecta um remote origin',
      'Com MCP do GitHub, Claude pode interagir com a API do GitHub: criar/comentar em PRs, ler/criar issues, gerenciar labels, e acessar o histórico de PRs e reviews. Sem MCP, Claude só vê o repositório local — sem contexto do que está aberto no GitHub.',
      'MCP do GitHub é necessário apenas para repositórios privados — repositórios públicos são acessados automaticamente',
      'Com MCP do GitHub, Claude pode fazer push diretamente ao repositório remoto — sem MCP só pode commitar localmente',
    ],
    correct: 1,
    explanation: 'Claude Code sem MCP vive no mundo local: arquivos, git log, git diff — tudo que está na sua máquina. O MCP do GitHub abre a camada de metadados do repositório remoto: PRs abertos, seus comentários, issues linkadas, histórico de reviews, quem aprovou o quê. Isso muda o que Claude pode fazer: em vez de apenas editar código, Claude pode ler "PR #42 tem feedback do revisor pedindo refatoração" e endereçar esse feedback. É a diferença entre um agente local e um agente integrado ao workflow de equipe.',
  },
  {
    question: 'Você quer que Claude Code revise um PR automaticamente sempre que for aberto. Qual é a melhor abordagem?',
    options: [
      'Configurar Claude Code com o MCP do GitHub e usar um hook PostToolUse para detectar novos PRs',
      'Combinar Claude Code CLI em modo não-interativo com GitHub Actions: o workflow da action chama claude --headless com contexto do PR e posta o resultado como comentário no PR.',
      'Usar um webhook do GitHub que chama a API do Claude diretamente — sem o Claude Code CLI',
      'Claude Code não suporta automação de revisão de PRs — é uma limitação do produto',
    ],
    correct: 1,
    explanation: 'A integração para automação de PR review usa Claude Code em modo headless/não-interativo chamado pelo GitHub Actions. O workflow: (1) PR é aberto → Actions dispara, (2) o job baixa o diff do PR, (3) chama `claude --headless "Revise este PR: [diff]"`, (4) pega o output e posta como comentário no PR via GitHub CLI (`gh pr comment`). Isso é poderoso porque você pode usar todo o poder do Claude Code — com CLAUDE.md do projeto, ferramentas, contexto — em um pipeline automatizado.',
  },
  {
    question: 'Ao usar Claude Code para fazer triage de issues do GitHub, qual informação é mais importante passar para o contexto do agente?',
    options: [
      'Apenas o título da issue — Claude consegue inferir a gravidade pelo título',
      'O histórico completo de issues dos últimos 6 meses — para comparar padrões',
      'O conteúdo da issue (título, descrição, labels existentes, comentários), o código relevante do repositório se identificável, e os critérios de triage da equipe (o que é bug, feature, won\'t fix).',
      'Apenas as issues sem label — as com label já foram triadas',
    ],
    correct: 2,
    explanation: 'Triage de qualidade requer contexto completo: o que o issue diz, o contexto do código afetado, e os critérios da equipe. Sem os critérios da equipe, Claude aplica critérios genéricos que podem não refletir as prioridades do projeto. Sem o código relevante, Claude não consegue verificar se o bug descrito é reproduzível ou se já foi corrigido. A combinação de issue + código + critérios permite triage que se comporta como um membro experiente da equipe, não como um bot genérico.',
  },
];

export default function ClaudeCodeGithubIntegrationPage() {
  return (
    <ModuleLayout
      slug="claude-code-github-integration"
      title="Claude Code + GitHub: PRs, issues e code review automatizados"
      icon="🐙"
      xp={70}
      readTime={14}
      trailName="Claude Code: do zero ao poder total"
      trailColor="#cc785c"
      nextSlug="claude-code-sdk"
      nextTitle="Claude Agent SDK: usar Claude Code como biblioteca"
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
        Claude Code integrado ao GitHub transforma o agente de uma ferramenta local em parte do workflow de equipe. Com o MCP do GitHub, Claude pode ler e comentar em PRs, triagem issues, gerar changelogs automaticamente e conduzir code review — tudo com contexto do repositório real, não apenas do código local.
      </p>

      <Section accent={accent} title="Configurando o MCP do GitHub">
        <CodeBlock>{`# Instalar o servidor MCP oficial do GitHub
# via npx (sem instalação permanente):
npx @modelcontextprotocol/server-github

# Ou instalar globalmente:
npm install -g @modelcontextprotocol/server-github

# Configurar em .claude/mcp.json do projeto:
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "\${GITHUB_TOKEN}"
      }
    }
  }
}

# Gerar um Personal Access Token (PAT) com permissões:
# - repo (ler/escrever repositórios)
# - pull_requests (ler/comentar PRs)  ← mínimo necessário
# - issues (ler/criar/comentar issues)

# Configurar no ambiente:
export GITHUB_TOKEN="ghp_seu_token_aqui"
# ou adicionar ao .env (não commite!)

# Verificar que o MCP está conectado:
claude
> "Liste os últimos 5 PRs abertos neste repositório"`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Code review assistido por Claude">
        <CodeBlock>{`# Revisar um PR específico com Claude:

# Método 1: via MCP do GitHub (mais contexto)
"Revise o PR #47. Foque em:
 1. Bugs potenciais ou edge cases não tratados
 2. Consistência com os padrões do projeto (leia o CLAUDE.md)
 3. Performance — há N+1 queries ou loops desnecessários?
 4. Segurança — input validation, SQL injection, XSS
 Não comente em estilo/formatação — só em substância."

# Claude vai: ler o diff do PR, ler o código afetado,
# comparar com o resto do codebase, e gerar um review
# com comentários específicos por linha

# Método 2: via git diff local (sem MCP)
git fetch origin pull/47/head:pr-47
git diff main...pr-47 | claude --headless \
  "Revise este diff. Identifique bugs, edge cases e
   problemas de segurança. Seja direto e específico."

# Postar o review como comentário no PR:
REVIEW=$(git diff main...pr-47 | claude --headless \
  "Revise este diff tecnicamente. Output em Markdown.")
gh pr comment 47 --body "$REVIEW"`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Triage de issues automático">
        <CodeBlock>{`# Triage de issue com Claude + MCP GitHub:

"Para cada issue aberta sem label neste repositório:
 1. Leia o título e descrição
 2. Determine se é: bug, feature-request, question, ou won't-fix
 3. Para bugs, determine severidade: critical/high/medium/low
 4. Sugira uma label e uma pessoa responsável se houver padrão

 Critérios de triage deste projeto:
 - Bug crítico: afeta dados do usuário ou causa downtime
 - Bug alto: funcionalidade principal quebrada para >10% dos usuários
 - Feature: melhoria nova, não quebra existente
 - Won't fix: fora do escopo do produto"

# Claude vai:
# 1. Listar issues abertas sem label via MCP GitHub
# 2. Para cada uma, ler o conteúdo
# 3. Propor label + responsável + justificativa

# Para aplicar as labels automaticamente:
# Claude pode usar a ferramenta de label do MCP GitHub
# (se você der permissão explícita no CLAUDE.md ou na sessão)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Code review automatizado com GitHub Actions">
        <CodeBlock>{`# .github/workflows/claude-review.yml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]
    # só PRs que tocam código (não docs)
    paths:
      - 'src/**'
      - 'tests/**'

jobs:
  claude-review:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write  # para comentar no PR

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # histórico completo para diff

      - name: Get PR diff
        id: diff
        run: |
          git fetch origin main
          DIFF=$(git diff origin/main...HEAD -- '*.ts' '*.tsx' '*.py' | head -c 15000)
          echo "diff<<EOF" >> $GITHUB_OUTPUT
          echo "$DIFF" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Claude review
        id: review
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          REVIEW=$(echo "\${{ steps.diff.outputs.diff }}" | \\
            npx claude --headless \\
            "Faça code review técnico deste diff. Identifique:
             1. Bugs ou comportamentos incorretos
             2. Edge cases não tratados
             3. Problemas de segurança
             4. Issues de performance óbvios
             Responda apenas com problemas reais — sem comentários
             positivos, sem estilo. Se não há problemas, diga apenas:
             'Sem problemas críticos identificados.'
             Formato: [arquivo:linha] Problema — Sugestão")
          echo "review=$REVIEW" >> $GITHUB_OUTPUT

      - name: Post review comment
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          gh pr comment \${{ github.event.pull_request.number }} \\
            --body "## Claude Code Review

\${{ steps.review.outputs.review }}

*Gerado automaticamente — revise antes de agir*"`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Geração automática de changelog">
        <CodeBlock>{`# Gerar changelog a partir de commits e PRs mesclados:

"Analise os commits desde a tag v1.2.0 e gere um CHANGELOG.md.
 Para cada mudança:
 - Agrupe por: Breaking Changes, Features, Bug Fixes, Chores
 - Para cada item: descrição em 1 linha + PR number se disponível
 - Tom: técnico mas legível por não-devs
 Use o formato Keep a Changelog (https://keepachangelog.com)"

# Claude vai:
# 1. Ler git log desde a tag especificada
# 2. (Com MCP GitHub) ler os PRs correspondentes para contexto extra
# 3. Gerar o CHANGELOG formatado

# Automatizar via script:
VERSION="v1.3.0"
git log v1.2.0..HEAD --oneline | \\
  claude --headless \\
  "Gere um CHANGELOG para versão $VERSION a partir desses commits.
   Formato Keep a Changelog. Agrupe: Breaking/Features/Fixes/Chores.
   Output apenas o Markdown do changelog, sem explicação." \\
  > CHANGELOG_NEW.md`}</CodeBlock>
        <ComparisonTable
          headers={['Tarefa GitHub', 'Com MCP', 'Sem MCP (git local)']}
          rows={[
            ['Code review de PR', 'Acessa PR diretamente, pode comentar', 'Precisa fazer fetch do branch + postar via gh CLI'],
            ['Triage de issues', 'Lê issues direto da API', 'Não disponível sem MCP'],
            ['Changelog', 'Contexto de PRs + commits', 'Apenas commits (git log)'],
            ['Verificar CI status', 'Lê checks e workflows via API', 'Não disponível sem MCP'],
          ]}
          accent={accent}
        />
      </Section>

      <Callout tone="success">
        <strong>GitHub + Claude Code = workflow de equipe aumentado.</strong> O que antes exigia um dev senior revisando cada PR, triando issues manualmente e gerando changelog na mão, agora acontece com um comando. A qualidade do output depende da qualidade das instruções — invista tempo em definir os critérios do seu projeto.
      </Callout>

      <Callout>
        Próximo: <strong>Claude Cowork</strong> — a plataforma da Anthropic para tarefas agendadas, pesquisa em escala e plugins especializados além do terminal.
      </Callout>
    </div>
  );
}
