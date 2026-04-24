import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('swift-moderno-2026');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'O que muda na prática com strict concurrency checking ligado por padrão no Swift 6?',
    options: [
      'Nada, é só flag',
      'O compilador passa a exigir que todo dado compartilhado entre threads/actors seja Sendable; captura implícita de self não-isolado em closures async vira erro; data races deixam de ser bug de runtime e viram erro de compilação. Código legado que compilava em Swift 5 precisa anotar @MainActor, Sendable ou isolation explícita',
      'Swift fica mais lento',
      'Remove async/await',
    ],
    correct: 1,
    explanation: 'Strict concurrency é a promessa central do Swift 6 (2024): zero data races em tempo de compilação. O compilador rastreia isolation domains (MainActor, actor custom, non-isolated) e bloqueia qualquer passagem de valor não-Sendable entre eles. Migração típica de app grande: semanas de anotações + refactors, mas elimina categoria inteira de bugs.',
  },
  {
    question: 'Para que servem macros no Swift 2026?',
    options: [
      'Substituir classes',
      'Geração de código em tempo de compilação com type safety: @Observable substitui boilerplate de ObservableObject, #Predicate gera queries SwiftData tipadas, @Model cria schema de persistência. Ao contrário de macros C/C++, operam na AST tipada e são expandidas pelo compilador Swift, não pre-processador textual',
      'Otimização runtime',
      'Documentação',
    ],
    correct: 1,
    explanation: 'Swift Macros (introduzidos em 5.9, maduros em 6) resolvem o problema histórico de boilerplate sem sacrificar type safety. SwiftSyntax permite manipular AST e emitir código Swift novo. Apple migrou @Published / ObservableObject → @Observable (macro) e reduziu boilerplate em ~50%. #Predicate, #URL, Regex builders — tudo usa macros.',
  },
  {
    question: 'Quando usar typed throws (Swift 6) em vez de throws genérico?',
    options: [
      'Sempre',
      'Em APIs onde o conjunto de erros é fechado e o caller precisa fazer handling exaustivo (parsers, decoders, módulos de domínio). Em boundaries de app (network, UI) o throws genérico ainda é preferível porque você não quer versionar o enum de erro público. Typed throws entrega type safety sem custo de runtime extra',
      'Nunca, é ruim',
      'Em UI',
    ],
    correct: 1,
    explanation: 'Typed throws (func parse() throws(ParseError)) foi adicionado no Swift 6 para resolver casos onde existential any Error apagava informação importante. Regra prática: usar em bibliotecas e domínio; manter throws solto em código de aplicação que chama muitas APIs heterogêneas.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="swift-moderno-2026"
      title="Swift moderno: macros, result builders, strict concurrency"
      icon="🕊️"
      xp={50}
      readTime={12}
      trailName="iOS Native: Swift + SwiftUI"
      trailColor={accent}
      nextSlug="swiftui-declarativo"
      nextTitle="SwiftUI declarativo em produção"
      quiz={quiz}
    >
      <Section title="Swift em 2026: onde chegamos" accent={accent}>
        <p>
          Doze anos depois do lançamento (2014), Swift se tornou uma linguagem de sistemas com nicho próprio — forte em Apple platforms, crescendo em server-side (Vapor, Hummingbird) e começando a aparecer em embedded. O salto do Swift 5.x para o 6.0 (setembro/2024) foi o mais significativo desde a v1: strict concurrency por padrão, typed throws, noncopyable types, macros maduras.
        </p>
        <Callout tone="info" icon="🎯">
          Este módulo foca nos recursos que mudaram o jeito de escrever código de produção em 2026. Se você aprendeu Swift em 2019, há features novas que eliminam patterns inteiros do seu muscle memory.
        </Callout>
      </Section>

      <Section title="Strict concurrency por padrão" accent={accent}>
        <p>
          No Swift 6, o compilador rejeita código que permitiria data races. Todo valor cruzando fronteira de isolation (entre actors, entre threads) precisa ser Sendable.
        </p>
        <CodeBlock lang="swift">{'// Swift 6: strict concurrency ON por padrão\n\nstruct User: Sendable {        // valor Sendable: pode cruzar actors\n    let id: UUID\n    let name: String\n}\n\nactor UserCache {\n    private var users: [UUID: User] = [:]\n\n    func get(_ id: UUID) -> User? { users[id] }\n    func set(_ user: User) { users[user.id] = user }\n}\n\n@MainActor\nfinal class UserViewModel {\n    private let cache: UserCache\n    var displayName: String = ""   // isolado na MainActor\n\n    init(cache: UserCache) { self.cache = cache }\n\n    func load(id: UUID) async {\n        // cache é actor: await é obrigatório\n        if let u = await cache.get(id) {\n            displayName = u.name   // OK: estamos na MainActor\n        }\n    }\n}'}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Migração de projeto grande para Swift 6 strict mode leva semanas. Estratégia: ligar o modo por módulo (SWIFT_STRICT_CONCURRENCY=complete), resolver warnings um a um, só depois ativar globalmente.
        </Callout>
      </Section>

      <Section title="Macros: boilerplate morreu" accent={accent}>
        <p>
          Macros operam na AST tipada em tempo de compilação. O exemplo canônico é @Observable, que substituiu ObservableObject + @Published em todo código novo de SwiftUI.
        </p>
        <CodeBlock lang="swift">{'import Observation\n\n@Observable\nfinal class CartModel {\n    var items: [Item] = []\n    var total: Decimal { items.reduce(0) { $0 + $1.price } }\n\n    func add(_ item: Item) { items.append(item) }\n}\n\n// Em SwiftUI:\nstruct CartView: View {\n    @State private var cart = CartModel()\n\n    var body: some View {\n        VStack {\n            ForEach(cart.items) { Text($0.name) }\n            Text("Total: \\(cart.total)")\n            Button("Adicionar") { cart.add(.sample) }\n        }\n    }\n}'}</CodeBlock>
        <p>
          A macro expande @Observable para implementação de Observable protocol com tracking automático de leituras/escritas — SwiftUI recompõe só as views que leram propriedades que mudaram. Sem @Published espalhado.
        </p>
      </Section>

      <Section title="Typed throws" accent={accent}>
        <CodeBlock lang="swift">{'enum ParseError: Error {\n    case missingField(String)\n    case invalidFormat\n}\n\nfunc parseUser(_ data: Data) throws(ParseError) -> User {\n    guard let dict = try? JSONSerialization.jsonObject(with: data) as? [String: Any]\n    else { throw .invalidFormat }\n    guard let name = dict["name"] as? String else { throw .missingField("name") }\n    return User(id: UUID(), name: name)\n}\n\n// Caller agora sabe o tipo exato:\ndo {\n    let u = try parseUser(data)\n} catch .missingField(let f) {\n    print("faltou \\(f)")\n} catch .invalidFormat {\n    print("formato invalido")\n}'}</CodeBlock>
      </Section>

      <Section title="Noncopyable types (~Copyable)" accent={accent}>
        <CodeBlock lang="swift">{'// Recurso com ownership unica (estilo Rust move semantics)\nstruct FileHandle: ~Copyable {\n    private let fd: Int32\n    init(path: String) throws { /* open */ self.fd = 0 }\n    consuming func close() { /* close(fd) */ }\n    deinit { /* garantia de cleanup */ }\n}\n\n// Uso: nao pode ser copiado, so movido\nfunc process() throws {\n    let handle = try FileHandle(path: "/tmp/x")\n    // let copy = handle   // erro de compilacao\n    handle.close()\n}'}</CodeBlock>
      </Section>

      <Section title="Result builders: DSL type-safe" accent={accent}>
        <p>
          SwiftUI (ViewBuilder), Regex (RegexBuilder), Swift Testing (TestBuilder) — todos usam result builders. Você pode criar os seus para DSLs internas.
        </p>
        <CodeBlock lang="swift">{'@resultBuilder\nstruct StringBuilder {\n    static func buildBlock(_ parts: String...) -> String { parts.joined(separator: " ") }\n}\n\nfunc greet(@StringBuilder _ build: () -> String) -> String { build() }\n\nlet msg = greet {\n    "Ola"\n    "Fernando"\n    "em 2026"\n}\n// "Ola Fernando em 2026"'}</CodeBlock>
      </Section>

      <Section title="Quando ainda usar Swift 5 idioms" accent={accent}>
        <Callout tone="neutral" icon="📌">
          Projetos que precisam suportar iOS 15 e anteriores não podem usar @Observable nem strict concurrency plenamente. Nesse caso: mantenha ObservableObject + @Published e ative strict concurrency como warning. Uma vez que minSdk sobe, refactor vira trivial.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
