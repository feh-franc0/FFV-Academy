## Context

O bloco `arch_diagram` já é capaz de tudo o que esta mudança exige. Ele nasceu como
`aws_diagram` com catálogo só de serviços AWS, foi renomeado em jul/2026 e ganhou 55
chaves de conceito (`llm`, `laco_agente`, `hnsw`, `quorum`, `feature_store`), o que o
tornou apto a desenhar arquitetura de IA e de sistema, não apenas topologia de nuvem.
Ele suporta grupos, arestas rotuladas, passos percorríveis e lista `sr-only`.

O que falta não é capacidade: é **conteúdo** e **gate**.

Existem hoje dois conjuntos de diagramas com qualidade diferente, e a diferença não
foi decidida — foi herdada:

| Conjunto | Origem | Nota em todo nó | Rótulo em toda aresta |
|---|---|---|---|
| 100 da trilha `trail-arq-ia-aws` | **gerados** por DSL que recusa | sim | sim |
| 107 escritos à mão antes da regra | autoria manual | 218 faltam | 871 faltam |

O DSL em `scripts/seo/arq100/comum.py` é a peça que produziu a diferença. Ele recusa
nó sem nota e aresta sem rótulo **na geração**, além de validar limites de schema que
o Zod só recusaria em runtime — e recusar em runtime significa bloco que volta `null`
e desaparece da página sem erro nenhum.

## Goals / Non-Goals

**Goals:**

- Trocar a métrica de **cobertura** (48%) pela métrica de **decisão tomada** (100%):
  todo módulo tem diagrama ou exceção escrita.
- Igualar os 107 diagramas manuais ao padrão dos 100 gerados, e travar o padrão com
  gate para que a diferença não volte.
- Tornar o DSL de geração disponível a qualquer autoria em volume, não só à trilha
  das 100 arquiteturas.
- Reexaminar módulo a módulo — não em bloco — as três trilhas com exceção registrada.

**Non-Goals:**

- Diagrama em módulo cujo objeto de estudo não é fluxo. A regra 1 do
  `PADRAO_ENSINO.md` proíbe, e esta mudança a fortalece.
- Segundo diagrama obrigatório por módulo. Duas arquiteturas (mínima e produção) é o
  padrão da **série de laboratórios**, não da plataforma inteira.
- Substituir `arch_diagram`, adotar Mermaid, ou mexer no schema de bloco.

## Decisions

### Decisão 1 — Veredito registrado em vez de mínimo por trilha

`validate_cobertura_diagramas.py` hoje declara um mínimo por trilha e falha abaixo
dele. Isso protege o que existe e **não** distingue "este módulo não precisa" de
"ninguém olhou este módulo ainda".

Troca: a lista de exceções com motivo escrito passa a ser obrigatória para todo
módulo sem diagrama. O gate exige que `com diagrama ∪ exceções = todos os módulos`.

**Por que assim, e não exigindo diagrama em 100%:** porque forçar diagrama onde não
há fluxo produz figura decorativa, e o repositório já registrou três vezes que gate
que força mudança errada em caso legítimo é pior que gate ausente. O veredito
registrado dá a cobertura de *atenção* sem falsificar a cobertura de *diagrama*.

**Custo aceito:** alguém precisa escrever ~207 vereditos. É trabalho real, e é o
trabalho que hoje não está sendo feito nem percebido.

### Decisão 2 — Nota e rótulo passam de opcionais a obrigatórios no gate, não no Zod

O Zod continua aceitando `note` e `label` como opcionais. Quem valida é o gate de
conteúdo.

**Por que não apertar o Zod:** apertar o Zod faria 871 arestas existentes falharem a
validação, voltarem `null` e **os diagramas desaparecerem da página** até que o
último rótulo fosse escrito. Seria trocar um defeito de qualidade por um apagão de
conteúdo — exatamente o erro que a migração de `aws_diagram` para `arch_diagram`
evitou ao registrar o alias antes de migrar os 96 blocos.

O gate falha o CI e não apaga nada. A correção pode ser incremental.

### Decisão 3 — Rótulo genérico é recusado por lista, e a lista é curta

`dados`, `chamada`, `requisição`, `resposta`, `informação`, `payload`. Nada de
heurística de comprimento nem de entropia.

**Por que lista curta:** rótulo legítimo pode ser curto (`trecho citável`, `5432`), e
regra por comprimento reprovaria conteúdo correto. A lista pega o caso real — o autor
que preencheu o campo para satisfazer o gate — e não pega mais nada.

### Decisão 4 — As três trilhas de exceção são reexaminadas por módulo

`PADRAO_ENSINO.md` registra que Claude Code do zero (14 módulos), API Claude & Agents
(8) e Harness Engineering (8) não têm diagrama porque "tratam de ferramenta e fluxo de
trabalho, não de topologia".

Essa decisão fica **parcialmente** de pé. Um laço de agente com teto de voltas, uma
cadeia de permissão de ferramenta, um pipeline de compactação de contexto: são fluxos,
e o catálogo tem as chaves de conceito para desenhá-los desde jul/2026. Já a página de
atalhos de teclado e a comparação de planos não são.

Portanto: o reexame é por módulo, e cada um sai com diagrama ou com motivo escrito. A
decisão em bloco é substituída por 30 decisões individuais — o que também é o que a
Decisão 1 exige de todo o resto da base.

### Decisão 5 — Ordem de execução: qualidade antes de cobertura

Primeiro os 871 rótulos e as 218 notas nos diagramas que **já existem**; depois os
vereditos; depois os diagramas novos.

**Por quê:** consertar 107 diagramas melhora o que o leitor já vê hoje. Escrever 207
diagramas novos com a barra antiga criaria 207 novas dívidas de nota e rótulo. Subir a
barra primeiro é o que impede a dívida de crescer enquanto se trabalha nela.

## Risks / Trade-offs

**A lista de exceções vira depósito.** É o risco central: alguém despeja 207 slugs com
motivo copiado e o gate fica verde sobre nada. Mitigação parcial: o gate imprime a
contagem de exceções ao lado da de diagramas a cada execução, e recusa motivo vazio ou
que não nomeie o objeto de estudo. Mitigação real: revisão humana da lista, que nenhum
gate substitui. Fica registrado que este gate mede **forma**, não substância — a mesma
limitação que o piso de 900 caracteres tem.

**871 rótulos escritos às pressas são 871 rótulos ruins.** Rótulo específico exige
entender o que trafega naquela aresta, e quem escreve em lote sob pressão de gate
produz `dados do cliente` em vez de `campo interpretado + confiança`. A lista de
genéricos pega o caso mais óbvio e não pega este. Mitigação: fazer por trilha, com o
diagrama aberto no navegador, e não por varredura de arquivo.

**Reabrir as três exceções pode gerar diagrama decorativo.** É justamente o que a
regra 1 proíbe, e a pressão de "visual em todo o sistema" empurra para lá. Contrapeso
explícito: um módulo dessas trilhas só ganha diagrama se o autor conseguir escrever a
`caption` — a decisão que o leitor leva — antes de desenhar. Se a legenda não sai, o
módulo não tem o que desenhar.

**O DSL extraído pode virar dependência pesada.** Ele foi escrito para um caso (100
diagramas de uma trilha) e generalizar cedo demais produz abstração errada. Trade-off
aceito: extrair apenas as validações (limites de schema, nota, rótulo, passos), que são
as que não dependem do caso, e deixar a montagem de famílias onde está.
