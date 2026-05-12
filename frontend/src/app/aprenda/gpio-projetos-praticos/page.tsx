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
  MindMap,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('gpio-projetos-praticos');
const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'O que acontece se você conectar 5V diretamente em um pino de dado GPIO do Flipper Zero?',
    options: [
      'Nada — os pinos são 5V tolerantes.',
      'Frita o STM32WB55 (MCU principal) — todos os pinos GPIO de dados são 3.3V, não tolerantes a 5V; conversão de nível obrigatória ou uso do pino +5V apenas no rail apropriado.',
      'O Flipper desliga automaticamente.',
      'Apenas reduz o ganho do receptor RF.',
    ],
    correct: 1,
    explanation:
      'STM32WB55 é 3.3V CMOS sem tolerância a 5V em pinos GPIO de dados. Aplicar 5V causa overstress, latch-up potencial e morte do MCU (irreparável). Use level shifter (TXS0108E, BSS138) ou divisor resistivo para sensores 5V.',
  },
  {
    question: 'Quais pinos formam o barramento I2C externo do Flipper Zero?',
    options: [
      'Pinos 2 (MOSI) e 3 (MISO).',
      'Pinos 15 (PC1/SDA) e 16 (PC0/SCL) — barramento externo, separado do I2C interno usado pelo LCD/charger.',
      'Pinos 13 (TX) e 14 (RX).',
      'Pinos 8 (PWM) e 18 (GND).',
    ],
    correct: 1,
    explanation:
      'I2C externo = SDA pino 15 (PC1) + SCL pino 16 (PC0). É um barramento separado do I2C interno (que serve LCD + charge IC + sensor de bateria). Sensores BME280, MPU6050, OLED SSD1306 plugam aqui.',
  },
  {
    question: 'Por que o pino +5V (Pin 1) vem desligado por default?',
    options: [
      'Para economizar bateria.',
      'Porque o Flipper opera nativamente em 3.3V; o +5V é gerado por boost converter só quando necessário (Settings → GPIO → 5V on GPIO, ou auto ao conectar OTG). Evita drenagem desnecessária.',
      'Por restrição da Receita Federal na importação.',
      'Porque o pino é apenas decorativo.',
    ],
    correct: 1,
    explanation:
      'Boost converter consome bateria mesmo sem carga conectada. Default OFF = bateria preservada. Liga via Settings GPIO ou automaticamente quando o Flipper detecta OTG. Para sensores 5V (HC-SR04 ultrasonic, alguns relés) é necessário ligar manualmente.',
  },
  {
    question: 'Comparando SPI e I2C em termos de fios:',
    options: [
      'SPI usa 1 fio, I2C usa 4.',
      'SPI usa 4 fios (MOSI, MISO, SCK, CS) com clocks de até dezenas de MHz; I2C usa 2 fios (SDA, SCL) com clock típico 100kHz/400kHz/1MHz e endereçamento por device address (multi-slave em 2 fios).',
      'SPI e I2C são idênticos.',
      'I2C exige fonte simétrica ±5V, SPI não.',
    ],
    correct: 1,
    explanation:
      'SPI: full-duplex, mais fios, mais rápido, sem endereçamento (CS por slave). I2C: half-duplex, 2 fios, mais lento, endereçamento embutido (7 ou 10 bits) — escala melhor com muitos slaves no mesmo barramento.',
  },
  {
    question: 'Qual é o limite de corrente seguro no rail 3.3V do Flipper para projetos GPIO?',
    options: [
      'Sem limite — o LDO interno é infinito.',
      'Aproximadamente 200 mA agregados; ~50 mA por pino individual. Cargas maiores exigem MOSFET externo + alimentação separada.',
      '5 amperes contínuos.',
      '10 mA — pino só fornece sinal lógico.',
    ],
    correct: 1,
    explanation:
      'Limite prático do regulador 3.3V interno + heat budget do MCU: ~200 mA. Cada pino source/sink ~25-50 mA pelo datasheet do STM32WB55, mas o agregado importa. Servos, motores, LEDs de potência: usar transistor/MOSFET com fonte externa.',
  },
  {
    question: 'Para que pode ser usada a capacidade do Flipper de funcionar como bridge USB→UART/SPI/I2C?',
    options: [
      'Apenas para carregar o próprio Flipper.',
      'Como Bus Pirate-like: programar microcontrolador externo via SWD/JTAG, ler EEPROM 24Cxx por I2C, fazer dump de SPI flash W25Qxx, sniffar UART de roteador / impressora / IoT, fazer forensics de PCB.',
      'Para emular o LCD do Flipper em outro dispositivo.',
      'Só funciona para sensores ambientais.',
    ],
    correct: 1,
    explanation:
      'O Flipper expõe via USB CDC os barramentos GPIO. Apps comunitários permitem usá-lo como Bus Pirate / FT2232 / CH341A barato — útil em forensics de hardware (dump de flash de roteador, leitura de EEPROM de geladeira, etc).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="gpio-projetos-praticos"
      title="GPIO: I2C, SPI, UART, PWM com sensores e MCUs externos"
      icon="🔌"
      xp={60}
      readTime={11}
      trailName="Flipper Zero & Hardware Hacking"
      trailColor={accent}
      nextSlug="wifi-devboard-marauder"
      nextTitle="WiFi DevBoard: Marauder, Evil Portal e mapeamento RF"
      quiz={quiz}
    >
      <Section title="O Flipper como microcontrolador de bolso" accent={accent}>
        <p className="text-sm leading-7" style={{ color: 'var(--ffv-muted)' }}>
          Sub-GHz, NFC, RFID, IR, BadUSB são os recursos "verticais" do Flipper. Mas a porta GPIO de
          18 pinos (header 2x9 no topo) abre o lado <strong>horizontal</strong>: o Flipper como
          plataforma de prototipagem embarcada. Com I2C, SPI, UART, PWM e ADC expostos, ele troca de
          papel — vira <em>bus pirate</em>, oscilloscope discreto, programador de MCU, weather
          station, controle de robô.
        </p>

        <Callout tone="success" icon="🧰">
          <strong>Mentalidade:</strong> Flipper Zero é um STM32WB55 com display + bateria + UI
          pronta. Tudo o que você faria com um Nucleo + protoboard + LiPo, você pode fazer com o
          Flipper saindo do bolso. A diferença é UX: tela, GUI navegável, file system no SD.
        </Callout>
      </Section>

      <Section title="Mapa do header 2x9: 18 pinos" accent={accent}>
        <ArchFlow
          accent={accent}
          title="GPIO header — visão lado par/ímpar"
          columns={[
            {
              header: 'Lado ímpar (1, 3, 5, ...)',
              headerColor: '#0ea5e9',
              items: [
                'Pin 1: +5V (OFF default — liga via Settings)',
                'Pin 3: PA6 / SPI MISO',
                'Pin 5: PA4 / SPI CS / ADC',
                'Pin 7: PA5 / DAC',
                'Pin 9: +3V3 (sempre ligado)',
                'Pin 11: PB14',
                'Pin 13: PB6 / USART1 TX',
                'Pin 15: PC1 / I2C SDA',
                'Pin 17: PA14 / SWCLK (debug)',
              ],
              footer: 'Lado de alimentações + UART/I2C + debug',
            },
            {
              header: 'Lado par (2, 4, 6, ...)',
              headerColor: '#a855f7',
              items: [
                'Pin 2: PA7 / SPI MOSI / PWM (TIM1)',
                'Pin 4: PB3 / SPI SCK',
                'Pin 6: PC3 / OTG',
                'Pin 8: GND',
                'Pin 10: PB2 / iButton',
                'Pin 12: PC3 (compartilhado)',
                'Pin 14: PB7 / USART1 RX',
                'Pin 16: PC0 / I2C SCL',
                'Pin 18: GND',
              ],
              footer: 'Lado de SPI + GND + iButton + I2C SCL',
            },
          ]}
        />

        <Callout tone="danger" icon="⚡">
          <strong>3.3V tolerância em todos os pinos de dado.</strong> Conectar 5V em PA6/PA7/PB3/etc
          mata o STM32WB55. Para sensores 5V (HC-SR04, alguns ESCs) use level shifter
          (<InlineCode>TXS0108E</InlineCode> bidirecional, <InlineCode>BSS138</InlineCode> mosfet por
          linha) ou divisor resistivo simples (10kΩ + 20kΩ) para entradas. Saídas 3.3V geralmente
          são lidas como HIGH por 5V CMOS; em casos de 5V TTL pode precisar pull-up para 5V.
        </Callout>
      </Section>

      <Section title="Limites elétricos — leia antes de soltar fumaça" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Tensão de I/O', v: '3.3V CMOS estrita. NÃO tolerante a 5V em pinos de dado.' },
            { k: 'Corrente por pino', v: '~25-50 mA (datasheet STM32WB55), idealmente operar abaixo de 20 mA por margem.' },
            { k: 'Corrente agregada 3.3V rail', v: '~200 mA total (LDO + heat budget). Acima → desliga ou esquenta.' },
            { k: '+5V rail (Pin 1)', v: 'OFF default. Boost converter ~500 mA quando ligado. OK para HC-SR04, alguns relés.' },
            { k: 'Pull-ups internos', v: 'Sim — configuráveis por pino via FuriHal. Útil em I2C onboard se sensor não tem.' },
            { k: 'ADC', v: '12 bits, ref 3.3V. Pinos PA4, PA6, PA7. Resolução ~0.8 mV.' },
            { k: 'PWM', v: 'TIM1, TIM2 acessíveis. Pin 2 (PA7) e Pin 8 contexto. Frequência ajustável até dezenas de kHz.' },
            { k: 'Proteção ESD', v: 'Mínima — toque humano descarrega antes de plugar. Use pulseira ESD em desenvolvimento.' },
          ]}
        />
      </Section>

      <Section title="Os 4 protocolos seriais — quando usar cada um" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Protocolo', '# fios', 'Clock', 'Topologia', 'Velocidade típica', 'Uso']}
          rows={[
            ['UART', '2 (TX, RX)', 'sem clock, baud rate combinado', 'ponto a ponto', '9600 - 921600 bps', 'Console, GPS, modems, debug'],
            ['SPI', '4 (MOSI, MISO, SCK, CS)', 'master fornece SCK, full-duplex', 'master + N slaves (1 CS por slave)', '1-50 MHz', 'Displays, flash, ADCs rápidos, NRF24'],
            ['I2C', '2 (SDA, SCL)', 'master fornece SCL, half-duplex', 'multi-master, multi-slave por endereço (7/10 bits)', '100k / 400k / 1M / 3.4M Hz', 'Sensores ambientais, EEPROMs, RTCs'],
            ['1-Wire', '1 (DQ + GND)', 'timing-based pelo master', 'master + N slaves por ROM ID', '~16 kbps standard', 'iButton, DS18B20, DHT22-like'],
          ]}
        />

        <DecisionBox
          scenario="Tenho um sensor novo. Que protocolo escolher?"
          winner="I2C — se o sensor oferece"
          winnerColor={accent}
          why="2 fios, multi-slave, endereçamento embutido, bibliotecas universais (BME280, MPU6050, SSD1306, MAX30102 — todos I2C). Velocidade adequada para sensores ambientais. SDK do Flipper tem furi_hal_i2c pronto."
          alternatives={[
            { name: 'SPI', when: 'Sensor de alta velocidade (acelerômetro 1kHz+, ADC rápido, flash chip), ou displays grandes (TFT). Full-duplex, sem overhead de endereço.' },
            { name: 'UART', when: 'GPS, módulos LoRa (ex: SX1276 com AT commands), módulos GSM, console serial de roteador para sniffing.' },
            { name: '1-Wire', when: 'DS18B20 termômetro (clássico), DHT22 (variante 1-Wire-like), comunicação muito longa em 1 fio (1-Wire chega a 100m).' },
          ]}
        />
      </Section>

      <Section title="Hello World I2C: BME280 (pressão + temp + umidade)" accent={accent}>
        <FlowDiagram
          accent={accent}
          title="Workflow leitura BME280 via I2C"
          orientation="vertical"
          steps={[
            { icon: '🔌', label: 'Wiring', desc: 'BME280 VCC → Flipper Pin 9 (+3V3); GND → Pin 8 (GND); SCL → Pin 16; SDA → Pin 15' },
            { icon: '🪪', label: 'Detect address', desc: 'BME280 = 0x76 ou 0x77 (config por SDO pin). I2C scanner do Flipper confirma.' },
            { icon: '⚙️', label: 'Init: write CTRL_HUM, CTRL_MEAS, CONFIG', desc: 'oversampling x16 + filter + standby' },
            { icon: '⏳', label: 'Wait conversion (~10ms)', desc: 'BME280 amostra ADC interno' },
            { icon: '📥', label: 'Read 8 bytes from 0xF7', desc: 'pressure_msb..lsb..xlsb, temp_msb..lsb..xlsb, hum_msb..lsb' },
            { icon: '🧮', label: 'Apply compensation', desc: 'fórmulas do datasheet com calibração da NVM (ler 0x88-0xA1, 0xE1-0xE7)' },
            { icon: '📺', label: 'Render no LCD', desc: 'P=1013 hPa, T=24.1°C, H=58%' },
          ]}
        />

        <CodeBlock lang="c" filename="bme280_app.c (Flipper SDK)">
{`#include <furi.h>
#include <furi_hal_i2c.h>
#include <gui/gui.h>

#define BME280_ADDR  (0x76 << 1)  // I2C 8-bit form
#define REG_ID       0xD0
#define REG_CTRL_HUM 0xF2
#define REG_CTRL_MEAS 0xF4
#define REG_CONFIG   0xF5
#define REG_DATA     0xF7

static bool bme280_read(uint8_t reg, uint8_t* buf, size_t len) {
    furi_hal_i2c_acquire(&furi_hal_i2c_handle_external);
    bool ok = furi_hal_i2c_trx(
        &furi_hal_i2c_handle_external,
        BME280_ADDR,
        &reg, 1,
        buf, len,
        50  // timeout ms
    );
    furi_hal_i2c_release(&furi_hal_i2c_handle_external);
    return ok;
}

static bool bme280_write(uint8_t reg, uint8_t val) {
    uint8_t tx[2] = {reg, val};
    furi_hal_i2c_acquire(&furi_hal_i2c_handle_external);
    bool ok = furi_hal_i2c_tx(
        &furi_hal_i2c_handle_external,
        BME280_ADDR,
        tx, 2,
        50
    );
    furi_hal_i2c_release(&furi_hal_i2c_handle_external);
    return ok;
}

int32_t bme280_app_main(void* p) {
    UNUSED(p);
    uint8_t id = 0;
    bme280_read(REG_ID, &id, 1);
    if(id != 0x60) {
        FURI_LOG_E("BME280", "Wrong chip ID: 0x%02X", id);
        return -1;
    }
    bme280_write(REG_CTRL_HUM, 0x05);   // hum oversampling x16
    bme280_write(REG_CTRL_MEAS, 0xB7);  // temp x16, press x16, normal mode
    bme280_write(REG_CONFIG, 0xA0);     // standby 1000ms, filter x16

    while(1) {
        uint8_t data[8];
        if(bme280_read(REG_DATA, data, 8)) {
            int32_t adc_p = (data[0] << 12) | (data[1] << 4) | (data[2] >> 4);
            int32_t adc_t = (data[3] << 12) | (data[4] << 4) | (data[5] >> 4);
            int32_t adc_h = (data[6] << 8) | data[7];
            // ... aplicar compensação do datasheet (omitido aqui) ...
            FURI_LOG_I("BME280", "P_raw=%ld T_raw=%ld H_raw=%ld",
                       (long)adc_p, (long)adc_t, (long)adc_h);
        }
        furi_delay_ms(1000);
    }
    return 0;
}`}
        </CodeBlock>
      </Section>

      <Section title="SPI: NRF24 e dump de flash chips" accent={accent}>
        <p className="text-sm leading-7" style={{ color: 'var(--ffv-muted)' }}>
          SPI no Flipper é especialmente útil para dois cenários populares: <strong>NRF24L01+</strong>{' '}
          (transceiver 2.4 GHz para mouse/teclado wireless da Logitech, sniffing de protocolos
          proprietários — base do app <em>NRF Sniff</em>) e <strong>flash chips W25Qxx</strong>{' '}
          (dump de firmware de roteador, cofre, brinquedo, embedded device — forensics de PCB).
        </p>

        <StackFlow
          accent={accent}
          title="Forensics de PCB com Flipper como SPI master"
          items={[
            { icon: '🔧', label: 'Identifique o chip alvo no PCB', sub: 'SOIC-8 ou similar, marca W25Q32 / 25L80 / SST25VFxxx', color: accent },
            { icon: '📎', label: 'SOIC clip ou dessolda', sub: 'clip permite ler em circuito (com cuidado de não energizar o resto)', connector: '↓' },
            { icon: '🔌', label: 'Ligue ao header GPIO', sub: 'CS=Pin5, MOSI=Pin2, MISO=Pin3, SCK=Pin4, GND, +3V3', connector: '↓' },
            { icon: '💻', label: 'App SPIMem do Flipper / qFlipper CLI', sub: 'comando READ_ID → confirma chip; READ 0x000000 size 4MB → dump.bin', connector: '↓' },
            { icon: '🔬', label: 'Análise', sub: 'binwalk para identificar headers (uImage, squashfs, JFFS2); strings; emulação no QEMU' },
          ]}
        />

        <Callout tone="warn" icon="⚠️">
          Forensics de hardware exige conhecimento de eletrônica e ética. <em>Em circuito</em>:
          desligue o board alvo (algumas implementações alimentam o flash chip via outras linhas).
          Hardware do cliente: contrato + RoE explícito. Hardware próprio (seu roteador, seu IoT
          aposentado): vai fundo, é como você aprende.
        </Callout>
      </Section>

      <Section title="UART: console de roteador, GPS, módulos AT" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Pinos', v: 'Pin 13 (TX do Flipper) → RX do alvo; Pin 14 (RX do Flipper) ← TX do alvo; GND comum.' },
            { k: 'Baud rates típicos', v: 'Roteadores: 115200; GPS NMEA: 9600 ou 38400; módulos AT (SIM800/SIM7600): 9600/115200; debug embutido: tentar 9600/38400/57600/115200.' },
            { k: 'Aplicação Flipper', v: 'Apps → GPIO → USB-UART Bridge: expõe via USB CDC para você usar minicom/screen/PuTTY/picocom no PC.' },
            { k: 'Caso clássico', v: 'Você abre um roteador antigo, encontra header de 4 pinos não populado: TX, RX, GND, VCC. Liga Flipper como sniffer; vê uboot bootlog; pressiona Enter durante boot → root shell.' },
            { k: 'Cuidado de níveis', v: 'Roteadores embedded geralmente UART em 3.3V — OK direto. Equipamento industrial pode ser 5V ou RS-232 (±12V) — RS-232 destrói o Flipper sem MAX232.' },
          ]}
        />

        <CodeBlock lang="bash">
{`# No PC, com Flipper plugado em modo USB-UART Bridge:
$ ls /dev/tty.usb*       # macOS
/dev/tty.usbmodemflip_AABBCC2

$ picocom -b 115200 /dev/tty.usbmodemflip_AABBCC2
[boot] U-Boot 1.1.4 (Apr 12 2018 - 10:23:11)
[boot] Hit any key to stop autoboot:  0
ar9344> printenv
bootargs=console=ttyS0,115200 board=AP135 ...
ar9344> setenv bootargs "init=/bin/sh \\$bootargs"
ar9344> boot
# / sh
# id
uid=0(root) gid=0(root)`}
        </CodeBlock>
      </Section>

      <Section title="PWM, ADC e projetos rápidos" accent={accent}>
        <ArchFlow
          accent={accent}
          title="Capacidades extras do header GPIO"
          columns={[
            {
              header: 'PWM',
              headerColor: '#f59e0b',
              items: ['Pin 2 (PA7) via TIM1', 'Frequência: dezenas de Hz a kHz', 'Duty cycle 0-100% configurável'],
              footer: 'Servos hobby (50 Hz pulse 1-2ms), dimmer LED, buzzer, gerador de tom',
            },
            {
              header: 'ADC',
              headerColor: '#0ea5e9',
              items: ['12 bits, ref 3.3V (resolução ~0.8 mV)', 'Pinos PA4 (Pin 5), PA6 (Pin 3), PA7 (Pin 2)', 'Sample rate suficiente para sensores'],
              footer: 'Joystick analógico, sensor de luz LDR, potenciômetro, microfone amplificado',
            },
            {
              header: '1-Wire externo',
              headerColor: accent,
              items: ['Pin 10 (PB2) — barramento iButton', 'Pode hostear DS18B20 (térmometro)', 'DHT22 com biblioteca UniTemp'],
              footer: 'Reaproveitar pino do iButton para sensores',
            },
          ]}
        />

        <NodeGraph
          accent={accent}
          title="Projetos GPIO por nível"
          legend="Do iniciante ao avançado — todos plug-and-play"
          columns={[
            {
              label: 'Iniciante',
              nodes: [
                { icon: '📏', label: 'HC-SR04 ultrasonic', sub: 'medir distância, app Distance Sensor' },
                { icon: '🌡️', label: 'DS18B20 termômetro', sub: 'app UniTemp em 1-Wire' },
                { icon: '💡', label: 'LEDs externos via PWM', sub: 'fade in/out controlado' },
              ],
            },
            {
              label: 'Intermediário',
              nodes: [
                { icon: '🌦️', label: 'BME280 weather station', sub: 'P+T+H em I2C, log no SD' },
                { icon: '🎛️', label: 'OLED SSD1306', sub: 'display secundário em I2C' },
                { icon: '🕹️', label: 'MPU6050 IMU', sub: 'accel + gyro 6 eixos via I2C' },
                { icon: '📻', label: 'NRF24 Sniffer', sub: 'mouse/teclado wireless 2.4 GHz' },
              ],
            },
            {
              label: 'Avançado',
              nodes: [
                { icon: '🔬', label: 'Bridge SWD/JTAG', sub: 'flashar firmware em alvo via STM32 Bus Pirate-like', tone: 'emphasis' },
                { icon: '💾', label: 'Dump SPI flash W25Qxx', sub: 'forensics de IoT/roteador', tone: 'emphasis' },
                { icon: '🤖', label: 'Robô diferencial', sub: 'PWM 2 motores DC + ponte H L298N' },
                { icon: '🔋', label: 'Logger I2C-EEPROM', sub: 'persistência em 24Cxx externo' },
              ],
            },
          ]}
        />
      </Section>

      <Section title="GPIO como diferencial pedagógico" accent={accent}>
        <Callout tone="success" icon="🎓">
          O header GPIO é o que <strong>transforma o Flipper de "brinquedo de hacking" em
          ferramenta de engenharia embarcada</strong>. Você lê datasheet do BME280, escreve I2C
          driver, encara endianness do compensation algorithm, debugga timing — exatamente o que se
          faz em embedded profissional. A diferença é que aqui você não monta protoboard e cabos
          frágeis: pluga jumper no header, abre app, e tem feedback visual imediato.
        </Callout>

        <Timeline
          accent={accent}
          title="GPIO no Flipper: evolução"
          events={[
            { when: '2020', label: 'Flipper Zero Kickstarter', detail: 'Header 2x9 já no design original — visão de plataforma extensível.' },
            { when: '2022', label: 'Lançamento + SDK público', detail: 'furi_hal_i2c, furi_hal_spi expostos para apps.', highlight: true },
            { when: '2023', label: 'Apps GPIO comunitários', detail: 'NRF24 Sniffer, UniTemp, BME280, Signal Generator.' },
            { when: '2024', label: 'WiFi DevBoard oficial', detail: 'plugar via UART; vira plataforma 2.4 GHz Wi-Fi/Bluetooth completa.', highlight: true },
            { when: '2025+', label: 'Boards third-party', detail: 'Multi Tool board, GPS module, NRF24 board — ecosystem de hardware crescendo.' },
          ]}
        />
      </Section>

      <Section title="Q&A operacional" accent={accent}>
        <QAItem
          q="Posso usar o Flipper como Arduino para um projeto sem display?"
          a={
            <>
              Pode, mas é overkill em custo (Flipper $169 vs ESP32 $5). Faz sentido quando você quer
              o display + bateria + UI navegável + SD card juntos, ou quando o projeto é
              experimental e você não quer um device dedicado. Para "ligar relé via botão", um
              ESP32-C3 cabe melhor.
            </>
          }
        />

        <QAItem
          q="O Flipper aguenta um motor DC pequeno direto no GPIO?"
          a={
            <>
              <strong>NÃO.</strong> Mesmo um motor DC de 6V/100mA gera spikes indutivos que matam
              MOSFETs do MCU. Sempre use ponte H (L298N, DRV8833) com fonte separada para o motor +
              GND comum. O Flipper só fornece sinal de PWM e direção; alimentação do motor vem de
              fora.
            </>
          }
        />

        <QAItem
          q="Como detecto se um pino é input/output flutuante ou está realmente conectado?"
          a={
            <>
              App <strong>GPIO Tester</strong> (third-party) ou simplesmente: configure como input
              com pull-up, leia — se HIGH, está flutuando ou conectado a HIGH; ative pull-down e
              releia — se HIGH ainda, há fonte externa de HIGH; se mudou para LOW, o pino estava
              flutuando. Testes simples com FuriHal_gpio_init + read.
            </>
          }
        />
      </Section>

      <Section title="MindMap final + referências" accent={accent}>
        <MindMap
          accent={accent}
          root="GPIO no Flipper Zero"
          branches={[
            {
              title: 'Camada elétrica',
              items: ['3.3V CMOS estrito', '+5V opcional via boost', '~200 mA agregados', 'Sem tolerância 5V em data pins'],
            },
            {
              title: 'Protocolos seriais',
              items: ['UART — debug, GPS, módulos AT', 'SPI — flash, displays, NRF24', 'I2C — sensores, EEPROMs, OLED', '1-Wire — DS18B20, iButton extra'],
            },
            {
              title: 'Casos de uso',
              items: ['Weather station (BME280)', 'Forensics de PCB (dump flash)', 'Sniffer NRF24 wireless', 'Console UART em router', 'Bus Pirate-like via USB CDC'],
            },
            {
              title: 'Limites',
              items: ['Sem motor direto (use ponte H)', 'Sem 5V em data sem level shifter', 'Sem RS-232 sem MAX232', 'ESD: descarregue antes de plugar'],
            },
          ]}
        />

        <NodeGraph
          accent={accent}
          title="Documentação canônica"
          legend="Os bookmarks que valem"
          columns={[
            {
              label: 'Oficial',
              nodes: [
                { icon: '📘', label: 'docs.flipper.net/zero/gpio-and-modules', sub: 'pinout, limites, exemplos' },
                { icon: '📘', label: 'developer.flipper.net', sub: 'SDK, FuriHal API' },
                { icon: '📕', label: 'STM32WB55 datasheet', sub: 'st.com — limites elétricos detalhados' },
              ],
            },
            {
              label: 'Comunidade',
              nodes: [
                { icon: '🐙', label: 'UberGuidoZ/Flipper GPIO/', sub: 'projetos prontos' },
                { icon: '🐙', label: 'flipperdevices/flipperzero-firmware', sub: 'firmware oficial open-source' },
                { icon: '🐙', label: 'jamisonderek/flipper-zero-tutorials', sub: 'tutoriais GPIO específicos' },
              ],
            },
            {
              label: 'Sensores comuns',
              nodes: [
                { icon: '📗', label: 'Bosch BME280 datasheet', sub: 'compensation algorithm' },
                { icon: '📗', label: 'InvenSense MPU-6050', sub: 'IMU 6-axis' },
                { icon: '📗', label: 'Maxim DS18B20', sub: '1-Wire termômetro' },
              ],
            },
          ]}
        />

        <Callout tone="info" icon="🚀">
          Próximo módulo: o <strong>WiFi DevBoard</strong> oficial — uma extensão que pluga no
          header GPIO e transforma o Flipper numa plataforma 2.4 GHz completa (Wi-Fi
          deauthentication com ESP32 Marauder, Evil Portal, mapeamento RF). Você verá como o GPIO
          não é só sensores: é a <em>base de extensibilidade</em> do Flipper.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
