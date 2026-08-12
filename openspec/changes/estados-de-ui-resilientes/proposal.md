## Why

A plataforma já tem, em `/ranking`, o padrão certo de estados — `FalhaAoCarregar` distinto
de `EmptyState`, com a copy "o servidor não respondeu; seu XP está salvo, o que falhou foi a
consulta". Esse padrão **não foi generalizado**, e o resultado é que, quando o backend cai, a
UI afirma coisas falsas ou trava. Confirmado por `curl` contra o dev server em 10/ago/2026.

| # | Defeito | Evidência | Sev |
|---|---|---|---|
| 1 | **`TrailLeaderboard` (nas 490 páginas de módulo) conta mentira quando o backend cai:** com erro, mostra "ainda sem ranking — seja o primeiro". Cada módulo afirma que a escola não tem alunos. | `TrailLeaderboard.tsx:36,42-52` | **P1** |
| 2 | **`CommentSection` faz a mesma conflação** e ainda oferece o formulário que vai falhar. | `comments-api.ts:27-34`; `CommentSection.tsx:32-39,130-133` | **P1** |
| 3 | **Nenhum `error.tsx` de segmento** — 1 boundary para 96 páginas; qualquer throw derruba a página inteira para o genérico. | `find src/app -name error.tsx` = 1 | **P1** |
| 4 | **`/perfil` e `/progresso` não distinguem "carregando" de "usuário novo"** — o novato cai num dashboard de zeros sem onboarding. | `DevProfileClient.tsx:126-140`; `ProgressoClient.tsx:64-82` | **P1** |
| 5 | **Rota `/aprenda/[slug]` inexistente responde HTTP 200** (soft-404) com dois `<meta robots>` conflitantes. E, em produção, o backend fora transforma as 490 páginas de conteúdo em "esta página não existe" em vez de "servidor fora". | `page.tsx:134,254`; `curriculum-local.ts:52-55` | **P1** |
| 6 | **Conclusão de módulo sem estado de erro:** quota do localStorage estourada → o botão diz "concluído · +N XP" e o progresso não existe. | `engine.ts:273-281`; `ConcluirModulo.tsx` | **P1** |
| 7 | **`/revisar` pisca "sua fila está vazia" em toda visita** antes de `loadState` rodar; e a fila congela no primeiro `state` (cartas que vencem na sessão não entram). | `ReviewClient.tsx:56-64,40-53` | **P1/P2** |
| 8 | **Mensagem de erro para o mantenedor, exibida ao aluno:** "Verifique se o seed foi rodado", "Backend está rodando?". | `EstudoClient.tsx:115`; `admin/page.tsx:68` | **P1** |
| 9 | **Home anuncia "0 artigos, 0 trilhas, 0 badges"** no HTML servido (Counter inicia em 0). | `Counter.tsx:31` | **P2** |
| 10 | **Erros globais sem rota de escape** (só "tentar novamente"; um deles manda "limpe o cache"). | `error.tsx:17`; `ErrorBoundary.tsx:57-60` | **P2** |
| 11 | **Skeleton genérico aplicado a rotas de forma diferente** — 7 de 96 rotas têm `loading.tsx`. | `loading.tsx` + `RouteSkeleton.tsx` (usado em 2) | **P2** |

A causa-raiz é uma só, repetida: **"falha" e "vazio" tratados como o mesmo estado**, e
estados de carga/erro ausentes fora das poucas rotas onde alguém os escreveu.

## What Changes

- Extrair o par `FalhaAoCarregar`/`EmptyState` do `RankingClient` para um componente compartilhado e aplicá-lo a `TrailLeaderboard`, `CommentSection` e onde a mesma pergunta se repete.
- Toda função de fetch distingue erro de vazio (nunca `catch → []` silencioso).
- `error.tsx` em ao menos `/aprenda/[slug]`, `/simulados`, `/revisar`, com copy que nomeia o que falhou e preserva navegação.
- 404 real (status 404) na rota de artigo inexistente; `robots:{index:false}` no metadata desse caso; backend fora → "conteúdo indisponível" com retry, não `notFound()`.
- Estado vazio de primeira visita em `/perfil` e `/progresso`.
- Conclusão de módulo com estado de erro real quando a persistência falha.
- `/revisar` sem flash (guarda de hidratação) e com refresh de fila.
- Copy de erro reescrita para o aluno; diagnóstico técnico vai para o log.
- Counter inicia no valor final; anima só após detectar o observer.
- Erros globais ganham "voltar para a home" e "explorar"; remover "limpe o cache".

## Fora de escopo

- Os estados do runner de simulado — cobertos por `prova-integra-e-anti-fraude` (é o mesmo defeito lá, no fluxo probatório).
- Redesenho visual além dos estados.

## Impact

- Rotas: `frontend/src/components/ranking/TrailLeaderboard.tsx`, `comments/CommentSection.tsx`, `lib/comments-api.ts`, `DevProfileClient.tsx`, `ProgressoClient.tsx`, `app/aprenda/[slug]/page.tsx`, `ConcluirModulo.tsx`, `ReviewClient.tsx`, `EstudoClient.tsx`, `home/Counter.tsx`, `app/error.tsx`, `ErrorBoundary.tsx`, novos `error.tsx`/`loading.tsx` de segmento.
- Achados cobertos: UX-1..10, 19, 20 e fluxos 2.1, 4.1, 4.2, 4.3, 4.5.
