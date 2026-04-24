// Package audit contém o modelo de domínio e o port de audit log.
//
// PADRÕES:
//   - DDD: Entry é o value object imutável do evento auditável.
//   - Clean Arch: apenas a interface (port) vive aqui; a impl concreta fica em
//     infrastructure/audit.
//   - Fire-and-forget: falhas na escrita NÃO devem bloquear o use case que auditou.
package audit

import (
	"context"
	"time"
)

// ActorType classifica quem originou a ação.
type ActorType string

const (
	ActorUser    ActorType = "user"
	ActorAdmin   ActorType = "admin"
	ActorWebhook ActorType = "webhook"
	ActorSystem  ActorType = "system"
)

// Entry representa um evento auditável.
// Campos opcionais são strings/maps vazios (não ponteiros) para simplicidade.
type Entry struct {
	ActorID    string         // user_id do ator; vazio para atores anônimos
	ActorType  ActorType      // user|admin|webhook|system
	Action     string         // e.g. "account.export", "attempt.cancel"
	TargetType string         // tipo da entidade alvo (opcional)
	TargetID   string         // id da entidade alvo (opcional)
	Metadata   map[string]any // dados extras (JSON)
	IP         string
	UserAgent  string
	RequestID  string
	OccurredAt time.Time
}

// Service é o port de audit log.
//
// Contratos:
//   - AuditLog deve ser SEMPRE não-bloqueante (fire-and-forget internamente).
//   - Implementações que ficarem lentas ou falharem devem apenas logar em WARN
//     e jamais retornar erro que suba para o handler HTTP.
type Service interface {
	AuditLog(ctx context.Context, entry Entry) error
}

// NoopService é uma implementação no-op para testes ou cenários de desabilitação.
type NoopService struct{}

func (NoopService) AuditLog(_ context.Context, _ Entry) error { return nil }
