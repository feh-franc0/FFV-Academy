package middleware

import (
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/prometheus/client_golang/prometheus"
)

// MetricsRegistry agrupa o registry isolado + coletores HTTP.
//
// PADRÃO: registry dedicado (prometheus.NewRegistry) — evita vazar métricas
// default do Go runtime de libs importadas que usem prometheus.MustRegister.
type MetricsRegistry struct {
	Registry        *prometheus.Registry
	RequestsTotal   *prometheus.CounterVec
	RequestDuration *prometheus.HistogramVec
}

// NewMetricsRegistry cria um registry + coletores HTTP padrão.
func NewMetricsRegistry() *MetricsRegistry {
	reg := prometheus.NewRegistry()

	requestsTotal := prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total de requisições HTTP processadas, rotuladas por método, path e status.",
		},
		[]string{"method", "path", "status"},
	)

	requestDuration := prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "Duração das requisições HTTP em segundos.",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path"},
	)

	reg.MustRegister(requestsTotal, requestDuration)

	return &MetricsRegistry{
		Registry:        reg,
		RequestsTotal:   requestsTotal,
		RequestDuration: requestDuration,
	}
}

// Middleware instrumenta cada request com counter + histogram.
//
// Usa o padrão chi de RoutePattern() para obter o path original (ex: /users/{id})
// em vez do path com params já substituídos — evita explosão de cardinalidade.
func (m *MetricsRegistry) Middleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			rw := &metricsResponseWriter{ResponseWriter: w, status: http.StatusOK}

			next.ServeHTTP(rw, r)

			routeCtx := chi.RouteContext(r.Context())
			pathLabel := r.URL.Path
			if routeCtx != nil {
				if pattern := routeCtx.RoutePattern(); pattern != "" {
					pathLabel = pattern
				}
			}

			elapsed := time.Since(start).Seconds()
			m.RequestsTotal.WithLabelValues(r.Method, pathLabel, strconv.Itoa(rw.status)).Inc()
			m.RequestDuration.WithLabelValues(r.Method, pathLabel).Observe(elapsed)
		})
	}
}

type metricsResponseWriter struct {
	http.ResponseWriter
	status int
}

func (w *metricsResponseWriter) WriteHeader(status int) {
	w.status = status
	w.ResponseWriter.WriteHeader(status)
}
