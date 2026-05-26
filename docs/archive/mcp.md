# Guia Completo de MCPs no Claude Code

**MCP = Model Context Protocol** — padrão aberto da Anthropic que permite ao Claude Code se conectar a servidores externos e ganhar ferramentas adicionais (criar arquivos, consultar APIs, abrir browsers, etc).

---

## Índice

1. [Conceitos fundamentais](#1-conceitos-fundamentais)
2. [Comandos de terminal](#2-comandos-de-terminal)
3. [Escopos de configuração](#3-escopos-de-configuração)
4. [Tipos de transporte](#4-tipos-de-transporte)
5. [MCPs instalados neste projeto](#5-mcps-instalados-neste-projeto)
6. [Draw.io MCP — guia de uso](#6-drawio-mcp--guia-de-uso)
7. [Como encontrar novos MCPs](#7-como-encontrar-novos-mcps)
8. [Referência rápida](#8-referência-rápida)

---

## 1. Conceitos fundamentais

```
Claude Code
    │
    ├── MCP Client (embutido no Claude)
    │       │
    │       └── protocolo JSON-RPC sobre stdio / HTTP / SSE
    │               │
    │               └── MCP Server (processo externo)
    │                       │
    │                       ├── tools   → ações que o Claude pode executar
    │                       ├── resources → dados que o Claude pode ler
    │                       └── prompts   → templates reutilizáveis
```

**Fluxo real:** você pede algo → Claude decide qual tool usar → chama o servidor MCP → servidor executa → resultado volta para o Claude → Claude responde.

**O Claude não executa as ferramentas sozinho.** Quem executa é o servidor MCP rodando como processo separado na sua máquina (ou em um endpoint remoto).

---

## 2. Comandos de terminal

Todos os comandos usam a CLI do Claude Code: `claude mcp <subcomando>`.

### 2.1 Listar MCPs instalados

```bash
claude mcp list
```

Mostra todos os servidores configurados e o status de cada um:
- `✓ Connected` — servidor rodando e respondendo
- `✗ Failed` — erro ao iniciar (verifique o comando)
- `! Needs authentication` — servidor remoto que precisa de login

---

### 2.2 Adicionar um MCP

```bash
# Sintaxe geral
claude mcp add <nome> <comando> [args...]

# Servidor via npx (mais comum — não precisa instalar nada)
claude mcp add drawio -- npx -y @drawio/mcp

# Servidor local (binário já instalado)
claude mcp add meu-servidor -- /usr/local/bin/meu-mcp

# Servidor HTTP remoto
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# Servidor com variável de ambiente (ex: API key)
claude mcp add -e OPENAI_API_KEY=sk-xxx meu-server -- npx my-mcp-server

# Definir escopo (padrão é local)
claude mcp add -s user drawio -- npx -y @drawio/mcp    # disponível em todos os projetos
claude mcp add -s project drawio -- npx -y @drawio/mcp  # commitável no repo
claude mcp add -s local drawio -- npx -y @drawio/mcp    # só na sua máquina (padrão)
```

**Flag `--`** → separa os args do Claude dos args do comando MCP. Use sempre que o servidor aceitar flags.

---

### 2.3 Remover um MCP

```bash
claude mcp remove drawio
```

Remove do escopo onde foi instalado. Se instalou em múltiplos escopos, rode o comando para cada um.

---

### 2.4 Ver detalhes de um MCP

```bash
claude mcp get drawio
```

Exibe a configuração completa: comando, args, variáveis de ambiente, escopo, transporte.

---

### 2.5 Resetar um MCP travado

```bash
# Reinicia o servidor sem reiniciar o Claude Code
claude mcp reset-server drawio
```

Útil quando o servidor MCP trava ou fica em estado inconsistente.

---

### 2.6 Adicionar servidor HTTP com autenticação OAuth

```bash
claude mcp add \
  --transport http \
  --client-id <CLIENT_ID> \
  --client-secret \
  meu-server https://api.exemplo.com/mcp
```

O `--client-secret` pede a senha interativamente (não fica no histórico do shell).

---

### 2.7 Adicionar servidor SSE (Server-Sent Events)

```bash
claude mcp add --transport sse meu-server https://api.exemplo.com/sse
```

SSE é um transporte legado. Prefira HTTP quando disponível.

---

### 2.8 Verificar saúde de todos os servidores

```bash
claude mcp list
```

O `list` já faz health-check ao exibir. Para checar continuamente durante o dev:

```bash
watch -n 5 'claude mcp list'
```

---

## 3. Escopos de configuração

| Escopo | Flag | Arquivo de config | Quando usar |
|--------|------|-------------------|-------------|
| `local` | `-s local` (padrão) | `~/.claude.json` (por projeto) | Uso pessoal, não commitado |
| `user` | `-s user` | `~/.claude/settings.json` | Disponível em todos os seus projetos |
| `project` | `-s project` | `.claude/settings.json` (na raiz do repo) | Compartilhado com o time via git |

**Prioridade de override:** `local` > `project` > `user`

Exemplo prático:
- `drawio` → escopo `user` (você usa em todos os projetos)
- `servidor-de-banco` com senha → escopo `local` (nunca commitar credenciais)
- `mcp-da-empresa` → escopo `project` (time inteiro precisa)

---

## 4. Tipos de transporte

| Tipo | Como funciona | Quando usar |
|------|--------------|-------------|
| `stdio` (padrão) | Claude spawna o processo e fala via stdin/stdout | Servidores locais (npx, binários) |
| `http` | Requisições HTTP para um endpoint | APIs remotas, serviços cloud |
| `sse` | Stream de eventos HTTP (legado) | Servidores antigos que ainda não migraram |

---

## 5. MCPs instalados neste projeto

### Google Drive

```
Tipo: HTTP remoto
URL: https://drivemcp.googleapis.com/mcp/v1
Status: Needs authentication (OAuth)
Uso: Ler/escrever Google Docs e Sheets diretamente pelo Claude
```

Para autenticar:
```bash
# O Claude detecta automaticamente quando precisa — basta pedir algo do Drive
# Ex: "leia o arquivo 'Planejamento Q2' do meu Drive"
```

---

### Draw.io

```
Tipo: stdio via npx
Comando: npx -y @drawio/mcp
Status: Connected
Pacote: @drawio/mcp (oficial da equipe draw.io/jgraph)
```

Ver seção 6 para guia completo.

---

## 6. Draw.io MCP — guia de uso

### O que ele faz

O servidor `@drawio/mcp` expõe duas ferramentas:

| Tool | O que faz |
|------|-----------|
| `create_diagram` | Renderiza XML draw.io como diagrama interativo |
| `search_shapes` | Busca nas 10.000+ shapes (AWS, Azure, GCP, UML, BPMN...) |

### Formatos suportados

O Claude pode gerar diagramas em três formatos:

```
1. XML nativo draw.io  → mais controle, layout preciso
2. CSV                 → tabelas de dados viram diagramas
3. Mermaid             → sintaxe textual simples
```

### Estrutura XML mínima obrigatória

Todo diagrama draw.io precisa dessas duas células estruturais:

```xml
<mxGraphModel>
  <root>
    <mxCell id="0"/>                      <!-- célula raiz — sempre presente -->
    <mxCell id="1" parent="0"/>           <!-- camada padrão — sempre presente -->

    <!-- suas shapes aqui -->
    <mxCell id="2" value="Minha Shape"
            style="rounded=1;fillColor=#dae8fc;"
            vertex="1" parent="1">
      <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
    </mxCell>

  </root>
</mxGraphModel>
```

**Regras críticas:**
- `vertex="1"` → shape/caixa
- `edge="1"` → conector/seta
- Cada `id` deve ser único
- Não use XML comprimido (base64) — o MCP não consegue ler
- Escape HTML dentro de `value`: `&amp;`, `&lt;`, `&gt;`

### Prompts práticos para usar com o MCP

#### Diagrama de arquitetura

```
Crie um diagrama draw.io da arquitetura do FFV Academy:
- Next.js (frontend) → Hostinger (CDN)
- localStorage (state do usuário)
- curriculum.ts → dados estáticos
Use shapes AWS para servidores e conectores com setas rotuladas.
```

#### Fluxo de trilha de aprendizado

```
Crie um fluxograma draw.io mostrando o fluxo de um usuário no FFV Academy:
acessa artigo → lê conteúdo → faz quiz → ganha XP → sobe de nível → SRS agenda revisão
```

#### Diagrama de componentes React

```
Gere um diagrama draw.io de componentes mostrando:
- GameHUD (pai)
  ├── XPBar
  ├── StreakCounter
  └── BadgeDisplay
- ModuleLayout (pai)
  ├── TOC
  ├── ArticleContent
  └── QuizSection
Inclua as props principais em cada componente.
```

#### Buscar shapes específicas

```
Busque shapes de cloud AWS para: EC2, S3, Lambda, CloudFront
```

### Abrindo o diagrama gerado

Depois que o Claude gera o XML, você pode:

1. **Copiar e colar** em [app.diagrams.net](https://app.diagrams.net) → Extras → Edit Diagram
2. **Salvar como arquivo** `.drawio` no projeto e abrir com a extensão do VS Code
3. **URL direta** → o MCP Tool Server abre automaticamente no browser

### Dicas de estilo

```xml
<!-- Caixa azul arredondada -->
style="rounded=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"

<!-- Caixa verde (sucesso) -->
style="rounded=1;fillColor=#d5e8d4;strokeColor=#82b366;"

<!-- Caixa amarela (atenção) -->
style="rounded=1;fillColor=#fff2cc;strokeColor=#d6b656;"

<!-- Caixa vermelha (erro) -->
style="rounded=1;fillColor=#f8cecc;strokeColor=#b85450;"

<!-- Seta com label -->
style="edgeStyle=orthogonalEdgeStyle;" edge="1"
value="→ label da seta"

<!-- Shape AWS (requer stencil) -->
style="shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.lambda"
```

---

## 7. Como encontrar novos MCPs

### Fontes confiáveis

| Fonte | URL | O que tem |
|-------|-----|-----------|
| MCP oficial Anthropic | github.com/modelcontextprotocol/servers | Referência (filesystem, git, postgres, etc) |
| Awesome MCP Servers | mcpservers.org | Diretório comunitário |
| npm | npmjs.com/search?q=mcp-server | Pacotes publicados |
| mcp.so | mcp.so | Catálogo com ratings |

### MCPs úteis para considerar no futuro

| MCP | Pacote | Para que serve |
|-----|--------|---------------|
| Filesystem | `@modelcontextprotocol/server-filesystem` | Claude lê/escreve arquivos além do projeto atual |
| Git | `@modelcontextprotocol/server-git` | Claude faz commits, diffs, histórico |
| Postgres | `@modelcontextprotocol/server-postgres` | Claude consulta banco de dados |
| Puppeteer | `@modelcontextprotocol/server-puppeteer` | Claude controla browser |
| Brave Search | `@modelcontextprotocol/server-brave-search` | Busca web via API Brave |
| GitHub | `@modelcontextprotocol/server-github` | Issues, PRs, repos pelo Claude |

### Como avaliar um MCP antes de instalar

```bash
# 1. Ver o pacote npm antes de instalar
npm info @drawio/mcp

# 2. Ver repositório GitHub
# Cheque: estrelas, última atualização, issues abertas, quem mantém

# 3. Testar sem instalar permanentemente
npx -y @nome/mcp --help

# 4. Instalar e testar
claude mcp add teste -- npx -y @nome/mcp
claude mcp list   # ver se conectou
claude mcp remove teste   # remover se não servir
```

---

## 8. Referência rápida

```bash
# LISTAR
claude mcp list                          # todos os MCPs e status

# ADICIONAR
claude mcp add <nome> -- npx -y <pacote>          # via npx
claude mcp add -s user <nome> -- npx -y <pacote>  # escopo global (todos os projetos)
claude mcp add -s project <nome> -- npx -y <pacote>  # escopo projeto (commitável)
claude mcp add --transport http <nome> <url>       # servidor HTTP remoto
claude mcp add -e KEY=valor <nome> -- npx <pacote> # com env var

# INSPECIONAR
claude mcp get <nome>            # detalhes de configuração

# REINICIAR
claude mcp reset-server <nome>   # reinicia sem fechar o Claude

# REMOVER
claude mcp remove <nome>         # remove do escopo onde foi instalado

# VERIFICAR (via watch)
watch -n 5 'claude mcp list'     # monitora saúde a cada 5s
```

### Onde ficam os arquivos de configuração

```
~/.claude.json                          → escopos local (por projeto)
~/.claude/settings.json                 → escopo user (global)
<projeto>/.claude/settings.json         → escopo project (commitável)
```

---

## Troubleshooting

### MCP não conecta (`✗ Failed`)

```bash
# 1. Ver o comando que está tentando rodar
claude mcp get drawio

# 2. Rodar o comando manualmente para ver o erro
npx -y @drawio/mcp

# 3. Checar se node/npm está no PATH
node --version && npm --version

# 4. Limpar cache do npx
npx clear-npx-cache

# 5. Reinstalar o MCP
claude mcp remove drawio
claude mcp add drawio -- npx -y @drawio/mcp
```

### MCP conecta mas não aparece como tool

Reinicie o Claude Code completamente. As tools do MCP são carregadas no início da sessão.

### `Needs authentication` no Google Drive

O Claude vai pedir autenticação automaticamente quando você pedir algo do Drive. Siga o fluxo OAuth no browser que ele abre.

---

*Última atualização: abril 2026 — draw.io MCP @drawio/mcp instalado e funcionando*
