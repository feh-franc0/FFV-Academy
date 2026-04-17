# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Visão Geral

**FFV Academy** — Blog técnico gamificado sobre Inteligência Artificial.
Site: https://fernandofrancovalle.com · Autor: Fernando Franco Valle.

**Conceito:** "Blog · Learn · Game" — cada artigo é um post de blog que dá XP, tem quiz e faz o leitor evoluir de nível. O objetivo é desmistificar a IA, parar de vender medo e mostrar que ela amplifica a capacidade humana.

**Tom:** Zero hype, zero clickbait. Arquitetura real, dados públicos, decisões testadas. Conteúdo profissional para devs e curiosos sérios.

---

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4** (com `@custom-variant dark`)
- **shadcn/ui sobre base-ui** — `@base-ui/react/*` (NÃO é Radix, ver gotcha abaixo)
- **localStorage** — 100% client-side, sem backend, sem auth
- **`output: "export"`** no `next.config.ts` — site 100% estático servido como HTML/CSS/JS puro na Hostinger

### Fontes
- **Inter** (corpo) · **Poppins** (títulos) · **Roboto Mono** (código/meta)

### Legado
Arquivos HTML/CSS/JS originais em `_legacy/` como referência de conteúdo.

---

## Comandos

```bash
npm run dev      # dev server em http://localhost:3000
npm run build    # build estático em out/
npm run lint     # ESLint
```

### Gotcha: processos órfãos do `next-server`
Se `npm run dev` der erro ou servir código velho, mate processos zumbis:
```bash
pkill -f "next dev"; pkill -f "next-server"; rm -rf .next
```
Turbopack cacheia estado — sempre limpe `.next/` após mudanças estruturais grandes.

---

## Gatilho de Deploy

Quando o usuário disser **"quero o zip"**, **"gera o zip"**, **"deploy na hostinger"** ou variação — execute os 3 comandos abaixo em sequência, sem pedir confirmação:

```bash
npm run build
```
```bash
rm -rf hostinger && mkdir -p hostinger
OUT="out"; DEST="hostinger"
cp -r "$OUT/_next" "$DEST/"
cp "$OUT/favicon.ico" "$DEST/" 2>/dev/null || true
cp "$OUT/index.html" "$DEST/index.html"
cp "$OUT/404.html" "$DEST/404.html"
for route in ia aws engenharia progresso fundamentos-da-ia ia-alem-do-llm ferramentas-ia-codigo aws-cloud-practitioner aws-saa-c03 como-aprender devops-containers engenharia-software ai-native sistemas-distribuidos observabilidade-sre revisar glossario fundamentos-tecnicos claude-anthropic sql-databases como-computador-funciona redes-web; do
  mkdir -p "$DEST/$route"
  cp "$OUT/$route.html" "$DEST/$route/index.html"
done
for f in "$OUT/aprenda/"*.html; do
  slug=$(basename "$f" .html)
  mkdir -p "$DEST/aprenda/$slug"
  cp "$f" "$DEST/aprenda/$slug/index.html"
done
cat > "$DEST/.htaccess" <<'EOF'
Options -Indexes

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  RewriteRule ^ index.html [L]
</IfModule>
EOF
```
```bash
rm -f ffv-academy-hostinger.zip
zip -r ffv-academy-hostinger.zip hostinger/ -x "*.DS_Store"
```

Ao final, confirme: **"ZIP gerado: `ffv-academy-hostinger.zip`"** e lembre o usuário de seguir o passo 4 do fluxo de deploy.

**Por que o script existe:** Next.js export gera `fundamentos-da-ia.html`; Hostinger precisa de `fundamentos-da-ia/index.html`. O script converte cada rota.

---

## Fluxo de Deploy (Hostinger)

1. **Build** — `npm run build` gera `out/`
2. **Converter estrutura** — script acima, gera `hostinger/`
3. **Zip** — comando acima
4. **Upload manual** na Hostinger:
   - File Manager → `public_html`
   - **Deletar tudo** que estiver lá
   - Upload do `ffv-academy-hostinger.zip`
   - Botão direito → **Extract**
   - **Mover conteúdo** da pasta `hostinger/` para a raiz do `public_html`
   - Deletar o zip e a pasta `hostinger/` vazia

### Estrutura final em `public_html/`
```
public_html/
├── .htaccess                   ← rewrite para HTMLs estáticos
├── index.html                  ← home
├── 404.html
├── _next/                      ← CSS/JS (não mexer)
├── ia/index.html                ← hub de IA
├── aws/index.html               ← hub AWS
├── engenharia/index.html        ← hub de Engenharia de Software
├── progresso/index.html         ← dashboard do usuário
├── fundamentos-da-ia/index.html
├── ia-alem-do-llm/index.html
├── ferramentas-ia-codigo/index.html
├── aws-cloud-practitioner/index.html
├── aws-saa-c03/index.html
├── como-aprender/index.html
├── devops-containers/index.html
├── engenharia-software/index.html
├── ai-native/index.html
├── sistemas-distribuidos/index.html
├── observabilidade-sre/index.html
├── revisar/index.html          ← fila de revisão espaçada (SRS)
└── aprenda/<slug>/index.html   ← um por módulo
```

---

## Hubs temáticos

Além das 8 trilhas, o currículo expõe **4 hubs** — agrupadores editoriais definidos em [src/lib/curriculum.ts](src/lib/curriculum.ts) (constante `HUBS`). Cada hub tem sua própria página estática renderizada por [src/components/HubPageClient.tsx](src/components/HubPageClient.tsx).

| Hub | Rota | Cor | Trilhas |
|-----|------|-----|---------|
| Inteligência Artificial | `/ia` | `#58a6ff` | trail1, trail2, trail3, trail9 |
| AWS Cloud | `/aws` | `#ff9900` | trail4, trail5 |
| Engenharia de Software | `/engenharia` | `#e3b341` | trail7, trail8, trail10, trail11 |
| Como Aprender | `/como-aprender` | `#3fb950` | trail6 |

Os hubs são **aditivos**, não substituem as rotas de trilha — todas as URLs históricas seguem funcionando. O nav do [GameHUD](src/components/GameHUD.tsx) mostra **hubs + Progresso** (não trilhas individuais). O [CommandPalette](src/components/CommandPalette.tsx) (Cmd/Ctrl+K) permite navegar por tudo a qualquer momento.

Helpers disponíveis no `curriculum.ts`: `getHubBySlug(slug)`, `getHubForTrail(trailId)`, `getHubTrails(hub)`, `getHubStats(hub, completedSlugs)`.

---

## Arquitetura de Páginas

```
/                        → Home (Hero → Habit → Featured → Hubs → Trails → Posts → Game → Author → CTA)
/ia                      → Hub de IA (trilhas 1-3)
/aws                     → Hub AWS (trilhas 4-5)
/engenharia              → Hub Engenharia (trilhas 7-8)
/progresso               → Dashboard do usuário (XP, streak, badges, por hub, por trilha)
/fundamentos-da-ia       → Trilha 1 — listagem
/ia-alem-do-llm          → Trilha 2 — listagem
/ferramentas-ia-codigo   → Trilha 3 — listagem
/aws-cloud-practitioner  → Trilha 4 — listagem
/aws-saa-c03             → Trilha 5 — listagem
/como-aprender           → Trilha 6 — listagem (psicologia do aprendizado; funciona como hub também)
/devops-containers       → Trilha 7 — listagem (Docker + Kubernetes + CI/CD)
/engenharia-software     → Trilha 8 — listagem (engenharia moderna, agents, testes, segurança, arquitetura)
/ai-native               → Trilha 9 — listagem (RAG, agents, MCP, LLMOps)
/sistemas-distribuidos   → Trilha 10 — listagem (CAP, consensus, sagas, MVCC, rate limiting)
/observabilidade-sre     → Trilha 11 — listagem (métricas RED/USE, OTel, SLOs, incident response)
/fundamentos-tecnicos    → Trilha 12 — listagem (Linux, Git, HTTP, SSH, DNS/TLS, JSON/YAML)
/claude-anthropic        → Trilha 13 — listagem (Claude Code, MCP, hooks, skills, API, prompt engineering)
/sql-databases           → Trilha 14 — listagem (SQL, joins, índices, EXPLAIN, transactions, migrations)
/como-computador-funciona → Trilha 15 — listagem (CPU, memória, syscalls, I/O, threads, containers)
/redes-web               → Trilha 16 — listagem (OSI, TCP, QUIC, HTTP/2-3, TLS, DNS, proxies, CORS)
/revisar                 → Fila de revisão espaçada (SRS) com SM-2 simplificado
/aprenda/[slug]          → Artigo + quiz + XP
```

### Home — estrutura editorial (HomeClient.tsx)

A home usa padrão editorial tipo Linear/Vercel:

1. **Hero** — grid background + radial glow + status badge "NOW WRITING"
2. **HeroMetrics** — grid 2×2/1×4 com contadores (artigos, trilhas, níveis, gratuito)
3. **FeaturedArticle** — artigo em destaque (default: `qual-coding-agent-usar`)
4. **TrailsSection** — 3 reading paths com progresso real (`completedSlugs.includes`)
5. **AllPostsSection** — grid de todos os posts com briefing (toda div é clicável)
6. **LearnGameSection** — explica gamificação (4 steps + 7 níveis)
7. **AuthorSection** — bio compacta
8. **FinalCta** — CTA com estado condicional (mostra XP atual se já começou)

Primitivos reutilizáveis dentro de `HomeClient.tsx`: `SectionLabel`, `TrailPill`, `MetaPill`, `DifficultyPill`, `MetaText`, `MetaDot`, `PrimaryCTA`, `GhostCTA`.

Difficulty derivada de XP: ≤40 Iniciante · ≤65 Intermediário · >65 Avançado.

---

## Arquitetura de Gamificação

Todo o estado do usuário vive em `localStorage` sob a chave `ffv_academy`.

```ts
interface GameState {
  xp: number
  level: number
  streak: number
  lastStudyDate: string | null
  completedModules: string[]   // slugs
  quizScores: Record<string, { score: number; total: number; perfect: boolean }>
  badges: string[]
  totalStudyTime: number
  startedAt: string | null
  // ─── hábito + SRS (Fase "Como Aprender") ───
  reviewCards: ReviewCard[]            // cards SM-2 injetados no fim de cada quiz
  studyDays: StudyDay[]                // last 365 days window p/ heatmap
  freezes: number                      // streak freeze (ganha 1 a cada 7d, máx 2)
  dailyGoal: number                    // meta diária em cards (default 3, clamp 1-20)
  lastReviewDate: string | null
}
```

### SRS (Spaced Repetition System)

- **`src/lib/srs.ts`** — SM-2 simplificado puro (sem deps de localStorage). Exporta `createCard`, `reviewCard`, `getDueCards`, `getUpcomingCards`, `todayISO`, `daysBetween`.
- **Card id format:** `${slug}_q${questionIndex}` — dedupe automático em múltiplas submissões do mesmo quiz.
- **Quality map:** `again: 0 · hard: 3 · good: 4 · easy: 5`. Em `again` o card volta em 1 dia e `repetition = 0`.
- **XP por review:** `again: 0 · hard: 1 · good: 2 · easy: 4`. Streak toca em toda review confirmada.
- **Freeze:** ganhado em `streak % 7 === 0` (máx 2). Consumido automaticamente no `checkStreak` antes de quebrar o streak.
- **`/revisar`** (ReviewClient) — 4 fases: `empty-no-cards` / `empty-zero-due` / `answering` / `revealed` / `finished`. "Again" re-insere 2 posições deep no queue local (não re-busca do hook pra evitar flicker).
- **`HabitDashboard`** na home — só renderiza se `completedModules.length > 0 || reviewCards.length > 0`. 4 StatCards (streak, freezes, XP today, meta) + heatmap 12w × 7d com `color-mix` em `--ffv-green` sobre `--ffv-bg3`.

### Arquivos-chave
- `src/lib/curriculum.ts` — currículo completo (trilhas, módulos, XP, slugs)
- `src/lib/engine.ts` — funções de XP, badges, streak, localStorage
- `src/hooks/useGameState.ts` — hook React para qualquer componente
- `src/hooks/useTheme.ts` — hook do toggle dark/light
- `src/lib/srs.ts` — algoritmo SM-2 simplificado (puro, sem localStorage)
- `src/components/GameHUD.tsx` — HUD fixo (logo, nav, XP, streak, badges, toggle de tema, contador de cards devidos)
- `src/components/HabitDashboard.tsx` — dashboard de hábito (streak, freezes, XP today, meta, heatmap 12w)
- `src/components/ReviewClient.tsx` — fila SRS card-by-card (pergunta → reveal → rate again/hard/good/easy)
- `src/components/ThemeToggle.tsx` — botão sol/lua
- `src/components/ModuleLayout.tsx` — template de artigo com quiz (+ TOC flutuante via ArticleToc em xl+)
- `src/components/article/ArticleToc.tsx` — TOC auto-gerado a partir das `<Section>` do primitivo, com scroll spy
- `src/components/article/primitives.tsx` — Section, Callout, CodeBlock, ComparisonTable, DecisionBox (auto-ID)
- `src/components/TrailBlogClient.tsx` — listagem de artigos por trilha
- `src/components/HubPageClient.tsx` — página de hub (hero, stats, trilhas, cross-sell)
- `src/components/HomeClient.tsx` — home completa (editorial)
- `src/components/ProgressoClient.tsx` — dashboard `/progresso` (nível, XP, streak, badges, por hub, por trilha)
- `src/components/CommandPalette.tsx` — palette global Cmd/Ctrl+K (busca fuzzy por hub/trilha/artigo/página)

### Níveis de evolução
1. 🌱 Curioso (0–100 XP)
2. 📚 Aprendiz (100–250 XP)
3. ⚡ Praticante (250–500 XP)
4. 🔧 Desenvolvedor (500–800 XP)
5. 🧠 Especialista (800–1200 XP)
6. 🏗️ Arquiteto de IA (1200–1800 XP)
7. 🚀 Mestre da IA (1800+ XP)

---

## Tema Dark/Claro

Tema persistente via `localStorage.ffv_theme` (`'dark' | 'light'`).

**Como funciona:**
- `src/app/layout.tsx` injeta um script inline no `<head>` que lê `localStorage` (ou `prefers-color-scheme`) **antes do React montar** → zero FOUC. Setta `data-theme="..."` no `<html>`.
- `src/app/globals.css` define vars CSS em `:root, :root[data-theme="dark"]` e `:root[data-theme="light"]`. **Todas as cores do app usam essas vars** — troca automática ao alternar.
- `src/hooks/useTheme.ts` lê o atributo do DOM, expõe `toggle()`, `mounted` (evita mismatch de hidratação).
- `ThemeToggle` só renderiza ícone depois de `mounted` (placeholder de 32×32 antes).

**Regras ao adicionar cor nova:**
- Sempre use `var(--ffv-*)` ou `var(--foreground)` — nunca hardcode hex.
- Para mix com transparência em ambos os temas: `color-mix(in srgb, var(--ffv-blue) 12%, transparent)`.
- Cores de trilha (`trail.color`) têm valores distintos em cada tema (GitHub palette).

---

## Currículo — Trilhas e Módulos

### Trilha 1 — Fundamentos da IA (`#58a6ff`) — `/fundamentos-da-ia`

| Slug | Título | XP |
|------|--------|----|
| `o-que-e-ia` | O que é Inteligência Artificial? | 30 |
| `dados-o-combustivel` | Dados: o Combustível da IA | 30 |
| `como-ia-aprende` | Como a IA Aprende (Machine Learning) | 40 |
| `redes-neurais` | Redes Neurais: o Cérebro Artificial | 50 |
| `o-que-e-llm` | O que é um LLM? | 50 |
| `tokens` | Tokens e Tokenização | 40 |
| `transformers` | Transformers e Mecanismo de Atenção | 60 |

### Trilha 2 — IA Além do LLM (`#d2a8ff`) — `/ia-alem-do-llm`

| Slug | Título | XP |
|------|--------|----|
| `kv-cache` | KV Cache: Memória Eficiente | 60 |
| `mixture-of-experts` | Mixture of Experts (MoE) | 70 |
| `tool-calling` | Tool Calling e Agentes | 70 |
| `ia-alem-do-llm` | Harness: a Infraestrutura do Agente | 80 |
| `como-avaliar-modelos` | Como Avaliar Modelos de IA | 60 |

### Trilha 3 — Ferramentas de IA para Código (`#ffa657`) — `/ferramentas-ia-codigo`

Conteúdo research-backed com citações (SWE-bench, LMArena, docs oficiais).

| Slug | Título | XP |
|------|--------|----|
| `coding-agents-panorama` | O Panorama dos Coding Agents | 50 |
| `claude-code-arquitetura` | Claude Code: Filosofia e Arquitetura | 70 |
| `openai-codex-cloud` | OpenAI Codex: o Agente na Nuvem | 65 |
| `cursor-copilot-ides` | Cursor, Copilot e os IDEs Aumentados | 60 |
| `amazon-q-kiro` | Amazon Q e Kiro: a Aposta da AWS | 60 |
| `qual-coding-agent-usar` | Qual Ferramenta Usar e Quando | 80 |

### Trilha 4 — AWS Cloud Practitioner CLF-C02 (`#ff9900`) — `/aws-cloud-practitioner`

Nivelamento profissional alinhado aos 4 domínios do exame (Cloud Concepts 24% · Security 30% · Technology 34% · Billing 12%).

| Slug | Título | XP |
|------|--------|----|
| `o-que-e-cloud` | O que é Cloud Computing? | 30 |
| `aws-global-infra` | Infraestrutura Global: Regiões, AZs e Edge | 40 |
| `modelo-responsabilidade-compartilhada` | Modelo de Responsabilidade Compartilhada | 35 |
| `iam-fundamentos` | IAM: Identidade, Grupos, Roles e Policies | 60 |
| `compute-ec2-lambda` | Compute: EC2, Lambda e Containers | 60 |
| `storage-s3-ebs-efs` | Storage: S3, EBS, EFS, Glacier | 55 |
| `databases-aws-basico` | Databases: RDS, Aurora, DynamoDB, Redshift | 60 |
| `networking-vpc-route53` | Networking: VPC, Route 53, CloudFront | 55 |
| `seguranca-aws-servicos` | Segurança AWS: KMS, GuardDuty, Shield, WAF | 60 |
| `monitoramento-cloudwatch` | Monitoramento: CloudWatch, CloudTrail, Config | 45 |
| `well-architected-framework` | Well-Architected: os 6 Pilares | 50 |
| `cloud-adoption-framework` | Cloud Adoption Framework e os 7 Rs da Migração | 45 |
| `precificacao-suporte` | Precificação, Free Tier e Planos de Suporte | 50 |
| `migracao-aws-servicos` | Migração: Migration Hub, DMS, MGN e DataSync | 45 |
| `ai-ml-aws-servicos` | IA e ML na AWS: Bedrock, SageMaker, Q e Amigos | 50 |
| `developer-tools-aws` | Developer Tools: CodePipeline, CDK, CloudFormation e SAM | 45 |
| `simulado-practitioner` | Simulado CLF-C02 Comentado (20 questões) | 80 |

### Trilha 5 — AWS Solutions Architect Associate SAA-C03 (`#146eb4`) — `/aws-saa-c03`

Arquitetura de soluções alinhada aos 4 domínios (Secure 30% · Resilient 26% · High-Performing 24% · Cost-Optimized 20%).

| Slug | Título | XP |
|------|--------|----|
| `saa-c03-intro` | SAA-C03: Da Teoria à Arquitetura Real | 40 |
| `iam-avancado-organizations` | IAM Avançado: Policies JSON, STS, Organizations | 75 |
| `vpc-avancado` | VPC em Profundidade: NAT, Peering, Transit Gateway | 85 |
| `dns-cdn-edge` | Route 53, CloudFront e Global Accelerator | 70 |
| `ec2-autoscaling-elb` | EC2 Profissional: Auto Scaling e Load Balancers | 80 |
| `containers-ecs-eks` | ECS vs EKS: Orquestração de Containers | 70 |
| `serverless-lambda-avancado` | Serverless Avançado: Lambda, API GW, Step Functions | 80 |
| `s3-avancado` | S3 Profundo: Classes, Lifecycle, Replication, Object Lock | 80 |
| `block-file-storage` | EBS, EFS, FSx: Quando Usar Cada Um | 60 |
| `rds-aurora-dynamodb` | Bancos: Multi-AZ, Read Replicas, DynamoDB DAX/GSI | 90 |
| `caching-performance` | Caching: ElastiCache Redis vs Memcached, DAX | 60 |
| `messaging-eventos` | Messaging: SQS, SNS, EventBridge, Kinesis | 70 |
| `seguranca-avancada` | Segurança Avançada: KMS, Secrets Manager, WAF, Shield | 80 |
| `disaster-recovery` | Disaster Recovery: RPO, RTO e 4 Estratégias | 70 |
| `cost-optimization-saa` | Otimização de Custos: RI, Savings Plans, Spot | 60 |
| `analytics-bigdata` | Analytics: Athena, EMR, Kinesis, Glue, Redshift | 60 |
| `migracao-transferencia-saa` | Migração e Transferência: 7 Rs, DMS, MGN, Snow e Transfer Family | 75 |
| `rede-hibrida-saa` | Rede Híbrida: Direct Connect, VPN, PrivateLink e VPC Endpoints | 85 |
| `ml-ia-arquiteto-saa` | ML/IA para Arquiteto: SageMaker, Bedrock e Pipelines | 60 |
| `simulado-saa-c03` | Simulado SAA-C03 Comentado (25 questões) | 100 |

### Trilha 6 — Como Aprender (`#3fb950`) — `/como-aprender`

Trilha de meta-aprendizado: técnicas com maior evidência científica para fixar conhecimento. Complementa o mecanismo de SRS do Hub.

| Slug | Título | XP |
|------|--------|----|
| `revisao-espacada` | Revisão Espaçada: a técnica mais eficaz do mundo | 50 |
| `recall-ativo` | Recall Ativo: por que reler é quase inútil | 45 |
| `tecnica-feynman` | Técnica Feynman: se não explica, não entendeu | 40 |
| `interleaving` | Interleaving: por que misturar tópicos é melhor | 45 |
| `deep-work-pomodoro` | Deep Work + Pomodoro: foco real em mundo distraído | 40 |
| `habito-estudo-diario` | Hábito de Estudo Diário: o jogo longo | 50 |

### Trilha 7 — DevOps & Containers (`#2496ed`) — `/devops-containers`

Docker, Kubernetes e as plataformas profissionais de CI/CD — os pilares de toda infra moderna, explicados para durar.

| Slug | Título | XP |
|------|--------|----|
| `docker-completo` | Docker Completo: do zero ao production-ready | 100 |
| `kubernetes-completo` | Kubernetes Completo: do Pod ao cluster de produção | 120 |
| `github-actions-cicd` | GitHub Actions: CI/CD profissional do zero | 90 |
| `jenkins-pipelines` | Jenkins Pipelines: o CI/CD da era enterprise | 85 |
| `azure-devops-pipelines` | Azure DevOps Pipelines: CI/CD na Microsoft Cloud | 80 |
| `rancher-multicluster` | Rancher: gerenciando múltiplos clusters K8s sem sofrer | 75 |

### Trilha 8 — Engenharia de Software Moderna (`#e3b341`) — `/engenharia-software`

Deixar de ser coder e virar engenheiro de software de verdade — SDD, agents, testes profissionais, segurança real e arquitetura.

| Slug | Título | XP |
|------|--------|----|
| `engenheiro-vs-coder` | Engenheiro vs Coder: o que mudou na era dos agents | 60 |
| `spec-driven-development` | Spec-Driven Development (SDD): a nova espinha dorsal | 85 |
| `gerenciando-agents-ia` | Gerenciando Agents: orquestração, contexto e custo | 80 |
| `criando-agents-customizados` | Criando Agents Customizados: do subagent ao MCP | 90 |
| `testes-profissionais` | Testes Profissionais: pirâmide, propriedades, contrato e fuzz | 85 |
| `seguranca-software-real` | Segurança de Software de Verdade: threat model ao SBOM | 90 |
| `arquitetura-software-moderna` | Arquitetura Moderna: trade-offs, ADRs, C4 e evolução | 95 |

### Trilha 9 — Engenharia AI-Native (`#ff7eb6`) — `/ai-native`

RAG real, agent patterns, MCP, LLMOps — o que separa um protótipo de IA de um sistema AI-native em produção.

| Slug | Título | XP |
|------|--------|----|
| `rag-fundamentos` | RAG: por que "só jogar tudo no LLM" não funciona | 80 |
| `chunking-embeddings` | Chunking e Embeddings: as decisões que fazem ou quebram seu RAG | 85 |
| `hybrid-search-reranking` | Hybrid Search + Reranking: do BM25 ao cross-encoder | 90 |
| `rag-evaluation` | Avaliando RAG: recall@k, nDCG e LLM-as-judge | 80 |
| `agentes-padroes` | Agent Patterns: ReAct, Reflexion e Tree of Thoughts | 90 |
| `multi-agent-systems` | Multi-Agent Systems: orchestrator-worker, swarms e handoffs | 85 |
| `context-engineering` | Context Engineering: prompt caching, subagents e skills | 80 |
| `mcp-servers` | MCP Deep Dive: construindo um servidor profissional | 90 |
| `llm-apis-producao` | LLM APIs em Produção: streaming, structured output, batch e cache | 80 |
| `llmops-drift-canary` | LLMOps: eval harness, drift detection e canary de prompts | 90 |

### Trilha 10 — Sistemas Distribuídos (`#f78166`) — `/sistemas-distribuidos`

CAP, consensus, idempotência, sagas, event sourcing — a base técnica que separa "funciona no localhost" de "funciona em escala".

| Slug | Título | XP |
|------|--------|----|
| `cap-pacelc` | CAP e PACELC: o teorema que define toda arquitetura distribuída | 80 |
| `consistency-models` | Modelos de Consistência: strong, eventual, causal, read-your-writes | 85 |
| `consensus-raft` | Consensus e Raft: como nós discordam e chegam a acordo | 90 |
| `idempotencia-retries` | Idempotência e Retries: o antídoto pra rede que quebra | 75 |
| `sagas-2pc` | Sagas vs 2PC: transações distribuídas sem perder o sono | 85 |
| `event-sourcing-cqrs` | Event Sourcing e CQRS: quando eventos são a fonte da verdade | 85 |
| `postgres-mvcc-isolation` | Postgres Profundo: MVCC, Isolation Levels e Locks | 85 |
| `rate-limiting-distribuido` | Rate Limiting Distribuído: token bucket, sliding window, Redis | 75 |

### Trilha 11 — Observabilidade & SRE (`#79c0ff`) — `/observabilidade-sre`

Métricas RED/USE, OpenTelemetry, SLOs, error budgets, incident response — o que separa "fazer deploy" de operar sistema em produção.

| Slug | Título | XP |
|------|--------|----|
| `observability-pilares` | Observability: os 3 pilares (logs, métricas, traces) e por que não basta | 75 |
| `metricas-red-use` | Métricas RED e USE: os frameworks que cobrem 90% dos casos | 70 |
| `opentelemetry-stack` | OpenTelemetry end-to-end: instrumentação app → backend | 90 |
| `logs-estruturados` | Logs Estruturados: JSON, correlation IDs e levels com propósito | 70 |
| `distributed-tracing` | Distributed Tracing: spans, baggage e sampling strategies | 80 |
| `slos-error-budgets` | SLOs e Error Budgets: a contabilidade da confiabilidade | 80 |
| `incident-response-postmortem` | Incident Response: comando, comunicação e postmortem blameless | 80 |

### Trilha 13 — Claude & Anthropic na Prática (`#cc785c`) — `/claude-anthropic`

Do terminal ao deploy: Claude Code CLI, MCP, hooks, skills, API da Anthropic, prompt engineering e workflows profissionais.

| Slug | Título | XP |
|------|--------|----|
| `anthropic-ecossistema` | O ecossistema Anthropic: Claude, modelos, produtos e roadmap | 40 |
| `claude-code-primeiros-passos` | Claude Code: instalação, autenticação e primeiro uso real | 50 |
| `claude-code-modos-de-uso` | Modos de uso: interativo, não-interativo, pipe e headless | 60 |
| `claude-code-claude-md` | CLAUDE.md: como dar memória, contexto e personalidade ao agente | 65 |
| `claude-code-permissoes` | Permissões e segurança: o que Claude pode e não pode fazer | 55 |
| `claude-code-mcp-na-pratica` | MCP na prática: conectar Drive, GitHub, Slack e bancos de dados | 75 |
| `claude-code-hooks` | Hooks: automatizar revisões, validações e ações customizadas | 70 |
| `claude-code-skills-commands` | Skills e slash commands: criar seus próprios workflows | 65 |
| `claude-api-fundamentos` | API da Anthropic: messages, streaming, vision, batch e cache | 75 |
| `prompt-engineering-claude` | Prompt engineering para Claude: técnicas que realmente funcionam | 70 |
| `claude-em-producao` | Claude em produção: custo real, rate limits, caching e segurança | 80 |
| `workflows-ia-profissional` | Workflows profissionais: do problema ao resultado com Claude Code | 85 |

### Regra de slugs
**Slugs são IDs permanentes no localStorage** — nunca renomear um slug sem migração de dados do usuário.

---

## Como adicionar um novo artigo

1. **Adicionar no currículo** (`src/lib/curriculum.ts`):
```ts
{
  slug: 'meu-novo-artigo',
  title: 'Título do Artigo',
  icon: '🔥',
  xp: 50,
  readTime: 8,
  desc: 'Briefing curto que aparece no card.',
  seoDesc: 'Descrição para meta tag.',
  keywords: 'palavras, chave, seo',
}
```

2. **Criar a página** em `src/app/aprenda/meu-novo-artigo/page.tsx`:
```tsx
import { ModuleLayout } from '@/components/ModuleLayout';

const quiz = [ /* 3 perguntas */ ];

export default function Page() {
  return (
    <ModuleLayout
      slug="meu-novo-artigo"
      title="Título"
      icon="🔥"
      xp={50}
      readTime={8}
      trailName="Nome da Trilha"
      trailColor="#58a6ff"
      nextSlug="proximo-artigo"
      nextTitle="Próximo Artigo"
      quiz={quiz}
    >
      {/* conteúdo JSX */}
    </ModuleLayout>
  );
}
```

3. **Deploy** — seguir o gatilho `quero o zip`.

---

## Como adicionar uma nova trilha

Trilhas **não** são 100% dinâmicas — alguns mapeamentos manuais precisam ser atualizados. Checklist completo:

1. **`src/lib/curriculum.ts`**
   - Adicionar objeto `Trail` ao array `CURRICULUM` com `id: 'trailN'`, `name`, `desc`, `color`, `icon`, `modules: []`
   - Adicionar badge `trailN_done` ao `BADGES_DEF`

2. **`src/lib/engine.ts`**
   - O loop de `unlockBadge` em `checkCompletionBadges()` já itera `CURRICULUM` — nenhuma mudança necessária se você seguir a convenção `trailN_done`

3. **`src/components/HomeClient.tsx` — `TrailCard`** (⚠️ **gotcha**)
   - Existe um `hrefByTrailId` hardcoded que mapeia `trail.id` → rota. **Adicionar a nova trilha lá.** Sem isso, o card da home leva pra rota errada.

4. **`src/components/GameHUD.tsx`**
   - Adicionar `<Link>` da nova trilha no nav (usa cores da trilha via CSS var ou hex)

5. **`src/app/<rota-da-trilha>/page.tsx`**
   - Criar wrapper que renderiza `<TrailBlogClient trail={CURRICULUM[N]} />`

6. **`CLAUDE.md`**
   - Adicionar tabela de módulos na seção "Currículo"
   - Adicionar a rota à seção "Arquitetura de Páginas"
   - Adicionar a rota ao `for route in ... do` do deploy script
   - Adicionar a rota à estrutura final do `public_html/`

---

## Design System

Tema inspirado no GitHub (dark + light). Variáveis em `src/app/globals.css`.

### Dark (default)
```css
--ffv-blue:  #58a6ff  --ffv-green:  #3fb950  --ffv-purple: #d2a8ff
--ffv-orange:#ffa657  --ffv-red:    #f78166  --ffv-yellow: #e3b341
--ffv-bg:    #0d1117  --ffv-bg2:    #161b22  --ffv-bg3:    #21262d
--ffv-border:#30363d  --ffv-muted:  #8b949e
```

### Light
```css
--ffv-blue:  #0969da  --ffv-green:  #1a7f37  --ffv-purple: #8250df
--ffv-orange:#bc4c00  --ffv-red:    #cf222e  --ffv-yellow: #9a6700
--ffv-bg:    #ffffff  --ffv-bg2:    #f6f8fa  --ffv-bg3:    #eaeef2
--ffv-border:#d1d9e0  --ffv-muted:  #59636e
```

Referências visuais: Linear, Vercel, Raycast (layout), Duolingo/Codecademy (gamificação).

---

## Convenções

- **Idioma:** Português brasileiro em todo conteúdo e UI.
- **Trilhas abertas** — sem bloqueio entre trilhas.
- **SEO:** cada módulo tem `seoDesc` e `keywords` — manter no `metadata` do Next.js.
- **100% gratuito, sem cadastro.**
- **Não usar `next/image`** — desabilitado para export estático (`images: { unoptimized: true }`).
- **Cores sempre via CSS vars** — nunca hardcode, para não quebrar tema claro.
- **Mensagens de tooltip, aria-label, erros** — sempre em PT-BR.

---

## Gotchas Conhecidos

### 1. `shadcn/ui` aqui usa `@base-ui/react`, não Radix
O `TooltipTrigger`, `Popover`, etc. vêm de `@base-ui/react/*`. **Não existe a prop `asChild`** (isso é Radix). Use o padrão `render`:

```tsx
// ❌ Errado — asChild não existe, props vazam como atributo HTML
<TooltipTrigger asChild><button>...</button></TooltipTrigger>

// ❌ Errado — <button> aninhado (hydration error)
<TooltipTrigger><button>...</button></TooltipTrigger>

// ✅ Certo — render funde o trigger com o botão
<TooltipTrigger render={<button type="button" onClick={fn} />}>
  {children}
</TooltipTrigger>
```

### 2. Estado do dev server após mudanças grandes
Turbopack cacheia. Se comportamento estranho persistir, sempre:
```bash
pkill -f "next-server"; rm -rf .next && npm run dev
```

### 3. Hidratação e `localStorage`
Nunca leia `localStorage` direto em componentes server — use sempre dentro de `useEffect` e marque um `mounted` state para evitar mismatch. Padrão em `useTheme.ts` e `useGameState.ts`.

### 4. Variável de tema no HTML
A tag `<html>` tem `suppressHydrationWarning` em `layout.tsx` porque o script inline altera `data-theme` antes do React rodar — sem essa prop, o Next avisa em todo render.

### 5. `TrailCard` usa mapa `trail.id` → rota hardcoded
Em `HomeClient.tsx` o `TrailCard` tem um `hrefByTrailId` hardcoded. Ao adicionar uma trilha nova, **sempre atualizar esse mapa** — caso contrário o card da home leva pra rota default (ou errada). Ver checklist em "Como adicionar uma nova trilha".
