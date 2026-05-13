import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('html-semantico-moderno');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que preferir <dialog> nativo a um modal em JS custom?',
    options: [
      'Estilo',
      'Porque dialog traz inert no background (bloqueia interação fora), focus trap automático, fechamento por Escape, atributo autofocus funcional e API showModal/close. Frameworks popularam MVPs de modal cheios de bugs de acessibilidade — o elemento nativo resolve sem dependência',
      'É mais rápido',
      'Nenhum motivo',
    ],
    correct: 1,
    explanation: 'Modal próprio era o maior reservatório de bugs de a11y em SPA: focus escape, Escape sem listener, scroll de fundo não bloqueado. <dialog> com showModal() resolve tudo. Suporte é total em 2025+. Custom modal só se vale por animação complexa — mesmo assim, estenda o elemento nativo.',
  },
  {
    question: 'O que é a Popover API e quando usar?',
    options: [
      'Só para tooltips',
      'Atributo popover + popovertarget (Chrome 114+, Safari 17+, Firefox 125+) cria tooltips, menus e flyouts nativos com top-layer positioning, light dismiss e API mostrar/esconder. Zero JS para dropdown de menu — e sem bibliotecas de positioning',
      'Substitui CSS',
      'Obsoleta',
    ],
    correct: 1,
    explanation: 'Popover API resolveu problema antigo de positioning em top-layer (anteriormente só <dialog> tinha). Junto com anchor positioning em CSS (Chrome 125+), tooltip/menu complexo vira HTML declarativo. Fallback progressivo: feature detect e renderizar versão JS só onde precisa.',
  },
  {
    question: 'Qual é a melhor validação de form em HTML moderno?',
    options: [
      'Só JS no submit',
      'Combinação: atributos nativos (required, type=email, pattern, minlength) para validação síncrona barata + JS com ValidationMessage customizada (setCustomValidity) + CSS :user-invalid/:user-valid para estilo só após interação. Erro comum: ligar JS completo ignorando validação nativa',
      'Bibliotecas sempre',
      'Nenhuma valida',
    ],
    correct: 1,
    explanation: 'Forms modernos em 2026 usam nativo por default e estendem. :user-invalid (vs :invalid antigo) só aplica depois que usuário interagiu — evita "campo em vermelho antes de digitar". setCustomValidity dá mensagens localizadas. Isso elimina 70% do código de biblioteca de form.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="html-semantico-moderno"
      title="HTML semântico moderno (2026)"
      icon="📄"
      xp={45}
      readTime={11}
      trailName="Frontend Moderno — HTML, CSS, JS e React"
      trailColor={accent}
      nextSlug="css-layout-moderno"
      nextTitle="CSS layout: Grid, Flexbox, Subgrid, Container queries"
      quiz={quiz}
    >
      <Section title="HTML voltou a ser estratégico" accent={accent}>
        <p>
          Durante a era peak-SPA, HTML virou "div em cima de div" gerada por framework. Em 2026, com a plataforma entregando <code>&lt;dialog&gt;</code>, popover API, invoker commands, :has(), view transitions e anchor positioning, HTML bem escrito resolve features que antes exigiam 50kb de JS. Dominar HTML moderno é alavanca: menos código, mais a11y, zero dependência.
        </p>
      </Section>

      <Section title="Landmarks e heading hierarchy" accent={accent}>
        <p>
          Leitor de tela navega por landmarks (<code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;aside&gt;</code>, <code>&lt;footer&gt;</code>) e headings. Cada página tem exatamente um <code>&lt;h1&gt;</code>, e a hierarquia não pula níveis.
        </p>
        <CodeBlock lang="html">{`<body>
  <header>
    <nav aria-label="Principal">
      <ul>
        <li><a href="/">Início</a></li>
        <li><a href="/blog">Blog</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <h1>Título da página (único na rota)</h1>
    <article>
      <h2>Seção</h2>
      <h3>Subseção</h3>
    </article>
  </main>

  <aside aria-label="Barra lateral">...</aside>
  <footer>...</footer>
</body>`}</CodeBlock>
      </Section>

      <Section title="Dialog nativo: o fim dos modais com bug" accent={accent}>
        <CodeBlock lang="html">{`<dialog id="confirmar">
  <form method="dialog">
    <h2>Confirmar exclusão?</h2>
    <p>Essa ação não pode ser desfeita.</p>
    <menu>
      <button value="cancel">Cancelar</button>
      <button value="confirm" autofocus>Excluir</button>
    </menu>
  </form>
</dialog>

<button onclick="document.getElementById('confirmar').showModal()">
  Excluir conta
</button>

<script>
  const dlg = document.getElementById('confirmar');
  dlg.addEventListener('close', () => {
    if (dlg.returnValue === 'confirm') doDelete();
  });
</script>`}</CodeBlock>
        <Callout tone="info" icon="💡">
          <code>showModal()</code> aplica <code>inert</code> ao resto da página automaticamente, faz focus trap e fecha com Escape. <code>method=&quot;dialog&quot;</code> dentro do form fecha o dialog retornando o <code>value</code> do botão clicado.
        </Callout>
      </Section>

      <Section title="Popover API: menus e tooltips sem JS pesado" accent={accent}>
        <CodeBlock lang="html">{`<button popovertarget="menu-user">Minha conta</button>

<div id="menu-user" popover>
  <ul>
    <li><a href="/perfil">Perfil</a></li>
    <li><a href="/preferencias">Preferências</a></li>
    <li><button popovertarget="menu-user" popovertargetaction="hide">
      Sair do menu
    </button></li>
  </ul>
</div>

<!-- Anchor positioning (Chrome 125+) para posicionar relativo ao botão -->
<style>
  #menu-user { position-anchor: --btn; top: anchor(bottom); }
</style>`}</CodeBlock>
      </Section>

      <Section title="Details/summary: acordeão sem JS" accent={accent}>
        <CodeBlock lang="html">{`<details>
  <summary>Qual a política de reembolso?</summary>
  <p>Até 7 dias após a compra...</p>
</details>

<details name="faq">
  <summary>Pergunta A</summary>
  <p>Resposta A</p>
</details>
<details name="faq">
  <summary>Pergunta B</summary>
  <p>Resposta B</p>
</details>
<!-- name="faq" torna o grupo exclusivo (abrir um fecha os outros) -->`}</CodeBlock>
      </Section>

      <Section title="Form constraints nativos + CSS moderno" accent={accent}>
        <CodeBlock lang="html">{`<form>
  <label>
    Email
    <input type="email" name="email" required autocomplete="email" />
  </label>

  <label>
    Senha
    <input type="password" name="senha" required minlength="8"
           pattern="^(?=.*[A-Z])(?=.*\\d).+$"
           title="Ao menos 1 maiúscula e 1 número" />
  </label>

  <button type="submit">Entrar</button>
</form>

<style>
  /* :user-invalid só depois de interação — evita vermelho antes de digitar */
  input:user-invalid { border-color: crimson; }
  input:user-valid { border-color: seagreen; }
</style>`}</CodeBlock>
      </Section>

      <Section title="Invoker commands (2024+): declarativo de verdade" accent={accent}>
        <p>
          Proposta recém-estabilizada (Chrome 130+) que permite botões invocarem comandos em elementos alvo sem JS. Ideal para toggles simples.
        </p>
        <CodeBlock lang="html">{`<button command="show-modal" commandfor="dlg">Abrir</button>
<button command="close" commandfor="dlg">Fechar</button>

<dialog id="dlg">
  <p>Conteúdo</p>
</dialog>

<!-- Com fallback JS para browsers antigos -->
<script>
  if (!HTMLButtonElement.prototype.hasOwnProperty('command')) {
    // polyfill simples
    document.querySelectorAll('[command]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.getAttribute('commandfor'));
        if (btn.getAttribute('command') === 'show-modal') target.showModal();
        if (btn.getAttribute('command') === 'close') target.close();
      });
    });
  }
</script>`}</CodeBlock>
      </Section>

      <Section title="Atributos esquecidos que valem ouro" accent={accent}>
        <CodeBlock lang="html">{`<!-- loading lazy em imagens fora do fold -->
<img src="grafico.png" alt="..." loading="lazy" decoding="async" />

<!-- fetchpriority pra hero image (LCP) -->
<img src="hero.jpg" alt="..." fetchpriority="high" />

<!-- enterkeyhint define teclado mobile do botão submit -->
<input type="search" enterkeyhint="search" />

<!-- inputmode otimiza teclado (numeric, decimal, tel, email, url) -->
<input inputmode="decimal" />

<!-- spellcheck desliga em campos de código/username -->
<input type="text" spellcheck="false" autocapitalize="off" />`}</CodeBlock>
      </Section>

      <Section title="Fechamento" accent={accent}>
        <Callout tone="success" icon="✅">
          HTML moderno resolve hoje o que exigia biblioteca ontem. <code>&lt;dialog&gt;</code>, popover, details com <code>name</code>, invoker commands e validação nativa substituem milhares de linhas de JS. Domine HTML antes de sair importando pacote de "accessible modal" — quase sempre o problema é código custom piorando o que a plataforma já faz.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
