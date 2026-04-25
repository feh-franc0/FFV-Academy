# 01 — Revisão Crítica

> Este é o documento mais importante da suite. Aqui não tem hype, não tem orgulho de autor — só ataque honesto a cada decisão tomada e a cada ideia proposta.

---

## Sobre o que foi construído na v0.1.0

### Crítica 1 — Token admin estático em variável de ambiente é frágil

**Problema:** o JWT da FFV Academy expira em 15 minutos. Eu coloquei `FFV_ADMIN_TOKEN` como env var no `claude_desktop_config.json`. Operacionalmente isso significa: **a cada 15 min eu tenho que gerar um token novo, copiar pra config, reiniciar o Claude Desktop.**

**Severidade:** 🔴 Alta. Inviabiliza uso real além de "teste de 5 minutos".

**Por que aconteceu:** simplifiquei demais. Optei por "v1 que compila" em vez de "v1 que funciona no dia a dia".

**O que deveria ser:** refresh token rotation embutida no MCP. O MCP guarda refresh, renova access automaticamente. Ou: emitir um token de longa duração (ex: 30 dias) específico pra MCP, com claim diferenciada.

**Decisão forçada:** isso vai pra v1.1 como hotfix obrigatório, não pra v2. Sem isso o MCP é um demo, não uma ferramenta.

---

### Crítica 2 — Zero testes

**Problema:** escrevi cliente HTTP, parsing, error handling, e não escrevi um teste sequer. Estou pregando engenharia profissional e entreguei código sem cobertura.

**Severidade:** 🟡 Média. Funciona hoje, mas qualquer mudança vira roleta russa.

**O que deveria ter:** Vitest com mock de `fetch` cobrindo:
- Request com auth e sem auth
- Erro 401, 404, 500 do backend
- Timeout
- ApiError parsing (Problem+JSON)
- Schema Zod das tools rejeitando entrada inválida

**Decisão forçada:** v2 não é liberada sem cobertura ≥70%.

---

### Crítica 3 — `find_duplicates` é teatro de duplicação

**Problema:** essa tool só faz `searchArticles` e agrupa por `trail_id`. Mas `searchArticles` no backend é busca por similaridade no **título**, não no conteúdo. Então "duplicata" aqui significa "tem título parecido", o que é uma fração mínima dos casos reais de duplicação semântica.

**Severidade:** 🟡 Média. Promete mais do que entrega.

**Honestidade:** essa tool deveria se chamar `find_similar_titles`. O nome atual mente.

**Solução real (cara):** indexar embeddings dos artigos (OpenAI/Voyage/Cohere) e fazer kNN. Custa dinheiro e infra. Não vale na v2.

**Decisão forçada:** renomear pra `find_similar_titles` no v1.1 ou remover. Manter o nome mentiroso é pior que não ter.

---

### Crítica 4 — `update_article` aplica mudanças sem preview

**Problema:** o LLM chama `update_article(slug, content_md=...)` e o backend sobrescreve. Não há diff, não há "tem certeza?", não há rollback. Se o Claude alucinar e enviar conteúdo errado, o artigo é destruído.

**Severidade:** 🔴 Alta. Risco real de perda de conteúdo.

**Mitigantes existentes:** o backend não versiona artigos (verificado nas migrations). Logo, **não há rollback nativo**. Soft-delete é só pra `delete`, não pra `update`.

**O que deveria existir:**
- v1.1: tool `preview_article_update` que mostra o diff sem aplicar.
- v2: backend deveria persistir histórico de versões (mudança no FFV, não no MCP).

**Decisão forçada:** adicionar `preview_article_update` na v1.1. Documentar no README que `update_article` é destrutivo até o backend versionar.

---

### Crítica 5 — Não tenho forma de descobrir `hub_id` e `trail_id`

**Problema:** `create_article` exige `hub_id` e `trail_id`, mas não tem nenhuma tool pra listar hubs e trilhas disponíveis. O LLM tem que adivinhar — e vai errar.

**Severidade:** 🟡 Média. UX horrível pro LLM e gera artigos com IDs inválidos (que o backend rejeita).

**Por que aconteceu:** o backend não expõe endpoint pra listar hubs/trilhas. Os IDs vivem no front (`frontend/src/data/`).

**Solução:**
- Curto prazo (v1.1): bundlar um JSON estático no MCP com a lista de hubs/trilhas conhecidos, expor como Resource MCP ou tool `list_hubs` / `list_trails`. Aceitar que vai desincronizar.
- Médio prazo (v2): adicionar endpoint `GET /api/v1/curriculum/taxonomy` no backend.

**Decisão forçada:** v1.1.

---

### Crítica 6 — Zero observabilidade no MCP

**Problema:** se uma tool falhar pra um usuário (eu), eu vejo só a mensagem de erro no Claude. Não tem log estruturado, não tem métrica de uso, não tem audit trail de quais tools foram chamadas.

**Severidade:** 🟢 Baixa em uso solo, 🔴 Alta se for multi-usuário.

**Solução v2:** logger estruturado em stderr (JSON lines), incluindo: timestamp, tool, params (sanitizados), duração, status. Opcional: enviar pra OTel collector se variável estiver setada.

---

### Crítica 7 — Nenhum rate limit no lado do MCP

**Problema:** se o Claude entrar num loop e chamar `list_articles` 1000x, o MCP repassa pro backend. O backend tem rate limit, mas no IP — e aí começa a 429 todas as outras chamadas.

**Severidade:** 🟢 Baixa em uso solo. Real quando tiver outros consumidores.

**Mitigação simples (v2):** circuit breaker client-side e backoff exponencial em 429.

---

### Crítica 8 — `delete_article` confia no `confirm: true`

**Problema:** o LLM gera o input. Se o LLM decidir que é uma boa ideia deletar, ele passa `confirm: true` sozinho. O argumento "confirm" é teatro de segurança.

**Severidade:** 🟡 Média. Mitigado pelo backend ser soft-delete.

**Solução real:** confirmação tem que ser **fora do LLM** — via MCP "elicitation" (recurso do protocolo onde o servidor pede confirmação ao usuário humano). Ou simplesmente não expor delete e deletar via painel web.

**Decisão forçada:** v2 implementa elicitation, OU remove `delete_article` e documenta que delete é via painel.

---

## Sobre as ideias propostas no roadmap

### Crítica 9 — `find_gaps(trail_id)` é vago

**Problema:** o que é "gap"? Sem uma fonte de verdade do "currículo planejado vs realizado", essa tool não tem o que comparar. Ou eu mantenho um YAML de "trilha alvo" em algum lugar (overhead manual), ou ela não funciona.

**Severidade:** 🟡 Média conceitual.

**Decisão:** remover do roadmap até ter o `CURRICULUM_MASTER_PLAN.md` (que já existe no projeto!) parseável programaticamente. Antes disso, é fumaça.

---

### Crítica 10 — `bulk_update` é arma carregada

**Problema:** "alterar metadados em lote" via LLM é receita pra catástrofe. Um prompt mal interpretado e 50 artigos viram lixo.

**Severidade:** 🔴 Alta.

**Decisão:** **rejeitar do roadmap.** Operações em massa devem ser scripts Go/SQL versionados, code-reviewed, executados manualmente. Não MCP.

---

### Crítica 11 — Tools de simulados / billing / stats no roadmap v2

**Problema:** copiei essas ideias do brainstorm sem validar dor. Eu raramente mexo em simulados; billing é manuseado pelo Stripe sozinho; stats eu olho 1x por mês.

**Severidade:** 🟢 Baixa (não causa dano, só desperdiça esforço se construído).

**Decisão:** rebaixar pra "Could" em moscow, atrás de tudo que ataca a dor real (currículo).

---

## Sobre arquitetura

### Crítica 12 — stdio + token estático = não escala

**Problema:** se amanhã alguém da minha equipe quiser usar, a arquitetura inteira tem que mudar. stdio = um processo por usuário. Token em env = não tem identidade.

**Severidade:** 🟢 Baixa hoje (uso solo), 🔴 Alta se v3 acontecer.

**Decisão:** v3 (multi-user) requer redesign — HTTP transport, OAuth/SSO, audit por usuário. Não tentar prever em v2.

---

### Crítica 13 — Cliente HTTP escrito à mão vai desincronizar da API

**Problema:** o backend é fonte da verdade, mas eu copiei tipos manualmente em `client.ts`. Quando o backend mudar campos, o MCP quebra silenciosamente.

**Severidade:** 🟡 Média.

**Solução:** v2 — forçar atualização da OpenAPI spec do backend (que está incompleta!) e gerar tipos com `openapi-typescript`. Adiciona um passo no CI: build do MCP roda contra spec.

---

### Crítica 14 — Não usei MCP Resources nem Prompts

**Problema:** o protocolo MCP tem 3 primitivas: tools, resources, prompts. Eu só usei tools. Como veículo de aprendizado pra trabalho profissional, isso é cobertura incompleta.

**Severidade:** 🟢 Baixa pro produto, 🟡 Média pro objetivo de aprendizado.

**Solução v2:**
- **Resource:** expor o catálogo (`ffv://curriculum/{slug}`) pra Claude navegar artigos como contexto.
- **Prompt:** template "escreva um artigo no estilo FFV" pré-pronto, parametrizado por hub.

---

## Sobre o documento original (README.md original do `create_mcp/`)

### Crítica 15 — Vendi MCP de observabilidade depois disse pra esquecer

**Problema:** dei voltas na conversa. O README inicial discutia 2 MCPs (integração + observabilidade), depois desencorajei observabilidade, depois fui pra "MCP de produto", depois aterrissamos em "authoring de conteúdo". O processo foi instrutivo mas o documento original ficou desatualizado.

**Decisão:** marcar `/Users/fernandofranco/Developer/create_mcp/README.md` como histórico/exploratório no topo, ou movê-lo pra `docs/99-EXPLORATORY-NOTES.md`. Não deletar — registra raciocínio.

---

## Sobre o objetivo declarado de "aprender pra levar pro trabalho"

### Crítica 16 — Conflito de incentivos não nomeado

**Problema:** eu disse no `00-VISION` que o autor solo vem primeiro, mas o objetivo de "veículo de aprendizado" puxa pra over-engineering ("vou implementar OAuth porque amanhã eu posso precisar"). Esses dois objetivos vão brigar em cada decisão.

**Decisão:** **regra de bolso explícita** — se uma feature só serve "pra aprender", ela vira ramo de experimento (`feat/learn-*`) e NÃO entra na main. A main serve o autor solo.

---

## Sobre o que NÃO foi pensado (gaps de planejamento)

### Crítica 17 — Não tem plano de backup / restore

Se eu apagar 100 artigos por engano (mesmo soft-delete), como recupero? O backend tem backup de Postgres? Quem testou restore? **Não sei a resposta. Isso é pré-requisito antes de qualquer mutation MCP.**

### Crítica 18 — Não tem plano de evolução de schema

Se o backend mudar `content_md` pra `content` (rename), o MCP quebra. Não tem versionamento da API. **Decisão:** `Accept: application/vnd.ffv.v1+json` ou prefixo `/api/v1/` (já tem) precisam virar contrato escrito.

### Crítica 19 — Não tem definição de SLA do backend

O MCP assume backend disponível. Se o backend cair, o MCP retorna erro mas não tem fallback (ex: cache local de artigos pra leitura). **Em uso solo isso é OK. Documentar.**

### Crítica 20 — Não tem onboarding pra outro humano

Se eu sumir, a próxima pessoa abre esse repo e leva quanto tempo pra entender? Hoje: provavelmente 1 dia. Bom o suficiente, mas só porque tem este conjunto de docs. Sem ele, dias.

---

## Resumo: o que sai daqui pra ações

Cada crítica acima vira item priorizado em `02-ROADMAP.md`. Críticas marcadas 🔴 são **bloqueantes pra qualquer "v2 oficial"**. As 🟡 são fortemente recomendadas. As 🟢 são monitoradas.

| # | Severidade | Bloqueia v2? | Onde vai |
|---|---|---|---|
| 1 | 🔴 | sim | v1.1 — Token refresh |
| 2 | 🟡 | sim | v2 — Tests |
| 3 | 🟡 | não | v1.1 — Renomear |
| 4 | 🔴 | sim | v1.1 — Preview tool |
| 5 | 🟡 | não | v1.1 — list_hubs/trails |
| 6 | 🟡 | sim | v2 — Logging estruturado |
| 7 | 🟢 | não | v2 — Backoff |
| 8 | 🟡 | sim | v2 — Elicitation OU remover |
| 9 | 🟡 | n/a | Remover do roadmap |
| 10 | 🔴 | n/a | Rejeitado do roadmap |
| 11 | 🟢 | não | Rebaixar prioridade |
| 12 | 🟢 | n/a | v3 — escopo separado |
| 13 | 🟡 | não | v2 — OpenAPI gen |
| 14 | 🟡 | não | v2 — Resources + Prompts |
| 15 | 🟢 | não | Cleanup docs |
| 16 | 🟡 | sim | Adicionar regra a `07-DECISIONS` |
| 17 | 🔴 | sim | Validar backup antes de v2 |
| 18 | 🟡 | não | v2 — formalizar versioning |
| 19 | 🟢 | não | Documentar |
| 20 | ✅ | n/a | Esta documentação resolve |
