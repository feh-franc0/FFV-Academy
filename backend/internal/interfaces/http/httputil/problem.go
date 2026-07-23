// Package httputil fornece utilitários HTTP compartilhados entre handlers e middleware.
//
// PADRÃO: RFC 7807 (Problem+JSON) para erros; application/json para sucesso.
// Pacote separado para evitar ciclo de importação entre handlers e middleware.
package httputil

import (
	"encoding/json"
	"net/http"
)

// ProblemJSON é o formato de erro RFC 7807.
type ProblemJSON struct {
	Type   string `json:"type"`
	Title  string `json:"title"`
	Status int    `json:"status"`
	Detail string `json:"detail,omitempty"`
}

// WriteError escreve uma resposta de erro no formato RFC 7807 com
// Content-Type: application/problem+json.
func WriteError(w http.ResponseWriter, status int, detail, errorType string) {
	problem := ProblemJSON{
		Type:   "https://api.fernandofrancovalle.com/errors/" + errorType,
		Title:  http.StatusText(status),
		Status: status,
		Detail: detail,
	}
	// Seta o Content-Type ANTES de WriteJSON pra evitar que ele sobrescreva
	// para application/json. WriteJSON respeita Content-Type pré-existente.
	w.Header().Set("Content-Type", "application/problem+json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(problem)
}

// WriteJSON serializa v como JSON (Content-Type: application/json) e escreve
// na resposta. Para erros RFC 7807, use WriteError em vez disso.
//
// Se o caller já setou Content-Type, este método não sobrescreve.
func WriteJSON(w http.ResponseWriter, status int, v interface{}) {
	if w.Header().Get("Content-Type") == "" {
		w.Header().Set("Content-Type", "application/json")
	}
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
