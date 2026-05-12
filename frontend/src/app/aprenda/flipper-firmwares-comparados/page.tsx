import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, DecisionBox, FlowDiagram, Timeline } from '@/components/article/primitives';

export const metadata = getModuleMetadata('flipper-firmwares-comparados');

const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a relação entre os firmwares Xtreme e Momentum em 2026?',
    options: [
      'Xtreme e Momentum são o mesmo projeto com nomes diferentes',
      'Momentum é o sucessor oficial do Xtreme — a equipe Xtreme anunciou descontinuidade em nov/2024 e migrou o projeto para Next-Flip/Momentum-Firmware no GitHub',
      'Xtreme processou Momentum',
      'Momentum é um fork não autorizado',
    ],
    correct: 1,
    explanation: 'O time do Xtreme (DarkFlippers) anunciou descontinuidade do Xtreme em novembro de 2024 e migrou todo o desenvolvimento para o Momentum sob nova organização (Next-Flip/Momentum-Firmware). Momentum é considerado herdeiro direto e mantém a maior parte das features (BLE Spam, BadKB, JS scripting, UI customizável). Em 2026 é o custom firmware mais usado por power-users.',
  },
  {
    question: 'Qual é a forma OFICIALMENTE recomendada e mais resiliente de instalar firmware no Flipper Zero?',
    options: [
      'Compilar do source com arm-none-eabi-gcc na máquina',
      'qFlipper (desktop oficial, multiplataforma) ou Web Updater (lab.flipper.net via Chrome WebSerial); custom firmwares disponibilizam .tgz/.dfu para instalar em qFlipper via "Install from file"',
      'Apenas via SD card com bootloader manual',
      'Conectar UART e flashar com OpenOCD',
    ],
    correct: 1,
    explanation: 'qFlipper é a aplicação desktop oficial (Qt6, multiplataforma) que faz update incluindo o radio firmware do Cortex-M0+ via FUS (Firmware Update Service). Web Updater (lab.flipper.net) usa WebSerial — Chrome/Edge. Custom firmwares (Momentum, Unleashed, RogueMaster) publicam releases .tgz que qFlipper aceita via "Install from file". Momentum mantém também updater próprio em momentum-fw.dev. Compilar do source funciona mas não é necessário para 99% dos usuários.',
  },
  {
    question: 'Por que o Unleashed é a escolha de quem prefere firmware "minimalista funcional"?',
    options: [
      'Tem menos features que o oficial',
      'Foco em estabilidade do core e desbloqueio Sub-GHz regional, sem animações/jogos extras; mantido por xMasterX no GitHub xMasterX/unleashed-firmware',
      'Não suporta apps comunitários',
      'É escrito em Rust',
    ],
    correct: 1,
    explanation: 'Unleashed (xMasterX/unleashed-firmware) foca em: regiões de TX desbloqueadas (sem region lock europeu), apps comunitários estáveis, ausência de "fluff" (sem animações dolphin extras, sem jogos). Posicionamento: maior compatibilidade com apps + menor surface de bugs. RogueMaster é fork do Unleashed que adiciona o "fluff".',
  },
  {
    question: 'O que é o repositório xMasterX/all-the-plugins?',
    options: [
      'Um firmware completo',
      'Coleção curada de FAPs (Flipper Application Packages) compilados para múltiplos firmwares, mantida por xMasterX, com 1.5k+ stars e 200+ releases — referência canônica para apps do ecossistema',
      'Site oficial da Flipper Devices',
      'Bot de Discord',
    ],
    correct: 1,
    explanation: 'O repositório xMasterX/all-the-plugins agrega FAPs (Flipper Application Packages — extensão .fap, plugins compilados via ufbt) para diferentes versões/firmwares. É a fonte mais usada na comunidade para baixar apps em massa. Referência paralela: djsime1/awesome-flipperzero (lista curada de tudo do ecossistema). Apps populares: WiFi Marauder companion, Sub-GHz Bruteforcer, Mfkey32, BLE Spam, BadKB, U2F, TOTP.',
  },
  {
    question: 'BLE Spam — funcionalidade comum a Momentum e RogueMaster — faz exatamente o quê?',
    options: [
      'Quebra senha do Bluetooth',
      'Transmite advertisement packets BLE de fabricantes (Apple Continuity, Google Fast Pair, SwiftPair, etc.) que dispositivos próximos exibem como pop-ups; flooding pode degradar UX local',
      'Invade fones Bluetooth',
      'Hackeia smartwatches',
    ],
    correct: 1,
    explanation: 'BLE Spam (techo open-source, baseado em pesquisas de Techryptic, Aristois, e ECTO-1A) transmite advertisement broadcasts BLE imitando packets de protocolos de discovery (Apple Continuity Pair Setup, Google Fast Pair, Microsoft SwiftPair). Sistemas operacionais próximos exibem prompts ("AirTag desconhecido", "Pareie seu fone"). Não compromete sistemas — apenas explora UX de discovery. iOS 17.2+ adicionou rate-limiting que reduz efeito visual. Em locais públicos pode configurar Art. 266 CP (interrupção de serviço informático). Use só em lab.',
  },
  {
    question: 'ufbt (uFlipper Build Tool) serve para quê no ecossistema?',
    options: [
      'Calibrar antena',
      'Toolchain Python/pip oficial para compilar FAPs sem clonar o firmware completo — permite desenvolver apps externos com SDK headers e linker stub',
      'Atualizar bateria',
      'Instalar fontes do display',
    ],
    correct: 1,
    explanation: 'ufbt (instalado via pip install ufbt) é a versão "user-friendly" do fbt (Flipper Build Tool). Baixa SDK precompilado, headers e linker stubs para a versão de firmware-alvo. Devs criam apps em C/C++ contra a API do Furi sem precisar clonar e compilar o firmware inteiro (15+ minutos em máquina razoável). Documentado em github.com/flipperdevices/flipperzero-ufbt.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="flipper-firmwares-comparados"
      title="Firmwares: Official, Momentum, Unleashed, RogueMaster"
      icon="⚙️"
      xp={50}
      readTime={9}
      trailName="Flipper Zero & Hardware Hacking"
      trailColor={accent}
      nextSlug="sub-ghz-fundamentos"
      nextTitle="Sub-GHz fundamentos"
      quiz={quiz}
    >
      <Section title="Mapa do ecossistema em 2026" accent={accent}>
        <p className="text-sm leading-6">
          Existem hoje quatro firmwares relevantes para o Flipper Zero. Todos open-source GPLv3, todos
          atualizáveis via qFlipper. A escolha não é "qual é melhor" — é "qual perfil de uso você tem".
        </p>
        <Timeline
          title="Linha do tempo dos firmwares"
          accent={accent}
          events={[
            { when: '2022', label: 'Official (flipperdevices) lança', detail: 'Repositório flipperdevices/flipperzero-firmware, base de toda a comunidade' },
            { when: '2022–2024', label: 'Era Xtreme', detail: 'DarkFlippers/Xtreme cresce como custom firmware mais popular' },
            { when: '2023', label: 'Unleashed e RogueMaster ganham tração', detail: 'Forks com filosofias distintas (minimalismo vs customização total)' },
            { when: 'nov/2024', label: 'Xtreme descontinuado', detail: 'Equipe anuncia migração para Momentum (Next-Flip/Momentum-Firmware)', highlight: true },
            { when: '2025', label: 'Momentum se consolida', detail: 'Adota updater próprio em momentum-fw.dev, JS engine, BLE Spam refinado' },
            { when: 'mai/2026', label: 'RogueMaster sync recente', detail: 'Last sync 8/maio/2026 — mantenedor RogueMaster ativo' },
          ]}
        />
      </Section>

      <Section title="Tabela comparativa — os 4 firmwares" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Critério', 'Official', 'Momentum', 'Unleashed', 'RogueMaster']}
          rows={[
            ['Mantenedor', 'Flipper Devices OÜ', 'Next-Flip (ex-Xtreme)', 'xMasterX', 'RogueMaster'],
            ['Repo', 'flipperdevices/flipperzero-firmware', 'Next-Flip/Momentum-Firmware', 'xMasterX/unleashed-firmware', 'RogueMaster/flipperzero-firmware-wPlugins'],
            ['Filosofia', 'Estabilidade, compliance', 'Power-user, feature-rich', 'Minimalista funcional', 'Tudo + extras visuais'],
            ['Region lock', 'Respeita regional', 'Desbloqueado', 'Desbloqueado', 'Desbloqueado'],
            ['JS scripting', '❌', '✅', '⚠️ parcial', '✅'],
            ['BLE Spam', '❌', '✅', '⚠️ via plugin', '✅'],
            ['BadKB (BadUSB BLE)', '❌', '✅', '✅', '✅'],
            ['UI customizável', '❌', '✅ (asset packs)', '⚠️ limitado', '✅ (animações, jogos extras)'],
            ['Apps inclusos', '~10 nativos', '50+ via Apps', '40+ comunitários', '60+ comunitários'],
            ['Updater próprio', 'qFlipper', 'momentum-fw.dev', 'qFlipper "Install from file"', 'qFlipper "Install from file"'],
            ['Update cadence', 'Mensal-bimestral', 'Quase semanal', 'Quase semanal', 'Frequente'],
            ['Ideal para', 'Iniciante / regulado', 'Pentester power-user', 'Quem prefere core estável', 'Quem quer customização visual'],
          ]}
        />
      </Section>

      <Section title="Perfis de decisão" accent={accent}>
        <DecisionBox
          scenario="Sou novo no Flipper, comprei semana passada"
          winner="Official"
          winnerColor={accent}
          why="Curva de aprendizado mais suave, suporte oficial de docs.flipper.net, atualizações testadas. Quando dominar, considere migrar."
          alternatives={[
            { name: 'Momentum', note: 'se já tem experiência prévia com hardware hacking' },
          ]}
        />
        <DecisionBox
          scenario="Faço pentest físico autorizado e quero feature-set máximo"
          winner="Momentum"
          winnerColor={accent}
          why="Sucessor do Xtreme; BLE Spam, BadKB, JS scripting, UI customizável, asset packs, BLE companion. Updater próprio em momentum-fw.dev. É a escolha dominante de power-users em 2026."
          alternatives={[
            { name: 'Unleashed', note: 'se prefere firmware leve e estável, sem fluff' },
            { name: 'RogueMaster', note: 'se quer ainda mais customização visual' },
          ]}
        />
        <DecisionBox
          scenario="Quero compilar meus próprios apps (FAPs)"
          winner="Official + ufbt"
          winnerColor={accent}
          why="SDK estável, documentação oficial, ecossistema canônico. ufbt baixa SDK precompilado para o firmware-alvo. Use Official como referência de API; depois recompile os FAPs para Momentum/Unleashed se quiser."
          alternatives={[
            { name: 'Momentum SDK', note: 'se vai usar APIs específicas do Momentum (JS, asset pack)' },
          ]}
        />
      </Section>

      <Section title="Como instalar — fluxo passo a passo" accent={accent}>
        <FlowDiagram
          title="Pipeline de update (Official ou custom)"
          accent={accent}
          steps={[
            { icon: '💾', label: 'Backup', desc: 'Copie o conteúdo do SD card (chaves NFC, IR remotes, Sub-GHz saves) — antes de qualquer flash' },
            { icon: '⬇️', label: 'Baixar release', desc: 'Official: github.com/flipperdevices/flipperzero-firmware/releases. Custom: release page do projeto (.tgz)' },
            { icon: '🔌', label: 'Conectar USB-C', desc: 'qFlipper detecta via CDC. WebUpdater pede permissão WebSerial' },
            { icon: '📦', label: 'Install from file', desc: 'qFlipper aceita .tgz de custom firmware diretamente' },
            { icon: '⚡', label: 'Flash + FUS', desc: 'qFlipper flasheia M4 + atualiza M0+ via FUS (Firmware Update Service) automaticamente' },
            { icon: '✅', label: 'Reboot e verificar', desc: 'Settings → Firmware Info → confirmar versão e variante' },
          ]}
        />
        <CodeBlock lang="bash">{`# Caminho 1 — qFlipper (recomendado, oficial multiplataforma)
# Baixe em https://flipperzero.one/update
# Conecte o Flipper via USB-C, abra qFlipper, "Install from file"

# Caminho 2 — Web Updater (Chrome/Edge, sem instalação)
# Acesse https://lab.flipper.net (Official)
# ou https://momentum-fw.dev (Momentum)
# Conceda permissão WebSerial

# Caminho 3 — Compilar Official do source
git clone --recursive https://github.com/flipperdevices/flipperzero-firmware.git
cd flipperzero-firmware
./fbt flash_usb_full       # builda + flasheia em ~3-8 min

# Caminho 4 — Desenvolver app (FAP) com ufbt
pip install --upgrade ufbt
ufbt update                # baixa SDK do firmware-alvo
ufbt create APPID=meu_app  # cria template
ufbt                       # builda meu_app.fap
ufbt launch                # copia pro Flipper e abre`}</CodeBlock>
        <Callout tone="warn" icon="⚡">
          Custom firmware <strong>não anula garantia</strong> em uso normal — Flipper Devices documenta que
          firmware é open-source e usuário pode rodar fork. Mas: instalar release-candidate ou nightly em
          firmware crítico pode <em>brickar temporariamente</em> (recuperável via DFU mode com qFlipper).
        </Callout>
      </Section>

      <Section title="FAPs essenciais — apps que você vai querer" accent={accent}>
        <p className="text-sm leading-6">
          FAP = Flipper Application Package, extensão <code>.fap</code>. Compilado via ufbt, copiado para o SD
          card em <code>/ext/apps/&lt;categoria&gt;/</code>. Funcionam em todos os firmwares (com pequenas
          variações de SDK).
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'WiFi Marauder companion', v: 'UI no Flipper para controlar ESP32 com firmware Marauder (deauth, evil portal — pentest Wi-Fi)' },
            { k: 'Sub-GHz Bruteforcer', v: 'Brute-force sequencial de protocolos de código fixo (Princeton, CAME, NICE) — em hardware seu' },
            { k: 'Mfkey32', v: 'Recupera chaves Crypto1 do Mifare Classic via ataque nested (paper Garcia/Verdult ESORICS 2008)' },
            { k: 'BLE Spam', v: 'Advertisement spoofing — Apple Continuity, Google Fast Pair, SwiftPair' },
            { k: 'BadKB', v: 'BadUSB sobre BLE HID — sem cabo' },
            { k: 'U2F Authenticator', v: 'Implementação FIDO U2F (legacy, antes do FIDO2/WebAuthn) — Flipper como segundo fator' },
            { k: 'TOTP', v: 'Authenticator app (RFC 6238) — códigos TOTP no LCD' },
            { k: 'Picopass', v: 'Leitura/escrita de iCLASS legacy (HID iCLASS Standard / SE com chaves comprometidas)' },
            { k: 'Weather Station', v: 'Decodificador de sensores meteorológicos comerciais 433/868 MHz (Acurite, Oregon Scientific, etc.)' },
            { k: 'DOOM port', v: 'Porte de DOOM no LCD 128×64 — porque sim' },
            { k: 'NRF24 sniffer', v: 'Com módulo NRF24L01 no GPIO: sniff de teclados/mouses 2.4 GHz (papers MouseJack 2016)' },
          ]}
        />
        <Callout tone="info" icon="🗂️">
          Fontes canônicas de FAPs: <strong>xMasterX/all-the-plugins</strong> (1.5k+ stars, 200+ releases —
          coleção pré-compilada) e <strong>djsime1/awesome-flipperzero</strong> (lista curada de TUDO no
          ecossistema, atualizada mensalmente).
        </Callout>
      </Section>

      <Section title="Riscos e gotchas práticos" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Cenário', 'Risco', 'Mitigação']}
          rows={[
            ['Instalar firmware nightly', 'Brick temporário, instabilidade', 'Use só releases tagged. Mantenha qFlipper para recovery DFU'],
            ['Atualizar firmware com SD bagunçado', 'Perda de dados (chaves NFC, IR salvos)', 'Backup do SD antes (cartão FAT32, conteúdo de /ext copiável)'],
            ['Misturar FAPs entre firmwares', 'API mismatch — app não abre, crash', 'ufbt aponta para o firmware-alvo correto, ou baixe FAP do mesmo firmware'],
            ['Usar BLE Spam em local público', 'Pode tipificar Art. 266 CP (interrupção de serviço informático), 1–3 anos', 'SOMENTE em lab. Fora de lab = risco penal real'],
            ['TX Sub-GHz sem cuidado', 'Excede limite ANATEL 680/2017 — uso clandestino LGT 183-184', 'Conhecer o limite (10 mW EIRP em 433 MHz no BR), preferir RX-only fora de pentest'],
            ['Firmware com region desbloqueado', 'TX em frequência fora da regulação local', 'É sua responsabilidade conhecer a regulação do país onde está'],
          ]}
        />
        <Callout tone="success" icon="🎯">
          Recomendação prática para iniciante BR em maio/2026: comece com <strong>Official</strong>, faça
          backup, brinque no lab, leia papers de Sub-GHz e NFC. Quando tiver 30+ horas de uso, migre para
          <strong> Momentum</strong> com qFlipper. Não pule etapas — RogueMaster com 80 plugins pode confundir
          quem ainda não entende os fundamentos.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
