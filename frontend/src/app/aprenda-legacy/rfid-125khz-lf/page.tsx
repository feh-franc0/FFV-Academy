import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  KeyValue,
  ArchFlow,
  Timeline,
  DecisionBox,
  AnnotatedFormula,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('rfid-125khz-lf');
const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o EM4100 é descrito como "broken by design"?',
    options: [
      'Porque o algoritmo de criptografia tem um bug',
      'Porque o EM4100 não tem criptografia nenhuma. Transmite 64 bits Manchester em claro: 9 bits de header + 8 nibbles de payload (2 nibbles version + 6 nibbles serial) + paridade linha/coluna. O cartão é literalmente seu próprio identificador. Qualquer leitor de US$5 lê; qualquer T5577 emula. Não há autenticação, contador, nonce, ou challenge-response. Foi projetado em 1990 para tagging industrial, não para controle de acesso',
      'Porque foi quebrado por um paper acadêmico em 2008',
      'Porque a antena é mal projetada',
    ],
    correct: 1,
    explanation: 'EM4100 é um codificador de ID puro. Nasceu para identificar paletes em depósito, não para autenticar humanos em portas. O uso em controle de acesso veio por inércia e custo. A indústria de condomínios brasileira usou massivamente entre 2000–2015.',
  },
  {
    question: 'O HID Prox H10301 (formato Wiegand 26-bit) tem qual problema combinatório central?',
    options: [
      'Nenhum, é seguro',
      'O formato 26-bit divide o espaço em 1 paridade par + 8 bits facility code + 16 bits card number + 1 paridade ímpar. 8 bits de facility code = só 256 facility codes possíveis no MUNDO. Como instaladores costumam reutilizar facility codes entre clientes (ou usar valores default tipo 0x33), colisões e clones cross-prédio são triviais. Cartão de uma empresa pode coincidir com cartão de outra na mesma cidade',
      'Usa SHA-1 quebrado',
      'Transmite a chave AES truncada',
    ],
    correct: 1,
    explanation: 'O problema 8-bit do facility code é estrutural do formato Wiegand 26-bit (1980s). Existem formatos maiores (35-bit Corporate 1000, 37-bit, etc.), mas o instalador escolhe o mais barato — e o mais barato é sempre 26-bit. HID publica essa limitação no datasheet.',
  },
  {
    question: 'Qual o papel do T5577 no ecossistema de RFID 125 kHz?',
    options: [
      'É só mais um cartão',
      'É o "chip coringa" regravável (Atmel ATA5577C). Tem blocos de configuração que, quando programados corretamente, fazem o chip RESPONDER no formato exato de EM4100, HID Prox 26-bit, Indala (PSK), EM4205, FDX-B (animal ID), entre outros. Um único T5577 emula todos os principais protocolos LF de ID estático. É por isso que o "cartão clone universal" do mercado paralelo é T5577. Flipper Zero programa T5577 sequenciando os blocos de configuração automaticamente',
      'É um chip que faz AES-128',
      'É um leitor, não um cartão',
    ],
    correct: 1,
    explanation: 'O datasheet do ATA5577C lista os modos de emulação. O firmware do Flipper (e Proxmark) traduz "emule este EM4100" em "escreva blocos de config X, Y, Z + payload". O T5577 vira universal porque os protocolos LF que ele emula são todos ID estático sem auth — não há "chave secreta" a programar.',
  },
  {
    question: 'Por que o acoplamento near-field a 125 kHz NÃO se considera "criptografia por proximidade"?',
    options: [
      'Porque nada é seguro',
      'Porque o "near-field" é apenas uma característica do MEIO físico (campo magnético decai com 1/r^3 perto da antena, então o alcance prático com leitor padrão é ~10 cm), não uma garantia criptográfica. Atacantes com bobina maior, mais corrente e amplificação atingem alcance de 30 cm a 1 metro. O alcance é parâmetro de hardware, não invariante de protocolo. Não confundir alcance curto com segurança',
      'Porque o campo magnético é encriptado mas a mensagem não',
      'Porque é regulado pela ANATEL',
    ],
    correct: 1,
    explanation: 'O argumento "tem que estar perto" é falacioso para qualquer RFID/NFC. Pesquisadores construíram leitores HID Prox de longo alcance (Bishop Fox Tastic RFID Thief, ~1m) caminhando ao lado da pessoa em corredor. Distance is a hardware budget, not a security property.',
  },
  {
    question: 'Em uma migração realista de um condomínio que usa EM4100 hoje, qual o caminho técnico?',
    options: [
      'Manter EM4100 e treinar porteiros',
      'Substituir leitores 125 kHz por leitores 13.56 MHz com suporte a NXP MIFARE DESFire EV2/EV3 (AES-128, autenticação mútua bidirecional, key diversification por cartão). Reemitir credenciais. Custo: leitor ~US$80–150, cartão ~US$2–4, controlador típico já suporta ambos os modos. Migração faseada (dual-reader em algumas portas) durante o período de transição',
      'Mudar para 433 MHz Sub-GHz',
      'Adicionar capacitor maior na bobina',
    ],
    correct: 1,
    explanation: 'O ecossistema técnico para migração existe há mais de 10 anos. O bloqueador é orçamento e gestão do condomínio, não tecnologia. DESFire EV2/EV3 com diversificação de chave por cartão (PBKDF derivado do UID) é estado-da-arte para acesso físico em 2026.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="rfid-125khz-lf"
      title="RFID 125 kHz: EM4100, HID Prox, T5577 — broken by design"
      icon="💳"
      xp={50}
      readTime={10}
      trailName="Flipper Zero & Hardware Hacking"
      trailColor={accent}
      nextSlug="nfc-13mhz-fundamentos"
      nextTitle="NFC fundamentos"
      quiz={quiz}
    >
      <Section title="Onde mora o 125 kHz" accent={accent}>
        <p>
          A faixa LF (Low Frequency) RFID a 125 kHz é a tecnologia dos cartões grossos brancos ou
          azuis de portaria, do chaveiro de condomínio, do controle de acesso de prédios comerciais
          de geração 2000–2015, e dos brincos de identificação de gado (FDX-B). Foi adotada em massa
          por dois motivos: (1) <strong>acoplamento indutivo near-field</strong> faz com que o cartão
          se alimente do próprio leitor (sem bateria), simplificando o produto; (2) o silício do tag
          é trivial — um circuito ressonante + shift register + modulação de carga. Custa centavos.
        </p>
        <p className="mt-3">
          O preço dessa simplicidade é a <strong>ausência de qualquer mecanismo criptográfico</strong>.
          Os tags 125 kHz dominantes (EM4100, HID Prox, Indala) são identificadores estáticos. O
          cartão não autentica o leitor; o leitor não desafia o cartão; ninguém troca chave. Toda a
          &ldquo;segurança&rdquo; do sistema é a unicidade probabilística do número.
        </p>
      </Section>

      <Section title="Como funciona o acoplamento indutivo" accent={accent}>
        <ArchFlow
          title="Fluxo físico cartão ↔ leitor a 125 kHz"
          accent={accent}
          columns={[
            {
              header: 'Leitor',
              items: [
                'Oscilador 125 kHz alimenta bobina',
                'Cria campo magnético oscilante',
                'Detecta variações de carga via medida de impedância',
              ],
              footer: 'Alcance típico 5–15 cm com bobina 60×60mm',
            },
            {
              header: 'Cartão (passivo)',
              headerColor: 'var(--ffv-orange)',
              items: [
                'Bobina ressonante a 125 kHz capta energia',
                'Retificador + cap alimentam o CI (~3V)',
                'Modula impedância (load modulation) para RESPONDER',
                'Codifica payload em Manchester',
              ],
              footer: 'Sem bateria. Lifetime "ilimitado" enquanto a bobina não quebrar.',
            },
            {
              header: 'No ar',
              headerColor: 'var(--ffv-purple)',
              items: [
                'Leitor → cartão: AM/ASK leve no campo',
                'Cartão → leitor: load modulation = pequeno desvio da corrente da bobina do leitor',
                'Decodificação Manchester por edge detection',
              ],
            },
          ]}
        />
        <Callout tone="info">
          <strong>Near-field ≠ proximidade segura.</strong> O campo decai com ~1/r^3 perto da
          antena, então o alcance prático é curto. Mas é parâmetro de hardware: bobina maior + mais
          corrente + amplificador = mais alcance. Bishop Fox demonstrou leitor HID Prox a ~1m em 2014.
        </Callout>
      </Section>

      <Section title="EM4100/EM4102 em detalhe" accent={accent}>
        <AnnotatedFormula
          title="Pacote EM4100: 64 bits Manchester"
          accent={accent}
          formula="[ 9× 1 ] [ V3..V0 P0 ] [ D7..D4 P1 ] [ D3..D0 P2 ] ... [ C3 C2 C1 C0 ] [ 0 ]"
          parts={[
            { text: '9× 1 (header)', annotation: '9 bits "1" consecutivos — sync, nunca aparece no payload por causa da paridade' },
            { text: 'V3..V0 / D7..D0', annotation: '2 nibbles version (8 bits) + 8 nibbles serial (32 bits) = 40 bits úteis', highlight: true },
            { text: 'P0..P9', annotation: 'paridade par por linha (1 bit por nibble)' },
            { text: 'C3..C0', annotation: 'paridade par por coluna (4 bits)' },
            { text: '0 (stop)', annotation: 'bit de parada' },
          ]}
        />
        <KeyValue
          accent={accent}
          items={[
            { k: 'Codificação de bit', v: '64 períodos por bit (~2 kbit/s effective)' },
            { k: 'Modulação', v: 'Manchester sobre subportadora 125 kHz' },
            { k: 'Tamanho útil', v: '40 bits (~1 trilhão de IDs distintos teóricos)' },
            { k: 'Auth', v: 'NENHUMA — cartão emite ID assim que entra no campo' },
            { k: 'Tempo para Flipper ler', v: '~200 ms' },
            { k: 'Tempo para clonar em T5577', v: '~1 segundo' },
          ]}
        />
        <CodeBlock lang="text" filename=".rfid do Flipper — EM4100 capturado">
{`Filetype: Flipper RFID key
Version: 1
Key type: EM4100
Data: 04 7B 8C D2 1A
# 5 bytes = 40 bits úteis (V0..V1 + D0..D7 nibbles, MSB first)`}
        </CodeBlock>
      </Section>

      <Section title="HID Prox H10301 e o limite do facility code" accent={accent}>
        <p>
          O <strong>HID Prox</strong> é a família de cartões 125 kHz mais comum em prédios
          corporativos americanos e parte do parque corporativo brasileiro pré-2015. O formato
          dominante é <strong>Wiegand 26-bit</strong> (H10301), modulado em FSK a 125 kHz.
        </p>
        <AnnotatedFormula
          title="Wiegand 26-bit"
          accent={accent}
          formula="[ Pe ] [ FC7..FC0 ] [ CN15..CN0 ] [ Po ]"
          parts={[
            { text: 'Pe', annotation: 'paridade PAR sobre os 12 bits seguintes' },
            { text: 'FC7..FC0', annotation: '8 bits Facility Code — só 256 valores no MUNDO', highlight: true },
            { text: 'CN15..CN0', annotation: '16 bits Card Number — 65.536 cartões por facility' },
            { text: 'Po', annotation: 'paridade ÍMPAR sobre os 12 bits anteriores' },
          ]}
        />
        <Callout tone="danger">
          <strong>O problema 8-bit.</strong> Com apenas 256 facility codes possíveis e instaladores
          reutilizando valores default (0x33, 0xFF, 0x01), colisões cross-prédio são triviais. Em
          algumas cidades, um cartão de uma empresa abre porta de outra empresa por puro azar
          combinatório. Existem formatos maiores (Corporate 1000 35-bit, 37-bit), mas custam mais
          e quase ninguém pede.
        </Callout>
      </Section>

      <Section title="Comparativo: EM4100 / HID Prox / Indala / T5577" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Tag', 'Bits no ar', 'Modulação', 'Crypto', 'Regravável', 'Uso típico no Brasil']}
          rows={[
            ['EM4100/EM4102', '64 (40 úteis)', 'Manchester', 'Não', 'Não', 'Condomínios 2000–2015'],
            ['HID Prox H10301', '26 Wiegand', 'FSK', 'Não', 'Não', 'Corporativo legado'],
            ['Indala', '26/27/29', 'PSK', 'Não', 'Não', 'Corporativo legado'],
            ['EM4205', '128 bits user', 'Manchester', 'Não (mas password 32-bit)', 'Sim', 'Tagging industrial'],
            ['T5577 (Atmel ATA5577C)', '224 bits, 7 blocos × 32', 'Configurável (Manchester/FSK/PSK)', 'Não', 'Sim — emula tudo acima', 'Cartão clone universal'],
            ['FDX-B (ISO 11784/85)', '128', 'Manchester', 'Não', 'Não', 'Identificação animal (gado, pets)'],
          ]}
        />
      </Section>

      <Section title="DecisionBox: qual chip usar para emular?" accent={accent}>
        <DecisionBox
          scenario="Você tem hardware seu (cartão de teste, backup do controle do seu próprio prédio)"
          winner="T5577 — coringa, regravável, US$0.50–1.00"
          winnerColor={accent}
          why="Um único T5577 substitui EM4100, HID Prox 26-bit, Indala PSK, EM4205. O Flipper Zero (e Proxmark3) sabe sequenciar os blocos de configuração corretos automaticamente. Emite-se exatamente o mesmo waveform que o tag original."
          alternatives={[
            { name: 'H5577', when: 'Variante do T5577, comportamento idêntico, vendido sob outro selo' },
            { name: 'Hitag-S', when: 'Quando o destino é Hitag (versão com password 32-bit), não cobre EM/HID' },
            { name: 'Cartão "blanco" genérico', when: 'Marketplaces vendem como "T5577 100% compatível"; geralmente é T5577 mesmo' },
          ]}
        />
      </Section>

      <Section title="Linha do tempo da família 125 kHz" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { when: '~1990', label: 'Dallas Semiconductor / EM Microelectronic comercializam EM4100', detail: 'Tagging industrial e identificação animal. Não pensado para acesso físico.' },
            { when: '~1995', label: 'HID Corporation populariza Prox em corporativo americano', detail: 'Wiegand 26-bit vira default em building access nos EUA.' },
            { when: '2000', label: 'Indala FSK/PSK em corporate legacy', detail: 'Modulações alternativas, mesma ausência de auth.' },
            { when: '2005', label: 'Atmel lança ATA5577 (T5577)', detail: 'Chip configurável que vira o "canivete suíço" de clonagem LF.', highlight: true },
            { when: '2010+', label: 'Mercado brasileiro adota EM4100 em massa em condomínios', detail: 'Custo do leitor cai abaixo de US$30; cartão branco fino vira commodity.' },
            { when: '2014', label: 'Bishop Fox publica Tastic RFID Thief', detail: 'Leitor HID Prox de longo alcance (~1m) demonstra que "near-field é seguro" é falso.', highlight: true },
            { when: '2020', label: 'Flipper Zero pre-orders no Kickstarter', detail: 'Hardware dedicado para LF (TI TMS37157) + UI consolidam toolkit.', highlight: true },
            { when: '2026', label: 'Migração para 13.56 MHz DESFire EV3 ainda em curso', detail: 'Maioria dos condomínios brasileiros antigos AINDA em 125 kHz por inércia de orçamento.' },
          ]}
        />
      </Section>

      <Section title="Defesas" accent={accent}>
        <Callout tone="success">
          <strong>1. Migrar para 13.56 MHz com cripto.</strong> NXP MIFARE DESFire EV2/EV3 (AES-128 +
          autenticação mútua + key diversification por UID) é o piso recomendado para acesso físico em
          2026. Próximos módulos detalham por que MIFARE Classic NÃO conta como cripto válida.
        </Callout>
        <Callout tone="success">
          <strong>2. Não confiar em &ldquo;cartão único&rdquo;.</strong> Adicionar segundo fator
          (PIN, biometria, BLE com challenge-response) reduz superfície mesmo se a tecnologia LF
          permanecer.
        </Callout>
        <Callout tone="warn">
          <strong>3. NÃO trocar EM4100 por &ldquo;EM4100 com password&rdquo; (EM4205).</strong> O
          password é 32-bit, transmitido em claro em sequência fixa, e o leitor padrão de condomínio
          não usa esse modo. Migração de verdade exige troca de tecnologia, não de chip.
        </Callout>
      </Section>

      <Section title="Referências" accent={accent}>
        <ul className="list-disc pl-5 text-sm" style={{ color: 'var(--ffv-text2)' }}>
          <li>EM Microelectronic, <em>EM4100/EM4102 Datasheet</em></li>
          <li>Atmel/Microchip, <em>ATA5577C Read/Write LF RFID IDIC</em> datasheet</li>
          <li>HID Global, <em>Understanding Card and Reader Compatibility</em> (white paper)</li>
          <li>Bishop Fox, <em>Tastic RFID Thief</em> — bishopfox.com/blog/tastic-rfid-thief-silent-deadly</li>
          <li>Flipper Devices, <em>RFID 125 kHz</em> docs — docs.flipper.net/zero/rfid</li>
          <li>RfidResearchGroup, <em>Proxmark3 T5577 Guide</em> — github.com/RfidResearchGroup/proxmark3</li>
          <li>Flipper blog, <em>Reading and emulating LF tags</em> — blog.flipper.net/rfid/</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
