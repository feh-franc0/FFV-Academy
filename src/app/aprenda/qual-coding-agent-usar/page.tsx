import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';

export const metadata: Metadata = {
  title: 'Qual Ferramenta de IA Usar e Quando — FFV Academy',
  description: 'Matriz de decisão técnica: quando Claude Code supera Cursor, quando Codex na nuvem faz sentido, quando o Q Developer vence. Sem achismo, com embasamento.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Você precisa refatorar um monólito de 500k linhas de código espalhado por 300 arquivos. Qual ferramenta tem a abordagem mais adequada?',
    options: [
      'GitHub Copilot — tem acesso a todo o repositório via embeddings',
      'OpenAI Codex — roda em sandbox isolado sem consumir sua máquina',
      'Claude Code — lê arquivos explicitamente, executa grep/glob para navegação precisa, e o loop agêntico lida bem com tarefas de múltiplos passos em grande escala',
      'Kiro — a spec formaliza os requisitos da refatoração',
    ],
    correct: 2,
    explanation: 'Para refatorações grandes, Claude Code tem vantagem: ele lê arquivos explicitamente (não via embeddings aproximados), executa grep para encontrar todos os usos de um padrão com precisão, e o loop agêntico mantém contexto de progresso ao longo de dezenas de arquivos.',
  },
  {
    question: 'Qual é o critério mais importante para decidir entre ferramentas cloud (Codex) e local (Claude Code) em ambientes corporativos?',
    options: [
      'Qual tem o modelo mais recente',
      'Qual é mais barato por token',
      'Política de privacidade de dados: o código-fonte passa pelos servidores de quem? Isso é aceitável para os dados em questão?',
      'Qual tem melhor UX',
    ],
    correct: 2,
    explanation: 'Em ambientes corporativos, o código-fonte é propriedade intelectual sensível. Ferramentas cloud (Codex) enviam seu repo para a infraestrutura da OpenAI. Claude Code só envia o texto dos prompts para a API da Anthropic. Para dados regulados (LGPD, HIPAA, PCI), essa distinção pode ser decisiva.',
  },
  {
    question: 'Um desenvolvedor júnior está aprendendo uma codebase nova. Qual ferramenta é mais indicada para o processo de aprendizado?',
    options: [
      'Claude Code — tem acesso total ao código',
      'Cursor ou Copilot — o feedback visual inline ajuda a entender as sugestões no contexto, sem precisar alternar entre terminal e editor',
      'Amazon Q — é mais seguro',
      'Kiro — a spec força a documentar antes de implementar',
    ],
    correct: 1,
    explanation: 'Para aprendizado, contexto visual é fundamental. IDEs como Cursor mostram as sugestões de IA diretamente no código com syntax highlighting, explicações inline e diffs coloridos. O desenvolvedor vê exatamente o que está sendo mudado, reduzindo a fricção de aceitar código sem entender.',
  },
];

export default function QualCodingAgentUsarPage() {
  return (
    <ModuleLayout
      slug="qual-coding-agent-usar"
      title="Qual Ferramenta Usar e Quando"
      icon="⚖️"
      xp={80}
      readTime={12}
      trailName="Ferramentas de IA para Código"
      trailColor="#ffa657"
      nextSlug={undefined}
      nextTitle={undefined}
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
        Depois de entender como cada ferramenta funciona por dentro, a pergunta prática: qual usar? A resposta honesta é "depende" — mas depende de coisas específicas e mensuráveis. Sem achismo.
      </p>

      <Section title="O erro mais comum: escolher pela hype">
        <p>
          A maioria das comparações online é baseada em <em>qual ferramenta completou este benchmark específico mais rápido</em>. Isso é quase inútil para decidir o que usar no seu trabalho. O que importa é diferente:
        </p>
        <div className="flex flex-col gap-2">
          {[
            'Onde fica o código quando a ferramenta está "pensando"? (implicações de privacidade)',
            'O agente tem acesso ao ambiente de execução real? (testes, compilação, lint)',
            'O fluxo de revisão combina com o nível de confiança que você tem na saída?',
            'O time já usa a infraestrutura onde a ferramenta se integra melhor?',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span style={{ color: 'var(--ffv-orange)' }}>→</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Matriz de decisão por contexto">
        <div className="flex flex-col gap-4">
          <DecisionBlock
            scenario="Tarefa longa e complexa (feature completa, refatoração grande)"
            winner="Claude Code"
            winnerColor="#58a6ff"
            why="Loop agêntico com acesso real ao ambiente. Pode rodar testes, verificar se o build passou, iterar com base nos resultados. Contexto longo (claude-sonnet suporta 200k tokens) permite manter o estado de uma tarefa multi-hora."
            alternatives={[
              { name: 'Cursor Agent', note: 'Boa opção se você prefere feedback visual durante a execução' },
              { name: 'Codex', note: 'Viável se a tarefa é bem definida e você quer execução assíncrona' },
            ]}
          />

          <DecisionBlock
            scenario="Múltiplas tarefas independentes em paralelo"
            winner="OpenAI Codex"
            winnerColor="#10a37f"
            why="Modelo assíncrono permite submeter N tarefas e receber N PRs. Ideal para sprints onde o time quer acelerar tarefas bem definidas (bug fixes, testes, documentação) sem bloquear o trabalho em curso."
            alternatives={[
              { name: 'Claude Code', note: 'Possível com múltiplos terminais, mas menos elegante' },
              { name: 'Copilot Workspace', note: 'Similar para tasks vinculadas a issues GitHub' },
            ]}
          />

          <DecisionBlock
            scenario="Desenvolvedor novo aprendendo a codebase"
            winner="Cursor / GitHub Copilot"
            winnerColor="#d2a8ff"
            why="Feedback visual inline reduz a fricção. O dev vê as sugestões no contexto do código, aceita linha por linha, entende o que está sendo mudado. Chat no Cursor permite fazer perguntas sobre o código sem sair do editor."
            alternatives={[
              { name: 'Claude Code', note: 'Funciona, mas a alternância terminal↔editor aumenta a carga cognitiva' },
            ]}
          />

          <DecisionBlock
            scenario="Projeto AWS-heavy (Lambda, CDK, DynamoDB, API Gateway)"
            winner="Amazon Q Developer"
            winnerColor="#ffa657"
            why="Treinado especificamente com documentação AWS. Entende quotas, limites, IAM policies, melhores práticas de arquitetura serverless. Menos hallucinations em recursos AWS que modelos genéricos."
            alternatives={[
              { name: 'Claude Code', note: 'Bom com documentação AWS incluída no contexto via WebFetch' },
              { name: 'Cursor + Copilot', note: 'Funcional mas sem a profundidade AWS do Q' },
            ]}
          />

          <DecisionBlock
            scenario="Código legado Java (8/11) precisando migrar para versão moderna"
            winner="Amazon Q Developer"
            winnerColor="#ffa657"
            why="O recurso de transformação de código do Q foi construído especificamente para isso. Ele tem um pipeline dedicado de análise, planejamento e execução de migrações Java que nenhuma outra ferramenta tem de forma nativa."
            alternatives={[
              { name: 'Claude Code', note: 'Pode fazer, mas sem o pipeline especializado — mais trabalhoso' },
            ]}
          />

          <DecisionBlock
            scenario="Time com requisitos rigorosos de compliance (HIPAA, PCI-DSS, SOC2)"
            winner="Claude Code"
            winnerColor="#58a6ff"
            why="Seus arquivos permanecem na sua máquina. Só os prompts (texto) trafegam pela API. Isso é mais fácil de auditar e justificar em processos de compliance do que soluções que clonam seu repositório em infraestrutura de terceiros."
            alternatives={[
              { name: 'Cursor', note: 'Depende de onde o modelo está hospedado — pode ser configurado com modelo self-hosted' },
              { name: 'Copilot Enterprise', note: 'Microsoft tem certificações de compliance relevantes' },
            ]}
          />

          <DecisionBlock
            scenario="Feature nova com requisitos complexos e multi-time"
            winner="Kiro"
            winnerColor="#d2a8ff"
            why="O spec-driven development força clareza antes de execução. A spec serve de contrato entre PM, designer e dev. O rastreamento tasks → código → spec reduz ambiguidade e facilita revisão."
            alternatives={[
              { name: 'Claude Code + CLAUDE.md detalhado', note: 'Pode simular parte dos benefícios com um plano bem estruturado' },
            ]}
          />
        </div>
      </Section>

      <Section title="Os benchmarks: o que os números mostram em 2026">
        <p>
          Em vez de opinião, dados públicos. Abril/2026:
        </p>
        <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          <p className="font-semibold text-xs mb-3" style={{ color: 'var(--ffv-orange)' }}>SWE-BENCH VERIFIED — FRONTIER CLUSTER</p>
          <div className="flex flex-col gap-1 text-xs" style={{ color: 'var(--ffv-muted)', fontFamily: 'var(--font-roboto-mono)' }}>
            <p>Claude Opus 4.6       77,2%</p>
            <p>Claude Sonnet 4.6     77,1%</p>
            <p>GPT-5.1-Codex-Max    76,8%</p>
            <p>Gemini 3 Pro          76,8%</p>
            <p>codex-max (base)      76,6%</p>
            <p>Claude Haiku 4.5      76,4%</p>
            <p className="mt-2" style={{ color: 'var(--ffv-orange)' }}>Spread total: ~0,8 pontos</p>
          </div>
        </div>

        <p>
          O que essa lista te diz: em 2026, escolher modelo frontier é <em>praticamente um coin flip</em>. O ganho médio esperado trocando de um para outro está dentro do ruído estatístico do benchmark. O que NÃO é ruído é o scaffold:
        </p>

        <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid rgba(255,166,87,0.3)' }}>
          <p className="font-semibold text-xs mb-3" style={{ color: 'var(--ffv-orange)' }}>SWE-BENCH PRO (nov/2025) — MESMO MODELO, HARNESS DIFERENTE</p>
          <div className="flex flex-col gap-1 text-xs" style={{ color: 'var(--ffv-muted)', fontFamily: 'var(--font-roboto-mono)' }}>
            <p>Claude Opus 4.5 em SEAL Harness              45,9%</p>
            <p>Claude Opus 4.5 em scaffold X                  50,1%</p>
            <p>Claude Opus 4.5 em Claude Code                 55,4%</p>
            <p className="mt-2" style={{ color: 'var(--ffv-orange)' }}>Spread: 9,5 pontos trocando só o harness</p>
          </div>
        </div>

        <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid rgba(63,185,80,0.3)' }}>
          <p className="font-semibold text-xs mb-3" style={{ color: 'var(--ffv-green)' }}>MODELO "MENOR" + SCAFFOLD BOM BATE MODELO "MAIOR"</p>
          <div className="flex flex-col gap-1 text-xs" style={{ color: 'var(--ffv-muted)', fontFamily: 'var(--font-roboto-mono)' }}>
            <p>Confucius Code Agent + Claude Sonnet 4.5   52,7%</p>
            <p>Claude Opus 4.5 nativo (sem agent scaffold) 52,0%</p>
            <p className="mt-2" style={{ color: 'var(--ffv-green)' }}>Sonnet com scaffold vence Opus sem</p>
          </div>
        </div>

        <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid rgba(88,166,255,0.3)' }}>
          <p className="font-semibold text-xs mb-3" style={{ color: '#58a6ff' }}>EFEITO DO TURN BUDGET (SWE-agent paper)</p>
          <div className="flex flex-col gap-1 text-xs" style={{ color: 'var(--ffv-muted)', fontFamily: 'var(--font-roboto-mono)' }}>
            <p>Mesmo modelo, 50 turnos max       →  ~23%</p>
            <p>Mesmo modelo, 250 turnos max      →  ~45%+</p>
            <p className="mt-2" style={{ color: '#58a6ff' }}>Dar 5x mais turnos quase dobra o resultado</p>
          </div>
        </div>

        <Callout>
          Regra útil: se o benchmark de uma ferramenta não informa <em>qual modelo, qual versão, quantos turnos</em>, descarte o número. Comparar "ferramenta A: 60%" vs "ferramenta B: 55%" sem essas variáveis é comparar rankings de futebol de anos diferentes.
        </Callout>
      </Section>

      <Section title="Mitos comuns (e a realidade dos dados)">
        <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          <div className="flex flex-col gap-3 text-xs">
            {[
              { claim: 'Modelo maior = melhor output.', reality: 'Em abril/2026, spread entre frontier no SWE-bench Verified é 0,8pt. Tamanho já não diferencia ferramenta.' },
              { claim: 'O modelo mais recente é sempre o melhor.', reality: 'Regressões acontecem em domínios específicos. GPT-5 melhorou front-end mas o SWE-bench Pro mostrou quedas em algumas categorias vs GPT-4.1. Teste em SEU workload.' },
              { claim: 'Harness não importa, só o modelo.', reality: 'Mesmo modelo, mesmo benchmark: Claude Code 55,4% vs SEAL 45,9%. 9,5 pontos de diferença. Falso.' },
              { claim: 'Se o harness parseia muitos formatos de tool call, ele fica lento.', reality: 'Parsing custa microssegundos. O que muda performance é edit format + turn budget + context management, não CPU de parsing.' },
              { claim: 'Ferramenta AWS precisa do Amazon Q.', reality: 'Para código que usa AWS, Claude Code com bom contexto empata. O moat do Q é IAM nativo + Code Transformation com build farm — integração, não inteligência.' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-1">
                <p><span style={{ color: 'var(--ffv-red)' }}>✗ Mito: </span>{item.claim}</p>
                <p style={{ color: 'var(--ffv-muted)', paddingLeft: '1rem' }}>→ {item.reality}</p>
                {i < 4 && <div style={{ borderBottom: '1px solid var(--ffv-border)', margin: '4px 0' }} />}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Custo real: além do preço por token">
        <p>
          O custo de uma ferramenta de coding agent vai além do preço da API. A conta completa:
        </p>
        <CodeBlock>{`Custo total = (tokens × preço/token)
            + tempo do dev revisando output
            + custo de bugs introduzidos
            + overhead de aprender a ferramenta
            + custo de integração ao workflow existente
            - tempo economizado em tarefas manuais

// Uma ferramenta barata que gera muito output ruim
// custa mais que uma cara que acerta na primeira.`}</CodeBlock>
        <p>
          O verdadeiro KPI é <strong>throughput de código correto por hora de trabalho</strong> — não tokens por dólar.
        </p>
      </Section>

      <Section title="Recomendação prática: não escolha um">
        <p>
          A conclusão contraintuitiva depois de entender todas as ferramentas: as melhores equipes de engenharia não escolhem <em>uma</em> ferramenta — elas usam ferramentas diferentes para contextos diferentes.
        </p>
        <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid rgba(255,166,87,0.3)' }}>
          <p className="font-semibold text-xs mb-3" style={{ color: 'var(--ffv-orange)' }}>STACK PRAGMÁTICO (2025)</p>
          <div className="flex flex-col gap-2 text-xs">
            {[
              { tool: 'Cursor ou Copilot', uso: 'No IDE — autocomplete e edições rápidas durante o desenvolvimento normal' },
              { tool: 'Claude Code', uso: 'Para tarefas longas, refatorações complexas, debug difícil — quando você precisa do agente com acesso real ao ambiente' },
              { tool: 'Codex (cloud)', uso: 'Para tasks bem definidas em paralelo — bug fixes, testes, docs — enquanto você trabalha em outra coisa' },
              { tool: 'Q Developer', uso: 'Se você trabalha com AWS — não faz sentido usar ferramenta genérica quando existe uma especializada' },
            ].map(item => (
              <div key={item.tool} className="flex items-start gap-2">
                <span className="font-semibold flex-shrink-0" style={{ color: 'var(--ffv-orange)', minWidth: 140 }}>{item.tool}</span>
                <span style={{ color: 'var(--ffv-muted)' }}>{item.uso}</span>
              </div>
            ))}
          </div>
        </div>
        <Callout>
          O desenvolvedor que mais se beneficia de IA não é o que encontrou a ferramenta certa — é o que entende o que cada ferramenta faz bem e mal o suficiente para escolher a certa para cada situação.
        </Callout>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold mb-3 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full inline-block" style={{ background: '#ffa657' }} />
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function DecisionBlock({ scenario, winner, winnerColor, why, alternatives }: {
  scenario: string;
  winner: string;
  winnerColor: string;
  why: string;
  alternatives: { name: string; note: string }[];
}) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: `1px solid ${winnerColor}25` }}>
      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--ffv-muted)' }}>📋 {scenario}</p>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${winnerColor}18`, color: winnerColor }}>
          ✓ {winner}
        </span>
      </div>
      <p className="text-xs mb-2" style={{ color: 'var(--ffv-muted)' }}>{why}</p>
      {alternatives.length > 0 && (
        <div className="flex flex-col gap-1">
          {alternatives.map(alt => (
            <p key={alt.name} className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
              <span style={{ color: 'var(--ffv-border)' }}>Alt: </span>
              <span className="font-semibold">{alt.name}</span> — {alt.note}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--ffv-green)', fontFamily: 'var(--font-roboto-mono)' }}>
      {children}
    </pre>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl flex gap-3" style={{ background: 'rgba(255,166,87,0.08)', border: '1px solid rgba(255,166,87,0.2)' }}>
      <span className="text-xl flex-shrink-0">💡</span>
      <p className="text-sm">{children}</p>
    </div>
  );
}
