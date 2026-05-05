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

export const metadata = getModuleMetadata('distilacao-modelos');

const ACCENT = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença fundamental entre hard labels e soft labels em knowledge distillation?',
    options: [
      'Hard labels são para classificação; soft labels são apenas para regressão',
      'Hard labels são a classe correta como one-hot. Soft labels são as probabilidades do teacher com toda a informação relacional entre classes — "gato é mais parecido com cachorro que com avião" — tornando o treinamento do aluno mais rico e eficiente',
      'Soft labels são mais fáceis de calcular que hard labels em redes neurais',
      'Hard labels vêm de anotações humanas; soft labels são gerados por aumentação de dados',
    ],
    correct: 1,
    explanation:
      'Hinton et al. (2015) mostraram que soft labels transmitem dark knowledge. Em vez de [0,0,1,0], o aluno aprende com [0.05, 0.10, 0.75, 0.10] — as probabilidades do teacher suavizadas com temperatura T>1. Isso revela que o teacher aprendeu que gato é mais parecido com cachorro. Alunos treinados com soft labels precisam de menos dados e convergem mais rápido.',
  },
  {
    question: 'O que é response distillation para LLMs e como difere de feature distillation?',
    options: [
      'São técnicas idênticas — diferem apenas no nome dado por diferentes pesquisadores',
      'Response distillation treina o aluno para imitar outputs finais do teacher (textos, logits) — funciona com APIs fechadas. Feature distillation imita representações internas do teacher (ativações) — requer acesso aos pesos mas transmite mais informação',
      'Response distillation é para modelos de linguagem; feature distillation é para visão computacional',
      'Feature distillation é sempre superior — response distillation só é usada com APIs fechadas',
    ],
    correct: 1,
    explanation:
      'Response distillation: aluno aprende a imitar P(y|x) do teacher — disponível mesmo com APIs proprietárias. Feature distillation: aluno imita ativações internas — requer pesos. A maioria dos LLMs modernos pequenos (Phi-4, TinyLlama, Orca) usa response distillation via dados sintéticos gerados por modelos maiores. DistilBERT usa feature distillation (imita ativações do BERT).',
  },
  {
    question: 'Como a temperatura T influencia a destilação?',
    options: [
      'A temperatura T não tem efeito na destilação — é usada apenas em inferência',
      'T > 1 suaviza a distribuição do teacher, tornando as soft labels mais informativas sobre relações entre classes. T muito alto torna tudo igualmente provável. Na prática, T=4 a T=10 funciona bem para classificação',
      'T controla a taxa de aprendizado do modelo aluno durante o treinamento',
      'A temperatura T deve sempre ser 1 para garantir estabilidade numérica no treinamento',
    ],
    correct: 1,
    explanation:
      'Com T=1, a distribuição do softmax é dominada pela classe correta — pouco dark knowledge. Com T=4, a distribuição fica mais suave — probabilidades de classes relacionadas ficam visíveis. Isso é o dark knowledge que Hinton identificou. T muito alto (>20) suaviza demais e perde toda a informação útil. Hinton recomendou T=20 em NLP inicial, mas T=4-8 é mais comum na prática moderna.',
  },
  {
    question: 'Quando escolher destilação em vez de quantização para comprimir um LLM?',
    options: [
      'Sempre prefira destilação — é sempre superior à quantização em qualidade final',
      'Destilação quando você precisa de modelo muito menor (ex: 70B → 7B) e tem dados de treinamento. Quantização quando precisa comprimir o modelo existente sem re-treino para caber em hardware específico rapidamente',
      'Destilação é apenas para modelos de classificação, não para geração de texto em LLMs',
      'Escolha pela disponibilidade de GPU: destilação para cluster grande, quantização para GPU única',
    ],
    correct: 1,
    explanation:
      'Destilação cria modelo fundamentalmente diferente (menor arquitetura). Quantização mantém a mesma arquitetura com representação numérica mais baixa. Destilação: redução drástica (10×+), especialização para domínio, requer dados e compute. Quantização: resultado imediato sem treino, redução 2-4×, não requer dados.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="distilacao-modelos"
      title="Destilação de Modelos: comprimindo conhecimento de professor para aluno"
      icon="🔽"
      xp={80}
      readTime={16}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="lora-qlora-peft"
      nextTitle="LoRA, QLoRA e PEFT: fine-tuning eficiente"
      relatedSlugs={['lora-qlora-peft', 'quantizacao-llm', 'sft-supervised-fine-tuning']}
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
        Destilação de modelos — knowledge distillation — é a técnica de treinar um modelo pequeno (aluno)
        para imitar um modelo grande (professor). O aluno aprende não apenas as respostas corretas, mas
        a distribuição de probabilidades do professor, transferindo o "dark knowledge" sobre a estrutura
        do problema. É como contratar um expert para treinar um júnior intensivamente.
      </p>

      <Section title="O conceito de dark knowledge" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Hinton et al. (2015) observaram que modelos grandes aprendem relações implícitas entre classes
          que não aparecem nos labels. Essa informação relacional — o "dark knowledge" — é transmitida
          ao aluno via soft labels, tornando o treinamento muito mais eficiente.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'Hard labels (treinamento normal)', 'Soft labels (destilação)']}
          rows={[
            ['Sinal de treino', 'One-hot: [0, 0, 1, 0, 0]', 'Probabilidades do teacher: [0.02, 0.05, 0.85, 0.06, 0.02]'],
            ['Informação relacional', 'Nenhuma', '"gato mais parecido com cachorro que com avião"'],
            ['Dados necessários', 'Muitos exemplos rotulados', 'Menos exemplos — teacher guia o gradiente'],
            ['Resultado típico', 'Baseline de mesmo tamanho', 'Aluno supera aluno treinado do zero'],
          ]}
        />
        <Callout tone="info">
          DistilBERT (Sanh et al. 2019): 40% menor que BERT, 60% mais rápido, 97% da performance em
          benchmarks. Treinado com combinação de soft labels (saída do BERT), cosine embedding loss
          (imitar representações internas) e MLM loss normal.
        </Callout>
      </Section>

      <Section title="Tipos de destilação" accent={ACCENT}>
        <LayerStack
          title="Taxonomia de knowledge distillation"
          accent={ACCENT}
          separatorLabel="crescente complexidade"
          layers={[
            { label: 'Response Distillation', content: 'Aluno imita outputs finais (logits/tokens) do teacher', note: 'funciona com APIs fechadas', tone: 'default' },
            { label: 'Feature Distillation', content: 'Aluno imita ativações de camadas intermediárias do teacher', note: 'requer acesso aos pesos', tone: 'writable' },
            { label: 'Relation Distillation', content: 'Aluno imita relações entre exemplos (matrizes de similaridade)', tone: 'writable' },
            { label: 'Synthetic Data via Teacher', content: 'Teacher gera dados sintéticos para treinar aluno — padrão moderno LLMs', note: 'ex: Phi-4, TinyLlama, Orca', tone: 'success' },
          ]}
        />
        <CodeBlock lang="python">{`import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import AutoModelForSequenceClassification, Trainer, TrainingArguments

class DistillationTrainer(Trainer):
    def __init__(self, *args, teacher_model=None, temperature=4.0, alpha=0.5, **kwargs):
        super().__init__(*args, **kwargs)
        self.teacher = teacher_model
        self.T = temperature     # temperatura para suavizar distribuições
        self.alpha = alpha       # peso do distillation loss vs task loss

    def compute_loss(self, model, inputs, return_outputs=False):
        # Forward do aluno
        outputs_student = model(**inputs)
        student_logits = outputs_student.logits

        # Forward do professor (sem gradiente)
        with torch.no_grad():
            outputs_teacher = self.teacher(**inputs)
            teacher_logits = outputs_teacher.logits

        # Task loss (hard labels)
        task_loss = outputs_student.loss

        # Distillation loss (soft labels) — KL divergence com temperatura T
        soft_student = F.log_softmax(student_logits / self.T, dim=-1)
        soft_teacher = F.softmax(teacher_logits / self.T, dim=-1)
        distillation_loss = F.kl_div(
            soft_student, soft_teacher, reduction="batchmean"
        ) * (self.T ** 2)  # reescalar pelo T² para compensar efeito nos gradientes

        # Combinar
        loss = self.alpha * distillation_loss + (1 - self.alpha) * task_loss
        return (loss, outputs_student) if return_outputs else loss

# Teacher: BERT, Student: DistilBERT
teacher = AutoModelForSequenceClassification.from_pretrained("bert-base-uncased")
teacher.eval()
student = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased")

trainer = DistillationTrainer(
    model=student,
    teacher_model=teacher,
    temperature=4.0,
    alpha=0.7,
    args=TrainingArguments(
        output_dir="./distilled",
        num_train_epochs=3,
        per_device_train_batch_size=32,
        fp16=True,
    ),
    train_dataset=train_dataset,
)`}</CodeBlock>
      </Section>

      <Section title="Destilação moderna: dados sintéticos para LLMs" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          O paradigma mais poderoso em 2026: Phi-4, Orca e TinyLlama foram treinados com dados sintéticos
          gerados por modelos maiores — response distillation na escala de bilhões de tokens.
        </p>
        <CodeBlock lang="python">{`from anthropic import Anthropic
import json

client = Anthropic()

def generate_synthetic_training_data(
    topics: list[str],
    n_per_topic: int = 50,
) -> list[dict]:
    """Gera dados de treinamento sintéticos usando teacher LLM (Phi-4, Orca pattern)."""
    dataset = []

    for topic in topics:
        # Teacher gera perguntas diversificadas
        questions_resp = client.messages.create(
            model="claude-sonnet-4-6",  # teacher
            max_tokens=2048,
            messages=[{"role": "user", "content": f"""Gere {n_per_topic} perguntas técnicas
            diversificadas sobre '{topic}'. Inclua: conceituais, práticas, debugging, design.
            JSON: {{"questions": [...]}}"""}]
        )
        questions = json.loads(questions_resp.content[0].text)["questions"]

        # Teacher gera respostas de alta qualidade
        for question in questions:
            answer_resp = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=2048,
                system="Você é engenheiro sênior. Responda com precisão, trade-offs e exemplos.",
                messages=[{"role": "user", "content": question}]
            )
            dataset.append({
                "instruction": question,
                "response": answer_resp.content[0].text,
                "topic": topic,
            })

    return dataset

# O aluno (modelo menor) aprende a imitar as respostas do teacher via SFT
# Esse é o padrão do Phi-4, Orca, TinyLlama`}</CodeBlock>

        <Callout tone="warn">
          Muitos provedores (OpenAI, Anthropic) proíbem nos ToS usar outputs de seus modelos para treinar
          modelos competidores. Leia os termos antes de usar dados de APIs para treinar modelos distribuídos.
          Phi-4 e Orca seguiram acordos específicos com os provedores.
        </Callout>
      </Section>

      <Section title="Destilação vs Quantização vs Fine-tuning" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Técnica', 'O que faz', 'Quando usar', 'Custo aproximado']}
          rows={[
            ['Quantização (INT4/INT8)', 'Reduz precisão numérica dos pesos', 'Comprimir modelo existente sem re-treino', 'Horas (calibração)'],
            ['Destilação', 'Cria modelo menor via treinamento supervisionado', 'Redução drástica (10×+) ou especialização', 'Dias a semanas'],
            ['Fine-tuning (SFT)', 'Adapta modelo existente para domínio', 'Especialização com dados próprios', 'Horas a dias'],
            ['LoRA/QLoRA', 'Fine-tuning eficiente em parâmetros', 'Adaptar com poucos recursos de GPU', 'Horas (1-2 GPUs)'],
          ]}
        />
        <DecisionBox
          scenario="Classificador de suporte técnico que rode em <100ms em CPU sem GPU"
          winner="Destilação BERT → DistilBERT + fine-tuning no domínio"
          winnerColor={ACCENT}
          why="DistilBERT: 40% menor que BERT, <50ms em CPU, 97% da performance. Fine-tune pós-destilação no seu domínio específico. Alternativa à API GPT-4o com latência >1s e custo por chamada."
          alternatives={[
            { name: 'Quantização do modelo existente', note: 'Mais rápido de implementar mas redução menor de latência em CPU' },
            { name: 'Modelo menor treinado do zero', note: 'Mais simples mas sem o dark knowledge do teacher' },
            { name: 'API + cache de resultados', note: 'Para queries repetitivas — sem treino necessário' },
          ]}
        />
        <QAItem
          q="Quanto menor pode ser o aluno sem degradação inaceitável?"
          a={<>Regras empíricas: (1) Classificação: aluno 5-10× menor mantém 95%+ da performance; (2) NLU tasks (NER, STS): 3-5× menor com ~97% performance (DistilBERT); (3) Geração de texto (LLMs): 10× menor começa a ter degradação notável. TinyLlama (1.1B) vs Llama2-13B: ~60% em benchmarks gerais. Phi-4 (14B) vs GPT-4: surpreendentemente próximo graças à qualidade dos dados sintéticos.</>}
        />
        <QAItem
          q="Como avaliar se a destilação foi bem-sucedida?"
          a={<>Métricas obrigatórias: (1) Task accuracy/F1 no hold-out set — alvo típico: ≥95% do teacher; (2) Latência p95 — razão principal para destilar; (3) Calibration (ECE) — o aluno tem confiança similar ao teacher?; (4) Out-of-distribution performance — o aluno generaliza ou memorizou? Compare sempre com baseline: aluno de mesmo tamanho treinado do zero sem destilação — a destilação deve ser melhor.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Destilação transfere dark knowledge via soft labels (probabilidades
        suavizadas com temperatura T). Response distillation funciona com APIs fechadas. Feature distillation
        exige acesso aos pesos mas transmite mais informação. O paradigma moderno para LLMs: dados sintéticos
        de alta qualidade gerados pelo teacher. DistilBERT é o exemplo canônico. Destilação para redução
        drástica de tamanho; quantização para compressão sem re-treino. Sempre valide no hold-out set.
      </Callout>
    </div>
  );
}
