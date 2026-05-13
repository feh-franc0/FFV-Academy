import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('room-persistence');
const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que Room é preferível a SQLiteOpenHelper cru?',
    options: [
      'Só sintaxe',
      'Verificação de queries em tempo de compilação (annotation processor valida SQL dos @Query), geração de DAO type-safe, integração nativa com coroutines e Flow, sistema de migrations versionado, type converters, e suporte a relations (1-1, 1-N, N-N) com @Relation. SQLiteOpenHelper cru expõe cursor manual e SQL como string — propenso a erros que só aparecem em runtime',
      'Room é mais rápido',
      'SQLite é legado',
    ],
    correct: 1,
    explanation: 'Room é abstração fina sobre SQLite: mesmo engine, mesmo arquivo .db, mas com camada de compile-time checks e geração de código que elimina boilerplate. fun observeUsers retornando Flow com @Query valida a SQL no build — erros de sintaxe não compilam.',
  },
  {
    question: 'Quando usar @Relation vs JOIN manual?',
    options: [
      'São equivalentes',
      '@Relation é ideal para 1-N/N-N onde você quer carregar objeto pai + lista de filhos em uma única chamada sem escrever SQL JOIN manual. Room emite múltiplas queries otimizadas internamente. Para queries analíticas (agregações, joins de 4+ tabelas) ou quando você precisa de controle fino da SQL, @Query com JOIN manual é melhor e usa POJO de resultado',
      '@Relation é deprecado',
      'JOIN não funciona em Room',
    ],
    correct: 1,
    explanation: '@Relation cobre 80% dos casos N-N e 1-N comuns: trazer user com seus posts. Para operações mais complexas (sum, group by, window functions) você cai para @Query com data class de projeção. Ambos coexistem no mesmo DAO.',
  },
  {
    question: 'Qual a estratégia correta para migrations em produção?',
    options: [
      'fallbackToDestructiveMigration em produção',
      'Cada incremento de versão tem uma Migration explícita (from → to) com ALTER TABLE/CREATE TABLE/data copy. Nunca dropar dados do usuário. Testes automatizados via MigrationTestHelper comparam schema depois da migration contra schema da versão alvo. fallbackToDestructiveMigration só em debug/dev — em produção equivale a perder dados silenciosamente',
      'Migration automática',
      'Copiar manual SQL',
    ],
    correct: 1,
    explanation: 'Room exporta schema JSON a cada build (schemas/) — base para testar migrations. MigrationTestHelper abre DB na versão N, aplica Migration, valida que resulta no schema N+1. Quebrou o DB do usuário em update = review ruim, churn real, dano de marca.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="room-persistence"
      title="Room: persistência Android moderna"
      icon="💾"
      xp={45}
      readTime={11}
      trailName="Android Native: Kotlin + Compose"
      trailColor={accent}
      nextSlug="android-networking-retrofit"
      nextTitle="Networking Android: Retrofit + Moshi"
      quiz={quiz}
    >
      <Section title="Room: SQLite com superpoderes" accent={accent}>
        <p>
          Room (2017) se tornou default para persistência local no Android: mesma engine SQLite, mas com camada type-safe e integração nativa com coroutines/Flow. Em 2026, Room Multiplatform (KMP) já cobre alguns casos, mas Android puro ainda é o principal.
        </p>
      </Section>

      <Section title="Entity + DAO + Database" accent={accent}>
        <CodeBlock lang="kotlin">{'@Entity(tableName = "users", indices = [Index("email", unique = true)])\ndata class UserEntity(\n    @PrimaryKey val id: Long,\n    val name: String,\n    val email: String,\n    val createdAt: Instant,\n)\n\n@Dao\ninterface UserDao {\n    @Query("SELECT * FROM users ORDER BY createdAt DESC")\n    fun observeAll(): Flow<List<UserEntity>>\n\n    @Query("SELECT * FROM users WHERE id = :id")\n    suspend fun findById(id: Long): UserEntity?\n\n    @Upsert\n    suspend fun upsertAll(users: List<UserEntity>)\n\n    @Query("DELETE FROM users WHERE id = :id")\n    suspend fun delete(id: Long)\n}\n\n@TypeConverters(InstantConverter::class)\n@Database(entities = [UserEntity::class], version = 1, exportSchema = true)\nabstract class AppDatabase : RoomDatabase() {\n    abstract fun userDao(): UserDao\n}\n\nclass InstantConverter {\n    @TypeConverter fun fromEpoch(ms: Long?): Instant? = ms?.let { Instant.ofEpochMilli(it) }\n    @TypeConverter fun toEpoch(i: Instant?): Long? = i?.toEpochMilli()\n}'}</CodeBlock>
      </Section>

      <Section title="Bootstrap com Hilt" accent={accent}>
        <CodeBlock lang="kotlin">{'@Module @InstallIn(SingletonComponent::class)\nobject DatabaseModule {\n    @Provides @Singleton\n    fun provideDb(@ApplicationContext ctx: Context): AppDatabase =\n        Room.databaseBuilder(ctx, AppDatabase::class.java, "app.db")\n            .addMigrations(MIGRATION_1_2, MIGRATION_2_3)\n            .build()\n\n    @Provides fun provideUserDao(db: AppDatabase): UserDao = db.userDao()\n}'}</CodeBlock>
      </Section>

      <Section title="@Query com Flow: reatividade" accent={accent}>
        <CodeBlock lang="kotlin">{'@Query("SELECT * FROM users WHERE name LIKE :q ORDER BY name")\nfun search(q: String): Flow<List<UserEntity>>\n\n// No ViewModel:\nval results: StateFlow<List<User>> = dao.search("%" + query.value + "%")\n    .map { list -> list.map { it.toDomain() } }\n    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())'}</CodeBlock>
        <Callout tone="success" icon="✅">
          Qualquer INSERT/UPDATE/DELETE na mesma tabela users re-emite o Flow automaticamente. Sem notificador manual.
        </Callout>
      </Section>

      <Section title="@Relation: 1-N e N-N" accent={accent}>
        <CodeBlock lang="kotlin">{'@Entity(tableName = "posts", foreignKeys = [ForeignKey(\n    entity = UserEntity::class, parentColumns = ["id"], childColumns = ["authorId"],\n    onDelete = ForeignKey.CASCADE,\n)], indices = [Index("authorId")])\ndata class PostEntity(\n    @PrimaryKey val id: Long,\n    val authorId: Long,\n    val title: String,\n)\n\ndata class UserWithPosts(\n    @Embedded val user: UserEntity,\n    @Relation(parentColumn = "id", entityColumn = "authorId")\n    val posts: List<PostEntity>,\n)\n\n@Dao\ninterface UserDao {\n    @Transaction\n    @Query("SELECT * FROM users WHERE id = :id")\n    suspend fun userWithPosts(id: Long): UserWithPosts?\n}'}</CodeBlock>
      </Section>

      <Section title="Migrations versionadas" accent={accent}>
        <CodeBlock lang="kotlin">{'val MIGRATION_1_2 = object : Migration(1, 2) {\n    override fun migrate(db: SupportSQLiteDatabase) {\n        db.execSQL("ALTER TABLE users ADD COLUMN avatarUrl TEXT")\n    }\n}\n\nval MIGRATION_2_3 = object : Migration(2, 3) {\n    override fun migrate(db: SupportSQLiteDatabase) {\n        db.execSQL("""\n            CREATE TABLE posts_new (\n                id INTEGER PRIMARY KEY NOT NULL,\n                authorId INTEGER NOT NULL,\n                title TEXT NOT NULL,\n                publishedAt INTEGER NOT NULL DEFAULT 0,\n                FOREIGN KEY(authorId) REFERENCES users(id) ON DELETE CASCADE\n            )\n        """.trimIndent())\n        db.execSQL("INSERT INTO posts_new (id, authorId, title) SELECT id, authorId, title FROM posts")\n        db.execSQL("DROP TABLE posts")\n        db.execSQL("ALTER TABLE posts_new RENAME TO posts")\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="Teste de migration" accent={accent}>
        <CodeBlock lang="kotlin">{'class MigrationTest {\n    @get:Rule val helper = MigrationTestHelper(\n        InstrumentationRegistry.getInstrumentation(),\n        AppDatabase::class.java,\n    )\n\n    @Test fun migrate1To2() {\n        helper.createDatabase(TEST_DB, 1).apply {\n            execSQL("INSERT INTO users (id, name, email, createdAt) VALUES (1, \\"Fer\\", \\"a@b\\", 0)")\n            close()\n        }\n        helper.runMigrationsAndValidate(TEST_DB, 2, true, MIGRATION_1_2).apply {\n            val c = query("SELECT avatarUrl FROM users WHERE id = 1")\n            c.moveToFirst()\n            assert(c.isNull(0))\n            close()\n        }\n    }\n    companion object { const val TEST_DB = "migration-test" }\n}'}</CodeBlock>
      </Section>

      <Section title="Boa prática: camada Entity ≠ Domain" accent={accent}>
        <Callout tone="info" icon="💡">
          Mantenha UserEntity (Room) separado de User (domínio). Mapeie no repository. Isso evita acoplar regras de negócio a anotações do Room e permite trocar persistência (para DataStore, rede, etc) sem refactor do domínio.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
