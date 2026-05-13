import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#cc785c';

export const metadata = getModuleMetadata('claude-code-workflow-diario');

const quiz: QuizQuestion[] = [
  {
    question: 'No loop explore → plan → code → commit, qual é a função da fase "plan" antes de qualquer código ser gerado?',
    options: [
      'É apenas um passo burocrático — Claude já sabe o que fazer e o plan é gerado automaticamente',
      'O plan serve para Claude decompor a tarefa em etapas verificáveis, identificar dependências e alinhar com o usuário antes de agir. Isso reduz retrabalho e evita que Claude tome decisões de arquitetura sem validação humana.',
      'Plan é a fase onde Claude instala dependências e configura o ambiente — a geração de código vem depois',
      'Plan só é necessário para tarefas grandes (>100 linhas). Para tarefas pequenas, vá direto para code',
    ],
    correct: 1,
    explanation: 'A fase de planejamento explícito é o que separa Claude Code de um autocomplete avançado. Quando você pede "implemente feature X", Claude sem plan vai direto ao código — possivelmente errando a arquitetura ou tomando decisões que você teria questionado. Com plan (usando /plan ou pedindo explicitamente), Claude decompõe: quais arquivos tocará, qual abordagem tomará, quais trade-offs existem. Você pode corrigir o plan antes de uma linha de código ser escrita — muito mais barato que refatorar depois.',
  },
  {
    question: 'Você abriu o Claude Code em um repositório desconhecido para corrigir um bug. O que a fase "explore" deve cobrir antes de qualquer edição?',
    options: [
      'Explore é desnecessário se você já sabe qual arquivo precisa editar — vá direto para a edição',
      'Entender a estrutura do projeto (arquivos principais, dependências, padrões de código existente), localizar o código relevante, e identificar o contexto em volta do bug — para que a correção seja consistente com o resto do codebase',
      'Explore significa apenas ler o README — se existir documentação, o contexto está lá',
      'Explore é feito automaticamente pelo Claude Code ao iniciar — o usuário não precisa fazer nada',
    ],
    correct: 1,
    explanation: 'Explorar antes de agir é o que diferencia uma correção que "funciona" de uma que é consistente com o codebase. Claude pode editar um arquivo e "resolver" o bug, mas se não entendeu o padrão do projeto (como erros são tratados, quais convenções existem, se há testes que precisam de update), a correção vai parecer estrangeira no código. Peça a Claude: "explore a estrutura do projeto e me explique como [componente relevante] funciona antes de qualquer edição".',
  },
  {
    question: 'Qual é o risco de uma sessão de Claude Code que nunca faz commits incrementais e só commita no final?',
    options: [
      'Nenhum risco — commits são apenas registro histórico e não afetam o comportamento do Claude',
      'Commits frequentes permitem reverter parcialmente se Claude introduzir um bug no meio do trabalho. Sem commits intermediários, um erro no final pode exigir descartar horas de trabalho bom.',
      'Commits frequentes aumentam o consumo de tokens da sessão — o custo financeiro é o principal problema',
      'O único risco é perda de histórico legível — use apenas commits grandes com mensagens detalhadas',
    ],
    correct: 1,
    explanation: 'O commit incremental no workflow de Claude Code tem um papel diferente do humano: é um checkpoint seguro. Se Claude implementou 3 features e na 4ª introduziu um bug difícil de isolar, ter commits intermediários significa `git revert` ou `git checkout` rápido para o estado estável. Sem isso, você precisa entender o que Claude fez para desfazer manualmente. Além disso, commits pequenos com mensagens descritivas formam documentação do que foi feito — útil para entender as mudanças depois.',
  },
];

export default function ClaudeCodeWorkflowDiarioPage() {
  return (
    <ModuleLayout
      slug="claude-code-workflow-diario"
      title="Workflow diário: explore → plan → code → commit"
      icon="🔄"
      xp={70}
      readTime={14}
      trailName="Claude Code: do zero ao poder total"
      trailColor="#cc785c"
      nextSlug="claude-code-context-management"
      nextTitle="Gerenciamento de contexto: como Claude Code pensa e decide"
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
        Claude Code não é um chatbot de código. É um agente que lê arquivos, executa comandos, edita e commita — tudo de forma autônoma. Mas autonomia sem estrutura gera caos. O loop explore → plan → code → commit é o framework que transforma sessões de Claude Code de "tentativa e erro" em trabalho confiável e repetível.
      </p>

      <Section accent={accent} title="Os 4 momentos do loop">
        <ComparisonTable
          headers={['Fase', 'O que acontece', 'Seu papel', 'Duração típica']}
          rows={[
            ['🔍 Explore', 'Claude lê o codebase, entende estrutura, localiza código relevante', 'Dar contexto inicial, responder perguntas', '2-5 min'],
            ['📋 Plan', 'Claude decompõe a tarefa, propõe abordagem, lista arquivos que vai tocar', 'Validar, corrigir, aprovar', '1-3 min'],
            ['⚙️ Code', 'Claude implementa, rodando iterações de edição + verificação', 'Revisar outputs, aprovar ações', '5-30 min'],
            ['✅ Commit', 'Checkpoint estável — commit incremental com mensagem descritiva', 'Revisar diff, ajustar mensagem', '1-2 min'],
          ]}
          accent={accent}
        />
        <Callout>
          O loop é iterativo: após cada commit, você pode iniciar um novo ciclo para a próxima feature ou continuar dentro da mesma sessão para o próximo incremento.
        </Callout>
      </Section>

      <Section accent={accent} title="Fase 1 — Explore: dar contexto antes de agir">
        <p>A fase de exploração é onde Claude constrói o modelo mental do projeto. Sem isso, Claude edita arquivos como se fossem isolados — sem saber que existe um padrão de tratamento de erros, uma camada de abstração, ou um teste que precisa de update.</p>
        <CodeBlock>{`# Prompts eficazes para a fase de exploração:

# Para um codebase desconhecido:
"Antes de qualquer edição, explore a estrutura do projeto.
 Me diga: quais são os módulos principais, quais padrões
 de código existem (naming, error handling, testing),
 e onde está o código relacionado a [funcionalidade X]."

# Para um bug específico:
"Encontre onde [comportamento Y] é implementado.
 Leia o contexto em volta — funções chamadas, funções
 que chamam esse ponto — antes de propor qualquer correção."

# Para uma nova feature:
"Explore como features similares foram implementadas
 nesse codebase. Quais patterns foram usados em
 [feature parecida]? Isso vai guiar minha implementação."

# Claude Code responde explorando com ferramentas:
# → Glob para encontrar arquivos
# → Read para ler conteúdo
# → Grep para buscar padrões`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Fase 2 — Plan: alinhar antes de executar">
        <p>O plan é o contrato entre você e o agente. Claude decompõe a tarefa e você valida a abordagem antes de qualquer código ser gerado. É infinitamente mais barato corrigir um plan errado do que refatorar uma implementação errada.</p>
        <CodeBlock>{`# Como solicitar um plan explícito:

"Antes de implementar, me dê um plan:
 1. Quais arquivos você vai tocar?
 2. Qual é a abordagem geral?
 3. Existem trade-offs que devo conhecer?
 4. Há dependências ou riscos que identifica?"

# Ou usar o modo /plan se disponível no seu cliente:
/plan implementar autenticação JWT com refresh tokens

# Claude responde algo como:
# "Plan para JWT auth:
#  1. Criar src/lib/auth/jwt.ts — funções de sign/verify
#  2. Criar src/middleware/auth.ts — middleware de validação
#  3. Atualizar src/routes/user.ts — proteger rotas privadas
#  4. Adicionar testes em src/__tests__/auth.test.ts
#  Trade-off: JWT stateless vs sessões (escolhi JWT por escala)
#  Risco: refresh token storage — proposta: httpOnly cookie"
#
# Você pode então dizer:
# "Aprovado, mas armazene o refresh token em Redis, não cookie"
# ANTES de qualquer código ser escrito`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Fase 3 — Code: implementação incremental com supervisão">
        <p>Na fase de code, Claude implementa de forma iterativa — editando, verificando, ajustando. Seu papel é revisar as ações propostas e aprovar ou redirecionar quando necessário.</p>
        <CodeBlock>{`# Dicas para a fase de code:

# 1. Defina o escopo antes de começar
"Implemente apenas o passo 1 do plan (criar jwt.ts).
 Quando terminar, mostre o arquivo e aguarde aprovação
 antes de continuar para o passo 2."

# Por que: implementação incremental é mais fácil de revisar
# e permite correção de curso sem descartar tudo

# 2. Peça verificação após cada passo
"Após criar jwt.ts, rode os testes existentes para
 confirmar que nada quebrou antes de continuar."

# 3. Aprovação explícita para ações destrutivas
# Claude Code por padrão pede confirmação para Bash
# com efeitos colaterais — mas você pode ser mais explícito:
"Antes de rodar qualquer npm install, me mostre
 o que vai instalar e por quê"

# 4. Sessão de code bem conduzida vs mal conduzida:
# ✅ Bem: Claude edita um arquivo, mostra, você revisa, aprova
# ❌ Mal: "implemente tudo" → Claude edita 20 arquivos
#          → você descobre um problema no arquivo 15
#          → precisa entender tudo que Claude fez para reverter`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Fase 4 — Commit: checkpoint estável">
        <p>Commits incrementais são a rede de segurança do workflow. Cada commit é um ponto de restauração se algo der errado no próximo ciclo.</p>
        <CodeBlock>{`# Commit incremental após cada incremento funcional:

# Peça ao Claude para commitar quando um incremento estiver completo:
"Rode os testes, confirme que passam, e então faça commit
 com uma mensagem descritiva do que foi implementado."

# Claude irá:
# 1. Rodar npm test (ou equivalente)
# 2. Verificar status do git
# 3. Adicionar arquivos relevantes ao stage
# 4. Criar commit com mensagem descritiva

# Boas mensagens de commit (Claude tende a gerar boas):
# ✅ feat(auth): add JWT sign/verify with RS256
# ✅ fix(users): return 404 on non-existent user instead of 500
# ❌ update files
# ❌ changes

# Para code review antes de commitar:
"Antes de commitar, mostre o git diff completo
 e explique cada mudança para que eu possa revisar."

# Reverter se necessário:
git log --oneline -5    # ver últimos commits
git revert HEAD         # reverter último commit
git checkout <hash> .   # restaurar estado de um commit`}</CodeBlock>
        <ComparisonTable
          headers={['Frequência de commit', 'Vantagem', 'Desvantagem']}
          rows={[
            ['Por arquivo modificado', 'Granularidade máxima para reverter', 'Histórico ruidoso demais'],
            ['Por incremento funcional ✅', 'Equilíbrio: cada commit tem significado e é reversível', '—'],
            ['Por feature completa', 'Histórico limpo', 'Rollback descarta trabalho bom junto com o problemático'],
            ['Nunca durante a sessão', 'Nenhuma vantagem', 'Sem ponto de restauração — risco máximo'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="Integrando o loop no dia a dia">
        <CodeBlock>{`# Sessão típica de 30 minutos com Claude Code:

# Minuto 0-3: Exploração
claude
> "Preciso adicionar validação de email no formulário de cadastro.
>  Explore como o formulário de cadastro funciona atualmente,
>  incluindo onde a validação de outros campos é feita."

# Minuto 3-6: Plan
> "Ótimo, agora me dê um plan de 3 passos para adicionar
>  validação de email — sem implementar ainda."

# Minuto 6-8: Revisão do plan + ajuste
> "Aprovado. No passo 2, use a biblioteca 'zod' que já está
>  no projeto, não crie validação manual."

# Minuto 8-20: Code incremental
> "Implemente o passo 1 apenas. Mostre o resultado."
> "Looks good. Continue para o passo 2."
> "Aguarde — a regex de email está muito permissiva.
>  Use /^[^\s@]+@[^\s@]+\.[^\s@]+$/ em vez dessa."
> "Correto. Continue para o passo 3."

# Minuto 20-22: Testes + commit
> "Rode os testes de validação. Se passarem, faça commit."

# Minuto 22-30: Próximo incremento ou fim da sessão
> "Sessão encerrada. Amanhã continuamos com a mensagem de erro
>  localizada para PT-BR."

# Por que isso funciona melhor que "implemente tudo de uma vez":
# - Você revisou cada etapa
# - O commit é um checkpoint real
# - Se algo está errado, você sabe exatamente onde`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>O loop não é burocracia — é velocidade real.</strong> Sessões sem estrutura parecem mais rápidas no começo mas geram retrabalho. O loop explore → plan → code → commit parece mais lento nos primeiros 10 minutos, mas entrega código confiável, revisável e com histórico limpo. Para projetos sérios, a estrutura é o que permite usar Claude Code em produção com confiança.
      </Callout>

      <Callout>
        Próximo: <strong>Gerenciamento de contexto</strong> — como a janela de contexto funciona, quando compactar, quando reiniciar e como usar subagents para preservar o contexto principal limpo.
      </Callout>
    </div>
  );
}
