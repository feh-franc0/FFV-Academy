## Why

A plataforma promete, no `SyncBanner`, "crie conta grátis para sincronizar entre
dispositivos". **Ela não sincroniza nada.** Confirmado por leitura e por rodar
`LZString.compress` no repositório durante a auditoria de 10/ago/2026:

| # | Defeito | Evidência | Sev |
|---|---|---|---|
| 1 | **O push nunca acontece.** A engine grava o `GameState` comprimido com LZ-string; o `progress-sync` lê com `getJSON` (=`JSON.parse`). O parse falha, `readLocalState()` devolve `null`, `pushProgress` retorna `'error'` antes de chamar a API. XP, streak, badges e a fila SRS existem só no navegador. | `engine.ts:271-272` vs `progress-sync.ts:38-42` + `storage.ts:70-78` | **P0** |
| 2 | **O teste que deveria pegar semeia o formato errado.** O teste de integração popula o localStorage com JSON puro — formato que a engine nunca produz — então passa verde sobre um caminho morto. | `src/tests/integration/progress-sync.test.ts:12-32` | **P0** |
| 3 | **Login pode APAGAR o progresso anônimo.** No login, `pullProgress` considera o servidor mais novo quando não há `lastSync` (sempre, para anônimo); um snapshot antigo do servidor sobrescreve o local. | `progress-sync.ts:74-84` + `AuthProvider.tsx:129-136` | **P1** |
| 4 | **O banner mente.** Com 1 e 3, criar conta pode piorar a situação do usuário. | `SyncBanner.tsx:64-72` | **P1** |
| 5 | **`GameStateSchema.strict()` é um segundo fail-closed silencioso.** Campo novo em `GameState` não espelhado em `schemas.ts` derruba o push e descarta o pull sem log. | `schemas.ts:62-113`, `progress-sync.ts:40-41,79-84` | **P1** |
| 6 | **`schemaVersion` enviado é 2; a engine está em 6.** O snapshot na nuvem fica rotulado com uma versão inexistente, travando migração futura. | `progress-sync.ts:23` vs `engine.ts:90` | **P2** |
| 7 | **Só o `GameState` sincroniza.** Attempts, certificados e timer são exclusivamente locais; limpar o navegador apaga certificados emitidos. | `constants.ts` STORAGE_KEYS + ausência em `progress-sync.ts` | **P1** |
| 8 | **IndexedDB é escrito e nunca lido no caminho quente.** Se o Safari ITP evacuar o localStorage, o backup em IDB não é consultado e o usuário volta a zero. | `useGameState.ts:100-102` vs `:152-153` | **P2** |

A causa-raiz: **duas representações do estado que nunca foram reconciliadas** — a engine
comprime, a camada de sync assume JSON puro — e um teste que ratifica o formato que não
existe.

## What Changes

- `readLocalState`/`writeLocalState` leem e escrevem no MESMO formato que a engine usa (descomprimir LZ antes de validar; um único ponto de serialização compartilhado).
- Teste de integração passa a semear o estado **pela engine** (`saveState`), não por um literal, para nunca mais divergir do formato real.
- Merge no login que não destrói progresso anônimo: quando o local tem dados e o servidor está vazio/mais antigo, o local sobe; conflito real resolve por `updatedAt` verdadeiro.
- Fila de push resiliente: reenfileira em falha de rede, escuta `online`.
- `schemaVersion` enviado passa a ser o da engine; contrato de espelhamento `GameState`↔`schemas.ts` coberto por teste.
- Attempts/certificados entram no snapshot sincronizado (ou o produto declara explicitamente que são locais — decisão registrada).
- IndexedDB é lido como fallback quando o localStorage vem vazio.

## Fora de escopo

- Reescrever o algoritmo SM-2 ou o modelo de XP.
- Sincronização em tempo real / multi-device ao vivo — o alvo é "não perder dados", não colaboração.

## Impact

- Rotas: `frontend/src/lib/progress-sync.ts`, `engine.ts`, `storage.ts`, `schemas.ts`, `AuthProvider.tsx`, `useGameState.ts`, `SyncBanner.tsx`, `src/tests/integration/progress-sync.test.ts`.
- Backend: `progress/sync.go` (aceitar o `schemaVersion` correto; sem mudança de contrato além disso).
- Risco: usuários que já têm snapshot antigo na nuvem — definir a política de merge para não sobrescrever o local bom com o servidor velho.
- Achados cobertos: F-P0-1, 6.1–6.11.
