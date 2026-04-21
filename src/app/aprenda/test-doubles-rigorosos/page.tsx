import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('test-doubles-rigorosos');

const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre Stub e Mock segundo Meszaros?',
    options: [
      'Sinônimos',
      'Stub: fornece respostas canned pro teste (state verification). Mock: verifica INTERAÇÃO (behavior verification — foi chamado 3x com args X?). Mock falha o teste se interação não bater',
      'Mock é deprecated',
      'Stub é mais lento',
    ],
    correct: 1,
    explanation: 'Gerard Meszaros — xUnit Test Patterns. Stub: "retorne X quando chamado" — teste verifica estado final. Mock: "deveria ser chamado com X 3 vezes" — teste falha se não foi. Mock acopla ao implementation detail (fragil); state verification é menos fragil.',
  },
  {
    question: 'O que é "fake"?',
    options: [
      'Teste fake',
      'Implementação simplificada mas FUNCIONAL (ex: in-memory DB implementando mesma interface). Mais realista que mock/stub, sem depender de DB real. Permite testes de integração leves',
      'Mock ruim',
      'Objeto nulo',
    ],
    correct: 1,
    explanation: 'Fake tem comportamento real, só simplificado. Ex: fake UserRepository que guarda em Map vez de Postgres — mesmo contrato, zero infra. Melhor que mock (não cacoa interação), melhor que stub (tem lógica de verdade). Test-containers é alternativa quando você quer o real.',
  },
  {
    question: 'Quando Spy é útil?',
    options: [
      'Nunca',
      'Quando você quer DESCOBRIR como método foi chamado durante teste sem afetar comportamento — ex: verificar que logger.info foi chamado com mensagem X, sem substituir o logger',
      'Sinônimo de mock',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Spy envolve o real — registra chamadas sem mudar comportamento. Útil quando o método tem side effect (log, métric, event) que você quer validar sem quebrar fluxo. vitest.spyOn, jest.spyOn. Mock substitui; spy observa.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="test-doubles-rigorosos"
      title="Test doubles: mock, stub, fake, spy, dummy (Meszaros)"
      icon="🎭"
      xp={50}
      readTime={11}
      trailName="Testing Engineering"
      trailColor={accent}
      nextSlug="property-based-testing"
      nextTitle="Property-based testing com fast-check: achar bugs em edge cases"
      quiz={quiz}
    >
      <Section title="Taxonomia Meszaros" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Tipo', 'Propósito', 'Exemplo']}
          rows={[
            ['Dummy', 'Preenche parâmetro não usado', 'Passa null ou {} só pra compilar'],
            ['Stub', 'Retorna respostas canned', 'getUser() retorna { id: 1 }'],
            ['Fake', 'Implementação simplificada funcional', 'InMemoryUserRepo'],
            ['Mock', 'Verifica interação esperada', 'expect(repo.save).calledWith(x)'],
            ['Spy', 'Observa chamadas sem mudar', 'vi.spyOn(console, "log")'],
          ]}
        />
      </Section>

      <Section title="Mock hell: quando parar" accent={accent}>
        <CodeBlock lang="typescript">{`// ❌ Mock hell — teste mais complexo que código
mockFn(a.b.c.d).mockImplementation(() => ({
  e: { f: () => Promise.resolve({ g: () => ... }) }
}));

// Se você chegou aqui, o código tem problema:
// 1. Muita dependência — extraia interface
// 2. Lógica escondida em dependência — teste mais alto (integration)
// 3. Test driving design ruim — considere refactor antes`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Regra: se mockar &gt; 3 deps em um teste, provavelmente está testando errado. Suba um nível (integration) ou refatore código.
        </Callout>
      </Section>

      <Section title="Fake &gt; Mock em boundaries estáveis" accent={accent}>
        <CodeBlock lang="typescript">{`interface UserRepo {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// Fake — implementação real simplificada
class InMemoryUserRepo implements UserRepo {
  private users = new Map<string, User>();
  async findById(id: string) { return this.users.get(id) ?? null; }
  async save(user: User) { this.users.set(user.id, user); }
}

// Teste usa fake — comportamento real, zero infra
const repo = new InMemoryUserRepo();
await repo.save({ id: '1', name: 'Ana' });
const found = await repo.findById('1');
expect(found?.name).toBe('Ana');`}</CodeBlock>
      </Section>
    </ModuleLayout>
  );
}
