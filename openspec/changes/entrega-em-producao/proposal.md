## Why

O site público **não é o que está no repositório.**

> **Correção medida em 09/ago/2026:** o parágrafo abaixo ficou desatualizado — e
> para PIOR. O DNS **já aponta** para a VPS nova (`dig` devolve 72.60.28.82 para
> `@` e `www`), a porta 443 está **fechada** e a 80 serve a **página padrão do
> nginx** ("Welcome to nginx!", de 10/mai). Ou seja: não é mais o site velho no
> ar — é NADA no ar. O passo 1 do plano (trocar DNS) já aconteceu; o que falta é
> `certbot` (passo 3), reload do nginx (4) e `DEPLOY_ENABLED=true` (5).
> O dono decidiu deliberadamente subir só quando o produto estiver pronto.

O texto original, mantido para contexto: o domínio raiz apontava para o
LiteSpeed antigo da Hostinger, servindo um build estático de 13/mai. Tudo o que foi
construído desde então — o `/admin`, os refactors de simulado, as 1015 questões conectadas
via banco, as 41 trilhas, os 427 módulos, os 100 diagramas de arquitetura — **não está no
ar**. É a única pendência que invalida todas as outras: melhorar conteúdo que ninguém vê
não melhora nada.

Duas lacunas acompanham essa:

**O CI valida um empacotamento diferente do de produção.** A varredura roda contra
`next start`, que lê de `.next/`. O contêiner de produção roda
`node .next/standalone/server.js`, que precisa de `.next/static` e `public` copiados para
dentro da pasta standalone. O próprio Next avisa isso em cada execução da varredura.
Arquivo estático faltando na imagem, variável de ambiente ausente no contêiner ou
verificação de saúde mal configurada **passam pela varredura e quebram em produção**. É a
última lacuna entre "verde no CI" e "funciona no ar".

**O frontend tem ~5 s de blip a cada deploy**, porque o contêiner antigo para antes de o
novo subir. O backend não tem, porque roda com réplicas.

## What Changes

**A migração de DNS e TLS é executada** e o domínio passa a servir o container atual.

**Um teste de fumaça roda contra a imagem construída**, não contra `next start`: a imagem
sobe com `docker run`, e uma versão reduzida da varredura confere home, uma página de
módulo com CSS aplicado, `/api/health` e um recurso estático. Não precisa das 500 rotas —
precisa provar que o **empacotamento** está certo.

**Cloudflare entra na frente**, resolvendo três coisas de uma vez: a latência de ~120 ms
para o Brasil de um datacenter em Boston, o blip de deploy, e uma camada de cache e
proteção que hoje não existe.

### Non-goals

- **Não** trocar de provedor nem de arquitetura de deploy. O que existe funciona; o que
  falta é apontar o domínio para ele e provar o empacotamento.
- **Não** transformar a varredura completa em teste de contêiner. As 500 rotas continuam
  sendo validadas no build; o contêiner responde por empacotamento.

## Capabilities

### New Capabilities
- `entrega-de-producao`: a garantia de que o que passou no CI é o que roda no ar, e de que
  o domínio serve a versão atual.

## Impact

- **Ação humana, não de código:** a troca dos registros A e a emissão do certificado só o
  dono da conta faz. Está registrado como D-1 em `PENDENCIAS.md`.
- **CI:** um job novo que constrói a imagem e roda o teste de fumaça contra ela.
- **Infra:** Cloudflare na frente muda o caminho de TLS e de cache; precisa conferir que a
  CSP e o `X-Robots-Tag` do `/admin` continuam válidos atrás dele.
- **Risco de deixar como está:** o site público não tem `/admin`, não tem as questões
  conectadas ao banco, e anuncia números de maio — enquanto o repositório afirma outros.
