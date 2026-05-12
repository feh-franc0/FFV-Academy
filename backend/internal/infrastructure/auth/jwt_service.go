// Package auth implementa os adaptadores de autenticação JWT.
//
// PADRÕES:
//   - DIP: implementa a interface TokenIssuer do package application/identity.
//   - Segurança: HMAC-SHA256; claims obrigatórias (iss, aud, sub, exp, iat, jti).
//   - Refresh token: valor raw gerado com crypto/rand; apenas hash armazenado na DB.
package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"github.com/fernandofv/api/internal/config"
	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
)

// Claims são os claims customizados do JWT.
type Claims struct {
	jwt.RegisteredClaims
	Role string `json:"role"`
}

// JWTService implementa TokenIssuer.
type JWTService struct {
	cfg config.JWTConfig
}

func NewJWTService(cfg config.JWTConfig) *JWTService {
	return &JWTService{cfg: cfg}
}

// IssueAccessToken emite um JWT de acesso de curta duração (15min).
func (s *JWTService) IssueAccessToken(userID shared.UserID, email identity.Email, role identity.Role) (string, error) {
	now := time.Now().UTC()
	claims := Claims{
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    s.cfg.Issuer,
			Subject:   userID.String(),
			Audience:  jwt.ClaimStrings{s.cfg.Audience},
			ExpiresAt: jwt.NewNumericDate(now.Add(s.cfg.AccessTokenTTL)),
			IssuedAt:  jwt.NewNumericDate(now),
			ID:        uuid.NewString(),
		},
		Role: string(role),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(s.cfg.Secret))
	if err != nil {
		return "", fmt.Errorf("jwt: sign access token: %w", err)
	}
	return signed, nil
}

// ValidateAccessToken valida um JWT e retorna os claims.
func (s *JWTService) ValidateAccessToken(raw string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(raw, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(s.cfg.Secret), nil
	},
		jwt.WithIssuer(s.cfg.Issuer),
		jwt.WithAudience(s.cfg.Audience),
		jwt.WithValidMethods([]string{"HS256"}),
	)
	if err != nil {
		return nil, fmt.Errorf("jwt: validate: %w", err)
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("jwt: invalid claims")
	}
	return claims, nil
}

// IssueRefreshToken gera um par (rawToken, hash).
// rawToken vai para o cookie HttpOnly; hash é persistido na DB.
// POR QUÊ: nunca persistir o token raw — só o hash, como senhas.
func (s *JWTService) IssueRefreshToken(_ shared.UserID) (rawToken string, hash string, err error) {
	b := make([]byte, 32)
	if _, err = rand.Read(b); err != nil {
		return "", "", fmt.Errorf("refresh token: generate random: %w", err)
	}
	rawToken = hex.EncodeToString(b)
	sum := sha256.Sum256([]byte(rawToken))
	hash = hex.EncodeToString(sum[:])
	return rawToken, hash, nil
}

// HashRefreshToken retorna o hash SHA-256 de um raw refresh token.
// Usado para lookup na DB a partir do cookie.
func HashRefreshToken(raw string) string {
	sum := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(sum[:])
}
