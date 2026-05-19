# UX Heuristic Eval — FFV Academy (2026-05-19)

Companheiro de [`PLATFORM_AUDIT_2026-05.md`](./PLATFORM_AUDIT_2026-05.md) e [`MARKET_REFRESH_2026-05.md`](./MARKET_REFRESH_2026-05.md). Síntese final em [`VALIDATION_REPORT_2026-05.md`](./VALIDATION_REPORT_2026-05.md).

20 friction points priorizados (P0/P1/P2) nos 4 fluxos críticos: aquisição, onboarding em base, estudo em módulo, engajamento/retenção.

---

## P0 — conserta hoje

### 1. Telefone WhatsApp sem máscara nem validação
- **Fluxo:** Aquisição
- **Heurística:** Error prevention
- **Path:** `frontend/src/components/home/StudyRequestForm.tsx:338-349`
- **Fix:** Máscara `(99) 99999-9999` no `onChange` + `pattern` HTML5. Backend recebe número limpo.

### 2. Botão "Pedir dica" sem `aria-expanded` nem foco programático
- **Fluxo:** Estudo
- **Heurística:** Acessibilidade WCAG AA
- **Path:** `frontend/src/components/base/BaseModule.tsx:866-908`
- **Fix:** `aria-expanded={hintOpen}` + `aria-controls` apontando pro container da dica.

### 3. Quiz options usam `<button>` em `<ul>` sem `role="radiogroup"` — Tab lento entre alternativas
- **Fluxo:** Estudo
- **Heurística:** Flexibility & efficiency / Acessibilidade
- **Path:** `frontend/src/components/base/BaseModule.tsx:912-975`, `ReviewClient.tsx:160-197`
- **Fix:** `role="radiogroup"` + `role="radio"` com handler de setas, ou atalho 1-4/A-D.

### 4. Botão submit duplica request se rede lenta
- **Fluxo:** Aquisição
- **Heurística:** Error prevention
- **Path:** `frontend/src/components/home/StudyRequestForm.tsx:533-546`
- **Fix:** Além de `disabled`, bloquear `form` com overlay ou token de idempotência no body.

### 5. Botão "Sair" no `/revisar` sempre joga pra `/` mesmo se veio de base
- **Fluxo:** Retenção
- **Heurística:** User control & freedom
- **Path:** `frontend/src/components/ReviewClient.tsx:125-131`
- **Fix:** `router.back()` ou ler `?from=` da query e voltar pra rota original.

---

## P1 — esta semana

### 6. Drawer mobile (`TrailSummaryDrawer`) sem focus trap
- **Fluxo:** Estudo
- **Heurística:** Acessibilidade WCAG AA
- **Path:** `frontend/src/components/base/TrailSummaryDrawer.tsx:54-217`
- **Fix:** `focus-trap-react` ou manual; focar o botão X ao abrir.

### 7. FAB mobile sai do viewport em telas <360px
- **Fluxo:** Estudo (mobile)
- **Heurística:** Mobile-first
- **Path:** `frontend/src/components/base/FloatingTrailMenuButton.tsx:31-69`
- **Fix:** Badge contador (24×24) com `right: 0` + `transform: translate(25%, 25%)` clampado.

### 8. RatingButton sem `aria-label` descritivo
- **Fluxo:** Estudo
- **Heurística:** Match real world / Acessibilidade
- **Path:** `frontend/src/components/ReviewClient.tsx:237-248`
- **Fix:** `aria-label="Errei. Reset do card, +0 XP."` etc.

### 9. Form de captação não valida e-mail real (typo `@gmial.com` passa)
- **Fluxo:** Aquisição
- **Heurística:** Error prevention
- **Path:** `frontend/src/components/home/StudyRequestForm.tsx:325-337`
- **Fix:** Validar onBlur com regex + sugerir domínio via lib `mailcheck` ("Você quis dizer @gmail.com?").

### 10. StatusStep "Curadoria humana" fixo como `active` — usuário 12h depois ainda vê "em andamento"
- **Fluxo:** Aquisição (pós-submit)
- **Heurística:** Visibility of system status
- **Path:** `frontend/src/components/home/StudyRequestForm.tsx:182-201`
- **Fix:** Ler estado real via `GET /study-requests/{id}` e ajustar `state="done"|"active"|"pending"` dinâmico; persistir ID em localStorage.

### 11. Jargão técnico sem tooltips ("SLA", "AB30", "freeze", "streak")
- **Fluxo:** Todos
- **Heurística:** Match real world / Recognition vs recall
- **Path:** `LandingClient.tsx:130`, `ProgressoClient.tsx:117`, `stats-publicas/page.tsx:96`
- **Fix:** `<abbr title="...">` em primeira ocorrência ou microtooltip clicável.

### 12. Touch targets <44px em mobile
- **Fluxo:** Aquisição, Estudo
- **Heurística:** Mobile-first WCAG 2.5.5
- **Path:** `StudyRequestForm.tsx:483-492` (botão "×" remover anexo ~16×16), `BaseModule.tsx:866` ("Pedir dica" ~28px)
- **Fix:** Padding mínimo 12px Y, `min-w-[44px] min-h-[44px]`.

### 13. Sem keyboard shortcut pra prev/next no BaseModule
- **Fluxo:** Estudo (power user)
- **Heurística:** Flexibility & efficiency
- **Path:** `frontend/src/components/base/BaseModule.tsx:333-425`
- **Fix:** Registrar `←`/`→` no `KeyboardShortcuts.tsx` + hint visual no rodapé.

### 14. Sidebar desktop não mostra módulos concluídos com checkmark
- **Fluxo:** Estudo
- **Heurística:** Visibility of system status / Recognition
- **Path:** `frontend/src/components/base/BaseModule.tsx:115-154`
- **Fix:** Usar `state?.completedModules.includes(mod.slug)` igual o drawer mobile (`TrailSummaryDrawer.tsx:193`) — consistency.

### 15. `/perfil` mistura preferences + DevProfileClient sem section headers
- **Fluxo:** Engajamento
- **Heurística:** Aesthetic & minimalist / Consistency
- **Path:** `frontend/src/app/perfil/page.tsx:14-23`
- **Fix:** `<h1>Perfil</h1>` + 2 `<section>` com headers "Preferências" e "Dev Card público" + separador.

---

## P2 — mês

### 16. Onboarding em base não tem indicador "Você está em [Base]" no header mobile
- **Path:** `KnowledgeBaseHome.tsx:104-122`

### 17. CTA "Voltar pra solicitar minha base" em `/stats-publicas` não tem âncora pro form
- **Path:** `stats-publicas/page.tsx:136-148`

### 18. ProgressoClient 5 KPIs em mobile quebram pra 1 coluna sem hierarquia visual
- **Path:** `ProgressoClient.tsx:114-121`

### 19. Quiz no BaseModule sem visão geral "X de Y" — usuário não sabe quanto falta
- **Path:** `BaseModule.tsx:798-816`

### 20. Hover handlers inline (`onMouseOver/Out`) quebram em touch devices
- **Path:** `BaseModule.tsx:131-135, 349, 384`; `ProgressoClient.tsx:617-618`

---

## Top 5 arquivos críticos pra correção P0/P1

1. `frontend/src/components/home/StudyRequestForm.tsx` (4 issues — máscara, e-mail, dupla submissão, SLA dinâmico)
2. `frontend/src/components/base/BaseModule.tsx` (4 issues — aria hint, radiogroup, sidebar check, shortcuts)
3. `frontend/src/components/base/TrailSummaryDrawer.tsx` (focus trap)
4. `frontend/src/components/ReviewClient.tsx` (back, aria-label radio)
5. `frontend/src/components/base/FloatingTrailMenuButton.tsx` (badge clip)
