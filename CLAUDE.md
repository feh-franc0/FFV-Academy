# Monorepo — FFV Academy

Este repositório contém todos os projetos da plataforma FFV Academy organizados em subpastas.

## Estrutura

| Pasta | O que é | Stack |
|-------|---------|-------|
| `frontend/` | App web Next.js (blog, currículo, simulados, gamificação) | Next.js 16, TypeScript, Tailwind, Vitest |
| `backend/` | API REST + workers (auth, simulados, certificados, billing) | Go 1.25, Chi, PostgreSQL, Redis |
| `video-pipeline/` | Pipeline de geração de vídeos de marketing (Remotion + Playwright) | TypeScript, Remotion 4, Playwright |
| `drawio-tools/` | Scripts para geração e validação de diagramas de arquitetura | Python, Bash, draw.io |
| `legacy-site/` | Site estático HTML/CSS/JS anterior à plataforma | HTML/CSS/JS puro |
| `docs/` | Documentos de planejamento e decisões de projeto | Markdown |

## Comandos rápidos

```bash
# Frontend
cd frontend && npm install && npm run dev   # dev server :3000
cd frontend && npm test                     # testes (unit + integration + security)
cd frontend && npm run build                # build estático → frontend/out/

# Backend
cd backend && go run ./cmd/api             # servidor local
cd backend && go test ./...                # todos os testes Go
cd backend && make migrate                 # rodar migrations

# Video pipeline
cd video-pipeline && npm install && npm run preview   # Remotion studio
cd video-pipeline && npm run pipeline                 # gravar + renderizar tudo
```

## Detalhes por projeto

- **Frontend:** ver `frontend/CLAUDE.md` — contém toda a documentação editorial, arquitetura de componentes, gamificação, regras de validação e gotchas.
- **Backend:** ver `backend/CLAUDE.md` — roadmap, estrutura de domínio (DDD), contrato de API.
- **Draw.io tools:** ver `drawio-tools/docs/PIPELINE.md` — pipeline de geração iterativa de diagramas AWS.
