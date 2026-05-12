import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, DecisionBox, ArchFlow, Timeline } from '@/components/article/primitives';

export const metadata = getModuleMetadata('transferencia-internacional-dados');

const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'O que regula transferência internacional de dados pessoais na LGPD?',
    options: [
      'Art. 7º',
      'Capítulo V (Arts. 33 a 36). Art. 33 lista hipóteses: países com nível adequado de proteção, garantias específicas (cláusulas-padrão, normas corporativas globais, selos/certificações), cooperação jurídica internacional, proteção da vida, autorização ANPD, compromisso assumido em acordo, execução de política pública, consentimento específico do titular',
      'Apenas o Marco Civil',
      'Não há regulamentação',
    ],
    correct: 1,
    explanation:
      'Art. 33 LGPD lista 9 hipóteses (I a IX). A escolha da hipótese determina o desenho de compliance. Cláusulas-padrão são detalhadas pela Resolução CD/ANPD nº 19/2024, em vigor desde set/2024.',
  },
  {
    question: 'O que é Schrems II e por que importa para um time brasileiro usando AWS us-east-1 ou OpenAI?',
    options: [
      'Caso irrelevante para o Brasil',
      'Schrems II (Caso C-311/18 — TJUE, julho 2020) invalidou o Privacy Shield UE-EUA, exigindo análise caso a caso quando dados saem da UE para país com vigilância governamental ampla. Brasil não está vinculado à decisão, mas serve de referência metodológica: ANPD recomenda Transfer Impact Assessment (TIA) similar — avaliar se o destinatário pode ser compelido por leis estrangeiras a violar a LGPD',
      'É uma resolução brasileira',
      'É um padrão de cripto',
    ],
    correct: 1,
    explanation:
      'Após Schrems II, UE adotou o Trans-Atlantic Data Privacy Framework (jul/2023). Brasil ainda não tem adequacy decision com EUA — toda transferência precisa de hipótese do Art. 33. TIA é boa prática que ANPD valoriza em fiscalização.',
  },
  {
    question: 'A Resolução CD/ANPD nº 19/2024 — o que trouxe?',
    options: [
      'Proibição total de transferência',
      'Aprovou as cláusulas-padrão contratuais (CCs) brasileiras, parecidas com as SCCs europeias — anexo com cláusulas obrigatórias para o contrato entre controlador exportador e importador, definindo direitos dos titulares, governança e fiscalização. Em vigor desde 23/setembro/2024',
      'Apenas mudou taxas',
      'Não trata de dados',
    ],
    correct: 1,
    explanation:
      'Texto oficial disponível em gov.br/anpd. As cláusulas-padrão são a hipótese mais prática para empresas BR: contratualmente vinculam o importador a respeitar a LGPD. Norma corporativa global (BCRs) também é caminho para grupos multinacionais.',
  },
  {
    question: 'Quando NÃO precisa invocar hipótese do Art. 33?',
    options: [
      'Quando dado fica na mesma região AWS BR',
      'Transferência interna no Brasil não é "internacional". Mas atenção: AWS sa-east-1 (São Paulo) é território BR; us-east-1 (Virginia) é EUA. CDN (CloudFront) tem POPs globais — cache de PII pode ativar gatilho. Faça inventário de regiões reais',
      'Sempre precisa',
      'Apenas em horário comercial',
    ],
    correct: 1,
    explanation:
      'Region selection vira decisão de compliance, não só de performance/latência. Para PII brasileira, prefira sa-east-1 e us-east-2 com restrições de CMK regional. Cuide de CDNs e log shipping.',
  },
  {
    question: 'OpenAI / Anthropic — como tratar transferência de prompts com PII para EUA?',
    options: [
      'Proibir uso',
      'Estratégias: (1) Bedrock em sa-east-1 (Anthropic Claude disponível por região), Vertex AI em sa-east1; (2) data residency contratual + cláusulas-padrão ANPD com vendor; (3) anonimização/tokenização pré-prompt; (4) consentimento específico em features explícitas; (5) Zero Data Retention agreements (OpenAI Enterprise, Anthropic). Documente no DPIA',
      'Não é problema',
      'Apenas usar fora do BR',
    ],
    correct: 1,
    explanation:
      'AWS Bedrock em sa-east-1 desde 2024 com modelos Anthropic e Amazon (Titan). Google Vertex AI em southamerica-east1 com Gemini. OpenAI: através de Azure OpenAI em brazilsouth. Sempre acompanhe contrato + DPA + ZDR.',
  },
  {
    question: 'O que é Transfer Impact Assessment (TIA) e quando rodar?',
    options: [
      'É opcional',
      'Análise documentada caso-a-caso: (1) natureza dos dados; (2) finalidade; (3) destino e leis locais (incluindo poderes de vigilância governamental e acesso por autoridades); (4) medidas técnicas e contratuais; (5) decisão GO/NO-GO. Rode para todo destino fora de país com adequacy decision OU quando o destino tem leis de acesso amplo (ex: FISA 702, CLOUD Act)',
      'Sinônimo de DPIA',
      'Substitui contrato',
    ],
    correct: 1,
    explanation:
      'EDPB Recommendations 01/2020 detalha metodologia. Brasil ainda não publicou template oficial; use o EDPB como base. ANPD em fiscalização espera ver TIA quando o controle se baseia em cláusulas-padrão.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="transferencia-internacional-dados"
      title="Transferência internacional: Cláusulas-padrão ANPD, Schrems II"
      icon="🌍"
      xp={55}
      readTime={11}
      trailName="Privacy & Compliance Engineering"
      trailColor={accent}
      nextSlug="secret-scanning-pre-commit"
      nextTitle="Secret scanning: gitleaks, trufflehog, GitHub Advanced Security"
      quiz={quiz}
    >
      <div className="flex flex-col gap-8 text-sm leading-7">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          AWS us-east-1, OpenAI API, Stripe, Datadog, Segment, Snowflake multi-region. Todo software moderno faz
          transferência internacional de dados — quase sempre <em>sem perceber</em>. LGPD Cap. V (Arts. 33-36) define
          as 9 hipóteses; a Resolução <strong>CD/ANPD nº 19/2024</strong> traz as cláusulas-padrão brasileiras, em vigor
          desde set/2024. Este módulo é o playbook prático.
        </p>

        <Section title="Art. 33 LGPD — as 9 hipóteses" accent={accent}>
          <ComparisonTable
            accent={accent}
            headers={['Inciso', 'Hipótese', 'Quando usar (engenharia)']}
            rows={[
              ['I', 'Países/organismos com nível de proteção adequado', 'Quando ANPD reconhecer adequacy (lista futura)'],
              ['II', 'Garantias específicas — cláusulas-padrão, cláusulas contratuais, normas corporativas globais (BCRs), selos/certificações', 'Caminho prático para SaaS/cloud — Resolução 19/2024'],
              ['III', 'Cooperação jurídica internacional', 'Comissões rogatórias; raro em engenharia'],
              ['IV', 'Proteção da vida ou incolumidade física', 'Emergências'],
              ['V', 'Autorização da ANPD', 'Caso a caso'],
              ['VI', 'Compromisso assumido em acordo internacional', 'Tratados'],
              ['VII', 'Execução de política pública / atribuição legal', 'Governo'],
              ['VIII', 'Consentimento específico e destacado', 'Útil em features opt-in (export individual)'],
              ['IX', 'Necessário para execução de contrato/procedimentos preliminares', 'B2C cross-border'],
            ]}
          />
          <Callout tone="info" icon="💡">
            Lista de países com nível adequado (Art. 33 I) <strong>ainda não foi publicada pela ANPD</strong>. Até lá, a
            hipótese II (garantias específicas) é o cavalo de batalha — particularmente as cláusulas-padrão da Resolução
            19/2024.
          </Callout>
        </Section>

        <Section title="Resolução CD/ANPD nº 19/2024 — o que muda" accent={accent}>
          <KeyValue
            accent={accent}
            items={[
              { k: 'Vigência', v: '23/set/2024' },
              { k: 'Escopo', v: 'Cláusulas-padrão contratuais (CCs) — anexo único; contratos existentes têm 24 meses para adequação' },
              { k: 'Obrigações exportador BR', v: 'Garantir que importador respeita LGPD; manter ROPA; comunicar à ANPD em casos específicos' },
              { k: 'Obrigações importador (exterior)', v: 'Atender direitos dos titulares; notificar incidentes ao exportador; submeter-se à jurisdição BR (escolha de foro)' },
              { k: 'Direitos do titular', v: 'Beneficiário terceiro do contrato — pode acionar diretamente' },
              { k: 'Subcontratação', v: 'Apenas com autorização escrita e cascateamento das obrigações' },
              { k: 'Auditoria', v: 'Direito do exportador de auditar; cooperação obrigatória do importador' },
              { k: 'Rescisão', v: 'Por descumprimento ou lei estrangeira incompatível' },
            ]}
          />
          <Callout tone="warn" icon="📌">
            Cláusulas-padrão são <em>de adesão</em>: não podem ser materialmente alteradas. Aceite o texto da Resolução
            como anexo e personalize apenas as partes específicas (descrição das operações, anexos técnicos).
          </Callout>
        </Section>

        <Section title="Arquitetura de regionalização (BR-first)" accent={accent}>
          <ArchFlow
            accent={accent}
            title="Padrões de arquitetura para minimizar transferência"
            columns={[
              {
                header: 'Strict — BR only',
                items: [
                  'AWS sa-east-1 / GCP southamerica-east1 / Azure Brazil South',
                  'CMK regional, sem replicação cross-region',
                  'Backups em sa-east-1 e sa-east-2',
                  'CDN apenas com cache de assets, não PII',
                  'Vendors: Bedrock, Vertex AI, Azure OpenAI em BR',
                ],
                footer: 'SETORES REGULADOS',
              },
              {
                header: 'Pragmatic',
                items: [
                  'Hot path BR, analytics em us-east-1',
                  'Anonimização antes da transferência',
                  'Cláusulas-padrão com cada vendor',
                  'TIA para cada destino fora de adequacy',
                  'Logs ficam BR; métricas agregadas saem',
                ],
                footer: 'STARTUPS',
              },
              {
                header: 'Global from day 1',
                items: [
                  'Multi-region active-active',
                  'Sharding por residency (user.region)',
                  'BCRs do grupo + cláusulas-padrão',
                  'TIA por país de operação',
                  'Data Residency contratual em cada vendor',
                ],
                footer: 'MULTINACIONAL',
              },
            ]}
          />
        </Section>

        <Section title="Transfer Impact Assessment — template" accent={accent}>
          <CodeBlock lang="markdown" filename="governanca/tia/openai-eua.md">
{`# TIA — Uso de OpenAI API (EUA) para feature de suporte ao cliente

## 1. Operação
- Exportador: Acme Brasil Ltda (controlador)
- Importador: OpenAI LLC (operador)
- Dados: conteúdo da mensagem do cliente (pode conter PII livre), session_id
- Finalidade: classificar intenção e gerar rascunho de resposta
- Base legal: legítimo interesse (Art. 7 IX) + LIA
- Hipótese Art. 33: II (cláusulas-padrão — Resolução 19/2024) + DPA OpenAI

## 2. Avaliação do destino (EUA)
- Leis com poder de acesso: FISA Section 702, CLOUD Act, NSL
- Mitigantes: OpenAI Enterprise oferece Zero Data Retention (ZDR);
  dados não usados para treinar; região US, mas com controles SOC 2 Type II,
  ISO 27001, criptografia em rest/transit; encryption keys gerenciadas pela OpenAI

## 3. Medidas técnicas
- Anonimização de PII via Presidio antes do envio (CPF/CNPJ/email mascarados)
- Hash de session_id para correlação sem identificação
- TLS 1.3 obrigatório
- Logs locais (BR); sem PII em logs externos
- Endpoint de exclusão: titular pode pedir e nós purgamos prompts dos últimos 30 dias

## 4. Medidas contratuais
- Anexo de Cláusulas-padrão ANPD (Resolução 19/2024) assinado
- DPA OpenAI Business Associate (ainda que sob jurisdição estrangeira)
- ZDR ativo para a organização
- Sub-processores limitados a lista pública (Microsoft Azure)

## 5. Direitos do titular
- Política de Privacidade menciona uso de OpenAI
- Opt-out disponível: usuário pode pedir resposta sem IA
- DSR portal: deletion request remove prompts em até 7 dias

## 6. Decisão
GO — risco residual baixo após anonimização + ZDR + cláusulas-padrão.
Revisão em 12 meses ou em mudança regulatória relevante.

## 7. Aprovação
DPO: ______  | Engenharia: ______  | Data: 2026-05-10`}
          </CodeBlock>
        </Section>

        <Section title="Mapa de vendors típicos e tratamento" accent={accent}>
          <ComparisonTable
            accent={accent}
            headers={['Vendor', 'Localização padrão', 'Risco LGPD', 'Mitigação típica']}
            rows={[
              ['AWS', 'sa-east-1 (BR) disponível', 'Baixo se ficar em BR; médio se cross-region', 'Region pinning + CMK regional + DPA AWS'],
              ['GCP', 'southamerica-east1', 'Baixo; alguns serviços beta só multiregion', 'Service-level pinning + DLP para campos JSON'],
              ['Azure', 'Brazil South', 'Baixo', 'Region pinning; Azure OpenAI BR em GA 2024'],
              ['Stripe', 'EUA / Irlanda', 'Médio (PII de pagamento)', 'Cláusulas-padrão + tokenização local; PCI scope reduzido'],
              ['OpenAI', 'EUA', 'Alto sem mitigação', 'ZDR + anonimização ou Azure OpenAI BR'],
              ['Anthropic Claude API', 'EUA', 'Médio', 'Bedrock sa-east-1 + Workspace policies + ZDR padrão para API'],
              ['Datadog', 'EUA (US1) ou EU (EU1)', 'Médio — logs com PII', 'EU site + Sensitive Data Scanner + retention curta'],
              ['Sentry', 'EUA / EU', 'Médio — exception messages', 'EU region + scrubbing antes do envio'],
              ['Segment', 'EUA', 'Alto — eventos comportamentais', 'Avaliar alternativa BR (RudderStack) ou anonimização'],
              ['Cloudflare', 'POPs globais', 'Baixo se for só cache; checar Workers KV', 'Data Localization Suite (BR region)'],
            ]}
          />
        </Section>

        <Section title="Timeline regulatória" accent={accent}>
          <Timeline
            accent={accent}
            title="Transferência internacional — marcos"
            events={[
              { when: '2018', label: 'LGPD sancionada', detail: 'Cap. V já previa hipóteses; faltava regulamento operacional' },
              { when: '07/2020', label: 'Schrems II (TJUE)', detail: 'Caso C-311/18 — invalida Privacy Shield; exige TIA' },
              { when: '06/2021', label: 'EDPB Recommendations 01/2020 (final)', detail: 'Metodologia TIA — referência global' },
              { when: '07/2023', label: 'EU-US Data Privacy Framework', detail: 'Sucessor do Privacy Shield, ainda contestado' },
              { when: '08/2023', label: 'ANPD abre Consulta Pública 4', detail: 'Cláusulas-padrão em discussão' },
              { when: '09/2024', label: 'Resolução CD/ANPD nº 19/2024', detail: 'Cláusulas-padrão BR em vigor', highlight: true },
              { when: '2026', label: 'Adequacy decision com Argentina/Uruguai esperada', detail: 'Mercosul tem agenda de convergência' },
            ]}
          />
        </Section>

        <Section title="Decisão: onde processar dados de clientes BR?" accent={accent}>
          <DecisionBox
            scenario="Startup B2C brasileira, base 100k usuários, considerando rodar todo backend em us-east-1 por familiaridade do time"
            winner="sa-east-1 (São Paulo) com replicação para sa-east-2 (Brasil-2) quando disponível"
            winnerColor={accent}
            why="Latência menor para usuário BR (50-100ms menos), reduz hipótese Art. 33 a zero para hot path, simplifica DPIA e ROPA. Custo um pouco maior (~10-20%) compensado por menor complexidade contratual. Vendors críticos (LLM, observability, analytics) ganham region BR a cada ano."
            alternatives={[
              { name: 'us-east-1 com cláusulas-padrão', when: 'Aceitável, mas TIA obrigatório e contrato anexado em cada vendor' },
              { name: 'Multi-region desde o início', when: 'Apenas se você é multinacional; over-engineering em startup BR-only' },
            ]}
          />
        </Section>

        <Section title="Padrões anti-pattern" accent={accent}>
          <KeyValue
            accent={accent}
            items={[
              { k: 'Vendor PII sem DPA', v: 'Usar SaaS de marketing/analytics sem Data Processing Agreement = sem base contratual; ANPD considera transferência ilegal' },
              { k: 'CDN sem política de cache de PII', v: 'CloudFront/Cloudflare cacheia /api/users/123 com PII; replica em POPs globais sem você ver' },
              { k: 'Log shipping cross-region', v: 'Datadog/Splunk/Elastic ingerindo em US enquanto app está em BR' },
              { k: 'Email transacional fora do BR', v: 'SendGrid, Mailgun guardam histórico — PII em metadata' },
              { k: 'Replicas analíticas em outro country sem DPIA', v: 'Snowflake em US lendo de Postgres BR — transfer com cada query' },
              { k: 'Webhooks para terceiros', v: 'Cada POST cross-border é transferência; documente cada destino' },
            ]}
          />
        </Section>

        <Section title="Recursos canônicos" accent={accent}>
          <KeyValue
            accent={accent}
            items={[
              {
                k: 'LGPD Cap. V',
                v: (
                  <a href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
                    planalto.gov.br — Arts. 33-36
                  </a>
                ),
              },
              { k: 'Resolução CD/ANPD nº 19/2024', v: 'gov.br/anpd — texto integral + anexo de cláusulas-padrão' },
              { k: 'EDPB Recommendations 01/2020', v: 'Metodologia TIA — edpb.europa.eu' },
              { k: 'TJUE Schrems II', v: 'Caso C-311/18, julho/2020' },
              { k: 'AWS Compliance — LGPD', v: 'aws.amazon.com/compliance/lgpd' },
              { k: 'GCP — Data Residency', v: 'cloud.google.com/architecture/framework/security/data-residency' },
            ]}
          />
        </Section>
      </div>
    </ModuleLayout>
  );
}
