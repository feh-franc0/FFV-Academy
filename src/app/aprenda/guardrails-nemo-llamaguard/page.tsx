import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('guardrails-nemo-llamaguard');
const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença principal entre NeMo Guardrails e Llama Guard?',
    options: [
      'São idênticos',
      'NeMo Guardrails é framework de orquestração com dialog flow em Colang (define fluxos permitidos e checks entre turnos); Llama Guard é um modelo classificador de Meta que retorna safe/unsafe + categoria de violação. NeMo é "motor de regras"; Llama Guard é "classificador plugável" — costumam ser usados juntos',
      'NeMo é pago, Llama Guard grátis',
      'Llama Guard substitui LLM',
    ],
    correct: 1,
    explanation: 'NeMo Guardrails (NVIDIA) estrutura o agent como máquina de estados com checks configuráveis. Llama Guard (Meta) é classificador fine-tuned para detectar 14+ categorias de harm. Não competem — NeMo pode invocar Llama Guard como um dos seus checks.',
  },
  {
    question: 'Onde tipicamente colocar Llama Guard num agent?',
    options: [
      'Em lugar nenhum',
      'Duas camadas: antes de enviar input do usuário ao LLM principal (detecta prompt de abuse), e depois de receber output do LLM antes de retornar ao usuário (detecta resposta unsafe que passou pelo refusal). Dupla cobertura compensa o custo marginal',
      'Só no frontend',
      'Só em produção',
    ],
    correct: 1,
    explanation: 'Pattern padrão: input guard (reject prompts com harm intent claro) + output guard (catch respostas que escaparam refusal). Llama Guard 3 é 8B — latência aceitável em paralelo ao LLM principal. Custos comparáveis a uma chamada small-model.',
  },
  {
    question: 'Qual o risco de over-filtering com guardrails agressivos?',
    options: [
      'Nenhum',
      'Produto fica inútil: usuário legítimo é bloqueado (pergunta médica real, termo técnico que soa suspeito, conteúdo adulto em app adulto). Helpfulness cai, suporte recebe reclamações, taxa de abandono sobe. Sempre meça false positive rate contra dataset de prompts legítimos, não só true positive em adversarial',
      'Só estético',
      'Faz app mais rápido',
    ],
    correct: 1,
    explanation: 'Over-filtering é problema real e subestimado. Equipes medem só "quantos ataques bloqueamos" e ignoram "quantos usuários legítimos perdemos". Eval correto inclui benign prompts — ClearerFrontier, XSTest e datasets internos com 100+ perguntas legítimas sensíveis. Precision e recall, não só recall.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="guardrails-nemo-llamaguard"
      title="Guardrails: NeMo, Llama Guard, Claude Guardrails"
      icon="🚧"
      xp={55}
      readTime={13}
      trailName="AI Safety, Red Teaming & Alinhamento"
      trailColor={accent}
      nextSlug="red-team-playbook"
      nextTitle="Red team playbook: como atacar seu próprio LLM"
      quiz={quiz}
    >
      <Section title="Três ferramentas, três papéis" accent={accent}>
        <p>
          <strong>Llama Guard</strong> (Meta) é classificador de safety para input e output. <strong>NeMo Guardrails</strong> (NVIDIA) é framework para definir fluxos permitidos e checks. <strong>Claude Built-in Guardrails</strong> (Anthropic) são classificadores server-side que a API aplica automaticamente. Na prática, produção usa combinação — nenhum sozinho cobre tudo.
        </p>
      </Section>

      <Section title="Llama Guard: classificador plug-in" accent={accent}>
        <p>
          Llama Guard 3 (2024) é modelo Llama 3 8B fine-tuned para retornar <code>safe</code> ou <code>unsafe</code> + categoria (violence, hate, sexual content, weapons, self-harm, etc.). Roda self-host ou via together.ai, Groq, Fireworks.
        </p>
        <CodeBlock lang="python">{`import replicate

def llama_guard_check(message: str, role: str = 'user') -> dict:
    prompt = (
        '<|begin_of_text|><|start_header_id|>user<|end_header_id|>\\n\\n'
        'Task: Check if there is unsafe content in \\'' + role + '\\' messages in conversations '
        'according to our safety policy with the below categories.\\n\\n'
        '<BEGIN UNSAFE CONTENT CATEGORIES>\\n'
        'S1: Violent Crimes\\nS2: Non-Violent Crimes\\nS3: Sex Crimes\\nS4: Child Exploitation\\n'
        'S5: Defamation\\nS6: Specialized Advice\\nS7: Privacy\\nS8: Intellectual Property\\n'
        'S9: Indiscriminate Weapons\\nS10: Hate\\nS11: Self-Harm\\nS12: Sexual Content\\n'
        'S13: Elections\\nS14: Code Interpreter Abuse\\n'
        '<END UNSAFE CONTENT CATEGORIES>\\n\\n'
        '<BEGIN CONVERSATION>\\n' + role + ': ' + message + '\\n<END CONVERSATION>\\n\\n'
        'Provide your safety assessment.'
    )

    out = replicate.run('meta/llama-guard-3-8b', input={'prompt': prompt})
    result = ''.join(out).strip()
    # result: "safe" ou "unsafe\\nS1,S10"
    lines = result.split('\\n')
    return {
        'safe': lines[0] == 'safe',
        'categories': lines[1].split(',') if len(lines) > 1 else [],
    }`}</CodeBlock>
      </Section>

      <Section title="Dupla camada: input + output" accent={accent}>
        <CodeBlock lang="ts">{`async function safeChat(userMessage: string, ctx: Session): Promise<string> {
  // 1. Input guard
  const inputCheck = await llamaGuardCheck(userMessage, 'user');
  if (!inputCheck.safe) {
    logger.warn({ event: 'input_blocked', categories: inputCheck.categories, user: ctx.userId });
    return 'Não posso ajudar com essa solicitação.';
  }

  // 2. LLM principal
  const reply = await mainLLM.chat({ messages: [...ctx.history, { role: 'user', content: userMessage }] });

  // 3. Output guard
  const outputCheck = await llamaGuardCheck(reply, 'assistant');
  if (!outputCheck.safe) {
    logger.error({ event: 'output_blocked', categories: outputCheck.categories });
    return 'Desculpe, não pude gerar uma resposta adequada.';
  }

  return reply;
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Rode input check em paralelo ao LLM principal (se input bloquear, cancele a chamada). Isso esconde a latência do guard. Output check é sequencial por natureza — cabe em casos de alto impacto.
        </Callout>
      </Section>

      <Section title="NeMo Guardrails: orquestração por Colang" accent={accent}>
        <p>
          NeMo expõe DSL (Colang) para declarar intents, fluxos permitidos e checks. Útil quando agent tem workflows discretos e você quer "tubos" estritos — suporte, onboarding, triagem.
        </p>
        <CodeBlock lang="yaml">{`# config.yml
models:
  - type: main
    engine: openai
    model: gpt-4o

rails:
  input:
    flows:
      - self check input
      - check pii
  output:
    flows:
      - self check output
      - remove pii

# flows.co (Colang)
define flow self check input
  $allowed = execute self_check_input(query=$user_message)
  if not $allowed
    bot inform cannot help
    stop

define flow check pii
  $has_pii = execute detect_pii(text=$user_message)
  if $has_pii
    bot ask for pii redaction
    stop`}</CodeBlock>
      </Section>

      <Section title="Claude Built-in Guardrails" accent={accent}>
        <p>
          Claude API aplica classificadores constitutionais automaticamente. Respostas podem vir com <code>stop_reason: 'refusal'</code> e a API pode bloquear categorias sensíveis antes de gerar. Você não configura o classifier — configura o <strong>system prompt</strong> para contextualizar o caso de uso.
        </p>
        <CodeBlock lang="ts">{`// Bedrock Guardrails (AWS) — configuração declarativa
const response = await bedrock.converse({
  modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  messages: [{ role: 'user', content: [{ text: userInput }] }],
  guardrailConfig: {
    guardrailIdentifier: 'arn:aws:bedrock:us-east-1:ACCT:guardrail/abc123',
    guardrailVersion: '1',
    trace: 'enabled',
  },
});
// Guardrail aplica filtros configurados no console: hate, harm, PII, denied topics, word lists`}</CodeBlock>
      </Section>

      <Section title="Avaliando guardrails: precision e recall" accent={accent}>
        <p>
          Erro comum: reportar só "% de ataques bloqueados". Você precisa de datasets dos dois lados.
        </p>
        <CodeBlock lang="yaml">{`eval_de_guardrail:
  adversarial_set:
    - fonte: HarmBench, XSTest adversarial, AdvBench
    - objetivo: medir RECALL (% de unsafe bloqueado)
    - meta: >= 95%

  benign_sensitive_set:
    - fonte: XSTest benign, ClearerFrontier, exemplos internos
    - exemplos: perguntas médicas legítimas, histórico sobre guerras,
                termos técnicos que soam suspeitos, discussão sobre
                segurança (ex: "como hackers fazem phishing" para educação)
    - objetivo: medir PRECISION (% de bloqueios corretos)
    - meta: false_positive_rate < 5%

  reportar:
    precision: tp / (tp + fp)
    recall: tp / (tp + fn)
    f1: harmonic_mean
    # Decida threshold por caso de uso: app infantil tolera FP, app de pesquisa médica não`}</CodeBlock>
      </Section>

      <Section title="Quando usar qual" accent={accent}>
        <CodeBlock lang="markdown">{`- Agent simples com input livre: Llama Guard input + output
- Agent com workflows discretos (suporte, onboarding): NeMo Guardrails + Llama Guard como check interno
- Prod em AWS: Bedrock Guardrails (console + versionamento) + Claude nativo
- Compliance strict (finanças, saúde): Llama Guard + NeMo + Claude + audit trail
- Dev experimental: só Claude nativo até medir onde escapa`}</CodeBlock>
      </Section>

      <Section title="Fechamento" accent={accent}>
        <Callout tone="success" icon="✅">
          Guardrails em camadas é o padrão. Llama Guard para classificação plug-in (input + output). NeMo para orquestração com workflows. Claude / Bedrock Guardrails para baseline nativo. Meça precision E recall — over-filtering quebra produto tanto quanto under-filtering. Dataset benign-sensitive é metade do trabalho.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
