## ADDED Requirements

### Requirement: `updated_at` muda somente quando o conteúdo muda

O importador DEVE (MUST) calcular um hash do conteúdo de cada artigo e escrever `updated_at`
apenas quando o hash difere do armazenado. Importação de conteúdo idêntico NÃO DEVE
tocar a coluna.

#### Scenario: reimportação sem alteração
- **WHEN** o importador roda duas vezes sobre os mesmos seeds, sem edição entre elas
- **THEN** nenhum `updated_at` muda, e o importador relata zero artigos atualizados

#### Scenario: um bloco editado
- **WHEN** um parágrafo de um artigo é reescrito e o importador roda
- **THEN** apenas aquele artigo tem `updated_at` e hash atualizados

#### Scenario: artigo novo
- **WHEN** um seed novo é importado
- **THEN** hash e `updated_at` são gravados na primeira vez

---

### Requirement: O hash é do conteúdo normalizado, não do arquivo

O hash DEVE (MUST) ser calculado sobre a representação **normalizada** dos blocos — ordem de
chaves estável, espaçamento irrelevante descartado — e não sobre os bytes do arquivo.

A razão é o modo de falha: hash do arquivo bruto faz qualquer reformatação de JSON marcar
os 427 artigos como alterados no mesmo instante, e o buscador recebe exatamente o sinal
uniforme que motivou a remoção do `lastmod`.

#### Scenario: JSON reformatado sem mudança de conteúdo
- **WHEN** os seeds são reescritos com indentação diferente ou ordem de chaves diferente,
  sem alteração de texto
- **THEN** nenhum hash muda

#### Scenario: campo irrelevante ao leitor
- **WHEN** apenas o `id` interno de um bloco muda, sem alterar conteúdo visível
- **THEN** o hash não muda — `id` é identificador, não conteúdo

---

### Requirement: `lastmod` no sitemap só onde existe data real

O sitemap DEVE (MUST) emitir `lastmod` apenas para URLs cujo conteúdo tem data verdadeira — as
de artigo, lidas de `updated_at`. Página estática, hub, trilha, tema e simulado NÃO DEVEM
emitir `lastmod`.

#### Scenario: URL de artigo
- **WHEN** o sitemap é gerado e o artigo tem `updated_at`
- **THEN** a URL sai com `lastmod` igual a essa data

#### Scenario: URL de hub
- **WHEN** o sitemap é gerado para um hub, cujo conteúdo é derivado do currículo e não
  tem data própria
- **THEN** a URL sai **sem** `lastmod`

#### Scenario: data do build como aproximação
- **WHEN** alguém propõe usar a data do build para as URLs sem data real
- **THEN** é recusado: foi o que fez o Google ignorar o campo, e está registrado no
  comentário de `sitemap.ts`

---

### Requirement: `lastmod` uniforme continua reprovando

O CI DEVE (MUST) falhar quando o sitemap emite `lastmod` com o mesmo valor em todas as URLs que
o declaram. O gate deixa de exigir ausência e passa a exigir **distinção**.

#### Scenario: todas as datas iguais
- **WHEN** todas as URLs de artigo saem com a mesma data
- **THEN** a varredura falha, porque o sinal é indistinguível do que existia antes

#### Scenario: datas distribuídas
- **WHEN** as URLs de artigo saem com datas diferentes, refletindo edições reais
- **THEN** a varredura passa

#### Scenario: nenhuma URL declara lastmod
- **WHEN** o campo está ausente em todo o sitemap
- **THEN** a varredura passa: ausência continua sendo estado válido, e é o estado atual

---

### Requirement: O fallback de seeds não inventa data

Quando o frontend serve conteúdo pelo fallback de seeds — sem backend alcançável — ele
NÃO DEVE (MUST NOT) emitir `lastmod`, porque o seed não carrega data.

#### Scenario: build sem backend
- **WHEN** o build roda sem backend alcançável e usa o fallback de seeds
- **THEN** o sitemap sai sem `lastmod` em vez de sair com a data do build
