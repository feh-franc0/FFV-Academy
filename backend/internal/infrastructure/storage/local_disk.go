// Package storage contém implementações concretas do port studyrequest.FileStorage.
//
// V1 ENTREGA: LocalDiskStorage — salva arquivos no filesystem do servidor.
// Em produção a VPS persiste arquivos em /opt/ffv/uploads/ (volume Docker).
//
// V2 PLANEJADA: S3Storage usando aws-sdk-go-v2. A interface FileStorage já está
// preparada para receber a implementação S3 sem mudar o use case nem o handler.
// Para migrar dados existentes, basta um job que itere study_request_attachments,
// faça upload pro S3 e atualize storage_url.
package storage

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/fernandofv/api/internal/domain/shared"
	domsr "github.com/fernandofv/api/internal/domain/studyrequest"
)

// LocalDiskStorage salva arquivos em um diretório local. Cada solicitação
// vira uma subpasta com seu ID; cada anexo é nomeado pelo AttachmentID +
// extensão segura inferida do FileName original.
type LocalDiskStorage struct {
	baseDir string
}

// NewLocalDiskStorage instancia a storage. O diretório base é criado se não
// existir (com mkdir -p). Caller é responsável por garantir permissão.
func NewLocalDiskStorage(baseDir string) (*LocalDiskStorage, error) {
	if strings.TrimSpace(baseDir) == "" {
		return nil, fmt.Errorf("local disk storage: baseDir vazio")
	}
	if err := os.MkdirAll(baseDir, 0o750); err != nil {
		return nil, fmt.Errorf("local disk storage: mkdir base: %w", err)
	}
	return &LocalDiskStorage{baseDir: baseDir}, nil
}

func (s *LocalDiskStorage) Upload(ctx context.Context, in domsr.UploadInput) (string, error) {
	// Diretório por solicitação isola arquivos e facilita cleanup futuro.
	dir := filepath.Join(s.baseDir, in.StudyRequestID.String())
	if err := os.MkdirAll(dir, 0o750); err != nil {
		return "", fmt.Errorf("local disk storage: mkdir request dir: %w", err)
	}

	// Nome final: <attachmentID><ext> — extensão preservada para o admin saber
	// o tipo sem precisar consultar content-type no DB.
	ext := safeExtension(in.FileName)
	key := in.AttachmentID.String() + ext
	fullPath := filepath.Join(dir, key)

	// O caller pode cancelar via context; aqui só usamos pra atender ao timeout
	// do request. Stream copy é direto.
	_ = ctx

	out, err := os.OpenFile(fullPath, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o640)
	if err != nil {
		return "", fmt.Errorf("local disk storage: open file: %w", err)
	}
	defer out.Close() //nolint:errcheck

	if _, err := io.Copy(out, in.Content); err != nil {
		_ = os.Remove(fullPath)
		return "", fmt.Errorf("local disk storage: copy: %w", err)
	}

	// Retornamos uma URL no esquema file:// para distinguir de s3:// no DB.
	// A camada admin (futura) saberá traduzir.
	return "file://" + fullPath, nil
}

// Open implementa handlers.AttachmentDownloader. Valida que o storageURL
// é `file://` e que o caminho resolvido fica dentro de baseDir (path traversal).
func (s *LocalDiskStorage) Open(_ context.Context, storageURL string) (io.ReadCloser, error) {
	if !strings.HasPrefix(storageURL, "file://") {
		return nil, fmt.Errorf("local disk storage: schema não suportado: %q", storageURL)
	}
	path := strings.TrimPrefix(storageURL, "file://")

	// Path traversal defense: o caminho final deve ser uma sub-pasta de baseDir.
	absBase, err := filepath.Abs(s.baseDir)
	if err != nil {
		return nil, fmt.Errorf("local disk storage: resolve base: %w", err)
	}
	absPath, err := filepath.Abs(path)
	if err != nil {
		return nil, fmt.Errorf("local disk storage: resolve path: %w", err)
	}
	rel, err := filepath.Rel(absBase, absPath)
	if err != nil || strings.HasPrefix(rel, "..") {
		return nil, fmt.Errorf("local disk storage: path fora do baseDir")
	}

	f, err := os.Open(absPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, fmt.Errorf("%w: arquivo não existe", shared.ErrNotFound)
		}
		return nil, fmt.Errorf("local disk storage: open: %w", err)
	}
	return f, nil
}

// safeExtension extrai uma extensão "limpa" (ascii lower) do nome original.
// Retorna string vazia se nada legítimo foi encontrado.
func safeExtension(fileName string) string {
	ext := strings.ToLower(filepath.Ext(fileName))
	// Aceitar apenas alfanumérico + ponto inicial; rejeita ext com paths.
	if len(ext) == 0 || len(ext) > 8 {
		return ""
	}
	for _, r := range ext[1:] {
		if !((r >= 'a' && r <= 'z') || (r >= '0' && r <= '9')) {
			return ""
		}
	}
	return ext
}
