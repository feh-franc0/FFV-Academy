# TEACHING_METHOD — FFV Academy

> **O que é a FFV em uma frase:** plataforma onde **você** envia qualquer conteúdo (PDF, imagem, texto, link, áudio, vídeo) e a FFV transforma isso num plano de estudo **estruturado pedagogicamente**, com **100 questões calibradas por Taxonomia de Bloom** e revisão espaçada (SRS) — pra você reter de verdade, não só ler.
>
> **Última atualização:** 2026-05-26 · v1.0
> **Mantenedor:** Fernando + Claude

---

## 0. TL;DR — O que o aluno faz

```
1. Sobe o conteúdo (PDF, foto da apostila, link do artigo, vídeo do YouTube, áudio da aula).
2. A FFV processa em ~60-180s.
3. Recebe um módulo estruturado: resumo + mapa conceitual + 100 questões + cards SRS.
4. Estuda com revisão espaçada + simulado dos 100 itens.
5. Repete pra cada conteúdo que precisa dominar.
```

O conteúdo é **dele**. A FFV é o **método** que transforma material bruto em aprendizado retido.

---

## 1. Princípio central — "100 questões, sempre"

> **Toda peça de conteúdo que entra na FFV vira 100 questões.** Nunca 30, nunca 60, nunca 200. Sempre 100.

Por quê 100 (e não outro número):

- **N suficiente pra cobrir Bloom todo** (6 níveis × variantes).
- **N suficiente pra simulado de 60-90min** (tempo médio de prova real).
- **N pequeno o bastante** pra um aluno terminar em 1 sessão de ataque.
- **Padronização cria comparabilidade** — sua nota num módulo se compara à de outro (mesmo denominador).
- **Cria expectativa clara** — aluno sabe o que vai receber, sem ansiedade de "será que vou ter quizzes suficientes?".

**Regra dura:** se o conteúdo enviado é curto demais pra gerar 100 questões dignas (ex: post de 200 palavras), a FFV **recusa** e pede mais material. Não dilui qualidade.

---

## 2. Pipeline técnico — o que acontece quando você sobe um arquivo

```
┌──────────────────────────────────────────────────────────────────────┐
│  INPUT                                                               │
│  ┌─────────┐  ┌─────────┐  ┌────────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │   PDF   │  │ IMAGEM  │  │ TEXTO  │  │ LINK │  │ÁUDIO │  │VÍDEO │  │
│  └────┬────┘  └────┬────┘  └────┬───┘  └──┬───┘  └──┬───┘  └──┬───┘  │
│       └────────────┴────────────┴─────────┴─────────┴─────────┘      │
│                              │                                       │
└──────────────────────────────┼───────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  ETAPA 1 — INGESTÃO (extrair texto cru)                              │
│  • PDF: pdf.js / pdfplumber                                          │
│  • Imagem: OCR (Tesseract → fallback Claude Vision)                  │
│  • Áudio/Vídeo: Whisper / AssemblyAI                                 │
│  • Link: Readability + screenshot (Playwright)                       │
│  • YouTube: yt-dlp + transcript API                                  │
│  Saída: blob de texto + metadados (qtd páginas, idioma, …)           │
└──────────────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  ETAPA 2 — ANÁLISE PEDAGÓGICA (Claude Opus 4.7)                      │
│  Identifica:                                                         │
│  • Nível cognitivo do material (intro / intermediário / avançado)   │
│  • Domínio (técnico / humanas / médico / direito / …)               │
│  • 10-30 conceitos-chave + relações entre eles                       │
│  • Pré-requisitos implícitos                                         │
│  Saída: árvore conceitual em JSON                                   │
└──────────────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  ETAPA 3 — ESTRUTURAÇÃO (gera o módulo)                              │
│  • Resumo executivo (1 página, ≤500 palavras)                        │
│  • Mapa conceitual (mermaid / D3)                                    │
│  • Sequência didática (3-7 tópicos com ordem de estudo)              │
│  • Glossário (termos técnicos + definição em PT-BR coloquial)        │
│  • "Por que estudar isto" (1 parágrafo — motivação)                  │
└──────────────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  ETAPA 4 — GERAÇÃO DAS 100 QUESTÕES (Bloom-calibrada)                │
│  Distribuição obrigatória:                                           │
│  • 20 LEMBRAR    (definições, fatos, listagens)                      │
│  • 30 ENTENDER   ("por que", "como funciona", comparações)           │
│  • 25 APLICAR    (cálculo, exercício prático, código)                │
│  • 15 ANALISAR   (decompor, achar erros, contrastar)                 │
│  • 7  AVALIAR    (criticar, defender posição, custo/benefício)       │
│  • 3  CRIAR      (projetar, sintetizar, propor solução nova)         │
│  Cada questão tem: enunciado, alternativas (4-5), gabarito,         │
│  explicação ("por que essa é a certa, por que as outras não")        │
└──────────────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  ETAPA 5 — GERAÇÃO DOS CARDS SRS                                     │
│  • 1 card por questão (100 cards no total)                           │
│  • Frente: pergunta. Verso: resposta + explicação.                   │
│  • Tag automática por nível Bloom + por conceito-chave               │
│  • Entram no algoritmo SM-2 (ou FSRS-6 quando migrarmos)             │
└──────────────────────────────────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  ETAPA 6 — VALIDAÇÃO AUTOMÁTICA                                      │
│  Antes de entregar pro aluno, segundo modelo (Sonnet) revisa:        │
│  • Cada questão tem 1 e só 1 gabarito correto?                       │
│  • Alternativas são plausíveis ou óbvias demais?                     │
│  • Distribuição de Bloom bateu (±2 por nível)?                       │
│  • Glossário tem todos os termos das questões?                       │
│  Se falhar: re-gera o subset.                                        │
└──────────────────────────────────────────────────────────────────────┘
                               ▼
                       MÓDULO ENTREGUE
```

**SLA-alvo:** 2-3 minutos para conteúdos típicos (PDF de 10-50 páginas). Acima de 100 páginas, processamento em background com notificação por email/push.

---

## 3. Por que isto funciona pedagogicamente

Cada decisão acima está ancorada em research empírico de aprendizado:

| Decisão | Princípio científico que sustenta |
|---------|------------------------------------|
| 100Q sempre, não "quantas o conteúdo der" | **Padronização reduz cognitive load** (Sweller) — aluno não gasta energia decidindo "estudo o suficiente?" |
| Distribuição Bloom obrigatória | **Taxonomia de Bloom revisada (Anderson & Krathwohl, 2001)** — testes só de Lembrar criam decoreba; mistura cria entendimento real |
| Cards SRS automáticos | **Spaced Repetition (Ebbinghaus, 1885 → Karpicke, 2008)** — única intervenção com efeito comprovado de retenção a longo prazo |
| Quiz com explicação na hora | **Feedback imediato consolida 10x melhor** (Hattie, 2007) |
| Aluno traz o conteúdo | **Generation effect (Slamecka & Graf, 1978)** — aprendizado é mais profundo quando o aluno escolhe e organiza, não consome passivo |
| Mapa conceitual obrigatório | **Schema Theory (Bartlett, 1932)** — memória estrutural retém mais que memória de itens isolados |
| Resumo + glossário antes do quiz | **Pre-training principle (Mayer, 2005)** — apresentar termos antes reduz cognitive load durante teste |
| Validação automática por 2º modelo | **Quality gate** — questão mal-feita "ensina errado". Inadmissível. |

Documento canônico de referência sobre os princípios pedagógicos: `docs/SKILL_ADVISOR.md` (seção "Pedagogia aplicada").

---

## 4. Inputs aceitos (canônico)

| Tipo | Formatos | Limite | Como processa |
|------|----------|--------|---------------|
| **PDF** | `.pdf` | 50 MB / 500 páginas | pdf.js extrai texto; fallback OCR pra PDFs scaneados |
| **Imagem** | `.png .jpg .webp .heic` | 10 MB / até 20 imagens batch | OCR (Tesseract) + Claude Vision pra context |
| **Texto** | colado direto ou `.txt .md .docx` | 200k caracteres | Direto |
| **Link web** | URL | qualquer | Readability extrai conteúdo + Playwright pra dinâmicos |
| **YouTube** | URL | ≤4h vídeo | Transcript oficial → fallback Whisper |
| **Áudio** | `.mp3 .m4a .wav .ogg` | 2h / 200 MB | Whisper (transcrição) |
| **Vídeo** | `.mp4 .mov .webm` | 1h / 500 MB | Áudio extraído → Whisper |
| **Apostila escaneada** | PDF / múltiplas imagens | igual aos acima | OCR forte + reordenação de páginas |

**Não aceitamos** (por enquanto): planilhas Excel cruas, slides PPT (converter pra PDF), código-fonte puro (usar pra explicar conceitos é tarefa de outro produto), arquivos protegidos por DRM.

---

## 5. O que o aluno recebe — anatomia de um módulo gerado

```
📚 MÓDULO: <título inferido do conteúdo>

├── 📋 Resumo executivo (≤500 palavras)
├── 🗺️  Mapa conceitual (mermaid)
├── 📖 Sequência didática (3-7 tópicos numerados)
├── 📕 Glossário (termos técnicos)
├── 🎯 Por que estudar isto (1 parágrafo)
├── 📝 100 Questões
│    ├── 20 de Lembrar
│    ├── 30 de Entender
│    ├── 25 de Aplicar
│    ├── 15 de Analisar
│    ├── 7 de Avaliar
│    └── 3 de Criar
├── 🃏 100 Cards SRS (1:1 com questões)
├── 🏁 Simulado dos 100 itens (tempo cronometrado)
└── 📊 Tracking de progresso (% acerto, tempo médio, cards em revisão)
```

Tudo isso é gerado em 1 passada. Aluno NUNCA precisa pedir "gera mais 30 quizzes" — já tem 100.

---

## 6. Como o aluno usa (método operacional)

> Quando carregar este doc no advisor, ele aplica este método como **resposta-padrão** pra "como estudar?".

### Dia 1 do módulo (atacar conteúdo novo)

1. **Lê o resumo executivo** (5min).
2. **Examina o mapa conceitual** (3min) — entender as conexões antes de mergulhar.
3. **Lê a sequência didática** (15-25min) — passa pelos 3-7 tópicos na ordem proposta.
4. **Faz primeiro lote de quiz** (20Q de Lembrar + 10 de Entender) (20min) — calibração inicial.
5. **Marca cards SRS** baseado em erros.

**Total dia 1: ~60min.** Não tentar fazer as 100 num dia só. Resistir.

### Dias 2-7 (consolidar)

- **Diário:** revisa cards SRS due hoje (10-15min) + faz 10-15 quiz novos (15min).
- **Foco em Aplicar e Analisar** nas sessões 4-7.
- Dia 6: revisita o resumo + glossário antes do simulado.

### Dia 7 (simulado)

- Faz os 100 itens cronometrado (60-90min, depende da complexidade).
- Meta: ≥70% acerto.
- Se <70%: identifica os conceitos com maior erro → 3 dias extras só nesses cards → re-simulado.
- Se ≥85%: módulo dominado. Próximo conteúdo.

### Após dominar — manutenção

- Cards continuam no SRS. Aparecem a cada 30/60/120 dias automaticamente.
- Nunca "arquiva" um módulo. Conhecimento mantido com 5-10min/dia revisando o backlog.

---

## 7. Diferença vs. "ferramentas de quiz a partir de PDF" do mercado

> **A FFV não compete com gerador-de-quiz. A FFV é um método pedagógico embutido em software.**

| Dimensão | Concorrente típico | FFV |
|----------|--------------------|----|
| Quantidade de questões | 5-30 (variável) | **100 sempre** |
| Distribuição cognitiva | Misturada/aleatória | **Bloom calibrado (20/30/25/15/7/3)** |
| SRS real | Raro (ou pseudo-SRS) | **SM-2 / FSRS-6 nativo** |
| Estruturação pedagógica | Só Q&A | **Resumo + mapa + glossário + sequência + simulado** |
| Validação de qualidade | Single-shot | **2 modelos (gerador + validador)** |
| Idioma | EN ou tradução fraca | **PT-BR nativo** |
| Método de estudo embutido | Não | **Sim — protocolo dia-a-dia explicito** |
| Custo | $5-30/mês | **Gratuito** |

Detalhamento em `STRATEGY.md` (análise competitiva e SWOT).

---

## 8. O papel do currículo curado (157 módulos)

A FFV continua com os 157 módulos curados nas 8 bases (Tecnologia, Medicina Veterinária, Carreira, Comunicação, Marketing, Conteúdo, Empreendedorismo, Inglês). Eles **mudam de papel**:

- **Antes do pivot:** eram o produto principal.
- **Depois do pivot:** viram **biblioteca pública** + **showcase do método**.

Razões pra manter:
1. **Prova social pedagógica** — quem visita FFV vê que o método produz módulos sérios.
2. **Seed pro SEO** — long-tail PT-BR ("como funciona o transformer", "MVCC postgres") trazendo tráfego orgânico.
3. **Onboarding** — usuário novo pode estudar um módulo pronto antes de subir o próprio.
4. **Calibração contínua** — comparamos qualidade do user-generated vs curado pra melhorar o pipeline.

Razões pra NÃO expandir agressivamente:
1. Cada módulo curado custa horas de Fernando. User-generated escala sozinho.
2. Mercado quer "sobe e estuda", não "navegue um currículo".

**Decisão:** congelar curadoria nova até user-generated rodar bem. Manter os 157 como acervo.

---

## 9. Métricas-norte do método (não confundir com BSC de negócio)

5 métricas que dizem se o método está funcionando:

1. **Taxa de geração com sucesso** — % de uploads que viram módulo completo (sem erro). Alvo: >95%.
2. **Distribuição de Bloom real** — média da distribuição entregue vs. esperada (20/30/25/15/7/3). Desvio máx: ±2/nível.
3. **Acerto médio no 1º simulado** — alvo: 50-65%. Acima é fácil demais; abaixo é difícil demais.
4. **Retenção em 30 dias** — % de cards do módulo lembrados após 30d. Alvo: >70%.
5. **NPS pedagógico** — "este módulo te ajudou a entender o conteúdo?" Alvo: ≥70.

Métricas de negócio (DAU, MRR, etc.) ficam em `STRATEGY.md`.

---

## 10. Anti-padrões — o que o método NÃO faz

- ❌ **Não gera "quiz fácil pra dar XP"** — dificuldade é calibrada pelo nível do conteúdo, não pelo que entretém o aluno.
- ❌ **Não esconde fontes** — toda explicação cita o trecho do conteúdo original que sustenta a resposta.
- ❌ **Não substitui leitura do material original** — questões reforçam, não substituem.
- ❌ **Não "resume pra você pular o livro"** — resumo é índice, não atalho.
- ❌ **Não engana com gamificação vazia** — XP, badges, ranking só fazem sentido se medirem **retenção real**, não tempo de tela.
- ❌ **Não gera 100Q de qualquer coisa** — se o input é insuficiente, recusa e pede mais.
- ❌ **Não promete fluência em X dias** — promete método. Resultado depende do aluno.

---

## 11. Roadmap de evolução do método

| Fase | Status | Marco |
|------|--------|-------|
| **v1.0** — pipeline básico (PDF + texto → 100Q) | 🔄 Em construção | jun/2026 |
| **v1.1** — imagem (OCR) + link web | Planejado | jul/2026 |
| **v1.2** — YouTube + áudio | Planejado | ago/2026 |
| **v2.0** — vídeo nativo + múltiplos arquivos por módulo | Planejado | out/2026 |
| **v2.1** — colaboração (compartilhar módulos gerados) | Planejado | nov/2026 |
| **v3.0** — FSRS-6 substitui SM-2 | Planejado | 2027 |
| **v3.1** — adaptativo (questões geradas dinamicamente conforme erros) | Pesquisa | 2027 |

Detalhamento em `ROADMAP.md`.

---

## 12. Como o advisor usa este documento

Quando o Fernando pergunta "essa feature faz sentido pro método?", a resposta passa por:

1. **Mantém a regra das 100Q?** Sim/Não.
2. **Respeita a distribuição Bloom?** Sim/Não.
3. **Reforça SRS ou compete com ele?**
4. **Aumenta retenção mensurável (métrica #4) ou só engagement?**

Se 2+ respostas forem "Não" / "engagement", a feature **não entra**.

---

**Mantenedor:** Fernando + Claude
**Próxima revisão:** após v1.0 do pipeline rodar com 100 usuários reais
