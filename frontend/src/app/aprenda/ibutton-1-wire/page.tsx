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
  AnnotatedFormula,
  MindMap,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('ibutton-1-wire');
const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a estrutura dos 64 bits de ROM do Dallas DS1990A?',
    options: [
      '64 bits aleatórios sem estrutura.',
      '8 bits family code (0x01) + 48 bits serial + 8 bits CRC8 (polinômio 0x31, big-endian).',
      '32 bits de manufacturer ID + 32 bits de chave criptográfica.',
      '16 bits de versão + 48 bits de UID.',
    ],
    correct: 1,
    explanation:
      'Family code 0x01 identifica como DS1990A (outras famílias = outros chips Dallas: DS1820 termômetro = 0x10, DS1996 memória = 0x0C, etc.). 48 bits de serial são únicos por chip. CRC8 sobre os 56 bits anteriores garante leitura correta.',
  },
  {
    question: 'Cyfral e Metakom usam o mesmo protocolo do Dallas iButton?',
    options: [
      'Sim — todos seguem 1-Wire da Maxim.',
      'Não. Dallas usa modulação de tensão (1-Wire). Cyfral e Metakom modulam corrente e transmitem ID continuamente em loop quando energizadas, sem sequência reset+presence+commands.',
      'Sim, mas com checksum diferente.',
      'Cyfral é o nome comercial do Dallas DS1990A na Rússia.',
    ],
    correct: 1,
    explanation:
      'Famílias arquiteturalmente diferentes. Dallas é digital sobre tensão com protocolo 1-Wire master-slave. Cyfral/Metakom são analógicos, modulando corrente (consumo) — quando o leitor energiza, o chip oscila padrões de consumo que o leitor demodula. Sem comandos: chip "fala" sozinho.',
  },
  {
    question: 'Em uma transação 1-Wire normal entre leitor e DS1990A, qual a sequência típica?',
    options: [
      'Leitor envia ROM ID; chip valida e retorna ACK.',
      'Reset (480µs LOW) → Presence pulse do chip → ROM Command (READ ROM 0x33) → 64 bits do ID transferidos → CRC verificado pelo leitor.',
      'Pareamento Bluetooth → handshake AES → leitura.',
      'O leitor não inicia — espera o chip oscilar e captura o sinal.',
    ],
    correct: 1,
    explanation:
      'Time slots 1-Wire: master pulls low por 480µs (reset), aguarda 70µs, lê presence pulse. Depois envia comando byte (read ROM = 0x33, search ROM = 0xF0). Bits são lidos em time slots de ~60µs. CRC8 valida tudo.',
  },
  {
    question: 'Por que Cyfral e Metakom ainda existem em condomínios brasileiros em 2026?',
    options: [
      'São tecnologicamente superiores ao 1-Wire.',
      'Inércia. Foram importados via Argentina/Paraguai nos anos 90 (herança soviética/leste-europeu); condomínios só investem em portaria nova quando algo quebra ou é assaltado.',
      'O governo federal exigiu sua adoção em 2008.',
      'São requisito do Corpo de Bombeiros.',
    ],
    correct: 1,
    explanation:
      'Razão econômica + inércia. Sistema instalado funciona; trocar significa portaria nova, fiação, leitores em todas as portas, novas chaves para todos. Condomínio só faz isso após sinistro ou obra grande.',
  },
  {
    question: 'O que faz a ferramenta Leptopt1los/ibutton_converter?',
    options: [
      'Converte arquivos de áudio em iButton.',
      'Converte dumps Cyfral/Metakom em formato Dallas DS1990A — útil quando você só tem chave em branco DS1990A para gravar, mas o original era Cyfral.',
      'É um malware que rouba IDs.',
      'Gerencia o app Wallet do Flipper.',
    ],
    correct: 1,
    explanation:
      'Cyfral/Metakom têm IDs menores (9 nibbles BCD ou 4 bytes). O converter mapeia para um formato Dallas válido (family 0x01 + serial padded + CRC recalculado) que pode ser gravado em RW1990 / TM01C / similares e funcionar em leitores que aceitam ambos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ibutton-1-wire"
      title="iButton: Dallas DS1990A, Cyfral, Metakom em prédios brasileiros"
      icon="🔑"
      xp={40}
      readTime={8}
      trailName="Flipper Zero & Hardware Hacking"
      trailColor={accent}
      nextSlug="badusb-duckyscript-defesa"
      nextTitle="BadUSB e DuckyScript 3.0: ataque + defesa"
      quiz={quiz}
    >
      <Section title="Por que essa cápsula metálica ainda existe" accent={accent}>
        <p className="text-sm leading-7" style={{ color: 'var(--ffv-muted)' }}>
          Você já viu: aquela peça metálica redonda, do tamanho de uma pilha CR2032, presa num
          chaveiro. Encosta no leitor da portaria — beep, porta abre. É um <strong>iButton</strong>.
          Tecnicamente um <em>Dallas DS1990A</em> (Dallas Semiconductor, hoje Maxim/ADI), patenteado
          em 1990. Em essência: <strong>2 fios (data + GND), 64 bits de ROM, zero criptografia</strong>.
          Em prédios médios brasileiros é o sistema dominante de acesso comum desde os anos 2000.
        </p>
        <Callout tone="warn" icon="⚠️">
          <strong>Status legal:</strong> clonar a sua própria chave de portaria — fim educacional,
          backup, conveniência — é permitido. Clonar a do vizinho ou síndico = invasão de
          dispositivo informático <strong>Art. 154-A do Código Penal</strong> (até 4 anos +
          multa). O bem jurídico é o controle de acesso, não a "complexidade do hack".
        </Callout>
      </Section>

      <Section title="Camada física: a cápsula MicroCAN" accent={accent}>
        <ArchFlow
          accent={accent}
          title="Anatomia do DS1990A"
          columns={[
            {
              header: 'Cápsula MicroCAN F5',
              headerColor: accent,
              items: ['Aço inox, 16.25 mm de diâmetro', 'Resistente a poeira/água/queda', 'Vida útil 10+ anos'],
              footer: '"Touch contact" — encosta e lê',
            },
            {
              header: 'Topo (signal)',
              headerColor: '#0ea5e9',
              items: ['Pad central isolado', 'Pulled high pelo leitor (~5V via resistor)', 'Linha de dados 1-Wire'],
              footer: 'Comunicação digital',
            },
            {
              header: 'Corpo (GND)',
              headerColor: '#a855f7',
              items: ['Aço de toda a cápsula', 'Pressão mecânica do leitor', 'Retorno de corrente'],
              footer: 'Sem bateria — chip parasita energia da linha',
            },
          ]}
        />

        <Callout tone="info" icon="🔋">
          O DS1990A é <strong>passivo</strong>: extrai energia do próprio fio de dados quando ele
          está em HIGH, armazena em capacitor interno, e usa essa energia para responder durante os
          períodos LOW. Mesmo princípio das tags RFID passivas — só que via contato físico em vez de
          rádio.
        </Callout>
      </Section>

      <Section title="ROM 64 bits: o ID do chip" accent={accent}>
        <AnnotatedFormula
          accent={accent}
          title="Estrutura ROM do DS1990A (LSB first na transmissão)"
          formula="[ family_code (8b) ][ serial (48b) ][ CRC8 (8b) ]"
          parts={[
            { text: 'family_code', annotation: '0x01 = DS1990A. Outros: 0x10 = DS18S20 termômetro, 0x0C = DS1996, ...', highlight: true },
            { text: 'serial', annotation: '48 bits únicos por chip — fabricados serializados pela Dallas/Maxim' },
            { text: 'CRC8', annotation: 'polinômio x⁸ + x⁵ + x⁴ + 1 (0x31) sobre os 56 bits anteriores', highlight: true },
          ]}
        />

        <CodeBlock lang="text">
{`Exemplo de ROM lido:

01 33 5B 12 7C 00 00 4F
└┘ └──────────────┘ └┘
fam      serial    CRC8

family = 0x01  (DS1990A — chave de acesso comum)
serial = 0x000007C125B33  (48 bits, único)
CRC8   = 0x4F  (recalculado pelo reader; se não bater = erro de leitura)`}
        </CodeBlock>

        <Callout tone="danger" icon="🚨">
          <strong>NÃO há autenticação. NÃO há desafio-resposta. NÃO há cripto.</strong> Quem tem o
          ID — tem a chave. Flipper lê em 0.5 segundo, escreve em chave em branco em 1 segundo.
          Modelo de ameaça: assume-se que o chaveiro está fisicamente seguro com o dono. Se cai na
          rua e alguém pega + tem leitor, é equivalente a perder a chave física da casa.
        </Callout>
      </Section>

      <Section title="1-Wire: o protocolo da Dallas" accent={accent}>
        <FlowDiagram
          accent={accent}
          title="Sequência completa Read ROM"
          orientation="vertical"
          steps={[
            { icon: '1️⃣', label: 'Reset Pulse', desc: 'master pulls line LOW por 480µs e libera' },
            { icon: '2️⃣', label: 'Presence Pulse', desc: 'após 15-60µs, chip puxa LOW por 60-240µs' },
            { icon: '3️⃣', label: 'Master envia READ ROM 0x33', desc: 'em time slots de ~60µs, bit a bit' },
            { icon: '4️⃣', label: 'Chip retorna 64 bits', desc: 'cada bit num time slot LOW (master inicia, chip mantém ou solta)' },
            { icon: '5️⃣', label: 'Master valida CRC8', desc: 'se OK — ID válido; se não — retry' },
          ]}
        />

        <CodeBlock lang="text">
{`Time slots 1-Wire (idealizados):

Reset:        ____480us LOW____ ___60us  ___60-240us LOW (presence)
              (master)            (turnaround)  (chip)

Write 1 bit:  __1-15us LOW___ <- master, then floats HIGH
Write 0 bit:  __60us LOW____  <- master holds longer

Read bit:     __1-15us LOW___ then float; chip drives LOW for "0" or releases for "1"
              master samples around 15µs after slot start

Velocity: standard ~16 kbps. "Overdrive" mode (1-Wire spec) chega a 142 kbps.`}
        </CodeBlock>
      </Section>

      <Section title="Cyfral e Metakom: a herança pós-soviética" accent={accent}>
        <p className="text-sm leading-7" style={{ color: 'var(--ffv-muted)' }}>
          Em prédios mais antigos do Brasil — especialmente edifícios construídos entre 1995 e 2008
          — você encontra chaves redondas pretas (<strong>Cyfral</strong>) ou azuis
          (<strong>Metakom</strong>) em vez do clássico DS1990A prateado. Origem: padrões
          russos/leste-europeus que chegaram via importação Argentina/Paraguai nos anos 90, em
          paralelo à popularização do iButton americano. Construtoras que importaram interfones do
          leste europeu trouxeram esse ecossistema junto.
        </p>

        <ComparisonTable
          accent={accent}
          headers={['Sistema', 'Modulação', 'Tamanho do ID', 'Continuidade', 'Cor típica BR', 'Origem']}
          rows={[
            ['Dallas DS1990A', '1-Wire (tensão)', '64 bits (8+48+8)', 'só responde após reset', 'Prateado / preto polido', 'EUA — Dallas Semi 1990'],
            ['Cyfral', 'Modulação de corrente', '9 nibbles BCD (~36 bits)', 'transmite em loop quando energizada', 'Preto opaco', 'Rússia — anos 90'],
            ['Metakom', 'Modulação de corrente', '4 bytes (32 bits)', 'transmite em loop quando energizada', 'Azul / cinza', 'Rússia — anos 90'],
          ]}
        />

        <Callout tone="info" icon="🇷🇺">
          A diferença fundamental: <strong>Dallas é master-slave digital</strong> com protocolo
          formal (reset, comando, resposta). <strong>Cyfral/Metakom são "always-on"</strong> — quando
          o leitor encosta e energiza, o chip começa a oscilar consumo de corrente em padrões que
          codificam o ID, em loop infinito. Não há comandos. O leitor demodula e captura.
        </Callout>
      </Section>

      <Section title="Flipper Zero: o trabalho de campo" accent={accent}>
        <StackFlow
          accent={accent}
          title="Workflow para clonar sua própria chave"
          items={[
            { icon: '1️⃣', label: 'Apps → iButton → Read', sub: 'encoste o chaveiro original no contato lateral do Flipper', color: accent },
            { icon: '🔍', label: 'Auto-detect', sub: 'Flipper identifica Dallas / Cyfral / Metakom automaticamente; mostra ID', connector: '↓' },
            { icon: '💾', label: 'Save', sub: 'arquivo .ibtn no SD com tipo + ID hex', connector: '↓' },
            { icon: '🔧', label: 'Compre chave em branco', sub: 'RW1990 (clona Dallas) ou TM01C (universal — Dallas + Cyfral + Metakom)', connector: '↓' },
            { icon: '✍️', label: 'Apps → iButton → Saved → Write Blank', sub: 'encoste a chave em branco; Flipper grava em ~1s', connector: '↓' },
            { icon: '✅', label: 'Teste no leitor', sub: 'a nova chave deve abrir a porta exatamente como a original' },
          ]}
        />

        <CodeBlock lang="text" filename="my_key.ibtn">
{`Filetype: Flipper iButton key
Version: 1
Key type: Dallas
Data: 01 33 5B 12 7C 00 00 4F
`}
        </CodeBlock>

        <Callout tone="success" icon="🛠️">
          Para casos onde a portaria aceita Cyfral mas você só achou DS1990A em branco no
          comércio: <InlineCode>Leptopt1los/ibutton_converter</InlineCode> (GitHub) converte o dump
          Cyfral em formato Dallas válido. Funciona porque muitos leitores BR de portaria são
          "tolerantes" — aceitam ambos os formatos elétricos. Não funciona em leitores estritamente
          Cyfral.
        </Callout>
      </Section>

      <Section title="Tipos de chave em branco regraváveis" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'RW1990 / RW1990.2', v: 'Clona DS1990A. Compatível com a maioria dos leitores brasileiros. Custa R$5-15.' },
            { k: 'TM01C / TM2004', v: 'Universal — clona Dallas + Cyfral + Metakom. Custa R$15-30.' },
            { k: 'Cópias TM-N', v: 'Variantes chinesas que emulam o Dallas mas têm timing fora da spec — leitores rigorosos rejeitam.' },
            { k: 'Flipper Zero como emulador', v: 'Apps → iButton → Saved → Emulate. Encosta o GPIO do Flipper no contato do leitor; emula em RAM, não precisa chave em branco.' },
            { k: 'iButton blank programmer', v: 'TL866II Plus + adaptador, ou RW1990 com módulo Arduino. Setup mais complexo — Flipper resolve sozinho.' },
          ]}
        />
      </Section>

      <Section title="Linha do tempo" accent={accent}>
        <Timeline
          accent={accent}
          title="iButton e seus primos"
          events={[
            { when: '1989', label: 'Dallas Semiconductor cria 1-Wire', detail: 'Patente do barramento de fio único.' },
            { when: '1990', label: 'DS1990A — primeiro iButton', detail: 'Cápsula MicroCAN, 64 bits, sem cripto.', highlight: true },
            { when: '1995', label: 'Cyfral aparece na Rússia', detail: 'Padrão de modulação de corrente em paralelo.' },
            { when: '~1998', label: 'Metakom segue Cyfral', detail: 'Variante de 4 bytes; cor azul típica.' },
            { when: '2000s', label: 'Dallas + Cyfral + Metakom chegam ao BR', detail: 'Importação via Argentina/Paraguai; condomínios novos adotam.', highlight: true },
            { when: '2008', label: 'Maxim adquire Dallas', detail: 'Hoje parte da Analog Devices.' },
            { when: '2014', label: 'iButton seguro DS1961S/SHA', detail: 'Versão com SHA-1; pouco adotada no BR (custo).' },
            { when: '2024+', label: 'Flipper Zero populariza clone', detail: 'Auto-detect + emulação universal acessível.' },
          ]}
        />
      </Section>

      <Section title="Decisão para gestor de prédio" accent={accent}>
        <DecisionBox
          scenario="Sou síndico — meu prédio usa DS1990A e quero modernizar. O que faço?"
          winner="Migrar para MIFARE DESFire EV3 (cartão NFC com AES)"
          winnerColor={accent}
          why="Custo de cartão DESFire em quantidade ~R$8-15; leitores DESFire R$200-400. Segurança real (AES + 3-pass mutual + SUN messages — ver módulo NFC seguro). DS1990A não tem upgrade de segurança — só substituição de tecnologia."
          alternatives={[
            { name: 'iButton SHA (DS1961S)', when: 'Caso queira manter o form factor de chaveiro e exista compatibilidade dos leitores existentes — raro no BR.' },
            { name: 'Smartphone via BLE', when: 'Aplicativo proprietário do interfone (TKS, IPL, Intelbras moderno). Cuidado com vendor lock-in e backend cloud.' },
            { name: 'Manter DS1990A', when: 'Risco-benefício baixo: prédio sem histórico de invasão, custo de troca alto. Aceitar limite e proteger por câmera + portaria humana.' },
          ]}
        />
      </Section>

      <Section title="MindMap: panorama de chaves residenciais BR" accent={accent}>
        <NodeGraph
          accent={accent}
          title="O que existe num prédio brasileiro típico"
          legend="Predominância visual e tecnológica em 2026"
          columns={[
            {
              label: 'Contato (1-Wire / corrente)',
              nodes: [
                { icon: '⚪', label: 'Dallas DS1990A', sub: 'prata/preto polido — predominante 2000+' },
                { icon: '⚫', label: 'Cyfral', sub: 'preto opaco — herança 90s' },
                { icon: '🔵', label: 'Metakom', sub: 'azul — herança 90s' },
              ],
            },
            {
              label: 'Rádio 125 kHz (sem cripto)',
              nodes: [
                { icon: '🟧', label: 'EM4100 / EM4102', sub: 'cartões e tags — vagas de garagem' },
                { icon: '🟧', label: 'HID Prox', sub: 'corporativo — pouco em prédio residencial BR' },
              ],
            },
            {
              label: 'NFC 13.56 MHz',
              nodes: [
                { icon: '🟨', label: 'MIFARE Classic', sub: 'Crypto1 — quebrado, mas instalado', tone: 'danger' },
                { icon: '🟩', label: 'MIFARE DESFire EV3', sub: 'AES — seguro de verdade', tone: 'success' },
                { icon: '🟦', label: 'NTAG 21x', sub: 'NDEF — apenas marketing' },
              ],
            },
          ]}
        />
      </Section>

      <Section title="Q&A operacional" accent={accent}>
        <QAItem
          q="Minha chave é Cyfral preta, mas só achei DS1990A no comércio — dá pra clonar?"
          a={
            <>
              Depende do leitor. Se o leitor da portaria é "Tolerant Mode" (aceita Dallas + Cyfral +
              Metakom), use <InlineCode>ibutton_converter</InlineCode> para converter o ID Cyfral em
              formato Dallas e gravar num RW1990. Se o leitor é "strict Cyfral", você precisa de
              chave em branco TM01C universal — e mesmo assim grava em modo Cyfral.
            </>
          }
        />

        <QAItem
          q="Por que o Flipper às vezes lê meu DS1990A com CRC errado?"
          a={
            <>
              Contato físico ruim (poeira, óxido). 1-Wire é exigente com timing — pulse de 480µs
              precisa ser limpo. Limpe o pad central da chave e do Flipper com álcool isopropílico,
              encoste firme, repita. Se persiste: chave provavelmente perdeu retenção de carga
              interna (chip morrendo, raro mas acontece após ~15 anos de uso).
            </>
          }
        />

        <QAItem
          q="Posso emular sem clonar — só com o Flipper?"
          a={
            <>
              Sim. Apps → iButton → Saved → seu_id → Emulate. O Flipper assume o papel de chip
              passivo. Encoste o GPIO certo (pinos 17 + GND) no leitor da portaria. Funciona em
              90%+ dos leitores DS1990A; alguns leitores muito sensíveis a impedância podem
              recusar. Cyfral/Metakom também emulam.
            </>
          }
        />
      </Section>

      <Section title="Ética e fechamento" accent={accent}>
        <Callout tone="warn" icon="⚖️">
          O conhecimento aqui é para entender, fazer backup do seu próprio sistema, decidir como
          gestor (migrar para DESFire EV3) e auditar com autorização. Clonar chave alheia é{' '}
          <strong>Art. 154-A CP</strong> (até 4 anos + multa) e configurável também como furto
          qualificado dependendo do uso. Nada disso muda porque "é só uma chave de R$5".
        </Callout>

        <NodeGraph
          accent={accent}
          title="Referências"
          legend="Documentação e libs"
          columns={[
            {
              label: 'Oficial',
              nodes: [
                { icon: '📘', label: 'Maxim DS1990A datasheet', sub: 'analog.com/media/en/technical-documentation/data-sheets/DS1990A.pdf' },
                { icon: '📘', label: '1-Wire AN AppNotes', sub: 'Maxim/ADI tutorials' },
              ],
            },
            {
              label: 'Flipper',
              nodes: [
                { icon: '📗', label: 'docs.flipper.net/zero/ibutton', sub: 'documentação do app' },
                { icon: '📗', label: 'blog.flipper.net/taming-ibutton/', sub: 'mergulho técnico' },
              ],
            },
            {
              label: 'Comunidade',
              nodes: [
                { icon: '🐙', label: 'Leptopt1los/ibutton_converter', sub: 'Cyfral/Metakom → Dallas' },
                { icon: '🐙', label: 'UberGuidoZ/Flipper iButton dir', sub: 'dumps e blanks' },
              ],
            },
          ]}
        />

        <MindMap
          accent={accent}
          root="iButton em uma frase"
          branches={[
            {
              title: 'O que é',
              items: ['DS1990A: 64 bits ROM, 1-Wire, sem cripto', 'Cyfral/Metakom: corrente analógica, sem cripto', 'Cápsula resistente, vida útil 10+ anos'],
            },
            {
              title: 'Por que ainda existe',
              items: ['Custo baixo (chave R$5)', 'Inércia de instalação', 'Suficiente para baixa-média ameaça'],
            },
            {
              title: 'Modelo de ameaça',
              items: ['Quem tem o ID = tem a chave', 'Flipper clona em segundos', 'Solução real = migrar para DESFire EV3'],
            },
            {
              title: 'Limite legal',
              items: ['Sua chave: OK', 'Chave alheia: Art. 154-A', 'Auditoria: requer escrito do síndico'],
            },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
