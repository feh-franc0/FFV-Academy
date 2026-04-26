# Roteiro de Teste Local — AI Codebase Toolkit

Siga essa ordem. Se algo falhar, veja a seção **Depurando erros** no final.

---

## Pré-requisitos

- VS Code instalado
- Node.js 18+ (`node -v`)
- Dependências instaladas (`npm install` dentro de `ai-codebase-toolkit/`)
- Build compilado (`npm run build`)

---

## 1. Iniciar o Extension Development Host

Abra a pasta do projeto no VS Code:

```bash
code /Users/fernandofranco/Developer/fernandofrancovalledotcom/ai-codebase-toolkit
```

Pressione **F5**.

- Se aparecer um menu de debug, escolha **"VS Code Extension Development"**.
- Uma segunda janela do VS Code abre — o **Extension Development Host**. É nessa janela que você testa.

---

## 2. Abrir um projeto real no Host

Na segunda janela: `File > Open Folder`

Projeto recomendado para o primeiro teste:
```
/Users/fernandofranco/Developer/fernandofrancovalledotcom/frontend
```

Tem TypeScript, Next.js, scripts, testes — cobre todos os casos do scanner.

---

## 3. Checklist de testes

Execute em ordem. Marque cada item conforme testa.

### 3.1 Status bar

- [ ] Canto inferior direito mostra `🚀 AI Toolkit` após abrir a pasta
- [ ] Após o scan automático (~3s), o texto muda para `⚠ AI XX/100` com o score real

### 3.2 Notificação de boas-vindas (apenas na primeira vez)

- [ ] Aparece notificação: *"AI Codebase Toolkit installed..."*
- [ ] Botão **"Generate Instructions"** funciona e cria os arquivos
- [ ] Botão **"Show Walkthrough"** abre o walkthrough de 4 passos
- [ ] Botão **"Later"** dispensa sem travar nada

> Se não aparecer (já foi vista antes), vá direto para 3.3.

### 3.3 Sidebar

- [ ] Ícone de foguete aparece na barra lateral esquerda
- [ ] Expandir mostra categorias: **Analysis**, **Context**, **Documentation**, **Scaffold**
- [ ] Clicar em qualquer tool na sidebar executa o command correspondente

### 3.4 Command Palette — `Cmd+Shift+P` → "AI Toolkit"

Todos os 10 commands devem aparecer na lista:

| Command | O que verificar |
|---|---|
| **Scan Project** | Abre webview com score 0–100, lista de issues com badges, lista de passed |
| **Show AI-Readiness Score** | Mesma webview (sem re-escanear o projeto) |
| **Generate AI Instructions** | Picker aparece para escolher targets (claude, cursor, copilot, amazonq, agents) → após confirmar, arquivos são criados na raiz do projeto |
| **Check Drift** | Webview mostrando tabela com status de cada arquivo (in-sync / stale / missing / untagged) |
| **New SDD Spec** | Input box pedindo título → cria `docs/specs/0001-<titulo>.md` |
| **New ADR** | Input box pedindo título → cria `docs/adr/0001-<titulo>.md` |
| **Generate Architecture Diagram** | Cria `docs/architecture/architecture.md` com diagrama Mermaid |
| **Generate Documentation Site** | Cria estrutura VitePress em `docs/` com múltiplos `.md` |
| **Scaffold Feature** | Input box pedindo nome (kebab-case) → cria pasta com arquivos de feature |
| **Generate Test Suite** | Requer arquivo aberto ou selecionado (ver 3.5) |

### 3.5 Menu de contexto (clique direito)

- [ ] Clique direito num arquivo `.ts` no Explorer → aparece **"AI Toolkit: Generate Test Suite"**
  - Executa → cria arquivos `*.unit.test.ts`, `*.integration.test.ts`, `*.contract.test.ts`, `*.e2e.test.ts`
- [ ] Clique direito numa **pasta** → aparece **"AI Toolkit: Scaffold Feature"**
  - Executa → pede nome → cria estrutura de feature dentro da pasta selecionada

### 3.6 Webview — Score

Ao abrir o Score (Scan Project ou Show AI-Readiness Score):

- [ ] Score aparece em verde (≥80), amarelo (50–79) ou vermelho (<50)
- [ ] Cada issue tem badge de severidade (critical / warning / info)
- [ ] Issues que têm fix mostram botão **"Fix"** — clicar executa o command correspondente
- [ ] Lista "Passed" mostra os checks que passaram

### 3.7 Webview — Drift

Após gerar instruções com **Generate AI Instructions**:

- [ ] **Check Drift** mostra tabela com os arquivos gerados em status **"in sync"**
- [ ] Manifesto da sessão aparece no subtítulo

Para forçar drift:
1. Adicione uma dependência qualquer no `package.json` do projeto e salve
2. Aguarde ~2 segundos
3. Uma notificação de warning deve aparecer: *"X AI instruction files are out of sync"*
- [ ] Botão **"Regenerate"** → executa Generate AI Instructions
- [ ] Botão **"Show Details"** → abre webview de Drift
- [ ] Botão **"Dismiss"** → descarta sem fazer nada

Após a notificação, abra **Check Drift** e confirme:
- [ ] Arquivos mostram status **"stale"**
- [ ] Botão "Regenerate all" na webview funciona

### 3.8 CLAUDE.md gerado — qualidade mínima

Abra o `CLAUDE.md` gerado e confirme que tem:

- [ ] Stack corretamente detectada (TypeScript, Next.js, npm/pnpm)
- [ ] Seção **Entry points** com hints específicos de Next.js
- [ ] Seção **Commands** com os scripts reais do `package.json`
- [ ] Seção **Working agreements** com regras de Server Components (Next.js específico)
- [ ] Tag de manifesto no topo (linha `<!-- aitk-manifest: ... -->`)

---

## 4. Ciclo de iteração (ao mudar código)

Quando fizer alteração no código da extensão e quiser retestar:

1. Na janela **principal** (não no host): `Ctrl+Shift+F5`
2. O Extension Development Host reinicia com o novo código
3. Reteste na segunda janela

---

## 5. Depurando erros

### Ver logs da extensão

Na janela principal do VS Code:
`View > Output` → dropdown no canto superior direito → selecione **"AI Toolkit"**

Todos os erros de background scan, drift check e commands aparecem lá.

### Erros comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| Status bar não aparece | Pasta aberta não tem `package.json`, `go.mod` etc. | Abrir uma pasta com arquivo de projeto |
| Command não aparece no palette | Extension não ativou | Abrir pasta com projeto válido e aguardar |
| Webview em branco | Erro no render — ver Output | Checar log "AI Toolkit" no Output |
| Drift não detecta mudança | `autoSync` está `false` nas settings | Ir em Settings → "AI Toolkit: Auto Sync" → ativar |
| F5 não abre segunda janela | Build com erro | Rodar `npm run build` manualmente e checar erros |

### Forçar re-scan manual

```
Cmd+Shift+P → AI Toolkit: Scan Project
```

---

## 6. Instalar o .vsix localmente (sem F5)

Se quiser testar como se fosse instalado de verdade pelo Marketplace:

```bash
# Gerar o pacote
cd ai-codebase-toolkit
npm run package

# Instalar no VS Code principal
code --install-extension ai-codebase-toolkit-0.1.0.vsix
```

Reinicie o VS Code após instalar. Para desinstalar:
`Extensions → AI Codebase Toolkit → Uninstall`
