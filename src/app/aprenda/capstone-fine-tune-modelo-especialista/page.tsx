import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-fine-tune-modelo-especialista');

const accent = '#c084fc';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual domínio é BOA escolha pra capstone FT?',
    options: [
      'General assistant (copia ChatGPT)',
      'Domínio específico onde você tem data real e métricas objetivas — legal docs (contract extraction), medical (ICD code assignment), code review (bug classification), customer support em português jurídico',
      'Creative writing',
      'Random chat',
    ],
    correct: 1,
    explanation: 'FT brilha em domínio estrutura + métrica. General chat: já existem gpt-4/claude — FT vale pouco. Legal/medical/financial: domain jargon + formato específico + métrica clara (extraction F1, classification accuracy) = showcase real de FT value.',
  },
  {
    question: 'Quanto tempo realista pro capstone completo?',
    options: [
      '2 horas',
      '~40h spread em 2-3 semanas: 10h dataset curation + 10h FT experiments + 10h eval + 5h deploy + 5h docs. Skip dataset curation = FT ruim (veja capstone anterior)',
      '1000h',
      '5 min',
    ],
    correct: 1,
    explanation: 'FT portfolio bom: dataset curated (metade do esforço), experiments (LoRA ranks, epochs, LR), eval rigoroso (golden set + judge), deploy (vLLM container + demo). Portfolio-grade = 2-3 semanas focado. Menos tempo = overfit, eval vibes, deploy shaky.',
  },
  {
    question: 'O que entregar além do modelo treinado?',
    options: [
      'Só o peso',
      'Repositório com: dataset pipeline (reprodutível), training notebook, eval report (quantitative + examples), deployed demo (Hugging Face Space grátis), README técnico, model card (bias, limitations, intended use)',
      'Nada',
      'PDF',
    ],
    correct: 1,
    explanation: 'Portfolio engineer: entregáveis completos. Repo público GitHub. HF Space pra demo interativa (free hosting). Model card = documento standard (Mitchell et al., 2019): intended use, limitations, training data, metrics, bias considerations. Isso diferencia "alguém que mexeu com FT" de "engineer ML profissional".',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-fine-tune-modelo-especialista"
      title="Capstone: fine-tune de modelo especialista de domínio"
      icon="🏁"
      xp={95}
      readTime={20}
      trailName="Fine-tuning & Customização de LLMs"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Escopo" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Domínio</strong>: escolha concreto (ex: Brazilian legal contract classification)</li>
          <li><strong>Dataset</strong>: 2000-5000 exemplos curados, dedup, contamination check</li>
          <li><strong>FT</strong>: LoRA em Llama-3-8B ou Mistral-7B (QLoRA se GPU limitada)</li>
          <li><strong>Eval</strong>: golden set 100+ com ground truth + pairwise vs base</li>
          <li><strong>Deploy</strong>: vLLM container + Hugging Face Space demo</li>
          <li><strong>Docs</strong>: model card, README, repo público</li>
        </ul>
      </Section>

      <Section title="Entregáveis (checklist)" accent={accent}>
        <CodeBlock lang="markdown">{`# Capstone entregáveis

✓ GitHub repo público: ft-legal-contracts-br
  ├── data/
  │   ├── raw/           (source, gitignored se sensível)
  │   ├── process.py     (curation pipeline)
  │   └── README.md      (dataset provenance)
  ├── train/
  │   ├── train.py       (LoRA/QLoRA)
  │   └── config.yaml
  ├── eval/
  │   ├── golden_set.jsonl (100+ curated)
  │   ├── eval.py        (pairwise + metrics)
  │   └── report.md      (results vs base model)
  ├── deploy/
  │   ├── Dockerfile     (vLLM server)
  │   ├── huggingface_space/  (demo interativa)
  │   └── README.md
  └── model_card.md      (Mitchell et al. template)

✓ Hugging Face Model: github.com/you/model
✓ Hugging Face Space: huggingface.co/spaces/you/ft-demo
✓ Blog post explicando approach + results
`}</CodeBlock>
        <Callout tone="success" icon="🎓">
          Capstone ML serious. Recrutador vê: dataset curado, FT rigoroso, eval quantitative, deploy funcional, model card. Diferencial profissional real — não &quot;tutorial HF finetuning colado&quot;.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
