## Why

O sitemap da plataforma **não tem `lastmod`**, e isso é uma decisão registrada, não um
esquecimento. Eram 520 URLs com a data do build. O Google usa `lastmod` apenas quando ele
é consistentemente exato e, diante de valor uniforme, ignora o campo — inclusive nas
páginas onde ele seria verdade. Anunciar data falsa em 520 URLs é pior que não anunciar
data.

O problema é que **não existe data real** na plataforma, e cada fonte candidata falha por
um motivo diferente:

| Fonte | Por que não serve |
|---|---|
| Campo no seed | não existe; o formato é `{slug, title, blocks}` |
| `mtime` do arquivo | é a hora do checkout, não da edição |
| `git log` | o CI faz checkout raso |
| `curriculum_articles.updated_at` | o importador o bumpa **incondicionalmente**, a cada importação |

A última linha é a que dá o conserto. O importador Go reescreve `updated_at` mesmo quando
o conteúdo do artigo é byte a byte igual ao que já está no banco. Se ele comparasse um
hash do conteúdo e só tocasse a coluna quando o hash mudasse, `updated_at` passaria a
significar "quando este conteúdo mudou de verdade" — e aí `lastmod` volta ao sitemap
sendo exato.

O ganho não é de ranking direto: é de **orçamento de rastreamento**. Com 521 URLs e
conteúdo que muda por partes, dizer ao buscador quais 12 páginas mudaram nesta semana é a
diferença entre revisitar 521 e revisitar 12.

## What Changes

**O importador passa a calcular um hash do conteúdo por artigo** — dos blocos
normalizados, não do arquivo, para que reordenação de chave em JSON não conte como
mudança — e só escreve `updated_at` quando o hash difere do armazenado.

**Uma coluna nova guarda o hash**, com migration.

**O sitemap volta a emitir `lastmod`**, lido de `updated_at`, e apenas para as URLs de
artigo, que são as únicas com data real. Página estática, hub e trilha continuam sem
`lastmod`, porque para elas continua não existindo data verdadeira — e emitir a data do
build nelas reintroduziria exatamente o problema que foi removido.

**O gate que hoje proíbe `lastmod` uniforme é invertido**: em vez de exigir ausência, ele
passa a exigir que, quando `lastmod` existir, ele **distinga** as URLs. Valor idêntico em
todas continua reprovando.

### Non-goals

- **Não** emitir `lastmod` em rota que não tem data real. Metade do sitemap fica sem o
  campo, e isso é correto.
- **Não** usar a data do deploy como aproximação.

## Capabilities

### New Capabilities
- `frescor-de-conteudo`: como a plataforma sabe quando um conteúdo mudou de verdade, e o
  que ela tem o direito de afirmar ao buscador sobre isso.

## Impact

- **Backend Go:** importador de blocos ganha o cálculo de hash e a comparação; uma
  migration acrescenta a coluna.
- **Frontend:** `src/app/sitemap.ts` volta a emitir `lastmod` nas URLs de artigo — ler o
  comentário longo que está lá antes de mexer, ele documenta cada tentativa descartada.
- **Teste:** a 15ª checagem da varredura ("sitemap não afirma data de modificação que não
  tem") é reescrita para a regra nova.
- **Risco de regressão:** se o hash for calculado sobre o arquivo bruto, qualquer
  reformatação do JSON marca todos os 427 artigos como alterados de uma vez — e o
  buscador recebe exatamente o sinal uniforme que se quer evitar.
