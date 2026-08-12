# Auditoria integral da plataforma — 11/ago/2026

> **O que é este documento.** Auditoria de produto, fluxos, backend/segurança, UX/UI/
> acessibilidade, conteúdo e performance, com cada achado classificado (P0–P3), rastreado
> até um OpenSpec Change Pack, e — para os P0 — reverificado à mão contra o código.
>
> **Método.** Quatro auditorias paralelas (fluxos ponta a ponta, backend Go/segurança, UX/
> estados/Design System, conteúdo em duas camadas + performance estática) sobre o
> repositório e o build de 10/ago. Todo P0 foi relido pessoalmente antes de entrar aqui —
> os quatro que amostrei bateram 4/4 com o código. Onde não houve reverificação pessoal, o
> achado está marcado **plausível** (confiança alta pela amostra, não confirmado a dedo).
>
> **Restrição respeitada.** Esta etapa é de descoberta e especificação. Nenhum código de
> produção foi alterado; nenhuma dependência, migração ou infra foi tocada. Os únicos
> artefatos escritos são este relatório, o índice do OpenPack e os Change Packs.

---

## 1. Conclusão executiva

A plataforma tem profundidade de conteúdo acima do mercado e uma disciplina de qualidade
rara (16 gates de conteúdo no CI, provados por mutação; 1.076 testes de frontend; suíte de
segurança Go de 67 casos). **A camada de conteúdo é o ativo mais forte e está saudável.**

O problema não está no conteúdo — está na **camada de aplicação que o serve**. A auditoria
encontrou **7 defeitos P0** confirmados, concentrados em quatro sistemas: a prova
cronometrada (pontua errado e é fraudável), a sincronização de progresso (nunca envia nada),
a autenticação (bypass ligado por default de config) e a carga por rota (o currículo inteiro
viaja duas vezes em toda página). Nenhum é de conteúdo; todos são de engenharia de produto.

Um agravante estratégico atravessa vários achados: **muita coisa foi construída e nunca
ligada.** O motor de prova server-authoritative existe completo no backend e não tem
consumidor. O índice leve de currículo existe e é anulado no bundle. A integração Stripe
existe e não tem ponto de entrada na UI. O padrão certo de estados de erro existe em
`/ranking` e não foi generalizado. O trabalho de corrigir é, em boa parte, **ligar o que já
foi feito** — não construir do zero.

## 2. Escopo efetivamente auditado e limitações

**Auditado:** 96 rotas Next, 127 componentes, 490 seeds de conteúdo, 66 endpoints Go, 48
migrations, os 6 fluxos críticos (login, concluir módulo, simulado, SRS, billing, sync), o
Design System (`globals.css`), e o build de produção de 10/ago.

**Não executado (limitações declaradas, não "aprovado por omissão"):**
- **E2E Playwright e varredura visual (535+ telas):** bloqueados por conflito de porta (o dev server já estava ativo e a config local sobe servidor próprio em modo mock). Comando para rodar depois: `cd frontend && npm run e2e` / `npm run varredura` com a porta 3000 livre.
- **`make test-integration` / `test-load`:** exigem Postgres/Redis locais (integração) e são de carga (fora do escopo seguro).
- **Comportamento exato em produção** depende de `NEXT_PUBLIC_API_BASE_URL` e das `FEATURES.*` na imagem que roda — não confirmado qual build está no ar. Onde a severidade muda conforme `hasBackend()`, o achado registra a condicional.

**Nota sobre "OpenPack":** o termo não existe no repositório (grep em `*.md`/`*.ts`/`*.json`). Tratado aqui como o conjunto coordenado dos Change Packs OpenSpec, sem inventar schema. O schema real é `spec-driven` (OpenSpec 1.6.0): cada change tem `proposal.md` + `tasks.md` + `specs/<capability>/spec.md` com deltas `## ADDED Requirements` e `#### Scenario:`.

## 3. Diagnóstico do produto

Foco confirmado e coerente: arquitetura de soluções AWS + IA em produção (decidido em ago/
2026, medido, expresso na `/jornada`). O diagnóstico de produto **não muda** o foco — os
achados são de execução técnica, não de estratégia. O risco de produto que a auditoria
sublinha é de **confiança**: features que a UI anuncia e o sistema não entrega (sincronização
entre dispositivos, ranking de trilha "sem alunos" quando a API cai, comparação com "outros
alunos" alimentada por dado local). Numa plataforma cujo diferencial declarado é "prova
social honesta", cada uma dessas é dívida de credibilidade, não só de código.

## 4. Achados P0/P1 (com evidência; P0 reverificado à mão)

### P0 — confirmados pessoalmente

| ID | Achado | Evidência | Pack |
|---|---|---|---|
| **P0-A** | Sync de progresso nunca envia: engine grava LZ, sync lê com `JSON.parse` → push morre antes da API. XP/streak/SRS só no navegador. Teste de integração semeia o formato errado e mascara. | `engine.ts:271-272` vs `progress-sync.ts:38-42`; confirmado rodando `LZString.compress` | `sincronizacao-de-progresso-confiavel` |
| **P0-B** | Timer do simulado pontua sem as respostas: efeito com deps `[hydrated]`, `finalize` lê `attempt` do closure. Estourar o tempo → ~0%. | `SimuladoRunner.tsx:135-151,196-209,44` | `prova-integra-e-anti-fraude` |
| **P0-C** | Bypass `000000` ligado por default: `APP_ENV` default `development`, e nesse modo o código fixo loga qualquer e-mail (inclusive admin) sem Redis. | `config.go:45`; `verify_magic_link.go:119-120`; `main.go:186-192` | `endurecimento-de-autenticacao` |
| **P0-D** | Gabarito exposto: DTO de estudo/prova serializa `correctId`+explicação com só `Authenticate`. | `dto.go:283-296`; `study_handler.go:49,80` | `prova-integra-e-anti-fraude` |
| **P0-E** | Currículo completo (91,7 KB gz) em 616 de 617 rotas, e o índice leve viaja junto (duplicação: 116,7 KB gz/rota). | build 10/ago, por conteúdo do chunk `0pi86w_z9i3tb.js` | `orcamento-de-carga-por-rota` |
| **P0-F** | `/simulados/[slug]/fazer` trava em "Carregando questões…" sem saída quando o backend cai (4 estados colapsados num spinner permanente). | `SimuladoRunner.tsx:122-128,155-157` | `prova-integra-e-anti-fraude` + `estados-de-ui-resilientes` |
| **P0-G** | ~35 CTAs com texto branco sobre acento claro (~2,5:1), incluindo "Fazer login" e os 2 CTAs de captação. | 43 `color:'white'/'#fff'`; regra já no CLAUDE.md | `consistencia-visual-e-acessibilidade` |

### P1 — plausíveis (amostra de alta confiança; ver o pack de cada um)

Prova: gabarito no payload (P0-D é a causa), Back destrói o resultado, XP recreditável por
aba, resultado 0% em falha de fetch, timer global, motor server-authoritative morto +
desalinhado com o banco, certificado inverificável, 2ª tentativa impossível, lost update nas
respostas. Auth: código errado queima o token, XFF forja rate-limit e auditoria. Sync: login
apaga progresso anônimo, banner mente, schema strict fail-closed, só GameState sincroniza.
Dados: Stripe secret default, artigo não publicado público, ranking de trilha sem opt-in,
`/readyz` e `/metrics` expostos, `userId` de terceiros. UI: ranking/comentários dizem
"vazio" em falha, sem `error.tsx` de segmento, perfil/progresso sem estado de novato, soft-
404 indexável, conclusão sem estado de erro. Perf: Zod no cliente em 616 rotas, HTML de
artigo a 1,42 MB. DS/a11y: 3 sistemas de botão, 76 hex à mão, 11 modais sem focus trap, 12
scrolls sem tabIndex, foco invisível em 3 inputs.

## 5. Auditoria técnica — o que está CORRETO (para não regredir)

A auditoria de segurança confirmou uma base sólida que **não deve** ser tocada ao corrigir o
resto: JWT HS256 com `WithValidMethods` (bloqueia `alg:none`), refresh de 32 bytes com só o
hash no DB e rotação safe-fail, SQL 100% parametrizado (nenhum valor interpolado), IDOR
coberto nos agregados de simulado (ownership checado em answer/finish/cancel/certificado),
idempotência do webhook Stripe por claim atômico, sanitização bluemonday no conteúdo admin,
headers de segurança completos, `RequireAdmin` fail-closed. `recharts`/`shiki` corretamente
isolados fora do bundle comum; layout raiz limpo do currículo. O padrão de estados de erro do
`/ranking` é exemplar — o problema é não tê-lo generalizado.

## 6. Resultado das validações (Fase 6)

| Verificação | Resultado |
|---|---|
| 16 gates de conteúdo (como o CI invoca) | **16/16 verdes** |
| Testes frontend (`npm test`) | **1.076 passando**, 6 skip (112 arquivos) |
| `tsc --noEmit` / `eslint` (zero-warnings) | limpos |
| `npm run build` | exit 0 |
| `go build/vet/test ./...` | limpos |
| `make test-security` | **67/67 PASS** |
| `make test-contract` | PASS |
| `openspec validate --all --strict` | **20/20** (era 10/13 antes desta rodada) |
| E2E / varredura visual / integração / carga | **não executados** — bloqueio de porta / dependências / escopo (ver §2) |

## 7. Avaliação por área (veredito)

| Área | Veredito | Por quê |
|---|---|---|
| Conteúdo técnico e pedagogia | **aprovado com ressalvas** | 100% com quiz+FAQ, 2 fracos na amostra de 12; buracos de gate: quiz fora de "Fixando", caption vazia |
| Simulado (produto pago) | **reprovado** | 2 P0 no fluxo probatório + fraudável; o motor certo existe e não está ligado |
| Sincronização de progresso | **reprovado** | P0-A: nunca sincroniza; a promessa da UI não se cumpre |
| Autenticação | **reprovado** | P0-C: bypass por default de config |
| Backend (arquitetura, IDOR, SQL) | **aprovado com ressalvas** | base sólida; exposições pontuais de dado/segredo |
| UX / estados | **reprovado** | falha ≠ vazio não generalizado; 1 tela sem saída |
| Acessibilidade | **aprovado com ressalvas** | landmarks/reduced-motion ok; contraste de controle P0, focus trap ausente |
| Performance | **reprovado** | P0-E: currículo duplicado em toda rota; gate de bundle inoperante |
| SEO técnico | **aprovado com ressalvas** | forte, mas soft-404 indexável na rota de artigo |
| Segurança (headers/JWT/webhook) | **aprovado com ressalvas** | fundamentos corretos; XFF forjável e segredos sem validação de boot |

## 8. Governança do OpenSpec (achado de processo)

`serie-100-labs-arquitetura-aws` marca **3/34** tarefas, mas os 100 labs existem e passam no
gate `validate_cobertura_secoes` (100/100). O status OpenSpec está defasado da realidade — as
tarefas foram executadas e nunca marcadas. Recomendação: reconciliar o `tasks.md` dessa
change com o estado real antes de arquivá-la, para o `openspec list` voltar a ser sinal
confiável de andamento. (Não alterado nesta rodada: exige varredura tarefa-a-tarefa que é
trabalho de execução, não de auditoria.)

## 9. Riscos residuais e decisões do dono

1. **P0-C (bypass auth)** — correção é de código (flag dedicada + fail-boot), mas o dono decide a política de deploy que garante `APP_ENV=production`.
2. **Rotação de chaves** — `backend/.env` local com chaves reais em 0644; recomendação de rotar Anthropic/Resend por precaução (decisão do dono).
3. **Política de merge de sync** — usuários com snapshot antigo na nuvem: definir se o local vence sempre que for não vazio (recomendado) — decisão de produto.
4. **Preço/paywall do simulado** — billing existe no backend, morto na UI; ligar ou não é decisão de produto (fora do escopo destes packs; vive em `integracoes-de-backend-pendentes`).
5. **P0-1/P0-2 herdados** (site fora do ar, `/privacidade` com `[PREENCHER]`) — seguem sendo só do dono; reconfirmados em 11/ago (443 timeout; 4 `[PREENCHER]`).

## 10. Próximas ações recomendadas (ordem)

1. **P0-C** (bypass auth) — menor esforço, maior risco. Flag dedicada + fail-boot.
2. **P0-A** (sync) — formato único + consertar o teste que mascara.
3. **P0-B/P0-D/P0-F** (prova) — ligar o motor server-authoritative, cortar `correctId`, estados de erro. É um release coordenado frontend+backend.
4. **P0-E** (carga) — tirar o currículo do bundle comum + gate por rota.
5. **P0-G** (contraste) — varredura mecânica de branco-sobre-acento.
6. P1 de dados/segredos (§4) — mudanças pequenas e isoladas.
7. Generalizar estados de erro (`estados-de-ui-resilientes`) e o Design System único.

Backlog executável completo: `openspec/changes/` — 20 changes, todas válidas. Índice e
rastreabilidade em [`INDICE_OPENPACK_2026-08-11.md`](./INDICE_OPENPACK_2026-08-11.md).
