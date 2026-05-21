// Package handlers — AdminEvents: feed de interações do usuário pro admin.
//
// Igual a admin_views.go, mas em cima da tabela user_events (mig 52).
// Permite filtrar por type/base/user/target/período.
package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// AdminEventsRepository — port de leitura.
type AdminEventsRepository interface {
	ListEvents(ctx context.Context, q ListEventsQuery) ([]EventEntry, error)
	CountByType(ctx context.Context, since, until time.Time) ([]EventTypeCount, error)
}

// ListEventsQuery — filtros.
type ListEventsQuery struct {
	EventType  string
	TargetType string
	TargetID   string
	BaseSlug   string
	UserEmail  string
	Since      time.Time
	Until      time.Time
	Limit      int
}

// EventEntry — uma linha do feed.
type EventEntry struct {
	ID              int64           `json:"id"`
	OccurredAt      time.Time       `json:"occurredAt"`
	EventType       string          `json:"eventType"`
	TargetType      string          `json:"targetType,omitempty"`
	TargetID        string          `json:"targetId,omitempty"`
	BaseSlug        string          `json:"baseSlug,omitempty"`
	Path            string          `json:"path,omitempty"`
	UserEmail       string          `json:"userEmail,omitempty"`
	UserDisplayName string          `json:"userDisplayName,omitempty"`
	AnonID          string          `json:"anonId,omitempty"`
	SessionID       string          `json:"sessionId,omitempty"`
	ValueNum        *float64        `json:"valueNum,omitempty"`
	Metadata        json.RawMessage `json:"metadata,omitempty"`
	DisplayLabel    string          `json:"displayLabel"`
}

// EventTypeCount — distribuição por event_type.
type EventTypeCount struct {
	EventType string `json:"eventType"`
	Count     int64  `json:"count"`
}

// ListEventsResponse — envelope.
type ListEventsResponse struct {
	Events []EventEntry     `json:"events"`
	Count  int              `json:"count"`
	ByType []EventTypeCount `json:"byType"`
	Since  time.Time        `json:"since"`
	Until  time.Time        `json:"until"`
}

// AdminEventsHandler — GET /api/v1/admin/events.
type AdminEventsHandler struct {
	repo AdminEventsRepository
}

func NewAdminEventsHandler(repo AdminEventsRepository) *AdminEventsHandler {
	return &AdminEventsHandler{repo: repo}
}

// List — GET /api/v1/admin/events
//
// Query params: type, targetType, targetId, base, user, since, until, limit.
func (h *AdminEventsHandler) List(w http.ResponseWriter, r *http.Request) {
	if h.repo == nil {
		WriteError(w, http.StatusServiceUnavailable, "admin events não configurado", "service-unavailable")
		return
	}
	q := parseListEventsQuery(r)

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	entries, err := h.repo.ListEvents(ctx, q)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	// Distribuição por tipo no mesmo período (visão de funil).
	byType, _ := h.repo.CountByType(ctx, q.Since, q.Until)

	for i := range entries {
		entries[i].DisplayLabel = computeDisplayLabelFromEvent(entries[i])
	}

	w.Header().Set("Cache-Control", "private, max-age=10")
	WriteJSON(w, http.StatusOK, ListEventsResponse{
		Events: entries,
		Count:  len(entries),
		ByType: byType,
		Since:  q.Since,
		Until:  q.Until,
	})
}

func computeDisplayLabelFromEvent(e EventEntry) string {
	if e.UserDisplayName != "" && e.UserEmail != "" {
		return e.UserDisplayName + " <" + e.UserEmail + ">"
	}
	if e.UserEmail != "" {
		return e.UserEmail
	}
	if e.UserDisplayName != "" {
		return e.UserDisplayName
	}
	if e.AnonID != "" {
		short := e.AnonID
		if len(short) > 8 {
			short = short[:8]
		}
		return "Visitante anônimo (" + short + ")"
	}
	return "Desconhecido"
}

func parseListEventsQuery(r *http.Request) ListEventsQuery {
	q := ListEventsQuery{Limit: 50}
	v := r.URL.Query()
	q.EventType = strings.TrimSpace(v.Get("type"))
	q.TargetType = strings.TrimSpace(v.Get("targetType"))
	q.TargetID = strings.TrimSpace(v.Get("targetId"))
	q.BaseSlug = strings.TrimSpace(v.Get("base"))
	q.UserEmail = strings.ToLower(strings.TrimSpace(v.Get("user")))

	if s := v.Get("since"); s != "" {
		if t, err := time.Parse(time.RFC3339, s); err == nil {
			q.Since = t
		}
	}
	if s := v.Get("until"); s != "" {
		if t, err := time.Parse(time.RFC3339, s); err == nil {
			q.Until = t
		}
	}
	if q.Since.IsZero() {
		q.Since = time.Now().UTC().Add(-24 * time.Hour)
	}
	if q.Until.IsZero() {
		q.Until = time.Now().UTC()
	}

	if s := v.Get("limit"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 && n <= 500 {
			q.Limit = n
		}
	}
	return q
}
