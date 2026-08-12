## 1. Rate-limit e body-limit

- [x] 1.1 `rl:cert` migrado para `NewRateLimiterFailClosed` (`router.go`) — a rota que protege contra enumeração de hash de certificado não pode virar sem-limite quando o Redis cai.
- [x] 1.2 `limit_req` adicionado à location do webhook Stripe em `api.conf`, com zona nova `api_webhook` (300r/m, burst 100) em `nginx.conf` — generosa o bastante pra rajada legítima do Stripe, mas fecha o vetor de flood anônimo forçando HMAC.
- [x] 1.3 `BodyLimit` em `/api/v1/tutor/ask` (8 KB) e `/api/v1/billing/checkout` (4 KB) — os dois DTOs são pequenos e fixos ({simuladoId, questionId, kind} e {productId}), os limites são folgados.

## 2. X-Request-ID e auditoria

- [x] 2.1 `X-Request-ID` client-supplied validado por regex (`^[a-zA-Z0-9-]{1,64}$`) em `RequestID` (`common.go`) — valor fora do formato é descartado em favor de um UUID gerado no servidor, antes de entrar no contexto (de onde logs E auditoria leem).
- [x] 2.2 `AuditLog` ganhou `AuditLogOptions{IncludeFailures: bool}` — com a opção ligada, registra também 4xx/5xx. Aplicado ao grupo `/api/v1/auth/*`, que até então não tinha NENHUMA trilha (nem sucesso, nem falha), porque fica fora do grupo autenticado onde o `AuditLog` original rodava.
- [x] 2.3 Webhook Stripe (`POST /api/v1/webhooks/stripe`) ganhou a mesma opção — assinatura inválida rejeitada (401/400) e evento processado (200) agora geram linha de auditoria.
- [x] 2.4 Goroutine de auditoria virou `auditWorker`: canal com capacidade 256 processado por uma única goroutine dedicada por instância do middleware, em vez de uma goroutine nova por request. Fila cheia descarta com log (`slog.Warn`) em vez de crescer sem limite ou bloquear a resposta.

## 3. Métricas

- [x] 3.1 ACL de `/metrics` reavaliada: mantida a faixa `172.16.0.0/12` (não existe coletor Prometheus real rodando ainda — ver "Fora de escopo" do proposal), mas a decisão e o critério pra restringir no futuro (IP fixo do coletor quando ele existir) ficaram documentados em comentário no `api.conf`.
- [x] 3.2 Label de rota em `metrics.go` usa valor fixo `"unmatched"` quando `RoutePattern()` vem vazio, em vez do path cru — fecha a explosão de cardinalidade por sonda de 404 (bot varrendo `/wp-admin`, `/.env`, etc.).

## 4. Travar

- [x] 4.1 `Test_RateLimiter_FailClosed_RedisDown_Returns503` (+ o contraste `Test_RateLimiter_FailOpen_RedisDown_ServesRequest`) — Redis apontado para porta fechada (`127.0.0.1:1`), prova 503 sem chamar o handler.
- [x] 4.2 `Test_RequestID_MaliciousHeader_ReplacedWithServerGenerated` (log) + `Test_AuditLog_MaliciousRequestID_NeverReachesAuditEntry` (auditoria, com a cadeia real `RequestID → AuditLog`) — `X-Request-ID` com quebra de linha nunca chega cru em nenhum dos dois destinos.
- [x] 4.3 `Test_AuditLog_IncludeFailures_RecordsLoginFailure` — uma tentativa de `/api/v1/auth/verify` com 401 gera exatamente 1 linha de auditoria; `Test_AuditLog_Default_OnlyRecords2xx` prova o contraste (comportamento antigo preservado onde `IncludeFailures` não é usado).
- [x] 4.4 `go build ./...`, `go vet ./...`, `go test ./...` (22 pacotes, 0 falhas) e `make lint`/`make test-security` verdes.
