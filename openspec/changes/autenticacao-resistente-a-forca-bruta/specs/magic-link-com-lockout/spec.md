## ADDED Requirements

### Requirement: Verificação de magic-link tem lockout por tentativas

O fluxo de verificação DEVE (MUST) contar tentativas por email e recusar após um teto dentro do TTL do token,
mesmo quando o código eventualmente apresentado está correto.

#### Scenario: excesso de tentativas erradas
- **WHEN** o mesmo email recebe 5 tentativas de verificação com código errado dentro do TTL
- **THEN** a 6ª tentativa é recusada com erro de rate-limit, independentemente do código enviado

#### Scenario: código correto de primeira
- **WHEN** o usuário envia o código correto na primeira tentativa
- **THEN** a verificação é aceita normalmente

#### Scenario: contador é compartilhado entre pedir código e verificar
- **WHEN** o usuário pede um código novo e depois tenta verificar, dentro da mesma janela de 10 minutos
- **THEN** as duas ações somam para o MESMO teto por email — pedir um código novo não reseta tentativas de verificação já contadas
