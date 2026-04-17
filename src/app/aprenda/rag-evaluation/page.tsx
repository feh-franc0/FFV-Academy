import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  QAItem,
  ArchDiagram,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Avaliando RAG: recall@k, nDCG e LLM-as-judge — FFV Academy',
  description:
    'Golden dataset, métricas de retrieval (recall@k, MRR, nDCG) e de generation (faithfulness, context precision, answer relevance). RAGAS, LLM-as-judge sem vazamento e como rodar eval harness em CI.',
};

const ACCENT = '#ff7eb6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença prática entre recall@k e nDCG@k?',
    options: [
      'São sinônimos',
      'Recall@k só mede se o doc certo está entre os top-k (binário por doc). nDCG@k pondera posição: doc certo na posição 1 vale mais que na posição 10. Para RAG, nDCG é mais fiel ao impacto real, já que o LLM tende a ancorar nos primeiros trechos do contexto',
      'Recall é mais antigo',
      'nDCG só serve para imagens',
    ],
    correct: 1,
    explanation:
      'Recall@5 = "o gabarito está nos 5 primeiros?" — sim/não. nDCG@5 pondera por log2(rank+1): o ganho de ter o gabarito na posição 1 vs 5 é substancial. Em RAG você quer o certo no topo, porque LLMs sofrem de "lost in the middle". Use recall@k para primeiro filtro, nDCG@k para ajuste fino.',
  },
  {
    question: 'Por que faithfulness e answer relevance precisam ser medidos separadamente?',
    options: [
      'Por questão de performance',
      'Porque uma resposta pode ser faithful (apoiada no contexto) mas não responder a pergunta (baixa relevance), ou ser relevante mas inventada (alta relevance, baixa faithfulness). Separar mostra qual dos dois motores do RAG está falhando — retrieval ou generation',
      'Não precisa, são iguais',
      'Faithfulness é só para GPT-4',
    ],
    correct: 1,
    explanation:
      'RAG tem duas falhas clássicas e independentes: (1) o modelo inventou algo fora do contexto = baixa faithfulness; (2) o modelo citou o contexto, mas o contexto não tinha a resposta = alta faithfulness, baixa answer relevance. Métrica agregada esconde qual é o problema. Meça os dois; aja no elo fraco.',
  },
  {
    question: 'Qual o maior risco de LLM-as-judge e como mitigar?',
    options: [
      'É sempre confiável',
      'Vazamento e viés: o juiz pode dar nota alta para respostas que "soam bem" mesmo erradas, ou favorecer respostas do mesmo modelo que está sendo julgado. Mitigação: juiz de família diferente do gerador, calibrar com humanos em uma amostra, e sempre fornecer rubrica + contexto + gabarito ao juiz',
      'Custo, usar modelo local resolve',
      'Latência',
    ],
    correct: 1,
    explanation:
      'LLM-as-judge é prático mas não é verdade. Estudos mostram correlação com humanos em 70-85% quando a rubrica é boa, e cai abaixo de 60% em dimensões subjetivas (tom). Boas práticas: (a) usar modelo diferente do avaliado, (b) validar 100 itens com humanos para calibrar, (c) rubrica explícita ≥ escore aberto, (d) "ground truth required" — o juiz recebe gabarito e avalia contra ele, não "em geral".',
  },
  {
    question: 'Por que um golden dataset pequeno (50-200 itens) já é suficiente para começar?',
    options: [
      'Não é, precisa de 10k+',
      'Porque em RAG o objetivo do eval não é treinar nada — é detectar regressões entre versões. 50-200 queries bem curadas, cobrindo os tipos de pergunta que o produto recebe, bastam para comparar pipelines. Aumente só quando o ruído da amostra pequena mascarar diferenças reais',
      'Porque modelos são pequenos',
      'Por causa do custo da API',
    ],
    correct: 1,
    explanation:
      'Você não treina em golden set — só compara. Com 100 itens cobrindo a distribuição das queries reais, uma melhoria de 5pp em recall é detectável. Erro comum é gastar semanas criando dataset de 10k; esse é trabalho de pesquisa, não de produção. Regra: colete as 100 queries mais frequentes dos últimos 30 dias, escreva gabarito à mão, comece.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="rag-evaluation"
      title="Avaliando RAG: recall@k, nDCG e LLM-as-judge"
      icon="📊"
      xp={80}
      readTime={16}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="agentes-padroes"
      nextTitle="Agent Patterns: ReAct, Reflexion e Tree of Thoughts"
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
        Um RAG sem eval harness é um RAG que você acha que funciona. Pipeline bonito, demo convincente, e 3 meses
        depois ninguém sabe por que a qualidade caiu. Avaliação não é overhead — é o instrumento que transforma RAG
        em engenharia. Este módulo é o mapa das métricas certas, como montar golden dataset, e como rodar eval em CI
        todo PR.
      </p>

      <Section title="As duas dimensões que importam" accent={ACCENT}>
        <ArchDiagram title="Eval de RAG: retrieval + generation" accent={ACCENT}>{`
                   ┌─────────────────────┐
                   │  Query              │
                   └─────────┬───────────┘
                             │
                  ┌──────────┴──────────┐
                  ▼                     ▼
         ╔════════════════╗    ╔════════════════╗
         ║   Retrieval    ║    ║   Generation   ║
         ║   métricas     ║    ║   métricas     ║
         ╠════════════════╣    ╠════════════════╣
         ║ recall@k       ║    ║ faithfulness   ║
         ║ MRR            ║    ║ context prec.  ║
         ║ nDCG@k         ║    ║ answer rel.    ║
         ║ hit rate       ║    ║ hallucination  ║
         ║ context recall ║    ║ completeness   ║
         ╚════════════════╝    ╚════════════════╝
                  │                     │
                  └─────────┬───────────┘
                            ▼
                ┌──────────────────────┐
                │  Score agregado +    │
                │  drill-down por tipo │
                └──────────────────────┘
`}</ArchDiagram>
        <Callout tone="info">
          <strong>Regra ouro:</strong> só meça agregado depois de conseguir separar retrieval de generation. Quando
          a resposta final sai errada, você precisa saber qual dos dois elos quebrou.
        </Callout>
      </Section>

      <Section title="Métricas de retrieval — quando o que você mede é posição" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Métrica', 'O que mede', 'Quando usar']}
          rows={[
            ['hit rate @ k', 'Fração de queries cujo gabarito aparece em top-k (binário)', 'Smoke test inicial, diagnóstico rápido'],
            ['recall @ k', 'Fração dos docs relevantes recuperados no top-k', 'Quando há múltiplos docs relevantes por query'],
            ['precision @ k', 'Fração do top-k que é relevante', 'Quando top-k é pequeno e você quer zero ruído'],
            ['MRR (Mean Reciprocal Rank)', 'Média de 1/rank do primeiro hit', 'Queries com exatamente 1 doc relevante (FAQ)'],
            ['nDCG @ k', 'Discounted Cumulative Gain normalizado', 'Quando posição no top-k importa muito (padrão em RAG)'],
            ['context recall (RAGAS)', 'Quantos dos "pedaços" do gabarito estão no contexto recuperado', 'Gabarito é uma resposta longa fragmentada em claims'],
          ]}
        />
        <CodeBlock lang="python">{`# Métricas de retrieval — implementação mínima
import math

def hit_rate_at_k(retrieved: list[str], gold: list[str], k: int) -> float:
    return 1.0 if any(d in gold for d in retrieved[:k]) else 0.0

def recall_at_k(retrieved: list[str], gold: list[str], k: int) -> float:
    return len(set(retrieved[:k]) & set(gold)) / max(len(gold), 1)

def mrr(retrieved: list[str], gold: list[str]) -> float:
    for i, d in enumerate(retrieved, start=1):
        if d in gold:
            return 1.0 / i
    return 0.0

def dcg_at_k(retrieved: list[str], gold: list[str], k: int) -> float:
    return sum(
        (1.0 if d in gold else 0.0) / math.log2(i + 1)
        for i, d in enumerate(retrieved[:k], start=1)
    )

def ndcg_at_k(retrieved: list[str], gold: list[str], k: int) -> float:
    ideal = dcg_at_k(gold[:k], gold, k)
    return dcg_at_k(retrieved, gold, k) / ideal if ideal > 0 else 0.0`}</CodeBlock>
      </Section>

      <Section title="Métricas de generation — quando o que você mede é a resposta" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Métrica', 'O que mede', 'Como calcular']}
          rows={[
            ['Faithfulness', 'Toda claim da resposta está no contexto?', 'Extrai claims da resposta, checa cada uma contra o contexto (LLM ou NLI)'],
            ['Context precision', '% dos chunks recuperados que foram úteis', 'Para cada chunk, LLM decide se contribui para a resposta'],
            ['Answer relevance', 'A resposta responde à pergunta?', 'Gera queries hipotéticas a partir da resposta, mede similaridade com a query original'],
            ['Completeness', 'A resposta cobre todos os aspectos da pergunta?', 'LLM compara resposta com gabarito, lista o que faltou'],
            ['Hallucination rate', '% de claims inventadas (não suportadas)', '1 − faithfulness, útil para SLO'],
          ]}
        />
        <Callout tone="warn">
          Faithfulness e answer relevance são <strong>ortogonais</strong>. Uma resposta pode ser 100% fiel ao contexto
          e 0% relevante ("não tenho informação" é fiel, mas inútil se o doc certo estava lá). Trackeie as duas em
          dashboards separados.
        </Callout>
      </Section>

      <Section title="LLM-as-judge: como usar sem se enganar" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          LLM-as-judge é o método mais escalável para métricas que exigiriam humano (faithfulness, answer relevance).
          Mas <em>não</em> é verdade revelada — é uma estimativa. Quatro regras evitam cair em armadilhas.
        </p>
        <ol className="flex flex-col gap-2 pl-5" style={{ listStyle: 'decimal' }}>
          <li><strong>Juiz de família diferente do gerador.</strong> Se o RAG usa Claude, julgue com GPT (ou inverso). Reduz viés de "mesma voz".</li>
          <li><strong>Calibre com humanos.</strong> Avalie 50-100 itens manualmente, correlacione com o juiz. Se correlação for &lt;0.7, melhore a rubrica antes de confiar.</li>
          <li><strong>Rubrica explícita, não escore aberto.</strong> "Escala 0-4, onde 0=... 1=... 4=..." vence "dê nota de 0 a 10".</li>
          <li><strong>Ground truth quando existe.</strong> Passe gabarito para o juiz. "Compare com referência" é muito mais confiável que "avalie em abstrato".</li>
        </ol>
        <CodeBlock lang="python">{`# Prompt de LLM-as-judge para faithfulness — com rubrica e ground truth
from anthropic import Anthropic

client = Anthropic()

JUDGE_PROMPT = """Você é um juiz objetivo avaliando se uma resposta é FIEL ao contexto fornecido.

Uma resposta é FIEL se toda afirmação factual nela pode ser derivada diretamente do contexto. Opiniões, interpretações ou conexões não presentes no contexto tornam a resposta NÃO FIEL.

<contexto>
{context}
</contexto>

<pergunta>
{question}
</pergunta>

<resposta>
{answer}
</resposta>

Liste cada afirmação factual da resposta. Para cada uma, diga: SUPORTADA (está no contexto), INFERIDA (razoável mas não explícita) ou NÃO SUPORTADA (não está no contexto).

Ao final, dê o veredito em JSON:
{{"faithfulness_score": 0.0 a 1.0, "unsupported_claims": ["..."]}}

faithfulness_score = claims SUPORTADAS / total de claims factuais."""

def judge_faithfulness(context: str, question: str, answer: str) -> dict:
    r = client.messages.create(
        model="claude-sonnet-4-6",             # juiz ≠ gerador
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": JUDGE_PROMPT.format(
                context=context, question=question, answer=answer
            ),
        }],
    )
    # parse do JSON final (em produção use structured output)
    import json, re
    match = re.search(r"\\{[^{}]*faithfulness_score[^{}]*\\}", r.content[0].text)
    return json.loads(match.group(0)) if match else {"faithfulness_score": 0.0}`}</CodeBlock>
      </Section>

      <Section title="RAGAS: o framework que padronizou o eval de RAG" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          RAGAS é lib Python open-source que implementa as métricas canônicas com LLM-as-judge por trás. Vale como
          ponto de partida — você ganha rapidez no setup e perde algum controle fino. Para produção madura, costuma
          evoluir para eval custom (fica mais transparente).
        </p>
        <CodeBlock lang="python">{`# pip install ragas datasets
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
)
from datasets import Dataset

# Seu golden set: query, contexto recuperado, resposta gerada, ground truth
data = Dataset.from_dict({
    "question":   ["Como cancelo minha conta?", ...],
    "contexts":   [["<chunk1>", "<chunk2>"], ...],
    "answer":     ["Para cancelar, acesse ...", ...],
    "ground_truth": ["Em Configurações > Conta > Encerrar.", ...],
})

result = evaluate(
    data,
    metrics=[faithfulness, answer_relevancy, context_precision, context_recall],
)
print(result)
# → {"faithfulness": 0.87, "answer_relevancy": 0.92, ...}`}</CodeBlock>
        <Callout tone="info">
          RAGAS usa OpenAI por default. Para PT-BR, troque o LLM e embedder explicitamente
          (<InlineCode>ragas.llms.LangchainLLMWrapper</InlineCode>) — senão você avalia em inglês por dentro e os
          scores ficam enviesados.
        </Callout>
      </Section>

      <Section title="Golden dataset: como montar o seu em 1 dia" accent={ACCENT}>
        <ol className="flex flex-col gap-2 pl-5" style={{ listStyle: 'decimal', color: 'var(--ffv-muted)' }}>
          <li>
            <strong>Colete queries reais.</strong> Últimas 500 queries dos logs do produto. Se ainda não está em
            produção, gere 100-200 queries a partir dos documentos (prompt de "faça pergunta que este doc responderia").
          </li>
          <li>
            <strong>Curate 100 diversas.</strong> Amostre cobrindo: queries curtas/longas, fáceis/ambíguas, com
            match lexical/semântico, dentro e fora da base ("negative" — deve retornar "não sei").
          </li>
          <li>
            <strong>Escreva gabarito à mão.</strong> Para cada query: doc_id relevante(s) + resposta esperada em 1-3
            frases. Isso é trabalho humano, sem atalho. 100 itens: 4-6h de trabalho bem feito.
          </li>
          <li>
            <strong>Versione como código.</strong> JSONL no repo, com schema fixo. Nunca edite em planilha que pode
            ser perdida.
          </li>
          <li>
            <strong>Revise trimestralmente.</strong> A distribuição de queries evolui; queries antigas perdem
            relevância. 15 min/trimestre para podar e adicionar.
          </li>
        </ol>
        <CodeBlock lang="json">{`// golden_set.jsonl — um item por linha
{
  "id": "q_001",
  "query": "Como resetar minha senha?",
  "type": "how-to",
  "relevant_doc_ids": ["doc_42", "doc_118"],
  "ground_truth_answer": "Na tela de login, clique em 'esqueci a senha'. Você receberá um email com link válido por 1h.",
  "difficulty": "easy",
  "should_refuse": false
}
{
  "id": "q_027",
  "query": "Qual a receita da empresa em 2025?",
  "type": "out-of-scope",
  "relevant_doc_ids": [],
  "ground_truth_answer": "Não tenho essa informação na base.",
  "difficulty": "medium",
  "should_refuse": true
}`}</CodeBlock>
      </Section>

      <Section title="Eval harness em CI: fail the build on regression" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Eval offline é inútil se não roda a cada mudança. Integre no CI todo PR que toca retrieval, prompt ou
          chunking. Promova uma baseline; PR que degrada &gt;2pp em métrica crítica falha.
        </p>
        <CodeBlock lang="yaml">{`# .github/workflows/rag-eval.yml
name: RAG Eval
on:
  pull_request:
    paths: ["src/rag/**", "prompts/**", "ingest/**"]

jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install -r requirements.txt

      - name: Run RAG eval on golden set
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: python -m eval.run --out eval_results.json

      - name: Compare with baseline
        run: |
          python -m eval.compare \\
            --baseline eval/baselines/main.json \\
            --current  eval_results.json \\
            --threshold 0.02

      - name: Post results to PR
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const r = JSON.parse(fs.readFileSync('eval_results.json'));
            const body = \`### RAG eval\\n\\n\` +
              \`- recall@5: \${r.recall_at_5.toFixed(3)}\\n\` +
              \`- nDCG@5:   \${r.ndcg_at_5.toFixed(3)}\\n\` +
              \`- faithfulness: \${r.faithfulness.toFixed(3)}\\n\`;
            github.rest.issues.createComment({
              ...context.repo, issue_number: context.issue.number, body
            });`}</CodeBlock>
        <Callout tone="success">
          Amostragem inteligente salva custo: rode full eval (100 itens) em PRs a código core, e 20 itens em cada
          commit de branch. Full roda em ~US$1-3 com Haiku/gpt-4o-mini como juiz, 20 itens custa centavos.
        </Callout>
      </Section>

      <Section title="Debug: quando a métrica cai, o que olhar primeiro" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Sintoma', 'Primeira suspeita', 'Como confirmar']}
          rows={[
            ['recall@k despenca', 'Chunking ou embedder mudou', 'Roda eval só de retrieval; compara com versão anterior do índice'],
            ['recall@k OK, faithfulness cai', 'Prompt do generator mudou', 'Git blame no prompt; A/B com versão antiga do prompt'],
            ['Answer relevance cai, faithfulness OK', 'Contexto vem mas LLM ignora', 'Checa ordem do contexto, prompt de "use apenas o contexto"'],
            ['Queries out-of-scope começam a ser respondidas', 'Threshold de refusal sumiu', 'Testa "should_refuse" queries isoladamente'],
            ['Métricas estáveis mas qualidade percebida caiu', 'Golden set está estagnado', 'Amostra 30 queries novas dos logs, avalia à mão'],
          ]}
        />
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Posso confiar em BLEU/ROUGE para RAG?"
          a={<>Não. BLEU e ROUGE medem overlap de n-gramas — funcionam mal quando a resposta certa pode ser parafraseada de muitos jeitos. Para RAG, priorize faithfulness e answer relevance (semânticas). Use BLEU/ROUGE só em traduções ou sumarizações com referência fixa.</>}
        />
        <QAItem
          q="Qual o tamanho mínimo útil de golden set?"
          a={<>~30 itens já detectam regressões grosseiras (quebrou retrieval). 100 itens permitem medir diferenças de ~5pp com confiança razoável. 300+ se você quer distinguir variações sutis entre pipelines. Prefira 100 bem curados a 1000 ruins.</>}
        />
        <QAItem
          q="Eval online (em produção) substitui eval offline?"
          a={<>Complementa, não substitui. Offline compara versões antes do deploy. Online (thumbs up/down, tempo de leitura, repetição de query) mede o mundo real, com lag. Produção madura tem os dois, com feedback online realimentando o golden set.</>}
        />
        <QAItem
          q="Quanto custa rodar eval harness semanal?"
          a={<>Para 100 itens com Haiku 4.5 ou gpt-4o-mini como juiz, ~US$1-3 por rodada. 10 runs semanais: ~US$10-30/mês. É desprezível comparado ao custo de um regressão silenciosa que só aparece em ticket de cliente.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Eval divide em retrieval (recall@k, nDCG) e generation (faithfulness, answer
        relevance). LLM-as-judge é escalável mas exige rubrica, juiz diferente do gerador e calibração humana.
        RAGAS para começar; eval custom para amadurecer. Golden set de 100 itens bem curados é suficiente. CI que
        falha em regressão &gt;2pp é o que transforma RAG em engenharia. Próximo bloco da trilha: agents — o
        retrieval que decide sozinho o que buscar.
      </Callout>
    </div>
  );
}
