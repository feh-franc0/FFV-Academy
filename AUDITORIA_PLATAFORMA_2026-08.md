# Auditoria da plataforma — 09/ago/2026

> **O que é este documento.** A auditoria completa de produto, pedagogia,
> conteúdo, arquitetura, qualidade, acessibilidade, SEO e segurança — com o que
> foi CORRIGIDO nesta rodada e o que ficou como backlog, em OpenSpec.
>
> **Método.** Nenhum número aqui vem de impressão: cada um foi medido por script
> contra o repositório, e os scripts estão citados. Onde não houve medição, a
> área está marcada `não validado` — não "aprovado por omissão".
>
> **Backlog executável:** [`openspec/changes/`](./openspec/changes/) — cada item
> P0–P2 desta auditoria existe como mudança OpenSpec com tasks. `openspec list`
> mostra o andamento.

---

## 1. Resumo executivo

A plataforma tem **profundidade de conteúdo acima do mercado brasileiro** e uma
disciplina de qualidade rara (15 gates de conteúdo no CI, provados por mutação).
Nesta rodada, a auditoria achou e corrigiu **dois defeitos funcionais P1 no
produto pago** (o fluxo cronometrado de simulado não carregava questão nenhuma;
um link de modo de estudo apontava para 404), **destravou 550 questões** que
existiam no repositório e nunca chegavam à produção, e **corrigiu o gabarito
viciado** do banco em produção (arquivos com até 87% das respostas na mesma
letra — dava para passar sem estudar).

O maior risco do produto não é técnico: é que **nada disso tem leitor** até o
site subir (decisão deliberada do dono — em desenvolvimento até ficar pronto), e
que a única página jurídica (`/privacidade`) ainda tem 4 campos `[PREENCHER]`
que só o dono pode preencher.

| Área | Veredito |
|---|---|
| Pedagogia e progressão | **aprovado com ressalvas** |
| Conteúdo técnico | **aprovado com ressalvas** |
| Simulados (produto pago) | **aprovado com ressalvas** (era `reprovado` no início da rodada) |
| SEO técnico | **aprovado** |
| Acessibilidade | **aprovado com ressalvas** |
| Segurança | **aprovado com ressalvas** |
| Performance | **não validado** (bundle e Web Vitals exigem build + navegador) |
| UX mobile | **não validado** nesta rodada (última varredura visual: 07/ago, 535 telas) |

---

## 2. Foco recomendado da plataforma

**Já decidido e implementado (ago/2026):** arquitetura de soluções AWS + IA em
produção sobre serviços AWS. A decisão está escrita em `CLAUDE.md`, medida (a
consolidação removeu 49 módulos fora do eixo e fundiu 2 hubs) e expressa no
produto pela **jornada** (`/jornada`): base técnica → AWS do básico ao avançado
→ IA do básico ao avançado → a união (IA na AWS) → sustentar em produção.

- **Público principal:** dev brasileiro de nível júnior-a-pleno que quer virar
  engenheiro de soluções de IA na AWS — com certificação como credencial e
  laboratório como prova de competência.
- **Públicos secundários:** quem busca certificação específica (CLF/DVA/SAA/
  SAP/AIF/MLA); quem já constrói com IA e precisa da camada de produção.
- **Transformação oferecida:** sair de "consumidor de tutorial" para alguém que
  desenha, constrói (Terraform + .NET 8, 100 labs) e opera soluções reais — e
  prova isso com AIF-C01/MLA e simulados honestos.
- **Diferenciais reais (verificados):** 490 módulos com 3+ quizzes e FAQ (100%);
  SRS SM-2 real alimentado pelos quizzes; 100 laboratórios com injeção de falha
  e revisão Well-Architected; 1.565 questões de simulado com explicação que
  trata cada distrator; tudo gratuito exceto simulado.

---

## 3. Diagnóstico do produto e da experiência de aprendizagem

### O que está estruturalmente certo (com evidência)

| Afirmação | Evidência |
|---|---|
| Jornada de ponta a ponta existe e é navegável | `curriculum/jornada.ts` + `/jornada`; 0 becos sem saída em 38 trilhas; 860 arestas; 98% dos módulos com link de entrada; `jornada-ligacao.test.ts` (8 casos) |
| Todo módulo pratica e verifica | 490/490 com 3+ quizzes (1.472 = cartas SM-2); explicação de quiz trata cada distrator (gate `validate_barra_ensino`) |
| Nenhum módulo é prosa pura | 0 de 490 sem qualquer apoio concreto (código, diagrama ou tabela) — medido por script sobre os seeds |
| Laboratórios têm objetivo, validação e limpeza | Padrão das 9 seções cobrado por `validate_cobertura_secoes.py --strict` (100/100 labs); inclui custo, injeção de falha, troubleshooting |
| Progressão de nível declarada | `level` presente em 490/490 módulos (105 preenchidos nesta rodada — antes entravam como "beginner" na recomendação via `?? 'beginner'`) |

### Lacunas reais de aprendizagem (viraram OpenSpec)

1. **Prática guiada ≠ prática independente.** Os labs são prática guiada
   excelente; não há exercícios de "resolva sem o passo a passo" entre o lab e o
   capstone. (P2 — `pratica-independente-e-projetos`)
2. **Apoio visual desigual por hub.** Base técnica: 0,4 bloco visual/módulo
   contra 4,8 do hub AWS — e é o hub que o iniciante vê primeiro. 36 módulos.
   (P2 — `apoio-visual-fundamentos`)
3. **Feedback de aprendizagem termina no quiz.** Não há métrica de acerto por
   trilha exposta ao aluno (roadmap Tier 1 já previa). (P2)

---

## 4. Achados priorizados (com evidência)

### P0 — bloqueiam entrega de valor ou risco legal

| # | Achado | Evidência | Estado |
|---|---|---|---|
| P0-1 | Site fora do ar: porta 443 fechada, nginx padrão na 80, DNS já aponta para a VPS nova (72.60.28.82) | `curl`/`nc` em 09/ago | **Deliberado** (decisão do dono: subir quando pronto). OpenSpec `entrega-em-producao` já existia; atualizada com a medição de DNS |
| P0-2 | `/privacidade` com 4 `[PREENCHER]` — página jurídica incompleta | `grep -c PREENCHER` = 4 | **Só o dono** pode preencher (dados legais reais). OpenSpec `conformidade-e-dados-pessoais` já existia |

### P1 — quebravam login/estudo/produto (corrigidos nesta rodada)

| # | Achado | Evidência | Correção |
|---|---|---|---|
| P1-1 | **Fluxo cronometrado de simulado não carregava questão nenhuma**: o runner consultava a API com o id do catálogo (`simulado-aws-practitioner`) e o banco usa `aws-clf` — query voltava vazia SEM erro | Leitura de `SimuladoRunner.tsx` + `question_repo.go` (`simulado_id = $1`, sem alias) | Campo `dbBankId` no tipo `Simulado`, ponte declarada nos 3 simulados com banco, runner e resultado traduzem; travado por `simulado-db-bank.test.ts` (3 casos, incluindo leitura da tabela `certs` do Go) |
| P1-2 | `studyModeUrl` da AIF apontava para `/simulados/aws-ai-practitioner/estudo`, rota que **não existe** (404) | `ls` da rota | Link removido com o motivo em comentário; teste cobra que todo `studyModeUrl` resolve para `page.tsx` real |
| P1-3 | **550 questões escritas nunca chegavam à produção** (435 DVA + 115 AIF): o gerador de migration só lia `clf-c02-*` e ignorava o resto em silêncio | `gen-seed-migration/main.go` (constante `clfPrefix`); deploy aplica migration, não o binário manual | Gerador parametrizado por tabela `certs`; migrations 000046 (AIF) e 000047 (DVA) geradas; gate novo `validate_question_bank.py --strict` no CI |
| P1-4 | **Gabarito viciado no banco EM PRODUÇÃO**: arquivos do CLF com até 87% das corretas na mesma letra; dava para passar marcando sempre "A" | Gate novo mediu 19 arquivos acima de 45% de concentração | 1.170 questões redistribuídas por permutação determinística, com `whyWrong` remapeado junto; regra de ≤45% no gate |
| P1-5 | Metadado falso no question-bank: arquivo declarando `totalQuestions: 100` com 10 questões — e um com **0** | Gate novo | 5 arquivos corrigidos; `totalQuestions` verificado no CI |

### P2 — experiência, pedagogia, SEO (backlog em OpenSpec)

| # | Achado | OpenSpec |
|---|---|---|
| P2-1 | Modo de estudo é preso ao banco CLF (`EstudoClient` importa `CLF_SIMULADO_ID`); AIF e DVA não têm estudo livre | `simulados-multi-certificacao` (nova) |
| P2-2 | SAA-C03 sem banco (5 questões inline, 2 sem tratamento de distrator); é a certificação mais buscada do catálogo | `simulados-multi-certificacao` (nova) |
| P2-3 | 36 módulos de Base técnica sem bloco visual (0,4/módulo vs 4,8 do hub AWS) | `apoio-visual-fundamentos` (nova) |
| P2-4 | Sem prática independente entre lab guiado e capstone | `pratica-independente-e-projetos` (nova) |
| P2-5 | Ondas 2–7 da pesquisa de demanda não executadas (GEO/AEO 0 módulos, carreira 2, comparações 1/107) | `expansao-de-captacao-organica` (já existia) |
| P2-6 | MLA-C02 chega em set/2026 com GenAI+agêntica no escopo; trilha precisa da camada nova quando o guia sair | `simulados-multi-certificacao` (nova, tarefa condicionada) |

### P3 — refinamento

- Ícone `◈` do hub IA na AWS sem equivalente emoji em toda superfície (consistência visual).
- `EstudoClient` poderia expor filtro por domínio na UI (o backend já aceita).
- Dívida de rótulo em diagramas antigos: 871 arestas sem label / 218 nós sem nota (em modo relatório, linha de base congelada).

---

## 5. Correções implementadas nesta rodada (09/ago)

Além dos P1 acima:

1. **Banco AIF-C01 profissional**: 65 questões ORIGINAIS ancoradas nos task
   statements do guia oficial (lido em 09/ago em
   `docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/`), na
   proporção exata dos pesos (D1 20% → 13 · D2 24% → 16 · D3 28% → 18 · D4 14%
   → 9 · D5 14% → 9). Explicação rica em 100%: `summary`, `whyCorrect`,
   `whyWrong` POR alternativa, `keyConcept`. Cobertura do gate de explicação:
   era 8/75, hoje **115/120 das questões avaliáveis**.
2. **Por que originais:** reproduzir questão real viola o acordo de certificação
   da AWS (braindump) e pode custar a certificação do aluno. Original também
   ensina mais: cada distrator é desenhado para nomear uma concepção errada.
3. **Calendário MLA-C01 → C02** registrado no módulo `mla-intro`, na trilha e na
   memória: registro da C02 abre 1º/set/2026; último dia da C01 em inglês
   28/set/2026; GA início de 2027; C02 acrescenta GenAI/agêntica/FM — que
   `trail-bedrock` e `trail-arq-ia-aws` já cobrem.
4. **23 exemplos executáveis** adicionados às trilhas de certificação (MLA 11,
   DVA 8, AIF 4): spot+checkpoint, ColumnTransformer com separação antes da
   transformação, envelope encryption, os 4 modos de inferência lado a lado,
   Guardrails como configuração, retry/catch em Step Functions etc. Três módulos
   ficaram sem código DE PROPÓSITO (visão geral/estratégia de prova — código ali
   seria enfeite).
5. **Catálogo de simulados enxuto**: bancos grandes NÃO moram em TypeScript. As
   65 questões inline levaram o arquivo a 128 KB e a suíte de 10s para 915s;
   movidas para o pipeline JSON → `make gen-seed-migration` → Postgres (o mesmo
   do CLF). Catálogo em 8 KB, suíte em ~10s.
6. **Gate novo no CI** (`validate_question_bank.py --strict`): prefixo legível
   pelo gerador (lê a tabela `certs` DIRETO do Go — lista duplicada divergiu no
   mesmo dia e foi eliminada), `totalQuestions` verdadeiro, id único, gabarito
   ≤45% por letra.
7. **4 bancos Anthropic removidos** (200 questões fora do eixo desde a
   consolidação).

## 6. Resultado das validações (09/ago, fim da rodada)

| Verificação | Resultado |
|---|---|
| Gates de conteúdo (como o CI invoca, 15 comandos) | **15/15 verdes** |
| Testes frontend | **1.074 passando** (112 arquivos), 6 skip |
| `tsc --noEmit` | limpo |
| `eslint` (zero warnings policy) | limpo |
| `go build ./...` + `go vet ./...` | limpos |
| Migration CLF (drift) | sem deriva não intencional; 000046/000047 novas |
| Deriva currículo ↔ seeds | 490/490, zero órfãos |

Comandos de reprodução: seção "Como revalidar" do `PENDENCIAS.md` +
`bash -c 'grep -oE "python3 scripts/validate_[a-z_]+\.py( --strict)?" .github/workflows/ci.yml | sort -u'`.

---

## 7. Avaliação por área

### Conteúdo técnico — **aprovado com ressalvas**
- ✅ Fatos auditados contra fonte: 13 erros técnicos achados e corrigidos na
  auditoria de 09/ago (preço de Redshift usado como gabarito, burn rate 24x
  errado etc.); guias de certificação lidos na fonte oficial nesta rodada.
- ✅ Labs declaram custo, região implícita na stack, injeção de falha, limpeza.
- ⚠️ Ressalva: conteúdo variável (preço, cota) está datado no texto mas não há
  processo RECORRENTE de re-verificação — proposto em OpenSpec como revisão
  semestral por amostragem.

### Pedagogia — **aprovado com ressalvas**
- ✅ Ciclo entender→praticar→verificar→avançar fechado em 100% dos módulos.
- ⚠️ Falta o degrau "prática independente" (P2-4) e visual em Fundamentos (P2-3).

### Simulados — **aprovado com ressalvas**
- ✅ 1.565 questões no Postgres, explicação por distrator, gabarito equilibrado,
  fluxo cronometrado consertado.
- ⚠️ SAA segue prévia de 5 (preço zerado, honesto); estudo livre só CLF.

### SEO — **aprovado**
- Canônica sem barra final travada por teste; `social()` obrigatório; JSON-LD
  de Course com `hasPart`/`coursePrerequisites`/`isPartOf`; BreadcrumbList em
  módulo, trilha e hub; sitemap dinâmico; `llms.txt` com a jornada; rotas
  pessoais com `noindex` e fora do sitemap; 64 rotas retiradas com disposição
  declarada (301/404 honesto); descrições 70–165 chars em forma de frase
  travadas no CI; números públicos verificados contra o currículo por teste.

### Acessibilidade — **aprovado com ressalvas**
- ✅ 0 violações estruturais graves (axe, 22 rotas); dívida de contraste 21 nós
  com teto que só desce; `.ffv-acento-texto`; overflow com `tabIndex`.
- ⚠️ Última varredura visual completa foi 07/ago (antes das mudanças desta
  rodada); requer `npm run varredura` com build para revalidar as 535+ telas.

### Segurança — **aprovado com ressalvas**
- ✅ `/admin` com `X-Robots-Tag` + `RequireAdmin` no backend (role=admin);
  CSP por header; simulado com anti-tamper testado; sem segredo no repo
  (secrets via GitHub Actions).
- ⚠️ `/privacidade` incompleta (P0-2, só o dono); LGPD depende disso.

### Performance — **não validado**
- Suíte e tsc medidos; bundle/Web Vitals exigem `next build` + navegador. O
  problema conhecido (chunk do currículo em 95 rotas) está registrado como
  limite do B-1 em `PENDENCIAS.md`.

---

## 8. Backlog P0–P3 (executável)

Tudo em [`openspec/changes/`](./openspec/changes/):

| Prioridade | OpenSpec change | Estado |
|---|---|---|
| P0-1 | `entrega-em-producao` | já existia; só o dono (DNS já migrado, falta TLS + `DEPLOY_ENABLED`) |
| P0-2 | `conformidade-e-dados-pessoais` | já existia; só o dono |
| P1 (todos) | — | **corrigidos nesta rodada** (ver §5) |
| P2-1/2/6 | `simulados-multi-certificacao` | **nova** (criada nesta rodada) |
| P2-3 | `apoio-visual-fundamentos` | **nova** |
| P2-4 | `pratica-independente-e-projetos` | **nova** |
| P2-5 | `expansao-de-captacao-organica` | já existia |
| P3 | registrados na seção 4 deste doc | sem change dedicada (abaixo da barra) |

---

## 9. Riscos residuais e decisões que exigem o dono

1. **TLS + deploy** (P0-1): passo a passo em `PENDENCIAS.md` D-1. Nota: o DNS
   **já aponta** para a VPS nova — o texto de D-1 está desatualizado nesse
   ponto; o que falta é `certbot` + `DEPLOY_ENABLED=true`.
2. **`/privacidade`** (P0-2): 4 campos jurídicos que não podem ser inventados.
3. **Preço do simulado AIF**: recoloquei R$47 com o banco de 115 questões reais
   e a copy honesta ("65 por tentativa, sorteadas de 115"). Validar se o preço
   é o desejado.
4. **MLA-C02**: quando o guia oficial da C02 sair, a trilha ganha a camada
   GenAI/agêntica (tarefa condicionada na OpenSpec nova). Não fazer antes: seria
   especular sobre blueprint não publicado.
5. **Banco DVA (435) redistribuído**: quem já fez o simulado antigo verá
   gabarito em posições novas — sem impacto real porque o produto nunca esteve
   no ar, mas registrado.

## 10. Próximas ações recomendadas (em ordem)

1. Dono: TLS + `DEPLOY_ENABLED` (meio dia) e `/privacidade` (1h com os dados).
2. `simulados-multi-certificacao` fase 1: estudo livre por certificação
   (destrava AIF/DVA estudo, reusa EstudoClient com `dbBankId`).
3. Banco SAA-C03 (65+ questões, mesmo pipeline — é a cert de maior procura).
4. `apoio-visual-fundamentos` (36 módulos, molde já existe nos hubs fortes).
5. Ondas 2 e 5 da captação (GEO/AEO + carreira) — a pesquisa está pronta desde
   05/ago.
