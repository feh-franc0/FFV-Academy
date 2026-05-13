import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('java-21-features');
const accent = '#ea580c';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que records substituem classes POJO em 90% dos DTOs?',
    options: [
      'São mais rápidos em runtime',
      'Em uma linha declaram campos final, equals/hashCode/toString e construtor canônico — reduzem boilerplate e sinalizam intenção de valor imutável',
      'Permitem herança múltipla',
      'Records são mutáveis por padrão',
    ],
    correct: 1,
    explanation: 'record Point(int x, int y) {} gera automaticamente campos privados final, accessors x() y(), equals/hashCode baseado em componentes, toString estruturado e construtor canônico. A intenção passa a ser explícita: é um agregado de valores imutáveis, não uma entidade com identidade.',
  },
  {
    question: 'Qual a diferença central entre sealed class e abstract class tradicional?',
    options: [
      'Sealed é mais rápido',
      'Sealed restringe permits a um conjunto fechado de subtipos conhecidos em compile-time, habilitando pattern matching exhaustivo — o compilador checa que todos os casos foram tratados',
      'Sealed não permite métodos',
      'Sealed só funciona em interfaces',
    ],
    correct: 1,
    explanation: 'sealed interface Shape permits Circle, Square, Triangle {} fecha a hierarquia. Em switch exhaustivo, o compilador reclama se você esquecer um case. É sum type de verdade na JVM, o que elimina default branches perigosos e documenta o domínio.',
  },
  {
    question: 'Quando var atrapalha mais do que ajuda?',
    options: [
      'Nunca, é sempre melhor',
      'Quando o tipo à direita não é óbvio pelo nome da variável ou pelo literal — var result = service.process(x) esconde se é List, Stream ou Optional',
      'Em loops',
      'Só em métodos estáticos',
    ],
    correct: 1,
    explanation: 'var é type inference local, não dynamic. Funciona bem com new ArrayList<String>() ou Map.of(...) onde o tipo é evidente. Atrapalha quando o leitor tem que abrir a assinatura do método para descobrir o tipo. Regra sênior: o leitor manda, não o escritor.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="java-21-features"
      title="Java 17/21 features: records, sealed, pattern matching"
      icon="✨"
      xp={55}
      readTime={13}
      trailName="Java Moderno (17/21 LTS)"
      trailColor={accent}
      nextSlug="virtual-threads-loom"
      nextTitle="Virtual Threads (Project Loom, Java 21)"
      quiz={quiz}
    >
      <Section title="Java de 2026 parece outra linguagem" accent={accent}>
        <p>
          Quem parou no Java 8 reconhece a sintaxe mas não o estilo. Entre 17 (LTS 2021) e 21 (LTS 2023) entrou uma leva de features que consolidam um Java mais declarativo, com sum types honestos, imutabilidade por padrão e switch expressivo. Nada disso é açúcar gratuito — cada item foi desenhado para substituir um idiom boilerplate antigo.
        </p>
      </Section>

      <Section title="Records: DTOs em uma linha" accent={accent}>
        <p>Antes: getters, setters, equals, hashCode, toString escritos na mão ou via Lombok. Agora:</p>
        <CodeBlock lang="java">{`public record Money(long cents, String currency) {
    public Money {
        if (cents < 0) throw new IllegalArgumentException("negative");
        if (currency == null || currency.length() != 3) throw new IllegalArgumentException("ISO 4217");
    }

    public Money add(Money other) {
        if (!currency.equals(other.currency)) throw new IllegalStateException("mismatch");
        return new Money(cents + other.cents, currency);
    }
}`}</CodeBlock>
        <p>Compact constructor valida invariantes. Accessors são cents() e currency(). equals/hashCode corretos por default. Perfeito para DTO de request/response, evento de domínio, par de coordenadas.</p>
      </Section>

      <Section title="Sealed classes + pattern matching: sum types na JVM" accent={accent}>
        <CodeBlock lang="java">{`public sealed interface PaymentResult permits Approved, Declined, Pending {}

public record Approved(String authCode, Money amount) implements PaymentResult {}
public record Declined(String reason, String code) implements PaymentResult {}
public record Pending(String pollUrl) implements PaymentResult {}

String describe(PaymentResult r) {
    return switch (r) {
        case Approved a -> "ok " + a.authCode();
        case Declined d -> "no " + d.reason();
        case Pending p  -> "wait " + p.pollUrl();
    };
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Sem default. Se alguém adicionar AwaitingReview ao sealed, o compilador quebra o switch em todo o codebase — o que é exatamente o que você quer. Refactor seguro.
        </Callout>
      </Section>

      <Section title="Text blocks, var e switch expression" accent={accent}>
        <CodeBlock lang="java">{`var sql = """
        SELECT id, email
        FROM users
        WHERE created_at > ?
        """;

var tier = switch (plan) {
    case "free", "trial" -> 0;
    case "pro"            -> 1;
    case "enterprise"     -> 2;
    default               -> throw new IllegalArgumentException(plan);
};`}</CodeBlock>
        <p>Text block mata concatenação com barra invertida em SQL e JSON inline. Switch expression é valor, não statement — obriga exaustividade e aceita multi-label.</p>
      </Section>

      <Section title="O que não virou idiomático" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          Pattern matching com deconstruction (record patterns, JEP 440) já é final em 21, mas ainda não é reflex em todo time. String templates (JEP 430) saiu como preview em 21 e foi retirado em 23 para redesign — evite depender até virar final.
        </Callout>
      </Section>

      <Section title="Checklist de adoção" accent={accent}>
        <Callout tone="success" icon="✅">
          Use record para qualquer agregado imutável. Use sealed + switch exhaustivo para tipos que têm conjunto fechado de variantes. Use var quando o tipo é óbvio no lado direito. Use text block em qualquer string multilinha. Isso corta 30–40% do boilerplate de um backend Java médio.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
