## Why

Medido em 09/ago/2026, por script sobre os seeds: o hub **Base técnica tem 0,4
bloco visual estrutural por módulo**, contra 4,8 do hub Arquitetura AWS — e é o
hub que o iniciante encontra primeiro na jornada (etapa 0). São **36 módulos sem
nenhum diagrama, fluxo, tabela-matriz ou fórmula anotada**, concentrados em
Fundamentos Técnicos, SQL & Databases, Redes & Web e nas trilhas de linguagem.

A ressalva que salva metade do trabalho: **ausência de visual não é defeito em
todo lugar**. A trilha de terminal precisa de comando, não de topologia — e
forçar figura onde não há fluxo é erro já documentado no repositório (a régua de
`validate_cobertura_diagramas.py` foi calibrada exatamente para não fazer isso).
O critério desta mudança é a INFORMAÇÃO do módulo: onde há caminho de pacote,
ciclo de vida, hierarquia ou comparação multi-eixo, o visual ensina; onde o
conteúdo é sequência de comandos, o `code_block` comentado É o apoio certo.

Nenhum dos 490 módulos é prosa pura (0 sem qualquer apoio concreto — código,
diagrama ou tabela). O problema é de DENSIDADE e de adequação, não de ausência
absoluta.

## What Changes

**Triagem antes de autoria.** Os 36 módulos são classificados em dois grupos
pelo conteúdo real: (a) tem fluxo/topologia/hierarquia implícita no texto →
ganha o bloco visual que o texto já descreve em prosa; (b) é procedimento/
comando → ganha, quando couber, tabela de decisão ou comparação — e se nada
couber, é registrado como "adequado sem visual", com o motivo, numa lista de
exceções ao lado da régua existente.

**Onde o visual entra, ele segue o padrão da casa:** `flow_diagram`/
`arch_diagram` com rótulo em toda aresta e nota em todo nó (a dívida de 871
arestas sem rótulo já provou que diagrama mudo não ensina), caption que entrega
a conclusão, e steps percorríveis onde o schema pede.

**A régua sobe junto.** `MINIMOS` em `validate_cobertura_diagramas.py` é
ajustado por trilha para travar o que for adicionado — mínimos travam o
conquistado, nunca forçam figura onde a triagem disse que não cabe.

### Fora de escopo

Módulos dos demais hubs (IA está em 2,9/módulo e tem física própria); qualquer
meta numérica de "X visuais por módulo" — a triagem decide módulo a módulo.
