## Why

Toda página do site carrega o **currículo inteiro duas vezes** e o **Zod inteiro**, antes de
qualquer conteúdo. Medido sobre o build de 10/ago/2026 (`.next/`, 617 HTML pré-renderizados),
por conteúdo dos chunks, não por nome:

| # | Defeito | Medição | Sev |
|---|---|---|---|
| 1 | **Currículo completo (91,7 KB gz) em 616 de 617 rotas.** Um chunk com 490 `slug`, 490 `keywords`, 528 `desc`. `/verificar`, `/sobre`, `/revisar` e as 490 páginas de artigo pagam por ele. A previsão já estava escrita em `layout-sem-curriculo.test.ts:16-22` — confirmou-se. | `0pi86w_z9i3tb.js` = 279,8 KB raw / 91,7 KB gz | **P0** |
| 2 | **O "índice leve" duplica, não substitui.** `0735c-h7.i~hn.js` (25 KB gz) traz os mesmos 490 slugs e viaja JUNTO com o currículo completo. Os módulos viajam duas vezes: 116,7 KB gz de metadado de currículo por rota. | `queries-leves.ts` correto no grafo, anulado no bundle | **P1** |
| 3 | **Zod inteiro no cliente em 616 rotas** (61,5 KB gz) para validar o `GameState` local. | `01qs~bl9bxyu9.js`, `_zod` ×472 | **P1** |
| 4 | **HTML de artigo chega a 1,42 MB, 61% payload RSC** duplicando o DOM. Os 10 maiores são `lab-*`. | p90 976 KB, max 1.424,9 KB (231 KB gz) | **P1** |
| 5 | **O gate de bundle é inoperante.** `bundlesize.config.json` mede por arquivo (teto 400 KB; maior chunk 336 KB → passa) e não vê a soma real: 20 chunks comuns = 457 KB gz por rota. | `bundlesize.config.json` | **P2** |
| 6 | **102 KB de fonte pré-carregada por rota**, 10 pesos declarados (Inter 5 + Poppins 3 + mono 2). | 22 woff2 / 540 KB, 5 preload por rota | **P2** |

Baseline compartilhado medido (interseção de duas rotas): **~577 KB gz de estático por rota,
antes de qualquer conteúdo**. Nada disso é imagem — `public/` inteiro tem 132 KB, e `recharts`
está corretamente isolado em `/admin`. O problema é código de dados no bundle do cliente.

## What Changes

- Fazer o currículo completo sair do bundle comum: as rotas que só precisam do índice leve importam **apenas** ele; as que precisam do detalhe carregam sob demanda (dynamic import ou fronteira de servidor). Alvo: nenhuma rota que não seja de listagem/artigo carrega os 490 registros com `desc`+`keywords`.
- Eliminar a duplicação índice-leve × currículo-completo — uma rota carrega um OU outro, nunca os dois.
- Zod fora do bundle comum: validação do `GameState` sob demanda (só onde o estado é lido/gravado), não em toda página.
- Reduzir o payload RSC dos artigos-lab gigantes (streaming/segmentação do conteúdo pesado).
- Substituir o gate de bundle por um que meça **o total baixado por rota** (soma dos chunks referenciados), com teto declarado e prova negativa.
- Revisar o orçamento de fontes (pesos realmente usados).

## Fora de escopo

- Trocar Zod por outra lib de validação.
- Redesenho de conteúdo dos labs (o peso pedagógico deles é desejado — o alvo é o transporte, não o conteúdo).

## Impact

- Rotas: `frontend/src/lib/curriculum/*`, componentes `'use client'` que importam o barril completo (`HomeClient`, `ExplorarClient`, `MapaClient`, `CommandPaletteBody`, `OnboardingModal`, componentes de `article/`), `frontend/src/lib/progress-sync.ts`/`schemas.ts`, `bundlesize.config.json`, `app/layout.tsx` (fontes).
- Risco: mexer no grafo de import do currículo pode reintroduzir o barril completo por um import transitivo — o gate novo é o que impede a regressão.
- Nota positiva a preservar: `recharts`/`shiki` já isolados; layout raiz já limpo do currículo (`layout-sem-curriculo.test.ts`).
- Achados cobertos: B-1..B-6.
