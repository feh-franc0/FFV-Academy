import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ocr-pratico');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que Tesseract costuma ser ruim em documentos reais?',
    options: [
      'É lento',
      'Engine clássica baseada em LSTM treinada majoritariamente em texto limpo e alinhado. Degrada bruscamente com inclinação (skew &gt;5°), iluminação irregular, tabelas complexas, scripts não-latinos e PDFs com fontes não comuns. Sem detector de texto robusto embutido — precisa preprocessing manual (deskew, binarize, crop). Para documento do mundo real (foto de celular), PaddleOCR ou serviços gerenciados vencem fácil',
      'Só lê inglês',
      'Não roda em Linux',
    ],
    correct: 1,
    explanation: 'Tesseract 5 melhorou, mas continua sendo engine de OCR pura sem detection forte. Funciona em scans limpos de documentos bem estruturados. Para foto de nota fiscal amassada tirada no celular, PaddleOCR (detection DB + recognition CRNN) ou TrOCR (transformer end-to-end) entregam 15–30% mais acurácia. A escolha certa depende do input esperado — nunca adote Tesseract sem medir em dados reais.',
  },
  {
    question: 'Quando TrOCR (HuggingFace) é a escolha certa?',
    options: [
      'Sempre',
      'Quando há linhas já recortadas (crops de texto) e você precisa reconhecer o conteúdo. TrOCR é encoder-decoder (ViT + GPT-like) treinado em larga escala — ótimo em handwriting e impressos difíceis. NÃO tem detection: precisa de pipeline que primeiro detecte linhas (DBNet, CRAFT) e passe os crops. Combinar DBNet+TrOCR é receita forte pra handwriting',
      'Só pra inglês impresso',
      'Nunca em produção',
    ],
    correct: 1,
    explanation: 'TrOCR (Microsoft 2021–2023) brilha em <b>recognition</b>, não detection. Fluxo real: (1) detecta linhas com CRAFT/DBNet/PaddleOCR-det, (2) cropa cada linha, (3) TrOCR transforma cada crop em string. Para impressos padrão, PaddleOCR end-to-end basta. TrOCR vale o custo extra em manuscritos, fontes raras e caligrafia.',
  },
  {
    question: 'Quando preferir AWS Textract / Azure Document Intelligence sobre open-source?',
    options: [
      'Nunca',
      'Quando o problema é documento estruturado (formulário, fatura, contrato) e você precisa extrair CAMPOS — não só texto. Esses serviços entregam key-value pairs, tabelas reconstruídas e layout. Replicar isso com PaddleOCR + heurísticas custa meses de engenharia. Trade-off: custo por página (~$0.0015–0.05), vendor lock-in, PII sai da sua rede',
      'Só quando não tem GPU',
      'Sempre, qualidade é sempre melhor',
    ],
    correct: 1,
    explanation: 'Distinção crítica: OCR = texto bruto; Document AI = estrutura. Textract AnalyzeDocument, Azure Document Intelligence e Google Document AI entregam JSON com campos extraídos. Para 10 milhões de faturas/mês, talvez compense treinar sistema próprio. Para 10k/mês com layouts variados, serviço gerenciado é barato em TCO. Sempre faça POC medindo acurácia e custo em amostra real antes de decidir.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ocr-pratico"
      title="OCR na prática: Tesseract, PaddleOCR, TrOCR"
      icon="🔤"
      xp={50}
      readTime={12}
      trailName="Computer Vision Clássico"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Pipeline OCR: detection + recognition" accent={accent}>
        <p>
          Separe mentalmente dois problemas: <b>onde está o texto</b> (detection, responde com polígonos) e <b>o que o texto diz</b> (recognition, responde com string). Soluções end-to-end (PaddleOCR, Tesseract) escondem isso; soluções híbridas (DBNet + TrOCR) expõem e dão mais controle.
        </p>
      </Section>

      <Section title="PaddleOCR: default sensato em 2026" accent={accent}>
        <CodeBlock lang="python">{`from paddleocr import PaddleOCR

ocr = PaddleOCR(use_angle_cls=True, lang="pt")

result = ocr.ocr("nota-fiscal.jpg", cls=True)
for line in result[0]:
    box, (text, conf) = line
    print(f"[{conf:.2f}] {text}")`}</CodeBlock>
        <Callout tone="info" icon="💡">
          PaddleOCR é open-source (Apache-2.0), rápido em CPU, suporta 80+ idiomas, detection DBNet + recognition CRNN + classifier de ângulo. Para 80% dos casos (notas fiscais, placas, menus), é o ponto de partida correto.
        </Callout>
      </Section>

      <Section title="TrOCR para manuscritos" accent={accent}>
        <CodeBlock lang="python">{`from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
import torch

processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-handwritten")
model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-handwritten").to("cuda")

def recognize_line(crop_pil):
    pixel_values = processor(images=crop_pil, return_tensors="pt").pixel_values.to("cuda")
    ids = model.generate(pixel_values, max_length=128)
    return processor.batch_decode(ids, skip_special_tokens=True)[0]

line_crop = Image.open("manuscrito-linha.png")
print(recognize_line(line_crop))`}</CodeBlock>
      </Section>

      <Section title="AWS Textract: extração estruturada" accent={accent}>
        <CodeBlock lang="python">{`import boto3

textract = boto3.client("textract", region_name="us-east-1")

with open("fatura.pdf", "rb") as f:
    resp = textract.analyze_document(
        Document={"Bytes": f.read()},
        FeatureTypes=["FORMS", "TABLES"],
    )

# Extrair key-value pairs
blocks = resp["Blocks"]
kv = {b["Id"]: b for b in blocks}
for b in blocks:
    if b["BlockType"] == "KEY_VALUE_SET" and "KEY" in b.get("EntityTypes", []):
        # resolver relationships pra achar VALUE correspondente
        pass`}</CodeBlock>
      </Section>

      <Section title="Layout analysis e tabelas" accent={accent}>
        <p>
          Tabela é o pesadelo do OCR: linhas implícitas, células mescladas, headers em múltiplos níveis. Ferramentas especializadas: Textract (Tables feature), PaddleOCR Structure, Docling (IBM 2024), LayoutLMv3 para classificar tokens em header/row/cell.
        </p>
        <Callout tone="warn" icon="⚠️">
          Jamais confie 100% em OCR de documento fiscal/legal sem validação — sempre tenha confidence threshold + regra de negócio (ex.: CPF válido, soma de tabela fecha). OCR é probabilístico; contabilidade não é.
        </Callout>
      </Section>

      <Section title="Árvore de decisão 2026" accent={accent}>
        <Callout tone="success" icon="✅">
          Texto impresso limpo e volume baixo: PaddleOCR. Manuscrito ou fonte rara: DBNet + TrOCR. Documento estruturado com campos (KV, tabelas) em produção: Textract/Azure DI. Scale &gt;10M páginas/mês: vale investigar pipeline custom com PaddleOCR fine-tuned + LayoutLMv3.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
