## 1. Componente compartilhado de estados

- [x] 1.1 Extrair `FalhaAoCarregar`/`EmptyState` do `RankingClient` para um componente reusável (falha ≠ vazio, com retry)
      — `src/components/estado/FalhaAoCarregar.tsx` (título/descrição/onRetry, variante `compact`). `RankingClient` migrado para importar em vez de definir localmente. `EmptyState` (o "vazio real") ficou local a cada componente porque a copy é contextual (período do ranking, etc.) — só o par falha/vazio como CONCEITO foi generalizado, não um EmptyState universal.
- [x] 1.2 Aplicar em `TrailLeaderboard` e `CommentSection`; formulário de comentário desabilitado quando a lista não carregou
      — `TrailLeaderboard`: `LoadState` explícito (`loading|ok|error|no-backend`), usa `FalhaAoCarregar` (`compact`) com retry. `CommentSection`: novo estado `loadFailed` distinto de `items.length===0`; `<textarea>`/botão "Comentar" desabilitados quando `loadFailed`.
- [x] 1.3 `comments-api.ts` e afins distinguem erro de vazio (sem `catch → []`)
      — já retornava `null` em erro (não `[]`); o defeito real estava em `CommentSection` tratando `null` e `[]` igual — corrigido junto com 1.2.

## 2. Boundaries e 404

- [x] 2.1 `error.tsx` em `/aprenda/[slug]`, `/simulados`, `/revisar` com copy que nomeia a falha e preserva navegação
      — `src/components/estado/SegmentError.tsx` (compartilhado, nav para home/explorar) + 3 `error.tsx` de segmento, cada um com copy específica da jornada.
- [x] 2.2 404 real na rota de artigo inexistente + `robots:{index:false}` no metadata desse caso
      — `fetchArticleWithBlocksResult` (novo, em `curriculum-api.ts`) distingue `{status:'not-found'}` (HTTP 404 explícito) de `{status:'error'}` (qualquer outra falha). `generateMetadata` retorna `robots:{index:false,follow:false}` só no caso `not-found`.
- [x] 2.3 Backend fora numa rota de artigo → "conteúdo indisponível" com retry, não `notFound()`
      — novo `ConteudoIndisponivel.tsx` (client, botão "Tentar novamente" via `router.refresh()`), renderizado no caminho `status:'error'` de `getArticleOutcome` em `page.tsx`, com metadata `robots:{index:false,follow:true}` (não afirma "não encontrado").
- [x] 2.4 Erros globais ganham "home" e "explorar"; remover "limpe o cache"
      — `app/error.tsx` (global) e `ErrorBoundary.tsx` (client boundary raiz): botões "Voltar para a home"/"Explorar conteúdo" adicionados; a instrução "limpe o cache" removida de `ErrorBoundary.tsx`.

## 3. Estados de primeira visita e persistência

- [x] 3.1 Estado vazio de primeira visita em `/perfil` e `/progresso`
      — `/perfil` (`DevProfileClient.tsx`) já tinha o estado ("Seu perfil está esperando por você") de uma correção anterior — só corrigido o contraste (`color:'#fff'`→`var(--primary-foreground)`) no CTA. `/progresso` (`ProgressoClient.tsx`) NÃO tinha: adicionado bloco `completed.length === 0` com CTA "Escolher minha primeira trilha", análogo ao de `/perfil`, antes do dashboard completo.
- [x] 3.2 Conclusão de módulo reporta falha de persistência (quota) em vez de sucesso falso
      — `engine.ts`: `saveState()` passou a retornar `boolean` (sucesso real da escrita, inclusive do fallback mínimo); `CompleteModuleResult` ganhou campo `persisted`. `useGameState.markComplete`: quando `!persisted`, mostra toast de aviso em vez de comemorar (som/badge/level-up). `ConcluirModulo.tsx`: novo estado `falhaAoSalvar` com copy própria + retry, no lugar de "concluído · +N XP". Travado por novo teste em `engine.test.ts` (mock de `Storage.prototype.setItem` lançando `QuotaExceededError`).
- [x] 3.3 `/revisar` sem flash (guarda de hidratação) e com refresh de fila na sessão
      — `ReviewClient.tsx`: novo `Phase='loading'` distinto de `'empty'` (antes `!state` caía direto em "fila vazia"); `LoadingState` (skeleton) renderizado enquanto `state===null`. Fila agora recebe reforço: cards que vencem DEPOIS da carga inicial (mesma sessão) entram no fim da fila via `seenIdsRef`, sem descartar progresso já feito; sessões com `maxCards` (Maratona) não recebem reforço (tamanho é intencional).

## 4. Copy e loading

- [x] 4.1 Reescrever mensagens de mantenedor para o aluno (estudo, admin) e mover diagnóstico para log
      — `EstudoClient.tsx`: "Verifique se o seed foi rodado" → "Não conseguimos carregar as questões agora. Tente de novo.", com `console.warn`/`console.error` para o diagnóstico e um botão "Tentar novamente" novo (não existia nenhum). `admin/page.tsx`: "Backend está rodando?" → "Não foi possível carregar as métricas agora. Tente novamente em instantes." (retry por botão NÃO adicionado aqui — ferramenta interna, baixa prioridade, reload manual já resolve).
- [x] 4.2 `Counter` inicia no valor final, anima só após o observer
      — `useState(0)` → `useState(to)`; `setVal(0)` só é chamado dentro de `run()`, isto é, depois que o `IntersectionObserver` confirma a entrada no viewport. HTML servido (e quem nunca rola até o número) mostra o valor real, nunca zero.
- [x] 4.3 `loading.tsx` com `RouteSkeleton` na forma certa para `/perfil`, `/jornada`, `/aprenda/[slug]`
      — 3 arquivos novos, todos usando o `RouteSkeleton` já existente (antes usado em só 2 rotas).

## 5. Travar

- [ ] 5.2/5.1 combinados: cobertura ficou em nível de UNIT/INTEGRATION, não E2E
      — Não escrevi um teste e2e real (precisaria de servidor rodando + backend mockado via proxy). Em vez disso: (a) `curriculum-api.test.ts` ganhou um describe inteiro para `fetchArticleWithBlocksResult` — 6 casos cobrindo 200/404/500/exceção de rede/payload inválido/sem backend, todos verificando que só o 404 explícito produz `status:'not-found'`; (b) `ResultadoClient.test.tsx` (novo, 6 casos) cobre ponte/fallback/vazio; (c) `engine.test.ts` cobre o `persisted:false`. O teste e2e real ("ranking de módulo e comentários mostram falha com backend fora, via Playwright contra servidor de verdade") e o teste HTTP real de 404 (contra servidor rodando) ficam como follow-up — a lógica que decide o comportamento está testada na unidade que a implementa, não a integração ponta-a-ponta.
