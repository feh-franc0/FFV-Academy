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
  ArchFlow,
  AnnotatedFormula,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('mifare-classic-crypto1-quebrado');
const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Em uma frase técnica, o que é o Crypto1?',
    options: [
      'AES com chave 128-bit',
      'É a cifra de fluxo proprietária do MIFARE Classic (NXP, ex-Philips, 1994). Estado interno = LFSR de 48 bits cuja realimentação é um polinômio fixo; saída de keystream = função filtro NÃO-LINEAR (filter function f) sobre 20 bits selecionados do LFSR. Chave = 48 bits. PRNG do cartão para nonces é um LFSR de 16 bits (50 mil estados úteis em ciclo) que reinicia em cada power-up — esse PRNG fraco é a alavanca dos ataques nested',
      'É um hash criptográfico tipo SHA-256',
      'É um protocolo de TLS antigo',
    ],
    correct: 1,
    explanation: 'A cifra foi engenharia-reversa em 2008 (Garcia, de Koning Gans, Muijrers, van Rossum, Verdult, Wichers Schreur, Jacobs — ESORICS 2008, Radboud University) por imageamento do silício e análise de protocolo. Os dois pontos fracos centrais são (a) função filtro com bias estatístico explorável e (b) PRNG do cartão de 16 bits previsível.',
  },
  {
    question: 'Qual a estrutura de memória do MIFARE Classic 1K?',
    options: [
      'Um único bloco linear de 1024 bytes',
      '16 SETORES, cada um com 4 BLOCOS de 16 bytes = 1024 bytes total. Bloco 0 do setor 0 é o "manufacturer block" (UID + BCC + dados de fábrica, read-only). O ÚLTIMO bloco de cada setor é o "sector trailer" e contém: 6 bytes Key A + 4 bytes Access Bits + 1 byte GPB + 6 bytes Key B. As Access Bits controlam quais operações (read/write/increment/decrement) cada chave habilita por bloco. Por isso quebra-se chave POR SETOR — cada setor tem o próprio par (A,B)',
      '128 bits de RAM',
      '4 KB FLASH',
    ],
    correct: 1,
    explanation: 'O datasheet MF1S50YYX (NXP) detalha. A consequência prática para ataque: recuperar TODAS as chaves de um cartão de 16 setores significa 16 ataques separados, mas o Nested attack reduz drasticamente o custo do segundo ao décimo-sexto setor (ver questão seguinte).',
  },
  {
    question: 'O que o ataque Nested explora?',
    options: [
      'Vulnerabilidade no AES',
      'Explora dois fatos: (1) DEPOIS de uma autenticação bem-sucedida em qualquer setor, o estado interno do LFSR Crypto1 do cartão fica condicionado pela chave conhecida; (2) o PRNG do cartão (16-bit LFSR) é PREVISÍVEL — durante uma autenticação NESTED (auth no setor B logo após auth no setor A), o nonce que o cartão envia é correlacionado com o estado anterior. Isso permite recuperar a chave do setor B com poucos pares de auth observados, em segundos. Pré-requisito: conhecer ao menos UMA chave de QUALQUER setor (default key, transport key, etc.) para a primeira autenticação',
      'Explora bug do leitor',
      'Não existe',
    ],
    correct: 1,
    explanation: 'Garcia, de Koning Gans, Verdult — "Wirelessly Pickpocketing a Mifare Classic Card" — IEEE S&P 2009. O nested attack é o passo 2 do pipeline padrão: (1) descobrir uma chave por dictionary; (2) usar nested para derivar todas as outras.',
  },
  {
    question: 'O que muda no Hardnested em relação ao Nested?',
    options: [
      'Nada',
      'Hardnested é a versão necessária contra MIFARE Classic EV1 e clones que CORRIGIRAM o PRNG (PRNG fortalecido, não previsível em 16 bits). O nested clássico falha porque os nonces deixam de correlacionar. Hardnested (Meijer/Verdult, CCS 2015) ataca outra fraqueza: vazamento estatístico nos BITS DE PARIDADE da resposta criptografada do cartão. Em vez de poucos nonces, precisa MUITOS milhares de autenticações, mas roda em hardware modesto. ePrint 2024/1275 (static encrypted nonce variant) refina ainda mais para sub-variantes recentes',
      'Hardnested usa SAT solver puro',
      'Hardnested precisa SDR',
    ],
    correct: 1,
    explanation: 'Meijer/Verdult, "Ciphertext-only cryptanalysis on hardened Mifare Classic cards" — ACM CCS 2015. A fronteira de quebra avançou junto com as "tentativas de fortalecimento" da NXP. O ponto pedagógico é que cifras proprietárias raramente sobrevivem ao escrutínio público.',
  },
  {
    question: 'Como funciona o MFKey32?',
    options: [
      'Lê a chave da memória do cartão',
      'É um ataque ASSIMÉTRICO contra a infraestrutura do alvo: o atacante NÃO toca o cartão real. O Flipper se faz passar pelo cartão (emulando UID + respondendo a auth do leitor genuíno). O leitor genuíno inicia auth Crypto1 sobre algum setor; o Flipper captura os nonces da troca (Nr, Ar, Nt, At). Com 2 autenticações sobre o mesmo setor capturadas, recupera a Key A ou Key B daquele setor. App: noproto/FlipperMfkey. O nome vem de "MIFARE Key from 32-bit nonces"',
      'Quebra AES-128',
      'É um app de emulação simples sem cripto',
    ],
    correct: 1,
    explanation: 'O ataque assimétrico é o vetor mais relevante na prática para alguém que tem acesso ao LEITOR mas não ao cartão (ex.: um pesquisador com acesso autorizado a um leitor de prédio que está auditando). USO ÉTICO: contra leitor de prédio alheio é Art. 154-A do CP — invasão de dispositivo informático.',
  },
  {
    question: 'Por que MIFARE Classic ainda existe em 2026?',
    options: [
      'Porque é seguro',
      'Por inércia, custo e ciclo de vida do hardware. Cartões impressos custam US$0.50 vs US$2–4 do DESFire EV3; leitores baratos chineses ainda só falam Classic; sistemas de transporte público em algumas cidades nunca migraram (Oyster card de Londres migrou; vários sistemas brasileiros e cidades menores europeias continuam em Classic ou Plus). Migração exige reemissão de TODA a base de cartões + troca/atualização de leitores + retreinamento operacional. Custos de transição alinhados com 5–10 anos',
      'Porque ninguém quebrou na prática',
      'Porque AES é mais lento',
    ],
    correct: 1,
    explanation: 'Inércia de migração é fator central em segurança industrial. NXP comercializa MIFARE Plus (modos SL1/SL2/SL3) exatamente como caminho de migração compatível: o leitor Plus aceita os dois modos durante a transição. Mesmo assim, deployment leva anos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="mifare-classic-crypto1-quebrado"
      title="MIFARE Classic e a quebra do Crypto1: nested, hardnested, MFKey32"
      icon="🔓"
      xp={80}
      readTime={15}
      trailName="Flipper Zero & Hardware Hacking"
      trailColor={accent}
      nextSlug="nfc-seguro-desfire-emv"
      nextTitle="NFC seguro: DESFire & EMV"
      quiz={quiz}
    >
      <Section title="O cartão que dominou — e caiu" accent={accent}>
        <p>
          MIFARE Classic foi lançado em 1994 pela então Philips Semiconductors (hoje NXP). Vendeu mais
          de <strong>10 bilhões</strong> de unidades. Sustentou Oyster Card de Londres, OV-chipkaart
          dos Países Baixos, vale-transporte de São Paulo, controle de acesso da maioria dos
          escritórios corporativos do mundo. A receita do sucesso: silício barato, cripto embarcada
          (inédito a US$1 por cartão em 1994), e <strong>NDAs estritos</strong> que mantinham os
          detalhes da cifra Crypto1 fora do escrutínio público.
        </p>
        <p className="mt-3">
          Em 2008, um grupo de Radboud University (Holanda) reverteu o silício e publicou{' '}
          <em>Dismantling MIFARE Classic</em> (Garcia, de Koning Gans, Muijrers, van Rossum, Verdult,
          Wichers Schreur, Jacobs — ESORICS 2008). A cifra estava quebrada. O que se seguiu foi 16
          anos de papers refinando o ataque, ferramentas open source consolidando-os, e a indústria
          migrando lentamente para DESFire EV1/2/3.
        </p>
      </Section>

      <Section title="Estrutura do Classic 1K" accent={accent}>
        <ArchFlow
          title="Layout de memória — 16 setores × 4 blocos × 16 bytes"
          accent={accent}
          columns={[
            {
              header: 'Setor 0 (especial)',
              items: [
                'Bloco 0: UID 4-byte + BCC + manufacturer data (READ-ONLY)',
                'Bloco 1: dados livres',
                'Bloco 2: dados livres',
                'Bloco 3: SECTOR TRAILER',
              ],
              footer: 'O bloco 0 do setor 0 NÃO é regravável em cartões originais NXP. Cartões "magic" chineses (UID writable) ignoram isso.',
            },
            {
              header: 'Setor N (1..15)',
              headerColor: 'var(--ffv-orange)',
              items: [
                'Bloco 0: dados / value',
                'Bloco 1: dados / value',
                'Bloco 2: dados / value',
                'Bloco 3: SECTOR TRAILER',
              ],
            },
            {
              header: 'Sector Trailer (16 bytes)',
              headerColor: 'var(--ffv-purple)',
              items: [
                '6 bytes — Key A',
                '3 bytes — Access Bits',
                '1 byte  — General Purpose Byte',
                '6 bytes — Key B',
              ],
              footer: 'Access Bits definem permissões por bloco para Key A e Key B (read, write, increment, decrement).',
            },
          ]}
        />
        <KeyValue
          accent={accent}
          items={[
            { k: 'Total memória', v: '16 setores × 4 blocos × 16 B = 1024 B' },
            { k: 'Chaves no cartão', v: '32 (16 setores × 2 chaves de 48-bit)' },
            { k: 'Operações', v: 'READ, WRITE, INCREMENT, DECREMENT, RESTORE, TRANSFER (value blocks)' },
            { k: 'Auth obrigatória', v: 'Para QUALQUER acesso a um setor, autenticar contra Key A ou Key B daquele setor' },
            { k: 'Variante 4K', v: '40 setores: setores 0–31 com 4 blocos, setores 32–39 com 16 blocos' },
          ]}
        />
      </Section>

      <Section title="Crypto1 em uma figura" accent={accent}>
        <AnnotatedFormula
          title="Estado e saída do Crypto1"
          accent={accent}
          formula="LFSR_48[t+1] = poly(LFSR_48[t]) ;  keystream[t] = f(LFSR_48[t][bits selecionados])"
          parts={[
            { text: 'LFSR 48-bit', annotation: 'Estado interno; polinômio de realimentação fixo público (depois de Garcia 2008)', highlight: true },
            { text: 'f', annotation: 'Função filtro NÃO-linear sobre 20 bits selecionados do LFSR. Tem BIAS ESTATÍSTICO explorável (Garcia 2008)', highlight: true },
            { text: 'PRNG do cartão', annotation: 'LFSR SEPARADO de 16 bits para gerar nonces. ~50k estados em ciclo. PREVISÍVEL — ponto fraco central', highlight: true },
            { text: 'Auth', annotation: 'Reader nonce + Tag nonce + chave alimentam o LFSR; depois disso, comandos seguem encriptados pelo keystream' },
          ]}
        />
        <Callout tone="info">
          A função filtro <InlineCode>f</InlineCode> do Crypto1 tem bias estatístico — não é
          uniformemente aleatória. Combinado com o PRNG fraco, isso reduz o espaço de busca prático
          de 2^48 (chave) para algo da ordem de <strong>milissegundos a segundos</strong> de
          computação por setor.
        </Callout>
      </Section>

      <Section title="Pipeline de quebra do Flipper Zero" accent={accent}>
        <FlowDiagram
          title="As 4 técnicas, em ordem de aplicação prática"
          orientation="vertical"
          accent={accent}
          steps={[
            {
              icon: '1',
              label: 'Dictionary attack',
              desc: 'Testa lista de chaves comuns: FFFFFFFFFFFF, A0A1A2A3A4A5, D3F7D3F7D3F7, chaves de transporte conhecidas, padrões de instaladores. Resolve >70% dos cartões em produção.',
            },
            {
              icon: '2',
              label: 'Nested attack',
              desc: 'Dado UMA chave de QUALQUER setor (do passo 1), explora correlação do PRNG 16-bit para derivar as outras 31 chaves do cartão. Segundos por chave em hardware modesto.',
            },
            {
              icon: '3',
              label: 'Hardnested',
              desc: 'Para Classic EV1 ou clones com PRNG fortalecido. Explora vazamento de bits de paridade (Meijer/Verdult CCS 2015). Precisa milhares de auth, mas computa offline em segundos no Flipper.',
            },
            {
              icon: '4',
              label: 'MFKey32 (assimétrico)',
              desc: 'Sem acesso ao cartão real, com acesso ao LEITOR. Flipper emula cartão; leitor inicia auth; Flipper captura nonces; recupera chave do setor. Aplicação: pesquisa autorizada em leitor instalado.',
            },
          ]}
        />
      </Section>

      <Section title="Comparativo de complexidade" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Ataque', 'Pré-requisito', 'Hardware', 'Tempo', 'Funciona contra']}
          rows={[
            ['Dictionary', 'Lista de chaves comuns', 'Flipper Zero', '~5s por cartão', 'Classic 1K/4K com chaves default'],
            ['Nested', '≥1 chave conhecida', 'Flipper Zero', '~30s a 2min para derivar todas', 'Classic 1K/4K original'],
            ['Hardnested', '≥1 chave conhecida + leitor que aceita re-auth', 'Flipper Zero', '~5–15min', 'Classic EV1 / hardened'],
            ['MFKey32', 'Acesso ao leitor genuíno', 'Flipper + 2 auth no leitor', '~minutos', 'Qualquer Classic atrás de leitor genuíno'],
            ['Static enc. nonce (2024/1275)', 'Cartões hardened de variantes recentes', 'Proxmark3 / Flipper', '~30min+', 'Variantes pós-2020'],
          ]}
        />
      </Section>

      <Section title="MFKey32, em detalhe" accent={accent}>
        <FlowDiagram
          title="Fluxo do MFKey32"
          orientation="vertical"
          accent={accent}
          steps={[
            { icon: '🎭', label: 'Flipper assume papel de cartão', desc: 'Em "Detect Reader" mode, anuncia UID e ATQA/SAK de Classic.' },
            { icon: '📡', label: 'Leitor real envia REQA → SELECT', desc: 'Inicialização ISO 14443A normal. UID escolhido pelo Flipper é aceito.' },
            { icon: '🔑', label: 'Leitor envia AUTH (cmd 0x60 ou 0x61) sobre setor X', desc: 'Auth Crypto1 começa: leitor envia challenge, espera resposta encriptada.' },
            { icon: '📥', label: 'Flipper grava (Nt, Nr, Ar, At)', desc: 'Quatro nonces da auth. Flipper RESPONDE com valores plausíveis (mas inválidos) para forçar re-auth do leitor.' },
            { icon: '🔁', label: 'Repete: 2 auths sobre o mesmo setor', desc: 'Com 2 sessões capturadas para o mesmo setor, MFKey32 recupera Key A ou Key B em ~minutos no app noproto/FlipperMfkey.' },
            { icon: '🔓', label: 'Chave recuperada', desc: 'Vale para AQUELE setor. Para mais setores, capturar mais auths.' },
          ]}
        />
        <Callout tone="danger">
          <strong>Limite ético claríssimo.</strong> Capturar nonces de leitor genuíno alheio para
          recuperar chave é Art. 154-A do CP brasileiro (invasão de dispositivo informático). Uso
          legítimo: hardware próprio, pentest contratado com escopo escrito, ou pesquisa em ambiente
          controlado com consentimento do operador.
        </Callout>
        <CodeBlock lang="text" filename="estrutura do .nfc capturado para MFKey32">
{`Filetype: Flipper NFC keys
Version: 1
# Mfkey32 nonces — captured during reader auth attempts against the Flipper
Mfkey32:
   nT: 9C2A2531  uID: 045CA1B2  nR: BAFD2C5E  aR: 8D0142D8
   nT: 11AD33F0  uID: 045CA1B2  nR: 73E1456A  aR: 5C90A2A1
# Cada par é uma sessão de auth. 2 sessões para o mesmo setor → key recovery.`}
        </CodeBlock>
      </Section>

      <Section title="Linha do tempo: 30 anos de Crypto1" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { when: '1994', label: 'Philips lança MIFARE Classic', detail: 'Cifra Crypto1 mantida sob NDA. Adoção massiva em transporte e acesso.' },
            { when: '2007', label: 'Nohl/Plötz fazem reverse engineering parcial — 24C3', detail: 'Imageamento do silício revela parte da estrutura. Acende a discussão.', highlight: true },
            { when: '2008', label: 'Garcia et al., Dismantling MIFARE Classic — ESORICS 2008', detail: 'Quebra completa publicada. Recuperação de chave em <1s com 1–2 auth contra leitor genuíno.', highlight: true },
            { when: '2009', label: 'Garcia/de Koning Gans/Verdult — Wirelessly Pickpocketing — IEEE S&P', detail: 'Nested attack formalizado. Ferramentas open source surgem (mfoc, mfcuk).', highlight: true },
            { when: '2010', label: 'Proxmark3 firmware integra ataques Classic', detail: 'mfoc e mfcuk viram comandos nativos.' },
            { when: '2011', label: 'NXP lança MIFARE Plus — caminho de migração', detail: 'Modos SL1/SL2/SL3 com AES progressivo.' },
            { when: '2014', label: 'OV-chipkaart troca para DESFire em fase final', detail: 'Operadora holandesa termina migração iniciada após ESORICS 2008.' },
            { when: '2015', label: 'Meijer/Verdult, Hardnested — ACM CCS 2015', detail: 'Quebra do Classic EV1/hardened via paridade.', highlight: true },
            { when: '2020', label: 'Flipper Zero entrega ao público as 4 técnicas em UI', detail: 'Dictionary + nested + hardnested + mfkey32 acessíveis sem laptop.', highlight: true },
            { when: '2024', label: 'Static Encrypted Nonce variant — IACR ePrint 2024/1275', detail: 'Refinamento contra clones recentes que tentam fortalecer mais o PRNG.' },
            { when: '2026', label: 'Classic ainda dominante em prédios brasileiros antigos', detail: 'Migração para DESFire EV3 em curso, mas inércia operacional alta.' },
          ]}
        />
      </Section>

      <Section title="Q&A" accent={accent}>
        <QAItem
          q="Por que ainda existe MIFARE Classic em 2026?"
          a={
            <>
              Resposta combina três fatores. (1) <strong>Custo unitário</strong>: cartão Classic
              chega a US$0.50 contra US$2–4 de DESFire EV3 — diferença que escala em frotas de 100
              mil cartões. (2) <strong>Inércia de leitores</strong>: o parque instalado de leitores
              chineses baratos só fala Classic; trocar significa CAPEX. (3) <strong>Ciclo de
              migração</strong>: reemitir cartões para usuários finais (transporte público, condomínio,
              empresa) leva 6 meses a 2 anos por programa. NXP comercializa MIFARE Plus exatamente
              como caminho de migração — modos SL1 (compatível com Classic) → SL2 (AES + Classic) →
              SL3 (AES puro).
            </>
          }
        />
        <QAItem
          q="O Flipper consegue clonar QUALQUER MIFARE Classic em qualquer cartão?"
          a={
            <>
              Tecnicamente recupera o conteúdo, mas escrever de volta tem nuances. Cartão Classic
              original não permite escrever no bloco 0 setor 0 (UID + manufacturer data). Para clone
              UID-completo é preciso <strong>cartão &ldquo;magic&rdquo;</strong> (chinese magic card,
              CUID/FUID/UFUID) — variantes não-NXP que aceitam comandos especiais para regravar o
              bloco 0. Sem cartão magic, o clone fica com UID diferente, e qualquer leitor que valide
              UID na lista (a maioria) rejeita. Detalhe importante para entender por que clonagem
              não é &ldquo;trivial&rdquo; em todos os cenários.
            </>
          }
        />
        <QAItem
          q="DESFire EV3 está realmente seguro?"
          a={
            <>
              No estado atual (2026), sim — para acesso físico. AES-128 + autenticação mútua + secure
              messaging + LRP mode + Common Criteria EAL5+ é o piso. Os ataques relevantes contra
              DESFire historicamente foram <strong>side-channel</strong> (DPA contra DES no EV1
              pré-2011, corrigido em revisões e mitigado a partir do EV2). Não há, em 2026, ataque
              público prático que recupere chave AES-128 de DESFire EV2/EV3 contra cartão genuíno.
              Próximo módulo entra nessa fronteira.
            </>
          }
        />
      </Section>

      <Section title="Defesas" accent={accent}>
        <Callout tone="success">
          <strong>1. Migrar para DESFire EV2/EV3.</strong> AES-128 + autenticação mútua + secure
          messaging. Custo operacional alto, mas é o único caminho que sobrevive ao toolkit atual.
        </Callout>
        <Callout tone="success">
          <strong>2. Diversificação de chave por cartão.</strong> Mesmo que um cartão seja
          comprometido, a chave master nunca aparece. Padrão: <InlineCode>K_card = AES(K_master, UID)</InlineCode>.
          DESFire suporta nativamente.
        </Callout>
        <Callout tone="warn">
          <strong>3. Não confiar em &ldquo;modo SL1 do Plus&rdquo;.</strong> Compatibilidade Classic
          dentro do Plus reproduz a vulnerabilidade. Migração só vale se chega em SL3 (AES puro).
        </Callout>
        <Callout tone="warn">
          <strong>4. Hash do UID NÃO é defesa.</strong> Implementações que armazenam só
          &ldquo;hash(UID)&rdquo; no backend continuam vulneráveis a clonagem em cartão magic; UID
          vaza no anti-collision e o atacante reproduz qualquer UID.
        </Callout>
      </Section>

      <Section title="Referências" accent={accent}>
        <ul className="list-disc pl-5 text-sm" style={{ color: 'var(--ffv-text2)' }}>
          <li>Garcia/de Koning Gans/Muijrers/van Rossum/Verdult/Wichers Schreur/Jacobs, <em>Dismantling MIFARE Classic</em>, ESORICS 2008 — proxmark.nl/files/Documents/13.56%20MHz%20-%20MIFARE%20Classic/Dismantling.MIFARE.Classic-ESORICS.2008.pdf</li>
          <li>Garcia/de Koning Gans/Verdult, <em>Wirelessly Pickpocketing a Mifare Classic Card</em>, IEEE S&amp;P 2009</li>
          <li>Meijer/Verdult, <em>Ciphertext-only cryptanalysis on hardened Mifare Classic cards</em>, ACM CCS 2015</li>
          <li>IACR ePrint 2024/1275, <em>Cryptanalysis on the static encrypted nonce variant of MIFARE Classic</em></li>
          <li>NXP, <em>MF1S50YYX MIFARE Classic 1K Datasheet</em></li>
          <li>noproto, <em>FlipperMfkey</em> — github.com/noproto/FlipperMfkey</li>
          <li>AloneLiberty, <em>FlipperNested</em> — github.com/AloneLiberty/FlipperNested</li>
          <li>Flipper Devices, <em>NFC: MFKey32 attack</em> — docs.flipper.net/zero/nfc/mfkey32</li>
          <li>RfidResearchGroup, <em>Proxmark3</em> — github.com/RfidResearchGroup/proxmark3</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
