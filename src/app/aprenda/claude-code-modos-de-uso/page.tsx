import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#cc785c';

export const metadata = getModuleMetadata('claude-code-modos-de-uso');

const quiz: QuizQuestion[] = [
  {
    question: 'Você quer usar Claude Code em um GitHub Actions para revisar PRs automaticamente e adicionar um comentário. Qual modo usar?',
    options: [
      'Modo interativo — o Actions suporta terminal interativo via tmate',
      'Não é possível — Claude Code foi projetado exclusivamente para uso local e interativo',
      'Modo não-interativo com `--print`: `claude -p "revise este diff e retorne JSON com problemas encontrados" --output-format json`. O resultado vai para stdout e o script do Actions processa e posta o comentário no PR.',
      'Modo pipe: `git diff HEAD~1 | claude` — o diff vai via stdin e Claude responde no stdout sem flags adicionais',
    ],
    correct: 2,
    explanation: 'Para automação em CI/CD, o modo não-interativo (`-p` / `--print`) é o correto: desabilita o TUI interativo, processa o prompt e escreve em stdout. Combine com `--output-format json` para saída estruturada que scripts podem parsear. O `-p` também pode receber input via stdin: `git diff | claude -p "analise" --output-format json`. O modo pipe sem `-p` ainda tenta montar o TUI — não funciona em CI.',
  },
  {
    question: 'Qual a diferença entre passar `--allowedTools` e usar o modo `--dangerously-skip-permissions` no Claude Code?',
    options: [
      'São sinônimos — ambos desabilitam confirmações de permissão de forma equivalente',
      '`--allowedTools` especifica quais ferramentas Claude pode usar sem confirmar (lista de tools permitidas). `--dangerously-skip-permissions` desabilita TODAS as confirmações para TODAS as ferramentas — conveniente para scripts mas perigoso em ambientes sem sandbox, pois Claude pode executar qualquer comando sem aprovação.',
      '`--allowedTools` é para ambiente de desenvolvimento, `--dangerously-skip-permissions` é para produção',
      '`--allowedTools` aumenta o conjunto de ferramentas disponíveis, `--dangerously-skip-permissions` reduz para apenas leitura',
    ],
    correct: 1,
    explanation: '`--allowedTools Bash,Edit,Write` permite apenas essas ferramentas sem confirmação, mas ainda pede aprovação para outras. `--dangerously-skip-permissions` elimina todas as confirmações — Claude executa qualquer ação sem perguntar. Para scripts seguros em CI, `--allowedTools` com a lista exata é a abordagem correta. `--dangerously-skip-permissions` só faz sentido em ambientes completamente controlados (container descartável, sandbox).',
  },
  {
    question: 'Você quer processar 500 arquivos de log com Claude Code, usando um script shell. Qual abordagem é mais eficiente?',
    options: [
      'Concatenar todos os 500 arquivos em um só e passar via stdin de uma vez: `cat *.log | claude -p "analise"`',
      'Usar a API da Anthropic diretamente — Claude Code não suporta processamento em lote de múltiplos arquivos',
      'Um loop shell com Claude Code em modo não-interativo: `for f in logs/*.log; do claude -p "analise erros em: $(cat $f)" >> resultado.txt; done`. Cada arquivo é um request independente, os resultados são acumulados.',
      'Abrir uma sessão interativa e arrastar todos os arquivos de uma vez',
    ],
    correct: 2,
    explanation: 'Para processamento em lote de arquivos, o loop com `-p` é a abordagem correta. Concatenar 500 arquivos provavelmente excede o limite de contexto e não permite análise por arquivo. A API direta funcionaria mas tem mais setup. O loop com `-p` é pragmático: cada iteração é independente, você pode paralelizar com `xargs -P`, redirecionar saídas e tratar erros por arquivo. Para volumes muito grandes (milhares), a Batch API da Anthropic via SDK é mais eficiente e 50% mais barata.',
  },
];

export default function ClaudeCodeModosDeUsoPage() {
  return (
    <ModuleLayout
      slug="claude-code-modos-de-uso"
      title="Modos de uso: interativo, não-interativo, pipe e headless"
      icon="🔀"
      xp={60}
      readTime={12}
      trailName="Claude Code: do zero ao poder total"
      trailColor="#cc785c"
      nextSlug="claude-code-claude-md"
      nextTitle="CLAUDE.md: como dar memória, contexto e personalidade ao agente"
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
        Claude Code foi projetado para ser mais que um chat no terminal. Os quatro modos de uso cobrem desde a conversa interativa padrão até automação total em pipelines de CI/CD. Entender quando usar cada modo é o que separa quem usa Claude Code ocasionalmente de quem o integra no fluxo de trabalho real.
      </p>

      <Section accent={accent} title="Modo 1: interativo — o padrão conversacional">
        <CodeBlock>{`# Modo interativo: interface TUI (Text User Interface) completa
cd meu-projeto
claude

# O que você obtém:
# - Histórico de conversa na sessão
# - Visualização de cada ação de ferramenta antes de executar
# - Comandos /help, /clear, /compact, /cost, /model
# - Confirmação explícita de comandos Bash perigosos
# - Modo de edição multi-linha (Enter: nova linha, Ctrl+Enter: enviar)

# Fluxo típico de uma sessão interativa:
# 1. Você descreve o problema ou tarefa
# 2. Claude lê os arquivos relevantes (você vê: "Reading src/auth.ts...")
# 3. Claude propõe ações (edições, novos arquivos, comandos)
# 4. Para Bash: mostra o comando, você aprova ou recusa
# 5. Claude executa, reporta resultado, sugere próximos passos

# Para retomar contexto de uma sessão anterior:
claude --continue   # retoma a última sessão
claude --resume     # lista sessões recentes para escolher`}</CodeBlock>
        <p>O modo interativo é ideal para: <strong>implementação de features</strong>, <strong>debugging</strong>, <strong>refactoring</strong> e qualquer tarefa que exige exploração iterativa. A supervisão humana é integrada ao fluxo — você aprova ou recusa cada ação de alto risco.</p>
      </Section>

      <Section accent={accent} title="Modo 2: não-interativo — para scripts e automação">
        <CodeBlock>{`# Modo não-interativo: -p / --print
# Processa um prompt único e retorna em stdout. Zero TUI.

claude -p "liste os arquivos TypeScript que importam de @/lib/auth"
# → saída vai para stdout, pode ser capturada ou redirecionada

# Opção --output-format para saída estruturada
claude -p "analise o arquivo package.json e retorne um JSON com: nome, versão, dependências principais" \
  --output-format json
# → retorna JSON parseável (útil para pipelines que processam a saída)

# Desabilitar confirmações para automação segura
claude -p "atualize a versão no package.json para 2.1.0" \
  --allowedTools Edit \
  --print
# Claude só pode usar Edit — não pode rodar Bash ou Write

# Exemplo completo: script de análise de código
#!/bin/bash
for file in src/**/*.ts; do
  echo "=== Analisando: $file ==="
  claude -p "encontre problemas de segurança neste arquivo: $(cat "$file")" \
    --allowedTools Read \
    --print >> security_report.txt
done`}</CodeBlock>
        <p>O modo não-interativo é a ponte entre Claude Code e automação. Use <code>--allowedTools</code> para limitar o que Claude pode fazer e tornar o script previsível e seguro.</p>
      </Section>

      <Section accent={accent} title="Modo 3: pipe — processamento via stdin">
        <CodeBlock>{`# Modo pipe: Claude como processador de texto/código no pipeline Unix
# Input via stdin + -p + resultado em stdout

# Exemplos práticos:

# Sumarizar saída de comando longo
npm run build 2>&1 | claude -p "resuma os erros de build em português, lista de bullets"

# Revisar diff antes de commit
git diff --staged | claude -p "revise este diff: há problemas, edge cases não tratados ou violações de convenção?"

# Analisar logs de erro
tail -100 /var/log/nginx/error.log | claude -p "identifique o padrão de erros mais frequente e sugira causa raiz"

# Converter formato de dados
cat dados.csv | claude -p "converta este CSV para JSON, um objeto por linha, sem explicação"

# Gerar mensagem de commit a partir do diff
git diff HEAD | claude -p "gere uma mensagem de commit no estilo Conventional Commits para este diff"
# → feat(auth): add JWT expiration validation

# Com múltiplos inputs (heredoc):
claude -p "$(cat <<'EOF'
Você vai receber um trecho de código Python.
Refatore para usar list comprehension onde aplicável.
Código:
$(cat meu_script.py)
EOF
)"

# Nota: pipe funciona com -p. Sem -p, Claude tenta abrir o TUI mesmo com stdin piped
echo "analise isso" | claude    # ❌ abre TUI, pode travar
echo "analise isso" | claude -p # ✅ processa via stdin e responde em stdout`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Modo 4: headless — integração CI/CD e SDK">
        <CodeBlock>{`# Modo headless: Claude Code como ferramenta em pipelines CI/CD

# Exemplo: GitHub Actions que revisa PRs
# .github/workflows/review.yml
name: AI Code Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm install -g @anthropic-ai/claude-code
      - name: Revisar PR com Claude
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          git diff origin/main...HEAD > pr_diff.txt
          claude -p "\$(cat <<'EOF'
            Revise este diff de PR. Retorne JSON com:
            { "aprovado": bool, "problemas": ["lista"], "sugestoes": ["lista"] }
            Diff: \$(cat pr_diff.txt)
            EOF
          )" --output-format json > review.json
          cat review.json

# Usar o SDK do Claude Code (para integração em Node.js):
import ClaudeCode from "@anthropic-ai/claude-code";

const client = new ClaudeCode.ClaudeCode();

// Rodar uma tarefa e capturar mensagens
for await (const message of client.processMessages({
  prompt: "Explique a arquitetura do projeto",
  options: {
    cwd: "/caminho/do/projeto",
    allowedTools: ["Read", "Glob"],
  }
})) {
  if (message.type === "result") {
    console.log(message.result);
  }
}`}</CodeBlock>
        <ComparisonTable
          headers={['Modo', 'Quando usar', 'Interface', 'Confirmações']}
          rows={[
            ['Interativo', 'Desenvolvimento, debug, features complexas', 'TUI completa', 'Sim (padrão)'],
            ['Não-interativo (-p)', 'Scripts, automação, batch processing', 'Stdout puro', 'Via --allowedTools'],
            ['Pipe (stdin | -p)', 'Processamento de output de outros comandos', 'Stdout puro', 'Via --allowedTools'],
            ['Headless (SDK/CI)', 'Pipelines CI/CD, integração em aplicações', 'Programático', 'Via configuração'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="Segurança em automação: --allowedTools vs --dangerously-skip-permissions">
        <CodeBlock>{`# Opção 1: --allowedTools (recomendado para scripts)
# Especifica exatamente quais ferramentas Claude pode usar SEM confirmar
# Ferramentas fora da lista: Claude pergunta antes de usar (ou não usa)

claude -p "leia o README e gere um resumo" \
  --allowedTools Read,Glob
# Claude só pode ler — não pode editar, criar ou rodar comandos

claude -p "adicione type hints nos arquivos Python em src/" \
  --allowedTools Edit,Read,Glob
# Claude pode editar mas não rodar npm/python ou criar arquivos novos

# Opção 2: --dangerously-skip-permissions (use com extremo cuidado)
# Desabilita TODAS as confirmações — Claude executa qualquer ação sem perguntar
# SOMENTE em ambientes isolados (container descartável, sandbox)

# ❌ Errado em ambiente local:
claude -p "instale dependências e execute os testes" \
  --dangerously-skip-permissions
# Claude pode deletar arquivos, instalar pacotes, rodar qualquer comando

# ✅ Correto: ambiente Docker isolado
docker run --rm -v $(pwd):/workspace anthropic/claude-code \
  -p "rode os testes e corrija os que falharem" \
  --dangerously-skip-permissions

# Regra geral:
# - Desenvolvimento local interativo → confirmações habilitadas (padrão)
# - Scripts seguros → --allowedTools com lista mínima
# - Automação total em sandbox → --dangerously-skip-permissions em container`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Novos modos em 2026: batch, loop, schedule, ultraplan, ultrareview">
        <p>A partir de 2026 o Claude Code introduziu novos modos-comando que não são invocação da CLI, mas sim slash commands que orquestram automaticamente múltiplas sessões, paralelização em cloud e agendamento. São o próximo nível sobre os 4 modos clássicos:</p>
        <CodeBlock lang="shell">{`# /batch — paraleliza grandes mudanças em 5-30 worktrees + PRs simultâneos
# Ideal para migrações e refactorings que tocam dezenas de arquivos
/batch "migrar todos os useState para useReducer em src/features/"
# → Claude abre worktrees paralelos, executa em cada um, abre PRs separados

# /loop — executa o mesmo prompt em intervalo regular (ou auto-paced)
/loop 5m /status                      # roda /status a cada 5 minutos
/loop "verifique se o deploy terminou"  # auto-paced: Claude decide quando checar
# Útil para polling de builds, deploys, CI/CD

# /schedule — cria triggers recorrentes (cron remoto na infra Anthropic)
/schedule "Toda sexta 14h: gerar relatório de PRs mergeados da semana"
/schedule "Diariamente 9h: revisar issues abertas e priorizar"
# Rodam em cloud mesmo quando seu terminal está fechado

# /ultraplan — spawn session em modo "planning mode" na web (máxima capacidade)
/ultraplan "Arquitetura para multi-tenancy do sistema de pagamentos"
# → Abre sessão web com contexto 1M, retorna o plano final

# /ultrareview [PR] — code review multi-agente em cloud sandbox
/ultrareview 1234
# → 3-5 agentes especializados (security, performance, style, tests)
#   analisam em paralelo e consolidam em 1 review

# /autofix-pr [prompt] — spawn web session que assiste o PR + pushes fixes
/autofix-pr "aplique sugestões de review e corrija CI até passar"`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Flags de produção em 2026">
        <CodeBlock lang="shell">{`# --effort — controla profundidade de raciocínio (Opus 4.7 suporta max)
claude -p "..." --effort max            # raciocínio máximo (mais caro, melhor)
claude -p "..." --effort xhigh          # quase-máximo
claude -p "..." --effort low            # rápido e barato

# --max-budget-usd — para automaticamente quando custo atinge limite
claude -p "migrar arquitetura" --max-budget-usd 5.00

# --fork-session — usa com --resume: cria novo session-id (não sobrescreve)
claude --resume "migration-v2" --fork-session
# Útil para experimentar sem destruir a sessão original

# --bare — pula discovery de hooks/skills/plugins/MCP/CLAUDE.md (boot rápido)
claude --bare "pergunta simples sem contexto de projeto"
# 10x mais rápido pra queries one-shot em repos grandes

# --from-pr <num> — retoma sessões linkadas a um PR específico
claude --from-pr 123

# --worktree <nome> — isolamento automático em git worktree
claude --worktree feature-auth --tmux   # cria branch + dir + tmux session

# --agents — define subagents via JSON inline (override de config)
claude --agents '{"reviewer":{"prompt":"Foque em segurança"}}'

# --fallback-model — se modelo padrão estiver sobrecarregado (modo print)
claude -p "..." --model opus --fallback-model sonnet

# --json-schema — saída estruturada validada (modo print)
claude -p "extraia nome e email deste texto" \\
  --json-schema '{"type":"object","properties":{"name":{"type":"string"},"email":{"type":"string"}}}'

# --teleport — puxa uma sessão web de volta pro terminal local
claude --teleport

# Variáveis de ambiente importantes:
export CLAUDE_CODE_EFFORT_LEVEL=high    # default de effort
export CLAUDE_CODE_USE_BEDROCK=1        # roda via Amazon Bedrock
export CLAUDE_CODE_USE_VERTEX=1         # roda via Google Vertex AI
export MAX_THINKING_TOKENS=10000        # limite de thinking (legacy models)
export CLAUDE_CODE_NO_FLICKER=1         # rendering smooth em terminais problematic`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Matriz de decisão de modo:</strong> conversa interativa e desenvolvimento → modo padrão. Script que processa saída de outros comandos → pipe com <code>-p</code>. Automação de tarefas repetitivas → não-interativo com <code>--allowedTools</code>. Pipeline CI/CD → SDK ou não-interativo com API key em variável de ambiente. Migrations massivas → <code>/batch</code>. Polling → <code>/loop</code>. Cron remoto → <code>/schedule</code>. Planning profundo → <code>/ultraplan</code>. Code review robusto → <code>/ultrareview</code>. A segurança aumenta quando você especifica explicitamente o que Claude pode fazer.
      </Callout>

      <Callout>
        Próximo: <strong>CLAUDE.md</strong> — como criar o arquivo que dá ao Claude Code memória, contexto e as regras do projeto sem precisar repetir nas sessões.
      </Callout>
    </div>
  );
}
