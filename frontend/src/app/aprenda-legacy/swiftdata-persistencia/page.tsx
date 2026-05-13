import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('swiftdata-persistencia');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a relação entre SwiftData e Core Data em 2026?',
    options: [
      'SwiftData substituiu 100%',
      'SwiftData é wrapper moderno construído em cima do stack do Core Data: @Model macro gera NSManagedObject subclass internamente; ModelContainer usa NSPersistentContainer por baixo. Vantagens: API Swift-first, integração SwiftUI nativa, schema declarativo. Core Data ainda aparece quando você precisa de features ausentes (parent contexts complexos, certos fetch requests raros)',
      'Core Data foi removida',
      'São bancos diferentes',
    ],
    correct: 1,
    explanation: 'Apple não abandonou Core Data — adicionou camada declarativa por cima. Apps antigos podem continuar; apps novos começam com SwiftData e caem para Core Data API apenas nos pontos necessários. Ambos compartilham SQLite store no disco.',
  },
  {
    question: 'Como @Model + @Attribute(.unique) afetam schema?',
    options: [
      'Só documentação',
      'O macro @Model gera NSManagedObject + entidade do modelo; @Attribute(.unique) adiciona uniqueness constraint no store com merge por upsert automático — se você inserir objeto com mesma chave única, SwiftData faz update em vez de duplicar. Essencial para sincronização com API (id remoto como unique)',
      'Bloqueia salvamento',
      'Cria índice duplo',
    ],
    correct: 1,
    explanation: 'Uniqueness + upsert é uma das features mais práticas para quem sincroniza com backend. fetch e save de lista vinda de API viram idempotentes sem código manual de "existe? update : insert".',
  },
  {
    question: 'Quando ir direto a SQLite (GRDB.swift) em vez de SwiftData?',
    options: [
      'Nunca',
      'Apps com queries analíticas complexas (CTEs, window functions, joins de 5+ tabelas), migrations não-triviais que SwiftData lightweight migration não cobre, performance crítica em milhões de rows, ou necessidade de FTS5 full-text search. SwiftData cobre 80% dos casos CRUD com modelo relacional simples',
      'SQLite é mais rápido sempre',
      'SQLite é legado',
    ],
    correct: 1,
    explanation: 'GRDB é ótima quando você precisa do SQL completo. Trade-off: você escreve schema, migration, query e decoding à mão, mas ganha previsibilidade total e features de SQL que Core Data/SwiftData escondem.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="swiftdata-persistencia"
      title="SwiftData: persistência nativa 2026"
      icon="💾"
      xp={50}
      readTime={12}
      trailName="iOS Native: Swift + SwiftUI"
      trailColor={accent}
      nextSlug="ios-networking-async"
      nextTitle="Networking iOS moderno"
      quiz={quiz}
    >
      <Section title="O que é SwiftData" accent={accent}>
        <p>
          SwiftData (lançado em iOS 17, maduro em iOS 18+) é a API oficial de persistência local em Swift. Substitui 90% dos usos de Core Data em projetos novos: você declara modelos com @Model, SwiftData cuida de schema, store SQLite e integração com SwiftUI.
        </p>
      </Section>

      <Section title="Definindo modelos" accent={accent}>
        <CodeBlock lang="swift">{'import SwiftData\nimport Foundation\n\n@Model\nfinal class Note {\n    @Attribute(.unique) var id: UUID\n    var title: String\n    var body: String\n    var createdAt: Date\n    var tags: [String]\n\n    @Relationship(deleteRule: .cascade) var attachments: [Attachment]\n\n    init(title: String, detail: String) {\n        self.id = UUID()\n        self.title = title\n        self.body = body\n        self.createdAt = .now\n        self.tags = []\n        self.attachments = []\n    }\n}\n\n@Model\nfinal class Attachment {\n    var filename: String\n    var data: Data\n    init(filename: String, data: Data) {\n        self.filename = filename\n        self.data = data\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="Bootstrap do container" accent={accent}>
        <CodeBlock lang="swift">{'import SwiftUI\nimport SwiftData\n\n@main\nstruct NotesApp: App {\n    var body: some Scene {\n        WindowGroup { ContentView() }\n            .modelContainer(for: [Note.self, Attachment.self])\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="@Query: reatividade automática em SwiftUI" accent={accent}>
        <CodeBlock lang="swift">{'struct NotesList: View {\n    @Query(sort: \\Note.createdAt, order: .reverse) private var notes: [Note]\n    @Environment(\\.modelContext) private var ctx\n\n    var body: some View {\n        List {\n            ForEach(notes) { note in\n                NavigationLink(note.title) { NoteDetail(note: note) }\n            }\n            .onDelete { indexes in\n                for i in indexes { ctx.delete(notes[i]) }\n            }\n        }\n        .toolbar {\n            Button("Nova") {\n                ctx.insert(Note(title: "Sem titulo", detail: ""))\n            }\n        }\n    }\n}'}</CodeBlock>
        <Callout tone="success" icon="✅">
          @Query observa o store; qualquer insert/update/delete na mesma ModelContainer reflete na lista automaticamente. Sem NotificationCenter, sem Combine manual.
        </Callout>
      </Section>

      <Section title="#Predicate: queries tipadas" accent={accent}>
        <CodeBlock lang="swift">{'struct SearchNotes: View {\n    let query: String\n    @Query private var notes: [Note]\n\n    init(query: String) {\n        self.query = query\n        let predicate = #Predicate<Note> { note in\n            note.title.localizedStandardContains(query)\n        }\n        _notes = Query(filter: predicate, sort: \\Note.createdAt, order: .reverse)\n    }\n\n    var body: some View {\n        List(notes) { Text($0.title) }\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="ModelContext: saves, fetches e transactions" accent={accent}>
        <CodeBlock lang="swift">{'@Environment(\\.modelContext) private var ctx\n\nfunc addNote() {\n    let n = Note(title: "Nova", detail: "")\n    ctx.insert(n)\n    // auto-save por padrao; para controle manual:\n    // try? ctx.save()\n}\n\nfunc fetchByTitle(_ t: String) throws -> [Note] {\n    var desc = FetchDescriptor<Note>(\n        predicate: #Predicate { $0.title == t },\n        sortBy: [SortDescriptor(\\.createdAt, order: .reverse)]\n    )\n    desc.fetchLimit = 50\n    return try ctx.fetch(desc)\n}'}</CodeBlock>
      </Section>

      <Section title="Migrations leves" accent={accent}>
        <CodeBlock lang="swift">{'// Para adicionar campo opcional, SwiftData faz migration automatica.\n// Para renames/splits complexos, defina Schema versionado:\n\nenum NotesSchemaV1: VersionedSchema {\n    static var versionIdentifier = Schema.Version(1, 0, 0)\n    static var models: [any PersistentModel.Type] { [Note.self] }\n}\n\nenum NotesSchemaV2: VersionedSchema {\n    static var versionIdentifier = Schema.Version(2, 0, 0)\n    static var models: [any PersistentModel.Type] { [NoteV2.self] }\n}\n\nenum NotesMigrationPlan: SchemaMigrationPlan {\n    static var schemas: [any VersionedSchema.Type] { [NotesSchemaV1.self, NotesSchemaV2.self] }\n    static var stages: [MigrationStage] { [migrateV1toV2] }\n\n    static let migrateV1toV2 = MigrationStage.custom(\n        fromVersion: NotesSchemaV1.self,\n        toVersion: NotesSchemaV2.self,\n        willMigrate: { ctx in /* transform data */ },\n        didMigrate:  { ctx in /* post step */ }\n    )\n}'}</CodeBlock>
      </Section>

      <Section title="Quando considerar alternativas" accent={accent}>
        <Callout tone="neutral" icon="📌">
          GRDB.swift para queries SQL completas e full-text search. Realm quando sync multi-device é requisito central. UserDefaults para key-value simples (preferências). Keychain para secrets. SwiftData não é bala de prata — é o default sensato.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
