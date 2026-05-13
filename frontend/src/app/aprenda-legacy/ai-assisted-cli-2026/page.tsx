import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ai-assisted-cli-2026');

const accent = '#94a3b8';

const quiz: QuizQuestion[] = [
  { question: 'Warp terminal diferencia-se por:', options: ['Apenas mais bonito', 'Terminal escrito em Rust + GPU rendering + AI integrada (Warp AI) + blocks (cada comando é um block, edita/share) + collaborative sessions. Free para individual, pago para teams. Padrão emergente 2024-2026', 'Apenas Mac', 'Não tem AI'], correct: 1, explanation: 'Warp (warp.dev) reimaginou terminal como app moderna: GPU rendering, blocks editáveis, AI nativa para "explica esse erro / sugere comando". Padrão entre devs jovens; mais conservadores ficam com iTerm/Alacritty.' },
  { question: 'Claude Code (CLI da Anthropic) diferencia-se de Cursor por:', options: ['Idênticos', 'Claude Code é CLI agentic — você roda no terminal, dá tarefa, ele executa via tool calls (edit files, run bash, search). Vs Cursor que é editor com chat lateral. Workflows distintos: agentic background vs IDE-assisted', 'Claude Code é IDE', 'Cursor é CLI'], correct: 1, explanation: 'Claude Code (Anthropic, lançado 2024-2025) é "agente no seu terminal". Você não vê o editor — você narra a tarefa, vê o diff resultado. Cursor é "tab autocomplete + chat" dentro do editor. Diferentes mental models.' },
  { question: 'shell-gpt (sgpt) serve para:', options: ['Editor', 'CLI que invoca LLM (OpenAI/Anthropic) com pipe — sgpt "como descobrir process usando porta 3000?" devolve comando shell. Bom para "comando que esqueci"; menos agentic que Claude Code', 'Apenas chat', 'Apenas Mac'], correct: 1, explanation: 'shell-gpt (TheR1D/shell_gpt) é a "calculadora de comandos". sgpt -s "find big files in home" → devolve find + flags. Pipe compatible: cat error.log | sgpt "analyse". Bom para queries pontuais.' },
  { question: 'fabric (Daniel Miessler) é:', options: ['Tecido', 'Framework de prompts (patterns) versionáveis em markdown, invocados via CLI. fabric -p extract_wisdom < article.txt → roda prompt curado contra LLM. Padrões compartilhados pela comunidade no repo', 'Editor', 'Database'], correct: 1, explanation: 'fabric (danielmiessler/fabric) é "prompts as code" para CLI. ~200 patterns curados (summarize, extract, analyze, write_email, etc). Compõe pipelines: arquivo → pattern → LLM → output. Útil para automação de conhecimento.' },
  { question: 'Simon Willison llm CLI:', options: ['Não existe', 'CLI minimalista para chamar qualquer LLM provider (OpenAI, Anthropic, local via Ollama), com plugins, embedding generation, RAG simples. Por Simon Willison (Django co-creator). Padrão para CLI tinkering com LLMs', 'Apenas OpenAI', 'Pago'], correct: 1, explanation: 'llm (llm.datasette.io) é a "Swiss Army knife" CLI para LLMs. Provider agnostic, plugins ecosystem, suporta embeddings + RAG, scriptable. Simon Willison é o referência para CLI workflow com AI.' },
];

export default function Page() {
  return (
    <ModuleLayout slug="ai-assisted-cli-2026" title="AI no terminal: Warp, Claude Code, sgpt, fabric, llm" icon="🪄" xp={60} readTime={12}
      trailName="DevTools & Productivity Sênior" trailColor={accent} quiz={quiz}>
      <Section title="O terminal virou AI-assisted" accent={accent}>
        <p className="text-sm leading-6">2024-2026 mudou o que "trabalhar no terminal" significa. Cinco players com casos distintos: <b>Warp</b> (terminal app integrado), <b>Claude Code</b> (agentic CLI), <b>shell-gpt</b> (LLM em pipe), <b>fabric</b> (prompts versionados), <b>Simon Willison llm</b> (tinker LLM-friendly).</p>
      </Section>
      <Section title="O cenário em 5 tools" accent={accent}>
        <ComparisonTable accent={accent} headers={['Tool', 'Mental model', 'Pricing']} rows={[
          ['Warp', 'Terminal app com AI built-in, blocks editáveis', 'Free individual; Teams paid'],
          ['Claude Code', 'Agente que vive no terminal, executa tarefas multi-step via tools', '$20/mo Pro; API tokens'],
          ['shell-gpt (sgpt)', 'CLI wrapper para queries pontuais ao LLM', 'Free + API key (OpenAI/Anthropic)'],
          ['fabric', 'Library de prompts versionados, executável via CLI', 'Free OSS + API key'],
          ['Simon Willison llm', 'Tinker CLI multi-provider para LLMs', 'Free OSS + API key'],
        ]} />
      </Section>
      <Section title="Warp em 1 página" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'Blocks', v: 'Cada comando + output = bloco. Edite, copie, share como link permanente.' },
          { k: 'Warp AI', v: 'Cmd+I abre AI assistant — "fix this error", "explain this output", "translate to fish"' },
          { k: 'Warp Drive', v: 'Share blocks e workflows entre time' },
          { k: 'Workflows', v: 'Comandos parametrizados (substitui mais que aliases)' },
          { k: 'GPU rendering', v: 'Smooth scroll, render rápido até em outputs gigantes' },
          { k: 'Compatibilidade', v: 'Roda bash/zsh/fish — não é um shell, é uma terminal app' },
        ]} />
      </Section>
      <Section title="Claude Code workflow" accent={accent}>
        <CodeBlock lang="bash">{`# Instalar
brew install claude

# Login
claude auth login

# Usar
cd ~/project
claude

# No prompt interativo:
> Adicione testes unitários para src/lib/utils.ts cobrindo todos os branches

# Claude lê o arquivo, escreve testes em src/lib/utils.test.ts,
# roda os testes, mostra diff antes de aplicar.

# Modo headless (CI/scripting)
echo "fix all TypeScript errors in src/" | claude --print

# Custom commands (.claude/commands/)
> /skill review-pr 1234`}</CodeBlock>
      </Section>
      <Section title="shell-gpt para queries" accent={accent}>
        <CodeBlock lang="bash">{`pip install shell-gpt

# Comando shell de natural language
sgpt -s "find files modified in the last 24h, excluding node_modules"
# → find . -mtime -1 -not -path "./node_modules/*"

# Code completion
sgpt --code "function to validate brazilian CPF"

# Pipe input
cat error.log | sgpt "summarize the errors and suggest fix"

# Chat mode
sgpt --chat my-chat "remember we're using Go 1.22"
sgpt --chat my-chat "now help me write a HTTP handler"`}</CodeBlock>
      </Section>
      <Section title="fabric patterns" accent={accent}>
        <CodeBlock lang="bash">{`# Instalar (Go)
go install github.com/danielmiessler/fabric@latest
fabric --setup  # API keys

# Pattern de "extract wisdom" de um artigo
curl -s https://example.com/article | fabric -p extract_wisdom

# Patterns úteis disponíveis:
# - summarize, summarize_paper
# - extract_wisdom, extract_ideas
# - analyze_paper, analyze_code
# - write_email, write_pull_request
# - create_summary, create_quiz, create_video_chapters
# - improve_prompt, improve_writing

# Listar
fabric --list

# Custom pattern: crie ~/.config/fabric/patterns/my_pattern/system.md`}</CodeBlock>
      </Section>
      <Section title="llm (Simon Willison)" accent={accent}>
        <CodeBlock lang="bash">{`pip install llm

# Configurar keys
llm keys set openai
llm keys set anthropic

# Pergunta direta
llm "explain DKIM in 3 sentences"

# Modelo específico
llm -m claude-sonnet-4-5 "..."
llm -m gpt-5 "..."
llm -m ollama:qwen2.5:14b "..."  # local

# Pipe
cat plan.md | llm "review este plano e aponte riscos"

# Embedding
llm embed-multi docs --model bge-m3 < paths.txt
llm similar docs "como configurar SAML"

# Plugins
llm install llm-ollama
llm install llm-anthropic`}</CodeBlock>
      </Section>
      <Section title="Stack final recomendada" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'Terminal app', v: 'Warp (se OK com app fechada) OU Alacritty / Wezterm (open-source)' },
          { k: 'Trabalho agentic', v: 'Claude Code para tasks multi-step no codebase' },
          { k: 'Queries pontuais', v: 'shell-gpt OU llm CLI' },
          { k: 'Pipelines de conhecimento', v: 'fabric — patterns versionados' },
          { k: 'Experimentação multi-provider', v: 'llm CLI — switch entre OpenAI/Anthropic/local fácil' },
        ]} />
      </Section>
      <Callout tone="success" icon="🎓">Trilha DevTools & Productivity Sênior concluída. Badge <b>DevTools Pro</b> desbloqueado. Você tem o setup que separa pro de hobbyista em 2026.</Callout>
    </ModuleLayout>
  );
}
