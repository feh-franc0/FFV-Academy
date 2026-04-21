import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('lifetimes-sem-medo');
const accent = '#b7410e';

const quiz: QuizQuestion[] = [
  {
    question: 'O que exatamente uma anotação de lifetime como &apos;a expressa?',
    options: [
      'Um tempo em segundos',
      'Um label que conecta a vida útil de uma ref à de outra — é o compilador provando que a ref não sobrevive ao valor que aponta. O programador não cria a lifetime; apenas nomeia a relação para que o checker consiga verificar',
      'Uma alocação de memória',
      'Tempo de GC',
    ],
    correct: 1,
    explanation: 'Lifetimes são puramente estáticas, zero overhead em runtime. Elas só aparecem na assinatura para dizer ao compilador coisas como "o output empresta do input 1, não do input 2". Se a relação for clara por elision rules (regras automáticas), você nem escreve &apos;a.',
  },
  {
    question: 'Qual trait você implementa para que seu tipo funcione em println!("{}", x)?',
    options: [
      'ToString',
      'Display — trait de apresentação amigável ao usuário. Debug (com "{:?}") é para developer/log; Display é para UI/mensagem final. Ambos exigem implementar fmt(&self, f) -> fmt::Result',
      'Print',
      'Stringify',
    ],
    correct: 1,
    explanation: 'Display é user-facing ("3.14"), Debug é dev-facing ("Point { x: 1, y: 2 }"). Derive(Debug) é quase sempre gratuito em structs; Display é impl manual porque exige decisão de formatação. ToString é auto-derivado a partir de Display.',
  },
  {
    question: 'Qual é a vantagem de generics + trait bounds vs herança?',
    options: [
      'Nenhuma',
      'Monomorfização: fn soma&lt;T: Add&gt;(a: T, b: T) gera uma versão especializada por tipo usado (zero dispatch dinâmico, inline perfeito). Trait bounds substituem "é-um" da herança por "faz-tal-coisa", mais flexível e sem diamond problem',
      'Generics são mais lentos',
      'Herança é igual',
    ],
    correct: 1,
    explanation: 'Rust usa monomorfização estática por default: cada call site com tipo diferente vira uma cópia especializada, que o LLVM inline. dyn Trait existe quando você precisa de dispatch dinâmico (Vec<Box<dyn Trait>>), mas tem custo de vtable. Trait bounds + generics = polimorfismo sem herança, sem fragile base class.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="lifetimes-sem-medo"
      title="Lifetimes sem medo + traits idiomáticos"
      icon="⏳"
      xp={60}
      readTime={14}
      trailName="Rust Profissional"
      trailColor={accent}
      nextSlug="async-tokio-producao"
      nextTitle="Async Rust + tokio em produção"
      quiz={quiz}
    >
      <Section title="Lifetimes não são mágica" accent={accent}>
        <p>
          Toda referência em Rust tem uma lifetime — sempre. Na maioria dos casos, o compilador infere; nos casos ambíguos, você escreve um label (tradicionalmente &apos;a) para explicitar a relação. Lifetime nunca cria nada em runtime: é só prova estática de que a ref não sobrevive ao dono.
        </p>
        <CodeBlock lang="rust">{'// sem lifetime: compilador não sabe se o output empresta de x ou de y\nfn maior(x: &str, y: &str) -> &str { // ❌ erro: missing lifetime specifier\n    if x.len() > y.len() { x } else { y }\n}\n\n// com lifetime: output vive enquanto ambos inputs viverem\nfn maior<\'a>(x: &\'a str, y: &\'a str) -> &\'a str {\n    if x.len() > y.len() { x } else { y }\n}'}</CodeBlock>
      </Section>

      <Section title="Elision rules: quando você omite" accent={accent}>
        <p>
          Em 3 casos comuns o compilador infere sozinho. Por isso você quase nunca escreve lifetime em código idiomático:
        </p>
        <CodeBlock lang="rust">{'// 1. Uma ref de entrada: lifetime vai para saída\nfn first_word(s: &str) -> &str { ... }      // compilador lê como <\'a>(s: &\'a str) -> &\'a str\n\n// 2. &self ou &mut self: saída herda lifetime do self\nimpl Parser { fn name(&self) -> &str { ... } }\n\n// 3. Várias entradas, mas nenhuma referência de saída: sem ambiguidade\nfn log_both(a: &str, b: &str) { println!("{} {}", a, b); }'}</CodeBlock>
        <Callout tone="info" icon="💡">
          Elision rules cobrem 80%+ dos casos. Anotar lifetime manual é sinal de: struct que guarda ref, função com múltiplas refs e output ambíguo, ou trait object com lifetime bound.
        </Callout>
      </Section>

      <Section title="&apos;static: a lifetime que vive para sempre" accent={accent}>
        <CodeBlock lang="rust">{'// literais de string são &\'static str — vivem durante todo o programa\nconst BANNER: &\'static str = "FFV Academy";\n\n// útil em threads: payload precisa ser \'static (não pode apontar pra stack de outro escopo)\nstd::thread::spawn(move || {\n    println!("rodando em background: {}", BANNER);\n});\n\n// Err comum: &\'static NÃO é "vazamento permitido" — é "vive até o fim do programa"'}</CodeBlock>
      </Section>

      <Section title="Traits canônicos que você vai implementar sempre" accent={accent}>
        <CodeBlock lang="rust">{'use std::fmt;\n\nstruct Duration { millis: u64 }\n\n// Debug: dev-facing, derive quase sempre\nimpl fmt::Debug for Duration {\n    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {\n        write!(f, "Duration({}ms)", self.millis)\n    }\n}\n\n// Display: user-facing, decisão de formatação\nimpl fmt::Display for Duration {\n    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {\n        write!(f, "{:.2}s", self.millis as f64 / 1000.0)\n    }\n}\n\n// From/Into: conversões idiomáticas (Into é auto-derivado de From)\nimpl From<u64> for Duration {\n    fn from(ms: u64) -> Self { Duration { millis: ms } }\n}\n\nlet d: Duration = 1500u64.into(); // usa From via Into\nprintln!("{}", d);   // "1.50s"\nprintln!("{:?}", d); // "Duration(1500ms)"'}</CodeBlock>
      </Section>

      <Section title="Iterator: o trait que vale ouro" accent={accent}>
        <CodeBlock lang="rust">{'// implementar Iterator dá gratuitamente: map, filter, take, collect, sum, fold, chain...\nstruct Fib { a: u64, b: u64 }\n\nimpl Iterator for Fib {\n    type Item = u64;\n    fn next(&mut self) -> Option<u64> {\n        let out = self.a;\n        self.a = self.b;\n        self.b = out + self.a;\n        Some(out)\n    }\n}\n\nfn main() {\n    let fib = Fib { a: 0, b: 1 };\n    let primeiros_10: Vec<u64> = fib.take(10).collect();\n    println!("{:?}", primeiros_10); // [0,1,1,2,3,5,8,13,21,34]\n}'}</CodeBlock>
        <Callout tone="success" icon="✅">
          Um único impl de next() desbloqueia 70+ combinators. Essa é a assinatura de bom design de API: uma operação pequena, dezenas grátis em cima.
        </Callout>
      </Section>

      <Section title="Generics + trait bounds" accent={accent}>
        <CodeBlock lang="rust">{'use std::ops::Add;\n\n// funciona para qualquer T que implemente Add<Output=T> e Copy\nfn soma<T: Add<Output = T> + Copy>(xs: &[T], zero: T) -> T {\n    xs.iter().fold(zero, |acc, x| acc + *x)\n}\n\nfn main() {\n    assert_eq!(soma(&[1, 2, 3], 0), 6);\n    assert_eq!(soma(&[1.5, 2.5], 0.0), 4.0);\n}'}</CodeBlock>
        <p>
          Monomorfização gera uma versão especializada por tipo usado — zero custo em runtime. Quando precisa de heterogeneidade em tempo de execução (Vec de objetos de tipos diferentes), você usa <code>Box&lt;dyn Trait&gt;</code>, que tem vtable mas resolve o caso.
        </p>
      </Section>
    </ModuleLayout>
  );
}
