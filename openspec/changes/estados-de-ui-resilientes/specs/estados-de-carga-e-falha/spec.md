## ADDED Requirements

### Requirement: Falha de carregamento é distinta de vazio

Todo componente que busca dado remoto DEVE (MUST) distinguir "falhou ao carregar" de
"carregou e veio vazio". Um `catch` que devolve lista vazia e leva a UI a afirmar ausência de
dado NÃO PODE (MUST NOT) existir nas superfícies de alto alcance (ranking de trilha,
comentários).

#### Scenario: backend fora no ranking de trilha
- **WHEN** a API está indisponível e o `TrailLeaderboard` de um módulo tenta carregar
- **THEN** a UI diz que a consulta falhou e oferece retry — não "ainda sem ranking, seja o primeiro"

#### Scenario: discussão que não carregou
- **WHEN** a listagem de comentários falha
- **THEN** a seção informa a falha e desabilita o formulário de envio, em vez de mostrar "seja o primeiro"

### Requirement: Cada jornada crítica tem estados de carga, vazio e erro próprios

As rotas de maior tráfego DEVEM (MUST) ter `loading` e `error` próprios (boundary de segmento
ou estado interno), e a copy de erro DEVE (MUST) preservar navegação de escape.

#### Scenario: throw numa rota de conteúdo
- **WHEN** ocorre um erro em `/aprenda/[slug]`, `/simulados` ou `/revisar`
- **THEN** um boundary de segmento mostra o que falhou e mantém a navegação — não derruba a app inteira para o erro genérico

#### Scenario: erro global com escape
- **WHEN** o erro global é exibido
- **THEN** ele oferece "voltar para a home" e "explorar", sem instruir o usuário a limpar o cache

### Requirement: Usuário novo vê onboarding, não um dashboard de zeros

`/perfil` e `/progresso` DEVEM (MUST) distinguir "carregando" de "primeira visita" e oferecer
uma ação inicial ao usuário sem progresso.

#### Scenario: primeira visita ao perfil
- **WHEN** um usuário sem módulos concluídos abre `/perfil`
- **THEN** ele vê um estado inicial com uma ação ("escolher a primeira trilha"), não zeros sem contexto nem "Carregando perfil…" preso

### Requirement: Rota de conteúdo inexistente responde 404 real

Um slug de artigo inexistente DEVE (MUST) responder HTTP 404 com `robots:{index:false}`, e a
indisponibilidade do backend NÃO PODE (MUST NOT) ser apresentada como "esta página não existe".

#### Scenario: slug inexistente
- **WHEN** alguém acessa `/aprenda/<slug-que-nao-existe>`
- **THEN** o status é 404 e o metadata marca noindex, sem `<meta robots>` conflitante

#### Scenario: backend fora numa rota de artigo
- **WHEN** o backend está indisponível e o artigo existe
- **THEN** a página mostra "conteúdo temporariamente indisponível" com retry, reservando 404 para o não-encontrado real

### Requirement: Persistência que falha não é reportada como sucesso

Concluir módulo ou revisar carta com a persistência falhando (quota estourada) NÃO PODE
(MUST NOT) exibir sucesso.

#### Scenario: quota estourada ao concluir
- **WHEN** o `saveState` falha ao concluir um módulo
- **THEN** a UI informa que o progresso não pôde ser salvo, em vez de mostrar "concluído · +N XP"

### Requirement: Mensagem de erro é escrita para o aluno

As mensagens de erro visíveis ao usuário final NÃO PODEM (MUST NOT) conter diagnóstico de
mantenedor ("rode o seed", "backend está rodando?").

#### Scenario: banco de questões indisponível
- **WHEN** o estudo livre não consegue carregar questões
- **THEN** o aluno lê "não conseguimos carregar as questões agora, tente de novo" com retry, e o diagnóstico técnico vai para o log
