# Security Tests

Suíte isolada de testes de segurança defensiva. Todos os arquivos têm a build tag
`//go:build security` — só rodam explicitamente.

## Como rodar

```bash
# Todos os testes de segurança
go test ./test/security/... -tags security -timeout 60s

# Apenas IDOR
go test ./test/security/... -tags security -run Test_IDOR -v

# Benchmarks de timing attack (runtime por operação)
go test ./test/security/... -tags security -run ^$ -bench Benchmark_MagicToken -benchtime=1s
```

## Cobertura

| Arquivo | O que valida |
|---------|--------------|
| `jwt_tampering_test.go` | Assinatura alterada, `alg=none`, token expirado |
| `idor_test.go` | User B não acessa recursos de User A (via use cases) |
| `magic_token_timing_test.go` | `subtle.ConstantTimeCompare` não vaza timing |
| `cors_test.go` | Allowlist de origin, preflight OPTIONS |

Integração com CI: adicione um step que roda `go test ./test/security/... -tags security`.
