import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, FlowDiagram } from '@/components/article/primitives';

const accent = '#cc785c';

export const metadata = getModuleMetadata('claude-code-paralelismo-na-pratica');

const quiz: QuizQuestion[] = [
  {
    question: 'Você precisa migrar 20 componentes de Solid para React. Qual estratégia é a mais adequada em 2026?',
    options: [
      'Rodar um único Claude Code interativo pedindo pra ele migrar os 20 arquivos sequencialmente na mesma sessão',
      'Abrir 20 terminais e 20 sessões manuais, cada uma migrando um arquivo',
      '/batch "migrar todos os componentes Solid para React em src/components/". O /batch orquestra de 5 a 30 worktrees paralelos, cada um trabalhando em arquivos independentes, abre PRs separados e retorna o status consolidado.',
      'Usar um hook PostToolUse que dispara migrations automaticamente quando Claude edita qualquer arquivo .tsx',
    ],
    correct: 2,
    explanation: '/batch é o comando desenhado para exatamente esse caso: migrations/refactors massivos com arquivos independentes. Ele cria de 5 a 30 worktrees em paralelo, delega cada grupo de arquivos a um worker em worktree isolado (sem conflito de git), e abre PRs separados para cada grupo — facilitando review incremental. Fazer sequencial numa sessão desperdiça tempo; 20 terminais manuais é inviável; hooks são reativos (não proativos). /batch resolve o problema de ponta a ponta.',
  },
  {
    question: 'Você rodou `! npm run build` e pressionou Ctrl+B para background. Agora quer ver o output do build. Como fazer?',
    options: [
      'Impossível — uma vez em background, o output vai pro /dev/null',
      'O output fica em arquivo; acesse via /tasks (lista tasks ativas + output), ou use Ctrl+T para toggle da task list. Output tem limite de 5GB antes de auto-terminar. Para comandos longos, o Claude pode monitorar e te avisar quando finalizar.',
      'Reexecute o comando sem Ctrl+B — não há forma de recuperar output de background',
      'Use tail -f /tmp/claude-build.log — Claude sempre escreve em caminho fixo',
    ],
    correct: 1,
    explanation: 'Background tasks no Claude Code escrevem em arquivo e são rastreadas. /tasks lista todas (ativas e recentes) com status, comando, duração. Ctrl+T toggles a task list inline. O output é acessível via "BashOutput" (tool que o Claude pode usar para ler) ou visível no próprio /tasks. Há limite de 5GB antes de auto-terminate (pra proteger memória). Padrão comum: rodar build/test em background, continuar conversando, pedir "olhe como foi o build" quando achar relevante. Combine com /loop para polling ("verifique a cada 2min se terminou").',
  },
  {
    question: 'Você abriu 3 terminais, cada um com `claude --worktree <nome-diferente>` no mesmo projeto. Um altera src/auth.ts, outro altera src/payments.ts. Eles entram em conflito?',
    options: [
      'Sim — todos usam o mesmo working tree, conflito imediato no git index',
      'Não — cada --worktree cria um git worktree próprio em .claude/worktrees/<nome>, com branch própria (worktree-<nome>). Trabalhos paralelos em arquivos diferentes são completamente isolados. Merge/rebase são feitos depois manualmente ou via PRs.',
      'Só não conflitam se você rodar git commit simultaneamente — caso contrário, race conditions ocorrem',
      'Funciona apenas se você usar --session-id diferente em cada terminal',
    ],
    correct: 1,
    explanation: 'Git worktrees são o mecanismo nativo do Git para exatamente esse caso: múltiplos working trees conectados ao mesmo .git/. --worktree <nome> cria um dir em .claude/worktrees/<nome> com branch dedicada (worktree-<nome>) ramificada de origin/HEAD. Cada sessão opera independentemente sem conflito de index. Você merge depois via PR ou git merge na main. Para o cleanup, worktrees sem mudanças são removidos automaticamente; com mudanças, Claude pergunta. É a base do paralelismo seguro em 2026.',
  },
];

export default function ClaudeCodeParalelismoPage() {
  return (
    <ModuleLayout
      slug="claude-code-paralelismo-na-pratica"
      title="Paralelismo na prática: worktrees, fan-out, background e múltiplas sessões"
      icon="⚡"
      xp={85}
      readTime={17}
      trailName="Claude Code: do zero ao poder total"
      trailColor="#cc785c"
      nextSlug="claude-code-multi-projeto-multi-contexto"
      nextTitle="Multi-projeto e contextos persistentes"
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
        Em codebases reais, a janela de contexto de um único agente não dá conta. A resposta do Claude Code em 2026 é paralelismo nativo em múltiplas camadas: git worktrees automáticos pra isolamento, background tasks pra não bloquear, subagents em fan-out pra decomposição, e os slash commands <code>/batch</code>, <code>/loop</code>, <code>/schedule</code> pra orquestração declarativa. Este módulo cobre os 5 modos reais de rodar trabalho paralelo — quando usar cada um e como combiná-los.
      </p>

      <Section accent={accent} title="Os 5 modos de paralelismo">
        <FlowDiagram
          orientation="vertical"
          accent={accent}
          steps={[
            { icon: '🌿', label: '1. Git worktrees', desc: 'Isolamento físico: dir + branch dedicados' },
            { icon: '🧵', label: '2. Background tasks', desc: 'Comandos rodam enquanto você continua' },
            { icon: '🤖', label: '3. Fan-out subagents', desc: 'N workers com worktree isolation' },
            { icon: '📦', label: '4. /batch (cloud)', desc: '5-30 worktrees + PRs automáticos' },
            { icon: '🌐', label: '5. Múltiplas sessões', desc: 'Terminais diferentes, contextos independentes' },
          ]}
        />
      </Section>

      <Section accent={accent} title="1. Git worktrees: isolamento físico sem fricção">
        <p>Git worktrees são um recurso nativo do Git que o Claude Code integra com fluidez. O comando <code>--worktree</code> cria um diretório em <code>.claude/worktrees/&lt;nome&gt;</code>, ramifica branch nova a partir de <code>origin/HEAD</code> e abre a sessão já dentro dele:</p>
        <CodeBlock lang="shell">{`# Criar worktree + iniciar sessão + tmux
claude --worktree feature-auth --tmux

# Estrutura criada:
# .claude/worktrees/feature-auth/   (working tree completo, git own)
#   ├── src/
#   ├── package.json
#   └── ... (tudo do projeto)
# Branch: worktree-feature-auth (ramificada de origin/HEAD)

# Cleanup automático:
# - Se você sai sem mudanças → worktree é removido
# - Se há mudanças não commitadas → Claude pergunta (keep/remove)

# Worktrees long-lived (manter entre sessões):
claude --worktree long-refactor  # primeira vez cria
claude --worktree long-refactor  # próxima vez retoma
# Worktrees orphaned > cleanupPeriodDays são limpos automaticamente

# Ignore no git principal:
echo ".claude/worktrees/" >> .gitignore

# Copiar arquivos gitignored (.env, etc.) pro novo worktree:
# Crie .worktreeinclude na raiz com padrões glob:
cat > .worktreeinclude <<EOF
.env
.env.local
config/local.json
EOF
# Esses arquivos são copiados ao criar novo worktree`}</CodeBlock>
        <Callout tone="info">
          <strong>Por que não apenas criar branches normais?</strong> Branch simples compartilha o mesmo working tree — você só pode ter uma checked out por vez. Worktree = múltiplos working trees simultâneos no mesmo repo. Sem stash, sem checkout back-and-forth.
        </Callout>
      </Section>

      <Section accent={accent} title="2. Background tasks: rodar sem bloquear">
        <CodeBlock lang="shell">{`# Prefixar comando com ! entra em bash mode (dentro da sessão Claude)
! npm run build

# Enquanto ele roda, Ctrl+B envia pra background
# (em tmux, pressione Ctrl+B duas vezes — primeiro é prefix do tmux)

# Ou o Claude mesmo pode rodar comandos em background via Bash run_in_background
"Rode os testes em background e me avisa quando terminar"

# Comandos relevantes pra background:
/tasks                   # lista todas as tasks (ativas + recentes)
Ctrl+T                   # toggle inline task list
/loop 2m "cheque status do build em background"  # polling automático

# Output de background task:
# - Salvo em arquivo temporário
# - Limite: 5GB (auto-terminate se exceder)
# - Acessível via BashOutput (Claude reads) ou /tasks (humano)
# - Persiste durante a sessão

# Notificação quando termina (via hook SubagentStop/Stop):
# Claude Code notifica via:
# - macOS: osascript (popup + som)
# - Linux: notify-send
# - Webhook: Slack/Discord se configurado no hook

# Casos práticos:
! npm test                           # testes longos
! docker compose up --build          # start de serviços
! terraform apply -auto-approve      # infra apply
! gh pr checks --watch 1234          # monitor de CI`}</CodeBlock>
      </Section>

      <Section accent={accent} title="3. Fan-out com subagents em worktrees isolados">
        <p>O padrão mais poderoso: 1 agente principal como orquestrador + N subagents como workers, cada um em worktree isolado. Sem conflito de arquivos, sem poluição de contexto, sem trabalho serial:</p>
        <CodeBlock lang="yaml">{`# .claude/agents/migration-worker/AGENT.md
---
name: migration-worker
description: Migra um módulo específico de Solid para React
tools: Read, Edit, Write, Bash
isolation: worktree                    # ← crítico: cada call, worktree próprio
model: claude-opus-4-7
effort: high
skills: [refactor-helper, test-generator]
---

Você migra código Solid → React preservando semântica.
Processo: 1) ler arquivo 2) traduzir primitivos 3) rodar testes
4) se falhar, itere até passar 5) retorne diff + testes executados`}</CodeBlock>
        <CodeBlock lang="shell">{`# Na sessão principal (orquestrador):
"Mapeie todos os módulos Solid em src/features/.
 Para cada módulo, spawn 1 migration-worker em paralelo.
 Aguarde todos terminarem e consolide um relatório:
 - arquivos migrados com sucesso
 - arquivos que falharam (com razão)
 - % de testes passando em cada"

# O que acontece:
# 1. Orquestrador roda Glob pra listar módulos Solid
# 2. Encontra 8 módulos → spawn 8 migration-worker
# 3. Cada worker:
#    - Ganha worktree isolado em .claude/worktrees/migration-N
#    - Tem contexto limpo (não vê os outros workers)
#    - Trabalha no seu arquivo
#    - Retorna resultado estruturado
# 4. Orquestrador consolida os 8 resultados
# 5. Você aprova/rejeita merges individualmente

# Diferença crítica vs. sequencial:
# Sequencial: 8 módulos × 5min cada = 40min (bloqueado)
# Fan-out: 8 × 5min em paralelo = 5-7min (paralelo)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="4. /batch: paralelismo declarativo em 5-30 worktrees">
        <p>O <code>/batch</code> é o &ldquo;um nível acima&rdquo; do fan-out manual. Você descreve a intenção em linguagem natural e o Claude Code decide quantos workers spawnar (entre 5 e 30), como dividir o trabalho, abre PRs separados pra cada grupo e consolida:</p>
        <CodeBlock lang="shell">{`# Casos clássicos de /batch:
/batch "adicione testes unitários pra cada função em src/utils/ que não tem teste"
/batch "atualize todos os endpoints em src/api/ para usar zod em vez de yup"
/batch "migre todos os useState para useReducer onde houver mais de 3 setStates relacionados"
/batch "refatore cada service em src/services/ para separar domain logic de IO"

# O que /batch faz internamente:
# 1. Explora o codebase (read-only) pra mapear unidades independentes
# 2. Decide quantos batches criar (heurística: 5-30 baseado em volume)
# 3. Cria N worktrees em .claude/worktrees/batch-<seq>
# 4. Spawn 1 worker por worktree em paralelo
# 5. Cada worker trabalha no seu grupo de arquivos
# 6. Testes rodam em cada worktree isoladamente
# 7. Se worker tem sucesso + testes passam → abre PR
# 8. Relatório consolidado ao final

# Output típico:
# ✅ 12 PRs abertos com sucesso (#1234-#1245)
# ⚠️  2 PRs com falhas de teste, requer atenção manual
# ❌ 1 worker bloqueado: arquivo precisa de decisão humana

# Para controlar escopo explicitamente:
/batch "limitar a 10 PRs: atualize import de lodash para lodash-es onde possível"`}</CodeBlock>
      </Section>

      <Section accent={accent} title="5. Múltiplas sessões: o modo humano">
        <CodeBlock lang="shell">{`# O caso mais simples e esquecido: abra vários terminais.
# Cada sessão Claude Code é independente — contexto próprio, histórico próprio.

# Terminal 1: feature em desenvolvimento
claude --name "auth-refactor" --worktree auth

# Terminal 2: hotfix urgente
claude --name "hotfix-payment-bug" --worktree hotfix

# Terminal 3: exploração read-only
claude --name "research-rate-limit" --permission-mode plan --agent Explore

# Terminal 4: CI local rodando
claude --name "ci-debug"

# Trocar entre elas no picker:
claude --resume  # abre picker ordenado por atividade

# No picker:
# Ctrl+A   widening (mais sessões)
# Ctrl+W   só worktrees
# Ctrl+B   filtrar por branch
# Space    preview da conversa antes de abrir
# Enter    retoma
# Ctrl+R   rename
# /        search

# Forked sessions (via /branch, /rewind, --fork-session)
# aparecem agrupadas no picker — você enxerga a árvore de experimentos

# Padrão "morning standup":
# Segunda de manhã, você tem 3 frentes:
# 1. Feature A (em andamento) → claude -n "A" -c
# 2. Bug X (ontem você parou a meio) → claude --resume "bug-X"
# 3. Review do PR do João → claude --from-pr 789

# Cada uma num terminal. Alt+Tab entre elas durante o dia.`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Combinando tudo: um dia real">
        <CodeBlock lang="shell">{`# 9:00 — Começo do dia
#   Abrir terminal 1, retomar feature A
claude --resume "feature-stripe-integration"

# 9:30 — Dentro da sessão, paralelizar escrita de testes
/batch "gere testes unitários para cada função em src/lib/stripe/"
# → 4 workers em paralelo, 4 PRs abertos ao final

# 10:00 — Em outro terminal, explore o código de outro time (read-only)
claude --worktree research-billing --permission-mode plan
> "Use Explore pra mapear como o módulo de billing conversa com Stripe"

# 10:30 — Rodar build em background enquanto trabalha
! npm run build
# Ctrl+B

# 11:00 — Em terminal 3, hotfix que apareceu
claude -n "hotfix-login-bug" --worktree hotfix-login

# 13:00 — Polling automático do status do deploy
/loop 10m "verifique se o deploy v2.1 terminou; resuma status de health-checks"

# 17:00 — Antes de sair, agendar análise semanal automatizada
/schedule "Toda sexta 14h: revisar PRs mergeados da semana e gerar
           relatório de métricas (LOC, tempo de review, % de CI green)"
# → roda em cloud mesmo com terminal fechado`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Quando NÃO usar paralelismo">
        <ComparisonTable
          headers={['Cenário', 'Recomendação', 'Por que']}
          rows={[
            ['Tarefas com dependência forte (A precisa de B)', 'Sequencial na mesma sessão', 'Paralelizar cria deadlock/retrabalho'],
            ['Edição em arquivo único', 'Uma sessão só', 'Conflito de write se paralelizar'],
            ['Exploração inicial de código novo', 'Uma sessão + Explore subagent', 'Você precisa de coerência, não velocidade'],
            ['Debugging de um bug específico', 'Uma sessão focada', 'Paralelo diverge atenção e hipóteses'],
            ['Trabalho com estado externo único (DB, API rate limit)', 'Sequencial', 'Paralelo sobrecarrega recurso compartilhado'],
          ]}
          accent={accent}
        />
      </Section>

      <Callout tone="success">
        <strong>Paralelismo é uma ferramenta, não um objetivo.</strong> A pergunta certa não é &ldquo;posso paralelizar?&rdquo;, é &ldquo;as unidades de trabalho são independentes?&rdquo;. Quando são (migrations, testes por módulo, docs por arquivo), paralelize agressivamente com <code>/batch</code> ou fan-out. Quando há dependência forte, sequential é mais rápido. Worktrees são o enabler técnico; subagents são os workers; <code>/batch</code> é o orquestrador declarativo. Combinados, transformam Claude Code em uma frota escalável.
      </Callout>

      <Callout>
        Próximo: <strong>Multi-projeto e contextos persistentes</strong> — como manter vários repos ativos ao mesmo tempo com contextos isolados, settings hierarquia (enterprise/user/project/local), sessions nomeadas retomáveis e onboarding automatizado do time.
      </Callout>
    </div>
  );
}
