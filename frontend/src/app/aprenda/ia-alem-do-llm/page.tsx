import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section, Callout, ComparisonTable, DecisionBox,
  ArchFlow, LayerStack, QAItem, CodeBlock, StackFlow, FlowDiagram,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('ia-alem-do-llm');

const accent = '#d2a8ff';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferenca entre o LLM e o harness de um agente?',
    options: [
      'Sao a mesma coisa — harness e so outro nome para o modelo',
      'O LLM e o cerebro (gera texto/decisoes); o harness e a infraestrutura que orquestra o loop, gerencia contexto, executa tools e controla permissoes',
      'O harness treina o LLM durante a execucao do agente',
      'O LLM roda no servidor; o harness roda no cliente',
    ],
    correct: 1,
    explanation: 'O LLM e uma funcao: texto in → texto out. O harness e tudo ao redor: o loop que chama o LLM repetidamente, o gerenciamento de contexto (o que vai no prompt), a execucao de tools, as permissoes, os subagentes. Um agente = LLM + harness.',
  },
  {
    question: 'Por que context engineering (gerenciamento de contexto) e critico para agentes?',
    options: [
      'Porque o context window e ilimitado e precisa ser organizado por questao estetica',
      'Porque o context window e finito — o harness precisa decidir o que incluir (relevante) e o que omitir (irrelevante) para que o LLM tome boas decisoes a cada passo',
      'Porque o modelo esquece tudo entre requests e precisa ser lembrado manualmente',
      'Porque context engineering reduz o custo de tokens a zero',
    ],
    correct: 1,
    explanation: 'Um agente pode executar 50+ passos. Se incluir todo o historico de acoes, o contexto estoura. O harness decide: resumir acoes antigas, incluir so resultados recentes, carregar arquivos relevantes sob demanda. Contexto bem curado = decisoes melhores + menos tokens = menor custo.',
  },
  {
    question: 'O que sao subagentes e quando usa-los?',
    options: [
      'Modelos menores que rodam dentro do modelo principal',
      'Agentes especializados delegados pelo agente principal para tarefas especificas — cada um com seu proprio contexto, tools e loop',
      'Threads paralelas que executam o mesmo prompt em multiplos modelos',
      'Copias do agente principal que rodam como fallback em caso de erro',
    ],
    correct: 1,
    explanation: 'Subagentes sao agentes independentes criados pelo agente principal para tarefas especificas. Ex: Claude Code cria um subagente para pesquisar no codebase enquanto o principal planeja. Cada subagente tem seu proprio contexto (nao polui o principal) e tools (podem ser restritos).',
  },
  {
    question: 'Por que agentes precisam de sistema de permissoes?',
    options: [
      'Para cumprir regulamentacoes de privacidade (GDPR/LGPD)',
      'Porque o modelo pode decidir executar acoes destrutivas (deletar arquivos, push force, enviar emails) — permissoes garantem que humanos aprovam acoes de alto risco antes da execucao',
      'Porque APIs externas exigem autenticacao OAuth',
      'Para limitar o numero de tokens gastos por sessao',
    ],
    correct: 1,
    explanation: 'Um agente com acesso a shell pode rodar "rm -rf /". Sem permissoes, cada tool call e potencialmente perigosa. Bons harnesses categorizam acoes em: auto-approve (ler arquivo), ask (deletar arquivo), block (push force para main). Claude Code faz exatamente isso.',
  },
];

export default function HarnessPage() {
  return (
    <ModuleLayout
      slug="ia-alem-do-llm"
      title="Harness: a Infraestrutura do Agente"
      icon="🏗️"
      xp={80}
      readTime={10}
      trailName="IA Alem do LLM"
      trailColor={accent}
      nextSlug="como-avaliar-modelos"
      nextTitle="Como Avaliar Modelos de IA"
      seoDesc="Os 6 componentes de um agente: LLM, tools, loop, contexto, subagentes e permissoes."
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
        Voce ja sabe que um agente e um LLM em loop com tools. Mas o que faz um agente <em>funcionar bem</em>? A resposta e o <strong>harness</strong> — a infraestrutura ao redor do modelo que orquestra o loop, gerencia contexto, controla permissoes e delega para subagentes. Neste artigo, voce vai entender os <strong>6 componentes</strong> que transformam um LLM em um agente profissional.
      </p>

      <Section title="Anatomia de um agente" accent={accent}>
        <ArchFlow
          title="Os 6 componentes do harness"
          accent={accent}
          columns={[
            {
              header: '1. LLM (cérebro)',
              headerColor: accent,
              items: ['Gera texto e decisões', 'Função pura: texto in → texto out', 'Não tem estado próprio', 'Tudo vem do contexto'],
            },
            {
              header: '2. TOOLS (mãos)',
              headerColor: 'var(--ffv-blue)',
              items: ['Executam ações no mundo real', 'read/write/edit arquivos', 'run_command (shell)', 'search, web, subagent'],
            },
            {
              header: '3. LOOP (ciclo)',
              headerColor: 'var(--ffv-green)',
              items: ['Think → Act → Observe', 'Repete até completar', 'Limite de iterações', 'Detecção de loops infinitos'],
            },
            {
              header: '4. CONTEXTO (memória)',
              headerColor: 'var(--ffv-orange)',
              items: ['O que vai no prompt a cada passo', 'System prompt + task + arquivos', 'Histórico compactado', 'Lazy loading sob demanda'],
            },
            {
              header: '5. SUBAGENTES (delegar)',
              headerColor: 'var(--ffv-purple)',
              items: ['Agentes filhos especializados', 'Contexto limpo e focado', 'Isolados do contexto principal', 'Resultado resumido ao parent'],
            },
            {
              header: '6. PERMISSÕES (segurança)',
              headerColor: 'var(--ffv-red)',
              items: ['Auto-approve: leitura', 'Ask once: edição', 'Always ask: delete/push', 'Block: rm -rf / force push'],
            },
          ]}
        />
      </Section>

      <Section title="1. LLM: o cerebro" accent={accent}>
        <p>
          O LLM e uma funcao pura: recebe texto (contexto), retorna texto (decisao/conteudo). Ele <strong>nao tem estado</strong> — tudo que sabe vem do contexto que o harness envia.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Escolha de modelo', 'Quando usar', 'Trade-off']}
          rows={[
            ['Opus / GPT-4', 'Tarefas complexas, raciocinio longo, planejamento', 'Mais caro ($15-75/M tokens), mais lento'],
            ['Sonnet / GPT-4o', 'Uso geral, coding, analise', 'Equilibrio custo/qualidade'],
            ['Haiku / GPT-4o-mini', 'Triagem, classificacao, tasks simples', 'Rapido e barato, menos capaz em tarefas complexas'],
          ]}
        />
        <Callout tone="info">
          Agentes profissionais usam <strong>multiplos modelos</strong>: Haiku para triagem rapida (qual tool usar?), Sonnet para execucao, Opus para planejamento e decisoes criticas. Isso otimiza custo sem sacrificar qualidade.
        </Callout>
      </Section>

      <Section title="2. Tools: as maos" accent={accent}>
        <p>
          Tools sao as interfaces do agente com o mundo. Em um coding agent tipico:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Tool', 'O que faz', 'Risco']}
          rows={[
            ['read_file', 'Le conteudo de um arquivo', 'Baixo — so leitura'],
            ['write_file', 'Cria ou sobrescreve arquivo', 'Medio — pode destruir trabalho'],
            ['edit_file', 'Edita trecho especifico (search/replace)', 'Medio — edicao precisa'],
            ['run_command', 'Executa comando no shell', 'Alto — pode rodar qualquer coisa'],
            ['search_codebase', 'Busca por pattern no codigo', 'Baixo — so leitura'],
            ['web_search', 'Pesquisa na internet', 'Baixo — so leitura'],
            ['create_subagent', 'Delega tarefa para agente filho', 'Medio — consume tokens'],
          ]}
        />
      </Section>

      <Section title="3. Loop: o ciclo de decisao" accent={accent}>
        <StackFlow
          title="Agent loop (ReAct pattern)"
          accent={accent}
          items={[
            {
              icon: '🎯',
              label: 'Receber tarefa',
              sub: 'entrada',
              detail: 'Usuario ou sistema define o objetivo: "Refatore esse modulo para usar async/await".',
              connector: 'THINK',
            },
            {
              icon: '🧠',
              label: 'Raciocinar',
              sub: 'LLM',
              detail: 'Modelo analisa o estado atual (arquivos lidos, erros anteriores, plano) e decide o proximo passo.',
              connector: 'ACT',
            },
            {
              icon: '🔧',
              label: 'Executar tool(s)',
              sub: 'harness',
              detail: 'Harness executa as tool calls do modelo. Pode ser read, edit, run_command, etc.',
              connector: 'OBSERVE',
            },
            {
              icon: '👀',
              label: 'Observar resultado',
              sub: 'harness → LLM',
              detail: 'Resultado da tool e adicionado ao contexto. Modelo ve: "Comando tsc retornou 3 erros de tipo...".',
              connector: 'DECIDE',
            },
            {
              icon: '🔄',
              label: 'Continuar ou terminar?',
              sub: 'LLM',
              detail: 'Se a tarefa nao esta completa, volta para THINK. Se completa, gera resposta final. Se preso, pede ajuda ao usuario.',
            },
          ]}
        />
        <p>
          O numero de iteracoes varia: uma refatoracao simples pode levar 5-10 passos. Um bug complexo pode levar 30-50. Agentes profissionais tem <strong>limites de iteracao</strong> para evitar loops infinitos e custo descontrolado.
        </p>
      </Section>

      <Section title="4. Context Engineering: o que vai no prompt" accent={accent}>
        <p>
          O contexto e <strong>tudo que o modelo ve a cada passo</strong>. Gerenciar esse contexto e talvez a parte mais importante e menos obvia do harness.
        </p>
        <LayerStack
          title="Composição do contexto a cada passo (200k tokens)"
          accent={accent}
          layers={[
            { label: 'SYSTEM PROMPT', content: '~2k tokens — Instruções, persona, regras de segurança', note: 'cacheado', tone: 'default' },
            { label: 'TASK', content: '~500 tokens — O que o usuário pediu', tone: 'default' },
            { label: 'RELEVANT FILES', content: '~5–20k tokens — Arquivos que o harness julga relevantes (carregados sob demanda)', tone: 'writable' },
            { label: 'ACTION HISTORY', content: '~2–10k tokens — Últimas N ações + resultados resumidos (ações antigas compactadas)', tone: 'default' },
            { label: 'CURRENT STATE', content: '~1k tokens — Erros pendentes, plano atual, progresso', tone: 'default' },
          ]}
        />
      </Section>

      <Section title="5. Subagentes: dividir para conquistar" accent={accent}>
        <p>
          Tarefas complexas se beneficiam de <strong>delegacao</strong>. O agente principal cria subagentes especializados, cada um com:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Agente principal', 'Subagente']}
          rows={[
            ['Contexto', 'Completo (task + historico)', 'Limpo (so a subtarefa)'],
            ['Tools', 'Todos disponiveis', 'Pode ser restrito (so leitura, por ex)'],
            ['Custo', 'Alto (contexto longo)', 'Menor (contexto focado)'],
            ['Risco', 'Pode tomar decisoes globais', 'Isolado — nao afeta estado principal'],
          ]}
        />
        <Callout tone="info">
          <strong>Exemplo real (Claude Code):</strong> o agente principal pede &ldquo;pesquise como a funcao X e usada no codebase&rdquo;. Um subagente faz grep, le arquivos, e retorna um resumo. O principal nao polui seu contexto com dezenas de resultados de busca — recebe so o resumo.
        </Callout>
      </Section>

      <Section title="6. Permissoes: seguranca em agentes" accent={accent}>
        <p>
          Um agente com acesso a shell pode rodar qualquer comando. Sem controle, isso e perigoso. Harnesses profissionais categorizam acoes por risco:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Nivel', 'Acoes', 'Comportamento']}
          rows={[
            ['Auto-approve', 'Ler arquivo, buscar codigo, listar diretorio', 'Executa sem perguntar'],
            ['Ask once', 'Editar arquivo, criar arquivo, instalar pacote', 'Pede permissao na primeira vez, lembra depois'],
            ['Always ask', 'Deletar arquivo, push git, executar shell generico', 'Pede permissao toda vez'],
            ['Block', 'Push force, rm -rf, credenciais, emails', 'Nunca permite — alerta o usuario'],
          ]}
        />
        <DecisionBox
          scenario="Projetando permissoes para um coding agent"
          winner="Default restritivo + escalation gradual"
          winnerColor={accent}
          why="Comece bloqueando tudo exceto leitura. O usuario libera acoes conforme confianca cresce. O custo de parar para pedir permissao e baixo; o custo de uma acao destrutiva nao autorizada e alto."
          alternatives={[
            { name: 'Auto-approve tudo', note: 'Apenas em ambientes isolados (containers, VMs) onde destruicao nao importa.' },
          ]}
        />
      </Section>

      <Section title="Padrões de orquestração: qual arquitetura usar" accent={accent}>
        <p>
          A estrutura do agente determina como ele decompõe tarefas complexas. Não existe
          padrão universal — cada um tem trade-offs em qualidade, velocidade e custo:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Padrão', 'Como funciona', 'Melhor para', 'Limitação']}
          rows={[
            ['ReAct (Reasoning + Acting)', 'Pense → Aja → Observe → Repita. Loop simples sem planejamento explícito.', 'Tarefas abertas onde o próximo passo depende do resultado anterior', 'Pode ficar preso em loops se uma ferramenta falha repetidamente'],
            ['Plan-and-Execute', 'Fase 1: planejar todos os passos. Fase 2: executar o plano.', 'Tarefas bem definidas onde o espaço de busca é conhecido antecipadamente', 'Plano pode ficar obsoleto se o ambiente muda durante execução'],
            ['Orchestrator-Worker', 'Agente orquestrador delega subtarefas para subagentes especializados.', 'Tarefas compostas com domínios distintos (código + busca + análise)', 'Overhead de comunicação entre agentes; custo alto'],
            ['Parallel Execution', 'Múltiplos subagentes trabalham simultaneamente em partes independentes.', 'Tarefas paralelizáveis: analisar 50 arquivos, pesquisar 10 fontes', 'Precisa de dependência clara entre subtarefas para evitar conflitos'],
            ['Reflexion', 'Agente auto-critica sua própria saída e itera até atingir qualidade alvo.', 'Tarefas com critério de qualidade claro (código que passa nos testes)', 'Caro (múltiplas iterações); risco de loop infinito sem critério de parada'],
          ]}
        />
        <FlowDiagram
          title="Orchestrator-Worker — o padrão mais escalável"
          accent={accent}
          orientation="vertical"
          steps={[
            { icon: '🎯', label: 'Orchestrator (LLM grande)', desc: 'Recebe tarefa, decompõe em subtarefas, delega para workers especializados' },
            { icon: '⚡', label: 'Workers paralelos (LLMs menores)', desc: 'Worker A: busca docs · Worker B: analisa código · Worker C: verifica tests' },
            { icon: '🔗', label: 'Agregação de resultados', desc: 'Orchestrator integra outputs dos workers, resolve conflitos, sintetiza resposta final' },
            { icon: '✅', label: 'Resultado consolidado', desc: 'Qualidade de modelo grande, custo de modelo pequeno (workers Haiku/mini)' },
          ]}
        />
        <Callout tone="info">
          Claude Code usa uma variação de Orchestrator-Worker: o modelo principal é o orquestrador,
          subagentes são spawned para tarefas específicas (ex: rodar testes em paralelo, buscar
          em múltiplas fontes). Cada subagente tem contexto próprio — quando termina, o contexto
          é descartado. Isso é o que permite tarefas muito longas sem estourar a context window.
        </Callout>
      </Section>

      <Section title="Custo de um agente em producao" accent={accent}>
        <LayerStack
          title='Custo real — "Adicionar autenticação JWT ao projeto" (Claude Sonnet 4)'
          accent={accent}
          layers={[
            { label: 'SEM OTIMIZAÇÃO', content: '25 passos × 8k input + 1k output = 200k/25k tokens → $0.60 input + $0.38 output = ~$1.00/tarefa', tone: 'danger' },
            { label: 'COM PROMPT CACHE', content: '-40% input: 200k × 60% × $3/M = $0.36 + $0.38 output = ~$0.74/tarefa', tone: 'default' },
            { label: 'COM SUBAGENTES HAIKU', content: 'Tasks de busca/leitura via Haiku ($0.25/M input): ~$0.45/tarefa total', tone: 'success' },
            { label: 'ESCALA MENSAL', content: '100 tarefas/dia × 22 dias × $0.45 = ~$990/mês · vs 1 dev sênior: $X.000+/mês', tone: 'writable' },
          ]}
        />
        <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
          A conta fecha quando o agente economiza 2+ horas/dia de trabalho de dev. Para tarefas bem definidas (testes, docs, bug fixes), o ROI é imediato.
        </p>
      </Section>

      <Section title="Perguntas e respostas" accent={accent}>
        <QAItem
          q="Qual a diferenca entre ReAct e outros patterns de agente?"
          a={<>ReAct (Reasoning + Acting) e o padrao mais simples: pense, aja, observe, repita. Outros patterns: <strong>Reflexion</strong> (agente critica suas proprias acoes e melhora), <strong>Tree of Thoughts</strong> (explora multiplos caminhos antes de agir), <strong>Plan-and-Execute</strong> (planeja todos os passos antes, depois executa). Na pratica, ReAct com subagentes cobre 90% dos casos.</>}
        />
        <QAItem
          q="Como evitar loops infinitos?"
          a={<>Tres mecanismos: (1) <strong>max iterations</strong> — limite duro de passos (ex: 50); (2) <strong>budget limit</strong> — pare quando gastar $X; (3) <strong>stuck detection</strong> — se o agente repete a mesma acao 3 vezes, pare e peca ajuda ao usuario. Claude Code usa os tres.</>}
        />
        <QAItem
          q="O contexto nao estoura em tarefas longas?"
          a={<>Estouraria sem gerenciamento. Estrategias reais: (1) <strong>context compaction</strong> — resumir acoes antigas quando o contexto passa de 80%; (2) <strong>subagentes</strong> — cada um tem contexto proprio, descartado apos retornar; (3) <strong>lazy loading</strong> — so incluir um arquivo quando o modelo pede, nao antecipadamente.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>O que voce aprendeu:</strong> um agente = LLM + harness. O harness tem 6 componentes: LLM (cerebro), tools (maos), loop (ciclo de decisao), contexto (memoria de trabalho), subagentes (delegacao) e permissoes (seguranca). Context engineering e a parte mais critica — o que o modelo ve determina o que ele faz. Proximo: como saber se um modelo e realmente bom — <strong>avaliacao de modelos de IA</strong>.
      </Callout>
    </div>
  );
}
