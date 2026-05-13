import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('macros-rust');
const accent = '#b7410e';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando escolher macro em vez de função?',
    options: [
      'Sempre',
      'Quando precisa de número variável de argumentos (vec!, println!), gerar código repetitivo (derive), receber tipos como input (assert_eq! expande para match), ou operar em tokens antes do type-check. Função é o default: melhor debug, melhor IDE, mais previsível',
      'Nunca',
      'Quando quer código lento',
    ],
    correct: 1,
    explanation: 'Macro é ferramenta de meta-programação: opera em TOKENS antes do type-check. Isso desbloqueia coisas impossíveis em função (varargs, sintaxe custom, derive de traits). Custo: pior erro de compilação, pior hover no IDE, pior refactor. Regra prática: função primeiro; macro quando a API ganharia ergonomia clara.',
  },
  {
    question: 'Diferença entre macro_rules! e proc_macro?',
    options: [
      'São iguais',
      'macro_rules! é declarativo — pattern matching sobre tokens com regras (tipo regex para código). proc_macro é procedural — você escreve função Rust que recebe TokenStream e retorna TokenStream (via syn + quote), rodando no compilador. Derive, attribute e function-like são proc_macros',
      'proc_macro é mais simples',
      'macro_rules gera binding C',
    ],
    correct: 1,
    explanation: 'macro_rules! é match/replace: se o input casa com padrão X, expande para template Y. proc_macro é código Rust real rodando durante build — crate separada tipo "proc-macro", parseando com syn (AST), gerando com quote!. serde_derive, tokio::main, sqlx::query! são todos proc_macros.',
  },
  {
    question: 'O que significa "macro higiênica" em Rust?',
    options: [
      'Nada',
      'Identificadores criados dentro da macro não colidem com os do call-site. Se a macro declara `let x = 1` internamente, não interfere com um `x` do usuário. Rust é higiênico por default (diferente de C preprocessor), o que elimina toda uma classe de bugs',
      'Macro limpa memória',
      'Macro roda em sandbox',
    ],
    correct: 1,
    explanation: 'Hygiene é o que separa macro_rules! de #define em C. Em C, #define SWAP(a,b) { int t = a; a = b; b = t; } explode se o usuário tiver variável `t`. Em Rust, o identificador `t` dentro da macro é sintaticamente distinto do `t` do usuário. Isso torna macros seguras para compor.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="macros-rust"
      title="Macros declarativos e procedurais"
      icon="🪄"
      xp={55}
      readTime={13}
      trailName="Rust Profissional"
      trailColor={accent}
      nextSlug="unsafe-ffi-interop"
      nextTitle="Unsafe com responsabilidade + FFI"
      quiz={quiz}
    >
      <Section title="Duas famílias, dois propósitos" accent={accent}>
        <p>
          Rust tem dois sistemas de macro. <strong>macro_rules!</strong> é declarativo: pattern matching sobre tokens, ótimo para DSL leves (<code>vec!</code>, <code>println!</code>, <code>assert_eq!</code>). <strong>proc_macro</strong> é procedural: função Rust que roda no compilador transformando TokenStream — é como serde, tokio, sqlx geram código em cima de suas annotations.
        </p>
      </Section>

      <Section title="macro_rules!: pattern matching sobre tokens" accent={accent}>
        <CodeBlock lang="rust">{'// macro que cria um HashMap literal\nmacro_rules! hashmap {\n    ($($k:expr => $v:expr),* $(,)?) => {{\n        let mut m = std::collections::HashMap::new();\n        $( m.insert($k, $v); )*\n        m\n    }};\n}\n\nfn main() {\n    let users = hashmap! {\n        "fernando" => 33,\n        "ana"      => 28,\n    };\n    println!("{:?}", users);\n}'}</CodeBlock>
        <p>
          <code>$k:expr</code> é um fragmento — o parser sabe que ali entra uma expressão. <code>$(...)*</code> é repetição (zero ou mais). <code>$(,)?</code> permite trailing comma opcional. O body é template: <code>$( m.insert(...); )*</code> repete uma vez por match.
        </p>
      </Section>

      <Section title="Fragment specifiers úteis" accent={accent}>
        <CodeBlock lang="bash">{'expr   — expressão completa (1+2, foo(x), if cond { a } else { b })\nident  — identificador (x, my_var, MyStruct)\nty     — tipo (u32, Vec<String>, &str)\npat    — pattern (Some(x), _, Vec { .. })\nstmt   — statement (let x = 1;, foo();)\nblock  — { ... }\ntt     — token tree (qualquer grupo balanceado)\npath   — std::collections::HashMap\nliteral — 42, "foo", 3.14'}</CodeBlock>
      </Section>

      <Section title="proc_macro: Rust escrevendo Rust" accent={accent}>
        <p>
          proc_macro mora em uma crate separada (<code>[lib] proc-macro = true</code>) e roda no compilador durante build. Você recebe <code>TokenStream</code>, parseia com <strong>syn</strong>, manipula, gera com <strong>quote!</strong>, devolve <code>TokenStream</code>.
        </p>
        <CodeBlock lang="rust">{'// my_derive/src/lib.rs\nuse proc_macro::TokenStream;\nuse quote::quote;\nuse syn::{parse_macro_input, DeriveInput};\n\n#[proc_macro_derive(HelloName)]\npub fn hello_name_derive(input: TokenStream) -> TokenStream {\n    let ast = parse_macro_input!(input as DeriveInput);\n    let name = &ast.ident;\n    let gen = quote! {\n        impl #name {\n            pub fn hello() { println!("olá de {}!", stringify!(#name)); }\n        }\n    };\n    gen.into()\n}\n\n// uso no crate cliente\n// use my_derive::HelloName;\n// #[derive(HelloName)] struct Foo;\n// Foo::hello(); // "olá de Foo!"'}</CodeBlock>
      </Section>

      <Section title="Exemplo real: serde derive" accent={accent}>
        <CodeBlock lang="rust">{'use serde::{Serialize, Deserialize};\n\n#[derive(Serialize, Deserialize, Debug)]\nstruct User {\n    id: u64,\n    name: String,\n    #[serde(default)]\n    active: bool,\n}\n\nfn main() {\n    let u = User { id: 1, name: "Fernando".into(), active: true };\n    let json = serde_json::to_string(&u).unwrap();\n    println!("{}", json); // {"id":1,"name":"Fernando","active":true}\n\n    let parsed: User = serde_json::from_str(&json).unwrap();\n    println!("{:?}", parsed);\n}'}</CodeBlock>
        <p>
          <code>#[derive(Serialize)]</code> é um proc_macro que, em build-time, inspeciona campos do struct e gera a implementação de <code>fn serialize(&self, s: S)</code> com código específico para seu struct. Zero reflection runtime — só codegen estático.
        </p>
      </Section>

      <Section title="Três tipos de proc_macro" accent={accent}>
        <CodeBlock lang="rust">{'// 1. DERIVE: anexa código a struct/enum\n#[derive(Debug, Serialize)] struct S;\n\n// 2. ATTRIBUTE: substitui ou decora item\n#[tokio::main]\nasync fn main() { /* ... */ }  // expande para fn main() { runtime.block_on(async { ... }) }\n\n// 3. FUNCTION-LIKE: parece chamada, aceita sintaxe arbitrária\nsqlx::query!("SELECT id, name FROM users WHERE id = $1", user_id);\n// sqlx lê o SQL em COMPILE-TIME, valida contra schema real, gera struct tipada'}</CodeBlock>
      </Section>

      <Section title="Quando usar, quando não" accent={accent}>
        <Callout tone="success" icon="✅">
          Use macro quando: varargs reais (vec!, println!), eliminar boilerplate repetitivo (derive), DSL embutida (html!, query!), ou verificação em compile-time de string literal (sqlx::query! valida SQL contra DB real).
        </Callout>
        <Callout tone="warn" icon="⚠️">
          Evite macro quando: função + generics resolve, você só quer "evitar digitar" (copie-cole é mais legível que macro obscura), ou você não quer pagar o custo de erro de macro confuso para novatos no time.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
