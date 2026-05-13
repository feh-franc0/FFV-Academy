import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, Timeline, AnnotatedFormula, StackFlow } from '@/components/article/primitives';

export const metadata = getModuleMetadata('sub-ghz-fundamentos');

const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que OOK (On-Off Keying) é a modulação onipresente em controles de garagem e sensores baratos 433 MHz?',
    options: [
      'Tem maior eficiência espectral que QAM-256',
      'Demodula com diodo + capacitor (envelope detector) — circuito de 5 cents; transmissor é só um oscilador chaveado',
      'É imune a interferência',
      'Suporta modulação OFDM',
    ],
    correct: 1,
    explanation: 'OOK é o caso degenerado de ASK: amplitude vai a zero no bit 0. O receptor pode ser um envelope detector trivial (diodo Schottky + capacitor + resistor de descarga). Transmissor é um oscilador SAW + transistor que liga/desliga. Custa centavos em volume — explica os receptores 433 MHz de US$ 1 no AliExpress. Trade-off: péssima eficiência espectral, sensibilidade a interferência, mas para 1-10 kbps de comando ON/OFF é mais que suficiente.',
  },
  {
    question: 'Diferença prática entre OOK e ASK no Flipper Zero / CC1101?',
    options: [
      'São totalmente diferentes — ASK é digital, OOK é analógico',
      'OOK é caso particular de ASK onde amplitude do "0" é zero. Em ASK genérico, amplitude do "0" é não-zero (ex: 30% da do "1"). No CC1101 ambos compartilham mesma config base; diferença é o nível mínimo do PA',
      'OOK só funciona acima de 1 GHz',
      'ASK é proibido pela ANATEL',
    ],
    correct: 1,
    explanation: 'ASK (Amplitude-Shift Keying) define que a informação está na amplitude. OOK é o caso particular onde amplitude do bit 0 = 0 (totalmente desligado). No CC1101 (datasheet TI SWRS061I), ambas são selecionadas via MDMCFG2.MOD_FORMAT = 0b011, e a diferença prática vem do registro FREND0.PA_POWER que define níveis discretos do PA. Visualmente no analisador são quase idênticos — o que importa é a presença/ausência de carrier.',
  },
  {
    question: 'GFSK (Gaussian FSK) vs 2FSK puro — por que GFSK é usado em Z-Wave, BLE e em controles modernos?',
    options: [
      'GFSK é mais rápido',
      'GFSK aplica filtro Gaussiano nos bits ANTES da modulação, suavizando transições — reduz lóbulos espectrais laterais (sidebands), economizando espectro e satisfazendo limites EIRP de FCC/ANATEL',
      'GFSK consome menos energia',
      'GFSK é mais imune a Doppler',
    ],
    correct: 1,
    explanation: 'GFSK aplica filtro Gaussiano com BT (bandwidth-time product) típico 0.3 ou 0.5 ao stream de bits antes do shift de frequência. Isso suaviza transições abruptas, reduz energia em sidebands, e o sinal cabe em canais mais estreitos. Z-Wave (BT=0.3), BLE (BT=0.5), Bluetooth Classic (BT=0.5). Trade-off: ISI (intersymbol interference) leve, recuperável no demodulador. Sem GFSK os mesmos protocolos não passariam em testes de máscara espectral regulatórios.',
  },
  {
    question: 'No CC1101 do Flipper, "modo assíncrono" significa o quê concretamente?',
    options: [
      'O rádio funciona sem clock',
      'O firmware desativa o packet engine HW (sync word, length field, CRC, FEC do CC1101) e lê o demodulador raw via GPIO GDO0; o MCU faz o decode no software, permitindo protocolos arbitrários',
      'TX e RX simultâneos',
      'Comunicação só via UART',
    ],
    correct: 1,
    explanation: 'No "synchronous serial mode" (assíncrono na nomenclatura comunitária), o CC1101 expõe os bits demodulados raw em GDO0 sem qualquer processamento de packet engine. O MCU amostra GDO0 com timer + DMA (ou GPIO interrupt) para extrair edges. Vantagem: protocolos legados arbitrários (PT2262, EV1527, Princeton, CAME — nenhum usa sync word fixo do CC1101) funcionam. Desvantagem: CPU paga overhead de decode, e SNR sofre porque você não usa o correlator HW.',
  },
  {
    question: 'Bandas ISM principais Sub-GHz e seus continentes principais?',
    options: [
      '300 MHz Brasil, 800 MHz Europa, 1 GHz EUA',
      '315 MHz (legado Ásia/EUA), 433.92 MHz (Europa, Brasil, América Latina), 868 MHz (Europa SRD), 915 MHz (EUA / IoT LoRa US-915)',
      'Tudo igual no mundo todo',
      '433 MHz é só EUA',
    ],
    correct: 1,
    explanation: 'Bandas ISM Sub-GHz por região (CEPT/ITU): 315 MHz é legado, ainda em remotes asiáticos baratos; 433.05–434.79 MHz é a banda SRD europeia (também usada no Brasil, América Latina, parte da Ásia) — daí controles de garagem; 863–870 MHz é SRD europeu adicional; 902–928 MHz é ISM nas Américas (FCC Part 15) — daí LoRa US-915, e ZigBee 900 MHz. EUA legados também usam 315 MHz em key fobs antigos.',
  },
  {
    question: 'No formato .sub do Flipper, qual a diferença entre arquivo "RAW" e "decodificado por protocolo"?',
    options: [
      'Não há diferença, só nome',
      'RAW armazena durations alternantes ON/OFF (em microsegundos) bit-exact mas sem semântica — replay funciona; decodificado armazena o nome do protocolo (ex: "Princeton"), o key/code parseado e parâmetros (te, repeat) — replay limpo e edição possível',
      'RAW é menor; decodificado maior',
      'RAW só funciona em 868 MHz',
    ],
    correct: 1,
    explanation: 'Inspecionando arquivos .sub: RAW tem header "Protocol: RAW" e linhas RAW_Data com sequência de durações em µs (positivo=ON, negativo=OFF). Bit-perfect, replay funciona, mas não há semântica. Decodificado tem "Protocol: Princeton" (ou EV1527, CAME, etc.) e campos como Bit, Key, TE — Flipper reconstrói a forma de onda na hora do replay. Decodificado permite edição (mudar Key) e brute-force semântico; RAW só replay.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="sub-ghz-fundamentos"
      title="Sub-GHz: OOK, ASK, FSK — modulação digital sobre rádio"
      icon="📡"
      xp={60}
      readTime={11}
      trailName="Flipper Zero & Hardware Hacking"
      trailColor={accent}
      nextSlug="sub-ghz-protocolos-fixos"
      nextTitle="Protocolos fixos"
      quiz={quiz}
    >
      <Section title="Como bits viram ondas" accent={accent}>
        <p className="text-sm leading-6">
          Rádio digital é simples no conceito: você pega uma <strong>portadora</strong> (onda senoidal pura
          numa frequência) e <strong>modula</strong> alguma de suas três propriedades — amplitude, frequência
          ou fase — para codificar bits. No Sub-GHz comercial, 99% dos casos usam <strong>amplitude</strong>{' '}
          (OOK/ASK) ou <strong>frequência</strong> (FSK/GFSK). Modulação de fase (PSK, QAM) fica para
          backbones celulares, satélite, Wi-Fi.
        </p>
        <AnnotatedFormula
          title="Portadora de RF"
          formula="s(t) = A·cos(2π·fc·t + φ)"
          accent={accent}
          parts={[
            { text: 's(t)', annotation: 'sinal transmitido no tempo' },
            { text: '=' },
            { text: 'A', annotation: 'amplitude — modulada em ASK/OOK', highlight: true },
            { text: '·cos(2π·' },
            { text: 'fc', annotation: 'frequência da portadora — modulada em FSK', highlight: true },
            { text: '·t + ' },
            { text: 'φ', annotation: 'fase — modulada em PSK', highlight: true },
            { text: ')' },
          ]}
        />
        <Callout tone="info" icon="📐">
          Modulação digital escolhe quais dessas variáveis carregam bits. OOK liga/desliga A. FSK alterna fc.
          GFSK suaviza a transição de fc. Não há mágica — só engenharia analógica em cima da senoide perfeita.
        </Callout>
      </Section>

      <Section title="OOK — On-Off Keying" accent={accent}>
        <p className="text-sm leading-6">
          A modulação mais simples possível. Bit 1 = portadora ligada (potência total). Bit 0 = portadora
          desligada (zero). Visualmente:
        </p>
        <CodeBlock lang="text">{`bit:    1     0     1     1     0     0     1
        ___         ___   ___               ___
TX:    |   |  __  |   | |   |  __    __   |   |
       |   |     ||   | |   |     | |     |   |
   ____|   |_____||   |_|   |_____|_|_____|   |__
        ↑    ↑
     carrier carrier
       on     off`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Bit-rate típico', v: '1 – 10 kbps (controles de garagem, sensores domésticos)' },
            { k: 'Demodulador', v: 'Envelope detector — diodo + cap + resistor de descarga' },
            { k: 'Custo BOM TX', v: 'Oscilador SAW (~US$ 0.30) + transistor switch + antena trace' },
            { k: 'Vulnerabilidade espectral', v: 'Energia espalhada (transição abrupta) — sidebands largas' },
            { k: 'Imunidade a ruído', v: 'Baixa — qualquer pulso de ruído pode ser interpretado como "1"' },
            { k: 'Flipper suporta?', v: 'Sim — modo padrão para 433 MHz controles' },
          ]}
        />
      </Section>

      <Section title="ASK genérico vs OOK" accent={accent}>
        <p className="text-sm leading-6">
          ASK (Amplitude-Shift Keying) generaliza: a amplitude alterna entre dois (ou mais) níveis não-zero.
          OOK é o caso degenerado onde o nível baixo é zero. Visualmente são quase indistinguíveis no Flipper
          analyzer; a diferença está no transmissor.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Característica', 'OOK', 'ASK (não-OOK)']}
          rows={[
            ['Bit 0', 'Carrier OFF (P = 0)', 'Carrier em nível baixo (ex: P/3)'],
            ['Bit 1', 'Carrier ON (P = max)', 'Carrier em nível alto (P = max)'],
            ['Eficiência DC', 'Maior — TX desligado em "0"', 'Menor — TX sempre ligado'],
            ['Detectabilidade', 'Mais fácil (gap claro)', 'Requer threshold mais preciso'],
            ['Imunidade a interferência', 'Pior — sem carrier não há referência', 'Melhor — receiver mantém AGC travado'],
            ['Casos típicos', 'Controles RF baratos, sensores 433 MHz', 'Telemetria mais robusta, alguns RKE legados'],
          ]}
        />
      </Section>

      <Section title="FSK / 2FSK / GFSK — frequência carrega o bit" accent={accent}>
        <p className="text-sm leading-6">
          Em FSK a portadora muda entre duas frequências discretas, próximas: f1 para bit 0, f2 para bit 1.
          A diferença <code>Δf = |f2 − f1|</code> chama-se <strong>frequency deviation</strong>. Demodulador
          típico: discriminador FM ou correlator de matched filter.
        </p>
        <FlowDiagram
          title="Espectro de 2FSK vs GFSK"
          accent={accent}
          steps={[
            { icon: '📈', label: '2FSK puro', desc: 'Transição de bit muda f instantaneamente — energia em sidebands largas, lóbulos pronunciados' },
            { icon: '🌊', label: 'Filtro Gaussiano', desc: 'Aplicado ao stream de bits antes do shift de f. Suaviza transição. BT (bandwidth-time) típico 0.3 (Z-Wave) ou 0.5 (BLE)' },
            { icon: '📉', label: 'GFSK resultante', desc: 'Lóbulos laterais drasticamente reduzidos. Sinal cabe em canal mais estreito, satisfaz máscara FCC/ANATEL' },
          ]}
        />
        <KeyValue
          accent={accent}
          items={[
            { k: '2FSK', v: 'Dois tons. Bit-rate até centenas de kbps. Usado em telemetria genérica, alguns sensores industriais' },
            { k: '4FSK', v: 'Quatro tons → 2 bits/símbolo, dobra throughput. CC1101 suporta em HW; Flipper não usa' },
            { k: 'GFSK', v: '2FSK + filtro Gaussian. Padrão Z-Wave (915/868 MHz) e BLE (2.4 GHz)' },
            { k: 'MSK', v: 'Caso especial de GFSK com modulation index = 0.5. Eficiência espectral máxima da família. Usado em GSM' },
          ]}
        />
        <Callout tone="info" icon="🌐">
          BLE é GFSK 1 Mbps com BT=0.5 e modulation index ~0.5 (próximo de MSK). Z-Wave é GFSK ~40 kbps com
          BT=0.3. Esses parâmetros vivem em datasheets/specs públicas (Bluetooth Core Spec 5.4, Z-Wave Plus
          Application Framework).
        </Callout>
      </Section>

      <Section title="Bandas ISM Sub-GHz e regulação regional" accent={accent}>
        <p className="text-sm leading-6">
          ISM = Industrial, Scientific, Medical. São bandas onde regulador permite uso "license-exempt"
          dentro de limites de potência e duty-cycle. <strong>Não significa "free for all"</strong> — significa
          regulado por radiação restrita.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Banda', 'Região principal', 'Limite EIRP típico', 'Uso']}
          rows={[
            ['315 MHz', 'EUA legado, Ásia', 'FCC Part 15.231 — duty-cycle restrito', 'Key fobs automotivos antigos, controles legados'],
            ['433.05 – 434.79 MHz', 'Europa, Brasil, América Latina, parte da Ásia', '10 mW EIRP (BR — Resolução 680/2017 ANATEL)', 'Controles de garagem, sensores meteorológicos, alarmes residenciais'],
            ['863 – 870 MHz', 'Europa (SRD)', '25 mW EIRP (sub-banda comum)', 'Z-Wave EU, KNX RF, sensores industriais'],
            ['902 – 928 MHz', 'EUA / Américas (FCC ISM)', 'até 1 W EIRP em FHSS/DSSS', 'LoRa US-915, ZigBee 900, telemetria industrial'],
          ]}
        />
        <Timeline
          title="Marcos da regulação Sub-GHz no Brasil"
          accent={accent}
          events={[
            { when: '2008', label: 'Resolução 506 ANATEL', detail: 'Define inicialmente limites de Radiação Restrita' },
            { when: '2017', label: 'Resolução 680 ANATEL', detail: 'Atualiza limites — 433 MHz mantido em 10 mW EIRP', highlight: true },
            { when: '2019', label: 'Resolução 715 ANATEL', detail: 'Procedimento de avaliação de conformidade e homologação' },
            { when: '2024+', label: 'Discussões IoT 900 MHz', detail: 'ANATEL avalia ampliação de uso para LoRa e LPWAN no Brasil' },
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          CC1101 do Flipper transmite até <strong>+12 dBm (15.8 mW)</strong>. Com antena de 1 dBi de ganho,
          EIRP ≈ 13 dBm = 20 mW — já dobro do limite ANATEL para 433 MHz. Em pentest, mesmo legítimo, é
          irregular do ponto de vista RF se TX intencional na faixa. Use TX só em laboratório (gaiola de
          Faraday ideal) ou apenas RX.
        </Callout>
      </Section>

      <Section title="O modo assíncrono do CC1101 no Flipper" accent={accent}>
        <p className="text-sm leading-6">
          O CC1101 é um chip cheio de features: packet engine HW com sync word, length field, CRC-16/CCITT,
          FEC convolucional, whitening. Por que o Flipper ignora tudo isso e opera em modo assíncrono?
          Porque os <strong>protocolos-alvo não usam essa estrutura</strong> — controles de garagem PT2262,
          sensores EV1527, CAME, NICE FLO foram projetados nos anos 80/90 para receivers analógicos.
        </p>
        <StackFlow
          title="Caminho do bit no Flipper Sub-GHz RX"
          accent={accent}
          items={[
            { icon: '📡', label: 'Antena 433 MHz', sub: 'whip ou helical', detail: 'Recebe sinal RF (~−80 dBm típico)', connector: '↓' },
            { icon: '🔁', label: 'Front-end CC1101', sub: 'LNA + mixer', detail: 'Amplifica e desce para IF', connector: '↓' },
            { icon: '🎚️', label: 'Demodulador', sub: 'OOK/ASK envelope', detail: 'Extrai amplitude → bit raw', connector: '↓' },
            { icon: '📍', label: 'GDO0 (GPIO)', sub: '0/1 lógico', detail: 'Bit raw exposto para o MCU', connector: '↓' },
            { icon: '⏱️', label: 'STM32 timer + DMA', sub: 'edge capture', detail: 'Mede durações entre bordas em µs', connector: '↓' },
            { icon: '🧠', label: 'Decoder em SW', sub: 'C / FreeRTOS', detail: 'Tenta inferir protocolo (PT2262, EV1527, CAME...)', connector: '↓' },
            { icon: '💾', label: 'Arquivo .sub', sub: 'protocol ou RAW', detail: 'Salvo no SD card' },
          ]}
        />
      </Section>

      <Section title="Formato .sub — RAW vs decodificado" accent={accent}>
        <CodeBlock lang="text">{`# Exemplo 1 — formato decodificado (Princeton)
Filetype: Flipper SubGhz Key File
Version: 1
Frequency: 433920000
Preset: FuriHalSubGhzPresetOok650Async
Protocol: Princeton
Bit: 24
Key: 00 00 00 00 00 AA BB CC
TE: 400
Repeat: 5

# Exemplo 2 — formato RAW (sem semântica)
Filetype: Flipper SubGhz RAW File
Version: 1
Frequency: 433920000
Preset: FuriHalSubGhzPresetOok650Async
Protocol: RAW
RAW_Data: 412 -388 408 -392 412 -388 1228 -388 412 ...
RAW_Data: ... -10000 412 -388 408 -392 ...`}</CodeBlock>
        <p className="text-sm leading-6">
          RAW armazena durações alternantes (positivo = portadora ligada, negativo = desligada) em
          microsegundos. Bit-perfect: replay reproduz a onda exatamente. Decodificado armazena
          <code>Protocol</code>, <code>Key</code>, <code>TE</code> (timing element base) — Flipper
          reconstrói a onda no replay. Decodificado permite edição (mudar Key, brute-force semântico).
          Quando o decoder não reconhece o protocolo, fica RAW.
        </p>
        <Callout tone="info" icon="🔬">
          Ferramenta complementar: <strong>antirez/protoview</strong> (Salvatore Sanfilippo, criador do Redis)
          — FAP que decodifica visualmente sinais Sub-GHz no LCD do Flipper, mostrando bits e tentando
          identificar protocolo. Excelente para entender protocolos novos antes de adicionar driver no
          firmware.
        </Callout>
      </Section>

      <Section title="Limites práticos e o que vem depois" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Limitação do Flipper Sub-GHz', 'Por quê', 'Workaround']}
          rows={[
            ['Não captura espectro contínuo', 'Sem ADC de RF — CC1101 é narrow-band', 'HackRF One ou RTL-SDR para análise espectral'],
            ['Bandwidth máximo ~812 kHz', 'Limite do CC1101', 'HackRF (até 20 MHz IQ)'],
            ['Sem DSP em FPGA', 'CPU é Cortex-M4 64 MHz', 'GNU Radio em PC com SDR'],
            ['Modo assíncrono = 1 protocolo por vez', 'Decoder em SW, single-thread', 'Protoview FAP para visual debug'],
            ['Sem packet engine HW', 'Trade-off de design para flexibilidade', 'Use modo síncrono manualmente em FAP custom (raro)'],
          ]}
        />
        <Callout tone="success" icon="🎓">
          Próxima aula: <strong>protocolos de código fixo</strong> — PT2262, EV1527, CAME, NICE FLO, Princeton.
          Vamos abrir cada um, entender por que são quebrados (replay puro funciona), e contrastar com
          rolling code (KeeLoq, Hitag-AES) que esses controles deveriam ter sido desde o começo.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
