import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  KeyValue,
  FlowDiagram,
  Timeline,
  NodeGraph,
  AnnotatedFormula,
  ArchFlow,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('rolling-codes-keeloq-rolljam');
const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'O que exatamente está encriptado no pacote KeeLoq HCS301?',
    options: [
      'Todo o pacote, com AES-128',
      'O pacote tem 66 bits no ar: 28 bits de serial number do transmissor + 4 bits de botão + 2 bits de status (todos em CLARO) + 32 bits encriptados com a cifra Crypto1 do KeeLoq (NÃO confundir com o Crypto1 do MIFARE; aqui é o KeeLoq cipher original — bloco 32-bit, chave 64-bit). O bloco encriptado contém o contador 16-bit + bits de função + parte do serial. O incremento por aperto de botão é o que mata o replay direto',
      'Só o serial é encriptado, o contador é em claro',
      'KeeLoq usa RSA-2048 truncado',
    ],
    correct: 1,
    explanation: 'A patente Microchip TB003 e a literatura acadêmica (Bogdanov 2007, Indesteege/Keller/Kuçuk/Preneel/Shamir 2008) detalham: 32 bits encriptados (cipher KeeLoq, NLFSR de 32 bits, chave 64 bits) + 28 serial em claro + 4 botão + 2 status. O contador encriptado faz cada pacote &ldquo;parecer aleatório&rdquo; do ponto de vista de quem só observa o tráfego.',
  },
  {
    question: 'Por que os ataques de cryptanalysis acadêmicos contra KeeLoq quase nunca aparecem em campo?',
    options: [
      'Porque a NSA proíbe',
      'Porque na prática eles exigem condições inviáveis: o slide attack de Bogdanov (FSE 2007) precisa ~2^52 operações offline; o Indesteege et al. (EUROCRYPT 2008) precisa 2^16 plaintexts conhecidos do mesmo controle (impossível: o atacante não captura 65k apertos do dono) e ~2^44.5 encriptações (~dia de cluster); ataques side-channel via DPA (Eisenbarth/Kasper/Moradi 2008) precisam acesso físico ao controle. Resultado: contra KeeLoq em campo, ninguém faz cryptanalysis — todos fazem RollJam',
      'Porque KeeLoq não é quebrável',
      'Porque ninguém usa KeeLoq',
    ],
    correct: 1,
    explanation: 'O gap entre quebra acadêmica e exploração de campo é central em hardware security. KeeLoq tem ~5 papers de cryptanalysis sérios; nenhum produziu ferramenta prática contra um controle no estacionamento. O ataque que produz é puro engenharia de RF: jamming + capture + delayed replay (RollJam, Samy Kamkar, DEF CON 23, 2015).',
  },
  {
    question: 'Como o RollJam funciona, passo a passo?',
    options: [
      'Calcula a chave por força bruta',
      'O dispositivo (≈US$30 em 2015, baseado em dois rádios baratos + um microcontrolador) (1) escuta a frequência alvo; (2) quando o usuário aperta o botão, GRAVA o pacote rolling C1 e simultaneamente JAMMA o receptor com ruído num canal levemente off; (3) o usuário acha que falhou e aperta de novo, gerando C2; (4) o RollJam grava C2 e RETRANSMITE C1 (que é válido — ainda não foi aceito). O carro/portão abre. (5) O atacante fica com C2 no bolso, válido até o próximo aperto legítimo do dono. Defesa real: timeout curto da janela do contador + challenge-response bidirecional',
      'Quebra AES com SAT solver',
      'É um phishing por SMS',
    ],
    correct: 1,
    explanation: 'Apresentado por Samy Kamkar na DEF CON 23 (2015). O insight é que o receptor mantém uma janela de aceitação à frente do contador atual (tipicamente ±256) — então um código gravado segue válido se ainda não foi consumido. RollJam transforma a janela de aceitação numa fila do atacante.',
  },
  {
    question: 'Qual a defesa moderna realmente eficaz contra RollJam?',
    options: [
      'Aumentar o tamanho da janela',
      'Substituir o esquema unidirecional (controle → carro) por challenge-response BIDIRECIONAL com criptografia forte: o veículo emite um nonce assim que detecta o pedido; o controle responde com HMAC/AES sobre o nonce. Sem o nonce fresco, o pacote gravado pelo atacante não vale. LiftMaster Security+ 2.0 (pós-2015) e os esquemas de UWB de chave de Tesla/BMW seguem essa arquitetura. Sistemas KeeLoq AES (HCS412/HCS500) também resolvem o problema, desde que mantenham a sessão fresca',
      'Mudar a frequência de 433 para 868 MHz',
      'Trocar a bateria do controle',
    ],
    correct: 1,
    explanation: 'A vulnerabilidade do RollJam é o canal unidirecional. Bidirecional com nonce do receptor mata a captura-e-guarda. UWB de chaves automotivas modernas adicionam ainda distance bounding contra relay attacks (outro vetor).',
  },
  {
    question: 'Se KeeLoq HCS301 está em campo desde 1996 e o RollJam é de 2015, por que muitos carros e portões pré-2018 ainda são vulneráveis em 2026?',
    options: [
      'Porque KeeLoq foi banido',
      'Porque hardware veicular tem ciclos de design longos (3–7 anos da especificação à produção) e ciclos de frota maiores ainda (10–15 anos rodando). Um Civic 2014 com KeeLoq HCS301 seguirá nas ruas até ~2030. Substituir o keyfob exige flashar a ECU do veículo, custa caro, e nem todo fabricante oferece migração. Para portões residenciais o quadro é pior: o conjunto receptor + 4 controles é trocado em massa só quando quebra fisicamente',
      'Porque a vulnerabilidade já foi corrigida em todos os dispositivos via OTA',
      'Porque RollJam não funciona em campo',
    ],
    correct: 1,
    explanation: 'Hardware longevity é fator de segurança em si. Engineers em IoT/automotivo precisam projetar com a premissa de que o dispositivo viverá 15+ anos sem updates de protocolo. Por isso challenge-response bidirecional é hoje o piso, não teto.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="rolling-codes-keeloq-rolljam"
      title="Rolling codes: KeeLoq HCS301 e o ataque RollJam (Samy Kamkar)"
      icon="🎰"
      xp={70}
      readTime={13}
      trailName="Flipper Zero & Hardware Hacking"
      trailColor={accent}
      nextSlug="rfid-125khz-lf"
      nextTitle="RFID 125 kHz"
      quiz={quiz}
    >
      <Section title="O salto do fixo para o rolling" accent={accent}>
        <p>
          O módulo anterior mostrou que protocolos OOK fixos (PT2262, EV1527, CAME 12-bit) caem com
          replay direto porque não têm nenhum elemento de freshness. A indústria respondeu em 1996 com
          o <strong>Microchip HCS301</strong>, primeiro encoder rolling code com cipher KeeLoq embarcado.
          A ideia central é simples: a cada aperto, transmite-se um <em>contador</em> incrementado e
          encriptado, de modo que duas transmissões consecutivas produzem pacotes radicalmente
          diferentes no ar. O receptor mantém uma janela de aceitação para o contador e marca como
          consumido tudo que cai dentro.
        </p>
        <p className="mt-3">
          O sistema parece resistir a replay — e resiste, contra o atacante &ldquo;capturei e
          retransmiti&rdquo; ingênuo. Mas, como Samy Kamkar mostrou na DEF CON 23 (2015), basta
          adicionar <em>jamming sincronizado</em> para colapsar a defesa.
        </p>
      </Section>

      <Section title="Anatomia do pacote KeeLoq HCS301" accent={accent}>
        <AnnotatedFormula
          title="66 bits no ar (transmitidos LSB-first em PWM)"
          accent={accent}
          formula="[ 32 bits encriptados ] [ 28 serial ] [ 4 botão ] [ 2 status (VLOW + repeat) ]"
          parts={[
            { text: '32 bits encriptados', annotation: 'cipher KeeLoq, chave 64-bit. Bloco contém: contador 16-bit + 4 bits função + 10 bits discriminação + 2 status', highlight: true },
            { text: '28 serial', annotation: 'serial number do transmissor, EM CLARO (necessário para o receptor saber qual chave de aprendizagem aplicar)' },
            { text: '4 botão', annotation: 'estado dos botões (S0..S3)' },
            { text: '2 status', annotation: 'Vlow (bateria baixa) + repeat flag' },
          ]}
        />
        <KeyValue
          accent={accent}
          items={[
            { k: 'Frequência típica', v: '315 MHz (US/automotivo) ou 433.92 MHz (BR/EU)' },
            { k: 'Modulação', v: 'OOK ou FSK (HCS301 é OOK)' },
            { k: 'Bit rate', v: '~830 bps (configurável via TE)' },
            { k: 'Cipher', v: 'KeeLoq — NLFSR 32-bit, 528 rounds, chave 64-bit' },
            { k: 'Esquema de chave', v: 'Manufacturer key compartilhada + key derivation por serial (várias variantes: simple, normal, secure, XOR)' },
            { k: 'Aprendizagem', v: 'Receptor entra em learn mode; primeiro aperto de botão registra serial + sincroniza contador' },
          ]}
        />
        <Callout tone="info">
          <strong>Cuidado com o nome.</strong> O cipher KeeLoq do HCS301 não tem nada a ver com o
          Crypto1 do MIFARE Classic (módulo 5). São cifras proprietárias de empresas distintas
          (Microchip × NXP) com histórias de quebra independentes.
        </Callout>
      </Section>

      <Section title="Cryptanalysis acadêmica (e por que ela mora no laboratório)" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            {
              when: '1996',
              label: 'KeeLoq HCS301 lançado pela Microchip',
              detail: 'Cipher de bloco proprietário, 32 bits, chave 64 bits, 528 rounds. Vira padrão de fato em keyless entry automotivo até ~2010.',
            },
            {
              when: '2007',
              label: 'Bogdanov publica slide attack — FSE 2007',
              detail: 'Reduz o keyspace efetivo de 2^64 para ~2^52. Ainda computacionalmente alto, mas demonstra fraqueza estrutural.',
              highlight: true,
            },
            {
              when: '2008 (mar)',
              label: 'Indesteege/Keller/Kuçuk/Preneel/Shamir — EUROCRYPT 2008',
              detail: 'Ataque prático: precisa 2^16 plaintexts conhecidos do MESMO controle + ~2^44.5 encriptações. Equivale a ~1 dia em cluster + acesso físico ao controle por horas.',
              highlight: true,
            },
            {
              when: '2008 (ago)',
              label: 'Eisenbarth/Kasper/Moradi/Paar/Pelzl/Wienecke — CHES 2008',
              detail: 'DPA side-channel attack contra HCS301. Recupera a manufacturer key com algumas centenas de traces de potência. Exige acesso físico + osciloscópio.',
            },
            {
              when: '2010s',
              label: 'Microchip migra para KeeLoq AES (HCS412, AES-128)',
              detail: 'Novos chips usam AES como cipher de bloco. Cryptanalysis acadêmica do KeeLoq original deixa de ser relevante para deployments novos.',
            },
            {
              when: '2015',
              label: 'Samy Kamkar apresenta RollJam — DEF CON 23',
              detail: 'Ataque puramente de RF + protocolo, INDEPENDENTE da cryptanalysis. Funciona contra qualquer rolling code unidirecional, incluindo KeeLoq HCS301.',
              highlight: true,
            },
          ]}
        />
        <p className="mt-3">
          Note o padrão: a comunidade acadêmica produziu sucessivas reduções no custo de ataque
          contra a cifra, mas nenhum desses ataques se materializou em ferramenta de campo. O ataque
          que se materializou foi outro — <strong>RollJam</strong> — e ele não toca na cifra.
        </p>
      </Section>

      <Section title="RollJam, em detalhe" accent={accent}>
        <FlowDiagram
          title="Os 5 passos do RollJam"
          orientation="vertical"
          accent={accent}
          steps={[
            { icon: '1', label: 'Atacante posiciona dispositivo perto do alvo', desc: 'Dois rádios + MCU. ~US$30 em componentes (Kamkar, 2015).' },
            { icon: '2', label: 'Usuário aperta botão; transmissor envia C1', desc: 'RollJam grava C1 EM ÁUDIO RAW e simultaneamente jamma a banda de recepção com ruído num offset estreito.' },
            { icon: '3', label: 'Receptor (carro/portão) descarta C1', desc: 'Não decodifica nada por causa do jamming. Usuário acha que apertou errado.' },
            { icon: '4', label: 'Usuário aperta de novo; transmissor envia C2', desc: 'RollJam grava C2 e simultaneamente RETRANSMITE C1 (ainda válido). Receptor aceita C1 e abre.' },
            { icon: '5', label: 'Atacante fica com C2 não usado', desc: 'C2 é válido até o próximo aperto LEGÍTIMO do dono. Janela de oportunidade prática: minutos a dias.' },
          ]}
        />
        <ArchFlow
          title="Por que o receptor aceita C1 depois de C2 ter sido emitido pelo controle"
          accent={accent}
          columns={[
            {
              header: 'Estado do receptor',
              items: [
                'contador atual = N',
                'janela de aceitação = [N+1, N+256]',
                'qualquer pacote com contador nesse range é válido',
                'após aceitar pacote com contador K, atualiza N := K',
              ],
            },
            {
              header: 'Sequência de eventos',
              headerColor: 'var(--ffv-orange)',
              items: [
                'C1 = enc(N+1)  — JAMMED, nunca chega',
                'C2 = enc(N+2)  — capturado, NÃO transmitido para o receptor',
                'RollJam transmite C1 = enc(N+1)',
                'receptor aceita C1 (N+1 ∈ janela), N := N+1',
                'atacante guarda C2 = enc(N+2): ainda válido!',
              ],
              footer: 'A janela de aceitação ampla (criada para tolerar apertos sem alcance) vira o aliado do atacante.',
            },
          ]}
        />
        <CodeBlock lang="python" filename="pseudocódigo do RollJam (didático)">
{`# DIDÁTICO. Implementação real exige RF dedicada e laboratório próprio.
def rolljam_loop(rx_a, rx_b, tx_jammer, tx_replay):
    captured = []
    while True:
        # rx_a escuta na frequência exata do controle (ex: 433.92 MHz)
        pkt = rx_a.listen(timeout=10s)
        if not pkt:
            continue

        # No instante que detectou pkt, jamma a banda do RECEPTOR (offset ~50 kHz)
        # rx_b confirma que o receptor não decodificou
        tx_jammer.jam(freq=433.92e6 + 50e3, duration=80ms)

        captured.append(pkt)

        if len(captured) >= 2:
            # Retransmite o mais antigo; guarda o mais novo
            tx_replay.transmit(captured.pop(0))
            # captured agora tem 1 código não usado, válido até próximo aperto legítimo`}
        </CodeBlock>
        <Callout tone="warn">
          <strong>Nota didática.</strong> O snippet acima é descritivo. RollJam contra hardware
          alheio configura crime no Brasil (Art. 154-A + Art. 155). O valor pedagógico aqui é
          entender o <em>princípio</em> — para projetar defesas em sistemas próprios.
        </Callout>
      </Section>

      <Section title="Replay simples vs RollJam vs cryptanalysis" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Ataque', 'Pré-requisito', 'Tempo', 'Custo HW', 'Funciona em KeeLoq?']}
          rows={[
            ['Replay direto', '1 captura passiva', 'segundos', '~US$30 (Flipper)', 'NÃO (contador)'],
            ['Bruteforce do contador', 'Conhecer chave (impossível só observando)', '∞', '—', 'NÃO'],
            ['Slide attack (Bogdanov 2007)', 'Computação 2^52', 'meses em CPU', '—', 'Teórico'],
            ['Indesteege et al. (2008)', '2^16 plaintexts mesmo controle + 2^44.5 enc', 'dia de cluster + horas com controle físico', '~US$10k', 'Sim, em laboratório'],
            ['DPA (CHES 2008)', 'Acesso físico + osciloscópio', 'horas', '~US$5k', 'Sim, em laboratório'],
            ['RollJam (Kamkar 2015)', '2 rádios + jammer + 2 apertos do dono', 'minutos', '~US$30', 'SIM, em campo', ],
          ]}
        />
        <p className="mt-3 text-sm" style={{ color: 'var(--ffv-text2)' }}>
          A última linha é a única que escala fora do laboratório. É também a única que motivou
          mudança de protocolo na indústria (Security+ 2.0, KeeLoq AES, esquemas UWB).
        </p>
      </Section>

      <Section title="Defesas modernas: bidirecional + nonce + distance bounding" accent={accent}>
        <NodeGraph
          title="Geração 1 (vulnerável) vs Geração 2 (RollJam-resistente) vs Geração 3 (UWB)"
          accent={accent}
          columns={[
            {
              label: 'Geração 1 (1996–2015)',
              nodes: [
                { icon: '➡', label: 'Unidirecional', sub: 'Controle → Receptor', tone: 'danger' },
                { icon: '🎰', label: 'Rolling KeeLoq', sub: 'contador encriptado' },
                { icon: '⚠', label: 'RollJammable', sub: 'Kamkar 2015', tone: 'danger' },
              ],
            },
            {
              label: 'Geração 2 (pós-2015)',
              nodes: [
                { icon: '↔', label: 'Bidirecional', sub: 'challenge-response', tone: 'success' },
                { icon: '🔐', label: 'Security+ 2.0 / KeeLoq AES', sub: 'AES-128 + nonce' },
                { icon: '🛡', label: 'Captured ≠ válido depois', sub: 'nonce do receptor expira', tone: 'success' },
              ],
            },
            {
              label: 'Geração 3 (2020+)',
              nodes: [
                { icon: '📐', label: 'UWB distance bounding', sub: 'Tesla/BMW/Audi', tone: 'emphasis' },
                { icon: '⏱', label: 'Time-of-flight cripto', sub: 'mata relay attacks' },
                { icon: '✅', label: 'Estado-da-arte 2026', sub: '', tone: 'success' },
              ],
            },
          ]}
          legend="Cada geração responde a um vetor concreto: G1→G2 fecha RollJam; G2→G3 fecha relay attacks de longo alcance."
        />
        <Callout tone="success">
          <strong>Princípio de design.</strong> Em hardware com vida útil de décadas e sem update de
          protocolo, &ldquo;rolling code unidirecional&rdquo; nunca foi suficiente. O piso atual é
          challenge-response bidirecional autenticado com cifra moderna (AES-128 ou ChaCha20).
        </Callout>
      </Section>

      <Section title="Q&A" accent={accent}>
        <Callout tone="neutral">
          <strong>P: Por que o atacante não simplesmente capta C2 e usa C2 direto, sem RollJam?</strong>
          <br />
          R: Porque o jamming é o que <em>impede</em> o receptor de aceitar C1. Se o atacante só
          escuta passivamente, o receptor aceita C1 normalmente, atualiza o contador para N+1, e
          quando C2 chega via aperto legítimo o receptor aceita também e atualiza para N+2. Resultado:
          tudo que o atacante capturou já foi consumido pelo receptor. O jamming é o que cria a
          discrepância entre &ldquo;o que o controle transmitiu&rdquo; e &ldquo;o que o receptor
          aceitou&rdquo;.
        </Callout>
        <Callout tone="neutral">
          <strong>P: Por que a janela do receptor é tão grande (±256)?</strong>
          <br />
          R: Para tolerar apertos do controle fora de alcance (criança brincando com o controle no
          quintal, controle apertado no bolso). Se a janela fosse ±1, qualquer aperto fora de alcance
          dessincronizava o controle e o usuário precisaria reaprendê-lo. UX vence segurança nesse
          tradeoff — e RollJam explora exatamente esse tradeoff.
        </Callout>
      </Section>

      <Section title="Referências" accent={accent}>
        <ul className="list-disc pl-5 text-sm" style={{ color: 'var(--ffv-text2)' }}>
          <li>Microchip TB003, <em>An Introduction to KeeLoq Code Hopping</em></li>
          <li>Bogdanov, <em>Cryptanalysis of the KeeLoq block cipher</em>, FSE 2007 — IACR ePrint 2007/055</li>
          <li>Indesteege/Keller/Kuçuk/Preneel/Shamir, <em>A Practical Attack on KeeLoq</em>, EUROCRYPT 2008</li>
          <li>Eisenbarth/Kasper/Moradi/Paar/Pelzl/Wienecke, <em>On the Power of Power Analysis in the Real World: A Complete Break of the KeeLoq Code Hopping Scheme</em>, CHES 2008</li>
          <li>Samy Kamkar, <em>Drive It Like You Hacked It: New Attacks and Tools to Wirelessly Steal Cars</em>, DEF CON 23, 2015 — samy.pl/defcon2015</li>
          <li>Hackaday, <em>RF hacking: how-to bypass rolling codes</em>, 2016 — hackaday.com/2016/03/06/rf-hacking-how-to-bypass-rolling-codes/</li>
          <li>LiftMaster, <em>Security+ 2.0 Technical Overview</em></li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
