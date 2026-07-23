// Package storage — implementação S3-compatible (Cloudflare R2, Backblaze B2,
// MinIO, AWS S3). Plugável via env var: se S3_BUCKET é setado, main.go usa
// este adapter no lugar de LocalDiskStorage. Mesma interface (FileStorage +
// AttachmentDownloader), zero mudanças em handler ou use case.
//
// StorageURL canônico: `s3://<bucket>/<key>`. A key segue o mesmo layout do
// LocalDisk pra facilitar migração: `<study_request_id>/<attachment_id><ext>`.
//
// Providers testados / suportados:
//   - Cloudflare R2:  endpoint = https://<account-id>.r2.cloudflarestorage.com
//     region   = "auto"
//   - Backblaze B2:   endpoint = https://s3.<region>.backblazeb2.com
//     region   = us-west-001 (ou conforme bucket)
//   - MinIO:          endpoint = http://minio:9000 (com PathStyle=true)
//     region   = "us-east-1"
//   - AWS S3:         endpoint = "" (default, deixa SDK resolver)
//     region   = ex: us-east-1
package storage

import (
	"context"
	"errors"
	"fmt"
	"io"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/aws/smithy-go"

	"github.com/fernandofv/api/internal/domain/shared"
	domsr "github.com/fernandofv/api/internal/domain/studyrequest"
)

// S3Config agrupa todas as opções pra conectar em qualquer provider S3-compatible.
type S3Config struct {
	Endpoint        string // ex: https://<account>.r2.cloudflarestorage.com (vazio = AWS S3)
	Region          string // ex: auto (R2), us-east-1, us-west-001 (B2)
	Bucket          string // bucket destino
	AccessKeyID     string // credencial
	SecretAccessKey string // credencial
	PathStyle       bool   // true pra MinIO; false pra R2/B2/AWS (virtual-hosted)
}

// S3Storage implementa domsr.FileStorage + AttachmentDownloader.
type S3Storage struct {
	client *s3.Client
	bucket string
}

// NewS3Storage cria um cliente S3 com endpoint custom (R2/B2/MinIO) ou default
// (AWS). Valida que bucket existe via HeadBucket — falha rápido em startup
// se credenciais inválidas ou bucket inexistente.
func NewS3Storage(ctx context.Context, cfg S3Config) (*S3Storage, error) {
	if strings.TrimSpace(cfg.Bucket) == "" {
		return nil, fmt.Errorf("s3 storage: bucket vazio")
	}
	if strings.TrimSpace(cfg.AccessKeyID) == "" || strings.TrimSpace(cfg.SecretAccessKey) == "" {
		return nil, fmt.Errorf("s3 storage: credenciais ausentes")
	}
	region := cfg.Region
	if region == "" {
		region = "auto" // R2 default
	}

	awsCfg, err := awsconfig.LoadDefaultConfig(ctx,
		awsconfig.WithRegion(region),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.AccessKeyID, cfg.SecretAccessKey, "",
		)),
	)
	if err != nil {
		return nil, fmt.Errorf("s3 storage: load aws config: %w", err)
	}

	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		if cfg.Endpoint != "" {
			o.BaseEndpoint = aws.String(cfg.Endpoint)
		}
		o.UsePathStyle = cfg.PathStyle
	})

	// Sanity check — confirma acesso ao bucket.
	if _, err := client.HeadBucket(ctx, &s3.HeadBucketInput{
		Bucket: aws.String(cfg.Bucket),
	}); err != nil {
		return nil, fmt.Errorf("s3 storage: head bucket %q: %w", cfg.Bucket, err)
	}

	return &S3Storage{client: client, bucket: cfg.Bucket}, nil
}

// Upload envia o arquivo pro bucket. Key segue o mesmo layout do LocalDisk:
// <study_request_id>/<attachment_id><ext>. Retorna StorageURL `s3://bucket/key`.
func (s *S3Storage) Upload(ctx context.Context, in domsr.UploadInput) (string, error) {
	key := fmt.Sprintf("%s/%s%s",
		in.StudyRequestID.String(),
		in.AttachmentID.String(),
		safeExtension(in.FileName),
	)

	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(s.bucket),
		Key:           aws.String(key),
		Body:          in.Content,
		ContentType:   aws.String(in.ContentType),
		ContentLength: aws.Int64(in.SizeBytes),
		// Originais do upload em metadata (search/auditoria sem reler DB).
		Metadata: map[string]string{
			"original-filename": in.FileName,
		},
	})
	if err != nil {
		return "", fmt.Errorf("s3 storage: put object %q: %w", key, err)
	}

	return fmt.Sprintf("s3://%s/%s", s.bucket, key), nil
}

// Open implementa handlers.AttachmentDownloader. Lê o storageURL no formato
// `s3://bucket/key`, faz GetObject e devolve o stream.
func (s *S3Storage) Open(ctx context.Context, storageURL string) (io.ReadCloser, error) {
	bucket, key, err := parseS3URL(storageURL)
	if err != nil {
		return nil, err
	}
	// Mesmo que o URL aponte pra outro bucket (não deveria), recusamos por
	// princípio: o adapter só serve seu próprio bucket.
	if bucket != s.bucket {
		return nil, fmt.Errorf("s3 storage: bucket %q não pertence a este adapter (%q)", bucket, s.bucket)
	}

	out, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		var nsk *types.NoSuchKey
		var apiErr smithy.APIError
		if errors.As(err, &nsk) {
			return nil, fmt.Errorf("%w: %s", shared.ErrNotFound, key)
		}
		if errors.As(err, &apiErr) && apiErr.ErrorCode() == "NoSuchKey" {
			return nil, fmt.Errorf("%w: %s", shared.ErrNotFound, key)
		}
		return nil, fmt.Errorf("s3 storage: get object %q: %w", key, err)
	}
	return out.Body, nil
}

// parseS3URL extrai bucket e key de uma URL `s3://bucket/key/sub/path`.
func parseS3URL(u string) (string, string, error) {
	const prefix = "s3://"
	if !strings.HasPrefix(u, prefix) {
		return "", "", fmt.Errorf("s3 storage: schema não suportado: %q", u)
	}
	rest := strings.TrimPrefix(u, prefix)
	idx := strings.IndexByte(rest, '/')
	if idx <= 0 || idx == len(rest)-1 {
		return "", "", fmt.Errorf("s3 storage: URL malformada: %q", u)
	}
	return rest[:idx], rest[idx+1:], nil
}
