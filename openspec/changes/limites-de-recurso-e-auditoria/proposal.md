## Why

A auditoria (P-09, P-10, P-13, P-15) encontrou uma família de lacunas em limites de recurso e observabilidade:

- `rl:cert` (verificação de certificado) usa rate-limiter **fail-open**: se o Redis cair, a rota fica sem
  limite — justo a rota que protege contra enumeração de hash de certificado.
- O webhook Stripe não tem rate-limit na borda (Nginx) nem no app; qualquer request anônimo força o app a
  computar HMAC sobre até 1 MB antes de rejeitar.
- `/tutor/ask` (chamada paga por request ao Anthropic) e `/billing/checkout` não têm `BodyLimit`.
- `X-Request-ID`, fornecido pelo cliente, é ecoado sem validação em logs e em linhas de auditoria —
  log/audit injection.
- A tabela de auditoria só cobre o grupo autenticado e só respostas 2xx — tentativas de login falhas e o
  webhook não deixam trilha.
- A goroutine de auditoria é disparada solta, sem pool nem back-pressure.
- `/metrics` é protegido só por ACL de rede ampla (`172.16.0.0/12`) e usa `r.URL.Path` cru como label
  Prometheus em rotas não casadas — cardinalidade inflável por quem sonda 404s.

## What Changes

- `rl:cert` vira fail-closed.
- Rate-limit adicionado à location do webhook no Nginx (a assinatura Stripe já protege a lógica; o RL protege CPU).
- `BodyLimit` adicionado a `/tutor/ask` e `/billing/checkout`.
- `X-Request-ID` client-supplied é validado (charset + tamanho) antes de propagar; valor inválido é descartado
  em favor de um UUID gerado no servidor.
- Auditoria passa a cobrir também 4xx/5xx do grupo de auth (falhas de login) e o webhook.
- Goroutine de auditoria vira um worker com fila limitada (drop-with-log em vez de crescimento ilimitado).
- ACL de `/metrics` restrita ao IP do coletor real (não a faixa RFC-1918 inteira); label de rota cai para um
  valor fixo (`"unmatched"`) quando `RoutePattern()` vem vazio.

## Fora de escopo

- Não adiciona um sistema de observabilidade novo (Grafana/Loki) — só fecha as lacunas pontuais encontradas.

## Impact

- `backend/internal/interfaces/http/middleware/{ratelimit,common,audit,metrics}.go`
- `backend/internal/interfaces/http/router.go`
- `backend/deployments/nginx/conf.d/api.conf`
- Achados cobertos: P-09, P-10, P-13, P-15.
