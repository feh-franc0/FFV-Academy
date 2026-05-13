import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('swiftui-declarativo');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença prática entre @State, @Binding e @Observable?',
    options: [
      'São sinônimos',
      '@State é fonte de verdade local da view (tipo valor, struct). @Binding é referência de leitura/escrita para @State de uma view pai. @Observable (macro) é para modelos de domínio compartilhados (class) com tracking automático de propriedades lidas. Uso típico: @State guarda toggle de UI, @Binding desce para subviews, @Observable é o ViewModel injetado via environment ou init',
      'Todos persistem em disco',
      '@State é global',
    ],
    correct: 1,
    explanation: 'Regra prática: propriedade vive SÓ na view? @State. A view filha precisa mutar? @Binding. É lógica de negócio / fonte compartilhada entre várias views? @Observable class. Confundir isso é a causa #1 de re-renders desnecessários em apps SwiftUI grandes.',
  },
  {
    question: 'Por que NavigationStack substituiu NavigationView?',
    options: [
      'Só renomearam',
      'NavigationStack é baseado em array de caminho (path binding) — você pode pushar/popar programaticamente, reconstruir estado a partir de deep link, e salvar/restaurar navegação. NavigationView dependia de NavigationLink em tempo de render, o que quebrava casos complexos. A mudança foi em iOS 16 (2022) e hoje NavigationView está depreciada',
      'NavigationView é melhor',
      'Nada mudou',
    ],
    correct: 1,
    explanation: 'O modelo antigo tratava navegação como side-effect de UI; o novo trata como state. NavigationStack(path: $route) permite deep linking (route.append(.detail(id))), back programático (route.removeLast()) e SceneStorage para persistência.',
  },
  {
    question: 'Quando ainda precisamos de UIKit em app 100% SwiftUI em 2026?',
    options: [
      'Sempre',
      'Casos específicos: customização profunda de UITextView (formatação rica, spell check custom), integração com libs que só expõem UIView/UIViewController (maps antigos, camera custom, PDFKit em casos), performance extrema de listas gigantes com cells complexas (UICollectionViewCompositionalLayout ainda vence LazyVStack em alguns cenários). Para 90% dos apps de 2026, SwiftUI puro é suficiente',
      'SwiftUI é só toy',
      'Nunca',
    ],
    correct: 1,
    explanation: 'SwiftUI amadureceu: listas, forms, sheets, navigation, animações, layout — tudo nativo e fluido. A ponte UIViewRepresentable existe e é fácil, mas cada uso é débito técnico. Em 2026 os casos que justificam já são minoria: interop com frameworks legados e pontos específicos de performance.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="swiftui-declarativo"
      title="SwiftUI declarativo em produção"
      icon="🎨"
      xp={55}
      readTime={13}
      trailName="iOS Native: Swift + SwiftUI"
      trailColor={accent}
      nextSlug="ios-concurrency-actors"
      nextTitle="Concurrency em iOS: async/await + actors"
      quiz={quiz}
    >
      <Section title="Por que SwiftUI ganhou" accent={accent}>
        <p>
          SwiftUI foi lançado em 2019 com muitas limitações. Em 2026, depois de sete iterações anuais, é o caminho default para todo app iOS novo. Menos código, menos bugs, melhor acessibilidade automática, suporte a Dynamic Type e Dark Mode gratuito.
        </p>
      </Section>

      <Section title="Three sources of truth: @State, @Binding, @Observable" accent={accent}>
        <CodeBlock lang="swift">{'import SwiftUI\nimport Observation\n\n@Observable\nfinal class SearchModel {\n    var query: String = ""\n    var results: [Item] = []\n\n    func search() async {\n        results = await API.search(query)\n    }\n}\n\nstruct SearchView: View {\n    @State private var model = SearchModel()\n\n    var body: some View {\n        VStack {\n            SearchBar(text: $model.query, onSubmit: { Task { await model.search() } })\n            List(model.results) { item in Text(item.title) }\n        }\n    }\n}\n\nstruct SearchBar: View {\n    @Binding var text: String\n    var onSubmit: () -> Void\n\n    var body: some View {\n        TextField("Buscar", text: $text)\n            .onSubmit(onSubmit)\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="Layout system: composição fluida" accent={accent}>
        <CodeBlock lang="swift">{'struct ProductCard: View {\n    let product: Product\n\n    var body: some View {\n        HStack(spacing: 12) {\n            AsyncImage(url: product.imageURL) { img in\n                img.resizable().aspectRatio(contentMode: .fill)\n            } placeholder: { Color.gray.opacity(0.2) }\n            .frame(width: 80, height: 80)\n            .clipShape(RoundedRectangle(cornerRadius: 8))\n\n            VStack(alignment: .leading, spacing: 4) {\n                Text(product.name).font(.headline)\n                Text(product.price, format: .currency(code: "BRL"))\n                    .font(.subheadline).foregroundStyle(.secondary)\n            }\n            Spacer()\n        }\n        .padding()\n        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="NavigationStack com path binding" accent={accent}>
        <CodeBlock lang="swift">{'enum Route: Hashable {\n    case productList\n    case productDetail(id: UUID)\n    case checkout\n}\n\n@Observable\nfinal class Router {\n    var path: [Route] = []\n    func push(_ r: Route) { path.append(r) }\n    func popToRoot() { path.removeAll() }\n}\n\nstruct AppShell: View {\n    @State private var router = Router()\n\n    var body: some View {\n        NavigationStack(path: $router.path) {\n            HomeView()\n                .navigationDestination(for: Route.self) { route in\n                    switch route {\n                    case .productList:          ProductListView()\n                    case .productDetail(let id): ProductDetailView(id: id)\n                    case .checkout:             CheckoutView()\n                    }\n                }\n        }\n        .environment(router)\n    }\n}'}</CodeBlock>
        <Callout tone="success" icon="✅">
          Deep link vira trivial: router.path = [.productList, .productDetail(id: x)] e a stack se reconstrói.
        </Callout>
      </Section>

      <Section title="LazyVStack, LazyVGrid e List" accent={accent}>
        <CodeBlock lang="swift">{'struct FeedView: View {\n    let posts: [Post]\n\n    var body: some View {\n        ScrollView {\n            LazyVStack(spacing: 12) {\n                ForEach(posts) { post in\n                    PostRow(post: post)\n                        .onAppear { if post == posts.last { loadMore() } }\n                }\n            }\n            .padding()\n        }\n    }\n\n    func loadMore() { /* paginacao */ }\n}'}</CodeBlock>
      </Section>

      <Section title="Quando recorrer a UIKit (UIViewRepresentable)" accent={accent}>
        <CodeBlock lang="swift">{'import UIKit\n\nstruct RichTextView: UIViewRepresentable {\n    @Binding var attributed: NSAttributedString\n\n    func makeUIView(context: Context) -> UITextView {\n        let v = UITextView()\n        v.isEditable = true\n        v.delegate = context.coordinator\n        return v\n    }\n    func updateUIView(_ uiView: UITextView, context: Context) {\n        uiView.attributedText = attributed\n    }\n    func makeCoordinator() -> Coordinator { Coordinator(self) }\n\n    final class Coordinator: NSObject, UITextViewDelegate {\n        var parent: RichTextView\n        init(_ p: RichTextView) { parent = p }\n        func textViewDidChange(_ textView: UITextView) {\n            parent.attributed = textView.attributedText\n        }\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="Acessibilidade por padrão" accent={accent}>
        <Callout tone="info" icon="♿">
          SwiftUI faz VoiceOver, Dynamic Type, reduce motion e high contrast funcionarem por default. Seu trabalho é adicionar .accessibilityLabel em imagens/ícones não-textuais, agrupar elementos lógicos com .accessibilityElement(children: .combine) e testar com Accessibility Inspector antes de submeter.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
