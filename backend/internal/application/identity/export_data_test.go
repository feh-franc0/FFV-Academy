package identity_test

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	appidentity "github.com/fernandofv/api/internal/application/identity"
	domcert "github.com/fernandofv/api/internal/domain/certificate"
	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
)

// --- mocks inline ---

type exportUserRepo struct {
	user *identity.User
}

func (r *exportUserRepo) Save(_ context.Context, _ *identity.User) error  { return nil }
func (r *exportUserRepo) Update(_ context.Context, _ *identity.User) error { return nil }
func (r *exportUserRepo) FindByID(_ context.Context, _ shared.UserID) (*identity.User, error) {
	if r.user == nil {
		return nil, shared.ErrNotFound
	}
	return r.user, nil
}
func (r *exportUserRepo) FindByEmail(_ context.Context, _ identity.Email) (*identity.User, error) {
	return nil, shared.ErrNotFound
}
func (r *exportUserRepo) FindByGoogleID(_ context.Context, _ string) (*identity.User, error) {
	return nil, shared.ErrNotFound
}
func (r *exportUserRepo) ExistsByEmail(_ context.Context, _ identity.Email) (bool, error) {
	return false, nil
}
func (r *exportUserRepo) ExistsByPhone(_ context.Context, _ identity.Phone) (bool, error) {
	return false, nil
}
func (r *exportUserRepo) SoftDelete(_ context.Context, _ shared.UserID, _ time.Time) error {
	return nil
}
func (r *exportUserRepo) ListForAdmin(_ context.Context, _, _ int) ([]*identity.User, int, error) {
	return nil, 0, nil
}

type exportAttemptLister struct{ attempts []*domsim.Attempt }

func (l *exportAttemptLister) ListByUser(_ context.Context, _ shared.UserID, _, _ int) ([]*domsim.Attempt, int, error) {
	return l.attempts, len(l.attempts), nil
}

type exportCertLister struct{ certs []*domcert.Certificate }

func (l *exportCertLister) ListByUser(_ context.Context, _ shared.UserID) ([]*domcert.Certificate, error) {
	return l.certs, nil
}

func Test_ExportUserDataUseCase_Execute_IncludesAllSections(t *testing.T) {
	now := time.Now()
	email, err := identity.NewEmail("alice@example.com")
	require.NoError(t, err)
	phone, _ := identity.NewPhone("")
	user, _, err := identity.NewUser(shared.NewUserID(), email, phone, "Alice", false, shared.ReferralID("ref"), now)
	require.NoError(t, err)

	attempt := domsim.StartAttempt(shared.NewAttemptID(), user.ID(), shared.SimuladoID("aws-clf"), 90, now)

	cert, err := domcert.Issue(user.ID(), shared.SimuladoID("aws-clf"), attempt.ID(), "Alice", 80, now)
	require.NoError(t, err)

	userRepo := &exportUserRepo{user: user}
	attemptRepo := &exportAttemptLister{attempts: []*domsim.Attempt{attempt}}
	certRepo := &exportCertLister{certs: []*domcert.Certificate{cert}}

	uc := appidentity.NewExportUserDataUseCase(userRepo, attemptRepo, certRepo, nil, nil, nil, shared.FixedClock{T: now})
	res, err := uc.Execute(context.Background(), appidentity.ExportUserDataCommand{UserID: user.ID()})

	require.NoError(t, err)
	assert.Equal(t, user.ID().String(), res.Profile.ID)
	assert.Len(t, res.Attempts, 1)
	assert.Len(t, res.Certificates, 1)
	assert.NotNil(t, res.Purchases)
	assert.False(t, res.GeneratedAt.IsZero())
}

func Test_ExportUserDataUseCase_Execute_UnknownUser_ReturnsNotFound(t *testing.T) {
	now := time.Now()
	userRepo := &exportUserRepo{user: nil}
	uc := appidentity.NewExportUserDataUseCase(userRepo, nil, nil, nil, nil, nil, shared.FixedClock{T: now})
	_, err := uc.Execute(context.Background(), appidentity.ExportUserDataCommand{UserID: shared.NewUserID()})
	require.Error(t, err)
	assert.ErrorIs(t, err, shared.ErrNotFound)
}
