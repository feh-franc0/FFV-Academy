-- Seed inicial: 1 hub, 1 trilha, 3 módulos com blocks reais.
-- Rodar APÓS aplicar migrations 026-036.
-- Idempotente via ON CONFLICT.

BEGIN;

-- ─── 1 Hub ──────────────────────────────────────────────────────────────────

INSERT INTO hubs (id, name, short_name, description, icon, color, position)
VALUES (
    'ia',
    'Inteligência Artificial',
    'IA',
    'Aprenda IA do zero: LLMs, RAG, agents, fine-tuning, evals e deploy em produção.',
    '🤖',
    '#58A6FF',
    1
)
ON CONFLICT (id) DO UPDATE
    SET name        = EXCLUDED.name,
        short_name  = EXCLUDED.short_name,
        description = EXCLUDED.description,
        icon        = EXCLUDED.icon,
        color       = EXCLUDED.color,
        position    = EXCLUDED.position,
        updated_at  = now();

-- ─── 1 Trail ────────────────────────────────────────────────────────────────

INSERT INTO trails (id, hub_id, name, short_name, description, difficulty, est_hours, icon, position)
VALUES (
    'ia-fundamentos',
    'ia',
    'Fundamentos de IA',
    'Fundamentos',
    'Conceitos essenciais para entender como modelos de IA funcionam por dentro: LLMs, embeddings e RAG.',
    'beginner',
    6,
    '📘',
    1
)
ON CONFLICT (id) DO UPDATE
    SET name        = EXCLUDED.name,
        description = EXCLUDED.description,
        difficulty  = EXCLUDED.difficulty,
        est_hours   = EXCLUDED.est_hours,
        updated_at  = now();

-- ─── 3 Articles ─────────────────────────────────────────────────────────────

-- 1) o-que-e-ia
INSERT INTO curriculum_articles
    (slug, title, trail_id, hub_id, content_md, xp, read_time, difficulty, "order", published, status, published_at)
VALUES (
    'o-que-e-ia',
    'O que é Inteligência Artificial',
    'ia-fundamentos',
    'ia',
    '', -- content_md vazio: agora vem dos blocks
    15,
    8,
    'beginner',
    1,
    true,
    'published',
    now()
)
ON CONFLICT (slug) DO UPDATE
    SET title       = EXCLUDED.title,
        trail_id    = EXCLUDED.trail_id,
        hub_id      = EXCLUDED.hub_id,
        xp          = EXCLUDED.xp,
        read_time   = EXCLUDED.read_time,
        difficulty  = EXCLUDED.difficulty,
        "order"     = EXCLUDED."order",
        published   = EXCLUDED.published,
        status      = EXCLUDED.status,
        published_at = COALESCE(curriculum_articles.published_at, EXCLUDED.published_at),
        updated_at  = now();

-- 2) o-que-e-llm
INSERT INTO curriculum_articles
    (slug, title, trail_id, hub_id, content_md, xp, read_time, difficulty, "order", published, status, published_at)
VALUES (
    'o-que-e-llm',
    'O que é um LLM (Large Language Model)',
    'ia-fundamentos',
    'ia',
    '',
    20,
    12,
    'beginner',
    2,
    true,
    'published',
    now()
)
ON CONFLICT (slug) DO UPDATE
    SET title = EXCLUDED.title, xp = EXCLUDED.xp, read_time = EXCLUDED.read_time,
        status = EXCLUDED.status, updated_at = now();

-- 3) rag-fundamentos
INSERT INTO curriculum_articles
    (slug, title, trail_id, hub_id, content_md, xp, read_time, difficulty, "order", published, status, published_at)
VALUES (
    'rag-fundamentos',
    'RAG: Retrieval-Augmented Generation na prática',
    'ia-fundamentos',
    'ia',
    '',
    25,
    15,
    'intermediate',
    3,
    true,
    'published',
    now()
)
ON CONFLICT (slug) DO UPDATE
    SET title = EXCLUDED.title, xp = EXCLUDED.xp, read_time = EXCLUDED.read_time,
        status = EXCLUDED.status, updated_at = now();

-- ─── Blocks: o-que-e-ia ─────────────────────────────────────────────────────

DELETE FROM module_blocks WHERE article_slug = 'o-que-e-ia';

INSERT INTO module_blocks (article_slug, position, block_type, block_data) VALUES
('o-que-e-ia', 0, 'paragraph', '{"content":[
    {"text":"Inteligência Artificial é o campo da ciência da computação que estuda como fazer máquinas executarem tarefas que normalmente exigem inteligência humana — como "},
    {"text":"reconhecer imagens","bold":true},
    {"text":", "},
    {"text":"entender linguagem","bold":true},
    {"text":" ou "},
    {"text":"tomar decisões","bold":true},
    {"text":"."}
]}'::jsonb),

('o-que-e-ia', 1, 'callout', '{"variant":"info","title":"Para começar bem","content":"IA não é mágica. É matemática (estatística + álgebra linear) rodando em hardware muito rápido. Quando você entende o porquê, fica fácil saber quando usar e quando não usar."}'::jsonb),

('o-que-e-ia', 2, 'paragraph', '{"content":[
    {"text":"Hoje em 2026, quando falamos de IA, geralmente estamos falando de "},
    {"text":"redes neurais profundas","bold":true},
    {"text":" — modelos com bilhões de parâmetros treinados em quantidades massivas de dados."}
]}'::jsonb),

('o-que-e-ia', 3, 'comparison_table', '{
    "columns":["Tipo de IA","Exemplo","Aplicação típica"],
    "rows":[
        ["LLM","GPT-4, Claude, Gemini","Chatbots, geração de texto, código"],
        ["Visão computacional","CLIP, SAM","Reconhecimento de imagem, segmentação"],
        ["Recomendação","Sistemas Netflix/Spotify","Sugestão personalizada"],
        ["Speech","Whisper","Transcrição de áudio"]
    ]
}'::jsonb),

('o-que-e-ia', 4, 'callout', '{"variant":"warning","title":"Atenção ao hype","content":"Cuidado com promessas mágicas. IA bem aplicada resolve problemas específicos com métricas claras — não substitui pensamento crítico."}'::jsonb),

('o-que-e-ia', 5, 'code_block', '{
    "language":"python",
    "filename":"hello_ai.py",
    "code":"# Exemplo: chamar um LLM via API\nfrom anthropic import Anthropic\n\nclient = Anthropic()\nresponse = client.messages.create(\n    model=\"claude-opus-4-7\",\n    max_tokens=1024,\n    messages=[{\"role\":\"user\",\"content\":\"Explique IA em 1 parágrafo\"}]\n)\nprint(response.content[0].text)"
}'::jsonb);

-- ─── Blocks: o-que-e-llm ────────────────────────────────────────────────────

DELETE FROM module_blocks WHERE article_slug = 'o-que-e-llm';

INSERT INTO module_blocks (article_slug, position, block_type, block_data) VALUES
('o-que-e-llm', 0, 'paragraph', '{"content":[
    {"text":"Um "},
    {"text":"LLM","bold":true},
    {"text":" (Large Language Model) é uma rede neural treinada em quantidades massivas de texto para "},
    {"text":"prever a próxima palavra","italic":true},
    {"text":" dada uma sequência. Soa simples, mas é desse mecanismo que emerge tudo o que LLMs conseguem fazer."}
]}'::jsonb),

('o-que-e-llm', 1, 'callout', '{"variant":"success","title":"Insight chave","content":"Toda capacidade impressionante de um LLM (resumir, traduzir, programar, raciocinar) vem desse único objetivo de treinamento: prever a próxima palavra com a maior probabilidade. Compressão de conhecimento em probabilidades."}'::jsonb),

('o-que-e-llm', 2, 'comparison_table', '{
    "columns":["Modelo","Empresa","Parâmetros","Ano"],
    "rows":[
        ["GPT-3","OpenAI","175B","2020"],
        ["LLaMA 3","Meta","8B-70B","2024"],
        ["Claude Opus 4.7","Anthropic","~Trilhão (estimado)","2026"],
        ["Gemini 2 Pro","Google","Multimodal","2025"]
    ]
}'::jsonb),

('o-que-e-llm', 3, 'callout', '{"variant":"warning","title":"Tokens, não palavras","content":"LLMs não processam palavras — processam tokens. Tokens podem ser palavras inteiras, partes de palavras ou caracteres. \"Inteligência\" em português é tipicamente quebrado em 3-4 tokens."}'::jsonb),

('o-que-e-llm', 4, 'code_block', '{
    "language":"python",
    "filename":"tokens.py",
    "code":"# Tokenização: como o LLM \"vê\" seu texto\nimport tiktoken\n\nenc = tiktoken.encoding_for_model(\"gpt-4\")\ntokens = enc.encode(\"Inteligência Artificial\")\nprint(tokens)\n# [21789, 41098, 198, 24433, 8493]\n# 5 tokens para 2 palavras"
}'::jsonb),

('o-que-e-llm', 5, 'paragraph', '{"content":[
    {"text":"O custo de usar um LLM é geralmente cobrado "},
    {"text":"por token","bold":true},
    {"text":" (input + output). Entender tokenização é entender o custo real do que você está fazendo."}
]}'::jsonb);

-- ─── Blocks: rag-fundamentos ────────────────────────────────────────────────

DELETE FROM module_blocks WHERE article_slug = 'rag-fundamentos';

INSERT INTO module_blocks (article_slug, position, block_type, block_data) VALUES
('rag-fundamentos', 0, 'paragraph', '{"content":[
    {"text":"RAG (Retrieval-Augmented Generation) resolve o "},
    {"text":"problema fundamental do LLM","bold":true},
    {"text":": ele só sabe o que viu no treinamento, e o conhecimento estaciona na data de corte (cutoff)."}
]}'::jsonb),

('rag-fundamentos', 1, 'callout', '{"variant":"info","title":"Por que RAG existe","content":"Imagine perguntar ao LLM sobre algo que aconteceu ontem ou sobre dados internos da sua empresa. O modelo não tem como saber. RAG resolve isso buscando contexto relevante ANTES de responder."}'::jsonb),

('rag-fundamentos', 2, 'paragraph', '{"content":[
    {"text":"O fluxo é simples no conceito:"}
]}'::jsonb),

('rag-fundamentos', 3, 'comparison_table', '{
    "columns":["Etapa","O que acontece","Tecnologia típica"],
    "rows":[
        ["1. Embed query","Converte pergunta em vetor","OpenAI/Cohere embeddings"],
        ["2. Vector search","Busca docs similares","pgvector, Pinecone, Qdrant"],
        ["3. Build prompt","Insere docs no contexto","Template engine"],
        ["4. LLM call","Modelo responde com base no contexto","Claude/GPT/Gemini"]
    ]
}'::jsonb),

('rag-fundamentos', 4, 'callout', '{"variant":"warning","title":"Cuidado: chunks importam","content":"Como você quebra seus documentos em pedaços (chunks) afeta TUDO. Chunks muito grandes = ruído. Muito pequenos = perde contexto. Tamanho típico: 200-500 tokens com overlap de 50-100."}'::jsonb),

('rag-fundamentos', 5, 'code_block', '{
    "language":"python",
    "filename":"rag_minimal.py",
    "code":"# RAG mínimo com pgvector\nfrom openai import OpenAI\nfrom db import vector_search\n\nclient = OpenAI()\n\ndef rag_answer(question: str) -> str:\n    # 1. Embedding da pergunta\n    q_vec = client.embeddings.create(\n        model=\"text-embedding-3-small\",\n        input=question\n    ).data[0].embedding\n\n    # 2. Busca top-3 chunks similares\n    chunks = vector_search(q_vec, limit=3)\n    context = \"\\n\\n\".join(chunks)\n\n    # 3. Prompt com contexto\n    response = client.chat.completions.create(\n        model=\"gpt-4\",\n        messages=[\n            {\"role\":\"system\",\"content\":f\"Contexto:\\n{context}\"},\n            {\"role\":\"user\",\"content\":question}\n        ]\n    )\n    return response.choices[0].message.content"
}'::jsonb),

('rag-fundamentos', 6, 'callout', '{"variant":"success","title":"Quando RAG faz sentido","content":"Use RAG quando: (1) conhecimento muda frequentemente; (2) você tem documentos privados/internos; (3) precisa de citação/rastreabilidade da fonte. Evite quando: a tarefa não é factual (criatividade, código from scratch)."}'::jsonb);

COMMIT;

-- Validação rápida
SELECT 'hubs' AS table_name, count(*) FROM hubs
UNION ALL SELECT 'trails', count(*) FROM trails
UNION ALL SELECT 'curriculum_articles', count(*) FROM curriculum_articles WHERE slug IN ('o-que-e-ia','o-que-e-llm','rag-fundamentos')
UNION ALL SELECT 'module_blocks', count(*) FROM module_blocks WHERE article_slug IN ('o-que-e-ia','o-que-e-llm','rag-fundamentos');
