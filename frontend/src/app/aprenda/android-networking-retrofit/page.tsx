import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('android-networking-retrofit');
const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que kotlinx.serialization tende a ser preferível a Moshi em projetos novos 2026?',
    options: [
      'Sintaxe',
      'kotlinx.serialization gera serializers em tempo de compilação sem reflection (Moshi com codegen também faz, mas requer kapt/ksp extra), tem integração natural com sealed classes/interfaces (@Serializable + @JsonClassDiscriminator), suporta Multiplatform, e evita problema do @JsonClass(generateAdapter = true) esquecido. Moshi ainda é excelente em bases que já investiram nele; escolher para projeto novo, kotlinx tende a ganhar',
      'Moshi é pago',
      'São idênticos',
    ],
    correct: 1,
    explanation: 'Ambos são ótimos e ativamente mantidos. O diferencial prático para código novo: kotlinx.serialization é parte do ecossistema Kotlin oficial (JetBrains), Multiplatform-ready, e mais ergonômico para sealed hierarchies comuns em modelagem de respostas de API.',
  },
  {
    question: 'Qual o papel de um OkHttp Interceptor em produção?',
    options: [
      'Só logging',
      'Ponto único para: adicionar Authorization header (com refresh automático), adicionar traceparent para observability, adicionar app version + platform, comprimir request, fazer cache de ETag, implementar retry seletivo, transformar respostas de erro em exceções tipadas, e logging condicional. Separar em Interceptors diferentes (Auth, Logging, Network) cada um com responsabilidade única',
      'Só retry',
      'Nada',
    ],
    correct: 1,
    explanation: 'Interceptor é a middleware do OkHttp. Em apps sérios, você encadeia 4-6: AuthInterceptor (tokens), HeadersInterceptor (version/platform), TraceInterceptor (tracing), HttpLoggingInterceptor (só em debug), e eventuais NetworkInterceptors de cache. Cada um pequeno, testável isoladamente.',
  },
  {
    question: 'Quando Ktor client faz mais sentido que Retrofit?',
    options: [
      'Sempre',
      'Projetos Kotlin Multiplatform (KMP) onde a mesma camada de rede roda em iOS, Android, JVM, JS — Ktor client é Kotlin puro e suporta todos os alvos. Em app Android puro com time já acostumado com Retrofit, a diferença é preferência. Ktor também brilha quando você quer DSL configurável (engine trocável, plugins) sem os paradigmas de interface do Retrofit',
      'Retrofit é morto',
      'Ktor é para server',
    ],
    correct: 1,
    explanation: 'Ktor é a escolha óbvia em KMP porque Retrofit é Android/JVM-only (depende de OkHttp). Em Android puro, Retrofit continua ergonômico e padrão da indústria. Ktor client + OkHttp engine em Android é combinação viável para compartilhar com iOS.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="android-networking-retrofit"
      title="Networking Android: Retrofit + Moshi"
      icon="🌐"
      xp={45}
      readTime={11}
      trailName="Android Native: Kotlin + Compose"
      trailColor={accent}
      nextSlug="capstone-android-app-publicado"
      nextTitle="Capstone: app Android publicado na Play Store"
      quiz={quiz}
    >
      <Section title="Stack canônica Android 2026" accent={accent}>
        <p>
          OkHttp como cliente HTTP (conexão, pool, interceptors, cache). Retrofit como camada declarativa sobre OkHttp. kotlinx.serialization ou Moshi para JSON. Tudo suspend-friendly. Ktor como alternativa em contextos KMP.
        </p>
      </Section>

      <Section title="Definindo a API com Retrofit + kotlinx.serialization" accent={accent}>
        <CodeBlock lang="kotlin">{'@Serializable\ndata class UserDto(\n    val id: Long,\n    val name: String,\n    val email: String,\n    @SerialName("created_at") val createdAt: String,\n)\n\ninterface UsersApi {\n    @GET("users")\n    suspend fun all(): List<UserDto>\n\n    @GET("users/{id}")\n    suspend fun byId(@Path("id") id: Long): UserDto\n\n    @POST("users")\n    suspend fun create(@Body body: CreateUserRequest): UserDto\n\n    @DELETE("users/{id}")\n    suspend fun delete(@Path("id") id: Long)\n}'}</CodeBlock>
      </Section>

      <Section title="Configuração de OkHttp + Retrofit" accent={accent}>
        <CodeBlock lang="kotlin">{'@Module @InstallIn(SingletonComponent::class)\nobject NetworkModule {\n\n    @Provides @Singleton\n    fun provideJson(): Json = Json {\n        ignoreUnknownKeys = true\n        encodeDefaults = true\n        explicitNulls = false\n    }\n\n    @Provides @Singleton\n    fun provideOkHttp(\n        authInterceptor: AuthInterceptor,\n        headersInterceptor: HeadersInterceptor,\n    ): OkHttpClient = OkHttpClient.Builder()\n        .connectTimeout(10, TimeUnit.SECONDS)\n        .readTimeout(20, TimeUnit.SECONDS)\n        .callTimeout(30, TimeUnit.SECONDS)\n        .retryOnConnectionFailure(true)\n        .addInterceptor(headersInterceptor)\n        .addInterceptor(authInterceptor)\n        .apply {\n            if (BuildConfig.DEBUG) {\n                addInterceptor(HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY })\n            }\n        }\n        .build()\n\n    @Provides @Singleton\n    fun provideRetrofit(client: OkHttpClient, json: Json): Retrofit = Retrofit.Builder()\n        .baseUrl("https://api.exemplo.com/")\n        .client(client)\n        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))\n        .build()\n\n    @Provides @Singleton\n    fun provideUsersApi(r: Retrofit): UsersApi = r.create(UsersApi::class.java)\n}'}</CodeBlock>
      </Section>

      <Section title="AuthInterceptor com refresh" accent={accent}>
        <CodeBlock lang="kotlin">{'class AuthInterceptor @Inject constructor(\n    private val tokenStore: TokenStore,\n) : Interceptor {\n    override fun intercept(chain: Interceptor.Chain): Response {\n        val original = chain.request()\n        val token = tokenStore.access() ?: return chain.proceed(original)\n\n        val withAuth = original.newBuilder()\n            .header("Authorization", "Bearer " + token)\n            .build()\n\n        val response = chain.proceed(withAuth)\n\n        if (response.code == 401) {\n            response.close()\n            val newToken = runBlocking { tokenStore.refresh() } ?: return chain.proceed(original)\n            val retried = original.newBuilder()\n                .header("Authorization", "Bearer " + newToken)\n                .build()\n            return chain.proceed(retried)\n        }\n        return response\n    }\n}'}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Refresh concorrente: se 5 requests falharem simultâneo com 401, sem mutex você faz 5 refresh. Encapsule refresh em Mutex/singleflight no TokenStore para garantir apenas um em voo.
        </Callout>
      </Section>

      <Section title="Mapeamento DTO → Domain" accent={accent}>
        <CodeBlock lang="kotlin">{'data class User(val id: Long, val name: String, val email: String, val createdAt: Instant)\n\nfun UserDto.toDomain() = User(\n    id = id,\n    name = name,\n    email = email,\n    createdAt = Instant.parse(createdAt),\n)'}</CodeBlock>
      </Section>

      <Section title="Tratamento de erros como tipos" accent={accent}>
        <CodeBlock lang="kotlin">{'sealed interface ApiError : Throwable {\n    data object NoConnection : ApiError\n    data class Http(val code: Int, val body: String?) : ApiError\n    data class Unexpected(val cause: Throwable) : ApiError\n}\n\nsuspend inline fun <T> safeCall(crossinline block: suspend () -> T): Result<T> = runCatching {\n    block()\n}.recoverCatching { t ->\n    throw when (t) {\n        is IOException -> ApiError.NoConnection\n        is HttpException -> ApiError.Http(t.code(), t.response()?.errorBody()?.string())\n        else -> ApiError.Unexpected(t)\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="Cert pinning" accent={accent}>
        <CodeBlock lang="kotlin">{'val pinner = CertificatePinner.Builder()\n    .add("api.exemplo.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")\n    .add("api.exemplo.com", "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=")   // backup\n    .build()\n\nOkHttpClient.Builder()\n    .certificatePinner(pinner)\n    .build()'}</CodeBlock>
      </Section>

      <Section title="WebSocket com OkHttp" accent={accent}>
        <CodeBlock lang="kotlin">{'val req = Request.Builder().url("wss://ws.exemplo.com/feed").build()\nval listener = object : WebSocketListener() {\n    override fun onMessage(ws: WebSocket, text: String) { /* ... */ }\n    override fun onFailure(ws: WebSocket, t: Throwable, r: Response?) { /* reconnect com backoff */ }\n}\nval socket = okHttpClient.newWebSocket(req, listener)\nsocket.send("ping")'}</CodeBlock>
      </Section>

      <Section title="Testes com MockWebServer" accent={accent}>
        <CodeBlock lang="kotlin">{'class UsersApiTest {\n    private val server = MockWebServer()\n    private lateinit var api: UsersApi\n\n    @Before fun setup() {\n        server.start()\n        api = Retrofit.Builder()\n            .baseUrl(server.url("/"))\n            .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))\n            .build()\n            .create(UsersApi::class.java)\n    }\n    @After fun tearDown() { server.shutdown() }\n\n    @Test fun all_parseiaLista() = runTest {\n        server.enqueue(MockResponse().setBody("[{\\"id\\":1,\\"name\\":\\"Fer\\",\\"email\\":\\"f@x\\",\\"created_at\\":\\"2026-04-19T00:00:00Z\\"}]"))\n        val list = api.all()\n        assertEquals(1, list.size)\n    }\n}'}</CodeBlock>
      </Section>
    </ModuleLayout>
  );
}
