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

export const metadata = getModuleMetadata('graphrag');

const ACCENT = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o problema fundamental que GraphRAG resolve que RAG clássico não consegue?',
    options: [
      'GraphRAG resolve apenas problemas de latência na busca vetorial',
      'RAG clássico falha em perguntas que exigem síntese de informações distribuídas por todo o corpus ("quais são os temas principais?", "como X se relaciona com Y ao longo do documento?") — GraphRAG indexa relações entre entidades, permitindo queries globais sobre o corpus inteiro',
      'GraphRAG é mais eficiente em memória que RAG clássico para todos os tipos de query',
      'RAG clássico não suporta documentos em português, GraphRAG suporta qualquer idioma',
    ],
    correct: 1,
    explanation:
      'RAG clássico é excelente para queries locais ("o que o documento X diz sobre Y?") mas falha em queries globais que requerem síntese de todo o corpus ("quais são as principais tendências?"). GraphRAG (Edge et al. 2024, Microsoft) constrói um grafo de entidades e relações a partir do corpus, cria community summaries hierárquicos, e responde queries globais usando esses summaries em vez de chunks isolados.',
  },
  {
    question: 'O que são "community summaries" no GraphRAG e qual sua função?',
    options: [
      'São resumos de discussões de usuários sobre o corpus',
      'São resumos hierárquicos gerados por LLM para grupos de entidades relacionadas (comunidades no grafo) — permitem responder queries globais consultando os summaries de alto nível sem precisar ler todos os documentos',
      'São comentários adicionados manualmente por curadores do corpus',
      'São metadados automáticos gerados pelo banco de dados vetorial',
    ],
    correct: 1,
    explanation:
      'Após construir o grafo de entidades, GraphRAG aplica detecção de comunidade (ex: Leiden algorithm) para agrupar entidades relacionadas. Para cada comunidade, um LLM gera um summary descrevendo os temas, entidades e relações do grupo. Esses summaries formam uma hierarquia: comunidades de alto nível (temas gerais) até baixo nível (entidades específicas). Queries globais consultam summaries de alto nível; queries locais usam o grafo diretamente.',
  },
  {
    question: 'Qual é a principal desvantagem do GraphRAG vs RAG clássico?',
    options: [
      'GraphRAG não suporta documentos longos — só funciona para textos curtos',
      'O custo de indexação é muito maior — requer múltiplas chamadas LLM para extrair entidades e relações de todos os documentos e gerar summaries, tornando a atualização incremental do corpus cara',
      'GraphRAG só funciona com Neo4j e não suporta outros bancos de dados',
      'A qualidade de respostas locais de GraphRAG é inferior ao RAG clássico em todos os cenários',
    ],
    correct: 1,
    explanation:
      'A indexação GraphRAG é custosa: para cada chunk, um LLM extrai entidades e relações (múltiplas chamadas), depois gera community summaries (mais chamadas LLM). Para um corpus de 1M tokens, isso pode custar dezenas a centenas de dólares em API calls. Atualização incremental quando novos documentos chegam é complexa. RAG clássico indexa com apenas embedding, sem LLM calls — muito mais barato para indexação frequente.',
  },
  {
    question: 'Quando usar GraphRAG vs RAG clássico?',
    options: [
      'Sempre use GraphRAG — é superior em todos os cenários',
      'Use GraphRAG quando o corpus é estático e as queries frequentemente pedem síntese global, análise de relacionamentos ou temas do corpus inteiro. Use RAG clássico para busca factual localizada, corpus que muda com frequência, e quando o orçamento de indexação é limitado',
      'Use RAG clássico apenas para documentos técnicos; GraphRAG para documentos narrativos',
      'A escolha é indiferente — ambos produzem resultados idênticos',
    ],
    correct: 1,
    explanation:
      'GraphRAG brilha em: corpora estáticos ou que mudam raramente, análise de temas e tendências, questões sobre relacionamentos entre entidades, pesquisa qualitativa. RAG clássico é melhor para: corpora dinâmicos (atualização frequente), queries factuais diretas ("qual o valor de X?"), baixo custo de indexação, latência de busca mínima. Na prática, muitos sistemas usam ambos — RAG híbrido.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="graphrag"
      title="GraphRAG: conhecimento em grafo + LLM"
      icon="🕸️"
      xp={85}
      readTime={17}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="rag-fundamentos"
      nextTitle="RAG Fundamentos: retrieval-augmented generation do zero"
      relatedSlugs={['rag-fundamentos', 'advanced-rag-tecnicas', 'vector-dbs-pgvector-pinecone']}
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
        RAG clássico trata documentos como chunks independentes. Mas o conhecimento real é uma rede de entidades
        e relações — "a empresa X adquiriu Y, que é subsidiária de Z, e compete com W". GraphRAG (Microsoft, 2024)
        indexa esse tecido relacional explicitamente, permitindo respostas que exigem síntese de todo o corpus,
        não apenas recuperação de um trecho específico.
      </p>

      <Section title="O problema que RAG clássico não resolve" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo de query', 'RAG clássico', 'GraphRAG']}
          rows={[
            ['"Qual o valor de X mencionado na seção 3?"', 'Excelente — busca direta', 'Funciona mas é excessivo'],
            ['"Quais são os principais temas deste relatório?"', 'Fraco — chunks não têm visão global', 'Excelente — community summaries'],
            ['"Como a empresa A se relaciona com B e C?"', 'Fraco — relações não são indexadas', 'Excelente — grafo de entidades'],
            ['"Quem são as pessoas mais influentes neste corpus?"', 'Impossível diretamente', 'Nativo — centralidade no grafo'],
            ['"Que contradições existem entre doc X e doc Y?"', 'Muito difícil', 'Possível via grafo de fatos'],
          ]}
        />
        <Callout tone="info">
          O paper original GraphRAG (Edge et al. 2024) demonstrou que queries sobre "temas globais" de um corpus
          melhoram 3–4× em comprehensiveness vs RAG padrão. Em contrapartida, queries factuais diretas têm
          performance similar ou pior — GraphRAG não substitui, complementa RAG clássico.
        </Callout>
      </Section>

      <Section title="Arquitetura GraphRAG: do texto ao grafo" accent={ACCENT}>
        <LayerStack
          title="Pipeline de indexação GraphRAG"
          accent={ACCENT}
          separatorLabel="indexação (custosa, feita uma vez)"
          layers={[
            { label: '1. Chunking', content: 'Documentos divididos em chunks de 300–600 tokens com overlap', tone: 'default' },
            { label: '2. Extração de entidades', content: 'LLM extrai entidades (pessoas, orgs, conceitos) e relações de cada chunk', note: 'N × LLM calls', tone: 'default' },
            { label: '3. Construção do grafo', content: 'Nós = entidades; arestas = relações com peso e descrição', tone: 'writable' },
            { label: '4. Detecção de comunidades', content: 'Leiden algorithm agrupa entidades fortemente conectadas', tone: 'writable' },
            { label: '5. Community summaries', content: 'LLM gera summary para cada comunidade em múltiplos níveis', note: 'M × LLM calls', tone: 'writable' },
            { label: '6. Embeddings', content: 'Entidades, relações e summaries são embebidos para busca', tone: 'success' },
          ]}
        />
        <CodeBlock lang="python">{`# Instalação GraphRAG (Microsoft)
pip install graphrag

# Inicializar projeto
graphrag init --root ./my-graphrag

# Estrutura criada:
# .env                    — GRAPHRAG_API_KEY
# settings.yaml           — configuração do pipeline
# prompts/               — prompts de extração customizáveis

# settings.yaml (fragmento)
# llm:
#   api_key: \${GRAPHRAG_API_KEY}
#   type: openai_chat
#   model: gpt-4o-mini      # para extração de entidades (muitas chamadas)
#   model_supports_json: true
# embeddings:
#   async_mode: threaded
#   llm:
#     api_key: \${GRAPHRAG_API_KEY}
#     type: openai_embedding
#     model: text-embedding-3-small

# Colocar documentos
mkdir -p ./my-graphrag/input
cp *.txt ./my-graphrag/input/

# Indexar (pode demorar horas e custar $$ em API)
graphrag index --root ./my-graphrag`}</CodeBlock>

        <CodeBlock lang="python">{`# Consulta após indexação
import asyncio
import graphrag.api as api

# Query local — usa chunks + grafo local
async def local_query(question: str):
    result = await api.local_search(
        config=settings,
        nodes=nodes,          # entidades do grafo
        entities=entities,
        community_reports=reports,
        text_units=text_units,
        relationships=relationships,
        covariates=covariates,
        community_level=2,
        response_type="Multiple Paragraphs",
        query=question,
    )
    return result.response

# Query global — usa community summaries (síntese de todo o corpus)
async def global_query(question: str):
    result = await api.global_search(
        config=settings,
        nodes=nodes,
        entities=entities,
        community_reports=reports,
        community_level=2,
        dynamic_community_selection=False,
        response_type="Multiple Paragraphs",
        query=question,
    )
    return result.response

asyncio.run(global_query("Quais são os temas e padrões principais deste corpus?"))`}</CodeBlock>
      </Section>

      <Section title="Construindo GraphRAG customizado com NetworkX" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Para maior controle, você pode construir o grafo manualmente com extração via LLM e NetworkX para
          análise de grafo — sem depender do pipeline Microsoft.
        </p>
        <CodeBlock lang="python">{`import networkx as nx
from anthropic import Anthropic
import json

client = Anthropic()

def extract_entities_and_relations(text: str) -> dict:
    """Extrai entidades e relações de um chunk de texto."""
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""Extraia do texto abaixo:
1. Entidades: pessoas, organizações, tecnologias, conceitos-chave
2. Relações entre pares de entidades

Retorne JSON com formato:
{{
  "entities": [
    {{"name": "PostgreSQL", "type": "tecnologia", "description": "banco de dados relacional"}}
  ],
  "relations": [
    {{"source": "PostgreSQL", "target": "MVCC", "type": "implementa", "description": "PostgreSQL implementa MVCC para controle de concorrência"}}
  ]
}}

Texto: {text}"""
        }]
    )
    return json.loads(response.content[0].text)

def build_knowledge_graph(chunks: list[str]) -> nx.DiGraph:
    G = nx.DiGraph()

    for chunk in chunks:
        data = extract_entities_and_relations(chunk)

        for entity in data["entities"]:
            if not G.has_node(entity["name"]):
                G.add_node(
                    entity["name"],
                    type=entity["type"],
                    description=entity.get("description", ""),
                    mentions=1,
                )
            else:
                G.nodes[entity["name"]]["mentions"] += 1

        for rel in data["relations"]:
            if G.has_node(rel["source"]) and G.has_node(rel["target"]):
                G.add_edge(
                    rel["source"],
                    rel["target"],
                    type=rel["type"],
                    description=rel.get("description", ""),
                )

    return G

def get_entity_context(G: nx.DiGraph, entity: str, depth: int = 2) -> str:
    """Retorna contexto do grafo em torno de uma entidade."""
    if entity not in G:
        return ""
    # Subgrafo de N-hop ao redor da entidade
    neighbors = nx.ego_graph(G, entity, radius=depth)
    context_parts = [f"Entidade: {entity}"]
    context_parts.append(f"Descrição: {G.nodes[entity].get('description', '')}\\n")
    context_parts.append("Relações diretas:")
    for src, tgt, data in neighbors.edges(data=True):
        context_parts.append(f"  {src} --[{data['type']}]--> {tgt}: {data.get('description', '')}")
    return "\\n".join(context_parts)`}</CodeBlock>

        <Callout tone="info">
          Para produção, considere Neo4j ou Amazon Neptune em vez de NetworkX. NetworkX é excelente para
          prototipagem e corpora pequenos (≤100k nós), mas não escala para grafos de milhões de entidades.
          Neo4j tem suporte nativo a vetores desde a versão 5.x — ideal para hybrid graph+vector search.
        </Callout>
      </Section>

      <Section title="GraphRAG com Neo4j" accent={ACCENT}>
        <CodeBlock lang="python">{`from neo4j import GraphDatabase
from openai import OpenAI

neo4j_driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))
openai_client = OpenAI()

def add_entity_to_neo4j(session, entity: dict, embedding: list[float]):
    session.run("""
        MERGE (e:Entity {name: $name})
        SET e.type = $type,
            e.description = $description,
            e.embedding = $embedding
    """, name=entity["name"], type=entity["type"],
         description=entity["description"], embedding=embedding)

def add_relation_to_neo4j(session, relation: dict):
    session.run(f"""
        MATCH (s:Entity {{name: $source}})
        MATCH (t:Entity {{name: $target}})
        MERGE (s)-[r:{relation['type'].upper().replace(' ', '_')}]->(t)
        SET r.description = $description
    """, source=relation["source"], target=relation["target"],
         description=relation.get("description", ""))

def graph_vector_search(session, query: str, top_k: int = 5) -> list[dict]:
    """Busca híbrida: vetorial + grafo de relacionamentos."""
    query_embedding = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=query,
    ).data[0].embedding

    # Busca vetorial de entidades próximas
    results = session.run("""
        CALL db.index.vector.queryNodes('entity-embeddings', $k, $embedding)
        YIELD node, score
        // Expandir para vizinhos no grafo (1-hop)
        OPTIONAL MATCH (node)-[r]->(neighbor)
        RETURN node.name as entity,
               node.description as description,
               score,
               collect(DISTINCT {
                 type: type(r),
                 target: neighbor.name,
                 rel_desc: r.description
               }) as relations
        ORDER BY score DESC
    """, k=top_k, embedding=query_embedding)

    return [dict(row) for row in results]`}</CodeBlock>
      </Section>

      <Section title="Quando usar cada abordagem" accent={ACCENT}>
        <DecisionBox
          scenario="Corpus de documentos corporativos com análise de tendências e relações entre entidades"
          winner="GraphRAG (Microsoft pipeline ou customizado)"
          winnerColor={ACCENT}
          why="Corpus estático, queries sobre temas globais e relações entre entidades — o caso ideal do GraphRAG. Community summaries capturam padrões que RAG clássico não consegue."
          alternatives={[
            { name: 'RAG clássico + reranking', note: 'Para queries factuais locais — mais rápido e barato de indexar' },
            { name: 'GraphRAG + RAG clássico (híbrido)', note: 'Melhor cobertura: graph para globals, vetorial para locals' },
            { name: 'NetworkX + Neo4j custom', note: 'Maior controle do pipeline e do esquema de grafo' },
          ]}
        />
        <QAItem
          q="GraphRAG resolve alucinação melhor que RAG clássico?"
          a={<>Parcialmente. GraphRAG reduz alucinação sobre relações entre entidades — o grafo é construído de fatos extraídos dos documentos. Mas community summaries são gerados por LLM e podem introduzir sua própria alucinação durante a geração. A faithfulness (quão fiel ao corpus o modelo é) costuma ser similar; o que muda é a cobertura de perguntas sobre relacionamentos e temas globais.</>}
        />
        <QAItem
          q="Como estimar o custo de indexação GraphRAG antes de começar?"
          a={<>Custo proporcional a: (tokens do corpus × custo de extração/token) + (número de comunidades × custo de summary/community). Regra empírica: para cada 1M de tokens no corpus, espere 2–5M de tokens de LLM calls de extração (cada chunk é expandido com prompt). Use um modelo barato para extração (GPT-4o-mini, claude-haiku) e reserve modelos maiores apenas para queries. Estime antes com 1% do corpus.</>}
        />
        <QAItem
          q="Qual a diferença entre GraphRAG e Knowledge Graphs tradicionais?"
          a={<>KGs tradicionais (Wikidata, DBpedia) são construídos manualmente ou semi-automaticamente com ontologias rígidas e precisam de curadoria contínua. GraphRAG é construído automaticamente via LLM, sem schema rígido, diretamente dos documentos. KGs têm alta precisão em entidades bem definidas; GraphRAG tem alta cobertura para qualquer corpus sem curadoria manual. GraphRAG tem mais falsos positivos nas relações; KGs têm mais falsos negativos (entidades não cobertas).</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> GraphRAG resolve queries globais de síntese que RAG clássico não consegue
        tratar. O pipeline: extração de entidades via LLM → construção do grafo → detecção de comunidades →
        community summaries. Use Microsoft GraphRAG para produção rápida; NetworkX + Neo4j para controle total.
        O custo de indexação é alto — calcule antes. Para corpora que mudam frequentemente, RAG clássico costuma
        ser mais prático. O melhor sistema usa ambos: GraphRAG para queries globais, RAG vetorial para locais.
      </Callout>
    </div>
  );
}
