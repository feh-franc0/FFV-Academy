import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('kotlin-idiomatico');
const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o K2 compiler foi considerado grande salto no Kotlin 2.0 (2024)?',
    options: [
      'Só marketing',
      'Reescrita do frontend do compilador: mais rápido (compilação 2x em módulos médios), com type inference mais consistente, infraestrutura unificada para JVM, Native e JS, e base limpa para evoluir Kotlin Multiplatform. Plugins Compose, Parcelize e Serialization foram portados. Estabilidade só chegou depois de anos em alpha/beta',
      'Remove null safety',
      'Só roda em JVM',
    ],
    correct: 1,
    explanation: 'K2 é infraestrutura: substituiu o "old frontend" herdado desde 2011. Ganhos observáveis imediatos: tempo de build em projetos Android grandes caiu 30-50%. Ganho de longo prazo: velocity da equipe do Kotlin para adicionar features com menos bugs.',
  },
  {
    question: 'Quando usar sealed class vs sealed interface vs enum class?',
    options: [
      'São equivalentes',
      'enum para conjunto fechado de valores sem estado individual por instância (Color.RED, Status.ACTIVE). sealed class quando cada variante precisa de dados distintos e relação hierárquica única (Result.Success(data) vs Result.Error(throwable)). sealed interface quando você quer multi-herança/mixins (um tipo pode ser múltiplos sealed interfaces). Em 2026, sealed interface é frequentemente preferível por flexibilidade',
      'Só enum existe',
      'sealed é legado',
    ],
    correct: 1,
    explanation: 'Kotlin 1.5 trouxe sealed interface, e em 2026 virou default para sum types: permite que uma classe implemente dois "algebraic data types" simultaneamente. enum continua para valores sem payload; sealed class quando hierarquia é estritamente de classes.',
  },
  {
    question: 'O que inline value class resolve?',
    options: [
      'Performance de coleções',
      'Zero-cost wrapper: você cria UserId(value: String) para distinguir no sistema de tipos de OrderId, mas no bytecode é apenas o String subjacente (sem allocation do wrapper na maioria dos casos). Ganha type safety sem custo runtime. Limitações: um único campo; funciona pleno em JVM mas tem restrições em reflection e em alguns wrappers nullable',
      'Multi-herança',
      'Coroutines mais rápidas',
    ],
    correct: 1,
    explanation: 'value class @JvmInline é a ferramenta canônica contra "stringly-typed" APIs: fun deleteUser(id: UserId) é muito mais seguro que fun deleteUser(id: String). Sem essa feature, o overhead de boxing faria gente desistir e voltar para String cru.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="kotlin-idiomatico"
      title="Kotlin idiomático 2026 (K2 compiler)"
      icon="🔷"
      xp={50}
      readTime={12}
      trailName="Android Native: Kotlin + Compose"
      trailColor={accent}
      nextSlug="jetpack-compose-moderno"
      nextTitle="Jetpack Compose: UI declarativa Android"
      quiz={quiz}
    >
      <Section title="Kotlin em 2026" accent={accent}>
        <p>
          Quinze anos depois da primeira aparição pública (2011), Kotlin é linguagem oficial Android, primária em Spring Boot JVM moderno, viável em multiplatform (iOS, JS, WASM), e base do Compose Multiplatform. K2 compiler (2.0, 2024) estabilizou a fundação para os próximos 10 anos.
        </p>
      </Section>

      <Section title="Data classes e destructuring" accent={accent}>
        <CodeBlock lang="kotlin">{'data class User(val id: Long, val name: String, val email: String)\n\nval u = User(1, "Fernando", "f@exemplo.com")\nval (id, name) = u\n\n// copy com named args: evita builders\nval updated = u.copy(email = "novo@exemplo.com")'}</CodeBlock>
      </Section>

      <Section title="Sealed interfaces: ADT" accent={accent}>
        <CodeBlock lang="kotlin">{'sealed interface Result<out T> {\n    data class Success<T>(val value: T) : Result<T>\n    data class Failure(val error: Throwable) : Result<Nothing>\n    data object Loading : Result<Nothing>\n}\n\nfun <T> Result<T>.display(): String = when (this) {\n    is Result.Success -> "ok: $value"\n    is Result.Failure -> "erro: ${error.message}"\n    Result.Loading    -> "carregando"\n    // exhaustive sem else: se adicionar variante, compila quebra\n}'}</CodeBlock>
        <Callout tone="success" icon="✅">
          Exhaustive when no sealed é o maior ganho de manutenção: ao adicionar variante, compilador aponta TODOS os when que precisam atualizar.
        </Callout>
      </Section>

      <Section title="Inline value classes" accent={accent}>
        <CodeBlock lang="kotlin">{'@JvmInline\nvalue class UserId(val raw: Long)\n\n@JvmInline\nvalue class Email(val raw: String) {\n    init { require(raw.contains("@")) { "email invalido: $raw" } }\n}\n\nfun deleteUser(id: UserId) { /* ... */ }\n\nval u = UserId(42)\ndeleteUser(u)           // OK\n// deleteUser(42L)      // erro de compilacao: esperava UserId, nao Long'}</CodeBlock>
      </Section>

      <Section title="Null safety real" accent={accent}>
        <CodeBlock lang="kotlin">{'fun findUser(id: Long): User? = repo.firstOrNull { it.id == id }\n\nfun displayName(id: Long): String {\n    val user = findUser(id) ?: return "desconhecido"\n    return user.name.uppercase()\n}\n\n// Smart cast: compilador sabe que nao e nulo\nfun log(u: User?) {\n    if (u == null) return\n    println(u.name)   // sem !! nem ?.\n}'}</CodeBlock>
      </Section>

      <Section title="Scope functions: let, apply, also, run, with" accent={accent}>
        <CodeBlock lang="kotlin">{'// let: transformacao nullable\nval size = maybeText?.let { it.length } ?: 0\n\n// apply: configuracao de objeto\nval intent = Intent(ctx, DetailActivity::class.java).apply {\n    putExtra("id", userId)\n    putExtra("source", "list")\n    addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)\n}\n\n// also: side effect sem transformar\nval result = compute().also { log("calculou: $it") }\n\n// run: bloco com this receiver retornando valor\nval total = cart.run { items.sumOf { it.price } + shipping }'}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Escolha consciente: apply quando retorno é o próprio objeto configurado; let quando transforma; also quando é side effect. Uso descuidado vira "sopa de scope functions" ilegível.
        </Callout>
      </Section>

      <Section title="Extension functions" accent={accent}>
        <CodeBlock lang="kotlin">{'fun String.isValidEmail(): Boolean =\n    matches(Regex("^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$"))\n\nfun List<Int>.mediaOuZero(): Double =\n    if (isEmpty()) 0.0 else sum().toDouble() / size\n\n"f@exemplo.com".isValidEmail()\nlistOf(1, 2, 3).mediaOuZero()'}</CodeBlock>
      </Section>

      <Section title="Higher-order functions e lambdas tipadas" accent={accent}>
        <CodeBlock lang="kotlin">{'inline fun <T> medir(tag: String, block: () -> T): T {\n    val start = System.nanoTime()\n    val r = block()\n    val ms = (System.nanoTime() - start) / 1_000_000\n    println("$tag: ${ms}ms")\n    return r\n}\n\nval users = medir("fetch") { repo.all() }'}</CodeBlock>
      </Section>

      <Section title="Context receivers (ainda experimental) e alternativas" accent={accent}>
        <Callout tone="neutral" icon="📌">
          context receivers (2023 experimental) ainda não são estáveis em 2026. Até estabilizar, use extension com receiver explícito ou passe dependências como parâmetros. Não baseie API pública de lib em context receivers — risco de quebra.
        </Callout>
      </Section>

      <Section title="Kotlin Multiplatform status" accent={accent}>
        <p>
          KMP estabilizou em 2023 e em 2026 é escolha madura para compartilhar lógica de negócio entre Android e iOS. Compose Multiplatform (JetBrains) alcançou paridade razoável com SwiftUI para muitos casos de UI. Server-side continua sendo JVM (Kotlin/JVM = default); Native quando precisa de standalone binary.
        </p>
      </Section>
    </ModuleLayout>
  );
}
