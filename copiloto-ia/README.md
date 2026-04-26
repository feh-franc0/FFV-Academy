# Copiloto IA — Protótipo de Assistente Integrado a CRM

Protótipo frontend de um copiloto conversacional embarcado em um sistema de gestão de clientes (CRM). Demonstra como uma IA pode se integrar ao fluxo de trabalho real de um operador — consultando dados da tela, executando ações contextuais e orientando processos sem trocar de ferramenta.

> **Escopo:** 100% frontend. Toda a lógica de IA, dados de clientes e fluxos conversacionais roda no browser — sem backend, sem chamadas a LLMs externos.

---

## Demo

```
Cliente com 32 dias em atraso na lista → clique em "Aria" → assistente abre
com contexto do cliente já carregado → sugere envio de cobrança → preview da
mensagem → confirmação → simulação de envio via WhatsApp
```

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15.3 (App Router) |
| Linguagem | TypeScript 5 |
| Estilização | Tailwind CSS v3 |
| Animações | Framer Motion 11 |
| Markdown | ReactMarkdown + remark-gfm |
| Ícones | Lucide React |
| Testes unitários | Vitest 2 + Testing Library |
| Testes E2E | Playwright |

---

## Estrutura do projeto

```
copiloto-ia/
├── src/
│   ├── app/
│   │   └── page.tsx              # Composição: FakeSystem + CopilotWidget
│   ├── components/
│   │   ├── copilot/
│   │   │   └── CopilotWidget.tsx # Widget conversacional completo
│   │   └── system/
│   │       └── FakeSystem.tsx    # CRM fictício (sidebar, tabela, cards mobile)
│   ├── lib/
│   │   ├── constants.ts          # Interface Customer + dados compartilhados
│   │   └── flows.ts              # Engine de fluxos + intent matching
│   └── __tests__/
│       ├── unit/
│       │   └── flows.test.ts     # 63 testes de unit — matchFlow, flows, builders
│       └── components/
│           └── CopilotWidget.test.tsx  # 47 testes de componente
└── e2e/
    └── copilot.spec.ts           # Testes E2E com Playwright
```

---

## Comandos

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento (porta 3001)
npm run dev

# Testes unitários e de componente (110 testes)
npm test

# Testes em modo watch
npm run test:watch

# Cobertura de código
npm run test:coverage

# Testes E2E (Playwright)
npm run test:e2e

# Tudo de uma vez
npm run test:all
```

---

## Arquitetura dos fluxos

### `src/lib/constants.ts`

Fonte única de verdade para dados de demonstração. A interface `Customer` e os 8 clientes fictícios são compartilhados entre o CRM (`FakeSystem`) e o motor de fluxos (`flows.ts`).

### `src/lib/flows.ts`

Engine de conversação baseado em fluxos sequenciais. Cada fluxo define:

- **`triggers`** — lista de palavras-chave para ativação
- **`steps`** — sequência de ações (`typing`, `loader`, `message`)

**Tipos de passo:**

| Tipo | Comportamento |
|------|--------------|
| `typing` | Exibe indicador de digitação por N ms |
| `loader` | Exibe spinner com label (simula processamento) |
| `message` | Renderiza mensagem (texto, ação, transfer, arquivo, quick replies) |

**Builders dinâmicos** — geram passos com dados do cliente ativo:

```typescript
buildCobrancaSteps(customer?)  // card de WhatsApp com nome/valor/dias do cliente
buildExcelSteps(customer?)     // card de Excel com ID e nome do cliente
buildConfirmFlowSteps(id, customer?)  // confirmação com telefone e nome dinâmicos
```

**Intent matching** (`matchFlow`):

Triggers com ≤ 4 caracteres usam regex com lookbehind/lookahead para evitar matches parciais indesejados (ex: `"oi"` não dispara dentro de `"foi"`). A ordem dos fluxos no array é determinística — fluxos mais específicos vêm antes dos genéricos:

```
saudacao → cancelar_fatura → baixa_fatura → pagamento_parcial
→ cobrar_restante → gerar_excel → enviar_cobranca → falar_humano → ajuda → fallback
```

### `src/components/copilot/CopilotWidget.tsx`

Componente principal do copiloto. Destaques da implementação:

- **`isBusyRef`** (sync) + **`isBotBusy`** (state) — controle de concorrência sem race conditions
- **`stopRef.current()`** — cancela fluxo em execução ao receber nova entrada
- **`currentCustomerRef`** — referência ao cliente ativo do CRM (não causa re-renders)
- **Streaming em lotes** — 4 chars a cada 22 ms (reduz renders em 75% vs. 1 char/7 ms)
- **Stop button** — substitui o botão Send enquanto o bot está respondendo
- **Quick replies** — desaparecem em mensagens anteriores quando o usuário envia nova mensagem
- **Bubble proativa** — aparece após 10 s de inatividade sugerindo ação

---

## Integração CRM → Copiloto

```
Usuário clica no cliente na tabela do CRM
    ↓
FakeSystem.onSelectCustomer(customer)
    ↓
page.tsx atualiza estado selectedCustomer
    ↓
CopilotWidget recebe prop selectedCustomer
    ↓
useEffect dispara analyzeCustomer(customer)
    ↓
Widget abre + executa fluxo contextualizado com dados do cliente
```

O cliente selecionado fica em `currentCustomerRef` e é injetado nos builders de fluxo em runtime — sem precisar re-renderizar o componente.

---

## Tipos de mensagem suportados

| Tipo | Descrição |
|------|-----------|
| Texto + Markdown | Respostas com negrito, listas, blockquotes |
| Streaming | Texto que aparece caractere por caractere |
| Citation | Fonte/referência abaixo da resposta |
| Quick Replies | Botões de atalho clicáveis |
| Action Card | Preview de ação com confirmar/cancelar |
| File Card | Card de download de arquivo (.xlsx, .pdf, .csv) |
| Transfer Card | Transferência para agente humano com tempo estimado |

---

## Testes

**110 testes** divididos em:

- **63 unitários** (`flows.test.ts`) — cobertura de todos os fluxos, intent matching, word boundary regex, builders dinâmicos e tabela de não-regressão
- **47 de componente** (`CopilotWidget.test.tsx`) — renderização, interação, estados do bot, action cards, transfer card, citation, reset

```bash
npm test
# Test Files  2 passed (2)
# Tests       110 passed (110)
```

---

## Decisões de design

**Por que sem backend?**
O objetivo é demonstrar a UX e a arquitetura de integração. A camada de IA real (Claude, GPT etc.) e persistência são substituídas por fluxos determinísticos — mais rápido de prototipar e 100% reproduzível.

**Por que Framer Motion e não CSS puro?**
O widget precisa de animações de mount/unmount precisas (`AnimatePresence`) que CSS não resolve sem JavaScript adicional. Framer Motion é a escolha padrão no ecossistema React para isso.

**Por que `useRef` em vez de `useState` para controle de fluxo?**
`isBusyRef` e `currentCustomerRef` precisam ser lidos de forma síncrona dentro de callbacks e closures de fluxo. `useState` causaria stale closure bugs. O state React correspondente (`isBotBusy`) existe apenas para acionar re-renders da UI.
