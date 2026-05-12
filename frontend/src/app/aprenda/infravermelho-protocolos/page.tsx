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

export const metadata = getModuleMetadata('infravermelho-protocolos');
const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que controles remotos IR usam uma portadora modulada (36-40 kHz) em vez de simplesmente piscar o LED em on/off?',
    options: [
      'Porque o LED IR só funciona em frequências altas.',
      'Para que o receptor possa filtrar a luz ambiente (sol, lâmpadas) com um filtro passa-banda + envelope detector — sem portadora, qualquer fonte luminosa saturaria o fotodiodo.',
      'Para reduzir consumo de bateria do controle.',
      'Por exigência da ANATEL.',
    ],
    correct: 1,
    explanation:
      'Receptores TSOP têm filtro analógico centrado na portadora (38 kHz típico) + demodulador de envelope. Luz ambiente é DC ou 100/120 Hz (lâmpadas) — fora da banda. Resultado: rejeição forte de ruído, alcance de 5-10m com 2 LEDs comuns.',
  },
  {
    question: 'No protocolo NEC, qual a função do "inverso do comando" (~cmd) enviado após cmd?',
    options: [
      'Cripta o comando contra cópias.',
      'Redundância para validação: receptor verifica que cmd XOR ~cmd == 0xFF; reduz drasticamente erros causados por interferência ou recepção parcial.',
      'É um campo legado sem uso desde 1995.',
      'Indica a versão do protocolo.',
    ],
    correct: 1,
    explanation:
      'NEC envia addr, ~addr, cmd, ~cmd. Cada byte vem com seu complemento. Se a soma XOR não der 0xFF, o frame é descartado. É detecção de erro simples mas eficaz para um meio óptico com possibilidade de bursts de luz parasita.',
  },
  {
    question: 'Qual a diferença fundamental entre NEC e Sony SIRC na codificação de bits?',
    options: [
      'NEC usa Manchester, SIRC usa NRZ.',
      'NEC usa pulse-distance (gap variável determina o bit), SIRC usa pulse-width (largura do burst variável); ambos com portadora mas em frequências e estratégias distintas.',
      'NEC é digital e SIRC é analógico.',
      'NEC opera em 940 nm e SIRC em 850 nm.',
    ],
    correct: 1,
    explanation:
      'NEC: burst fixo (560µs) + gap variável → "1" tem gap longo (1690µs), "0" tem gap curto (560µs). SIRC: largura do burst varia → "1" = 1200µs, "0" = 600µs, gap fixo 600µs. Codificações diferentes, ambas robustas.',
  },
  {
    question: 'Para que serve o bit "toggle" no protocolo RC5?',
    options: [
      'Liga e desliga a TV.',
      'Inverte a cada novo press, permitindo ao receptor distinguir "segurar a tecla" (toggle não muda, repeat) de "pressionar duas vezes" (toggle alterna).',
      'É um bit de paridade.',
      'Indica se o controle está em modo TV ou DVD.',
    ],
    correct: 1,
    explanation:
      'Sem o toggle, "press 2x rápido" e "manter pressionado" produziriam frames idênticos. Toggle muda só em press novo; repeat envia o frame com o mesmo toggle. Receptor de TV usa isso para diferenciar volume_up x1 de volume_up segurado.',
  },
  {
    question: 'O que é o TV-B-Gone (Mitch Altman, 2008) e por que é didático para entender IR?',
    options: [
      'Um app de Android para controlar TVs antigas.',
      'Um chaveiro que cicla códigos POWER de centenas de marcas/protocolos em sequência (~1-2 minutos), ensinando empiricamente a heterogeneidade do mundo IR e cobertura por força bruta de tabela.',
      'Um chip da Texas Instruments para automação residencial.',
      'Um brinquedo descontinuado pela FCC.',
    ],
    correct: 1,
    explanation:
      'TV-B-Gone tem um banco de dados embutido com pulso-padrão de POWER de centenas de modelos. Ele transmite todos em sequência, alternando NEC/SIRC/RC5/RC6/Samsung/etc. Em ~2 min cobre quase tudo. Didático porque mostra que "controle universal" é só uma tabela bem grande.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="infravermelho-protocolos"
      title="IR: NEC, Sony SIRC, RC5/6 — universal remote por dentro"
      icon="📺"
      xp={40}
      readTime={8}
      trailName="Flipper Zero & Hardware Hacking"
      trailColor={accent}
      nextSlug="ibutton-1-wire"
      nextTitle="iButton: Dallas DS1990A, Cyfral, Metakom em prédios brasileiros"
      quiz={quiz}
    >
      <Section title="Por que IR existe ainda em 2026" accent={accent}>
        <p className="text-sm leading-7" style={{ color: 'var(--ffv-muted)' }}>
          Bluetooth, Wi-Fi, Zigbee, Matter — temos rádio sobrando. Mesmo assim, qualquer TV, ar
          condicionado split, projetor ou aparelho de som vendido neste exato instante traz no
          mínimo um receptor IR. <strong>Por quê?</strong> Custo (LED IR + TSOP custa centavos),
          <strong>simplicidade</strong> (sem pareamento, sem credencial, sem stack), e
          <strong>determinismo</strong> (linha de visão direta — o controle do quarto não atinge a TV
          da sala). É a interface humano-aparelho que <em>just works</em> há 40 anos.
        </p>
        <Callout tone="success" icon="🔆">
          <strong>IR é o protocolo "bom o suficiente"</strong> que ninguém substituiu. Bluetooth tem
          handshake, IR tem <InlineCode>~50ms</InlineCode> entre apertar a tecla e a TV ligar.
          Latência insuperável.
        </Callout>
      </Section>

      <Section title="Camada física: 940 nm + portadora 38 kHz" accent={accent}>
        <AnnotatedFormula
          accent={accent}
          title="Modulação IR genérica"
          formula="LED(t) = bit(t) × carrier(38 kHz)"
          parts={[
            { text: 'LED(t)', annotation: 'corrente no LED IR (940 nm) — invisível ao olho', highlight: true },
            { text: 'bit(t)', annotation: '0 ou 1 conforme protocolo (NEC, SIRC, RC5, ...)' },
            { text: 'carrier(38 kHz)', annotation: 'onda quadrada modulando — receptor TSOP filtra essa banda', highlight: true },
          ]}
        />

        <p className="text-sm leading-7" style={{ color: 'var(--ffv-muted)' }}>
          O receptor (família <strong>TSOP17xx</strong> Vishay, ou equivalentes) tem filtro analógico
          passa-banda centrado em 38 kHz (variantes 36/40/56 kHz para Sony/Bang &amp; Olufsen) +
          demodulador de envelope + AGC. Saída digital direto para o microcontrolador: HIGH quando
          não há sinal, LOW quando recebe burst modulado. Por isso a luz solar direta forte mata o
          alcance — saturação do fotodiodo.
        </p>

        <CodeBlock lang="text">
{`Onda no ar (NEC, bit "1"):

LED:     ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁
              ▔▔▔▔▔▔▔▔▔▔▔▔
              <-- 560us burst de 38 kHz -->
                         <-- 1690us gap (LED off) -->

Saída do TSOP (já demodulado):

         ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
                ▁▁▁▁▁▁▁▁▁▁▁▁
                <- 560us LOW ->
                            <- 1690us HIGH ->
`}
        </CodeBlock>

        <Callout tone="info" icon="📡">
          O TSOP <strong>inverte</strong>: burst no ar = LOW na saída. E aplica <strong>histerese</strong>{' '}
          via AGC — se você manda burst muito longo (mais de ~30 ms contínuos) ele "desensibiliza"
          temporariamente para evitar travar em ruído. Por isso protocolos curtos (sub-100 ms) são a
          norma.
        </Callout>
      </Section>

      <Section title="NEC — o mais comum" accent={accent}>
        <FlowDiagram
          accent={accent}
          title="Pacote NEC completo"
          orientation="vertical"
          steps={[
            { icon: '🟦', label: 'Header burst', desc: '9000µs ON (38 kHz) — sincroniza receptor' },
            { icon: '⬜', label: 'Header gap', desc: '4500µs OFF — completa o "leader"' },
            { icon: '🅰️', label: 'Address (8 bits)', desc: 'identifica o aparelho (TV, AC, etc.)' },
            { icon: '🅰️', label: '~Address (8 bits)', desc: 'complemento, validação' },
            { icon: '🅒', label: 'Command (8 bits)', desc: 'tecla pressionada' },
            { icon: '🅒', label: '~Command (8 bits)', desc: 'complemento, validação' },
            { icon: '🛑', label: 'Final burst', desc: '560µs — fecha o frame' },
          ]}
        />

        <KeyValue
          accent={accent}
          items={[
            { k: 'Portadora', v: '38 kHz (duty cycle ~33%)' },
            { k: 'Modulação', v: 'pulse-distance (burst fixo 560µs, gap variável)' },
            { k: 'Bit "1"', v: '560µs burst + 1690µs gap (~2.25ms total)' },
            { k: 'Bit "0"', v: '560µs burst + 560µs gap (~1.12ms total)' },
            { k: 'Frame total', v: '~67.5ms (header + 32 bits + final)' },
            { k: 'Repeat code', v: '9000µs + 2250µs + 560µs (a cada ~110ms enquanto tecla pressionada)' },
            { k: 'Fabricantes', v: 'Pioneer, Onkyo, Yamaha, JVC, Samsung (variante), LG (variante)' },
          ]}
        />
      </Section>

      <Section title="Sony SIRC — pulse-width" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Portadora', v: '40 kHz' },
            { k: 'Modulação', v: 'pulse-width (largura do burst varia, gap fixo)' },
            { k: 'Header', v: '2400µs burst + 600µs gap' },
            { k: 'Bit "1"', v: '1200µs burst + 600µs gap' },
            { k: 'Bit "0"', v: '600µs burst + 600µs gap' },
            { k: 'Variantes', v: '12 bits (7 cmd + 5 addr), 15 bits, 20 bits' },
            { k: 'Repeat', v: 'frame inteiro retransmitido a cada 45ms enquanto pressionado (mín 3x)' },
            { k: 'LSB first', v: 'sim (NEC também é LSB first)' },
          ]}
        />
      </Section>

      <Section title="RC5 e RC6 — Manchester bi-fase" accent={accent}>
        <p className="text-sm leading-7" style={{ color: 'var(--ffv-muted)' }}>
          Philips foi diferente: codificação <strong>Manchester</strong>. Cada bit tem transição no
          meio. Bit "0" = HIGH→LOW, bit "1" = LOW→HIGH. Vantagem: clock recovery embutida no sinal,
          imunidade a drift de cristal do TX. Desvantagem: dobro da largura de banda.
        </p>

        <CodeBlock lang="text">
{`RC5 — 14 bits @ 36 kHz, Manchester:

  S1  S2  T  A4 A3 A2 A1 A0  C5 C4 C3 C2 C1 C0
  ▔▁  ▔▁  ▔▁  ...

  S1, S2 = start bits (sempre 1)
  T      = toggle (inverte por press novo)
  A0..A4 = address (5 bits, 32 grupos)
  C0..C5 = command (6 bits, 64 comandos)

Bit time: 1.778ms (32 ciclos de 36 kHz). Frame total: ~25ms.

RC6 — 6T leader + start + mode (3 bits) + toggle (2T) + 16/32 bits info.
Permite frames de até 36 bits, multimodo (RC6-0, RC6-6 Microsoft MCE).
`}
        </CodeBlock>

        <Callout tone="info" icon="🌀">
          <strong>RC6 mode 6</strong> é o que controles Windows Media Center usavam (e Xbox 360
          usava). Frames de 32 bits + customer code permitem mais devices sem colisão de codespace.
        </Callout>
      </Section>

      <Section title="Tabela comparativa de protocolos" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Protocolo', 'Portadora', 'Modulação', 'Bits', 'Validação', 'Uso típico']}
          rows={[
            ['NEC', '38 kHz', 'pulse-distance', '32 (8+8+8+8)', 'addr/cmd + complemento', 'Pioneer, Onkyo, JVC, splits AC chineses'],
            ['NEC extended', '38 kHz', 'pulse-distance', '32 (16+8+8)', 'só cmd + complemento', 'Apple Remote (gen1)'],
            ['Sony SIRC', '40 kHz', 'pulse-width', '12 / 15 / 20', 'nenhuma (3x retransmit)', 'TVs, hifi e Blu-ray Sony'],
            ['RC5', '36 kHz', 'Manchester', '14', 'toggle bit', 'Philips, Marantz'],
            ['RC6', '36 kHz', 'Manchester + leader', '16-36', 'toggle bit + mode', 'Philips moderno, Microsoft MCE, Xbox 360'],
            ['Samsung', '38 kHz', 'pulse-distance', '32', 'similar NEC, header diferente (4.5+4.5ms)', 'TVs e ACs Samsung'],
            ['Panasonic / Kaseikyo', '37 kHz', 'pulse-distance', '48', 'OEM code + checksum', 'Panasonic, Denon, Mitsubishi'],
          ]}
        />
      </Section>

      <Section title="Flipper Zero: TX, RX e o app Universal Remote" accent={accent}>
        <ArchFlow
          accent={accent}
          title="Hardware IR no Flipper Zero"
          columns={[
            {
              header: 'TX (transmissão)',
              headerColor: accent,
              items: ['LED IR alta potência (940 nm)', 'Driver com transistor + resistor', 'Alcance prático ~10 m', 'Modula portadora via TIM do STM32WB55'],
              footer: 'Mais forte que controles comerciais — atravessa salas',
            },
            {
              header: 'RX (recepção)',
              headerColor: '#0ea5e9',
              items: ['TSOP-style integrated receiver', 'Filtro 38 kHz banda larga', 'Saída digital → input capture STM32', 'Decodifica timing → protocolo'],
              footer: 'Auto-detecta NEC/SIRC/RC5/RC6/Samsung/Kaseikyo',
            },
            {
              header: 'Universal Remote app',
              headerColor: '#a855f7',
              items: ['DB de TVs, ARs, projetores, áudio', 'Cycle de POWER/VOLUME por marca', 'Salva sinais em .ir (formato texto)', 'Custom buttons via UI'],
              footer: 'Compatível com libs comunitárias gigantes',
            },
          ]}
        />

        <CodeBlock lang="text" filename="my_remote.ir">
{`Filetype: IR signals file
Version: 1
#
name: Power
type: parsed
protocol: NEC
address: 04 00 00 00
command: 08 00 00 00
#
name: Vol_up
type: parsed
protocol: NEC
address: 04 00 00 00
command: 0E 00 00 00
#
name: Custom_AC_25C
type: raw
frequency: 38000
duty_cycle: 0.330000
data: 9024 4512 564 564 564 1692 564 1692 564 564 ...
`}
        </CodeBlock>

        <Callout tone="neutral" icon="📦">
          Bibliotecas comunitárias úteis: <InlineCode>jamisonderek/flipper-zero-tutorials</InlineCode>{' '}
          e <InlineCode>UberGuidoZ/Flipper</InlineCode> mantêm milhares de arquivos{' '}
          <InlineCode>.ir</InlineCode> de TVs, projetores, ar-condicionados, sound bars, ventiladores
          de teto, portões de garagem (RC seguro só os antigos), etc.
        </Callout>
      </Section>

      <Section title="TV-B-Gone: didática do código" accent={accent}>
        <p className="text-sm leading-7" style={{ color: 'var(--ffv-muted)' }}>
          Mitch Altman criou em 2008 um chaveiro com microcontrolador AVR + LED IR. O firmware tem
          uma tabela com pulso-padrão de POWER de centenas de modelos de TV em vários protocolos.
          Ao apertar o botão, ele <strong>cicla a tabela inteira em ~2 minutos</strong>: NEC,
          SIRC, RC5, Kaseikyo, Samsung, ainda assim em ordem otimizada (marcas mais comuns
          primeiro).
        </p>

        <Timeline
          accent={accent}
          title="História do IR de consumo"
          events={[
            { when: '1980', label: 'Sony SIRC', detail: 'TV Trinitron com controle a "pulse-width" 40 kHz.' },
            { when: '1985', label: 'Philips RC5', detail: 'Padroniza Manchester 36 kHz + toggle bit.', highlight: true },
            { when: '1990', label: 'NEC popularizado', detail: 'Hitachi/Pioneer/Onkyo adotam variantes; vira de facto da Ásia.', highlight: true },
            { when: '1994', label: 'Panasonic Kaseikyo', detail: 'Padrão japonês 48 bits para áudio/vídeo.' },
            { when: '2002', label: 'RC6', detail: 'Philips moderniza para Microsoft MCE + Xbox 360.' },
            { when: '2008', label: 'TV-B-Gone', detail: 'Mitch Altman; populariza o conceito de "cycle por força bruta".' },
            { when: '2015+', label: 'HDMI-CEC', detail: 'Reduz uso de IR para inputs/volume — mas POWER ainda é IR.' },
            { when: '2024+', label: 'Flipper Zero', detail: 'Universal remote acessível com TX potente.' },
          ]}
        />

        <Callout tone="success" icon="✅">
          <strong>IR não tem zona cinza legal.</strong> É linha de visão, baixíssima potência
          (~mW óticos), não é rádio sob jurisdição da ANATEL. Você pode transmitir o que quiser. O
          que pode incomodar é uso em local público (silenciar TV em bar) — discussão de etiqueta,
          não jurídica.
        </Callout>
      </Section>

      <Section title="Mini-projeto guiado: capturar e replicar POWER" accent={accent}>
        <FlowDiagram
          accent={accent}
          title="Workflow Flipper Zero"
          orientation="vertical"
          steps={[
            { icon: '1️⃣', label: 'Apps → Infrared → Learn New Remote', desc: 'aponta o controle original para o Flipper' },
            { icon: '2️⃣', label: 'Aperte POWER', desc: 'Flipper detecta protocolo + addr + cmd ou grava raw' },
            { icon: '3️⃣', label: 'Salve e nomeie', desc: 'protocolo NEC, addr 0x04, cmd 0x08, name "Power"' },
            { icon: '4️⃣', label: 'Aponte Flipper para a TV', desc: 'aperte o botão "Power" no Flipper — TV liga/desliga' },
            { icon: '5️⃣', label: 'Edite o .ir no SD', desc: 'monte SD via qFlipper, copie .ir, comparta no GitHub' },
          ]}
        />

        <QAItem
          q="Posso fazer um controle universal só com Flipper?"
          a={
            <>
              Sim — o app Universal Remote tem DB de POWER de centenas de marcas. Basta selecionar a
              marca e ele cicla os códigos POWER conhecidos até a TV reagir. Para controle completo
              (volume, canal, menu) você precisa de remote específico do modelo, salvo em arquivo{' '}
              <InlineCode>.ir</InlineCode> baixado das libs comunitárias.
            </>
          }
        />

        <QAItem
          q="Por que meu Flipper não consegue controlar uma TV nova de 2024?"
          a={
            <>
              Algumas TVs modernas migraram POWER para Bluetooth LE (controle do Apple TV 4K, Roku
              voice remote, alguns LG webOS). Outras usam <InlineCode>HDMI-CEC</InlineCode> para
              controle cruzado e o IR fica só para POWER, mas com código não-padrão. Para esses
              casos: BLE (Flipper precisa app específico) ou app oficial do fabricante.
            </>
          }
        />
      </Section>

      <Section title="Decisão: que protocolo pra meu device hobbyista" accent={accent}>
        <DecisionBox
          scenario="Vou criar meu próprio device IR (controle Arduino, automação)"
          winner="NEC com 38 kHz"
          winnerColor={accent}
          why="Mais documentado, mais bibliotecas (IRremote no Arduino, IRMP em C, lirc no Linux), simples de decodificar com input capture timer. Validação por complemento dá robustez de graça."
          alternatives={[
            { name: 'Sony SIRC', when: 'Você quer compatibilidade com TVs Sony existentes ou frame curto.' },
            { name: 'RC5', when: 'Projeto educacional para entender Manchester + clock recovery.' },
            { name: 'Raw / .ir', when: 'Você está apenas replicando um aparelho proprietário (ar-condicionado obscuro). Captura raw timing e replay.' },
          ]}
        />
      </Section>

      <Section title="MindMap: tudo que cabe em IR" accent={accent}>
        <MindMap
          accent={accent}
          root="Infravermelho de consumo"
          branches={[
            {
              title: 'Camada física',
              items: ['LED 940 nm (não 650 nm — esse é vermelho visível)', 'Portadora 36-40 kHz', 'TSOP receiver com filtro analógico', 'Linha de visão direta'],
            },
            {
              title: 'Codificações',
              items: ['Pulse-distance (NEC)', 'Pulse-width (SIRC)', 'Manchester (RC5/6)', 'Header longo distintivo'],
            },
            {
              title: 'Validação',
              items: ['Complemento de bytes (NEC)', 'Toggle bit (RC5/6)', 'Retransmissão 3x+ (SIRC)', 'Customer code (Kaseikyo)'],
            },
            {
              title: 'Casos especiais',
              items: ['ACs com payload longo (~80 bits)', 'Air mouse usa IR puro (raro)', 'Apple Remote NEC extended', 'Bang & Olufsen 455 kHz portadora ímpar'],
            },
          ]}
        />
      </Section>

      <Section title="Referências canônicas" accent={accent}>
        <NodeGraph
          accent={accent}
          title="URLs e datasheets"
          legend="Bookmarke essas — são as fontes que importam"
          columns={[
            {
              label: 'Tutoriais clássicos',
              nodes: [
                { icon: '📖', label: 'sbprojects.net/knowledge/ir/', sub: 'NEC, SIRC, RC5/6, Kaseikyo passo a passo' },
                { icon: '📖', label: 'altdevarchives.com', sub: 'TV-B-Gone history' },
              ],
            },
            {
              label: 'Datasheets',
              nodes: [
                { icon: '📕', label: 'Vishay TSOP17xx', sub: 'vishay.com/docs/82476/' },
                { icon: '📕', label: 'Vishay AN dataform', sub: 'vishay.com/docs/80071/dataform.pdf' },
              ],
            },
            {
              label: 'Bibliotecas',
              nodes: [
                { icon: '🐙', label: 'IRremote (Arduino)', sub: 'github.com/Arduino-IRremote' },
                { icon: '🐙', label: 'jamisonderek/flipper-zero-tutorials', sub: 'tutoriais + .ir files' },
                { icon: '🐙', label: 'UberGuidoZ/Flipper', sub: 'mega DB de remotes' },
                { icon: '🐧', label: 'lirc.org', sub: 'Linux Infrared Remote Control daemon' },
              ],
            },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
