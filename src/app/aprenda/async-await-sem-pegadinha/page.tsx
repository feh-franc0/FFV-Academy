import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('async-await-sem-pegadinha');

const accent = '#3178c6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre `Promise.all` e `Promise.allSettled`?',
    options: [
      'Nenhuma, são sinônimos',
      'Promise.all rejeita assim que qualquer promise falhar (fail-fast). Promise.allSettled aguarda TODAS e retorna array de {status, value/reason}',
      'allSettled é mais rápido',
      'all só aceita 2 promises',
    ],
    correct: 1,
    explanation: 'Fail-fast vs wait-all. Use Promise.all quando todas precisam suceder pra continuar (cancele as outras se uma falhar). Use allSettled quando você quer o resultado de cada uma independentemente (ex: health check de múltiplos serviços — quer saber qual caiu).',
  },
  {
    question: 'Para que serve AbortController em fetch?',
    options: [
      'Desabilitar fetch permanentemente',
      'Cancelar uma requisição em andamento — útil em cleanup de effect, navegação, timeout manual',
      'Substituir fetch por XMLHttpRequest',
      'Compactar payload',
    ],
    correct: 1,
    explanation: 'AbortController cria um signal. Você passa signal pra fetch/setTimeout/readers e, quando chama controller.abort(), a operação é cancelada e rejeita com AbortError. Essencial em React (cleanup), navegação (rota mudou), timeouts configuráveis.',
  },
  {
    question: 'O que acontece com erros em `.then()` SEM `.catch()`?',
    options: [
      'São logados no console automaticamente',
      'Viram unhandledRejection — podem ser silenciosos em navegador antigo ou crash no Node recente',
      'São capturados pelo try/catch externo',
      'Aparecem como string no resultado',
    ],
    correct: 1,
    explanation: 'Erros sem catch viram "unhandled rejection". Node mata o processo desde 15+ (default). Navegador mostra no console mas é silencioso pra usuário. Sempre encerre chains com .catch() ou use await dentro de try/catch.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="async-await-sem-pegadinha"
      title="Async/await sem pegadinha: promises, AbortController e cancelamento"
      icon="⏳"
      xp={50}
      readTime={12}
      trailName="TypeScript Profissional"
      trailColor={accent}
      nextSlug="erros-como-valores"
      nextTitle="Erros como valores: Result, neverthrow e por que `throw` quebra"
      quiz={quiz}
    >
      <Section title="Promise é um valor, não uma função" accent={accent}>
        <p>
          A maior confusão: devs tratam Promise como &quot;callback melhorado&quot;. Na verdade, é um <strong>valor</strong> que representa um resultado futuro. Esse valor pode estar em 3 estados: pending, fulfilled, rejected.
        </p>
        <CodeBlock lang="typescript">{`// Promise é um valor
const p: Promise<number> = fetchData();
// p existe agora mesmo; o número virá depois

// async wrappa função em Promise automaticamente
async function fetchData(): Promise<number> {
  const res = await fetch('/api');  // await "desempacota" a Promise
  return res.json();
}`}</CodeBlock>
      </Section>

      <Section title="Paralelismo: Promise.all vs sequência" accent={accent}>
        <CodeBlock lang="typescript">{`// ❌ Sequencial (300ms + 300ms = 600ms total)
const a = await fetch('/api/a');
const b = await fetch('/api/b');

// ✅ Paralelo (300ms total)
const [a, b] = await Promise.all([
  fetch('/api/a'),
  fetch('/api/b'),
]);

// Quando pode falhar e você quer saber qual:
const results = await Promise.allSettled([
  fetch('/api/slow'),
  fetch('/api/maybe-down'),
]);
// results: [{status: 'fulfilled', value}, {status: 'rejected', reason}]`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Regra prática: se os awaits <em>não dependem um do outro</em>, use Promise.all. Dev sênior faz isso por instinto; júnior sofre latência desnecessária.
        </Callout>
      </Section>

      <Section title="AbortController: cancelamento de verdade" accent={accent}>
        <CodeBlock lang="typescript">{`// Em um React effect:
useEffect(() => {
  const controller = new AbortController();
  fetch('/api/users', { signal: controller.signal })
    .then(r => r.json())
    .then(setUsers)
    .catch(err => {
      if (err.name === 'AbortError') return; // esperado
      console.error(err);
    });
  return () => controller.abort(); // cleanup: cancela fetch
}, []);

// Timeout manual:
const controller = new AbortController();
const id = setTimeout(() => controller.abort(), 5000);
try {
  const res = await fetch(url, { signal: controller.signal });
  clearTimeout(id);
  return res;
} catch (err) { /* ... */ }`}</CodeBlock>
      </Section>

      <Section title="Armadilhas comuns" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>forEach com async:</strong> <InlineCode>[...].forEach(async x =&gt; await ...)</InlineCode> NÃO espera. Use <InlineCode>for (const x of ...) {'{'} await {'}'}</InlineCode> ou <InlineCode>Promise.all(arr.map(...))</InlineCode>.</li>
          <li><strong>Double await:</strong> <InlineCode>await await p</InlineCode> é legal mas desnecessário (await já desempacota uma vez).</li>
          <li><strong>Esquecer await:</strong> <InlineCode>p.then(...)</InlineCode> fora de async retorna Promise e continua sem esperar. TS avisa se você ligar <InlineCode>no-floating-promises</InlineCode>.</li>
          <li><strong>setTimeout async:</strong> <InlineCode>setTimeout(async () =&gt; ..., 0)</InlineCode> o callback retorna Promise que ninguém aguarda. Erros viram unhandled.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
