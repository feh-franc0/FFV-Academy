## ADDED Requirements

### Requirement: Segredo de feature ligada é obrigatório no startup

Quando uma feature que depende de segredo está ligada, o startup DEVE (MUST) falhar se o
segredo estiver ausente. Um segredo de pagamento vazio NÃO PODE (MUST NOT) resultar em
verificação de assinatura que aceita qualquer coisa.

#### Scenario: billing ligado sem segredo
- **WHEN** o billing está habilitado e `STRIPE_WEBHOOK_SECRET`/`STRIPE_SECRET_KEY` estão vazios
- **THEN** o serviço recusa iniciar com erro nomeando a var faltante

#### Scenario: tutor ligado sem chave
- **WHEN** o tutor está habilitado e a chave da Anthropic está ausente
- **THEN** o boot falha explicitamente

### Requirement: Conteúdo não publicado não é servido publicamente

As rotas públicas de currículo DEVEM (MUST) filtrar `published = TRUE`; rascunhos só são
acessíveis por caminho administrativo autenticado.

#### Scenario: rascunho por slug adivinhado
- **WHEN** um usuário anônimo pede um slug de artigo não publicado
- **THEN** a rota pública responde como inexistente, não devolve o rascunho

### Requirement: Ranking respeita opt-in e não expõe identidade sem consentimento

Todo ranking público DEVE (MUST) aplicar o mesmo filtro de opt-in e soft-delete, e endpoints
autenticados NÃO PODEM (MUST NOT) devolver identificadores de terceiros que a versão pública
anonimiza.

#### Scenario: ranking de trilha sem opt-in
- **WHEN** um usuário sem opt-in aparece na consulta de ranking de trilha
- **THEN** ele não é exibido, ou é anonimizado — igual aos rankings semanal/período

#### Scenario: leaderboard autenticado
- **WHEN** um usuário autenticado lê o leaderboard
- **THEN** os `userId` de terceiros vêm anonimizados, como na versão pública

### Requirement: Endpoints operacionais não vazam infraestrutura nem ficam abertos

`/readyz` NÃO PODE (MUST NOT) devolver detalhe interno (host, porta, DSN) no corpo, e
`/metrics` DEVE (MUST) ser restrito à rede interna.

#### Scenario: readyz com dependência fora
- **WHEN** o Postgres ou o Redis estão fora e alguém chama `/readyz`
- **THEN** o corpo diz apenas "unhealthy" e o detalhe vai para o log

#### Scenario: metrics da internet
- **WHEN** um cliente externo tenta `GET /metrics`
- **THEN** o proxy nega o acesso

### Requirement: Respostas de erro e cabeçalhos não vazam camada nem quebram cache

Um 4xx NÃO PODE (MUST NOT) devolver a cadeia interna de erros ao cliente, e respostas com CORS
por origem refletida DEVEM (MUST) emitir `Vary: Origin`.

#### Scenario: 401 com contexto interno
- **WHEN** um use case falha e retorna 4xx
- **THEN** o cliente recebe uma mensagem estável e o detalhe encadeado fica só no log

#### Scenario: cache e origem
- **WHEN** uma resposta reflete a origem no `Access-Control-Allow-Origin` e é cacheável
- **THEN** ela inclui `Vary: Origin` e só envia `Allow-Credentials` quando a origem casa

### Requirement: Identificadores sensíveis não ficam em claro em armazenamento operacional

A chave do token mágico no Redis NÃO PODE (MUST NOT) conter o e-mail em claro, e o servidor
web NÃO PODE (MUST NOT) anunciar sua versão exata.

#### Scenario: dump do Redis
- **WHEN** as chaves do Redis são listadas
- **THEN** nenhuma contém o e-mail em claro (usa hash)

#### Scenario: banner do servidor
- **WHEN** um cliente inspeciona os cabeçalhos de resposta do proxy
- **THEN** a versão exata do nginx/SO não é revelada
