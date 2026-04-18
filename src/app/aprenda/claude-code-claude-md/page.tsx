import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#cc785c';

export const metadata = getModuleMetadata('claude-code-claude-md');

const quiz: QuizQuestion[] = [
  {
    question: 'Claude Code encontra CLAUDE.md em três locais diferentes: ~/.claude/CLAUDE.md, um diretório pai do projeto e o diretório raiz do projeto. O que acontece?',
    options: [
      'Apenas o CLAUDE.md mais próximo do arquivo sendo editado é carregado — os outros são ignorados para evitar conflito',
      'O CLAUDE.md do diretório atual sempre sobrescreve os dos diretórios pais — apenas um é carregado por sessão',
      'Todos os três são carregados e concatenados em ordem (global → pai → projeto). O resultado é injetado como contexto de sistema. Instruções mais específicas (projeto) complementam as globais, não as substituem.',
      'Claude Code carrega apenas ~/.claude/CLAUDE.md — o do projeto precisa ser especificado com --context-file',
    ],
    correct: 2,
    explanation: 'A hierarquia de CLAUDE.md é aditiva: ~/.claude/CLAUDE.md define preferências globais (sempre ativas em qualquer projeto), CLAUDE.md de diretórios pais define contexto de monorepo ou workspace, e o CLAUDE.md do projeto define contexto específico. Todos são concatenados. Isso permite ter regras globais ("sempre responda em PT-BR", "prefira commits atômicos") e regras de projeto ("esta é uma API REST Next.js", "use sempre async/await").',
  },
  {
    question: 'Qual é o principal problema de colocar exemplos de código extensos e documentação detalhada da API no CLAUDE.md?',
    options: [
      'Claude Code não processa código dentro de CLAUDE.md — apenas texto em prosa',
      'CLAUDE.md tem um limite de 10KB — arquivos maiores são truncados silenciosamente',
      'Cada sessão inicia com o CLAUDE.md inteiro no contexto, consumindo tokens. Conteúdo muito longo aumenta o custo de cada sessão e reduz o espaço disponível para o contexto real da conversa. CLAUDE.md deve ter arquitetura e comandos, não documentação completa.',
      'Não há problema — quanto mais contexto, melhor. CLAUDE.md pode ter centenas de KB sem impacto',
    ],
    correct: 2,
    explanation: 'CLAUDE.md é injetado no contexto a cada sessão. Tokens de contexto custam dinheiro e ocupam espaço que poderia ser usado para a conversa atual. Um CLAUDE.md de 5.000 tokens consome ~$0.015 por sessão com Sonnet — aceitável. Um CLAUDE.md de 50.000 tokens (documentação extensa) consome ~$0.15 por sessão e deixa menos espaço para o contexto da tarefa. Mantenha CLAUDE.md conciso: comandos essenciais, arquitetura de alto nível, convenções de código — não documentação de referência.',
  },
  {
    question: 'Você está no CLAUDE.md e quer que Claude execute `npm run build` antes de qualquer deploy, mas sem que Claude precise perguntar confirmação. Como fazer?',
    options: [
      'Escrever no CLAUDE.md: "Sempre execute npm run build antes de deploy" — Claude seguirá a instrução mas ainda pedirá confirmação porque Bash sempre confirma',
      'Usar o campo allowed_commands no CLAUDE.md: `allowed_commands: ["npm run build"]` — isso whitelist o comando automaticamente',
      'Criar um hook de pré-deploy em `.claude/hooks/` (arquivo de hook, não CLAUDE.md). O CLAUDE.md define intenções e contexto; hooks definem automação de eventos. Para executar automaticamente, use um hook PostToolUse que detecta operações de deploy.',
      'Não é possível whitelistar comandos específicos — o sistema de permissões é binário (tudo ou nada)',
    ],
    correct: 2,
    explanation: 'CLAUDE.md instrui Claude sobre como agir, mas não muda o sistema de permissões de ferramentas. Para automação de eventos (executar algo antes/depois de uma ação), use hooks em `.claude/hooks/`. Para whitelistar comandos no modo interativo, configure `allowedTools` nas configurações do Claude Code ou use `--allowedTools` na linha de comando. CLAUDE.md é contexto e instruções de comportamento — a automação de eventos fica nos hooks.',
  },
];

export default function ClaudeCodeClaudeMdPage() {
  return (
    <ModuleLayout
      slug="claude-code-claude-md"
      title="CLAUDE.md: como dar memória, contexto e personalidade ao agente"
      icon="📋"
      xp={65}
      readTime={13}
      trailName="Claude Code: do zero ao poder total"
      trailColor="#cc785c"
      nextSlug="claude-code-permissoes"
      nextTitle="Permissões e segurança: o que Claude pode e não pode fazer"
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
        Sem CLAUDE.md, cada sessão do Claude Code começa do zero — Claude não sabe a stack do projeto, os comandos de build, as convenções de código ou as preferências do time. Com CLAUDE.md, você escreve uma vez e nunca mais precisa repetir. É o arquivo que transforma Claude Code de um assistente genérico em um agente que conhece o seu projeto.
      </p>

      <Section accent={accent} title="A hierarquia de CLAUDE.md: global, pai e projeto">
        <CodeBlock>{`# Claude Code procura CLAUDE.md em três locais, nesta ordem:

# 1. ~/.claude/CLAUDE.md — preferências globais
#    Ativo em TODOS os projetos. Use para preferências pessoais universais.

# 2. CLAUDE.md em diretórios pai
#    Ex: ~/projetos/empresa/CLAUDE.md — ativo para todos os repos da empresa.
#    Útil para monorepos ou times com convenções compartilhadas.

# 3. CLAUDE.md na raiz do projeto
#    Contexto específico do projeto. Commite no repositório para que
#    todos no time tenham o mesmo comportamento de Claude Code.

# Todos são concatenados e injetados como contexto de sistema.
# Exemplo de hierarquia real:

~/.claude/CLAUDE.md:
# Preferências pessoais
- Responda sempre em português brasileiro
- Prefira commits atômicos e descritivos
- Antes de criar um arquivo novo, verifique se já existe similar

~/projetos/empresa/CLAUDE.md:
# Convenções da empresa
- Seguimos Google Style Guide para Python
- Toda mudança em banco precisa de migration reversível
- PRs não podem ter mais de 400 linhas alteradas

~/projetos/empresa/api/CLAUDE.md (este projeto):
# Stack: FastAPI + PostgreSQL + Redis
# Testar: pytest src/tests/ -x
# Deploy: ./scripts/deploy.sh staging`}</CodeBlock>
        <p>A hierarquia aditiva significa que você não precisa repetir preferências globais em cada projeto. Escreva uma vez no global, especialize no projeto.</p>
      </Section>

      <Section accent={accent} title="O que colocar em um CLAUDE.md eficaz">
        <ComparisonTable
          headers={['Categoria', 'Inclua', 'Não inclua']}
          rows={[
            ['Comandos', 'Build, test, lint, dev server, deploy — o essencial que Claude vai usar', 'Documentação completa de cada flag de cada comando'],
            ['Arquitetura', 'Stack principal, padrões arquiteturais, onde cada tipo de arquivo vive', 'Lista exaustiva de todos os arquivos e pastas'],
            ['Convenções', 'Estilo de código, formato de commit, nomes de branch, regras de PR', 'Exemplos de código extensos — Claude pode ler os arquivos'],
            ['Contexto', 'O que o projeto faz, público-alvo, restrições importantes', 'Histórico de decisões longas — use ADRs em arquivos separados'],
            ['Gotchas', 'Armadilhas conhecidas, dependências com comportamento não-óbvio, bugs recorrentes', 'Problemas já resolvidos que não se repetem'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Exemplo de CLAUDE.md bem estruturado (projeto Next.js):

# CLAUDE.md

## Visão Geral
Plataforma de e-learning com gamificação. Stack: Next.js 16, TypeScript, Tailwind v4.
Sem backend — 100% localStorage. Deploy estático na Hostinger via export.

## Comandos essenciais
npm run dev      # dev server em localhost:3000
npm run build    # build estático em out/
npm run lint     # ESLint

## Gotcha: processos órfãos
Se npm run dev der erro: pkill -f "next-server" && rm -rf .next

## Arquitetura
- src/lib/curriculum.ts  → fonte única do currículo (modificar aqui para conteúdo)
- src/components/article/primitives.tsx → Section, Callout, CodeBlock, ComparisonTable
- src/app/aprenda/[slug]/page.tsx → um arquivo por artigo
- Nunca hardcode hex — sempre usar var(--ffv-*) para cores

## Convenções
- Commits em PT-BR, formato: "tipo: descrição curta"
- Artigos em português brasileiro, sem hype, sem clickbait
- Usar primitive Section/Callout/CodeBlock — nunca definir inline
- Não usar next/image (desabilitado no export)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="CLAUDE.md global: preferências que seguem você">
        <CodeBlock>{`# ~/.claude/CLAUDE.md — o arquivo que você cria uma vez e esqueça

# Preferências de idioma e tom
Responda sempre em português brasileiro, exceto se o código ou arquivo estiver em inglês.
Mantenha respostas concisas — evite explicar o óbvio.

# Segurança e revisão
Antes de deletar arquivos ou pastas, confirme listando o que será deletado.
Ao criar arquivos novos, verifique se já existe algo similar no projeto.

# Git
Prefira commits atômicos (uma mudança lógica por commit).
Mensagens de commit seguem Conventional Commits: feat/fix/refactor/docs/test/chore.
Nunca faça git push sem confirmação explícita.

# Código
Não adicione comentários desnecessários — código legível não precisa de comentário óbvio.
Não adicione features não pedidas — faça exatamente o que foi solicitado.
Quando encontrar um bug adjacente ao que estava corrigindo, mencione mas não corrija sem pedir.

# Ambiente
Sistema operacional: macOS. Shell: zsh.
Node.js: 20.x. Python: 3.12.
Editor principal: VS Code.`}</CodeBlock>
        <p>O CLAUDE.md global é seu <em>contrato pessoal</em> com Claude Code. Tudo que você cansa de repetir em cada sessão — preferência de idioma, como tratar commits, o que nunca fazer sem perguntar — vai aqui uma única vez.</p>
      </Section>

      <Section accent={accent} title="O que CLAUDE.md não substitui">
        <CodeBlock>{`# CLAUDE.md é contexto e instruções de comportamento.
# Não é um substituto para:

# 1. Hooks — para automação de eventos
# CLAUDE.md: "sempre rode os testes depois de editar" → isso é uma instrução
# Hooks (.claude/hooks/): script que EFETIVAMENTE roda os testes automaticamente
# A diferença: instrução depende de Claude seguir; hook é determinístico

# 2. Skills / slash commands — para workflows repetitivos
# CLAUDE.md: "para fazer deploy, siga estes passos: ..."
# Skill (.claude/commands/deploy.md): /deploy → executa o workflow automaticamente

# 3. Variáveis de ambiente — para segredos
# CLAUDE.md: ❌ NUNCA coloque API keys, senhas, tokens
# Use: .env + .gitignore, ou variáveis de ambiente do sistema

# 4. Documentação de referência — para specs e ADRs
# CLAUDE.md é lido A CADA SESSÃO → deve ser conciso (< 2.000 tokens idealmente)
# Para especificações longas, use docs/ separados e instrua Claude a ler quando precisar:
# "Para decisões de arquitetura, leia docs/ADR/"
# Claude lerá o arquivo específico sob demanda, não antecipadamente

# 5. Histórico de contexto da conversa — para tarefas com múltiplas sessões
# CLAUDE.md persiste entre sessões; histórico de conversa não
# Para retomar uma tarefa longa: claude --continue (retoma a última sessão)
# Ou resuma o estado ao final de cada sessão em um arquivo de "work in progress"`}</CodeBlock>
      </Section>

      <Section accent={accent} title="CLAUDE.md como documento vivo do projeto">
        <CodeBlock>{`# CLAUDE.md deve ser commitado no repositório — não é arquivo pessoal de dev

# Benefícios:
# - Todo desenvolvedor do time tem o mesmo comportamento do Claude Code
# - Onboarding: novo dev instala Claude Code, clona o repo, já tem contexto
# - Review: mudanças no CLAUDE.md ficam no histórico git — auditável

# Ciclo de manutenção:
# 1. Algo quebra frequentemente? → adicione ao CLAUDE.md como gotcha
# 2. Um comando novo virou essencial? → documente em "Comandos"
# 3. CLAUDE.md está crescendo demais? → mova detalhes para docs/ e referencie

# Dica: revise o CLAUDE.md a cada sprint
# Perguntas para a revisão:
# - Tem algo aqui que Claude nunca usa?
# - Tem algo que repetiram nas últimas sessões e deveria estar aqui?
# - Há algum gotcha novo que vale documentar?

# Tamanho ideal: 200-800 linhas (suficiente para contexto, conciso o bastante
# para não desperdiçar tokens a cada sessão)

# Para verificar o tamanho em tokens (aproximação):
wc -c CLAUDE.md   # bytes
# 1 token ≈ 4 bytes → 4000 bytes = ~1000 tokens`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>CLAUDE.md eficaz em 5 seções:</strong> (1) visão geral do projeto em 2 parágrafos, (2) comandos essenciais de build/test/deploy, (3) convenções de código e commits, (4) arquitetura de alto nível com ponteiros para arquivos-chave, (5) gotchas conhecidos. Tudo em menos de 500 linhas. Commite no repo. Revise mensalmente.
      </Callout>

      <Callout>
        Próximo: <strong>Permissões e segurança</strong> — o que Claude Code pode fazer por padrão, como configurar limites e as boas práticas de segurança ao usar IA com acesso ao terminal.
      </Callout>
    </div>
  );
}
