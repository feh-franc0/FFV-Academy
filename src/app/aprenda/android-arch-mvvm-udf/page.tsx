import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('android-arch-mvvm-udf');
const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  {
    question: 'O que significa "UDF" (Unidirectional Data Flow) em apps Android modernos?',
    options: [
      'Nova linguagem',
      'State flui em uma direção única: ViewModel expõe um único UiState imutável (StateFlow); UI observa e renderiza; UI envia eventos/intents para o ViewModel; ViewModel atualiza o UiState; ciclo se repete. Não há binding bidirecional escondido, não há múltiplas fontes de verdade. Facilita debugging (evento X → state Y → UI) e testing',
      'Somente Flow unidirecional',
      'Remove ViewModel',
    ],
    correct: 1,
    explanation: 'UDF é a lição aprendida da era MVP/MVVM clássico, onde dois-sentidos criava ciclos difíceis de rastrear. Compose + StateFlow tornam UDF natural. A cada bug de UI, você pergunta "qual evento?", "qual transição de state?", "qual renderização?" — as três respostas cabem em um único data class UiState.',
  },
  {
    question: 'Qual o papel do Repository pattern em 2026?',
    options: [
      'Está morto',
      'Isolar a origem dos dados (rede, cache local, DataStore) atrás de interface que o ViewModel consome. Repository é o ponto onde você decide: busca local primeiro? refresh paralelo? merge? retry policy? O ViewModel NÃO sabe de Retrofit nem de Room — só chama repo.observeUsers() e repo.syncUsers()',
      'Só existe no Spring',
      'Substituído por DI',
    ],
    correct: 1,
    explanation: 'Repository continua valendo porque separa política de busca de dados da camada que só quer consumir. Padrão moderno: expõe Flow (observação reativa) + funções suspend (ações). ViewModel orquestra sem saber que Room e Retrofit existem abaixo.',
  },
  {
    question: 'Por que Hilt (Dagger Hilt) ganhou sobre Koin em apps sérios?',
    options: [
      'É mais bonito',
      'Verificação de grafo em tempo de compilação: erros de DI viram erros de compilação, não crashes em runtime. Performance melhor em apps grandes (sem reflection em runtime). Integração oficial com Jetpack (ViewModel scoping, WorkManager, Navigation). Koin tem DX mais simples e funciona bem em projetos menores, mas apps com 50+ módulos sentem a diferença',
      'Koin foi descontinuado',
      'Hilt é mais novo',
    ],
    correct: 1,
    explanation: 'Em 2026, Hilt é o default em apps sérios no Android. Koin ainda tem nicho em KMP e projetos menores que valorizam simplicidade. A garantia de compile-time do Hilt elimina categoria inteira de "funcionava em dev, crash em produção".',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="android-arch-mvvm-udf"
      title="Android architecture: MVVM + UDF"
      icon="🏛️"
      xp={50}
      readTime={12}
      trailName="Android Native: Kotlin + Compose"
      trailColor={accent}
      nextSlug="room-persistence"
      nextTitle="Room: persistência Android moderna"
      quiz={quiz}
    >
      <Section title="A arquitetura padrão Android 2026" accent={accent}>
        <p>
          Depois de uma década de experimentação (MVP, MVI, MVVM clássico, Redux-like), a indústria convergiu para MVVM + UDF + Repository + Hilt. Guia oficial do Android corrobora; codebases sérias seguem praticamente a mesma estrutura. Este módulo mostra essa stack canônica.
        </p>
      </Section>

      <Section title="Camadas" accent={accent}>
        <CodeBlock lang="bash">{'app/\n├── data/\n│   ├── remote/     (Retrofit services, DTOs)\n│   ├── local/      (Room DAOs, entities)\n│   └── repository/ (impl que junta remote + local)\n├── domain/         (modelos puros, use cases opcionais)\n├── ui/\n│   ├── feature/users/\n│   │   ├── UsersScreen.kt       (@Composable)\n│   │   ├── UsersViewModel.kt\n│   │   └── UsersUiState.kt\n│   └── theme/\n└── di/             (Hilt modules)'}</CodeBlock>
      </Section>

      <Section title="UiState + UiEvent" accent={accent}>
        <CodeBlock lang="kotlin">{'data class UsersUiState(\n    val loading: Boolean = false,\n    val users: List<User> = emptyList(),\n    val error: String? = null,\n    val searchQuery: String = "",\n)\n\nsealed interface UsersIntent {\n    data object Refresh : UsersIntent\n    data class Search(val query: String) : UsersIntent\n    data class Delete(val id: Long) : UsersIntent\n}\n\nsealed interface UsersEffect {\n    data class Toast(val message: String) : UsersEffect\n    data class Navigate(val userId: Long) : UsersEffect\n}'}</CodeBlock>
      </Section>

      <Section title="Repository" accent={accent}>
        <CodeBlock lang="kotlin">{'interface UserRepository {\n    fun observeAll(): Flow<List<User>>\n    suspend fun refresh()\n    suspend fun delete(id: Long)\n}\n\nclass UserRepositoryImpl @Inject constructor(\n    private val api: UsersApi,\n    private val dao: UserDao,\n    @IoDispatcher private val io: CoroutineDispatcher,\n) : UserRepository {\n    override fun observeAll(): Flow<List<User>> =\n        dao.observeAll().map { entities -> entities.map { it.toDomain() } }\n\n    override suspend fun refresh() = withContext(io) {\n        val fresh = api.users()\n        dao.upsertAll(fresh.map { it.toEntity() })\n    }\n\n    override suspend fun delete(id: Long) = withContext(io) {\n        api.delete(id)\n        dao.delete(id)\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="ViewModel com Hilt" accent={accent}>
        <CodeBlock lang="kotlin">{'@HiltViewModel\nclass UsersViewModel @Inject constructor(\n    private val repo: UserRepository,\n) : ViewModel() {\n    private val _state = MutableStateFlow(UsersUiState(loading = true))\n    val state: StateFlow<UsersUiState> = _state.asStateFlow()\n\n    private val _effects = MutableSharedFlow<UsersEffect>()\n    val effects: SharedFlow<UsersEffect> = _effects.asSharedFlow()\n\n    init {\n        viewModelScope.launch {\n            repo.observeAll().collect { list ->\n                _state.update { it.copy(users = list, loading = false) }\n            }\n        }\n        onIntent(UsersIntent.Refresh)\n    }\n\n    fun onIntent(intent: UsersIntent) {\n        when (intent) {\n            UsersIntent.Refresh -> viewModelScope.launch {\n                runCatching { repo.refresh() }\n                    .onFailure { t ->\n                        _state.update { it.copy(error = t.message) }\n                        _effects.emit(UsersEffect.Toast("Falha ao atualizar"))\n                    }\n            }\n            is UsersIntent.Search -> _state.update { it.copy(searchQuery = intent.query) }\n            is UsersIntent.Delete -> viewModelScope.launch { repo.delete(intent.id) }\n        }\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="DI com Hilt" accent={accent}>
        <CodeBlock lang="kotlin">{'@Qualifier @Retention(AnnotationRetention.BINARY)\nannotation class IoDispatcher\n\n@Module @InstallIn(SingletonComponent::class)\nobject AppModule {\n    @Provides @IoDispatcher\n    fun provideIo(): CoroutineDispatcher = Dispatchers.IO\n\n    @Provides @Singleton\n    fun provideRetrofit(): Retrofit = Retrofit.Builder()\n        .baseUrl("https://api.exemplo.com/")\n        .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))\n        .build()\n\n    @Provides @Singleton\n    fun provideUsersApi(r: Retrofit): UsersApi = r.create(UsersApi::class.java)\n}\n\n@Module @InstallIn(SingletonComponent::class)\nabstract class RepoModule {\n    @Binds abstract fun bindUserRepo(impl: UserRepositoryImpl): UserRepository\n}'}</CodeBlock>
      </Section>

      <Section title="Screen renderizando state" accent={accent}>
        <CodeBlock lang="kotlin">{'@Composable\nfun UsersScreen(\n    vm: UsersViewModel = hiltViewModel(),\n    onNavigateToDetail: (Long) -> Unit,\n) {\n    val ui by vm.state.collectAsStateWithLifecycle()\n    val ctx = LocalContext.current\n\n    LaunchedEffect(Unit) {\n        vm.effects.collect { effect ->\n            when (effect) {\n                is UsersEffect.Toast   -> Toast.makeText(ctx, effect.message, Toast.LENGTH_SHORT).show()\n                is UsersEffect.Navigate -> onNavigateToDetail(effect.userId)\n            }\n        }\n    }\n\n    UsersContent(\n        state = ui,\n        onIntent = vm::onIntent,\n    )\n}'}</CodeBlock>
      </Section>

      <Section title="Use cases (opcional)" accent={accent}>
        <Callout tone="neutral" icon="📌">
          Em apps grandes, use cases (classe por ação de domínio) ajudam a isolar regra de negócio reutilizável (ex: CalcularFreteUseCase). Em apps pequenos/médios, ViewModel chamando Repository direto já basta — adicionar camada por dogma gera verbosidade sem ganho.
        </Callout>
      </Section>

      <Section title="Anti-patterns clássicos" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          Evite: (1) Context dentro do ViewModel (memory leak), (2) state mutável exposto (var users em vez de StateFlow), (3) LiveData + StateFlow misturados, (4) Retrofit direto na Activity/Composable, (5) delay em produção para simular carregamento.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
