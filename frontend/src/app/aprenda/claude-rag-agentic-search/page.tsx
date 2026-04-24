import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#a78bfa';

export const metadata = getModuleMetadata('claude-rag-agentic-search');

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre RAG clássico e RAG agêntico?',
    options: [
      'RAG agêntico usa modelos maiores — não há diferença arquitetural',
      'RAG clássico faz uma busca única e injeta o resultado no prompt. RAG agêntico usa Claude como orquestrador: Claude decide quantas buscas fazer, refina a query baseado em resultados parciais, combina múltiplas fontes, e pode pedir esclarecimentos antes de buscar — é um loop de retrieval, não uma chamada única.',
      'RAG agêntico elimina embeddings — usa apenas BM25 para velocidade máxima',
      'RAG agêntico é apenas RAG com streaming — os chunks chegam ao Claude progressivamente',
    ],
    correct: 1,
    explanation: 'A distinção central é quem controla o loop de retrieval. No RAG clássico: query do usuário → embed → busca → top-k chunks → prompt com chunks → resposta. Um passo de retrieval, fixo. No RAG agêntico: Claude recebe a query como tool disponível. Claude decide buscar "cláusulas de rescisão" → vê resultado parcial → decide buscar "prazo de aviso prévio" → combina ambos → responde. Claude pode fazer 0 buscas (já sabe), 1 busca (pergunta simples) ou 5 buscas (pergunta complexa que requer múltiplas fontes). O número de calls é adaptativo, não fixo.',
  },
  {
    question: 'Você tem um RAG sobre contratos jurídicos. A busca por embedding retorna 3 chunks relevantes mas Claude diz que não tem informação suficiente. Qual é a causa mais provável e a solução?',
    options: [
      'O modelo de embedding está desatualizado — atualize para um modelo mais recente',
      'Os chunks contêm a informação mas a busca semântica por embedding não os recuperou porque a pergunta usa vocabulário diferente do contrato. Use busca híbrida: combine embedding (semântica) com BM25 (keyword match). Termos jurídicos específicos e números de cláusulas são recuperados melhor por keyword do que por semântica.',
      'O problema é o tamanho do chunk — reduza para 100 tokens e a busca vai melhorar',
      'Claude está alucinando — adicione na instrução do sistema para não inventar informações',
    ],
    correct: 1,
    explanation: 'Documentos jurídicos são um caso clássico onde embedding puro falha: a linguagem é formal e específica, referências a cláusulas ("art. 15, §2º") são exatas, e a pergunta do usuário ("quando posso sair do contrato?") usa vocabulário completamente diferente do documento ("rescisão unilateral com aviso prévio de 30 dias"). Busca híbrida — reciprocal rank fusion de embedding + BM25 — resolve isso: embedding captura semântica (sair = rescisão), BM25 captura termos exatos (art. 15, CNPJ, valor específico). O resultado combinado recupera muito mais que qualquer um dos dois sozinho.',
  },
  {
    question: 'Em um pipeline RAG agêntico, Claude faz 8 chamadas de retrieval para uma única pergunta do usuário. Isso é um problema ou comportamento esperado?',
    options: [
      'Sempre é problema — o limite correto é 3 chamadas por pergunta',
      'Depende da complexidade da pergunta e da qualidade dos resultados parciais. Para perguntas simples, 1-2 buscas é suficiente. Para perguntas que requerem múltiplas fontes ou quando resultados parciais abrem novas sub-perguntas, 5-10 buscas pode ser legítimo. O problema real é se as buscas são redundantes (mesma query, resultados iguais) — isso indica loop. Monitore diversidade de queries e resultados.',
      'Sempre é comportamento esperado — mais buscas sempre produzem respostas melhores',
      'É problema somente em produção — em desenvolvimento está correto',
    ],
    correct: 1,
    explanation: 'O número de chamadas de retrieval em RAG agêntico é naturalmente variável — e isso é um recurso, não um bug. Uma pergunta "o que é um LLM?" pode precisar de 0 buscas (Claude já sabe). Uma pergunta "compare as cláusulas de rescisão dos contratos de 2022 e 2023 e calcule a diferença de multa para o nosso volume de uso" pode precisar de 6+ buscas. O sinal de problema não é o número de buscas mas a qualidade: queries redundantes, ciclos (busca A → busca B → busca A novamente), ou resultado que não converge. Adicione um limite máximo (ex: 10 buscas) para segurança e monitore a diversidade das queries.',
  },
];

export default function ClaudeRagAgenticSearchPage() {
  return (
    <ModuleLayout
      slug="claude-rag-agentic-search"
      title="RAG Agêntico: busca híbrida, reranking e pipelines de retrieval"
      icon="🔍"
      xp={85}
      readTime={17}
      trailName="API Claude & Agents"
      trailColor="#a78bfa"
      nextSlug="claude-agents-workflows"
      nextTitle="Agents e Workflows: orquestração, handoffs e sistemas multi-agent"
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
        RAG agêntico é quando Claude controla o loop de retrieval — decidindo quando buscar, o que buscar, e como combinar múltiplos resultados. Em vez de uma busca única pré-determinada, Claude usa retrieval como uma ferramenta que invoca quantas vezes for necessário para responder bem. É a diferença entre um sistema que recupera informação e um que raciocina sobre como recuperá-la.
      </p>

      <Section accent={accent} title="De RAG clássico para agêntico">
        <ComparisonTable
          headers={['Aspecto', 'RAG Clássico', 'RAG Agêntico']}
          rows={[
            ['Controle do loop', 'Pipeline fixo (código)', 'Claude orquestra (adaptive)'],
            ['Número de buscas', '1 por pergunta', 'N buscas — Claude decide'],
            ['Query refinement', 'Query original do usuário', 'Claude reformula se necessário'],
            ['Fontes', '1 índice de vectores', 'Múltiplos índices/APIs'],
            ['Raciocínio sobre resultado', 'Nenhum — injeta chunks', 'Claude avalia relevância dos chunks'],
            ['Latência', 'Baixa e previsível', 'Variável — pode ser alto para perguntas complexas'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# RAG agêntico com Claude: retrieval como tool use

import anthropic, json
from typing import Callable

client = anthropic.Anthropic()

# Definição das tools de retrieval
retrieval_tools = [
    {
        "name": "buscar_documentos",
        "description": """Busca documentos relevantes no corpus usando busca híbrida.
                         Use quando precisar de informação específica não presente no contexto.
                         Reformule a query para maximizar relevância — queries específicas
                         retornam melhores resultados que queries genéricas.
                         Retorna top-5 chunks com score de relevância.""",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Query de busca otimizada para recuperar a informação necessária"
                },
                "filtros": {
                    "type": "object",
                    "description": "Filtros opcionais: {'tipo': 'contrato', 'ano': 2024}",
                    "additionalProperties": True
                }
            },
            "required": ["query"]
        }
    }
]`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Busca híbrida: BM25 + embedding">
        <CodeBlock>{`# Implementação de busca híbrida com Reciprocal Rank Fusion (RRF):

from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi
import numpy as np

class HybridRetriever:
    def __init__(self, documents: list[dict]):
        self.documents = documents
        self.texts = [d["content"] for d in documents]

        # BM25 para keyword matching
        tokenized = [text.lower().split() for text in self.texts]
        self.bm25 = BM25Okapi(tokenized)

        # Embedding para busca semântica
        self.model = SentenceTransformer("intfloat/multilingual-e5-base")
        self.embeddings = self.model.encode(self.texts, normalize_embeddings=True)

    def search(self, query: str, top_k: int = 5, alpha: float = 0.5) -> list[dict]:
        """
        Busca híbrida com RRF.
        alpha: peso do embedding vs BM25 (0.5 = igual, 1.0 = só embedding)
        """
        # BM25 scores
        bm25_scores = self.bm25.get_scores(query.lower().split())
        bm25_ranked = np.argsort(bm25_scores)[::-1]

        # Embedding scores
        query_emb = self.model.encode([query], normalize_embeddings=True)
        emb_scores = (query_emb @ self.embeddings.T)[0]
        emb_ranked = np.argsort(emb_scores)[::-1]

        # Reciprocal Rank Fusion
        k = 60  # constante RRF padrão
        rrf_scores = {}
        for rank, idx in enumerate(bm25_ranked):
            rrf_scores[idx] = rrf_scores.get(idx, 0) + (1 - alpha) / (k + rank + 1)
        for rank, idx in enumerate(emb_ranked):
            rrf_scores[idx] = rrf_scores.get(idx, 0) + alpha / (k + rank + 1)

        # Top-k resultados
        top_indices = sorted(rrf_scores, key=rrf_scores.get, reverse=True)[:top_k]
        return [
            {**self.documents[i], "relevance_score": rrf_scores[i]}
            for i in top_indices
        ]

# Por que RRF funciona:
# BM25: "art. 15" encontra documentos com exatamente "art. 15" (keyword exact)
# Embedding: "rescisão" encontra "encerramento do contrato" (semântica)
# RRF combina os rankings sem precisar normalizar scores em escala comum`}</CodeBlock>
      </Section>

      <Section accent={accent} title="O loop de retrieval agêntico">
        <CodeBlock>{`# Loop completo de RAG agêntico:

retriever = HybridRetriever(carregar_documentos())  # seu corpus

def executar_busca(query: str, filtros: dict = None) -> str:
    """Função que o loop chama quando Claude usa a tool."""
    resultados = retriever.search(query, top_k=5)
    if filtros:
        resultados = [r for r in resultados
                     if all(r.get(k) == v for k, v in filtros.items())]

    return json.dumps([{
        "id": r["id"],
        "titulo": r["titulo"],
        "conteudo": r["content"][:1000],  # limita por chunk
        "relevancia": round(r["relevance_score"], 3)
    } for r in resultados], ensure_ascii=False)

# Loop agêntico:
def rag_agentico(pergunta: str, max_buscas: int = 10) -> str:
    messages = [{"role": "user", "content": pergunta}]
    buscas_realizadas = 0

    while True:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=2048,
            tools=retrieval_tools,
            system="""Você é um assistente especializado em consultar documentos.
                     Use a ferramenta buscar_documentos quando precisar de informação.
                     Reformule queries se os resultados não forem suficientes.
                     Responda apenas baseado nos documentos recuperados.""",
            messages=messages
        )

        if response.stop_reason == "end_turn":
            return response.content[0].text

        if response.stop_reason == "tool_use" and buscas_realizadas < max_buscas:
            messages.append({"role": "assistant", "content": response.content})
            tool_results = []

            for block in response.content:
                if block.type == "tool_use":
                    buscas_realizadas += 1
                    resultado = executar_busca(
                        block.input["query"],
                        block.input.get("filtros")
                    )
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": resultado
                    })

            messages.append({"role": "user", "content": tool_results})

        else:
            # Limite de buscas atingido — Claude responde com o que tem
            messages.append({
                "role": "user",
                "content": "Limite de buscas atingido. Responda com as informações obtidas."
            })

# Uso:
resposta = rag_agentico(
    "Quais são as condições de rescisão nos contratos de 2023 "
    "e como elas diferem dos contratos de 2022?"
)
# Claude vai buscar: "rescisão contratos 2023" → "rescisão contratos 2022"
# → "diferenças cláusulas rescisão" e combinar os resultados`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Reranking para precisão máxima">
        <CodeBlock>{`# Cross-encoder reranking: segunda etapa após busca inicial
# Retrieve broad (top-20) → rerank precision (top-5)

from sentence_transformers import CrossEncoder

class RerankedRetriever(HybridRetriever):
    def __init__(self, documents: list[dict]):
        super().__init__(documents)
        # Cross-encoder: mais pesado mas muito mais preciso
        self.reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

    def search_with_reranking(self, query: str, top_k: int = 5) -> list[dict]:
        # Fase 1: retrieval amplo (candidatos)
        candidates = self.search(query, top_k=20)

        # Fase 2: reranking preciso
        pairs = [(query, doc["content"][:512]) for doc in candidates]
        rerank_scores = self.reranker.predict(pairs)

        # Ordena por score do cross-encoder
        reranked = sorted(
            zip(candidates, rerank_scores),
            key=lambda x: x[1],
            reverse=True
        )

        return [
            {**doc, "rerank_score": float(score)}
            for doc, score in reranked[:top_k]
        ]

# Por que o reranking importa:
# Bi-encoder (embedding): rápido, pode errar em nuance semântica
# Cross-encoder: lento, olha query E documento juntos — mais preciso
# Padrão: retrieve 20 com bi-encoder → rerank top-5 com cross-encoder`}</CodeBlock>
        <ComparisonTable
          headers={['Técnica', 'Velocidade', 'Precisão', 'Quando usar']}
          rows={[
            ['BM25 puro', 'Alta', 'Boa para keywords', 'Termos técnicos exatos, siglas'],
            ['Embedding puro', 'Alta', 'Boa semântica', 'Linguagem natural, sinônimos'],
            ['Híbrido (RRF)', 'Alta', 'Melhor dos dois', 'Maioria dos casos'],
            ['Híbrido + Reranker', 'Média', 'Máxima', 'Alta precisão necessária (jurídico, médico)'],
          ]}
          accent={accent}
        />
      </Section>

      <Callout tone="success">
        <strong>RAG agêntico com busca híbrida + reranking é o estado da arte para sistemas de Q&A sobre documentos.</strong> Cada componente resolve um problema específico: híbrido captura keywords e semântica, reranker refina a precisão, e o loop agêntico permite perguntas complexas que requerem múltiplas buscas. A combinação dos três resolve 90%+ dos casos de produção.
      </Callout>

      <Callout>
        Próximo: <strong>Agents e Workflows</strong> — padrões de orquestração multi-agent, handoffs, e como construir sistemas onde múltiplos agentes colaboram em tarefas complexas.
      </Callout>
    </div>
  );
}
