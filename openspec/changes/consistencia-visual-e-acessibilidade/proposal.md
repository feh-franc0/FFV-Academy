## Why

O Design System está bem desenhado em `globals.css` (tokens de cor, raio, espaçamento,
tipografia) — mas o código não o segue, e há um defeito de contraste que atinge os CTAs de
conversão. Medido por `grep`/`curl` em 10/ago/2026.

| # | Defeito | Medição | Sev |
|---|---|---|---|
| 1 | **Texto branco sobre acento claro em ~35 controles primários, ~2,5:1.** Inclui o botão "Fazer login" (`RequireAuth`), "Comentar" (nas 490 páginas), e os dois CTAs de captação da home. A regra ("branco sobre acento claro não se lê") já está no `CLAUDE.md` e é seguida em 2 lugares — não foi aplicada nos outros ~35. | `color:'white'/'#fff'` = 43 ocorrências | **P0** |
| 2 | **Três sistemas de botão; dois nunca importados.** `ui/button.tsx`, `ui/card.tsx`, `ui/badge.tsx`, `ui/separator.tsx` = 0 imports. O primário é escrito à mão: 43 `background:'var(--ffv-blue)'` inline, e a cor do texto sobre ele diverge por arquivo (`#0d1117`, `white`, `#fff`, `var(--primary-foreground)`). | grep de imports | **P1** |
| 3 | **Hex do tema escuro à mão em 76 pontos** (`#f78166` etc.), inclusive nos componentes vizinhos ao que o `CLAUDE.md` diz ter sido corrigido. | 76 ocorrências | **P1** |
| 4 | **Escala de espaçamento com zero consumidores; card de módulo em 6 componentes órfãos.** `--space-*` = 0 usos; `NextModuleCard`/`RelatedModules`/`TrailMap` etc. = 0 imports. | grep | **P1/P2** |
| 5 | **Nenhum dos 11 modais prende o foco** (sem trap de Tab, sem devolução de foco). | 11 `role=dialog`, 0 focus trap | **P1** |
| 6 | **12 contêineres de scroll horizontal sem `tabIndex`** (todas as tabelas do admin), + 2 em `primitives.tsx`. | grep | **P1** |
| 7 | **Foco invisível** nos inputs de e-mail da home e na busca do glossário (`outline:'none'` inline vence a regra global). | 3 pontos | **P1** |
| 8 | **3 `htmlFor` para ~40 inputs** — o `<textarea>` de comentários (490 páginas) sem rótulo. | grep | **P2** |
| 9 | **Ordem de heading quebrada** (os 4 `h3` do rodapé precedem o `h1` da página). | HTML servido | **P2** |
| 10 | **Alvos de toque < 44px** em controles reais (busca mobile, alternador estudo/prova, ações de certificado). | grep | **P2** |
| 11 | **Breadcrumb em 4 formatos** e ausente nas rotas pessoais; botão "voltar" em 5 redações; busca fora do alcance do polegar no mobile. | tabela na auditoria | **P2** |
| 12 | **Tabela de 6 colunas em `overflow-hidden`** (corta no mobile, não rola). | `TrailStatsTable.tsx:99` | **P2** |

O contraste (item 1) complementa a change existente `contraste-de-paleta-como-texto`, que
trata cor **de texto de categoria**; aqui o alvo é **branco sobre fundo acento em controle**,
um caso que aquela change não cobre. Cross-referência declarada, sem sobreposição.

## What Changes

- Trocar `'white'`/`'#fff'` por `var(--primary-foreground)` em todo botão de fundo acentuado; adicionar o par ao teste de contraste.
- Eleger `FfvButton` como botão único; migrar as chamadas inline; apagar os componentes `ui/*` e os 6 cards órfãos mortos.
- Trocar hex de tema à mão por tokens; gate de lint que reprova hex literal em `style={{}}` (fora do `opengraph-image`).
- Decidir um sistema de espaçamento (classes OU vars) e remover o morto.
- `useFocusTrap` aplicado aos 11 modais; `tabIndex`+`role=group`+`aria-label` nos 14 contêineres de scroll; remover os 3 `outline:'none'` inline.
- `aria-label`/`<label>` em todo input; começar pelo `<textarea>` de comentários.
- Rebaixar os títulos do rodapé de `h3` para rótulo de agrupamento; corrigir a ordem de heading.
- `min-height:44px` nos controles clicáveis listados; `overflow-x-auto`+`tabIndex` na `TrailStatsTable`.
- `Breadcrumb` e "voltar" únicos; busca na barra inferior do mobile.

## Fora de escopo

- Contraste de **cor de texto de categoria** — vive em `contraste-de-paleta-como-texto`.
- Redesenho de identidade visual (paleta, tipografia) — o alvo é aplicar o DS existente, não trocá-lo.

## Impact

- Rotas: amplo em `frontend/src/components/**` e `frontend/src/app/**` (85+ chamadas inline), `globals.css`, `bundlesize`/lint config para o gate de hex, `paleta-contraste.test.ts`.
- Risco: migração ampla de botão — fazer por lote com o gate de hex ligado para não regredir.
- Achados cobertos: UX-11..17, 22..30.
