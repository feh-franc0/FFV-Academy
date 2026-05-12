import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ios-networking-async');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando ainda precisamos de Alamofire em 2026?',
    options: [
      'Sempre',
      'Raramente: URLSession + async/await cobre 95% dos casos modernos (GET/POST/PATCH, multipart, background, cancellation). Alamofire ainda agrega valor em apps que já investiram em seu ecossistema (RequestInterceptor, RetryPolicy, RouteRequestAdapter) ou precisam de features específicas como auto-refresh de OAuth tokens com race prevention out-of-the-box',
      'Nunca, é morto',
      'Só em WatchOS',
    ],
    correct: 1,
    explanation: 'Alamofire ainda é mantida e ótima, mas o delta de valor sobre URLSession nativo encolheu muito após async/await + URLSession.shared.data(from:). Para app novo: comece com URLSession + camada fininha de Interceptor; suba para Alamofire só se sentir falta concreta.',
  },
  {
    question: 'Por que certificate pinning importa e qual o trade-off?',
    options: [
      'Não importa',
      'Protege contra MITM com CA comprometida ou usuário com proxy corporativo/dev (Charles, mitmproxy). Trade-off: se o certificado do servidor rotacionar e o app estiver com pin do antigo, o app quebra até atualizar. Mitigação: pin do public key (sobrevive renovação do cert), pin de múltiplos hashes (atual + próximo), backup key, kill switch remoto',
      'Só vale com HTTP',
      'Torna mais rápido',
    ],
    correct: 1,
    explanation: 'Pinning é defesa em profundidade contra TLS comprometido. Em 2026, SPKI pinning (hash da chave pública, não do cert inteiro) é o padrão: você pode renovar o cert sem recompilar o app, desde que mantenha a keypair. Sempre implemente com fallback e rollout progressivo.',
  },
  {
    question: 'Qual a vantagem de URLSession background configuration?',
    options: [
      'Nenhuma',
      'O sistema continua uploads/downloads mesmo quando o app é suspenso ou terminado; quando volta, seu delegate é chamado para completar. Essencial para upload de fotos, downloads grandes, uploads de vídeo. Requer que seu código seja resiliente a cold start: delegate é registrado no launch da app',
      'Economia de bateria',
      'Mais concorrência',
    ],
    correct: 1,
    explanation: 'URLSessionConfiguration.background(withIdentifier:) é o mecanismo oficial. O iOS pode matar seu processo e reinicializar depois para entregar o resultado. Padrão: persistir state (qual upload, qual metadata) em SwiftData/UserDefaults antes de iniciar e reidratar no launch.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ios-networking-async"
      title="Networking iOS moderno"
      icon="🌐"
      xp={50}
      readTime={12}
      trailName="iOS Native: Swift + SwiftUI"
      trailColor={accent}
      nextSlug="ios-testing-xctest"
      nextTitle="iOS testing: XCTest + UI tests"
      quiz={quiz}
    >
      <Section title="Padrão base 2026: URLSession + async/await + Codable" accent={accent}>
        <CodeBlock lang="swift">{'struct User: Codable, Identifiable, Sendable {\n    let id: UUID\n    let name: String\n    let email: String\n}\n\nenum APIError: Error {\n    case badStatus(Int)\n    case decoding(Error)\n    case network(Error)\n}\n\nactor APIClient {\n    private let base = URL(string: "https://api.exemplo.com")!\n    private let session: URLSession\n    private let decoder: JSONDecoder\n\n    init() {\n        let cfg = URLSessionConfiguration.default\n        cfg.timeoutIntervalForRequest = 15\n        cfg.waitsForConnectivity = true\n        self.session = URLSession(configuration: cfg)\n        let d = JSONDecoder()\n        d.keyDecodingStrategy = .convertFromSnakeCase\n        d.dateDecodingStrategy = .iso8601\n        self.decoder = d\n    }\n\n    func user(id: UUID) async throws -> User {\n        let url = base.appending(path: "users/\\(id.uuidString)")\n        let (data, resp) = try await session.data(from: url)\n        guard let http = resp as? HTTPURLResponse, 200..<300 ~= http.statusCode else {\n            throw APIError.badStatus((resp as? HTTPURLResponse)?.statusCode ?? -1)\n        }\n        do { return try decoder.decode(User.self, from: data) }\n        catch { throw APIError.decoding(error) }\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="Request builder tipado" accent={accent}>
        <CodeBlock lang="swift">{'struct Endpoint<Response: Decodable & Sendable>: Sendable {\n    let path: String\n    let method: String\n    let body: Data?\n}\n\nextension Endpoint where Response == User {\n    static func user(id: UUID) -> Self {\n        .init(path: "users/\\(id.uuidString)", method: "GET", detail: nil)\n    }\n}\n\nextension APIClient {\n    func send<R>(_ ep: Endpoint<R>) async throws -> R {\n        var req = URLRequest(url: base.appending(path: ep.path))\n        req.httpMethod = ep.method\n        req.httpBody = ep.body\n        req.setValue("application/json", forHTTPHeaderField: "Content-Type")\n        let (data, resp) = try await session.data(for: req)\n        try validate(resp)\n        return try decoder.decode(R.self, from: data)\n    }\n    private func validate(_ resp: URLResponse) throws {\n        guard let http = resp as? HTTPURLResponse, 200..<300 ~= http.statusCode else {\n            throw APIError.badStatus((resp as? HTTPURLResponse)?.statusCode ?? -1)\n        }\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="Retry com backoff exponencial" accent={accent}>
        <CodeBlock lang="swift">{'func retrying<T>(_ op: () async throws -> T, attempts: Int = 3) async throws -> T {\n    var lastError: Error?\n    for attempt in 0..<attempts {\n        do { return try await op() }\n        catch {\n            lastError = error\n            let delay = UInt64(pow(2.0, Double(attempt))) * 500_000_000   // 0.5s, 1s, 2s\n            try await Task.sleep(nanoseconds: delay)\n        }\n    }\n    throw lastError ?? APIError.badStatus(-1)\n}\n\n// Uso:\nlet u = try await retrying { try await api.user(id: userId) }'}</CodeBlock>
      </Section>

      <Section title="Certificate pinning (SPKI)" accent={accent}>
        <CodeBlock lang="swift">{'final class PinnedSessionDelegate: NSObject, URLSessionDelegate {\n    let pinnedHashes: Set<String>   // base64 dos SPKI sha256\n\n    init(hashes: Set<String>) { self.pinnedHashes = hashes }\n\n    func urlSession(_ session: URLSession,\n                    didReceive challenge: URLAuthenticationChallenge,\n                    completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {\n        guard challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust,\n              let trust = challenge.protectionSpace.serverTrust else {\n            return completionHandler(.cancelAuthenticationChallenge, nil)\n        }\n        // Extrair SPKI, hashear e comparar com pinnedHashes.\n        // Se bater: completionHandler(.useCredential, URLCredential(trust: trust))\n        // Caso contrario: cancelAuthenticationChallenge\n        completionHandler(.performDefaultHandling, nil)\n    }\n}'}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Sempre embarque pelo menos dois pins (atual + next) e tenha mecanismo remoto para desabilitar pinning se algo catastrófico acontecer. Pin quebrado em produção = app morto até update na App Store (dias de review).
        </Callout>
      </Section>

      <Section title="Background downloads" accent={accent}>
        <CodeBlock lang="swift">{'final class UploadService: NSObject {\n    private lazy var session: URLSession = {\n        let cfg = URLSessionConfiguration.background(withIdentifier: "com.ffv.bg.upload")\n        cfg.isDiscretionary = false\n        cfg.sessionSendsLaunchEvents = true\n        return URLSession(configuration: cfg, delegate: self, delegateQueue: nil)\n    }()\n\n    func upload(_ fileURL: URL, to target: URL) {\n        var req = URLRequest(url: target)\n        req.httpMethod = "POST"\n        let task = session.uploadTask(with: req, fromFile: fileURL)\n        task.resume()\n    }\n}\nextension UploadService: URLSessionTaskDelegate {\n    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {\n        // gravar resultado; app pode ter sido relaunched\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="WebSocket nativo" accent={accent}>
        <CodeBlock lang="swift">{'let task = URLSession.shared.webSocketTask(with: URL(string: "wss://ws.exemplo.com/feed")!)\ntask.resume()\n\nTask {\n    while task.state == .running {\n        let msg = try await task.receive()\n        switch msg {\n        case .string(let text): print(text)\n        case .data(let bin):    print(bin.count)\n        @unknown default:       break\n        }\n    }\n}\n\ntry await task.send(.string("ping"))'}</CodeBlock>
      </Section>

      <Section title="Observabilidade" accent={accent}>
        <Callout tone="info" icon="🔍">
          Instrumente com os_log / Logger (nativo, baixo custo) e exporte métricas via MetricKit. Para traces distribuídos com o backend, use OpenTelemetry-Swift e propague traceparent em todo request. Nunca logar headers de Authorization nem body de endpoint sensível.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
