import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  KeyValue,
  StackFlow,
  Timeline,
  NodeGraph,
  AnnotatedFormula,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('nfc-13mhz-fundamentos');
const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'O que distingue ISO 14443A, ISO 14443B e ISO 15693 no nível físico?',
    options: [
      'Nada, são sinônimos',
      '14443A e 14443B operam a 13.56 MHz com alcance ~10 cm e bit rate 106 kbps inicial — a diferença está na MODULAÇÃO leitor→tag (A: 100% ASK + Miller; B: 10% ASK + NRZ) e na codificação tag→leitor (A: subportadora 847.5 kHz Manchester; B: subportadora 847.5 kHz BPSK). 15693 (NFC-V) opera também a 13.56 MHz mas é "vicinity": alcance ~1 m, bit rate menor (26 kbps), subportadora 423 kHz. 14443A é a base para MIFARE Classic, MIFARE Ultralight, NTAG e DESFire; 15693 para tags ICODE SLI e Tag-it',
      'Operam em frequências diferentes (125 kHz, 13.56 MHz e 868 MHz)',
      '14443B é encriptado, 14443A não é',
    ],
    correct: 1,
    explanation: 'A norma ISO/IEC 14443 (Identification cards — Contactless integrated circuit cards — Proximity cards) define quatro partes: Part 1 físico, Part 2 RF & sinalização (A e B), Part 3 inicialização e anti-collision, Part 4 protocolo de transmissão. ISO/IEC 15693 cobre vicinity cards. A confusão comum é misturar a camada de transporte (ISO 14443-4) com a camada de aplicação (MIFARE, EMV, etc.).',
  },
  {
    question: 'O que é o protocolo de anti-collision e por que ele importa para captura?',
    options: [
      'É o que evita que cartões batam fisicamente',
      'Quando há múltiplos tags no mesmo campo do leitor, o protocolo de anti-collision (ISO 14443-3 para tipo A: comando SELECT com cascade levels CL1/CL2/CL3) faz cada tag responder com seu UID e o leitor escolhe um por vez. Para o atacante/analista, o anti-collision é a fase em que UID e SAK (Select Acknowledge) são transmitidos em CLARO, antes de qualquer autenticação, em qualquer cartão NFC tipo A — incluindo DESFire EV3. UID por si só não permite clonar cartões com cripto, mas permite identificar a família, o tamanho e fingerprintar comportamento',
      'É um campo encriptado dentro do APDU',
      'É exclusivo de MIFARE Classic',
    ],
    correct: 1,
    explanation: 'O comando ANTICOLLISION + SELECT é executado no nível ISO 14443-3 antes de qualquer cripto. Por isso UID 4-byte (Classic, Ultralight) ou 7-byte (NTAG, DESFire) sempre vaza. Cartões DESFire EV1+ podem ativar "Random ID" (RID): respondem 0x08 + 3 bytes random a cada inicialização. Esse é hoje o piso para privacidade.',
  },
  {
    question: 'Por que Apple Pay e Google Pay são "NFC" mas NÃO são MIFARE?',
    options: [
      'São sim MIFARE',
      'Porque o que viaja no ar entre o telefone e o terminal NÃO é dump de cartão MIFARE. É EMV Contactless (ISO 14443-4 + ISO 7816 APDUs) com Host Card Emulation (HCE) ou Secure Element. O telefone gera um TOKEN de pagamento (DPAN — Device PAN) que substitui o número real do cartão; o token é único por dispositivo e cada transação carrega um cryptogram dinâmico (ARQC) assinado com chave do issuer. Mesmo que alguém capturasse a transação inteira, não saberia o PAN real e o cryptogram não vale para outra transação',
      'Porque o iPhone não tem antena NFC',
      'Porque Apple Pay usa Bluetooth',
    ],
    correct: 1,
    explanation: 'Tokenization (EMVCo Tokenisation Specification 2014) + cryptogram dinâmico (visa Token Service / Mastercard MDES) tornam o canal NFC um simples meio de transporte. A segurança vive na camada de aplicação EMV, não no chip MIFARE Classic. Confundir os dois leva à conclusão errada de que "NFC é inseguro" porque Crypto1 caiu.',
  },
  {
    question: 'Onde DESFire EV3 ganha de MIFARE Classic em segurança?',
    options: [
      'No tamanho da memória',
      'Em três eixos: (1) cifra moderna AES-128 (e 3DES por compat), em vez do Crypto1 quebrado em 2008; (2) AUTENTICAÇÃO MÚTUA — leitor prova ao cartão que conhece a chave, e cartão prova ao leitor; sem mútua, ataques tipo MFKey32 que se passam pelo cartão funcionam; (3) certificações Common Criteria EAL5+ (EV2/EV3) com avaliação de side-channel; o silício foi projetado para resistir a DPA. Adicionalmente, DESFire suporta key diversification (DK = AES(MK, UID)) para que cada cartão tenha chave única derivada do master',
      'Apenas a cor do encapsulamento muda',
      'Não ganha — é igual',
    ],
    correct: 1,
    explanation: 'NXP publica os perfis de proteção e relatórios CC do EV2 e EV3 (Common Criteria portal). EAL5+ exige análise formal e penetration testing por laboratório acreditado. Não é marketing — é o piso atual em smart cards de transporte e acesso premium.',
  },
  {
    question: 'Para que serve o app "MFKey32" do Flipper, e em qual camada ele opera?',
    options: [
      'Decodifica EMV',
      'Opera na camada de aplicação MIFARE Classic e implementa o ataque MFKey32 (de noproto/FlipperMfkey, baseado em Garcia et al. 2008). O Flipper se faz passar pelo cartão Classic; um leitor genuíno tenta autenticar contra o "cartão"; o Flipper captura os nonces da fase de autenticação Crypto1; com 2 autenticações sobre o mesmo setor, recupera a chave A ou B. É um ataque assimétrico — o atacante NUNCA toca o cartão real, mas precisa do leitor genuíno (ou de quem tem acesso a ele)',
      'Quebra AES-128 do DESFire',
      'É um app de carteira de pagamento',
    ],
    correct: 1,
    explanation: 'MFKey32 é detalhado no próximo módulo. Aqui basta entender que ele só funciona contra MIFARE Classic (cripto Crypto1). DESFire, NTAG sem cripto, e qualquer coisa não-Classic estão fora do escopo do MFKey32.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="nfc-13mhz-fundamentos"
      title="NFC 13.56 MHz: ISO 14443A/B, MIFARE, NTAG, ISO 15693"
      icon="📲"
      xp={60}
      readTime={11}
      trailName="Flipper Zero & Hardware Hacking"
      trailColor={accent}
      nextSlug="mifare-classic-crypto1-quebrado"
      nextTitle="Crypto1 quebrado"
      quiz={quiz}
    >
      <Section title="O que é &ldquo;NFC&rdquo;, exatamente" accent={accent}>
        <p>
          NFC (Near Field Communication) é um conjunto de normas que sobem em camadas a partir do
          rádio a 13.56 MHz. No núcleo: <strong>ISO/IEC 14443</strong> (proximity, ~10 cm) e{' '}
          <strong>ISO/IEC 15693</strong> (vicinity, ~1 m). Em cima disso, o <strong>NFC Forum</strong>
          define modos (reader/writer, peer-to-peer, card emulation) e tipos de tag (Type 1 a 5).
          Em cima dos tipos, vivem as famílias proprietárias: <strong>MIFARE</strong> (NXP),{' '}
          <strong>FeliCa</strong> (Sony, Japão), <strong>EMV Contactless</strong> (cartões de
          pagamento) e os perfis específicos de transporte público.
        </p>
        <p className="mt-3">
          Boa parte da confusão pública vem de tratar &ldquo;NFC&rdquo; como uma coisa só. Não é. O
          mesmo cartão pode ser ISO 14443-A no físico, NFC Forum Type 4 no transporte e EMV
          Contactless na aplicação. Cada uma dessas camadas tem propriedades de segurança diferentes.
        </p>
      </Section>

      <Section title="Pilha de camadas" accent={accent}>
        <StackFlow
          title="Stack típica (cartão MIFARE/NTAG)"
          accent={accent}
          items={[
            {
              icon: '📡',
              label: 'Camada física — 13.56 MHz',
              sub: 'ISO 14443-2',
              detail: 'Portadora 13.56 MHz; leitor → tag por modulação ASK; tag → leitor por load modulation com subportadora a 847.5 kHz (14443A) ou 423 kHz (15693).',
            },
            {
              icon: '🔢',
              label: 'Sinalização & anti-collision',
              sub: 'ISO 14443-3',
              detail: 'Comandos REQA/WUPA, ANTICOLLISION + SELECT. UID 4-byte ou 7-byte vaza nesta camada, antes de qualquer auth.',
            },
            {
              icon: '🔌',
              label: 'Protocolo de transmissão',
              sub: 'ISO 14443-4 (T=CL)',
              detail: 'Frames de bloco com CRC, retry e chaining. Equivalente NFC do "TCP" sobre o rádio.',
            },
            {
              icon: '🃏',
              label: 'Aplicação',
              sub: 'MIFARE / NTAG / DESFire / EMV / FeliCa',
              detail: 'É AQUI que vivem as cifras (Crypto1, AES) e a lógica de cartão. A segurança depende quase inteiramente desta camada.',
            },
          ]}
        />
      </Section>

      <Section title="ISO 14443A vs 14443B vs 15693" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Norma', 'Alcance', 'Bit rate inicial', 'Modulação L→T', 'Modulação T→L', 'Onde aparece']}
          rows={[
            ['ISO 14443A', '~10 cm', '106 kbps', '100% ASK + Miller', 'Subport. 847.5 kHz Manchester', 'MIFARE family, NTAG, transporte, acesso, alguns EMV'],
            ['ISO 14443B', '~10 cm', '106 kbps', '10% ASK + NRZ', 'Subport. 847.5 kHz BPSK', 'Documentos de identidade, passaporte biométrico antigo, alguns EMV'],
            ['ISO 15693 (NFC-V)', '~1 m', '26 kbps', 'PPM', 'Subport. 423 kHz Manchester', 'ICODE SLI, Tag-it, etiquetas industriais, controle de acesso vicinity'],
            ['FeliCa (JIS X 6319-4)', '~10 cm', '212 kbps', 'Manchester ASK', 'Manchester ASK', 'Suica, Pasmo, Octopus (Hong Kong) — pred. Japão/Ásia'],
          ]}
        />
        <Callout tone="info">
          O Flipper Zero suporta primariamente <strong>ISO 14443A</strong> (NFC-A). 14443B funciona
          parcialmente em alguns firmwares; 15693 e FeliCa exigem hardware adicional ou Proxmark3.
        </Callout>
      </Section>

      <Section title="Família MIFARE: do Classic ao DESFire EV3" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Tag', 'Lançamento', 'Memória', 'Cripto', 'Auth', 'Tier de segurança em 2026']}
          rows={[
            ['MIFARE Classic 1K', '1994', '1 KB (16 setores × 4 blocos)', 'Crypto1 (proprietário)', 'Key A / Key B 48-bit', 'QUEBRADO (Garcia et al. 2008)'],
            ['MIFARE Classic 4K', '~2000', '4 KB (40 setores)', 'Crypto1', 'Key A / Key B', 'QUEBRADO'],
            ['MIFARE Ultralight', '2007', '64 B', 'Nenhuma', 'Nenhuma', 'OK só para tickets descartáveis'],
            ['MIFARE Ultralight C', '2009', '192 B', '3DES', 'Mútua 3DES', 'Aceitável (3DES tem deprecation prevista)'],
            ['MIFARE Ultralight EV1', '2012', '48–144 B', 'Password 32-bit', 'Password (não é cripto forte)', 'OK só para tickets'],
            ['MIFARE DESFire EV1', '2008', '2/4/8 KB', 'DES, 3DES, AES-128', 'Mútua', 'Bom (Common Criteria EAL4+)'],
            ['MIFARE DESFire EV2', '2016', '2/4/8 KB', 'AES-128', 'Mútua + secure messaging', 'Excelente (CC EAL5+)'],
            ['MIFARE DESFire EV3', '2020', '2/4/8 KB', 'AES-128, LRP mode', 'Mútua + LRP', 'Estado-da-arte (CC EAL5+)'],
          ]}
        />
        <p className="mt-3">
          O salto técnico está entre Classic e DESFire. Classic é cifra proprietária quebrada em
          paper público (próximo módulo). DESFire usa AES-128 com autenticação mútua e secure
          messaging (todos os comandos pós-auth viajam encriptados e autenticados).
        </p>
      </Section>

      <Section title="Famílias NFC, em mapa visual" accent={accent}>
        <NodeGraph
          title="O ecossistema NFC tipo A"
          accent={accent}
          columns={[
            {
              label: 'Quebrados / sem cripto',
              nodes: [
                { icon: '⚠', label: 'MIFARE Classic 1K/4K', sub: 'Crypto1 (1994, quebrado 2008)', tone: 'danger' },
                { icon: '🃏', label: 'MIFARE Ultralight', sub: 'sem cripto', tone: 'muted' },
                { icon: '🏷', label: 'NTAG213/215/216', sub: 'sem cripto, 144/504/888 B', tone: 'muted' },
              ],
            },
            {
              label: 'Aceitáveis',
              nodes: [
                { icon: '🔑', label: 'Ultralight C', sub: '3DES + mútua' },
                { icon: '🔑', label: 'Ultralight EV1', sub: 'password 32-bit' },
                { icon: '🔒', label: 'DESFire EV1', sub: 'AES-128, EAL4+' },
              ],
            },
            {
              label: 'Estado-da-arte',
              nodes: [
                { icon: '✅', label: 'DESFire EV2', sub: 'AES + secure msg, EAL5+', tone: 'emphasis' },
                { icon: '✅', label: 'DESFire EV3', sub: 'AES + LRP, EAL5+', tone: 'emphasis' },
                { icon: '💳', label: 'EMV Contactless', sub: 'cryptogram dinâmico + token (NÃO MIFARE)', tone: 'success' },
              ],
            },
          ]}
          legend="Apple Pay e Google Pay falam EMV Contactless sobre ISO 14443-4. NÃO confundir com a coluna esquerda."
        />
      </Section>

      <Section title="NTAG: o tag &ldquo;programável sem cripto&rdquo;" accent={accent}>
        <p>
          A família NTAG (NXP) é diferente de MIFARE: foi pensada para uso público — smart-posters
          NDEF, tickets baratos, brinquedos (<strong>Amiibo da Nintendo usa NTAG215</strong>),
          etiquetas inteligentes em embalagens. Não tem cripto.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'NTAG213', v: '144 bytes user memory, UID 7-byte, ECC opcional 32-bit' },
            { k: 'NTAG215', v: '504 bytes user — usado em Amiibo' },
            { k: 'NTAG216', v: '888 bytes user' },
            { k: 'Padrão NDEF', v: 'NFC Data Exchange Format — payload estruturado (URL, vCard, WiFi config)' },
            { k: 'Ataques relevantes', v: 'NÃO há "quebra de cripto"; o ataque é apenas escrever payload alterado em tags próprias' },
          ]}
        />
        <CodeBlock lang="text" filename="dump NTAG215 — primeiros blocos">
{`Filetype: Flipper NFC device
Version: 4
# Device type can be NTAG215
Device type: NTAG215
# UID is common for all formats
UID: 04 5C A1 B2 C3 D4 80
ATQA: 00 44
SAK: 00
Data format version: 2
NTAG/Ultralight version: 00 04 04 02 01 00 11 03
Counter 0: 0
Tearing 0: BD
Block 0: 04 5C A1 B2
Block 1: C3 D4 80 BD
Block 2: 4A 48 00 00
Block 3: E1 10 3E 00   # capability container
Block 4: 03 0F D1 01
Block 5: 0B 55 03 66    # NDEF: URL "http://flipperzero.one"
...`}
        </CodeBlock>
      </Section>

      <Section title="Anti-collision e UID: o que sempre vaza" accent={accent}>
        <AnnotatedFormula
          title="Sequência típica de inicialização ISO 14443A"
          accent={accent}
          formula="Reader: REQA → Tag: ATQA → Reader: SELECT CL1 → Tag: UID + BCC → ... → SELECT CL2/CL3 → SAK"
          parts={[
            { text: 'REQA', annotation: 'Request Type A (0x26): "qualquer tag tipo A no campo, responda"' },
            { text: 'ATQA', annotation: 'Answer to Request Type A: 2 bytes que indicam família e tamanho de UID' },
            { text: 'UID + BCC', annotation: '4 bytes de UID + 1 byte de BCC (XOR check). Se UID for 7-byte, repete em CL2', highlight: true },
            { text: 'SAK', annotation: 'Select Acknowledge: indica se cartão suporta ISO 14443-4, MIFARE Classic, etc.', highlight: true },
          ]}
        />
        <Callout tone="warn">
          UID e SAK são públicos por design. Privacidade real (resistência a tracking) requer{' '}
          <strong>Random ID</strong> — feature opcional do DESFire EV1+ em que o cartão responde com
          UID 0x08+3-bytes-random a cada nova inicialização. Sem RID, alguém com bobina pode
          fingerprintar todos os crachás de um corredor.
        </Callout>
      </Section>

      <Section title="Linha do tempo NFC" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { when: '1994', label: 'NXP (ainda Philips Semiconductors) lança MIFARE Classic', detail: 'Crypto1 proprietário, 48-bit, esconde cifra atrás de NDA. Vira padrão de transporte.' },
            { when: '2003', label: 'NFC Forum fundado por Sony, NXP, Nokia', detail: 'Padroniza modos e tipos de tag em cima de ISO 14443.' },
            { when: '2008', label: 'Garcia et al. publicam Dismantling MIFARE Classic — ESORICS 2008', detail: 'Quebra prática do Crypto1 em <1 segundo com 1–2 auth contra leitor.', highlight: true },
            { when: '2008', label: 'NXP lança MIFARE DESFire EV1 (AES-128)', detail: 'Resposta industrial à quebra. Common Criteria EAL4+.' },
            { when: '2014', label: 'Apple Pay (HCE não — Secure Element) entra em produção', detail: 'EMV Contactless + tokenization viram referência de pagamento NFC.', highlight: true },
            { when: '2015', label: 'Meijer/Verdult — CCS 2015', detail: 'Quebra do MIFARE Classic "hardened" via vazamento de bits de paridade. Hardnested attack.' },
            { when: '2016', label: 'DESFire EV2 lançado — AES + secure messaging, EAL5+', detail: '' },
            { when: '2020', label: 'DESFire EV3 lançado', detail: 'LRP (Leakage Resilient Primitive) mode + AES-128. Estado-da-arte 2026.' },
            { when: '2024', label: 'Static Encrypted Nonce variant — IACR ePrint 2024/1275', detail: 'Novos detalhes de ataques contra Classic hardened.', highlight: true },
          ]}
        />
      </Section>

      <Section title="Apps NFC do Flipper Zero" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Read', v: 'Inicialização ISO 14443A normal: REQA → SELECT → identifica família → tenta dictionary attack se Classic' },
            { k: 'Read in Reader Mode', v: 'Modo passivo — Flipper escuta a comunicação entre leitor real e cartão real (sniff)' },
            { k: 'Save as MFKey32', v: 'Salva os nonces capturados quando alguém autenticou contra o Flipper emulando cartão' },
            { k: 'Detect Reader', v: 'Flipper se anuncia como cartão Classic; quando um leitor genuíno tenta autenticar, captura' },
            { k: 'Emulate', v: 'Reenvia dump salvo respondendo aos comandos como se fosse o cartão' },
          ]}
        />
        <Callout tone="warn">
          As ferramentas existem porque profissionais (locksmiths, pentesters, pesquisadores)
          precisam delas. Uso ético: hardware próprio, contratos de pentest com escopo escrito, ou
          teste em laboratório. Contra cartão alheio é Art. 154-A do CP brasileiro.
        </Callout>
      </Section>

      <Section title="Referências" accent={accent}>
        <ul className="list-disc pl-5 text-sm" style={{ color: 'var(--ffv-text2)' }}>
          <li>ISO/IEC 14443-1..4 (proximity contactless integrated circuit cards)</li>
          <li>ISO/IEC 15693-1..3 (vicinity integrated circuit cards)</li>
          <li>NFC Forum, <em>NFC Forum Type Tags Technical Specifications</em></li>
          <li>NXP, <em>MIFARE DESFire EV3 Datasheet</em> + Common Criteria certification reports</li>
          <li>EMVCo, <em>EMV Contactless Specifications for Payment Systems</em></li>
          <li>Flipper Devices, <em>NFC docs</em> — docs.flipper.net/zero/nfc</li>
          <li>Wikipedia, <em>MIFARE</em> — en.wikipedia.org/wiki/MIFARE</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
