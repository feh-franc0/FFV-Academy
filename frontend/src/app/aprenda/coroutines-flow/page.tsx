import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('coroutines-flow');
const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre cold Flow, SharedFlow e StateFlow?',
    options: [
      'São aliases',
      'Cold Flow (flow { ... }) começa produção só quando alguém coleta; cada collector recebe fluxo próprio. SharedFlow é hot: produz independentemente de collectors, multiplexa para N collectors, configurável com replay buffer. StateFlow é SharedFlow especializado que sempre tem um value corrente + replay=1 — modela estado observável (ideal para UI state em ViewModel)',
      'Flow é deprecado',
      'StateFlow é legado',
    ],
    correct: 1,
    explanation: 'Regra prática: UI state → StateFlow. Eventos one-shot (toast, navegar) → SharedFlow com replay=0. Pipeline de transformação lazy → cold Flow. Misturar os três no mesmo ViewModel é comum e correto.',
  },
  {
    question: 'Por que viewModelScope é preferível a GlobalScope?',
    options: [
      'Performance',
      'viewModelScope cancela automaticamente quando o ViewModel é limpo (onCleared), evitando vazamento de jobs continuando com referência ao VM. GlobalScope vive enquanto o processo viver — jobs continuam após a tela fechar, segurando recursos e potencialmente batendo em state já inválido. GlobalScope só é aceitável em uso muito pontual (analytics fire-and-forget no Application scope)',
      'GlobalScope nao existe',
      'viewModelScope e GlobalScope',
    ],
    correct: 1,
    explanation: 'Structured concurrency em Android: sempre vincular CoroutineScope ao lifecycle apropriado (viewModelScope, lifecycleScope, repeatOnLifecycle). GlobalScope é "code smell" moderno — Android Lint e Detekt já avisam.',
  },
  {
    question: 'O que stateIn(scope, started, initialValue) resolve?',
    options: [
      'Converte Flow em List',
      'Transforma um cold Flow em StateFlow hot compartilhado, iniciando quando alguém coleta (SharingStarted.WhileSubscribed(5_000)) e parando após último collector + delay. initialValue cobre o período antes da primeira emissão. Uso canônico: converter Flow vindo do Room em StateFlow consumível pela UI com timeout de parada para sobreviver a rotações',
      'Cria coroutine global',
      'Cancela a Flow',
    ],
    correct: 1,
    explanation: 'WhileSubscribed(5000) é quase universalmente o valor certo: 5 segundos de tolerância cobrem rotação de tela e navegação rápida sem reexecutar o flow, mas liberam recursos se a tela realmente saiu de cena. Eagerly desperdiça; Lazily pode começar tarde demais.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="coroutines-flow"
      title="Coroutines + Flow para async"
      icon="🌊"
      xp={55}
      readTime={13}
      trailName="Android Native: Kotlin + Compose"
      trailColor={accent}
      nextSlug="android-arch-mvvm-udf"
      nextTitle="Android architecture: MVVM + UDF"
      quiz={quiz}
    >
      <Section title="Coroutines: modelo base" accent={accent}>
        <p>
          Coroutines (estáveis desde 2018) são a abstração padrão de async em Kotlin: funções suspend compõem naturalmente, erros propagam como exceções normais, e scopes tornam cancelamento estruturado. Em 2026, praticamente todo código Android novo é coroutine-based.
        </p>
      </Section>

      <Section title="suspend + dispatchers" accent={accent}>
        <CodeBlock lang="kotlin">{'suspend fun loadUser(id: Long): User = withContext(Dispatchers.IO) {\n    val response = api.user(id)\n    response.toDomain()\n}\n\nsuspend fun computeHeavy(data: ByteArray): Digest = withContext(Dispatchers.Default) {\n    // CPU-bound: Default\n    Digest.sha256(data)\n}\n\n// Dispatchers.Main para UI (implicito no viewModelScope)'}</CodeBlock>
        <Callout tone="info" icon="💡">
          Regra: IO para blocking I/O (disco, rede sem Retrofit já-suspend, DB síncrono). Default para CPU bound. Main para UI. Troca via withContext é quase zero-custo.
        </Callout>
      </Section>

      <Section title="Scopes: viewModelScope, lifecycleScope, repeatOnLifecycle" accent={accent}>
        <CodeBlock lang="kotlin">{'class FeedViewModel(private val repo: FeedRepo) : ViewModel() {\n    fun refresh() = viewModelScope.launch {\n        try {\n            val posts = repo.fetch()\n            _state.update { it.copy(posts = posts) }\n        } catch (e: CancellationException) { throw e }\n          catch (e: Exception) { _state.update { it.copy(error = e.message) } }\n    }\n}\n\n@Composable\nfun FeedScreen(vm: FeedViewModel) {\n    // No Compose, collectAsStateWithLifecycle usa repeatOnLifecycle internamente\n    val ui by vm.state.collectAsStateWithLifecycle()\n    FeedContent(ui)\n}'}</CodeBlock>
      </Section>

      <Section title="Paralelismo estruturado" accent={accent}>
        <CodeBlock lang="kotlin">{'suspend fun loadDashboard(userId: Long) = coroutineScope {\n    val profile = async { repo.profile(userId) }\n    val feed    = async { repo.feed(userId) }\n    val stats   = async { repo.stats(userId) }\n    Dashboard(\n        profile = profile.await(),\n        feed    = feed.await(),\n        stats   = stats.await(),\n    )\n    // se qualquer async falhar, os outros sao cancelados e a funcao lanca\n}\n\n// supervisorScope quando quer que falhas isoladas NAO cancelem irmaos\nsuspend fun loadWithFallback(userId: Long) = supervisorScope {\n    val profile = async { repo.profile(userId) }\n    val notifs  = async { runCatching { repo.notifs(userId) }.getOrDefault(emptyList()) }\n    profile.await() to notifs.await()\n}'}</CodeBlock>
      </Section>

      <Section title="Flow: cold, lazy, composável" accent={accent}>
        <CodeBlock lang="kotlin">{'fun observeUsers(): Flow<List<User>> = flow {\n    while (true) {\n        val list = api.users()\n        emit(list)\n        delay(30_000)\n    }\n}.flowOn(Dispatchers.IO)\n   .distinctUntilChanged()\n   .catch { e -> emit(emptyList()) }\n\n// Uso:\nviewModelScope.launch {\n    observeUsers().collect { list ->\n        _state.update { it.copy(users = list) }\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="StateFlow: estado observável" accent={accent}>
        <CodeBlock lang="kotlin">{'data class UiState(\n    val loading: Boolean = false,\n    val items: List<Item> = emptyList(),\n    val error: String? = null,\n)\n\nclass ItemsViewModel(repo: ItemsRepo) : ViewModel() {\n    val state: StateFlow<UiState> = repo.observeAll()\n        .map { UiState(loading = false, items = it) }\n        .onStart { emit(UiState(loading = true)) }\n        .catch { emit(UiState(error = it.message)) }\n        .stateIn(\n            scope = viewModelScope,\n            started = SharingStarted.WhileSubscribed(5_000),\n            initialValue = UiState(loading = true),\n        )\n}'}</CodeBlock>
      </Section>

      <Section title="SharedFlow: eventos one-shot" accent={accent}>
        <CodeBlock lang="kotlin">{'sealed interface UiEvent {\n    data class Toast(val message: String) : UiEvent\n    data object NavigateBack : UiEvent\n}\n\nclass CheckoutViewModel : ViewModel() {\n    private val _events = MutableSharedFlow<UiEvent>()\n    val events: SharedFlow<UiEvent> = _events.asSharedFlow()\n\n    fun pagar() = viewModelScope.launch {\n        runCatching { gateway.charge() }\n            .onSuccess { _events.emit(UiEvent.NavigateBack) }\n            .onFailure { _events.emit(UiEvent.Toast("Pagamento falhou: ${it.message}")) }\n    }\n}\n\n@Composable\nfun CheckoutScreen(vm: CheckoutViewModel) {\n    val ctx = LocalContext.current\n    LaunchedEffect(Unit) {\n        vm.events.collect { event ->\n            when (event) {\n                is UiEvent.Toast -> Toast.makeText(ctx, event.message, Toast.LENGTH_SHORT).show()\n                UiEvent.NavigateBack -> { /* navController.popBackStack() */ }\n            }\n        }\n    }\n    // ... UI\n}'}</CodeBlock>
      </Section>

      <Section title="Testing com turbine + TestDispatcher" accent={accent}>
        <CodeBlock lang="kotlin">{'@OptIn(ExperimentalCoroutinesApi::class)\nclass ItemsViewModelTest {\n    private val dispatcher = StandardTestDispatcher()\n    @Before fun setUp() { Dispatchers.setMain(dispatcher) }\n    @After  fun tearDown() { Dispatchers.resetMain() }\n\n    @Test fun emite_loading_depois_dados() = runTest {\n        val repo = FakeRepo(listOf(Item(1, "a")))\n        val vm = ItemsViewModel(repo)\n\n        vm.state.test {\n            assertTrue(awaitItem().loading)\n            val loaded = awaitItem()\n            assertEquals(1, loaded.items.size)\n            cancelAndIgnoreRemainingEvents()\n        }\n    }\n}'}</CodeBlock>
        <Callout tone="success" icon="✅">
          turbine (cashapp) é quase universal em 2026 para testar Flow. Combinado com runTest + StandardTestDispatcher, você controla relógio virtual e valida sequência de emissões sem race de thread.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
