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
	SendReceivedConfirmation(ctx context.Context, to, name string, requestID ID, subject string) error

	// SendAdminNotification: admin recebe alerta de nova solicitação pendente.
	SendAdminNotification(ctx context.Context, adminTo string, req *StudyRequest) error

	// SendStatusUpdate: estudante recebe update quando status muda
	// (ex: in_production, ready). Se deliveredURL não for vazio (status=ready),
	// o email inclui CTA clicável grande pro estudante acessar o conteúdo.
	SendStatusUpdate(ctx context.Context, to, name string, requestID ID, newStatus Status, subject string, deliveredURL string) error
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
