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

export const metadata = getModuleMetadata('advanced-rag-tecnicas');

const ACCENT = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é HyDE (Hypothetical Document Embedding) e qual problema resolve?',
    options: [
      'É uma técnica para comprimir documentos antes de indexar no vector store',
      'Gera um documento hipotético que responderia a query, embeda esse documento (não a query) e usa o embedding resultante para busca — resolve o mismatch semântico entre queries curtas/vagas e documentos técnicos longos',
      'É um algoritmo de reranking que usa modelos cross-encoder',
      'Técnica para dividir documentos em chunks de tamanho ideal',
    ],
    correct: 1,
    explanation:
      'HyDE (Gao et al. 2022) observou que queries curtas ("como funciona MVCC?") têm distribuição de embedding diferente de documentos técnicos que as respondem. A solução: pedir ao LLM para gerar um documento hipotético ideal ("Um documento sobre MVCC em PostgreSQL seria..."), embedar o documento gerado e usar esse embedding para busca. O documento hipotético fica no mesmo espaço semântico dos documentos reais.',
  },
  {
    question: 'Qual a diferença entre query rewriting e step-back prompting?',
    options: [
      'São técnicas idênticas com nomes diferentes em papers distintos',
      'Query rewriting transforma a query original em variações mais específicas/alternativas para melhorar recall; step-back prompting abstrai a query para um conceito mais geral, buscando primeiro contexto de alto nível antes da pergunta específica',
      'Query rewriting só funciona com modelos de embedding; step-back apenas com modelos generativos',
      'Step-back é mais eficiente computacionalmente que query rewriting',
    ],
    correct: 1,
    explanation:
      'Query rewriting reformula a query em variações ("o que é X", "como funciona X", "X vs Y") para aumentar o recall na busca. Step-back prompting (Zheng et al. 2023) pede ao LLM para abstrair: dada "como resolver erro 404 em nginx?", o step-back seria "fundamentos de configuração de servidor web" — busca primeiro contexto genérico, depois o específico. Resolve o problema de queries que pressupõem conhecimento não explicitado.',
  },
  {
    question: 'O que é RAG Fusion e como ele melhora o resultado final?',
    options: [
      'Combina RAG com fine-tuning do modelo de linguagem para melhor recall',
      'Executa múltiplas queries em paralelo (reescritas da original), recupera documentos para cada uma, e funde os rankings via Reciprocal Rank Fusion (RRF) — retorna lista rankeada combinando evidências de múltiplas perspectivas',
      'Fusiona dois vector stores diferentes em um único índice para reduzir latência',
      'Técnica de compressão de contexto que combina RAG com prompt caching',
    ],
    correct: 1,
    explanation:
      'RAG Fusion (Raudaschl 2023) gera 4–5 variações da query original via LLM, executa retrieval para cada uma em paralelo, e funde os rankings com Reciprocal Rank Fusion (RRF = 1/(rank+k) por documento). O resultado é uma lista rankeada que agrega evidências de múltiplos ângulos da query. Melhora recall em 15–30% vs RAG simples em benchmarks, ao custo de 4–5× mais chamadas de embedding + retrieval.',
  },
  {
    question: 'Quando usar FLARE em vez de RAG padrão?',
    options: [
      'FLARE é sempre superior ao RAG padrão — deve ser a escolha padrão',
      'FLARE é indicado quando a geração envolve múltiplos fatos sequenciais que exigem contextos diferentes — ele recupera novo contexto dinamicamente quando detecta incerteza durante a geração, em vez de recuperar tudo upfront',
      'FLARE funciona apenas com modelos que suportam function calling nativo',
      'FLARE é preferível quando o corpus tem menos de 1.000 documentos',
    ],
    correct: 1,
    explanation:
      'FLARE (Active Retrieval Augmented Generation, Jiang et al. 2023) monitora a probabilidade dos tokens gerados. Quando o modelo fica incerto (probabilidade baixa), pausa a geração, usa o que foi gerado até agora como query, recupera novos documentos e continua. Ideal para perguntas multi-hop onde a resposta parte A depende de fatos diferentes da parte B. Custo: múltiplos rounds de retrieval por geração.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="advanced-rag-tecnicas"
      title="Advanced RAG: HyDE, query rewriting e step-back prompting"
      icon="🔬"
      xp={85}
      readTime={18}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="rag-fundamentos"
      nextTitle="RAG Fundamentos: retrieval-augmented generation do zero"
      relatedSlugs={['rag-fundamentos', 'hybrid-search-reranking', 'chunking-embeddings']}
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
        RAG naïve — chunkar, embedar, buscar top-K, gerar — funciona para demos. Em produção, falha em queries
        vagas, perguntas multi-hop, documentos longos e corpora especializados. Advanced RAG é um conjunto de
        técnicas que ataca cada um desses pontos de falha com precisão cirúrgica.
      </p>

      <Section title="Onde o RAG naïve falha" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Problema', 'Sintoma', 'Causa raiz']}
          rows={[
            ['Mismatch semântico', 'Query curta não encontra doc técnico longo', 'Embeddings de queries e docs ficam em subespaços diferentes'],
            ['Query ambígua', '"O que é X?" recupera documentos sobre múltiplos X', 'Query sem contexto suficiente para disambiguação'],
            ['Pergunta multi-hop', 'Responde parte A mas ignora contexto de B', 'Top-K único não cobre todos os fatos necessários'],
            ['Recall baixo', 'Documento relevante não está no top-K', 'Busca densa perde documentos sem overlap de vetor'],
            ['Lost in the middle', 'Chunk certo recuperado mas ignorado na geração', 'Posicionamento no contexto importa para o LLM'],
          ]}
        />
        <Callout tone="warn">
          Antes de implementar Advanced RAG, meça onde você está falhando. Use um eval harness com exemplos
          anotados: (1) recall@K — o documento certo está no top-K?, (2) faithfulness — o LLM usou o documento?,
          (3) answer relevance — a resposta realmente responde à pergunta? Atacar o problema errado desperdiça
          semanas.
        </Callout>
      </Section>

      <Section title="HyDE: Hypothetical Document Embedding" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          HyDE resolve o mismatch semântico entre queries e documentos gerando um documento hipotético que
          "responderia" à query. O embedding desse documento fica no mesmo espaço semântico dos documentos reais
          do corpus.
        </p>
        <LayerStack
          title="Pipeline HyDE"
          accent={ACCENT}
          separatorLabel="fluxo de busca"
          layers={[
            { label: 'Query original', content: '"Como funciona MVCC em PostgreSQL?"', tone: 'default' },
            { label: 'LLM gera doc hipotético', content: 'Gera parágrafo técnico como se fosse documentação real sobre MVCC', tone: 'default', note: 'modelo rápido/barato — Haiku, GPT-4o-mini' },
            { label: 'Embedding do doc hipotético', content: 'Vector do documento gerado, não da query original', tone: 'writable' },
            { label: 'Busca por similaridade', content: 'Top-K mais próximos do embedding hipotético no index', tone: 'writable' },
            { label: 'Geração final', content: 'LLM gera resposta real com os chunks recuperados', tone: 'success' },
          ]}
        />
        <CodeBlock lang="python">{`from openai import OpenAI
import numpy as np

client = OpenAI()

def hyde_retrieve(query: str, index, top_k: int = 5) -> list[dict]:
    # 1. Gerar documento hipotético
    hyp_doc = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role": "user",
            "content": f"""Escreva um parágrafo técnico de documentação que responderia
            diretamente à seguinte pergunta: {query}

            Seja específico, técnico e denso em informação. NÃO use "I don't know".
            Escreva como se fosse documentação real."""
        }],
        max_tokens=256,
        temperature=0.5,
    ).choices[0].message.content

    # 2. Embedar o documento hipotético (não a query)
    embedding = client.embeddings.create(
        model="text-embedding-3-large",
        input=hyp_doc,
    ).data[0].embedding

    # 3. Buscar com embedding do documento hipotético
    results = index.search(np.array(embedding), top_k=top_k)
    return results

# Comparação: retrieval normal vs HyDE
def normal_retrieve(query: str, index, top_k: int = 5):
    embedding = client.embeddings.create(
        model="text-embedding-3-large",
        input=query,
    ).data[0].embedding
    return index.search(np.array(embedding), top_k=top_k)`}</CodeBlock>
        <Callout tone="info">
          HyDE melhora mais em queries curtas/vagas e corpora técnicos especializados. Em queries já bem formuladas
          e corpora genéricos, o ganho é menor e o custo (1 LLM call extra) pode não compensar. Meça no seu
          corpus antes de ativar globalmente.
        </Callout>
      </Section>

      <Section title="Query Rewriting e Multi-Query Retrieval" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Query rewriting gera múltiplas variações da query original para aumentar o recall, cobrindo diferentes
          formulações que os documentos relevantes podem usar.
        </p>
        <CodeBlock lang="python">{`from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

# Multi-query rewriting
rewrite_prompt = ChatPromptTemplate.from_template("""
Você é um especialista em recuperação de informação. Dada a query abaixo,
gere {n_variants} variações diferentes que mantenham o mesmo significado
mas usem terminologias e ângulos distintos.

Query original: {query}

Retorne apenas as variações, uma por linha, sem numeração.
""")

rewrite_chain = rewrite_prompt | llm | StrOutputParser()

def multi_query_retrieve(query: str, retriever, n_variants: int = 4) -> list[str]:
    # Gerar variações da query
    variants_text = rewrite_chain.invoke({"query": query, "n_variants": n_variants})
    variants = [q.strip() for q in variants_text.split("\\n") if q.strip()]
    all_queries = [query] + variants  # incluir original

    # Recuperar documentos para cada variação
    all_docs = []
    seen_ids = set()
    for q in all_queries:
        docs = retriever.get_relevant_documents(q)
        for doc in docs:
            doc_id = doc.metadata.get("id", doc.page_content[:100])
            if doc_id not in seen_ids:
                seen_ids.add(doc_id)
                all_docs.append(doc)

    return all_docs`}</CodeBlock>

        <p style={{ color: 'var(--ffv-muted)' }}>
          Step-back prompting (Zheng et al. 2023) abstrai a query para recuperar primeiro contexto geral, depois
          o específico — especialmente útil quando a resposta requer conhecimento de base que a query não menciona.
        </p>
        <CodeBlock lang="python">{`def step_back_retrieve(query: str, retriever) -> list[str]:
    # Gerar query abstrata de "passo atrás"
    stepback_prompt = f"""Dada a pergunta específica abaixo, formule uma pergunta
mais geral e conceitual que precisaria ser respondida primeiro para entender
o contexto necessário para responder a pergunta original.

Pergunta original: {query}
Pergunta mais geral (step-back):"""

    stepback_query = llm.invoke(stepback_prompt).content

    # Buscar com a query abstrata (contexto geral)
    general_docs = retriever.get_relevant_documents(stepback_query)

    # Buscar com a query original (contexto específico)
    specific_docs = retriever.get_relevant_documents(query)

    # Combinar: geral primeiro (contexto), específico depois (fatos)
    combined = general_docs[:3] + specific_docs[:5]
    return combined

# Exemplo:
# Query: "Por que minha transação Postgres travou com lock_timeout?"
# Step-back: "Como funcionam locks e transações em bancos de dados relacionais?"
# → recupera docs sobre MVCC e locks → contexto para entender o erro específico`}</CodeBlock>
      </Section>

      <Section title="RAG Fusion: Reciprocal Rank Fusion" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          RAG Fusion combina resultados de múltiplas queries com Reciprocal Rank Fusion (RRF), um algoritmo
          de fusão de rankings que não requer normalização de scores e é robusto a outliers.
        </p>
        <CodeBlock lang="python">{`from collections import defaultdict

def reciprocal_rank_fusion(
    results_list: list[list[tuple[str, float]]],  # [(doc_id, score), ...]
    k: int = 60,  # constante de suavização — k=60 é o padrão empírico
) -> list[tuple[str, float]]:
    """
    RRF score = sum(1 / (k + rank)) para cada lista de resultados
    Rank começa em 1 (primeiro resultado = rank 1)
    """
    scores: dict[str, float] = defaultdict(float)

    for results in results_list:
        for rank, (doc_id, _original_score) in enumerate(results, start=1):
            scores[doc_id] += 1.0 / (k + rank)

    # Ordenar por score RRF decrescente
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)

def rag_fusion_pipeline(query: str, retriever, n_queries: int = 5) -> list[str]:
    # 1. Gerar variações da query
    queries = generate_query_variants(query, n=n_queries)

    # 2. Retrieval para cada query
    results_per_query = []
    for q in queries:
        docs = retriever.get_relevant_documents(q)
        doc_rankings = [(d.metadata["id"], 1.0) for d in docs]  # score placeholder
        results_per_query.append(doc_rankings)

    # 3. Fundir rankings com RRF
    fused = reciprocal_rank_fusion(results_per_query)

    # 4. Buscar documentos na ordem fused
    top_ids = [doc_id for doc_id, _ in fused[:10]]
    return fetch_docs_by_ids(top_ids)`}</CodeBlock>
        <Callout tone="info">
          RRF é agnóstico ao score original — funciona tanto com resultados de busca densa quanto esparsa (BM25),
          o que o torna ideal para hybrid search + multi-query. A constante k=60 foi otimizada empiricamente;
          valores entre 40–80 produzem resultados similares.
        </Callout>
      </Section>

      <Section title="FLARE: recuperação ativa durante geração" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          FLARE (Forward-Looking Active REtrieval) monitora a certeza do modelo durante a geração e recupera
          novos documentos quando detecta incerteza — em vez de recuperar tudo upfront.
        </p>
        <CodeBlock lang="python">{`import tiktoken
from openai import OpenAI

client = OpenAI()
enc = tiktoken.encoding_for_model("gpt-4o")

def flare_generate(query: str, retriever, max_tokens: int = 1024) -> str:
    """
    Geração FLARE simplificada:
    1. Gera tokens com log-probs
    2. Quando probabilidade cai abaixo de threshold, pausa
    3. Usa texto gerado como nova query de retrieval
    4. Injeta docs recuperados e continua
    """
    PROB_THRESHOLD = 0.1  # pausa quando P(token) < 10%
    context_docs = retriever.get_relevant_documents(query)
    context = format_docs(context_docs)

    messages = [
        {"role": "system", "content": f"Contexto:\\n{context}"},
        {"role": "user",   "content": query},
    ]

    full_response = ""
    while len(enc.encode(full_response)) < max_tokens:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages + [{"role": "assistant", "content": full_response}],
            max_tokens=50,
            logprobs=True,
            top_logprobs=1,
        )

        choice = response.choices[0]
        new_text = choice.message.content or ""

        # Verificar se algum token tem prob baixa
        uncertain = any(
            lp.logprob < -2.3  # ln(0.1) ≈ -2.3
            for lp in (choice.logprobs.content or [])
        )

        if uncertain and full_response:
            # Pausa: usar texto gerado até agora como nova query
            new_query = f"{query} | contexto gerado: {full_response[-200:]}"
            new_docs = retriever.get_relevant_documents(new_query)
            context = format_docs(new_docs)
            messages[0]["content"] = f"Contexto atualizado:\\n{context}"
        else:
            full_response += new_text
            if choice.finish_reason == "stop":
                break

    return full_response`}</CodeBlock>
        <DecisionBox
          scenario="Escolher estratégia de Advanced RAG para implementar primeiro"
          winner="Query rewriting / Multi-query"
          winnerColor={ACCENT}
          why="Maior ganho de recall com menor complexidade de implementação. Não exige mudanças no index ou pipeline de geração. 2–4 queries paralelas com deduplicação cobre a maioria dos casos de recall baixo."
          alternatives={[
            { name: 'HyDE', note: 'Excelente para corpora técnicos especializados com queries vagas' },
            { name: 'RAG Fusion', note: 'Melhor recall em bases grandes — custo de 4–5× mais embeddings' },
            { name: 'FLARE', note: 'Para perguntas multi-hop complexas — custo alto, implementação complexa' },
          ]}
        />
      </Section>

      <Section title="Comparação e quando aplicar cada técnica" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Técnica', 'Problema que resolve', 'Custo adicional', 'Complexidade de impl.']}
          rows={[
            ['HyDE', 'Mismatch semântico query/doc', '1 LLM call por query', 'Baixa'],
            ['Query rewriting', 'Recall baixo por formulação única', 'N LLM calls + N embeddings', 'Baixa'],
            ['Step-back prompting', 'Query sem contexto de base implícito', '1 LLM call + 1 retrieval extra', 'Baixa'],
            ['RAG Fusion (RRF)', 'Combinar múltiplas fontes de evidência', 'N retrievals + RRF compute', 'Média'],
            ['FLARE', 'Perguntas multi-hop com fatos sequenciais', 'Múltiplos retrievals por geração', 'Alta'],
            ['Self-RAG', 'Qualidade e relevância das citações', 'Fine-tuning do modelo', 'Muito alta'],
          ]}
        />
        <QAItem
          q="Vale a pena implementar todas essas técnicas ao mesmo tempo?"
          a={<>Não. Implemente uma de cada vez, meça o impacto no seu eval harness, e adicione a próxima só se o baseline ainda estiver aquém. A ordem sugerida por retorno/custo: (1) query rewriting simples, (2) reranking com cross-encoder, (3) HyDE para queries vagas, (4) RAG fusion se o recall ainda for baixo. FLARE e self-RAG são raramente necessários fora de casos muito específicos.</>}
        />
        <QAItem
          q="Como montar um eval harness para RAG?"
          a={<>Use RAGAS (framework open source): gera automaticamente perguntas de um corpus, anota ground truth e avalia recall@K, faithfulness (LLM usou o doc?), answer relevance, context precision. Mantenha um set de 50–200 exemplos representativos do seu caso de uso. Rode o harness a cada mudança no pipeline — é a única forma de saber se uma técnica realmente ajudou.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Advanced RAG é um conjunto de cirurgias, não um framework monolítico.
        Meça primeiro com RAGAS onde você está falhando. Query rewriting + multi-query é o melhor primeiro passo
        (maior ganho, menor custo). HyDE resolve mismatch semântico em corpora técnicos. RAG Fusion com RRF é
        excelente para combinar evidências de múltiplas perspectivas. FLARE para perguntas multi-hop. Step-back
        para queries que pressupõem contexto não explicitado. Nunca implemente sem medir o impacto.
      </Callout>
    </div>
  );
}
