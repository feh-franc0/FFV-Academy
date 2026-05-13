import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('react-server-components');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença essencial entre Server Component e Client Component?',
    options: [
      'Nome',
      'Server Component roda só no servidor, pode ser async (fetch direto no componente), acessa filesystem/DB, NÃO envia JS para o cliente, NÃO tem estado nem handlers. Client Component ("use client") roda no servidor (para HTML inicial) E no cliente, pode ter estado/effects/handlers. SC é default no App Router',
      'Só roteamento',
      'SC é lib externa',
    ],
    correct: 1,
    explanation: 'SC e CC são primitivas diferentes. SC = lógica de dados + UI estática, zero JS shipping. CC = interatividade, roda nos dois lados. Componente que só exibe dados pode (e deve) ser SC. Apenas partes que precisam de useState/onClick/useEffect viram "use client". Bundle menor, TTFB melhor.',
  },
  {
    question: 'O que Server Actions entregam?',
    options: [
      'Nada novo',
      'Funções async marcadas "use server" que podem ser chamadas do cliente como se fossem locais, mas executam no servidor. Usadas em <form action={myAction}> ou chamadas diretas. Fazem mutação, revalidam cache, retornam dados — substituem grande parte dos endpoints REST em apps internos',
      'Só estilo',
      'Só Websocket',
    ],
    correct: 1,
    explanation: 'Server Actions eliminam boilerplate de API route para a maioria das mutações. <form action={createOrder}> invoca função server diretamente, progressive enhancement funciona (form funciona sem JS), e TypeScript dá tipagem end-to-end. Para endpoints públicos ou integrations externas, ainda há Route Handlers.',
  },
  {
    question: 'Quando "use client" deve ser minimizado?',
    options: [
      'Nunca',
      'Sempre. Cada boundary "use client" marca tudo dentro como Client Component (todo o JS vai para o bundle). Padrão: mantenha "use client" no componente mais profundo que precisa de interatividade e passe dados por props de SC acima. Idealmente, layout e página ficam Server; só ilhas interativas são Client',
      'Não importa',
      'Quando estiver em /client',
    ],
    correct: 1,
    explanation: 'Arquitetura "ilhas" é o padrão RSC. O que pode ser SC deve ser SC — menos JS shipping, mais cache friendly, dados direto. "use client" vai o mais profundo possível. Erro comum: por "use client" no topo do layout e transformar toda a página em client bundle, perdendo benefícios de SC.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="react-server-components"
      title="React Server Components e Actions (2026)"
      icon="🌐"
      xp={65}
      readTime={15}
      trailName="Frontend Moderno — HTML, CSS, JS e React"
      trailColor={accent}
      nextSlug="core-web-vitals-perf"
      nextTitle="Core Web Vitals e performance budget"
      quiz={quiz}
    >
      <Section title="RSC mudou o modelo mental" accent={accent}>
        <p>
          Até ~2022, React era modelo single-env: tudo rodava no cliente (SPA) ou hidratação de HTML pré-renderizado (Next.js Pages). Server Components (stable em 2023 com Next.js App Router) introduziram um segundo tipo de componente que roda exclusivamente no servidor e nunca envia JS para o cliente. O modelo mental precisa ser atualizado para aproveitar.
        </p>
      </Section>

      <Section title="Server Component: async + zero JS cliente" accent={accent}>
        <CodeBlock lang="tsx">{`// app/orders/page.tsx — Server Component por default
// Pode ser async, faz fetch direto, zero bundle cliente
import { getOrders } from '@/lib/db';

export default async function OrdersPage() {
  const orders = await getOrders({ userId: getSessionUserId() });

  return (
    <section>
      <h1>Meus pedidos</h1>
      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            <a href={'/orders/' + o.id}>{o.title}</a>
            <span>{o.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Características:
// - await no corpo: sim
// - useState / useEffect: NÃO (não é componente de runtime do browser)
// - onClick: NÃO (sem handlers em SC)
// - access a DB, filesystem, env secrets: SIM
// - bundle shipped: ZERO`}</CodeBlock>
      </Section>

      <Section title="Client Component: ilha de interatividade" accent={accent}>
        <CodeBlock lang="tsx">{`'use client';

import { useState } from 'react';

export function QuantityInput({ initial }: { initial: number }) {
  const [qty, setQty] = useState(initial);

  return (
    <div>
      <button onClick={() => setQty((q) => Math.max(0, q - 1))}>−</button>
      <output>{qty}</output>
      <button onClick={() => setQty((q) => q + 1)}>+</button>
    </div>
  );
}

// Diretiva "use client" no topo marca o arquivo como Client Component.
// Tudo importado dele também vira Client (transitively).
// Por isso queremos a diretiva o mais profundo possível.`}</CodeBlock>
      </Section>

      <Section title="Padrão: Server compõe, Client interage" accent={accent}>
        <CodeBlock lang="tsx">{`// ProductPage.tsx — Server Component
import { getProduct } from '@/lib/db';
import { QuantityInput } from './QuantityInput'; // "use client"
import { AddToCartButton } from './AddToCartButton'; // "use client"

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id); // roda no servidor

  return (
    <article>
      <h1>{product.name}</h1>
      <p>{product.description}</p>

      {/* Ilhas interativas; resto é Server, sem JS */}
      <QuantityInput initial={1} />
      <AddToCartButton productId={product.id} />
    </article>
  );
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Regra prática: layout e shells são Server. Formulários, inputs, modais e áreas interativas são Client. Se você está passando functions como props para um Client Component, separe a lógica — props de SC → CC só suportam dados serializáveis e Server Actions.
        </Callout>
      </Section>

      <Section title="Server Actions: mutação sem API route" accent={accent}>
        <CodeBlock lang="tsx">{`// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { z } from 'zod';

const CreateOrderSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

export async function createOrder(formData: FormData) {
  const parsed = CreateOrderSchema.safeParse({
    productId: formData.get('productId'),
    quantity: Number(formData.get('quantity')),
  });
  if (!parsed.success) return { error: 'invalid_input' };

  const order = await db.orders.create({ data: parsed.data });
  revalidatePath('/orders');
  return { ok: true, orderId: order.id };
}

// app/product/[id]/page.tsx — Server Component usando action
import { createOrder } from '@/app/actions';

export default async function ProductPage({ params }) {
  return (
    <form action={createOrder}>
      <input type="hidden" name="productId" value={params.id} />
      <input type="number" name="quantity" defaultValue={1} min={1} />
      <button type="submit">Comprar</button>
    </form>
  );
}
// Progressive enhancement: funciona sem JS (form submit clássico).
// Com JS, Next.js intercepta e faz fetch otimizado.`}</CodeBlock>
      </Section>

      <Section title="useActionState e useOptimistic" accent={accent}>
        <CodeBlock lang="tsx">{`'use client';
import { useActionState, useOptimistic } from 'react';
import { toggleLike } from './actions';

export function LikeButton({ postId, liked, count }: Props) {
  const [optimistic, addOptimistic] = useOptimistic(
    { liked, count },
    (state, next: { liked: boolean }) => ({
      liked: next.liked,
      count: state.count + (next.liked ? 1 : -1),
    }),
  );

  return (
    <form action={async (fd) => {
      addOptimistic({ liked: !optimistic.liked });
      await toggleLike(postId);
    }}>
      <button>
        {optimistic.liked ? '❤' : '♡'} {optimistic.count}
      </button>
    </form>
  );
}`}</CodeBlock>
      </Section>

      <Section title="Streaming com Suspense" accent={accent}>
        <CodeBlock lang="tsx">{`// Partes da página renderizam assim que prontas
import { Suspense } from 'react';

export default async function DashboardPage() {
  // Dados críticos acima do fold — await direto
  const user = await getUser();

  return (
    <>
      <Header user={user} />

      {/* Partes mais lentas: Suspense com fallback */}
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersList />
      </Suspense>

      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsChart />
      </Suspense>
    </>
  );
}

async function OrdersList() {
  const orders = await slowFetchOrders(); // só este await espera
  return <ul>{orders.map((o) => <li key={o.id}>{o.title}</li>)}</ul>;
}`}</CodeBlock>
      </Section>

      <Section title="Armadilhas comuns" accent={accent}>
        <CodeBlock lang="markdown">{`1. **"use client" no topo do layout**
   → todo o app vira client bundle. Ponha só em ilhas.

2. **Passar função como prop de SC para CC**
   → não serializável. Solução: Server Action + prop de Action.

3. **Esperar useEffect/onClick em SC**
   → SC roda no servidor. Se precisa, extraia Client Component.

4. **Confiar em revalidatePath sem pensar em cache**
   → App Router tem 4 tipos de cache. Ler a doc é pré-requisito.

5. **Secrets em Client Component**
   → tudo em "use client" vai para o browser. Nunca acesse process.env.DB_URL em CC.`}</CodeBlock>
      </Section>

      <Section title="Síntese" accent={accent}>
        <Callout tone="success" icon="✅">
          Server Component é o default: zero JS, fetch direto, rápido. Client Component é ilha de interatividade, "use client" no ponto mais profundo possível. Server Actions substituem boilerplate de API route na maioria de mutações. Suspense entrega streaming incremental. Essa arquitetura bate quase toda SPA em TTFB, bundle e experiência — quando bem aplicada.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
