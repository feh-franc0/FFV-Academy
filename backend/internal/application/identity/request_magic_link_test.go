package identity_test

import (
	"context"
	"errors"
	"testing"
	"time"

	appidentity "github.com/fernandofv/api/internal/application/identity"
	domidentity "github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
)

// --- Mocks inline ---

type mockTokenStore struct {
	storeCalls   int
	incrCalls    int
	getAttempts  int64
	getErr       error
	storeErr     error
	lastToken    domidentity.MagicToken
	consumed     *domidentity.MagicToken
	consumeErr   error
}

func (m *mockTokenStore) Store(_ context.Context, _ domidentity.Email, token domidentity.MagicToken) error {
	m.storeCalls++
	m.lastToken = token
	return m.storeErr
}

func (m *mockTokenStore) Consume(_ context.Context, _ domidentity.Email) (domidentity.MagicToken, error) {
	if m.consumeErr != nil {
		return domidentity.MagicToken{}, m.consumeErr
	}
	if m.consumed == nil {
		return domidentity.MagicToken{}, shared.ErrNotFound
	}
	return *m.consumed, nil
}

func (m *mockTokenStore) IncrAttempts(_ context.Context, _ domidentity.Email) (int64, error) {
	m.incrCalls++
	return 1, nil
}

func (m *mockTokenStore) GetAttempts(_ context.Context, _ domidentity.Email) (int64, error) {
	return m.getAttempts, m.getErr
}

type mockEmailer struct {
	called int
	err    error
}

func (m *mockEmailer) SendMagicLink(_ context.Context, _ domidentity.Email, _ string, _ time.Duration) error {
	m.called++
	return m.err
}

type mockSMS struct {
	called int
	err    error
}

func (m *mockSMS) SendMagicToken(_ context.Context, _ domidentity.Phone, _ string) error {
	m.called++
	return m.err
}

// --- Tests ---

func Test_RequestMagicLink_Execute_ValidEmail_Succeeds(t *testing.T) {
	now := time.Now()
	store := &mockTokenStore{}
	emailer := &mockEmailer{}
	sms := &mockSMS{}

	uc := appidentity.NewRequestMagicLinkUseCase(store, emailer, sms, shared.FixedClock{T: now}, 10*time.Minute, 5)
	res, err := uc.Execute(context.Background(), appidentity.RequestMagicLinkCommand{
		Email: "user@example.com",
		Phone: "+5511987654321",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if res.ExpiresIn != 10*time.Minute {
		t.Fatalf("expected ExpiresIn=10m, got %v", res.ExpiresIn)
	}
	if store.storeCalls != 1 {
		t.Fatalf("expected Store called once, got %d", store.storeCalls)
	}
	if store.incrCalls != 1 {
		t.Fatalf("expected IncrAttempts called once, got %d", store.incrCalls)
	}
	if emailer.called != 1 {
		t.Fatalf("expected emailer called once, got %d", emailer.called)
	}
	if sms.called != 1 {
		t.Fatalf("expected sms called once, got %d", sms.called)
	}
}

func Test_RequestMagicLink_Execute_InvalidEmail_ReturnsValidation(t *testing.T) {
	uc := appidentity.NewRequestMagicLinkUseCase(&mockTokenStore{}, &mockEmailer{}, &mockSMS{},
		shared.FixedClock{T: time.Now()}, 10*time.Minute, 5)
	_, err := uc.Execute(context.Background(), appidentity.RequestMagicLinkCommand{
		Email: "not-an-email",
		Phone: "+5511987654321",
	})
	if !errors.Is(err, shared.ErrValidation) {
		t.Fatalf("expected ErrValidation, got %v", err)
	}
}

func Test_RequestMagicLink_Execute_RateLimitExceeded_ReturnsRateLimited(t *testing.T) {
	store := &mockTokenStore{getAttempts: 5}
	uc := appidentity.NewRequestMagicLinkUseCase(store, &mockEmailer{}, &mockSMS{},
		shared.FixedClock{T: time.Now()}, 10*time.Minute, 5)
	_, err := uc.Execute(context.Background(), appidentity.RequestMagicLinkCommand{
		Email: "user@example.com",
		Phone: "+5511987654321",
	})
	if !errors.Is(err, shared.ErrRateLimited) {
		t.Fatalf("expected ErrRateLimited, got %v", err)
	}
	if store.storeCalls != 0 {
		t.Fatalf("expected no Store call when rate-limited, got %d", store.storeCalls)
	}
}

func Test_RequestMagicLink_Execute_EmailerFails_ReturnsError(t *testing.T) {
	emailErr := errors.New("resend down")
	uc := appidentity.NewRequestMagicLinkUseCase(&mockTokenStore{}, &mockEmailer{err: emailErr}, &mockSMS{},
		shared.FixedClock{T: time.Now()}, 10*time.Minute, 5)
	_, err := uc.Execute(context.Background(), appidentity.RequestMagicLinkCommand{
		Email: "user@example.com",
		Phone: "+5511987654321",
	})
	if err == nil || !errors.Is(err, emailErr) {
		t.Fatalf("expected wrap of emailErr, got %v", err)
	}
}
