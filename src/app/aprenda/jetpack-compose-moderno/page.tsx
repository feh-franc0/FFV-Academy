import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('jetpack-compose-moderno');
const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é recomposition e quando ela é "skippable"?',
    options: [
      'É redraw da tela toda',
      'Recomposition é a re-execução de uma função @Composable quando um State lido dentro dela muda. Um composable é skippable quando seus parâmetros são todos stable (tipos imutáveis ou marcados @Immutable/@Stable), permitindo ao runtime pular a re-execução se os parâmetros não mudaram. Ignorar stability leva a recompositions em cascata e jank',
      'Garbage collection',
      'Inflação de XML',
    ],
    correct: 1,
    explanation: 'Entender skippability é o que separa Compose fluido de Compose com jank. Data classes já são stable; listas de data classes NÃO são (List<T> mutável). Usar ImmutableList (kotlinx.collections.immutable) ou @Immutable wrapper resolve — e a Compose Compiler Reports mostra exatamente o que é skippable.',
  },
  {
    question: 'Para que serve state hoisting?',
    options: [
      'Mover state para HTTP',
      'Transformar composables stateful em stateless: em vez de remember { ... } dentro do composable, receber o state + callback por parâmetro (value + onValueChange). Vantagens: testabilidade (você controla state do teste), reutilização (mesmo composable em contextos com state em lugares diferentes), preview (pode passar state mock), unidirectional data flow',
      'Otimização do compilador',
      'Ligado a DataStore',
    ],
    correct: 1,
    explanation: 'State hoisting é o padrão arquitetural central do Compose. Composable de UI deve ser stateless; state sobe até o ViewModel (ou parent composable que tem razão de manter). Regra: se dois composables precisam do mesmo state, suba para ancestral comum.',
  },
  {
    question: 'Quando LazyColumn vs Column + verticalScroll?',
    options: [
      'São iguais',
      'Column + verticalScroll compõe TODOS os filhos imediatamente — aceita para listas pequenas (~30 itens de UI leve). LazyColumn compõe somente os itens visíveis + buffer, essencial para listas grandes/infinitas; aceita items(key) para manter identidade em reorderings, e itemsIndexed, stickyHeader, contentPadding. Esquecer key causa animação errada em atualizações',
      'LazyColumn é legado',
      'Column aceita paging',
    ],
    correct: 1,
    explanation: 'Em listas maiores, LazyColumn é a única opção performática. A key é crítica: sem key, items com mesmo índice após um insert/remove são tratados como "mesmo item" e o state (expanded, animation) bagunça. Sempre items(list, key = { it.id }).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="jetpack-compose-moderno"
      title="Jetpack Compose: UI declarativa Android"
      icon="🎨"
      xp={55}
      readTime={13}
      trailName="Android Native: Kotlin + Compose"
      trailColor={accent}
      nextSlug="coroutines-flow"
      nextTitle="Coroutines + Flow para async"
      quiz={quiz}
    >
      <Section title="Por que Compose substituiu XML" accent={accent}>
        <p>
          XML + View system (2008) carregava 15 anos de débitos: ciclo de vida complexo, state duplicado entre View e ViewModel, performance limitada por inflação, animações trabalhosas. Compose (estável 2021) oferece UI declarativa como função do state, menos código, previews live, e base comum com Compose Multiplatform.
        </p>
      </Section>

      <Section title="Composable básico + state hoisting" accent={accent}>
        <CodeBlock lang="kotlin">{'@Composable\nfun CounterScreen() {\n    var count by remember { mutableIntStateOf(0) }\n    Counter(value = count, onIncrement = { count++ })\n}\n\n@Composable\nfun Counter(value: Int, onIncrement: () -> Unit) {\n    Column(\n        modifier = Modifier.fillMaxSize().padding(16.dp),\n        verticalArrangement = Arrangement.Center,\n        horizontalAlignment = Alignment.CenterHorizontally,\n    ) {\n        Text("Count: $value", style = MaterialTheme.typography.headlineMedium)\n        Button(onClick = onIncrement) { Text("Incrementar") }\n    }\n}'}</CodeBlock>
        <p>
          Counter é stateless: recebe value e callback. Testar equivale a chamar com parâmetros. Previewer funciona com state mock.
        </p>
      </Section>

      <Section title="Layouts: Row, Column, Box, LazyColumn" accent={accent}>
        <CodeBlock lang="kotlin">{'@Composable\nfun UserCard(user: User) {\n    Row(\n        verticalAlignment = Alignment.CenterVertically,\n        modifier = Modifier.fillMaxWidth().padding(12.dp),\n    ) {\n        AsyncImage(\n            model = user.avatarUrl,\n            contentDescription = null,\n            modifier = Modifier.size(48.dp).clip(CircleShape),\n        )\n        Spacer(Modifier.width(12.dp))\n        Column(Modifier.weight(1f)) {\n            Text(user.name, fontWeight = FontWeight.SemiBold)\n            Text(user.email, color = MaterialTheme.colorScheme.onSurfaceVariant)\n        }\n        Icon(Icons.Default.ChevronRight, contentDescription = null)\n    }\n}\n\n@Composable\nfun UserList(users: List<User>, onClick: (User) -> Unit) {\n    LazyColumn {\n        items(users, key = { it.id }) { user ->\n            UserCard(user = user)\n                .also { /* decorativo: acoes via modifier clickable */ }\n        }\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="collectAsStateWithLifecycle: ViewModel + UI" accent={accent}>
        <CodeBlock lang="kotlin">{'data class UsersUiState(\n    val loading: Boolean = false,\n    val users: List<User> = emptyList(),\n    val error: String? = null,\n)\n\nclass UsersViewModel(private val repo: UserRepo) : ViewModel() {\n    private val _state = MutableStateFlow(UsersUiState())\n    val state: StateFlow<UsersUiState> = _state.asStateFlow()\n\n    init { load() }\n\n    fun load() = viewModelScope.launch {\n        _state.update { it.copy(loading = true, error = null) }\n        runCatching { repo.all() }\n            .onSuccess { list -> _state.update { it.copy(loading = false, users = list) } }\n            .onFailure { t -> _state.update { it.copy(loading = false, error = t.message) } }\n    }\n}\n\n@Composable\nfun UsersScreen(vm: UsersViewModel = hiltViewModel()) {\n    val ui by vm.state.collectAsStateWithLifecycle()\n    when {\n        ui.loading      -> LoadingIndicator()\n        ui.error != null -> ErrorView(ui.error)\n        else            -> UserList(users = ui.users, onClick = {})\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="Navigation Compose" accent={accent}>
        <CodeBlock lang="kotlin">{'@Composable\nfun AppNav() {\n    val nav = rememberNavController()\n    NavHost(navController = nav, startDestination = "users") {\n        composable("users") {\n            UsersScreen(onUserClick = { id -> nav.navigate("user/$id") })\n        }\n        composable(\n            route = "user/{id}",\n            arguments = listOf(navArgument("id") { type = NavType.LongType }),\n        ) { backStack ->\n            val id = backStack.arguments?.getLong("id") ?: return@composable\n            UserDetailScreen(id = id)\n        }\n    }\n}'}</CodeBlock>
        <Callout tone="info" icon="💡">
          Em 2026, type-safe navigation com Navigation 2.8+ usa rotas como data classes (@Serializable) — sem string concat e casts de argument.
        </Callout>
      </Section>

      <Section title="Material 3 + theming" accent={accent}>
        <CodeBlock lang="kotlin">{'@Composable\nfun AppTheme(\n    darkTheme: Boolean = isSystemInDarkTheme(),\n    content: @Composable () -> Unit,\n) {\n    val colorScheme = if (darkTheme) darkColorScheme() else lightColorScheme()\n    MaterialTheme(\n        colorScheme = colorScheme,\n        typography = AppTypography,\n        content = content,\n    )\n}'}</CodeBlock>
      </Section>

      <Section title="Stability e recomposition reports" accent={accent}>
        <CodeBlock lang="bash">{'# build.gradle.kts (module)\nkotlin {\n    compilerOptions {\n        freeCompilerArgs.addAll(\n            "-P",\n            "plugin:androidx.compose.compiler.plugins.kotlin:reportsDestination=" +\n              "${project.buildDir}/compose_reports",\n        )\n    }\n}\n\n# ./gradlew :app:assembleRelease\n# Abra build/compose_reports/*-classes.txt para ver quais classes sao stable.'}</CodeBlock>
      </Section>

      <Section title="Preview + testes" accent={accent}>
        <CodeBlock lang="kotlin">{'@Preview(name = "light", uiMode = UI_MODE_NIGHT_NO)\n@Preview(name = "dark",  uiMode = UI_MODE_NIGHT_YES)\n@Composable\nprivate fun CounterPreview() {\n    AppTheme { Counter(value = 3, onIncrement = {}) }\n}\n\n// Teste de UI com compose-ui-test\nclass CounterTest {\n    @get:Rule val rule = createComposeRule()\n\n    @Test fun incrementa() {\n        rule.setContent { CounterScreen() }\n        rule.onNodeWithText("Incrementar").performClick()\n        rule.onNodeWithText("Count: 1").assertIsDisplayed()\n    }\n}'}</CodeBlock>
      </Section>
    </ModuleLayout>
  );
}
