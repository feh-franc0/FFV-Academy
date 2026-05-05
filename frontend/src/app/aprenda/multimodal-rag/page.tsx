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

export const metadata = getModuleMetadata('multimodal-rag');

const ACCENT = '#a78bfa';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a principal diferença entre early fusion e late fusion em RAG multimodal?',
    options: [
      'Early fusion é mais rápido; late fusion é mais preciso — sempre prefira late fusion',
      'Early fusion combina representações de diferentes modalidades antes da busca (embedding unificado); late fusion busca separadamente por modalidade e combina os resultados — late fusion permite otimizar cada modalidade independentemente',
      'Early fusion exige modelos multimodais proprietários; late fusion funciona com modelos open source',
      'Late fusion é uma técnica de compressão; early fusion é uma técnica de expansão de contexto',
    ],
    correct: 1,
    explanation:
      'Em early fusion, você cria um embedding unificado que representa texto + imagem juntos (ex: CLIP projeta ambos no mesmo espaço). Em late fusion, mantém índices separados por modalidade, busca cada um independentemente e combina os rankings (ex: RRF). Late fusion é mais flexível — permite usar o melhor modelo de embedding para cada modalidade e ajustar a ponderação por tipo de conteúdo.',
  },
  {
    question: 'O que é o modelo CLIP e como ele habilita busca imagem-texto?',
    options: [
      'CLIP é um modelo de geração de imagens da OpenAI, similar ao DALL-E',
      'CLIP treina encoder de imagem e encoder de texto em pares (imagem, legenda) via contrastive learning — os embeddings resultantes ficam no mesmo espaço vetorial, permitindo buscar imagens com texto e vice-versa',
      'CLIP é um formato de arquivo para armazenar imagens com metadados de texto',
      'CLIP é uma técnica de quantização específica para modelos de visão',
    ],
    correct: 1,
    explanation:
      'CLIP (Contrastive Language-Image Pre-training, Radford et al. 2021) treina dois encoders em paralelo — um para imagem (ViT), um para texto (Transformer) — maximizando similaridade de pares corretos (imagem, legenda) e minimizando para pares errados. O espaço compartilhado permite: (1) query de texto → buscar imagens similares; (2) query de imagem → buscar texto similar; (3) zero-shot classification.',
  },
  {
    question: 'Como tratar tabelas e gráficos em PDFs para indexação multimodal?',
    options: [
      'Ignorar — tabelas e gráficos raramente contêm informação útil para recuperação',
      'Extrair tabelas como Markdown/HTML para busca textual E renderizar como imagem para busca visual — usar VLM para gerar caption descritiva da imagem, indexar caption no índice de texto como proxy multimodal',
      'Converter todo o PDF para sequência de imagens JPEG e usar apenas busca visual',
      'Usar apenas OCR tradicional — é suficiente para qualquer tipo de conteúdo em PDF',
    ],
    correct: 1,
    explanation:
      'A melhor prática é o tratamento híbrido: tabelas → extrair como Markdown estruturado (pdfplumber, camelot) para busca textual exata. Gráficos/charts → renderizar como imagem e usar VLM (Claude, GPT-4V) para gerar descrição textual densa: "Gráfico de barras mostrando crescimento de 23% no Q3...". Indexar a descrição no índice de texto. Assim você tem buscabilidade de texto E semântica visual sem precisar de GPU de inferência para cada query.',
  },
  {
    question: 'Qual o papel do ImageBind da Meta no contexto de RAG multimodal?',
    options: [
      'ImageBind é um banco de dados vetorial especializado em imagens',
      'Estende o conceito do CLIP para 6 modalidades (imagem, texto, áudio, profundidade, termal, IMU) em um único espaço de embedding — permite busca cross-modal: query de áudio → busca imagens, query de texto → busca vídeos com som correspondente',
      'ImageBind é uma técnica de compressão de imagens para reduzir custo de storage',
      'É uma arquitetura de atenção cruzada específica para combinar imagem e texto em geração',
    ],
    correct: 1,
    explanation:
      'ImageBind (Girdhar et al. 2023, Meta) usa imagens como "âncora" para alinhar 6 modalidades num único espaço de embedding. Qualquer modalidade pode fazer query em qualquer outra. Em RAG, isso abre casos como: usuário envia áudio descrevendo um produto → busca imagens de produtos similares; ou: query de texto → recupera tanto documentos escritos quanto vídeos com narração relevante.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="multimodal-rag"
      title="Multimodal RAG: imagem, áudio e texto no mesmo pipeline"
      icon="🖼️"
      xp={90}
      readTime={18}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="rag-fundamentos"
      nextTitle="RAG Fundamentos: retrieval-augmented generation do zero"
      relatedSlugs={['rag-fundamentos', 'chunking-embeddings', 'vision-models-claude-gpt']}
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
        Documentos reais raramente são só texto. Manuais técnicos têm diagramas. Relatórios financeiros têm tabelas
        e gráficos. Bases de conhecimento de suporte têm screenshots. RAG multimodal estende o pipeline clássico
        para indexar, buscar e raciocinar sobre múltiplas modalidades — sem descartar a riqueza visual que o
        RAG tradicional simplesmente ignora.
      </p>

      <Section title="Por que RAG textual é insuficiente" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo de conteúdo', 'RAG textual', 'RAG multimodal']}
          rows={[
            ['Diagrama de arquitetura', 'Ignorado ou perde estrutura via OCR', 'Embeda como imagem + caption VLM'],
            ['Tabela em PDF', 'OCR pode desordenar colunas', 'Extrai como Markdown estruturado'],
            ['Gráfico de tendência', 'Não capturado', 'VLM gera descrição densa indexável'],
            ['Screenshot de UI', 'Texto de botões apenas', 'Imagem embebida com contexto visual completo'],
            ['Vídeo tutoriais', 'Transcrição sem contexto visual', 'Frames-chave + transcrição sincronizada'],
          ]}
        />
        <Callout tone="info">
          Em corpora empresariais, 40–60% da informação relevante está em elementos visuais (tabelas, gráficos,
          diagramas). RAG textual puro perde metade do conhecimento disponível. O custo de multimodal caiu
          drasticamente — APIs de VLM por imagem custam frações de centavo.
        </Callout>
      </Section>

      <Section title="Modelos de embedding multimodal: CLIP e ImageBind" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          O pré-requisito técnico para RAG multimodal é um espaço de embedding compartilhado entre modalidades.
          CLIP (OpenAI, 2021) foi o modelo seminal; desde então, vários sucessores expandiram o suporte.
        </p>
        <LayerStack
          title="Evolução dos modelos de embedding multimodal"
          accent={ACCENT}
          separatorLabel="expansão de modalidades"
          layers={[
            { label: 'CLIP (2021)', content: 'Imagem + Texto via contrastive learning em 400M pares', note: 'baseline de mercado', tone: 'default' },
            { label: 'ALIGN (2021)', content: 'Escala para 1.8B pares imagem-texto — mais robusto', tone: 'default' },
            { label: 'ImageBind (2023)', content: '6 modalidades: imagem, texto, áudio, profundidade, termal, IMU', note: 'espaço unificado cross-modal', tone: 'writable' },
            { label: 'OpenCLIP / SigLIP', content: 'Versões open source com treinamento melhorado', note: 'produção em 2026', tone: 'writable' },
            { label: 'Gecko / Nomic Embed', content: 'Embeddings multimodais para texto+imagem em produção', tone: 'success' },
          ]}
        />
        <CodeBlock lang="python">{`# CLIP com HuggingFace Transformers
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch
import numpy as np

model = CLIPModel.from_pretrained("openai/clip-vit-large-patch14")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-large-patch14")

def embed_image(image_path: str) -> np.ndarray:
    image = Image.open(image_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        features = model.get_image_features(**inputs)
    return features.squeeze().numpy()

def embed_text(text: str) -> np.ndarray:
    inputs = processor(text=[text], return_tensors="pt", padding=True)
    with torch.no_grad():
        features = model.get_text_features(**inputs)
    return features.squeeze().numpy()

# Comparar similaridade texto-imagem
img_vec = embed_image("diagrama_arquitetura.png")
txt_vec = embed_text("diagrama de microserviços com API Gateway")
similarity = np.dot(img_vec, txt_vec) / (np.linalg.norm(img_vec) * np.linalg.norm(txt_vec))
print(f"Similaridade CLIP: {similarity:.3f}")  # > 0.25 indica relevância`}</CodeBlock>

        <CodeBlock lang="python">{`# SigLIP — melhor qualidade que CLIP, especialmente para zero-shot
from transformers import AutoProcessor, AutoModel
import torch

model = AutoModel.from_pretrained("google/siglip-so400m-patch14-384")
processor = AutoProcessor.from_pretrained("google/siglip-so400m-patch14-384")

# SigLIP usa sigmoid loss em vez de softmax — melhor para N imagens pequeno
def siglip_classify(image_path: str, candidate_labels: list[str]) -> dict:
    image = Image.open(image_path)
    inputs = processor(
        text=candidate_labels,
        images=image,
        return_tensors="pt",
        padding="max_length",
    )
    with torch.no_grad():
        logits = model(**inputs).logits_per_image[0]
    probs = torch.sigmoid(logits)
    return {label: prob.item() for label, prob in zip(candidate_labels, probs)}`}</CodeBlock>
      </Section>

      <Section title="Pipeline de indexação multimodal para PDFs" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          O caso mais comum em empresas: PDFs com mistura de texto, tabelas e figuras. A estratégia é extrair
          cada elemento com a ferramenta mais adequada e criar representações buscáveis para cada tipo.
        </p>
        <CodeBlock lang="python">{`import fitz  # PyMuPDF
import base64
from anthropic import Anthropic
import pdfplumber

client = Anthropic()

def process_pdf_multimodal(pdf_path: str) -> list[dict]:
    """
    Extrai texto, tabelas e imagens de PDF, gerando chunks multimodais.
    """
    chunks = []

    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            # 1. Extrair texto corrido
            text = page.extract_text()
            if text and len(text.strip()) > 50:
                chunks.append({
                    "type": "text",
                    "content": text,
                    "page": page_num + 1,
                    "source": pdf_path,
                })

            # 2. Extrair tabelas como Markdown
            tables = page.extract_tables()
            for i, table in enumerate(tables):
                if not table:
                    continue
                header = " | ".join(str(c) for c in table[0])
                separator = " | ".join(["---"] * len(table[0]))
                rows = "\\n".join(" | ".join(str(c) for c in row) for row in table[1:])
                md_table = f"| {header} |\\n| {separator} |\\n{rows}"
                chunks.append({
                    "type": "table",
                    "content": md_table,
                    "page": page_num + 1,
                })

    # 3. Extrair imagens e gerar captions com VLM
    doc = fitz.open(pdf_path)
    for page_num in range(len(doc)):
        page = doc[page_num]
        image_list = page.get_images(full=True)

        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            img_b64 = base64.standard_b64encode(image_bytes).decode()

            # Gerar caption densa com Claude Vision
            caption = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=300,
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/png",
                                "data": img_b64,
                            },
                        },
                        {
                            "type": "text",
                            "text": """Descreva esta imagem de forma densa e técnica em 2-4 frases.
                            Inclua: tipo de visualização, elementos principais, valores numéricos visíveis,
                            padrões ou tendências. Foque em informação recuperável por busca textual.""",
                        },
                    ],
                }],
            ).content[0].text

            chunks.append({
                "type": "image",
                "content": caption,           # texto indexável
                "image_data": img_b64,        # para exibir na resposta
                "page": page_num + 1,
            })

    return chunks`}</CodeBlock>

        <Callout tone="warn">
          Captions geradas por VLM são o proxy textual das imagens. A qualidade da caption determina a
          buscabilidade — prompts vagos geram captions genéricas que não se diferenciam em busca. Invista
          em prompts de caption específicos para o seu domínio (diagramas de rede vs gráficos financeiros
          vs fotos de produto precisam de prompts diferentes).
        </Callout>
      </Section>

      <Section title="Early Fusion vs Late Fusion" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Característica', 'Early Fusion', 'Late Fusion']}
          rows={[
            ['Como funciona', 'Embedding unificado texto+imagem (CLIP, SigLIP)', 'Índices separados por modalidade, combina rankings'],
            ['Busca cross-modal', 'Nativa — um único index', 'Via RRF ou weighted merge dos resultados'],
            ['Flexibilidade', 'Limitado ao que o modelo multimodal suporta', 'Otimiza cada modalidade com melhor modelo'],
            ['Latência de busca', 'Uma query no index', 'N queries em N indexes'],
            ['Quando usar', 'Corpus naturalmente multimodal (produtos, news)', 'Documentos mistos com partes independentes'],
          ]}
        />
        <CodeBlock lang="python">{`# Late Fusion: busca em índices separados + RRF
from qdrant_client import QdrantClient
from qdrant_client.models import SearchRequest

qdrant = QdrantClient("localhost", port=6333)

def late_fusion_search(
    query_text: str,
    query_image_path: str | None,
    top_k: int = 10,
) -> list[dict]:
    # 1. Busca no índice de texto (embeddings de texto)
    text_vec = embed_text_openai(query_text)
    text_results = qdrant.search(
        collection_name="text_index",
        query_vector=text_vec,
        limit=top_k,
    )

    all_results = [text_results]

    # 2. Busca no índice visual (CLIP embeddings de imagens)
    if query_image_path:
        img_vec = embed_image_clip(query_image_path)
        image_results = qdrant.search(
            collection_name="image_index",
            query_vector=img_vec,
            limit=top_k,
        )
        all_results.append(image_results)

    # 3. Funder rankings com RRF
    from collections import defaultdict
    rrf_scores = defaultdict(float)
    for results in all_results:
        for rank, result in enumerate(results, start=1):
            rrf_scores[result.id] += 1.0 / (60 + rank)

    top_ids = sorted(rrf_scores, key=rrf_scores.get, reverse=True)[:top_k]
    return fetch_chunks_by_ids(top_ids)`}</CodeBlock>
      </Section>

      <Section title="Integração com VLMs na geração" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Recuperar chunks multimodais é metade do trabalho. A geração precisa de um VLM que aceite imagens
          no contexto e possa raciocinar sobre elas junto com o texto.
        </p>
        <CodeBlock lang="python">{`import anthropic

client = anthropic.Anthropic()

def multimodal_rag_generate(
    query: str,
    chunks: list[dict],  # chunks com type="text"|"image"|"table"
) -> str:
    # Construir contexto multimodal
    content = []

    for chunk in chunks[:8]:  # limite de contexto
        if chunk["type"] == "text":
            content.append({
                "type": "text",
                "text": f"[Texto da página {chunk['page']}]\\n{chunk['content']}",
            })
        elif chunk["type"] == "table":
            content.append({
                "type": "text",
                "text": f"[Tabela da página {chunk['page']}]\\n{chunk['content']}",
            })
        elif chunk["type"] == "image":
            # Incluir imagem real no contexto + caption como fallback
            content.append({
                "type": "text",
                "text": f"[Imagem da página {chunk['page']} — caption: {chunk['content']}]",
            })
            if chunk.get("image_data"):
                content.append({
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": chunk["image_data"],
                    },
                })

    content.append({
        "type": "text",
        "text": f"\\nPergunta: {query}\\nResponda baseado no contexto acima.",
    })

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": content}],
    )
    return response.content[0].text`}</CodeBlock>

        <DecisionBox
          scenario="Implementar RAG multimodal em corpus de documentação técnica com diagramas"
          winner="Late fusion com captions VLM + índice de texto"
          winnerColor={ACCENT}
          why="Captions geradas por VLM tornam imagens buscáveis via texto sem exigir GPU de embedding em produção. Late fusion permite otimizar a busca textual independentemente. Funciona com qualquer vector store existente."
          alternatives={[
            { name: 'Early fusion com CLIP', note: 'Melhor para corpus com imagens naturais — diagrams técnicos têm recall menor' },
            { name: 'Apenas OCR + texto', note: 'Simples mas perde ~40-60% da informação visual' },
            { name: 'ColPali (documento visual)', note: 'Estado da arte para PDFs visualmente ricos — modelo full-page, custo alto' },
          ]}
        />
        <QAItem
          q="O que é ColPali e quando vale o investimento?"
          a={<>ColPali (Faysse et al. 2024) trata cada página do PDF como imagem, usa um VLM para gerar patch-level embeddings (sem extração de texto), e busca diretamente por similaridade visual. É state-of-the-art em benchmarks de document retrieval — especialmente onde o layout visual importa (formulários, faturas, slides). O custo: um VLM por página no momento de indexação, e um VLM para cada busca. Para corpora acima de 100k páginas, calcule o custo antes de usar.</>}
        />
        <QAItem
          q="Como lidar com imagens que são infográficos complexos vs fotos simples?"
          a={<>Infográficos exigem prompts de caption mais elaborados que peçam extração de todos os dados numéricos, legendas e relações causais visíveis. Fotos de produto precisam de atributos (cor, formato, marca visível). Configure templates de prompt de caption por categoria de conteúdo — detectar a categoria automaticamente com um classificador leve (CLIP zero-shot funciona bem) e usar o template correspondente.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> RAG multimodal é necessário para qualquer corpus que não seja texto puro.
        Captions VLM + índice de texto é a abordagem de menor risco e maior adoção. CLIP/SigLIP para early
        fusion quando o corpus é naturalmente visual. Late fusion com RRF para combinar modalidades independentes.
        Para PDFs: extrair texto corrido + tabelas como Markdown + captions VLM para imagens. A geração precisa
        de um VLM (Claude, GPT-4V) para raciocinar sobre imagens no contexto.
      </Callout>
    </div>
  );
}
