## ADDED Requirements

### Requirement: Pergunta livre é ancorada no módulo aberto

`POST /api/v1/tutor/ask` DEVE (MUST) receber a pergunta e o identificador do módulo em que o
leitor está, e responder com base no conteúdo daquele módulo.

#### Scenario: pergunta sobre o módulo aberto
- **WHEN** o leitor pergunta "por que o standby não serve leitura?" dentro de um módulo
  que trata de Multi-AZ
- **THEN** a resposta usa o conteúdo do módulo e cita a parte que a sustenta

#### Scenario: pergunta fora do escopo do módulo
- **WHEN** a pergunta não tem relação com o módulo aberto
- **THEN** a resposta diz isso e aponta o módulo da plataforma que trata do assunto, em
  vez de responder de memória sem fonte

---

### Requirement: Limite de uso por identidade

O endpoint DEVE (MUST) aplicar limite de requisições por usuário autenticado e por origem
anônima. Chamada a modelo sem limite é vetor de gasto, e a plataforma é gratuita.

#### Scenario: limite excedido
- **WHEN** um usuário passa do limite na janela
- **THEN** a resposta é 429 com o tempo de espera, e a interface mostra isso em vez de
  falhar em silêncio

#### Scenario: origem anônima
- **WHEN** a pergunta vem sem autenticação
- **THEN** o limite é mais estrito que o do usuário autenticado

---

### Requirement: A resposta não inventa fonte

A resposta NÃO DEVE (MUST NOT) citar módulo, trilha ou documento que não exista, nem atribuir ao
conteúdo da plataforma afirmação que não está nele.

#### Scenario: citação de módulo inexistente
- **WHEN** a resposta aponta para um slug que não existe no currículo
- **THEN** a citação é removida antes de a resposta chegar ao leitor, e o caso é
  registrado

---

### Requirement: Injeção pelo conteúdo do módulo é tratada

O conteúdo do módulo entra no contexto como **dado**, não como instrução. Texto dentro de
um bloco que tente redirecionar o comportamento do tutor NÃO DEVE (MUST NOT) ser obedecido.

#### Scenario: instrução embutida em bloco de código
- **WHEN** um bloco de código do módulo contém texto no formato de instrução ao modelo
- **THEN** o tutor o trata como conteúdo do artigo e responde sobre ele, sem executá-lo
  como comando

---

### Requirement: Custo por resposta é observável

Cada chamada DEVE (MUST) registrar tokens de entrada e de saída, latência e o módulo de origem,
para que o custo por resposta e por módulo seja mensurável.

#### Scenario: pico de custo
- **WHEN** o custo diário passa de um limiar declarado
- **THEN** existe alarme, e o registro permite dizer qual módulo concentra as perguntas
