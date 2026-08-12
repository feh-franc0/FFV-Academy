## ADDED Requirements

### Requirement: Nenhuma página publicada contém marcador de preenchimento

O CI DEVE (MUST) falhar quando qualquer página servida ao público contiver marcador de
preenchimento — `[PREENCHER]`, `TODO`, `XXX`, `lorem ipsum` — no conteúdo visível.

A urgência é de tempo: a página está no repositório e entra no ar junto com o resto no
momento da migração de domínio. O bloqueio precisa existir **antes** disso.

#### Scenario: política com campos vazios
- **WHEN** `/privacidade` contém `[PREENCHER]` no lugar do nome do controlador
- **THEN** o CI falha e a página não vai ao ar

#### Scenario: marcador em comentário de código
- **WHEN** o marcador está em comentário que não chega ao HTML
- **THEN** não reprova: a regra é sobre conteúdo visível ao usuário

---

### Requirement: A política identifica o controlador e o encarregado

A política DEVE (MUST) identificar quem controla os dados, sob que entidade legal, e o canal para
o titular exercer seus direitos.

Sem isso o titular não tem a quem dirigir pedido de acesso, correção ou exclusão, que é a
função da identificação.

#### Scenario: canal de contato ausente
- **WHEN** a política descreve direitos e não informa nenhum canal para exercê-los
- **THEN** é considerada incompleta

---

### Requirement: A política declara o que é coletado e por quê

Cada categoria de dado coletada DEVE (MUST) aparecer na política com a finalidade e a base.

O levantamento mínimo do que a plataforma coleta hoje: e-mail e telefone no login por link
mágico; progresso de estudo, XP, streak e respostas de quiz sincronizados com o backend;
apelido e posição exibidos em ranking público; e métrica de uso sem cookies pela análise.

#### Scenario: categoria coletada e não declarada
- **WHEN** a plataforma sincroniza respostas de quiz e a política não menciona esse dado
- **THEN** a política é corrigida

#### Scenario: ranking público
- **WHEN** o ranking exibe apelido e posição
- **THEN** a política declara que essa exibição é pública e como o titular sai dela

---

### Requirement: O que sobrevive à exclusão está escrito antes do primeiro pedido

A política DEVE (MUST) declarar, por categoria, o que é apagado no pedido de exclusão, o que
permanece em forma agregada e sem identificação, e o que permanece por obrigação legal —
com o prazo de cada caso.

#### Scenario: pedido de exclusão
- **WHEN** um titular pede exclusão da conta
- **THEN** dado identificável é apagado, a entrada no ranking público deixa de identificá-lo,
  e o que permanece está declarado na política

#### Scenario: estatística agregada
- **WHEN** contagens agregadas por módulo incluíam a atividade do titular
- **THEN** a contagem permanece, porque não o identifica — e a política diz isso

#### Scenario: pedido durante processo com obrigação legal
- **WHEN** existe registro que a lei obriga a manter
- **THEN** ele permanece pelo prazo legal, e o titular é informado de qual registro e por
  quanto tempo

---

### Requirement: Dado pessoal não vai para log

Log de aplicação NÃO DEVE (MUST NOT) conter e-mail, telefone, documento nem conteúdo de resposta que
identifique o titular.

#### Scenario: identificador em log de erro
- **WHEN** uma exceção serializa o objeto de usuário inteiro para o log
- **THEN** os campos identificáveis são removidos antes da escrita

---

### Requirement: O titular exerce os direitos pela própria interface

DEVE (MUST) existir caminho na interface para o titular ver o que a plataforma guarda sobre ele,
exportar, e pedir exclusão — sem depender de troca de e-mail.

#### Scenario: pedido por canal único
- **WHEN** o único caminho é escrever para um endereço de e-mail
- **THEN** é insuficiente para a plataforma que já tem conta, sessão e sincronização
