## Why

A página `/privacidade` tem **quatro `[PREENCHER]`**: nome do controlador, entidade legal,
CPF ou CNPJ, e o e-mail do encarregado. Uma política de privacidade que não identifica o
controlador não é política de privacidade — é um rascunho publicado, e a LGPD exige
justamente essa identificação para que o titular saiba a quem dirigir pedido de acesso, de
correção e de exclusão.

**Esta página não pode ser publicada como está.** Ela também não pode ser simplesmente
apagada: a plataforma coleta e-mail, telefone, progresso de estudo e identificador de
sessão, e opera ranking público. Sem política, a coleta fica sem base declarada.

Duas pendências acompanham:

**O que sobrevive à exclusão de conta não está definido.** O ranking é público e o
progresso sincroniza com o backend. Quando alguém pede exclusão, é preciso saber o que sai,
o que fica agregado e o que fica por obrigação legal — e a resposta tem de estar escrita
antes do primeiro pedido, não durante.

**O licenciamento dos ícones de arquitetura não foi verificado.** O catálogo tem 216
entradas de ícone desenhadas como SVG inline. A AWS tem termos próprios para uso da sua
iconografia de arquitetura, e a plataforma exibe esses ícones em 207 módulos.

## What Changes

**Os quatro campos são preenchidos e a página passa por revisão jurídica** antes de ir ao
ar. Um gate impede que a página seja servida com marcador de preenchimento.

**A política de retenção e exclusão é escrita e implementada**: o que sai no pedido de
exclusão, o que permanece em forma agregada e sem identificação, e o que permanece por
obrigação legal, com o prazo de cada caso.

**A origem e o licenciamento de cada ícone são verificados e registrados**, com a decisão
por família de ícone.

### Non-goals

- **Não** produzir parecer jurídico. A redação e o preenchimento são de quem responde
  legalmente pela plataforma; esta mudança garante que nada seja publicado incompleto e que
  o produto cumpra o que a política prometer.

## Capabilities

### New Capabilities
- `conformidade-de-dados-pessoais`: o que a plataforma coleta, com que base, por quanto
  tempo, e o que acontece quando o titular pede exclusão.
- `licenciamento-de-iconografia`: a origem e os termos de uso dos ícones exibidos no
  material de arquitetura.

## Impact

- **Ação humana:** preenchimento dos quatro campos e revisão jurídica. Registrado como E-1
  em `PENDENCIAS.md`, com dono declarado.
- **Backend:** fluxo de exclusão de conta que respeite a política escrita, incluindo o que
  fazer com a entrada no ranking público.
- **Frontend:** gate que reprova marcador de preenchimento em página publicada; caminho
  visível para o titular exercer os direitos.
- **Conteúdo:** possível substituição de ícone, se o licenciamento de alguma família não
  permitir o uso.
- **Risco de deixar como está:** a página está no repositório e entra no ar junto com o
  resto no momento da migração de domínio. O bloqueio precisa existir **antes** dela.
