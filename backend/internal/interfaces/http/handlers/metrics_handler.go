package handlers

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// MetricsHandler expõe /metrics usando o registry customizado.
//
// DECISÃO (MVP): /metrics é público (sem auth/admin). Motivos:
//  1. Facilita integração com Prometheus scrape em ambiente interno.
//  2. Não expõe dados sensíveis além de contadores agregados de request.
//  3. Em produção, restringir via network policy (não via app layer).
//
// TODO pós-MVP: opcionalmente proteger com auth bearer/basic quando exposto
// fora da rede interna.
type MetricsHandler struct {
	handler http.Handler
}

func NewMetricsHandler(gatherer prometheus.Gatherer) *MetricsHandler {
	h := promhttp.HandlerFor(gatherer, promhttp.HandlerOpts{
		ErrorHandling: promhttp.ContinueOnError,
	})
	return &MetricsHandler{handler: h}
}

// ServeHTTP delega ao handler promhttp.
func (h *MetricsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	h.handler.ServeHTTP(w, r)
}
