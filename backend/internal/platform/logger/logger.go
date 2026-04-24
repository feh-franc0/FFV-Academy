// Package logger configura o logger estruturado da aplicação.
//
// PADRÕES:
//   - SRP: responsabilidade única de criar e configurar loggers.
//   - Usa log/slog da stdlib (Go 1.21+) — zero dependência externa.
//   - Logs em JSON para produção; texto colorido em desenvolvimento.
//   - PII: NUNCA logar email, telefone ou dados pessoais — usar IDs.
package logger

import (
	"context"
	"log/slog"
	"os"
)

type contextKey string

const (
	keyRequestID contextKey = "request_id"
	keyUserID    contextKey = "user_id"
	keyTraceID   contextKey = "trace_id"
)

// New cria um slog.Logger com o nível e formato corretos para o ambiente.
//
// Em produção: JSON, nível INFO.
// Em desenvolvimento: texto, nível DEBUG.
func New(env string) *slog.Logger {
	level := slog.LevelInfo
	if env == "development" || env == "test" {
		level = slog.LevelDebug
	}

	opts := &slog.HandlerOptions{
		Level:     level,
		AddSource: env == "development",
	}

	var handler slog.Handler
	if env == "production" {
		handler = slog.NewJSONHandler(os.Stdout, opts)
	} else {
		handler = slog.NewTextHandler(os.Stdout, opts)
	}

	return slog.New(handler)
}

// WithRequestID retorna um contexto com o request ID embutido.
func WithRequestID(ctx context.Context, requestID string) context.Context {
	return context.WithValue(ctx, keyRequestID, requestID)
}

// WithUserID retorna um contexto com o user ID embutido.
func WithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, keyUserID, userID)
}

// WithTraceID retorna um contexto com o trace ID embutido.
func WithTraceID(ctx context.Context, traceID string) context.Context {
	return context.WithValue(ctx, keyTraceID, traceID)
}

// FromContext extrai atributos de observabilidade do contexto e retorna um logger
// enriquecido com esses campos.
func FromContext(ctx context.Context, base *slog.Logger) *slog.Logger {
	l := base
	if v, ok := ctx.Value(keyRequestID).(string); ok && v != "" {
		l = l.With("request_id", v)
	}
	if v, ok := ctx.Value(keyUserID).(string); ok && v != "" {
		l = l.With("user_id", v)
	}
	if v, ok := ctx.Value(keyTraceID).(string); ok && v != "" {
		l = l.With("trace_id", v)
	}
	return l
}
