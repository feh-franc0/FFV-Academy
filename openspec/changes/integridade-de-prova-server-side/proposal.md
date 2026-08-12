## Why

A auditoria de segurança de 11/ago/2026 (`AUDITORIA_SEGURANCA_2026-08.md`, achado P-01) confirmou que, apesar do
runner de prova (`SimuladoRunner.tsx`) receber um DTO sem gabarito, três rotas laterais autenticadas
(`GET /simulados/{id}/study/random`, `GET /simulados/{id}/questions`, `GET /simulados/{id}/questions/batch?ids=`)
servem `dbQuestionToDTO`, que inclui `correctId` e a explicação completa, **sem checar se o usuário tem uma
tentativa ativa daquele simulado** e **sem checar ownership dos IDs pedidos**. `questions/batch` aceita até 200
IDs arbitrários por chamada e não tem rate-limit.

Isso anula o trabalho do pack `prova-integra-e-anti-fraude` (mesma sessão): o console do navegador, durante uma
prova cronometrada, pode chamar `fetchQuestionsByIds(questions.map(q=>q.id))` e receber o gabarito completo. O
produto pago (simulado de certificação) perde toda integridade de resultado.

## What Changes

- `study/random` e `questions` passam a checar se o usuário tem uma tentativa **ativa** daquele simulado; se
  tiver, servem o DTO sem gabarito (`ExamQuestionDTO`, já existe) em vez do DTO completo.
- `questions/batch` passa a exigir que os IDs pedidos sejam um subconjunto de `question_ids` de uma tentativa
  **finalizada e do próprio usuário** — não serve mais qualquer ID para qualquer autenticado.
- Rate-limit adicionado à rota `batch`.
- Testes de contrato que travam o invariante: nenhum DTO com `correctId` sai de um contexto onde o usuário tem
  tentativa ativa do mesmo simulado.

## Fora de escopo

- Estudo livre sem simulado ativo continua expondo gabarito por design (é a proposta "100% gratuito, sem
  paywall de conteúdo" da plataforma) — o alvo é só o caso em que há uma prova cronometrada em andamento.
- Não mexe no DTO do runner em si (`ExamQuestionDTO`), que já está correto.

## Impact

- `backend/internal/interfaces/http/handlers/study_handler.go`, `simulado_handler.go`, `dto.go`
- `backend/internal/domain/simulado/repository.go` (possível novo método de lookup de tentativa por usuário)
- `backend/internal/interfaces/http/router.go` (rate-limit em `batch`)
- Achado coberto: P-01 (Alta, gate de lançamento).
