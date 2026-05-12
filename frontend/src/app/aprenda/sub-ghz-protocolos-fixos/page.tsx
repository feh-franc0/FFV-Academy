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
  NodeGraph,
  AnnotatedFormula,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('sub-ghz-protocolos-fixos');
const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que um replay direto funciona em controles que usam EV1527?',
    options: [
      'Porque o EV1527 é encriptado mas o atacante quebra AES em segundos',
      'Porque o EV1527 transmite ID fixo de 20 bits + 4 bits de botão sem nenhum elemento de freshness (nonce, contador, timestamp). O receptor não distingue um pacote vivo de um gravado: a única coisa que ele compara é o ID contra a tabela de IDs aprendidos. Capturar o pacote OOK uma vez e re-emitir com o mesmo timing ativa o relé',
      'Porque o Flipper Zero quebra o LFSR do EV1527 com poucas amostras',
      'Porque o sub-GHz é criptografado em hardware mas os fabricantes desabilitam a chave',
    ],
    correct: 1,
    explanation: 'EV1527 (Holtek HS1527) é por design um codificador de ID estático: 20 bits queimados em fábrica + 4 bits de botão, codificados em PWM/OOK. Não há challenge, não há contador. O datasheet (Holtek HS1527 v2.20) é explícito: a unicidade é probabilística (2^20 ≈ 1M IDs), não criptográfica. Sistemas pré-2010 escolheram isso por custo (~US$0.08/chip) e simplicidade do receptor (shift register + comparator).',
  },
  {
    question: 'O CAME 12-bit (algumas instalações de portão antigas na Europa) é considerado especialmente frágil. Por quê?',
    options: [
      'Porque transmite a chave AES em claro',
      'Porque o espaço de códigos é apenas 2^12 = 4096 combinações. Bruteforce sequencial transmitindo cada possibilidade três vezes (margem do receptor) cabe em poucos minutos a 433.92 MHz. Repositórios públicos como flipperzero-bruteforce (tobiabocchi) e flipperzero-subbrute geram a sequência completa pré-computada como um único arquivo .sub',
      'Porque usa LoRa com SF muito alto',
      'Porque qualquer cartão NFC HID Prox quebra ele',
    ],
    correct: 1,
    explanation: 'CAME 12-bit é um codificador de IDs com apenas 12 dip-switches/jumpers (espaço 4096). Mesmo sem capturar nenhum pacote do dono, varrer todo o espaço a 433.92 MHz com OOK leva ~2 minutos. Em hardware proprio é demonstração; em portão alheio é Art. 154-A do Código Penal brasileiro (invasão de dispositivo informático).',
  },
  {
    question: 'Qual a diferença prática entre PT2262 e EV1527 do ponto de vista de quem analisa o sinal capturado?',
    options: [
      'Não há diferença',
      'PT2262/SC5262 (Princeton) usa codificação ternária: cada bit de endereço pode ser 0, 1 ou "float" (alta impedância via resistor pull). Pacote típico tem 12 trits (~24 bits no ar) + sync. EV1527 é puramente binário, 24 bits (20 ID + 4 botão) + sync. PT2262 tem o "float state" porque foi pensado para configuração via dip-switch de 3 posições; EV1527 tem ID queimado em fábrica e nasce binário',
      'PT2262 usa AES-128, EV1527 não usa nada',
      'EV1527 transmite em 2.4 GHz, PT2262 em 433 MHz',
    ],
    correct: 1,
    explanation: 'A codificação ternária do PT2262 é uma decisão histórica de hardware: dip-switches de 3 posições (GND/VCC/aberto). Tools como antirez/protoview e o decoder do Flipper detectam essas três duty cycles distintos no envelope OOK. EV1527 é binário porque o Holtek HS1527 substitui dip-switches pelo ID em ROM.',
  },
  {
    question: 'Em um portão de pré-2010 com EV1527, qual a defesa mínima realista que recupera segurança?',
    options: [
      'Trocar a antena',
      'Trocar o módulo receptor por um que aceite rolling code (KeeLoq HCS301, Security+ 2.0 ou similar). Não existe "patch de software" para EV1527 — o problema é a ausência de freshness no protocolo, e o controle remoto barato não tem CPU para executar derivação de chave. A migração de hardware é a única correção',
      'Mudar a frequência de 433 para 315 MHz',
      'Adicionar um capacitor maior na bateria do controle',
    ],
    correct: 1,
    explanation: 'EV1527 é fixo por construção do silício. Migrar para HCS301/KeeLoq introduz contador encriptado (próximo módulo). É comum o instalador trocar só o módulo receptor + controles e reaproveitar motor + braço.',
  },
  {
    question: 'Por que a captura ".sub" do Flipper Zero contém timing bruto e não só "código X"?',
    options: [
      'Porque é bug',
      'Porque protocolos OOK Sub-GHz codificam dados em larguras de pulso (PWM) e gaps entre pulsos. Sem o timing exato (em microssegundos) o receptor descarta o pacote — cada protocolo tem janelas estritas de tolerância (PT2262 ~ 400μs por bit base, EV1527 ~ 250–350μs). O .sub guarda RAW pulse-train (sequência de durações alto/baixo) precisamente porque o decoder pode ser desconhecido na hora da captura, e raw replay não exige decodificar',
      'Porque o Flipper só sabe falar LoRa',
      'Porque é necessário para passar TLS',
    ],
    correct: 1,
    explanation: 'A view RAW do Flipper grava o pulso de 433.92 MHz como sequência de durations. Isso é genérico: replaya qualquer protocolo OOK desconhecido. Quando o protocolo é reconhecido (PT2262, EV1527, etc.), o app salva também o decoded payload. Pra cryptanalysis e bruteforce o decoded importa; pra replay, raw basta.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="sub-ghz-protocolos-fixos"
      title="PT2262, EV1527, CAME: protocolos fixos e por que replay funciona"
      icon="🔓"
      xp={50}
      readTime={9}
      trailName="Flipper Zero & Hardware Hacking"
      trailColor={accent}
      nextSlug="rolling-codes-keeloq-rolljam"
      nextTitle="Rolling codes & RollJam"
      quiz={quiz}
    >
      <Section title="Contexto: Sub-GHz no mundo real" accent={accent}>
        <p>
          A faixa Sub-GHz (em ISM 315/433.92/868/915 MHz, dependendo do país) é onde vivem milhões de
          controles de portão, alarmes residenciais, sensores de janela, bloqueadores veiculares
          legados, controles de barreira de estacionamento e termômetros wireless. A maioria desses
          dispositivos foi projetada entre 1990 e 2010, quando o critério de escolha do silício era{' '}
          <strong>menor custo possível</strong>. O resultado é uma família de codificadores OOK (On-Off
          Keying) que transmitem o mesmo pacote sempre que o usuário aperta o botão. Sem nonce. Sem
          contador. Sem chave. Apenas um <em>shift register</em> emitindo um identificador.
        </p>
        <p className="mt-3">
          Este módulo explica por que <strong>replay direto funciona</strong> em PT2262, EV1527, Linear,
          NICE FLO legado, BFT Mitto, Faac SLH legado e CAME 12-bit; o que cada protocolo realmente
          põe no ar; e por que a defesa real exige troca de hardware (próximo módulo).
        </p>
        <Callout tone="warn">
          <strong>Enquadramento ético.</strong> Tudo que vem a seguir é descrito no modelo
          &ldquo;como funciona por dentro&rdquo;. Aplicar contra hardware alheio configura Art. 154-A
          do CP (invasão de dispositivo informático) e Art. 155 (furto qualificado, se houver
          subtração subsequente). Os experimentos válidos são <strong>contra hardware próprio</strong>{' '}
          ou em <strong>laboratório com consentimento documentado</strong>.
        </Callout>
      </Section>

      <Section title="Protocolos fixos vs rolling code" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Protocolo', 'Bits no ar', 'Espaço de IDs', 'Replay', 'Ano típico']}
          rows={[
            ['PT2262 / SC5262', '~12 trits (24 bits)', 'Configurável via dip-switch', 'Sim, direto', '1990s+'],
            ['EV1527 (HS1527)', '24 bits (20 ID + 4 botão)', '2^20 ≈ 1M', 'Sim, direto', '2000s+ (ainda em produção)'],
            ['Linear / Multi-Code', '10–12 bits', '1024 a 4096', 'Sim, bruteforce trivial', '1990s'],
            ['NICE FLO (legado)', '12 bits', '4096', 'Sim', '1990s'],
            ['BFT Mitto (legado)', '12 bits', '4096', 'Sim', '1990s'],
            ['CAME 12-bit', '12 bits', '4096', 'Sim, bruteforce em ~2min', '1990–2005'],
            ['KeeLoq HCS301', '66 bits (32 cripto)', '2^28 serial × 2^16 contador', 'NÃO (contador)', '1996+'],
          ]}
        />
        <p className="mt-3 text-sm" style={{ color: 'var(--ffv-text2)' }}>
          A linha de KeeLoq está só como referência: ela inaugura a era do contador encriptado e é
          tema do módulo seguinte. Tudo acima dela é &ldquo;protocolos fixos&rdquo;.
        </p>
      </Section>

      <Section title="PT2262: codificação ternária e o porquê do float" accent={accent}>
        <p>
          O <strong>Princeton Technology PT2262</strong> (e variantes SC5262, HT12E etc.) foi desenhado
          para casar com seu par <em>decoder</em> PT2272. O par tinha 12 pinos de endereço configuráveis
          fisicamente por <strong>dip-switches de três posições</strong>: GND, VCC ou{' '}
          <em>aberto</em> (alta impedância). Por isso o &ldquo;bit&rdquo; do PT2262 é, na verdade, um{' '}
          <strong>trit</strong>.
        </p>
        <FlowDiagram
          title="Estrutura do pacote PT2262 no ar (OOK 433.92 MHz)"
          accent={accent}
          steps={[
            { icon: '⏱', label: 'Sync', desc: 'Pulso longo de baixo nível, ~31× α (calibração)' },
            { icon: 'A', label: 'Address (8 trits)', desc: 'GND / VCC / float — replicado do dip-switch' },
            { icon: 'D', label: 'Data (4 trits)', desc: 'Estado dos botões (D0..D3)' },
            { icon: '↺', label: 'Repeat', desc: 'Pacote retransmitido 3–4× enquanto botão pressionado' },
          ]}
        />
        <CodeBlock lang="text" filename="captura .sub do Flipper — PT2262">
{`Filetype: Flipper SubGhz RAW File
Version: 1
Frequency: 433920000
Preset: FuriHalSubGhzPresetOok650Async
Protocol: RAW
RAW_Data: -10100 410 -1230 410 -410 1230 -1230 410 -410 1230
          -1230 410 -1230 410 -410 1230 -410 1230 -1230 410
          -410 1230 -1230 410 -410 1230 ...
# pulsos positivos = HIGH (carrier on), negativos = LOW (carrier off)
# duração em microssegundos`}
        </CodeBlock>
        <Callout tone="info">
          <strong>Por que tres estados em um único fio?</strong> Em 1991, dip-switches de três
          posições eram <em>mais baratos</em> do que dois dip-switches separados ou EEPROM. O ternário
          é uma otimização de BOM, não de segurança. Decoders modernos (antirez/protoview,
          rtl_433, Universal Radio Hacker) detectam o terceiro estado por análise de duty cycle do
          envelope OOK.
        </Callout>
      </Section>

      <Section title="EV1527 (Holtek HS1527): ID em ROM" accent={accent}>
        <p>
          O <InlineCode>HS1527</InlineCode> é o codificador OOK mais comum em controles de portão
          baratos do Brasil pós-2005. Cada chip tem um <strong>ID de 20 bits queimado em fábrica</strong>
          (one-time programmable). Não é regravável, e não é repetido entre chips por garantia
          probabilística (2^20 ≈ 1.048.576 combinações).
        </p>
        <AnnotatedFormula
          title="Pacote EV1527 (24 bits + sync)"
          accent={accent}
          formula="[ Sync 1×low ] [ ID20 ] [ B3 B2 B1 B0 ] [ repeat ×3..6 ]"
          parts={[
            { text: 'Sync', annotation: 'gap longo (~10ms low) — receptor reconhece início' },
            { text: 'ID20', annotation: '20 bits queimados em fábrica, IMUTÁVEIS', highlight: true },
            { text: 'B3..B0', annotation: '4 bits de estado de botão (até 15 botões físicos)' },
            { text: 'repeat', annotation: 'pacote inteiro retransmitido 3–6× para tolerar interferência', highlight: true },
          ]}
        />
        <KeyValue
          accent={accent}
          items={[
            { k: 'Bit time base', v: '~250–350 μs (configurável por resistor RC externo)' },
            { k: 'Codificação', v: 'PWM: bit "1" = pulso alto longo + baixo curto; bit "0" = inverso' },
            { k: 'Modulação RF', v: 'OOK em 315 MHz (US) ou 433.92 MHz (BR/EU)' },
            { k: 'Receptor típico', v: 'Super-regen ou superhet barato + comparator + microcontrolador 8-bit' },
            { k: 'Auth', v: 'NENHUMA — match de ID na tabela de aprendizagem' },
          ]}
        />
        <Callout tone="danger">
          <strong>Consequência prática.</strong> Se o portão do prédio aprende controles EV1527, um
          atacante com receptor a 30 metros captura o pacote em qualquer aperto legítimo e replaya
          mais tarde. Não há defesa <em>no controle</em>. A solução é trocar o conjunto receptor +
          controles por modelo com rolling code.
        </Callout>
      </Section>

      <Section title="CAME 12-bit: bruteforce caseiro" accent={accent}>
        <p>
          Algumas instalações antigas (especialmente Itália/Europa, e alguns clones brasileiros)
          usaram codificadores com <strong>apenas 12 bits</strong> de espaço — {' '}
          <InlineCode>2^12 = 4096</InlineCode> combinações. Não é só EV1527 reduzido: é um codificador
          mais simples ainda, com dip-switch de 12 posições.
        </p>
        <AnnotatedFormula
          title="Tempo de bruteforce contra CAME 12-bit"
          accent={accent}
          formula="T = N_codigos × N_repeticoes × T_pacote"
          parts={[
            { text: 'N_codigos = 4096', annotation: 'espaço completo de 12 bits', highlight: true },
            { text: 'N_repeticoes = 3', annotation: 'cada código transmitido 3× (margem do receptor)' },
            { text: 'T_pacote ≈ 25 ms', annotation: '12 bits × ~2ms/bit + gap' },
            { text: 'T ≈ 5 minutos', annotation: 'sem otimização; ~2 min com sequência reduzida (Gray code)', highlight: true },
          ]}
        />
        <p className="mt-3">
          Repositórios como <InlineCode>tobiabocchi/flipperzero-bruteforce</InlineCode> e{' '}
          <InlineCode>DarkFlippers/unleashed-firmware</InlineCode> distribuem o arquivo .sub
          pré-computado com toda a sequência. O Flipper só executa replay sequencial.
        </p>
      </Section>

      <Section title="Por que receptores aceitam: o lado do CI 8-bit" accent={accent}>
        <NodeGraph
          title="Anatomia de um receptor de portão pré-2010"
          accent={accent}
          columns={[
            {
              label: 'RF front-end',
              nodes: [
                { icon: '📡', label: 'Antena 433.92 MHz', sub: 'whip 17cm' },
                { icon: '🔻', label: 'Super-regen', sub: 'detector OOK barato' },
              ],
            },
            {
              label: 'Decodificação',
              nodes: [
                { icon: '⚖', label: 'Comparator', sub: 'envelope → digital' },
                { icon: '🧮', label: 'Shift register 24-bit', sub: 'PT2272 / clone' },
              ],
            },
            {
              label: 'Lógica',
              nodes: [
                { icon: '🔍', label: 'Match contra EEPROM', sub: 'tabela de IDs aprendidos', tone: 'emphasis' },
                { icon: '⚡', label: 'Aciona relé', sub: 'motor on', tone: 'success' },
                { icon: '⌫', label: 'Sem freshness check', sub: 'sem nonce, sem contador', tone: 'danger' },
              ],
            },
          ]}
          legend="Toda a lógica cabe em ~200 bytes de firmware num PIC 8-bit de US$0.30."
        />
        <p className="mt-3">
          Não há &ldquo;bug&rdquo; a corrigir: a especificação contratual entre PT2262 e PT2272 (ou
          HS1527 e seu decoder) é justamente <em>match de ID puro</em>. O receptor cumpre a spec.
          A vulnerabilidade está no design da spec, em uma era em que a economia da BOM dominava.
        </p>
      </Section>

      <Section title="Linha do tempo: por que tantos sistemas ainda usam isso" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            {
              when: '1991',
              label: 'Princeton lança PT2262/PT2272',
              detail: 'Codificador/decodificador OOK em CMOS 1µm. US$0.30 cada. Vira padrão de fato em controles remotos baratos.',
            },
            {
              when: '1996',
              label: 'KeeLoq HCS301 lançado pela Microchip',
              detail: 'Inaugura rolling code com cipher 32-bit. Indústria automotiva adota imediatamente; portões residenciais demoram ~10 anos a migrar por causa do custo.',
            },
            {
              when: '2002',
              label: 'Holtek HS1527 popularizado',
              detail: 'Versão "ID em ROM" do PT2262. Substitui dip-switch por ID queimado. Vira o codificador padrão de controle clonável genérico.',
            },
            {
              when: '2014',
              label: 'rtl_433 e Universal Radio Hacker amadurecem',
              detail: 'Decodificação Sub-GHz com SDR de US$10 vira commodity acadêmica e hobby.',
              highlight: true,
            },
            {
              when: '2020',
              label: 'Flipper Zero entra em pre-order via Kickstarter',
              detail: 'Hardware dedicado (CC1101) + UI consolidam o que antes exigia laptop + SDR.',
              highlight: true,
            },
            {
              when: '2026',
              label: 'EV1527 ainda em fabricação ativa',
              detail: 'Holtek lista o HS1527 no catálogo atual. Custo do silício e inércia de instaladores mantêm o protocolo dominante em condomínios brasileiros antigos.',
            },
          ]}
        />
      </Section>

      <Section title="Defesas para o dono do hardware" accent={accent}>
        <Callout tone="success">
          <strong>1. Trocar o receptor.</strong> Migrar para um conjunto com rolling code KeeLoq
          HCS301 ou superior. Não é &ldquo;patch&rdquo;: é hardware diferente.
        </Callout>
        <Callout tone="success">
          <strong>2. Adicionar segundo fator físico.</strong> Tag NFC DESFire, biometria ou app móvel
          (BLE com challenge-response autenticado). O protocolo Sub-GHz fica como conveniência, não
          como única barreira.
        </Callout>
        <Callout tone="warn">
          <strong>3. NÃO confiar em &ldquo;mudar a frequência&rdquo;.</strong> 315 / 433.92 / 868 são
          todas escaneáveis trivialmente. Segurança por obscuridade de banda não funciona — o atacante
          varre o espectro.
        </Callout>
      </Section>

      <Section title="Referências" accent={accent}>
        <ul className="list-disc pl-5 text-sm" style={{ color: 'var(--ffv-text2)' }}>
          <li>Holtek <em>HS1527 OTP Encoder Datasheet v2.20</em> — <InlineCode>holtek.com</InlineCode></li>
          <li>Princeton Technology <em>PT2262 Remote Control Encoder</em> datasheet</li>
          <li>antirez, <em>ProtoView: a sub-GHz protocol decoder</em> — github.com/antirez/protoview</li>
          <li>tobiabocchi, <em>flipperzero-bruteforce</em> — github.com/tobiabocchi/flipperzero-bruteforce</li>
          <li>DarkFlippers, <em>unleashed-firmware</em> — github.com/DarkFlippers/unleashed-firmware</li>
          <li>merbanan, <em>rtl_433</em> — github.com/merbanan/rtl_433 (decoders para ~200 protocolos OOK)</li>
          <li>Pohl/Noack/Maric, <em>Wireless Insecurity 101</em>, USENIX WOOT 2014 (panorama OOK pre-rolling)</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
