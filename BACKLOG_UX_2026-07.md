# Auditoria de experiência do usuário — julho/2026

> Medido, não estimado. Navegador real (Chromium via Playwright) em 17 rotas × 2 viewports,
> mais análise estática de rotas, links, bundle de produção e HTML renderizado. Onde o
> número é derivado e não observado, está dito.

**Data:** 28–29/jul/2026 · **Branch:** `refactor/foco-ia-claude` ·
**Complementa:** [`BACKLOG_PLATAFORMA_2026-07.md`](./BACKLOG_PLATAFORMA_2026-07.md) (conteúdo)

---

> ## ✅ Status: executado em 29/jul/2026
>
> Todos os itens P0–P5 deste documento foram corrigidos, mais **cinco defeitos
> descobertos durante a execução** que não estavam na auditoria original — dois
> deles mais graves que qualquer item da lista:
>
> | Descoberto ao executar | Alcance |
> |---|---|
> | **11 páginas de trilha renderizavam a trilha ERRADA** — indexavam `CURRICULUM` por posição numérica, e o pivot deslizou os índices | `/observabilidade-sre` exibindo Claude Code, `/sql-databases` exibindo Claude Code Pro, `/redes-web` exibindo Security Engineering… |
> | **Título duplicado "X — FFV Academy — FFV Academy"** | 71 arquivos + a rota de artigo (388 páginas), em toda aba e todo resultado do Google |
> | **`description` dos artigos expunha ID interno** — "Aprenda Tokens na trilha trail1 do hub hub-ia", ignorando os 415 `seoDesc` escritos à mão | 388 páginas |
> | **Botão "Excluir minha conta" só limpava o `localStorage`** — conta, progresso no servidor, certificados e presença no ranking continuavam | afirmação falsa sobre um direito da LGPD |
> | **Sitemap anunciava 3 rotas deletadas no pivot** (`/acessibilidade`, `/ds-algoritmos`, `/testing-engineering`), hardcoded | crawl budget + 404 vindo da busca |
>
> Um item da lista foi **retirado por ser falso**: P1-2 (busca invisível no
> desktop) — o botão existe e foi medido visível nos dois viewports.
>
> **Sete testes novos** travam as regressões: sitemap, navegação sem beco,
> páginas de trilha, landmarks, descrições de SEO, a11y da busca.
>
> Verificação: 734 testes · build 542 páginas · 0 erros de tsc/lint · 393
> arquivos de conteúdo válidos · alvos de toque 142 → 0 · bundle do currículo
> 86 → 80 KB gzip.

## Primeiro: o que já está certo

Isso importa para calibrar a lista. Vários fundamentos que costumam estar quebrados aqui
estão corretos, e eu verifiquei em vez de supor:

| Verificação | Resultado |
|---|---|
| Erros de JS / hidratação | **0** em 17 rotas × 2 viewports (o único erro de console é o backend ausente em dev) |
| Overflow horizontal do body | **0** — em nenhuma rota, nem a 375px. Os diagramas largos rolam dentro do próprio container, como projetado |
| Hierarquia de headings (artigo) | 1 `<h1>`, 8 `<h2>`, 7 `<h3>`, **zero saltos de nível** |
| SVG decorativo | 25 de 25 com `aria-hidden`/`aria-label`/`role` |
| Botões sem texto acessível | 0 de 24 |
| `<html lang>` | `pt-BR` |
| Skip link | presente |
| Formulários (newsletter, login) | `aria-invalid`, `aria-describedby`, `role="alert"`, `aria-live="assertive"` — bem feitos |
| Busca | botão visível no header (122×32 desktop, 38×32 mobile) + `⌘K`/`Ctrl+K` + `/` + entrada no menu mobile |
| 404 de módulo (`/aprenda/<slug>` inexistente) | página própria em PT-BR, "Módulo não encontrado", com navegação completa |
| `href` de trilha/hub do currículo | 46 de 46 resolvem para rota existente |
| Links de navegação contextual apontando para slug inexistente | 0 |
| ErrorBoundary | presente em `layout.tsx` e `BlockRenderer` |
| PWA | `manifest.json` + `sw.js` presentes, `display: standalone` |
| ISR em `/aprenda/[slug]` | já ativo (revalidate 1h) |

Nada disso está na lista abaixo porque não precisa de trabalho.

---

## P0 — o usuário bate numa parede

### P0-1 · `/privacidade` retorna 404 dentro do fluxo de consentimento do login

[LoginModal.tsx:347](frontend/src/components/auth/LoginModal.tsx#L347) — no checkbox de opt-in
de e-mail marketing:

> Quero receber novidades por email. Leia nossa **política de privacidade**.

O link aponta para `/privacidade`, **que não existe**. O usuário está no momento exato de
entregar o e-mail, clica para ler a política e toma 404.

É o pior lugar possível para um link morto: é consentimento. Sob LGPD, a política precisa
estar acessível no momento da coleta — e aqui a própria interface promete e não entrega.

**Tarefa:** criar `/privacidade` com política real (dados coletados, base legal, retenção,
contato do controlador, direitos do titular) ou remover a menção até existir. **Remover a
frase é pior produto, mas é melhor que prometer e falhar** — a decisão de qual fazer
primeiro é sua.

**Aceite:** `/privacidade` responde 200 e o link do LoginModal chega nela. **Esforço:** P
(a página) / M (o texto jurídico revisado).

---

### P0-2 · `/revisao-srs` retorna 404 — botão "voltar" da Maratona

[MaratonaClient.tsx:140](frontend/src/components/MaratonaClient.tsx#L140) — o link
`← REVISÃO SRS` no topo da Maratona aponta para `/revisao-srs`, rota que não existe. As
rotas reais são `/revisao`, `/revisar` e `/revisar/maratona`.

Efeito: o usuário entra na Maratona, decide voltar, e o único caminho de volta visível é um
404. Numa feature central da gamificação.

**Tarefa:** apontar para `/revisar`. **Aceite:** o link resolve 200. **Esforço:** trivial.

---

### P0-3 · 39 links de navegação contextual levam a 404

`nextSuggested` e `prerequisites` apontando para slug declarado mas **sem conteúdo** — todos
nas duas trilhas vazias (AIF-C01 e Anthropic AIP, ver P0-1 do backlog de conteúdo).

O caso visível hoje: quem termina `aif-bedrock-overview` — módulo que **funciona** — clica
em "próximo" e cai num 404. Ou seja, o conteúdo novo desemboca num beco.

**Tarefa:** duas frentes, e a segunda vale independente da primeira:
1. Escrever os módulos (já é P0-1 do outro backlog).
2. **Fazer os componentes de navegação filtrarem destino sem conteúdo.** `NextModuleCard`,
   `NextSteps` e `Prerequisites` deveriam pular slug sem seed em vez de linkar para o vazio.
   Isso é robustez permanente: protege de qualquer gap futuro, não só destes 27.

**Aceite:** nenhum link renderizado aponta para slug sem conteúdo, verificado por teste.
**Esforço:** P para o filtro.

---

### P0-4 · 404 genérico responde em inglês, numa plataforma inteiramente em PT-BR

Não existe `not-found.tsx`. `/pagina-que-nao-existe` retorna:

> **404: This page could not be found.**

O layout renderiza em volta (então há header e footer), mas a mensagem é o texto padrão do
Next, em inglês, sem nenhuma ajuda para o usuário se reorientar.

Detalhe que evita um mal-entendido: **a rota `/aprenda/[slug]` tem 404 próprio e bom** —
título "Módulo não encontrado — FFV Academy", com navegação completa. O problema é só o
404 genérico de qualquer outra URL.

**Tarefa:** `src/app/not-found.tsx` em PT-BR, com busca (abrir o palette), links para os 7
hubs e para `/explorar`. **Aceite:** URL inexistente devolve página em português com
caminho de saída. **Esforço:** P.

---

### P0-5 · O sitemap publica 27 URLs que retornam 404

[sitemap.ts:12-14](frontend/src/app/sitemap.ts#L12-L14) mapeia `CURRICULUM.flatMap(trail =>
trail.modules.map(...))` — **todos os 415 módulos declarados**, sem filtrar os que não têm
conteúdo. Os 27 slugs das trilhas vazias entram no sitemap e o Google os rastreia.

Consequência dupla: desperdício de crawl budget e — pior — resultado de busca que leva o
usuário direto a um 404, com o domínio como responsável.

**Tarefa:** filtrar o sitemap pelos slugs que têm conteúdo. A lista já existe: é a mesma
que o `check-curriculum-seed-drift.mjs` computa. **Aceite:** `sitemap.xml` não contém
nenhuma URL que responda 404. **Esforço:** P.

---

## P1 — descoberta e coerência de navegação

### P1-1 · Três páginas existem e **nada** linka para elas

Verificado por grep em todo `src/`, descontando os `href` dinâmicos do `curriculum.ts`:

| Página | Links de entrada | Consequência |
|---|---:|---|
| `/sobre` | **0** | Ninguém descobre quem está por trás da escola. Numa plataforma gratuita, isso é confiança jogada fora |
| `/newsletter` | **0** | Página de captura inalcançável — o canal de retenção existe e não recebe tráfego |
| `/search` | **0** | Não é problema de descoberta — a busca real (o palette) é bem acessível. É código duplicado e órfão: ver P1-3 |

E duas com entrada apenas circular ou indireta:

| Página | Entrada real |
|---|---|
| `/cheatsheets` (índice) | Só de dentro de um cheatsheet (`CheatsheetLayout`). Para achar o índice você já tem que estar num item dele |
| `/comunidade` | De `/sobre` (que é órfã) e do widget de discussão de artigo |

**Tarefa:** o footer tem 10 links e a plataforma tem 17 páginas de produto. Incluir
`/sobre`, `/comunidade`, `/newsletter`, `/cheatsheets` e `/mapa`. **Aceite:** toda página de
produto alcançável em ≤2 cliques da home. **Esforço:** P.

---

### ~~P1-2 · Não existe afordance visível de busca no desktop~~ — **falso, verificado**

Eu havia registrado isso como defeito depois de não achar nada de busca no `GameHUD`.
Estava errado: o botão existe e é renderizado pelo próprio
[CommandPalette.tsx:548](frontend/src/components/CommandPalette.tsx#L548). Medido no
navegador, **visível nos dois viewports**:

| Viewport | Tamanho | Aparência |
|---|---|---|
| 1440px | 122×32 no `<header>` | ícone + "Buscar" + dica `⌘K` |
| 375px | 38×32 no `<header>` | ícone só (o rótulo é `hidden md:inline`) |

A busca está bem resolvida: botão visível, atalho `⌘K`/`Ctrl+K`, atalho `/`, e entrada extra
no menu mobile. **Nenhuma tarefa aqui.**

Fica registrado em vez de apagado porque a lição é metodológica: procurar a feature em um
componente e concluir ausência a partir disso produz item de backlog inventado. A
verificação certa é medir no navegador — foi o que corrigiu.

---

### P1-3 · Features duplicadas: duas Maratonas e duas Buscas

Dois casos do mesmo padrão — a segunda implementação ficou órfã e divergiu:

**Maratona de Revisão, duas vezes:**

| Rota | Implementação | Entrada | Estado |
|---|---|---|---|
| `/revisao` | componente `MaratonaClient` | MobileNav, ProgressoClient | ativa — e com o botão voltar quebrado (P0-2) |
| `/revisar/maratona` | inline na própria page, usa `ReviewClient` com props | **nenhuma** | órfã |

**Busca, duas vezes:** `CommandPalette` (ativa, via atalho) e `/search` + `SearchClient`
(órfã).

Custo real: duas implementações divergem, uma recebe correção e a outra não, e a órfã
continua no bundle e no sitemap.

**Tarefa:** escolher uma de cada e deletar a outra. Minha recomendação: manter
`/revisar/maratona` (a implementação com filtro por trilha e quantidade é mais completa) e
`CommandPalette`; deletar `MaratonaClient` + `/revisao` e `/search` + `SearchClient`, com
redirect das URLs antigas. **Aceite:** uma implementação por feature; URLs antigas
redirecionam em vez de 404. **Esforço:** P.

---

### P1-4 · `/revisar/maratona` mostra o ID interno da trilha ao usuário

[frontend/src/app/revisar/maratona/page.tsx](frontend/src/app/revisar/maratona/page.tsx) —
no cabeçalho da sessão iniciada:

```tsx
{trail && ` · ${trail}`}   // trail é o ID, não o nome
```

O usuário seleciona "AWS Bedrock — GenAI em Produção" no `<select>` e o cabeçalho exibe
`· trail-bedrock`. Identificador interno vazando para a interface.

**Tarefa:** resolver o ID para `trail.name`. **Esforço:** trivial.

---

### P1-5 · 6 rotas mortas do pivot ainda respondem 200

Sobreviveram à deleção das trilhas e continuam servindo conteúdo de um currículo que não
existe mais. Nada no site linka para elas, mas elas respondem — e podem estar indexadas:

`/como-computador-funciona` · `/devops-containers` · `/engenharia-software` ·
`/python-profundo` · `/cheatsheet` (singular, além do `/cheatsheets` correto) ·
`/melhores-ferramentas-ia-codigo-2026`

**Tarefa:** decidir por rota — deletar, ou redirecionar 301 para o hub equivalente do
currículo novo. Redirect preserva o SEO acumulado e é o que eu recomendo para as 4 de
trilha. **Aceite:** nenhuma rota serve currículo pré-pivot. **Esforço:** P.

---

### P1-6 · `/verificar` manda o usuário editar a URL na mão

Página **linkada no footer**. Com o backend fora, o conteúdo visível inteiro é 118
caracteres:

> Verificação de certificado — Informe o hash do certificado na URL: `/verificar?h=HASH`

Não há campo de input. A instrução para um usuário final é construir uma query string.

**Tarefa:** formulário com campo de hash, botão, validação e estado de erro. E uma frase
dizendo onde encontrar o hash. **Aceite:** verificar certificado sem tocar na barra de
endereço. **Esforço:** P.

---

## P2 — acessibilidade

### P2-1 · 142 alvos de toque abaixo de 24×24px — mas só 4 correções

Medido a 375px de largura. Classifiquei pela isenção da WCAG 2.5.8 (link inline dentro de
frase é exceção explícita): **40 são isentos, 142 são defeito real** — links de navegação
isolados, em lista ou tabela.

E eles colapsam em quatro pontos, porque o padrão se repete:

| Origem | Tamanho | Alcance | Correção |
|---|---|---|---|
| `FooterLink` — `text-sm` **sem padding vertical** ([SiteFooter.tsx:155-165](frontend/src/components/SiteFooter.tsx#L155-L165)) | 17px de altura | **toda página da plataforma**, ~7 links cada | `py-1.5` + `inline-block` |
| Links de termo do glossário | 22px | `/glossario`, 52 ocorrências | padding no card do termo |
| Links de trilha na tabela de progresso (`<td>`) | **15px** | `/progresso`, 20 ocorrências | padding na célula |
| `← Voltar à home` | 16px | páginas de trilha | padding no link |

O primeiro é o mais rentável: uma mudança em `FooterLink` corrige a maior parte das
ocorrências, em todas as rotas de uma vez.

**Aceite:** nenhum alvo de navegação isolado abaixo de 24×24px a 375px. **Esforço:** P.

---

### P2-2 · `<main>` aninhado em todas as 388 páginas de artigo

`layout.tsx` renderiza `<main id="main-content">`, e **10 arquivos adicionam um segundo
`<main>` dentro dele** — incluindo `src/app/aprenda/[slug]/page.tsx` (3 ocorrências),
`ReviewClient` (4), `MaratonaClient`, `PlanoClient`, `PresentationMode`.

`<main>` aninhado é HTML inválido e cria dois landmarks principais: o leitor de tela anuncia
dois "main", e o skip link aponta para o externo enquanto o conteúdo real está no interno.
Atinge a rota de maior tráfego da plataforma.

**Tarefa:** os internos passam a `<div>` ou `<article>` — `layout.tsx` já fornece o
landmark. `<article>` é semanticamente melhor para página de artigo.

**Aceite:** exatamente um `<main>` por página renderizada, verificado por teste.
**Esforço:** P.

---

### P2-3 · Testes de a11y cobrem 3 de 99 rotas

`src/tests/a11y/` tem `home`, `ranking` e `search` — e `search` testa justamente a
implementação órfã (P1-3). Ficam sem cobertura: `/aprenda/[slug]` (a rota de maior
tráfego), `/progresso`, `/revisar`, `/simulados`, `/explorar`, páginas de trilha e de hub.

**Tarefa:** estender o `axe-helper` às rotas de maior tráfego, com foco nos casos que a
auditoria manual não pega: contraste de cor, ordem de foco, `aria-*` em componente
interativo. **Aceite:** as 8 rotas mais visitadas com teste axe passando. **Esforço:** M.

---

## P3 — performance

### P3-1 · O currículo inteiro vai para o navegador — 275 KB minificados

Medido no build de produção: o chunk `0ep_pmyyhajd_.js` tem **275 KB** e contém **todos os
415 slugs**, mais `desc`, `seoDesc`, `keywords`, `nextSuggested`, `prerequisites` e
`readTime`. Total de JS de cliente: **2,5 MB** em 68 chunks.

Não é import acidental: **35 componentes de cliente importam `CURRICULUM`** — palette,
GameHUD, MobileNav, HomeClient, ModuleLayout, mapa, explorar, ranking, certificados.

Verifiquei campo por campo quem realmente lê o quê no cliente, para não inflar o ganho:

| Campo | Bytes (fonte) | Lido no cliente? |
|---|---:|---|
| `seoDesc` | 39.011 | **Não** — só meta tag, no servidor |
| `nextSuggested` | 8.134 | **Não** |
| `keywords` | 37.399 | Sim — palette, Explorar, Search |
| `prerequisites` | 9.561 | Sim — ModuleLayout, MapaClient |
| `desc` | 90.455 | Sim (parcial) — palette mostra desc |

**Ganho honesto de tirar o que ninguém lê: ~47 KB de fonte**, o que dá bem menos depois de
minificar e comprimir. É uma melhoria, não uma transformação.

**A correção estrutural é outra:** separar um **índice enxuto para o cliente** (slug, title,
trail, icon, xp, readTime, keywords) do registro completo que fica no servidor. Isso ataca
os 275 KB, não os 47.

**Tarefa:** (a) mover `seoDesc` e `nextSuggested` para módulo `server-only`; (b) gerar
`curriculum-index.ts` enxuto no build e apontar os 35 componentes de cliente para ele.
**Aceite:** chunk de currículo no cliente abaixo de 100 KB. **Esforço:** P para (a), M para
(b). Casa bem com **T-8** do outro backlog (quebrar o `curriculum.ts` de 5.000 linhas).

---

### P3-2 · `loading.tsx` em 5 de 99 rotas

Existem em `/`, `/progresso`, `/ranking`, `/simulados`, `/revisar`. As demais — incluindo
páginas de trilha e de hub — não têm estado de carregamento, então a navegação parece
travada até o HTML chegar.

**Tarefa:** `loading.tsx` com skeleton nas rotas que dependem de fetch. **Esforço:** P.

---

## P4 — degradação silenciosa quando o backend cai

O backend roda numa VPS única, então "backend fora" não é hipótese remota. Medi com ele
efetivamente fora e as páginas retornam **200 sem nenhum sinal**:

| Rota | O que o usuário vê | Problema |
|---|---|---|
| `/ranking` | Cabeçalho e pódio, sem aviso nenhum | O usuário não distingue "ninguém pontuou" de "servidor caiu" |
| `/simulados` | Renderiza normal (conteúdo vem do currículo) | ok |
| `/news` | Renderiza normal | ok |

**Tarefa:** nas rotas que dependem de API, distinguir três estados — **carregando**,
**vazio de verdade** ("ninguém no ranking ainda") e **falha** ("não conseguimos carregar o
ranking; tente novamente"), com botão de retentar. Hoje os três colapsam num só.

**Aceite:** com a API inacessível, cada rota dependente mostra falha explícita e ação de
retentar. **Esforço:** M.

---

## P5 — documentação desatualizada

`frontend/CLAUDE.md:186` diz que ISR em `/aprenda/[slug]` é trabalho de "próxima sprint".
**Já está ativo** — o build reporta `revalidate 1h / expire 1y` na rota. Documentação que
descreve trabalho já feito faz alguém refazer.

Some-se a isso o que já está registrado no outro backlog: o comentário do `.env.local`
prometendo um mock que não existia (T-7) e os `29` diagramas hardcoded no destaque da home
(T-4).

**Tarefa:** corrigir a linha 186 e varrer o `frontend/CLAUDE.md` por outras afirmações de
"próxima sprint" já entregues. **Esforço:** P.

---

## Ordem sugerida

Agrupada por afinidade de arquivo, para render mais por commit:

1. **Um commit de becos sem saída** — P0-2 (`/revisao-srs`), P0-4 (`not-found.tsx`), P0-5
   (filtro do sitemap), P1-4 (ID da trilha). Todos triviais, todos visíveis.
2. **P0-1** — `/privacidade`. Sozinho porque envolve texto jurídico, não código.
3. **P0-3** (filtro de navegação) + **P1-3** (deletar as duplicatas) + **P1-5** (redirects
   das rotas do pivot) — um commit de coerência de rota.
4. **P2-1** e **P2-2** — um commit de acessibilidade, `FooterLink` primeiro (maior alcance
   por linha mudada).
5. **P1-1** — descoberta: footer completo, incluindo `/sobre`, `/newsletter` e `/cheatsheets`.
6. **P1-6** (`/verificar`) e **P4** (estados de falha) — um commit de robustez de interface.
7. **P3-1** — performance, junto com o T-8 do outro backlog.
8. **P2-3**, **P3-2**, **P5** — cobertura e limpeza.

---

## Como reproduzir esta auditoria

```bash
# integridade de rota e link
find frontend/src/app -name page.tsx | sed 's|.*/app||; s|/page.tsx||' | sort   # rotas
grep -rhoE 'href="/[a-z0-9/-]*"' frontend/src --include="*.tsx" | sort -u       # links literais

# bundle de cliente
cd frontend && npm run build
du -ch .next/static/chunks/*.js | tail -1
grep -rl "trail-bedrock" .next/static/chunks --include="*.js"   # currículo no cliente?

# navegador: erros de JS, overflow, alvos de toque
# (script descartável — Playwright vive em video-pipeline/)
```

O passe de navegador cobriu: `/`, `/explorar`, `/progresso`, `/revisar`, `/ranking`,
`/simulados`, `/mapa`, `/search`, `/aws-bedrock`, `/aws-aif-c01`, `/sobre`, `/cheatsheets`,
`/glossario`, `/news` e 3 artigos — a 375px e 1440px.
