import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#8b949e';

export const metadata: Metadata = {
  title: 'VSCode/Vim produtivos: atalhos, plugins, multi-cursor — FFV Academy',
  description: 'Os atalhos de teclado que mudam tudo, plugins essenciais, multi-cursor e terminal integrado no VSCode — mais Vim básico para quando não tem outra opção.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Qual atalho do VSCode abre a Command Palette e por que ela é mais útil que procurar menus?',
    options: [
      'Ctrl+S — salva e acessa a palette',
      'Ctrl+Shift+P (ou Cmd+Shift+P no Mac) abre a Command Palette. É mais útil que menus porque: busca fuzzy em TODOS os comandos do editor por nome, inclui comandos de extensões, mostra o atalho de teclado ao lado de cada comando — é o jeito mais rápido de descobrir atalhos que você não sabe.',
      'Ctrl+P — abre a palette de configurações',
      'F1 abre a palette mas apenas no Windows',
    ],
    correct: 1,
    explanation: 'A Command Palette é a interface principal do VSCode. Ctrl+P abre o quick open de arquivos (diferente!). Ctrl+Shift+P abre a Command Palette com comandos. Ao digitar > na Command Palette você acessa comandos; ao digitar @ você navega por símbolos; ao digitar : você vai para uma linha.',
  },
  {
    question: 'O que é multi-cursor no VSCode e como criar múltiplos cursores ao mesmo tempo?',
    options: [
      'Multi-cursor não existe no VSCode — apenas no Sublime Text',
      'Multi-cursor permite editar múltiplos lugares simultaneamente. Formas de criar: Alt+Click (Mac: Option+Click) para cada posição, Ctrl+D para selecionar próxima ocorrência da seleção atual, Ctrl+Shift+L para selecionar TODAS as ocorrências, Alt+Shift+I para cursor ao final de cada linha selecionada.',
      'Multi-cursor só funciona em arquivos com menos de 100 linhas',
      'Multi-cursor é criado apenas com Ctrl+C em modo de seleção',
    ],
    correct: 1,
    explanation: 'Multi-cursor é um dos recursos mais produtivos para edição de código. Caso de uso clássico: selecionar um identificador, Ctrl+D repetidamente para selecionar todas as ocorrências no arquivo, e renomear todas de uma vez. Alternativa para rename: F2 (rename symbol) que usa a análise do language server e renomeia através de arquivos.',
  },
  {
    question: 'No Vim, como sair de um arquivo sem salvar após acidentalmente entrar no editor?',
    options: [
      'Ctrl+C e depois Ctrl+Q',
      'Pressione Esc para garantir que está em Normal mode, depois digite :q! e Enter. :q sai (se não há mudanças), :q! força saída sem salvar, :wq salva e sai, :x é equivalente a :wq. O ! no final de qualquer comando significa "force".',
      'Feche o terminal — a única saída do Vim',
      'Digite exit e pressione Enter',
    ],
    correct: 1,
    explanation: 'Vim tem modos: Normal (padrão, navegação e comandos), Insert (i para entrar, Esc para sair), Visual (v para seleção). A maioria das pessoas que "fica presa" no Vim está em Insert mode sem saber. Sempre Esc primeiro para voltar ao Normal mode, depois o comando. :help é seu amigo no Vim.',
  },
];

export default function EditoresProdutividadePage() {
  return (
    <ModuleLayout
      slug="editores-produtividade"
      title="VSCode/Vim produtivos: atalhos, plugins, multi-cursor"
      icon="✏️"
      xp={35}
      readTime={7}
      trailName="Fundamentos Técnicos"
      trailColor="#8b949e"
      nextSlug="o-que-e-ia"
      nextTitle="O que é Inteligência Artificial?"
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
        O editor de texto é onde você passa a maior parte do dia. Dominar os atalhos do VSCode não é luxo — é multiplicar a velocidade de desenvolvimento. E saber Vim básico te salva quando você está num servidor sem interface gráfica.
      </p>

      <Section accent={accent} title="VSCode: os atalhos que mais importam">
        <ComparisonTable
          headers={['Ação', 'Windows/Linux', 'Mac']}
          rows={[
            ['Command Palette', 'Ctrl+Shift+P', 'Cmd+Shift+P'],
            ['Abrir arquivo (fuzzy)', 'Ctrl+P', 'Cmd+P'],
            ['Busca global', 'Ctrl+Shift+F', 'Cmd+Shift+F'],
            ['Terminal integrado', 'Ctrl+`', 'Cmd+`'],
            ['Comentar linha/seleção', 'Ctrl+/', 'Cmd+/'],
            ['Formatar documento', 'Shift+Alt+F', 'Shift+Option+F'],
            ['Ir para definição', 'F12', 'F12'],
            ['Peek definition', 'Alt+F12', 'Option+F12'],
            ['Renomear símbolo', 'F2', 'F2'],
            ['Multi-cursor (próxima ocorrência)', 'Ctrl+D', 'Cmd+D'],
            ['Multi-cursor (todas as ocorrências)', 'Ctrl+Shift+L', 'Cmd+Shift+L'],
            ['Mover linha', 'Alt+↑/↓', 'Option+↑/↓'],
            ['Duplicar linha', 'Shift+Alt+↑/↓', 'Shift+Option+↑/↓'],
            ['Deletar linha', 'Ctrl+Shift+K', 'Cmd+Shift+K'],
            ['Selecionar linha', 'Ctrl+L', 'Cmd+L'],
            ['Ir para linha', 'Ctrl+G', 'Cmd+G'],
            ['Fechar aba', 'Ctrl+W', 'Cmd+W'],
            ['Reabrir aba fechada', 'Ctrl+Shift+T', 'Cmd+Shift+T'],
            ['Split editor', 'Ctrl+\\', 'Cmd+\\'],
            ['Zen mode', 'Ctrl+K Z', 'Cmd+K Z'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="Multi-cursor: edição em múltiplos lugares ao mesmo tempo">
        <CodeBlock>{`# Casos de uso de multi-cursor no VSCode:

# 1. Renomear variável em múltiplas ocorrências no arquivo:
#    Selecione "oldName" → Ctrl+D (adiciona a próxima ocorrência)
#    Repita Ctrl+D até selecionar todas → digite o novo nome

# 2. Adicionar cursor em todas as ocorrências de uma vez:
#    Selecione "oldName" → Ctrl+Shift+L → todos os cursores aparecem

# 3. Multi-cursor em colunas (Box selection):
#    Shift+Alt e arrastar o mouse (Windows/Linux)
#    Shift+Option e arrastar o mouse (Mac)
#    Útil para: adicionar vírgula ao final de cada linha, alinhar valores

# 4. Cursor no final de cada linha selecionada:
#    Selecione múltiplas linhas → Alt+Shift+I (Win) / Option+Shift+I (Mac)
#    Útil para adicionar ponto-e-vírgula, vírgula, etc.

# 5. Alt+Click para cursor em posições arbitrárias:
#    Clique em cada posição onde quer um cursor
#    Todos os cursores digitam/apagam ao mesmo tempo`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Extensões essenciais por categoria">
        <div className="flex flex-col gap-2">
          {[
            {
              cat: 'Linguagens e Formatação',
              plugins: ['Prettier — formatação automática (JS/TS/CSS/JSON/YAML)', 'ESLint — linting JavaScript/TypeScript', 'Python (Microsoft) — IntelliSense, debug, testes', 'Go (Google) — todo o tooling Go', 'Rust Analyzer — language server para Rust'],
            },
            {
              cat: 'Git e Colaboração',
              plugins: ['GitLens — blame, histórico, comparações inline', 'Git Graph — visualização do DAG de commits', 'GitHub Pull Requests — review de PRs dentro do VSCode'],
            },
            {
              cat: 'Produtividade',
              plugins: ['GitHub Copilot — AI completions (pago)', 'Path Intellisense — autocomplete de paths', 'Auto Rename Tag — renomeia tag HTML de abertura/fechamento juntas', 'Bracket Pair Colorizer 2 — colore pares de chaves (nativo no VSCode agora)'],
            },
            {
              cat: 'DevOps/Cloud',
              plugins: ['Docker — integração com containers', 'Kubernetes — manage clusters', 'AWS Toolkit — recursos AWS', 'Remote - SSH — editar arquivos em servidor remoto como se fosse local'],
            },
            {
              cat: 'Temas e Aparência',
              plugins: ['GitHub Theme — excelente contraste dark/light', 'Material Icon Theme — ícones de arquivos por tipo', 'One Dark Pro — clássico', 'Tokyo Night — popular em 2025'],
            },
          ].map(item => (
            <div key={item.cat} className="p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <p className="font-semibold text-xs mb-2" style={{ color: accent }}>{item.cat}</p>
              <div className="flex flex-col gap-0.5">
                {item.plugins.map(p => (
                  <p key={p} className="text-xs" style={{ color: 'var(--ffv-muted)' }}>→ {p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section accent={accent} title="Configurações úteis no settings.json">
        <CodeBlock>{`// settings.json (Ctrl+Shift+P → "Open User Settings JSON")
{
  // Auto-salva ao mudar de aba
  "files.autoSave": "onFocusChange",

  // Formata ao salvar (requer Prettier ou outro formatter)
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",

  // Minimap: desabilitar se achar distração
  "editor.minimap.enabled": false,

  // Font ligatures (requer fonte como Fira Code, JetBrains Mono)
  "editor.fontFamily": "JetBrains Mono, 'Courier New', monospace",
  "editor.fontLigatures": true,
  "editor.fontSize": 14,

  // Tab = 2 espaços para JS/TS, 4 para Python
  "editor.tabSize": 2,
  "[python]": {
    "editor.tabSize": 4
  },

  // Terminal
  "terminal.integrated.defaultProfile.linux": "zsh",
  "terminal.integrated.fontSize": 13,

  // Explorer
  "explorer.confirmDelete": false,  // sem confirmação ao deletar
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true,
    "**/__pycache__": true
  }
}`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Vim básico: sobrevivência em servidores">
        <p>
          Vim está instalado em praticamente todo servidor Linux. Saber o mínimo evita pânico quando você precisa editar um arquivo de config num servidor sem VSCode ou nano disponível.
        </p>
        <CodeBlock>{`# Os modos do Vim:
# NORMAL — modo padrão ao abrir (navegar, comandos)
# INSERT — para digitar texto (pressione i para entrar, Esc para sair)
# VISUAL — para selecionar texto (pressione v)
# COMMAND — para comandos : (pressione : em Normal)

# Abrir arquivo
vim arquivo.txt

# Comandos essenciais em NORMAL mode:
i          → entra em INSERT antes do cursor
a          → entra em INSERT após o cursor
o          → nova linha abaixo, entra em INSERT
O          → nova linha acima, entra em INSERT
Esc        → volta para NORMAL
u          → undo
Ctrl+R     → redo

# Navegação
h j k l    → ←↓↑→ (ou use as setas)
gg         → início do arquivo
G          → final do arquivo
:42        → vai para linha 42
/padrão    → busca para frente (n = próximo, N = anterior)
?padrão    → busca para trás

# Edição
dd         → deleta a linha inteira
yy         → copia (yank) a linha
p          → cola abaixo
x          → deleta caractere sob o cursor
dw         → deleta palavra
cw         → muda palavra (deleta + entra em INSERT)
.          → repete o último comando

# Salvar e sair (em COMMAND mode, após pressionar :)
:w         → salva
:q         → sai (só se não houver mudanças)
:wq        → salva e sai
:x         → idem :wq
:q!        → sai sem salvar (descarta mudanças)
:w !sudo tee %  → salva como root (se esqueceu de abrir com sudo)

# Busca e substituição
:%s/antigo/novo/g     → substitui todas as ocorrências no arquivo
:%s/antigo/novo/gc    → substitui com confirmação de cada`}</CodeBlock>
        <Callout tone="info">
          Se quiser aprender Vim a sério, rode <code>vimtutor</code> no terminal — um tutorial interativo que leva ~30 minutos e ensina o suficiente para ser produtivo. Ou tente o modo Vim do VSCode (extensão "Vim") para aprender no ambiente que você já usa.
        </Callout>
      </Section>

      <Callout tone="success">
        <strong>Você concluiu a Trilha Fundamentos Técnicos!</strong> CLI, permissões, processos, SSH, Git, GitHub, HTTP, DNS/TLS, JSON/YAML e editor produtivo. Agora você tem a base para qualquer trilha técnica do FFV Academy.
      </Callout>

      <Callout>
        <strong>Próximos caminhos:</strong> <strong>Fundamentos da IA</strong> se quer entender como modelos funcionam; <strong>AWS Cloud Practitioner</strong> se quer cloud; <strong>DevOps & Containers</strong> se quer infraestrutura.
      </Callout>
    </div>
  );
}
