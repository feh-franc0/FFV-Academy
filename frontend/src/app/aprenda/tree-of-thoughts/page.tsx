import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  DecisionBox,
  QAItem,
  LayerStack,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('tree-of-thoughts');

const ACCENT = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a limitação fundamental do CoT linear que Tree of Thoughts resolve?',
    options: [
      'CoT linear é mais lento que ToT para todos os tipos de problema',
      'CoT linear segue um único caminho de raciocínio — se o modelo comete um erro de direção no início (exploração subótima), não há como backtrack. ToT mantém múltiplos caminhos em paralelo e pode abandonar ramos imprometedores antes de chegar a um beco sem saída',
      'CoT linear só funciona com modelos proprietários, ToT funciona com qualquer modelo',
      'CoT linear não consegue lidar com contextos maiores que 8k tokens',
    ],
    correct: 1,
    explanation:
      'CoT é greedy — avança por um único caminho de raciocínio. Problemas que requerem exploração (planejamento, criação de estratégias, puzzles) podem necessitar de backtrack quando um caminho não funciona. ToT (Yao et al. 2023) modela raciocínio como busca em árvore: gera múltiplos "pensamentos" em cada estado, avalia promissoridade com um LLM avaliador, e usa BFS/DFS para explorar o espaço de raciocínio.',
  },
  {
    question: 'Quais são os três componentes fundamentais de ToT?',
    options: [
      'Prompt, temperatura e número de tokens',
      'Gerador de pensamentos (propostas de próximos passos), avaliador (score de promissoridade de cada estado), e algoritmo de busca (BFS, DFS ou beam search) — cada componente é independentemente implementável',
      'Embedding, vector store e reranker',
      'Pré-processamento, inferência e pós-processamento',
    ],
    correct: 1,
    explanation:
      'ToT tem três componentes: (1) Thought generator — dado o estado atual, gera B pensamentos/propostas de próximos passos (sample ou proposal prompting); (2) State evaluator — LLM avalia se o estado é promissor ("sure/maybe/impossible" ou score 1-10); (3) Search algorithm — BFS explora em largura (todos os estados de profundidade k antes de k+1), DFS vai fundo em um ramo, beam search mantém top-B estados a cada nível.',
  },
  {
    question: 'Quando ToT é significativamente melhor que CoT simples?',
    options: [
      'ToT sempre é melhor — deve ser a abordagem padrão em todos os casos',
      'ToT brilha em problemas que requerem exploração sistemática do espaço de solução: puzzles lógicos, planejamento com restrições, geração de código com debugging iterativo, criação de provas matemáticas — onde soluções erradas se revelam apenas após múltiplos passos',
      'ToT é melhor apenas para problemas matemáticos com solução numérica única',
      'ToT é preferível apenas quando o contexto tem mais de 100k tokens disponíveis',
    ],
    correct: 1,
    explanation:
      'O paper original de ToT demonstrou melhorias dramáticas em: Game of 24 (matemática com backtrack), Creative Writing (planejamento de estrutura), Mini Crosswords (busca com restrições). Em tarefas lineares (Q&A, sumarização, tradução), CoT simples tem desempenho similar a ToT com 10-100× menos custo computacional. Use ToT quando o problema requer exploração, não apenas raciocínio linear.',
  },
  {
    question: 'Qual o principal custo de ToT comparado a CoT e como mitigar?',
    options: [
      'ToT requer hardware especial — GPU com mais de 80GB VRAM',
      'ToT requer múltiplos LLM calls por passo (B propostas × E avaliações × profundidade D) — custo pode ser 10-100× maior que CoT. Mitigar com: modelo pequeno para proposta/avaliação, profundidade máxima baixa, beam search com B=2-3, ou usar ToT apenas em sub-problemas críticos',
      'ToT requer fine-tuning do modelo para gerar pensamentos estruturados',
      'ToT só funciona com APIs que suportam function calling nativo',
    ],
    correct: 1,
    explanation:
      'Com B propostas por nível, E avaliações, e profundidade D, ToT faz O(B×E×D) calls LLM vs 1 call no CoT. Para B=3, E=1, D=4: 12 calls LLM vs 1. Para problemas que valem a pena explorar, isso é aceitável. Mitigue: use modelo barato (Haiku, GPT-4o-mini) para propostas e avaliação; reserve o modelo grande para a geração final com o melhor caminho encontrado; limite a profundidade.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="tree-of-thoughts"
      title="Tree of Thoughts: exploração de raciocínio como busca"
      icon="🌳"
      xp={80}
      readTime={16}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="chain-of-thought"
      nextTitle="Chain-of-Thought: raciocínio passo a passo em LLMs"
      relatedSlugs={['chain-of-thought', 'prompt-engineering-claude', 'modelos-de-raciocinio']}
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
        Chain-of-Thought é linear — avança por um único caminho e não pode desfazer erros de direção cometidos
        no início. Tree of Thoughts (Yao et al. 2023) modela o raciocínio como busca em árvore: gera múltiplos
        pensamentos candidatos em cada passo, avalia sua promissoridade, e usa BFS ou DFS para explorar o espaço
        de soluções — habilitando backtracking que CoT simplesmente não tem.
      </p>

      <Section title="CoT vs ToT: o problema do greedy" accent={ACCENT}>
        <LayerStack
          title="Comparação de estratégias de raciocínio"
          accent={ACCENT}
          separatorLabel="complexidade crescente"
          layers={[
            { label: 'Resposta direta', content: 'Input → Output (sem raciocínio explícito)', note: 'mais rápido, menos confiável', tone: 'default' },
            { label: 'Chain-of-Thought', content: 'Input → Passo1 → Passo2 → ... → Output (caminho único)', note: 'sem backtrack', tone: 'default' },
            { label: 'Self-Consistency', content: 'N caminhos independentes → votação majoritária', note: 'mais confiável, sem exploração', tone: 'writable' },
            { label: 'Tree of Thoughts', content: 'Árvore de estados com propostas + avaliação + busca', note: 'exploração sistemática', tone: 'success' },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'CoT', 'Self-Consistency', 'Tree of Thoughts']}
          rows={[
            ['Backtracking', 'Não', 'Não (caminhos independentes)', 'Sim — abandona ramos ruins'],
            ['Exploração', 'Greedy (1 caminho)', 'N caminhos paralelos', 'Árvore sistemática'],
            ['Custo LLM calls', '1', 'N (~5-10)', 'B×D (~10-100)'],
            ['Melhor para', 'Raciocínio linear', 'Confiabilidade em respostas', 'Planejamento, puzzles'],
            ['Complexidade impl.', 'Mínima', 'Baixa', 'Média-Alta'],
          ]}
        />
      </Section>

      <Section title="Arquitetura ToT: três componentes" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          ToT separa o raciocínio em três responsabilidades bem definidas, cada uma implementável com um
          prompt diferente ou até modelos diferentes.
        </p>
        <CodeBlock lang="python">{`from anthropic import Anthropic
from dataclasses import dataclass, field
from typing import Literal
import heapq

client = Anthropic()

@dataclass
class ThoughtNode:
    state: str             # pensamento/estado atual
    depth: int             # profundidade na árvore
    score: float           # score de promissoridade (0-1)
    path: list[str] = field(default_factory=list)  # caminho de pensamentos

    def __lt__(self, other):
        return self.score > other.score  # max-heap por score

# === Componente 1: Thought Generator ===
def generate_thoughts(problem: str, current_state: str, n: int = 3) -> list[str]:
    """Gera N próximos pensamentos candidatos dado o estado atual."""
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""Problema: {problem}

Estado atual do raciocínio: {current_state}

Gere exatamente {n} próximos passos de raciocínio diferentes e promissores.
Cada passo deve ser uma abordagem distinta para avançar na solução.
Formate como uma lista numerada: 1. ... 2. ... 3. ..."""
        }]
    ).content[0].text

    # Extrair pensamentos numerados
    lines = [l.strip() for l in response.split("\\n") if l.strip()]
    thoughts = []
    for line in lines:
        if line and line[0].isdigit() and "." in line:
            thought = line.split(".", 1)[1].strip()
            if thought:
                thoughts.append(thought)

    return thoughts[:n]

# === Componente 2: State Evaluator ===
def evaluate_state(problem: str, state: str) -> float:
    """Avalia a promissoridade de um estado (0.0 a 1.0)."""
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=128,
        messages=[{
            "role": "user",
            "content": f"""Problema: {problem}

Estado do raciocínio: {state}

Avalie em uma palavra se este estado é:
- "sure": provavelmente leva à solução (score ~0.9)
- "maybe": pode levar à solução (score ~0.5)
- "impossible": claramente não leva à solução (score ~0.1)

Responda com uma única palavra: sure, maybe, ou impossible."""
        }]
    ).content[0].text.strip().lower()

    scores = {"sure": 0.9, "maybe": 0.5, "impossible": 0.1}
    return scores.get(response, 0.5)

# === Componente 3: BFS Search ===
def tot_bfs(
    problem: str,
    initial_state: str,
    beam_width: int = 3,
    max_depth: int = 4,
) -> ThoughtNode:
    """Best-first search na árvore de pensamentos."""
    # Inicializar com estado inicial
    heap = [ThoughtNode(state=initial_state, depth=0, score=1.0)]

    best_node = heap[0]

    while heap and heap[0].depth < max_depth:
        # Expandir top-B nós
        current_level = []
        for _ in range(min(beam_width, len(heap))):
            if heap:
                current_level.append(heapq.heappop(heap))

        next_level = []
        for node in current_level:
            # Gerar pensamentos filhos
            thoughts = generate_thoughts(problem, node.state, n=beam_width)

            for thought in thoughts:
                new_state = f"{node.state}\\n→ {thought}"
                score = evaluate_state(problem, new_state)

                child = ThoughtNode(
                    state=new_state,
                    depth=node.depth + 1,
                    score=score,
                    path=node.path + [thought],
                )
                next_level.append(child)
                if score > best_node.score:
                    best_node = child

        # Manter apenas beam_width melhores para próximo nível
        next_level.sort(key=lambda x: x.score, reverse=True)
        for node in next_level[:beam_width]:
            heapq.heappush(heap, node)

    return best_node`}</CodeBlock>

        <Callout tone="warn">
          A implementação acima é simplificada para ilustrar os conceitos. Em produção, adicione: cache de
          avaliações para estados similares, poda agressiva de estados com score &lt; threshold, limite de
          budget total de tokens, e fallback para CoT simples se o budget se esgotar.
        </Callout>
      </Section>

      <Section title="DFS para problemas com restrições hard" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          DFS (Depth-First Search) é melhor quando você precisa verificar restrições rapidamente e quer
          encontrar qualquer solução válida (não necessariamente a ótima).
        </p>
        <CodeBlock lang="python">{`def tot_dfs(
    problem: str,
    state: str,
    depth: int = 0,
    max_depth: int = 5,
    n_thoughts: int = 3,
) -> str | None:
    """
    DFS com backtracking — retorna primeira solução válida encontrada.
    """
    # Verificar se chegamos a uma solução
    is_solution = check_if_solution(problem, state)
    if is_solution:
        return state

    if depth >= max_depth:
        return None

    # Gerar e ordenar pensamentos por score
    thoughts = generate_thoughts(problem, state, n=n_thoughts)
    scored = [(evaluate_state(problem, f"{state}\\n→ {t}"), t) for t in thoughts]
    scored.sort(reverse=True)  # explorar mais promissores primeiro

    for score, thought in scored:
        if score < 0.2:  # poda agressiva
            continue

        new_state = f"{state}\\n→ {thought}"
        result = tot_dfs(problem, new_state, depth + 1, max_depth, n_thoughts)
        if result is not None:
            return result  # encontrou solução, retorna

    return None  # backtrack — nenhum filho levou à solução

def check_if_solution(problem: str, state: str) -> bool:
    """Verifica se o estado atual representa uma solução completa."""
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=50,
        messages=[{
            "role": "user",
            "content": f"""Problema: {problem}

Estado: {state}

Este estado representa uma solução completa e correta para o problema?
Responda apenas: sim ou não"""
        }]
    ).content[0].text.strip().lower()
    return "sim" in response`}</CodeBlock>
      </Section>

      <Section title="ToT na prática: casos de uso reais" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Caso de uso', 'Por que ToT ajuda', 'Configuração sugerida']}
          rows={[
            ['Geração de código com debugging', 'Pode testar múltiplas abordagens e backtrack no erro', 'DFS, depth=3, n=3'],
            ['Planejamento de projeto', 'Explora sequências de tasks alternativas com restrições', 'BFS beam=3, depth=4'],
            ['Resolução de puzzles lógicos', 'Busca sistemática no espaço de deduções', 'DFS com poda por contradição'],
            ['Design de arquitetura de software', 'Avalia trade-offs de múltiplas opções', 'BFS beam=4, depth=3'],
            ['Geração de teste de hipóteses', 'Expande hipóteses candidatas e avalia cada uma', 'BFS beam=5, depth=2'],
          ]}
        />
        <DecisionBox
          scenario="Gerar solução para um problema de agendamento com 10+ restrições"
          winner="ToT com DFS e poda por violação de restrição"
          winnerColor={ACCENT}
          why="DFS encontra a primeira solução válida eficientemente. Poda por violação de restrição elimina ramos impossíveis cedo. Backtracking é essencial quando restrições hard tornam muitos caminhos inviáveis."
          alternatives={[
            { name: 'CoT few-shot', note: 'Tentativa única — falha se o caminho inicial viola alguma restrição' },
            { name: 'Self-consistency', note: 'N tentativas independentes — sem aprendizado entre tentativas' },
            { name: 'Modelo de raciocínio (o1)', note: 'Faz ToT internamente — mais simples se o modelo estiver disponível' },
          ]}
        />
        <QAItem
          q="Em 2026, modelos como o1/o3 e Claude Extended Thinking tornam ToT explícito desnecessário?"
          a={<>Para muitos casos, sim. Modelos de raciocínio fazem busca interna similar a ToT durante o "thinking" — sem precisar que você implemente a árvore externamente. Mas ToT explícito ainda tem vantagens: controle total sobre a árvore (você pode inspecionar cada nó), integração com ferramentas reais (cada nó pode executar código), domínios muito específicos onde o modelo de raciocínio não foi otimizado. Para problemas gerais, prefira usar Extended Thinking do Claude ou o1; implemente ToT quando precisar de mais controle.</>}
        />
        <QAItem
          q="Como reduzir o custo de LLM calls em ToT?"
          a={<>Estratégias: (1) Use modelo pequeno/barato para proposta e avaliação (Haiku, GPT-4o-mini) e modelo grande apenas para geração final; (2) Cache de avaliações para estados similares via embedding similarity; (3) Limite beam width a 2-3 — a maioria do ganho vem dos primeiros 2 candidatos; (4) Poda agressiva: score &lt; 0.3 descarta o ramo imediatamente; (5) Profundidade máxima baixa (3-4) — problemas que precisam de 10+ níveis são raros.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> ToT é CoT com backtracking — essencial quando problemas requerem exploração
        sistemática. Os três componentes: gerador de pensamentos, avaliador, algoritmo de busca. BFS para encontrar
        a melhor solução global; DFS para encontrar a primeira solução válida rapidamente. Custo é 10-100× maior
        que CoT — use seletivamente em problemas que genuinamente se beneficiam de exploração. Em 2026, modelos
        de raciocínio internalizaram ToT — use-os antes de implementar ToT explícito.
      </Callout>
    </div>
  );
}
