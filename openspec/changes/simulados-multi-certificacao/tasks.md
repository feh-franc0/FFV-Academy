## 1. Estudo livre por certificação (destrava AIF e DVA)

- [x] 1.1 `EstudoClient` recebe `dbBankId` por prop em vez de importar `CLF_SIMULADO_ID`; o default continua CLF para a rota antiga não mudar de comportamento
- [x] 1.2 Rota dinâmica `/simulados/[slug]/estudo` criada e cobrindo AIF, DVA e SAA. **Ajuste ao plano**: a rota fixa `/simulados/cloud-practitioner/estudo` NÃO virou redirect — ela continua servindo o CLF diretamente (Next.js prioriza segmento literal sobre dinâmico quando coexistem), então não há rota retirada nem disposição a declarar; menos risco que planejado.
- [ ] 1.3 **Não aplicável como planejado**: medido que `EstudoClient` não tem filtro de domínio na UI hoje (nenhum uso de `CLF_DOMAINS` no componente) — não há filtro fixo do CLF para generalizar. Se um filtro por domínio for adicionado no futuro, aí sim vale derivar do banco em vez de fixar.
- [x] 1.4 `studyModeUrl` restaurado para AIF, DVA e SAA; `simulado-db-bank.test.ts` prova os dois lados — nenhum aponta para 404, e nenhum `studyModeUrl` existe sem `dbBankId`
- [x] 1.5 Servidor de dev local (`localhost:3000`) já ativo; HTML servido conferido por `curl` para as 4 rotas de estudo — cada uma com `<title>` distinto e correto ("Estudo livre — AWS Solutions Architect Associate (SAA-C03)", "... Developer Associate (DVA-C02)", "... AI Practitioner (AIF-C01)", "... Cloud Practitioner"), todas HTTP 200. A rota fixa do CLF não regrediu

## 2. Banco SAA-C03

- [x] 2.1 Guia oficial lido em 09/ago/2026 (4 domínios: Secure 30%, Resilient 26%, Performing 24%, Cost-Optimized 20%; 14 task statements no total, todos com objetivos completos)
- [x] 2.2 65 questões (20/17/16/12), cada uma com `topic` declarando domínio + task statement
- [x] 2.3 100% rica; a asserção `len(txt) > 90` no builder pegou 3 distratores rasos meus antes de salvar
- [x] 2.4 Escrito na ordem natural saiu concentrado; permutação levou o pico a 26% (A=17,B=16,C=16,D=16)
- [x] 2.5 `{"saa-c03-", "aws-saa", ...000048_seed_saa_questions.up.sql...}`; migration 000048 própria, CLF/DVA/AIF sem diff. Achado e corrigido no caminho: 000046 e 000047 não tinham `.down.sql` (golang-migrate exige o par) — escritos os três (046/047/048) no padrão no-op do 000042
- [x] 2.6 Verde — 1.630 questões totais no banco (CLF 1015, DVA 435, AIF 115, SAA 65), 0 problemas
- [x] 2.7 `dbBankId: 'aws-saa'`, `questionCount: 65`, preço R$67 (era R$97 pela prévia), texto "Em desenvolvimento" removido
- [x] 2.8 5 questões inline removidas; gate reporta "nenhuma questão lida" — zero pendências, porque não sobrou nada inline em NENHUM simulado

## 3. MLA-C02 — condicionada à publicação do guia oficial

**Gatilho:** exam guide da MLA-C02 publicado em docs.aws.amazon.com (registro
abre 1º/set/2026). NÃO executar antes: seria especular sobre blueprint não
publicado.

- [ ] 3.1 Ler o guia da C02 e diffar contra os 4 domínios da C01 (o que entrou, o que mudou de peso)
- [ ] 3.2 Acrescentar à `trail-mla` os módulos da camada nova (GenAI, agêntica, FM/LLM ops) — reusar `trail-bedrock` por link onde o assunto já existe, sem duplicar
- [ ] 3.3 Atualizar o aviso de calendário em `mla-intro` (hoje diz "a C02 vem aí"; passará a dizer "esta trilha cobre a C02")
- [ ] 3.4 Renomear trilha e rota com disposição declarada para `/aws-mla-c01` em `rotas-retiradas.ts` (301 para a nova)
- [ ] 3.5 Banco `mla-c02-*` no mesmo pipeline, mesmo padrão da fase 2

## 4. Travar

- [x] 4.1 Mutação aplicada (`dbBankId: 'aws-saa-QUEBRADO-DE-PROPOSITO'`) → `simulado-db-bank.test.ts` reprovou corretamente → revertida, suíte volta a verde
- [x] 4.2 Registrado em `PENDENCIAS.md`, seção B-5, com nota de resolução
