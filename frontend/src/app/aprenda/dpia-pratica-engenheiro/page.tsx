import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, DecisionBox, ArchFlow, Timeline } from '@/components/article/primitives';

export const metadata = getModuleMetadata('dpia-pratica-engenheiro');

const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual artigo da LGPD prevê a DPIA (Relatório de Impacto à Proteção de Dados Pessoais — RIPD)?',
    options: [
      'Art. 18 — direitos do titular',
      'Art. 38 — a ANPD pode determinar ao controlador a elaboração de relatório de impacto à proteção de dados pessoais, contendo no mínimo a descrição dos tratamentos, metodologia, salvaguardas e mitigação de risco',
      'Art. 7º — bases legais',
      'Art. 48 — comunicação de incidente',
    ],
    correct: 1,
    explanation:
      'Art. 38 LGPD é a base. O parágrafo único define o conteúdo mínimo. ANPD pode exigir DPIA; em alguns casos é obrigatória (alto risco). Diferentemente do GDPR Art. 35 (taxativo), a LGPD deixa a hipótese de obrigatoriedade no regulamento — Resolução CD/ANPD em consulta pública trata disso.',
  },
  {
    question: 'Quando uma DPIA é OBRIGATÓRIA segundo entendimento da ANPD?',
    options: [
      'Sempre, para qualquer feature',
      'Quando o tratamento envolver alto risco aos direitos e liberdades — incluindo decisões automatizadas com efeito jurídico (Art. 20), uso de dados sensíveis em larga escala, monitoramento sistemático de áreas públicas, perfis comportamentais de crianças, dados biométricos para identificação única, ou transferência internacional para país sem nível adequado',
      'Apenas para órgãos públicos',
      'Somente quando o titular solicitar',
    ],
    correct: 1,
    explanation:
      'O Guia Orientativo ANPD sobre Tratamento de Dados Pessoais pela Administração Pública e a Resolução CD/ANPD nº 2/2022 referenciam alto risco. Lista de tratamentos de alto risco também espelha CNIL e EDPB Guidelines 4/2017 (GDPR).',
  },
  {
    question: 'O que NÃO faz parte do conteúdo mínimo de uma DPIA (Art. 38 par. único)?',
    options: [
      'Descrição dos tipos de dados coletados',
      'Metodologia utilizada para coleta e segurança',
      'Análise do controlador sobre medidas de salvaguardas e mitigação de risco',
      'Cópia integral do código-fonte do sistema — fonte não é exigida; o relatório descreve fluxos, finalidades, riscos e medidas, não implementação linha a linha',
    ],
    correct: 3,
    explanation:
      'Art. 38 par. único exige: tipos de dados, metodologia, salvaguardas e mecanismos de mitigação. Pode acompanhar diagrama de fluxo e descrição técnica, mas não código-fonte. Manter código fora do anexo evita exposição desnecessária.',
  },
  {
    question: 'Por que um diagrama de fluxo de dados (DFD) é peça central da DPIA?',
    options: [
      'É opcional — texto é suficiente',
      'O DFD torna explícitos: pontos de coleta (formulário, API, scraping), processadores (workers, ETLs), destinos (DBs, search index, ML training, BI), compartilhamentos com terceiros e fronteiras geográficas. Sem isso, riscos invisíveis ficam invisíveis',
      'Só serve para a equipe de design',
      'Substitui a análise jurídica',
    ],
    correct: 1,
    explanation:
      'CNIL Methodology e ANPD recomendam DFD. Em arquiteturas distribuídas, dados pessoais saltam por 10+ sistemas (Kafka, ES, DW, ML, BI, parceiros). Sem DFD, ninguém vê o conjunto e a deleção (Art. 18) vira impossível.',
  },
  {
    question: 'Qual escala de risco é mais usada em DPIA?',
    options: [
      'Alto / Baixo apenas',
      'Probabilidade × Severidade em matriz 4×4 ou 5×5 — método CNIL/PIA tool, alinhado a ISO/IEC 29134 e EBIOS Risk Manager. Probabilidade considera vetores de ameaça; severidade considera impacto ao titular (financeiro, reputacional, discriminação, físico)',
      'Aleatória, definida pelo DPO',
      'Sempre crítico para qualquer feature',
    ],
    correct: 1,
    explanation:
      'A ferramenta open source PIA da CNIL (cnil.fr/pia) usa essa escala. ISO/IEC 29134:2017 é o padrão internacional para PIA. EBIOS RM é o método francês de gestão de riscos cyber adaptável.',
  },
  {
    question: 'O que aconteceu no caso ANPD nº 00261.000489/2022-69 (Telekall)?',
    options: [
      'Empresa foi absolvida',
      'Primeira sanção administrativa da ANPD em jul/2023 — multa de R$ 14.400 + advertência por tratamento sem base legal (telemarketing) e falta de DPO. Marcou o início concreto da fase punitiva. Subsequentes: Banco Pan (R$ 470k), Yelp Brasil',
      'Caso ainda não julgado',
      'Foi apenas advertência verbal',
    ],
    correct: 1,
    explanation:
      'Telekall Infoservice foi o primeiro processo sancionador finalizado pela ANPD. Falta de DPIA não foi alegada diretamente, mas o caso evidenciou que ausência de governança documentada (ROPA, DPIA, DPO) agrava a dosimetria — Resolução CD/ANPD nº 4/2023 Art. 14.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="dpia-pratica-engenheiro"
      title="DPIA / RIPD: avaliação de impacto que ANPD aceita"
      icon="🔍"
      xp={65}
      readTime={13}
      trailName="Privacy & Compliance Engineering"
      trailColor={accent}
      nextSlug="pii-discovery-codigo"
      nextTitle="PII Discovery: encontre dados pessoais escondidos no código"
      quiz={quiz}
    >
      <div className="flex flex-col gap-8 text-sm leading-7">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          DPIA (Data Protection Impact Assessment) — no Brasil chamada de <strong>RIPD</strong> (Relatório de Impacto à
          Proteção de Dados Pessoais) — é o documento técnico-jurídico que justifica um tratamento de risco. Art. 38
          LGPD: a ANPD pode exigir; quando exige, conteúdo mínimo é taxativo. Engenheiro entrega DFD, controles
          técnicos e análise de risco; jurídico aprova; DPO assina. Sem DPIA, em fiscalização, a empresa fica nua.
        </p>

        <Section title="Quando rodar uma DPIA — gatilhos" accent={accent}>
          <p>
            ANPD ainda não publicou regulamento taxativo. Mas a Resolução CD/ANPD 2/2022, o Guia para Administração
            Pública e a tradição internacional (EDPB Guidelines 4/2017) convergem para os seguintes gatilhos. Se sua
            feature checa <em>dois ou mais</em>, faça a DPIA.
          </p>
          <KeyValue
            accent={accent}
            items={[
              { k: 'Decisão automatizada com efeito jurídico', v: 'Art. 20 LGPD — scoring de crédito, antifraude bloqueante, triagem de currículo' },
              { k: 'Dados sensíveis em larga escala', v: 'Saúde, biometria, religião, orientação sexual — Art. 11' },
              { k: 'Monitoramento sistemático', v: 'CCTV em área pública, rastreamento de funcionários, fingerprint comportamental' },
              { k: 'Crianças e adolescentes', v: 'Art. 14 — qualquer tratamento exige diligência reforçada' },
              { k: 'Biometria para identificação única', v: 'Face recognition, voice print, fingerprint para auth' },
              { k: 'Big data com inferência sensível', v: 'Modelos que inferem etnia, saúde mental, orientação política a partir de dados comuns' },
              { k: 'Tecnologia inovadora', v: 'LLMs, federated learning, edge ML — onde risco ainda não foi mapeado pela indústria' },
              { k: 'Transferência internacional sem adequacy', v: 'Para país sem nível adequado e sem cláusulas-padrão' },
              { k: 'Combinação de datasets de múltiplas fontes', v: 'Resolução de identidade entre CPF, cookie, email cross-domain' },
            ]}
          />
        </Section>

        <Section title="Estrutura de uma DPIA — Art. 38 par. único + boas práticas" accent={accent}>
          <ArchFlow
            accent={accent}
            title="Seções obrigatórias e recomendadas"
            columns={[
              {
                header: 'Mínimo Art. 38',
                items: [
                  'Identificação do controlador e DPO',
                  'Descrição dos tipos de dados',
                  'Metodologia de coleta',
                  'Metodologia de segurança',
                  'Análise das salvaguardas',
                  'Mecanismos de mitigação de risco',
                ],
                footer: 'OBRIGATÓRIO',
              },
              {
                header: 'CNIL / EDPB',
                items: [
                  'Finalidade e necessidade',
                  'Proporcionalidade',
                  'Fluxograma de dados (DFD)',
                  'Stakeholders consultados',
                  'Matriz risco probabilidade × severidade',
                  'Plano de tratamento de riscos',
                ],
                footer: 'BOAS PRÁTICAS',
              },
              {
                header: 'Engenharia',
                items: [
                  'Diagrama C4 de contexto',
                  'Modelo de ameaças (STRIDE/LINDDUN)',
                  'Inventário de PII por tabela',
                  'Controles técnicos por risco',
                  'Plano de testes (red team privacy)',
                  'Decisão Go/No-Go + DPO sign-off',
                ],
                footer: 'TÉCNICO',
              },
            ]}
          />
        </Section>

        <Section title="DFD — o coração técnico da DPIA" accent={accent}>
          <p>
            Diagrama de fluxo de dados pessoais é o que ANPD efetivamente lê. Não basta caixinhas — precisa indicar
            <strong> finalidade</strong>, <strong>base legal</strong>, <strong>localização</strong> e
            <strong> retenção</strong> em cada hop.
          </p>
          <FlowDiagram
            accent={accent}
            title="DFD simplificado de uma fintech (cadastro + scoring)"
            orientation="vertical"
            steps={[
              { icon: '📱', label: 'App mobile (BR)', desc: 'Coleta: nome, CPF, RG, selfie | Base: Contrato (V) + Obrigação legal (II)' },
              { icon: '🛡️', label: 'API Gateway (BR/AWS sa-east-1)', desc: 'TLS 1.3, WAF, rate limit. Sem persistência.' },
              { icon: '🗄️', label: 'Postgres RDS (sa-east-1)', desc: 'Tabela users com PII | AES-256 at rest | Retenção: contrato + 5y' },
              { icon: '🔐', label: 'KYC Provider (BR — Idwall)', desc: 'Compartilhamento. Base: Obrigação legal BCB 4.753 | Contrato de processador' },
              { icon: '🧠', label: 'Score interno (sa-east-1)', desc: 'Modelo ML com revisão humana opcional. Base: Proteção do crédito (X)' },
              { icon: '🌎', label: 'Data warehouse (us-east-1)', desc: 'Transfer internacional | Cláusulas-padrão ANPD (Res. 19/2024) | Anonimizado após 18m' },
            ]}
          />
          <Callout tone="info" icon="💡">
            Cada seta do DFD é uma <strong>operação de tratamento</strong> que precisa: finalidade declarada, base legal,
            local físico/lógico, retenção, controles técnicos. Esse vetor de 5 dimensões é o que ANPD pede em
            fiscalização.
          </Callout>
        </Section>

        <Section title="Matriz de risco — probabilidade × severidade" accent={accent}>
          <p>
            Use a metodologia <strong>CNIL PIA</strong> (open source — cnil.fr/pia) ou ISO/IEC 29134. Para cada cenário
            de risco identificado (ex: vazamento de CPF + selfie, reidentificação a partir de dados anonimizados),
            estime probabilidade e severidade em escala 1–4.
          </p>
          <ComparisonTable
            accent={accent}
            headers={['Cenário', 'Probabilidade', 'Severidade', 'Risco bruto', 'Controle', 'Risco residual']}
            rows={[
              ['Vazamento por SQL injection', '2 — limitado', '4 — máximo', '8 — alto', 'SAST + Param. queries + WAF', '2 — baixo'],
              ['Acesso indevido por colaborador', '3 — significativo', '3 — sério', '9 — alto', 'RBAC + JIT access + audit log', '3 — moderado'],
              ['Reidentificação no DW anonimizado', '2 — limitado', '3 — sério', '6 — moderado', 'k-anonimidade k≥10 + perturbação', '2 — baixo'],
              ['Decisão automatizada injusta', '3 — significativo', '4 — máximo', '12 — crítico', 'Revisão humana + Fairness audit', '4 — moderado'],
              ['Vazamento via terceiro (KYC vendor)', '2 — limitado', '4 — máximo', '8 — alto', 'Contrato processador + DPIA do vendor + auditoria SOC 2', '3 — moderado'],
              ['Acesso lateral via container comprometido', '2 — limitado', '4 — máximo', '8 — alto', 'Network policy + secret rotation + image scan', '2 — baixo'],
            ]}
          />
          <p>
            Risco bruto = P × S (escala 1–16). Qualquer risco residual ≥ 9 exige <strong>plano de tratamento adicional</strong>
            ou aceitação documentada pelo DPO/gestor.
          </p>
        </Section>

        <Section title="LINDDUN — threat model orientado a privacidade" accent={accent}>
          <p>
            STRIDE foi feito para segurança (CIA). Para privacidade existe o <strong>LINDDUN</strong>{' '}
            (linddun.org), criado pela KU Leuven em 2010. Acrônimo das 7 ameaças de privacidade:
          </p>
          <KeyValue
            accent={accent}
            items={[
              { k: 'L — Linkability', v: 'Capacidade de relacionar dois itens de informação ao mesmo titular sem necessidade' },
              { k: 'I — Identifiability', v: 'Capacidade de identificar o titular a partir de dados que deveriam ser anônimos' },
              { k: 'N — Non-repudiation', v: 'Titular não consegue negar ação que praticou (em alguns contextos, isso é problema)' },
              { k: 'D — Detectability', v: 'Capacidade de detectar a existência de um item de dado/usuário no sistema' },
              { k: 'D — Disclosure', v: 'Vazamento não autorizado de informação' },
              { k: 'U — Unawareness', v: 'Titular não tem ciência da coleta/tratamento' },
              { k: 'N — Non-compliance', v: 'Tratamento viola lei, política ou consentimento' },
            ]}
          />
          <Callout tone="info" icon="📚">
            Aplicação prática:{' '}
            <a href="https://linddun.org/" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
              linddun.org
            </a>{' '}
            tem cards de ameaças por elemento do DFD. Rode workshop de 4h com time + DPO antes de finalizar a DPIA.
          </Callout>
        </Section>

        <Section title="Template enxuto — DPIA em Markdown versionado" accent={accent}>
          <p>
            Mantenha DPIA no repositório (governança/dpia/&lt;feature&gt;.md). Versionado, revisado por PR, vinculado
            ao ADR. Esqueça Word.
          </p>
          <CodeBlock lang="markdown" filename="governanca/dpia/scoring-antifraude.md">
{`# DPIA — Scoring antifraude em tempo real

- **Controlador**: Acme Pagamentos S.A. (CNPJ 00.000.000/0001-00)
- **DPO**: Fulano de Tal (dpo@acme.com)
- **Versão**: 1.0  | **Data**: 2026-05-10  | **Status**: Aprovado

## 1. Descrição do tratamento
Sistema que avalia em 200ms cada transação PIX/Cartão e bloqueia
prováveis fraudes. Modelo XGBoost treinado em histórico de 24m.

## 2. Tipos de dados
- IP (PII), device fingerprint (PII), CPF (PII identificador), valor,
  comerciante, geolocalização aproximada (PII), histórico (PII).
- NÃO usa dados sensíveis.

## 3. Finalidade
Prevenir fraude — proteger o titular e a instituição contra perda.

## 4. Base legal
- **Art. 7º IX — Legítimo interesse** (LIA documentado em /lia/scoring-antifraude.md)
- Para clientes regulados sob Resolução BCB 4.658, também Art. 7º II.

## 5. DFD
Ver \`/dfd/scoring-antifraude.mmd\` (mermaid). Resumo:
Transação → Kafka → Feature Store (Redis) → Modelo → Decisão → Audit Log

## 6. Localização e transferências
- Modelo, features e decisão: AWS sa-east-1 (São Paulo).
- Sem transferência internacional. Backup em sa-east-1.

## 7. Retenção
- Decisão: 24 meses (Lei 12.965 Art. 13 + necessidade antifraude).
- Features: 6 meses.
- Após retenção: hard delete + remoção de search index.

## 8. Direitos do titular (Art. 18)
- Acesso e explicação: endpoint /api/me/decisions retorna histórico + razão (Art. 20).
- Revisão humana: titular pode solicitar; SLA 7 dias úteis.

## 9. Riscos (LINDDUN + matriz P×S)
| # | Ameaça | P | S | Bruto | Controle | Residual |
|---|--------|---|---|-------|----------|----------|
| 1 | Discriminação racial via proxy | 3 | 4 | 12 | Fairness audit trimestral, equalized odds | 6 |
| 2 | Vazamento feature store | 2 | 4 | 8 | mTLS + KMS + VPC endpoint | 2 |
| 3 | Falso positivo bloqueia titular legítimo | 4 | 3 | 12 | Limiar conservador + revisão humana < 1h | 6 |

## 10. Controles técnicos
- Encryption at rest (KMS), in transit (TLS 1.3)
- RBAC + JIT (StrongDM)
- Audit log imutável (S3 Object Lock)
- Fairness CI gate (deploy bloqueado se Δ TPR > 5pp por grupo protegido)
- Bias bounty interno

## 11. Decisão
**GO** — risco residual aceitável.
Revisão obrigatória em 12 meses ou em mudança material.

DPO assinatura: ______`}
          </CodeBlock>
        </Section>

        <Section title="DPIA é viva — gatilhos de revisão" accent={accent}>
          <Timeline
            accent={accent}
            title="Quando reabrir a DPIA"
            events={[
              { when: 'M+0', label: 'Aprovação inicial', detail: 'Antes do GA do produto' },
              { when: 'M+12', label: 'Revisão periódica', detail: 'Obrigatória; verifica drift de finalidade, novos dados, novos vendors' },
              { when: 'Δ', label: 'Mudança material', detail: 'Novo dado coletado, mudança de finalidade, novo processador, novo país, mudança de algoritmo de decisão automatizada', highlight: true },
              { when: '🚨', label: 'Incidente', detail: 'Após qualquer incidente notificado à ANPD (Art. 48), revisão obrigatória' },
              { when: 'Lei', label: 'Mudança regulatória', detail: 'Nova resolução ANPD, decisão do CD/ANPD, nova jurisprudência relevante' },
            ]}
          />
        </Section>

        <Section title="Decisão: DPIA ou só ROPA?" accent={accent}>
          <DecisionBox
            scenario="Estamos adicionando login com biometria facial opcional como alternativa à senha"
            winner="DPIA obrigatória"
            winnerColor={accent}
            why="Biometria é dado sensível (Art. 5º II + Art. 11). Identificação única exige análise reforçada — risco de reidentificação, vazamento irrevogável (não dá pra trocar de rosto), discriminação por taxa de erro entre grupos (NIST FRVT mostra Δ até 10× em demographic accuracy). Mesmo opcional, a opcionalidade não dispensa DPIA."
            alternatives={[
              { name: 'Apenas ROPA', when: 'Não — biometria é high-risk; ANPD recomenda DPIA em qualquer escala' },
              { name: 'Wait-and-see', when: 'Não — sem DPIA prévia, eventual incidente quintuplica a sanção' },
            ]}
          />
        </Section>

        <Section title="Ferramentas open source para DPIA" accent={accent}>
          <KeyValue
            accent={accent}
            items={[
              {
                k: 'CNIL PIA tool',
                v: (
                  <a href="https://www.cnil.fr/en/open-source-pia-software-helps-carry-out-data-protection-impact-assesment" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
                    cnil.fr/en/open-source-pia-software
                  </a>
                ),
              },
              {
                k: 'LINDDUN GO',
                v: (
                  <a href="https://linddun.org/go/" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
                    linddun.org/go — cards de ameaças
                  </a>
                ),
              },
              { k: 'ISO/IEC 29134:2017', v: 'Padrão internacional para PIA' },
              { k: 'EDPB Guidelines 4/2017', v: 'Critérios de quando DPIA é obrigatória (GDPR — referência cruzada)' },
              { k: 'ANPD Guia DPO/RIPD', v: 'gov.br/anpd/pt-br/documentos-e-publicacoes' },
              { k: 'Bearer — privacy report', v: 'Gera input técnico para a seção 2 (tipos de dados) e seção 5 (DFD)' },
            ]}
          />
        </Section>
      </div>
    </ModuleLayout>
  );
}
