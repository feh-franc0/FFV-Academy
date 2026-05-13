import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('raii-smart-pointers');
const accent = '#0369a1';

const quiz: QuizQuestion[] = [
  {
    question: 'O que RAII resolve que C manual não resolve?',
    options: [
      'Só sintaxe',
      'Ligar lifetime de recurso a lifetime de objeto no stack: construtor adquire, destrutor libera, automaticamente em todo caminho de saída (return, throw, break). Elimina classe inteira de leaks. É o mecanismo-chave do C++ moderno',
      'Performance',
      'Threading',
    ],
    correct: 1,
    explanation: 'Em C você precisa fazer cleanup em cada return e em cada erro — fácil esquecer. Em C++, std::unique_ptr no stack garante destrutor rodando mesmo em exception. RAII generaliza para qualquer recurso: arquivo, mutex, socket, conexão DB. É exception safety e clareza em um só mecanismo.',
  },
  {
    question: 'Quando usar shared_ptr em vez de unique_ptr?',
    options: [
      'Sempre shared_ptr',
      'Raramente: apenas quando há ownership genuinamente compartilhado (grafo de objetos com dono incerto, cache com ownership). Custo: atomic refcount em cada copy/move. unique_ptr é default moderno — 99% dos casos têm dono único claro',
      'Nunca',
      'Só em multi-thread',
    ],
    correct: 1,
    explanation: 'shared_ptr sinaliza "ownership ambíguo" — geralmente sinal de design mal pensado. Prefira unique_ptr com transferência de ownership explícita via std::move. shared_ptr tem custo: atomic fetch_add/sub em cada copy, cache miss no control block. Use quando necessidade for real (observer callbacks, cycle-breaking com weak_ptr).',
  },
  {
    question: 'O que é Rule of 0 em C++ moderno?',
    options: [
      'Nunca escreva código',
      'Se sua classe usa apenas membros RAII (unique_ptr, vector, string), não escreva nenhum dos 5 special members — o compilador gera corretamente. Rule of 5 só quando você gerencia recurso manual. Default moderno é Rule of 0',
      'Zero testes',
      'Zero warnings',
    ],
    correct: 1,
    explanation: 'Antes: "escreveu destructor? Escreva os 5 (copy ctor/assign, move ctor/assign, destructor)". C++11+ com smart pointers e containers: não escreva nenhum. O compilador gera moves/copies que apenas propagam para os membros RAII, que já fazem a coisa certa. Classe fica 5-10 linhas em vez de 50.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="raii-smart-pointers"
      title="RAII e smart pointers: o fundamento C++ moderno"
      icon="🔒"
      xp={55}
      readTime={13}
      trailName="C++ Moderno (C++20/23)"
      trailColor={accent}
      nextSlug="move-semantics-rvalue"
      nextTitle="Move semantics e rvalue references"
      quiz={quiz}
    >
      <Section title="RAII em uma frase" accent={accent}>
        <p>
          Resource Acquisition Is Initialization: todo recurso é encapsulado num objeto cujo construtor adquire e cujo destrutor libera. O stack unwinding garante liberação automática em qualquer caminho de saída — inclusive exceção.
        </p>
        <CodeBlock lang="cpp">{`#include <fstream>

void write_log(const std::string& msg) {
    std::ofstream f("app.log", std::ios::app);
    f << msg << '\\n';
    // destrutor fecha e flush automaticamente ao sair do escopo,
    // mesmo se msg lançar, mesmo se f << lançar
}`}</CodeBlock>
      </Section>

      <Section title="unique_ptr: ownership único" accent={accent}>
        <CodeBlock lang="cpp">{`#include <memory>

struct Sensor { /* ... */ };

std::unique_ptr<Sensor> make_sensor() {
    return std::make_unique<Sensor>();  // zero overhead vs new
}

void use() {
    auto s = make_sensor();              // move-transfer
    // ... s.get(), s->method() ...
}   // destrutor libera automaticamente`}</CodeBlock>
        <p>
          <code>unique_ptr</code> é zero-cost: tamanho do ptr cru, sem refcount. Transferência de ownership via move — <code>std::move(up)</code> entrega posse e deixa origem vazia.
        </p>
      </Section>

      <Section title="shared_ptr: ownership compartilhado" accent={accent}>
        <CodeBlock lang="cpp">{`auto cfg = std::make_shared<Config>();
worker_a.set_config(cfg);
worker_b.set_config(cfg);
// refcount = 3; libera quando último sai`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          shared_ptr paga preço: control block heap-allocado, atomic refcount, 2x ptr size. Use quando ownership compartilhado é intencional — não como muleta.
        </Callout>
      </Section>

      <Section title="weak_ptr: observador sem ownership" accent={accent}>
        <p>
          Quebra ciclos. Caso clássico: <code>Parent</code> tem <code>shared_ptr&lt;Child&gt;</code>, <code>Child</code> precisa referenciar <code>Parent</code> sem estender sua vida. Usa <code>weak_ptr&lt;Parent&gt;</code>, promote para shared apenas quando for usar.
        </p>
        <CodeBlock lang="cpp">{`std::weak_ptr<Parent> w = p_shared;
if (auto p = w.lock()) {     // tentativa de promote
    p->do_something();
} else {
    // parent já morreu
}`}</CodeBlock>
      </Section>

      <Section title="Raw pointer: apenas para non-owning view" accent={accent}>
        <p>
          Em C++ moderno, <code>T*</code> significa "observo, não possuo". Se função aceita <code>T*</code>, não deve chamar delete. Para "pode ser null", use <code>T*</code>. Para "nunca null, non-owning", use <code>T&amp;</code>.
        </p>
      </Section>

      <Section title="Rule of 5 → Rule of 0" accent={accent}>
        <CodeBlock lang="cpp">{`// ❌ Rule of 5 legacy: escrevendo tudo manual
class Buffer {
    char *data_;
    size_t n_;
public:
    Buffer(size_t n);
    ~Buffer();
    Buffer(const Buffer&);
    Buffer& operator=(const Buffer&);
    Buffer(Buffer&&) noexcept;
    Buffer& operator=(Buffer&&) noexcept;
};

// ✅ Rule of 0 moderno: composição com RAII
class Buffer {
    std::unique_ptr<char[]> data_;
    size_t n_;
public:
    Buffer(size_t n)
        : data_(std::make_unique<char[]>(n)), n_(n) {}
    // compilador gera move corretamente, copy é deletado por unique_ptr
};`}</CodeBlock>
      </Section>

      <Section title="Checklist" accent={accent}>
        <Callout tone="success" icon="✅">
          (1) Zero <code>new</code> e <code>delete</code> à vista. (2) <code>make_unique</code>/<code>make_shared</code> por default. (3) Membros são smart pointers ou containers padrão. (4) Se escreveu destructor, justifique — Rule of 0 é default.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
