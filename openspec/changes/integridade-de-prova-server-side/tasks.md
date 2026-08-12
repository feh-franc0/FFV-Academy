## 1. Backend — gating por tentativa ativa

- [x] 1.1 `study/random`: quando o usuário tem tentativa ativa do simulado, servir `ExamQuestionDTO` (sem gabarito); sem tentativa ativa, comportamento atual (estudo livre)
      — função de pacote `hasActiveAttempt(r, attemptRepo, simuladoID)` em `study_handler.go`, usada em `GetRandomQuestions`.
- [x] 1.2 `questions` (listagem paginada): mesma regra de 1.1
      — `SimuladoHandler.ListSimuladoQuestions` (`simulado_handler.go`) ganhou campo `attemptRepo` + setter `WithAttemptRepoForQuestions`, usa a mesma `hasActiveAttempt`.
- [x] 1.3 `questions/batch`: exigir que os IDs pedidos sejam subconjunto de `question_ids` de uma tentativa **finalizada** do próprio usuário; sem tentativa finalizada correspondente, recusar (403) os IDs não cobertos
      — implementado como omissão de gabarito por ID (não 403 do request inteiro — decisão registrada: um ID não coberto vem como `ExamQuestionDTO`, os cobertos vêm completos, na mesma resposta). Novo `AttemptRepository.ListFinishedByUserAndSimulado` + `AttemptRepo` Postgres impl. Função `ownedFinishedQuestionIDs` monta a união de `QuestionIDs()` de todas as tentativas finalizadas do usuário para aquele simulado.
- [x] 1.4 Rate-limit na rota `batch`
      — `rl:questions-batch`, 30/min, fail-closed (`router.go`).

## 2. Travar

- [x] 2.1 Teste de contrato: com tentativa ativa, `study/random` e `questions` não retornam `correctId`/`explanation`
      — `Test_StudyHandler_GetRandomQuestions_ActiveAttempt_OmitsCorrectID`, `Test_SimuladoHandler_ListSimuladoQuestions_ActiveAttempt_OmitsCorrectID`.
- [x] 2.2 Teste de contrato: `questions/batch` com IDs de tentativa de outro usuário (ou sem tentativa finalizada correspondente) recusa
      — `Test_StudyHandler_GetQuestionsByIDs_NotOwned_OmitsCorrectID` (ID não coberto por nenhuma tentativa finalizada do usuário não revela gabarito, mesmo lado a lado com um ID que revela); `Test_StudyHandler_GetQuestionsByIDs_ActiveAttempt_OmitsCorrectIDForAll`; `Test_StudyHandler_GetQuestionsByIDs_NoUserInContext_FailsClosed`.
- [x] 2.3 Teste: estudo livre (sem tentativa ativa) continua funcionando normalmente, com gabarito
      — `Test_StudyHandler_GetRandomQuestions_NoActiveAttempt_IncludesCorrectID`, `Test_SimuladoHandler_ListSimuladoQuestions_NoActiveAttempt_IncludesCorrectID`, `Test_StudyHandler_GetQuestionsByIDs_OwnFinishedAttempt_IncludesCorrectID`.
- [x] 2.4 Atualizar `backend/CLAUDE.md` com o contrato final destas três rotas
      — nova nota "Gabarito nunca sai enquanto há prova ativa" em Key Design Decisions.

Verificado: `go build ./...`, `go vet ./...` (+ security/integration), `gofmt -l` limpo, `go test ./...` (8 casos novos, todos verdes).
