import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ios-testing-xctest');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'O que o novo Swift Testing framework (macro #expect, @Test) traz que XCTest não tinha?',
    options: [
      'Só nomes novos',
      'Uso de macros permite mensagens de falha com expressão original, sem overloads infinitos de XCTAssertEqual/Greater/etc. Suporte nativo a parametrização (@Test(arguments:)), traits (tags, enabled), paralelismo por padrão, integração com async/await sem expectations manuais. XCTest continua disponível mas Swift Testing é o caminho novo',
      'Remove async',
      'Só roda no macOS',
    ],
    correct: 1,
    explanation: 'Swift Testing (anunciado WWDC24, maduro em 2026) é reescrita moderna: um único #expect(x == y) com mensagem rica, parametrização trivial, suítes com traits. XCTest permanece para UI tests e compatibilidade com bases legadas. Testes novos começam em Swift Testing.',
  },
  {
    question: 'Quando snapshot testing (SnapshotTesting de pointfree) vale a pena?',
    options: [
      'Sempre',
      'Views com muitos casos visuais (empty state, loading, erro, múltiplos temas, múltiplos Dynamic Type sizes) onde regressão visual é fácil de introduzir. Trade-off: snapshots crescem o repo, precisam ser rodados no mesmo device/iOS no CI para determinismo, e exigem disciplina de review ao regerar. Para UI simples, assertion de texto/estado já basta',
      'Nunca',
      'Só em macOS',
    ],
    correct: 1,
    explanation: 'Snapshot vale quando o custo de escrever N assertions manuais para cobrir variações visuais supera o custo de revisar PNGs em PR. Padrão: rodar em simulador iPhone SE fixo e iPad Pro fixo, com scale 1x, locale fixo. Variação de device = snapshot quebra = falso-positivo.',
  },
  {
    question: 'Qual a estratégia certa para XCUITest em CI?',
    options: [
      'Ignorar flakiness',
      'Rodar em device/simulador com versão fixada por fastlane match; isolar testes por suíte; retry automático (1-2 tentativas) apenas para falhas classificadas como timeout de launch, nunca para assertion falhada; publicar screenshots + xcresult bundle como artefato para debug; dedicar 10-15% dos testes a UI e o resto a unit/integration',
      'Rodar tudo em UI',
      'Sem CI',
    ],
    correct: 1,
    explanation: 'UI tests são caros e flaky por natureza (animação, async, launch). Estratégia sã: cobrir fluxos críticos (login, checkout, primeiro uso), rodar paralelizado em múltiplos simuladores, tratar como smoke tests, investir a maior parte do budget em unit + integration.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ios-testing-xctest"
      title="iOS testing: XCTest + UI tests"
      icon="🧪"
      xp={50}
      readTime={12}
      trailName="iOS Native: Swift + SwiftUI"
      trailColor={accent}
      nextSlug="capstone-ios-app-publicado"
      nextTitle="Capstone: app iOS publicado na App Store"
      quiz={quiz}
    >
      <Section title="A pirâmide de testes iOS em 2026" accent={accent}>
        <p>
          Base: unit tests (70%) em Swift Testing ou XCTest — rápidos, determinísticos, rodam a cada push. Meio: integration tests (20%) tocando SwiftData em memória e mocks de URLSession. Topo: UI tests (10%) em XCUITest cobrindo fluxos críticos end-to-end.
        </p>
      </Section>

      <Section title="Swift Testing: o framework novo" accent={accent}>
        <CodeBlock lang="swift">{'import Testing\n@testable import MyApp\n\n@Test("calcula total com desconto progressivo")\nfunc totalComDesconto() {\n    let cart = Cart(items: [.sample(price: 100), .sample(price: 100)])\n    cart.applyDiscount(percent: 10)\n    #expect(cart.total == 180)\n}\n\n@Test(arguments: [\n    (100.0, 10.0,  90.0),\n    (200.0, 25.0, 150.0),\n    (50.0,   0.0,  50.0),\n])\nfunc descontoParametrizado(preco: Double, desc: Double, esperado: Double) {\n    #expect(aplicarDesconto(preco, percent: desc) == esperado)\n}\n\n@Suite("Camada de dominio")\nstruct DomainTests {\n    @Test("rejeita email invalido")\n    func emailInvalido() {\n        #expect(throws: ValidationError.self) {\n            try validarEmail("nao-e-email")\n        }\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="XCTest clássico" accent={accent}>
        <CodeBlock lang="swift">{'import XCTest\n@testable import MyApp\n\nfinal class CartTests: XCTestCase {\n    func test_total_somaItens() {\n        let cart = Cart(items: [.sample(price: 10), .sample(price: 15)])\n        XCTAssertEqual(cart.total, 25)\n    }\n\n    func test_load_async() async throws {\n        let vm = ProfileViewModel(api: FakeAPI())\n        await vm.load(id: .sampleId)\n        XCTAssertEqual(vm.state, .loaded(.sample))\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="Integration: SwiftData em memória + URLProtocol stub" accent={accent}>
        <CodeBlock lang="swift">{'import SwiftData\nimport Testing\n\n@Test("salva nota e recarrega via Query")\nfunc persistencia() throws {\n    let cfg = ModelConfiguration(isStoredInMemoryOnly: true)\n    let container = try ModelContainer(for: Note.self, configurations: cfg)\n    let ctx = container.mainContext\n\n    ctx.insert(Note(title: "A", body: "a"))\n    try ctx.save()\n\n    let all = try ctx.fetch(FetchDescriptor<Note>())\n    #expect(all.count == 1)\n    #expect(all[0].title == "A")\n}\n\n// Stub de URLSession via URLProtocol\nfinal class StubURLProtocol: URLProtocol {\n    nonisolated(unsafe) static var handler: ((URLRequest) -> (HTTPURLResponse, Data))?\n    override class func canInit(with req: URLRequest) -> Bool { true }\n    override class func canonicalRequest(for r: URLRequest) -> URLRequest { r }\n    override func startLoading() {\n        guard let (resp, data) = Self.handler?(request) else { return }\n        client?.urlProtocol(self, didReceive: resp, cacheStoragePolicy: .notAllowed)\n        client?.urlProtocol(self, didLoad: data)\n        client?.urlProtocolDidFinishLoading(self)\n    }\n    override func stopLoading() {}\n}'}</CodeBlock>
      </Section>

      <Section title="XCUITest: fluxo de login" accent={accent}>
        <CodeBlock lang="swift">{'import XCTest\n\nfinal class LoginUITests: XCTestCase {\n    override func setUpWithError() throws {\n        continueAfterFailure = false\n    }\n\n    func test_login_fluxoFeliz() {\n        let app = XCUIApplication()\n        app.launchArguments += ["-UITestFakeAPI", "1"]\n        app.launch()\n\n        app.textFields["email"].tap()\n        app.textFields["email"].typeText("fernando@exemplo.com")\n\n        app.secureTextFields["senha"].tap()\n        app.secureTextFields["senha"].typeText("segredo123")\n\n        app.buttons["Entrar"].tap()\n\n        XCTAssertTrue(app.staticTexts["Ola, Fernando"].waitForExistence(timeout: 5))\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="Snapshot testing" accent={accent}>
        <CodeBlock lang="swift">{'import SnapshotTesting\nimport SwiftUI\nimport XCTest\n\nfinal class ProductCardSnapshotTests: XCTestCase {\n    func test_card_dark() {\n        let view = ProductCard(product: .sample).preferredColorScheme(.dark)\n        assertSnapshot(of: view, as: .image(layout: .device(config: .iPhone13)))\n    }\n\n    func test_card_dynamicTypeXL() {\n        let view = ProductCard(product: .sample)\n            .environment(\\.sizeCategory, .accessibilityExtraLarge)\n        assertSnapshot(of: view, as: .image(layout: .device(config: .iPhone13)))\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="CI: Xcode Cloud e fastlane" accent={accent}>
        <CodeBlock lang="yaml">{'# ci_scripts/ci_post_clone.sh (Xcode Cloud)\nset -e\nbrew install xcbeautify\n\n# Fastfile (fastlane)\ndefault_platform(:ios)\nplatform :ios do\n  lane :tests do\n    run_tests(\n      scheme: "MyApp",\n      devices: ["iPhone 15"],\n      parallel_testing: true,\n      number_of_retries: 1\n    )\n  end\nend'}</CodeBlock>
        <Callout tone="success" icon="✅">
          Xcode Cloud roda nativo com Xcode 16+; fastlane dá flexibilidade extra (beta para TestFlight automatizado, upload de capturas localizadas). Combinar os dois é padrão em muitos times.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
