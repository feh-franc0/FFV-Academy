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
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('meta-prompting');

const ACCENT = '#ec4899';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é APE (Automatic Prompt Engineer) e qual sua abordagem central?',
    options: [
      'APE é um sistema da Anthropic para gerar prompts automaticamente via interface gráfica',
      'APE usa um LLM para gerar candidatos de instrução/prompt, avalia cada candidato em um conjunto de exemplos, e seleciona o melhor via busca — trata otimização de prompt como problema de busca no espaço de instruções',
      'APE é uma técnica de compressão de prompts para reduzir o número de tokens',
      'APE usa gradient descent em representações contínuas dos prompts, similar ao fine-tuning',
    ],
    correct: 1,
    explanation:
      'APE (Zhou et al. 2022) formula otimização de prompt como: dado um conjunto de exemplos input→output, encontrar a instrução I que maximiza P(output | instruction + input). A busca: LLM gera N candidatos de instrução, avalia cada um no conjunto de calibração, seleciona o melhor por score. Extensões adicionam iterative refinement — o LLM recebe feedback sobre os candidatos piores e gera versões melhoradas.',
  },
  {
    question: 'Como DSPy (Stanford) difere de meta-prompting baseado em LLM como otimizador?',
    options: [
      'DSPy é apenas um wrapper de sintaxe sobre LangChain, sem otimização real',
      'DSPy trata o pipeline como programa com módulos declarativos e usa um compilador (teleprompter) que otimiza automaticamente os prompts de cada módulo via exemplos rotulados — você define a estrutura lógica, DSPy descobre as melhores instruções e few-shots',
      'DSPy usa gradient descent nos pesos do modelo, sendo equivalente a fine-tuning',
      'DSPy é exclusivo para tarefas de classificação, não funciona para geração de texto',
    ],
    correct: 1,
    explanation:
      'DSPy (Khattab et al. 2023) introduz "programmatic prompting": você define módulos como dspy.ChainOfThought("question -> answer"), conecta em pipeline, e um teleprompter (BootstrapFewShot, MIPRO) otimiza automaticamente os prompts de cada módulo usando um conjunto de treinamento. Sem DSPy: você escreve prompts manualmente e refaz a cada mudança no pipeline. Com DSPy: você define a lógica, o compilador descobre os melhores prompts.',
  },
  {
    question: 'Qual é o principal risco de usar LLM como otimizador de prompt sem validação rigorosa?',
    options: [
      'O LLM vai sempre gerar prompts muito longos que desperdiçam tokens',
      'Overfitting ao conjunto de calibração: o prompt otimizado memoriza os exemplos usados na otimização mas generaliza mal para exemplos reais — especialmente com conjuntos de calibração pequenos (<20 exemplos) ou não representativos da distribuição real',
      'LLMs não conseguem gerar prompts melhores que os escritos por humanos experientes',
      'Meta-prompting sempre aumenta o custo sem melhorar a qualidade das respostas',
    ],
    correct: 1,
    explanation:
      'O risco central é overfitting ao benchmark usado na otimização. O LLM pode encontrar prompts que exploram artefatos específicos dos exemplos de calibração (fraseamento particular, ordem, exemplos não representativos). Mitigações: conjunto de calibração grande e diverso (>50 exemplos), hold-out set separado para avaliação final, métricas de generalização não apenas accuracy, e múltiplas rodadas de otimização com exemplos diferentes.',
  },
  {
    question: 'O que é "prompt injection" no contexto de meta-prompting?',
    options: [
      'Técnica para inserir exemplos few-shot dinamicamente nos prompts',
      'Ataque onde entrada de usuário (ou documento externo) contém instruções disfarçadas que sobrescrevem o prompt original do sistema — em meta-prompting, o LLM otimizador pode ser manipulado por exemplos adversariais nos dados de treinamento',
      'Método de otimização que injeta gradientes nos embeddings do prompt',
      'Técnica de compressão para reduzir o tamanho dos prompts gerados automaticamente',
    ],
    correct: 1,
    explanation:
      'Prompt injection é um risco de segurança onde instruções adversariais no input sobrescrevem o comportamento do sistema. Em meta-prompting com dados de usuário não confiáveis, os exemplos usados para otimização podem conter instruções maliciosas que o LLM otimizador incorpora ao prompt gerado. Mitigação: sanitização rigorosa dos exemplos de treinamento, sandboxing do processo de otimização, e revisão humana dos prompts gerados antes de deploy.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="meta-prompting"
      title="Meta-prompting: LLMs gerando e otimizando seus próprios prompts"
      icon="🪄"
      xp={85}
      readTime={17}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="prompt-engineering-claude"
      nextTitle="Prompt Engineering com Claude"
      relatedSlugs={['prompt-engineering-claude', 'evals-como-disciplina', 'chain-of-thought']}
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
        Prompt engineering manual é tedioso, não-sistemático e difícil de escalar. Meta-prompting fecha o loop:
        usar LLMs para gerar, avaliar e otimizar os próprios prompts. De APE (Automatic Prompt Engineer) ao
        DSPy, o campo evoluiu de "o LLM escreve prompts" para "o LLM compila pipelines inteiros de raciocínio".
      </p>

      <Section title="O problema com otimização manual de prompts" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Problema', 'Abordagem manual', 'Meta-prompting']}
          rows={[
            ['Espaço de prompts é vasto', 'Tentativa e erro manual', 'Busca sistemática no espaço de instruções'],
            ['Mudanças no pipeline invalidam prompts', 'Re-escrever manualmente', 'Recompilar com o optimizer'],
            ['Difícil saber por que um prompt é melhor', 'Intuição do engenheiro', 'Análise quantitativa de candidatos'],
            ['Não escala para muitos módulos', 'Cada módulo requer engenheiro dedicado', 'Otimização automática de todos os módulos'],
            ['Métricas vagas ("parece melhor")', 'Avaliação subjetiva', 'Score objetivo em conjunto de calibração'],
          ]}
        />
        <Callout tone="warn">
          Meta-prompting não elimina a necessidade de engenharia de prompt — você ainda precisa definir
          a estrutura do pipeline, escolher métricas de avaliação, e curar o conjunto de calibração.
          O que muda: a escrita das instruções específicas vira responsabilidade do optimizer, não do
          engenheiro.
        </Callout>
      </Section>

      <Section title="APE: Automatic Prompt Engineer" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          APE (Zhou et al. 2022) trata otimização de prompt como problema de busca: gerar candidatos de
          instrução, avaliá-los em exemplos, selecionar o melhor, e opcionalmente refinar iterativamente.
        </p>
        <CodeBlock lang="python">{`from anthropic import Anthropic
from typing import Callable
import random

client = Anthropic()

def ape_optimize(
    task_description: str,
    examples: list[tuple[str, str]],   # [(input, expected_output), ...]
    n_candidates: int = 10,
    n_eval_examples: int = 20,
    metric_fn: Callable[[str, str], float] = None,
) -> str:
    """
    APE simplificado: gera N prompts candidatos e seleciona o melhor
    baseado em score no conjunto de avaliação.
    """

    # 1. Gerar prompts candidatos
    candidate_prompt = f"""Você é um expert em criação de instruções para sistemas de IA.

Abaixo estão exemplos de uma tarefa e as respostas esperadas.
Crie {n_candidates} instruções diferentes que, quando dadas a um LLM junto com o input,
produzirão respostas próximas ao esperado.

Descrição da tarefa: {task_description}

Exemplos:
{format_examples(examples[:5])}

Gere {n_candidates} instruções distintas, numeradas de 1 a {n_candidates}.
Varie o estilo: algumas diretas, algumas com contexto de persona, algumas com CoT."""

    candidates_text = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        messages=[{"role": "user", "content": candidate_prompt}]
    ).content[0].text

    candidates = parse_numbered_list(candidates_text, n_candidates)

    # 2. Avaliar cada candidato em subconjunto de exemplos
    eval_examples = random.sample(examples, min(n_eval_examples, len(examples)))

    def evaluate_candidate(instruction: str) -> float:
        scores = []
        for inp, expected in eval_examples:
            response = client.messages.create(
                model="claude-haiku-4-5-20251001",  # modelo barato para avaliação
                max_tokens=512,
                messages=[{
                    "role": "user",
                    "content": f"{instruction}\\n\\nInput: {inp}"
                }]
            ).content[0].text

            if metric_fn:
                score = metric_fn(response, expected)
            else:
                score = default_similarity(response, expected)
            scores.append(score)

        return sum(scores) / len(scores)

    # 3. Selecionar melhor candidato
    scored = [(evaluate_candidate(c), c) for c in candidates]
    scored.sort(reverse=True)

    best_score, best_instruction = scored[0]
    print(f"Melhor instrução (score: {best_score:.3f}):\\n{best_instruction}")

    return best_instruction

def format_examples(examples: list[tuple[str, str]]) -> str:
    return "\\n".join(f"Input: {inp}\\nOutput esperado: {out}" for inp, out in examples)

def parse_numbered_list(text: str, n: int) -> list[str]:
    lines = text.split("\\n")
    candidates = []
    current = []
    for line in lines:
        if line.strip() and line.strip()[0].isdigit() and "." in line[:3]:
            if current:
                candidates.append(" ".join(current))
            current = [line.split(".", 1)[1].strip()]
        elif current:
            current.append(line.strip())
    if current:
        candidates.append(" ".join(current))
    return candidates[:n]`}</CodeBlock>
      </Section>

      <Section title="DSPy: programmatic prompting" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          DSPy (Khattab et al. 2023, Stanford) eleva meta-prompting para o nível de "compilador de pipelines".
          Você define módulos declarativamente, conecta em pipeline, e o compilador otimiza os prompts
          automaticamente com exemplos rotulados.
        </p>
        <CodeBlock lang="python">{`# pip install dspy-ai
import dspy

# Configurar o LM
claude = dspy.LM("anthropic/claude-sonnet-4-6", max_tokens=2048)
dspy.configure(lm=claude)

# === Definir módulos ===

class GenerateAnswer(dspy.Signature):
    """Responda à pergunta baseado no contexto fornecido."""
    context: str = dspy.InputField(desc="Trechos de documentos relevantes")
    question: str = dspy.InputField()
    answer: str = dspy.OutputField(desc="Resposta concisa e precisa")

class AssessRelevance(dspy.Signature):
    """Avalie se o contexto é relevante para a pergunta."""
    context: str = dspy.InputField()
    question: str = dspy.InputField()
    is_relevant: bool = dspy.OutputField()
    confidence: float = dspy.OutputField(desc="0.0 a 1.0")

# Pipeline RAG com DSPy
class RAGPipeline(dspy.Module):
    def __init__(self, retriever, k: int = 5):
        self.retriever = retriever
        self.k = k
        self.assess = dspy.Predict(AssessRelevance)
        self.generate = dspy.ChainOfThought(GenerateAnswer)

    def forward(self, question: str) -> dspy.Prediction:
        # Recuperar documentos
        docs = self.retriever(question, k=self.k)

        # Filtrar por relevância
        relevant_docs = []
        for doc in docs:
            assessment = self.assess(context=doc, question=question)
            if assessment.is_relevant and assessment.confidence > 0.6:
                relevant_docs.append(doc)

        context = "\\n---\\n".join(relevant_docs[:3])

        # Gerar resposta com CoT
        prediction = self.generate(context=context, question=question)
        return prediction

# === Compilar (otimizar prompts) ===

from dspy.teleprompt import BootstrapFewShot

# Dataset de treinamento
trainset = [
    dspy.Example(
        question="O que é MVCC?",
        answer="MVCC (Multi-Version Concurrency Control) é uma técnica..."
    ).with_inputs("question"),
    # ... mais exemplos
]

# Métrica de avaliação
def evaluate_answer(example, prediction, trace=None):
    return dspy.evaluate.answer_exact_match(example, prediction)

# Compilar: BootstrapFewShot otimiza few-shots de cada módulo
teleprompter = BootstrapFewShot(metric=evaluate_answer, max_bootstrapped_demos=4)
compiled_rag = teleprompter.compile(RAGPipeline(retriever=my_retriever), trainset=trainset)

# O pipeline compilado tem prompts otimizados automaticamente
result = compiled_rag(question="Como funciona o WAL no PostgreSQL?")`}</CodeBlock>

        <Callout tone="info">
          DSPy tem múltiplos teleprompters com complexidade crescente: BootstrapFewShot (mais simples),
          MIPRO (multi-stage, mais eficaz), BayesianSignatureOptimizer (para poucos exemplos). Para
          começar, use BootstrapFewShot com 20-50 exemplos rotulados.
        </Callout>
      </Section>

      <Section title="LLM como otimizador iterativo" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Além de APE e DSPy, você pode implementar um loop simples de meta-otimização: o LLM propõe
          um prompt, você avalia no benchmark, e devolve o score + análise de erros para o LLM melhorar.
        </p>
        <CodeBlock lang="python">{`def iterative_prompt_optimizer(
    task: str,
    eval_fn: Callable[[str], float],  # retorna score 0-1
    initial_prompt: str,
    n_iterations: int = 5,
) -> str:
    """
    Loop de otimização: LLM gera prompt → avalia → LLM melhora baseado em feedback.
    """
    current_prompt = initial_prompt
    history = []

    for iteration in range(n_iterations):
        score = eval_fn(current_prompt)
        history.append({"prompt": current_prompt, "score": score})

        print(f"Iteração {iteration+1}: score={score:.3f}")

        if score > 0.95:
            print("Score excelente — parando otimização")
            break

        # Analisar erros dos exemplos que falharam
        failures = get_failure_examples(current_prompt, limit=5)

        # Pedir ao LLM para melhorar
        improvement_prompt = f"""Você está otimizando um prompt para a tarefa: {task}

Prompt atual:
---
{current_prompt}
---

Score atual: {score:.3f}

Exemplos onde o prompt falhou:
{format_failures(failures)}

Histórico de tentativas:
{format_history(history)}

Analise os padrões de falha e proponha uma versão melhorada do prompt.
Foque em corrigir as falhas específicas observadas, sem regredir nos casos que funcionaram."""

        new_prompt = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[{"role": "user", "content": improvement_prompt}]
        ).content[0].text

        current_prompt = extract_prompt_from_response(new_prompt)

    # Retornar o melhor da história
    best = max(history, key=lambda x: x["score"])
    return best["prompt"]`}</CodeBlock>

        <DecisionBox
          scenario="Otimizar prompt de extração de dados para novo domínio sem escrever manualmente"
          winner="APE com iterative refinement"
          winnerColor={ACCENT}
          why="APE gera candidatos diversificados que cobrem estilos de prompt diferentes. Iterative refinement com feedback de falhas converge para prompts especializados no domínio sem esforço manual. 3-5 iterações costumam ser suficientes."
          alternatives={[
            { name: 'DSPy BootstrapFewShot', note: 'Melhor quando você tem um pipeline multi-módulo e >30 exemplos rotulados' },
            { name: 'Otimização manual iterativa', note: 'Ainda válida para tarefas simples com engenheiro experiente' },
            { name: 'Fine-tuning do modelo', note: 'Para otimização de máxima performance quando prompts não são suficientes' },
          ]}
        />
        <QAItem
          q="Meta-prompting e DSPy funcionam com Claude?"
          a={<>Sim. DSPy suporta Claude nativamente via dspy.LM("anthropic/claude-sonnet-4-6"). APE funciona com qualquer provider. A qualidade dos prompts gerados depende do modelo usado no optimizer — Claude Sonnet ou GPT-4o como optimizer geram candidatos de melhor qualidade que modelos menores. Para a etapa de avaliação (que exige muitas chamadas), use o modelo mais barato que ainda consiga a task.</>}
        />
        <QAItem
          q="Como escolher o tamanho do conjunto de calibração para meta-prompting?"
          a={<>Mínimo viável: 20-30 exemplos para APE, 50+ para DSPy com BootstrapFewShot. Mais importante que o tamanho é a representatividade — o conjunto deve cobrir os tipos de casos mais frequentes E os edge cases críticos. Valide sempre em um hold-out set separado (nunca usado na otimização) para detectar overfitting ao conjunto de calibração. Hold-out com 30+ exemplos é o mínimo para validação confiável.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Meta-prompting fecha o loop de otimização: LLM gera e melhora os próprios
        prompts. APE é o ponto de entrada mais simples — gera candidatos e seleciona por score. DSPy é o
        estado da arte para pipelines multi-módulo. O loop iterativo com feedback de falhas é prático e
        poderoso mesmo sem frameworks. Riscos: overfitting ao conjunto de calibração, prompt injection nos
        dados de treinamento. Sempre valide em hold-out set antes de deploy.
      </Callout>
    </div>
  );
}
