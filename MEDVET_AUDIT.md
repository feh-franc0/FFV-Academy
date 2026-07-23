# Auditoria de Conteúdo — Trilha de Genética Veterinária

Comparação entre os 12 módulos TS (`frontend/src/lib/bases/medvet/genetica-modules-{1,2,3}.ts`) e os PDFs originais da Profa. Rafaella Olivieri (`/tmp/medvet-pdf-texts/*.txt`).

Data: 2026-05-19

---

## Módulo 1 — Genética de Populações ✅ Completo (com bônus)

**Mapeamento PDF:** `Aula 1 - Genética de Populações.txt`

### Conceitos do PDF cobertos no módulo
- Genética, hereditariedade (previsível e calculável) ✓
- Caracteres específicos × individuais ✓
- Caracteres adquiridos × hereditários ✓ (módulo aborda; PDF afirma vagamente o contrário — "podem ser transmitidas à descendência")
- DNA, gene, cromossomo, mitose/meiose ✓
- Cromossomos homólogos, células diploides ✓
- Locus, alelos, genótipo, fenótipo ✓
- Homozigoto/heterozigoto, dominância/recessividade ✓
- Influência do ambiente sobre fenótipo ✓

### Onde o módulo é mais rico que o PDF (bônus pedagógico)
- Número de cromossomos por espécie (bovinos 60, cães 78, gatos 38, etc.) — não está no PDF
- Exemplo Aberdeen Angus com cruzamento Aa × Aa e proporções esperadas
- Distinção explícita entre o que é hereditário vs adquirido
- Exemplo da vaca leiteira em climas diferentes (G × A)

### Possível erro no PDF (módulo está correto)
O PDF diz literalmente "Mudanças na fisiologia adquiridas durante a vida de um organismo podem ser transmitidas à descendência" — isto é Lamarckismo, está errado. O módulo TS corrige isto no callout "Caráter adquirido vs. hereditário".

### Conceitos do PDF que o módulo já antecipa (e estão melhor no módulo 3/5)
- Dominância completa, ausência de dominância, co-dominância, alelos múltiplos, pleiotropia, alelo letal — todos aparecem no PDF da Aula 1 como preview, mas o módulo os deixa para os próximos módulos (decisão pedagógica correta).

### Quiz (4 questões)
- Cobre: cruzamento Aa × aa, definição de heterozigoto, genótipo × fenótipo, influência ambiental.
- **Lacuna:** falta questão sobre caracteres específicos × individuais e sobre caráter adquirido não transmitido. Recomendado: adicionar 1 questão sobre adquirido vs hereditário (Lamarck erro).

**Veredito:** ✅ Completo. Pequena melhoria possível no quiz.

---

## Módulo 2 — Leis de Mendel ✅ Completo

**Mapeamento PDF:** `Aula 2 - Leis de Mendel.txt`

### Conceitos cobertos
- Gregor Mendel (1822–1884), pai da genética, trabalho redescoberto em 1900 ✓
- Ervilhas: ciclo curto, fácil cultivo, muitos descendentes, linhagens puras ✓
- 1ª Lei (segregação): F1 100% Aa, F2 razão 3:1 fenotípica e 1:2:1 genotípica ✓
- 2ª Lei (segregação independente, di-hibridismo) ✓
- Cruzamento AaBb × AaBb com quadro de Punnett: 9:3:3:1 ✓
- Linhagens puras AABB × aabb → 100% AaBb ✓
- Fatores Mendelianos = genes ✓

### Onde o módulo é mais rico que o PDF
- Callout explicando que a 2ª Lei NÃO se aplica em genes ligados (linkage). Não está no PDF, é adição correta e relevante.
- Tabela explícita do quadro de Punnett 4×4 em texto.
- Distinção clara entre razão fenotípica e genotípica.

### Quiz (5 questões)
- Cobre: razão 3:1, escolha de ervilhas, razão 9:3:3:1, pré-requisito da 2ª Lei, F1 de linhagens puras.
- Excelente cobertura.

**Veredito:** ✅ Completo.

---

## Módulo 3 — Ações Gênicas entre Alelos ⚠️ Pequena lacuna conceitual

**Mapeamento PDF:** `Aula 2 - Ação Gênica entre Alelos.txt`

### Conceitos cobertos
- Dominância completa (3:1, exemplo chifres em bovinos + Aberdeen Angus) ✓
- Ausência de dominância (1:2:1, exemplo Shorthorn) ✓
- Co-dominância (vaquinha malhada) ✓
- Dominância parcial (valores entre média e homozigoto) ✓
- Sobredominância (heterozigoto > melhor pai) ✓
- Tabela resumo com valores genotípicos (referência A1A1=10, A2A2=4) ✓
- Galinha Andaluza (preta × branca = azul, ausência de dominância) — no quiz ✓

### Lacunas
- **PDF separa "Ausência de Dominância" de "Co-Dominância"** (slide com vaca cinza vs vaca malhada). O módulo trata co-dominância como "variação" de ausência de dominância. Conceitualmente, são fenômenos distintos: ausência de dominância = mistura (fenótipo intermediário homogêneo); co-dominância = expressão simultânea (mosaico/malhado/dois antígenos). O módulo deveria deixar isso mais explícito.
- O PDF dá os EXERCÍCIOS de classificação por valor numérico (A1A2 = 8, 12, 4, etc.) — o módulo TS tem tabela equivalente.

### Quiz (4 questões)
- Cobre: galinha Andaluza (ausência), dominância parcial cálculo, Shorthorn rosilho, sobredominância.
- Bom, mas poderia ter questão específica sobre co-dominância (vaca malhada vs vaca cinza).

**Veredito:** ⚠️ Pequena lacuna — co-dominância deveria ser concept separado, não sub-tópico.

---

## Módulo 4 — Alelismo Múltiplo ✅ Completo (com bônus veterinário)

**Mapeamento PDF:** `Alelismo Multiplo.txt`

### Conceitos cobertos
- Definição: >2 alelos no mesmo locus na população ✓
- Coelhos: série C > c^ch > c^h > c^a com 4 fenótipos ✓
- Sistema ABO humano: IA, IB, i; co-dominância de IA/IB ✓

### Onde o módulo é mais rico que o PDF
- Tabela completa de genótipos × fenótipos em coelhos
- Aplicação veterinária: grupos sanguíneos DEA em cães, A/B/AB em gatos, eritrólise neonatal felina — NÃO ESTÁ no PDF (é adição clínica relevante).
- Quiz inclui questão sobre eritrólise neonatal felina.

### Quiz (4 questões)
- Cobre: definição, AB co-dominante, fenótipo c^ch c^a chinchila, transfusão felina.
- Excelente cobertura.

**Veredito:** ✅ Completo. Módulo é mais rico que o PDF (bom).

---

## Módulo 5 — Genes Letais ✅ Completo

**Mapeamento PDF:** `Genes Letais.txt`

### Conceitos cobertos
- Experimento de Cuénot 1905 (ratos amarelos × amarelos = 2/3 : 1/3) ✓
- Definição: gene letal, gametas vs zigotos ✓
- Mutação como origem ✓
- Letal dominante c/ efeito dominante (AA, Aa morrem) ✓
- Letal dominante c/ efeito recessivo (AA morre, Aa vive c/ anomalia) ✓
- Acondroplasia Dexter (coluna curta, hérnia, palato fendido) ✓
- Galinha rastejante (gene C) ✓
- Manx em gatos (rumpy, rumpy riser, stumpy, longie) ✓
- Letal recessivo: DUMPS em Holandeses ✓
- Fenocópia (ácido bórico em ovos, sementes de Swainsona) ✓
- Manosidose em bovinos (PDF tem, módulo menciona) ✓
- Penetrância (polidactilia em aves ~60%) ✓
- Expressividade (sindactilia em suínos/bovinos) ✓
- Pleiotropia (gene Polled, intersexualidade) ✓
- Aconselhamento genético (cálculo de risco com penetrância) ✓

### Conceitos do PDF NÃO cobertos no módulo
- Exemplo 3 do PDF: **gene Hr em várias raças de cães** (homozigose letal, anomalia no crânio/esôfago; heterozigose poucos pelos cabeça/patas, número reduzido de dentes). Vale adicionar como exemplo ou ao menos no quiz.
- Tabela detalhada do gene Polled (PP fêmeas estéreis com intersexualidade, Pp normais, etc.) — módulo menciona mas sem detalhamento.

### Quiz (6 questões)
- Excelente cobertura: Cuénot/ratos, Dexter, DUMPS, Manx, fenocópia, penetrância.

**Veredito:** ✅ Completo. Falta apenas o gene Hr de cães (menor).

---

## Módulo 6 — Interação Gênica entre Não-Alelos ⚠️ Pequena lacuna

**Mapeamento PDF:** `Aula 7 - Interação Gênica entre não-alelos.txt`

### Conceitos cobertos
- Tipos de crista em galinhas (rosa, ervilha, noz, serra) com cruzamentos detalhados ✓
- Interação complementar 9:3:3:1 ✓
- Cor de pelagem em equinos (preto/alazã/baio/castanho) ✓
- Cor de pelagem em suínos (vermelha/amarelo-suja/branca 9:6:1) ✓
- Interação multiplicada (penas nos pés galinhas 15:1) ✓
- Epistasia dominante/inibidora (plumagem Leghorn 13:3) ✓
- Epistasia recessiva/suplementar (Labrador preto/marrom/dourado 9:3:4) ✓

### Lacunas
- **Erro pequeno na tabela do PDF da plumagem:** o PDF mostra a fórmula com penas Leghorn de modo um pouco confuso (`PENAS BRANCAS - C_I_`); o módulo TS está mais claro.
- **PDF de suínos:** mostra razão 9:6:1 explicitamente (vermelha : amarelo-suja : branca). O módulo TS menciona "9/16 vermelha, 6/16 amarelo-suja, 1/16 branca" mas não chama isso de "complementar com fusão" — apenas na tabela resumo. Está OK.

### Quiz (5 questões)
- Cobre: 9:3:3:1, Labrador ccee, 13:3, 15:1, dourados de pais marrons.
- Excelente.

**Veredito:** ⚠️ Conteúdo completo, mas terminologia "complementar com fusão (9:6:1)" merece mais destaque no corpo (não só na tabela).

---

## Módulo 7 — Interação Gênica em Gatos ✅ Completo

**Mapeamento PDF:** `Aula 9 - Interação gênica (gatos).txt`

### Conceitos cobertos
- 8 loci: B, A, D, S, T, C, W, O ✓
- Loco B (B_ preto, bb marrom) ✓
- Loco A (A_ aguti, aa não aguti) ✓
- Loco D (D_ intenso, dd diluído; preto+dd=azul, marrom+dd=lilás) ✓
- Loco S (manchas brancas irregulares) ✓
- Loco T (tabby Ta > T > tb; mackerel, blotched) ✓
- Loco C série alélica completa (C > c^ch > c^b ≥ c^s > c) ✓
- Siamês acromelanismo (tirosinase termo-sensível) ✓
- Loco W epistático (branco, surdez em olhos azuis) ✓
- Loco O ligado ao X (laranja, casco-de-tartaruga, Klinefelter em machos) ✓

### Detalhes do PDF não totalmente cobertos
- PDF tem variações detalhadas: cs cs aa = seal-point, cs cs aadd = blue-point, cs cs aabb = chocolate-point, cs cs O_ = red-point. Módulo menciona siamês mas não os pontos específicos (seal/blue/chocolate/red). Pode-se adicionar.
- PDF cita: "Loco O promove epistasia no loco B". Módulo TS aborda a parte do X-linked mas não menciona explicitamente a epistasia O × B (em laranja, o B/b fica mascarado).

### Quiz (5 questões)
- Cobre: siamês termo-sensível, casco-de-tartaruga, W epistático, macho calico Klinefelter, tabby requer A_.
- Excelente.

**Veredito:** ✅ Completo. Pontos siameses específicos (seal/blue/chocolate/red) podem ser adicionados como bônus.

---

## Módulo 8 — Cor de Pelagem em Mamíferos (cães) ✅ Completo

**Mapeamento PDF:** `Interação gênica cor de pelagem em mamíferos.txt`

### Conceitos cobertos
- Subpelo × sobrepelo, função (PDF tem detalhe; módulo não — não é grave, é peso menor)
- Eumelanina (preto/castanho) × feomelanina (amarelo/bronze/vermelho) ✓
- Melanócitos, melanossomos ✓
- Loco C (TYR): C > Cch > c ✓
- Loco B (TYRP1): B_ preto, bb marrom ✓
- Loco A (ASIP): a^y > a^w > a^t > a — sable, aguti, bicolor, preto ✓
- Loco E (MC1R): E^m máscara, E normal, e bloqueia eumelanina ✓
- Loco K: K^B > K^br > K^y ✓
- Loco D: diluição ✓
- Loco I: diluição da feomelanina em ee ✓
- Loco S: S > S^i > S^p > s^W ✓
- Loco T: pintas em áreas brancas ✓
- Loco M: merle MM letal/sub-letal ✓
- Exercício Golden ee a^y ii ✓ (módulo TS tem como exemplo)

### Detalhes não cobertos (menores)
- Exercício de cruzamento entre CCBbsEmEm × cchcbsbsee do PDF — módulo decodifica Golden mas não esse cruzamento específico. Pode virar uma questão do simulado.
- Loco C tem alelos B > b^s = b^d = b^c no PDF (módulo simplifica para B/b). Está OK pra fins didáticos.

### Quiz (5 questões)
- Cobre: ee bloqueia eumelanina, merle MM problemas, Doberman a^t bicolor vs aa, Labrador chocolate bb, K^B epistático.
- Excelente.

**Veredito:** ✅ Completo.

---

## Módulo 9 — Padrões de Herança ✅ Completo

**Mapeamento PDF:** `Aula 8 - Padrões de Herança.txt`

### Conceitos cobertos
- Doenças hereditárias × multifatoriais ✓
- Autossômica recessiva (PKU, artrogripose, acrodermatite, epiteliogênese imperfeita, PRA, Chediak-Higashi) ✓
- Autossômica dominante (acondroplasia Dexter, Merle, Manx, entrópio, PKD Persa, cardiomiopatia hipertrófica) ✓
- Ligada ao X (recessiva, machos hemizigotos, distrofia muscular Golden/Terrier Irlandês análoga a Duchenne) ✓
- Restrita ao Y (holândrica, hipertricose auricular, juba) ✓
- Limitada pelo sexo (leite, ovos, circunferência escrotal) ✓
- Influenciada pelo sexo (calvície, chifres Dorset, pelagem Ayrshire) ✓
- Doenças multifatoriais (displasia coxofemoral, obesidade, dermatites) ✓
- Heredograma (círculo fêmea, quadrado macho, preenchido afetado) ✓

### Detalhes do PDF interessantes não cobertos
- Febre do Sharpei (excesso de ácido hialurônico) — exemplo extra, não obrigatório
- Pelagem Ayrshire como exemplo de herança influenciada — módulo menciona Dorset mas Ayrshire pode ser adicionado
- PDF tem **muitos exercícios de heredograma** — o módulo tem tabela mas poderia mais exemplos visuais

### Quiz (6 questões)
- Cobre: AR (pais portadores), distrofia X (50%), DCF multifatorial, leite limitada, PKD dominante, macho calico Klinefelter.
- Excelente.

**Veredito:** ✅ Completo. Mais exercícios de heredograma ajudariam, mas o conteúdo conceitual está fechado.

---

## Módulo 10 — Hardy-Weinberg ✅ Completo

**Mapeamento PDF:** `Aula 3 - Frequencia Gênica e Equilíbrio de Hardy-Weinberg.txt`

### Conceitos cobertos
- População mendeliana (espécie comum, pool gênico) ✓
- Frequência gênica (alélica): cálculo a partir de AA, Aa, aa ✓
- Frequência genotípica ✓
- p² + 2pq + q² = 1, p + q = 1 ✓
- Equilíbrio H-W: panmítica, grande, sem fatores evolutivos ✓
- Exemplo prático com 81% AA ✓
- Cálculo de heterozigotos em população com f(A) = 0,6 ✓

### Onde o módulo é mais rico que o PDF
- Aplicação em portadores assintomáticos de doença recessiva (q² = 0,0001 → 2% portadores) — não está explicitamente no PDF.
- Discussão de por que H-W raramente vale em pecuária (baseline para detectar seleção) — não no PDF.
- Listagem explícita das condições (grande, panmixia, sem mutação/seleção/migração).

### Quiz (4 questões)
- Cobre: f(Aa) com p=0,7, q² = 0,16, condição H-W (seleção quebra), portadores em doença recessiva.
- Excelente.

**Veredito:** ✅ Completo. Módulo é mais rico que o PDF — bom.

---

## Módulo 11 — Melhoramento Genético ✅ Completo

**Mapeamento PDF:** `Aula 11 - Introdução ao Melhoramento Genético.txt`

### Conceitos cobertos
- Quantitativas × qualitativas (F = G + A vs F = G) ✓
- Poligênico × monogênico ✓
- Ação gênica aditiva vs não-aditiva ✓
- Exemplo produção de leite com 2 pares (base + 100 kg por letra maiúscula) ✓
- Fenótipo: F = G + A + GA ✓
- Interação Genótipo × Ambiente (taurino × zebuíno em climas diferentes) ✓
- Herdabilidade (h²): 0-0,2 baixa, 0,2-0,4 média, >0,4 alta ✓
- Tabela com parâmetros suínos ✓
- ΔG = DS × h² ✓
- DS = i × σp ✓
- Repetibilidade (t) ✓
- Correlação (r), valores entre -1 e +1 ✓
- Acurácia ✓
- Intensidade de seleção (5% vs 50%) ✓

### Onde o módulo é mais rico
- Inclui o cálculo prático completo ΔG (200 kg, σp=30, i=0,8, h²=0,3 → ΔG=7,2 kg).
- Cálculo comparativo entre i=0,8 e i=2,06.
- Callout sobre correlação negativa entre produção e fertilidade (caso real em rebanhos leiteiros).

### Detalhes do PDF
- Acurácia: PDF menciona herdabilidade, número de informações, parentesco, uniformidade do ambiente. Módulo cobre.
- PDF menciona "BLUP" implicitamente via avaliação genética e estimativa de valores aditivos. Módulo poderia citar BLUP explicitamente (mas não estava no PDF como termo).

### Quiz (5 questões)
- Cobre: h² = 0,1 baixa, ΔG cálculo (12 kg), comparação i, quantitativas poligênicas, fertilidade h² baixa.
- Excelente.

**Veredito:** ✅ Completo.

---

## Módulo 12 — Endogamia × Exogamia ✅ Completo

**Mapeamento PDF:** `Aula 12 - Endogamia x Exogamia.txt`

### Conceitos cobertos
- Endogamia = consanguinidade ✓
- Exogamia = cruzamento entre raças diferentes (1 pura) ✓
- Mestiço (produto), mestiçagem (mestiço × mestiço) ✓
- Heterose (vigor híbrido) ✓
- Complementariedade ✓
- H = ((MF1 − MP) / MP) × 100 ✓
- Tipos: contínuo/absorvente, rotacional, terminal/industrial ✓
- F (consanguinidade) NÃO acima de 13% em rebanho comercial ✓
- Coeficiente de parentesco Rxy = Σ(0,5)^n ✓
- Coeficiente de consanguinidade Fx = Rxy/2 ✓
- Estreita (≥50% — pais/filhos, irmãos completos) × larga (primos, meio-irmãos) ✓
- Vantagens da endogamia: padrão racial, prepotência, fixação ✓
- Desvantagens: depressão endogâmica, expressão de deletérios ✓

### Onde o módulo é mais rico
- Exemplo Angus × Nelore no Brasil — não está no PDF mas é clínico-prático.
- Tabela comparativa endogamia × exogamia.

### Quiz (6 questões)
- Cobre: F irmãos = 25%, terminal explora heterose, mestiçagem reduz heterose, cálculo heterose (4000→5200), limite 13%, Angus×Nelore.
- Excelente.

**Veredito:** ✅ Completo.

---

# Sumário Executivo

## Veredito por módulo

| # | Módulo | Veredito |
|---|--------|----------|
| 1 | Genética de Populações | ✅ Completo (sugestão: 1 questão sobre Lamarck/caráter adquirido) |
| 2 | Leis de Mendel | ✅ Completo |
| 3 | Ações Gênicas entre Alelos | ⚠️ Co-dominância merece concept separado |
| 4 | Alelismo Múltiplo | ✅ Completo (mais rico que PDF) |
| 5 | Genes Letais | ✅ Completo (falta gene Hr de cães — menor) |
| 6 | Interação Não-Alelos | ⚠️ Razão 9:6:1 (complementar c/ fusão) merece mais destaque |
| 7 | Gatos | ✅ Completo (pontos siameses seal/blue/chocolate podem ser bônus) |
| 8 | Pelagem Mamíferos | ✅ Completo |
| 9 | Padrões de Herança | ✅ Completo (mais exercícios de heredograma ajudariam) |
| 10 | Hardy-Weinberg | ✅ Completo (mais rico que PDF) |
| 11 | Melhoramento | ✅ Completo |
| 12 | Endogamia × Exogamia | ✅ Completo |

## Estado geral

- **9 de 12 módulos:** ✅ Completos — cobrem todo o conteúdo do PDF e adicionam exemplos veterinários práticos.
- **2 módulos com lacunas pequenas (⚠️):** Módulo 3 (co-dominância como subtópico em vez de concept separado) e Módulo 6 (razão 9:6:1 pouco destacada no corpo). Nenhuma é erro conceitual — apenas oportunidade de destaque.
- **0 erros conceituais** detectados no material TS.
- **Pontos positivos recorrentes:** os módulos TS frequentemente são MAIS RICOS que os PDFs originais — adicionando exemplos clínicos veterinários (DEA em cães, eritrólise neonatal felina, Angus × Nelore, displasia coxofemoral multifatorial) que o PDF não tem.

## Ações sugeridas (priorizadas)

1. **Módulo 3:** elevar co-dominância a concept próprio (separar de ausência de dominância). Adicionar exemplo da vaca malhada vs vaca cinza, e antígenos sanguíneos como exemplo clássico.
2. **Módulo 6:** destacar "complementar com fusão (9:6:1)" como variação da complementar no corpo do texto, não só na tabela resumo.
3. **Módulo 5:** adicionar exemplo do gene Hr de cães (homozigose letal, heterozigose com poucos pelos e dentes reduzidos).
4. **Módulo 1:** quiz pode incluir questão sobre Lamarckismo / caráter adquirido não ser hereditário.
5. **Módulo 7:** adicionar variações do siamês (seal-point, blue-point, chocolate-point, red-point) como tabela bônus.
6. **Módulo 9:** mais exercícios de heredograma — formato visual ou textual.
