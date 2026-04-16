import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';

export const metadata: Metadata = {
  title: 'OpenAI Codex: o Agente na Nuvem — FFV Academy',
  description: 'Codex (codex-1, GPT-5.1-Codex-Max), cloud sandbox, e a pergunta real: o harness precisa interpretar tool calls de vários formatos — isso degrada performance? Resposta com evidência.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Onde o código realmente roda quando você usa o OpenAI Codex (produto 2025)?',
    options: [
      'Na sua máquina local, igual Claude Code',
      'Em um container efêmero na infraestrutura da OpenAI — seus arquivos são clonados para lá via integração GitHub',
      'Numa VM do GitHub Actions vinculada à sua conta',
      'Dentro do seu navegador usando WebAssembly',
    ],
    correct: 1,
    explanation: 'O Codex-na-nuvem cria um container isolado na infra da OpenAI, clona o repositório GitHub autorizado e executa ali. Isso tem consequências: você precisa de repo no GitHub, precisa aceitar que o código trafegue para a OpenAI, mas ganha paralelismo e zero consumo de CPU local.',
  },
  {
    question: 'É verdade que o harness do Codex "precisa interpretar todas as linguagens de tool call" e isso reduz a performance do modelo?',
    options: [
      'Sim — parsing de JSON e XML adiciona latência significativa ao loop',
      'Não exatamente. O parsing em si custa microssegundos e é desprezível perto do tempo de inferência. O que realmente mexe em benchmark é o desenho do scaffold (formato de edição, gestão de contexto, qtde de turnos permitidos)',
      'Sim, e por isso o Codex é sempre mais lento',
      'Não, harness não afeta em nada — só o modelo importa',
    ],
    correct: 1,
    explanation: 'O custo de parsing é microssegundos por tool call — nada perto dos segundos de inferência do LLM. Mas a escolha do formato (diff unificado vs search-replace vs whole-file) e a política de contexto têm impacto mensurável: o paper SWE-agent e dados públicos do Aider mostram swings de 20+ pontos em benchmark com o MESMO modelo só mudando o edit format.',
  },
  {
    question: 'No SWE-bench Verified (abril/2026) os modelos frontier estão separados por quantos pontos percentuais?',
    options: [
      'Mais de 20 pontos — a diferença de modelo é brutal',
      'Cerca de 10 pontos',
      'Menos de 1 ponto — seis modelos frontier (Claude Opus/Sonnet, GPT-5.1, Gemini) estão empatados dentro de ~0,8pt',
      'É impossível medir',
    ],
    correct: 2,
    explanation: 'Os dados públicos mostram seis modelos frontier dentro de ~0,8pt no SWE-bench Verified. Isso significa que a diferença prática hoje está MENOS no modelo e MAIS em como o harness organiza contexto, ferramentas e loop. Um scaffold ruim com Opus 4.5 pode perder para um scaffold bom com Sonnet 4.5.',
  },
];

export default function OpenAICodexCloudPage() {
  return (
    <ModuleLayout
      slug="openai-codex-cloud"
      title="OpenAI Codex: o Agente na Nuvem"
      icon="☁️"
      xp={65}
      readTime={10}
      trailName="Ferramentas de IA para Código"
      trailColor="#ffa657"
      nextSlug="cursor-copilot-ides"
      nextTitle="Cursor, Copilot e os IDEs Aumentados"
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
        Esse módulo responde de frente a pergunta técnica que todo mundo faz: <em>"o harness do Codex precisa abstrair várias linguagens de tool call — isso degrada performance?"</em>. A resposta curta: <strong>não do jeito que a intuição sugere</strong>. A resposta longa — com dados — é o que vem a seguir.
      </p>

      <Section title="Antes: dois produtos, o mesmo nome">
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid rgba(88,166,255,0.3)' }}>
            <p className="font-semibold text-xs mb-1" style={{ color: '#58a6ff' }}>Codex (2021) — modelo de completions</p>
            <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
              Fine-tune do GPT-3 em código público do GitHub. Base técnica do Copilot original (inline autocomplete). Depreciado em 2023.
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid rgba(255,166,87,0.3)' }}>
            <p className="font-semibold text-xs mb-1" style={{ color: '#ffa657' }}>Codex (2025/2026) — agente autônomo cloud</p>
            <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
              Produto novo: recebe uma tarefa, abre um container isolado na OpenAI, clona o repositório GitHub, executa e devolve um PR. Passou por três gerações de modelo: <strong>codex-1</strong> (RL fine-tune de o3 para tarefas longas, mai/2025), <strong>gpt-5-codex</strong> (set/2025, compute adaptativo por dificuldade) e <strong>GPT-5.1-Codex-Max</strong> (nov/2025, "compactação" nativa para sessões de 24h+ e contexto efetivo acima de 400k tokens).
            </p>
          </div>
        </div>
      </Section>

      <Section title="Arquitetura: cloud sandbox">
        <p>
          Esta é a diferença arquitetural central. Enquanto Claude Code opera na sua máquina, o Codex opera em um ambiente completamente remoto:
        </p>
        <CodeBlock>{`// Fluxo do OpenAI Codex

Você → "implementa autenticação OAuth no meu projeto"
        ↓
OpenAI recebe a tarefa
        ↓
Container isolado é criado nos servidores da OpenAI
        ↓
Seu repositório GitHub é clonado no container
        ↓
Agente executa: lê código, escreve, roda testes
        ↓
Resultado: Pull Request aberto no seu GitHub
        ↓
Você revisa o PR como faria com qualquer dev`}</CodeBlock>
        <p>
          O container tem acesso à internet, pode instalar dependências, rodar compiladores e executar testes — mas <strong>não tem acesso à sua máquina local</strong>. Seus arquivos locais, variáveis de ambiente locais, serviços rodando em localhost — nada disso está disponível.
        </p>
      </Section>

      <Section title="Assíncrono e paralelo: o grande diferencial">
        <p>
          Claude Code é síncrono: você manda uma tarefa e espera a resposta antes de enviar a próxima. O Codex é assíncrono:
        </p>
        <div className="flex flex-col gap-2">
          <div className="p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--ffv-orange)' }}>Exemplo de uso paralelo</p>
            <div className="flex flex-col gap-1 text-xs" style={{ color: 'var(--ffv-muted)' }}>
              <p>09:00 → você submete: <em>"adiciona testes para o módulo de pagamentos"</em></p>
              <p>09:01 → você submete: <em>"refatora a camada de cache para Redis"</em></p>
              <p>09:02 → você submete: <em>"corrige o bug #247 no parser de CSV"</em></p>
              <p className="mt-2">Três agentes trabalhando em paralelo. Você continua seu trabalho.</p>
              <p style={{ color: 'var(--ffv-green)' }}>09:18 → PR #1 aberto: "feat: add payment module tests"</p>
              <p style={{ color: 'var(--ffv-green)' }}>09:23 → PR #2 aberto: "refactor: migrate cache to Redis"</p>
              <p style={{ color: 'var(--ffv-green)' }}>09:31 → PR #3 aberto: "fix: CSV parser bug #247"</p>
            </div>
          </div>
        </div>
        <p>
          Para times, isso é poderoso. Múltiplos desenvolvedores podem submeter tarefas independentes sem concorrência de recursos locais.
        </p>
      </Section>

      <Section title="O modelo por baixo: codex-1 → GPT-5.1-Codex-Max">
        <p>
          A linhagem é importante porque cada versão mudou o que o harness precisa gerenciar:
        </p>
        <div className="flex flex-col gap-2 text-xs">
          {[
            { ver: 'codex-1', when: 'mai/2025', note: 'RL fine-tune de o3 orientado a tarefas reais de engenharia. Introduziu "reasoning tokens" que o modelo gasta antes de chamar ferramentas.' },
            { ver: 'gpt-5-codex', when: 'set/2025', note: 'Compute dinâmico: para requests triviais responde em segundos; para tarefas agentic roda por horas. Mesmo modelo, orçamento variável.' },
            { ver: 'GPT-5.1-Codex-Max', when: 'nov/2025', note: 'Tem compactação de contexto nativa — descarta e reescreve o histórico para operar em sessões longas sem estourar a janela. Dispensa parte do trabalho que antes era do harness.' },
          ].map(item => (
            <div key={item.ver} className="flex gap-3 p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <span className="font-mono font-bold flex-shrink-0" style={{ color: 'var(--ffv-orange)', minWidth: 150 }}>{item.ver}</span>
              <span style={{ color: 'var(--ffv-muted)' }}><span style={{ color: 'var(--foreground)' }}>{item.when}</span> — {item.note}</span>
            </div>
          ))}
        </div>
        <Callout>
          A consequência prática: "usar Codex" em 2026 não é usar um modelo, é usar uma <em>família</em> cujo comportamento depende de qual versão está roteada e de quanto compute o roteador decidir gastar. Benchmarks de "Codex" sem versão anotada são ruído.
        </Callout>
      </Section>

      <Section title="A pergunta que todo mundo faz: o harness mata performance?">
        <p>
          A intuição é razoável: se o harness precisa receber tool calls em JSON, validar, parsear, roteá-las, converter erros de volta para o modelo, traduzir entre formatos — tudo isso parece que deveria cobrar um preço. Mas os números não confirmam isso da forma que se imagina.
        </p>

        <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          <p className="font-semibold text-xs mb-3" style={{ color: 'var(--ffv-red)' }}>✗ O que NÃO é o gargalo</p>
          <div className="flex flex-col gap-2 text-xs" style={{ color: 'var(--ffv-muted)' }}>
            <p>→ <strong>Parsear JSON/XML de tool calls</strong>: ordem de microssegundos. O LLM levou ~1-30 segundos pra gerar aquela resposta. O parser é irrelevante no orçamento.</p>
            <p>→ <strong>Validar schema da ferramenta</strong>: microssegundos. Mesmo que você valide 50 chamadas por minuto, não chega perto do tempo de inferência.</p>
            <p>→ <strong>Dispatch para a função correta</strong>: lookup de hashmap. Imensuravelmente pequeno.</p>
          </div>
        </div>

        <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid rgba(63,185,80,0.3)' }}>
          <p className="font-semibold text-xs mb-3" style={{ color: 'var(--ffv-green)' }}>✓ O que REALMENTE mexe no benchmark</p>
          <div className="flex flex-col gap-2 text-xs" style={{ color: 'var(--ffv-muted)' }}>
            <p>→ <strong>Formato de edição</strong> (diff unificado vs search-replace vs whole-file vs udiff-simple): o mesmo LLM oscila 20+ pontos no benchmark Aider só mudando o formato. Não é o parse — é o modelo <em>saber escrever</em> o formato sem erros.</p>
            <p>→ <strong>Quantidade e descrição das ferramentas</strong>: cada ferramenta ocupa tokens no system prompt, compete por atenção. Harnesses com 8 ferramentas bem desenhadas ganham de harnesses com 40 ferramentas redundantes.</p>
            <p>→ <strong>Política de contexto</strong>: quando cortar histórico, quando compactar, o que preservar. Aí mora o que te faz ganhar ou perder uma tarefa multi-hora.</p>
            <p>→ <strong>Orçamento de turnos</strong>: SWE-agent mostrou que subir o limite de 50 para 250 turnos levou Claude Opus de 23% para 45%+ no SWE-bench — o modelo já sabia, só precisava de loop.</p>
            <p>→ <strong>Prompt caching</strong>: re-enviar os mesmos 30k tokens do system prompt sem cache custa latência e dinheiro. Harnesses que usam <code className="px-1 rounded" style={{ background: 'var(--ffv-bg3)' }}>cache_control</code> corretamente ganham 60-90% em p50/p95 time-to-first-token.</p>
          </div>
        </div>

        <p>
          Em outras palavras: <strong>a afirmação "o parser do harness derruba performance" é falsa</strong>. A afirmação correta é mais sutil — <em>o DESENHO do harness muda benchmark drasticamente, mas não via CPU, e sim via engenharia de prompt, gestão de contexto e protocolo de ferramentas</em>.
        </p>
      </Section>

      <Section title="A evidência concreta">
        <p>
          Três pontos de dado públicos para ancorar a discussão:
        </p>
        <CodeBlock>{`// 1. SWE-bench Pro (nov/2025):
//    Confucius Code Agent + Claude Sonnet 4.5 →  52,7%
//    Claude Opus 4.5 (scaffold nativo Anthropic) →  52,0%
// Modelo "menor" com scaffold dedicado bate modelo "maior"
// com scaffold genérico. O harness importa MAIS que o tamanho
// do modelo nesse regime.

// 2. Claude Opus 4.5 em diferentes scaffolds no SWE-bench:
//    SEAL Harness →       45,9%
//    Scaffold X   →       ~50%
//    Claude Code  →       55,4%
// Mesmo modelo. Spread de 9,5 pontos só trocando o harness.

// 3. SWE-bench Verified (abr/2026):
//    Seis modelos frontier (Opus 4.6, Sonnet 4.6, GPT-5.1,
//    Gemini 3 Pro, Haiku 4.5, codex-max) dentro de ~0,8pt.
// Hoje, diferenças de 20 pontos em benchmark "final" entre
// ferramentas vêm majoritariamente do scaffold, não do LLM.`}</CodeBlock>
        <Callout>
          Conclusão útil: quando alguém diz "ferramenta X é melhor que Y", pergunte <em>com qual modelo, em qual benchmark, com qual budget de turnos</em>. Sem isso, a comparação é marketing.
        </Callout>
      </Section>

      <Section title="Trade-offs reais: cloud vs local">
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
            <p className="font-semibold text-xs mb-3" style={{ color: 'var(--ffv-green)' }}>✓ Vantagens do Cloud Sandbox</p>
            <div className="flex flex-col gap-2 text-xs" style={{ color: 'var(--ffv-muted)' }}>
              <p>→ Não consome sua CPU/RAM local durante execução</p>
              <p>→ Ambiente limpo e reprodutível a cada tarefa (sem "na minha máquina funciona")</p>
              <p>→ Múltiplas tarefas em paralelo sem impactar seu trabalho atual</p>
              <p>→ Isolamento total — o agente não pode deletar seus arquivos locais acidentalmente</p>
            </div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
            <p className="font-semibold text-xs mb-3" style={{ color: 'var(--ffv-red)' }}>✗ Limitações do Cloud Sandbox</p>
            <div className="flex flex-col gap-2 text-xs" style={{ color: 'var(--ffv-muted)' }}>
              <p>→ Sem acesso a serviços locais (banco de dados local, APIs com segredos locais)</p>
              <p>→ Precisa de repositório no GitHub (não funciona com repos apenas locais)</p>
              <p>→ Latência maior para tarefas pequenas (overhead do container)</p>
              <p>→ Seus arquivos e código passam pelos servidores da OpenAI</p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Segurança e privacidade: o elefante na sala">
        <p>
          Esta é uma decisão que cada time precisa tomar conscientemente. Ao usar o Codex, o código do seu repositório é enviado para a OpenAI para ser processado no sandbox.
        </p>
        <p>
          A OpenAI afirma não treinar modelos com dados da API por padrão, e oferece contratos de processamento de dados (DPA) para clientes enterprise. Mas para código proprietário sensível ou projetos com compliance rigoroso (HIPAA, SOC2), avaliar isso é obrigatório.
        </p>
        <p>
          Claude Code tem um perfil de privacidade diferente: seus arquivos ficam na sua máquina. Só o texto dos prompts (o que você escreveu e o que o agente leu) trafega pela API da Anthropic.
        </p>
      </Section>

      <Section title="Então, Codex ou Claude Code?">
        <p>
          A pergunta correta não é "qual é melhor" e sim "qual é o problema". Critérios concretos:
        </p>
        <div className="flex flex-col gap-2 text-xs">
          {[
            { when: 'Seu repo está no GitHub e a tarefa é bem-definida (bug fix, adição de testes, pequena refatoração)', pick: 'Codex', note: 'Paralelismo. Você dispara 5 tarefas, continua trabalhando, revê PRs.' },
            { when: 'Você precisa de acesso a serviços locais (banco dev, docker compose com secrets, serviço interno sem exposição pública)', pick: 'Claude Code', note: 'Codex no sandbox não consegue falar com localhost:5432 da sua máquina.' },
            { when: 'Tarefa exploratória / debug difícil / código proprietário sob compliance (HIPAA, LGPD, dados regulados)', pick: 'Claude Code', note: 'Arquivos permanecem na sua máquina, só prompts vão pra API. Auditoria mais simples.' },
            { when: 'Time precisa desbloquear backlog — várias tasks triviais em paralelo enquanto devs trabalham em tarefas hard', pick: 'Codex', note: 'Modelo assíncrono foi desenhado pra isso. Cada PR é um review, não um shadowing.' },
            { when: 'Você está aprendendo a codebase ou precisa de controle fino sobre cada passo', pick: 'Claude Code', note: 'Você vê cada tool call, pode interromper, redirecionar. No Codex você só vê o PR final.' },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <p className="mb-1" style={{ color: 'var(--ffv-muted)' }}>{item.when}</p>
              <p><span className="font-semibold" style={{ color: 'var(--ffv-orange)' }}>→ {item.pick}</span> <span style={{ color: 'var(--ffv-muted)' }}>— {item.note}</span></p>
            </div>
          ))}
        </div>
      </Section>

      <Callout>
        No próximo módulo: <strong>Cursor e GitHub Copilot</strong> — a abordagem IDE-first. Se o modelo e o scaffold importam tanto, como embeddings e acesso a múltiplos modelos no Copilot mudam o jogo?
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
