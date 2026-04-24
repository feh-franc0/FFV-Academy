// Package httputil fornece utilitários HTTP compartilhados entre handlers e middleware.
//
// PADRÃO: RFC 7807 (Problem+JSON) para todos os erros.
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

// WriteError escreve uma resposta de erro no formato RFC 7807.
func WriteError(w http.ResponseWriter, status int, detail, errorType string) {
	problem := ProblemJSON{
		Type:   "https://api.fernandofrancovalle.com/errors/" + errorType,
		Title:  http.StatusText(status),
		Status: status,
		Detail: detail,
	}
	WriteJSON(w, status, problem)
}

// WriteJSON serializa v como JSON e escreve na resposta.
func WriteJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/problem+json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
