## ADDED Requirements

### Requirement: Cada lab-âncora tem a seção "Desafio — sem roteiro"

Cada um dos 20 laboratórios da lista "essenciais para portfólio"
(`docs/aws/CATALOGO_100_LABS_ARQUITETURA_AWS.md`) DEVE (MUST) conter uma seção
`Desafio — sem roteiro` com: um requisito novo derivado da arquitetura daquele lab
(1–3 frases), um critério de aceite executável (medição ou observação concreta, nunca
"verifique se funcionou"), 3 dicas escalonadas do menos ao mais revelador, custo estimado
quando o desafio cria recurso, e lembrete de limpeza.

O degrau que falta na progressão pedagógica é entre a prática guiada (o lab com passo a
passo) e o capstone: não há "resolva sem o roteiro". Esta seção é esse degrau.

#### Scenario: lab-âncora sem a seção
- **WHEN** um dos 20 slugs de `LABS_ANCORA` não tem seção com título começando por "Desafio"
- **THEN** `validate_cobertura_secoes.py --strict` falha nomeando o lab e a seção ausente

#### Scenario: lab fora da lista-âncora
- **WHEN** um dos outros 80 laboratórios não tem a seção de desafio
- **THEN** o gate NÃO falha — o contrato vale só para a lista declarada

#### Scenario: critério de aceite executável
- **WHEN** o autor escreve o desafio
- **THEN** o critério de aceite descreve uma medição verificável (latência sob carga, byte contado, HTTP 429 vs 200, trace com N spans, RTO cronometrado), não uma verificação subjetiva
