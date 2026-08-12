## Why

O que mais ensina num quiz é a explicação que **trata cada distrator**, nomeando o erro
de raciocínio de quem escolheu errado. Está normatizado no `PADRAO_ENSINO.md`, e as 1015
questões CLF que vêm do banco entregam exatamente isso: o `EstudoClient` renderiza "por
que a opção A está errada", opção por opção.

As **75 questões do catálogo estático** (`simulados-catalog.ts`) trazem a explicação como
texto corrido. O aluno recebe um parágrafo achatado em vez do tratamento por distrator.
Medido: **0 de 75** produzem explicação rica.

Há uma armadilha nesse arquivo, e ela foi diagnosticada errado antes de ser medida:
`parseExplanationString` são 130 linhas escritas para converter o formato antigo
`(a)/(b)/(c)` no formato rico, com marcadores `TODO_REVIEW` dentro. **Nenhum arquivo a
chama**, e ela devolveria `null` para as 75 questões, porque nenhuma usa aquele formato.
Cheguei a suspeitar que os marcadores vazavam para o aluno — **não vazam**, porque a
função nunca executa. É código morto com um TODO enganoso, não um defeito ativo.

O custo de manter isso: quem abre o arquivo acredita que existe conversão automática e não
migra nada; e as 75 questões continuam sendo a parte mais fraca de um produto que é o
único caminho de monetização da plataforma.

## What Changes

**As 75 questões migram para explicação estruturada**, com tratamento por distrator no
padrão das 1015 do banco.

**`parseExplanationString` é apagada**, com os marcadores `TODO_REVIEW`. Código morto que
sugere um caminho que não existe é pior que ausência, porque desencoraja o trabalho real.

**Um gate passa a exigir explicação estruturada em toda questão**, de qualquer fonte, para
que a divergência entre banco e catálogo não volte por outro caminho.

### Alternativa considerada e recusada

`PENDENCIAS.md` registra duas saídas: **(a)** migrar as 75 e apagar a função morta;
**(b)** apagar a função morta agora e migrar quando as questões forem revisadas.

Esta mudança adota **(a)**. O motivo é o público: o simulado é o produto pago, e o aluno
que erra uma questão de certificação e recebe um parágrafo achatado perde exatamente a
parte que justificava o pagamento. Adiar deixa a pior explicação da plataforma no único
lugar onde alguém paga.

## Capabilities

### New Capabilities
- `explicacao-de-questao`: o contrato de uma explicação de quiz ou de questão de simulado
  — o que ela precisa tratar para ensinar, independentemente de a questão vir do banco ou
  do catálogo estático.

## Impact

- **Conteúdo:** 75 questões reescritas com tratamento por distrator, o que é redação
  técnica, não conversão mecânica.
- **Código:** `simulados-catalog.ts` muda de forma; `parseExplanationString` sai;
  `EstudoClient` passa a receber a mesma forma das duas fontes.
- **Gate novo:** explicação sem tratamento de distrator reprova.
- **Sem mudança de rota, de banco ou de preço.**
