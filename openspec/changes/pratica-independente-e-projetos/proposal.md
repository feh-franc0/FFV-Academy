## Why

A progressão pedagógica declarada da plataforma é
**fundamentos → prática guiada → prática independente → projeto → reflexão**.
Auditoria de 09/ago/2026: os dois primeiros degraus e o quarto existem com
qualidade (conteúdo com quiz em 100%; 100 labs guiados com injeção de falha;
capstones por trilha). **O terceiro degrau não existe**: entre o lab com passo a
passo e o capstone, não há nenhum ponto onde o aluno resolve sem o roteiro.

O efeito é conhecido em educação técnica: quem só segue roteiro reconhece a
solução mas não a produz. O sintoma aparece exatamente na transição para o
capstone — o salto de dificuldade que os princípios da plataforma mandam evitar.

A matéria-prima já existe. Cada lab tem a seção "Quebrar de propósito" (o
sistema sob falha) e a revisão Well-Architected (as perguntas certas). O que
falta é o formato "aqui está um requisito novo sobre o sistema que você acabou
de construir — implemente sem roteiro, e valide com este critério".

## What Changes

**Desafios de extensão nos labs-âncora.** Nos ~20 labs "essenciais para
portfólio" (já marcados no catálogo dos 100), uma seção final `Desafio — sem
roteiro`: um requisito novo e realista sobre a arquitetura recém-construída
(ex.: "o time de dados pediu réplica de leitura em outra região; implemente e
PROVE com uma consulta que ela serve leitura"), com **critério de aceite
verificável** (comando cuja saída o aluno compara) e SEM os passos. A solução
não é publicada na mesma página — um bloco de dicas escalonadas (3 níveis)
substitui o gabarito.

**Gate de forma.** O desafio tem contrato: requisito em 1–3 frases, critério de
aceite executável, 3 dicas em escala, custo estimado se criar recurso novo, e
lembrete de limpeza. `validate_cobertura_secoes.py` ganha a décima seção,
SÓ para os labs-âncora (lista declarada, não os 100 — desafio raso em massa
seria pior que ausência).

### Fora de escopo

Autograding/execução server-side (exige backend novo — registrado em
`integracoes-de-backend-pendentes` se algum dia valer); desafios nos módulos de
teoria (o quiz cumpre a verificação lá); refazer capstones.
