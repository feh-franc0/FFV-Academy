## ADDED Requirements

### Requirement: Todo laboratório apresenta três arquiteturas

Cada laboratório DEVE (MUST) apresentar a arquitetura **mínima** (didática e implantável), a
**recomendada para produção**, e a **evolução em níveis**. As três são o objeto de
ensino: o que separa quem monta de quem arquiteta é saber quando a solução precisa
mudar.

A mínima e a de produção DEVEM ter topologias diferentes. Se são iguais, uma das duas
está errada.

Toda peça presente na arquitetura de produção e ausente na mínima DEVE rastrear a um
requisito não funcional declarado no próprio módulo. Peça sem requisito que a justifique
é adorno, e adorno em arquitetura custa dinheiro e superfície de falha.

#### Scenario: arquitetura mínima já com todos os controles
- **WHEN** a arquitetura mínima de um laboratório traz Multi-AZ, WAF, KMS e trace
  distribuído
- **THEN** o laboratório é recusado na revisão: o leitor não consegue ver o que cada
  peça resolve, que é a razão de existirem duas arquiteturas

#### Scenario: peça de produção sem requisito
- **WHEN** a arquitetura de produção acrescenta um componente e nenhum requisito não
  funcional do módulo o exige
- **THEN** o componente é removido ou o requisito é declarado — não existe terceira
  saída

#### Scenario: as duas topologias são iguais
- **WHEN** os dois `arch_diagram` do módulo declaram os mesmos grupos, nós e arestas
- **THEN** o gate falha

---

### Requirement: Entregável verificável por laboratório

Cada laboratório DEVE (MUST) declarar um entregável que outra pessoa possa conferir olhando o
ambiente construído. "Entendeu o conceito" não é entregável.

#### Scenario: entregável mensurável
- **WHEN** o laboratório declara "restauração cronometrada, com RTO e RPO medidos" ou
  "policy derivada do uso real, com o `*` removido e nada quebrado"
- **THEN** o entregável é aceito

#### Scenario: entregável vago
- **WHEN** o laboratório declara "aprendeu a usar o serviço" ou "entende a diferença"
- **THEN** o entregável é recusado

---

### Requirement: Seção de limpeza com o que o destroy não leva

Todo laboratório DEVE (MUST) ter seção de limpeza com os comandos na ordem correta, e DEVE
nomear explicitamente os recursos que sobrevivem a um `terraform destroy` bem-sucedido
e continuam cobrando.

A lista mínima a considerar: snapshot final, log group sem retenção, imagem em
repositório, Elastic IP não associado, chave de KMS em espera de exclusão, bucket com
objeto, endpoint, secret e réplica.

#### Scenario: recurso criado sem aparecer na limpeza
- **WHEN** o laboratório provisiona um recurso que gera cobrança e a seção de limpeza
  não o menciona
- **THEN** o laboratório é recusado

#### Scenario: destroy tratado como prova de conta limpa
- **WHEN** a seção de limpeza termina em `terraform destroy` sem nomear o que fica
- **THEN** o laboratório é recusado: destroy bem-sucedido não é prova de conta limpa

---

### Requirement: IA entra apenas onde IA resolve

A extensão com IA DEVE (MUST) ser condicional. Onde IA agrega, o módulo DEVE dizer qual
problema ela resolve, **por que uma regra tradicional não resolveria**, de onde vem o
dado, e o que acontece quando ela erra.

Onde IA não agrega, o módulo DEVE dizer isso em uma frase e apontar o laboratório da
banda 9 ou 10 que trata do assunto.

#### Scenario: IA decorativa
- **WHEN** um laboratório de rede ou de custo propõe "usar IA para prever tráfego" sem
  comparar com a métrica observada que o autoscaling já usa
- **THEN** a seção é recusada — é o hype que a plataforma existe para não vender

#### Scenario: ausência de IA declarada
- **WHEN** um laboratório de fundamentos declara que IA não acrescenta nada ao caso e
  aponta o laboratório da banda 9 correspondente
- **THEN** a seção é aceita

---

### Requirement: Número no título, nunca no slug

O título DEVE (MUST) conter o número do laboratório (`Lab 07 — …`) e o slug NÃO DEVE conter
número.

Renumerar o catálogo é previsível: inserir um laboratório numa banda empurra os
seguintes. Número no slug transforma reordenação em URL quebrada, redirect e perda de
posição orgânica.

#### Scenario: slug numerado
- **WHEN** um módulo novo usa o slug `lab-07-vpc-endpoints`
- **THEN** é recusado; a forma correta é `lab-vpc-endpoints-sem-nat`

---

### Requirement: A trilha declara apenas o que tem conteúdo

A trilha DEVE (MUST) declarar somente módulos que já possuem seed. Slug declarado sem seed é
URL anunciada no sitemap que responde 404.

#### Scenario: slug declarado antes do conteúdo
- **WHEN** os 99 slugs restantes são declarados na trilha de uma vez, antes dos seeds
- **THEN** `check-curriculum-seed-drift.mjs --strict` falha, e o sitemap anunciaria 99
  páginas inexistentes

---

### Requirement: Cada laboratório reaproveita o entregável do anterior

A série DEVE (MUST) ser encadeada: as dependências declaradas no catálogo são reais, e um
laboratório consome o entregável dos seus pré-requisitos em vez de reconstruir o
ambiente do zero.

#### Scenario: dependência declarada e não usada
- **WHEN** um laboratório declara depender de `L01` e provisiona a própria VPC,
  aplicação e banco do zero
- **THEN** ou a dependência é removida do catálogo, ou o laboratório passa a partir do
  ambiente existente

---

### Requirement: Banda 9 e 10 citam o catálogo de soluções

Laboratório das bandas 9 e 10 que implementa uma solução do catálogo de IA DEVE (MUST) citar o
identificador `S##` correspondente, em vez de reescrever a topologia.

A razão é operacional: os 100 diagramas daquela trilha são gerados do catálogo, e
duplicar a topologia cria duas fontes que divergem sem ninguém notar.

#### Scenario: laboratório que reimplementa uma solução sem citar
- **WHEN** um laboratório da banda 10 descreve a arquitetura de atendimento com voz sem
  referenciar `S1` e `S2`
- **THEN** a linha do catálogo é corrigida para citar, e o módulo aponta para a trilha
  das 100 arquiteturas
