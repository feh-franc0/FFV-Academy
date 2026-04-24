// Package sms implementa o adapter de envio de SMS usando Twilio.
package sms

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/fernandofv/api/internal/config"
	"github.com/fernandofv/api/internal/domain/identity"
)

// TwilioClient implementa SMSSender.
type TwilioClient struct {
	cfg        config.TwilioConfig
	httpClient *http.Client
}

func NewTwilioClient(cfg config.TwilioConfig) *TwilioClient {
	return &TwilioClient{
		cfg:        cfg,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

func (c *TwilioClient) SendMagicToken(ctx context.Context, to identity.Phone, token string) error {
	apiURL := fmt.Sprintf(
		"https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json",
		c.cfg.AccountSID,
	)

	body := url.Values{}
	body.Set("To", to.String())
	body.Set("From", c.cfg.FromNumber)
	body.Set("Body", fmt.Sprintf("FFV Academy: seu código é %s. Válido por 10 minutos.", token))

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, apiURL, strings.NewReader(body.Encode()))
	if err != nil {
		return fmt.Errorf("twilio: create request: %w", err)
	}
	req.SetBasicAuth(c.cfg.AccountSID, c.cfg.AuthToken)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("twilio: send: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("twilio: unexpected status %d", resp.StatusCode)
	}
	return nil
}
