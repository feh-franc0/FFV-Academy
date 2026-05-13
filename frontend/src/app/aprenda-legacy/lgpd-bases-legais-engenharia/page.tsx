import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  KeyValue,
  FlowDiagram,
  DecisionBox,
  NodeGraph,
  Timeline,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('lgpd-bases-legais-engenharia');

const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question:
      'O Art. 7º da Lei 13.709/2018 (LGPD) lista quantas hipóteses para tratamento de dados pessoais comuns (não sensíveis)?',
    options: [
      '5 hipóteses, todas dependendo de consentimento',
      '10 hipóteses — consentimento, cumprimento de obrigação legal, execução de contrato, exercício regular de direitos, proteção da vida, tutela da saúde, políticas públicas, estudos por órgão de pesquisa, legítimo interesse e proteção do crédito',
      '15 hipóteses, todas igualmente válidas em qualquer cenário',
      '3 hipóteses: consentimento, contrato, obrigação legal',
    ],
    correct: 1,
    explanation:
      'Art. 7º LGPD lista 10 incisos (I a X). Para dados sensíveis (Art. 11) o rol é mais restrito (7 hipóteses, sem legítimo interesse nem proteção do crédito). Texto oficial em planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm.',
  },
  {
    question:
      'Qual base legal NÃO pode ser usada para tratar dados pessoais SENSÍVEIS (raça, religião, biometria, saúde, orientação sexual)?',
    options: [
      'Consentimento específico e destacado',
      'Legítimo interesse — Art. 11 LGPD não lista legítimo interesse para dados sensíveis. Para sensíveis exige-se consentimento específico, cumprimento de obrigação legal, política pública, estudos por órgão de pesquisa, exercício regular de direitos, proteção da vida ou tutela da saúde, ou prevenção a fraude e segurança do titular',
      'Cumprimento de obrigação legal',
      'Proteção da vida ou da incolumidade física',
    ],
    correct: 1,
    explanation:
      'Legítimo interesse (Art. 7º IX) só vale para dados comuns. Dados sensíveis (Art. 11) precisam de consentimento específico OU uma das hipóteses do inciso II. Confundir isso é o erro mais comum de engenheiros lendo LGPD.',
  },
  {
    question:
      'O que é ROPA (Records of Processing Activities) e por que gerar do código?',
    options: [
      'Documento jurídico imutável escrito pelo DPO uma vez por ano',
      'Registro de operações de tratamento (Art. 37 LGPD). Quando gerado a partir de annotations no código (ex: @Pii, @LegalBasis(CONTRACT)), o ROPA reflete o sistema REAL, não o PowerPoint do compliance. Drift cai a zero',
      'Backup criptografado dos logs de acesso',
      'API de exportação de dados do titular',
    ],
    correct: 1,
    explanation:
      'Art. 37 obriga o controlador a manter registro de operações. ROPA tradicional é uma planilha desatualizada. Gerando do código (decorators, dbt manifest, AST scan), você tem ground truth contínuo. ANPD aceita evidência técnica.',
  },
  {
    question:
      'Sua feature de "recomendação personalizada" usa histórico de compras. Qual base legal melhor se encaixa?',
    options: [
      'Consentimento — sempre o mais seguro',
      'Legítimo interesse (Art. 7º IX) com teste de proporcionalidade documentado (LIA — Legitimate Interest Assessment): finalidade legítima, necessidade do tratamento, balanceamento contra expectativas do titular. Opt-out claro. Sem perfis sensíveis',
      'Cumprimento de obrigação legal',
      'Execução de contrato',
    ],
    correct: 1,
    explanation:
      'Recomendação é caso clássico de legítimo interesse — não é necessário para entregar o produto (contrato), nem é obrigação legal. LIA com 3 testes é o instrumento. EDPB (GDPR) e ANPD aceitam. Consentimento aqui gera friction inútil e churn.',
  },
  {
    question:
      'Você precisa armazenar CPF do cliente por 5 anos após o término do contrato. Qual base legal sustenta?',
    options: [
      'Consentimento renovado anualmente',
      'Cumprimento de obrigação legal/regulatória (Art. 7º II) — Código Civil Art. 206 §5º III prevê prazo prescricional de 5 anos para cobrança de dívidas; legislação fiscal (CTN) exige retenção. Após o prazo, deleção obrigatória ou anonimização irreversível',
      'Legítimo interesse indefinido',
      'Pode manter para sempre por segurança',
    ],
    correct: 1,
    explanation:
      'Retention period precisa de base legal específica. Obrigação legal/regulatória é a mais comum (fiscal, prescricional). Documente a norma exata. Após o prazo: deletar ou anonimizar. Manter "por segurança" é violação direta da minimização (Art. 6º III).',
  },
  {
    question:
      'O que o titular pode exigir do controlador com base no Art. 18 LGPD?',
    options: [
      'Apenas exclusão',
      'Confirmação da existência, acesso, correção, anonimização/bloqueio/eliminação de dados desnecessários, portabilidade, eliminação dos dados tratados com consentimento, informação sobre compartilhamento, informação sobre não consentir e revogação do consentimento',
      'Indenização automática',
      'Acesso ao código-fonte do sistema',
    ],
    correct: 1,
    explanation:
      'Art. 18 lista 9 direitos do titular. Engenheiro precisa expor endpoints para cada um. Prazo de resposta: 15 dias (Art. 19). Falhar gera sanção da ANPD (Art. 52) — advertência, multa até 2% do faturamento ou R$ 50M por infração.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="lgpd-bases-legais-engenharia"
      title="LGPD por engenheiro: as 10 bases legais aplicadas no código"
      icon="📜"
      xp={60}
      readTime={12}
      trailName="Privacy & Compliance Engineering"
      trailColor={accent}
      nextSlug="dpia-pratica-engenheiro"
      nextTitle="DPIA / RIPD: avaliação de impacto que ANPD aceita"
      quiz={quiz}
    >
      <div className="flex flex-col gap-8 text-sm leading-7">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Lei 13.709/2018 (LGPD) entrou em vigor em <strong>setembro/2020</strong> e a fase de sanções começou em
          agosto/2021. Em 2026 a <strong>ANPD</strong> já tem precedentes de multa (Telekall, Yelp Brasil, Banco Pan) e
          jurisprudência madura. A LGPD não é problema do jurídico — é <em>problema de design de sistema</em>. Cada
          <InlineCode>INSERT INTO users</InlineCode>, cada <InlineCode>SELECT email FROM ...</InlineCode>, cada job de ML
          que lê dados de produção é uma <strong>operação de tratamento</strong> que precisa estar amarrada a uma base
          legal do Art. 7º (dados comuns) ou Art. 11 (dados sensíveis). Texto oficial:{' '}
          <a
            href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: accent }}
          >
            planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
          </a>
          .
        </p>

        <Section title="As 10 bases legais do Art. 7º (dados pessoais comuns)" accent={accent}>
          <p>
            A LGPD não tem hierarquia entre bases legais. Mas, na prática de engenharia, algumas cobrem 90% dos casos
            (contrato, legítimo interesse, obrigação legal). Consentimento é o <strong>último recurso</strong>, não o
            primeiro — porque o titular pode revogar a qualquer momento (Art. 8º §5º) e seu sistema precisa lidar com
            isso.
          </p>
          <ComparisonTable
            accent={accent}
            headers={['Inciso', 'Base legal', 'Uso típico em engenharia']}
            rows={[
              ['I', 'Consentimento', 'Marketing opt-in, cookies não essenciais, biometria (sensível)'],
              ['II', 'Cumprimento de obrigação legal/regulatória', 'Retenção fiscal (CTN), KYC bancário (BCB), Marco Civil (Lei 12.965 Art. 13–15)'],
              ['III', 'Tratamento pela administração pública', 'Sistemas gov (gov.br, e-Social, Receita)'],
              ['IV', 'Estudos por órgão de pesquisa', 'Universidades, IBGE — dados anonimizados quando possível'],
              ['V', 'Execução de contrato', 'Conta de usuário, billing, entrega — necessário para o serviço'],
              ['VI', 'Exercício regular de direitos em processo', 'Logs para defesa em litígio, contestação de chargeback'],
              ['VII', 'Proteção da vida ou incolumidade física', 'Emergências médicas, alertas de catástrofe'],
              ['VIII', 'Tutela da saúde', 'Procedimento por profissional/órgão de saúde'],
              ['IX', 'Legítimo interesse', 'Recomendação, antifraude, segurança da informação, telemetria operacional'],
              ['X', 'Proteção do crédito', 'Bureaus (Serasa, Boa Vista) e análise de crédito'],
            ]}
          />
          <Callout tone="warn" icon="⚠️">
            Para <strong>dados sensíveis</strong> (Art. 5º II — raça, religião, opinião política, filiação sindical,
            saúde, vida sexual, biometria, genético), use o Art. 11. <em>Legítimo interesse não vale para sensíveis.</em>
          </Callout>
        </Section>

        <Section title="Mapeando feature → base legal" accent={accent}>
          <p>
            O exercício prático é simples: liste cada feature do sistema, identifique os dados pessoais envolvidos,
            decida a base legal e <strong>documente</strong>. Esse documento é metade do ROPA. Exemplo real de uma
            fintech BR:
          </p>
          <ComparisonTable
            accent={accent}
            headers={['Feature', 'Dados', 'Sensível?', 'Base legal', 'Retention']}
            rows={[
              ['Cadastro de conta', 'CPF, nome, email, telefone', 'Não', 'Execução de contrato (V)', 'Até término + 5 anos (CC 206)'],
              ['KYC (selfie + RG)', 'Biometria facial, RG', 'Sim (biometria)', 'Obrigação legal (Art. 11 II a) — Resolução BCB 4.753', 'Até término + 10 anos (Lei 9.613)'],
              ['Score de crédito interno', 'Histórico, score', 'Não', 'Proteção do crédito (X)', '5 anos pós-término'],
              ['Recomendação de produto', 'Comportamento de uso', 'Não', 'Legítimo interesse (IX) + opt-out', 'Atualização contínua, anonimizar após 18 meses'],
              ['Marketing por email', 'Email, segmento', 'Não', 'Consentimento (I)', 'Até revogação'],
              ['Análise antifraude', 'IP, device fingerprint, comportamento', 'Não', 'Legítimo interesse (IX)', '24 meses'],
              ['Logs de acesso', 'IP, timestamp, user_id', 'Não', 'Obrigação legal — Marco Civil Art. 15 (6 meses) / Art. 13 (1 ano)', '6–12 meses'],
              ['Cookies analytics', 'Device, sessão', 'Não', 'Consentimento (I) ou LI (depende de fingerprint)', '13 meses'],
            ]}
          />
        </Section>

        <Section title="Legítimo Interesse não é coringa: LIA obrigatório" accent={accent}>
          <p>
            Inciso IX é o mais usado e o mais abusado. ANPD e EDPB exigem o <strong>LIA</strong> (Legitimate Interest
            Assessment) — um teste de 3 partes documentado <em>antes</em> de invocar a base. Sem LIA, a base é frágil em
            fiscalização.
          </p>
          <FlowDiagram
            accent={accent}
            title="LIA — os 3 testes do legítimo interesse"
            orientation="vertical"
            steps={[
              { icon: '1️⃣', label: 'Purpose Test', desc: 'O interesse é legítimo, específico e atual? (não vale "vamos usar pra alguma coisa um dia")' },
              { icon: '2️⃣', label: 'Necessity Test', desc: 'O tratamento é necessário para a finalidade? Existe alternativa menos invasiva? Pode anonimizar?' },
              { icon: '3️⃣', label: 'Balancing Test', desc: 'O interesse do controlador prevalece sobre direitos e expectativas do titular? Há salvaguardas (opt-out, transparência)?' },
            ]}
          />
          <Callout tone="info" icon="📚">
            Referência: <strong>EDPB Guidelines 01/2024</strong> sobre legítimo interesse no GDPR (a ANPD segue raciocínio
            similar). Para Brasil: Resolução CD/ANPD nº 2/2022 e Guia Orientativo de Hipóteses Legais (set/2023).
          </Callout>
        </Section>

        <Section title="Annotations no código: ROPA gerado, não escrito" accent={accent}>
          <p>
            ROPA tradicional é uma planilha que envelhece em 24h. A abordagem moderna é declarar PII e base legal
            <strong> no schema</strong> e gerar o relatório por scan. Exemplo TypeScript com Prisma + decorators
            customizados:
          </p>
          <CodeBlock lang="typescript" filename="src/models/user.ts">
{`/**
 * @pii name: full_name, type: identifier
 * @pii email: contact, type: contact
 * @pii cpf: identifier, sensitivity: HIGH
 * @legal_basis CONTRACT  // Art. 7 V
 * @retention "termination + 5y"  // Código Civil Art. 206 §5 III
 * @data_subject_rights ACCESS, RECTIFY, ERASE, PORTABILITY
 */
export interface User {
  id: string;
  full_name: string;     // PII
  email: string;         // PII
  cpf: string;           // PII (regulado: Lei 12.414 Cadastro Positivo)
  marketing_consent: boolean;  // base legal: I
  created_at: Date;
  deleted_at: Date | null;
}

/**
 * @pii face_embedding: biometric, sensitivity: SENSITIVE
 * @legal_basis LEGAL_OBLIGATION  // Art. 11 II a — Resolução BCB 4.753
 * @retention "termination + 10y"  // Lei 9.613 antibranqueamento
 */
export interface KycRecord {
  user_id: string;
  face_embedding: Buffer;       // sensível: biometria
  document_type: 'RG' | 'CNH';  // sensível
  verified_at: Date;
}`}
          </CodeBlock>
          <p>
            Um script lê esses comentários (TypeScript AST via{' '}
            <a href="https://ts-morph.com" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
              ts-morph
            </a>{' '}
            ou{' '}
            <a href="https://github.com/Bearer/bearer" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
              Bearer CLI
            </a>
            ) e emite o ROPA em JSON + Markdown. Plugue no CI — qualquer feature nova sem annotation falha o build.
          </p>
          <CodeBlock lang="bash" filename="scripts/generate-ropa.sh">
{`# Bearer scanner — open source PII + legal basis
npx @bearer/bearer scan ./src --report=privacy --format=json > ropa.json

# Adiciona ao gate de CI
test "$(jq '.findings | map(select(.legal_basis == null)) | length' ropa.json)" -eq 0 \\
  || (echo "PII sem base legal declarada" && exit 1)`}
          </CodeBlock>
        </Section>

        <Section title="Arquitetura: onde mora cada base legal" accent={accent}>
          <NodeGraph
            accent={accent}
            title="Stack de compliance LGPD por camada"
            columns={[
              {
                label: 'Camada de coleta',
                nodes: [
                  { icon: '📝', label: 'Consent Manager', sub: 'OneTrust, Cookiebot, custom — guarda evidência: timestamp, IP, versão da política', tone: 'emphasis' },
                  { icon: '🎯', label: 'Opt-out endpoint', sub: 'Para legítimo interesse — Art. 18 §2º' },
                  { icon: '📋', label: 'Banner de cookies', sub: 'Apenas necessários ativos por padrão' },
                ],
              },
              {
                label: 'Camada de dados',
                nodes: [
                  { icon: '🏷️', label: 'Schema annotations', sub: '@pii, @legal_basis, @retention', tone: 'emphasis' },
                  { icon: '🔐', label: 'Encryption at rest', sub: 'KMS envelope, AES-256-GCM' },
                  { icon: '📊', label: 'Data catalog', sub: 'OpenMetadata, DataHub, Amundsen' },
                ],
              },
              {
                label: 'Camada de governança',
                nodes: [
                  { icon: '📑', label: 'ROPA generator', sub: 'CI/CD — drift = build break', tone: 'emphasis' },
                  { icon: '🚨', label: 'DSR portal', sub: 'API + UI para Art. 18 (acesso, deleção, portabilidade)' },
                  { icon: '🕵️', label: 'Audit log imutável', sub: 'Art. 37 — append-only, WORM' },
                ],
              },
            ]}
            legend="Cada camada produz evidência rastreável que sustenta a base legal em fiscalização ANPD."
          />
        </Section>

        <Section title="Quando consentimento é OBRIGATÓRIO" accent={accent}>
          <p>
            Apesar de não ser sempre o melhor, há cenários onde consentimento é a <strong>única</strong> base válida.
            Lista não exaustiva:
          </p>
          <KeyValue
            accent={accent}
            items={[
              { k: 'Marketing direto', v: 'Email/SMS/push promocional fora da relação contratual (Art. 7º I + Resolução CD/ANPD 4/2023)' },
              { k: 'Cookies não essenciais', v: 'Analytics com fingerprint, ads, remarketing — consentimento granular e revogável' },
              { k: 'Dados sensíveis sem outra hipótese', v: 'Saúde, religião, orientação sexual quando não houver Art. 11 II aplicável' },
              { k: 'Compartilhamento com terceiros para fim novo', v: 'Venda de lista, parceiro de mídia — consentimento específico e destacado (Art. 8º §4º)' },
              { k: 'Tratamento de criança e adolescente', v: 'Consentimento específico de um dos pais (Art. 14 §1º)' },
              { k: 'Transferência internacional fora de adequacy', v: 'Quando não há cláusulas-padrão ou outra salvaguarda (Art. 33 IV)' },
            ]}
          />
          <Callout tone="danger" icon="🚫">
            Consentimento <strong>não pode ser bundled</strong> com termos de uso (Art. 8º §4º) e deve ser
            <em> específico, destacado, livre, informado e inequívoco</em>. "Continuando, você aceita tudo" é nulo.
          </Callout>
        </Section>

        <Section title="Decisão prática: qual base usar?" accent={accent}>
          <DecisionBox
            scenario="Você está construindo uma feature de scoring de risco antifraude que olha histórico de transações para bloquear cartão"
            winner="Legítimo interesse (Art. 7º IX) + LIA documentado"
            winnerColor={accent}
            why="Antifraude protege titular e controlador, é proporcional, e o titular tem expectativa razoável. Salvaguardas: opt-out para casos não regulados, transparência sobre lógica, revisão humana em decisões automatizadas (Art. 20)."
            alternatives={[
              { name: 'Consentimento', when: 'Não — fricção alta e titular pode revogar deixando a operação exposta a fraude' },
              { name: 'Obrigação legal', when: 'Parcial — para bancos sob BCB 4.658 sim, para fintechs não-reguladas não cobre' },
              { name: 'Execução de contrato', when: 'Frágil — antifraude não é parte essencial do contrato com o usuário' },
            ]}
          />
        </Section>

        <Section title="Timeline: LGPD na prática" accent={accent}>
          <Timeline
            accent={accent}
            title="Marcos regulatórios que mudam o dia do engenheiro"
            events={[
              { when: '08/2018', label: 'Lei 13.709 sancionada', detail: 'Texto inspirado no GDPR europeu, vacatio legis de 24 meses' },
              { when: '09/2020', label: 'Entrada em vigor', detail: 'Direitos do titular começam a valer, mas sem sanções' },
              { when: '08/2021', label: 'Sanções administrativas ativas', detail: 'ANPD pode multar até 2% do faturamento ou R$ 50M por infração' },
              { when: '2022', label: 'Resoluções CD/ANPD nº 1 e 2', detail: 'Regulamento de fiscalização e dosimetria de sanções' },
              { when: '02/2023', label: 'Resolução CD/ANPD nº 4', detail: 'Sanções administrativas detalhadas + processo' },
              { when: '08/2024', label: 'Resolução CD/ANPD nº 19', detail: 'Cláusulas-padrão para transferência internacional' },
              { when: '2025', label: 'Primeiras multas relevantes', detail: 'Telekall (R$ 14k), Yelp Brasil, Banco Pan (R$ 470k)', highlight: true },
              { when: '2026', label: 'Regulamento de IA + LGPD', detail: 'PL 2338/2023 cria moldura para sistemas de alto risco; integração com Art. 20 LGPD' },
            ]}
          />
        </Section>

        <Section title="Checklist pra cada feature nova" accent={accent}>
          <ol className="list-decimal pl-6 flex flex-col gap-2">
            <li>Quais dados pessoais entram, ficam ou saem desta feature? (mapeie campos, não tabelas inteiras)</li>
            <li>Algum é sensível (Art. 5º II)? Se sim, vá pro Art. 11 e não invoque legítimo interesse.</li>
            <li>Qual a finalidade específica? Documente em prosa, não em bullet vago.</li>
            <li>Qual a base legal? Escolha UMA por finalidade. Se duas se aplicam, registre as duas.</li>
            <li>Se for legítimo interesse: rode o LIA e arquive o documento no repositório (governança/lia/).</li>
            <li>Qual a retenção? Cite a norma que sustenta o prazo.</li>
            <li>Como o titular exerce os direitos do Art. 18? Endpoints existem? Prazo de 15 dias respeitado?</li>
            <li>Onde está o consentimento (se for o caso)? Versão, timestamp, IP, granularidade.</li>
            <li>Auditoria: cada operação sobre esses dados gera evento imutável no log (Art. 37)?</li>
            <li>Atualize o ROPA — idealmente automático via annotation + CI.</li>
          </ol>
        </Section>

        <Section title="Recursos canônicos" accent={accent}>
          <KeyValue
            accent={accent}
            items={[
              {
                k: 'Lei 13.709/2018 (LGPD)',
                v: (
                  <a href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
                    planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
                  </a>
                ),
              },
              {
                k: 'ANPD (autoridade)',
                v: (
                  <a href="https://www.gov.br/anpd/pt-br" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
                    gov.br/anpd
                  </a>
                ),
              },
              { k: 'Guia ANPD de Hipóteses Legais', v: 'set/2023 — disponível em gov.br/anpd/pt-br/documentos-e-publicacoes' },
              { k: 'Resolução CD/ANPD nº 2/2022', v: 'Regulamento de aplicação da LGPD para agentes de tratamento de pequeno porte' },
              { k: 'EDPB Guidelines 01/2024', v: 'Legitimate Interest — referencial técnico para LIA' },
              { k: 'Bearer (open source)', v: 'github.com/Bearer/bearer — scanner de PII + classificação de risco no código' },
            ]}
          />
        </Section>
      </div>
    </ModuleLayout>
  );
}
