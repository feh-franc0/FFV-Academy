## 1. Medir a linha de base (antes de mexer)

- [x] 1.1 Registrar o baseline atual: total gzip por rota crítica (home, /aprenda/[slug], /revisar, /verificar) a partir do build
      — medido via `.next/diagnostics/route-bundle-stats.json` (soma gzip dos `firstLoadChunkPaths`): `/` 443,7 KB · `/aprenda/[slug]` 438,8 KB · `/revisar` 421,2 KB · `/verificar` 421,2 KB. Hashes de chunk idênticos aos citados no proposal.md, confirmando reprodutibilidade do build.
- [x] 1.2 Confirmar por conteúdo qual chunk carrega o currículo completo e qual carrega o índice leve
      — currículo completo: `0pi86w_z9i3tb.js` (490 `desc:`, 528 `keywords:`, 91,7 KB gz). Zod: `01qs~bl9bxyu9.js` (472 `_zod`, 61,5 KB gz). Índice leve: `135mysklsnyqs.js` (491 `readTime:`, 0 `desc:`/`keywords:`, 25,1 KB gz). Confirmado que `/verificar`/`/sobre`/`/revisar` carregavam os TRÊS simultaneamente.

## 2. Tirar o currículo completo do bundle comum

- [x] 2.1 Rotas utilitárias importam só o índice leve (`queries-leves.ts`), não o barril completo
- [x] 2.2 Detalhe (`desc`/`keywords`) carregado sob demanda nas rotas que o usam
- [x] 2.3 Eliminar a duplicação índice-leve × completo (uma rota, uma fonte)
- [x] 2.4 Validação do `GameState` (Zod) sob demanda, fora do bundle comum

  **Causa raiz real (diferente da hipótese registrada em PENDENCIAS.md B-1):** não era limite do
  empacotador — era `engine.ts` e `lib/badges.ts` importando `CURRICULUM` completo por caminho
  RELATIVO (`from './curriculum'`), invisível ao `layout-sem-curriculo.test.ts` (só rastreava
  `@/...`). Os dois são alcançados por TODA rota via `GameHUD` → `useGameState`. Corrigido o
  rastreador do teste (segue `./`/`../` também, resolvendo por arquivo-alvo) — ele imediatamente
  confirmou os dois caminhos, e passa limpo depois da correção.

  Trocados para `CURRICULO_LEVE`: `engine.ts`, `lib/badges.ts`, `lib/random-question.ts` (o
  trio alcançável do layout) + 8 componentes client-side (`ContinueCard`, `TrilhaDoDia`,
  `HomeClient`, `DailyModuleCard` — virou `next/dynamic` por causa de `Module.level`, campo
  ausente do índice leve —, `home/Explorar`, `home/BedrockDestaque`, `TrailCompletionModal`,
  `ProgressoClient`). `playlists.ts` dividido em `playlists-data.ts` (sem currículo) +
  `playlists.ts` (`resolvePlaylist`, com currículo).

  3 componentes de `/aprenda/[slug]` (`ConcluirModulo`, `TrailCertificateBanner`, `NextSteps`)
  reimportavam `CURRICULUM` completo no CLIENTE para reencontrar dado que o Server Component já
  tinha resolvido — passaram a receber como prop. `Certificate.tsx` virou `next/dynamic`
  (carrega só ao clicar "emitir certificado").

  Zod: `GameStateSchema`/`safeParseJSON` viraram import dinâmico em `engine.ts` (`importState`) e
  `progress-sync.ts` (`readLocalState`/`pullProgress`/`pushProgress`) — as duas funções e ~15
  call sites de teste viraram `async`.

  **Não corrigido (achado à parte, fora do escopo original):** `storage.ts`/`auth.ts` têm uma
  SEGUNDA dependência sempre-síncrona de Zod via `UserProfileSchema` (`getUser`/`setUser`, ~15
  call sites em `auth.ts`, mistura de funções sync/async). `/`, `/aprenda/[slug]`, `/revisar` e
  `/verificar` ainda carregam Zod por essa via — confirmado no teto do gate (task 4), que soma
  323-339 KB mesmo sem Zod-para-GameState. Tornar lazy exigiria async-ificar a cadeia de auth;
  não fiz por risco de regressão no login sem tempo para validar cada call site nesta sessão.
  Próximo passo natural, não uma decisão de escopo original.

## 3. Payload dos labs

- [x] 3.1 Reduzir o payload RSC dos artigos-lab maiores (streaming/segmentação), sem cortar conteúdo pedagógico

  **Parcial, com nota.** Investigação mostrou que o payload RSC de ~55-62% do HTML é
  ARQUITETURAL do Next.js App Router (serialização do flight protocol para soft-navigation) —
  presente proporcionalmente em TODA rota (medido também em `/` e `/verificar`, mesma faixa),
  não específico de `lab-*`. "Streaming/segmentação" via `<Suspense>` não reduz o tamanho SERVIDO
  de uma rota com `generateStaticParams`+ISR, porque o resultado fica em cache já totalmente
  resolvido — só ajudaria o tempo de regeneração (1x/hora), não o payload por visita.

  Encontrada e corrigida uma duplicação REAL, não-arquitetural: `ConcluirModulo` e `AnkiExport`
  (ambos `'use client'`) recebiam `article.blocks` — a árvore INTEIRA do artigo, já renderizada
  em HTML via `<BlockTree>` — como PROP. Client component precisa serializar toda prop no
  payload RSC, então o conteúdo duplicava mais de uma vez. Extração (`extrairQuizzes`/
  `extractQA`) movida para `lib/article-extract.ts`, chamada uma vez no Server Component; só o
  resultado pequeno (quizzes/Q&A) vira prop.

  Medido na maior página (`lab-dominio-tls-cloudfront-estatico`): 1.533 KB → **1.347 KB** de
  HTML (199 KB gz), payload RSC 62,4% → 58,4% do total. Redução real, sem cortar conteúdo — mas
  não elimina a base arquitetural (~58% resta). Eliminar isso de vez exigiria desligar
  soft-navigation client-side para `/aprenda/[slug]` (mudança de UX maior, fora de escopo desta
  rodada).

## 4. Gate por rota

- [x] 4.1 Gate que mede a soma dos chunks por rota crítica com teto declarado
      — `frontend/scripts/check-route-bundle.mjs`, lê `.next/diagnostics/route-bundle-stats.json`
      (emitido pelo `next build`, Next 16.2.4, sem config extra), soma gzip de todo chunk em
      `firstLoadChunkPaths` por rota crítica, compara contra teto declarado. `npm run bundle:check`.
- [x] 4.2 Prova negativa: reintroduzir o currículo completo num import comum → gate reprova
      — reintroduzido `import { CURRICULUM } from './curriculum'` em `engine.ts`, rebuild, gate
      reprovou as 4 rotas críticas (excesso de 40 a 56 KB cada). Revertido depois — não ficou no código.
- [x] 4.3 Substituir/complementar `bundlesize.config.json` e ligar no CI
      — complementado: `bundlesize.config.json` continua (informativo, `continue-on-error: true`,
      capta arquivo isoladamente grande). Novo step "Check bundle budget per route" no
      `.github/workflows/ci.yml`, SEM `continue-on-error` — este é o gate que bloqueia.
- [x] 4.4 Revisar pesos de fonte realmente usados
      — Inter (5 pesos: 400/500/600/700/800) e Poppins (3: 600/700/800) mantidos — uso real
      confirmado via grep de `fontWeight`/Tailwind `font-*` em centenas de ocorrências, sem
      forma segura de atribuir cada peso a uma família sem risco de quebrar título visível.
      Roboto Mono: peso 500 REMOVIDO — nenhuma ocorrência de `fontWeight: 500` em contexto
      `.font-mono`/código encontrada no código-fonte; os poucos usos de mono com peso mais forte
      já usam 700 (nem carregado, sintetizado pelo navegador de qualquer forma). Conservador de
      propósito: risco de regressão visível (título errado) > economia de 1 arquivo de fonte.
- [x] 4.5 Atualizar `frontend/CLAUDE.md` e `PENDENCIAS.md` (B-1) com o número final
      — `frontend/CLAUDE.md`: nova subseção "Orçamento de carga por rota" em Currículo, e nota
      em "Zod + GameStateSchema" sobre o import dinâmico. `PENDENCIAS.md`: seção B-1 atualizada
      com a causa raiz real (import relativo, não limite do empacotador) e os números medidos.
