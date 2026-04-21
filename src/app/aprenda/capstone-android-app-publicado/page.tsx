import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-android-app-publicado');
const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que AAB (Android App Bundle) substituiu APK puro em 2021+?',
    options: [
      'Marketing',
      'Play Store passa a gerar APKs otimizados por dispositivo (split por ABI, densidade, language) a partir do mesmo bundle. Usuário baixa ~30% menos bytes em média; você sobe um único artefato. APK universal ainda é útil para sideload / stores alternativas, mas Play Store requer AAB. Play Integrity + Play App Signing gerenciam a chave de assinatura final',
      'AAB é sinônimo',
      'APK foi banido',
    ],
    correct: 1,
    explanation: 'AAB é o formato atual obrigatório para publicar na Play Store. Ele permite Dynamic Delivery (features baixadas sob demanda) e reduz peso do app sem esforço do dev. Você assina com upload key; Play re-assina com app signing key gerenciada por eles.',
  },
  {
    question: 'Qual a diferença entre internal, closed e open testing tracks?',
    options: [
      'Só nome',
      'Internal testing: até 100 testers por email, publicação em minutos, sem review formal. Closed testing: lista fechada de usuários (ex: beta crew), passa por Play review. Open testing: qualquer usuário via link público ou ficha beta, também review. Produção: público geral, review completo, opt-in a staged rollout (ex: 10% → 50% → 100%). Escada típica: internal sempre, closed/open para QA externo, produção com rollout gradual',
      'Só produção importa',
      'Todos são iguais',
    ],
    correct: 1,
    explanation: 'A escada de tracks minimiza risco: internal dogfood diário, closed com beta testers reais, open com early adopters, produção com staged rollout. Cada etapa filtra bugs antes de atingir 100% da base.',
  },
  {
    question: 'O que diferencia um capstone Android "portfolio-grade" de app toy?',
    options: [
      'Linhas de código',
      'App completo em AAB publicado em internal testing pelo menos: Compose + MVVM+UDF + Room + Retrofit + Hilt + coroutines/Flow. Unit + UI tests no CI (GitHub Actions). Dynamic color Material 3, Dark Mode, acessibilidade verificada com TalkBack. Tracking de crashes (Firebase Crashlytics ou Sentry). Baseline profile para performance. Privacy + permissions justificadas. README com arquitetura, screenshots, e decisões',
      'Muitas telas',
      'Ser open source',
    ],
    correct: 1,
    explanation: 'Sinais que tech lead sênior e revisor da Play Store procuram: arquitetura limpa (camadas), disciplina de teste, acessibilidade, observabilidade, performance (baseline profile, Compose stability). É o que separa projeto publicado de projeto acabado no simulator.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-android-app-publicado"
      title="Capstone: app Android publicado na Play Store"
      icon="🏁"
      xp={85}
      readTime={20}
      trailName="Android Native: Kotlin + Compose"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="O projeto" accent={accent}>
        <p>
          Construa um app Android real, publicado pelo menos em internal testing na Play Store, aplicando tudo da trilha: Kotlin 2 idiomático, Compose, coroutines/Flow, MVVM+UDF, Room, Retrofit + kotlinx.serialization, Hilt, testes em três camadas, CI com GitHub Actions. Ideia sugerida: diário de hábitos (simétrico ao capstone iOS — permite comparar stacks).
        </p>
        <Callout tone="info" icon="🎯">
          Não é tutorial: é scaffold que tech lead reconheceria como produção-ready. Arquitetura limpa, testes, CI, crash reporting, acessibilidade, performance.
        </Callout>
      </Section>

      <Section title="Estrutura do projeto" accent={accent}>
        <CodeBlock lang="bash">{'HabitsApp/\n├── app/\n│   └── src/main/\n│       ├── java/com/ffv/habits/\n│       │   ├── HabitsApp.kt         (@HiltAndroidApp)\n│       │   ├── MainActivity.kt\n│       │   ├── ui/\n│       │   │   ├── theme/\n│       │   │   └── feature/\n│       │   │       ├── habits/\n│       │   │       └── stats/\n│       │   ├── domain/\n│       │   ├── data/\n│       │   │   ├── remote/\n│       │   │   ├── local/\n│       │   │   └── repository/\n│       │   └── di/\n│       ├── res/\n│       │   ├── values/strings.xml   (pt-br default)\n│       │   └── values-en/strings.xml\n│       └── AndroidManifest.xml\n├── app/benchmark/                    (baseline profile)\n├── build-logic/                      (convention plugins)\n├── gradle/libs.versions.toml\n├── .github/workflows/android.yml\n└── fastlane/'}</CodeBlock>
      </Section>

      <Section title="Application + Activity entry" accent={accent}>
        <CodeBlock lang="kotlin">{'@HiltAndroidApp\nclass HabitsApp : Application()\n\n@AndroidEntryPoint\nclass MainActivity : ComponentActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        enableEdgeToEdge()\n        setContent { AppTheme { AppNav() } }\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="Domain + Room" accent={accent}>
        <CodeBlock lang="kotlin">{'@Entity(tableName = "habits")\ndata class HabitEntity(\n    @PrimaryKey val id: Long,\n    val name: String,\n    val emoji: String,\n    val createdAt: Long,\n)\n\n@Entity(tableName = "entries", foreignKeys = [ForeignKey(\n    entity = HabitEntity::class, parentColumns = ["id"], childColumns = ["habitId"],\n    onDelete = ForeignKey.CASCADE,\n)], indices = [Index("habitId")])\ndata class EntryEntity(\n    @PrimaryKey(autoGenerate = true) val id: Long = 0,\n    val habitId: Long,\n    val date: Long,\n)\n\ndata class HabitWithEntries(\n    @Embedded val habit: HabitEntity,\n    @Relation(parentColumn = "id", entityColumn = "habitId") val entries: List<EntryEntity>,\n)\n\n// Calculo de streak puro, testavel isolado\nfun streak(entries: List<EntryEntity>, nowMs: Long = System.currentTimeMillis()): Int {\n    val zone = ZoneId.systemDefault()\n    val days = entries.map { Instant.ofEpochMilli(it.date).atZone(zone).toLocalDate() }.toSet()\n    var count = 0\n    var cursor = Instant.ofEpochMilli(nowMs).atZone(zone).toLocalDate()\n    while (cursor in days) { count++; cursor = cursor.minusDays(1) }\n    return count\n}'}</CodeBlock>
      </Section>

      <Section title="ViewModel + State" accent={accent}>
        <CodeBlock lang="kotlin">{'data class HabitsUiState(\n    val loading: Boolean = false,\n    val habits: List<HabitCard> = emptyList(),\n    val error: String? = null,\n)\n\ndata class HabitCard(val id: Long, val name: String, val emoji: String, val streak: Int)\n\n@HiltViewModel\nclass HabitsViewModel @Inject constructor(\n    private val repo: HabitRepository,\n) : ViewModel() {\n    val state: StateFlow<HabitsUiState> = repo.observeWithEntries()\n        .map { list -> list.map { HabitCard(it.habit.id, it.habit.name, it.habit.emoji, streak(it.entries)) } }\n        .map { HabitsUiState(loading = false, habits = it) }\n        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), HabitsUiState(loading = true))\n\n    fun checkIn(habitId: Long) = viewModelScope.launch { repo.addEntry(habitId) }\n}'}</CodeBlock>
      </Section>

      <Section title="Compose screen" accent={accent}>
        <CodeBlock lang="kotlin">{'@Composable\nfun HabitsScreen(vm: HabitsViewModel = hiltViewModel()) {\n    val ui by vm.state.collectAsStateWithLifecycle()\n    LazyColumn(Modifier.fillMaxSize().padding(16.dp)) {\n        items(ui.habits, key = { it.id }) { card ->\n            HabitRow(card = card, onCheckIn = { vm.checkIn(card.id) })\n        }\n    }\n}\n\n@Composable\nfun HabitRow(card: HabitCard, onCheckIn: () -> Unit) {\n    Row(\n        verticalAlignment = Alignment.CenterVertically,\n        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),\n    ) {\n        Text(card.emoji, fontSize = 28.sp)\n        Spacer(Modifier.width(12.dp))\n        Column(Modifier.weight(1f)) {\n            Text(card.name, style = MaterialTheme.typography.titleMedium)\n            Text("Streak: " + card.streak + " dias", style = MaterialTheme.typography.bodySmall)\n        }\n        FilledTonalButton(onClick = onCheckIn) { Text("Check-in") }\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="Baseline profile para performance" accent={accent}>
        <CodeBlock lang="kotlin">{'@RunWith(AndroidJUnit4::class)\nclass BaselineProfileGenerator {\n    @get:Rule val rule = BaselineProfileRule()\n\n    @Test fun generate() = rule.collect(\n        packageName = "com.ffv.habits",\n        includeInStartupProfile = true,\n    ) {\n        pressHome()\n        startActivityAndWait()\n        // navegar pelos fluxos mais frequentes\n    }\n}'}</CodeBlock>
        <Callout tone="success" icon="✅">
          Baseline profile reduz cold start em 20-30% compilando AOT os paths críticos. É opt-in fácil em 2026 e sinaliza cuidado com performance.
        </Callout>
      </Section>

      <Section title="CI com GitHub Actions" accent={accent}>
        <CodeBlock lang="yaml">{'# .github/workflows/android.yml\nname: android\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-java@v4\n        with: { distribution: "temurin", java-version: "17" }\n      - uses: gradle/actions/setup-gradle@v3\n      - run: ./gradlew detekt lint\n      - run: ./gradlew testDebugUnitTest\n      - run: ./gradlew :app:assembleRelease\n      - uses: actions/upload-artifact@v4\n        with:\n          name: app-release\n          path: app/build/outputs/bundle/release/*.aab'}</CodeBlock>
      </Section>

      <Section title="Publicação com fastlane supply" accent={accent}>
        <CodeBlock lang="bash">{'# fastlane/Fastfile\ndefault_platform(:android)\nplatform :android do\n  lane :beta do\n    gradle(task: "bundleRelease")\n    upload_to_play_store(\n      track: "internal",\n      aab: "app/build/outputs/bundle/release/app-release.aab",\n      skip_upload_metadata: true,\n    )\n  end\n\n  lane :release do\n    gradle(task: "bundleRelease")\n    upload_to_play_store(\n      track: "production",\n      rollout: "0.1",\n      aab: "app/build/outputs/bundle/release/app-release.aab",\n    )\n  end\nend'}</CodeBlock>
      </Section>

      <Section title="Entregáveis finais" accent={accent}>
        <Callout tone="success" icon="🏁">
          Repo público com: (1) app rodando em internal testing na Play Store com pelo menos 3 testers reais, (2) arquitetura MVVM+UDF + Room + Retrofit + Hilt, (3) cobertura acima de 70% em unit + integration, (4) ao menos 2 UI tests cobrindo fluxo principal, (5) Material 3 com Dynamic Color, Dark Mode, acessibilidade testada com TalkBack, (6) localização PT-BR + EN, (7) Firebase Crashlytics ou Sentry ativo, (8) baseline profile gerado, (9) CI verde no GitHub Actions, (10) README com arquitetura, decisões e screenshots.
        </Callout>
        <Callout tone="info" icon="🎯">
          Esse é o sinal de "sei entregar Android de verdade em 2026" — combinar stack moderna, disciplina arquitetural, testes, observabilidade e respeito ao usuário em um app que realmente vai ao ar.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
