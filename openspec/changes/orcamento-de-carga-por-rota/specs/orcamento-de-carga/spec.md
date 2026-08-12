## ADDED Requirements

### Requirement: Rota que não lista nem renderiza artigo não carrega o currículo completo

O bundle do cliente de uma rota que não precisa do catálogo completo NÃO PODE (MUST NOT)
incluir os 490 registros de módulo com `desc`/`keywords`. As rotas de listagem/artigo que
precisam do detalhe o carregam sob demanda.

#### Scenario: rota utilitária sem currículo
- **WHEN** o usuário carrega `/verificar`, `/sobre` ou `/revisar`
- **THEN** o JS baixado não contém o objeto de currículo completo

#### Scenario: índice leve não duplica o completo
- **WHEN** uma rota carrega o índice leve de módulos
- **THEN** ela não carrega também o currículo completo — um ou outro, nunca os dois

### Requirement: A validação de estado não entra no bundle comum

O runtime de validação do `GameState` NÃO PODE (MUST NOT) ser servido em toda rota; ele é
carregado apenas onde o estado é lido ou gravado.

#### Scenario: rota sem leitura de estado
- **WHEN** uma rota que não lê nem grava o `GameState` é carregada
- **THEN** o runtime de validação não está no bundle dela

### Requirement: O gate de bundle mede o total baixado por rota

O gate de tamanho DEVE (MUST) medir a soma dos chunks referenciados por rota (o que o
navegador baixa), não apenas o tamanho de cada arquivo isolado, com teto declarado.

#### Scenario: regressão de baseline
- **WHEN** uma mudança faz o total gzip por rota crítica ultrapassar o teto declarado
- **THEN** o gate falha nomeando a rota e o excesso

#### Scenario: prova negativa
- **WHEN** o currículo completo é reintroduzido no bundle comum por um import transitivo
- **THEN** o gate detecta o crescimento e falha — não passa por medir só arquivos isolados
