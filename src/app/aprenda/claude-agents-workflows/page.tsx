import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#a78bfa';

export const metadata = getModuleMetadata('claude-agents-workflows');

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre um "workflow" e um "agent" no contexto de sistemas com LLMs?',
    options: [
      'Workflows usam LLMs menores e agents usam LLMs maiores — é uma distinção de custo',
      'Workflows têm fluxo de controle predefinido no código: o desenvolvedor determina a sequência de chamadas. Agents decidem dinamicamente o próximo passo: o LLM controla o fluxo, decidindo quais tools usar, em que ordem e por quanto tempo. Workflows são determinísticos; agents são adaptativos.',
      'Agents são mais novos — workflows é a terminologia antiga para a mesma coisa',
      'Workflows são para tarefas de texto; agents são necessários apenas quando há chamadas de API externas',
    ],
    correct: 1,
    explanation: 'A distinção importa para a decisão arquitetural. Em um workflow, o desenvolvedor escreve o código que define a sequência: chame LLM com prompt A → parse output → chame API B → chame LLM com prompt C. O LLM é um componente executado pelo código. Em um agent, o LLM orquestra: dado um objetivo, ele decide usar tool A, ver o resultado, depois usar tool B — o código apenas fornece o loop e as tools disponíveis. Workflows são mais fáceis de debugar e testar. Agents são mais flexíveis para tarefas abertas. Use workflow quando o processo é bem definido; use agent quando o processo precisa ser descoberto.',
  },
  {
    question: 'Em um sistema multi-agent com um orquestrador e workers especializados, qual é a responsabilidade correta do orquestrador?',
    options: [
      'O orquestrador executa todas as tarefas — workers apenas verificam o output',
      'O orquestrador decompõe a tarefa em sub-tarefas, delega para workers especializados, agrega os resultados e decide os próximos passos. Ele não executa tarefas diretamente — sua responsabilidade é coordenação e síntese, não execução.',
      'O orquestrador é apenas um roteador — encaminha a mensagem do usuário para o worker correto sem modificar',
      'O orquestrador e workers são iguais — a distinção é apenas para clareza conceitual',
    ],
    correct: 1,
    explanation: 'O padrão orquestrador-worker tem responsabilidades bem separadas. O orquestrador recebe a tarefa de alto nível ("faça due diligence desta empresa"), decompõe em sub-tarefas especializadas ("pesquise histórico financeiro", "analise reputação online", "verifique litígios"), delega para workers especializados, agrega os resultados ("o pesquisador trouxe X, o analisador identificou Y"), e decide se precisa de mais iterações. Os workers são especializados e executam tarefas específicas sem visão do contexto maior. O orquestrador tem a visão completa mas não executa nada — é o gerente de projeto do sistema.',
  },
  {
    question: 'Quando usar "parallel fan-out" versus chamadas sequenciais de agents?',
    options: [
      'Sempre use parallel fan-out — é sempre mais rápido que sequencial',
      'Use parallel fan-out quando as sub-tarefas são independentes (o resultado de A não é input de B). Use sequencial quando há dependência: o output do agent A é necessário como input do agent B. Paralelizar tarefas dependentes produz resultados incorretos porque B roda sem os dados de A.',
      'Use sequencial sempre — paralelo é mais difícil de debugar e não compensa na prática',
      'Use parallel fan-out apenas quando todas as sub-tarefas têm exatamente o mesmo tipo de output',
    ],
    correct: 1,
    explanation: 'A decisão entre paralelo e sequencial é puramente sobre dependências de dados. "Pesquise concorrente A" e "pesquise concorrente B" são independentes — rode em paralelo, o resultado é 2× mais rápido. "Analise o código" e "escreva os testes baseado na análise" são dependentes — o segundo precisa do output do primeiro, então é necessariamente sequencial. Para sistemas complexos, você frequentemente combina: fase 1 (paralelo): pesquisar múltiplas fontes → fase 2 (sequencial): sintetizar resultados da fase 1 → fase 3 (paralelo): gerar seções do relatório final baseado na síntese.',
  },
];

export default function ClaudeAgentsWorkflowsPage() {
  return (
    <ModuleLayout
      slug="claude-agents-workflows"
      title="Agents e Workflows: orquestração, handoffs e sistemas multi-agent"
      icon="🤖"
      xp={85}
      readTime={17}
      trailName="API Claude & Agents"
      trailColor="#a78bfa"
      nextSlug="claude-em-producao"
      nextTitle="Claude em produção: custo real, rate limits, caching e segurança"
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
        Systems com múltiplos agents são o que permite resolver tarefas que excedem a capacidade de um único contexto ou requerem especialização paralela. Neste módulo, cobrimos os padrões fundamentais de orquestração: quando usar workflow fixo vs agent adaptativo, como implementar handoffs e como compor sistemas multi-agent confiáveis.
      </p>

      <Section accent={accent} title="Workflows vs Agents: a decisão certa">
        <ComparisonTable
          headers={['Critério', 'Workflow (código controla)', 'Agent (LLM controla)']}
          rows={[
            ['Processo', 'Bem definido e estável', 'Aberto ou variável'],
            ['Debugging', 'Simples — trace determinístico', 'Complexo — decisões emergentes'],
            ['Custo', 'Previsível — N chamadas fixas', 'Variável — N calls dependem do LLM'],
            ['Flexibilidade', 'Baixa — mudança requer código', 'Alta — adapta ao contexto'],
            ['Confiabilidade', 'Alta — comportamento estável', 'Moderada — depende do modelo'],
            ['Ideal para', 'Extração, classificação, geração formatada', 'Pesquisa, resolução de problemas, análise aberta'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Exemplo: mesmo objetivo, abordagem diferente

# ─── WORKFLOW (processo fixo) ───────────────────────────
# Classificar sentimento + extrair entidades de reviews
# Processo sempre é: classificar → extrair → formatar

def processar_review_workflow(review: str) -> dict:
    # Passo 1: classificação
    sentimento = client.messages.create(
        model="claude-haiku-4-5-20251001",  # modelo menor = mais barato
        max_tokens=10,
        messages=[{"role": "user",
                   "content": f"Sentimento (positivo/negativo/neutro):\n{review}"}]
    ).content[0].text.strip()

    # Passo 2: extração
    entidades = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=100,
        messages=[{"role": "user",
                   "content": f"Entidades mencionadas (JSON list):\n{review}"}]
    ).content[0].text.strip()

    return {"sentimento": sentimento, "entidades": json.loads(entidades)}

# ─── AGENT (processo adaptativo) ────────────────────────
# Investigar reclamação de cliente — processo varia por caso

def investigar_reclamacao_agent(reclamacao: str) -> str:
    # Claude decide quais tools usar, em que ordem, quantas vezes
    messages = [{"role": "user", "content": reclamacao}]
    while True:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=2048,
            tools=[buscar_pedido_tool, buscar_historico_tool, consultar_estoque_tool],
            messages=messages
        )
        if response.stop_reason == "end_turn":
            return response.content[0].text
        # ... processa tool calls e continua`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Padrão orquestrador-worker">
        <CodeBlock>{`# Orquestrador delega para workers especializados:

import asyncio
from anthropic import Anthropic

client = Anthropic()

# ─── Workers especializados ──────────────────────────────

async def worker_pesquisa(topico: str) -> str:
    """Worker especializado em pesquisa web."""
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1000,
        tools=[search_web_tool],  # só tem acesso à pesquisa
        system="Você é um pesquisador. Pesquise e retorne fatos verificáveis.",
        messages=[{"role": "user", "content": f"Pesquise: {topico}"}]
    )
    return _run_tool_loop(response)  # loop de tool use

async def worker_analise(dados: str, criterios: str) -> str:
    """Worker especializado em análise estruturada."""
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1000,
        system="Você é um analista. Avalie os dados segundo os critérios fornecidos.",
        messages=[{"role": "user",
                   "content": f"Dados:\n{dados}\n\nCritérios:\n{criterios}"}]
    )
    return response.content[0].text

async def worker_redacao(analises: list[str], formato: str) -> str:
    """Worker especializado em síntese e redação."""
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2000,
        system="Você é um editor. Sintetize as análises em um relatório coeso.",
        messages=[{"role": "user",
                   "content": f"Síntese em {formato}:\n\n" + "\n---\n".join(analises)}]
    )
    return response.content[0].text

# ─── Orquestrador ─────────────────────────────────────────

async def orquestrar_due_diligence(empresa: str) -> str:
    """
    Orquestrador que coordena workers para due diligence.
    O orquestrador não executa pesquisa ou análise — só coordena.
    """

    # FASE 1: Pesquisa paralela (sub-tarefas independentes)
    topicos = [
        f"histórico financeiro e funding de {empresa}",
        f"reputação e reviews de {empresa}",
        f"litígios e problemas legais de {empresa}",
        f"concorrentes diretos de {empresa}",
    ]

    pesquisas = await asyncio.gather(*[
        worker_pesquisa(topico) for topico in topicos
    ])

    # FASE 2: Análise paralela (cada pesquisa → análise independente)
    criterios = """
    - Saúde financeira: crescimento, lucratividade, riscos
    - Reputação: NPS, reviews, crises de imagem
    - Risco legal: pendências, compliance
    - Posição competitiva: market share, diferenciais
    """

    analises = await asyncio.gather(*[
        worker_analise(pesquisa, criterios)
        for pesquisa in pesquisas
    ])

    # FASE 3: Síntese sequencial (depende de todas as análises)
    relatorio = await worker_redacao(
        analises=analises,
        formato="relatório executivo de due diligence em Markdown"
    )

    return relatorio`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Handoffs entre agents">
        <CodeBlock>{`# Padrão de handoff: um agent passa contexto para outro

# Caso de uso: pipeline de conteúdo
# Pesquisador → Escritor → Editor → Publicador

class AgentPipeline:
    def __init__(self):
        self.history = []  # histórico compartilhado entre agents

    def executar_agent(self, system: str, task: str,
                       context: str = "") -> str:
        """Executa um agent com contexto acumulado do pipeline."""
        prompt = task
        if context:
            prompt = f"Contexto das etapas anteriores:\n{context}\n\n{task}"

        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=2000,
            system=system,
            messages=[{"role": "user", "content": prompt}]
        )
        result = response.content[0].text

        # Acumula no histórico do pipeline
        self.history.append({"agent": system[:50], "output": result})
        return result

    def gerar_artigo(self, topico: str) -> dict:
        pipeline = AgentPipeline()

        # Agent 1: Pesquisador
        pesquisa = pipeline.executar_agent(
            system="Você é um pesquisador especializado. Pesquise com profundidade.",
            task=f"Pesquise o tópico: {topico}. Retorne fatos, dados e fontes."
        )

        # Agent 2: Escritor (recebe pesquisa como contexto)
        rascunho = pipeline.executar_agent(
            system="Você é um escritor técnico sênior. Escreva com clareza e precisão.",
            task="Escreva um artigo técnico baseado na pesquisa. 800-1200 palavras.",
            context=f"PESQUISA:\n{pesquisa}"
        )

        # Agent 3: Editor (recebe rascunho como contexto)
        revisado = pipeline.executar_agent(
            system="Você é um editor exigente. Melhore sem alterar o conteúdo técnico.",
            task="Revise: melhore fluxo, corrija erros, garanta consistência de tom.",
            context=f"RASCUNHO:\n{rascunho}"
        )

        return {
            "topico": topico,
            "pesquisa": pesquisa,
            "rascunho": rascunho,
            "final": revisado,
            "pipeline_log": pipeline.history
        }`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Controle de qualidade e checkpointing">
        <CodeBlock>{`# Para sistemas de produção: checkpoints e validação entre etapas

import json
from dataclasses import dataclass
from enum import Enum

class Status(Enum):
    PENDENTE = "pendente"
    EM_PROGRESSO = "em_progresso"
    COMPLETO = "completo"
    FALHOU = "falhou"
    AGUARDANDO_REVISAO = "aguardando_revisao"  # Human-in-the-loop

@dataclass
class Checkpoint:
    etapa: str
    status: Status
    output: str | None = None
    erro: str | None = None

class PipelineComCheckpoint:
    def __init__(self, task_id: str):
        self.task_id = task_id
        self.checkpoints: list[Checkpoint] = []

    def executar_etapa(self, nome: str, fn, *args,
                       requer_aprovacao: bool = False) -> str:
        checkpoint = Checkpoint(etapa=nome, status=Status.EM_PROGRESSO)
        self.checkpoints.append(checkpoint)

        try:
            resultado = fn(*args)

            if requer_aprovacao:
                # Pausa para revisão humana (notifica via webhook, email, etc.)
                checkpoint.status = Status.AGUARDANDO_REVISAO
                checkpoint.output = resultado
                self._notificar_revisor(nome, resultado)
                aprovado = self._aguardar_aprovacao()  # polling ou webhook
                if not aprovado:
                    raise ValueError(f"Etapa '{nome}' rejeitada na revisão")

            checkpoint.status = Status.COMPLETO
            checkpoint.output = resultado
            return resultado

        except Exception as e:
            checkpoint.status = Status.FALHOU
            checkpoint.erro = str(e)
            # Persiste o estado — pode ser retomado de onde parou
            self._persistir_estado()
            raise

    def retomar_de_checkpoint(self, etapa_nome: str) -> None:
        """Retoma pipeline a partir de uma etapa específica."""
        # Útil quando uma etapa falha e o problema foi corrigido
        idx = next(i for i, c in enumerate(self.checkpoints)
                   if c.etapa == etapa_nome)
        self.checkpoints = self.checkpoints[:idx]  # remove checkpoints a partir dali`}</CodeBlock>
        <ComparisonTable
          headers={['Padrão', 'Quando usar', 'Trade-off']}
          rows={[
            ['Sequential workflow', 'Processo definido, etapas dependentes', 'Previsível mas inflexível'],
            ['Parallel fan-out', 'Sub-tarefas independentes', 'Rápido mas requer agregação'],
            ['Orchestrator-worker', 'Tarefas complexas com especialização', 'Flexível mas difícil de debugar'],
            ['Pipeline com handoff', 'Transformação progressiva de conteúdo', 'Claro mas latência acumulada'],
            ['Human-in-the-loop', 'Ações com alto impacto ou risco', 'Seguro mas latência manual'],
          ]}
          accent={accent}
        />
      </Section>

      <Callout tone="success">
        <strong>Sistemas multi-agent são multiplicadores de capacidade — quando bem orquestrados.</strong> A chave é clareza de responsabilidade: orquestrador coordena, workers executam, checkpoints garantem qualidade. O erro comum é fazer o orquestrador fazer tudo — isso destrói os benefícios da especialização e paralelismo. Comece simples: um workflow fixo para processo definido. Adicione agents onde o processo precisa ser adaptativo.
      </Callout>

      <Callout>
        Próximo: <strong>Claude em produção</strong> — custo real por chamada, estratégias de caching para economizar 80%+ em tokens, rate limits e como monitorar sistemas Claude em produção.
      </Callout>
    </div>
  );
}
