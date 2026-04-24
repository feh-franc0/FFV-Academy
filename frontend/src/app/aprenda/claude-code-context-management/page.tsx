import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#cc785c';

export const metadata = getModuleMetadata('claude-code-context-management');

const quiz: QuizQuestion[] = [
  {
    question: 'Quando a janela de contexto de uma sessão Claude Code fica muito longa, o que acontece com as instruções do CLAUDE.md?',
    options: [
      'CLAUDE.md é carregado separadamente e nunca é afetado pelo tamanho da janela de contexto',
      'CLAUDE.md fica no início do contexto — em janelas muito longas, pode ser "esquecido" efetivamente porque o modelo dá menos peso a tokens distantes. Isso explica comportamentos inconsistentes em sessões longas.',
      'O Claude Code automaticamente move o CLAUDE.md para o final do contexto quando a janela fica grande',
      'CLAUDE.md não afeta o contexto — é apenas documentação para o usuário, não para o modelo',
    ],
    correct: 1,
    explanation: 'Em sessões longas, o CLAUDE.md — que estava no início do contexto — fica "enterrado" sob muitas interações. Modelos de linguagem tendem a dar mais peso a tokens recentes (recency bias) e a tokens no início (primacy effect), mas tokens no meio de um contexto longo recebem relativamente menos atenção. Isso explica por que Claude pode "esquecer" regras do CLAUDE.md após uma sessão longa: não é esquecimento literal, é atenuação de sinal na atenção. A solução: iniciar nova sessão ou usar /compact.',
  },
  {
    question: 'O que o comando /compact faz no Claude Code e quando usá-lo?',
    options: [
      '/compact comprime os arquivos do projeto para reduzir o uso de disco — não tem relação com contexto',
      '/compact instrui Claude Code a resumir o histórico da conversa atual, preservando as decisões e estado importantes mas reduzindo o tamanho do contexto. Use quando a sessão está longa mas você quer continuar sem reiniciar.',
      '/compact é um alias para /clear — limpa completamente o histórico e começa do zero',
      '/compact só funciona em modo headless — não está disponível na interface interativa',
    ],
    correct: 1,
    explanation: '/compact pede a Claude Code para criar um resumo comprimido do histórico da sessão, mantendo o contexto essencial (decisões tomadas, estado do código, objetivos da sessão) mas descartando trocas detalhadas que não precisam mais ser lembradas. É útil quando você percebe que Claude está "esquecendo" coisas recentes ou sendo inconsistente — sinal de contexto sobrecarregado. Diferente de /clear que apaga tudo, /compact preserva a continuidade.',
  },
  {
    question: 'Qual é a principal razão para usar subagents em vez de continuar na sessão principal quando a tarefa envolve pesquisa em muitos arquivos?',
    options: [
      'Subagents são mais rápidos porque rodam em hardware dedicado separado',
      'Subagents preservam o contexto da sessão principal limpo. A tarefa de pesquisa (que lê muitos arquivos) acontece em uma janela de contexto isolada, e apenas o resultado relevante volta para a sessão principal — sem poluir com o ruído da exploração.',
      'Subagents são necessários para tasks que envolvem escrita de arquivo — a sessão principal só pode ler',
      'Não há razão prática — subagents e sessão principal têm o mesmo desempenho',
    ],
    correct: 1,
    explanation: 'A janela de contexto é um recurso limitado e precioso. Quando Claude lê 50 arquivos para responder uma pergunta, esse conteúdo fica no contexto — ocupando espaço que poderia ser usado para o código que você está implementando. Subagents resolvem isso: a tarefa de pesquisa acontece em uma janela isolada, Claude sumariza o resultado e envia de volta para o agente principal. O agente principal recebe apenas o sumário — não os 50 arquivos. Isso mantém o contexto principal focado e eficiente.',
  },
];

export default function ClaudeCodeContextManagementPage() {
  return (
    <ModuleLayout
      slug="claude-code-context-management"
      title="Gerenciamento de contexto: como Claude Code pensa e decide"
      icon="🧠"
      xp={65}
      readTime={13}
      trailName="Claude Code: do zero ao poder total"
      trailColor="#cc785c"
      nextSlug="claude-code-skills-commands"
      nextTitle="Skills e slash commands: criar seus próprios workflows"
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
        A janela de contexto é a memória de trabalho do Claude Code. Tudo que Claude "sabe" durante uma sessão — os arquivos que leu, as instruções do CLAUDE.md, o histórico da conversa — vive nessa janela. Entender como ela funciona e como gerenciá-la é a diferença entre sessões que se deterioram após 20 minutos e sessões que mantêm qualidade por horas.
      </p>

      <Section accent={accent} title="Como o contexto funciona na prática">
        <p>Imagine o contexto como uma folha de papel longa e finita. Cada coisa que Claude lê (arquivo, resposta, ferramenta) vai para essa folha. Quando a folha fica cheia, as coisas mais antigas ficam mais distantes — e Claude, como qualquer leitor, tende a dar mais atenção ao que está mais perto.</p>
        <ComparisonTable
          headers={['O que entra no contexto', 'Tamanho típico', 'Impacto']}
          rows={[
            ['CLAUDE.md', '1-10 KB', 'Carregado no início — fica distante em sessões longas'],
            ['Arquivos lidos (Read)', 'Variável', 'Cada arquivo lido adiciona tokens ao contexto'],
            ['Histórico de conversa', 'Cresce com o tempo', 'Principal causa de contexto longo em sessões prolongadas'],
            ['Output de ferramentas', 'Variável', 'Resultados de Bash, ls, grep ficam no contexto'],
            ['Raciocínio do Claude', 'Médio', 'Claude "pensa em voz alta" — isso também ocupa espaço'],
          ]}
          accent={accent}
        />
        <Callout>
          Claude 3.5 Sonnet/Opus têm janelas de 200K tokens. Para referência: um arquivo TypeScript médio tem ~500 tokens, um CLAUDE.md típico tem ~2-3K tokens, uma conversa de 1 hora pode acumular 20-50K tokens.
        </Callout>
      </Section>

      <Section accent={accent} title="Sinais de contexto sobrecarregado">
        <CodeBlock>{`# Como identificar que o contexto está ficando problemático:

# ❌ Sintoma 1: Claude "esquece" regras do CLAUDE.md
# Claude começa a fazer o que você proibiu no CLAUDE.md
# (usar next/image, fazer commits sem confirmação, etc.)
# Causa: CLAUDE.md está no início do contexto, agora distante

# ❌ Sintoma 2: Claude repete trabalho já feito
# "Vou criar o arquivo X" — mas X já foi criado na mesma sessão
# Causa: o momento em que X foi criado ficou distante no contexto

# ❌ Sintoma 3: Respostas mais genéricas e menos específicas
# Claude para de citar nomes de funções/variáveis do código
# e começa a falar em termos abstratos
# Causa: os detalhes do código que leu estão distantes

# ❌ Sintoma 4: Inconsistência de estilo
# Code gerado começa a divergir do padrão do projeto
# Causa: os exemplos de código que explorou no início ficaram distantes

# ✅ Solução: use /compact ou inicie nova sessão
# com resumo do estado atual`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Estratégias para preservar contexto">
        <CodeBlock>{`# Estratégia 1: /compact — resumir sem perder continuidade
# Use quando: sessão longa mas quer continuar no mesmo fluxo
/compact

# Claude vai:
# 1. Resumir o histórico em um bloco compacto
# 2. Manter decisões importantes e estado do código
# 3. Descartar trocas de detalhes que não precisam ser lembradas

# ---

# Estratégia 2: nova sessão com resumo manual
# Use quando: quer começar completamente limpo
# mas precisa continuar de onde parou

# Ao fechar a sessão, peça:
"Antes de encerrar: me dê um resumo de:
 1. O que foi implementado nessa sessão
 2. O estado atual (o que está funcionando, o que falta)
 3. Próximos passos com contexto suficiente para continuar amanhã"

# Na nova sessão:
"[cole o resumo]
 Continue a partir desse ponto."

# ---

# Estratégia 3: CLAUDE.md como âncora de contexto
# Coloque regras críticas no CLAUDE.md (sempre carregado)
# E reforce-as explicitamente quando sentir que Claude está divergindo:
"Lembre-se das regras no CLAUDE.md: [copie a regra relevante]"

# ---

# Estratégia 4: subagents para tarefas pesadas de leitura
# Delegar exploração extensa para um subagent
# mantém o contexto da sessão principal limpo
"Use um subagent para explorar todos os arquivos de teste
 do projeto e me traga apenas: quais patterns de teste são usados,
 qual biblioteca de assert, e um exemplo representativo."
# Claude principal recebe apenas o resumo, não os 30 arquivos`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Contexto eficiente: o que incluir e o que evitar">
        <ComparisonTable
          headers={['Prática', 'Impacto no contexto', 'Recomendação']}
          rows={[
            ['Pedir para ler arquivo inteiro', 'Alto (cada arquivo = centenas de tokens)', 'Especifique a seção relevante: "leia apenas a função X"'],
            ['Explorar antes de implementar', 'Médio (lê vários arquivos)', 'Use subagent para exploração extensa'],
            ['Sessões focadas em uma feature', 'Baixo (contexto coerente)', '✅ Recomendado — uma sessão por incremento'],
            ['Sessões multi-feature longas', 'Alto (cresce com o tempo)', 'Use /compact a cada ~1h ou entre features'],
            ['Copiar stack traces longos', 'Alto (texto longo)', 'Cole apenas a parte relevante do erro'],
            ['Logs de build/test extensos', 'Alto (muito ruído)', 'Filtre para linhas de erro: grep "ERROR" output.log'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="Quando reiniciar vs continuar">
        <CodeBlock>{`# Heurística para decidir:

# CONTINUE a sessão quando:
# - Sessão < 1 hora
# - Claude ainda referencia detalhes específicos do código
# - Comportamento consistente com CLAUDE.md
# - Implementando variações do mesmo tema

# USE /compact quando:
# - Sessão > 1 hora com histórico longo
# - Sintomas de contexto sobrecarregado aparecem
# - Quer continuar mas limpar "ruído" da exploração anterior

# INICIE nova sessão quando:
# - Feature completamente diferente começa
# - Claude claramente "esqueceu" muita coisa
# - Você quer uma perspectiva "fresca" do Claude no problema
# - Após commit de um incremento completo

# Para preservar estado ao iniciar nova sessão:
"Resuma nossa sessão para eu começar amanhã:
 - Arquivos tocados e o que foi feito em cada um
 - Decisões de arquitetura tomadas
 - Estado atual: o que funciona, o que está em progresso
 - Próximos 3 passos em ordem de prioridade"

# Cole isso no início da próxima sessão como:
"Continuando de ontem: [cole o resumo]"`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>O contexto é o RAM do agente — gerencie com cuidado.</strong> Sessões com contexto limpo produzem código melhor, mais consistente com o projeto, e com menos "surpresas". A regra de ouro: uma sessão por feature, subagent para exploração extensa, /compact quando sentir degradação.
      </Callout>

      <Callout>
        Próximo: <strong>Skills e slash commands</strong> — como criar workflows customizados que você invoca com /nome-do-comando para automatizar tarefas repetitivas no seu projeto.
      </Callout>
    </div>
  );
}
