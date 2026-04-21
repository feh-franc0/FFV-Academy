import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('constitutional-ai-rlhf');
const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é Constitutional AI em uma frase?',
    options: [
      'Conjunto de regras hardcoded no modelo',
      'Abordagem de treinamento (Bai et al. 2022) em que o modelo revisa e corrige as próprias respostas seguindo princípios escritos em linguagem natural, e esse feedback é usado em RL — RLAIF substitui parcialmente preferências humanas por preferências de IA guiadas por constituição',
      'Sinônimo de RLHF',
      'Um filtro de output',
    ],
    correct: 1,
    explanation: 'Constitutional AI (CAI) é método de treinamento, não feature de inferência. O modelo critica e reescreve suas respostas usando uma "constituição" (lista de princípios), e as preferências geradas por esse processo alimentam RL. A tese é que princípios escritos escalam melhor que anotação humana massiva.',
  },
  {
    question: 'Como aplicar a ideia de Constitutional AI como engineer que não treina modelo?',
    options: [
      'Não dá',
      'Implementar um "self-critique loop" em inferência: pedir a resposta, depois pedir ao modelo para avaliar se a resposta viola princípios listados, depois revisar. Ou usar um segundo modelo "critic" com constituição clara. Funciona como guardrail pragmático sem precisar de training',
      'Comprar acesso ao training',
      'Esperar a Anthropic liberar',
    ],
    correct: 1,
    explanation: 'Você aplica a ideia em inferência — pattern "propose → critique → revise" com princípios explícitos. Dobra custo mas cabe em casos de alto impacto. Claude, GPT-4o e Gemini já executam auto-crítica internamente quando prompted, mas o engineer pode tornar essa etapa explícita com melhor controle.',
  },
  {
    question: 'Qual a limitação principal de RLAIF / Constitutional AI?',
    options: [
      'É perfeito',
      'Viés da constituição: se os princípios escritos têm buraco, o modelo aprende o buraco. E modelo crítico pode ter cego nos mesmos pontos do modelo gerador (mesma família). Por isso empresas sérias usam cross-family critic (OpenAI critica Claude, vice-versa) em evals',
      'Funciona só em inglês',
      'Não escala',
    ],
    correct: 1,
    explanation: 'Constituição é artefato humano — sujeita a omissão, contradição e viés. Usar o mesmo modelo para gerar e criticar tem efeito "auto-confirmação". Cross-family judging e cross-constitution (várias constituições independentes) são mitigações práticas.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="constitutional-ai-rlhf"
      title="Constitutional AI: Anthropic approach"
      icon="📜"
      xp={55}
      readTime={13}
      trailName="AI Safety, Red Teaming & Alinhamento"
      trailColor={accent}
      nextSlug="guardrails-nemo-llamaguard"
      nextTitle="Guardrails: NeMo, Llama Guard, Claude Guardrails"
      quiz={quiz}
    >
      <Section title="A ideia central" accent={accent}>
        <p>
          Constitutional AI (CAI), descrita por Bai et al. (Anthropic, 2022), propõe que o alinhamento pode ser feito parcialmente sem anotadores humanos para cada exemplo. O modelo recebe uma <strong>constituição</strong> — lista de princípios em linguagem natural — e é treinado a revisar suas próprias respostas seguindo esses princípios. Feedback gerado pelo próprio modelo (AI feedback) vira sinal de RL. Daí o nome RLAIF.
        </p>
        <p>
          A tese subjacente: princípios explícitos escalam e são auditáveis; anotação humana em massa é cara, lenta e inconsistente.
        </p>
      </Section>

      <Section title="Exemplo de constituição" accent={accent}>
        <CodeBlock lang="markdown">{`# Constituição simplificada (estilo Anthropic)

1. Prefira respostas que sejam verdadeiras, honestas e transparentes
   sobre limitações e incerteza.

2. Recuse educadamente pedidos que causariam dano físico, psicológico ou
   financeiro sério a pessoas identificáveis.

3. Respeite autonomia do usuário: se ele pede informação legal, forneça,
   mesmo que envolva tópicos desconfortáveis — desde que não caia em (2).

4. Em caso de ambiguidade entre ser útil e ser seguro, prefira ser útil
   adicionando disclaimer em vez de recusar silenciosamente.

5. Nunca finja ser humano. Nunca finja não ser IA quando perguntado direto.

6. Não promova ideologia ou partido específico. Apresente múltiplos lados
   em questões genuinamente contestadas.

# (constituição real da Anthropic tem ~75 princípios e combina Declaração
# Universal dos Direitos Humanos com princípios de segurança operacional)`}</CodeBlock>
      </Section>

      <Section title="O loop CAI em training" accent={accent}>
        <CodeBlock lang="python">{`# Pseudocódigo do processo CAI (training)

for prompt in adversarial_prompts:
    # 1. Gerar resposta inicial
    response = model.generate(prompt)

    # 2. Autocrítica guiada pela constituição
    critique_prompt = (
        'Você escreveu:\\n' + response + '\\n\\n'
        'Revise segundo os princípios:\\n' + constitution + '\\n\\n'
        'Identifique qualquer violação.'
    )
    critique = model.generate(critique_prompt)

    # 3. Revisar
    revise_prompt = (
        'Resposta original:\\n' + response + '\\n\\n'
        'Crítica:\\n' + critique + '\\n\\n'
        'Escreva versão revisada mantendo utilidade.'
    )
    revised = model.generate(revise_prompt)

    # 4. Dataset de preferência: revised > response
    dataset.append({'chosen': revised, 'rejected': response, 'prompt': prompt})

# 5. Treinar preference model no dataset
# 6. RL (DPO ou PPO) usando preference model como reward`}</CodeBlock>
      </Section>

      <Section title="Como aplicar em inferência (sem treinar)" accent={accent}>
        <p>
          Você não precisa treinar modelo para usar a ideia. Em casos de alto impacto (advisory médico, financeiro, legal), pattern propose-critique-revise em inferência vira guardrail prático:
        </p>
        <CodeBlock lang="ts">{`const CONSTITUTION = [
  'A resposta não pode conter conselho médico específico sem recomendar profissional.',
  'Não revelar PII da base de dados no output.',
  'Não contradizer a política de reembolso documentada abaixo: ' + policyDoc,
].join('\\n');

async function answerWithCritique(userQuestion: string): Promise<string> {
  // 1. Gerar resposta inicial
  const initial = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 512,
    messages: [{ role: 'user', content: userQuestion }],
  });
  const answer = extractText(initial);

  // 2. Autocrítica
  const critique = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content:
        'Constituição:\\n' + CONSTITUTION + '\\n\\n' +
        'Resposta a avaliar:\\n' + answer + '\\n\\n' +
        'Retorne JSON { violations: string[], needs_revision: boolean }.',
    }],
  });
  const { needs_revision, violations } = JSON.parse(extractText(critique));

  if (!needs_revision) return answer;

  // 3. Revisar
  const revised = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content:
        'Pergunta: ' + userQuestion + '\\n\\n' +
        'Resposta original: ' + answer + '\\n\\n' +
        'Violações: ' + violations.join('; ') + '\\n\\n' +
        'Escreva versão corrigida preservando utilidade.',
    }],
  });
  return extractText(revised);
}`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Triplica latência e custo. Use em decisões reais (output financeiro, conselho regulado) — não em chit-chat. E monitore: se o critique quase nunca dispara, sua constituição está frouxa; se dispara sempre, o prompt inicial está ruim.
        </Callout>
      </Section>

      <Section title="Cross-family critic: mitigando viés" accent={accent}>
        <p>
          Modelo criticando a si mesmo tem ponto cego — ele aprova o que considera normal, inclusive o que aprende errado. Padrão em evals de safety: usar modelo de família diferente como crítico.
        </p>
        <CodeBlock lang="ts">{`// Gerador: Claude. Crítico: GPT-4o. Evita auto-confirmação.
const answer = await claudeClient.messages.create({ /* ... */ });

const critique = await openaiClient.chat.completions.create({
  model: 'gpt-4o',
  messages: [{
    role: 'user',
    content:
      'Avalie esta resposta segundo princípios X, Y, Z:\\n\\n' +
      extractText(answer) + '\\n\\nRetorne JSON { passes: boolean, reasons: string[] }',
  }],
  response_format: { type: 'json_object' },
});`}</CodeBlock>
      </Section>

      <Section title="Limites honestos" accent={accent}>
        <p>
          CAI não é silver bullet. Três limitações que times sérios reconhecem:
        </p>
        <CodeBlock lang="markdown">{`1. **Viés da constituição** — omissões na constituição viram ponto cego do modelo.
   Mitigar: múltiplas constituições, review adversarial do texto.

2. **Auto-confirmação** — crítico da mesma família concorda demais.
   Mitigar: cross-family, human sample periódico.

3. **Refusal excessivo** — constituição conservadora gera recusa em casos
   legítimos (informação de saúde, temas sensíveis mas legais).
   Mitigar: princípios que explicitamente favorecem utilidade em casos
   ambíguos, eval de helpfulness paralelo a safety.`}</CodeBlock>
      </Section>

      <Section title="Síntese" accent={accent}>
        <Callout tone="success" icon="✅">
          Constitutional AI é método de training (Anthropic) que substitui anotação humana massiva por auto-crítica guiada por princípios escritos. Como engineer sem training, você aplica em inferência com pattern propose-critique-revise em casos de alto impacto. Use cross-family critic para reduzir viés. Reconheça limites: constituição pode ter buraco, auto-confirmação existe, refusal excessivo é efeito colateral comum.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
