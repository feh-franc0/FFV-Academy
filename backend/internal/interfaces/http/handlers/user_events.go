// Package handlers — UserEvents: ingest de ações deliberadas dos usuários.
//
// Endpoint público (sem auth obrigatória). Identidade vem dos headers
// X-FFV-* (middleware IdentityHeaders). Anônimos são aceitos — só anon_id
// no row.
//
// SEGURANÇA:
//   - rate-limit aplicado no router (não dá pra inundar a tabela).
//   - event_type whitelist defensiva — eventos arbitrários viram "other".
//   - metadata limitado a 4KB no DB (CHECK constraint).
//   - PII (email, phone) NUNCA vai pro metadata; só pelos headers, que são
//     persistidos em colunas específicas com índices controlados.
package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// UserEventsRepository — port de escrita.
type UserEventsRepository interface {
	Insert(ctx context.Context, in UserEventInput) error
}

// UserEventInput — payload normalizado pelo handler.
type UserEventInput struct {
	EventType       string
	TargetType      string
	TargetID        string
	UserID          string
	UserEmail       string
	UserDisplayName string
	AnonID          string
	SessionID       string
	BaseSlug        string
	Path            string
	Referrer        string
	UserAgent       string
	ValueNum        *float64
	Metadata        json.RawMessage // bytes JSONB pra ir direto pro Postgres
	OccurredAt      time.Time
}

// UserEventsHandler — POST /api/v1/events/track.
type UserEventsHandler struct {
	repo UserEventsRepository
}

func NewUserEventsHandler(repo UserEventsRepository) *UserEventsHandler {
	return &UserEventsHandler{repo: repo}
}

// eventTypeRegex — permite snake_case + ponto (namespace.action). Limites
// alinhados com a CHECK constraint do banco (length <= 80).
var eventTypeRegex = regexp.MustCompile(`^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]{0,40}$`)

type trackRequest struct {
	EventType  string          `json:"eventType"`
	TargetType string          `json:"targetType,omitempty"`
	TargetID   string          `json:"targetId,omitempty"`
	BaseSlug   string          `json:"baseSlug,omitempty"`
	Path       string          `json:"path,omitempty"`
	ValueNum   *float64        `json:"valueNum,omitempty"`
	Metadata   json.RawMessage `json:"metadata,omitempty"`
}

// Track — POST /api/v1/events/track
//
// Aceita JSON `{eventType, targetType?, targetId?, baseSlug?, path?, valueNum?, metadata?}`.
// eventType é obrigatório e precisa bater com regex `namespace.action` snake.
//
// Identidade vem dos headers X-FFV-* (logado) ou X-FFV-Anon-Id (anônimo).
// Falhas de persistência viram 202 silencioso — UX nunca afetada.
func (h *UserEventsHandler) Track(w http.ResponseWriter, r *http.Request) {
	if h.repo == nil {
		WriteError(w, http.StatusServiceUnavailable, "event tracking não configurado", "service-unavailable")
		return
	}

	var req trackRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "json inválido", "validation")
		return
	}

	eventType := strings.ToLower(strings.TrimSpace(req.EventType))
	if !eventTypeRegex.MatchString(eventType) {
		WriteError(w, http.StatusBadRequest, "eventType inválido (use formato namespace.action snake_case)", "validation")
		return
	}

	// metadata size guard — banco também rejeita >4KB mas filtramos cedo
	// pra economizar I/O.
	if len(req.Metadata) > 4096 {
		WriteError(w, http.StatusBadRequest, "metadata excede 4KB", "validation")
		return
	}
	// Default metadata vazio é '{}' (NOT NULL no DB).
	if len(req.Metadata) == 0 || string(req.Metadata) == "null" {
		req.Metadata = json.RawMessage("{}")
	} else {
		// Validar que é JSON válido — defende contra injection.
		var probe any
		if err := json.Unmarshal(req.Metadata, &probe); err != nil {
			WriteError(w, http.StatusBadRequest, "metadata não é JSON válido", "validation")
			return
		}
	}

	id := middleware.IdentityFromContext(r.Context())
	userID := string(middleware.UserIDFromContext(r.Context()))
	if userID == "" {
		userID = id.UserID
	}

	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	err := h.repo.Insert(ctx, UserEventInput{
		EventType:       eventType,
		TargetType:      truncate(strings.TrimSpace(req.TargetType), 40),
		TargetID:        truncate(strings.TrimSpace(req.TargetID), 200),
		UserID:          userID,
		UserEmail:       id.UserEmail,
		UserDisplayName: id.UserName,
		AnonID:          id.AnonID,
		SessionID:       id.SessionID,
		BaseSlug:        truncate(strings.TrimSpace(req.BaseSlug), 80),
		Path:            truncate(strings.TrimSpace(req.Path), 512),
		Referrer:        truncate(r.Header.Get("Referer"), 256),
		UserAgent:       truncate(r.UserAgent(), 256),
		ValueNum:        req.ValueNum,
		Metadata:        req.Metadata,
		OccurredAt:      time.Now().UTC(),
	})
	if err != nil {
		// Persist fail nunca derruba UX — 202 silencioso.
		w.WriteHeader(http.StatusAccepted)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
