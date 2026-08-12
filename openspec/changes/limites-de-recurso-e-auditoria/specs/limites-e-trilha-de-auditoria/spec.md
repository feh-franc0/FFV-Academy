## ADDED Requirements

### Requirement: Rate-limiters em rotas sensíveis a enumeração são fail-closed

Rotas onde falha do rate-limiter significaria expor um oráculo de enumeração DEVEM (MUST) recusar a requisição
quando o backing store (Redis) está indisponível, em vez de servir sem limite.

#### Scenario: Redis indisponível na verificação de certificado
- **WHEN** o Redis está fora do ar e um request chega em `GET /api/v1/certificates/{hash}`
- **THEN** a resposta é 503, não um 200 sem limite de taxa

### Requirement: Cabeçalho de correlação fornecido pelo cliente é validado

`X-Request-ID` fornecido pelo cliente DEVE (MUST) ser validado antes de propagar para logs e auditoria; um
valor fora do formato esperado NÃO PODE (MUST NOT) ser gravado cru.

#### Scenario: X-Request-ID malicioso
- **WHEN** um cliente envia `X-Request-ID` contendo quebra de linha ou caracteres de controle
- **THEN** o valor é descartado e um ID gerado no servidor é usado no log e na auditoria

### Requirement: Falhas de autenticação geram trilha de auditoria

Tentativas de login que falham DEVEM (MUST) gerar uma linha de auditoria, não só mutações bem-sucedidas.

#### Scenario: tentativa de login falha
- **WHEN** uma verificação de magic-link falha (código errado ou expirado)
- **THEN** uma linha de auditoria é gravada com o resultado da falha
