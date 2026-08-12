## ADDED Requirements

### Requirement: Gabarito nunca é servido a quem tem prova ativa no mesmo simulado

Enquanto o usuário tiver uma tentativa **ativa** (não finalizada) de um simulado, nenhuma rota autenticada
DEVE (MUST) devolver `correctId` ou explicação para questões desse simulado, independentemente de qual rota
for chamada.

#### Scenario: chamar study/random durante prova ativa
- **WHEN** o usuário tem uma tentativa ativa do simulado X e chama `GET /simulados/X/study/random`
- **THEN** a resposta não contém `correctId` nem `explanation`

#### Scenario: chamar questions/batch com IDs da tentativa ativa
- **WHEN** o usuário tem uma tentativa ativa do simulado X e chama `questions/batch?ids=<ids da própria tentativa>`
- **THEN** a resposta não contém `correctId` nem `explanation` para esses IDs

#### Scenario: estudo livre sem tentativa ativa continua com gabarito
- **WHEN** o usuário não tem nenhuma tentativa ativa do simulado
- **THEN** `study/random` e `questions` continuam retornando `correctId` e explicação normalmente (comportamento de estudo livre, sem paywall)

### Requirement: questions/batch exige ownership por tentativa finalizada

`questions/batch` DEVE (MUST) revelar gabarito para um ID de questão somente se esse ID pertencer a uma
tentativa **finalizada do próprio usuário autenticado**.

#### Scenario: IDs de tentativa finalizada do próprio usuário
- **WHEN** o usuário finalizou uma tentativa do simulado X e pede `questions/batch?ids=<question_ids dessa tentativa>`
- **THEN** a resposta inclui gabarito para esses IDs

#### Scenario: IDs sem tentativa finalizada correspondente
- **WHEN** o usuário pede `questions/batch?ids=<IDs que não pertencem a nenhuma tentativa finalizada sua>`
- **THEN** a resposta recusa (403) ou omite gabarito para esses IDs
