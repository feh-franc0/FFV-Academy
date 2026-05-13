import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, DecisionBox, FlowDiagram, StackFlow, ComparisonFlow } from '@/components/article/primitives';

export const metadata = getModuleMetadata('incident-response-postmortem');

const ACCENT = '#79c0ff';

const quiz = [
  {
    question: 'Qual o papel do Incident Commander (IC) durante um incidente?',
    options: [
      'Escrever o código do hotfix mais rápido possível',
      'Coordenar a resposta, delegar tarefas, garantir comunicação e manter o registro do timeline',
      'Notificar todos os clientes afetados individualmente',
      'Executar rollback imediatamente, sem análise',
    ],
    correct: 1,
    explanation: 'O IC NÃO resolve o incidente técnico — delega. Seu trabalho é: manter todos sincronizados, decidir quem faz o quê, garantir que comunicação externa aconteça, e documentar o timeline. Em incidentes grandes, um IC sobrecarregado que tenta resolver e coordenar ao mesmo tempo causa caos.',
  },
  {
    question: 'Por que postmortems "blameless" são mais eficazes que postmortems que identificam culpados?',
    options: [
      'São mais politicamente corretos',
      'Encontrar culpados resolve o problema mais rápido',
      'Blame cria incentivo para esconder erros e não relatar incidentes — blameless encoraja honestidade e aprendizado sistêmico',
      'Leis trabalhistas proíbem identificar funcionários responsáveis',
    ],
    correct: 2,
    explanation: 'Quando engenheiros têm medo de culpa, eles escondem erros, evitam mudanças arriscadas e não reportam problemas cedo. Blameless postmortem pressupõe que profissionais competentes com acesso às mesmas informações tomariam as mesmas decisões. O foco é no sistema — quais defesas faltaram que permitiram o erro humano ter impacto.',
  },
  {
    question: 'O que torna um action item de postmortem eficaz vs ineficaz?',
    options: [
      'Action items eficazes têm título mais detalhado',
      'Action items eficazes têm owner único, prazo definido e são trackados em sistema de tickets',
      'Action items eficazes são aprovados por mais pessoas antes de implementar',
      'Action items eficazes identificam quem cometeu o erro original',
    ],
    correct: 1,
    explanation: 'Action items sem owner são de ninguém. Sem prazo são eternamente "em progresso". Sem ticket num sistema rastreável (Jira, Linear, GitHub Issues) desaparecem. O principal problema de postmortems é gerar ótimas análises e péssima execução. Owner único + prazo + ticket = accountability real.',
  },
  {
    question: 'Quando você deve declarar um incidente formalmente em vez de resolver silenciosamente?',
    options: [
      'Apenas quando clientes reclamam nas redes sociais',
      'Apenas quando o CEO pede explicação',
      'Quando o impacto é incerto, quando requer múltiplas pessoas, ou quando pode violar SLO/SLA',
      'Apenas após 1 hora de indisponibilidade confirmada',
    ],
    correct: 2,
    explanation: 'Declarar cedo tem custo baixo (alguns minutos de alinhamento) mas benefício alto (todos coordenados, timeline documentado). O pior cenário é descobrir 2h depois que era um incidente grave e não ter documentação do que aconteceu quando. Regra: em caso de dúvida, declare. Você pode fechar rapidamente se resolver rápido.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="incident-response-postmortem"
      title="Incident Response e Postmortem: do pager ao aprendizado"
      icon="🚨"
      xp={80}
      readTime={16}
      trailName="Observabilidade & SRE"
      trailColor={ACCENT}
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Incidentes são inevitáveis. Todo sistema suficientemente complexo vai falhar — a questão não é
        se, mas quando. A diferença entre times maduros e imaturos não está em ter menos incidentes:
        está em como respondem durante a crise e o quanto aprendem depois.
      </p>
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Incident response mal estruturado transforma problemas de 15 minutos em crises de 4 horas.
        Postmortems que buscam culpados criam cultura de medo que garante que os mesmos incidentes
        se repitam. Neste módulo você vai aprender o processo completo — do pager à cultura de aprendizado.
      </p>

      <Section title="Ciclo de vida de um incidente">
        <FlowDiagram
          orientation="horizontal"
          steps={[
            { label: 'Detecção', desc: 'Alerta · usuário reporta · monitoramento · T+00:00' },
            { label: 'Resposta', desc: 'Triage P1–P4 · declarar incidente · mobilizar equipe · T+05–15min' },
            { label: 'Resolução', desc: 'Mitigação · root cause · fix ou rollback · T+30min–2h' },
            { label: 'Aprendizado', desc: 'Postmortem · action items · review 30d · T+24–48h' },
          ]}
        />
        <ComparisonTable
          headers={['Severidade', 'Impacto', 'Tempo de resposta', 'Canal']}
          rows={[
            ['P1', 'Produção down ou dados corrompidos', '5 min', 'PagerDuty'],
            ['P2', 'Funcionalidade crítica degradada', '15 min', 'Slack'],
            ['P3', 'Funcionalidade não-crítica afetada', '2 h', 'Ticket'],
            ['P4', 'Issue sem impacto a usuário', '1 dia', 'Backlog'],
          ]}
        />
      </Section>

      <Section title="Roles em incidentes P1/P2">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Em incidentes grandes, papéis claros eliminam confusão e duplicação de esforço:
        </p>
        <ComparisonTable
          headers={['Role', 'Responsabilidade', 'Não faz']}
          rows={[
            ['Incident Commander (IC)', 'Coordena resposta, delega, mantém timeline, toma decisões de escalonamento', 'Debug técnico, escrever código, rollback direto'],
            ['Tech Lead', 'Diagnóstico técnico, coordena engenheiros de domínio, propõe e executa mitigação', 'Comunicação externa, tomar decisões de negócio'],
            ['Communications Lead', 'Atualiza página de status, notifica clientes VIP, gerencia expectativa externa', 'Debug técnico, tomar decisões de prioridade'],
            ['Scribe', 'Documenta timeline em tempo real no canal de incidente, registra decisões', 'Debug, comunicação externa'],
            ['Subject Matter Experts', 'Diagnosticam área específica (DB, infra, serviço X) quando chamados', 'Ficar no canal se não forem necessários'],
          ]}
        />
        <Callout tone="warn">
          <strong>O erro mais comum:</strong> IC tenta resolver tecnicamente E coordenar ao mesmo tempo.
          Resultado: nem coordena bem nem resolve bem. IC que digita no terminal durante um P1 é sinal
          de que o time não tem IC real — tem um engenheiro sobrecarregado. Em incidentes P1, o IC
          nunca deve abrir um terminal.
        </Callout>
      </Section>

      <Section title="Playbook de resposta: os primeiros 15 minutos">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Os primeiros minutos determinam a qualidade da resposta. Um playbook impede que o stress
          degrade a tomada de decisão:
        </p>
        <CodeBlock lang="markdown">{`# Playbook P1 — Primeiros 15 minutos

## T+0: Alerta recebido
- [ ] Confirmar que o alerta é real (não falso positivo)
- [ ] Acessar dashboard: https://grafana.internal/d/overview
- [ ] Se impacto confirmado → DECLARE INCIDENTE

## T+1: Declarar incidente
- [ ] Criar canal Slack: #inc-YYYY-MM-DD-brief-description
- [ ] Postar template:
      \`\`\`
      [INCIDENTE] DECLARADO: [descrição breve]
      Severidade: P1/P2/P3
      IC: @seu_nome
      Tech Lead: @tbd
      Impacto: [o que está quebrado, quem é afetado]
      Início detectado: HH:MM UTC
      Status page: INVESTIGANDO
      \`\`\`
- [ ] Atualizar https://status.empresa.com → "Investigando"

## T+2: Mobilizar
- [ ] Notificar on-call do serviço afetado via PagerDuty
- [ ] Para P1: notificar gerente de plantão
- [ ] Assignar Communications Lead

## T+5: Triage inicial
- [ ] Qual serviço/componente está afetado?
- [ ] Houve deploy recente (último 1h)? → candidato a rollback
- [ ] Qual o blast radius? (% de usuários, região, feature)
- [ ] Temos runbook para esse padrão?

## T+10: Hipótese inicial
- [ ] Tech Lead propõe hipótese mais provável
- [ ] Validar hipótese com dados (logs, traces, métricas)
- [ ] Não implementar fix sem dados — bias de confirmação mata

## T+15: Primeiro update externo
- [ ] Communications Lead posta primeiro update público:
      "Estamos investigando problemas com [serviço]. Nossa equipe está
       trabalhando na resolução. Próximo update em 30 minutos."
- [ ] Frequência mínima de updates: 30min (P1), 1h (P2)

## Regras gerais
- NUNCA silenciar alerta sem investigar
- NUNCA fazer múltiplas mudanças ao mesmo tempo
- Se rollback está disponível e deploy recente: rollback primeiro, investigue depois
- Se incerto entre rollback e fix: rollback é mais seguro`}</CodeBlock>
      </Section>

      <Section title="Durante o incidente: disciplina de comunicação">
        <StackFlow
          items={[
            { label: '14:05 — IC declara incidente', sub: 'Checkout 40% erro rate · IC: @joao · Tech Lead: @maria · Comms: @ana · hipótese: deploy 13:50' },
            { label: '14:07 — Maria confirma', sub: 'payment-service com 429 do Stripe · verificando se é rate limit nosso' },
            { label: '14:09 — Pedro analisa', sub: 'Stripe status page: verde · problema é nosso · vendo config de retry' },
            { label: '14:11 — IC atualiza', sub: 'Causa provável: retry agressivo no deploy 13:50 · avaliando rollback vs hotfix' },
            { label: '14:13 — Decisão: rollback', sub: 'IC aprova · Maria executa · Ana atualiza status page para "mitigação em andamento"' },
            { label: '14:22 — Incidente RESOLVIDO', sub: 'Error rate estável < 1% · impacto total ~17min · postmortem em 24h' },
          ]}
        />
        <Callout tone="info">
          <strong>Status page é obrigatório em P1/P2:</strong> Clientes que sabem que você está trabalhando
          no problema são mais pacientes. Status page desatualizada (ou inexistente) gera mais tickets de
          suporte do que o próprio incidente. Atualize a cada 30 minutos mesmo que não haja novidades:
          "Continuamos investigando. Próximo update em 30 minutos."
        </Callout>
      </Section>

      <Section title="Blameless postmortem: estrutura completa">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          O postmortem não é punição — é o investimento mais rentável que um time de engenharia pode fazer.
          Cada incidente bem analisado reduz a probabilidade dos próximos.
        </p>
        <CodeBlock lang="markdown">{`# Postmortem — Checkout Degradado — 2024-01-15
**Data do incidente:** 2024-01-15 14:05–14:22 UTC (17 minutos)
**Severidade:** P1
**Owner do postmortem:** Maria (Tech Lead)
**Status:** FECHADO — Action items no Linear projeto SRE

---

## Resumo executivo
Às 14:05 UTC, o checkout começou a apresentar 40% de taxa de erro
devido a rate limiting excessivo na integração com Stripe. Um deploy
de 13:50 introduziu configuração de retry agressiva (5 retries sem
backoff) que multiplicou o volume de chamadas à API do Stripe em 4×,
atingindo os limites de rate da conta. Rollback às 14:13 resolveu
o problema. Impacto: ~17 minutos de degradação, estimativa de ~230
checkouts não completados.

---

## Timeline

| Hora UTC | Evento |
|----------|--------|
| 13:50 | Deploy v2.1.4 do payment-service em produção |
| 14:05 | Alerta PagerDuty: error rate > 10% no checkout |
| 14:06 | João (IC) declara incidente P1, cria canal Slack |
| 14:07 | Maria identifica 429s do Stripe nos logs |
| 14:09 | Pedro confirma Stripe status page verde — problema é nosso |
| 14:11 | Hipótese confirmada: retry agressivo no código do deploy |
| 14:13 | Aprovação de rollback. Rollback iniciado. |
| 14:18 | Error rate < 2%. Rollback confirmado |
| 14:22 | Incidente fechado. Error rate < 0.5% |

---

## Root cause analysis — 5 Whys

**Sintoma:** 40% de requisições de checkout falhando com timeout

**Por quê 1:** payment-service recebia 429 (Too Many Requests) do Stripe
**Por quê 2:** Volume de chamadas à API do Stripe era 4× o normal
**Por quê 3:** Nova configuração de retry fazia 5 tentativas imediatas
  (sem backoff) em cada falha transitória de rede
**Por quê 4:** O código foi alterado sem revisão da documentação de
  rate limits do Stripe (100 req/s por conta)
**Por quê 5:** Não existia teste de integração que validasse o volume
  total de chamadas a APIs externas sob carga; e o processo de
  revisão de PR não inclui checklist de rate limits de terceiros

**Root cause:** Ausência de testes de volume de chamadas a APIs
externas e de checklist de rate limits no processo de review.

---

## O que foi bem
- Alerta detectou o problema em < 1 minuto após o deploy
- Rollback foi executado em < 5 minutos da decisão
- Comunicação no canal do incidente foi clara e chronológica
- Status page atualizada em < 10 minutos

## O que pode melhorar
- Review de PR não tinha checklist para integrações externas
- Não havia teste de carga para validar volume de chamadas ao Stripe
- Configuração de retry não tinha documentação de intenção
- Alerta poderia ter disparado em staging (temos Stripe sandbox)

---

## Action Items

| ID | Ação | Owner | Prazo | Ticket |
|----|------|-------|-------|--------|
| AI-1 | Adicionar exponential backoff com jitter no retry do Stripe | Carlos | 2024-01-22 | SRE-234 |
| AI-2 | Implementar teste de volume de chamadas no CI (k6 + mock) | Maria | 2024-01-29 | SRE-235 |
| AI-3 | Adicionar checklist "rate limits de terceiros" no PR template | João | 2024-01-19 | SRE-236 |
| AI-4 | Configurar alerta em staging quando chamadas Stripe > 80 req/s | Pedro | 2024-01-26 | SRE-237 |
| AI-5 | Documentar configuração de retry em ADR-023 | Carlos | 2024-01-22 | SRE-238 |

---

## Lições aprendidas
Integrações com rate limits externos precisam de testes de volume
automatizados no CI e checklist explícito no processo de review.
Retry sem backoff é um padrão perigoso em qualquer integração
com sistema externo — considerar linter de código para detectar.`}</CodeBlock>
      </Section>

      <Section title="Técnica dos 5 Whys: como aplicar sem cair na armadilha">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Os 5 Whys é poderoso mas tem uma armadilha comum: parar no "erro humano" como causa raiz.
        </p>
        <ComparisonFlow
          left={{
            label: 'Análise ruim — para no erro humano',
            steps: [
              'Por quê o sistema falhou? → Engenheiro configurou retry errado',
              'Por quê o engenheiro errou? → "Falta de atenção"',
              'FIM DA ANÁLISE — "Treinar engenheiro para ser mais cuidadoso"',
              'Resultado: nada muda. Próximo engenheiro comete o mesmo erro.',
            ],
          }}
          right={{
            label: 'Análise correta — vai ao sistema',
            steps: [
              'Por quê o sistema falhou? → Retry sem backoff causou storm',
              'Por quê não tinha backoff? → Padrão da lib não tem backoff por default',
              'Por quê escolhemos essa lib? → Sem checklist de avaliação para integrações',
              'Por quê não há checklist? → Processo de adoção de libs sem guia de rate limiting',
              'CONCLUSÃO: "Criar guia + checklist de rate limits no processo de adoção de libs"',
              'Resultado: sistema melhorado, próximo engenheiro protegido.',
            ],
          }}
        />
        <Callout tone="warn">
          <strong>Regra do blameless postmortem:</strong> Se a análise termina em "pessoa X deveria ter
          feito Y diferente", você não chegou na causa raiz. Pergunte: "Qual sistema, processo ou
          ferramenta teria protegido qualquer engenheiro de cometer esse erro?"
        </Callout>
      </Section>

      <Section title="Acompanhamento de action items: onde postmortems falham">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Análise impecável, zero execução — é o padrão mais comum. Action items de postmortem competem
          com features no backlog e frequentemente perdem.
        </p>
        <DecisionBox
          scenario="Time tem 8 postmortems dos últimos 3 meses com 40+ action items, apenas 5 foram concluídos"
          winner="Postmortem action items em sprints dedicados + SLO de resolução de AIs"
          winnerColor={ACCENT}
          why="Action items de postmortem não competem bem com features por atenção. A solução é reservar capacidade fixa (20% do sprint) para trabalho de confiabilidade + SLO interno: AIs de P1 concluídos em 30 dias, P2 em 60 dias. Itens não concluídos no prazo escalam automaticamente para o manager."
          alternatives={[
            { label: 'Priorizar no backlog normal', when: 'Anti-pattern — features sempre ganham, postmortem AIs acumulam' },
            { label: 'Sprint dedicado de confiabilidade (trimestral)', when: 'Funciona em times maiores com backlog de confiabilidade acumulado' },
            { label: 'Delegar para time de SRE dedicado', when: 'Se existe time de SRE separado do time de produto — mas mesmo assim, AIs de código são do time de produto' },
          ]}
        />
      </Section>

      <Section title="On-call saudável: evitar burnout e alertas de ruído">
        <ComparisonTable
          headers={['Problema', 'Sintoma', 'Solução']}
          rows={[
            ['Alert fatigue', 'On-call silencia alertas sem investigar', 'Cada alerta deve ser actionable. Revisar e fechar alertas ruidosos após cada semana de on-call'],
            ['Pager de madrugada frequente', 'SRE exausta, rotatividade alta', 'SLO para % de alertas fora do horário comercial; auto-healing para causas conhecidas'],
            ['Sem runbook', 'Cada incidente reinventa a solução', 'Runbook obrigatório para cada alerta. Link no próprio alerta'],
            ['Escalação tarde demais', 'Incidente se prolonga por horas sem ajuda', 'IC deve escalar após 30min sem progresso — não é fraqueza, é protocolo'],
            ['Rotação muito curta', 'Contexto insuficiente para diagnosticar', 'Rotações de 1 semana mínimo. Handoff estruturado (escrito) entre turnos'],
          ]}
        />
        <CodeBlock lang="markdown">{`# Template de handoff de on-call

## Handoff On-Call — 2024-01-15 → 2024-01-22
**Saindo:** @maria  **Assumindo:** @pedro

### Incidentes da semana
- [RESOLVIDO] Checkout degradado 01/15 — rollback em produção, postmortem em andamento
- [EM MONITORAMENTO] Latência elevada no relatório de vendas (P3) — investigando query lenta

### Alertas ruidosos (revisar)
- "DiskUsage > 80% em worker-03": falso positivo — disco era de log rotation, já corrigido
  → Ação: atualizar threshold para 90% ou excluir o volume de log

### Runbooks atualizados esta semana
- Adicionado: payment-service-rate-limit.md
- Atualizado: database-connection-pool.md (novo threshold)

### O que ficar de olho
- Deploy planejado para quarta (16:00 BRT) — checkout v2.1.5 com o fix do retry
- Capacidade de DB: atual 73%, projeção de 85% até sexta com volume de vendas

### Contatos de plantão
- Stripe suporte enterprise: +1-xxx (incidente P1 de pagamento)
- AWS Enterprise Support: console.aws.amazon.com/support`}</CodeBlock>
      </Section>

      <Section title="Learning review: fechando o ciclo">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Além do postmortem imediato (24-48h), times maduros fazem uma revisão de aprendizados
          30 dias depois para verificar se os action items foram executados e se os padrões mudaram.
        </p>
        <CodeBlock lang="markdown">{`# Learning Review — Fevereiro 2024

## Action Items de Postmortems (Jan 2024)
| AI | Status | Resultado |
|----|--------|-----------|
| AI-1: Backoff no retry Stripe | ✅ Concluído | Sem novos incidents de rate limit |
| AI-2: Teste de volume no CI | ✅ Concluído | Capturou 2 bugs em PR antes do merge |
| AI-3: Checklist de rate limits | ✅ Concluído | Em uso desde 01/20 |
| AI-4: Alerta em staging | 🟡 Em progresso | ETA: 02/15 |
| AI-5: ADR de retry | ✅ Concluído | ADR-023 publicado |

## Métricas do mês
- Incidentes P1: 1 (meta: < 2) ✅
- MTTR médio: 23 min (meta: < 30 min) ✅
- Alertas fora do horário: 4 (meta: < 5) ✅
- Action items concluídos no prazo: 80% (meta: > 70%) ✅

## Tendências
- Nenhum reincidente de rate limiting (AI-1 funcionou)
- Latência de DB ainda preocupante — iniciar investigação de índices

## Próximo foco
- Automatizar runbook de connection pool (toil recorrente)
- Revisar alertas de DiskUsage (3× falso positivo no mês)`}</CodeBlock>
      </Section>

      <Section title="Q&A — perguntas típicas de entrevista SRE">
        <div className="flex flex-col gap-4">
          {[
            {
              q: 'Como você lidaria com um incidente onde a causa raiz é um bug introduzido por outro time?',
              a: 'Durante o incidente: foco em mitigar o impacto (rollback, feature flag, roteamento alternativo) — não em culpa. Após resolver: postmortem blameless conjunto com os dois times. A pergunta é "quais sistemas ou processos falharam em detectar esse bug antes de produção" — não "quem introduziu o bug". Action items podem incluir melhores testes de integração entre times, review cruzado de deploys de serviços com dependências críticas, ou canary automático para serviços com histórico de interdependências.',
            },
            {
              q: 'Qual a diferença entre MTTR, MTTD e MTTF?',
              a: 'MTTD (Mean Time To Detect): tempo médio entre a falha acontecer e ser detectada — mede qualidade dos alertas. MTTR (Mean Time To Recover): tempo médio entre detecção e resolução — mede eficiência da resposta. MTTF (Mean Time To Failure): tempo médio entre o fim de um incidente e o próximo — mede frequência. Times maduros otimizam MTTD (alertas mais rápidos e precisos) e MTTR (runbooks, automação de rollback) antes de atacar MTTF.',
            },
            {
              q: 'Como convencer liderança a investir em confiabilidade vs features quando não há incidente visível?',
              a: 'Use dados de error budget: "Nos últimos 3 meses consumimos 78% do error budget de 90 dias. Se o padrão continuar, violaremos o SLA em X semanas — com custo de $Y em créditos de cliente." Error budget transforma "queremos fazer a coisa certa" em "temos dados mostrando risco financeiro concreto". Se não há incidente visível mas o budget está alto, é hora de investir — não esperar o incidente.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-lg p-4" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <p className="font-semibold mb-2" style={{ color: 'var(--ffv-muted)' }}>P: {q}</p>
              <p className="text-sm leading-7" style={{ color: 'var(--ffv-muted)' }}>R: {a}</p>
            </div>
          ))}
        </div>
      </Section>

      <Callout tone="success">
        <strong>Take-aways — encerrando a trilha de Observabilidade & SRE:</strong>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Incidente Commander não resolve — coordena. Separar os papéis é o que transforma caos em resposta estruturada.</li>
          <li>Declare cedo: o custo de declarar um incidente que não era é mínimo. O custo de não declarar um que era é alto.</li>
          <li>Blameless postmortem não é cortesia — é estratégia: blame cria incentivo para esconder erros e garantir reincidência.</li>
          <li>5 Whys deve terminar no sistema, nunca no "erro humano". Qual proteção sistêmica estava ausente?</li>
          <li>Action items sem owner + prazo + ticket são promessas vazias. 80% dos postmortems falham na execução, não na análise.</li>
          <li>On-call saudável: cada alerta é actionable, tem runbook, e é revisado após cada rotação. Alert fatigue mata a eficácia.</li>
          <li>Observabilidade completa = logs estruturados + métricas RED/USE + traces distribuídos + SLOs com burn rate alerts + incidente response — tudo integrado.</li>
        </ul>
      </Callout>
    </div>
  );
}
