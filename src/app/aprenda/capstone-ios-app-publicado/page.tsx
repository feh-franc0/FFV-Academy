import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-ios-app-publicado');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é Privacy Manifest (PrivacyInfo.xcprivacy) e por que é obrigatório em 2026?',
    options: [
      'Arquivo opcional',
      'Apple exige desde 2024 que todo app (e toda SDK de terceiros embarcada) declare: dados coletados e finalidade, tracking domains, e "required reason APIs" usadas (UserDefaults, FileTimestamp, SystemBootTime, DiskSpace). Submissão sem manifest correto = rejeição automática. A App Store combina os manifests e exibe nutrition label no listing',
      'Só macOS',
      'Marketing',
    ],
    correct: 1,
    explanation: 'Privacy Manifest é parte central do compromisso de privacidade da Apple. Ferramentas como Privacy Check (Xcode 16) avisam quando você usa API que exige reason sem declará-la. SDKs populares já publicam seus manifests — você consolida no manifest do app.',
  },
  {
    question: 'Qual a diferença entre TestFlight internal, external e App Store release?',
    options: [
      'Nenhuma',
      'Internal testing: até 100 pessoas do time, propaga em minutos, sem beta review. External testing: até 10.000 usuários por email/link público, precisa de beta review (primeira build) mais rápido que App Store review. App Store release: público geral, exige privacy manifest completo, nutrition label, App Review formal, pode ter phased release (1%, 2%, 5%...)',
      'Só internal existe',
      'External é pago',
    ],
    correct: 1,
    explanation: 'Estratégia típica: dogfood em internal toda build, smoke test em external com grupo menor (early adopters / beta crew) antes de submeter para App Store. Phased release em App Store mitiga crash novo: 7 dias para 100% permite abortar rollout antes de atingir todos.',
  },
  {
    question: 'O que diferencia um app capstone "portfolio-grade" de app toy?',
    options: [
      'Número de telas',
      'App funcional em TestFlight com: arquitetura MVVM+UDF clara, SwiftData com migrations versionadas, camada de API isolada e testável, tracking de erros (Sentry/Crashlytics), testes automatizados rodando no CI, privacy manifest completo, localização mínima (PT-BR + EN), suporte a Dark Mode e Dynamic Type, screenshots profissionais, descrição honesta sem dark patterns, landing page com link de download',
      'Muitas animações',
      'Ser gratuito',
    ],
    correct: 1,
    explanation: 'Recruiter sênior e revisor da App Store veem os mesmos sinais: disciplina arquitetural, respeito ao usuário, observabilidade, acessibilidade. Isso é o que separa "projeto de portfólio" de "app publicado para aparecer".',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-ios-app-publicado"
      title="Capstone: app iOS publicado na App Store"
      icon="🏁"
      xp={85}
      readTime={20}
      trailName="iOS Native: Swift + SwiftUI"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="O projeto" accent={accent}>
        <p>
          Construa um app iOS real, publicado em TestFlight (e se quiser, App Store), aplicando tudo da trilha: Swift 6 strict concurrency, SwiftUI, SwiftData, URLSession async, testes em três camadas, CI com fastlane, privacy manifest. Ideia sugerida: diário de hábitos (rastrear 3-5 hábitos, streak, gráficos).
        </p>
        <Callout tone="info" icon="🎯">
          Não é tutorial estendido: é scaffold de app real que um recruiter sênior ou um indie dev experiente reconheceria como produção-ready. Funcional, testado, instrumentado.
        </Callout>
      </Section>

      <Section title="Estrutura do projeto" accent={accent}>
        <CodeBlock lang="bash">{'HabitsApp/\n├── App/\n│   ├── HabitsApp.swift           (entry + modelContainer)\n│   └── AppEnvironment.swift      (DI container: APIClient, Analytics)\n├── Features/\n│   ├── Habits/\n│   │   ├── HabitsListView.swift\n│   │   ├── HabitDetailView.swift\n│   │   └── HabitsViewModel.swift (@Observable)\n│   ├── Stats/\n│   └── Settings/\n├── Domain/\n│   ├── Habit.swift               (@Model)\n│   ├── HabitEntry.swift          (@Model)\n│   └── Streak.swift              (pure calculations)\n├── Services/\n│   ├── APIClient.swift           (actor)\n│   ├── Analytics.swift           (protocol + Sentry adapter)\n│   └── NotificationService.swift\n├── Resources/\n│   ├── Localizable.xcstrings     (PT-BR + EN)\n│   └── PrivacyInfo.xcprivacy\n├── Tests/\n│   ├── UnitTests/                (Swift Testing)\n│   ├── IntegrationTests/\n│   └── UITests/                  (XCUITest)\n├── fastlane/\n│   ├── Fastfile\n│   └── Matchfile\n└── .github/workflows/ios.yml'}</CodeBlock>
      </Section>

      <Section title="App entry" accent={accent}>
        <CodeBlock lang="swift">{'import SwiftUI\nimport SwiftData\n\n@main\nstruct HabitsApp: App {\n    @State private var env = AppEnvironment()\n\n    var body: some Scene {\n        WindowGroup {\n            RootView()\n                .environment(env)\n        }\n        .modelContainer(for: [Habit.self, HabitEntry.self])\n    }\n}\n\n@Observable\nfinal class AppEnvironment {\n    let api: APIClient\n    let analytics: Analytics\n\n    init() {\n        self.api = APIClient()\n        self.analytics = SentryAnalytics()\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="Domínio: Habit + Streak puros" accent={accent}>
        <CodeBlock lang="swift">{'import SwiftData\nimport Foundation\n\n@Model\nfinal class Habit {\n    @Attribute(.unique) var id: UUID\n    var name: String\n    var emoji: String\n    var createdAt: Date\n    @Relationship(deleteRule: .cascade) var entries: [HabitEntry]\n\n    init(name: String, emoji: String) {\n        self.id = UUID(); self.name = name; self.emoji = emoji\n        self.createdAt = .now; self.entries = []\n    }\n}\n\n@Model\nfinal class HabitEntry {\n    @Attribute(.unique) var id: UUID\n    var date: Date\n    init(date: Date = .now) { self.id = UUID(); self.date = date }\n}\n\n// Calculo puro, facil de testar\nfunc calcularStreak(entries: [HabitEntry], hoje: Date = .now) -> Int {\n    let cal = Calendar.current\n    let dias = Set(entries.map { cal.startOfDay(for: $0.date) })\n    var streak = 0\n    var cursor = cal.startOfDay(for: hoje)\n    while dias.contains(cursor) {\n        streak += 1\n        cursor = cal.date(byAdding: .day, value: -1, to: cursor)!\n    }\n    return streak\n}'}</CodeBlock>
      </Section>

      <Section title="ViewModel com @Observable" accent={accent}>
        <CodeBlock lang="swift">{'@Observable\nfinal class HabitsViewModel {\n    enum State { case idle, loading, loaded, failed(String) }\n    var state: State = .idle\n    var habits: [Habit] = []\n\n    private let api: APIClient\n    init(api: APIClient) { self.api = api }\n\n    @MainActor\n    func sync() async {\n        state = .loading\n        do {\n            habits = try await api.send(.habits)\n            state = .loaded\n        } catch {\n            state = .failed(error.localizedDescription)\n        }\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="Privacy Manifest" accent={accent}>
        <CodeBlock lang="xml">{'<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n<dict>\n  <key>NSPrivacyCollectedDataTypes</key>\n  <array>\n    <dict>\n      <key>NSPrivacyCollectedDataType</key>\n      <string>NSPrivacyCollectedDataTypeCrashData</string>\n      <key>NSPrivacyCollectedDataTypeLinked</key>\n      <false/>\n      <key>NSPrivacyCollectedDataTypePurposes</key>\n      <array><string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string></array>\n    </dict>\n  </array>\n  <key>NSPrivacyAccessedAPITypes</key>\n  <array>\n    <dict>\n      <key>NSPrivacyAccessedAPIType</key>\n      <string>NSPrivacyAccessedAPICategoryUserDefaults</string>\n      <key>NSPrivacyAccessedAPITypeReasons</key>\n      <array><string>CA92.1</string></array>\n    </dict>\n  </array>\n  <key>NSPrivacyTrackingDomains</key>\n  <array/>\n  <key>NSPrivacyTracking</key>\n  <false/>\n</dict>\n</plist>'}</CodeBlock>
      </Section>

      <Section title="fastlane: beta + release" accent={accent}>
        <CodeBlock lang="bash">{'# fastlane/Fastfile\ndefault_platform(:ios)\n\nplatform :ios do\n  before_all { setup_ci }\n\n  lane :tests do\n    run_tests(scheme: "HabitsApp", devices: ["iPhone 15"])\n  end\n\n  lane :beta do\n    sync_code_signing(type: "appstore")\n    increment_build_number(xcodeproj: "HabitsApp.xcodeproj")\n    build_app(scheme: "HabitsApp")\n    upload_to_testflight(skip_waiting_for_build_processing: true)\n  end\n\n  lane :release do\n    sync_code_signing(type: "appstore")\n    build_app(scheme: "HabitsApp")\n    upload_to_app_store(\n      submission_information: { export_compliance_uses_encryption: false },\n      phased_release: true,\n      force: true\n    )\n  end\nend'}</CodeBlock>
      </Section>

      <Section title="CI completo" accent={accent}>
        <CodeBlock lang="yaml">{'# .github/workflows/ios.yml\nname: ios\non: [push, pull_request]\njobs:\n  test:\n    runs-on: macos-14\n    steps:\n      - uses: actions/checkout@v4\n      - uses: maxim-lobanov/setup-xcode@v1\n        with: { xcode-version: "16.0" }\n      - run: bundle install\n      - run: bundle exec fastlane tests\n      - uses: actions/upload-artifact@v4\n        if: failure()\n        with: { name: xcresult, path: "**/*.xcresult" }'}</CodeBlock>
      </Section>

      <Section title="Entregáveis finais" accent={accent}>
        <Callout tone="success" icon="🏁">
          Repo público com: (1) app rodando em TestFlight com pelo menos 3 testers reais, (2) SwiftData com schema versionado e migration de exemplo, (3) cobertura acima de 70% em unit + integration, (4) UI tests cobrindo fluxo principal, (5) privacy manifest válido, (6) PT-BR + EN, (7) Dark Mode + Dynamic Type testados, (8) Sentry ou Crashlytics capturando crashes, (9) CI verde no GitHub Actions, (10) README com arquitetura + decisões + screenshots.
        </Callout>
        <Callout tone="info" icon="🎯">
          Esse é o nível que diferencia "fiz um app" de "sei entregar iOS de verdade em 2026". App na TestFlight com três testers usando por uma semana vale mais que dez tutoriais concluídos.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
