#!/usr/bin/env bash
# Setup inicial da VPS Hostinger. Roda UMA única vez como root.
# Testado em Ubuntu 22.04 LTS.
set -euo pipefail

log()  { echo -e "\n\033[1;32m[SETUP]\033[0m $*"; }
warn() { echo -e "\033[1;33m[AVISO]\033[0m $*"; }
die()  { echo -e "\033[1;31m[ERRO]\033[0m $*" >&2; exit 1; }

[[ $EUID -ne 0 ]] && die "Rode como root: sudo bash vps-setup.sh"

# ─── Variáveis ────────────────────────────────────────────────────────────────
read -rp "Domínio da API (ex: api.fernandofrancovalle.com): " API_DOMAIN
read -rp "E-mail para Let's Encrypt: " LE_EMAIL
read -rp "Usuário de deploy SSH (padrão: deploy): " DEPLOY_USER
DEPLOY_USER="${DEPLOY_USER:-deploy}"

# ─── 1. Atualizar sistema ─────────────────────────────────────────────────────
log "Atualizando pacotes..."
apt-get update -q && apt-get upgrade -yq

# ─── 2. Instalar dependências ─────────────────────────────────────────────────
log "Instalando dependências..."
apt-get install -yq \
  curl ca-certificates gnupg ufw fail2ban \
  certbot python3-certbot-nginx

# ─── 3. Instalar Docker ───────────────────────────────────────────────────────
log "Instalando Docker..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update -q
apt-get install -yq docker-ce docker-ce-cli containerd.io docker-compose-plugin

systemctl enable docker && systemctl start docker
log "Docker $(docker --version) instalado."

# ─── 4. Instalar golang-migrate CLI ──────────────────────────────────────────
log "Instalando golang-migrate..."
MIGRATE_VERSION="4.17.1"
curl -sL "https://github.com/golang-migrate/migrate/releases/download/v${MIGRATE_VERSION}/migrate.linux-amd64.tar.gz" \
  | tar xz -C /usr/local/bin migrate
chmod +x /usr/local/bin/migrate
log "migrate $(migrate -version) instalado."

# ─── 5. Criar usuário de deploy ───────────────────────────────────────────────
log "Criando usuário de deploy: $DEPLOY_USER..."
if ! id "$DEPLOY_USER" &>/dev/null; then
  useradd -m -s /bin/bash "$DEPLOY_USER"
fi
usermod -aG docker "$DEPLOY_USER"
mkdir -p "/home/$DEPLOY_USER/.ssh"
chmod 700 "/home/$DEPLOY_USER/.ssh"

warn "Cole a CHAVE PÚBLICA SSH do GitHub Actions em /home/$DEPLOY_USER/.ssh/authorized_keys"
warn "Você vai gerar o par de chaves com: ssh-keygen -t ed25519 -C 'github-actions-deploy'"
warn "A chave privada vai para o secret VPS_SSH_KEY no GitHub."
read -rp "Pressione Enter para continuar após configurar a authorized_keys..."

chmod 600 "/home/$DEPLOY_USER/.ssh/authorized_keys" 2>/dev/null || true
chown -R "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"

# ─── 6. Estrutura de diretórios ───────────────────────────────────────────────
log "Criando estrutura /opt/ffv/..."
mkdir -p /opt/ffv/{nginx/conf.d,migrations,bin}
chown -R "$DEPLOY_USER:$DEPLOY_USER" /opt/ffv

# ─── 7. Firewall (ufw) ────────────────────────────────────────────────────────
log "Configurando firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
log "Regras de firewall aplicadas."

# ─── 8. Fail2ban (proteção contra força bruta SSH) ───────────────────────────
log "Ativando fail2ban..."
systemctl enable fail2ban && systemctl start fail2ban

# ─── 9. Criar .env template ───────────────────────────────────────────────────
log "Criando template do arquivo .env..."
cat > /opt/ffv/.env.template << 'EOF'
# ─── App ──────────────────────────────────────────────────────────────────────
APP_ENV=production
HTTP_PORT=8080
# AUTH_DEV_BYPASS_ENABLED deve ficar false em produção — o boot recusa subir
# se estiver true com APP_ENV != development. Explícito aqui por segurança.
AUTH_DEV_BYPASS_ENABLED=false

# ─── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL=postgres://ffv:SUA_SENHA_POSTGRES@postgres:5432/ffv_prod?sslmode=disable
POSTGRES_PASSWORD=SUA_SENHA_POSTGRES

# ─── Redis ────────────────────────────────────────────────────────────────────
REDIS_URL=redis://:SUA_SENHA_REDIS@redis:6379/0
REDIS_PASSWORD=SUA_SENHA_REDIS

# ─── JWT ──────────────────────────────────────────────────────────────────────
JWT_SECRET=gere-com-openssl-rand-base64-48

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS=https://fernandofrancovalle.com

# ─── Stripe ───────────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SIMULADO_PRICE_ID=price_...

# ─── Resend (e-mail) ──────────────────────────────────────────────────────────
RESEND_API_KEY=re_...

# ─── Twilio (SMS) ─────────────────────────────────────────────────────────────
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+55...

# ─── Anthropic ────────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6
EOF

cp /opt/ffv/.env.template /opt/ffv/.env
chmod 600 /opt/ffv/.env
chown "$DEPLOY_USER:$DEPLOY_USER" /opt/ffv/.env

warn "IMPORTANTE: edite /opt/ffv/.env com os valores reais antes de fazer o primeiro deploy."
warn "  nano /opt/ffv/.env"

# ─── 10. Obter certificado Let's Encrypt ─────────────────────────────────────
log "Obtendo certificado SSL para $API_DOMAIN..."
warn "Certifique-se que o DNS $API_DOMAIN já aponta para o IP desta VPS."
read -rp "DNS configurado? Pressione Enter para continuar..."

# Para o certbot standalone (nginx ainda não está rodando)
certbot certonly \
  --standalone \
  --non-interactive \
  --agree-tos \
  --email "$LE_EMAIL" \
  -d "$API_DOMAIN" \
  || warn "Falha no certbot — configure manualmente depois com: certbot certonly --standalone -d $API_DOMAIN"

# ─── 11. Cron para renovação automática do certificado ───────────────────────
log "Configurando renovação automática do certificado..."
cat > /etc/cron.d/certbot-renew << EOF
# Tenta renovar às 03:00 e 15:00. Recarrega nginx se renovar.
0 3,15 * * * root certbot renew --quiet --deploy-hook "docker exec ffv-prod-nginx-1 nginx -s reload"
EOF

# ─── 12. Atualizar domínio no nginx conf ─────────────────────────────────────
warn "Lembre de atualizar o domínio no arquivo nginx:"
warn "  sed -i 's/api.fernandofrancovalle.com/$API_DOMAIN/g' /opt/ffv/nginx/conf.d/api.conf"
warn "(isso será feito automaticamente no primeiro deploy se o domínio for o mesmo)"

# ─── Resumo ───────────────────────────────────────────────────────────────────
log "Setup concluído!"
echo ""
echo "  Próximos passos:"
echo "  1. Edite /opt/ffv/.env com todos os valores reais"
echo "  2. Configure os secrets no GitHub (ver README do deploy)"
echo "  3. Faça push para main — o deploy roda automaticamente"
echo ""
echo "  Secrets necessários no GitHub (Settings → Secrets → Actions):"
echo "    VPS_HOST                 → $(curl -s ifconfig.me 2>/dev/null || echo 'IP_DA_VPS')"
echo "    VPS_USER                 → $DEPLOY_USER"
echo "    VPS_SSH_KEY              → conteúdo da chave privada ed25519"
echo "    VPS_PORT                 → 22"
echo "    NEXT_PUBLIC_API_BASE_URL → https://$API_DOMAIN"
echo "    HOSTINGER_FTP_SERVER     → (servidor FTP da Hostinger)"
echo "    HOSTINGER_FTP_USERNAME   → (usuário FTP)"
echo "    HOSTINGER_FTP_PASSWORD   → (senha FTP)"
echo "    HOSTINGER_FTP_DIR        → /public_html/"
echo ""
echo "  Crie também um Environment 'production' no GitHub:"
echo "    Settings → Environments → New environment → production"
