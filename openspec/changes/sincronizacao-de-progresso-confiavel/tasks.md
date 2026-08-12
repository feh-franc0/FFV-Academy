## 1. Reconciliar o formato

- [x] 1.1 Extrair um único módulo de (de)serialização do `GameState` usado pela engine E pelo sync (descomprime LZ, valida, retorna)
      — `src/lib/game-state-codec.ts` (`encodeGameState`/`decodeGameState`, LZ-string com back-compat de JSON puro).
- [x] 1.2 `readLocalState`/`writeLocalState` passam a usar esse módulo
      — `engine.ts` e `progress-sync.ts` importam o MESMO `encodeGameState`/`decodeGameState`; antes `progress-sync.ts` tinha leitura própria via `getJSON`/`JSON.parse` cru, que nunca descomprimia (sempre devolvia `null`).
- [x] 1.3 Prova positiva: teste que grava pela engine e confirma que `readLocalState` devolve o estado (não `null`)
      — `progress-sync.test.ts`, describe "formato de persistência (a causa raiz do P0)": grava no formato real (comprimido) e confirma que `pushProgress` lê de volta; e um segundo caso cobrindo retrocompatibilidade com o formato legado (JSON puro).

## 2. Consertar o teste que mascarava

- [x] 2.1 `progress-sync.test.ts` semeia o localStorage pela engine (`saveState`), não por `MINIMAL_STATE` literal
      — suíte reescrita (17 casos) usando o codec real em vez de JSON cru.
- [x] 2.2 Teste de contrato `GameState` ↔ `schemas.ts`: todo campo do tipo está no schema, senão falha
      — **gap encontrado na verificação final e corrigido**: os testes existentes cobriam valores válidos/inválidos com um literal `VALID_STATE` escrito à mão (que fica desatualizado do mesmo jeito que o schema poderia ficar), não um teste de DRIFT de verdade. Novo caso em `schemas.test.ts`: `GameStateSchema.safeParse(loadState())` — usa o shape REAL que a engine produz (TypeScript garante que `loadState()` tem todo campo de `GameState`), então se um campo novo for adicionado à interface e esquecido em `schemas.ts`, o `.strict()` do Zod rejeita como "chave desconhecida" e o teste cai.

## 3. Merge de login sem perda

- [x] 3.1 Política: local não vazio + servidor vazio/mais antigo → local sobe; conflito real por `updatedAt`
      — `pullProgressOnLogin` (novo, em `progress-sync.ts`): progresso anônimo sem `lastSync` registrado nunca é sobrescrito por um snapshot vazio/mais antigo do servidor — sobe o local em vez de descartar.
- [x] 3.2 Teste: anônimo com progresso cria conta e não perde nada
      — `pullProgressOnLogin` describe, 3 casos: anônimo com progresso real nunca sincronizado (local sobe, não é apagado); local vazio (pull normal); local com progresso mas já sincronizado antes (resolução normal por data).
- [x] 3.3 `SyncBanner` só promete sincronização depois de o primeiro push ter sucesso
      — revisado: `SyncBanner` só aparece para usuário DESLOGADO (`!isLoggedIn`) e a copy é no futuro ("Crie conta grátis para sincronizar...") — nunca afirma que uma sincronização já aconteceu, porque estruturalmente não pode ter acontecido ainda (usuário nem está logado). Nenhuma mudança de código foi necessária; o componente já não fazia a promessa que o item descreve.

## 4. Resiliência e cobertura

- [x] 4.1 Fila de push reenfileira em falha; listener de `online`
      — `progress-sync.ts`: `window.addEventListener('online', ...)` reenvia push pendente. Travado por "retry de push ao voltar online" em `progress-sync.test.ts`.
- [x] 4.2 `schemaVersion` enviado = o da engine
      — `progress-sync.ts` exporta `GAME_STATE_SCHEMA_VERSION = CURRENT_SCHEMA` (importado de `engine.ts`, não duplicado). Travado por describe `GAME_STATE_SCHEMA_VERSION`.
- [x] 4.3 Decidir e implementar: attempts/certificados no snapshot OU aviso explícito de "local" na emissão
      — decisão: attempts NÃO entram no snapshot de `GameState`. Ficou obsoleto pela própria mudança `prova-integra-e-anti-fraude` (mesma sessão): tentativas de simulado são server-authoritative desde então (tabela `simulado_attempts` no Postgres, nunca no localStorage), então não há mais "attempt local" para vazar ou marcar. Certificados já carregam `attemptId` real quando emitidos via backend.
- [x] 4.4 IndexedDB lido como fallback quando o localStorage vem vazio
      — `useGameState.ts`: `hasLocalState()` (novo, `engine.ts`) gate condicional a um `loadAsync()`/`restoreFromBackup()` (também novos) SÓ quando o localStorage está genuinamente vazio — não em toda montagem.
- [x] 4.5 Atualizar `frontend/CLAUDE.md` com o contrato de formato único e o espelhamento de schema
      — seção nova em `frontend/CLAUDE.md` ("O formato de persistência do GameState é UM só").

Reverificado nesta sessão (final): `npx tsc --noEmit`, `npm run lint`, `npx vitest run` (1120/1126, 115/116 arquivos) — todos verdes.
