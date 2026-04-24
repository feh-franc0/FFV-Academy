// Package ai implementa o adapter para a Claude API da Anthropic.
//
// PADRÕES:
//   - DIP: ClaudeClient implementa domtutor.TutorProvider.
//   - Cache: respostas cacheadas por (questionID, kind) via Redis (TTL 7d).
//   - Rate limit: enforçado no use case; aqui só chamamos a API.
//   - Prompt: templates versionados por kind.
package ai

import (
	"context"
	"fmt"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/fernandofv/api/internal/config"
	domtutor "github.com/fernandofv/api/internal/domain/tutor"
	redisinfra "github.com/fernandofv/api/internal/infrastructure/persistence/redis"
)

// ClaudeClient implementa TutorProvider usando a Anthropic Claude API.
type ClaudeClient struct {
	client anthropic.Client
	cfg    config.AnthropicConfig
	cache  *redisinfra.TutorCache
}

func NewClaudeClient(cfg config.AnthropicConfig, cache *redisinfra.TutorCache) *ClaudeClient {
	client := anthropic.NewClient() // Usa ANTHROPIC_API_KEY do ambiente
	return &ClaudeClient{client: client, cfg: cfg, cache: cache}
}

func (c *ClaudeClient) Ask(ctx context.Context, query domtutor.Query) (domtutor.TutorResponse, error) {
	// Verifica cache primeiro.
	if cached, hit, err := c.cache.Get(ctx, query.QuestionID, query.Kind); err == nil && hit {
		return domtutor.TutorResponse{Explanation: cached, CacheHit: true}, nil
	}

	prompt := buildPrompt(query)

	msg, err := c.client.Messages.New(ctx, anthropic.MessageNewParams{
		Model:     c.cfg.Model,
		MaxTokens: int64(c.cfg.MaxTokens),
		Messages: []anthropic.MessageParam{
			anthropic.NewUserMessage(anthropic.NewTextBlock(prompt)),
		},
		System: []anthropic.TextBlockParam{
			{Text: systemPrompt()},
		},
	})
	if err != nil {
		return domtutor.TutorResponse{}, fmt.Errorf("claude: ask: %w", err)
	}

	explanation := ""
	for _, block := range msg.Content {
		if block.Type == "text" {
			explanation += block.Text
		}
	}

	if explanation == "" {
		return domtutor.TutorResponse{}, fmt.Errorf("claude: empty response")
	}

	// Armazena no cache para próximas requisições.
	_ = c.cache.Set(ctx, query.QuestionID, query.Kind, explanation)

	return domtutor.TutorResponse{Explanation: explanation, CacheHit: false}, nil
}

func systemPrompt() string {
	return `Você é o Tutor FFV — um assistente de estudos especialista em tecnologia, cloud computing e IA.
Suas explicações são:
- Diretas e claras (máximo 3 parágrafos)
- Em português brasileiro informal mas profissional
- Focadas no PORQUÊ, não apenas no O QUÊ
- Sem jargão desnecessário
Nunca revele o gabarito diretamente — explique o raciocínio.`
}

func buildPrompt(query domtutor.Query) string {
	var kindInstruction string
	switch query.Kind {
	case domtutor.KindPorQue:
		kindInstruction = "Explique POR QUE a resposta correta é correta e por que cada distrator erra."
	case domtutor.KindAnalogia:
		kindInstruction = "Crie uma ANALOGIA do mundo real (não técnica) para explicar o conceito."
	case domtutor.KindExemplo:
		kindInstruction = "Dê um EXEMPLO PRÁTICO do mundo real mostrando onde esse conceito é aplicado."
	}

	return fmt.Sprintf(`Questão de certificação: %s

%s

Questão ID: %s (simulado: %s)
`,
		query.QuestionStem,
		kindInstruction,
		query.QuestionID,
		query.SimuladoID,
	)
}

// Compile-time check: ClaudeClient implementa TutorProvider.
var _ domtutor.TutorProvider = (*ClaudeClient)(nil)
