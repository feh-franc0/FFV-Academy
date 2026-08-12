## ADDED Requirements

### Requirement: O domínio serve a versão atual

O domínio público DEVE (MUST) servir o container em produção, e não um build estático anterior.

#### Scenario: domínio apontando para o build antigo
- **WHEN** o registro A do domínio raiz aponta para o servidor do build estático de maio
- **THEN** a plataforma está afirmando conteúdo que não serve, e nenhuma outra melhoria
  chega a ninguém

#### Scenario: verificação após a migração
- **WHEN** o domínio é migrado
- **THEN** existe checagem que confirma, no domínio público, que uma rota criada após maio
  responde 200 — provar pela home não distingue os dois servidores

---

### Requirement: O CI prova o empacotamento do contêiner, não só o build

O CI DEVE (MUST) construir a imagem de produção e rodar um teste de fumaça **contra a imagem**,
com o mesmo comando de entrada do ambiente real.

A varredura contra `next start` não satisfaz o requisito: ela lê de `.next/`, e o contêiner
roda o servidor standalone, que depende de `.next/static` e `public` copiados pelo
Dockerfile.

#### Scenario: estático faltando na imagem
- **WHEN** o Dockerfile deixa de copiar `.next/static` e a página carrega sem CSS
- **THEN** o teste de fumaça falha — hoje isso passaria pela varredura inteira

#### Scenario: variável de ambiente ausente no contêiner
- **WHEN** a imagem sobe sem a URL da API
- **THEN** o teste de fumaça falha, em vez de o defeito aparecer no primeiro visitante

#### Scenario: escopo do teste de fumaça
- **WHEN** o teste roda
- **THEN** ele confere home, uma página de módulo **com CSS aplicado**, `/api/health` e um
  recurso estático — e não precisa das 500 rotas, que o build já cobre

---

### Requirement: A verificação de saúde reflete a capacidade de servir

O endpoint de saúde usado pelo orquestrador DEVE (MUST) responder sobre a capacidade de servir
requisição, e o teste de fumaça DEVE confirmar que ele responde dentro da imagem.

#### Scenario: saúde verde com página quebrada
- **WHEN** `/api/health` responde `ok` e a página de módulo sobe sem CSS
- **THEN** o teste de fumaça falha, porque saúde que não distingue esse caso não protege o
  deploy

---

### Requirement: Deploy sem interrupção visível

A troca de versão do frontend NÃO DEVE (MUST NOT) produzir indisponibilidade visível ao usuário.

#### Scenario: contêiner antigo para antes do novo subir
- **WHEN** o deploy substitui o contêiner e há ~5 s sem resposta
- **THEN** existe camada na frente absorvendo a troca, ou o deploy passa a subir o novo
  antes de derrubar o antigo

---

### Requirement: A camada de borda não quebra as garantias já declaradas

Ao introduzir camada de borda, a política de segurança de conteúdo, o cabeçalho que mantém
`/admin` fora do índice e a convenção de URL sem barra final DEVEM (MUST) continuar valendo.

#### Scenario: cabeçalho perdido na borda
- **WHEN** a borda não repassa `X-Robots-Tag` e o `/admin` passa a ser indexável
- **THEN** a configuração é corrigida antes de a borda entrar em produção — o layout do
  admin é componente de cliente e **não pode** exportar `metadata`, então o cabeçalho é a
  única proteção

#### Scenario: canônica com redirect
- **WHEN** a borda passa a redirecionar URL sem barra para com barra
- **THEN** a 12ª checagem da varredura falha, porque a canônica de 427 páginas passaria a
  apontar para uma URL que redireciona
