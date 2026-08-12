## ADDED Requirements

### Requirement: A prova cronometrada pontua no servidor, não no cliente

No modo prova, o score final DEVE (MUST) ser calculado pelo servidor a partir das respostas
persistidas, e o cliente DEVE (MUST) usar esse resultado. O cálculo de score no navegador
NÃO PODE (MUST NOT) ser a fonte do resultado nem do certificado.

#### Scenario: finalização normal
- **WHEN** o usuário responde e clica em finalizar
- **THEN** o cliente chama `finish` no servidor e exibe o score que o servidor devolveu, sem recalcular localmente

#### Scenario: tempo esgotado com respostas dadas
- **WHEN** o timer chega a zero depois de o usuário ter respondido N questões
- **THEN** a finalização considera TODAS as respostas persistidas até aquele instante, não um estado congelado no início da prova

#### Scenario: falha ao buscar questões no resultado
- **WHEN** a tela de resultado não consegue rebuscar questões
- **THEN** ela mostra o score que o servidor já calculou (ou um estado de erro com retry) — nunca "0/0" para uma prova respondida

### Requirement: O gabarito não é entregue durante a prova

As rotas que servem questões para o modo prova DEVEM (MUST) usar um DTO sem `correctId` nem
`explanation`. A resposta correta só é revelada após `finish`.

#### Scenario: payload de prova sem gabarito
- **WHEN** o cliente busca as questões de uma tentativa em andamento
- **THEN** o JSON não contém `correctId` nem os campos de explicação

#### Scenario: gabarito após finalizar
- **WHEN** a tentativa é finalizada
- **THEN** o cliente pode obter o gabarito e a explicação para a revisão pós-prova

#### Scenario: modo estudo mantém a explicação
- **WHEN** o usuário está no modo estudo livre (não cronometrado, não probatório)
- **THEN** a rota de estudo continua entregando `correctId` e explicação item a item, por design

### Requirement: Crédito de XP e emissão de certificado são idempotentes por tentativa

O XP de um simulado e o certificado DEVEM (MUST) ser creditados no máximo uma vez por
`attemptId` finalizado, com a idempotência garantida no servidor — não em `sessionStorage`.

#### Scenario: reabrir o resultado em outra aba
- **WHEN** o usuário abre a tela de resultado da mesma tentativa em uma segunda aba
- **THEN** nenhum XP ou badge adicional é creditado

#### Scenario: certificado a partir de tentativa real
- **WHEN** o usuário emite o certificado
- **THEN** a emissão exige um `attemptId` finalizado no servidor e o certificado é verificável em `/verificar` por terceiros

### Requirement: Uma tentativa não corrompe nem bloqueia a próxima

Finalizar uma tentativa DEVE (MUST) marcá-la como concluída de forma que uma nova tentativa
do mesmo simulado seja possível, e respostas concorrentes NÃO PODEM (MUST NOT) sobrescrever
umas às outras.

#### Scenario: segunda tentativa do mesmo simulado
- **WHEN** o usuário finaliza uma tentativa e inicia outra do mesmo simulado
- **THEN** o servidor cria a nova tentativa sem violar constraint de unicidade

#### Scenario: navegar para trás após finalizar
- **WHEN** o usuário aperta voltar do navegador para a tela de execução e depois avança para o resultado
- **THEN** o resultado finalizado é preservado, não substituído por uma tentativa nova de questões diferentes

#### Scenario: respostas concorrentes
- **WHEN** duas requisições de resposta da mesma tentativa chegam quase ao mesmo tempo
- **THEN** ambas são aplicadas sem que a última sobrescreva o JSONB inteiro e perca a outra

### Requirement: O runner separa carregando, vazio e erro

A tela de execução DEVE (MUST) distinguir "carregando", "não logado", "simulado indisponível"
e "falha ao carregar", e oferecer retry e saída no caso de falha.

#### Scenario: falha de rede ao carregar questões
- **WHEN** a busca de questões falha por rede, sessão expirada ou banco vazio
- **THEN** a tela mostra uma mensagem de falha com "Tentar novamente" e "Voltar ao catálogo" — não um spinner permanente
