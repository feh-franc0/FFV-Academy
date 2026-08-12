## ADDED Requirements

### Requirement: A origem de cada ícone é registrada

Cada família de ícone exibida no material de arquitetura DEVE (MUST) ter origem registrada:
desenhado internamente, derivado de conjunto oficial, ou de terceiro com licença nomeada.

O catálogo tem 216 entradas em `AwsIcon.tsx`, todas como SVG inline, e hoje nenhuma declara
origem.

#### Scenario: ícone sem origem declarada
- **WHEN** uma entrada nova é acrescentada ao catálogo sem registro de origem
- **THEN** o gate falha

---

### Requirement: O uso respeita os termos da iconografia de origem

Quando o ícone for derivado de conjunto oficial de terceiro, o uso DEVE (MUST) respeitar os termos
desse conjunto — incluindo restrições sobre alteração, sobre sugerir endosso e sobre uso em
material comercial.

A plataforma exibe esses ícones em 207 módulos e tem anel de monetização, o que torna a
verificação necessária em vez de opcional.

#### Scenario: termo que proíbe alteração
- **WHEN** o conjunto de origem proíbe alterar o desenho e a entrada do catálogo é uma
  reinterpretação
- **THEN** a entrada é substituída por desenho próprio genérico, ou o uso é ajustado ao que
  o termo permite

#### Scenario: atribuição exigida
- **WHEN** o termo exige atribuição
- **THEN** a atribuição aparece onde o termo determina

---

### Requirement: Ícone conceitual é próprio e não imita marca

As entradas conceituais do catálogo — `llm`, `retriever`, `hnsw`, `quorum`, `feature_store`
e as demais 55 — NÃO DEVEM (MUST NOT) imitar iconografia de produto de terceiro, porque não
representam produto nenhum.

#### Scenario: conceito desenhado com marca de produto
- **WHEN** a entrada `llm` reusa o glifo de um produto comercial específico
- **THEN** é substituída por desenho genérico

---

### Requirement: Nenhum ícone é buscado de host externo

Todo ícone DEVE (MUST) ser SVG inline. Requisição a host externo é bloqueada pela política de
segurança de conteúdo e reintroduziria dependência de rede numa página de conteúdo.

#### Scenario: ícone por URL externa
- **WHEN** uma entrada aponta para uma imagem hospedada fora
- **THEN** falha no navegador pela política, e o gate a recusa antes disso
