package http

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

// Server encapsula o http.Server com graceful shutdown.
type Server struct {
	srv *http.Server
}

// NewServer cria o servidor HTTP com timeouts conservadores.
func NewServer(addr string, handler http.Handler) *Server {
	return &Server{
		srv: &http.Server{
			Addr:         addr,
			Handler:      handler,
			ReadTimeout:  15 * time.Second,
			WriteTimeout: 30 * time.Second,
			IdleTimeout:  120 * time.Second,
		},
	}
}

// ListenAndServe inicia o servidor. Bloqueante até o servidor parar.
func (s *Server) ListenAndServe() error {
	return s.srv.ListenAndServe()
}

// Shutdown inicia o graceful shutdown com deadline.
func (s *Server) Shutdown(ctx context.Context) error {
	return s.srv.Shutdown(ctx)
}

// Addr retorna o endereço de escuta.
func (s *Server) Addr() string {
	return fmt.Sprintf("http://%s", s.srv.Addr)
}
