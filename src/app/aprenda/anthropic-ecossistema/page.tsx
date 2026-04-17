import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#cc785c';

export const metadata: Metadata = {
  title: 'O ecossistema Anthropic: Claude, modelos, produtos e roadmap — FFV Academy',
  description: 'Claude 3, 3.5, 4 — o que diferencia Haiku, Sonnet e Opus. API, Claude.ai, Claude Code, MCP: o mapa completo do que a Anthropic oferece e quando usar cada produto.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a principal diferença entre Claude Haiku e Claude Opus dentro de uma mesma família de modelos?',
    options: [
      'Haiku é mais recente — Opus é o modelo legado mantido por compatibilidade',
      'Haiku tem janela de contexto maior — Opus tem janela menor mas respostas mais criativas',
      'Haiku é otimizado para velocidade e custo baixo (tarefas simples, alto volume). Opus é o modelo mais capaz da família, indicado para raciocínio complexo, análise profunda e tarefas que exigem nuance — com custo proporcionalmente maior. Sonnet equilibra capacidade e custo.',
      'A diferença é apenas de marketing — internamente os três modelos têm a mesma arquitetura e pesos',
    ],
    correct: 2,
    explanation: 'A família Claude segue uma hierarquia de capacidade × custo: Haiku (rápido, barato, alto volume), Sonnet (equilíbrio capacidade/custo, uso geral), Opus (máxima capacidade, custo premium). A escolha certa depende do caso de uso: moderação de conteúdo em escala → Haiku; sumarização e código → Sonnet; análise jurídica complexa ou raciocínio multi-etapa → Opus.',
  },
  {
    question: 'O que é o Model Context Protocol (MCP) e qual problema ele resolve?',
    options: [
      'MCP é o protocolo interno de comunicação entre os servidores da Anthropic e os datacenters — sem relevância para desenvolvedores',
      'MCP é um padrão aberto que permite que Claude acesse ferramentas e fontes de dados externas (arquivos, bancos de dados, APIs) de forma padronizada. Resolve o problema de cada integração exigir código customizado: qualquer MCP server fala a mesma língua com qualquer cliente MCP.',
      'MCP é um mecanismo de compressão de contexto que reduz o custo de janelas de contexto longas em 60%',
      'MCP é exclusivo do Claude Code — outros clientes como Claude.ai não suportam o protocolo',
    ],
    correct: 1,
    explanation: 'MCP (Model Context Protocol) é um padrão aberto proposto pela Anthropic. Um servidor MCP expõe ferramentas (funções que o LLM pode chamar) e recursos (dados que o LLM pode ler) via JSON-RPC sobre stdio, SSE ou HTTP. Qualquer cliente compatível — Claude Code, IDE plugins, aplicações customizadas — pode usar qualquer servidor MCP sem integração bespoke. Isso cria um ecossistema: um servidor MCP para PostgreSQL funciona com Claude Code, com Cursor, com qualquer agente que implemente o protocolo.',
  },
  {
    question: 'Quando faz sentido usar a API da Anthropic diretamente em vez do Claude Code CLI?',
    options: [
      'Nunca — Claude Code é a forma recomendada para todos os casos de uso, inclusive produção',
      'Apenas quando a internet está lenta — Claude Code usa mais banda que a API direta',
      'A API é a escolha certa quando você precisa integrar Claude em sua própria aplicação: backend que chama Claude para sumarizar documentos, pipeline de dados, sistema de suporte que usa Claude, etc. Claude Code é uma ferramenta de desenvolvimento interativo — não é um SDK para produção.',
      'A API só faz sentido para empresas grandes — para uso individual o Claude Code é suficiente para qualquer caso',
    ],
    correct: 2,
    explanation: 'Claude Code é uma ferramenta interativa para desenvolvimento — você conversa com ele, pede para editar arquivos, rodar comandos. A API Messages é para quando você quer que Claude seja um componente dentro da sua aplicação: uma rota que recebe um documento e devolve um resumo, um agente que processa tickets de suporte, um pipeline que analisa código. A API oferece streaming, batch, tool use, vision, prompt caching — todos os primitivos para construir sistemas AI-native.',
  },
];

export default function AnthropicEcossistemaPage() {
  return (
    <ModuleLayout
      slug="anthropic-ecossistema"
      title="O ecossistema Anthropic: Claude, modelos, produtos e roadmap"
      icon="⊕"
      xp={40}
      readTime={8}
      trailName="Claude & Anthropic na Prática"
      trailColor="#cc785c"
      nextSlug="claude-code-primeiros-passos"
      nextTitle="Claude Code: instalação, autenticação e primeiro uso real"
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
        A Anthropic lançou Claude em 2023 com uma premissa distinta: safety-first desde a arquitetura, não como feature adicionada depois. Dois anos depois, o ecossistema cresceu de um modelo de API para uma plataforma completa — Claude.ai, Claude Code, MCP, APIs de batch e vision. Entender o mapa antes de usar qualquer produto específico evita usar a ferramenta errada para o trabalho certo.
      </p>

      <Section accent={accent} title="A família de modelos: Haiku, Sonnet e Opus">
        <p>Todo release da Anthropic traz uma família com três variantes, que seguem o mesmo padrão de nomes:</p>
        <ComparisonTable
          headers={['Modelo', 'Perfil', 'Casos de uso ideais', 'Custo relativo']}
          rows={[
            ['Haiku', 'Rápido, barato', 'Moderação, classificação, respostas curtas, alto volume', '$'],
            ['Sonnet', 'Equilíbrio', 'Código, sumarização, análise, uso geral', '$$'],
            ['Opus', 'Máxima capacidade', 'Raciocínio complexo, análise profunda, tarefas com nuance', '$$$$'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Famílias disponíveis (abril 2026):
# Claude 3    → claude-3-haiku-20240307, claude-3-sonnet-20240229, claude-3-opus-20240229
# Claude 3.5  → claude-3-5-haiku-20241022, claude-3-5-sonnet-20241022
# Claude 4    → claude-haiku-4-5, claude-sonnet-4-5, claude-opus-4-5
# (Claude 4.6) → claude-opus-4-6 (última versão, maior capacidade disponível hoje)

# Regra geral para escolha:
# - Validação, triagem, formatação → Haiku (volume alto, custo baixo)
# - Código, análise, sumarização → Sonnet (equilíbrio real)
# - Planejamento multi-etapa, raciocínio longo → Opus
# - Desenvolvimento interativo → Claude Code (qualquer modelo configurável)`}</CodeBlock>
        <p>A Anthropic mantém versões datadas dos modelos (ex: <code>claude-3-5-sonnet-20241022</code>) para garantir comportamento estável em produção. Aliases genéricos como <code>claude-sonnet-4-5</code> sempre apontam para o mais recente da família — útil para experimentação, mas perigoso em sistemas que dependem de saída determinística.</p>
      </Section>

      <Section accent={accent} title="Os produtos: onde Claude vive">
        <ComparisonTable
          headers={['Produto', 'O que é', 'Para quem', 'Acesso']}
          rows={[
            ['Claude.ai', 'Interface web conversacional', 'Usuário final, profissionais, equipes (Claude for Work)', 'Plano gratuito e Pro'],
            ['API Messages', 'HTTP REST para integrar Claude em qualquer aplicação', 'Desenvolvedores, equipes de engenharia', 'Chave de API, pay-as-you-go'],
            ['Claude Code', 'CLI interativo para desenvolvimento de software', 'Engenheiros de software, devs', 'Conta Anthropic ou API key'],
            ['Claude for Work', 'Claude.ai com controle organizacional (SSO, projects, admin)', 'Empresas, times', 'Plano Team/Enterprise'],
            ['Anthropic Console', 'Dashboard para gerenciar API keys, ver uso, testar prompts', 'Desenvolvedores', 'Grátis com conta'],
          ]}
          accent={accent}
        />
        <p style={{ marginTop: '0.75rem' }}>A distinção entre <strong>Claude.ai</strong> e <strong>API</strong> é fundamental: Claude.ai é uma aplicação pronta para humanos usarem; a API é um primitivo para <em>você construir</em> aplicações. Claude Code está no meio — é uma aplicação mas voltada para desenvolvedores no terminal, com acesso direto ao sistema de arquivos e ao shell.</p>
      </Section>

      <Section accent={accent} title="MCP: o protocolo que conecta tudo">
        <CodeBlock>{`# Model Context Protocol (MCP) — arquitetura simplificada

# Um servidor MCP expõe:
# 1. Tools (funções que Claude pode chamar)
# 2. Resources (dados que Claude pode ler)
# 3. Prompts (templates reutilizáveis)

# Exemplo: servidor MCP para PostgreSQL
# Claude pode chamar: query_database, list_tables, describe_schema

# Configuração em ~/.claude.json (ou settings do Claude Code):
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": { "DATABASE_URL": "postgresql://localhost/mydb" }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "ghp_..." }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/docs"]
    }
  }
}

# Com isso configurado, Claude pode:
# - Fazer queries no banco ("liste os usuários ativos desta semana")
# - Ler issues do GitHub ("qual o status do PR #42")
# - Acessar arquivos da pasta docs/ sem precisar copiar o conteúdo`}</CodeBlock>
        <p>MCP resolve o problema de <strong>N×M integrações</strong>: sem ele, cada agente precisaria de código customizado para cada serviço. Com MCP, qualquer cliente que implemente o protocolo funciona com qualquer servidor — a Anthropic abriu o protocolo e o ecossistema de servidores cresce independentemente.</p>
      </Section>

      <Section accent={accent} title="Constitutional AI e o porquê do foco em segurança">
        <CodeBlock>{`# Constitutional AI (CAI) — o diferencial técnico da Anthropic

# Problema: RLHF puro treina o modelo para agradar humanos
# (que podem preferir respostas antiéticas se soarem confiantes)

# CAI adiciona uma "constituição" — conjunto de princípios:
# - "Seja honesto e não engane o usuário"
# - "Evite conteúdo prejudicial"
# - "Prefira resposta útil mesmo que contraditória com o prompt"

# Durante o treinamento:
# 1. Modelo gera resposta
# 2. Modelo avalia a própria resposta contra os princípios
# 3. Revisa se necessário
# 4. O revisor é treinado com feedback humano (mas sobre princípios, não preferência)

# Na prática para o desenvolvedor:
# - Claude recusa pedidos prejudiciais mas explica POR QUE
# - Claude sinaliza quando não tem certeza (menor taxa de alucinação confiante)
# - Claude não "jailbreaks" facilmente — os princípios são internalizados, não regras superficiais
# - Anthropic publica System Cards e Responsible Scaling Policy (RSP) com commitments públicos`}</CodeBlock>
        <p>Isso não é apenas marketing. Constitutional AI muda o comportamento do modelo de forma mensurável: Claude tende a ser mais honesto sobre limitações e menos propenso a afirmar com confiança coisas incorretas. Para aplicações em produção, isso importa — você quer um modelo que diz "não sei" quando não sabe, não um que inventa uma resposta plausível.</p>
      </Section>

      <Section accent={accent} title="Preços e janela de contexto: o que muda na prática">
        <ComparisonTable
          headers={['Modelo', 'Input (por M tokens)', 'Output (por M tokens)', 'Contexto máximo', 'Cache 5min']}
          rows={[
            ['claude-haiku-4-5', '~$0.80', '~$4', '200k tokens', 'Sim'],
            ['claude-sonnet-4-5', '~$3', '~$15', '200k tokens', 'Sim'],
            ['claude-opus-4-6', '~$15', '~$75', '200k tokens', 'Sim'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# O que 200k tokens significa na prática?
# 1 token ≈ 0.75 palavras (inglês) / 0.5 palavras (português)
# 200.000 tokens ≈ 150.000 palavras ≈ ~500 páginas de livro

# Custo de um request típico (Sonnet):
# - System prompt: 500 tokens = $0,0015
# - User message + histórico: 2000 tokens = $0,006
# - Resposta gerada: 800 tokens = $0,012
# Total: ~$0,02 por interação (com Sonnet)

# Prompt caching: se seu system prompt é igual em múltiplos requests,
# Anthropic cobra apenas 10% do input cost nos requests subsequentes
# Para APIs com system prompt fixo e alto volume: economia de 80-90% no input

# Batch API: até 50% de desconto para requests não urgentes
# (processa em até 24h — ideal para análise offline de grandes volumes)`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Mapa de decisão:</strong> Claude.ai para uso pessoal e conversacional. API para integrar Claude na sua aplicação. Claude Code para desenvolvimento interativo no terminal. MCP para conectar Claude a ferramentas externas sem código bespoke. Use Haiku para volume, Sonnet para uso geral, Opus para tarefas que exigem máxima capacidade de raciocínio.
      </Callout>

      <Callout>
        Próximo: <strong>Claude Code na prática</strong> — instalação, autenticação e os primeiros comandos que mudam como você trabalha.
      </Callout>
    </div>
  );
}
