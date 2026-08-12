## ADDED Requirements

### Requirement: A explicação trata cada distrator pelo nome do erro

A explicação de uma questão DEVE (MUST) dizer por que a alternativa correta é correta, com o
mecanismo, e **por que cada distrator falha**, nomeando a concepção errada que levaria
alguém a escolhê-lo.

A parte que trata os distratores é a que mais ensina: quem erra escolheu por um motivo, e
nomear o motivo é o que corrige o modelo mental.

#### Scenario: explicação em parágrafo achatado
- **WHEN** uma questão traz a explicação como texto corrido, sem separar os distratores
- **THEN** o gate falha — é o estado atual das 75 questões do catálogo

#### Scenario: distrator sem tratamento
- **WHEN** a explicação justifica a correta e ignora duas das três alternativas erradas
- **THEN** o gate falha nomeando quais ficaram sem tratamento

#### Scenario: explicação que nomeia o erro
- **WHEN** a explicação diz "Multi-AZ mantém um standby síncrono que NÃO serve tráfego. A
  confusão que a questão testa é acreditar que o standby atende leitura: ele não atende,
  em nenhuma circunstância."
- **THEN** o gate passa

---

### Requirement: A forma da explicação é a mesma nas duas fontes

Questão vinda do banco e questão vinda do catálogo estático DEVEM chegar ao componente de
estudo na **mesma forma**. O componente NÃO DEVE (MUST NOT) ter caminho de renderização diferente por
origem.

#### Scenario: duas formas no mesmo componente
- **WHEN** o componente ramifica entre explicação estruturada e texto corrido conforme a
  origem
- **THEN** a divergência é eliminada na origem, não acomodada no componente — acomodar é o
  que deixou 75 questões para trás

---

### Requirement: A regra generalizável fecha a explicação, quando houver

Quando a questão tiver uma regra transferível, a explicação DEVE (MUST) terminar nela — a frase
que o aluno leva para a próxima questão diferente.

#### Scenario: regra ausente onde existe
- **WHEN** a questão trata de uma escolha que se repete em cenários variados e a explicação
  para no caso concreto
- **THEN** a revisão pede a regra generalizável

---

### Requirement: Código morto que sugere caminho inexistente é removido

Função de conversão não chamada por ninguém, que devolveria nulo para todo o conteúdo
existente e carrega marcadores de revisão, DEVE (MUST) ser removida em vez de mantida.

Manter custa mais que apagar: quem abre o arquivo acredita que existe conversão automática
e não faz a migração real.

#### Scenario: função de conversão órfã
- **WHEN** `parseExplanationString` não é chamada em nenhum arquivo e devolveria nulo para
  as 75 questões
- **THEN** ela é apagada junto com os marcadores `TODO_REVIEW`

#### Scenario: suspeita de vazamento de marcador
- **WHEN** alguém suspeita que `TODO_REVIEW` chega ao aluno
- **THEN** fica registrado que **não chega**, porque a função nunca executa — a medição
  contradisse o diagnóstico inicial, e o registro impede que a suspeita volte

---

### Requirement: Cobertura de explicação rica é medida e só sobe

O CI DEVE (MUST) relatar quantas questões, de todas as fontes, têm explicação com tratamento por
distrator, e falhar quando o número cair.

#### Scenario: questão nova sem tratamento
- **WHEN** uma questão é acrescentada ao catálogo com explicação em texto corrido
- **THEN** o CI falha no commit em que ela entra
