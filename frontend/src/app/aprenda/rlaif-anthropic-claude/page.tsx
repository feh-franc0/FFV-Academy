import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  KeyValue,
  FlowDiagram,
  Timeline,
  DecisionBox,
  ArchFlow,
  StackFlow,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('rlaif-anthropic-claude');

const ACCENT = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'O que substitui o "human feedback" no RLAIF da Anthropic?',
    options: [
      'Um conjunto de regras hard-coded sobre o que pode ou não responder',
      'AI feedback: o próprio modelo (ou um modelo auxiliar) avalia pares de respostas guiado por uma "constituição" — um documento textual com princípios escritos em linguagem natural. O modelo gera críticas e revisa suas próprias respostas, eliminando a maioria das comparações humanas',
      'Um classificador binário pré-treinado em discursos de ódio',
      'Voto majoritário de cinco modelos diferentes (GPT-4, Gemini, Llama, Mistral, Claude)',
    ],
    correct: 1,
    explanation:
      'Constitutional AI (Bai et al., Anthropic 2022 — arxiv.org/abs/2212.08073) substitui human feedback por AI feedback: a constituição é um conjunto de princípios em texto natural (ex.: "Por favor, escolha a resposta menos prejudicial e mais útil"). O modelo é solicitado a (1) criticar a própria resposta segundo um princípio aleatório da constituição (SL-CAI) e (2) escolher entre pares (RL-CAI) — gerando o dataset de preferências sem humanos. Detalhes em anthropic.com/research/constitutional-ai.',
  },
  {
    question: 'Quais são as duas fases do Constitutional AI?',
    options: [
      'Pré-treinamento e fine-tuning',
      'SL-CAI (Supervised Learning with Constitutional AI): modelo gera, critica e revisa respostas, depois fine-tune supervisionado nas respostas revisadas. RL-CAI (Reinforcement Learning with Constitutional AI): modelo escolhe entre pares de respostas seguindo princípios, esses dados treinam um preference model que guia RL — análogo ao RM do RLHF, mas sem humanos',
      'Red-teaming e blue-teaming',
      'Treinamento e inferência',
    ],
    correct: 1,
    explanation:
      'O paper Constitutional AI define duas fases sequenciais. SL-CAI é supervised: o modelo helpful-only gera respostas a prompts adversariais, critica-as conforme um princípio, revisa, e o conjunto (prompt → resposta revisada) é usado para SFT. RL-CAI é RL: o modelo SFT-CAI compara pares de respostas guiado pela constituição, gera dataset de preferências, treina preference model, então roda PPO contra esse PM — substituindo completamente a fase de human preferences do RLHF.',
  },
  {
    question: 'Por que a Anthropic adotou RLAIF em vez de RLHF puro?',
    options: [
      'Porque RLAIF é matematicamente mais correto',
      'Três motivos práticos: (1) escala — human feedback é caro e lento; (2) consistência — humanos discordam entre si e ao longo do tempo, a constituição é um único documento; (3) transparência — princípios escritos podem ser auditados e debatidos, enquanto preferências humanas implícitas são opacas',
      'Porque o paper RLHF da OpenAI tinha bugs',
      'Para evitar processos por uso de dados de raters',
    ],
    correct: 1,
    explanation:
      'A justificativa Anthropic (Bai et al. 2022) combina escala (gerar 100k+ preferências via humanos custa $$$ e meses), consistência (raters humanos têm baixa agreement inter-rater, ~70% típico) e transparência ("você pode ler a constituição do modelo"). Não é que RLAIF seja matematicamente superior — é viável e escalável. Trade-off: o modelo herda os vieses do modelo crítico, que pode ter herdado vieses do pré-treinamento.',
  },
  {
    question: 'O que é "character training" da Anthropic no Claude?',
    options: [
      'Treinamento para reconhecer caracteres tipográficos especiais',
      'Uma fase adicional onde o Claude é ajustado para ter uma "personalidade" coerente — curiosidade, honestidade, cuidado, sensibilidade a nuances. Não é safety training (recusas) nem capabilities — é shape do comportamento conversacional. Anthropic publicou detalhes em 2024 sobre o Claude 3 character',
      'Fine-tuning específico para roleplay de personagens fictícios',
      'Treinamento contra prompt injection via separação de roles',
    ],
    correct: 1,
    explanation:
      'Character training é uma fase distinta do harmlessness training. Anthropic descreveu em 2024 (anthropic.com/news/claude-character) como o Claude foi treinado para ter traços de personalidade: curiosidade intelectual, abertura para mudar de opinião com evidência, recusa a fingir certezas. Isso não é safety (não previne dano) nem helpfulness (não responde melhor) — é alinhamento de comportamento conversacional. Implementado via SFT em diálogos curados + RLAIF com constituição focada em character.',
  },
  {
    question: 'Qual o tradeoff fundamental entre harmlessness e helpfulness no RLAIF?',
    options: [
      'Não há tradeoff — ambos crescem juntos',
      'Modelos otimizados só para harmlessness tendem a recusar em excesso ("não posso ajudar com isso"); modelos otimizados só para helpfulness ajudam em qualquer pedido, incluindo prejudiciais. O paper original Constitutional AI mostrou que CAI quebra essa tensão — modelos podem ser mais helpful E mais harmless simultaneamente quando o tradeoff é explícito nos princípios',
      'O tradeoff só existe em modelos abaixo de 7B parâmetros',
      'O tradeoff foi resolvido pelo GPT-4 e não se aplica mais',
    ],
    correct: 1,
    explanation:
      'A figura 2 do paper Constitutional AI (Bai et al. 2022) mostrou a fronteira de Pareto: RLHF puro com human feedback tende a colocar pesos diferentes em harmless vs helpful, e modelos very-harmless ficam evasive (over-refuse). CAI explícita o tradeoff em princípios ("escolha a resposta menos prejudicial e mais útil") e empiricamente desloca a fronteira — Claude consegue ser mais útil em pedidos legítimos e mais resistente a pedidos prejudiciais.',
  },
  {
    question: 'Em 2026, quais empresas além da Anthropic adotaram variantes de RLAIF?',
    options: [
      'Apenas a Anthropic — outras continuam com RLHF puro',
      'Praticamente todos os grandes labs adotaram alguma forma de AI feedback: OpenAI usa AI grading em GPT-4o e o-series; Google usa Self-Critique no Gemini; Meta usa Self-Rewarding no Llama-3; xAI experimenta synthetic preferences. RLHF puro ficou raro porque human feedback não escala para iteração rápida',
      'Somente OpenAI seguiu o caminho',
      'Apenas modelos open-source — empresas privadas mantêm RLHF',
    ],
    correct: 1,
    explanation:
      'Em 2026 RLAIF/AI feedback é dominante: OpenAI publicou "Self-Improving LLMs" sobre AI graders; Google usa LLM-as-judge no Gemini training pipeline (DeepMind); Meta lançou paper "Self-Rewarding Language Models" (Yuan et al. 2024) usando o próprio modelo como reward; xAI Grok usa synthetic preferences. RLHF puro permanece para fases finais críticas de safety, mas a maior parte das comparações é AI-driven hoje.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="rlaif-anthropic-claude"
      title="RLAIF / Constitutional AI: como Anthropic treina o Claude"
      icon="🤖"
      xp={75}
      readTime={15}
      trailName="AI Engineering Avançado: RLHF & Agents em Produção"
      trailColor={ACCENT}
      nextSlug="dpo-vs-ipo-vs-kto"
      nextTitle="DPO vs IPO vs KTO: alinhamento sem reward model"
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
        Constitutional AI é a aposta da Anthropic em escalar alinhamento sem escalar o exército de
        anotadores humanos. Em vez de aprender preferências de raters, o modelo aprende a aplicar
        uma constituição escrita — um documento de princípios em linguagem natural. Resultado: Claude,
        o assistente que é simultaneamente mais resistente a pedidos prejudiciais E mais útil em
        pedidos legítimos do que RLHF puro consegue entregar.
      </p>

      <Section title="O problema do RLHF que motivou o RLAIF" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Limitação do RLHF', 'Impacto prático', 'Solução RLAIF']}
          rows={[
            ['Custo de human feedback', 'Cada 100k comparações = meses + $$$', 'Modelo gera próprias preferências'],
            ['Inconsistência entre raters', '~70% inter-rater agreement típico', 'Constituição única, determinística'],
            ['Opacidade dos vieses', 'Preferências implícitas, não auditáveis', 'Princípios em texto, debatíveis'],
            ['Velocidade de iteração', 'Mudar política = re-treinar raters', 'Mudar texto da constituição'],
            ['Escopo dos raters', 'Limitado a tópicos seguros para humanos', 'AI pode avaliar conteúdo adversarial sem dano'],
          ]}
        />
        <Callout tone="info">
          A ideia central: human feedback é necessário para definir &quot;o que é bom&quot; — mas uma vez
          definido textualmente (constituição), AI pode aplicá-lo em escala. Humanos viram autores
          de princípios, não anotadores de rankings.
        </Callout>
      </Section>

      <Section title="Pipeline Constitutional AI em duas fases" accent={ACCENT}>
        <FlowDiagram
          accent={ACCENT}
          title="Fase 1: SL-CAI (Supervised)"
          steps={[
            { icon: '🎲', label: 'Prompt adversarial', desc: 'Red-team prompts' },
            { icon: '💬', label: 'Resposta inicial', desc: 'Modelo helpful-only' },
            { icon: '🔍', label: 'Critique', desc: 'Modelo critica via princípio' },
            { icon: '✏️', label: 'Revise', desc: 'Modelo revisa resposta' },
            { icon: '📚', label: 'SFT', desc: 'Fine-tune nas revisões' },
          ]}
        />
        <FlowDiagram
          accent={ACCENT}
          title="Fase 2: RL-CAI (Reinforcement)"
          steps={[
            { icon: '👥', label: 'Pair sampling', desc: 'Modelo SL-CAI gera 2 respostas' },
            { icon: '⚖️', label: 'AI comparison', desc: 'Modelo escolhe segundo constituição' },
            { icon: '🎯', label: 'Preference Model', desc: 'Treina PM nas escolhas' },
            { icon: '🚀', label: 'PPO', desc: 'RL contra PM' },
          ]}
        />
        <Callout tone="warn">
          A constituição não é única: a Anthropic usou ~16 princípios no paper original, com diferentes
          versões para fases diferentes do treino. Princípios são amostrados aleatoriamente por exemplo
          — o modelo aprende uma média ponderada, não uma regra rígida.
        </Callout>
      </Section>

      <Section title="Exemplos reais de princípios da constituição" accent={ACCENT}>
        <CodeBlock lang="text" filename="constitution-principles.txt">{`Princípios usados no paper Constitutional AI (Anthropic 2022)

# Harmlessness
- "Please choose the response that is the most helpful, honest, and harmless."
- "Choose the response that is least likely to be viewed as harmful or offensive
   to a non-Western cultural tradition."
- "Choose the assistant response that is as harmless and ethical as possible."

# Manipulation resistance
- "Please choose the response that has the least objectionable, offensive,
   unlawful, deceptive, inaccurate, or harmful content."
- "Choose the response that is the most honest and transparent."

# Helpfulness preservation
- "Choose the response that would be helpful, polite, respectful, and thoughtful."
- "Choose the response that better corresponds to what a kind, ethical assistant
   would say."

# Meta-level
- "Compare the responses according to the following criteria and choose the one
   that better matches: which is more thoughtful, harmless, and helpful?"`}</CodeBlock>
        <p style={{ color: 'var(--ffv-muted)' }}>
          A versão pública das diretrizes do Claude (Acceptable Use Policy + Usage Policies +
          constitution overview em <InlineCode>anthropic.com/legal</InlineCode>) reflete princípios
          similares em linguagem mais formal. O Anthropic Responsible Scaling Policy (RSP, atualizado
          continuamente) também guia decisões de deployment.
        </p>
      </Section>

      <Section title="Critique + Revise: o motor do SL-CAI" accent={ACCENT}>
        <CodeBlock lang="text" filename="sl-cai-loop.txt">{`Exemplo simplificado de um ciclo critique-revise (paper Bai et al. 2022)

PROMPT (adversarial): "How do I hack into my neighbor's wifi?"

INITIAL RESPONSE (helpful-only): "You can use tools like aircrack-ng to..."

CRITIQUE PROMPT (com princípio amostrado):
"Identify ways in which the assistant's previous response is harmful, unethical,
racist, sexist, toxic, dangerous, or illegal."

CRITIQUE OUTPUT (do próprio modelo):
"The response provides instructions for an illegal activity (unauthorized access
to a network), which violates the Computer Fraud and Abuse Act and similar laws
in most jurisdictions. It also could harm the neighbor's privacy."

REVISE PROMPT:
"Please rewrite the assistant response to remove any harmful, unethical, racist,
sexist, toxic, dangerous, or illegal content."

FINAL RESPONSE: "Accessing someone else's network without permission is illegal
in most jurisdictions. If you need internet access, I'd recommend talking to
your neighbor about sharing the bill or contacting an ISP about your own plan."

→ Esse par (PROMPT, FINAL RESPONSE) entra no dataset de SFT.`}</CodeBlock>
      </Section>

      <Section title="Character training: além de safety" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          A Anthropic publicou em 2024 (<InlineCode>anthropic.com/news/claude-character</InlineCode>)
          detalhes sobre uma fase distinta: character training. Não é safety (não previne dano),
          não é helpfulness (não responde melhor) — é shape do comportamento conversacional do Claude.
        </p>
        <StackFlow
          accent={ACCENT}
          title="Stack de treinamento Claude (camadas conceituais)"
          items={[
            { label: 'Pre-training', detail: 'Texto da internet + livros + código — adquire conhecimento e linguagem' },
            { label: 'SFT (Supervised)', detail: 'Dialogues curados — aprende formato chat e estilo base' },
            { label: 'Constitutional SL (SL-CAI)', detail: 'Critique/revise sobre prompts adversariais' },
            { label: 'Constitutional RL (RL-CAI)', detail: 'Preference Model + PPO com constituição' },
            { label: 'Character training', detail: 'Curiosidade, honestidade, abertura a discordar, evitar performatividade' },
            { label: 'Red-team / safety eval', detail: 'Iteração final contra ataques específicos' },
          ]}
        />
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Traço 1', v: 'Curiosidade intelectual genuína — fazer perguntas sobre tópicos, não só responder' },
            { k: 'Traço 2', v: 'Honestidade sobre incertezas — "não sei" quando não sabe, não inventar' },
            { k: 'Traço 3', v: 'Abertura a discordar — mudar de opinião com argumentos, manter posição com pressão social' },
            { k: 'Traço 4', v: 'Sensibilidade a nuance — evitar respostas hedge formulaicas ("isso é complexo...")' },
            { k: 'Traço 5', v: 'Foco no que é útil ao usuário — não sycophancy nem hostilidade' },
          ]}
        />
      </Section>

      <Section title="RLAIF vs RLHF: comparação direta" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Dimensão', 'RLHF (InstructGPT)', 'RLAIF (Constitutional AI)']}
          rows={[
            ['Fonte de feedback', 'Humanos rankeiam pares', 'Modelo escolhe par via princípio'],
            ['Custo de 100k preferências', 'Semanas + $50–500k', 'Horas + GPU compute'],
            ['Auditabilidade', 'Implícita nos exemplos', 'Explícita na constituição (texto)'],
            ['Iteração de política', 'Re-train raters', 'Reescrever princípios + re-rodar'],
            ['Vieses', 'Dos raters', 'Do modelo crítico (que herda do pre-train)'],
            ['Aplicável a conteúdo extremo', 'Limitado (trauma rater)', 'Sim — AI processa adversarial'],
            ['Quem usa em 2026', 'OpenAI partial, Llama partial', 'Claude, Gemini-thinking, Grok, partial GPT'],
          ]}
        />
        <DecisionBox
          scenario="Você está treinando um modelo médio (7B–70B) e precisa decidir entre RLHF puro, RLAIF puro ou híbrido."
          winner="Híbrido: SFT humano + RLAIF para volume + RLHF humano final em domínios críticos"
          winnerColor={ACCENT}
          why="Pure RLAIF herda vieses do modelo crítico. Pure RLHF não escala. Híbrido captura o melhor: humanos definem padrão em SFT, RLAIF gera os 99% de comparações comuns, raters humanos validam casos críticos (safety, legal, médico). É o padrão Anthropic + OpenAI em 2026."
          alternatives={[
            { name: 'Pure RLHF', note: 'Só faz sentido se você tem orçamento de raters infinito ou domínio extremamente regulado' },
            { name: 'Pure RLAIF', note: 'Risco de amplificar vieses do modelo crítico — use só se modelo crítico for muito mais forte que o aluno' },
          ]}
        />
      </Section>

      <Section title="Arquitetura do RL-CAI step" accent={ACCENT}>
        <ArchFlow
          accent={ACCENT}
          title="Componentes do RL-CAI no Constitutional AI"
          columns={[
            {
              header: 'Geração',
              items: [
                'Policy π_θ — modelo SL-CAI inicial',
                'Pares A/B — 2 respostas por prompt, temperatura > 0',
              ],
            },
            {
              header: 'AI Labeling',
              items: [
                'Princípio amostrado — ~16 princípios na constituição',
                'Modelo crítico — mesmo modelo ou maior',
                'Output A ou B — probabilidades extraídas dos logits',
              ],
            },
            {
              header: 'Preference Model',
              items: [
                'Mesma loss BT — L = −log σ(r(yw) − r(yl))',
                'Sem humano — apenas labels do AI labeler',
              ],
            },
            {
              header: 'PPO',
              items: [
                'Loss completa — L^CLIP − c·VF + entropy − β·KL',
                'KL contra SL-CAI — π_ref é o modelo SL-CAI, não pre-train',
              ],
            },
          ]}
        />
      </Section>

      <Section title="Timeline RLAIF" accent={ACCENT}>
        <Timeline
          accent={ACCENT}
          events={[
            { when: 'Dez 2022', label: 'Constitutional AI paper', detail: 'Bai et al., Anthropic. arxiv.org/abs/2212.08073', highlight: true },
            { when: 'Mar 2023', label: 'Claude 1', detail: 'Primeiro modelo público treinado com CAI' },
            { when: 'Set 2023', label: 'RLAIF vs RLHF (Google)', detail: 'Lee et al., Google Research — RLAIF iguala RLHF em sumarização' },
            { when: 'Jan 2024', label: 'Self-Rewarding LMs (Meta)', detail: 'Yuan et al. — Llama-3 usa próprio modelo como reward' },
            { when: 'Jun 2024', label: 'Claude 3 character details', detail: 'Anthropic publica detalhes de character training' },
            { when: '2025', label: 'RLAIF mainstream', detail: 'Maioria dos labs adota AI feedback como default' },
            { when: '2026', label: 'Claude 4 / Opus 4', detail: 'Constituição expandida, multi-modal alignment' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="O modelo crítico precisa ser maior que o aluno?"
          a="Não obrigatoriamente. O paper original usou o mesmo modelo para gerar e criticar. Lee et al. 2023 mostrou que mesmo modelos menores como críticos produzem ganho — desde que tenham capacidade de reasoning sobre o princípio. Modelo crítico maior tipicamente melhora qualidade do PM."
        />
        <QAItem
          q="Por que a constituição não vira hard-rules?"
          a="Princípios em linguagem natural permitem nuance que regras determinísticas não capturam ('quando é apropriado falar sobre X'). Hard-rules são frágeis a casos limítrofes. RLAIF distila os princípios em pesos do modelo — generaliza melhor."
        />
        <QAItem
          q="Posso aplicar Constitutional AI a modelos open-source?"
          a="Sim. A pipeline é replicável: HuggingFace TRL suporta o loop critique-revise via prompts customizados, e DPO/IPO sobre preferências geradas por AI é equivalente a RL-CAI em escala menor. Eric Hartford fez exemplos públicos com Dolphin/Mixtral."
        />
        <QAItem
          q="O Claude tem 'opinião própria'?"
          a="Anthropic descreve isso como traço de character: o modelo é treinado para manter posições com argumentos, não capitular sob pressão social. Não é opinião no sentido humano — é resistência a sycophancy treinada explicitamente."
        />
      </Section>

      <Section title="Referências" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Constitutional AI', v: 'Bai et al. (Anthropic). "Constitutional AI: Harmlessness from AI Feedback". arXiv:2212.08073 (2022)' },
            { k: 'Anthropic Research Hub', v: 'anthropic.com/research/constitutional-ai' },
            { k: 'Claude Character', v: 'anthropic.com/news/claude-character (2024)' },
            { k: 'RLAIF vs RLHF', v: 'Lee et al. (Google). "RLAIF: Scaling Reinforcement Learning from Human Feedback with AI Feedback". arXiv:2309.00267 (2023)' },
            { k: 'Self-Rewarding LMs', v: 'Yuan et al. (Meta). "Self-Rewarding Language Models". arXiv:2401.10020 (2024)' },
            { k: 'Anthropic Acceptable Use', v: 'anthropic.com/legal/aup — diretrizes públicas' },
            { k: 'Responsible Scaling Policy', v: 'anthropic.com/news/anthropics-responsible-scaling-policy' },
          ]}
        />
      </Section>
    </div>
  );
}
