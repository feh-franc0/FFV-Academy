import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, KeyValue, MindMap, Timeline, DecisionBox } from '@/components/article/primitives';

export const metadata = getModuleMetadata('flipper-o-que-e');

const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual afirmação é tecnicamente correta sobre o Flipper Zero?',
    options: [
      'Ele clona qualquer cartão de crédito por proximidade NFC',
      'Ele é um SDR full-spectrum 1 MHz–6 GHz como o HackRF',
      'Ele opera Sub-GHz via CC1101 em modo assíncrono restrito a OOK/ASK/2FSK/GFSK',
      'Ele invade redes Wi-Fi WPA2 sem hardware adicional',
    ],
    correct: 2,
    explanation: 'O CC1101 da Texas Instruments suporta MSK e 4FSK em hardware, mas o Flipper roda o rádio em modo assíncrono — restrição documentada no flipperdevices/flipperzero-firmware (subghz/devices). Wi-Fi exige board ESP32 externa (Marauder). EMV (cartões) usa criptografia dinâmica AES/3DES + nonces; UID estático que se lê não é o cartão.',
  },
  {
    question: 'Por que o HackRF One é mais poderoso que o Flipper em RF puro, mas o Flipper continua relevante para pentest físico?',
    options: [
      'HackRF custa menos e tem NFC integrado',
      'HackRF cobre 1 MHz–6 GHz half-duplex e faz IQ raw, mas não tem 13.56 MHz NFC ativo, IR, iButton 1-Wire nem 125 kHz LF',
      'HackRF tem bateria interna e o Flipper não',
      'HackRF emula Crypto1 em hardware, o Flipper não',
    ],
    correct: 1,
    explanation: 'HackRF One (Great Scott Gadgets, ~US$ 339) é um SDR half-duplex 1 MHz–6 GHz com 8-bit ADC/DAC, 20 Msps. É superior em análise espectral. Mas é um rádio puro: sem ST25R3916 para NFC ativo, sem 1-Wire para iButton, sem TX IR 940 nm, sem 125 kHz LF. O Flipper é "multi-tool físico" justamente por integrar 5 stacks distintos.',
  },
  {
    question: 'Qual é o status regulatório real do Flipper Zero no Brasil em 2026?',
    options: [
      'Homologado pela ANATEL desde 2023',
      'Permitido apenas em laboratórios universitários',
      'NÃO homologado pela ANATEL; importações via Correios são rotineiramente apreendidas',
      'Banido por lei federal específica',
    ],
    correct: 2,
    explanation: 'Não existe lei federal banindo o dispositivo no Brasil — o que existe é ausência de homologação ANATEL (Resolução 715/2019). A Lei 9.472/97 (LGT) Art. 162 exige homologação para qualquer transmissor; sem ela, importação cai como produto não-certificado e há registro de 340+ apreensões em portos/aeroportos/Correios desde 2023. No Canadá houve tentativa de banimento em fev/2024 que recuou após pressão da EFF.',
  },
  {
    question: 'Sobre o sucessor Flipper One anunciado: o que a Flipper Devices revelou até maio de 2026?',
    options: [
      'Roda FreeRTOS como o Zero',
      'Roda Linux Debian 13 + KDE Plasma Mobile, repositórios abertos no GitHub em mar/2026, sem data oficial de lançamento',
      'Já está em pré-venda por US$ 99',
      'Foi cancelado em janeiro de 2026',
    ],
    correct: 1,
    explanation: 'Pavel Zhovner (CEO) confirmou em posts oficiais e em entrevista ao Hackaday que o Flipper One é uma plataforma Linux completa (Debian 13 base + KDE Plasma Mobile shell), com SDR integrado e Wi-Fi. Repositórios flipperdevices/flipper-one-* ficaram públicos em março/2026. Sem janela de lançamento confirmada até o momento.',
  },
  {
    question: 'Por que afirmar "o Flipper clona Apple Pay" é tecnicamente impossível?',
    options: [
      'Porque o Apple Pay roda em 868 MHz, fora da banda do CC1101',
      'Porque o Secure Element da Apple gera token EMV dinâmico (DPAN + cryptogram ARQC) por transação, sem PAN exposto na interface',
      'Porque o NFC do iPhone usa criptografia quântica',
      'Porque o Flipper não tem antena NFC',
    ],
    correct: 1,
    explanation: 'Apple Pay implementa EMV Tokenization (EMVCo Specification v2.x): o Secure Element nunca expõe o PAN real — gera um Device Account Number (DPAN) e, por transação, um Authorization Request Cryptogram (ARQC) único derivado de chave AES no SE, validado pela bandeira. Mesmo um sniff perfeito captura um cryptogram já consumido. ST25R3916 lê NFC; não quebra criptografia EMV.',
  },
  {
    question: 'Qual é a leitura correta do caso CriptoVet (ES, 2024)?',
    options: [
      'O Flipper foi declarado ilegal pela 1ª vez no Brasil',
      'Foi um dos primeiros casos no Brasil em que um Flipper Zero foi apreendido como instrumento de crime (extorsão), reforçando que o uso — não a posse isolada — é o que tipifica a conduta',
      'A Justiça absolveu o réu por ausência de tipificação',
      'O caso envolveu apenas posse, sem dolo',
    ],
    correct: 1,
    explanation: 'Operação CriptoVet (Polícia Civil/ES, 2024): apreendeu Flipper Zero usado em esquema de extorsão envolvendo criptoativos. Precedente importante porque mostra que o dispositivo é tratado como instrumento (CP Art. 91, II, "a") quando há prova de uso ilícito. Posse pura e simples não foi tipificada — uso doloso foi.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="flipper-o-que-e"
      title="O que é o Flipper Zero (e o que NÃO é)"
      icon="🐬"
      xp={40}
      readTime={8}
      trailName="Flipper Zero & Hardware Hacking"
      trailColor={accent}
      nextSlug="flipper-hardware-por-dentro"
      nextTitle="Hardware por dentro"
      quiz={quiz}
    >
      <Section title="O que ele realmente é" accent={accent}>
        <p className="text-sm leading-6">
          O Flipper Zero é um <strong>multi-tool de hardware</strong> portátil para interagir com sinais físicos
          de baixa potência. Hardware de prateleira bem integrado, firmware open source (GPLv3), display LCD mono
          128×64 e um mascote dolphin que virou meme. A descrição honesta: cinco stacks de rádio/wired colocados
          numa placa do tamanho de um Tamagotchi.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Sub-GHz (CC1101)', v: '300–348 / 387–464 / 779–928 MHz — controles de garagem, sensores ISM, telemetria' },
            { k: 'NFC HF (ST25R3916)', v: '13.56 MHz — ISO 14443A/B, FeliCa, ISO 15693' },
            { k: 'RFID LF', v: '125 kHz — EM4100, HID Prox, Indala (emulação T5577)' },
            { k: 'Infravermelho', v: 'TX 940 nm + RX universal — controles remotos, ar-condicionado' },
            { k: 'iButton', v: '1-Wire Dallas DS1990A, Cyfral, Metakom' },
            { k: 'GPIO', v: '18 pinos 3.3 V — SPI/I2C/UART/PWM/ADC, rail 5 V opcional' },
            { k: 'BLE 5.4', v: 'Coprocessador Cortex-M0+ — BadKB, mobile companion app' },
            { k: 'USB-C', v: 'BadUSB (HID emulation), CDC serial, mass storage' },
          ]}
        />
        <Callout tone="info" icon="🐬">
          Filosofia do projeto: substituir <em>10 dispositivos especializados</em> por um único device de bolso
          para CTFs, pentest físico e curiosidade legítima sobre como protocolos cotidianos funcionam.
        </Callout>
      </Section>

      <Section title="O que ele NÃO é (desmistificação)" accent={accent}>
        <p className="text-sm leading-6">
          A reputação no TikTok mente. Flipper não é arma cibernética universal. Cada limitação abaixo é
          arquitetural, não &quot;destravável por firmware&quot;.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Mito viral', 'Realidade técnica', 'Por quê']}
          rows={[
            ['&quot;Invade Wi-Fi&quot;', 'Não, sozinho não', 'Não tem rádio 2.4 GHz Wi-Fi. Marauder/Evil Portal exigem board ESP32 externa no GPIO'],
            ['&quot;Clona Apple Pay / Google Pay&quot;', 'Impossível', 'EMV Tokenization: Secure Element gera DPAN + ARQC dinâmico por transação (EMVCo v2.x)'],
            ['&quot;Abre carro moderno&quot;', 'Não', 'Rolling code (KeeLoq, Hitag-AES) muda a cada press; replay simples falha. Modelos 2010+ usam challenge-response'],
            ['&quot;Clona cartão de crédito&quot;', 'Não', 'Lê o UID público, mas a transação exige criptograma EMV que requer chave do SE bancário'],
            ['&quot;Hackeia smartphone por proximidade&quot;', 'Não', 'BLE Spam só envia advertisement broadcast; não há exploit de stack iOS/Android via flooding'],
            ['&quot;Quebra senha do Bluetooth&quot;', 'Não', 'Pareamento BLE Secure Connections usa ECDH P-256 + numeric comparison'],
          ]}
        />
        <Callout tone="warn" icon="🎬">
          O viral &quot;mudei o preço da gasolina com Flipper&quot; (2023) era falso — bombas usam protocolos
          industriais isolados (IFSF, MODBUS sobre RS-485). O dispositivo é poderoso para o que <em>foi feito</em>;
          não é mágica.
        </Callout>
      </Section>

      <Section title="Capabilities reais — visão organizada" accent={accent}>
        <MindMap
          root="Flipper Zero"
          accent={accent}
          branches={[
            {
              title: 'Sub-GHz (CC1101)',
              items: [
                'Replay de garagem c/ código fixo (PT2262, EV1527)',
                'Análise de sensores 433.92 MHz',
                'Decodificação de protocolos (CAME, NICE, Princeton)',
                'Captura RAW para inspeção posterior',
              ],
            },
            {
              title: 'NFC / RFID',
              items: [
                'Leitura UID Mifare Classic / Ultralight / DESFire (UID público)',
                'Emulação T5577 (LF 125 kHz)',
                'Mfkey32 — recuperação de chave Crypto1 com nested attack',
                'Picopass / iCLASS legacy',
              ],
            },
            {
              title: 'IR universal',
              items: [
                'Database mundial de remotes (TVs, ACs, projetores)',
                'Brute-force de códigos NEC/RC5/Samsung',
                'Captura e replay de remotes proprietários',
              ],
            },
            {
              title: 'BadUSB / BadKB',
              items: [
                'HID injection via USB-C ou BLE',
                'Scripts DuckyScript v1/v2',
                'Útil em testes autorizados de DLP / lockscreen policy',
              ],
            },
            {
              title: 'GPIO + UART',
              items: [
                'Console serial em IoT (3.3 V)',
                'Bus Pirate–like via apps comunitários',
                'Logic analyzer básico',
              ],
            },
          ]}
        />
      </Section>

      <Section title="Comparação com alternativas (decisão de compra honesta)" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Ferramenta', 'Foco', 'Espectro', 'Preço (2026)', 'Quando preferir']}
          rows={[
            ['Flipper Zero', 'Multi-tool físico', 'Sub-GHz + NFC + IR + iButton + BLE', 'US$ 199', 'Pentest físico/CTF — 80% dos casos com 1 device'],
            ['HackRF One', 'SDR full-spectrum half-duplex', '1 MHz – 6 GHz, 20 Msps, 8-bit', 'US$ 339', 'Análise espectral séria, GSM/LTE downlink, IQ raw'],
            ['RTL-SDR v4', 'SDR somente RX', '500 kHz – 1.7 GHz', '~R$ 200', 'Aprender SDR, ADS-B, POCSAG (legal no BR como receptor)'],
            ['Proxmark3 RDV4', 'RFID/NFC profissional', '125 kHz + 13.56 MHz', 'US$ 350+', 'NFC profundo: Mifare DESFire, iCLASS Elite, HID iCLASS SE'],
            ['M5StickC + ESP32', 'DIY hacker', '2.4 GHz Wi-Fi/BLE + IR', '~R$ 150', 'Custo, customização total, Marauder nativo'],
            ['LimeSDR Mini 2.0', 'SDR full-duplex', '10 MHz – 3.5 GHz, 12-bit', 'US$ 459', 'TX/RX simultâneo, GNU Radio sério'],
          ]}
        />
        <DecisionBox
          scenario="Quero entrar em hardware hacking. Compro Flipper, HackRF ou Proxmark?"
          winner="Flipper Zero (primeiro device)"
          winnerColor={accent}
          why="Curva de aprendizado mais suave, comunidade ativa (40k+ stars no firmware oficial), cobre 5 tecnologias por US$ 199. HackRF/Proxmark são especializados — você compra depois, quando souber qual rabbit hole quer aprofundar."
          alternatives={[
            { name: 'HackRF One', note: 'se seu interesse é SDR/RF puro (rádio digital, ADS-B, GSM)' },
            { name: 'Proxmark3 RDV4', note: 'se foca em NFC corporativo (Mifare DESFire EV3, iCLASS SE)' },
            { name: 'RTL-SDR + GNU Radio', note: 'se está sem orçamento e quer começar legal no BR' },
          ]}
        />
      </Section>

      <Section title="Brasil: situação regulatória atual" accent={accent}>
        <Callout tone="danger" icon="🇧🇷">
          O Flipper Zero <strong>não tem homologação ANATEL</strong> (Resolução 715/2019). Importação por
          Correios/courier resulta em apreensão recorrente — registro de 340+ apreensões em portos, aeroportos
          (GRU/CWB) e Correios desde 2023. Não há lei federal específica banindo posse, mas a Lei 9.472/97 (LGT)
          Art. 162 exige homologação para qualquer transmissor.
        </Callout>
        <Timeline
          title="Marcos regulatórios e legais (Brasil + mundo)"
          accent={accent}
          events={[
            { when: '2020', label: 'Kickstarter Flipper Zero', detail: 'US$ 4.8M arrecadados, maior projeto hardware da plataforma à época' },
            { when: 'ago/2022', label: 'Início das vendas', detail: 'Primeiro batch comercial — Flipper Devices OÜ (Estônia)' },
            { when: '2023', label: 'Apreensões BR começam', detail: 'Receita Federal e Correios passam a reter remessas pessoais' },
            { when: '2024', label: 'Operação CriptoVet (ES)', detail: 'Flipper apreendido como instrumento em esquema de extorsão — 1º caso de mídia nacional', highlight: true },
            { when: 'fev/2024', label: 'Canadá tenta banir', detail: 'François-Philippe Champagne (Min. Indústria) anuncia banimento — recua após backlash da EFF e da comunidade' },
            { when: 'nov/2024', label: 'EUA Senado debate restrição', detail: 'Discussão sem aprovação; ferramenta segue legal nos EUA' },
            { when: 'mar/2026', label: 'Repos Flipper One públicos', detail: 'flipperdevices/flipper-one-* abertos no GitHub — Linux Debian 13 + KDE Plasma Mobile' },
          ]}
        />
      </Section>

      <Section title="Para quem este conteúdo é (e para quem NÃO é)" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Perfil', 'Alinhamento']}
          rows={[
            ['Pentester com escopo contratual', '✅ Trilha alvo'],
            ['Estudante de segurança / CTF player', '✅ Lab pessoal, hardware próprio'],
            ['Pesquisador de protocolo (RF/NFC)', '✅ Análise técnica de especificações públicas'],
            ['Defensor (red team interno → blue team)', '✅ Entender vetor para defender'],
            ['Curioso querendo &quot;clonar cartão alheio&quot;', '❌ Sai daqui. CP Art. 154-A + Lei 14.155/21 = reclusão 1–4 anos'],
            ['&quot;Quero abrir carro do vizinho&quot;', '❌ Furto qualificado §4-B = 4–8 anos. Não há trilha pra isso'],
          ]}
        />
        <Callout tone="success" icon="🎯">
          Tratamos o Flipper como objeto de engenharia. <strong>Por que</strong> um protocolo é vulnerável,
          <strong> como</strong> a falha foi documentada na literatura, e <strong>como</strong> mitigar — não
          como receita de invasão. A próxima aula entra no hardware: STM32WB55, CC1101, ST25R3916.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
