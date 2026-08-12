## ADDED Requirements

### Requirement: Estudo livre funciona para cada certificação com banco no Postgres

O modo de estudo livre DEVE (MUST) funcionar para toda certificação que tenha banco de
questões no Postgres (CLF, DVA, AIF, SAA), não apenas o CLF. A rota
`/simulados/[slug]/estudo` resolve o `dbBankId` da certificação e consulta o banco certo.

O defeito de origem: `EstudoClient` importava a constante do banco CLF, então AIF e DVA
não tinham estudo livre mesmo tendo banco.

#### Scenario: estudo livre da AIF
- **WHEN** o usuário abre `/simulados/aws-aif/estudo`
- **THEN** a página consulta o banco `aws-aif` e sorteia questões dele, não do CLF

#### Scenario: ponte entre id de catálogo e id do banco
- **WHEN** o runner ou o estudo consulta a API com o id do simulado
- **THEN** usa `dbBankId` (o id do Postgres) e não o id do catálogo — a query volta com questões, não vazia

#### Scenario: studyModeUrl resolve para rota real
- **WHEN** um simulado declara `studyModeUrl`
- **THEN** a rota apontada existe como `page.tsx` e o simulado tem `dbBankId` — nenhum link para 404

### Requirement: Banco de simulado grande vive no Postgres, não em TypeScript

Um banco de questões com dezenas de itens DEVE (MUST) morar no pipeline
JSON → `gen-seed-migration` → Postgres, não inline no catálogo TypeScript.

#### Scenario: catálogo enxuto
- **WHEN** uma certificação ganha banco de 65+ questões
- **THEN** o catálogo TypeScript mantém `questions: []` e o banco entra por migration

#### Scenario: gabarito equilibrado
- **WHEN** o banco é gerado
- **THEN** nenhuma letra concentra mais de 45% das respostas corretas (`validate_question_bank.py --strict`)
