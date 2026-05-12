import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, FlowDiagram, Timeline, NodeGraph } from '@/components/article/primitives';

export const metadata = getModuleMetadata('anpd-incident-response');

const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Em qual prazo a ANPD espera notificação formal de incidente de segurança que possa acarretar risco ou dano relevante aos titulares, conforme Resolução CD/ANPD nº 15/2024?',
    options: ['24 horas', '72 horas após ciência do incidente (regra de boas práticas alinhada à Resolução CD/ANPD 15/2024)', '7 dias úteis', '30 dias'],
    correct: 1,
    explanation: 'A Resolução CD/ANPD nº 15/2024 estabelece prazo de 3 dias úteis (até 72h) após a ciência do incidente para comunicar a ANPD via Peticionamento Eletrônico no gov.br. Antes da resolução o entendimento era "prazo razoável" do Art. 48 LGPD — agora é regra clara.',
  },
  {
    question: 'O que NÃO é obrigatório constar na comunicação inicial à ANPD de um incidente?',
    options: [
      'Descrição da natureza dos dados pessoais afetados',
      'Número exato de CPFs vazados confirmado por auditoria forense — pode ser estimativa inicial',
      'Medidas técnicas adotadas para proteger os dados',
      'Riscos relacionados ao incidente',
    ],
    correct: 1,
    explanation: 'Art. 48 §1º LGPD pede descrição (não número exato), natureza dos dados, titulares envolvidos, medidas técnicas, riscos e medidas para reverter. Estimativa inicial é aceita — você atualiza conforme a investigação avança.',
  },
  {
    question: 'Sobre chain of custody em evidence collection durante incidente:',
    options: [
      'É opcional para SaaS pequeno',
      'Garante que evidências (logs, dumps, traces) tenham trilha rastreável de quem, quando e como manipulou — fundamental para defesa em eventual processo judicial e para o relatório à ANPD',
      'Substitui a necessidade de notificação',
      'Aplica-se apenas em incidentes envolvendo cartão de crédito',
    ],
    correct: 1,
    explanation: 'Chain of custody é a documentação imutável do ciclo da evidência. Sem ela, qualquer parte adversa contesta a autenticidade dos logs em juízo. Tools: hash SHA-256 do snapshot, write-once log, fotos do timeline.',
  },
  {
    question: 'No caso real "Marisa" (vazamento de dados 2023), qual foi o principal problema apontado pela ANPD?',
    options: [
      'Uso de senha fraca',
      'Demora na notificação dos titulares e à ANPD, somada à ausência de RIPD prévio para a operação de tratamento de dados sensíveis afetada',
      'Falta de criptografia em rest',
      'Servidor sem firewall',
    ],
    correct: 1,
    explanation: 'A ANPD aplicou advertência à Marisa e enfatizou demora na notificação + ausência de DPIA para a operação. O timing da comunicação aos titulares ficou abaixo do esperado — incidente que poderia ter sido administrado virou autuação pública.',
  },
  {
    question: 'Qual é a sequência correta do runbook de incidente sério dentro das primeiras 4 horas?',
    options: [
      'Notificar ANPD → identificar escopo → reverter dano → comunicar',
      'Contenção (isolar sistemas afetados) → preservação de evidências → análise de escopo → comunicação interna (DPO, CISO, jurídico) → triagem para decidir se enquadra Art. 48',
      'Comunicar imprensa → reverter dano → notificar ANPD',
      'Esperar 24h para confirmar e só depois agir',
    ],
    correct: 1,
    explanation: 'Conter primeiro (não destrua evidência ao corrigir), preservar logs/snapshots, dimensionar escopo, acionar DPO+CISO+jurídico, só então decidir se a comunicação à ANPD se aplica (nem todo incidente acarreta "risco ou dano relevante" — Art. 48 LGPD).',
  },
  {
    question: 'Qual ferramenta de cloud é mais útil para evidence preservation imediata em vazamento que envolva infraestrutura AWS?',
    options: [
      'CloudWatch Logs Insights apenas',
      'AWS CloudTrail (audit trail imutável) + EBS snapshot do volume afetado + S3 Object Lock para reter evidências em modo WORM',
      'IAM Access Analyzer',
      'AWS Trusted Advisor',
    ],
    correct: 1,
    explanation: 'CloudTrail já é append-only no service plane; o snapshot EBS congela o estado do volume; S3 Object Lock garante WORM (Write-Once-Read-Many) para a evidência durante a investigação e eventual ação judicial.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="anpd-incident-response"
      title="ANPD incident response: 72h para notificar, como não fritar"
      icon="🚨"
      xp={70}
      readTime={14}
      trailName="Privacy & Compliance Engineering"
      trailColor={accent}
      nextSlug="privacy-by-design-arquitetura"
      nextTitle="Privacy by Design: arquitetura que minimiza"
      quiz={quiz}
    >
      <Section title="O cenário: 23h de sexta, vazamento detectado" accent={accent}>
        <p className="text-sm leading-6">
          Um SOC alerta às 23h12 de sexta-feira: query anômala no banco, dump de ~2.4M registros saiu pela API de relatórios. Tem CPF, e-mail, telefone e histórico de compras. Você tem <b>72 horas</b> para comunicar formalmente à ANPD (Resolução CD/ANPD nº 15/2024) — e a janela só conta a partir de quando a empresa <i>toma ciência</i>, não de quando o invasor entrou.
        </p>
        <Callout tone="danger" icon="⏱️">
          O relógio começou. Cada hora pesa: você está construindo, ao mesmo tempo, a operação de contenção, o relatório regulatório e a defesa jurídica futura.
        </Callout>
      </Section>

      <Section title="As 4 fases do runbook" accent={accent}>
        <FlowDiagram
          title="Incidente LGPD — Fluxo das primeiras 72h"
          accent={accent}
          orientation="vertical"
          steps={[
            { icon: '🛑', label: 'T+0h — Contenção', desc: 'Isolar sistemas afetados sem destruir evidência' },
            { icon: '📦', label: 'T+2h — Preservação', desc: 'Snapshots EBS, dump de logs, hash SHA-256, S3 Object Lock' },
            { icon: '🔍', label: 'T+12h — Escopo', desc: 'Quem foi afetado? Qual dado? Qual base legal? Análise forense' },
            { icon: '📣', label: 'T+24-48h — Comunicação', desc: 'DPO → ANPD via gov.br + titulares afetados' },
            { icon: '📝', label: 'T+72h — Relatório formal', desc: 'Peticionamento eletrônico ANPD com todos os requisitos Art. 48' },
          ]}
        />
      </Section>

      <Section title="O que Art. 48 da LGPD exige na notificação" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Item exigido', 'Detalhe técnico']}
          rows={[
            ['Natureza dos dados afetados', 'Categorias (cadastrais, financeiros, sensíveis Art. 11, biométricos, saúde, criança/adolescente)'],
            ['Titulares envolvidos', 'Estimativa numérica + categoria (clientes, funcionários, leads)'],
            ['Medidas técnicas pré-incidente', 'Criptografia, pseudonimização, controle de acesso — o que já existia'],
            ['Riscos do incidente', 'Probabilidade de uso para fraude, exposição pública, danos morais'],
            ['Medidas de reversão', 'Reset de credencial, rotação de chaves, revogação de tokens, comunicação aos titulares'],
            ['Justificativa de demora', 'Se passar de 72h, explicar o porquê (investigação em curso, dimensão complexa)'],
          ]}
        />
      </Section>

      <Section title="Preservação de evidência — chain of custody" accent={accent}>
        <p className="text-sm leading-6">
          A primeira coisa que vai pedir num eventual processo judicial é a <b>cadeia de custódia</b> das evidências. Sem ela, o vazamento vira <i>"sua palavra contra a do invasor"</i>. Stack mínima:
        </p>
        <CodeBlock lang="bash">{`# 1. Snapshot imutável do volume afetado (AWS)
aws ec2 create-snapshot \\
  --volume-id vol-0a1b2c3d \\
  --description "evidence-incident-2026-05-23-23h" \\
  --tag-specifications 'ResourceType=snapshot,Tags=[{Key=evidence,Value=true},{Key=case,Value=INC-2026-001}]'

# 2. Hash SHA-256 dos logs preservados
find /var/log/app -name "*.log" -newer /tmp/cutoff_2026-05-23 -print0 | \\
  xargs -0 sha256sum > /evidence/INC-2026-001/hashes.txt

# 3. Upload para S3 com Object Lock (WORM por 7 anos)
aws s3 cp /evidence/INC-2026-001/ s3://forensics-vault/INC-2026-001/ \\
  --recursive \\
  --object-lock-mode COMPLIANCE \\
  --object-lock-retain-until-date "2033-05-23T00:00:00Z"`}</CodeBlock>
        <Callout tone="warn">
          Nunca aplique fix em produção <i>antes</i> de preservar — <InlineCode>git push</InlineCode> com rebase destrói histórico relevante; <InlineCode>DROP TABLE audit</InlineCode> ao "limpar dump" é fim de jogo defensivo.
        </Callout>
      </Section>

      <Section title="Quem aciona quem — o war room" accent={accent}>
        <NodeGraph
          title="Comando do incidente — papéis e responsabilidades"
          accent={accent}
          columns={[
            { label: 'Frente técnica', nodes: [
              { icon: '🛡️', label: 'CISO / Security Lead', sub: 'Comando técnico, contenção' },
              { icon: '⚙️', label: 'SRE on-call', sub: 'Isolamento e snapshots' },
              { icon: '🔬', label: 'Forensics', sub: 'Análise dos logs / scope' },
            ]},
            { label: 'Frente regulatória', nodes: [
              { icon: '📋', label: 'DPO', sub: 'Comunicação ANPD' },
              { icon: '⚖️', label: 'Jurídico', sub: 'Risco + comunicação aos titulares', tone: 'emphasis' },
              { icon: '💼', label: 'CEO / Diretoria', sub: 'Aprovação de comunicação pública' },
            ]},
            { label: 'Frente operacional', nodes: [
              { icon: '📞', label: 'Customer Success', sub: 'Suporte ao titular afetado' },
              { icon: '📣', label: 'Comunicação', sub: 'Mídia, se vazar antes' },
              { icon: '👥', label: 'RH', sub: 'Comunicação interna' },
            ]},
          ]}
        />
      </Section>

      <Section title="Casos brasileiros recentes — o que aprendemos" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { when: '2023', label: 'Marisa', detail: 'Vazamento de dados de clientes; ANPD apontou demora na notificação e ausência de DPIA prévia para a operação afetada — advertência pública.', highlight: true },
            { when: '2024', label: 'Banco Pan', detail: 'Tratamento irregular reportado; ANPD aplicou multa significativa. Falha em base legal e em comunicação aos titulares.' },
            { when: '2024', label: 'Procon SP × C&A', detail: 'Operação envolvendo CPFs de clientes — sanção pesada da Senacon e ANPD, com publicidade negativa duradoura.', highlight: true },
            { when: '2025', label: 'Operadora de saúde XPTO', detail: 'Dados sensíveis (Art. 11 LGPD) expostos; multa próxima ao teto de 2% do faturamento da unidade BR.' },
            { when: '2026', label: 'Resolução CD/ANPD 15/2024 plenamente vigente', detail: '72h é a régua. Empresa que comunica em 48h sai melhor que empresa que comunica em 96h.' },
          ]}
        />
      </Section>

      <Section title="Comunicação ao titular — o lado humano" accent={accent}>
        <p className="text-sm leading-6">
          Tão importante quanto a notificação à ANPD: comunicar quem foi afetado. O Art. 48 §1º exige comunicação clara, em prazo razoável. Template mínimo:
        </p>
        <CodeBlock lang="text">{`Assunto: Comunicação importante sobre os seus dados na <Empresa>

Olá <nome>,

Em 23/05/2026, identificamos um incidente de segurança que pode ter
exposto os seguintes dados que você forneceu à <Empresa>:
- Nome
- E-mail
- Telefone
- (lista exaustiva, em linguagem clara — sem jargão técnico)

O que estamos fazendo:
1. Acionamos a Autoridade Nacional de Proteção de Dados (ANPD)
2. Reset preventivo de credenciais ocorreu em 24/05 às 08h
3. Auditoria forense externa contratada (<Nome da empresa>)

O que recomendamos a você:
- Trocar a senha do seu acesso em <link>
- Ativar a verificação em duas etapas
- Estar atento a tentativas de golpe usando seus dados

Estamos à disposição em <canal_dpo> e no telefone <telefone_dpo>.

— Encarregado pelo Tratamento de Dados (DPO)
<Empresa>`}</CodeBlock>
        <Callout tone="info">
          O tom importa juridicamente: comunicação confusa ou que minimiza o risco pode virar agravante. Linguagem clara + ações concretas + canal direto.
        </Callout>
      </Section>

      <Section title="Pós-mortem regulatório (depois das 72h)" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Root cause analysis', v: 'Identificar a causa técnica (CVE explorada, credencial vazada, erro de config, comportamento interno).' },
            { k: 'Linha do tempo certificada', v: 'Reconstituir o T0 real do invasor (não o T0 da detecção). Diferença comum: 3 a 90 dias.' },
            { k: 'Atualização do RIPD', v: 'Se o incidente revelou risco não mapeado, refazer a Avaliação de Impacto da operação afetada.' },
            { k: 'Lições para o programa', v: 'Atualizar runbook, treinar time, ajustar SLO de detection-to-containment.' },
            { k: 'Acompanhamento ANPD', v: 'A ANPD pode pedir relatório final detalhado em 30/60 dias. Mantenha o caso aberto internamente até a Conclusão de Procedimento (CP) chegar.' },
          ]}
        />
      </Section>

      <Section title="Métricas que importam pro programa" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Métrica', 'Alvo razoável', 'Fonte']}
          rows={[
            ['MTTD (Mean Time To Detect)', '< 24h para incidente sério', 'SIEM + alertas + threat hunting'],
            ['MTTC (Mean Time To Contain)', '< 4h após detecção', 'Runbook automatizado'],
            ['Time-to-ANPD-notification', '< 48h (folga vs 72h)', 'Tracker de incidente'],
            ['Time-to-data-subject', '< 5 dias úteis após contenção', 'CRM/Email'],
            ['Cost per incident', 'Tracking interno', 'Inclui multa, jurídico, comunicação, reputação'],
          ]}
        />
      </Section>

      <Section title="Recursos e referências" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Lei 13.709/2018 (LGPD)', v: <a href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm" target="_blank" rel="noreferrer">planalto.gov.br — LGPD</a> },
            { k: 'Resolução CD/ANPD 15/2024', v: <a href="https://www.gov.br/anpd/pt-br" target="_blank" rel="noreferrer">gov.br/anpd</a> },
            { k: 'Peticionamento Eletrônico', v: 'Portal gov.br → ANPD → Comunicação de Incidente' },
            { k: 'NIST SP 800-61', v: 'Computer Security Incident Handling Guide (referência internacional)' },
            { k: 'ISO/IEC 27035', v: 'Information Security Incident Management — framework formal' },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
