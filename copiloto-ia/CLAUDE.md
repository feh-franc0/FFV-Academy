# CLAUDE.md — copiloto-ia

Protótipo frontend de copiloto conversacional integrado a um CRM fictício. Sem backend — toda lógica roda no browser.

## Comandos

```bash
npm run dev          # dev server na porta 3001
npm test             # 110 testes (vitest --run)
npm run test:watch   # watch mode
npm run test:e2e     # Playwright
npm run build        # build de produção
```

## Arquitetura

### Fonte única de verdade

`src/lib/constants.ts` — interface `Customer` + array `CUSTOMERS` + `STATS`. Qualquer dado de cliente que apareça no CRM ou nos fluxos vem daqui. Não duplique dados em outros arquivos.

### Engine de fluxos (`src/lib/flows.ts`)

Fluxos são arrays de `FlowStep` com três tipos: `typing`, `loader`, `message`.

**Ordem dos fluxos é determinística — não reordenar sem cuidado:**
```
saudacao → cancelar_fatura → baixa_fatura → pagamento_parcial
→ cobrar_restante → gerar_excel → enviar_cobranca → falar_humano → ajuda → fallback
```
- `cancelar_fatura` vem antes de `baixa_fatura` porque ambos têm trigger `'fatura'`
- `cobrar_restante` vem antes de `enviar_cobranca` porque ambos têm trigger `'cobrar'`

**Triggers curtos (≤ 4 chars) usam regex com word boundary:**
```typescript
new RegExp(`(?<![a-záàâã...])${trigger}(?![a-záàâã...])`, 'i')
```
Motivo: `"oi"` dentro de `"foi"` não deve disparar `saudacao`.

**Builders dinâmicos** recebem o cliente ativo em runtime:
```typescript
buildCobrancaSteps(customer?)
buildExcelSteps(customer?)
buildConfirmFlowSteps(flowId, customer?)
```
Quando `customer` é null, usam `DEFAULT_CUSTOMER` como fallback.

### Widget (`src/components/copilot/CopilotWidget.tsx`)

**Padrão ref + state para controle de concorrência:**
- `isBusyRef` — lido de forma síncrona em callbacks (evita stale closure)
- `isBotBusy` — state React só para acionar re-renders da UI
- `currentCustomerRef` — cliente ativo sem re-renders desnecessários
- `stopRef.current()` — cancela fluxo em execução

**Streaming:** 4 chars a cada 22 ms. Não reduzir `STREAM_CHUNK` abaixo de 4 — causa jank perceptível por excesso de renders.

**Injeção de contexto do cliente:**
```typescript
// handleUserInput — fluxos que dependem do cliente ativo
if (flow.id === 'enviar_cobranca') steps = buildCobrancaSteps(currentCustomerRef.current)
if (flow.id === 'gerar_excel')     steps = buildExcelSteps(currentCustomerRef.current)

// handleConfirm — confirmações com dados dinâmicos
const steps = buildConfirmFlowSteps(confirmFlowId, currentCustomerRef.current)
```

**analyzeCustomer** — chamado quando o usuário clica em um cliente no CRM:
- Seta `hasGreetedRef.current = true` para suprimir a saudação automática
- Chama `stopRef.current()` para cancelar fluxo em andamento
- Aguarda 120 ms antes de executar os passos (evita conflito de estado)

### CRM (`src/components/system/FakeSystem.tsx`)

- Mobile: sidebar tipo drawer (`-translate-x-full sm:translate-x-0`) + card list (`sm:hidden`)
- Desktop: tabela com colunas fixas (`hidden sm:block`)
- Cliente selecionado destacado com `ring-1 ring-blue-500/40`
- Botão "Aria" aparece no hover da linha (desktop) ou fixo no card (mobile)

## Testes

### Gotchas importantes

**`waitFor` com `queryByTestId` não lança exceção quando o elemento não existe.**
Use sempre com `expect` dentro:
```typescript
// ERRADO — resolve imediatamente, teste sempre passa
await waitFor(() => screen.queryByTestId('action-card'), { timeout: 6000 })

// CORRETO — lança até o elemento existir
await waitFor(() => {
  expect(screen.queryByTestId('action-card')).toBeInTheDocument()
}, { timeout: 8000 })
```

**`scrollIntoView` não existe no jsdom.** Declarado em `src/test/setup.ts`:
```typescript
Element.prototype.scrollIntoView = vi.fn()
```

**Framer Motion é mockado em testes** (`src/test/setup.ts`) — AnimatePresence renderiza filhos diretamente.

### Estrutura dos testes
- `src/__tests__/unit/flows.test.ts` — 63 testes: matchFlow, todos os fluxos, word boundary, builders, tabela de não-regressão
- `src/__tests__/components/CopilotWidget.test.tsx` — 47 testes: input, mensagens, bot status, quick replies, action cards, transfer card, citation, reset

## Convenções

- Português brasileiro em toda a UI e nos fluxos de conversa
- Inglês no código (nomes de variáveis, funções, tipos, comentários)
- Sem comentários óbvios — só quando o WHY não é evidente pelo código
- Tailwind classes: mobile-first com prefixo `sm:` para desktop
- Nenhum dado de cliente fora de `constants.ts`
- Nenhuma lógica de fluxo fora de `flows.ts`
