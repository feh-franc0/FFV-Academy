import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('quando-fine-tune-vs-rag-vs-prompt');

const accent = '#c084fc';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual cenário FINE-TUNING resolve melhor que RAG ou prompt?',
    options: [
      'Knowledge fresco',
      'Style/format output consistente (ex: "sempre responda em JSON com schema X"), tom específico de marca, domain-specific jargon, reduzir token usage (prompt menor porque modelo já sabe)',
      'Facts dinâmicos',
      'Nenhum',
    ],
    correct: 1,
    explanation: 'FT muda COMPORTAMENTO (como responde). RAG muda KNOWLEDGE (sobre o quê). Prompt muda TASK instrução. FT brilha em: consistent JSON/format, brand voice, structured extraction de dado specific, reduzir tokens (fine-tuned modelo n precisa exemplo toda vez). FT NÃO resolve: fatos dinâmicos (use RAG), task novo (use prompt).',
  },
  {
    question: 'Qual é o custo típico de fine-tune OpenAI/Anthropic?',
    options: [
      'Grátis',
      'OpenAI gpt-4o-mini FT: ~$3/M training tokens + ~$0.30/M input + ~$1.20/M output (inference). Anthropic Claude: FT só enterprise tier. Custo total: FT 1000 examples ≈ $10-50 + inference ongoing similar ao base',
      '$10k mínimo',
      'Sempre mais barato',
    ],
    correct: 1,
    explanation: 'OpenAI FT em gpt-4o-mini é accessible: $3/M training tokens + margin de deployment. Pequeno dataset (1k-10k examples): $5-100 training. Inference levemente mais caro que base. Open models (Llama, Mistral) com LoRA: compute rental $0.50-3/h × 2-10h training = $5-30. Deploy depois é serve (vLLM).',
  },
  {
    question: 'Quando FT é ABSOLUTAMENTE a resposta errada?',
    options: [
      'Tudo serve FT',
      'Knowledge fresco/mutável (preços, inventário, factual recente — usa RAG), baixo volume de exemplos (&lt; 100 — prompt é suficiente), task experimental (iterar em prompt é mais rápido)',
      'Sempre é certa',
      'Só pra startups',
    ],
    correct: 1,
    explanation: 'FT é caro e lento de iterar. Test: "preciso atualizar isso a cada semana?" → RAG. "Menos de 100 exemplos de qualidade?" → prompt. "Modelo base com prompt já faz 80%?" → prompt rules. FT só quando: need consistent format, reduce latency/cost, domain jargon diferente do training.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="quando-fine-tune-vs-rag-vs-prompt"
      title="Quando fine-tune vs RAG vs prompt engineering"
      icon="🎯"
      xp={50}
      readTime={12}
      trailName="Fine-tuning & Customização de LLMs"
      trailColor={accent}
      nextSlug="sft-supervised-fine-tuning"
      nextTitle="SFT (Supervised Fine-Tuning): básico e prático"
      quiz={quiz}
    >
      <Section title="Árvore de decisão" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Cenário', 'Escolha', 'Por quê']}
          rows={[
            ['Fact freshness (news, inventory)', 'RAG', 'Knowledge dinâmico'],
            ['Novo task experimental', 'Prompt', 'Iteração rápida'],
            ['Output consistente JSON/format', 'FT', 'Modelo aprende shape'],
            ['Domain jargon (legal, medical)', 'FT + RAG', 'Jargon de base, facts via retrieval'],
            ['Reduzir token cost per request', 'FT', 'Sem precisar exemplos no prompt'],
            ['Questions sobre PDFs grandes', 'RAG', 'Chunking + retrieval'],
            ['Tom/voz de marca', 'FT', 'Style é comportamento'],
          ]}
        />
      </Section>

      <Section title="Combinar é comum" accent={accent}>
        <Callout tone="info" icon="💡">
          Apps sérios frequentemente USAM OS 3: FT pra estilo/format, RAG pra facts, prompt pra task specific. Ex: customer support bot — FT pra tom brand, RAG pra product docs, prompt pra "classifique intent + responda". Não é either/or.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
