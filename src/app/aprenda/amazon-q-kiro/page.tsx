import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';

export const metadata: Metadata = {
  title: 'Amazon Q e Kiro: a Aposta da AWS — FFV Academy',
  description: 'O Amazon Q Developer integra IA ao ecossistema AWS com foco enterprise. O Kiro propõe spec-driven development. Duas filosofias distintas da mesma empresa.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Se Claude Code pode receber contexto AWS via CLAUDE.md e WebFetch, qual é o diferencial real do Amazon Q Developer em projetos AWS?',
    options: [
      'O Q usa um modelo melhor',
      'O Q tem integração nativa de autenticação IAM + AWS SSO, roda dentro do AWS Console/CloudShell, tem pipeline OpenRewrite-based para Q Code Transformation (Java) e acesso privilegiado à documentação privada da AWS',
      'O Q é mais rápido porque roda na AWS',
      'Nenhum — são idênticos',
    ],
    correct: 1,
    explanation: 'O moat do Q não é o LLM (ele usa uma mistura de Anthropic Claude + Amazon Titan via Bedrock). São integrações que Claude Code não tem de fábrica: IAM/SSO sem token manual, execução nativa em CloudShell, e o Q Code Transformation que roda em um build farm usando OpenRewrite para migrações Java em lote — não é só prompt, é infra.',
  },
  {
    question: 'O que é o "spec-driven development" do Kiro?',
    options: [
      'Uma linguagem de programação da AWS',
      'Um workflow em três fases (spec.md → design.md → tasks.md) onde você escreve a especificação formal antes de implementar. O agente só executa tasks ligadas a um item da spec, o que dá rastreabilidade requisito → código',
      'Um sistema de documentação automática',
      'Uma forma de rodar testes automatizados',
    ],
    correct: 1,
    explanation: 'Kiro institucionaliza o loop: você descreve o "o quê" (spec), o agente propõe o "como" (design), quebra em tasks acionáveis, e só então executa. Hooks automatizam eventos (save, PR). Steering files guiam estilo. É plan-mode como produto, não como feature.',
  },
  {
    question: 'O Q Code Transformation (Java 8→17) não é possível em outras ferramentas. Por quê?',
    options: [
      'Porque o modelo do Q é mais capaz',
      'Porque não é só chamar LLM — o Q usa OpenRewrite (engine determinístico de transformação AST), roda em fleet de build farms da AWS que executam compilação + testes em paralelo, e usa LLM só para resolver ambiguidades. É infra + engine, não só modelo',
      'Porque só a AWS tem acesso à JVM',
      'Porque é proibido fora da AWS',
    ],
    correct: 1,
    explanation: 'Migração Java em larga escala não se faz com "peço pro LLM". O Q combina OpenRewrite (engine determinístico que aplica recipes AST-based sobre o código), um build farm que roda mvn/gradle para validar cada transformação, e o LLM como fallback para casos ambíguos. Essa infraestrutura é a razão do preço enterprise.',
  },
];

export default function AmazonQKiroPage() {
  return (
    <ModuleLayout
      slug="amazon-q-kiro"
      title="Amazon Q e Kiro: a Aposta da AWS"
      icon="☁️"
      xp={60}
      readTime={9}
      trailName="Ferramentas de IA para Código"
      trailColor="#ffa657"
      nextSlug="qual-coding-agent-usar"
      nextTitle="Qual Ferramenta Usar e Quando"
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
        A AWS lançou dois produtos distintos no mercado de coding agents — com filosofias quase opostas. O <strong>Amazon Q Developer</strong> é uma extensão de IDE voltada para o ecossistema AWS. O <strong>Kiro</strong> (2025) é uma aposta em uma forma diferente de pensar desenvolvimento de software.
      </p>

      <Section title="Amazon Q Developer: herdeiro do CodeWhisperer">
        <p>
          O Amazon Q Developer é a evolução do <strong>CodeWhisperer</strong>, o assistente de código da AWS lançado em 2022. A renomeação reflete uma expansão de escopo: de autocomplete para um assistente completo integrado ao ecossistema AWS.
        </p>
        <div className="flex flex-col gap-2">
          {[
            {
              label: 'CodeWhisperer (2022)',
              desc: 'Autocomplete focado em código AWS. Sabia quando você estava escrevendo código para Lambda ou S3 e sugeria completions mais precisos para esses contextos.',
              color: 'var(--ffv-muted)',
            },
            {
              label: 'Amazon Q Developer (2023–2025)',
              desc: 'Chat, geração de código, análise de segurança (scan por vulnerabilidades), revisão de IAM policies, e o recurso flagship: transformação de código legado.',
              color: 'var(--ffv-orange)',
            },
          ].map(item => (
            <div key={item.label} className="p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <p className="font-semibold text-xs mb-1" style={{ color: item.color }}>{item.label}</p>
              <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="A pergunta honesta: e se eu passar contexto AWS pro meu Claude Code?">
        <p>
          Essa é a pergunta certa. Claude Code com CLAUDE.md bem montado, acesso à AWS CLI na máquina, e WebFetch da documentação AWS — ele não ficaria tão bom quanto o Q? Para a maioria das tarefas de código, <strong>sim, fica competitivo</strong>. O moat do Q não está no LLM. Está em quatro camadas que Claude Code não replica facilmente:
        </p>
        <div className="flex flex-col gap-2">
          {[
            { layer: '1. Modelo híbrido via Bedrock', note: 'Q não tem modelo único. Usa uma mistura de Anthropic Claude (tarefas complexas) + Amazon Titan (inline completion latency-crítica) roteada conforme o contexto. Isso é invisível ao usuário mas reduz custo/latência.' },
            { layer: '2. Integração nativa de identidade', note: 'IAM + AWS SSO direto. Sem token manual, sem configurar credenciais. Em AWS Console e CloudShell o Q já sabe quem você é, o que pode, em qual conta.' },
            { layer: '3. Documentação privada indexada', note: 'AWS tem documentação técnica interna (runbooks, limites não publicados, playbooks de incidente) que só o Q acessa. Claude Code só vê o que está publicado.' },
            { layer: '4. Q Code Transformation: build farm determinístico', note: 'O flagship. Migrações Java 8→17, .NET Framework→.NET 8, rodam em fleet AWS com OpenRewrite (engine AST-based) + compilação real + testes. LLM é fallback, não protagonista. Impossível replicar em CLI local.' },
          ].map(item => (
            <div key={item.layer} className="p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <p className="font-semibold text-xs mb-1" style={{ color: 'var(--ffv-orange)' }}>{item.layer}</p>
              <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>{item.note}</p>
            </div>
          ))}
        </div>
        <Callout>
          Resumo brutal: para <em>escrever código que usa AWS</em>, Claude Code com bom contexto empata. Para <em>operar dentro do ecossistema AWS</em> (IAM, SSO, Console, migrações Java em lote, compliance com FedRAMP/GovCloud) — o Q tem uma infraestrutura que você não consegue replicar só com prompt.
        </Callout>
      </Section>

      <Section title="Q Code Transformation: por dentro do killer feature">
        <p>
          O recurso mais diferenciado do Q Developer não é autocomplete — é a <strong>transformação de código legado</strong> em larga escala. E o detalhe técnico que pouca gente sabe: <em>o LLM não é o protagonista</em>.
        </p>
        <CodeBlock>{`// Q Code Transformation: arquitetura real

1. Upload do projeto Java 8/11 para o build farm Q
   (roda em fleet EC2 dedicada, não no seu IDE)

2. OpenRewrite analisa o projeto
   OpenRewrite = engine open-source (Moderne, 2018)
   que aplica "recipes" determinísticas sobre a AST
   Ex: "substituir java.util.Date por LocalDate"
       é uma recipe que edita a AST de forma segura

3. Aplica recipes padronizadas
   - Upgrade de pom.xml / build.gradle
   - Migração de APIs depreciadas
   - Atualização de imports
   - Refactor de padrões Java 8 → 17 idioms

4. BUILD + TEST em cada fase
   O farm roda \`mvn verify\` / \`gradle build\`
   Se falhar, reverte e tenta abordagem alternativa
   Testes de regressão como gate

5. LLM entra APENAS para casos ambíguos
   "Esta API não tem substituição direta, qual
    o pattern idiomático aqui?" → LLM sugere,
    OpenRewrite valida AST, build farm testa.

6. PR final com diff + relatório de conversão`}</CodeBlock>
        <p>
          Por que isso não dá pra replicar no Claude Code? Não é só prompt — é:
        </p>
        <div className="flex flex-col gap-1 text-xs" style={{ color: 'var(--ffv-muted)' }}>
          <p>→ <strong>OpenRewrite integrado</strong>: engine de transformação AST-based, não text-based. Muda milhares de arquivos com garantia de correção sintática.</p>
          <p>→ <strong>Build farm</strong>: compilação + testes paralelos em escala. Seu laptop não roda 10 builds Java 17 simultâneos para validar opções.</p>
          <p>→ <strong>Recipes AWS-específicas</strong>: padrões de migração que a AWS viu em milhares de customers (ex: SDK v1 → v2), empacotados como recipes reutilizáveis.</p>
          <p>→ <strong>Compliance</strong>: roda em GovCloud para clientes federais. Claude Code não tem certificação FedRAMP High.</p>
        </div>
      </Section>

      <Section title="Kiro: uma filosofia diferente de desenvolvimento">
        <p>
          Lançado em 2025, o Kiro não é uma evolução do Q Developer. É uma aposta em uma abordagem diferente: <strong>spec-driven development</strong>.
        </p>
        <p>
          A premissa: a maioria dos problemas com IA gerando código não é o modelo ser ruim — é o <em>prompt sendo vago</em>. "Implementa sistema de autenticação" pode ser interpretado de 50 formas diferentes. O Kiro força você a ser explícito antes de executar.
        </p>
        <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid rgba(255,166,87,0.3)' }}>
          <p className="font-semibold text-xs mb-3" style={{ color: 'var(--ffv-orange)' }}>FLUXO DO KIRO</p>
          <div className="flex flex-col gap-3">
            {[
              { step: '1', title: 'Spec', desc: 'Você descreve o que quer implementar em um arquivo .md estruturado: requisitos funcionais, critérios de aceitação, casos de uso, edge cases.' },
              { step: '2', title: 'Design', desc: 'O Kiro transforma a spec em um design técnico: quais arquivos criar, quais interfaces definir, quais dependências adicionar.' },
              { step: '3', title: 'Tasks', desc: 'O design vira uma lista de tarefas ordenadas. Você pode revisar, reordenar ou remover tasks antes de executar.' },
              { step: '4', title: 'Implementation', desc: 'O agente executa as tasks em ordem. Você acompanha o progresso e pode intervir em qualquer ponto.' },
            ].map(item => (
              <div key={item.step} className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(255,166,87,0.15)', color: 'var(--ffv-orange)' }}>{item.step}</span>
                <div>
                  <p className="font-semibold text-xs mb-0.5">{item.title}</p>
                  <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Hooks: automação no ciclo de desenvolvimento">
        <p>
          Um recurso técnico interessante do Kiro são os <strong>hooks</strong>: scripts que executam automaticamente em resposta a eventos do ciclo de desenvolvimento.
        </p>
        <CodeBlock>{`# Exemplo de hook no Kiro

# Quando um arquivo TypeScript é salvo:
on: file.save
match: "**/*.ts"
run: |
  - Verifica se os testes relacionados passam
  - Atualiza a documentação inline automaticamente
  - Checa se a spec original foi respeitada

# Quando um PR é criado:
on: pr.create
run: |
  - Gera changelog baseado nos commits
  - Verifica se todas as tasks da spec foram cumpridas
  - Cria draft de description do PR`}</CodeBlock>
        <p>
          A ideia é reduzir o overhead de manutenção de documentação e verificação de qualidade — tarefas que os desenvolvedores sabem que deveriam fazer mas frequentemente pulam sob pressão.
        </p>
      </Section>

      <Section title="Q Developer vs Kiro: quando usar cada um">
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid rgba(255,166,87,0.3)' }}>
            <p className="font-semibold text-xs mb-2" style={{ color: 'var(--ffv-orange)' }}>Use Amazon Q Developer quando:</p>
            <div className="flex flex-col gap-1 text-xs" style={{ color: 'var(--ffv-muted)' }}>
              <p>→ Você trabalha primariamente com serviços AWS</p>
              <p>→ Tem código legado Java para modernizar</p>
              <p>→ Precisa de scan de segurança integrado no workflow</p>
              <p>→ Já usa o ecossistema da AWS e quer integração nativa</p>
            </div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid rgba(210,168,255,0.3)' }}>
            <p className="font-semibold text-xs mb-2" style={{ color: 'var(--ffv-purple)' }}>Use Kiro quando:</p>
            <div className="flex flex-col gap-1 text-xs" style={{ color: 'var(--ffv-muted)' }}>
              <p>→ Você quer rastreabilidade entre requisitos e código gerado</p>
              <p>→ Time com diferentes níveis de experiência (spec nivelar o entendimento)</p>
              <p>→ Projetos onde "vibe coding" causou problemas no passado</p>
              <p>→ Você prefere planejar antes de executar</p>
            </div>
          </div>
        </div>
      </Section>

      <Callout>
        No próximo módulo: <strong>Qual Ferramenta Usar e Quando</strong> — uma matriz de decisão honesta comparando todas as ferramentas que estudamos.
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
