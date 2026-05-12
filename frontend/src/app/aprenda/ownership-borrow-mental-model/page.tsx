import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ownership-borrow-mental-model');
const accent = '#b7410e';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a regra fundamental do ownership?',
    options: [
      'Toda variável é imutável',
      'Cada valor tem exatamente um dono (owner) a cada momento. Quando o dono sai de escopo, o valor é dropado automaticamente. Atribuir/passar por valor "move" a ownership — o dono anterior fica inválido, salvo tipos Copy',
      'Todo valor é compartilhado',
      'Ownership é opcional',
    ],
    correct: 1,
    explanation: 'Essa é a base do modelo RAII de Rust sem GC nem refcount obrigatório. "Único dono" + "drop determinístico quando sai de escopo" = gerenciamento de memória resolvido em compile-time. Tipos Copy (i32, bool, &T) duplicam em vez de mover porque são bit-copyable baratos e sem recurso externo.',
  },
  {
    question: 'Diferença entre &T e &mut T?',
    options: [
      'Só sintaxe',
      '&T é borrow compartilhado (N leitores simultâneos, nenhum escritor); &mut T é borrow exclusivo (1 escritor, 0 leitores). Essa regra — "aliasing XOR mutabilidade" — é o que prova em compile-time que não há data race entre threads nem iterator invalidation em single-thread',
      '&mut é mais rápido',
      'Nenhuma diferença real',
    ],
    correct: 1,
    explanation: 'XOR aliasing/mutation é o insight central. Data race precisa de 2 threads acessando o mesmo dado com pelo menos 1 escritor sem sync. Se o compilador rejeita aliasing+mutation, data race vira impossível (em código safe). O mesmo princípio evita invalidação de iterador: você não pode inserir num Vec enquanto um iterador vivo aponta pra ele.',
  },
  {
    question: 'Quando usar Clone vs borrow?',
    options: [
      'Sempre clone',
      'Borrow (&T ou &mut T) é o default idiomático — empresta sem copiar. Clone é explícito e deve aparecer quando você realmente precisa de uma cópia independente (cross-thread ownership, estrutura longa-vida que não quer lifetime parameter). Nunca clone só para calar o compilador',
      'Clone é sempre grátis',
      'Borrow aloca heap',
    ],
    correct: 1,
    explanation: 'Idiomatic Rust: funções recebem &str em vez de String, &[T] em vez de Vec, &Path em vez de PathBuf. Clone tem custo real (alloc, memcpy) e esconde bug de design quando usado para "resolver" erro de borrow. Se o compilador reclama, pense na estrutura antes de clonar — quase sempre há solução sem cópia.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ownership-borrow-mental-model"
      title="Ownership & borrow checker: mental model"
      icon="🔐"
      xp={60}
      readTime={14}
      trailName="Rust Profissional"
      trailColor={accent}
      nextSlug="lifetimes-sem-medo"
      nextTitle="Lifetimes sem medo + traits idiomáticos"
      quiz={quiz}
    >
      <Section title="Ownership é um modelo mental, não sintaxe" accent={accent}>
        <p>
          A maioria das pessoas "briga" com o borrow checker porque ainda pensa em C/Python/JS. Em Rust você precisa internalizar três perguntas antes de escrever uma função:
        </p>
        <CodeBlock lang="bash">{'1. Quem é o dono desse valor agora?\n2. Preciso mover ownership ou basta emprestar?\n3. Se emprestar: leitura (&T) ou escrita exclusiva (&mut T)?'}</CodeBlock>
        <p>
          Essas três perguntas resolvem 90% dos erros de compilação que parecem arbitrários. O borrow checker não é inimigo — é um revisor de código automático que nunca se distrai.
        </p>
      </Section>

      <Section title="Move vs Copy na prática" accent={accent}>
        <CodeBlock lang="rust">{'// MOVE (tipos owned: String, Vec, Box, arquivos...)\nlet s1 = String::from("olá");\nlet s2 = s1;           // ownership MOVE de s1 para s2\n// println!("{}", s1); // ERRO: value moved\nprintln!("{}", s2);    // ok\n\n// COPY (tipos bit-copiáveis baratos: i32, bool, char, f64, &T...)\nlet x: i32 = 42;\nlet y = x;             // COPY — ambos válidos\nprintln!("{} {}", x, y);\n\n// derive(Clone) dá .clone() explícito\n#[derive(Clone)]\nstruct Config { text: String }\nlet a = Config { text: "prod".into() };\nlet b = a.clone();     // cópia explícita, custo visível'}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Não confunda Copy (implícito, barato) com Clone (explícito, pode ser caro). String é Clone mas não Copy — alocação de heap não pode ser duplicada "sem custo".
        </Callout>
      </Section>

      <Section title="Borrow: o atalho que evita mover" accent={accent}>
        <CodeBlock lang="rust">{'// sem borrow: você teria que devolver o valor\nfn len_bad(s: String) -> (usize, String) {\n    (s.len(), s)           // feio, força quem chama a receber de volta\n}\n\n// com borrow: empresta, não move\nfn len_ok(s: &str) -> usize {\n    s.len()\n}\n\nfn main() {\n    let nome = String::from("fernando");\n    let n = len_ok(&nome); // empresta, nome continua válido\n    println!("{} tem {} chars", nome, n);\n}'}</CodeBlock>
      </Section>

      <Section title="A regra de ouro: aliasing XOR mutability" accent={accent}>
        <CodeBlock lang="rust">{'let mut v = vec![1, 2, 3];\n\nlet r1 = &v;         // borrow compartilhado\nlet r2 = &v;         // outro borrow compartilhado — OK (só leitura)\nprintln!("{:?} {:?}", r1, r2);\n\nlet m = &mut v;      // borrow exclusivo — OK porque r1/r2 não são mais usados (NLL)\nm.push(4);\n\n// ERRO clássico: usar &v e &mut v ao mesmo tempo\n// let r = &v;\n// let m = &mut v;   // ERRO: cannot borrow `v` as mutable while immutable borrow exists\n// println!("{:?}", r);'}</CodeBlock>
        <p>
          Essa regra sozinha elimina: data race (não dá para 2 threads mutarem sem sync), iterator invalidation (não dá para mutar o Vec enquanto itera sobre ele), e a maioria dos UAF que atormentam C++.
        </p>
      </Section>

      <Section title="O erro clássico do iniciante" accent={accent}>
        <CodeBlock lang="rust">{'// ❌ tentativa vinda de Python/JS\nfn primeiro(v: &Vec<i32>) -> &i32 { &v[0] }\n\nfn main() {\n    let mut v = vec![1, 2, 3];\n    let p = primeiro(&v);  // borrow imutável vivo\n    v.push(4);             // ERRO: &mut v enquanto &v existe\n    println!("{}", p);\n}\n\n// ✅ versão idiomática: escopo do borrow termina antes do push\nfn main_ok() {\n    let mut v = vec![1, 2, 3];\n    let primeiro_val = v[0]; // Copy de i32, borrow vive 1 linha\n    v.push(4);\n    println!("primeiro era {}", primeiro_val);\n}'}</CodeBlock>
        <Callout tone="info" icon="💡">
          O erro não é "Rust é chato" — é um bug real que C++ aceitaria silenciosamente. Se o Vec realocar em push(), o ponteiro p vira dangling. Rust detecta isso em compile-time.
        </Callout>
      </Section>

      <Section title="Quando o modelo aperta demais: escape hatches" accent={accent}>
        <CodeBlock lang="rust">{'// Rc<T>: múltiplos donos em single-thread (ref count)\n// Arc<T>: idem thread-safe (atomic ref count)\n// RefCell<T>: mutabilidade interior single-thread (runtime check)\n// Mutex<T> / RwLock<T>: mutabilidade interior multi-thread\n\nuse std::sync::Arc;\nuse std::sync::Mutex;\n\nlet config = Arc::new(Mutex::new(String::from("prod")));\nlet c2 = Arc::clone(&config);\nstd::thread::spawn(move || {\n    let mut guard = c2.lock().unwrap();\n    guard.push_str("-v2");\n});'}</CodeBlock>
        <Callout tone="success" icon="✅">
          Arc&lt;Mutex&lt;T&gt;&gt; é o padrão "shared mutable state" entre threads. Rc/RefCell é a versão single-thread. Use-os quando o modelo de árvore de ownership não couber — grafos cíclicos, cache compartilhado, etc.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
