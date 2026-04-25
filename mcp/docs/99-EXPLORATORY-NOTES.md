# 99 — Notas Exploratórias (histórico)

> **Este documento é histórico.** Representa o brainstorm inicial antes de aterrissar no MCP de authoring da FFV Academy. Não é o plano atual — esse está em `00-VISION.md` a `08-OPERATIONS.md`. Mantido aqui porque registra o raciocínio de ideação.
>
> Origem: `/Users/fernandofranco/Developer/create_mcp/README.md` — movido conforme crítica #15 de `01-CRITICAL-REVIEW.md`.

---

# Planejamento — MCPs Internos (exploração original)

Documento de planejamento para criar um (ou mais) **Model Context Protocol (MCP) servers** que atendam dois cenários distintos:

1. **MCP de Integração** — um pacote que times externos (ou outros squads) baixam e usam para integrar com nossos serviços sem precisar ler dezenas de páginas de documentação.
2. **MCP de Observabilidade / Dados Internos** — um servidor que dá ao Claude (ou outro cliente MCP) acesso de leitura a Grafana, bancos de dados, logs etc., para perguntas do tipo *"como está X no Grafana?"*, *"quantos pedidos falharam hoje?"*.

---

## 1. Resumo da decisão: 1 MCP ou 2 MCPs?

**Recomendação: 2 MCPs separados**, possivelmente publicados no mesmo monorepo, compartilhando bibliotecas internas (auth, logging, schema helpers).

| Critério | MCP Integração | MCP Observabilidade |
|---|---|---|
| Público-alvo | Times externos / parceiros / novos devs | Time interno (eng, SRE, produto) |
| Permissões necessárias | Baixas — docs, exemplos, scaffolding, chamadas de API públicas | Altas — credenciais de Grafana, DB, APM |
| Superfície de risco | Baixa | Alta (PII, credenciais, queries arbitrárias) |
| Frequência de release | Acompanha mudanças de API pública | Acompanha mudanças de infra/dashboards |
| Distribuição | Público (npm/pypi/registry interno) | Interno apenas, atrás de SSO/VPN |
| Auditoria | Logs simples de uso | Logs detalhados, rastreio por usuário |

Misturar os dois num único servidor força quem só quer integrar a baixar credenciais de produção, e força quem precisa observar a carregar scaffolding que não usa. Separar deixa o blast radius claro.

**Alternativa válida:** um *meta-pacote* que expõe os dois como sub-servidores configuráveis (`enabled: ["integration", "observability"]`). Útil se quisermos uma única instalação.

---

## 2. MCP de Integração

### Objetivo
Quando um time quer integrar com nossos serviços (ex: enviar eventos, consumir nossa API, publicar em nosso sistema de filas), ele instala o MCP e o Claude já sabe:
- Quais endpoints existem e o contrato de cada um
- Como autenticar
- Como gerar SDK / código-cliente em N linguagens
- Quais são os erros comuns e como debugar
- Como rodar o ambiente local de teste

### Tools (funções que o MCP expõe ao LLM)

- `list_services()` — lista os serviços/APIs disponíveis para integração.
- `describe_service(name)` — retorna OpenAPI/AsyncAPI/proto, exemplos, SLA, owner.
- `generate_client(service, language)` — gera snippet/SDK pronto.
- `validate_payload(service, endpoint, payload)` — valida contra o schema antes do time tentar enviar.
- `simulate_request(service, endpoint, payload)` — chama um sandbox/mock e retorna a resposta.
- `get_auth_setup(service)` — instruções de auth (OAuth, API key, mTLS) e link para gerar credencial.
- `troubleshoot(error_message_or_code)` — busca em base de erros conhecidos.
- `list_examples(service, use_case)` — exemplos end-to-end.

### Resources (conteúdo estático que o LLM lê)

- Specs OpenAPI/proto versionadas
- Guias de "primeiro hello world" por serviço
- Changelog de breaking changes
- Diagramas de arquitetura (mermaid)

### Prompts (templates pré-prontos)

- "Me ajude a integrar o serviço X no meu app em Y"
- "Migre minha integração da v1 para a v2"
- "Revise meu código de integração e aponte problemas"

### Distribuição

- Pacote público: `npx @empresa/mcp-integration` ou `pip install empresa-mcp-integration`
- Configuração mínima no `claude_desktop_config.json` / `.mcp.json`
- Auto-update das specs (busca a versão mais recente do registry de APIs ao iniciar)

### Riscos / decisões em aberto

- **Fonte da verdade dos contratos**: precisamos de um registry central de OpenAPI/proto. Se não existe, criar primeiro.
- **Sandbox**: `simulate_request` exige ambiente de teste estável. Sem ele, valor cai pela metade.
- **Versionamento**: como lidar com clientes em versões antigas do MCP quando a API muda?

---

## 3. MCP de Observabilidade / Dados Internos

### Objetivo
Permitir perguntas em linguagem natural sobre o estado dos sistemas:
- "Como está a latência do checkout nos últimos 30min?"
- "Quantos usuários se cadastraram hoje?"
- "Mostra os erros do serviço X na última hora"
- "O deploy de ontem causou regressão em alguma métrica?"

### Tools

**Grafana / Métricas**
- `list_dashboards(query?)`
- `query_dashboard(dashboard_id, time_range)`
- `query_prometheus(promql, time_range)` — com guard-rails de custo
- `get_alert_status(alert_name?)`

**Banco de dados (read-only!)**
- `list_databases()` / `list_tables(db)`
- `describe_table(db, table)`
- `run_query(db, sql)` — **somente SELECT**, com timeout, limite de linhas e allowlist de schemas
- `get_saved_query(name)` — biblioteca de queries pré-aprovadas

**Logs**
- `search_logs(service, query, time_range)`
- `tail_logs(service)` — opcional, streaming

**APM / Traces**
- `find_trace(trace_id)`
- `slow_endpoints(service, time_range)`

**Deploys / CI**
- `recent_deploys(service)`
- `correlate_deploy_to_metric(service, metric)`

### Segurança (não-negociável)

- **Read-only por padrão**. Nenhum tool de escrita sem flag explícita e aprovação.
- **Allowlist de schemas/tabelas** — nunca expor tabelas com PII bruta sem mascaramento.
- **SQL parser** que rejeita `INSERT/UPDATE/DELETE/DROP/ALTER` antes de executar.
- **Limite de linhas** (ex: 1k) e **timeout** (ex: 30s) em toda query.
- **Auth por usuário**, não credencial compartilhada — o MCP deve repassar a identidade do usuário (OIDC/SSO) e respeitar RBAC do banco/Grafana.
- **Audit log** de toda chamada: quem, quando, qual query, quantas linhas retornou.
- **Redaction** automática de campos sensíveis (emails, CPFs, tokens) na resposta antes de devolver pro LLM.
- **Rate limiting** por usuário.

### Distribuição

- **Interno apenas**, instalado via registry privado ou repo Git interno.
- Configuração exige variáveis de ambiente com credenciais (ou melhor: token de SSO obtido on-demand).
- Documentar claramente que conversas com este MCP podem expor dados internos ao provedor do LLM — definir política.

---

## 4. Arquitetura sugerida (monorepo)

```
mcp-empresa/
├── packages/
│   ├── mcp-core/              # auth, logging, schema utils, error types
│   ├── mcp-integration/       # MCP público
│   └── mcp-observability/     # MCP interno
├── docs/
└── examples/
```

Stack sugerida:
- **TypeScript** com `@modelcontextprotocol/sdk` (mais maduro hoje)
- ou **Python** com `mcp` SDK se o time tiver mais força em Python
- Transport: **stdio** para uso local com Claude Desktop/Code; **HTTP/SSE** se quisermos hospedar centralmente

---

## 5. Outras ideias de MCPs internos (para roadmap futuro)

Algumas extensões naturais que valem discussão:

1. **MCP de Runbooks / Oncall** — "como faço rollback do serviço X?", "qual o procedimento se a fila Y enche?". Ler runbooks + executar comandos read-only de diagnóstico.
2. **MCP de Code Search interno** — busca semântica em todos os repos da empresa. Útil pra "onde no monorepo a gente faz X?".
3. **MCP de Tickets / Roadmap** — acesso a Linear/Jira: "o que tem em aberto pro time de pagamentos?", "qual o status da épica X?".
4. **MCP de Custos de Cloud** — "quanto a gente tá gastando em RDS este mês?", "qual serviço cresceu mais em custo?".
5. **MCP de On-call / Incidentes** — histórico de incidentes, post-mortems, "já tivemos algo parecido com X?".
6. **MCP de RH / Org** — quem é dono do serviço Y, quem está de férias, quem revisa PR de tal área. (Cuidado com PII.)
7. **MCP de Feature Flags** — listar flags, ver status, sugerir cleanup de flags antigas.
8. **MCP de Data Catalog** — descobrir datasets, schemas, donos, freshness. Combina bem com o de DB.

Princípio para todos: **um MCP por domínio de permissão**. Quando dois conjuntos de tools precisam de níveis de confiança diferentes, separe.

---

## 6. Próximos passos sugeridos

1. **Validar a separação 2-MCPs** com 1-2 usuários de cada perfil (1 time externo + 1 SRE).
2. **Inventário de fontes de dados** — listar todas as APIs internas e todos os sistemas de observabilidade que faria sentido conectar.
3. **Spike técnico** (1 semana): escrever o MCP de Integração com 1 serviço real ponta-a-ponta, em stdio, usado via Claude Desktop. Mede tempo de onboarding antes/depois.
4. **Threat model** do MCP de Observabilidade antes de qualquer linha de código de produção.
5. **Decisão de stack** (TS vs Python) — alinhar com o time que vai manter.
6. **Política de uso de LLM com dados internos** — alinhar com Segurança/Jurídico antes de expor dados reais.

---

## 7. Perguntas em aberto

- Qual o registry/fonte da verdade das nossas APIs hoje? Existe um portal de APIs?
- Temos SSO interno que dá pra reusar pro MCP de observabilidade?
- O Claude Desktop/Code é o cliente padrão, ou queremos suportar outros (Cursor, Zed, IDEs próprias)?
- Qual o orçamento de manutenção? MCP sem dono vira liability rapidinho.
- Vamos hospedar centralmente (HTTP/SSE) ou cada usuário roda local (stdio)? Tem implicação enorme em segurança e ops.
