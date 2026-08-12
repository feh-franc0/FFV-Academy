## ADDED Requirements

### Requirement: Formato novo entra com demanda medida

Página de comparação, de definição ou de pergunta DEVE (MUST) existir apenas para consulta com
demanda registrada no corpus medido. Criar por intuição é o caminho para página fina em
volume, que é o modo de falha desta estratégia.

#### Scenario: comparação sem demanda
- **WHEN** alguém propõe uma página comparando duas ferramentas que não aparecem no corpus
- **THEN** a proposta é recusada, ou a demanda é medida antes

#### Scenario: termo de glossário com demanda
- **WHEN** um termo aparece no corpus como consulta de definição
- **THEN** ele é elegível a URL própria

#### Scenario: todo o glossário promovido de uma vez
- **WHEN** se propõe criar URL para os 300 termos
- **THEN** é recusado: só os termos com demanda medida, porque 300 páginas finas
  prejudicam mais que ajudam

---

### Requirement: Página de comparação declara o critério antes do veredito

Toda comparação DEVE (MUST) declarar o critério de avaliação antes de apresentar conclusão, e DEVE
dizer **para quem** cada opção serve, em vez de eleger vencedor absoluto.

#### Scenario: veredito sem critério
- **WHEN** a página abre afirmando qual opção é melhor sem dizer sob qual critério
- **THEN** é recusada: é opinião com aparência de análise

#### Scenario: comparação com contexto
- **WHEN** a página diz "para quem tem restrição de latência, A; para quem tem restrição de
  custo por token, B", com o número que sustenta cada frase
- **THEN** é aceita

#### Scenario: afirmação sem medição
- **WHEN** a comparação afirma diferença de desempenho sem número nem fonte
- **THEN** a afirmação é removida ou medida

---

### Requirement: A definição é resposta citável

Página de definição DEVE (MUST) começar pela conclusão, na primeira frase, e a resposta DEVE se
sustentar fora da página.

É o mesmo contrato que já vale para `Perguntas frequentes` em 427 módulos: a pergunta é o
que a pessoa digita, e a resposta começa pela conclusão porque é o primeiro trecho que um
resumo de IA extrai.

#### Scenario: definição que abre em preâmbulo
- **WHEN** a página começa com "Antes de entender RRF, vale lembrar que…"
- **THEN** o gate falha: o preâmbulo é o que aparece citado, não a resposta

#### Scenario: definição que aponta para outro lugar
- **WHEN** a resposta é "veja o módulo de busca híbrida"
- **THEN** o gate falha: quem cita não segue link

---

### Requirement: Tema ganha página quando cruza o limiar, e não antes

Página de tema DEVE (MUST) existir apenas quando o tema tiver ao menos três módulos. Abaixo disso
o tema aparece na listagem com a contagem à vista.

#### Scenario: tema com dois módulos
- **WHEN** o tema de carreira tem 2 módulos
- **THEN** ele não ganha página, e a listagem mostra a contagem em vez de prometer conteúdo

#### Scenario: tema cruza o limiar
- **WHEN** o terceiro módulo do tema entra
- **THEN** o mapa é regerado e a página passa a existir — e regerar o mapa também regera o
  corpus e a fila de perguntas, porque é o mesmo script

---

### Requirement: Rota nova entra nos inventários no mesmo commit

Rota nova DEVE (MUST) ser acrescentada, no commit em que nasce, à tabela de tetos de
acessibilidade e ao que mais enumere rotas explicitamente.

A razão é medida: a lista de tetos é explícita, e rota que não está nela **escapa da
auditoria sem sintoma**.

#### Scenario: rota nova fora da tabela de tetos
- **WHEN** uma página de comparação é criada e não entra na tabela
- **THEN** ela nunca é auditada por acessibilidade, e ninguém percebe

#### Scenario: rota nova no sitemap
- **WHEN** a rota entra no sitemap
- **THEN** a checagem de cartão social e canônica passa a cobri-la automaticamente, porque
  essa varre toda URL do sitemap

---

### Requirement: Formato novo obedece aos contratos já existentes

Página de formato novo DEVE (MUST) obedecer aos contratos já verificados na plataforma: descrição
de SEO entre 70 e 165 caracteres em forma de frase, canônica declarada, cartão social pelo
utilitário compartilhado, piso de substância, e nenhum bloco com título e conteúdo vazio.

#### Scenario: descrição em salada de palavra-chave
- **WHEN** a descrição da página nova é uma lista de termos separados por espaço
- **THEN** o gate de descrição falha — foi assim que 297 descrições passaram pelo piso
  antigo de 40 caracteres

#### Scenario: cartão social escrito à mão
- **WHEN** a página declara `openGraph` sem `images`
- **THEN** o gate falha, porque `openGraph` de página **substitui** o do layout e a imagem
  herdada se perde
