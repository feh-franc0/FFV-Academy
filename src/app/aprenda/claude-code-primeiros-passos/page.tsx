import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#cc785c';

export const metadata: Metadata = {
  title: 'Claude Code: instalação, autenticação e primeiro uso real — FFV Academy',
  description: 'Como instalar o Claude Code, autenticar com sua conta Anthropic, os primeiros comandos no terminal e como Claude Code difere de outros assistentes de IA.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença fundamental entre Claude Code e um plugin de IDE como GitHub Copilot?',
    options: [
      'Não há diferença prática — ambos sugerem código baseado no contexto aberto no editor',
      'Claude Code é mais barato — Copilot tem custo mensal fixo enquanto Claude Code é gratuito',
      'Claude Code é um agente autônomo com acesso ao sistema de arquivos, shell e ferramentas. Ele executa ações (edita, cria, deleta arquivos, roda comandos, instala pacotes). Copilot é um completador inline — sugere código dentro do editor mas não age de forma autônoma.',
      'A diferença é apenas de interface — Copilot funciona no editor, Claude Code no terminal, mas ambos apenas sugerem texto',
    ],
    correct: 2,
    explanation: 'A distinção agente vs completador é fundamental. Copilot, Tabnine e similares são "autocomplete com IA" — sugerem o próximo trecho de código enquanto você digita. Claude Code é um agente: você descreve o problema, ele lê os arquivos relevantes, escreve a implementação, roda os testes, corrige os erros, faz commit. A diferença de produtividade é qualitativa, não só de conveniência.',
  },
  {
    question: 'Você quer usar Claude Code em um servidor CI sem interface interativa. Como fazer isso corretamente?',
    options: [
      'Claude Code não suporta uso em CI — é exclusivamente interativo',
      'Basta rodar `claude` normalmente — o Claude Code detecta automaticamente se está em um ambiente CI e muda o comportamento',
      'Use a flag `--print` (modo não-interativo): `claude --print "describe a tarefa"`. Isso desabilita o TUI, processa o prompt e escreve o resultado em stdout — ideal para scripts e pipelines de CI.',
      'Em CI, use a API da Anthropic diretamente via curl — o CLI não é adequado para automação',
    ],
    correct: 2,
    explanation: 'Claude Code tem um modo não-interativo (`--print` ou `-p`) que desabilita a interface interativa e escreve o resultado em stdout. Também é possível passar input via stdin (`cat prompt.txt | claude -p -`). Esse modo é a ponte entre Claude Code e automação: você pode integrar Claude como uma etapa no seu pipeline de CI/CD, rodar análises automatizadas ou usar em scripts de shell.',
  },
  {
    question: 'O que acontece quando você executa `claude` em um diretório que tem um arquivo CLAUDE.md?',
    options: [
      'Claude Code ignora o CLAUDE.md — ele só é lido se você passar o caminho explicitamente com --context',
      'O CLAUDE.md é lido e injetado automaticamente como contexto de sistema antes de qualquer conversa. Claude Code também procura CLAUDE.md em diretórios pais e em ~/.claude/CLAUDE.md para contexto global.',
      'O CLAUDE.md substitui o system prompt padrão do Claude Code — Claude age exatamente como o arquivo instrui, sem comportamentos padrão',
      'CLAUDE.md funciona apenas na Anthropic Console — no CLI ele é tratado como arquivo comum de markdown',
    ],
    correct: 1,
    explanation: 'Claude Code tem uma hierarquia de carregamento de CLAUDE.md: primeiro lê ~/.claude/CLAUDE.md (instruções globais — o que você quer em TODOS os projetos), depois sobe a árvore de diretórios procurando CLAUDE.md, e finalmente lê o do diretório atual. Todos são concatenados e injetados como contexto de sistema. Isso permite ter convenções globais (idioma, formato de commit) e convenções específicas do projeto (stack, comandos de deploy, arquitetura).',
  },
];

export default function ClaudeCodePrimeirosPassosPage() {
  return (
    <ModuleLayout
      slug="claude-code-primeiros-passos"
      title="Claude Code: instalação, autenticação e primeiro uso real"
      icon="🖥️"
      xp={50}
      readTime={10}
      trailName="Claude & Anthropic na Prática"
      trailColor="#cc785c"
      nextSlug="claude-code-modos-de-uso"
      nextTitle="Modos de uso: interativo, não-interativo, pipe e headless"
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
        Claude Code é um agente de software que roda no seu terminal e tem acesso real ao sistema de arquivos, ao shell e a ferramentas externas via MCP. Ele não apenas sugere código — ele lê seus arquivos, escreve implementações, roda testes, corrige erros e faz commit. Entender como instalar, autenticar e os primeiros comandos é a base para o que vem depois.
      </p>

      <Section accent={accent} title="Instalação e autenticação">
        <CodeBlock>{`# Pré-requisito: Node.js 18+ instalado
node --version   # deve ser >= 18

# Instalar Claude Code globalmente
npm install -g @anthropic-ai/claude-code

# Verificar instalação
claude --version

# Autenticação — duas opções:

# Opção 1: via conta Claude.ai (Pro ou Team) — recomendado para início
claude
# Abre um fluxo OAuth no browser — autoriza e volta ao terminal

# Opção 2: via API key da Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
claude  # usa a key automaticamente
# Ou coloque no ~/.bashrc / ~/.zshrc para persistir

# Verificar que está autenticado:
claude --version   # exibe modelo em uso e créditos disponíveis

# Configuração inicial (opcional mas recomendado):
claude config set preferredModel claude-sonnet-4-5   # define modelo padrão
claude config set theme dark                          # tema do terminal`}</CodeBlock>
        <p>A autenticação via conta Claude.ai é a mais simples para começar — ela usa os mesmos créditos do seu plano. Para uso em produção ou CI/CD, a API key é o caminho correto: você controla os gastos separadamente e pode criar keys com permissões restritas no Anthropic Console.</p>
      </Section>

      <Section accent={accent} title="Claude Code vs outras ferramentas: entendendo o que é">
        <ComparisonTable
          headers={['Ferramenta', 'Tipo', 'Acesso ao sistema', 'Autonomia', 'Melhor para']}
          rows={[
            ['GitHub Copilot', 'Completador inline', 'Apenas arquivo aberto', 'Zero — apenas sugere', 'Autocompletar dentro do editor'],
            ['ChatGPT/Claude.ai web', 'Chat conversacional', 'Nenhum (só upload manual)', 'Zero — só texto', 'Perguntas, explicações, rascunhos'],
            ['Cursor', 'IDE aumentado', 'Projeto via editor', 'Baixa — edições no editor', 'Codificação assistida em IDE'],
            ['Claude Code', 'Agente autônomo', 'Sistema de arquivos + shell', 'Alta — executa ações reais', 'Implementação, refactoring, debug end-to-end'],
          ]}
          accent={accent}
        />
        <p style={{ marginTop: '0.75rem' }}>A distinção chave: Claude Code é um <strong>agente</strong> que age, não um assistente que sugere. Quando você pede "implemente a autenticação JWT neste projeto", ele lê os arquivos existentes, escreve o código novo, atualiza os imports, roda os testes e reporta o resultado. Não é magia — é acesso real ao ambiente.</p>
      </Section>

      <Section accent={accent} title="Primeiros comandos: como Claude Code funciona na prática">
        <CodeBlock>{`# Modo interativo padrão — uma sessão de conversa
cd meu-projeto
claude

# Interface interativa abre. Você digita, Claude responde e age.
# Exemplos de prompts que funcionam bem:

# "O que esse projeto faz? Me explique a arquitetura"
# → Claude lê os arquivos principais e descreve o projeto

# "Tem algum bug óbvio no arquivo src/auth.ts?"
# → Claude lê o arquivo e analisa

# "Adicione rate limiting na rota POST /api/login"
# → Claude edita o arquivo, possivelmente instala dependências, roda testes

# "Faça commit com uma mensagem descritiva"
# → Claude executa git add + git commit com mensagem gerada

# Comandos especiais dentro da sessão interativa:
# /help                → lista comandos disponíveis
# /clear               → limpa o histórico da sessão
# /compact             → compacta o contexto (economiza tokens em sessões longas)
# /cost                → exibe custo da sessão atual
# /model claude-opus-4-6  → troca o modelo na sessão
# Ctrl+C               → cancela a ação atual sem encerrar
# /exit ou Ctrl+D      → encerra a sessão`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Como Claude Code acessa seu código: as ferramentas">
        <CodeBlock>{`# Claude Code tem um conjunto de ferramentas nativas que usa internamente:

# Leitura de arquivos
# → Glob (encontrar arquivos por padrão: "src/**/*.ts")
# → Read (ler conteúdo de um arquivo específico)
# → Grep (buscar string ou regex em arquivos)

# Escrita e edição
# → Edit (fazer substituição exata em arquivo existente)
# → Write (criar novo arquivo ou reescrever existente)

# Execução de comandos
# → Bash (rodar qualquer comando shell com confirmação do usuário)

# Quando Claude usa cada uma:
# - Você pede "o que tem na pasta src/" → Glob
# - Você pede "explique o arquivo main.py" → Read
# - Você pede "onde usamos a função parseToken?" → Grep
# - Você pede "corrija o bug na linha 42" → Edit (cirúrgico)
# - Você pede "crie um novo módulo de autenticação" → Write
# - Você pede "rode os testes e me diga se passam" → Bash

# IMPORTANTE: Bash pede confirmação por padrão
# Claude mostra o comando antes de rodar:
# "Posso executar: npm test -- --coverage"
# Você aprova (Enter) ou recusa (Ctrl+C)

# Você pode ver o que Claude está fazendo em tempo real —
# cada ação de ferramenta é exibida antes de ser executada`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Dicas de uso que mudam a produtividade">
        <CodeBlock>{`# 1. Contexto importa: rode claude do diretório raiz do projeto
cd ~/projetos/minha-api
claude   # Claude enxerga todo o projeto

# 2. Seja específico no que quer, vago no como
# ❌ "edite o arquivo auth.ts linha 42 para verificar se o token expirou"
# ✅ "a autenticação está deixando passar tokens expirados — corrija"

# 3. Para sessões longas, use /compact periodicamente
# Claude tem janela de contexto de 200k tokens mas sessões longas ficam lentas
# /compact resume o histórico e libera espaço

# 4. Use /cost para monitorar gasto
/cost   # mostra tokens usados e custo estimado da sessão

# 5. Para tarefas grandes, divida em sessões
# Uma sessão = uma tarefa coesa
# "Implemente autenticação" → uma sessão
# "Adicione testes para o módulo de autenticação" → próxima sessão

# 6. CLAUDE.md no projeto economiza contexto nas próximas sessões
# Em vez de explicar a stack toda vez, documente uma vez no CLAUDE.md
# Claude lê automaticamente no início de cada sessão

# 7. Para revisar o que Claude vai fazer antes de aprovar:
# Pause quando Claude propõe um Bash e leia o comando inteiro
# Claude Code é auditável — você sempre vê antes de aprovar`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>O loop de trabalho com Claude Code:</strong> abre a sessão no diretório do projeto → descreve o problema ou tarefa em linguagem natural → Claude lê o contexto e propõe ações → você aprova as ações → Claude executa e reporta. O valor não está em comandos específicos, mas em ter um agente que entende o projeto completo e age com autonomia supervisionada.
      </Callout>

      <Callout>
        Próximo: <strong>Modos de uso</strong> — interativo, não-interativo, pipe e headless. Como usar Claude Code além do modo conversacional padrão.
      </Callout>
    </div>
  );
}
