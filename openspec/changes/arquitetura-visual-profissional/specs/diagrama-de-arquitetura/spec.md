## ADDED Requirements

### Requirement: Veredito de diagrama registrado por módulo

Todo módulo com conteúdo DEVE (MUST) ter um veredito explícito sobre apoio visual de
arquitetura: ou contém ao menos um bloco `arch_diagram`, ou consta numa lista de
exceções com o motivo escrito. A ausência das duas coisas é falha de CI.

O motivo da exceção DEVE nomear o objeto de estudo do módulo e por que ele não é
fluxo, topologia nem espectro de decisão. "Não se aplica" não é motivo.

#### Scenario: módulo novo entra sem diagrama e sem exceção
- **WHEN** um seed novo é adicionado sem nenhum bloco `arch_diagram` e sem entrada
  na lista de exceções
- **THEN** `validate_cobertura_diagramas.py --strict` falha no mesmo commit,
  nomeando o slug e exigindo o veredito

#### Scenario: exceção declarada com motivo
- **WHEN** um módulo cujo tema é sintaxe de linguagem, peso de domínio de exame,
  lista de preço ou glossário é declarado como exceção com o motivo escrito
- **THEN** o gate passa, e o relatório imprime a contagem de exceções ao lado da
  contagem de diagramas, para que a proporção fique visível a cada execução

#### Scenario: exceção sem motivo
- **WHEN** um slug é acrescentado à lista de exceções com string vazia ou com
  texto que não nomeia o objeto de estudo
- **THEN** o gate falha, porque exceção sem razão escrita é ausência disfarçada de
  decisão

---

### Requirement: Todo nó de diagrama diz o que decide ali

Todo nó de `arch_diagram` DEVE (MUST) ter `note` não vazia, e a nota DEVE dizer o que
aquele componente **decide ou resolve naquele ponto** do fluxo — não repetir o
nome do serviço.

#### Scenario: nó sem nota
- **WHEN** um bloco `arch_diagram` contém um nó sem o campo `note`
- **THEN** o gate falha, apontando o id do nó e o slug

#### Scenario: nota que repete o rótulo
- **WHEN** um nó tem `service: "textract"` e `note: "Textract"`, ou nota que é
  substring do `label`
- **THEN** o gate falha, porque a nota não acrescenta informação e o leitor já lê
  o rótulo

#### Scenario: nota que ensina
- **WHEN** um nó tem `note: "devolve parcial, para o modelo começar antes do ponto final"`
- **THEN** o gate passa

---

### Requirement: Toda aresta de diagrama diz o que trafega

Toda aresta de `arch_diagram` DEVE (MUST) ter `label` não vazia, e o rótulo DEVE nomear o
dado, o evento ou a chamada que atravessa a ligação.

Rótulo genérico — `dados`, `chamada`, `requisição`, `resposta`, `informação` —
DEVE ser recusado: ele ocupa o lugar do rótulo sem informar, o que é pior que a
ausência, porque parece preenchido.

#### Scenario: aresta sem rótulo
- **WHEN** um bloco `arch_diagram` declara uma aresta sem `label`
- **THEN** o gate falha, apontando `origem>destino` e o slug

#### Scenario: rótulo genérico
- **WHEN** uma aresta tem `label: "dados"`
- **THEN** o gate falha e a mensagem pede qual dado

#### Scenario: rótulo específico
- **WHEN** uma aresta tem `label: "credencial temporária da task role"` ou
  `label: "evento do objeto criado"`
- **THEN** o gate passa

---

### Requirement: Cinco a seis passos percorríveis

Todo `arch_diagram` DEVE (MUST) ter entre 5 e 6 `steps`. Cada passo DEVE ter `label`
curto, `detail` explicando **por que aquele passo existe**, e acender ao menos um
nó ou uma aresta.

O teste editorial do conjunto de passos: quem lê apenas os passos DEVE conseguir
reconstruir a decisão de arquitetura sem o texto do módulo em volta.

#### Scenario: diagrama com menos de cinco passos
- **WHEN** um `arch_diagram` declara 3 passos
- **THEN** o gate falha — hoje há 16 diagramas nessa condição

#### Scenario: passo que não acende nada
- **WHEN** um passo declara `nodes: []` e `edges: []`
- **THEN** o gate falha, porque passo que não destaca nada não é percorrível

#### Scenario: aresta de passo com sintaxe errada
- **WHEN** um passo declara `edges: ["gw->fn"]` em vez de `edges: ["gw>fn"]`
- **THEN** o gate falha; hoje a comparação é por string literal e o passo acende
  sem aresta **em silêncio**

---

### Requirement: A legenda entrega a conclusão

Todo `arch_diagram` DEVE (MUST) ter `caption`, e a legenda DEVE dizer **o que concluir**
do desenho, não descrever o que ele contém.

#### Scenario: legenda que descreve o desenho
- **WHEN** a legenda é "O diagrama mostra o CloudFront, o ALB, o ECS e o RDS"
- **THEN** o gate falha por enumeração de componentes já visíveis no desenho

#### Scenario: legenda que entrega decisão
- **WHEN** a legenda é "Cada camada que a requisição não atravessa é latência e
  custo economizados — a questão diz qual problema existe, e a camada certa segue
  disso"
- **THEN** o gate passa

---

### Requirement: `kind` de grupo afirma o que é verdade sobre a rede

`kind: "vpc"` DEVE (MUST) ser usado apenas em grupos que contenham recurso com interface
em sub-rede. Serviço regional alcançado por endpoint — Bedrock, Knowledge Bases,
S3, DynamoDB, Glue, Athena — DEVE usar `plain`.

Os valores válidos são `plain`, `vpc`, `region` e `account`. **`edge` não existe** e
DEVE ser recusado.

#### Scenario: serviço regional dentro de grupo VPC
- **WHEN** um grupo com `kind: "vpc"` contém um nó `service: "bedrock"`
- **THEN** o gate falha, porque o selo afirma isolamento de rede que não existe e
  ensina errado exatamente a distinção que a prova de certificação concentra

#### Scenario: `kind` inexistente
- **WHEN** um grupo declara `kind: "edge"`
- **THEN** o gate falha com a lista dos quatro valores válidos

---

### Requirement: Cobertura só sobe

O CI DEVE (MUST) registrar a contagem de módulos com diagrama e falhar quando ela cair.
Diagrama removido sem a exceção correspondente declarada é regressão.

#### Scenario: diagrama removido de um módulo
- **WHEN** um commit apaga o único `arch_diagram` de um módulo sem acrescentar a
  exceção com motivo
- **THEN** o CI falha, comparando a contagem atual com a registrada

---

### Requirement: O DSL de autoria valida na geração

Autoria em volume — mais de um punhado de diagramas — DEVE (MUST) usar um DSL que valida
os limites do schema **no momento de gerar**, e não apenas no gate posterior.

A razão é assimétrica: estourar `caption` de 600 caracteres ou `note` de 200 faz o
bloco falhar o Zod, voltar `null` e **desaparecer da página sem erro**. Falhar na
geração é a única chance de descobrir isso antes de o leitor perder conteúdo.

#### Scenario: legenda acima do limite na geração
- **WHEN** um script de geração produz `caption` com 640 caracteres
- **THEN** a geração falha e nenhum seed é escrito

#### Scenario: aresta de passo sem aresta declarada
- **WHEN** um passo referencia `a>b` e o diagrama não declara essa aresta
- **THEN** a geração falha
