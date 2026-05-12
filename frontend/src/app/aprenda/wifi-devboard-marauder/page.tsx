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
  AnnotatedFormula,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('wifi-devboard-marauder');

const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o ataque de deauth do ESP32 Marauder funciona contra a maioria das redes WPA2 mesmo sem conhecer a senha?',
    options: [
      'Porque o atacante quebra o handshake EAPOL em tempo real',
      'Porque o IEEE 802.11 (1997) NÃO autentica frames de management; deauth/disassoc são aceitos sem verificação enquanto o cliente não estiver protegido por 802.11w PMF',
      'Porque o ESP32 transmite com mais potência que o AP legítimo',
      'Porque o WPA2 usa criptografia simétrica fraca',
    ],
    correct: 1,
    explanation: 'O padrão 802.11-1997 não exigia autenticação de management frames. Deauth e disassoc são frames de management — qualquer dispositivo conhecendo BSSID + STA MAC consegue forjar. A correção é o 802.11w (PMF, Protected Management Frames), opcional desde 2009 e mandatory no Wi-Fi 6/6E e WPA3. Em SOHO em 2026 a maioria ainda roda WPA2 sem PMF.',
  },
  {
    question: 'Por que a FCC multou Marriott em US$ 600.000 (2014) por usar deauth contra hóspedes na própria rede?',
    options: [
      'Porque o Marriott não tinha licença ANATEL',
      'Porque interferência intencional em comunicações de rádio é proibida sob 47 U.S.C. § 333 — propriedade da rede não autoriza derrubar dispositivos de terceiros que estão em outras redes (ex: hotspot pessoal)',
      'Porque o Marriott usou hardware não homologado',
      'Porque o Marriott usou criptografia fraca no Wi-Fi',
    ],
    correct: 1,
    explanation: 'O FCC Consent Decree (DA 14-1444, 2014) trata deauth contra clientes alheios como interferência intencional em radiocomunicações sob 47 U.S.C. § 333 — independe de quem é dono do AP. Hilton recebeu multa similar (US$ 25k em 2017). Doutrina aplicável aos EUA, mas Brasil/UE enquadram como DoS (Marco Civil + Lei 14.155/2021 no Brasil; CMA no UK; §202c StGB na Alemanha).',
  },
  {
    question: 'O que é o PMKID e por que sua captura mudou o cenário de ataques WPA2 a partir de 2018?',
    options: [
      'Hash do SSID que vaza no beacon',
      'Hash derivado do PMK incluído no primeiro frame EAPOL pelo AP em redes WPA2 com roaming/802.11r — atacante captura sem precisar do handshake completo, alimenta hashcat e quebra offline',
      'Chave pública do certificado RADIUS',
      'Identificador do dispositivo no DHCP',
    ],
    correct: 1,
    explanation: 'PMKID = HMAC-SHA1-128("PMK Name" || AP_MAC || STA_MAC, PMK). Documentado por Jens Steube (atom, hashcat) em ago/2018. APs com 802.11r (Fast BSS Transition) ou alguns vendors enviam PMKID no primeiro EAPOL — atacante coleta passivamente sem deauth + handshake-de-4-vias e roda hashcat -m 22000. Marauder + Flipper expõem essa coleta de forma didática.',
  },
  {
    question: 'Como o Wi-Fi DevBoard oficial conversa com o STM32WB55 do Flipper Zero?',
    options: [
      'Via SPI nos pinos 2/3',
      'Via UART nos pinos 13 (TX) e 14 (RX), com bootloader serial do ESP32-S2 acessível pelos botões boot/reset',
      'Via I²C 100 kHz',
      'Via USB-C interno',
    ],
    correct: 1,
    explanation: 'O Wi-Fi DevBoard oficial (Flipper Devices, ~US$ 29) é um ESP32-S2 com footprint que casa no header GPIO 2×9. Comunica via UART (pinos 13 = TX, 14 = RX) a 115200 baud. O bootloader serial do ESP32 fica acessível via botões boot/reset do board — flasha qualquer firmware (Marauder, Black Magic Probe, CircuitPython, Wi-Fi Marauder forks).',
  },
  {
    question: 'Em uma rede WPA3 com SAE + PMF mandatory, qual ataque do Marauder ainda funciona contra clientes legacy?',
    options: [
      'Deauth normal',
      'Beacon spam e Evil Portal — não dependem de management frames protegidos. Beacon spam floda SSIDs falsos no espectro; Evil Portal opera o ESP32 como AP malicioso com captive portal',
      'Quebra do handshake SAE',
      'Nenhum, WPA3 é inquebrável',
    ],
    correct: 1,
    explanation: 'PMF protege deauth/disassoc de spoofing. Beacon spam transmite frames de gerência fora do contexto da rede vítima — não exige autenticação. Evil Portal cria um AP novo (não suplanta o legítimo) e faz phishing via captive portal — vetor de engenharia social, não cripto. Por isso nenhum padrão IEEE "fecha" Evil Portal — só treinamento de usuários e detecção de rogue APs (WIDS).',
  },
  {
    question: 'Cenário: você ativa deauth no Marauder em casa e o vizinho do andar de baixo perde Wi-Fi. Qual a tipificação no Brasil em 2026?',
    options: [
      'Nenhum crime — sua rede, seu hardware',
      'Art. 154-A do CP (invasão de dispositivo) + Lei 14.155/2021 (interrupção de serviço telemático) — pena de reclusão e multa, mesmo sem dolo de extorsão',
      'Apenas infração ANATEL administrativa',
      'Crime de calúnia',
    ],
    correct: 1,
    explanation: 'Lei 14.155/2021 reforçou o Art. 154-A e introduziu a interrupção de serviço telemático (Art. 266 §1º). Derrubar Wi-Fi alheio mesmo "sem querer" pelo seu hardware se enquadra: o resultado é DoS contra equipamento de terceiro. Adicionalmente, ANATEL pode aplicar sanção administrativa (Lei 9.472/97 + Resolução 715/2019). FCC vs Marriott é jurisprudência análoga.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="wifi-devboard-marauder"
      title="WiFi DevBoard + Marauder: por que FCC multou Marriott US$600k"
      icon="📶"
      xp={70}
      readTime={12}
      trailName="Flipper Zero & Hardware Hacking"
      trailColor={accent}
      nextSlug="desenvolvimento-faps-ufbt"
      nextTitle="FAP em C com ufbt"
      quiz={quiz}
    >
      <Section title="O hardware: Wi-Fi DevBoard oficial" accent={accent}>
        <p className="text-sm leading-6">
          O Flipper Zero <strong>não tem rádio Wi-Fi</strong>. O STM32WB55 entrega BLE 5.4 (CPU2 dedicado) mas
          não 802.11. Para Wi-Fi a Flipper Devices vende um shield: <strong>Wi-Fi DevBoard</strong> (~US$ 29) —
          um ESP32-S2 com footprint que encaixa no header GPIO 2×9. É um co-processador serial: o STM32 envia
          comandos UART, o ESP32 executa.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'SoC', v: <>Espressif ESP32-S2 (Xtensa LX7, single-core 240 MHz, 320 KB SRAM)</> },
            { k: 'Rádio', v: <>Wi-Fi 2.4 GHz 802.11 b/g/n + BLE 4.2 (não 5.0). 2.4 GHz only.</> },
            { k: 'Interface com Flipper', v: <>UART 115200 baud nos pinos 13 (TX) / 14 (RX) do header GPIO</> },
            { k: 'Alimentação', v: <>Pino 1 (5 V switchable) e pino 8 (3.3 V); LDO interno regula para o ESP</> },
            { k: 'Flash storage', v: <>4 MB on-board para firmware ESP32 (Marauder ocupa ~1.3 MB)</> },
            { k: 'Bootloader', v: <>Serial download mode acionável por botões BOOT + RESET físicos no board</> },
            { k: 'Antena', v: <>PCB trace, ~+2 dBi, Tx típico +18 dBm</> },
          ]}
        />
        <Callout tone="info" icon="🔌">
          O DevBoard é um ESP32 genérico vendido com bootloader pré-carregado. Você flasha qualquer firmware
          arbitrário via <InlineCode>esptool.py</InlineCode> ou pelo flasher web em{' '}
          <a className="underline" href="https://lab.flipper.net" target="_blank" rel="noreferrer">lab.flipper.net</a>.
          Os principais firmwares: <strong>ESP32 Marauder</strong> (justcallmekoko), <strong>Black Magic Probe</strong>{' '}
          (debug ARM SWD), <strong>CircuitPython</strong>, <strong>Bluetooth Mesh experimental</strong>.
        </Callout>
      </Section>

      <Section title="ESP32 Marauder — o canivete Wi-Fi" accent={accent}>
        <p className="text-sm leading-6">
          <strong>ESP32 Marauder</strong> (justcallmekoko/ESP32Marauder) é uma suíte open-source que transforma
          o ESP32 num pentester de Wi-Fi 2.4 GHz e BLE. Originalmente para boards independentes, foi portada
          para o Wi-Fi DevBoard com UI no LCD do Flipper. Capabilities mapeadas no espectro de ataques:
        </p>
        <NodeGraph
          title="Ataques Marauder por superfície"
          accent={accent}
          legend="Cada coluna = camada do stack 802.11 ou BLE — ataque exposto pelo Marauder"
          columns={[
            {
              label: 'Sniffing passivo',
              nodes: [
                { icon: '📡', label: 'Probe Requests', sub: 'Captura SSIDs procurados pelos celulares' },
                { icon: '🛰️', label: 'Beacons', sub: 'Inventário completo de APs visíveis' },
                { icon: '🔑', label: 'EAPOL handshake', sub: 'Captura 4-way + PMKID para crack offline' },
              ],
            },
            {
              label: 'Mgmt frames forjados',
              nodes: [
                { icon: '🧨', label: 'Deauth attack', sub: '802.11 type 0 subtype 12', tone: 'danger' },
                { icon: '📴', label: 'Disassoc flood', sub: 'subtype 10 — desconecta clientes', tone: 'danger' },
                { icon: '📢', label: 'Beacon spam', sub: 'SSID flood: Rickroll, Apple/Samsung pairing', tone: 'danger' },
              ],
            },
            {
              label: 'Engenharia social',
              nodes: [
                { icon: '🎣', label: 'Evil Portal', sub: 'AP rogue + captive portal phishing', tone: 'danger' },
                { icon: '📍', label: 'Wardriving', sub: 'BSSID + GPS dump (kismet/wigle compatible)' },
                { icon: '📲', label: 'BLE spam', sub: 'Apple Continuity / Swift Pair flood', tone: 'danger' },
              ],
            },
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          <strong>Status legal de boa parte da coluna do meio e direita:</strong> ilegal em jurisdições
          ocidentais quando aplicado contra terceiros. Ver seção FCC vs Marriott. Use exclusivamente em rede
          isolada de laboratório (Faraday cage), com hardware próprio e sem nenhum cliente externo no espectro.
        </Callout>
      </Section>

      <Section title="Por dentro do deauth: a falha do 802.11" accent={accent}>
        <p className="text-sm leading-6">
          O ataque de deauth não é uma “vulnerabilidade” no sentido moderno — é um <strong>defeito original</strong>{' '}
          do padrão IEEE 802.11 publicado em 1997. Frames de management (deauth, disassoc, beacon, probe) eram
          transmitidos em texto claro, sem qualquer autenticação criptográfica. A correção (802.11w PMF) só
          chegou em 2009 e demorou 15 anos para virar mandatory (Wi-Fi 6 / WPA3).
        </p>
        <AnnotatedFormula
          title="Frame de deauth — 802.11 type 0 subtype 12"
          accent={accent}
          formula="| FC | DUR | DA | SA | BSSID | SEQ | REASON | FCS |"
          parts={[
            { text: 'FC', annotation: 'Frame Control: type=0 (mgmt), subtype=12 (deauth) — 2 bytes' },
            { text: 'DUR', annotation: 'Duration / NAV — 2 bytes, geralmente 0' },
            { text: 'DA', annotation: 'Destination Address (MAC alvo, broadcast FF:FF:FF:FF:FF:FF para deauth em massa)' },
            { text: 'SA', annotation: 'Source Address — falsificável; atacante usa o MAC do AP legítimo', highlight: true },
            { text: 'BSSID', annotation: 'BSSID da rede — capturado no beacon, conhecido' },
            { text: 'SEQ', annotation: 'Sequence number — não validado em pré-PMF' },
            { text: 'REASON', annotation: '2 bytes; 0x07 = "Class 3 frame received from nonassociated STA"', highlight: true },
            { text: 'FCS', annotation: 'CRC do frame — calculável trivialmente' },
          ]}
        />
        <FlowDiagram
          title="Anatomia completa do ataque deauth → captura de PMKID"
          accent={accent}
          orientation="vertical"
          steps={[
            { icon: '👂', label: '1. Sniff passivo', desc: 'Marauder em modo monitor escuta canal — extrai BSSID + lista de STAs (clientes) e RSSI' },
            { icon: '🎯', label: '2. Seleciona alvo', desc: 'STA específico ou broadcast FF:FF:FF:FF:FF:FF (todos os clientes do AP)' },
            { icon: '🧨', label: '3. Forja deauth', desc: 'SA = BSSID; DA = STA alvo; reason 0x07. ESP transmite N frames (geralmente 30+ para garantia)' },
            { icon: '📴', label: '4. STA disassocia', desc: 'Driver Wi-Fi do cliente recebe deauth, sai da rede sem questionar (sem PMF)' },
            { icon: '🔄', label: '5. STA reconnecta', desc: 'Cliente tenta reassociar imediatamente — handshake EAPOL 4-way roda no ar' },
            { icon: '🔑', label: '6. Captura', desc: 'Marauder grava EAPOL frames + PMKID (se exposto pelo AP). Salva em PCAP no SD' },
            { icon: '💻', label: '7. Crack offline', desc: 'Hashcat -m 22000 (PMKID/EAPOL) com wordlist; senha fraca quebra em minutos' },
          ]}
        />
        <Callout tone="info" icon="🧪">
          <strong>PMKID</strong> = HMAC-SHA1-128("PMK Name" || AP_MAC || STA_MAC, PMK). Documentado por
          atom/hashcat em agosto de 2018. APs com 802.11r (FT roaming) ou alguns vendors expõem PMKID já no
          primeiro frame EAPOL — atacante <em>nem precisa</em> do handshake completo.
        </Callout>
      </Section>

      <Section title="Mitigação real: PMF, WPA3 e WPA4" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Padrão', 'Auth handshake', 'Mgmt frames', 'Deauth attack', 'Status 2026']}
          rows={[
            ['WEP (1997)', 'RC4 estático', 'Plain', 'Funciona', 'Deprecated, quebrado'],
            ['WPA2-PSK', 'PSK + 4-way (PBKDF2)', 'Plain (PMF opcional)', 'Funciona se PMF off', 'Maioria SOHO'],
            ['WPA2-Enterprise', '802.1X + EAP', 'Plain (PMF opcional)', 'Funciona se PMF off', 'Empresarial legado'],
            ['WPA3-Personal (SAE)', 'Dragonfly / SAE', 'PMF mandatory', 'Bloqueado', 'Wi-Fi 6/6E'],
            ['WPA3-Enterprise 192-bit', '802.1X + EAP-TLS', 'PMF mandatory', 'Bloqueado', 'Setores críticos'],
            ['WPA4 (rascunho)', 'PQ-resilient TBD', 'PMF + frame integrity', 'N/A', 'Esperado pós-2026'],
          ]}
        />
        <Timeline
          title="Linha do tempo: do defeito original às correções"
          accent={accent}
          events={[
            { when: '1997', label: 'IEEE 802.11 publicado', detail: 'Mgmt frames sem autenticação — defeito de design por foco em performance' },
            { when: '2009', label: '802.11w (PMF) ratificado', detail: 'Correção opcional para deauth/disassoc spoofing — adoção lenta' },
            { when: '2014', label: 'FCC vs Marriott', detail: 'Consent Decree DA 14-1444: US$ 600.000 por jamming Wi-Fi de hóspedes', highlight: true },
            { when: '2017', label: 'FCC vs Hilton', detail: 'US$ 25.000 — repete jurisprudência de 2014' },
            { when: '2018', label: 'PMKID disclosed', detail: 'Jens Steube (hashcat) publica vetor passivo, sem deauth' },
            { when: '2018', label: 'WPA3 lançado', detail: 'SAE/Dragonfly + PMF mandatory — Wi-Fi Alliance' },
            { when: '2020', label: 'PMF mandatory em Wi-Fi 6', detail: 'Certificação 802.11ax obriga PMF', highlight: true },
            { when: '2026', label: 'WPA3 ainda não dominante em SOHO', detail: 'Bases instaladas de roteador < 2020 mantêm WPA2 sem PMF' },
          ]}
        />
        <Callout tone="success" icon="✅">
          Como saber se SUA rede está vulnerável: rode o Marauder contra o seu próprio AP (em ambiente isolado).
          Se cair, você está em WPA2 sem PMF — atualize o roteador para um modelo Wi-Fi 6/6E e force WPA3-Personal
          + PMF Required. Se não cair, parabéns: deauth foi fechado para você.
        </Callout>
      </Section>

      <Section title="Evil Portal — engenharia social no ESP32" accent={accent}>
        <p className="text-sm leading-6">
          Evil Portal é o ataque que <strong>não é mitigado</strong> por WPA3 ou PMF — porque não suplanta a
          rede legítima. O ESP32 sobe um AP novo (open ou WPA2), exibe um captive portal HTML que copia visual
          de Wi-Fi público (aeroporto, café, hotel) e captura credenciais ou dispara malware download.
        </p>
        <ArchFlow
          title="Stack do Evil Portal no Wi-Fi DevBoard"
          accent={accent}
          columns={[
            {
              header: 'Camada física',
              items: [
                'ESP32-S2 em modo SoftAP',
                'SSID forjado: "Aeroporto_Free"',
                'Canal 1, 6 ou 11 (popular)',
                'Tx ~ +18 dBm',
              ],
              footer: 'Vítima vê AP novo na lista',
            },
            {
              header: 'Captive portal',
              items: [
                'DNS spoof: redirige tudo para 192.168.4.1',
                'HTTP server na porta 80',
                'Template HTML editável (SD do Flipper)',
                'Detecta /generate_204 (Android) e /hotspot-detect.html (iOS)',
              ],
              footer: 'Sistema operacional abre browser auto',
            },
            {
              header: 'Captura',
              items: [
                'POST /login → log no SD do Flipper',
                'Templates: Google, Facebook, hotel-Wi-Fi',
                'Sem TLS — credencial em texto claro',
                'Phishing kit clonável',
              ],
              footer: 'Cred vazada na hora',
            },
          ]}
        />
        <Callout tone="danger" icon="🚨">
          Evil Portal contra terceiros é <strong>fraude eletrônica + invasão de dispositivo</strong> em qualquer
          jurisdição séria. No Brasil, Art. 171 §2-A (estelionato eletrônico, Lei 14.155/2021, pena 4–8 anos)
          + Art. 154-A. Mesmo "para teste num colega", responsabilização é direta. Use só em phishing assessment
          contratado por escrito (red team engagement).
        </Callout>
      </Section>

      <Section title="FCC vs Marriott — a jurisprudência que define a doutrina ocidental" accent={accent}>
        <p className="text-sm leading-6">
          Em outubro de 2014 a FCC americana publicou o <strong>Consent Decree DA 14-1444</strong> contra a
          Marriott International. O hotel Gaylord Opryland (Nashville) usava equipamento de detecção e deauth
          para derrubar hotspots pessoais de hóspedes, forçando-os a comprar Wi-Fi do hotel a US$ 250–1.000
          por evento. Multa: <strong>US$ 600.000</strong>. Em 2017 a Hilton recebeu sanção análoga (US$ 25k).
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Base legal EUA', v: <>47 U.S.C. § 333 — proibição de "willful or malicious interference" em radiocomunicações licenciadas ou unlicensed (ISM)</> },
            { k: 'Argumento do Marriott', v: <>"É a nossa rede, podemos defendê-la." Rejeitado: hotspot pessoal opera em ISM 2.4 GHz, terceiros têm direito ao uso</> },
            { k: 'Doutrina', v: <>Propriedade do AP NÃO autoriza interferência em dispositivos de terceiros que estejam no mesmo espectro não licenciado</> },
            { k: 'Aplicação Brasil', v: <>Marco Civil + Lei 14.155/2021: interrupção de serviço telemático (Art. 266 §1º) + ANATEL Lei 9.472/97</> },
            { k: 'Aplicação UE', v: <>NIS2 Directive + leis nacionais (UK CMA 1990, DE §202c StGB, FR L323-1 Code Pénal)</> },
          ]}
        />
        <Callout tone="warn" icon="📜">
          Texto do Consent Decree disponível em{' '}
          <a className="underline" href="https://docs.fcc.gov/public/attachments/DA-14-1444A1.pdf" target="_blank" rel="noreferrer">
            docs.fcc.gov/public/attachments/DA-14-1444A1.pdf
          </a>
          . Leitura obrigatória para qualquer pentester/red teamer estudando jurisprudência de RF.
        </Callout>
      </Section>

      <Section title="Como saber se MINHA rede está vulnerável" accent={accent}>
        <DecisionBox
          scenario="Quero auditar legalmente a resistência da MINHA rede contra deauth"
          winner="Marauder no DevBoard, em rede isolada, sem terceiros no espectro"
          winnerColor={accent}
          why="Auditoria do próprio AP é uso lícito quando: (1) rede é isolada de produção, (2) nenhum cliente externo está conectado, (3) idealmente dentro de Faraday cage. Resultado é diagnóstico legítimo."
          alternatives={[
            { name: 'Inspeção via UI do roteador', when: 'Verificar se opção PMF/MFP está em "Required"; mais simples mas menos definitivo' },
            { name: 'aireplay-ng em laptop com Atheros AR9271', when: 'Equivalente sem comprar DevBoard, requer adaptador Wi-Fi com modo monitor' },
            { name: 'Wifite2 automatizado', when: 'Suite Python que orquestra deauth + capture; usa só em rede própria' },
          ]}
        />
        <CodeBlock lang="bash">{`# Workflow de auto-auditoria seguro (em laboratório isolado)

# 1. Flashar Marauder no DevBoard
pip install esptool
esptool.py --chip esp32s2 --port /dev/ttyUSB0 write_flash 0x0 esp32_marauder_flipper_v1.x.bin

# 2. Plugar no Flipper, abrir GPIO > ESP32 Marauder

# 3. Em rede ISOLADA (lab homologado / Faraday):
#    - Scan APs ............. inventário do seu AP-alvo
#    - Sniff Beacons ........ confirme PMF status no Capability Info
#    - Select Target ........ seu AP
#    - Attack > Deauth ...... 30s
#    - Verifique se cliente caiu

# 4. Se caiu  -> WPA2 sem PMF, atualize firmware/roteador
#    Se nao caiu -> PMF ativo, parabens

# 5. Crack offline (apenas com captura propria):
hashcat -m 22000 capture.hc22000 wordlist.txt`}</CodeBlock>
        <Callout tone="info" icon="🔬">
          Capability Info no beacon (octeto 5 do frame) tem o bit <strong>RSN PMF Required</strong> — você consegue
          ler isso passivamente sem qualquer ataque. Wireshark + filtro <InlineCode>wlan.fc.type_subtype == 0x08</InlineCode>{' '}
          mostra todos os beacons da vizinhança e flags PMF.
        </Callout>
      </Section>

      <Section title="Q&A jurídico e prático" accent={accent}>
        <div className="flex flex-col gap-3">
          <QAItem
            q="Posso fazer deauth no celular do meu colega na própria sala? É a minha sala."
            a={
              <>
                Não. O equipamento é de terceiro, está em rede de terceiro (ou sua, igual). Se causar
                desconexão configurável como DoS, configura interrupção de serviço telemático (Lei 14.155/2021,
                Art. 266 §1º) + Art. 154-A se houver "obtenção, adulteração ou destruição de dados" — drivers
                Wi-Fi do dispositivo são "dados" no sentido amplo. Multas administrativas ANATEL adicionais.
              </>
            }
          />
          <QAItem
            q="Se eu rodar Marauder dentro de uma Faraday cage, com hardware meu, sem terceiros — é seguro juridicamente?"
            a={
              <>
                Sim, esse é o modelo lícito. A Faraday cage atenua &gt;60 dB e o sinal não escapa para terceiros.
                Combine com: (1) hardware homologado quando possível, (2) propriedade comprovada da rede-alvo,
                (3) registro de autorização escrita se for empresa, (4) logs do experimento. É como bench-testing
                em qualquer disciplina — auditoria responsável.
              </>
            }
          />
          <QAItem
            q="Beacon spam parece inofensivo (só lota a lista de redes). Por que ainda é ilegal?"
            a={
              <>
                Porque consome canal e pode causar saturação do espectro 2.4 GHz, degradando todas as redes
                vizinhas — DoS difuso. Adicionalmente, FCC interpretou em 2018 (caso M Glasses) que spam de
                management frames é "interferência intencional". No Brasil enquadra como uso indevido de espectro
                (ANATEL) + Lei 14.155/2021 se afetar serviços de terceiros.
              </>
            }
          />
          <QAItem
            q="Posso doar um DevBoard com Marauder pré-flashado a um amigo curioso?"
            a={
              <>
                O hardware em si é legal (ESP32 é homologado). O firmware Marauder é open-source. Mas se você
                <em>instrui</em> uso ofensivo contra terceiros, pode responder por concurso material (Art. 29 CP).
                Recomendação prática: doe + indique este módulo + indique RTL-SDR como alternativa só-RX para o
                aprendizado de RF sem zona cinzenta.
              </>
            }
          />
        </div>
      </Section>

      <Section title="Referências canônicas" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'GitHub Marauder', v: <a className="underline" href="https://github.com/justcallmekoko/ESP32Marauder/wiki/flipper-zero" target="_blank" rel="noreferrer">justcallmekoko/ESP32Marauder/wiki/flipper-zero</a> },
            { k: 'Wikipedia deauth', v: <a className="underline" href="https://en.wikipedia.org/wiki/Wi-Fi_deauthentication_attack" target="_blank" rel="noreferrer">en.wikipedia.org/wiki/Wi-Fi_deauthentication_attack</a> },
            { k: 'FCC Marriott Decree', v: <a className="underline" href="https://docs.fcc.gov/public/attachments/DA-14-1444A1.pdf" target="_blank" rel="noreferrer">docs.fcc.gov/public/attachments/DA-14-1444A1.pdf</a> },
            { k: 'PMKID disclosure', v: <a className="underline" href="https://hashcat.net/forum/thread-7717.html" target="_blank" rel="noreferrer">hashcat.net/forum/thread-7717.html</a> },
            { k: 'IEEE 802.11w', v: <>Standard "Protected Management Frames", ratificado em 2009</> },
            { k: 'Wi-Fi DevBoard docs', v: <a className="underline" href="https://docs.flipper.net/development/hardware/wifi-devboard" target="_blank" rel="noreferrer">docs.flipper.net/development/hardware/wifi-devboard</a> },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
