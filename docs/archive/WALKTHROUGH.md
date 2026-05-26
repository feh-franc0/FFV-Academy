# Walkthrough manual — Simulados & Auth MVP

> Temporário. Não commitar. Entregue ao revisor, depois apagar.

## Preparação
1. `npm run dev` → abrir http://localhost:3000
2. Abrir DevTools → Application → Local Storage → fernandofrancovalle.com
3. Limpar tudo (`clearAll()` no console, ou botão "Clear" no DevTools)

## Cenário 1 — Primeiro contato + login + 10 grátis
1. Home (`/`): verificar que o **SimuladosHero** laranja aparece logo após o hero principal, antes dos hubs
2. Clicar em **Simulados** no GameHUD (topo) — badge "NOVO"
3. Abre `/simulados` com 2 cards (AWS Practitioner + SAA "Em breve")
4. Clicar no card do **AWS Cloud Practitioner**
5. Em `/simulados/aws-practitioner`: preview da questão 1 visível, botões "Começar grátis" + "Desbloquear por R$ 47"
6. Clicar em **"Começar grátis (10 questões)"** → **LoginModal abre**
7. Preencher: nome, email, telefone, **marcar checkbox LGPD** (requisitando)
8. Clicar "Receber código" → modal avança para step 2 com input de 6 dígitos
9. Digitar `000000` → clicar "Entrar"
10. Redirecionamento automático para `/simulados/aws-practitioner/fazer`
11. Ver split-pane com questão 1 de 20 à esquerda, grid numerado + timer à direita
12. Responder questões 1-10, clicando "Confirmar" em cada. Modo estudo (default) revela explicação do tutor após confirmar
13. Testar **"Pergunte ao tutor"** na questão 1 → abre Sheet lateral com banner "🧪 Tutor em modo demo". Clicar "Explique com analogia" → resposta mockada aparece

## Cenário 2 — Paywall + pagamento + continuação
14. Chegar na questão 11 → em vez da questão, ver **PaywallCard** com "🔒 Você terminou as 10 questões grátis"
15. Clicar "Desbloquear por R$ 47" → 600ms de processamento → continua no simulado
16. Responder até o fim (pode errar de propósito pra testar score < 100%)
17. Clicar **"Finalizar simulado"** no painel direito
18. Redirecionamento para `/simulados/aws-practitioner/resultado`
19. Ver score grande, breakdown por tópico (barras verdes/laranjas), XP creditado + badges concedidos
20. Expandir "Revisão das questões" — erradas aparecem primeiro
21. Se score ≥ 70%: botão "🎓 Emitir certificado" ativado. Clicar
22. Modal abre com canvas renderizado, nome pré-preenchido editável, botões "📥 Baixar PNG" + "🔗 Copiar link"
23. Baixar PNG → arquivo salva, validar visualmente
24. Copiar link → abrir em nova aba `/verificar?h=HASH` → ver "✅ Certificado válido" com dados

## Cenário 3 — Preferências e LGPD
25. GameHUD: clicar no avatar (iniciais do user) → vai para `/preferencias`
26. Ver dados completos, lista com simulado-aws-practitioner, toggle de consent
27. Desmarcar consent → refresh → verificar que ficou desmarcado
28. Clicar "📥 Baixar meus dados" → JSON exporta
29. (OPCIONAL) Clicar "🗑 Excluir minha conta" → confirmar → redireciona pra Home, tudo limpo

## Cenário 4 — Estado limpo + reopen
30. Clicar "Sair desta conta" em /preferencias
31. Refresh → GameHUD mostra "Entrar" (sem avatar)
32. Clicar "Simulados" → voltar pro catálogo
33. Tentar "Começar grátis" → LoginModal reabre (requireLogin funciona)

## Validações automatizadas
- `npx tsc --noEmit` → ✅ zero erros
- `npm test` → ✅ 229/229 passando (21 arquivos)
- `npm run build` → ✅ prerender estático de todas as rotas

## TODOs para backend real (marcados no código)
- `src/lib/auth.ts:48` — `requestToken` vira POST `/api/auth/request-token`
- `src/lib/auth.ts:73` — `verifyToken` vira POST `/api/auth/verify`
- `src/lib/auth.ts:117` — `grantProduct` substituir por Stripe Checkout + webhook
- `src/lib/tutor-responses.ts:1` — trocar map mockado por Claude API com prompt caching
- `src/lib/certificates.ts:1` — lookup em `GET /api/certificates/:hash` para verificação global
- `src/app/simulados/[slug]/SimuladoDetailClient.tsx:43` — checkout → webhook confirma → grant

## Limitações MVP conhecidas
- Certificado só verifica no device emitente (localStorage)
- Progresso de simulado não sincroniza entre devices
- Pagamento é cliente (inseguro em produção)
- Paidproducts limpam no logout (em produção vive no server)
- Tutor com respostas pré-escritas para ~5 questões selecionadas
- Módulo do dia roda determinístico no cliente (timezone pode divergir)
