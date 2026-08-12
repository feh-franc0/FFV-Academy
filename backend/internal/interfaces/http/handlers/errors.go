// Package handlers implementa os handlers HTTP.
//
// PADRÃO: RFC 7807 (Problem+JSON) para todos os erros.
package handlers

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/interfaces/http/httputil"
)

// WriteError escreve uma resposta de erro no formato RFC 7807.
func WriteError(w http.ResponseWriter, status int, detail, errorType string) {
	httputil.WriteError(w, status, detail, errorType)
}

// WriteJSON serializa v como JSON e escreve na resposta.
func WriteJSON(w http.ResponseWriter, status int, v interface{}) {
	httputil.WriteJSON(w, status, v)
}

// HandleDomainError mapeia erros de domínio para status HTTP adequados
// e loga o erro com request_id para correlação. Erros 5xx são ERROR; 4xx são WARN.
func HandleDomainError(w http.ResponseWriter, err error) {
	HandleDomainErrorCtx(nil, w, err)
}

// HandleDomainErrorCtx é idêntico a HandleDomainError mas propaga o request
// para capturar request_id/header e logar com contexto.
// r pode ser nil (usado pelo HandleDomainError legado).
func HandleDomainErrorCtx(r *http.Request, w http.ResponseWriter, err error) {
	var status int
	var detail, etype string
	switch {
	case errors.Is(err, shared.ErrNotFound):
		status, etype = http.StatusNotFound, "not-found"
	case errors.Is(err, shared.ErrUnauthorized):
		status, etype = http.StatusUnauthorized, "unauthorized"
	case errors.Is(err, shared.ErrForbidden):
		status, etype = http.StatusForbidden, "forbidden"
	case errors.Is(err, shared.ErrConflict):
		status, etype = http.StatusConflict, "conflict"
	case errors.Is(err, shared.ErrRegistrationRequired):
		status, etype = http.StatusBadRequest, "registration-required"
	case errors.Is(err, shared.ErrValidation):
		status, etype = http.StatusBadRequest, "validation-error"
	case errors.Is(err, shared.ErrRateLimited):
		status, etype = http.StatusTooManyRequests, "rate-limited"
	default:
		status, etype = http.StatusInternalServerError, "internal-error"
	}
	if status >= 500 {
		detail = "erro interno" // não vazar detalhes de erro interno para o cliente
	} else {
		detail = err.Error()
	}

	// Log com request_id, method, path, status. Erros internos = ERROR; demais = INFO.
	attrs := []any{"status", status, "error_type", etype, "error", err.Error()}
	if r != nil {
		if rid := w.Header().Get("X-Request-ID"); rid != "" {
			attrs = append(attrs, "request_id", rid)
		}
		attrs = append(attrs, "method", r.Method, "path", r.URL.Path)
	}
	if status >= 500 {
		slog.Error("handler error", attrs...)
	} else {
		slog.Info("handler domain error", attrs...)
	}

	WriteError(w, status, detail, etype)
}
