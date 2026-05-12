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
  Timeline,
  DecisionBox,
  ArchFlow,
  NodeGraph,
  StackFlow,
  AnnotatedFormula,
  MindMap,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('nfc-seguro-desfire-emv');
const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o Apple Pay NÃO pode ser clonado pelo Flipper Zero, mesmo capturando a comunicação NFC?',
    options: [
      'Porque o iPhone usa criptografia ChaCha20 mais forte que AES.',
      'Porque o PAN real nunca sai do Secure Element — só um DPAN tokenizado, e cada transação assina um cryptogram dinâmico (ARQC) com contador ATC monotônico que falha em replay.',
      'Porque o NFC do iPhone opera em frequência diferente (15.56 MHz) e o Flipper só faz 13.56 MHz.',
      'Porque a Apple bloqueia leitores não certificados via DRM no chip NFC.',
    ],
    correct: 1,
    explanation:
      'Tokenização (DPAN ≠ PAN) + ARQC dinâmico com ATC monotônico validado online pelo issuer. Replay falha porque o contador da transação capturada já foi consumido. O Secure Element é um chip dedicado EAL5+/6+ isolado do Application Processor.',
  },
  {
    question: 'Qual nível Common Criteria o MIFARE DESFire EV3 obtém, e qual é a implicação prática?',
    options: [
      'EAL2 — protege apenas contra ataques de software remoto.',
      'EAL5+ — mesma classe de smartcards bancários, com requisitos contra side-channel (SPA/DPA), microprobing e fault injection.',
      'EAL7 — só usado em sistemas militares, indisponível no varejo.',
      'EAL3 — equivalente a um cartão Crypto1 antigo.',
    ],
    correct: 1,
    explanation:
      'DESFire EV2/EV3 = EAL5+ Common Criteria. Significa que o silício foi avaliado contra side-channel attacks (Simple/Differential Power Analysis), microprobing físico do die e injeção de falhas (glitch de tensão/clock/laser). EV1 era EAL4+.',
  },
  {
    question: 'Em uma transação Apple Pay, qual é o caminho do PAN real?',
    options: [
      'Sai do Secure Element criptografado para o reader, que repassa ao adquirente.',
      'Nunca sai do Secure Element. O reader recebe apenas o DPAN (Device PAN) + ARQC; o issuer mapeia DPAN → PAN real internamente via Visa Token Service / Mastercard MDES.',
      'É enviado em claro pelo NFC mas com TLS sobre o link de rádio.',
      'Fica armazenado em cleartext na partição de dados do iOS.',
    ],
    correct: 1,
    explanation:
      'Princípio fundamental da tokenização EMV: o PAN real é provisionado uma única vez no SE (durante o "add card" ao Wallet) e nunca mais sai. DPAN é um número alternativo emitido pela rede via VTS/MDES e mapeado de volta ao PAN só nos sistemas do issuer.',
  },
  {
    question: 'O que são SUN messages no DESFire EV3 e qual problema resolvem?',
    options: [
      'Logs de acesso solar para painéis fotovoltaicos NFC.',
      'Secure Unique NFC: cada read gera um token criptográfico único (UID + counter assinado), tornando dumps "estáticos" inúteis para clonagem em URLs/aplicações que validam o token online.',
      'Mensagens de status enviadas ao backend NXP para telemetria de uso.',
      'Sub-Universal Number — um identificador secundário usado em fallback de leitura.',
    ],
    correct: 1,
    explanation:
      'SUN (Secure Unique NFC) gera, a cada tap, uma URL ou payload com um valor único derivado de chave AES e contador interno do chip. Mesmo capturando uma leitura, o atacante não consegue reproduzir a próxima — o backend rejeita counter já usado.',
  },
  {
    question: 'Sobre o ARQC (Authorization Request Cryptogram) em EMV contactless:',
    options: [
      'É calculado pelo terminal usando uma chave pública do banco emissor.',
      'É um MAC dinâmico gerado pelo cartão/SE com chave simétrica derivada (ICC Master Key → Session Key) sobre dados da transação + ATC; o issuer valida online e rejeita replays porque o ATC é monotônico.',
      'É opcional em transações abaixo de R$ 50 (limite contactless).',
      'É um certificado X.509 efêmero válido por 30 segundos.',
    ],
    correct: 1,
    explanation:
      'ARQC = MAC sobre (amount, currency, terminal data, ATC, unpredictable number, ...). Chave session derivada da ICC Master Key (DES/AES) + ATC. Issuer recalcula e compara. ATC monotônico impede replay; unpredictable number do terminal impede pré-computação.',
  },
  {
    question: 'Por que o Charlie Card de Boston (pós-2018), Oyster de Londres EV1+ e o BIP do Chile usam DESFire em vez de MIFARE Classic?',
    options: [
      'Porque DESFire tem mais memória (8 KB vs 1 KB).',
      'Porque o Crypto1 do MIFARE Classic foi quebrado academicamente desde 2008 (Nohl/Plötz, Garcia et al.) e qualquer um com Flipper + mfkey32 dump as chaves; DESFire AES-128 com mútua autenticação 3-pass não tem ataque público disponível em 2026.',
      'Porque a NXP descontinuou o Classic em 2015.',
      'Porque DESFire é compatível com Apple Pay nativamente.',
    ],
    correct: 1,
    explanation:
      'A migração foi forçada pelo colapso criptográfico do Crypto1 (LFSR de 48 bits, vazamento de paridade). DESFire usa AES-128 ou 3DES com challenge-response 3-pass mútuo — nenhum ataque prático conhecido em sistemas atualizados.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="nfc-seguro-desfire-emv"
      title="Por que Apple Pay NÃO clona: DESFire EV3 + EMV tokenization"
      icon="🛡️"
      xp={70}
      readTime={12}
      trailName="Flipper Zero & Hardware Hacking"
      trailColor={accent}
      nextSlug="infravermelho-protocolos"
      nextTitle="IR: NEC, Sony SIRC, RC5/6 — universal remote por dentro"
      quiz={quiz}
    >
      <Section title="Contexto: o outro lado da força" accent={accent}>
        <p className="text-sm leading-7" style={{ color: 'var(--ffv-muted)' }}>
          No módulo anterior você viu como o <InlineCode>Crypto1</InlineCode> do MIFARE Classic foi
          desmontado: LFSR de 48 bits, vazamento de paridade, ataque <InlineCode>mfkey32</InlineCode>
          extraindo chaves em segundos. A pergunta que fica é: <em>se aquilo é tão fraco, o que é
          forte?</em> Este módulo responde com dois sistemas que <strong>NÃO se quebram</strong> em
          2026 com hardware comercial: <strong>MIFARE DESFire EV3</strong> (NXP) e <strong>EMV
          contactless</strong> com tokenização (Apple Pay, Google Pay, cartões físicos modernos).
        </p>
        <Callout tone="success" icon="🎯">
          <strong>Tese:</strong> NFC <em>não é</em> sinônimo de inseguro. Crypto1 é inseguro. DESFire
          AES e EMV tokenizado, não. A diferença é arquitetural — e este módulo dissecca o porquê.
        </Callout>
      </Section>

      <Section title="MIFARE DESFire: a família segura da NXP" accent={accent}>
        <p className="text-sm leading-7" style={{ color: 'var(--ffv-muted)' }}>
          Lançado em 2002 e iterado em três gerações — <strong>EV1 (2008)</strong>,
          <strong> EV2 (2016)</strong>, <strong>EV3 (2020)</strong> — o DESFire é o que NXP oferece
          quando o cliente realmente quer segurança. Suporta DES, 3DES e <strong>AES-128</strong>{' '}
          com autenticação mútua <strong>3-pass</strong> (challenge-response em ambos sentidos).
        </p>

        <ComparisonTable
          accent={accent}
          headers={['Família', 'Cripto', 'Common Criteria', 'Lançamento', 'Uso típico']}
          rows={[
            ['MIFARE Classic', 'Crypto1 (proprietário, quebrado)', 'EAL3 (auto-declarado)', '1994', 'Legacy — substituir'],
            ['DESFire EV1', 'DES / 3DES / AES-128', 'EAL4+', '2008', 'Transporte público antigo'],
            ['DESFire EV2', 'AES-128 + Transaction MAC', 'EAL5+', '2016', 'Acesso corporativo, transporte'],
            ['DESFire EV3', 'AES-128 + SUN messages + LRP', 'EAL5+', '2020', 'Estado-da-arte para sistemas novos'],
            ['EMV (cartões/Pay)', 'AES + RSA/ECC (offline data auth)', 'EAL5+/6+ (SE)', '2003 contactless', 'Pagamento'],
          ]}
        />

        <Callout tone="info" icon="🔐">
          <strong>Common Criteria EAL5+</strong> não é marketing. Significa que o silício foi
          avaliado contra <em>side-channel attacks</em> (Simple Power Analysis, Differential Power
          Analysis), <em>microprobing</em> (raspar o die e tocar barramentos com agulhas
          piezoelétricas) e <em>fault injection</em> (glitch de tensão, clock, laser). Mesmo
          adversário com microscópio eletrônico, FIB e laboratório de ataques tem trabalho hercúleo.
        </Callout>
      </Section>

      <Section title="Autenticação 3-pass mutual: o protocolo real" accent={accent}>
        <FlowDiagram
          accent={accent}
          title="DESFire AES — Autenticação 3-pass"
          orientation="vertical"
          steps={[
            { icon: '1️⃣', label: 'Reader → Card: AUTH(KeyNo)', desc: 'pede autenticação com a chave número N' },
            { icon: '2️⃣', label: 'Card → Reader: E_K(RndB)', desc: 'gera RndB aleatório, criptografa com chave K, manda' },
            { icon: '3️⃣', label: 'Reader → Card: E_K(RndA || RndB\')', desc: 'decripta RndB, gera RndA, rotaciona RndB → RndB\', concatena, criptografa, envia' },
            { icon: '4️⃣', label: 'Card → Reader: E_K(RndA\')', desc: 'card decripta, valida RndB\', rotaciona RndA → RndA\', criptografa, envia' },
            { icon: '5️⃣', label: 'Session Key derivada', desc: 'ambos lados derivam SessionKey = f(RndA, RndB) — usa em todas as APDUs subsequentes' },
          ]}
        />

        <Callout tone="warn" icon="⚠️">
          O ataque <InlineCode>mfkey32</InlineCode> que funcionou no Crypto1 explora vazamento de
          paridade no LFSR. AES não tem essa propriedade — é uma SPN (substitution-permutation
          network) sem fugas conhecidas em implementação correta. E o silício EV3 inclui contramedidas
          ativas contra DPA: noise injection, dual rail logic, masking aleatório.
        </Callout>

        <CodeBlock lang="text">
{`# Tentativa de dump em DESFire AES com Flipper:
[NFC] Polling... TYPE A, ATQA 0344, SAK 20 (ISO14443-4)
[NFC] DESFire detected, reading App Directory... OK (3 apps)
[NFC] App 0xF5A001 — Read requires AUTH(0) AES
[NFC] Auth(0) -> RndB ciphered received -> sending RndA||RndB'
[NFC] >> Card returned ERROR 0xAE (Authentication Error)
[NFC] Wrong key. No oracle, no leak. Game over.`}
        </CodeBlock>
      </Section>

      <Section title="SUN messages: anti-clone via token único" accent={accent}>
        <p className="text-sm leading-7" style={{ color: 'var(--ffv-muted)' }}>
          O EV3 introduziu <strong>SUN — Secure Unique NFC</strong>. A cada tap o chip gera uma URL
          (ou NDEF payload) com um <strong>contador interno</strong> + um <strong>MAC AES</strong> da
          forma:
        </p>

        <AnnotatedFormula
          accent={accent}
          title="Estrutura SUN URL"
          formula="https://meusite.com/?uid=<UID>&ctr=<CTR>&cmac=<CMAC>"
          parts={[
            { text: 'UID', annotation: '7 bytes — identificador físico do chip', highlight: true },
            { text: 'CTR', annotation: 'contador monotônico (3 bytes), incrementa a cada read' },
            { text: 'CMAC', annotation: 'AES-CMAC(K_SUN, UID || CTR) — só o backend tem K_SUN', highlight: true },
          ]}
        />

        <p className="text-sm leading-7" style={{ color: 'var(--ffv-muted)' }}>
          O backend valida: (a) CMAC bate com K_SUN; (b) CTR <InlineCode>{'>'}</InlineCode> último CTR
          armazenado para aquele UID. Replay falha porque CTR já foi consumido. Clonar para outra
          tag não funciona porque a nova tag gera CTR a partir do próprio contador interno (que
          não bate) e não tem K_SUN para forjar CMAC.
        </p>
      </Section>

      <Section title="EMV contactless: tokenização + dynamic cryptogram" accent={accent}>
        <StackFlow
          accent={accent}
          title="Apple Pay — caminho do dado dentro do iPhone"
          items={[
            { icon: '🏦', label: 'Issuer + Token Service Provider', sub: 'Visa VTS / Mastercard MDES — gera DPAN e mapeia ⇄ PAN', color: accent },
            { icon: '📲', label: 'Wallet App (iOS)', sub: 'orquestra UI + biometria; nunca toca o PAN real', connector: '↑ Token Provisioning (TLS + AC)' },
            { icon: '🔒', label: 'Secure Enclave', sub: 'isolada do Application Processor; gerencia biometria e libera SE só após Touch/Face ID', connector: '↓ libera transação' },
            { icon: '🛡️', label: 'Secure Element (chip dedicado)', sub: 'EAL5+/6+ — armazena DPAN, ICC Master Key, gera ARQC. Bus dedicado, não compartilhado com app processor', connector: '↓ ARQC + DPAN' },
            { icon: '📡', label: 'NFC Controller', sub: 'liga rádio só com SE habilitado para essa transação' },
            { icon: '💳', label: 'Reader (POS)', sub: 'recebe DPAN + ARQC, encaminha ao adquirente' },
          ]}
        />

        <Callout tone="info" icon="🔑">
          <strong>O PAN real (16 dígitos do seu cartão físico) entra no SE uma única vez</strong>,
          durante o "Add card to Wallet". A partir daí o SE só conhece o <strong>DPAN</strong> (Device
          PAN — token único por device emitido pelo VTS/MDES). Mesmo um root no iPhone não exporta o
          DPAN: o SE é um chip à parte, com OS próprio (JCOP/Java Card), comunicando-se com o app
          processor por bus dedicado e APIs estritamente limitadas.
        </Callout>
      </Section>

      <Section title="ARQC: a assinatura que mata o replay" accent={accent}>
        <AnnotatedFormula
          accent={accent}
          title="ARQC — Authorization Request Cryptogram"
          formula="ARQC = AES-MAC(SK, [Amount || Currency || Country || TVR || ATC || UN || ...])"
          parts={[
            { text: 'SK', annotation: 'Session Key derivada da ICC Master Key + ATC (cada txn, chave nova)', highlight: true },
            { text: 'Amount', annotation: 'valor da transação' },
            { text: 'ATC', annotation: 'Application Transaction Counter — monotônico, 2 bytes, incrementa a cada txn', highlight: true },
            { text: 'UN', annotation: 'Unpredictable Number — 4 bytes random gerados pelo terminal (anti pré-computação)' },
            { text: 'TVR', annotation: 'Terminal Verification Results — bitmap de checagens locais' },
          ]}
        />

        <p className="text-sm leading-7" style={{ color: 'var(--ffv-muted)' }}>
          O <strong>issuer</strong> recalcula ARQC com a mesma ICC Master Key, mesmo ATC, mesmos
          dados. Se bate, autoriza; se não, recusa. <strong>Replay falha</strong> porque ATC daquela
          captura já foi consumido — o issuer rejeita "ATC já visto" como fraude (regra E1 em
          sistemas Visa/Mastercard).
        </p>

        <Callout tone="success" icon="🧠">
          Compare com Crypto1: <em>chave estática, sem contador, sem session key, sem nonce do
          servidor</em>. Qualquer captura de uma autenticação dá pra extrair a chave. EMV tem
          chave dinâmica por transação, contador antireplay, nonce do terminal e validação online.
          Engenharia diferente, ataques diferentes.
        </Callout>
      </Section>

      <Section title="Por que o Flipper falha contra Apple Pay" accent={accent}>
        <ArchFlow
          accent={accent}
          title="Tentativas com Flipper Zero × resultados"
          columns={[
            {
              header: 'Cartão plástico magstripe + chip antigo',
              headerColor: '#f59e0b',
              items: ['Lê Track 2 equivalent NFC', 'PAN exposto em claro', 'CVV NÃO (CVV2 só na trilha gravada, e dCVV roda diferente)'],
              footer: 'Captura de PAN+expiry possível, mas inútil sem cryptogram dinâmico',
            },
            {
              header: 'Apple Pay / Google Pay',
              headerColor: '#22c55e',
              items: ['PAN real NÃO sai do SE', 'Recebe DPAN (token)', 'ARQC válido só para essa txn'],
              footer: 'Replay rejeitado pelo issuer (ATC duplicado). Emulação requer ICC Master Key — só vive no SE',
            },
            {
              header: 'Cartão físico com Apple-style tokenization (raro)',
              headerColor: accent,
              items: ['Cartões "tokenized at issuance"', 'PAN gravado é DPAN', 'Igual Apple Pay'],
              footer: 'Bandeiras bancárias premium (ex: Apple Card físico nos EUA) já usam isso',
            },
          ]}
        />

        <QAItem
          q="E o relay attack? Não dá para usar dois Flippers ligados via Internet, um perto do cartão e outro perto do POS?"
          a={
            <>
              Em teoria, sim — o relay attack engana a camada física. Em prática, EMV moderno tem{' '}
              <strong>distance bounding</strong> em algumas implementações (Mastercard RRP — Relay
              Resistance Protocol, Visa equivalente) que mede latência da resposta abaixo de
              microssegundos. Acima do limite, transação é recusada. Além disso, Apple Pay exige
              biometria <em>imediatamente antes</em> do tap — sem Touch/Face ID o SE não habilita o
              NFC, então não há nada para retransmitir.
            </>
          }
        />

        <QAItem
          q="Mas eu vi vídeos de gente clonando cartões com Flipper!"
          a={
            <>
              Geralmente são <em>cartões de transporte público antigos</em> (Crypto1) ou{' '}
              <em>tags de acesso a prédio sem cripto</em> (EM4100 125 kHz). Cartão de pagamento
              moderno: o que sai pelo NFC é PAN + expiry de uma trilha legacy, sem cryptogram. O
              Flipper exibe o número, mas tentar usar esse número pra comprar online falha no AVS,
              CVV2, e ARQC ausente em qualquer terminal contactless.
            </>
          }
        />
      </Section>

      <Section title="Decisão: que NFC escolher para meu sistema" accent={accent}>
        <DecisionBox
          scenario="Estou desenhando um sistema de acesso/transporte/loyalty em 2026. Que tag NFC compro?"
          winner="MIFARE DESFire EV3 com AES-128 + SUN"
          winnerColor={accent}
          why="EAL5+, AES-128, 3-pass mutual, SUN messages anti-clone, suporte universal, custo ~3-5x do Classic mas cabe no orçamento. Não há ataque público em 2026."
          alternatives={[
            { name: 'MIFARE Classic', when: 'NUNCA. Crypto1 quebrado desde 2008. Use só se for legado já implantado e você está planejando migração.' },
            { name: 'NTAG 21x (NFC Forum Type 2)', when: 'Read-only / NDEF público. Sem cripto. OK para marketing/URLs públicas.' },
            { name: 'NTAG 424 DNA', when: 'Variante "lite" do DESFire — AES + SUN, custo menor, menos memória. Excelente para ticket descartável ou anti-counterfeit em produto.' },
            { name: 'EMV', when: 'Você é banco/adquirente/PSP. Caso contrário, não — EMV é regulado e exige certificação.' },
          ]}
        />
      </Section>

      <Section title="Linha do tempo" accent={accent}>
        <Timeline
          accent={accent}
          title="NFC seguro: marcos"
          events={[
            { when: '2003', label: 'EMV Contactless v1.0', detail: 'Especificação inicial. Já prevê ARQC dinâmico com ATC.' },
            { when: '2008', label: 'Crypto1 quebrado academicamente', detail: 'Nohl/Plötz no 24C3 + Garcia et al. (Radboud).' },
            { when: '2008', label: 'DESFire EV1 lançado', detail: 'NXP responde com AES + EAL4+.' },
            { when: '2014', label: 'Apple Pay', detail: 'Tokenização de massa. SE + Secure Enclave + biometria.', highlight: true },
            { when: '2016', label: 'DESFire EV2', detail: 'EAL5+, Transaction MAC, multi-app melhorado.' },
            { when: '2018', label: 'Charlie Card (Boston) migra para DESFire', detail: 'Após múltiplos relatos de clonagem do Crypto1.' },
            { when: '2020', label: 'DESFire EV3 + SUN messages', detail: 'Anti-clone token único por leitura.', highlight: true },
            { when: '2026', label: 'Estado-da-arte', detail: 'EMV + DESFire EV3 sem ataque público viável com hardware comercial.' },
          ]}
        />
      </Section>

      <Section title="Resumo do contraste" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Crypto1 (Classic)', v: 'LFSR 48 bits, paridade vazada, chave estática, sem nonce do reader robusto. Quebrado.' },
            { k: 'DESFire AES (EV2/EV3)', v: 'AES-128, mutual 3-pass, session key por sessão, EAL5+, SUN messages.' },
            { k: 'EMV contactless', v: 'PAN tokenizado (DPAN), ARQC dinâmico por txn, ATC monotônico, validação online no issuer.' },
            { k: 'Apple Pay / Google Pay', v: 'Tudo do EMV + Secure Element dedicado + biometria obrigatória + bus isolado do app processor.' },
            { k: 'Flipper Zero contra esses', v: 'Captura tráfego, mas nem dump nem replay produzem leitura válida. Apenas reconhece e nomeia o chip.' },
          ]}
        />

        <MindMap
          accent={accent}
          root="Por que NFC seguro é seguro"
          branches={[
            {
              title: 'Cripto correta',
              items: [
                'AES-128 em vez de Crypto1',
                'Sem vazamentos de paridade conhecidos',
                'Session keys derivadas por transação',
              ],
            },
            {
              title: 'Estrutura do chip',
              items: [
                'EAL5+ contra side-channel + microprobing',
                'Secure Element fisicamente isolado',
                'Bus dedicado app-processor ⇄ SE',
              ],
            },
            {
              title: 'Protocolo dinâmico',
              items: [
                'ATC monotônico anti-replay',
                'Unpredictable Number do terminal',
                'SUN/CMAC validado no backend',
              ],
            },
            {
              title: 'Camada humana',
              items: [
                'Biometria obrigatória antes do tap (Apple/Google Pay)',
                'Tokenização: PAN nunca sai do SE',
                'Issuer valida online — fraude detectada em segundos',
              ],
            },
          ]}
        />
      </Section>

      <Section title="Referências e leitura técnica" accent={accent}>
        <NodeGraph
          accent={accent}
          title="Documentação oficial e papers"
          legend="Cite fontes primárias quando for desenhar sistema seguro"
          columns={[
            {
              label: 'Especificações',
              nodes: [
                { icon: '📘', label: 'EMVCo Tokenisation Spec', sub: 'emvco.com/specifications/' },
                { icon: '📗', label: 'NXP DESFire EV3 datasheet', sub: 'public NDA-free brief' },
                { icon: '📕', label: 'ISO/IEC 14443-4', sub: 'transport protocol layer' },
                { icon: '📙', label: 'NFC Forum Type 4 Tag', sub: 'nfc-forum.org' },
              ],
            },
            {
              label: 'Common Criteria',
              nodes: [
                { icon: '🛡️', label: 'EAL Levels', sub: 'commoncriteriaportal.org' },
                { icon: '🔬', label: 'Side-channel resistance', sub: 'AVA_VAN.5 e similares' },
              ],
            },
            {
              label: 'Token services',
              nodes: [
                { icon: '💳', label: 'Visa Token Service (VTS)', sub: 'usa.visa.com' },
                { icon: '💳', label: 'Mastercard MDES', sub: 'mastercard.com/mdes' },
              ],
            },
          ]}
        />

        <Callout tone="neutral" icon="📚">
          Para entender ataques side-channel em smartcards: Mangard, Oswald, Popp,{' '}
          <em>Power Analysis Attacks: Revealing the Secrets of Smart Cards</em> (Springer). Para EMV
          a fundo: <em>EMV Book 2 — Security and Key Management</em>, disponível gratuitamente em
          emvco.com.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
