## ADDED Requirements

### Requirement: A interface não afirma comparação que não mede

Texto que sugira comparação com outros alunos DEVE (MUST) ser exibido apenas quando o dado vier
de medição agregada real. Enquanto o número for local, a interface DEVE falar do próprio
progresso ou declarar explicitamente que o número é do próprio visitante.

Esta é a exigência que não depende de backend, e por isso vem primeiro.

#### Scenario: dado local com texto de comparação
- **WHEN** `peer-stats.ts` calcula do `localStorage` e a tela diz "142 pessoas concluíram
  este módulo"
- **THEN** o texto é corrigido antes de qualquer endpoint existir — a plataforma cujo
  diferencial declarado é prova social honesta não pode inventar prova social

#### Scenario: dado agregado real
- **WHEN** o endpoint de estatística responde com contagem agregada do backend
- **THEN** a interface pode comparar, e DEVE indicar a janela de tempo do número

---

### Requirement: Agregação com piso que impede reidentificação

O endpoint de estatística por módulo DEVE (MUST) aplicar um piso de agregação e NÃO DEVE
responder contagem abaixo dele.

Com base pequena, contagem por módulo cruzada com trilha e data se aproxima de identificar
indivíduo — especialmente em módulo recém-publicado, onde os primeiros concluintes são
poucos e visíveis no ranking público.

#### Scenario: módulo com pouquíssimas conclusões
- **WHEN** um módulo tem 2 conclusões e o endpoint é chamado
- **THEN** a resposta indica que ainda não há dado suficiente, em vez de devolver 2

#### Scenario: módulo com volume
- **WHEN** um módulo tem conclusões acima do piso
- **THEN** a resposta traz a contagem agregada e a janela de tempo

---

### Requirement: Estatística não expõe identidade nem progresso individual

A resposta NÃO DEVE (MUST NOT) conter identificador de usuário, e-mail, apelido nem qualquer campo
que permita ligar a contagem a uma pessoa.

#### Scenario: resposta com lista de concluintes
- **WHEN** uma implementação devolve os apelidos de quem concluiu
- **THEN** é recusada: o ranking público é opt-in e tem regra própria; a estatística de
  módulo é agregada por definição

---

### Requirement: A rota é pública e cacheável

O endpoint DEVE (MUST) responder sem autenticação, porque a página de módulo é pública e
pré-renderizada, e DEVE ser cacheável — o número não muda a cada segundo.

#### Scenario: visitante anônimo
- **WHEN** um visitante sem conta abre um módulo
- **THEN** a estatística agregada carrega, sem exigir login

#### Scenario: rajada de requisições
- **WHEN** a mesma estatística é pedida muitas vezes em sequência
- **THEN** a resposta vem de cache, e a agregação não é recalculada por requisição
