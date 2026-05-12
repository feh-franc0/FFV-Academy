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
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('desenvolvimento-faps-ufbt');

const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença essencial entre ufbt e o FBT (Flipper Build Tool) original?',
    options: [
      'ufbt é mais rápido porque é escrito em Rust',
      'ufbt baixa o SDK pré-built do channel selecionado e compila apenas seu app FAP, sem clone do firmware completo; FBT exige checkout do flipperzero-firmware inteiro com toolchain bootstrap',
      'ufbt usa LLVM, FBT usa GCC',
      'ufbt só roda em Linux, FBT é cross-platform',
    ],
    correct: 1,
    explanation: 'ufbt = micro Flipper Build Tool. Distribuído como pip package; baixa SDK pré-empacotado (release/dev/rc) do channel desejado. FBT é a build tool completa, baseada em SCons, exige clone do flipperzero-firmware (gigabytes), bootstrap de toolchain ARM, e é a forma de contribuir para o firmware. Para FAPs externos, ufbt é o caminho.',
  },
  {
    question: 'No application.fam, por que apptype = "EXTERNAL" é crítico para um FAP de desenvolvedor?',
    options: [
      'Porque permite executar código privilegiado',
      'EXTERNAL gera um .fap (binário PIC realocável) carregado dinamicamente pelo loader do firmware via SD card; SERVICE/SYSTEM seriam compilados estaticamente dentro do firmware, exigindo recompilação completa',
      'Porque dá acesso à CPU2 (rádio BLE)',
      'EXTERNAL desativa verificação de assinatura',
    ],
    correct: 1,
    explanation: 'apptype EXTERNAL produz Position-Independent Code (PIC) empacotado como .fap, com header descrevendo deps e API version. O loader (apps/system/loader) faz relocação em runtime ao carregar do SD. SERVICE/SYSTEM/STARTUP são linkados dentro do firmware monolítico — exigem rebuild completo do firmware. EXTERNAL é o que permite distribuir apps independentes via Apps Hub e SD copy.',
  },
  {
    question: 'Por que o entry_point de um FAP recebe void* e retorna int32_t?',
    options: [
      'Por compatibilidade C++',
      'Convenção FreeRTOS / Furi: void* é argumento opaco passável pelo loader (NULL na prática); int32_t é exit code que o kernel registra; assinatura compatível com furi_thread_alloc_ex como entrypoint de thread',
      'Para integração com WebAssembly',
      'Para compatibilidade com Python',
    ],
    correct: 1,
    explanation: 'O Furi kernel é construído sobre FreeRTOS. Threads em FreeRTOS têm assinatura void func(void*). A Furi adapta para int32_t func(void*) — retorno é exit status armazenado em FuriThread. Para FAPs externos o argumento passado pelo loader é geralmente NULL ou uma path string quando lançado via "Open With". A assinatura é o contrato com o loader.',
  },
  {
    question: 'No Furi, por que se usa furi_message_queue_get com FuriWaitForever em vez de polling?',
    options: [
      'Por elegância de código',
      'Porque furi_message_queue_get bloqueia o thread em FreeRTOS — kernel suspende a tarefa, libera CPU para outras tasks e dorme o MCU em STOP mode entre interrupts; polling consumiria CPU e bateria',
      'Polling não funciona no STM32WB55',
      'Polling causa race condition',
    ],
    correct: 1,
    explanation: 'FuriWaitForever bloqueia o thread (estado Blocked no FreeRTOS) até queue receber mensagem. Kernel ativa idle hook que pode entrar em STOP mode (autonomia 28 dias). Polling em while(1) bloqueia o scheduler e impede sleep — bateria duraria horas em vez de dias. Por isso a regra: tudo orientado a evento via message queue.',
  },
  {
    question: 'Como funciona o pipeline de desenho do canvas no Flipper?',
    options: [
      'Direct framebuffer access pelo app',
      'O ViewPort registra um draw_callback; o GUI service invoca esse callback passando um Canvas; suas chamadas canvas_draw_* mutam buffer interno; ao retornar, GUI faz flush via SPI para o ST7567 LCD',
      'OpenGL ES para o display',
      'Renderização em GPU dedicada',
    ],
    correct: 1,
    explanation: 'GUI service serializa o acesso ao display: suas funções canvas_draw_* mutam um framebuffer interno (1024 bytes = 128×64 / 8 mono). Após o callback retornar, GUI envia o framebuffer via SPI ao ST7567 (controller do LCD mono). Você nunca tem acesso direto ao framebuffer — passa pelas APIs Canvas. Isso preserva composição com outras layers (status bar, overlays).',
  },
  {
    question: 'Para debug de FAP via VSCode, qual hardware é necessário?',
    options: [
      'Nenhum — é debug por USB-CDC',
      'Adaptador SWD (Black Magic Probe ou ST-Link v2/v3) ligado aos pads internos SWDIO/SWCLK do Flipper, abertos pelo case; ufbt vscode_dist gera launch.json com cortex-debug + OpenOCD',
      'Cabo JTAG 20-pin',
      'Apenas USB-C com firmware especial',
    ],
    correct: 1,
    explanation: 'O STM32WB55 expõe SWD nos pads internos (SWDIO, SWCLK, GND, RST). O case do Flipper precisa abrir para acessar. Black Magic Probe ou ST-Link conectam aos pads. ufbt vscode_dist gera .vscode/launch.json com cortex-debug + OpenOCD/BMP, integrando F5 (run) e breakpoints reais com leitura de RAM/registradores ARM.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="desenvolvimento-faps-ufbt"
      title="Seu primeiro FAP em C com ufbt — Hello World ao deploy"
      icon="⌨️"
      xp={80}
      readTime={16}
      trailName="Flipper Zero & Hardware Hacking"
      trailColor={accent}
      nextSlug="flipper-dolphin-zerar-niveis"
      nextTitle="Zerar Dolphin"
      quiz={quiz}
    >
      <Section title="O que é um FAP" accent={accent}>
        <p className="text-sm leading-6">
          <strong>FAP</strong> = Flipper Application Package. É um binário <em>position-independent</em> (PIC)
          que o firmware carrega dinamicamente do SD card em <InlineCode>/ext/apps/&lt;categoria&gt;/</InlineCode>.
          Equivale conceitualmente a um <InlineCode>.so</InlineCode> Linux ou Android APK em escala MCU. Substituiu
          o modelo monolítico anterior (até 2022 todo app vinha embutido no firmware).
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Formato binário', v: <>ELF customizado com header <InlineCode>FAP</InlineCode> e tabela de relocação</> },
            { k: 'Loader', v: <>flipperzero-firmware/applications/services/loader — relocação em runtime</> },
            { k: 'Tamanho típico', v: <>5–80 KB; máximo prático ~256 KB (RAM disponível para PIC)</> },
            { k: 'API version', v: <>Header guarda versão da API SDK; loader rejeita FAP de SDK incompatível</> },
            { k: 'Distribuição', v: <>Apps Hub oficial (lab.flipper.net), GitHub releases, ou SD copy manual</> },
            { k: 'Linguagem', v: <>C (oficial). Momentum/Xtreme adicionam JS scripting via mJS embedded</> },
          ]}
        />
      </Section>

      <Section title="ufbt — micro Flipper Build Tool" accent={accent}>
        <p className="text-sm leading-6">
          <strong>ufbt</strong> nasceu em 2023 como simplificação radical do FBT. Empacotada como pip package,
          baixa SDK pré-built do channel desejado (<InlineCode>release</InlineCode>, <InlineCode>rc</InlineCode>,{' '}
          <InlineCode>dev</InlineCode>) e compila apenas seu app — sem clone do firmware. Tempo de "primeiro
          hello world": &lt; 5 minutos.
        </p>
        <FlowDiagram
          title="Pipeline ufbt do zero ao .fap"
          accent={accent}
          orientation="vertical"
          steps={[
            { icon: '🐍', label: 'pip install --upgrade ufbt', desc: 'Pacote Python: SCons + ARM toolchain wrapper + ESP-IDF helpers' },
            { icon: '⬇️', label: 'ufbt update', desc: 'Baixa SDK do channel default. ~80 MB cacheados em ~/.ufbt/' },
            { icon: '✨', label: 'ufbt create APPID=hello_ffv', desc: 'Scaffolding: gera application.fam + hello_ffv.c boilerplate' },
            { icon: '🔧', label: 'ufbt', desc: 'Compila para Cortex-M4 (arm-none-eabi-gcc), produz dist/hello_ffv.fap' },
            { icon: '🚀', label: 'ufbt launch', desc: 'Detecta Flipper via USB CDC, copia .fap para /ext/apps_data/.tmp/, executa' },
            { icon: '🐞', label: 'ufbt vscode_dist (opcional)', desc: 'Gera .vscode/ com tasks build/debug + cortex-debug config' },
          ]}
        />
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'ufbt', 'FBT (full)']}
          rows={[
            ['Instalação', 'pip install ufbt', 'git clone flipperzero-firmware (~5 GB com history)'],
            ['SDK source', 'Pré-built baixado (channel)', 'Compilado do source local'],
            ['Tempo primeiro build', '< 30 s', '5–15 min (toolchain bootstrap)'],
            ['Modificar firmware core', 'Não', 'Sim (PR para upstream)'],
            ['Build de FAP externo', 'Sim (caso primário)', 'Sim mas overkill'],
            ['Cross-platform', 'Linux/macOS/Windows/WSL', 'Linux/macOS bem; Windows requer WSL'],
          ]}
        />
        <DecisionBox
          scenario="Quero desenvolver um FAP novo. ufbt ou FBT?"
          winner="ufbt — sempre, salvo se você quer contribuir ao firmware core"
          winnerColor={accent}
          why="Para qualquer app externo (pentest, ferramenta, jogo, integração de sensor) ufbt é mais rápido, mais simples e gera o mesmo .fap final. FBT só faz sentido se você está modificando o flipperzero-firmware (drivers, kernel Furi, GUI core)."
          alternatives={[
            { name: 'FBT', when: 'Quando o objetivo é PR upstream em flipperdevices/flipperzero-firmware' },
            { name: 'JS scripting (Momentum)', when: 'Protótipo rápido sem compilar; perde acesso direto a HW low-level' },
            { name: 'CircuitPython no DevBoard', when: 'Lógica no ESP32, não no STM32 — caso a lógica não precise dos rádios do Flipper' },
          ]}
        />
      </Section>

      <Section title="Hello World em 30 linhas — o app completo" accent={accent}>
        <p className="text-sm leading-6">
          O exemplo abaixo desenha "Hello, FFV!" centralizado, escuta o botão Back para sair, e usa message
          queue + ViewPort + Canvas — o esqueleto que serve para 90% dos FAPs.
        </p>
        <CodeBlock lang="c">{`// hello_ffv.c — FAP minimalista, idiomático Furi
#include <furi.h>
#include <gui/gui.h>
#include <input/input.h>

typedef struct {
    FuriMessageQueue* input_queue;
    ViewPort* view_port;
    Gui* gui;
} HelloApp;

static void draw_callback(Canvas* canvas, void* ctx) {
    UNUSED(ctx);
    canvas_clear(canvas);
    canvas_set_font(canvas, FontPrimary);
    canvas_draw_str_aligned(canvas, 64, 28, AlignCenter, AlignCenter, "Hello, FFV!");
    canvas_set_font(canvas, FontSecondary);
    canvas_draw_str_aligned(canvas, 64, 48, AlignCenter, AlignCenter, "Back para sair");
}

static void input_callback(InputEvent* event, void* ctx) {
    HelloApp* app = ctx;
    furi_message_queue_put(app->input_queue, event, FuriWaitForever);
}

int32_t hello_ffv_app(void* p) {
    UNUSED(p);
    HelloApp* app = malloc(sizeof(HelloApp));
    app->input_queue = furi_message_queue_alloc(8, sizeof(InputEvent));
    app->view_port = view_port_alloc();
    view_port_draw_callback_set(app->view_port, draw_callback, app);
    view_port_input_callback_set(app->view_port, input_callback, app);
    app->gui = furi_record_open(RECORD_GUI);
    gui_add_view_port(app->gui, app->view_port, GuiLayerFullscreen);

    InputEvent ev;
    bool running = true;
    while(running) {
        if(furi_message_queue_get(app->input_queue, &ev, FuriWaitForever) == FuriStatusOk) {
            if(ev.type == InputTypeShort && ev.key == InputKeyBack) running = false;
        }
    }

    view_port_enabled_set(app->view_port, false);
    gui_remove_view_port(app->gui, app->view_port);
    furi_record_close(RECORD_GUI);
    view_port_free(app->view_port);
    furi_message_queue_free(app->input_queue);
    free(app);
    return 0;
}`}</CodeBlock>
        <Callout tone="info" icon="🧱">
          Padrão a memorizar: <strong>alloc → setup callbacks → run loop → teardown</strong>. Toda alocação
          tem free correspondente; toda <InlineCode>furi_record_open</InlineCode> tem{' '}
          <InlineCode>furi_record_close</InlineCode>. Fugir disso vaza recursos e o loader registra leak warning
          no log do firmware (acessível via CLI <InlineCode>log</InlineCode>).
        </Callout>
      </Section>

      <Section title="application.fam — o manifest" accent={accent}>
        <p className="text-sm leading-6">
          O <InlineCode>application.fam</InlineCode> é Python-like (sintaxe SCons). Define o app ao build system:
          entry, categoria, ícone, stack size, dependências.
        </p>
        <CodeBlock lang="python">{`# application.fam
App(
    appid="hello_ffv",
    name="Hello FFV",
    apptype=FlipperAppType.EXTERNAL,
    entry_point="hello_ffv_app",
    requires=["gui"],
    stack_size=2 * 1024,        # 2 KB — suficiente para draw + queue
    fap_category="Examples",     # cria pasta /ext/apps/Examples
    fap_icon="hello_10x10.png",  # 10x10 mono PNG, fundo transparente
    fap_icon_assets="images",    # opcional: mais sprites
    fap_author="@ffv",
    fap_version="1.0",
    fap_description="Primeiro FAP da trilha FFV Hardware Hacking",
)`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'apptype', v: <>EXTERNAL (FAP standalone), SERVICE, SYSTEM, STARTUP, MENU_EXTERNAL</> },
            { k: 'requires', v: <>Lista de records que o loader abrirá: gui, dialogs, notification, storage</> },
            { k: 'stack_size', v: <>Bytes do stack do thread principal. 1 KB serve para apps simples; 4–8 KB para apps com Sub-GHz/NFC</> },
            { k: 'fap_category', v: <>Pasta destino em /ext/apps/. Categorias oficiais: Sub-GHz, NFC, RFID, Infrared, GPIO, Tools, Games, Examples</> },
            { k: 'fap_icon', v: <>PNG 10×10 monocromático; aparece no menu do Flipper</> },
            { k: 'fap_libs', v: <>Bibliotecas estáticas internas; common: <InlineCode>mbedtls</InlineCode>, <InlineCode>nfc</InlineCode>, <InlineCode>subghz</InlineCode></> },
          ]}
        />
      </Section>

      <Section title="Furi — o kernel do Flipper" accent={accent}>
        <p className="text-sm leading-6">
          Furi é um wrapper opinionado em volta do FreeRTOS + STM32 HAL. Adiciona padrões: Records (singletons
          gerenciados), Message Queues, Mutex, Pub/Sub, Threads tipados. Toda API de hardware passa por ela.
        </p>
        <ArchFlow
          title="Camadas do stack de software"
          accent={accent}
          columns={[
            {
              header: 'Seu FAP',
              items: [
                'Lógica do app',
                'UI/desenho',
                'Manuseio de input',
                'I/O de arquivos',
              ],
              footer: 'C user-space',
            },
            {
              header: 'Furi (kernel framework)',
              items: [
                'furi_record_open/close',
                'furi_message_queue_*',
                'furi_thread_alloc',
                'furi_mutex_*',
                'furi_pubsub_*',
                'furi_hal_* (drivers)',
              ],
              footer: 'API estável de SDK',
            },
            {
              header: 'FreeRTOS + STM32 HAL',
              items: [
                'Scheduler preemptivo',
                'Tick 1 ms',
                'CMSIS-RTOS2 layer',
                'STM32 HAL/LL drivers',
                'IPCC mailbox p/ CPU2',
              ],
              footer: 'Camada baixa',
            },
          ]}
        />
        <NodeGraph
          title="APIs Furi por subsistema (records mais usados)"
          accent={accent}
          legend="Cada record é um singleton acessível via furi_record_open(NAME)"
          columns={[
            {
              label: 'UI / Input',
              nodes: [
                { icon: '🖥️', label: 'RECORD_GUI', sub: 'ViewPort, Canvas, layers' },
                { icon: '💬', label: 'RECORD_DIALOGS', sub: 'Modal de confirmação, file browser' },
                { icon: '🔔', label: 'RECORD_NOTIFICATION', sub: 'LED RGB, vibra, beep' },
              ],
            },
            {
              label: 'Storage / Power',
              nodes: [
                { icon: '💾', label: 'RECORD_STORAGE', sub: 'SD card + LFS interno' },
                { icon: '🔋', label: 'RECORD_POWER', sub: 'Charge state, battery percent' },
                { icon: '🔄', label: 'furi_hal_rtc', sub: 'RTC, timestamps, registers BKP' },
              ],
            },
            {
              label: 'Rádios',
              nodes: [
                { icon: '📡', label: 'subghz_devices', sub: 'CC1101 wrapper' },
                { icon: '📲', label: 'nfc / nfc_dev', sub: 'ST25R3916 wrapper' },
                { icon: '🔵', label: 'RECORD_BT', sub: 'BLE GAP/GATT (CPU2 via IPCC)' },
                { icon: '🔆', label: 'furi_hal_infrared', sub: 'TX LED + RX demod' },
              ],
            },
          ]}
        />
      </Section>

      <Section title="Canvas API — o que cabe em 128×64 mono" accent={accent}>
        <p className="text-sm leading-6">
          O LCD é um Sitronix ST7567 monocromático 128×64. 1024 bytes de framebuffer (1 bit por pixel). Não há
          cor, alpha, anti-aliasing — design pixel-perfect. As primitivas Canvas batem em SPI direto.
        </p>
        <CodeBlock lang="c">{`// Cheat-sheet de canvas
canvas_clear(canvas);
canvas_set_color(canvas, ColorBlack);  // ou ColorWhite, ColorXOR

canvas_set_font(canvas, FontPrimary);     // 8x16 bold
canvas_set_font(canvas, FontSecondary);   // 6x10 regular
canvas_set_font(canvas, FontKeyboard);    // 5x7 fixed

canvas_draw_str(canvas, x, y, "texto");
canvas_draw_str_aligned(canvas, x, y, AlignCenter, AlignTop, "centrado");

canvas_draw_box(canvas, x, y, w, h);            // retangulo cheio
canvas_draw_frame(canvas, x, y, w, h);          // outline
canvas_draw_rbox(canvas, x, y, w, h, r);        // arredondado cheio
canvas_draw_rframe(canvas, x, y, w, h, r);

canvas_draw_circle(canvas, cx, cy, r);
canvas_draw_disc(canvas, cx, cy, r);            // circulo cheio
canvas_draw_line(canvas, x1, y1, x2, y2);
canvas_draw_dot(canvas, x, y);

canvas_draw_icon(canvas, x, y, &I_my_icon_10x10);  // sprite incluido pela ufbt
canvas_draw_icon_animation(canvas, x, y, anim);    // sprite animado

// Helpers de UI
elements_button_left(canvas, "Cancelar");
elements_button_right(canvas, "OK");
elements_button_center(canvas, "Selecionar");
elements_progress_bar(canvas, x, y, width, progress);  // progress 0..1`}</CodeBlock>
        <Callout tone="warn" icon="🎨">
          Não tente direct framebuffer access — o GUI service serializa. Se você precisa "apagar e redesenhar"
          fora do callback, use <InlineCode>view_port_update(view_port)</InlineCode> e o GUI agendará novo draw.
          Atualizações forçadas fora de callback resultam em flicker e tearing.
        </Callout>
      </Section>

      <Section title="Storage — salvar dados no SD" accent={accent}>
        <p className="text-sm leading-6">
          A API <InlineCode>RECORD_STORAGE</InlineCode> abstrai SD card (montado em <InlineCode>/ext</InlineCode>)
          e flash interna (montado em <InlineCode>/int</InlineCode>). Convenção: dados privados de FAP em{' '}
          <InlineCode>/ext/apps_data/&lt;appid&gt;/</InlineCode>.
        </p>
        <CodeBlock lang="c">{`#include <storage/storage.h>

void save_score(uint32_t score) {
    Storage* storage = furi_record_open(RECORD_STORAGE);
    storage_common_mkdir(storage, "/ext/apps_data/hello_ffv");

    File* file = storage_file_alloc(storage);
    if(storage_file_open(file, "/ext/apps_data/hello_ffv/score.bin",
                         FSAM_READ_WRITE, FSOM_OPEN_ALWAYS)) {
        storage_file_write(file, &score, sizeof(score));
    }
    storage_file_close(file);
    storage_file_free(file);
    furi_record_close(RECORD_STORAGE);
}`}</CodeBlock>
      </Section>

      <Section title="Notifications — LED, vibra, som" accent={accent}>
        <CodeBlock lang="c">{`#include <notification/notification_messages.h>

NotificationApp* notif = furi_record_open(RECORD_NOTIFICATION);

notification_message(notif, &sequence_blink_blue_100);
notification_message(notif, &sequence_success);     // verde + beep + vibra leve
notification_message(notif, &sequence_error);       // vermelho + 2 beeps
notification_message(notif, &sequence_double_vibro);

// Sequencia customizada
const NotificationSequence my_seq = {
    &message_red_255, &message_vibro_on, &message_delay_50,
    &message_vibro_off, &message_red_0, NULL,
};
notification_message(notif, &my_seq);

furi_record_close(RECORD_NOTIFICATION);`}</CodeBlock>
      </Section>

      <Section title="Build, deploy e debug" accent={accent}>
        <CodeBlock lang="bash">{`# Build
ufbt
# saida em: dist/hello_ffv.fap

# Lancar diretamente no Flipper conectado via USB
ufbt launch
# (carrega via CDC para /ext/apps_data/.tmp/ e abre a app)

# Instalar persistente — copia para /ext/apps/Examples/
ufbt fap_deploy

# CLI do Flipper (USB-CDC, 9600 baud, qualquer terminal)
# Comandos uteis:
#   log              -> tail dos logs em tempo real
#   ps               -> threads ativas + heap por thread
#   free             -> memoria livre + fragmentacao
#   loader open Examples/hello_ffv  -> abre FAP

# Setup VSCode
ufbt vscode_dist
# gera .vscode/launch.json + tasks.json
# Build:  Ctrl+Shift+B
# Debug:  F5  (requer Black Magic Probe ou ST-Link nos pads SWD)`}</CodeBlock>
        <StackFlow
          title="Cadeia de debug com Black Magic Probe"
          accent={accent}
          items={[
            { icon: '⌨️', label: 'VSCode + cortex-debug', sub: 'Extensão', detail: 'Breakpoints, watch, registers ARM', connector: '↓ GDB-MI' },
            { icon: '🔧', label: 'arm-none-eabi-gdb', sub: 'Debugger', detail: 'Vinculado pela ufbt no .vscode/launch.json', connector: '↓ GDB remote' },
            { icon: '🖥️', label: 'Black Magic Probe', sub: 'USB → SWD', detail: 'Implementa GDB server em hardware', connector: '↓ SWDIO/SWCLK' },
            { icon: '🔬', label: 'Pads SWD do Flipper', sub: 'STM32WB55', detail: 'SWDIO, SWCLK, GND, NRST internos no PCB' },
          ]}
        />
        <Callout tone="info" icon="🐞">
          Para abrir os pads SWD você precisa abrir o case (parafusos torx). Existem mods 3D-printable que
          expõem os pads sem reabrir toda vez. Alternativa <em>sem</em> SWD: instrumente com{' '}
          <InlineCode>FURI_LOG_I("tag", "fmt", args)</InlineCode> e leia via CLI <InlineCode>log</InlineCode>.
        </Callout>
      </Section>

      <Section title="C vs JS scripting (Momentum)" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Critério', 'FAP em C (oficial)', 'JS scripting (Momentum)']}
          rows={[
            ['Performance', 'Native ARM Cortex-M4', 'Interpretado mJS (~50× mais lento)'],
            ['Acesso a HW low-level', 'Total — SPI, GPIO, IRQ, DMA', 'Limitado — bindings expostos'],
            ['Tempo dev', '30 min para hello world', '5 min para hello world'],
            ['Debug', 'GDB + breakpoints reais', 'console.log + erro de syntax'],
            ['Distribuição', '.fap binário no Apps Hub', 'Arquivo .js editável no SD'],
            ['Caso de uso', 'Ferramenta sria, integração rádio', 'Protótipo, automação rápida, glue code'],
          ]}
        />
        <DecisionBox
          scenario="Quero fazer um app que escuta um sensor I²C e mostra dados na tela"
          winner="C com ufbt"
          winnerColor={accent}
          why="Acesso direto ao furi_hal_i2c, controle de timing, eficiência de bateria, e binário distribuível. JS pagaria custo de overhead que não compensa para HW polling."
          alternatives={[
            { name: 'JS', when: 'Se for protótipo de fim-de-semana, sem distribuição, e o sensor expõe API JS já existente' },
          ]}
        />
      </Section>

      <Section title="Linha do tempo da plataforma" accent={accent}>
        <Timeline
          title="Da Kickstarter ao ecossistema FAP"
          accent={accent}
          events={[
            { when: '2020', label: 'Kickstarter Flipper Zero', detail: 'Firmware monolítico — todo app embedded no firmware' },
            { when: '2021', label: 'Primeiros boards entregues', detail: 'API Furi consolidada' },
            { when: '2022', label: 'FAP support introduzido', detail: 'Primeiro firmware com loader + apps externos via SD', highlight: true },
            { when: '2022', label: 'Apps Hub (lab.flipper.net)', detail: 'Marketplace oficial de FAPs com curadoria' },
            { when: '2023', label: 'ufbt lançado', detail: 'Pip package; democratiza desenvolvimento sem clone do firmware', highlight: true },
            { when: '2024', label: 'Momentum firmware', detail: 'Fork comunitário com JS scripting (mJS) e mais features' },
            { when: '2025', label: '1000+ FAPs públicos', detail: 'Apps Hub passa marca, ecossistema maduro' },
            { when: '2026', label: 'SDK API v90+', detail: 'Estabilidade alta, breaking changes raros' },
          ]}
        />
      </Section>

      <Section title="Q&A prático" accent={accent}>
        <div className="flex flex-col gap-3">
          <QAItem
            q="Como debugar sem Black Magic Probe nem ST-Link?"
            a={
              <>
                Logging via <InlineCode>FURI_LOG_*</InlineCode> macros (I/W/E/D) e tail no CLI{' '}
                <InlineCode>log</InlineCode>. Para profiling, instrumente com{' '}
                <InlineCode>furi_get_tick()</InlineCode> antes/depois de blocos. Para crashes, o firmware salva
                core dump no flash; recupere via CLI <InlineCode>backtrace</InlineCode>.
              </>
            }
          />
          <QAItem
            q="Posso usar C++ no FAP?"
            a={
              <>
                Tecnicamente sim — o gcc-arm aceita .cpp. Renomeie arquivo para .cpp e adicione em sources do
                application.fam. Caveat: sem libstdc++ completa (sem exceptions, sem RTTI). STL parcial. Maior
                parte da comunidade fica em C puro pelo overhead binário.
              </>
            }
          />
          <QAItem
            q="Como integrar com o Wi-Fi DevBoard num FAP?"
            a={
              <>
                UART nos pinos 13/14. Use <InlineCode>furi_hal_serial_*</InlineCode> APIs (lp_uart). Crie um
                FAP que abre serial em 115200, manda comandos AT/protocolo customizado para o ESP32, parseia
                respostas. Padrão usado pelos apps Marauder, Wi-Fi sniffer, etc.
              </>
            }
          />
          <QAItem
            q="Onde encontrar o exemplo oficial mais completo?"
            a={
              <>
                <InlineCode>flipperdevices/flipperzero-firmware/applications/examples/</InlineCode> tem ~15
                exemplos: app_template, ble_beacon, gpio_test, view_dispatcher, scenes, custom_view. São o
                material canônico — mais didáticos que tutoriais externos.
              </>
            }
          />
        </div>
      </Section>

      <Section title="Referências canônicas" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'GitHub ufbt', v: <a className="underline" href="https://github.com/flipperdevices/flipperzero-ufbt" target="_blank" rel="noreferrer">flipperdevices/flipperzero-ufbt</a> },
            { k: 'API docs', v: <a className="underline" href="https://developer.flipper.net/flipperzero/doxygen/applications.html" target="_blank" rel="noreferrer">developer.flipper.net/flipperzero/doxygen/applications.html</a> },
            { k: 'Tutorial passo-a-passo', v: <a className="underline" href="https://instantiator.dev/post/flipper-zero-app-tutorial-01/" target="_blank" rel="noreferrer">instantiator.dev/post/flipper-zero-app-tutorial-01</a> },
            { k: 'Exemplos oficiais', v: <a className="underline" href="https://github.com/flipperdevices/flipperzero-firmware/tree/dev/applications/examples" target="_blank" rel="noreferrer">flipperzero-firmware/applications/examples</a> },
            { k: 'Apps Hub', v: <a className="underline" href="https://lab.flipper.net" target="_blank" rel="noreferrer">lab.flipper.net</a> },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
