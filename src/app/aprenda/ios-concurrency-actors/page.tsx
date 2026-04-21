import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ios-concurrency-actors');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a garantia central de um actor no Swift?',
    options: [
      'Executa em thread fixa',
      'Mutually exclusive access ao estado interno: o compilador garante que apenas um contexto async acessa propriedades do actor por vez, eliminando data races. Não garante thread específica (exceto MainActor), não garante ordem de chamadas — só exclusividade',
      'Velocidade',
      'Nada',
    ],
    correct: 1,
    explanation: 'Actors resolvem o mesmo problema que locks, mas ao nível da linguagem. O runtime serializa chamadas com await na fronteira do actor. Importante: não é fila FIFO rígida — reentrância é permitida entre awaits internos, o que exige cuidado com invariantes ("actor reentrancy problem").',
  },
  {
    question: 'Para que serve Sendable?',
    options: [
      'Classe especial',
      'Marca tipos seguros para atravessar fronteira de isolation (entre actors, entre threads). Value types com campos Sendable são automaticamente Sendable. Classes precisam ser final + imutáveis OU ter lock interno e marcar @unchecked Sendable assumindo responsabilidade manual',
      'Protocolo de rede',
      'Tipo de enum',
    ],
    correct: 1,
    explanation: 'Sendable é a peça que torna strict concurrency possível. O compilador recusa let x: NonSendable = ...; Task { use(x) } porque x poderia ser mutado de duas threads. Convenção: modele domínio com structs Sendable; se precisar classe, torne final e imutável.',
  },
  {
    question: 'Quando usar TaskGroup em vez de async let?',
    options: [
      'Tanto faz',
      'async let é para número fixo e pequeno de tarefas paralelas conhecidas em compile-time (2-3 fetches independentes). TaskGroup é para número dinâmico (N items de uma lista) ou quando você precisa cancelar algumas e manter outras. TaskGroup também permite throw e reduce on-the-fly',
      'TaskGroup é legado',
      'async let é para UI',
    ],
    correct: 1,
    explanation: 'Regra: três requests hard-coded em paralelo = async let. Paralelizar processamento de N itens = withTaskGroup. TaskGroup suporta group.addTask dentro de loop, group.next() para colher resultados conforme chegam e cancellation propagation nativo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ios-concurrency-actors"
      title="Concurrency em iOS: async/await + actors"
      icon="⚡"
      xp={55}
      readTime={13}
      trailName="iOS Native: Swift + SwiftUI"
      trailColor={accent}
      nextSlug="swiftdata-persistencia"
      nextTitle="SwiftData: persistência nativa 2026"
      quiz={quiz}
    >
      <Section title="O modelo antes e depois" accent={accent}>
        <p>
          Até 2021, concurrency em iOS era Grand Central Dispatch (DispatchQueue) + closures. Funcionava, mas propagava erros mal, não compunha e facilitava data races. Swift 5.5 trouxe async/await, structured concurrency e actors — o modelo canônico hoje.
        </p>
        <Callout tone="warn" icon="⚠️">
          Código com <code>{'DispatchQueue.main.async { ... }'}</code> dentro de callback de URLSessionDataTask ainda existe em 2026 em bases legadas. Migração para async/await é caminho de uma via — vale a refatoração.
        </Callout>
      </Section>

      <Section title="async/await básico" accent={accent}>
        <CodeBlock lang="swift">{'func loadProfile(id: UUID) async throws -> Profile {\n    let (data, response) = try await URLSession.shared.data(from: apiURL(id))\n    guard (response as? HTTPURLResponse)?.statusCode == 200 else {\n        throw APIError.badStatus\n    }\n    return try JSONDecoder().decode(Profile.self, from: data)\n}\n\n// Em SwiftUI:\nstruct ProfileView: View {\n    let id: UUID\n    @State private var profile: Profile?\n\n    var body: some View {\n        Group {\n            if let p = profile { Text(p.name) }\n            else { ProgressView() }\n        }\n        .task {\n            profile = try? await loadProfile(id: id)\n        }\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="Paralelismo com async let" accent={accent}>
        <CodeBlock lang="swift">{'func loadDashboard(userId: UUID) async throws -> Dashboard {\n    async let profile = loadProfile(id: userId)\n    async let feed    = loadFeed(userId: userId)\n    async let stats   = loadStats(userId: userId)\n\n    return try await Dashboard(\n        profile: profile,\n        feed:    feed,\n        stats:   stats\n    )\n}'}</CodeBlock>
        <p>
          Três requests disparam em paralelo. O await no construtor espera todos. Se qualquer um lança, os outros são cancelados automaticamente (structured concurrency).
        </p>
      </Section>

      <Section title="TaskGroup: paralelismo dinâmico" accent={accent}>
        <CodeBlock lang="swift">{'func loadAll(ids: [UUID]) async throws -> [Profile] {\n    try await withThrowingTaskGroup(of: Profile.self) { group in\n        for id in ids {\n            group.addTask { try await loadProfile(id: id) }\n        }\n        var result: [Profile] = []\n        for try await profile in group {\n            result.append(profile)\n        }\n        return result\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="Actors: estado seguro" accent={accent}>
        <CodeBlock lang="swift">{'actor ImageCache {\n    private var cache: [URL: UIImage] = [:]\n    private let maxSize = 100\n\n    func image(for url: URL) -> UIImage? { cache[url] }\n\n    func store(_ image: UIImage, for url: URL) {\n        if cache.count >= maxSize {\n            cache.removeValue(forKey: cache.keys.randomElement()!)\n        }\n        cache[url] = image\n    }\n}\n\n// Uso (todo acesso vira await):\nlet cache = ImageCache()\nif let cached = await cache.image(for: url) {\n    return cached\n}\nlet fresh = try await downloadImage(url)\nawait cache.store(fresh, for: url)'}</CodeBlock>
      </Section>

      <Section title="MainActor: UI thread" accent={accent}>
        <CodeBlock lang="swift">{'@MainActor\nfinal class ProfileViewModel {\n    var state: LoadState = .idle\n\n    func load(id: UUID) async {\n        state = .loading   // OK: estamos na MainActor\n        do {\n            let p = try await loadProfile(id: id)\n            state = .loaded(p)\n        } catch {\n            state = .failed(error)\n        }\n    }\n}\n\n// Qualquer View observa sem precisar de DispatchQueue.main.async'}</CodeBlock>
      </Section>

      <Section title="Sendable e isolation" accent={accent}>
        <CodeBlock lang="swift">{'// OK: value type com campos Sendable = Sendable implicito\nstruct Event: Sendable {\n    let id: UUID\n    let name: String\n    let createdAt: Date\n}\n\n// Precisa final + imutavel para Sendable explicito\nfinal class Logger: Sendable {\n    let prefix: String\n    init(prefix: String) { self.prefix = prefix }\n    func log(_ msg: String) { print(prefix + msg) }\n}\n\n// Classe mutavel com lock: @unchecked (voce assume a responsabilidade)\nfinal class Counter: @unchecked Sendable {\n    private let lock = NSLock()\n    private var value = 0\n    func increment() { lock.lock(); defer { lock.unlock() }; value += 1 }\n}'}</CodeBlock>
      </Section>

      <Section title="Cancellation: cidadão de primeira classe" accent={accent}>
        <CodeBlock lang="swift">{'Task {\n    do {\n        let data = try await longDownload()\n        try Task.checkCancellation()   // lanca CancellationError se cancelado\n        await save(data)\n    } catch is CancellationError {\n        print("foi cancelado limpo")\n    }\n}\n\n// .task da View cancela automaticamente quando a view sai de cena'}</CodeBlock>
        <Callout tone="success" icon="✅">
          Structured concurrency + cancellation automático da SwiftUI .task eliminam categoria inteira de bugs: vazamento de request em tela que fechou, double callback, race em estado obsoleto.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
