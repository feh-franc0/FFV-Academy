## Why

Três lugares da interface esperam endpoint que não existe. O terceiro é o mais grave, e
não por motivo técnico:

| Arquivo | O que espera | Estado hoje |
|---|---|---|
| `TutorAsk.tsx` | `POST /api/v1/tutor/ask` para pergunta livre | só SSE; pergunta livre não chega |
| `PaywallCard.tsx` | integração Stripe Checkout | botão sem destino |
| `peer-stats.ts` | `GET /api/v1/module/:id/stats` | **os números são locais** |

O `peer-stats` é o problema de honestidade. A interface sugere comparação com outros
alunos — "quantas pessoas concluíram", "sua posição" — e o dado é do `localStorage` do
próprio visitante. **A tela afirma uma medição que não faz.** Isso é pior que um recurso
faltando: é um número inventado com aparência de dado, na mesma plataforma cujo
diferencial declarado é "prova social honesta".

Registro de medição, para não mandar ninguém atrás de fantasma: uma varredura por
`TODO|FIXME` no frontend devolve 20 ocorrências e **nenhuma é marcador de dívida** — são
a palavra portuguesa *todo* em nome de teste ("TODOS os módulos"). Os três itens acima
foram confirmados um a um.

## What Changes

**Ordem por honestidade, não por facilidade.**

**1. `peer-stats` primeiro, e em duas etapas.** Etapa imediata, que não depende de
backend: o texto exibido deixa de afirmar comparação que não existe. Ou fala do próprio
progresso, ou diz explicitamente que o número é local. Etapa seguinte: o endpoint de
estatística agregada por módulo, e então a interface volta a comparar — medindo.

**2. `POST /api/v1/tutor/ask`** para pergunta livre, complementando o SSE que já existe.

**3. Stripe Checkout** no `PaywallCard`, que é o único caminho de monetização declarado
da plataforma — simulados de certificação, sem paywall em conteúdo educacional.

### Non-goals

- **Não** transformar o tutor em produto novo. É a pergunta livre sobre o módulo aberto.
- **Não** introduzir paywall em conteúdo. O `CLAUDE.md` declara conteúdo 100% gratuito, e
  a monetização é o anel de simulados.

## Capabilities

### New Capabilities
- `estatistica-de-modulo`: o que a plataforma pode afirmar sobre o comportamento de
  outros alunos, e o que ela não pode afirmar enquanto não medir.
- `tutor-pergunta-livre`: pergunta livre sobre o módulo aberto, com o contrato de
  resposta.
- `cobranca-de-simulado`: o caminho de pagamento do anel de simulados.

## Impact

- **Backend Go:** dois endpoints novos (`/tutor/ask`, `/module/:id/stats`) e o webhook de
  Stripe; agregação por módulo precisa decidir se lê de `progress` ou de tabela própria.
- **Frontend:** `TutorAsk.tsx`, `PaywallCard.tsx`, `peer-stats.ts` e o **texto** que a
  interface exibe hoje.
- **Privacidade:** estatística agregada por módulo não pode permitir reidentificação. Com
  base pequena, "3 pessoas concluíram" com filtro de trilha e data chega perto disso —
  precisa de piso de agregação.
- **Custo:** `/tutor/ask` chama modelo; sem limite por usuário, é vetor de gasto.
