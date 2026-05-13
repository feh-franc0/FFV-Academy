import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('game-days-estruturados');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'O que separa um "game day" de "teste de carga na sexta"?',
    options: [
      'Só o nome',
      'Game day é exercício estruturado com hypothesis explícita, scope delimitado, abort criteria pré-acordado, facilitator isolado, observers documentando, runbook versionado e postmortem blameless. Tudo documentado antes; executado fora do calor do incident real',
      'Game day é mais longo',
      'Game day exige pager',
    ],
    correct: 1,
    explanation: 'O SRE Book (Google) dedica capítulo inteiro a game days (Disaster Recovery Testing) exatamente porque falta estrutura vira caos. O ritual (hypothesis → scope → abort → execute → observe → postmortem) força aprendizado organizacional. Teste de carga ad-hoc ensina o engenheiro. Game day ensina o time.',
  },
  {
    question: 'Por que existe um "facilitator" e "observers" separados do time on-call?',
    options: [
      'Política',
      'Facilitator conduz o exercício, controla timeline e gatilho de abort — mas não resolve o incident. Observers documentam decisões, tempo de detecção, confusão com ferramentas, gaps de runbook. Time on-call responde como faria em incident real, sem saber que era exercício (quando aplicável)',
      'Facilitator é opcional',
      'Observers substituem on-call',
    ],
    correct: 1,
    explanation: 'Separação de papéis é o que transforma game day em fonte de dados, não em apresentação. Facilitator tem o botão vermelho (abort). Observers capturam MTTD/MTTR/confusão sem enviesar o on-call. Sem esses papéis, o game day vira show-off do engenheiro mais experiente, e o time não aprende nada.',
  },
  {
    question: 'Qual o principal entregável de um game day bem feito?',
    options: [
      'Certificado',
      'Postmortem blameless com: timeline factual, gaps de runbook encontrados, alertas que não dispararam (ou dispararam errado), ferramentas lentas, action items com owner e prazo, e atualização do próprio runbook. O exercício vale pelo que muda no sistema depois',
      'Vídeo da galera',
      'Foto do time',
    ],
    correct: 1,
    explanation: 'Game day sem postmortem com action items é teatro. Google SRE tracking: cada finding vira ticket com owner, severity e deadline. Métrica de saúde: % de action items de game days anteriores concluídos. Time que não fecha action items não deveria rodar o próximo game day — está só acumulando dívida.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="game-days-estruturados"
      title="Game days estruturados"
      icon="🎮"
      xp={50}
      readTime={12}
      trailName="Chaos Engineering"
      trailColor={accent}
      nextSlug="fault-injection-pratica"
      nextTitle="Fault injection prática"
      quiz={quiz}
    >
      <Section title="Runbook canônico de game day" accent={accent}>
        <CodeBlock lang="markdown">{`# Game Day — Failover multi-AZ do checkout

## Metadados
- Data: 2026-05-12, 10h–12h BRT
- Facilitator: Fernando (não está no on-call rotation hoje)
- Observers: Marina (SRE), Joao (product)
- On-call responder: time checkout (rotação normal)
- Severidade simulada: SEV-2

## Hipótese (steady-state)
- checkout_success_rate_5m permanece >= 99.0%
- p99_checkout_latency_ms permanece < 1500ms
- Zero error budget adicional consumido além do forecast

## Escopo
- Derrubar AZ us-east-1a (apenas pods do checkout — não DB)
- Duração prevista: 20 minutos
- Blast radius: 33% dos pods (3 AZs, 1 derrubada)

## Abort criteria (qualquer um dispara rollback imediato)
- success_rate < 97% por 2 min consecutivos
- p99_latency > 3000ms por 2 min
- Alerta PagerDuty SEV-1 de outro serviço
- Facilitator julgar necessário (trump card)

## Timeline
- T-15 comunicar #eng-chaos (sem detalhe do método)
- T-10 abrir war-room Zoom + Slack huddle
- T-5  checar dashboards baseline
- T+0  aplicar chaos (kubectl cordon + drain por label az=1a)
- T+5  observer check-in
- T+15 facilitator decide: extend / abort / rollback
- T+20 rollback (uncordon, wait ready)
- T+30 debrief quente (10min, só fatos)
- D+1  postmortem escrita circulada
- D+7  action items em sprint planning

## Comunicação
- Pre: "#eng-chaos 15min antes, mensagem pre-aprovada"
- Durante: thread única no war-room, timestamps
- Post: postmortem compartilhada, não-punitiva`}</CodeBlock>
      </Section>

      <Section title="Papéis e responsabilidades" accent={accent}>
        <CodeBlock lang="markdown">{`Facilitator
- Conduz timeline, controla abort
- Não resolve incident
- Não está na rotação on-call do dia

Observers (2+)
- Documentam tempo de detecção, de mitigação, de comunicação
- Anotam gaps de runbook, alertas que não dispararam, UX de ferramenta
- Não ajudam a resolver

On-call responders
- Respondem como responderiam a incident real
- Seguem runbook existente
- Reportam o que confunde

Stakeholder observer (product/leadership)
- Entende impacto de negócio do que foi aprendido
- Aprova action items com custo`}</CodeBlock>
        <Callout tone="warn" icon="🛑">
          Se o facilitator começar a "ajudar" o on-call, o game day virou treinamento individual. Pare, reorganize papéis, recomece.
        </Callout>
      </Section>

      <Section title="Postmortem blameless — template" accent={accent}>
        <CodeBlock lang="markdown">{`# Postmortem: Game Day AZ failover 2026-05-12

## Resumo executivo
- Hipótese confirmada parcialmente: success_rate caiu a 98.4% (tolerável) mas p99 latency
  subiu a 2100ms (acima de 1500ms esperado).
- Descoberto: connection pool para Redis não redistribui em AZ loss.

## Timeline (factual, sem blame)
10:00 chaos aplicado
10:03 alerta p99 latency disparou (OK)
10:04 responder abriu runbook, não achou seção "AZ down"
10:08 responder identificou connection pool via grep no código (gap)
10:14 facilitator decidiu continuar (ainda dentro do abort criteria)
10:20 chaos revertido
10:22 sistema normalizado

## O que funcionou
- Auto-scaling redistribuiu pods em 90s
- Load balancer removeu AZ sick em 45s
- Alerta de latency disparou corretamente

## O que falhou
- Runbook não tinha seção "AZ down"
- Connection pool Redis configurado com AZ affinity hard
- Dashboard de connection pool não existe

## Action items
- [ ] AI-1 (marina, 2sem): seção AZ failover no runbook
- [ ] AI-2 (joao, 1sem): dashboard connection-pool-redis
- [ ] AI-3 (fernando, 1mês): remover AZ affinity do pool, adicionar retry cross-AZ
- [ ] AI-4 (time, próximo sprint): chaos regression test dessa falha no CI`}</CodeBlock>
      </Section>
    </ModuleLayout>
  );
}
