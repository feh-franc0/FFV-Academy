import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#cc785c';

export const metadata = getModuleMetadata('claude-code-subagents');

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a principal vantagem de usar um subagent para uma tarefa de pesquisa extensa em vez de fazer na sessão principal?',
    options: [
      'Subagents são mais baratos — cada subagent usa um modelo menor e mais econômico automaticamente',
      'A pesquisa extensa acontece em uma janela de contexto isolada. O resultado (um resumo) volta para a sessão principal sem poluir o contexto com os arquivos intermediários lidos durante a pesquisa.',
      'Subagents rodam em paralelo com a sessão principal — o usuário pode continuar trabalhando enquanto o subagent pesquisa',
      'Subagents têm acesso a ferramentas que a sessão principal não tem — como busca na internet',
    ],
    correct: 1,
    explanation: 'O benefício central dos subagents é isolamento de contexto. Se a sessão principal precisar ler 40 arquivos para responder "onde é tratado o erro de autenticação?", esses 40 arquivos ficam no contexto — ocupando espaço valioso. Com subagent: a pesquisa acontece em contexto separado, Claude resume o resultado em 2-3 linhas e devolve. A sessão principal recebe apenas o resumo, não os 40 arquivos. Isso mantém o contexto da sessão principal limpo e eficiente para a tarefa real.',
  },
  {
    question: 'Um subagent retorna um resultado diferente do esperado para a sessão principal. Qual é a prática recomendada?',
    options: [
      'Subagents não podem ser guiados — o resultado é definitivo e deve ser aceito como-é',
      'Defina o formato de output esperado explicitamente na instrução do subagent. Se o resultado vier errado, reformule a instrução com critérios mais específicos e relance o subagent.',
      'Use sempre a sessão principal para tarefas críticas — subagents são apenas para tarefas de baixo impacto',
      'Subagents só retornam texto — para resultados estruturados, use a sessão principal',
    ],
    correct: 1,
    explanation: 'Subagents são tão bons quanto suas instruções. A prática é: sempre especifique o formato de output desejado ("retorne apenas: nome do arquivo, número da linha, e a função responsável"), os critérios de busca ("ignore arquivos de teste"), e os obstáculos para reportar ("se não encontrar, diga explicitamente X não encontrado"). Com instruções precisas, subagents são altamente confiáveis. Com instruções vagas, produzem output vago.',
  },
  {
    question: 'Qual cenário NÃO é um bom caso de uso para subagents?',
    options: [
      'Pesquisar em dezenas de arquivos de logs para encontrar um padrão de erro',
      'Gerar documentação paralela para 5 módulos diferentes simultaneamente',
      'Fazer uma pequena edição em um arquivo que já está no contexto da sessão principal',
      'Executar uma análise de segurança em cada endpoint do projeto',
    ],
    correct: 2,
    explanation: 'Subagents têm custo de overhead: inicializar um novo contexto, passar as instruções, aguardar o resultado, processar o retorno. Para uma pequena edição em um arquivo já carregado no contexto da sessão principal, o overhead não se justifica — faça diretamente. Subagents brilham quando: a tarefa requer muita leitura de arquivos que poluiria o contexto principal, a tarefa pode ser paralelizada com outras tarefas, ou você precisa de isolamento para evitar interferência entre sub-tarefas.',
  },
];

export default function ClaudeCodeSubagentsPage() {
  return (
    <ModuleLayout
      slug="claude-code-subagents"
      title="Subagents: delegar tarefas a agentes isolados"
      icon="🤖"
      xp={75}
      readTime={15}
      trailName="Claude Code: do zero ao poder total"
      trailColor="#cc785c"
      nextSlug="claude-code-hooks"
      nextTitle="Hooks: automatizar revisões, validações e ações customizadas"
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
        Subagents são instâncias do Claude que rodam em janelas de contexto completamente separadas da sessão principal. A sessão principal os cria, delega uma tarefa, aguarda o resultado e continua — sem carregar o contexto de trabalho do subagent. É o mecanismo que permite escalar Claude Code além dos limites de uma única janela de contexto.
      </p>

      <Section accent={accent} title="Como subagents funcionam">
        <ComparisonTable
          headers={['Aspecto', 'Sessão principal', 'Subagent']}
          rows={[
            ['Janela de contexto', 'Compartilhada com toda a sessão', 'Isolada — começa do zero'],
            ['Acesso ao código', 'O que foi lido na sessão', 'O que as instruções definem para ele ler'],
            ['Resultado', 'Acumula na sessão principal', 'Retorna apenas o output final para o principal'],
            ['Uso ideal', 'Implementação, decisões, interação com o usuário', 'Pesquisa extensa, análise isolada, geração paralela'],
            ['Custo de contexto', 'Cresce com o tempo', 'Limpo em cada chamada'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Como um subagent é criado na prática:
# Você instrui Claude Code na sessão principal:

"Use um subagent para fazer o seguinte: [tarefa isolada].
 O subagent deve retornar apenas: [formato de output específico]."

# Claude Code cria uma janela de contexto separada
# com as instruções definidas, executa a tarefa,
# e retorna apenas o output para a sessão principal.

# A sessão principal não "vê" o que o subagent leu internamente —
# apenas recebe o resultado final.`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Casos de uso: quando usar subagents">
        <CodeBlock>{`# ✅ Caso 1: Pesquisa extensa em muitos arquivos

# Sem subagent: Claude lê 30 arquivos → todos ficam no contexto
"Encontre todos os lugares onde a função fetchUser é chamada
 e me diga quais passam o parâmetro includeRoles=true"

# Com subagent: Claude lê 30 arquivos em janela isolada
"Use um subagent para buscar no codebase todos os calls
 de fetchUser. Retorne apenas:
 - arquivo e linha de cada chamada
 - se inclui includeRoles=true (sim/não)
 Não inclua o conteúdo dos arquivos no retorno."

# ---

# ✅ Caso 2: Tarefas paralelas independentes

"Execute em paralelo usando subagents:
 - Subagent A: gere documentação para src/lib/auth.ts
 - Subagent B: gere documentação para src/lib/payments.ts
 - Subagent C: gere documentação para src/lib/users.ts
 Retorne os 3 documentos quando todos estiverem prontos."

# ---

# ✅ Caso 3: Análise de segurança por módulo

"Use um subagent para cada módulo abaixo e analise
 por vulnerabilidades OWASP Top 10. Retorne apenas
 vulnerabilidades encontradas (arquivo + tipo + severity):
 Módulos: src/api/auth.ts, src/api/upload.ts, src/api/admin.ts"

# ---

# ✅ Caso 4: Geração de testes para funções existentes

"Para cada função em src/lib/calculator.ts,
 use um subagent para gerar testes unitários.
 O subagent deve retornar apenas o código de teste
 em formato pronto para adicionar ao arquivo de testes."

# ---

# ❌ Caso ruim: tarefa simples que já tem contexto

"Use um subagent para adicionar um comentário
 na função que você acabou de editar."
# → Desnecessário. O arquivo já está no contexto.
#    Faça direto na sessão principal.`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Instrucões eficazes para subagents">
        <CodeBlock>{`# Anatomia de uma boa instrução de subagent:

"Use um subagent com as seguintes instruções:

OBJETIVO: [o que deve ser feito — específico e verificável]

CONTEXTO: [o que o subagent precisa saber para começar]
- Projeto: [tipo/stack]
- Localização relevante: [path/módulo específico]
- Restrições: [o que deve/não deve fazer]

FORMATO DE OUTPUT:
[formato exato esperado — evita output vago]
Exemplo:
  Arquivo: src/api/users.ts
  Linha: 42
  Problema: [descrição]
  Severidade: alta/média/baixa

CRITÉRIOS DE SUCESSO:
- [como o subagent sabe que terminou corretamente]
- Se não encontrar nada, retorne: 'Nenhum resultado encontrado'"

# Por que o formato de output importa:
# Sem formato definido → subagent retorna um ensaio
# Com formato definido → sessão principal processa facilmente`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Subagents vs sessão principal: a decisão">
        <ComparisonTable
          headers={['Critério', 'Use sessão principal', 'Use subagent']}
          rows={[
            ['Volume de arquivos', '1-5 arquivos', '10+ arquivos'],
            ['Relevância do contexto', 'Arquivo já está no contexto', 'Exploração nova e extensa'],
            ['Paralelismo', 'Tarefa sequencial', 'Tarefas independentes simultâneas'],
            ['Resultado esperado', 'Código/edição direta', 'Informação, análise, documentação'],
            ['Isolamento necessário', 'Não precisa isolar', 'Contexto limpo é necessário'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="Configuração de subagents com /agents">
        <CodeBlock>{`# O comando /agents permite ver e configurar subagents disponíveis
/agents

# Subagents podem ser customizados para o seu projeto
# em .claude/agents/ como arquivos Markdown:

# .claude/agents/security-reviewer.md
---
name: security-reviewer
description: Analisa código por vulnerabilidades de segurança
tools: Read, Glob, Grep
---
Você é um especialista em segurança de software.
Analise o código fornecido por vulnerabilidades OWASP Top 10.
Foque em: injection, broken auth, XSS, IDOR, security misconfiguration.
Retorne apenas vulnerabilidades confirmadas (não suspeitas),
em formato: arquivo:linha | tipo | severidade | descrição em 1 linha.

# Uso:
"Use o subagent security-reviewer para analisar src/api/"

# Restrição de ferramentas:
# Você pode limitar quais ferramentas o subagent usa
# para garantir que ele não vai além do escopo definido
# allowed-tools: Read, Glob, Grep  # sem Bash, sem Edit`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Built-in subagents em 2026">
        <p>O Claude Code traz subagents nativos — você não precisa criar nada pra usá-los. Cada um tem um perfil de ferramentas diferente, otimizado pra uma classe de tarefa:</p>
        <ComparisonTable
          headers={['Nome', 'Propósito', 'Ferramentas']}
          rows={[
            ['Explore', 'Exploração de codebase, leitura extensa, mapeamento', 'Read, Glob, Grep (read-only)'],
            ['Plan', 'Planning mode — questiona requisitos, propõe estratégia', 'Read, Glob, Grep + WebSearch'],
            ['general-purpose', 'Multi-step genérico: pesquisa + implementação', 'Todas exceto Edit/Write (varia)'],
            ['code-reviewer', 'Review focado em qualidade, segurança, performance', 'Read, Glob, Grep'],
            ['statusline-setup', 'Configuração do statusline customizado', 'Read, Edit'],
          ]}
          accent={accent}
        />
        <CodeBlock lang="shell">{`# Usar built-in diretamente via /agents ou Task tool:
/agents                                 # UI pra listar + criar agents

# Invocar em linha:
"Use o subagent Explore para mapear toda a lógica de autenticação"
"Delegue ao Plan: como dividir essa feature em PRs"
"Peça ao code-reviewer pra analisar o último commit"

# Spawning em background (o subagent roda enquanto você continua):
"Spawn um Explore em background pra mapear o uso de React Query
 no projeto. Me avise quando terminar."
# → Claude retorna task ID, você recebe notificação quando pronto`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Worktree isolation: paralelismo real sem conflito">
        <p>O maior avanço de 2026 em subagents: <code>isolation: worktree</code> no frontmatter. Cada subagent recebe um git worktree automático — dir isolado, branch própria, cleanup automático. Isso permite rodar N subagents em paralelo mexendo em arquivos sem conflito:</p>
        <CodeBlock lang="yaml">{`# .claude/agents/migration-worker/AGENT.md
---
name: migration-worker
description: Migra um módulo específico de Solid para React. Use para migrations paralelas.
tools: Read, Edit, Write, Bash
model: claude-opus-4-7
effort: high
isolation: worktree        # ← cada invocação ganha worktree próprio
skills:                    # ← skills pré-carregadas no startup
  - refactor-helper
  - test-generator
---

Você migra arquivos de Solid para React mantendo semântica equivalente.

Processo:
1. Leia o arquivo original
2. Identifique primitivos Solid (createSignal, createEffect, etc.)
3. Traduza pros equivalentes React (useState, useEffect)
4. Mantenha a interface pública intacta
5. Rode os testes do módulo
6. Se testes falharem, itere até passar`}</CodeBlock>
        <CodeBlock lang="shell">{`# Cenário: migrar 8 módulos em paralelo
"Use 8 migration-worker em paralelo, um para cada módulo em src/features/.
 Cada um trabalha em seu worktree isolado. Me avise quando todos terminarem."

# O que acontece debaixo do capô:
# 1. Claude cria 8 worktrees em .claude/worktrees/migration-{1..8}
# 2. Cada worktree tem branch própria (worktree-migration-N)
# 3. Os 8 subagents trabalham simultaneamente sem interferência
# 4. Quando terminam: Claude reporta resultado + cleanup automático
# 5. Você merge as 8 branches depois

# Worktrees têm lifecycle próprio:
# - Auto-cleanup se agent termina sem mudanças
# - Prompt pra manter/remover se há mudanças
# - Arquivos gitignored copiados via .worktreeinclude`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Fan-out pattern: orquestrador + N workers">
        <CodeBlock lang="shell">{`# Padrão clássico em projetos grandes:
# 1 agente principal (orquestrador) + N subagents (workers)

# Terminal 1: orquestrador principal
claude --name "orchestrator"
> "Planeje a migração completa. Divida em tarefas independentes.
   Para cada tarefa, delegue a um subagent apropriado."

# Claude gera plano, identifica 12 tarefas independentes
# Delega 12 subagents em paralelo (via Task tool interno)
# Cada subagent rode em worktree isolado
# Claude consolida resultados e abre PRs

# Terminal 2,3,4...: sessões manuais adicionais (se quiser)
claude --worktree worker-1 --agent Explore
claude --worktree worker-2 --agent code-reviewer
# Essas ficam à disposição do dev humano pra tarefas manuais paralelas

# Inspecionar tasks em qualquer sessão:
# Ctrl+T       → toggle task list
# /tasks       → lista explícita
# /insights    → análise de patterns e friction`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Subagents são multiplicadores de capacidade.</strong> A sessão principal mantém foco e contexto limpo enquanto subagents fazem o trabalho pesado em paralelo. Para projetos grandes, a combinação — sessão principal como orquestrador, built-ins (Explore/Plan/code-reviewer) pra tarefas conhecidas, subagents customizados com <code>isolation: worktree</code> pra trabalho paralelo sem conflito, <code>skills:</code> preload pra agent especializado desde o startup — é o que torna Claude Code viável em codebases reais de grande escala.
      </Callout>

      <Callout>
        Próximo: <strong>Hooks</strong> — como automatizar ações que devem acontecer em resposta a eventos do Claude Code (after edit, after stop, before tool use) sem depender de instruções que Claude pode ignorar.
      </Callout>
    </div>
  );
}
