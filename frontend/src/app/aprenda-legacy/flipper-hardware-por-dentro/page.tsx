import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, StackFlow, ArchFlow, FlowDiagram } from '@/components/article/primitives';

export const metadata = getModuleMetadata('flipper-hardware-por-dentro');

const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o STM32WB55RG do Flipper Zero é considerado um SoC dual-core "raro" em hobby hardware?',
    options: [
      'Tem dois Cortex-A72 a 1.5 GHz',
      'Tem um Cortex-M4 @ 64 MHz para aplicação e um Cortex-M0+ @ 32 MHz dedicado ao stack de rádio BLE/802.15.4, com IPCC mailbox de comunicação',
      'É o único MCU ARM com instrução de divisão',
      'Inclui FPGA reconfigurável on-die',
    ],
    correct: 1,
    explanation: 'STM32WB55 (família WB) integra Cortex-M4F @ 64 MHz (CPU1, application) + Cortex-M0+ @ 32 MHz (CPU2, network — roda firmware proprietário ST do BLE 5.4 e 802.15.4). RAM compartilhada via mecanismo IPCC (Inter-Processor Communication Controller) e mailbox. Datasheet ST RM0434 (Reference Manual) detalha o protocolo. É raro porque libera o M4 100% para app/UI sem ser preempto por rádio.',
  },
  {
    question: 'O CC1101 da Texas Instruments suporta nativamente quais modulações em hardware?',
    options: [
      'Só OOK',
      'OOK/ASK, 2FSK, 4FSK, GFSK, MSK — mas o Flipper opera em modo assíncrono, restringindo o conjunto utilizável',
      'Apenas FM analógico',
      'OFDM e QAM-256',
    ],
    correct: 1,
    explanation: 'Datasheet TI CC1101 SWRS061I lista OOK/ASK, 2-FSK, 4-FSK, GFSK e MSK como modulações nativas. O firmware do Flipper (subghz/devices/cc1101_int) usa modo assíncrono com leitura GPIO direta do GDO0/GDO2, o que limita decodificação prática a OOK/ASK/2FSK/GFSK — 4FSK e MSK exigiriam DSP no MCU que o pipeline atual não implementa.',
  },
  {
    question: 'Sobre o ST25R3916 (NFC frontend do Flipper): qual conjunto de padrões ele suporta?',
    options: [
      'Apenas Mifare Classic',
      'ISO 14443A/B (até NFC-A/B 848 kbps), FeliCa (NFC-F), ISO 15693 (NFC-V/Vicinity), e modo Reader/Card/P2P',
      'Só ISO 18000-6C UHF',
      'Apenas Bluetooth Low Energy',
    ],
    correct: 1,
    explanation: 'ST25R3916 (datasheet ST DS12484) é um NFC reader IC completo: ISO 14443 Type A e B (incluindo high-bitrates 212/424/848 kbps), JIS X 6319-4 FeliCa, ISO 15693 (NFC-V), modo passive target, AAT (Automatic Antenna Tuning) e até VHBR. Por isso o Flipper lê DESFire, Mifare Plus, FeliCa Lite e tags NFC-V de logística.',
  },
  {
    question: 'Por que o GPIO do Flipper é "3.3 V tolerante" mas existe um rail 5 V switchable separado?',
    options: [
      'Porque o STM32WB55 tem pinos 5 V-tolerant nativos',
      'Os pinos lógicos são 3.3 V CMOS (VDD do MCU); o pino 1 expõe 5 V vindo do USB ou do boost de bateria via switch dedicado, para alimentar periféricos externos como ESP32 dev boards',
      'Para evitar interferência no LCD',
      'Porque o CC1101 precisa de 5 V no core',
    ],
    correct: 1,
    explanation: 'STM32WB55 tem VDD = 1.71–3.6 V; nenhum pino é 5 V-tolerant para sinal lógico (aplicar 5 V queima). O pino 1 do header GPIO é alimentação 5 V comutável via FET controlado por firmware, presente para alimentar shields como ESP32 Marauder ou sensores que exigem 5 V — sinal lógico continua 3.3 V. Errar isso destrói o MCU.',
  },
  {
    question: 'Existe uma erratum conhecida em algumas unidades antigas do Flipper Zero relacionada ao display. Qual é?',
    options: [
      'OLED queima após 1000 horas',
      'Coluna de pixels mortos no LCD ST7567 em batches anteriores a 2023; cobertos por RMA da Flipper Devices',
      'O backlight é estroboscópico em 60 Hz',
      'O LCD não funciona abaixo de 0 °C',
    ],
    correct: 1,
    explanation: 'Issue documentada no fórum oficial e em flipperdevices/flipperzero-firmware (issues #1xxx) em batches de 2022/início 2023: dead-pixel column no ST7567 mono LCD 128×64 — defeito do controlador, não do firmware. Flipper Devices cobre via RMA. Outra erratum menor: spurs de clock perto de 13 MHz no CC1101 dependendo do layout — mitigada por filtragem na antena.',
  },
  {
    question: 'A bateria LiPo 2100 mAh do Flipper alega "até 28 dias standby". Qual hipótese sustenta esse número?',
    options: [
      'Cortex-M4 ativo a 64 MHz constante',
      'Cortex-M4 em STOP mode (~1 µA), CPU2 em standby BLE com beacons advertising desligados, LCD ST7567 em deep sleep (display retém imagem sem refresh)',
      'Bateria de íon-lítio de 5000 mAh',
      'Recarga solar contínua via display',
    ],
    correct: 1,
    explanation: 'STM32WB55 em STOP1 mode com retenção de RAM consome unidades de µA. O LCD ST7567 mono é reflexivo: mantém imagem sem corrente significativa. CPU2 BLE em deep sleep com advertising off (modo padrão sem mobile companion conectado) também desce a µA. 2100 mAh ÷ ~3 µA total ≈ 700 mil horas teórico, prático ~28 dias considerando wake-ups, button polling e self-discharge.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="flipper-hardware-por-dentro"
      title="Hardware por dentro: STM32WB55, CC1101, ST25R3916"
      icon="🔬"
      xp={50}
      readTime={10}
      trailName="Flipper Zero & Hardware Hacking"
      trailColor={accent}
      nextSlug="flipper-etica-legal-brasil"
      nextTitle="Ética e legalidade BR"
      quiz={quiz}
    >
      <Section title="Visão geral do board" accent={accent}>
        <p className="text-sm leading-6">
          O Flipper Zero não é um MCU genérico com periféricos colados — é uma <strong>composição
          deliberada</strong> de cinco subsistemas RF/wired ao redor de um SoC dual-core. Entender o silício
          esclarece imediatamente o que ele consegue (e o que não consegue) fazer.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'SoC principal', v: 'STMicroelectronics STM32WB55RG (dual-core ARM)' },
            { k: 'Sub-GHz radio', v: 'Texas Instruments CC1101 (transceiver narrow-band)' },
            { k: 'NFC HF', v: 'STMicroelectronics ST25R3916 (NFC reader IC)' },
            { k: 'RFID LF', v: 'Frontend analógico discreto + EM4100/T5577 emulation via GPIO' },
            { k: 'iButton 1-Wire', v: 'GPIO + pull-up — protocolo Dallas DS1990A em software' },
            { k: 'IR', v: 'TX LED 940 nm + RX TSOP-like demodulado' },
            { k: 'Display', v: 'Sitronix ST7567 LCD mono 128×64 reflexivo' },
            { k: 'Bateria', v: 'LiPo 2100 mAh, gauge BQ27220 + carregador BQ25896' },
            { k: 'Conector', v: 'USB-C (CDC + HID + MSC), header GPIO 2×9 (18 pinos)' },
          ]}
        />
      </Section>

      <Section title="STM32WB55RG — o SoC dual-core" accent={accent}>
        <p className="text-sm leading-6">
          O coração é um SoC ST da família <strong>WB</strong> (Wireless Bluetooth). O nome esconde a estrela:
          é dual-core. Um core para você (aplicação), outro reservado pelo firmware proprietário ST para o
          stack de rádio. Você não programa o M0+ — ele expõe APIs via mailbox IPCC.
        </p>
        <ArchFlow
          title="Arquitetura interna do STM32WB55"
          accent={accent}
          columns={[
            {
              header: 'CPU1 — Application',
              items: [
                'ARM Cortex-M4F @ 64 MHz',
                'FPU single-precision',
                'DSP instructions',
                'Roda firmware do Flipper (FreeRTOS)',
                'GUI, USB, GPIO, drivers de rádio',
              ],
              footer: 'Você programa aqui',
            },
            {
              header: 'Memória compartilhada',
              items: [
                '1 MB Flash on-chip',
                '256 KB SRAM (SRAM1 + SRAM2)',
                'IPCC — mailbox HW',
                'Semáforos hardware (HSEM)',
                'Firmware CPU2 em região separada do flash',
              ],
              footer: 'Mediação entre cores',
            },
            {
              header: 'CPU2 — Network',
              items: [
                'ARM Cortex-M0+ @ 32 MHz',
                'Stack BLE 5.4 (LE Audio, ISO)',
                'Stack 802.15.4 (Thread, Zigbee 3.0)',
                'Firmware ST proprietário (binary blob)',
                'Atualizado via FUS (Firmware Update Service)',
              ],
              footer: 'Você não toca no código aqui',
            },
          ]}
        />
        <Callout tone="info" icon="🧠">
          Por que dois cores? <strong>Determinismo de rádio.</strong> BLE exige timing apertado para conexão
          slot-based; se o M4 estivesse fazendo render de UI e ao mesmo tempo gerenciando rádio, perderia
          eventos. Separação de responsabilidade em silício é o motivo do Flipper conseguir BadKB BLE estável.
        </Callout>
      </Section>

      <Section title="CC1101 — o transceiver Sub-GHz" accent={accent}>
        <p className="text-sm leading-6">
          Texas Instruments CC1101 é um transceiver narrow-band Sub-GHz lendário (datasheet SWRS061I, 100+
          páginas). Existe desde 2007, está em milhões de produtos. No Flipper conecta ao M4 via SPI mais dois
          GPIOs de status (GDO0, GDO2) que sinalizam clock de chip e RX FIFO ready.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Bandas', v: '300–348 MHz, 387–464 MHz, 779–928 MHz (3 bands switchable por config)' },
            { k: 'TX power', v: '−30 dBm a +12 dBm (até +20 dBm em pulsos, com PA externo)' },
            { k: 'RX sensitivity', v: '−116 dBm @ 0.6 kbps, 433 MHz' },
            { k: 'Modulações HW', v: 'OOK/ASK, 2-FSK, 4-FSK, GFSK, MSK' },
            { k: 'Bitrate', v: '0.6 kbps – 600 kbps' },
            { k: 'Bandwidth canal', v: '58 kHz – 812 kHz' },
            { k: 'Interface', v: 'SPI até 10 MHz + GDO0/GDO2 status' },
          ]}
        />
        <Callout tone="warn" icon="⚙️">
          O Flipper opera o CC1101 em <strong>modo assíncrono</strong>: o chip vira um demodulador OOK/ASK/FSK
          básico, e o M4 lê GDO0 como GPIO timing-critical para extrair edges. Resultado prático: não
          aproveita o packet engine HW do CC1101 (sync word, CRC, FEC) — porque a maioria dos protocolos
          domésticos (controles de garagem, sensores) não os usa de forma compatível com o packet engine.
          Trade-off: flexibilidade total para protocolos arbitrários.
        </Callout>
        <CodeBlock lang="c">{`// Snippet conceitual — flipperzero-firmware/lib/subghz/devices/cc1101_int
// Configuração típica para 433.92 MHz OOK assíncrono:
static const uint8_t cc1101_async_ook_433_92[] = {
    CC1101_IOCFG0,   0x0D,  // GDO0 = serial data output
    CC1101_FIFOTHR,  0x47,
    CC1101_PKTCTRL0, 0x32,  // async serial, infinite packet length
    CC1101_FREQ2,    0x10,  // 433.92 MHz
    CC1101_FREQ1,    0xB0,
    CC1101_FREQ0,    0x71,
    CC1101_MDMCFG2,  0x30,  // OOK/ASK
    CC1101_MDMCFG3,  0x32,
    CC1101_MDMCFG4,  0xC7,  // bandwidth 270 kHz
    CC1101_MCSM0,    0x18,  // calibrate when IDLE->RX/TX
    0x00, 0x00,
};`}</CodeBlock>
      </Section>

      <Section title="ST25R3916 — o NFC reader" accent={accent}>
        <p className="text-sm leading-6">
          ST25R3916 (datasheet ST DS12484) é um <strong>NFC frontend completo</strong> a 13.56 MHz com PA
          interno e LDO. Suporta os quatro principais modos NFC e quatro padrões ISO. Não é um chip "Mifare-only"
          como muitos NFC reader baratos (PN532, RC522) — ele tem AAT (Automatic Antenna Tuning) e VHBR.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Padrão', 'Tipo', 'Bitrate típico', 'Casos']}
          rows={[
            ['ISO 14443A', 'NFC-A', '106 / 212 / 424 / 848 kbps', 'Mifare Classic/Plus/DESFire, NTAG, MRTD passport'],
            ['ISO 14443B', 'NFC-B', '106 / 212 / 424 kbps', 'Carteira de identidade FR, alguns documentos'],
            ['JIS X 6319-4', 'NFC-F (FeliCa)', '212 / 424 kbps', 'Suica, Pasmo (Japão), Octopus (HK)'],
            ['ISO 15693', 'NFC-V (Vicinity)', '6.6 / 26.5 kbps', 'Tags HF de longo alcance, biblioteca, pet ID'],
            ['ISO 18092', 'NFC-P2P', 'até 424 kbps', 'Active P2P (legacy Android Beam)'],
          ]}
        />
        <Callout tone="info" icon="📶">
          Capacidade que o Flipper expõe: <strong>Reader (initiator)</strong> em todos os padrões;
          <strong> Card emulation</strong> limitada a NFC-A (UID + APDU básico); <strong>P2P</strong> não
          implementado em firmware comunitário. Mfkey32 ataca Crypto1 do Mifare Classic — explicado em módulo
          futuro.
        </Callout>
      </Section>

      <Section title="LF 125 kHz — RFID antigo" accent={accent}>
        <p className="text-sm leading-6">
          O Flipper não tem chip dedicado para 125 kHz como o Proxmark — usa frontend analógico discreto
          (oscilador, demodulador) ligado a GPIO do M4. Isso basta para os protocolos legados, todos com
          codificação Manchester sobre carrier 125 kHz e baud-rates baixos.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Protocolo', 'Bits', 'Aplicação', 'Segurança']}
          rows={[
            ['EM4100 / EM4102', '64 bits (40 ID)', 'Catraca de prédio, controle de gado', 'Nenhuma — read-only UID'],
            ['HID Prox (H10301)', '26 bits', 'Crachás corporativos legacy nos EUA', 'Nenhuma — texto claro'],
            ['Indala', '26/27/64 bits', 'Acesso físico legacy', 'Nenhuma'],
            ['T5577', 'Programável', 'Tag emulação (escreve EM/HID/Indala)', 'Nenhuma — exposta a write attacks'],
          ]}
        />
        <Callout tone="warn" icon="🪪">
          125 kHz é literalmente texto claro modulado em Manchester. Continua massivamente deployado em prédios
          e indústrias por inércia (sistemas dos anos 90/2000). Substitutos modernos: HID iCLASS SE, Mifare
          DESFire EV3 (HF, criptografia AES).
        </Callout>
      </Section>

      <Section title="Subsistemas adicionais" accent={accent}>
        <StackFlow
          title="Stack físico — do app ao mundo real"
          accent={accent}
          items={[
            { icon: '🖥️', label: 'Flipper App (FAP)', sub: 'C / FreeRTOS task', detail: 'Lógica do usuário, rodando em CPU1', connector: '↓' },
            { icon: '🧰', label: 'Furi (HAL framework)', sub: 'API interna', detail: 'Abstração de timers, GPIO, SPI, I2C, threads', connector: '↓' },
            { icon: '🔧', label: 'STM32 HAL / LL', sub: 'CMSIS', detail: 'Drivers ST oficiais', connector: '↓' },
            { icon: '🪛', label: 'Periféricos hardware', sub: 'SPI/I2C/GPIO/USB', detail: 'CC1101, ST25R3916, BQ27220, ST7567, USB-C PHY', connector: '↓' },
            { icon: '📡', label: 'Mundo físico', sub: 'RF, NFC field, IR, 1-Wire', detail: 'Ondas eletromagnéticas e sinais wired' },
          ]}
        />
        <KeyValue
          accent={accent}
          items={[
            { k: 'iButton', v: 'Pino dedicado, pull-up 1.5 kΩ — protocolo 1-Wire Dallas implementado em software (timing crítico)' },
            { k: 'IR TX', v: 'LED 940 nm driven por transistor + GPIO PWM ~38 kHz (NEC) / 56 kHz (alguns Sony)' },
            { k: 'IR RX', v: 'Demodulador IR receiver (TSOP38xxx-like) — saída digital já com carrier removido' },
            { k: 'Display', v: 'ST7567 mono LCD 128×64, SPI 4-wire, sem backlight default (reflexivo)' },
            { k: 'Bateria', v: 'LiPo 2100 mAh + IC fuel gauge BQ27220 (I²C) + charger BQ25896' },
            { k: 'GPIO header', v: '18 pinos — 3.3 V lógica, pino 1 = 5 V switchable, pino 8 = 3.3 V always-on' },
          ]}
        />
      </Section>

      <Section title="Errata e observações de campo" accent={accent}>
        <FlowDiagram
          title="Issues conhecidas e mitigações"
          accent={accent}
          steps={[
            { icon: '🟧', label: 'LCD column dead', desc: 'Batches 2022/início 2023 tinham coluna de pixels mortos no ST7567. RMA pela Flipper Devices' },
            { icon: '📡', label: 'CC1101 spurs ~13 MHz', desc: 'Harmônicos do clock interno apareciam em algumas placas; mitigado em rev. PCB posteriores' },
            { icon: '🔋', label: 'Battery gauge drift', desc: 'BQ27220 perde calibração após many discharge cycles; recalibração via firmware' },
            { icon: '🎙️', label: 'Mic absent', desc: 'Não há microfone — comunidade pediu, hardware atual não suporta. Esperado no Flipper One' },
            { icon: '📶', label: 'Sem 2.4 GHz Wi-Fi', desc: 'BLE sim (CPU2), Wi-Fi 802.11 não. Marauder requer ESP32 board no GPIO' },
          ]}
        />
        <Callout tone="success" icon="📚">
          Documentação canônica: <a className="underline" href="https://docs.flipper.net" target="_blank" rel="noreferrer">docs.flipper.net</a>{' '}
          (oficial), repos <code>flipperdevices/flipperzero-firmware</code> (firmware), <code>flipperdevices/flipperzero-hardware</code>{' '}
          (esquemas KiCad — sim, são públicos). Datasheets: ST RM0434 (STM32WB55), TI SWRS061I (CC1101),
          ST DS12484 (ST25R3916).
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
