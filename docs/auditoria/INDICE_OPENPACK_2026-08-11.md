# Índice do OpenPack — auditoria de 11/ago/2026

> "OpenPack" não é convenção do repositório (não existe no código). Aqui designa o conjunto
> coordenado dos OpenSpec Change Packs. Schema real: `spec-driven` (OpenSpec 1.6.0).
> Estado da validação: `openspec validate --all --strict` = **20/20 verde**.

## Packs criados nesta rodada (7)

| Pack | Prioridade | Objetivo | Depende de | Risco | Validação |
|---|---|---|---|---|---|
| `prova-integra-e-anti-fraude` | **P0** | Prova cronometrada server-authoritative e não fraudável | — | Alto: muda contrato das rotas de questão; release FE+BE coordenado | ✓ |
| `sincronizacao-de-progresso-confiavel` | **P0** | Fazer o progresso realmente sincronizar (formato único) | — | Médio: política de merge para snapshots antigos | ✓ |
| `endurecimento-de-autenticacao` | **P0** | Remover bypass por default; IP não forjável | — | Alto: toca boot e proxy; testar deploy descartável | ✓ |
| `exposicao-de-dados-e-segredos` | **P2** | Fechar exposições de dado/segredo pontuais | (parcial) `endurecimento` | Baixo: mudanças isoladas | ✓ |
| `estados-de-ui-resilientes` | **P1** | Falha ≠ vazio; estados de carga/erro em toda jornada | — | Baixo | ✓ |
| `orcamento-de-carga-por-rota` | **P0** | Tirar o currículo/Zod do bundle comum; gate por rota | — | Médio: import transitivo pode regredir (o gate impede) | ✓ |
| `consistencia-visual-e-acessibilidade` | **P0/P1** | Botão único, contraste AA de controle, a11y | ⊥ `contraste-de-paleta-como-texto` (complementar) | Médio: migração ampla por lote | ✓ |

## Packs pré-existentes reconciliados (13)

| Pack | Estado (tasks) | Nota da auditoria |
|---|---|---|
| `apoio-visual-fundamentos` | completa | **specs/ adicionada nesta rodada** (validava ✗, agora ✓) |
| `pratica-independente-e-projetos` | 8/9 | **specs/ adicionada** (✓); resto = analytics pós-launch |
| `simulados-multi-certificacao` | 14/20 | **specs/ adicionada** (✓); resto = MLA-C02 condicionada a 01/set |
| `entrega-em-producao` | 5/21 | Só o dono (TLS + DEPLOY_ENABLED) |
| `conformidade-e-dados-pessoais` | 4/26 | Só o dono (dados jurídicos) |
| `explicacao-rica-nos-simulados` | 6/15 | Migrar 75 explicações rasas restantes |
| `serie-100-labs-arquitetura-aws` | 3/34 | **Defasado:** labs existem (gate 100/100); reconciliar tasks |
| `contraste-de-paleta-como-texto` | 17/22 | Complementar a `consistencia-visual-e-acessibilidade` (texto de categoria vs controle) |
| `arquitetura-visual-profissional` | 9/43 | Dívida de rótulo de aresta/nota de nó (871/218) |
| `lastmod-real-por-hash-de-conteudo` | 15/20 | Backfill de hash |
| `contrato-adapter-primitive` | 17/22 | Lint de estilo + docs |
| `integracoes-de-backend-pendentes` | 0/24 | Cobre billing/paywall e peer-stats (não duplicar aqui) |
| `expansao-de-captacao-organica` | 0/22 | Ondas GEO/AEO + carreira |

## Sequência recomendada (ondas)

- **Onda 1 (P0 de risco/dado):** `endurecimento-de-autenticacao` → `sincronizacao-de-progresso-confiavel`.
- **Onda 2 (P0 do produto pago):** `prova-integra-e-anti-fraude` (release FE+BE coordenado).
- **Onda 3 (P0 de performance e contraste):** `orcamento-de-carga-por-rota`, `consistencia-visual-e-acessibilidade` (parte de contraste primeiro).
- **Onda 4 (P1/P2 de robustez):** `estados-de-ui-resilientes`, `exposicao-de-dados-e-segredos`.
- **Contínuo:** os 13 pré-existentes, conforme o dono destrava produção.

---

## Matriz de rastreabilidade — achado → pack → requisito → cenário → teste

Notação: cada linha liga um achado da auditoria (§4 do relatório e relatórios dos 4 agentes)
ao pack que o cobre. "Cenário-âncora" é o `#### Scenario:` que prova o requisito; "teste" é a
tarefa de travamento no `tasks.md` do pack.

### prova-integra-e-anti-fraude

| Achado | Requisito | Cenário-âncora | Teste (task) |
|---|---|---|---|
| P0-B timer pontua velho | Pontua no servidor | "tempo esgotado com respostas dadas" | 3.1 |
| P0-D / #4 gabarito exposto | Gabarito não entregue na prova | "payload de prova sem gabarito" | 1.6 |
| 3.2 anti-tamper | Pontua no servidor | "finalização normal" | 2.1 |
| 3.3 Back destrói resultado | Não corrompe a próxima | "navegar para trás após finalizar" | 3.2 |
| 3.4 XP recreditável | Idempotência por tentativa | "reabrir o resultado em outra aba" | 3.3 |
| 3.5/P0-F loading=erro | Runner separa estados | "falha de rede ao carregar" | 2.5 |
| 3.7 resultado 0% | Pontua no servidor | "falha ao buscar no resultado" | 2.4 |
| 3.10/3.11 motor morto | Pontua no servidor | "finalização normal" | 1.5, 2.1 |
| 3.12 certificado inverificável | Idempotência/certificado | "certificado a partir de tentativa real" | 2.6 |
| #6 2ª tentativa impossível | Não bloqueia a próxima | "segunda tentativa" | 1.4 |
| #7 lost update | Não corrompe | "respostas concorrentes" | 1.3 |

### sincronizacao-de-progresso-confiavel

| Achado | Requisito | Cenário-âncora | Teste |
|---|---|---|---|
| P0-A push nunca envia | Formato igual ao da engine | "estado comprimido é enviado" | 1.3 |
| 6.2 teste mascara | Formato igual | "o teste semeia pela engine" | 2.1 |
| 6.3 login apaga anônimo | Login não destrói anônimo | "anônimo com progresso, servidor vazio" | 3.2 |
| 6.4 banner mente | Login não destrói | "conflito real por data" | 3.3 |
| 6.5 schema strict | Falha observável | "schema desalinhado" | 2.2 |
| 6.6 schemaVersion | Versão corresponde | "versão coerente" | 4.2 |
| 6.7 só GameState | Certificados não se perdem | "certificado sobrevive à troca" | 4.3 |
| 6.9 sem fila offline | Falha reenfileirável | "push falha offline" | 4.1 |
| 6.10 IDB não lido | (task) | — | 4.4 |

### endurecimento-de-autenticacao

| Achado | Requisito | Cenário-âncora | Teste |
|---|---|---|---|
| P0-C/#1 bypass default | Bypass nunca por default | "env ausente não abre a porta" | 1.4 |
| #2 XFF forja | Identidade não forjável | "XFF forjado não zera contador" | 2.4 |
| #13 fail-open Redis | Redis não desliga defesas | "Redis fora nas rotas de auth" | 2.3 |
| 1.1 código queima token | Palpite não inutiliza | "código errado seguido do certo" | 3.1 |
| 1.2 enumeração | Resposta não revela conta | "resposta uniforme" | 3.3 |
| 1.3 cadastro descartado | (task) | — | 3.4 |
| #18 refresh reuse | Reuso invalida família | "token revogado reaparece" | 3.5 |
| 1.4 admin layout | (task) | — | 4.1 |

### exposicao-de-dados-e-segredos

| Achado | Requisito | Cenário-âncora | Teste |
|---|---|---|---|
| #3 stripe secret default | Segredo obrigatório no boot | "billing ligado sem segredo" | 1.1 |
| #8 artigo não publicado | Não publicado não é servido | "rascunho por slug adivinhado" | 2.1 |
| #9 ranking sem opt-in | Ranking respeita opt-in | "ranking de trilha sem opt-in" | 2.2 |
| #12 userId de terceiros | Ranking respeita opt-in | "leaderboard autenticado" | 2.3 |
| #10 readyz vaza | Operacional não vaza | "readyz com dependência fora" | 3.1 |
| #11 metrics exposto | Operacional não vaza | "metrics da internet" | 3.2 |
| #14 CORS Vary | Erro/cabeçalho não vaza | "cache e origem" | 3.3 |
| #15 4xx vaza camada | Erro não vaza | "401 com contexto interno" | 3.4 |
| #25 email no Redis | Identificador não em claro | "dump do Redis" | 4.1 |
| #19 .env 0644 | (task) | — | 4.2 |
| nginx versão | Identificador não em claro | "banner do servidor" | 3.2 |

### estados-de-ui-resilientes

| Achado | Requisito | Cenário-âncora | Teste |
|---|---|---|---|
| UX-5/1 ranking mente | Falha ≠ vazio | "backend fora no ranking de trilha" | 1.2 |
| UX-6/2 comentários | Falha ≠ vazio | "discussão que não carregou" | 1.2 |
| UX-2 sem error.tsx | Estados próprios | "throw numa rota de conteúdo" | 2.1 |
| UX-3/9 soft-404 | 404 real | "slug inexistente" | 2.2 |
| UX-4 perfil/progresso | Novo vê onboarding | "primeira visita ao perfil" | 3.1 |
| 2.1 conclusão sem erro | Persistência não é sucesso falso | "quota estourada ao concluir" | 3.2 |
| UX-19 copy de mantenedor | Erro para o aluno | "banco indisponível" | 4.1 |
| UX-20 erro global | Estados próprios | "erro global com escape" | 2.4 |
| 4.1/4.2 flash/fila | (task) | — | 3.3 |

### orcamento-de-carga-por-rota

| Achado | Requisito | Cenário-âncora | Teste |
|---|---|---|---|
| P0-E currículo em 616 | Rota sem currículo completo | "rota utilitária sem currículo" | 2.1 |
| B-2 índice duplica | Rota sem currículo | "índice leve não duplica" | 2.3 |
| B-3 Zod no cliente | Validação fora do comum | "rota sem leitura de estado" | 2.4 |
| B-5 gate inoperante | Gate mede total por rota | "regressão de baseline" | 4.1 |
| B-4 payload RSC | (task) | — | 3.1 |
| B-6 fontes | (task) | — | 4.4 |

### consistencia-visual-e-acessibilidade

| Achado | Requisito | Cenário-âncora | Teste |
|---|---|---|---|
| P0-G/22 branco sobre acento | Contraste AA de controle | "botão primário sobre acento" | 1.1 |
| 12 três botões | Botão único | "componente de botão único" | 2.1 |
| 13 hex à mão | Sem hex à mão | "gate de hex literal" | 2.4 |
| 23 modais sem trap | Modais prendem foco | "navegar por Tab dentro do modal" | 3.1 |
| 24 scroll sem tabIndex | Estrutura semântica | "tabela larga no mobile" | 3.2 |
| 25 foco invisível | Foco visível e 44px | "input com foco" | 3.3 |
| 26 labels | Estrutura semântica | "textarea de comentário" | 3.4 |
| 27 heading order | Estrutura semântica | "ordem de heading" | 3.5 |
| 28 touch targets | Foco visível e 44px | "controle pequeno no mobile" | 3.6 |
| 11/14 tokens/cards mortos | Botão único | "componente de botão único" | 2.2, 2.5 |
| 15/16/17 nav | (task) | — | 4.1–4.3 |

### Achados roteados a packs existentes (não duplicados)

| Achado | Pack existente |
|---|---|
| #5 webhook grant fora de tx, 5.2/5.3 paywall | `integracoes-de-backend-pendentes` (cobranca-de-simulado) |
| Contraste de **texto de categoria** | `contraste-de-paleta-como-texto` |
| A2/A3/A4 buracos de gate de conteúdo (quiz fora de Fixando, caption vazia) | candidatos a `arquitetura-visual-profissional` / gate novo — registrados, abaixo da barra de P1 |
