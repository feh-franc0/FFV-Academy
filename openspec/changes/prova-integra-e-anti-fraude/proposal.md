## Why

O produto pago da plataforma é o simulado, e o fluxo cronometrado — o que emite
certificado — está **quebrado e fraudável ao mesmo tempo**. Não é hipótese: cada item
abaixo foi relido no código durante a auditoria de 10/ago/2026.

| # | Defeito | Evidência | Sev |
|---|---|---|---|
| 1 | **Estourar o tempo pontua sem as respostas dadas.** O efeito do timer tem deps `[hydrated]`; o `finalize` capturado no closure lê o `attempt` daquele render. Quem responde 65 questões e deixa o tempo acabar tira ~0. | `SimuladoRunner.tsx:135-151`, `:196-209` (`attempt` é `useState`, `:44`) | **P0** |
| 2 | **Zero anti-fraude.** O gabarito viaja no payload (`DBQuestionDTO.CorrectID`), o score é calculado no cliente, o deadline mora em `localStorage` editável. | `dto.go:283`; `simulados.ts:232-255`; `SimuladoRunner.tsx:90` | **P0** |
| 3 | **Gabarito exposto a qualquer usuário logado.** As rotas `study/random`, `questions` e `batch` serializam `correctId` + explicação com só `Authenticate`. Pagina-se o banco antes da prova. | `study_handler.go:49,80`; `dto.go:283-296` | **P1** |
| 4 | **Voltar no navegador destrói o resultado.** Back para `/fazer` recria attempt (slot único) e apaga o finalizado; Forward mostra 0%. | `SimuladoRunner.tsx:65-75` + `simulados.ts:212-216` | **P1** |
| 5 | **XP recreditável por aba nova.** A trava é `sessionStorage`; nova aba credita XP e badges de novo. | `ResultadoClient.tsx:58-67` + `engine.ts:405-419` | **P1** |
| 6 | **Timer global reseta.** A chave `SIMULADO_TIMER` é única para a app; abrir outro simulado sobrescreve o deadline do primeiro, que ao voltar recria deadline cheio. | `SimuladoRunner.tsx:83-92` | **P1** |
| 7 | **Resultado vira 0% em falha de fetch.** `ResultadoClient` recalcula com o que buscou; se o fetch falha, `questions=[]` → 0/0 num simulado aprovado. | `ResultadoClient.tsx:70-78` | **P1** |
| 8 | **`/fazer` trava em "Carregando questões…" sem saída.** Falha de rede/sessão/banco vazio colapsam no mesmo spinner permanente; sem retry, sem link. | `SimuladoRunner.tsx:122-128`, `:155-157` | **P0 (UX)** |
| 9 | **Motor server-authoritative existe e está morto.** Start/Answer/Finish idempotentes, deadline e score no servidor — tudo testado, nenhum consumidor. E, se ligado hoje, pontuaria contra `catalog.json` (1 questão), não contra o Postgres. | `finish_attempt.go:49-95`; `catalog.json`; adapter órfão `simulados-api.ts` | **P1** |
| 10 | **Segunda tentativa impossível.** `status` nunca é atualizado; a unique `(user,simulado,status)` bloqueia o segundo start e o recovery filtra `finished_at IS NULL`. | `attempt_repo.go:36-40,78-88`; `000004_*.sql:16` | **P2** |
| 11 | **Lost update nas respostas.** `AnswerQuestion` faz read-modify-write do JSONB inteiro sem lock/tx. | `answer_question.go:42-79` | **P2** |
| 12 | **Certificado inverificável por terceiros.** Emitido sem `attemptId` → modo mock, hash no browser, só no localStorage do emissor. | `CertificateModal.tsx:31-37` + `certificates.ts:75-108` | **P1** |

A causa-raiz comum: **a fonte de verdade da prova é o cliente.** O backend já tem o motor
correto; o frontend nunca foi ligado a ele, e o resultado é um exame que dá para burlar e
que ainda assim pontua errado.

## What Changes

Mover a autoridade da prova para o servidor e remover o gabarito do caminho da prova.

- Ligar o frontend ao motor `simulados-api.ts` (Start/Answer/Finish server-side), aposentando o cálculo de score no cliente para o modo **prova**.
- Criar um DTO de prova/estudo **sem** `correctId`/`explanation`; revelar a resposta certa só após `finish` (ou, no modo estudo, item a item pela rota que já é assumidamente de estudo).
- Corrigir o `status` do attempt no finish/cancel e a constraint de segunda tentativa.
- Tornar `AnswerQuestion` atômico (tx + lock ou `jsonb_set`).
- Timer, XP e crédito idempotentes por `attemptId` server-side, não por `sessionStorage`.
- `/fazer` e `/resultado` com estados distintos de carregando/erro/sucesso e retry.
- Certificado só emitido a partir de `attemptId` finalizado no servidor, verificável em `/verificar`.

## Fora de escopo

- Paywall / cobrança do simulado — vive em `integracoes-de-backend-pendentes`.
- O modo **estudo livre** (sortear questão com explicação) continua entregando `correctId` por design — o corte de `correctId` vale para o modo **prova**.
- Redesenho visual do runner além dos estados de carga/erro.

## Impact

- Rotas: `frontend/src/components/simulado/*`, `frontend/src/lib/simulados*.ts`, `frontend/src/lib/certificates.ts`.
- Backend: `study_handler.go`, `dto.go`, `attempt_repo.go`, `answer_question.go`, `finish_attempt.go`, migration nova para `status`/constraint.
- Risco: mudança no contrato das rotas de questão (quebra o cliente atual de propósito — é o ponto). Requer coordenação frontend+backend num único release.
- Achados cobertos: F-P0-2, B-P1-1/#4, 3.2–3.12, backend #6, #7, UX-1.
