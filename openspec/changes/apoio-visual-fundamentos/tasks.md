## 1. Triagem (decisão módulo a módulo, antes de qualquer autoria)

- [x] 1.1 Escopo corrigido na execução: a auditoria original media a plataforma inteira (131 módulos); o proposal É especificamente sobre o hub Base técnica. Reproduzido com o filtro correto: **39 módulos sem visual, de 57 do hub** (não 36 — a diferença é módulos novos entrados desde a auditoria original)
- [x] 1.2 Classificados: **21 no grupo (a)**, cada um com o primitive certo e a informação que ele carrega (ver tabela abaixo); **18 no grupo (b)**, cada um com o motivo em `EXCECOES` de `validate_apoio_visual_fundamentos.py`
- [x] 1.3 Triagem registrada — nesta sessão a decisão foi direto para o código porque o `banco.py`/patcher já provam a forma antes de salvar (assert de âncora obrigatória, idempotência); a tabela abaixo é o registro

| Módulo | Primitive | O que ensina |
|---|---|---|
| como-computador-roda-codigo | layer_stack | As 5 camadas, código→CPU |
| dns-tls-certificados | hierarchy_diagram | Cadeia de confiança X.509 |
| filesystem-permissions | annotated_formula | rwxr-xr-x decomposto |
| git-de-verdade | stack_flow | As 3 áreas do Git |
| github-fluxo-profissional | flow_diagram | Fork ao merge |
| processos-jobs-sinais | flow_diagram | fork() + exec() |
| connection-pool-n-plus-1 | flow_diagram | Fan-out de 1 para N |
| explain-analyze | hierarchy_diagram | Árvore do plano de execução |
| migrations-profissionais | stack_flow | Expand → migrate → contract |
| normalizacao-modelagem | stack_flow | 1NF → 2NF → 3NF |
| relacional-vs-nao-relacional | matrix_diagram | 4 modelos NoSQL por eixo de uso |
| select-join-na-pratica | hierarchy_diagram | Self-join como hierarquia |
| transacoes-isolation-levels | matrix_diagram | Isolamento × anomalia |
| http-1-vs-2-vs-3 | comparison_flow | HOL blocking vs multiplexing |
| udp-quic-http3 | layer_stack | Pilha HTTP/3 sobre QUIC sobre UDP |
| async-await-sem-pegadinha | timeline | Sequencial vs Promise.all |
| monorepo-pnpm-turbo | hierarchy_diagram | Estrutura apps/ e packages/ |
| capstone-agent-python-completo | arch_flow | As 4 camadas do projeto |
| python-pra-dev-ts | comparison_flow | Mapa mental TS ↔ Python |
| capstone-go-cli-api | arch_flow | Layout cmd/internal/pkg |
| context-cancelation | hierarchy_diagram | Propagação de cancelamento |

## 2. Autoria do grupo (a)

- [x] 2.1 Redes & Web: 2 dos 2 candidatos (HTTP/1 vs 2 vs 3, UDP/QUIC/HTTP3) — os outros 7 módulos da trilha já tinham visual
- [x] 2.2 SQL & Databases: 7 módulos — N+1, EXPLAIN como árvore, migração zero-downtime, normalização, NoSQL por eixo, self-join, isolamento
- [x] 2.3 Fundamentos Técnicos: 6 módulos — pilha de 5 camadas, cadeia TLS, permissões, 3 áreas do Git, fluxo de PR, fork+exec
- [x] **Ajuste ao escopo**: TypeScript (2), Python (2) e Go (2) também entraram — o proposal não os excluía, e a triagem achou candidatos legítimos (mapa mental TS↔Python, estrutura de monorepo, arquitetura dos dois capstones, propagação de contexto em Go)
- [x] 2.4 Toda aresta com `label`, todo nó com `note`/`desc`/`detail` — nenhum bloco com campo vazio; `validate_primitives_render.py` confirmou 8.481 itens conferidos, nenhum invisível
- [x] 2.5 Servidor de dev local ativo — HTML servido conferido por `curl` para `como-computador-roda-codigo` (confirma `LayerStack` renderizado) e `dns-tls-certificados` (confirma `HierarchyDiagram` renderizado), os dois com conteúdo autorado nesta sessão presente no payload. Cobre forma, presença E entrega no HTML real — não cobre contraste nem overflow visual (isso exigiria captura de tela, não disponível nesta sessão)

## 3. Travar

- [x] 3.1 **Ajuste ao plano**: `validate_cobertura_diagramas.py` mede especificamente `arch_diagram` (ícone de serviço AWS) — não se aplica a Git, SQL, TypeScript, Python ou Go. Subir seus `MINIMOS` para essas 6 trilhas teria sido medir a coisa errada (tentei, o próprio gate expôs o erro ao continuar reportando os números antigos). Escrito um gate NOVO, `validate_apoio_visual_fundamentos.py`, que mede a família ampla (12 tipos) especificamente no hub Base técnica
- [x] 3.2 18 exceções registradas em `EXCECOES`, cada uma com o motivo em uma linha — mesma disciplina do gate de quiz
- [x] 3.3 Manifesto regenerado; **16 gates do CI verdes** (15 + o novo), 1.076 testes, `tsc` e lint limpos. Prova de mutação feita e revertida: bloco renomeado em `git-de-verdade` → gate reprovou corretamente → revertido → gate verde de novo
