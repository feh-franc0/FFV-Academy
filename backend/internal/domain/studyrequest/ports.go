package studyrequest

import (
	"context"
	"io"
)

// Repository persiste e recupera StudyRequest. Implementado em infrastructure.
type Repository interface {
	// Save insere uma nova solicitação com seus anexos atomicamente.
	Save(ctx context.Context, req *StudyRequest) error

	// FindByID retorna a solicitação pelo ID, incluindo anexos.
	// Retorna shared.ErrNotFound se não existir.
	FindByID(ctx context.Context, id ID) (*StudyRequest, error)

	// Update salva alterações de status/notes/userID na solicitação.
	// Não toca em anexos.
	Update(ctx context.Context, req *StudyRequest) error

	// List retorna solicitações filtradas e paginadas + total absoluto.
	List(ctx context.Context, f Filter) ([]*StudyRequest, int64, error)
}

// UserLookup é a port para resolver lead anônimo → user autenticado por email.
// Implementação em infra reutiliza identity.UserRepository.
type UserLookup interface {
	// FindUserIDByEmail retorna o UserID se existir um user com esse email
	// (lowercased). Retorna ("", nil) se não encontrar — não é erro.
	FindUserIDByEmail(ctx context.Context, email string) (string, error)
}

// Filter agrupa parâmetros de busca da listagem admin.
type Filter struct {
	Status    Status // vazio = todos
	StudyArea string // exact match (slug)
	Search    string // busca em name, email, subject, description (ILIKE)
	Limit     int
	Offset    int
}

// EmailNotifier envia notificações por email relacionadas ao ciclo de vida
// de uma StudyRequest. Implementado em infrastructure/email.
type EmailNotifier interface {
	// SendReceivedConfirmation: estudante recebe confirmação ao enviar.
	//
	// loginCode (opcional, pode ser vazio): código de 6 dígitos pra magic-link.
	// Quando presente, o email inclui CTA grande "Confirmar e acompanhar"
	// linkando pra https://<frontend>/login?email=<X>&code=<Y>, permitindo
	// 1 clique → logged in → vê dashboard com status da solicitação.
	// Quando vazio, fallback pro template antigo (só confirmação).
	SendReceivedConfirmation(ctx context.Context, to, name string, requestID ID, subject, loginCode string) error

	// SendAdminNotification: alerta TODOS os admins de nova solicitação pendente.
	// adminTos pode ter 1+ emails (lista do ADMIN_EMAIL_ALLOWLIST). Lista vazia
	// é no-op sem erro (não há destinatário).
	SendAdminNotification(ctx context.Context, adminTos []string, req *StudyRequest) error

	// SendStatusUpdate: estudante recebe update quando status muda
	// (ex: in_production, ready). Se deliveredURL não for vazio (status=ready),
	// o email inclui CTA clicável grande pro estudante acessar o conteúdo.
	SendStatusUpdate(ctx context.Context, to, name string, requestID ID, newStatus Status, subject string, deliveredURL string) error
}

// LoginCodeIssuer gera um código de magic-link de 6 dígitos pro email e
// persiste em Redis com TTL — sem enviar email. Usado pelo CreateUseCase pra
// embutir o código na confirmação de recebimento, evitando 2 emails separados.
//
// Implementação em infra reusa identity.MagicTokenStore + crypto/rand.
type LoginCodeIssuer interface {
	// IssueForEmail gera código + armazena em Redis (TTL ~10min). Retorna o
	// código pra ser incluído no email. Falha aqui NÃO bloqueia o submit —
	// cliente ainda pode pedir código novo via /login normal.
	IssueForEmail(ctx context.Context, email string) (code string, err error)
}

// UserUpserter cria conta passwordless pra leads anônimos no submit, ou
// retorna ID do user existente. Garante que toda solicitação tenha um
// user_id real associado — base pra rastrear email_verified_at e
// last_login_at posteriormente.
//
// Idempotente: chamar várias vezes pro mesmo email retorna o mesmo ID.
type UserUpserter interface {
	// UpsertPasswordlessUser cria conta se não existir (com nome/phone do
	// formulário) OU retorna ID se já existir. Não dispara email — quem
	// envia é o LoginCodeIssuer + EmailNotifier.
	UpsertPasswordlessUser(ctx context.Context, email, name, phone string, marketingConsent bool) (userID string, isNew bool, err error)
}

// FileStorage uploads arquivos anexados a uma StudyRequest.
//
// Implementações:
//   - S3FileStorage (produção)
//   - LocalDiskFileStorage (dev / fallback)
//
// A StorageURL retornada é o que vai pro DB (s3://bucket/key ou file://path).
type FileStorage interface {
	// Upload recebe o stream do arquivo + metadados e retorna a URL canônica
	// onde o arquivo foi salvo. O caller é responsável por fechar o reader.
	Upload(ctx context.Context, in UploadInput) (string, error)
}

// UploadInput agrupa os dados de um upload.
type UploadInput struct {
	StudyRequestID ID
	AttachmentID   AttachmentID
	FileName       string
	ContentType    string
	SizeBytes      int64
	Content        io.Reader
}
