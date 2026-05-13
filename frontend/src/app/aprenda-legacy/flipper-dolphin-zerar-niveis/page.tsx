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
  NodeGraph,
  AnnotatedFormula,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('flipper-dolphin-zerar-niveis');

const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'No firmware oficial do Flipper Zero, qual é o teto de XP por categoria por dia?',
    options: [
      'Sem teto — quanto mais usar, mais XP',
      '15 XP/dia/categoria; reset à meia-noite local; 6 categorias somam até 90 XP/dia teóricos',
      '100 XP/dia total',
      '1 XP por ação sem cap',
    ],
    correct: 1,
    explanation: 'O firmware oficial implementa daily cap de 15 XP por categoria (Sub-GHz, NFC, RFID 125 kHz, IR, iButton, BadUSB). Reset à 00:00 local via RTC. Mecânica anti-grinding — força uso variado. Soma teórica 6 × 15 = 90 XP/dia se você usar todas categorias diariamente. Custom firmwares (Momentum) elevam para 45/categoria.',
  },
  {
    question: 'O que é o "butthurt" no Dolphin?',
    options: [
      'Bug de firmware',
      'Contador (uint32 LE) de "raiva" que sobe quando o Flipper fica ocioso por dias; determina mood/animação no idle screen e cai ao retomar uso',
      'Um badge especial',
      'Versão antiga do icounter',
    ],
    correct: 1,
    explanation: 'butthurt é literal — no source comentado, é o "humor magoado" do Dolphin. Stored em /int/dolphin.state como uint32 little-endian após o icounter. Se o usuário ignora o Flipper por dias, butthurt incrementa periodicamente; mood passa de feliz → neutro → triste → bravo. Volta usar e butthurt decai. Sprite e animações no idle são selecionados em função desse valor.',
  },
  {
    question: 'Onde fica armazenado o estado do Dolphin e qual é o formato?',
    options: [
      'Servidor remoto da Flipper Devices',
      '/int/dolphin.state na flash interna; arquivo binário pequeno (16–32 bytes) com layout struct DolphinStoreData: icounter (uint32 LE), butthurt (uint32 LE), timestamp + flags',
      '/ext/dolphin.json no SD card',
      'EEPROM do CC1101',
    ],
    correct: 1,
    explanation: 'Persistido em /int/dolphin.state (flash interna LFS), não no SD. Formato binário struct empacotada: bytes 0..3 = icounter (uint32 LE), bytes 4..7 = butthurt (uint32 LE), seguidos de timestamp (uint64) e flags. Não há criptografia, validação server-side ou hash de integridade — edição direta funciona. Próximo boot do firmware re-mmaps e usa.',
  },
  {
    question: 'Qual a diferença entre os firmwares oficial, Momentum e RogueMaster no sistema Dolphin?',
    options: [
      'Nenhuma — todos compartilham o mesmo dolphin.state',
      'Oficial: 3 níveis, 15 XP/cat/dia. Momentum: até 30 níveis, 45 XP/cat/dia + UI editor de level/mood. RogueMaster: similar a Momentum com fork-specific tweaks',
      'Apenas Momentum tem Dolphin',
      'Custom firmwares zeram o Dolphin no boot',
    ],
    correct: 1,
    explanation: 'Oficial: 3 níveis máximos (~6.000 icounter total), daily cap 15/categoria. Momentum: 30 níveis, daily cap 45/categoria, + Settings > Misc > Dolphin com sliders para editar level/XP/mood/butthurt diretamente na UI. RogueMaster e Xtreme legacy mantêm pacote similar. Estado é compatível entre forks (mesmo struct), mas cap e progressão diferem.',
  },
  {
    question: 'Cenário: você quer "zerar" o Dolphin ao máximo o mais rápido possível, sem editar arquivos. Qual rota?',
    options: [
      'Apenas usar Sub-GHz por 30 dias',
      'Instalar Momentum, ir em Settings > Momentum > Misc > Dolphin e ajustar level/XP via slider — ou usar todas as 6 categorias diariamente para maximizar daily cap composto',
      'Comprar XP via Apps Hub',
      'Reflashar dolphin.state com hex editor é a única opção',
    ],
    correct: 1,
    explanation: 'Momentum expõe oficialmente um editor de Dolphin no menu Settings > Momentum > Misc > Dolphin — permite setar level, XP, mood e butthurt sem hex editor. Se preferir progressão "natural", maximize daily cap usando 6 categorias por dia (Sub-GHz, NFC, RFID, IR, iButton, BadUSB) — 90 XP/dia oficial, 270 no Momentum.',
  },
  {
    question: 'Editar dolphin.state direto no SD/Flash via qFlipper traz risco de bricking?',
    options: [
      'Sim — corrompe firmware',
      'Não — arquivo é validado em runtime; se inválido, firmware recria zerado no próximo boot. Risco máximo é "perder" o progresso atual, mas o device continua funcional',
      'Sim — invalida garantia automaticamente',
      'Sim — derruba o BLE',
    ],
    correct: 1,
    explanation: 'O firmware lê dolphin.state com fallback gracioso: se o arquivo está corrompido, ausente ou de struct version incompatível, recria zerado e segue. Não há check de integridade do tipo HMAC — é dado de progresso local, não anti-cheat de servidor. Pior cenário: perder seu nível atual. Recuperação = continuar usando, ou backup prévio.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="flipper-dolphin-zerar-niveis"
      title="🐬 Como zerar o Dolphin: icounter, butthurt, daily caps, dolphin.state"
      icon="🏆"
      xp={50}
      readTime={9}
      trailName="Flipper Zero & Hardware Hacking"
      trailColor={accent}
      nextSlug="pentest-etico-frameworks"
      nextTitle="Pentest ético: frameworks"
      quiz={quiz}
    >
      <Section title="O Dolphin não é só um avatar" accent={accent}>
        <p className="text-sm leading-6">
          O golfinho cibernético é a cara do Flipper, mas funcionalmente ele é um <strong>sistema de XP local</strong>{' '}
          com persistência em flash, daily caps por categoria, sistema de "raiva" por inatividade (butthurt), e
          sprites dinâmicos que mudam por mood. É um Tamagotchi gamificado, não decoração — entender a mecânica
          esclarece muito comportamento estranho ("por que ele tá triste?") e desbloqueia editing legítimo.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Onde mora', v: <>/int/dolphin.state — flash interna LFS, não SD card</> },
            { k: 'Formato', v: <>Binário, struct C empacotada (struct DolphinStoreData), little-endian</> },
            { k: 'Tamanho', v: <>~16–32 bytes (varia por versão da struct)</> },
            { k: 'Validação', v: <>Nenhuma cripto / HMAC — fallback recria zerado se inválido</> },
            { k: 'Origem', v: <>flipperdevices/flipperzero-firmware → applications/services/dolphin/</> },
            { k: 'Servidor', v: <>NÃO existe — é 100% local. Sem leaderboard global oficial</> },
          ]}
        />
        <Callout tone="info" icon="🐬">
          Implicação importante: ninguém te dá medalha por Dolphin nível 30. É puro "número que sobe" para
          satisfação pessoal. A mecânica é honesta justamente por isso — é um joguinho local, sem economia, sem
          inflação, sem motivação para anti-cheat agressivo.
        </Callout>
      </Section>

      <Section title="Anatomia do dolphin.state" accent={accent}>
        <p className="text-sm leading-6">
          A struct é declarada em <InlineCode>applications/services/dolphin/helpers/dolphin_state.h</InlineCode>.
          Layout simplificado (versão atual do firmware oficial):
        </p>
        <AnnotatedFormula
          title="DolphinStoreData (layout binário, little-endian)"
          accent={accent}
          formula="| icounter (4) | butthurt (4) | timestamp (8) | flags (variavel) |"
          parts={[
            { text: 'icounter', annotation: 'uint32 LE — total de "deeds" (ações XP-eligíveis) acumuladas. É o XP bruto. Determina o nível atual.' , highlight: true },
            { text: 'butthurt', annotation: 'uint32 LE — "raiva" por inatividade. Range 0 (feliz) a 14+ (irritado). Define mood/animação no idle.', highlight: true },
            { text: 'timestamp', annotation: 'uint64 LE — Unix timestamp da última atualização. Usado para calcular butthurt drift e daily reset.' },
            { text: 'flags', annotation: 'Bitfield — mood cached, easter eggs vistos, achievements internos. Tamanho varia por versão da struct.' },
          ]}
        />
        <CodeBlock lang="python">{`# Dump rápido do dolphin.state com Python
# (depois de copiar /int/dolphin.state via qFlipper para o PC)
import struct

with open("dolphin.state", "rb") as f:
    raw = f.read()

icounter, butthurt = struct.unpack_from("<II", raw, 0)
ts = struct.unpack_from("<Q", raw, 8)[0]

print(f"icounter (XP bruto):  {icounter}")
print(f"butthurt (raiva):     {butthurt}")
print(f"last update (UTC):    {ts}")
print(f"raw bytes:            {raw.hex()}")`}</CodeBlock>
        <Callout tone="warn" icon="🛠️">
          Em <em>algumas</em> versões a struct tem checksum CRC32 ao final. Se o seu firmware faz check,
          editar bytes "no escuro" causa o firmware a descartar e recriar. Solução: ou use a UI do Momentum, ou
          implemente o CRC correto no script de patch. Verifique a struct atual no source.
        </Callout>
      </Section>

      <Section title="Como o icounter é incrementado" accent={accent}>
        <p className="text-sm leading-6">
          O firmware tem um conceito de <strong>"deed"</strong> (ação digna de XP). Cada subsistema chama{' '}
          <InlineCode>dolphin_deed(DolphinDeedXxx)</InlineCode> ao executar uma ação relevante. O Dolphin
          service ouve via pubsub, aplica daily cap, e atualiza icounter/butthurt.
        </p>
        <CodeBlock lang="c">{`// applications/services/dolphin/dolphin.h (resumido)
typedef enum {
    DolphinDeedSubGhzReceiverInfo,
    DolphinDeedSubGhzSave,
    DolphinDeedSubGhzRawRec,
    DolphinDeedSubGhzAddManually,
    DolphinDeedSubGhzSend,

    DolphinDeedRfidRead,
    DolphinDeedRfidReadSuccess,
    DolphinDeedRfidSave,
    DolphinDeedRfidEmulate,
    DolphinDeedRfidAdd,

    DolphinDeedNfcRead,
    DolphinDeedNfcReadSuccess,
    DolphinDeedNfcSave,
    DolphinDeedNfcDetectReader,
    DolphinDeedNfcEmulate,

    DolphinDeedIrSend,
    DolphinDeedIrLearnSuccess,
    DolphinDeedIrSave,

    DolphinDeedIbuttonRead,
    DolphinDeedIbuttonReadSuccess,
    DolphinDeedIbuttonSave,
    DolphinDeedIbuttonEmulate,
    DolphinDeedIbuttonAdd,

    DolphinDeedBadUsbPlayScript,
    DolphinDeedU2fAuthorized,

    DolphinDeedGpioUartBridge,
    DolphinDeedPluginStart,
    DolphinDeedPluginGameStart,
    DolphinDeedPluginGameWin,
    /* ... */
    DolphinDeedMAX,
} DolphinDeed;

void dolphin_deed(DolphinDeed deed); // chamada interna pelos subsistemas`}</CodeBlock>
        <NodeGraph
          title="Categorias de XP — daily cap por coluna"
          accent={accent}
          legend="Cada categoria tem cap independente de 15 XP/dia (oficial) ou 45 (Momentum)"
          columns={[
            {
              label: 'Sub-GHz',
              nodes: [
                { icon: '📡', label: 'Receiver Info', sub: '+1 deed' },
                { icon: '💾', label: 'Save', sub: '+1' },
                { icon: '📤', label: 'Send', sub: '+1' },
              ],
            },
            {
              label: 'NFC + RFID',
              nodes: [
                { icon: '📲', label: 'NFC Read', sub: '+1' },
                { icon: '🪪', label: 'RFID Read', sub: '+1' },
                { icon: '🔁', label: 'Emulate', sub: '+1' },
              ],
            },
            {
              label: 'IR + iButton',
              nodes: [
                { icon: '🔆', label: 'IR Learn', sub: '+1' },
                { icon: '🔘', label: 'iButton Read', sub: '+1' },
                { icon: '📤', label: 'IR Send', sub: '+1' },
              ],
            },
            {
              label: 'BadUSB + Plugins',
              nodes: [
                { icon: '⌨️', label: 'BadUSB Play', sub: '+1' },
                { icon: '🎮', label: 'Plugin Game', sub: '+1' },
                { icon: '🔐', label: 'U2F Auth', sub: '+1' },
              ],
            },
          ]}
        />
      </Section>

      <Section title="Daily cap — anti-grinding" accent={accent}>
        <FlowDiagram
          title="Lógica do daily cap"
          accent={accent}
          orientation="vertical"
          steps={[
            { icon: '🌙', label: '00:00 local', desc: 'RTC dispara reset diário; counters por categoria zeram' },
            { icon: '📡', label: 'Ação Sub-GHz', desc: 'Subsistema chama dolphin_deed(DolphinDeedSubGhzSave)' },
            { icon: '🧮', label: 'Cap check', desc: 'Se categoria_xp_today < 15 (oficial) — incrementa icounter +1, registra; senão ignora' },
            { icon: '🐬', label: 'icounter += 1', desc: 'Salva em RAM (dolphin_state)' },
            { icon: '💾', label: 'Flush periódico', desc: 'A cada N segundos / N deeds o state é gravado em /int/dolphin.state' },
            { icon: '🔋', label: 'Power off seguro', desc: 'No shutdown gracioso, flush final garante persistência' },
          ]}
        />
        <ComparisonTable
          accent={accent}
          headers={['Categoria', 'Oficial cap/dia', 'Momentum cap/dia', 'Exemplos de deed']}
          rows={[
            ['Sub-GHz', '15', '45', 'Receiver Info, Save, Send, Add Manually'],
            ['NFC HF', '15', '45', 'Read, ReadSuccess, Save, Emulate, DetectReader'],
            ['RFID 125 kHz', '15', '45', 'Read, ReadSuccess, Save, Emulate, Add'],
            ['Infrared', '15', '45', 'Send, Learn Success, Save'],
            ['iButton 1-Wire', '15', '45', 'Read, ReadSuccess, Save, Emulate, Add'],
            ['BadUSB / U2F / Plugins', '15', '45', 'BadUsb Play, U2F Auth, Plugin Game Win'],
          ]}
        />
      </Section>

      <Section title="Butthurt — quando o Dolphin fica triste" accent={accent}>
        <p className="text-sm leading-6">
          Se o Flipper fica ocioso, butthurt incrementa lentamente (escala em horas/dias). Resultado: o avatar
          do golfinho muda. Voltar a usar derruba butthurt rapidamente. É a métrica de engajamento.
        </p>
        <Timeline
          title="Trajetória típica de butthurt"
          accent={accent}
          events={[
            { when: 't=0', label: 'Você usa o Flipper', detail: 'butthurt=0, mood=happy' },
            { when: '+1d', label: 'Flipper fica ocioso', detail: 'butthurt drift inicia' },
            { when: '+3d', label: 'butthurt = 4', detail: 'mood = neutral; sprite muda' },
            { when: '+7d', label: 'butthurt = 9', detail: 'mood = sad; animações de tristeza no idle' },
            { when: '+14d', label: 'butthurt = 14+', detail: 'mood = angry; Dolphin agitado/bravo', highlight: true },
            { when: 'reuso', label: 'Você volta a usar', detail: 'cada deed reduz butthurt; volta a happy em ~horas' },
          ]}
        />
        <Callout tone="info" icon="😢">
          Comportamento de butthurt e os sprites por mood foram detalhados pela comunidade (Noy Pearl publicou
          walkthrough no Medium). A intenção do design é induzir uso frequente — clássico loop de engajamento
          tipo Tamagotchi.
        </Callout>
      </Section>

      <Section title="Editando o estado — três rotas" accent={accent}>
        <DecisionBox
          scenario="Quero zerar o Dolphin ao nível máximo o mais rápido possível"
          winner="Instalar Momentum + Settings > Momentum > Misc > Dolphin > sliders"
          winnerColor={accent}
          why="Rota oficial dentro do firmware: você ajusta level/XP/mood/butthurt diretamente na UI, sem editor hex, sem risco de struct incorreta. Persistido na hora pelo próprio firmware com formato correto."
          alternatives={[
            { name: 'Editar dolphin.state via qFlipper file manager', when: 'Quando você quer aprender a struct ou está em firmware oficial sem UI editor' },
            { name: 'Usar todas 6 categorias diariamente', when: 'Progressão "natural" honesta — 90 XP/dia oficial, 270 no Momentum' },
            { name: 'Deletar dolphin.state', when: 'Para zerar reverso (voltar do nível 30 ao 0); firmware recria limpo no próximo boot' },
          ]}
        />
        <CodeBlock lang="python">{`# Patch dolphin.state — exemplo simples sem CRC
# ATENCAO: faca backup do arquivo original antes!
import struct

# Le, edita, escreve
with open("dolphin.state", "rb") as f:
    raw = bytearray(f.read())

# zera butthurt para 0 (feliz)
struct.pack_into("<I", raw, 4, 0)

# seta icounter para 6000 (proximo do max do firmware oficial)
struct.pack_into("<I", raw, 0, 6000)

with open("dolphin.state.patched", "wb") as f:
    f.write(raw)

# Copie de volta para /int/dolphin.state via qFlipper
# (modo File Manager > Internal Storage > substitui o arquivo)`}</CodeBlock>
        <Callout tone="warn" icon="📝">
          Faça backup do arquivo original antes. Se o seu firmware aplicar CRC e você não recalcular, o struct
          será descartado no boot. O risco máximo é perder o progresso atual — não há bricking. Se quiser
          reverter de vez, simplesmente delete <InlineCode>/int/dolphin.state</InlineCode> e o firmware recria
          zerado.
        </Callout>
      </Section>

      <Section title="Comparação entre firmwares" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Firmware', 'Níveis', 'Daily cap/cat', 'UI editor Dolphin', 'Notas']}
          rows={[
            ['Oficial (flipperdevices)', '3', '15', 'Não', 'Estável; foco em qualidade e API estável'],
            ['Momentum', '30', '45', 'Sim (Settings > Misc)', 'Fork comunitário ativo; recomendado para hobby'],
            ['RogueMaster', '30', '45', 'Limitado', 'Fork antigo, ainda mantido; muitos apps extras'],
            ['Xtreme (legacy)', '30', '~45', 'Sim', 'Descontinuado; substituído por Momentum em 2024'],
            ['Unleashed', '3', '15', 'Não', 'Fork "minimalista" — desbloqueia regiões mas mantém Dolphin oficial'],
          ]}
        />
      </Section>

      <Section title="Q&A" accent={accent}>
        <div className="flex flex-col gap-3">
          <QAItem
            q="Por que meu Dolphin fica triste se o aparelho está na mesa carregado?"
            a={
              <>
                Estar carregado não conta como atividade. Butthurt drift é função do tempo desde o último deed,
                não do estado de bateria. Resolva fazendo qualquer ação XP-eligible (ler um cartão NFC, mandar
                um IR send) — butthurt cai no próximo flush.
              </>
            }
          />
          <QAItem
            q="Posso fazer um script Python que liga via USB-CDC e injeta deeds artificiais?"
            a={
              <>
                Não há comando CLI público para "incrementar Dolphin". Você poderia (a) editar dolphin.state
                offline, (b) escrever um FAP que chame <InlineCode>dolphin_deed()</InlineCode> em loop — mas
                isso é "trapaça pra si mesmo" e remove a graça do sistema. Caminho honesto: usar o aparelho.
              </>
            }
          />
          <QAItem
            q="Existe leaderboard global de Dolphin?"
            a={
              <>
                Não existe. O estado nunca sai do dispositivo. A Flipper Devices tem desencorajado leaderboard
                global justamente por incentivos errados (grinding, edição). Comparações entre amigos são
                via screenshot, sem mecanismo formal.
              </>
            }
          />
          <QAItem
            q={'O Dolphin "morre" se eu deixar 1 ano na gaveta?'}
            a={
              <>
                Não. Butthurt tem cap superior (algo em torno de 14–20). O sprite fica permanentemente "bravo"
                mas nada quebra. O level/XP não decai. Você volta a usar e em horas o mood normaliza.
              </>
            }
          />
        </div>
      </Section>

      <Section title="Referências canônicas" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Wiki Momentum Dolphin', v: <a className="underline" href="https://momentum-fw.dev/wiki/Misc/Dolphin" target="_blank" rel="noreferrer">momentum-fw.dev/wiki/Misc/Dolphin</a> },
            { k: 'GitHub Momentum Wiki', v: <a className="underline" href="https://github.com/Next-Flip/Momentum-Firmware/wiki/Dolphin" target="_blank" rel="noreferrer">Next-Flip/Momentum-Firmware/wiki/Dolphin</a> },
            { k: 'Walkthrough Noy Pearl', v: <a className="underline" href="https://medium.com/@60noypearl/hacking-the-hackers-tool-pwning-flipper-zero-s-levels-for-fun-1dd16847da5a" target="_blank" rel="noreferrer">medium.com/@60noypearl — Pwning Flipper Zero levels</a> },
            { k: 'Source dolphin service', v: <a className="underline" href="https://github.com/flipperdevices/flipperzero-firmware/tree/dev/applications/services/dolphin" target="_blank" rel="noreferrer">flipperzero-firmware/applications/services/dolphin</a> },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
