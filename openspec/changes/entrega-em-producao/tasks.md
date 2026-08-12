## 1. Teste de fumaça contra a imagem — antes de migrar o domínio

Feito primeiro de propósito: migrar o domínio para uma imagem cujo empacotamento nunca foi
verificado troca um problema conhecido por um desconhecido.

- [x] 1.1 Job de CI que constrói a imagem do frontend com o mesmo Dockerfile do deploy
- [x] 1.2 Subir com `docker run`, usando o mesmo comando de entrada do ambiente real
- [x] 1.3 Conferir home, uma página de módulo **com CSS aplicado**, `/api/health` e um recurso estático servido de `.next/static`
- [x] 1.4 Falhar quando a página de módulo subir sem estilo — é o defeito que a varredura não pega
- [ ] 1.5 Prova negativa: remover a cópia de `.next/static` do Dockerfile e conferir que o job reprova
- [x] 1.6 Conferir que variável de ambiente ausente reprova, e não passa como página vazia

## 2. Migração de DNS e TLS — ação do dono da conta

- [ ] 2.1 Trocar os registros A de `@` e `www` para o IP da VPS atual
- [ ] 2.2 Emitir o certificado para o domínio raiz e o `www`
- [ ] 2.3 Recarregar o proxy reverso
- [ ] 2.4 Confirmar **no domínio público** que uma rota criada depois de maio responde 200 — a home responde nos dois servidores e não distingue
- [ ] 2.5 Conferir que o `/admin` continua fora do índice pelo cabeçalho, e que a canônica não ganhou redirect
- [ ] 2.6 Rodar a varredura completa apontada ao domínio público, e não ao localhost

## 3. Camada de borda

- [ ] 3.1 Colocar a borda na frente, com o TLS terminando lá e a origem restrita a ela
- [ ] 3.2 Conferir que a política de segurança de conteúdo continua chegando ao navegador com o mesmo conteúdo
- [ ] 3.3 Conferir que `X-Robots-Tag` do `/admin` é repassado — é a única proteção, porque o layout é componente de cliente e não pode exportar metadados
- [ ] 3.4 Conferir que a convenção de URL sem barra final não ganhou redirect na borda
- [ ] 3.5 Medir a latência para o Brasil antes e depois, e registrar o número
- [ ] 3.6 Confirmar que a troca de contêiner deixou de ser visível

## 4. Fechar

- [ ] 4.1 Atualizar `README.md`, `frontend/CLAUDE.md` e `backend/CLAUDE.md`, que hoje descrevem a migração como pendente
- [ ] 4.2 Fechar D-1, D-2 e C-4 em `PENDENCIAS.md`
- [ ] 4.3 Registrar na memória de projeto que o site público passou a ser o repositório — é o fato que muda a interpretação de todas as outras pendências
