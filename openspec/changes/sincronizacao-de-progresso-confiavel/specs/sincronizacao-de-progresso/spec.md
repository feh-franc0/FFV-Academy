## ADDED Requirements

### Requirement: O push lê o estado no mesmo formato que a engine grava

A camada de sincronização DEVE (MUST) ler o `GameState` local no exato formato em que a
engine o persiste (LZ-string comprimido), descomprimindo antes de validar. Ler com
`JSON.parse` cru um estado comprimido é o defeito que este requisito impede.

#### Scenario: estado comprimido pela engine é enviado
- **WHEN** a engine grava o estado comprimido e uma mutação dispara o push
- **THEN** `readLocalState` descomprime, valida e o push chega ao servidor com o estado real

#### Scenario: o teste semeia pela engine
- **WHEN** o teste de integração de sync prepara o estado local
- **THEN** ele usa o caminho de escrita da engine, não um literal JSON — para o teste falhar se o formato divergir de novo

### Requirement: Login não destrói progresso anônimo

Ao autenticar, o sistema NÃO PODE (MUST NOT) sobrescrever um progresso local não vazio com
um snapshot do servidor mais antigo ou vazio.

#### Scenario: anônimo com progresso, servidor vazio
- **WHEN** um usuário anônimo com XP/streak local cria conta e o servidor não tem snapshot
- **THEN** o progresso local é preservado e enviado, não apagado

#### Scenario: conflito real por data
- **WHEN** local e servidor têm snapshots com datas diferentes
- **THEN** vence o mais recente por `updatedAt` verdadeiro, e o banner nunca promete uma sincronização que não ocorreu

### Requirement: Falha de sync é observável e reenfileirável

Uma falha de push NÃO PODE (MUST NOT) ser silenciosa; o cliente DEVE (MUST) reenfileirar e
tentar de novo quando a conectividade voltar.

#### Scenario: push falha offline
- **WHEN** o push falha por rede
- **THEN** o estado é reenfileirado e reenviado ao voltar `online`, e a falha é reportada ao error tracking

#### Scenario: schema desalinhado
- **WHEN** um campo novo do `GameState` não está espelhado no schema de validação
- **THEN** um teste de contrato falha apontando o campo — em vez de o push morrer em silêncio em produção

### Requirement: schemaVersion enviado corresponde à engine

O `schemaVersion` gravado no snapshot da nuvem DEVE (MUST) ser o mesmo que a engine usa.

#### Scenario: versão coerente no servidor
- **WHEN** o cliente envia o snapshot
- **THEN** o `schemaVersion` é o da engine, permitindo migração server-side futura

### Requirement: Certificados e tentativas não se perdem ao limpar o navegador

Certificados emitidos e tentativas DEVEM (MUST) ou entrar no snapshot sincronizado, ou o
produto DEVE (MUST) declarar explicitamente na UI que são locais e some ao limpar o navegador.

#### Scenario: certificado sobrevive à troca de dispositivo
- **WHEN** o usuário emite um certificado e acessa de outro dispositivo autenticado
- **THEN** o certificado está disponível — ou a UI avisou, no momento da emissão, que ele é só local
