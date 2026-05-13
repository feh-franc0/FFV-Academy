# 📋 BACKLOG — Pendências do Fernando

> Arquivo de **tarefas que só você (humano) pode fazer** — configurações em painéis web, ações no GitHub UI, decisões editoriais, contratação de serviços, etc.
>
> **Marque `[x]`** ao concluir cada item. Adicione data e nota se relevante.
>
> Para roadmap técnico de migração de conteúdo: ver [`MIGRATION_PLAN_CONTENT_TO_DB.md`](./MIGRATION_PLAN_CONTENT_TO_DB.md).
> Para roadmap de produto: ver [`BACKEND_ROADMAP.md`](./BACKEND_ROADMAP.md) e [`MELHORIAS.md`](./MELHORIAS.md).

---

## 🚨 P0 — Crítico (essa semana)

### Segurança e governança

- [ ] **Branch protection na `main`**
  - GitHub → Settings → Branches → Add rule, pattern `main`
  - Marcar:
    - ✅ Require a pull request before merging
    - ✅ Require status checks to pass (selecionar `CI success`)
    - ✅ Require branches to be up to date before merging
    - ✅ Do not allow bypassing the above settings
    - ⬜ Require signed commits (opcional, se você usa GPG)
  - **Por quê**: evita push acidental em prod, força PR e CI verde
  - **Tempo**: 3 min

- [ ] **Verificar 2FA habilitado na conta GitHub**
  - GitHub → Settings → Password and authentication
  - Confirmar TOTP ativo (Authy / Google Authenticator)
  - Salvar recovery codes em local seguro
  - **Por quê**: token GitHub roubado = controle do deploy

- [ ] **Verificar 2FA habilitado na Hostinger**
  - hPanel → avatar → Segurança
  - Ativar autenticação de 2 fatores
  - **Por quê**: acesso ao hPanel = controle de VPS + frontend

### Operação

- [ ] **Configurar `DEPLOY_NOTIFY_WEBHOOK_URL`** (Discord ou Slack)
  - GitHub → Settings → Secrets and variables → Actions → New secret
  - Nome: `DEPLOY_NOTIFY_WEBHOOK_URL`
  - Valor: webhook do canal Discord/Slack onde você quer receber notificações
  - **Por quê**: saber em tempo real quando deploy falha
  - **Tempo**: 10 min (criar webhook + colar)

- [ ] **Atualizar variable `DEPLOY_ENABLED=true`** (verificar se já está)
  - GitHub → Settings → Variables → Actions
  - Se não existir ou estiver `false`, criar com valor `true`
  - **Por quê**: workflow de deploy precisa disso pra rodar

---

## ⚡ P1 — Importante (próximas 2 semanas)

### Segurança

- [ ] **Cloudflare na frente do site** (free tier)
  - Criar conta em cloudflare.com (se não tem)
  - Adicionar `fernandofrancovalle.com` como site
  - Trocar nameservers da Hostinger → Cloudflare
  - Ativar proxy laranja
  - **Por quê**: WAF + DDoS protection + CDN. Resolve 90% dos ataques L3/L7.
  - **Tempo**: 30 min + propagação DNS (até 24h)

- [ ] **Configurar HSTS preload**
  - Editar nginx config na VPS: `add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;`
  - Submeter em https://hstspreload.org
  - **Por quê**: previne downgrade attacks
  - **Tempo**: 15 min

- [ ] **Página `/security.txt`** (responsible disclosure)
  - Criar `frontend/public/.well-known/security.txt`
  - Conteúdo:
    ```
    Contact: mailto:security@fernandofrancovalle.com
    Preferred-Languages: pt, en
    Canonical: https://fernandofrancovalle.com/.well-known/security.txt
    Expires: 2027-05-13T00:00:00Z
    ```
  - **Por quê**: padrão pra pesquisadores reportarem falhas
  - **Tempo**: 10 min

### Backup

- [ ] **Configurar bucket S3/B2/R2 pra backups do Postgres**
  - Recomendação: **Backblaze B2** (10 GB grátis, simples)
  - Criar bucket privado `ffv-backups-prod`
  - Gerar Application Key com permissão write-only nesse bucket
  - Anotar: `KEY_ID`, `APPLICATION_KEY`, `BUCKET_NAME`, `ENDPOINT_URL`
  - **Por quê**: pré-requisito pra cron de backup automático
  - **Tempo**: 30 min

- [ ] **Gerar par de chaves GPG pra criptografar backups**
  - Local: `gpg --full-generate-key` (RSA 4096, sem expiração)
  - Exportar pública: `gpg --armor --export > pubkey.asc` (vai pra VPS)
  - Guardar privada em local seguro (1Password, Yubikey, USB criptografado)
  - **Por quê**: backups em cloud devem ser cifrados
  - **Tempo**: 20 min

### Conta e infra

- [ ] **Avaliar upgrade Hostinger pra Cloud Professional**
  - Plano atual: Cloud Startup (sem SSH/SFTP)
  - Cloud Professional: tem SSH, mais RAM, mais inodes (~R$50/mês)
  - **Por quê**: SFTP + rsync = deploys mais rápidos e robustos que FTP
  - **Alternativa**: pular upgrade e migrar pra Cloudflare Pages (grátis)

- [ ] **Decisão arquitetural: SSR/ISR na VPS vs Cloudflare Pages**
  - Opções no [`MIGRATION_PLAN_CONTENT_TO_DB.md`](./MIGRATION_PLAN_CONTENT_TO_DB.md) Sprint 9
  - Discutir trade-offs com Claude antes de commitar
  - **Por quê**: bloqueia migração de SSG → dinâmico

---

## 🌱 P2 — Estratégico (próximo mês)

### Conteúdo

- [ ] **Auditoria editorial dos 915 módulos**
  - Sprint 7-8 do MIGRATION_PLAN
  - Criar planilha (Notion/Sheets) com colunas: slug, hub, trilha, decisão (manter/cortar/consolidar)
  - Critério: alinhamento com pitch "vire empreendedor tech digital"
  - Meta: cortar 30-40% (915 → ~500-600 módulos focados)
  - **Por quê**: foco editorial > volume

- [ ] **Definir tom editorial e voz da marca**
  - Documento de style guide: 1ª pessoa? 2ª? Formal? Casual?
  - Hoje há inconsistência entre módulos
  - **Por quê**: base pra qualquer escala de conteúdo

### Comunicação

- [ ] **Configurar domínio do email** (Resend SPF/DKIM)
  - Resend → Domains → Add domain → seguir DNS records
  - Adicionar TXT records na Hostinger DNS
  - **Por quê**: emails caem em spam sem isso

- [ ] **Página `/privacidade` LGPD-completa**
  - Política de privacidade real (não placeholder)
  - Pode usar gerador como termly.io ou contratar advogado
  - **Por quê**: requisito legal Brasil
  - Hoje há link, validar conteúdo

- [ ] **Termos de uso**
  - Idem
  - **Por quê**: requisito legal

### Monetização (quando hora chegar)

- [ ] **Decidir modelo de monetização**
  - Opções no `BACKEND_ROADMAP.md` Tier 5
  - Quando: depois de 100-500 usuários ativos
  - **Por quê**: bloqueia ativação de Stripe + planos

- [ ] **Setup Stripe production**
  - Criar conta Stripe BR
  - Configurar webhook secret
  - Trocar `FEATURE_BILLING_ENABLED=true` quando pronto

---

## 💡 P3 — Visão longa (3+ meses)

- [ ] **Bug bounty program** (HackerOne / Intigriti)
  - Quando: depois de >1000 usuários
  - **Por quê**: pentest contínuo por especialistas

- [ ] **Certificação BR** (ISO 27001 ou similar)
  - Quando: depois de B2B / Teams plan
  - **Por quê**: empresas exigem pra contratar

- [ ] **Multi-idioma** (EN/ES)
  - Quando: depois de 5k usuários BR
  - **Por quê**: expansão Latam/global

---

## 📊 Histórico de conclusão

| Data | Item | Nota |
|---|---|---|
| 2026-05-13 | _exemplo: branch protection_ | _exemplo: ativado com 3 status checks_ |

---

## 🔄 Como manter este documento

- Adicionar item NOVO: insere na seção P0/P1/P2/P3 conforme urgência
- Concluir: marca `[x]` + adiciona linha na tabela "Histórico"
- Mover prioridade: corta de uma seção, cola em outra
- Discussões longas sobre um item: criar issue no GitHub e linkar daqui
