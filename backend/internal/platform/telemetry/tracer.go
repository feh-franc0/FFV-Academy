// Package telemetry configura o OpenTelemetry SDK para tracing distribuído.
//
// PADRÃO: O TracerProvider é inicializado uma vez no main.go (Composition Root)
// e propagado via context. Handlers e repositórios recebem o context — nunca
// acessam o provider global diretamente.
//
// Quando Endpoint está vazio, configura um NoopTracerProvider (zero overhead).
// Isso garante que ambientes sem coletor OTel (dev local, testes) não falhem.
package telemetry

import (
	"context"
	"fmt"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

// Config contém os parâmetros de configuração do telemetry.
type Config struct {
	ServiceName    string
	ServiceVersion string
	Endpoint       string // OTLP gRPC endpoint, ex: "localhost:4317". Vazio = desabilita.
	Insecure       bool   // true para desenvolvimento local (sem TLS)
}

// Setup inicializa o TracerProvider e retorna uma função de shutdown.
// Se Endpoint for vazio, configura um NoopTracerProvider (zero overhead).
// O shutdown deve ser chamado com defer no main para garantir que todos os
// spans pendentes sejam enviados antes do processo terminar.
func Setup(ctx context.Context, cfg Config) (shutdown func(context.Context) error, err error) {
	// Sem endpoint configurado: usar Noop provider para zero overhead.
	// Útil em desenvolvimento local e testes sem coletor OTel.
	if cfg.Endpoint == "" {
		// otel.SetTracerProvider não é chamado — o provider padrão já é Noop.
		return func(context.Context) error { return nil }, nil
	}

	// Configura o resource com metadados do serviço.
	// Esses atributos aparecem em todas as spans para identificar a origem.
	res, err := resource.Merge(
		resource.Default(),
		resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceName(cfg.ServiceName),
			semconv.ServiceVersion(cfg.ServiceVersion),
		),
	)
	if err != nil {
		return nil, fmt.Errorf("telemetry: resource: %w", err)
	}

	// Opções de conexão gRPC com o coletor OTLP.
	dialOpts := []grpc.DialOption{}
	if cfg.Insecure {
		// Modo insecure para desenvolvimento local — nunca usar em produção.
		dialOpts = append(dialOpts, grpc.WithTransportCredentials(insecure.NewCredentials()))
	}

	// Cria o exporter OTLP via gRPC.
	// A conexão é estabelecida lazily na primeira exportação.
	exporter, err := otlptracegrpc.New(ctx,
		otlptracegrpc.WithEndpoint(cfg.Endpoint),
		otlptracegrpc.WithDialOption(dialOpts...),
	)
	if err != nil {
		return nil, fmt.Errorf("telemetry: exporter: %w", err)
	}

	// TracerProvider com BatchSpanProcessor para exportação eficiente.
	// Batch: agrupa spans e envia em lotes, reduzindo overhead de rede.
	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(res),
	)

	// Registra como provider global — otelhttp e outros instrumentadores usarão este provider.
	otel.SetTracerProvider(tp)

	// Retorna função de shutdown para flush gracioso no encerramento do processo.
	return tp.Shutdown, nil
}
