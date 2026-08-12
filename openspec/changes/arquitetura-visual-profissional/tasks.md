## 1. Subir a barra no gate, antes de escrever conteúdo

- [x] 1.1 Em `scripts/validate_servicos_diagrama.py`, exigir `note` não vazia em todo nó — reportando slug, id do nó e diagrama; começar em modo **relatório** (sai 0) para medir sem travar o CI
- [x] 1.2 Exigir `label` não vazia em toda aresta, no mesmo modo relatório, com a forma `origem>destino` na mensagem
- [x] 1.3 Recusar nota que repete o rótulo: nota igual ao `label`, ou substring dele, ou igual à chave de `service`
- [x] 1.4 Recusar rótulo genérico por lista curta: `dados`, `chamada`, `requisição`, `resposta`, `informação`, `payload` — e apenas esses, para não reprovar rótulo legítimo curto
- [x] 1.5 Exigir 5 a 6 `steps`, cada um acendendo ao menos um nó ou aresta, e `edges` na forma `a>b` casando com aresta declarada
- [x] 1.6 Recusar `kind` fora de `plain|vpc|region|account` — a documentação da casa listava `edge`, que não existe em lugar nenhum
- [x] 1.7 Escrever a prova negativa de cada regra nova: remover uma nota, um rótulo, um passo e conferir que o gate certo reprova
- [x] 1.8 Registrar o número inicial de cada violação no cabeçalho do gate — 871 arestas, 218 nós, 16 diagramas — para que a descida seja verificável

## 2. Pagar a dívida de qualidade nos 107 diagramas manuais

Por trilha, com o diagrama aberto no navegador — não por varredura de arquivo, porque
rótulo específico exige entender o que trafega naquela aresta.

- [ ] 2.1 Trilhas de certificação AWS primeiro (Cloud Practitioner, SAA, DVA, SAP): é onde topologia é o objeto de prova e onde nota e rótulo mais ensinam
- [ ] 2.2 Trilha AWS Bedrock e trilhas de IA aplicada
- [ ] 2.3 Trilhas de produção (Distribuídos, MLOps, Observabilidade & SRE, Data Engineering)
- [ ] 2.4 Trilhas de dados e retrieval (Postgres Internals, NoSQL + Vector, Search & IR)
- [ ] 2.5 Trilhas restantes
- [x] 2.6 Corrigir os 16 diagramas com menos de 5 passos — passo acrescentado tem de nomear uma decisão, não repartir a existente
- [ ] 2.7 Virar o gate de modo relatório para modo falha, quando o contador chegar a zero

## 3. Trocar cobertura por veredito registrado

- [ ] 3.1 Criar a lista de exceções com motivo escrito, no próprio `validate_cobertura_diagramas.py`, no mesmo padrão de `EXCECOES` dos outros gates (razão obrigatória, e o gate falha se o slug não existir no currículo)
- [ ] 3.2 Fazer o gate exigir `com diagrama ∪ exceções = todos os módulos com conteúdo`, e falhar nomeando quem está fora
- [ ] 3.3 Recusar motivo vazio, ou motivo que não nomeie o objeto de estudo do módulo
- [ ] 3.4 Imprimir as duas contagens lado a lado a cada execução, para a proporção de exceções ficar visível
- [ ] 3.5 Declarar as 13 exceções óbvias — simulado, precificação e suporte, glossário — com o motivo de cada
- [ ] 3.6 Registrar a contagem de módulos com diagrama e falhar quando ela cair

## 4. Reexaminar as três trilhas com exceção em bloco

- [ ] 4.1 Claude Code: do zero ao poder total (14 módulos) — o laço agêntico, a cadeia de permissão de ferramenta e a compactação de contexto são fluxo; atalho de teclado e comparação de plano não são
- [ ] 4.2 API Claude & Agents (8 módulos) — laço de tool use, streaming, cache explícito de prompt
- [ ] 4.3 Claude Code Pro: Harness Engineering (8 módulos) — o harness é topologia de componentes por definição
- [ ] 4.4 Para cada um dos 30: escrever a `caption` **antes** de desenhar. Se a decisão que o leitor leva não sai numa frase, o módulo entra como exceção com esse motivo
- [ ] 4.5 Atualizar `PADRAO_ENSINO.md`: a decisão em bloco de ago/2026 é substituída por 30 vereditos individuais, com o registro de por que ela foi reaberta

## 5. Escrever os diagramas que faltam

Ordem por retorno pedagógico: onde topologia é o objeto de estudo vem antes de onde
ela é contexto.

- [ ] 5.1 Fundamentos Técnicos, SQL & Databases, Redes & Web (base sem a qual o resto não faz sentido) — 20 módulos
- [ ] 5.2 Security Engineering, FinOps, Observabilidade & SRE, Sistemas Distribuídos — 20 módulos
- [ ] 5.3 Data Engineering, Postgres Internals, NoSQL + Vector, Search & IR — 22 módulos
- [ ] 5.4 ML clássico, MLOps, Fine-tuning, RLHF & Agents, LLM Evals, AI Safety — 33 módulos
- [ ] 5.5 Diffusion & Multimodal, Local LLMs & Edge, Voice/Vision, Computer Vision — 29 módulos
- [ ] 5.6 Linguagens (Python, Go, TypeScript) — só onde há fluxo real: modelo de concorrência, pipeline de build, sistema de tipos em camadas. Sintaxe entra como exceção — 24 módulos
- [ ] 5.7 System Design Interview Prep — 7 módulos, e aqui o diagrama é o produto, não o apoio
- [ ] 5.8 Restantes, com veredito para cada

## 6. Extrair o DSL de autoria em volume

- [ ] 6.1 Separar de `scripts/seo/arq100/comum.py` as validações que não dependem do caso: limites de `caption`/`note`/`detail`/`label`, nota obrigatória, rótulo obrigatório, 5–6 passos, aresta de passo casando com aresta declarada, `vpc` só com recurso em sub-rede
- [ ] 6.2 Manter a montagem de famílias onde está — generalizar a montagem cedo produz a abstração errada
- [ ] 6.3 Fazer `gerar_arquiteturas_100.py` consumir o módulo extraído, provando que nada regrediu: os 100 diagramas têm de sair byte a byte iguais
- [ ] 6.4 Documentar o uso na skill `arquitetura-ia-aws.md`, com o critério de quando usar DSL em vez de escrever à mão

## 7. Fechar o laço com os documentos normativos

- [ ] 7.1 `PADRAO_ENSINO.md` regra 1: o veredito registrado substitui "não force"; a proibição de figura decorativa continua, agora com a exigência de escrever o motivo
- [ ] 7.2 `.claude/skills/arquitetura-ia-aws.md`: nota e rótulo passam de recomendação a exigência com gate; corrigir a tabela de `kind`
- [ ] 7.3 `PENDENCIAS.md`: substituir a linha de cobertura de diagrama pelas duas métricas novas (diagramas e vereditos), com os números medidos
- [ ] 7.4 `frontend/CLAUDE.md`: atualizar a contagem e apontar para esta capability
- [ ] 7.5 Rodar a varredura completa e conferir no navegador uma amostra de cada trilha tocada — bloco válido pode ficar ilegível, e diagrama que não acende passo passou no gate sem ensinar
