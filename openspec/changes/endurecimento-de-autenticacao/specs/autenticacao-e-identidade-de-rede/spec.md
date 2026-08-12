## ADDED Requirements

### Requirement: O bypass de desenvolvimento nunca é ligado por default

O login sem token real (código fixo de desenvolvimento) DEVE (MUST) exigir uma flag dedicada
com default `false`, e o startup DEVE (MUST) falhar se essa flag for `true` fora de
`APP_ENV=development`. O valor default de qualquer variável de ambiente NÃO PODE (MUST NOT)
resultar em bypass de autenticação.

#### Scenario: env ausente não abre a porta
- **WHEN** o serviço sobe sem `AUTH_DEV_BYPASS_ENABLED` e sem `APP_ENV` definidos
- **THEN** o bypass está desligado e o código fixo não autentica ninguém

#### Scenario: bypass ligado em produção falha o boot
- **WHEN** `AUTH_DEV_BYPASS_ENABLED=true` com `APP_ENV=production`
- **THEN** o serviço recusa iniciar com erro explícito

#### Scenario: bypass legítimo em dev
- **WHEN** `AUTH_DEV_BYPASS_ENABLED=true` e `APP_ENV=development`
- **THEN** o bypass funciona apenas nesse ambiente

### Requirement: A identidade de rede usada para rate-limit e auditoria não é forjável

O IP usado para rate-limit e para o registro de auditoria DEVE (MUST) vir de uma fonte que o
cliente não controla — o `X-Forwarded-For` bruto do cliente NÃO PODE (MUST NOT) ser a chave.

#### Scenario: XFF forjado não zera o contador
- **WHEN** o cliente envia `X-Forwarded-For` arbitrário e variável a cada request
- **THEN** o rate-limit continua contando pela identidade real e aplica 429 ao ultrapassar

#### Scenario: IP de auditoria é o real
- **WHEN** uma ação autenticada é registrada em `audit_logs`
- **THEN** o IP gravado é o que o proxy confiável determinou, não o header do cliente

### Requirement: Falha do Redis não desliga as defesas das rotas de custo

Em erro do Redis, as rotas de custo (autenticação, tutor) DEVEM (MUST) falhar fechadas.

#### Scenario: Redis fora nas rotas de auth
- **WHEN** o Redis está indisponível e chega uma requisição a uma rota de auth
- **THEN** a requisição é recusada (fail-closed), não liberada sem limite

### Requirement: Um palpite errado de código não inutiliza o código correto

Digitar um código errado NÃO PODE (MUST NOT) apagar o token válido pendente, e a UI DEVE (MUST)
oferecer reenviar código.

#### Scenario: código errado seguido do certo
- **WHEN** o usuário erra um dígito e em seguida digita o código correto
- **THEN** o código correto ainda é aceito

#### Scenario: reenviar código
- **WHEN** o usuário não tem mais o código válido
- **THEN** o modal oferece reenviar um novo código

### Requirement: A resposta de solicitação de token não revela se o e-mail tem conta

O endpoint público de solicitação de token NÃO PODE (MUST NOT) expor se o e-mail já é
cadastrado.

#### Scenario: resposta uniforme
- **WHEN** um e-mail cadastrado e um não cadastrado solicitam token
- **THEN** as respostas são indistinguíveis para quem observa de fora

### Requirement: Reuso de refresh token revogado invalida a família

Reapresentar um refresh token já revogado DEVE (MUST) invalidar toda a família de tokens do
usuário, tratando o evento como possível roubo.

#### Scenario: token revogado reaparece
- **WHEN** um refresh token já rotacionado/revogado é reapresentado
- **THEN** a sessão inteira daquele usuário é invalidada e o acesso exige novo login
