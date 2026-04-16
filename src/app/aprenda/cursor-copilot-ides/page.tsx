import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';

export const metadata: Metadata = {
  title: 'Cursor, Copilot e os IDEs Aumentados — FFV Academy',
  description: 'Como Cursor e GitHub Copilot integram IA diretamente no editor — a filosofia IDE-first e como ela se diferencia de agentes de terminal como Claude Code.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'O que é o Cursor tecnicamente?',
    options: [
      'Um plugin do VSCode',
      'Um fork do VSCode com IA integrada diretamente no core do editor, não como extensão',
      'Uma API de autocompletar código',
      'Um modelo de linguagem especializado em código',
    ],
    correct: 1,
    explanation: 'O Cursor é um fork do VSCode (código aberto). Por ser um fork, a equipe consegue integrar IA em camadas mais profundas do editor — não como extensão que tem acesso limitado, mas como parte do próprio editor.',
  },
  {
    question: 'Como o GitHub Copilot acessa o código do seu projeto além do arquivo aberto?',
    options: [
      'Ele não acessa — só vê o arquivo atual',
      'Via um sistema de indexação semântica do repositório (embeddings) que seleciona os trechos mais relevantes para o contexto',
      'Ele faz upload de todo o projeto para os servidores do GitHub',
      'Através de integração com o git log',
    ],
    correct: 1,
    explanation: 'O Copilot usa embeddings para indexar o repositório localmente. Quando você digita código, ele busca semanticamente os trechos mais relevantes do repo e os inclui no contexto do modelo — sem enviar o projeto inteiro.',
  },
  {
    question: 'Qual é a principal vantagem da abordagem IDE-first sobre agentes de terminal?',
    options: [
      'É mais barato',
      'O contexto visual — o desenvolvedor vê as mudanças acontecendo em tempo real, com diff inline, syntax highlighting e feedback imediato',
      'Usa modelos melhores',
      'Funciona offline',
    ],
    correct: 1,
    explanation: 'IDEs com IA oferecem feedback visual imediato: você aceita ou rejeita sugestões linha por linha, vê diffs coloridos, o código está sendo editado no mesmo ambiente onde você trabalha. Isso reduz o tempo de revisão e o risco de aceitar mudanças sem entender.',
  },
];

export default function CursorCopilotIDEsPage() {
  return (
    <ModuleLayout
      slug="cursor-copilot-ides"
      title="Cursor, Copilot e os IDEs Aumentados"
      icon="🖥️"
      xp={60}
      readTime={10}
      trailName="Ferramentas de IA para Código"
      trailColor="#ffa657"
      nextSlug="amazon-q-kiro"
      nextTitle="Amazon Q e Kiro: a Aposta da AWS"
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
        Para muitos desenvolvedores, o editor de código é a extensão do pensamento. Cursor e GitHub Copilot apostam nessa premissa: em vez de mover o desenvolvedor para um terminal ou interface de chat, eles trazem a IA diretamente para onde o código vive.
      </p>

      <Section title="Cursor: um fork, não um plugin">
        <p>
          Este detalhe técnico muda tudo. O Cursor não é uma extensão do VSCode — é um <strong>fork</strong> do VSCode (que é open-source). A diferença prática:
        </p>
        <div className="flex flex-col gap-2">
          <div className="p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--ffv-muted)' }}>Extensão do VSCode</p>
            <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
              Acessa a API pública do VSCode. Pode inserir texto, abrir painéis laterais, reagir a eventos de arquivo. Mas não pode modificar o motor de renderização, o sistema de syntax highlighting em tempo real, ou a lógica interna do editor.
            </p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid rgba(255,166,87,0.3)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--ffv-orange)' }}>Fork do VSCode (Cursor)</p>
            <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
              Acesso total ao código-fonte. Pode modificar como o autocomplete funciona internamente, como o cursor se move, como diffs são calculados e renderizados. Isso permite experiências como o "ghost text" multiling e o diff inline que aparece antes de você aceitar.
            </p>
          </div>
        </div>
        <p>
          A desvantagem: o Cursor fica levemente atrás nas atualizações do VSCode e algumas extensões têm comportamento estranho por incompatibilidades com o fork.
        </p>
      </Section>

      <Section title="Os modos do Cursor">
        <p>
          O Cursor tem três formas distintas de interagir com IA, cada uma com filosofia diferente:
        </p>
        <div className="flex flex-col gap-3">
          <ModeCard
            mode="Tab (autocomplete)"
            shortcut="Tab"
            color="#58a6ff"
            desc="Previsão inline do próximo trecho de código. O Cursor diferencia do Copilot ao usar o contexto de todo o arquivo atual e arquivos recentemente abertos — não só o cursor atual."
            when="Fluxo normal de escrita. Você digita, a IA sugere o próximo passo."
          />
          <ModeCard
            mode="Cmd+K (edit inline)"
            shortcut="Cmd+K"
            color="#d2a8ff"
            desc="Selecione um trecho de código e dê uma instrução em linguagem natural. O Cursor edita o trecho selecionado com um diff que você aceita ou rejeita linha por linha."
            when="Refatorações pontuais, mudanças de estilo, conversão de código."
          />
          <ModeCard
            mode="Composer / Agent Mode"
            shortcut="Cmd+I"
            color="#ffa657"
            desc="O agente lê múltiplos arquivos, cria e modifica código em várias partes do projeto, roda comandos no terminal integrado. Similar ao Claude Code mas dentro do IDE com feedback visual."
            when="Tarefas multi-arquivo: nova feature, refatoração grande, debug complexo."
          />
        </div>
      </Section>

      <Section title="Como o Cursor indexa o seu repositório">
        <p>
          Para incluir contexto relevante sem estourar a janela, o Cursor usa <strong>embeddings semânticos</strong>:
        </p>
        <CodeBlock>{`// Indexação do Cursor

1. Divide cada arquivo em chunks (~200-500 tokens)
2. Gera embedding para cada chunk
   (vetor numérico de ~1500 dimensões)
3. Armazena localmente num banco vetorial

// Quando você pergunta ou edita:
4. Sua query vira embedding
5. Busca top-K chunks por cosine similarity
6. Injeta no prompt do LLM`}</CodeBlock>
        <p>
          Isso explica por que o Cursor frequentemente acerta quando você diz "usa o mesmo padrão que a função X" — ele encontrou X semanticamente.
        </p>
        <p>
          Mas há trade-off. Comparação honesta entre estratégias de contexto:
        </p>
        <div className="flex flex-col gap-2 text-xs">
          {[
            { strat: 'Embeddings (Cursor/Copilot)', pros: 'Escala para repos enormes. Rápido.', cons: 'Semântica aproximada. Pode pegar chunk parecido mas não o que você queria. Perde nomes literais de símbolos.' },
            { strat: 'Grep explícito (Claude Code)', pros: 'Determinístico. Encontra o símbolo exato. Sem falsos positivos por "similaridade".', cons: 'Mais turnos. O modelo precisa saber o que buscar antes de buscar.' },
            { strat: 'Repo-map (Aider)', pros: 'Visão panorâmica. LLM vê a "skeleton" de todo o repo em poucos tokens.', cons: 'Não traz implementações. Só nomes de funções/classes e suas assinaturas.' },
          ].map(item => (
            <div key={item.strat} className="p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <p className="font-semibold mb-1" style={{ color: 'var(--ffv-orange)' }}>{item.strat}</p>
              <p style={{ color: 'var(--ffv-muted)' }}><span style={{ color: 'var(--ffv-green)' }}>✓ </span>{item.pros}</p>
              <p style={{ color: 'var(--ffv-muted)' }}><span style={{ color: 'var(--ffv-red)' }}>✗ </span>{item.cons}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Edit format: o detalhe que muda 20+ pontos em benchmark">
        <p>
          Essa é a evidência mais contraintuitiva de toda essa trilha. O <strong>Aider benchmark</strong> (Paul Gauthier, mantenedor do Aider) comparou o mesmo LLM pedindo para editar código em formatos diferentes:
        </p>
        <CodeBlock>{`// Mesmo modelo (GPT-4), mesma tarefa, edit format diferente:

Whole-file            → o LLM reescreve o arquivo inteiro
                        Alto custo de tokens, alto erro rate

Search/Replace blocks → "encontre esse bloco e troque por esse"
                        Formato que Cursor Cmd+K e Claude Code Edit usam
                        Melhor em muitos modelos

Unified diff          → formato git diff clássico
                        Modelos antigos erram muito o offset de linha

udiff-simple          → diff sem linha de contexto extra
                        Formato otimizado do Aider

// Swing medido entre o melhor e o pior formato
// para o MESMO modelo: 20+ pontos percentuais.`}</CodeBlock>
        <p>
          Por isso Cursor, Copilot, Cursor Agent e Claude Code investem tanto em escolher o formato certo por modelo. Não é cosmético — é a diferença entre o agente acertar 40% ou 65% das edições.
        </p>
        <Callout>
          A lição: quando escolher um scaffold, preste atenção ao formato de edição que ele usa para o modelo que você está rodando. Scaffolds model-agnostic têm que escolher um denominador comum — e quase sempre isso custa pontos em benchmark contra scaffolds otimizados pelo fornecedor do modelo (Claude Code para Claude, Codex para GPT).
        </Callout>
      </Section>

      <Section title="GitHub Copilot: da completions à ambição de agente">
        <p>
          O Copilot original (2021) era puramente autocomplete. Em 2024-2025, a Microsoft/GitHub expandiu agressivamente:
        </p>
        <div className="flex flex-col gap-2">
          {[
            { year: '2021', label: 'Copilot base', desc: 'Autocomplete inline. Modelo: Codex (GPT-3 fine-tuned em código público do GitHub).' },
            { year: '2023', label: 'Copilot Chat', desc: 'Chat integrado ao IDE. Pode fazer perguntas sobre o código, pedir refatorações, explicações.' },
            { year: '2024', label: 'Copilot Workspace', desc: 'Dado uma issue do GitHub, o Copilot planeja e implementa a solução. Gera um plano editável antes de executar.' },
            { year: '2025', label: 'Copilot Agent Mode', desc: 'Execução de tarefas multi-passo no IDE: lê arquivos, escreve, roda testes, itera. Suporta múltiplos modelos (GPT-4o, Claude, Gemini).' },
          ].map(item => (
            <div key={item.year} className="flex gap-3 p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <span className="text-xs font-mono font-bold flex-shrink-0 mt-0.5" style={{ color: 'var(--ffv-orange)' }}>{item.year}</span>
              <div>
                <p className="font-semibold text-xs mb-0.5">{item.label}</p>
                <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="O modelo do Copilot: não é fixo">
        <p>
          Uma mudança estratégica importante em 2024: o GitHub Copilot se tornou <strong>model-agnostic</strong>. Em vez de só o modelo da OpenAI, você pode escolher:
        </p>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {[
            { name: 'GPT-4o (OpenAI)', desc: 'Default. Rápido, multi-modal.' },
            { name: 'Claude 3.5/3.7 (Anthropic)', desc: 'Melhor para tarefas longas de código.' },
            { name: 'Gemini 1.5 (Google)', desc: 'Contexto muito longo (1M tokens).' },
            { name: 'o3-mini (OpenAI)', desc: 'Raciocínio mais lento, mais preciso.' },
          ].map(item => (
            <div key={item.name} className="p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <p className="font-semibold text-xs mb-1">{item.name}</p>
              <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <p>
          Isso transforma o Copilot em um <em>harness</em> agnóstico de modelo — o que importa é a integração com o GitHub (issues, PRs, código) e o IDE, não qual LLM roda por baixo.
        </p>
      </Section>

      <Section title="Copilot Enterprise: o diferencial corporativo">
        <p>
          Para times corporativos, o <strong>Copilot Enterprise</strong> oferece algo que as outras ferramentas não têm (ainda): a possibilidade de incluir bases de código privadas no índice.
        </p>
        <p>
          Em vez de só indexar o repositório atual, o Enterprise pode indexar toda a organização no GitHub — incluindo bibliotecas internas, padrões de código da empresa, APIs privadas. O modelo aprende o vocabulário específico do seu time.
        </p>
        <Callout>
          Isso é o que justifica o preço premium do Enterprise. Para times com muita propriedade intelectual em código próprio, um modelo que "conhece" a base de código histórica da empresa é significativamente mais útil que um modelo genérico.
        </Callout>
      </Section>

      <Section title="IDE-first vs terminal-first: a escolha filosófica">
        <p>
          Não há certo e errado — há diferentes fluxos de trabalho. A tabela honesta:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th className="text-left p-2 font-semibold" style={{ color: 'var(--ffv-muted)', borderBottom: '1px solid var(--ffv-border)' }}>Critério</th>
                <th className="text-left p-2 font-semibold" style={{ color: '#ffa657', borderBottom: '1px solid var(--ffv-border)' }}>IDE (Cursor/Copilot)</th>
                <th className="text-left p-2 font-semibold" style={{ color: '#58a6ff', borderBottom: '1px solid var(--ffv-border)' }}>Terminal (Claude Code)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Feedback visual', '✓ Diff inline, syntax highlight', '✗ Texto no terminal'],
                ['Acesso ao ambiente', 'Limitado pelo IDE', '✓ Acesso total ao sistema'],
                ['Curva de adoção', 'Menor — já é seu editor', 'Maior — novo paradigma'],
                ['Tarefas longas multi-repo', 'Limitado', '✓ Excelente'],
                ['Integração CI/CD', 'Via plugins', '✓ Nativo via bash'],
                ['Contexto do projeto', 'Semântico (embeddings)', 'Explícito (lê os arquivos)'],
              ].map((row, i) => (
                <tr key={i}>
                  <td className="p-2" style={{ color: 'var(--ffv-muted)', borderBottom: '1px solid var(--ffv-border)' }}>{row[0]}</td>
                  <td className="p-2" style={{ borderBottom: '1px solid var(--ffv-border)' }}>{row[1]}</td>
                  <td className="p-2" style={{ borderBottom: '1px solid var(--ffv-border)' }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Callout>
        No próximo módulo: <strong>Amazon Q e Kiro</strong> — a aposta da AWS no mercado de coding agents, com duas filosofias distintas dentro da mesma empresa.
      </Callout>
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

function ModeCard({ mode, shortcut, color, desc, when }: { mode: string; shortcut: string; color: string; desc: string; when: string }) {
  return (
    <div className="p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: `1px solid ${color}30` }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-xs">{mode}</span>
        <code className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: `${color}20`, color }}>{shortcut}</code>
      </div>
      <p className="text-xs mb-1" style={{ color: 'var(--ffv-muted)' }}>{desc}</p>
      <p className="text-xs" style={{ color }}><span style={{ color: 'var(--ffv-muted)' }}>Quando: </span>{when}</p>
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
