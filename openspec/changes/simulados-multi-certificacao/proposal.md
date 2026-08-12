## Why

O produto pago da plataforma é o simulado, e em 09/ago/2026 ele passou a ter
**1.565 questões no Postgres** (CLF 1.015 · DVA 435 · AIF 115) com explicação
que trata cada distrator. Mas três limites seguram o valor disso:

1. **O modo de estudo livre só existe para o CLF.** `EstudoClient` importa
   `CLF_SIMULADO_ID` e a única rota é `/simulados/cloud-practitioner/estudo`.
   A AIF chegou a ANUNCIAR `studyModeUrl` para uma rota que não existia — 404
   removido em 09/ago, com teste que impede a volta (`simulado-db-bank.test.ts`).
   O backend já aceita qualquer `simulado_id` em `/study/random`; o que falta é
   o cliente parametrizar.

2. **A SAA-C03 — a certificação mais procurada do catálogo — tem 5 questões
   inline de prévia**, 2 delas sem tratamento de distrator (medido pelo gate
   `validate_explicacao_simulado.py`: catálogo hoje = 5 questões, 0
   estruturadas). Preço zerado por honestidade em 09/ago; o produto só volta a
   ter preço quando tiver banco.

3. **A MLA-C02 substitui a MLA-C01** (registro 1º/set/2026; último dia da C01
   em inglês 28/set/2026; GA início de 2027) e ACRESCENTA GenAI, IA agêntica e
   cargas de FM/LLM ao escopo. A trilha `trail-mla` já avisa o aluno com as
   datas. Banco de questões para a C01 seria trabalho descartável; para a C02,
   depende do guia oficial que ainda não saiu.

A infraestrutura para tudo isso já existe e está travada por gate:
`frontend/data/question-bank/<cert>-*.json` → tabela `certs` de
`backend/cmd/gen-seed-migration` → migration → Postgres, com
`validate_question_bank.py --strict` no CI cobrando prefixo legível,
`totalQuestions` verdadeiro e gabarito ≤45% por letra.

## What Changes

**Fase 1 — estudo livre por certificação.** `EstudoClient` recebe o
`dbBankId` (ponte criada em 09/ago no tipo `Simulado`) em vez de importar a
constante do CLF; rota dinâmica `/simulados/<slug>/estudo` substitui a rota
fixa; `studyModeUrl` volta ao catálogo de AIF e DVA apontando para rota que
existe — e o teste que hoje proíbe 404 passa a provar o caminho feliz.

**Fase 2 — banco SAA-C03.** 65+ questões ORIGINAIS por tentativa, escritas a
partir dos task statements do guia oficial SAA-C03 (mesmo método da AIF:
distribuição nos pesos publicados dos domínios, explicação rica em 100%,
gabarito equilibrado por permutação determinística). Prefixo `saa-c03-` entra
na tabela `certs`; preço volta ao catálogo junto com o banco — nunca antes.

**Fase 3 (condicionada) — MLA-C02.** SÓ quando o guia oficial da C02 for
publicado: camada GenAI/agêntica na trilha `trail-mla` (acrescentar, não
reescrever — os 4 domínios da C01 permanecem) e banco `mla-c02-*`. Gatilho: a
página do exame na AWS publicar o exam guide da C02.

### O que NÃO muda

- Nenhuma questão reproduzida de prova real, nunca — viola o acordo de
  certificação da AWS e pode custar a certificação do aluno. Original também
  ensina mais: o distrator é desenhado para nomear a concepção errada.
- O catálogo continua só com metadado (`questions: []` para bancos do
  Postgres). Os 128 KB inline de 09/ago levaram a suíte de 10s para 915s e
  está documentado em `frontend/CLAUDE.md` por que isso não volta.
