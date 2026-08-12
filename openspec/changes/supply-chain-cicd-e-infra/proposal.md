## Why

A auditoria (P-11, P-12, P-17) encontrou lacunas de supply-chain e configuração de infraestrutura:

- Nenhuma das ~40 GitHub Actions usadas é pinada por SHA — incluindo `appleboy/scp-action` e
  `appleboy/ssh-action`, que recebem a chave SSH privada da VPS.
- Imagens Docker base (`golang:1.26-alpine`, `node:20-alpine`, `nginx:1.27-alpine`, `postgres:16-alpine`,
  `redis:7-alpine`) são referenciadas por tag flutuante, não por digest.
- `gitleaks` roda em CI com `continue-on-error: true` — um leak histórico é reportado mas não bloqueia o build.
- `lighthouse.yml` não declara bloco `permissions`, herdando o escopo default do `GITHUB_TOKEN` ao rodar build
  de PR não confiável.
- `X-Forwarded-For` é tratado de forma inconsistente entre os dois vhosts Nginx: `api.conf` sobrescreve
  (correto), `frontend.conf` anexa via `$proxy_add_x_forwarded_for` (preserva o valor do cliente).
- HSTS não declara `includeSubDomains`/`preload`; a string de cifras é ampla (`HIGH:!aNULL:!MD5`); não há
  `default_server` — um Host não casado cai no primeiro vhost carregado por ordem alfabética.
- `.gitignore` raiz não cobre `*.key`/`*.crt`/chaves SSH fora de `backend/`.

## What Changes

- Pinagem de todas as GitHub Actions por SHA (com Dependabot configurado para manter atualizado).
- Pinagem das imagens Docker base por digest.
- `gitleaks` vira bloqueante (`continue-on-error: false`).
- `permissions:` mínimo explícito em todo job de `lighthouse.yml` e nos jobs de `deploy.yml` que não declaram.
- `frontend.conf` passa a sobrescrever `X-Forwarded-For`, igual a `api.conf`.
- HSTS ganha `includeSubDomains`; cipher suite revisada; um bloco `default_server` que responde 444 a Host não
  reconhecido é adicionado.
- `.gitignore` raiz ganha padrões para `*.key`, `*.crt`, `id_rsa*`, `*.pfx`, `.env.<qualquer-nome>`.

## Fora de escopo

- Não migra o deploy de SSH-key para OIDC nesta mudança (mudança maior de infraestrutura, fica documentada
  como próximo passo natural).
- Não adiciona um WAF.

## Impact

- `.github/workflows/*.yml`
- `backend/deployments/Dockerfile`, `frontend/Dockerfile`, `docker-compose*.yml`
- `backend/deployments/nginx/conf.d/{api,frontend}.conf`
- `.gitignore` (raiz)
- Achados cobertos: P-11, P-12 (parte de infra), P-17.
