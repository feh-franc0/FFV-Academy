# 00 — Visão

## Problema raiz

A FFV Academy tem ~570 artigos e cresce. O fluxo de criação de conteúdo hoje exige:

1. Abrir o painel admin no browser
2. Verificar manualmente se o tema já existe (busca no painel ou CTRL+F)
3. Voltar pro editor de Markdown local
4. Escrever
5. Voltar pro painel, colar, preencher metadados (slug, hub, trilha, dificuldade, XP, ordem), publicar
6. Repetir pra cada artigo

**Onde dói:** o passo 2 é caro (impossível visualizar 570 títulos), o passo 5 é repetitivo, e a falta de visibilidade no passo 2 leva a duplicações que só são percebidas semanas depois.

## Hipótese

Expor a API admin do FFV Academy via MCP (Model Context Protocol) elimina os passos 1, 2 e 5 quando o autor já está conversando com o Claude. O Claude vira o "painel admin" — busca duplicatas, calibra tom lendo artigos vizinhos, e publica direto.

## Para quem

| Persona | Cenário | Versão alvo |
|---|---|---|
| **Eu (Fernando)** — autor solo | Crio 5-10 artigos por semana via Claude | v1, v2 |
| **Autor convidado** (futuro) | Time de conteúdo terceirizado | v3 |
| **Time profissional do meu trabalho** | Aprender padrão MCP pra replicar em SaaS B2B | v1-v4 (veículo de aprendizado) |

⚠️ O alvo "time profissional" não é cliente direto deste MCP — é beneficiário indireto via aprendizado. Tomar decisões pensando *só* nele introduz over-engineering. Decisões técnicas devem servir o autor solo primeiro.

## Objetivos (o que vai existir)

- **G1.** Reduzir tempo de "ideia → artigo publicado" em pelo menos 50% medido por cronômetro nos próximos 10 artigos pós-MCP vs últimos 10 pré-MCP.
- **G2.** Reduzir duplicações detectadas (busca semanal manual) em pelo menos 80%.
- **G3.** Cobrir, ao final da v2, 100% das operações que eu faço hoje no painel admin de currículo.
- **G4.** Servir como referência viva para construir um MCP corporativo (este código é lido por mim e por terceiros).

## Anti-objetivos (o que NÃO vai existir, e por quê)

- **AO1.** Não vai virar substituto do painel admin web. Painel continua sendo a fonte da verdade visual e o canal pra revisão manual de listas grandes.
- **AO2.** Não vai gerenciar simulados/usuários/billing na v1-v2. Currículo é o ROI claro; o resto é dispersão.
- **AO3.** Não vai expor o produto a usuários finais (alunos). Esse é outro produto — ver `02-ROADMAP.md` v4 onde isso é discutido com honestidade.
- **AO4.** Não vai ter UI própria. MCP é casca; quem consome é o Claude.
- **AO5.** Não vai virar "AI agent autônomo que escreve sozinho". O autor humano permanece no loop. MCP é ferramenta, não autor.

## Definição de sucesso

A v2 é considerada bem-sucedida se, **3 meses após o lançamento**, todas as condições abaixo forem verdade:

1. Eu (autor) uso o MCP em ≥80% das criações de artigo.
2. O painel admin web só é acessado pra operações que o MCP não cobre (revisão visual de listas longas, principalmente).
3. Zero incidentes de segurança (vazamento de token, escrita não autorizada).
4. Tempo médio de publicação caiu pelo menos 50% (G1 atingido).

Se duas dessas falharem, o MCP é um fracasso e devemos investigar root cause antes de construir v3.

## Definição de fracasso

- Eu paro de usar e volto pro painel sem reclamar.
- Eu uso mas reclamo toda vez ("mais fácil abrir o admin").
- O Claude erra metadados (slug, hub) com frequência > 1 em 5.
- Algum incidente de segurança real.

## Não-metas frequentemente confundidas

- **Não estamos construindo "ChatGPT pra meu admin"**. MCP é protocolo, não chatbot. O chatbot é o Claude do usuário.
- **Não estamos construindo SDK de integração**. SDK seria pra dev integrar o FFV Academy num produto dele. Esse MCP é interno (eu uso pra editar meu próprio sistema).
- **Não estamos construindo um "MCP perfeito"**. Estamos construindo o MCP que resolve a dor real do v1, e depois iteramos.
