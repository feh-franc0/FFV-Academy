# 0002. Excluir RSC payloads (`__next.*.txt`) do upload FTP

- **Status:** Accepted
- **Date:** 2026-05-12
- **Deciders:** Fernando Franco
- **Related specs/ADRs:** `0001-adr.md`, `.github/workflows/deploy.yml`

## Context and problem statement

A plataforma FFV Academy é um Next.js 16 com `output: "export"` (build estático) deployado na Hostinger Cloud Startup via FTP. O build gera **8.213 arquivos** em `frontend/out/`, dos quais **6.287 (76%)** são RSC payloads (`__next.*.txt`) que totalizam **153 MB**.

O servidor FTP da Hostinger compartilhada tem **timeout fixo de 3600 segundos (1 hora)** por sessão de controle — limite imposto pelo provedor, sem acesso a configuração no plano Cloud Startup. O upload incremental de 8k arquivos via FTP plano (porta 21, sem TLS, sem paralelismo) ultrapassa esse limite e o servidor envia `421 Session Timeout (3600 seconds)`, fechando a conexão antes do deploy terminar.

Decisão é necessária agora para destravar o deploy do frontend em produção. O backend (VPS Docker) já está no ar; só o frontend está bloqueado.

## Decision drivers

- **Destravar deploy hoje** — backend pronto, site precisa subir
- **Não degradar SEO** — Google indexa HTML, não RSC
- **Não quebrar funcionalidades** do site (auth, gamificação, quizzes)
- **Reversibilidade** — não criar lock-in técnico que dificulte migração futura
- **Custo zero** — sem upgrade de plano nem mudança de hosting agora
- **Compatibilidade com plano de migração** para SSR/ISR na VPS (próximas semanas)

## Considered options

1. **Excluir `__next.*.txt` do FTP** (escolhida) — `exclude: '**/__next.*.txt'` no workflow do FTP Deploy Action. Reduz 8.213 → 1.926 arquivos.
2. **Upgrade Hostinger para Cloud Professional/Enterprise** — pagar mais por SFTP/SSH. ~R$40-100/mês adicional.
3. **Migrar frontend para Cloudflare Pages** — grátis, sem limite de arquivos. ~30 min de setup + mudança de DNS.
4. **Migrar para SSR/ISR na VPS agora** — solução final, mas requer 1-2 semanas de trabalho de container Next.js + nginx upstream.
5. **Manter SSG static e otimizar FTP** — tentar `paralelism`, `chunked upload`. Nenhuma action FTP estável suporta isso bem.

## Decision outcome

**Chosen option: Opção 1 — Excluir `__next.*.txt` do upload FTP**, porque é a única que destrava o deploy *hoje* sem custo e sem reescrita arquitetural, mantendo total reversibilidade.

### Positive consequences

- **Deploy completa em ~15 min** (vs 1h+ com timeout). Dentro do limite Hostinger.
- **SEO 100% preservado** — Googlebot indexa HTML (`*.html`), não usa RSC payloads.
- **Conteúdo, login, gamificação, quizzes, sons, PWA, SRS, ranking, search — todos funcionam idênticos.**
- **Zero risco de quebrar produção** — RSC payload é puramente otimização de UX, não funcionalidade.
- **Compatível com plano SSR/ISR futuro** — quando frontend migrar para Node.js container na VPS (estratégia já planejada), RSC payloads voltam a ser servidos em runtime e o exclude no FTP perde relevância (não tem mais FTP).
- **Reversível em 5 segundos** — basta remover a linha `exclude` do workflow.

### Negative consequences

- **Degrada navegação interna client-side** entre páginas. Cliques em `<Link>` viram navegação tradicional (full page reload) em vez de soft navigation com RSC streaming.
- **Latência percebida de clique em link interno**: ~80ms → ~400ms.
- **Estado efêmero de UI** (modais abertos, toasts em andamento, scroll position de listas) é perdido entre navegações. Estado persistido em localStorage (XP, badges, progresso) **não é afetado**.
- **GameHUD re-renderiza** entre páginas (pisca brevemente).
- **Sons Web Audio re-inicializam** a cada navegação (precisa do unlockAudio gesture novamente em alguns casos).

**Impacto na UX em números:**

| Cenário | Antes | Depois | Delta |
|---|---|---|---|
| Google → home (1ª visita) | ~1.5s | ~1.5s | Idêntico |
| F5 / refresh | ~1s | ~1s | Idêntico |
| Home → módulo | ~80ms | ~400ms | +320ms |
| Módulo → próximo módulo | ~80ms | ~400ms | +320ms |
| Sequência de 5 módulos (estudo) | ~400ms total | ~2s total | +1.6s |

**Não afeta**: SEO, primeira visita, acessibilidade, conteúdo, autenticação, gamificação persistente, search, ranking, PWA install, service worker.

## Pros and cons of the options

### Opção 1 — Excluir `__next.*.txt`

- 👍 Resolve o problema **hoje** com 3 linhas de YAML
- 👍 Reversível trivialmente
- 👍 SEO intacto
- 👍 Funcionalidade 100% preservada
- 👍 Compatível com migração futura para SSR (não cria débito técnico)
- 👎 Degrada feel de SPA moderna (navegação interna mais lenta)
- 👎 Solução temporária, não permanente

### Opção 2 — Upgrade Hostinger

- 👍 Mantém arquitetura SSG sem mudanças
- 👍 SFTP geralmente mais robusto que FTP
- 👎 Custo recorrente (~R$40-100/mês)
- 👎 Não resolve fundamentalmente — só empurra o limite, FTP ainda é gargalo
- 👎 Acoplamento maior com Hostinger (vendor lock-in)

### Opção 3 — Cloudflare Pages

- 👍 Grátis
- 👍 Deploy em ~30s via git push
- 👍 CDN global (latência <50ms internacional)
- 👍 Sem limite de arquivos
- 👎 ~30 min de setup + mudança de DNS
- 👎 Vendor adicional (Cloudflare além de Hostinger)
- 👎 Aprender outro painel

### Opção 4 — SSR/ISR na VPS agora

- 👍 Solução **definitiva** — elimina FTP totalmente
- 👍 Permite conteúdo dinâmico do DB (alinhado com plano de mover conteúdo para DB)
- 👍 Edição em tempo real via DB (não precisa rebuild)
- 👎 1-2 semanas de trabalho (Dockerfile do frontend, container, nginx upstream, env vars)
- 👎 Bloqueia outros trabalhos enquanto migra
- 👎 Risco de quebrar produção durante transição

### Opção 5 — Otimizar FTP (paralelismo, chunked)

- 👎 Nenhum action FTP estável suporta multi-connection
- 👎 Hostinger limita conexões concorrentes mesmo se cliente suportasse
- 👎 Aumenta complexidade sem garantia de funcionar
- 👎 Não resolve o timeout server-side de 3600s — só posterga

## Implementation

Mudança aplicada em `.github/workflows/deploy.yml`, job `deploy-frontend`, step `Upload para Hostinger via FTP`:

```yaml
- name: Upload para Hostinger via FTP
  uses: SamKirkland/FTP-Deploy-Action@v4.3.5
  with:
    server: ${{ secrets.HOSTINGER_FTP_SERVER }}
    username: ${{ secrets.HOSTINGER_FTP_USERNAME }}
    password: ${{ secrets.HOSTINGER_FTP_PASSWORD }}
    local-dir: ./frontend/out/
    server-dir: ${{ secrets.HOSTINGER_FTP_DIR }}
    log-level: standard
    dangerous-clean-slate: false
    exclude: |
      **/.git*
      **/.git*/**
      **/node_modules/**
      **/.DS_Store
      **/Thumbs.db
      **/__next.*.txt    # ADR-0002: RSC payloads excluídos para evitar timeout 3600s da Hostinger
```

Nenhuma alteração no código do frontend foi necessária. O Next.js continua gerando os arquivos no build local — só não são enviados para produção.

## Reversal plan

Para reverter (caso descubramos que algum fluxo crítico depende dos RSC payloads):

1. Remover a linha `**/__next.*.txt` do `exclude` no workflow
2. Próximo deploy reenvia tudo (sync incremental do FTP Deploy Action detecta os arquivos faltando e envia só esses)
3. Tempo de reversão: ~1 deploy completo (provavelmente vai dar timeout de novo — sinal para acelerar Opção 3 ou 4)

## Migration plan (próxima fase)

Esta ADR é **temporária e explícita**. A solução definitiva é migrar para uma das duas:

- **Cloudflare Pages** (Opção 3) — caminho mais rápido, ~30 min
- **SSR/ISR na VPS** (Opção 4) — caminho final, alinhado com plano de mover conteúdo para o backend (ver ADR futura "0003-content-in-database-with-block-renderer")

Quando qualquer uma das duas estiver em produção, esta ADR fica **Superseded** e o `exclude: '**/__next.*.txt'` pode ser removido sem efeito prático.

## Links

- PR: `b542c3b` ... `<próximo commit>`
- Erro original no log: `FTPError: 421 Session Timeout (3600 seconds): closing control connection`
- Workflow file: `.github/workflows/deploy.yml`
- Action: [SamKirkland/FTP-Deploy-Action v4.3.5](https://github.com/SamKirkland/FTP-Deploy-Action)
- Next.js RSC docs: https://nextjs.org/docs/app/building-your-application/rendering/server-components
