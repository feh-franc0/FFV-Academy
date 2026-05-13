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
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('lab-pessoal-legal');

const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o RTL-SDR (v3/v4, ~R$200) é 100% legal no Brasil sem homologação ANATEL?',
    options: [
      'Porque foi homologado em 2024',
      'Porque é um receptor (RX-only) genérico baseado em Realtek RTL2832U + sintonizador R820T2/R828D — não transmite. ANATEL homologa equipamentos transmissores; receptores passivos não exigem homologação',
      'Porque é importação informal',
      'Porque é hardware educacional',
    ],
    correct: 1,
    explanation: 'RTL-SDR é receptor genérico (RX-only). A regulação ANATEL (Lei 9.472/97 + Resolução 715/2019) foca em transmissores em frequências regulamentadas — não exige homologação para receptores passivos (escutar é livre). Cobre ~24-1766 MHz com upconverter. Por isso é massivamente usado em educação RF. Diferença crítica vs Flipper/HackRF, que transmitem.',
  },
  {
    question: 'No GNU Radio, qual é o pipeline padrão para receber e decodificar um sinal com RTL-SDR?',
    options: [
      'Antena → SDR → áudio direto',
      'Antena → RTL-SDR → osmocom_source (driver) → filtros (low-pass/decimation) → demodulador (FM/AM/OOK) → decoder de protocolo → sink (audio/file/socket)',
      'Antena → DSP em CPU → resultado',
      'Antena → ASIC dedicado',
    ],
    correct: 1,
    explanation: 'Pipeline GNU Radio canônico: hardware front-end (osmocom_source ou rtlsdr_source) → blocos de DSP (Low Pass Filter, decimation, AGC) → demodulador específico (Quadrature Demod para FM, FM Deemphasis, OOK detector) → decoder de protocolo (sync detect, slice, frame parse) → sink. Tudo em IQ samples float complex. gnuradio-companion (GRC) é o editor visual.',
  },
  {
    question: 'O que torna uma Faraday cage caseira efetiva (atenuação útil) para experimentos de RF?',
    options: [
      'Apenas alumínio em volta',
      '3 camadas de malha de cobre com mesh ≤ 1mm, vedação total das frestas (fita de cobre), aterramento da malha — alvo de atenuação ≥ 60 dB medível por RSSI Wi-Fi/celular dentro vs fora',
      'Forno microondas (já é Faraday)',
      'Plástico ABS preto',
    ],
    correct: 1,
    explanation: 'Eficácia de gaiola de Faraday depende de: (1) condutividade — cobre é o melhor barato; (2) tamanho do mesh ≤ 1/10 do comprimento de onda da menor frequência protegida (1mm cobre até ~30 GHz teórico); (3) ausência de frestas — vedação com fita de cobre; (4) aterramento — drena cargas. Atenuação se mede empiricamente: RSSI Wi-Fi 2.4GHz dentro vs fora deve cair 60+ dB. Forno microondas funciona mas só na frequência específica.',
  },
  {
    question: 'Mesmo dentro de Faraday cage, transmitir em faixa licenciada (celular, polícia) ainda é infração?',
    options: [
      'Não — Faraday isola tudo',
      'Sim — atenuação reduz mas não elimina vazamento; e mais importante, infração ANATEL (Lei 9.472/97) é configurada pelo TX em si; Faraday reduz risco prático mas não imuniza juridicamente',
      'Depende da potência',
      'Apenas se ultrapassar 1 W',
    ],
    correct: 1,
    explanation: 'Faraday caseira atenua tipicamente 40-80 dB — não 100%. Sinal vaza, ainda detectável por receptor próximo. Mais relevante: a infração ANATEL configura-se pelo ato de transmitir em faixa licenciada/regulada SEM autorização — não pela "potência efetiva irradiada para fora da gaiola". Faraday é útil para evitar interferência prática mas não é blindagem jurídica. Lab seguro = receptores passivos + transmissores em ISM com potência abaixo do limite.',
  },
  {
    question: 'Qual a alternativa "softwarezada" e legal mais didática para aprender RF moderno em 2026?',
    options: [
      'Apenas Wireshark',
      'GNU Radio + RTL-SDR — workflow IQ samples → demodulação → decode permite estudar 80% do que o Flipper ensina (Sub-GHz, ADS-B, POCSAG, NOAA APT) sem TX e sem ilegalidade',
      'Apenas Wi-Fi monitor mode',
      'CTFs em browser',
    ],
    correct: 1,
    explanation: 'GNU Radio é framework DSP open-source maduro (gnuradio.org). Combinado com RTL-SDR (RX-only), cobre o aprendizado de: ISM (433/868/915 MHz), ADS-B (1090 MHz tráfego aéreo), POCSAG/FLEX (pagers ainda em uso), NOAA APT (imagens meteorológicas em 137 MHz), AIS (navios). Tudo passivo. Workflow gnuradio-companion ensina DSP de verdade — base sólida que o Flipper esconde por trás de "buttons".',
  },
  {
    question: 'Para um iniciante com R$ 300 disponíveis em 2026, qual combinação de hardware tem o melhor custo-benefício pedagógico?',
    options: [
      'HackRF One usado',
      'RTL-SDR v4 (~R$ 200) + leitor USB ACR122U homologado (~R$ 100 usado) — cobre RF passivo + RFID/NFC ativo legal',
      'Apenas Flipper Zero',
      'Proxmark3 institucional',
    ],
    correct: 1,
    explanation: 'RTL-SDR v4 entrega o lado RF (RX passivo, 24-1766 MHz, GNU Radio compatible). ACR122U é leitor NFC homologado (~R$ 100-300), permite trabalhar com Mifare Classic/Plus/DESFire de cartões PRÓPRIOS legalmente. Combinação cobre dois grandes domínios — RF e RFID/NFC — sem zona cinzenta jurídica. HackRF (TX) e Flipper (TX) ficam para fase posterior em lab institucional.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="lab-pessoal-legal"
      title="Lab pessoal legal: RTL-SDR + Faraday + GNU Radio + HTB"
      icon="🧪"
      xp={50}
      readTime={10}
      trailName="Flipper Zero & Hardware Hacking"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="O problema: Flipper + ANATEL = zona cinzenta" accent={accent}>
        <p className="text-sm leading-6">
          Aprender hardware hacking não exige correr risco com importação de Flipper Zero. A pedagogia mais
          rica e <strong>100% legal no Brasil</strong> é construída em torno de três peças: (1) receptor SDR
          genérico (RTL-SDR), (2) leitor NFC homologado, (3) framework GNU Radio + ambientes virtuais
          (HackTheBox, TryHackMe). Você cobre 70-80% do que o Flipper ensina, gasta menos, e dorme tranquilo.
        </p>
        <Callout tone="success" icon="✅">
          Tese central deste módulo: <strong>RTL-SDR sozinho ensina mais sobre RF do que Flipper Zero</strong>{' '}
          — porque expõe IQ samples e força você a entender DSP em vez de clicar botões pré-prontos. E é
          legal por design (RX-only).
        </Callout>
      </Section>

      <Section title="Hardware essencial — comparado" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Hardware', 'Faixa', 'TX/RX', 'Status BR', 'Preço aprox.', 'Pedagogia']}
          rows={[
            ['RTL-SDR v3/v4', '24 MHz – 1.7 GHz (~500 kHz com upconverter)', 'RX only', 'Legal (não exige homologação)', 'R$ 200', '★★★★★ — DSP exposto'],
            ['HackRF One', '1 MHz – 6 GHz', 'TX + RX (half-duplex)', 'Mesma restrição Flipper (TX)', 'US$ 320', '★★★★ — exige Faraday p/ TX'],
            ['Proxmark3 Easy', '125 kHz LF + 13.56 MHz HF', 'TX + RX RFID/NFC', 'Cinzenta — viável institucional', 'US$ 80', '★★★★★ — RFID profundo'],
            ['ACR122U USB', '13.56 MHz NFC', 'RX + emulação limitada', 'Homologado, vendido legal', 'R$ 100–300', '★★★ — só NFC HF'],
            ['YubiKey 5', 'NFC + USB', 'PIV/U2F/PGP', 'Legal, vendido normal', 'US$ 50', '★★★★ — PKI prática'],
            ['Bus Pirate v5', '0–80 MHz (digital)', 'Wired protocols (SPI/I²C/UART/JTAG)', 'Legal', 'US$ 30', '★★★★★ — wired hacking'],
            ['Flipper Zero', '300–928 MHz Sub-GHz + 13.56 NFC + 125 LF + IR + BLE', 'TX + RX', 'Cinzenta (apreensões)', 'R$ 1.500–2.500', '★★★ — abstrai DSP'],
          ]}
        />
        <KeyValue
          accent={accent}
          items={[
            { k: 'RTL-SDR v3/v4', v: <>Receptor SDR genérico baseado em Realtek RTL2832U + Rafael R820T2 (v3) ou R828D (v4). RX-only. ABNT/ANATEL não exigem homologação para receptores passivos. AliExpress/Mercado Livre vendem regularmente.</> },
            { k: 'ACR122U', v: <>NFC reader USB homologado por ABNT, fabricante ACS. Vendido em e-commerce BR. Trabalha com qualquer cartão Mifare/DESFire/NTAG legal (próprio).</> },
            { k: 'Bus Pirate v5', v: <>Multitool serial wired — não toca em RF; análise de SPI flash, I²C de placas-mãe, JTAG legacy. Excelente para hardware reverse engineering. 100% legal.</> },
            { k: 'YubiKey', v: <>Token de hardware (PIV/U2F/FIDO2/PGP/HOTP). Aprender PKI prática + gerenciamento de chaves; eXcelente para SSH/Git signing.</> },
          ]}
        />
      </Section>

      <Section title="GNU Radio + RTL-SDR — porta de entrada real" accent={accent}>
        <p className="text-sm leading-6">
          GNU Radio (gnuradio.org) é framework DSP open-source maduro, em desenvolvimento desde 2001. Editor
          visual <InlineCode>gnuradio-companion</InlineCode> permite encadear blocos (source → filtros →
          demod → decoder → sink). É o que profissionais de telecom usam para prototipar.
        </p>
        <ArchFlow
          title="Pipeline RF típico no GNU Radio"
          accent={accent}
          columns={[
            {
              header: 'Front-end',
              items: [
                'Antena (telescópica ou específica)',
                'RTL-SDR (USB)',
                'osmocom_source ou rtlsdr_source',
                'Sample rate: 2.4 MS/s',
                'Center freq: ex. 433.92 MHz',
              ],
              footer: 'IQ complex float',
            },
            {
              header: 'DSP',
              items: [
                'Low Pass Filter',
                'Decimation (downsample)',
                'AGC (Automatic Gain Control)',
                'FFT para visualização (sink)',
                'Channel select',
              ],
              footer: 'Float / complex → simbolos',
            },
            {
              header: 'Demodulação',
              items: [
                'Quadrature Demod (FM)',
                'AM Demod',
                'OOK / ASK detector',
                'FSK (mark/space)',
                'Manchester decoder',
              ],
              footer: 'Bits / símbolos',
            },
            {
              header: 'Decode + sink',
              items: [
                'Sync word detector',
                'Frame parser',
                'CRC validation',
                'Sink: audio, file, socket TCP',
                'Visualização: waterfall, time scope',
              ],
              footer: 'Dados aplicação',
            },
          ]}
        />
        <NodeGraph
          title="Sinais legais e didáticos para receber com RTL-SDR"
          accent={accent}
          legend="Todos RX passivo — captura 100% legal"
          columns={[
            {
              label: 'Aviação / espaço',
              nodes: [
                { icon: '✈️', label: 'ADS-B (1090 MHz)', sub: 'Tráfego aéreo em tempo real' },
                { icon: '🛰️', label: 'NOAA APT (137 MHz)', sub: 'Imagens meteorológicas LEO' },
                { icon: '📡', label: 'AIS (162 MHz)', sub: 'Navios mercantes' },
              ],
            },
            {
              label: 'ISM educacional',
              nodes: [
                { icon: '🏠', label: 'EV1527 (433 MHz)', sub: 'Controles de garagem próprios' },
                { icon: '🌡️', label: 'Sensores 433/868', sub: 'Estações meteo, temperatura' },
                { icon: '🚪', label: 'Smart locks 868', sub: 'Próprios; LoRa privado' },
              ],
            },
            {
              label: 'Broadcast',
              nodes: [
                { icon: '📻', label: 'FM broadcast (88-108)', sub: 'Rádios comerciais' },
                { icon: '📟', label: 'POCSAG / FLEX (~150)', sub: 'Pagers ainda usados em hospital' },
                { icon: '🚓', label: 'Trunked radio (~800)', sub: 'P25, TETRA — apenas decode passivo permitido onde legal' },
              ],
            },
          ]}
        />
        <CodeBlock lang="python">{`# Hello GNU Radio: receber FM broadcast e tocar audio
# (gerado a partir de gnuradio-companion .grc, ou flowgraph manual)
from gnuradio import gr, audio, blocks, analog, filter
import osmosdr

class fm_receiver(gr.top_block):
    def __init__(self, freq_hz=96.9e6):
        super().__init__()
        sample_rate = 2400000
        audio_rate = 48000

        self.source = osmosdr.source(args="rtl=0")
        self.source.set_sample_rate(sample_rate)
        self.source.set_center_freq(freq_hz)
        self.source.set_gain(40)

        # Decimacao para audio
        self.lowpass = filter.fir_filter_ccf(
            50,
            filter.firdes.low_pass(1, sample_rate, 75e3, 25e3))

        self.demod = analog.wfm_rcv(
            quad_rate=sample_rate / 50,
            audio_decimation=1)

        self.audio_sink = audio.sink(audio_rate, "")

        self.connect(self.source, self.lowpass, self.demod, self.audio_sink)

if __name__ == "__main__":
    tb = fm_receiver()
    tb.start()
    input("Press Enter to stop...")
    tb.stop()
    tb.wait()`}</CodeBlock>
        <Callout tone="info" icon="📚">
          Recurso #1 para aprender: <a className="underline" href="https://www.rtl-sdr.com/" target="_blank" rel="noreferrer">rtl-sdr.com</a>{' '}
          — blog mantido desde 2013, com tutoriais detalhados de cada protocolo. <a className="underline" href="https://wiki.gnuradio.org/index.php?title=Tutorials" target="_blank" rel="noreferrer">wiki.gnuradio.org/Tutorials</a>{' '}
          é o material oficial estruturado.
        </Callout>
      </Section>

      <Section title="Faraday cage caseira" accent={accent}>
        <p className="text-sm leading-6">
          Para qualquer experimento que envolva TX (HackRF, Proxmark em modo emulação, controle remoto seu),
          uma Faraday cage caseira reduz drasticamente o vazamento. <strong>Não é blindagem jurídica</strong>{' '}
          (transmitir continua infração ANATEL), mas reduz risco prático de interferir terceiros.
        </p>
        <ArchFlow
          title="Construção de Faraday cage caseira"
          accent={accent}
          columns={[
            {
              header: 'Estrutura',
              items: [
                'Caixa de papelão rígida ou MDF',
                'Dimensões: 30×30×30 cm útil',
                'Tampa com dobradiça',
                'Janela inspeção: 10×10 cm',
              ],
              footer: 'Frame mecânico',
            },
            {
              header: 'Camadas condutivas',
              items: [
                '3× malha de cobre, mesh ≤ 1 mm',
                'Sobreposição entre camadas',
                'Folha de alumínio comercial (extra)',
                'Camadas em direções cruzadas',
              ],
              footer: 'Atenuação por interferência destrutiva',
            },
            {
              header: 'Vedação',
              items: [
                'Fita de cobre adesiva nas frestas',
                'Janela: vidro metalizado IR',
                'Junções soldadas (idealmente)',
                'Buracos < λ/10 da menor frequência',
              ],
              footer: 'Sem leakage',
            },
            {
              header: 'Validação',
              items: [
                'Celular dentro: sem sinal',
                'RSSI Wi-Fi: queda ≥ 60 dB',
                'RTL-SDR scan: piso de ruído cai',
                'Aterramento: cabo terra na malha',
              ],
              footer: 'Medir empiricamente',
            },
          ]}
        />
        <FlowDiagram
          title="Validação prática da Faraday — RSSI Wi-Fi"
          accent={accent}
          orientation="vertical"
          steps={[
            { icon: '📶', label: 'Medir fora', desc: 'iwconfig wlan0 — anota RSSI do AP de referência (ex: -45 dBm)' },
            { icon: '📦', label: 'Colocar dentro', desc: 'Smartphone ou laptop dentro da gaiola, fechada' },
            { icon: '📉', label: 'Medir dentro', desc: 'RSSI deve cair drasticamente (alvo: -105 dBm ou perda de sinal total)' },
            { icon: '🧮', label: 'Calcular atenuação', desc: 'Δ = RSSI_fora - RSSI_dentro. Alvo: ≥ 60 dB para uso experimental' },
            { icon: '🔧', label: 'Reforçar se < 60dB', desc: 'Adicionar camada de cobre, vedar mais frestas, soldar junções' },
          ]}
        />
        <Callout tone="warn" icon="⚖️">
          <strong>Importante:</strong> Faraday cage REDUZ vazamento mas não imuniza juridicamente. ANATEL
          tipifica o ato de transmitir em faixa regulada sem autorização — não a "potência efetiva fora da
          gaiola". Para experimentos seguros: combine Faraday + faixa ISM (433/868/915 MHz, com limites de
          potência) + hardware próprio + propriedade da rede-alvo.
        </Callout>
      </Section>

      <Section title="Lab virtual — HackTheBox e TryHackMe" accent={accent}>
        <p className="text-sm leading-6">
          Para web pentest, AppSec, AD pentest, post-exploitation Linux/Windows, exfil em cloud — o caminho é
          <strong> lab virtual cloud</strong>. Custos baixos, ambientes pré-fabricados PTES-aligned, sem risco
          legal.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Plataforma', 'Modelo', 'Foco', 'Custo', 'Quando']}
          rows={[
            ['HackTheBox', 'Cenários reais retired/active', 'Pentest geral, AD, web', 'Free + VIP US$ 14/mês', 'Após fundamentos — desafios mais profundos'],
            ['TryHackMe', 'Tutoriais guiados + rooms', 'Iniciante a intermediário', 'Free + Premium US$ 14/mês', 'Primeiro contato — explica e orienta'],
            ['HTB Academy', 'Trilhas estruturadas + cert', 'Currículo + CPTS cert', 'US$ 8/cube + cubes', 'Sequência didática estruturada'],
            ['DVWA', 'App propositalmente vulnerável', 'Web SQLi, XSS, CSRF', 'Self-hosted (Docker)', 'Aprender vulns web 1 a 1'],
            ['Juice Shop (OWASP)', 'App vuln moderna (JS)', 'Web moderno + API', 'Self-hosted (Docker)', 'Após DVWA — mais realístico'],
            ['WebGoat (OWASP)', 'App + lições', 'Web vulns clássicas', 'Self-hosted (Docker)', 'Curso clássico'],
            ['PortSwigger Web Security Academy', 'Labs guiados Burp', 'Web pentest avançado', 'Free', 'Excelente — usado pela BSCP cert'],
          ]}
        />
        <Callout tone="success" icon="🎓">
          PortSwigger Web Security Academy é o melhor recurso <em>gratuito</em> para web pentest em 2026 —
          mais de 200 labs interativos, atualizados por uma das melhores casas de AppSec do mundo. Pode ser
          a única coisa que você precisa para dominar Burp + web vulns.
        </Callout>
      </Section>

      <Section title="Roadmap mensal sugerido" accent={accent}>
        <Timeline
          title="Do zero ao primeiro pagamento de bug bounty — 12 meses"
          accent={accent}
          events={[
            { when: 'M1', label: 'RTL-SDR + ADS-B + NOAA', detail: 'Compra hardware, instala GNU Radio. Captura tráfego aéreo + imagens NOAA. Aprende DSP básico.' },
            { when: 'M2', label: 'GNU Radio + decode próprio', detail: 'Decodifica controle remoto próprio (EV1527 433 MHz) — entende OOK + Manchester.' },
            { when: 'M3', label: 'NFC com ACR122U', detail: 'Cartões MIFARE Classic em branco; lê, escreve, entende setores e Crypto1 (passivo).' },
            { when: 'M4', label: 'Web pentest DVWA + Juice Shop', detail: 'Burp Community + Mozilla DevTools. SQLi, XSS, IDOR, BAC.', highlight: true },
            { when: 'M5', label: 'PortSwigger Academy completo', detail: '200+ labs Burp; web pentest sólido em 30 dias intensivo.' },
            { when: 'M6', label: 'eJPT cert', detail: 'US$ 200, 2-3h prova prática. Primeira credencial formal.', highlight: true },
            { when: 'M7', label: 'BugHunt cadastro', detail: 'Programas públicos amplos. Primeiro report (mesmo low) começa portfólio.' },
            { when: 'M8', label: 'TryHackMe + HackTheBox', detail: 'AD pentest, post-ex Linux/Windows. Boxes retired estruturados.' },
            { when: 'M9', label: 'Primeiro pagamento BugHunt', detail: 'Report válido + triagem + payout. Marco psicológico crítico.', highlight: true },
            { when: 'M10', label: 'BSCP (PortSwigger cert)', detail: 'US$ 99 — credencial AppSec específica, valorizada no mercado.' },
            { when: 'M11', label: 'OSCP estudo intensivo', detail: 'Lab + curso PWK. 60 dias intensivos. Tecnicamente desafiador.' },
            { when: 'M12', label: 'Primeiro contrato freelance', detail: 'MEI emite NF; pentest pequeno via rede pessoal/LinkedIn. Portfolio + cert + caso = oferta.', highlight: true },
          ]}
        />
        <DecisionBox
          scenario="Tenho R$ 300 disponíveis hoje — primeiro hardware para começar?"
          winner="RTL-SDR v4 (~R$ 200) + ACR122U usado (~R$ 100) + 10 cartões MIFARE Classic 1K em branco (R$ 30)"
          winnerColor={accent}
          why="Cobre dois grandes domínios (RF passivo + RFID/NFC ativo) sem zona cinzenta jurídica. RTL-SDR + GNU Radio ensina DSP de verdade; ACR122U + MIFARE ensina RFID/NFC com cartões PRÓPRIOS. Custo total cabe no orçamento e você tem material para 6+ meses de prática."
          alternatives={[
            { name: 'RTL-SDR sozinho', when: 'Se interesse principal é RF; deixa NFC para depois' },
            { name: 'ACR122U + cartões + DVWA', when: 'Se interesse é AppSec + NFC; sem RF' },
            { name: 'Apenas Bus Pirate (R$ 150)', when: 'Foco em hardware reverse (SPI flash, I²C, JTAG)' },
            { name: 'Esperar para HackRF (~US$ 320)', when: 'Não recomendado iniciante — TX requer Faraday + cuidado legal' },
          ]}
        />
      </Section>

      <Section title="Stack pedagógica recomendada FFV" accent={accent}>
        <FlowDiagram
          title="Sequência didática FFV — sem zona cinzenta"
          accent={accent}
          orientation="vertical"
          steps={[
            { icon: '📚', label: '1. Fundamentos RF teóricos', desc: 'Trilha FFV: módulos sobre modulação, antena, espectro, propagação' },
            { icon: '📡', label: '2. RTL-SDR + GNU Radio (RX passivo)', desc: 'Captura ADS-B, NOAA, ISM próprio. Domina IQ samples + demodulação' },
            { icon: '🪪', label: '3. RFID/NFC com ACR122U + cartões próprios', desc: 'MIFARE Classic, NTAG, DESFire — sem cartões alheios' },
            { icon: '🌐', label: '4. Web pentest em DVWA + Juice Shop + PortSwigger Academy', desc: 'Burp, OWASP Top 10, SQLi/XSS/IDOR/BAC práticos' },
            { icon: '🎯', label: '5. PTES + estudo de caso + redação de relatório', desc: 'Trilha FFV: framework + 5 itens + Get Out of Jail Letter' },
            { icon: '🐛', label: '6. Submissão BugHunt + responsible disclosure', desc: 'Primeiro report — mesmo low severity vira portfólio' },
            { icon: '🎓', label: '7. eJPT → BSCP → OSCP', desc: 'Sequência de certificações com ROI claro' },
            { icon: '💼', label: '8. Primeiro contrato freelance', desc: 'MEI + LinkedIn + portfólio + cert = primeira oferta' },
          ]}
        />
      </Section>

      <Section title="Q&A final" accent={accent}>
        <div className="flex flex-col gap-3">
          <QAItem
            q="Vale importar Flipper Zero mesmo com risco de apreensão?"
            a={
              <>
                Para hobbyista: <strong>não</strong>. RTL-SDR + ACR122U cobre 70% do aprendizado, sem risco
                legal, custa menos. Para pentester profissional construindo portfolio: considere primeiro vias
                institucionais (lab universidade, empresa que fornece) ou aguarde liberação ANATEL — diversos
                grupos têm pressionado e há possibilidade de homologação restrita até 2027. A Flipper Devices
                tem trabalhado com reguladores em vários países.
              </>
            }
          />
          <QAItem
            q="Posso transmitir em ISM 433/868 MHz com HackRF dentro de Faraday no meu apartamento?"
            a={
              <>
                Tecnicamente sim, com ressalvas: (1) potência abaixo dos limites ANATEL para a faixa ISM
                (geralmente &lt; 25 mW), (2) Faraday efetiva (atenuação medida ≥ 60 dB), (3) sem interferir
                terceiros (verificar piso de ruído antes/depois). Mesmo assim: prefira LoRa com módulos
                homologados quando possível — a infração configura-se pelo TX, não pela "potência efetiva".
              </>
            }
          />
          <QAItem
            q={'Esses labs virtuais (HTB, THM) não são vulneráveis a "abusos" reais?'}
            a={
              <>
                Não — são VMs efêmeras isoladas, com IPs internos da plataforma, totalmente lícitos.
                Atacar a infraestrutura da própria plataforma é fora-de-escopo (e geralmente vira ban + ação
                legal). Limitar-se aos boxes/rooms da plataforma é 100% legal e cobre toda a faixa de
                aprendizado de pentest moderno.
              </>
            }
          />
          <QAItem
            q="Devo aprender Python ou C primeiro para pentest?"
            a={
              <>
                <strong>Python primeiro</strong> — scripts de exploit, automação Burp, parsing de PCAP, glue
                code. Quase todo tooling moderno é Python. C entra mais tarde para entender exploits binários
                (buffer overflow, ROP) e firmware reverse — é o nível dos que vão para OSED ou exploit dev. Para
                a maioria dos pentesters web/cloud/AD em 2026, Python + bash + algum conhecimento de Go
                (ferramentas modernas) é o stack de trabalho.
              </>
            }
          />
        </div>
      </Section>

      <Section title="Referências canônicas" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'RTL-SDR blog', v: <a className="underline" href="https://www.rtl-sdr.com/about-rtl-sdr/" target="_blank" rel="noreferrer">rtl-sdr.com/about-rtl-sdr</a> },
            { k: 'GNU Radio', v: <a className="underline" href="https://www.gnuradio.org" target="_blank" rel="noreferrer">gnuradio.org</a> },
            { k: 'GNU Radio Tutorials', v: <a className="underline" href="https://wiki.gnuradio.org/index.php?title=Tutorials" target="_blank" rel="noreferrer">wiki.gnuradio.org/Tutorials</a> },
            { k: 'HackTheBox', v: <a className="underline" href="https://hackthebox.com" target="_blank" rel="noreferrer">hackthebox.com</a> },
            { k: 'TryHackMe', v: <a className="underline" href="https://tryhackme.com" target="_blank" rel="noreferrer">tryhackme.com</a> },
            { k: 'PortSwigger Academy', v: <a className="underline" href="https://portswigger.net/web-security" target="_blank" rel="noreferrer">portswigger.net/web-security</a> },
            { k: 'OWASP Juice Shop', v: <a className="underline" href="https://owasp.org/www-project-juice-shop/" target="_blank" rel="noreferrer">owasp.org/www-project-juice-shop</a> },
            { k: 'CERT.br', v: <a className="underline" href="https://www.cert.br" target="_blank" rel="noreferrer">cert.br — coordenação BR</a> },
            { k: 'BugHunt', v: <a className="underline" href="https://bughunt.com.br" target="_blank" rel="noreferrer">bughunt.com.br</a> },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
