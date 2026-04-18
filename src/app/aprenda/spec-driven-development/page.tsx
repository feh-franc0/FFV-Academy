import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  QAItem,
  KeyValue,
  StackFlow,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('spec-driven-development');

const ACCENT = '#e3b341';

const quiz: QuizQuestion[] = [
  {
    question:
      'Qual é a diferença central entre uma spec no SDD e um PRD tradicional?',
    options: [
      'Nenhuma',
      'A spec no SDD é operável por agent: estruturada, com critérios de aceite testáveis, exemplos de uso concretos e restrições técnicas — agent e humano extraem código e testes dela diretamente. PRD é documento de produto, geralmente prosa, não operável',
      'Spec é mais curta',
      'PRD é obsoleto',
    ],
    correct: 1,
    explanation:
      'PRD descreve o que o produto faz para stakeholders. Spec no SDD é um contrato executável: objetivos, requisitos funcionais numerados, critérios de aceite que viram teste, exemplos de input/output, restrições. Ela alimenta humano e agent igual.',
  },
  {
    question:
      'Por que escrever critérios de aceite ANTES do código é o coração do SDD?',
    options: [
      'Por tradição',
      'Eles viram suite de teste. Agent implementa até os critérios passarem; humano revisa com base neles. Sem critérios, "pronto" vira opinião e bug passa silencioso',
      'Para impressionar o gerente',
      'Para alongar o documento',
    ],
    correct: 1,
    explanation:
      'Critérios no formato Given/When/Then (ou cenários numerados com input/output) dão definição operável de "pronto". Agent sabe quando parar; reviewer sabe o que validar; QA sabe o que testar. Sem isso, você tem intenção vaga e retrabalho.',
  },
  {
    question:
      'Como SDD lida com o problema de "agent implementa coisa que eu não pedi"?',
    options: [
      'Ignora',
      'Com seção de "não-objetivos" explícita na spec + critérios de aceite fechados. Agent deve mudar o mínimo para passar os critérios e não expandir escopo. Em review, código fora da spec é rejeitado',
      'Apenas por humor',
      'Confia no modelo',
    ],
    correct: 1,
    explanation:
      'A seção "Non-goals / Out of scope" é tão importante quanto os objetivos. Bate de frente com instinto do agent de "enquanto estou aqui, vou refatorar isso aqui também". Regra em review: se não está na spec, é rejeitado ou volta como spec nova.',
  },
  {
    question:
      'Qual artefato SEMPRE acompanha uma spec profissional?',
    options: [
      'Logotipo',
      'Plano de teste (como vamos validar que os critérios foram atendidos): unit + integração + edge cases + rollback. Sem plano de teste, a spec é wishful thinking',
      'Diagrama de Gantt',
      'Apresentação em PowerPoint',
    ],
    correct: 1,
    explanation:
      'Uma spec sem plano de teste assumido é spec incompleta. Boa spec diz: "validamos assim: N casos de teste cobrindo estes cenários; integração contra staging; rollback em X minutos se métrica Y cair". Isso evita ship sem rede.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="spec-driven-development"
      title="Spec-Driven Development (SDD): a nova espinha dorsal"
      icon="📜"
      xp={85}
      readTime={18}
      trailName="Engenharia de Software Moderna"
      trailColor={ACCENT}
      nextSlug="gerenciando-agents-ia"
      nextTitle="Gerenciando Agents: orquestração, contexto e custo"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        <strong>Spec-Driven Development (SDD)</strong> é o método que substitui &ldquo;abrir editor e começar a codar&rdquo; por
        &ldquo;escrever uma spec curta e executável, e só então codar (ou delegar pro agent)&rdquo;. Funciona porque: (1) reduz
        ambiguidade antes do código, onde é barato; (2) vira oráculo de teste; (3) dá ao agent o contexto mínimo necessário pra
        gerar código que não precisa reescrever em review. SDD não é waterfall disfarçado — é ciclo curto: spec pequena → código
        → feedback → iteração.
      </p>

      <Section title="SDD em 1 imagem" accent={ACCENT}>
        <StackFlow
          accent={ACCENT}
          title="O ciclo SDD"
          items={[
            { icon: '💡', label: 'Intenção bruta', sub: '0', detail: 'Ticket, conversa, insight de negócio. Ambíguo por padrão.', connector: 'destila' },
            { icon: '📜', label: 'Spec (markdown)', sub: '1', detail: 'Objetivo, requisitos numerados, critérios de aceite, não-objetivos, exemplos, riscos, plano de teste.', connector: 'vira' },
            { icon: '🧠', label: 'Plano técnico', sub: '2', detail: 'Arquivos afetados, tarefas, dependências, rollback. Derivado da spec.', connector: 'delega' },
            { icon: '🤖', label: 'Agent implementa', sub: '3', detail: 'Consumindo spec + plano + contexto do repo. Produz código e testes.', connector: 'valida' },
            { icon: '🧪', label: 'Testes automatizados', sub: '4', detail: 'Derivados dos critérios de aceite. Falha = volta pro agent.', connector: 'revisa' },
            { icon: '🔍', label: 'Review humano', sub: '5', detail: 'Olho crítico: invariante, performance, segurança, design. Rejeita ou aceita.', connector: 'merge' },
            { icon: '📊', label: 'Observa em prod', sub: '6', detail: 'SLO, logs, métricas. Se fora do spec: volta pro ciclo.' },
          ]}
        />
      </Section>

      <Section title="Anatomia de uma spec profissional" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Uma boa spec cabe em 1-3 páginas. Se passa disso, decomponha em várias specs menores. Seções obrigatórias:
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: '1. Contexto', v: 'Por que estamos construindo isso? Qual problema resolve? Qual usuário?' },
            { k: '2. Objetivos', v: 'Resultados esperados em frases numeradas e verificáveis.' },
            { k: '3. Não-objetivos', v: 'O que explicitamente NÃO faz parte. Freia o agent e o reviewer.' },
            { k: '4. Requisitos funcionais', v: 'Lista numerada: R1, R2... cada um uma frase, testável.' },
            { k: '5. Critérios de aceite', v: 'Given/When/Then ou cenários com input/output esperados.' },
            { k: '6. Restrições', v: 'Performance, compatibilidade, custo, segurança, stack.' },
            { k: '7. Exemplos concretos', v: 'Input real, output real. 3-5 exemplos cobrindo golden path + edge.' },
            { k: '8. Riscos & mitigações', v: 'O que pode dar errado, probabilidade e plano B.' },
            { k: '9. Plano de teste', v: 'Como validar. Unit/integração/E2E/manual. Quem testa.' },
            { k: '10. Plano de rollback', v: 'Como reverter se falhar em produção. Métrica-gatilho.' },
          ]}
        />
      </Section>

      <Section title="Template pronto (copie e cole)" accent={ACCENT}>
        <CodeBlock lang="markdown">{`# Spec: <nome curto da feature>

**Owner:** @fernando · **Status:** draft · **Data:** 2026-04-16 · **Review by:** 2026-04-19

## 1. Contexto
Em 2-3 frases: qual o problema, quem sofre, qual a oportunidade.
Exemplo: "Hoje quando um pagamento falha por erro transitório do PSP, o
usuário clica 'pagar' 3x e gera 3 cobranças. Precisamos de idempotência
na camada de checkout."

## 2. Objetivos
O1. Garantir que dois POST /payments com mesma idempotency-key em
    janela de 24h retornem sempre a mesma resposta (idempotente).
O2. Expor a chave no header da resposta para debugging.

## 3. Não-objetivos
- NÃO vamos implementar retry automático (fica com o cliente).
- NÃO muda o contrato atual da API (backward compatible).

## 4. Requisitos funcionais
R1. Header 'Idempotency-Key' obrigatório em POST /payments.
R2. Chave persistida em payments.idempotency_key (índice único).
R3. Segunda chamada com mesma chave retorna a resposta original.
R4. Expira em 24h (row deletada).
R5. Chaves inválidas (<16 ou >64 chars) retornam 400.

## 5. Critérios de aceite
CA1. GIVEN uma chave nova
     WHEN POST /payments
     THEN cria pagamento, responde 201, header X-Idempotency-Key.
CA2. GIVEN uma chave já vista há 1h
     WHEN POST /payments (mesmo body)
     THEN devolve 200 e MESMA resposta (sem criar outro).
CA3. GIVEN uma chave já vista há 25h
     WHEN POST /payments
     THEN trata como chave nova.
CA4. GIVEN uma chave com 5 caracteres
     WHEN POST /payments
     THEN responde 400 com código 'invalid_idempotency_key'.
CA5. GIVEN 100 requests paralelos com mesma chave
     WHEN concorrência alta
     THEN só 1 pagamento é criado (teste de race).

## 6. Restrições
- Stack: Node 20 + Fastify + Postgres 15.
- Latência: <5ms de overhead por request (p99).
- Segurança: chave não deve vazar em logs.

## 7. Exemplos
POST /payments  Idempotency-Key: abc-123
Body: { amount: 1000, currency: "BRL" }
Resposta 201: { id: "pay_01", status: "paid", ... }

POST /payments  Idempotency-Key: abc-123  (10 min depois)
Body: { amount: 1000, currency: "BRL" }
Resposta 200: { id: "pay_01", status: "paid", ... }  (MESMO id)

## 8. Riscos & mitigações
- Race condition (2 req paralelas): lock com INSERT unique + retry de leitura.
- Chave com body diferente: rejeita com 409 (payload mismatch).
- Crescimento da tabela: índice + job de limpeza diário.

## 9. Plano de teste
- Unit: handler, validador, storage.
- Integração: Postgres real em docker, 100 requests paralelos.
- Property-based: qualquer body válido + chave válida → idempotente.
- Manual: via Bruno/Postman com 3 cenários do item 7.

## 10. Rollback
- Feature flag idempotency.enabled (GrowthBook).
- Se p99 subir >10ms ou taxa de 5xx >0.1%: desliga flag.
- Migration é aditiva (sem drop). Reverter = desligar flag, não rollback de schema.`}</CodeBlock>
      </Section>

      <Section title="Como agent consome uma spec" accent={ACCENT}>
        <CodeBlock lang="bash">{`# Em Claude Code (ou similar)
# 1. abre a spec no editor ou cola no prompt
# 2. comanda o agent com precisão

"Leia a spec em docs/specs/idempotency.md. Implemente os requisitos R1-R5
 na camada de rota POST /payments em src/routes/payments.ts.
 Escreva testes cobrindo CA1-CA5 em tests/payments.spec.ts.
 Não altere o schema da resposta atual (não-objetivo 2).
 Não implemente retry (não-objetivo 1).
 Se algum critério não ficar claro, pare e pergunte — não invente."`}</CodeBlock>
        <Callout tone="info">
          <strong>Por que funciona.</strong> Você deu ao agent: (1) objetivo verificável; (2) arquivo-alvo específico; (3)
          restrições explícitas; (4) regra pra pedir ajuda em ambiguidade. Resultado: PR focado, revisável, alinhado.
        </Callout>
      </Section>

      <Section title="SDD vs outras metodologias" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Dimensão', 'SDD', 'TDD clássico', 'BDD', 'Waterfall']}
          rows={[
            ['Artefato principal', 'Spec markdown', 'Teste', 'Feature (Gherkin)', 'Documento longo'],
            ['Tamanho', '1-3 pg, ciclos curtos', 'Vários testes', 'Muitos cenários', '20+ pg, fase única'],
            ['Quem opera', 'Humano + agent', 'Humano', 'Humano + QA', 'Humano'],
            ['Flexibilidade', 'Alta (spec pequena)', 'Média', 'Média', 'Baixa'],
            ['Valida escopo', 'Sim (não-objetivos)', 'Só o que foi testado', 'Sim (cenários)', 'Sim no papel'],
            ['Serve pra equipe AI-native', 'Sim — desenhado pra isso', 'Parcial', 'Parcial', 'Não'],
          ]}
        />
      </Section>

      <Section title="Armadilhas clássicas" accent={ACCENT}>
        <ul className="flex flex-col gap-2" style={{ color: 'var(--ffv-muted)' }}>
          <li>
            • <strong>Spec-bureaucracy.</strong> Virar processo pesado com 10 revisores e 2 semanas de review. SDD é ciclo
            curto — 1 page, 1-2 reviewers, 1 dia de iteração.
          </li>
          <li>
            • <strong>Spec sem critério de aceite.</strong> &ldquo;Deve ser rápido&rdquo; não é critério. &ldquo;p99 &lt;
            50ms sob 1000 rps&rdquo; é.
          </li>
          <li>
            • <strong>Spec para cada commit.</strong> Overhead. SDD é pra feature/bugfix &ldquo;não-trivial&rdquo;. Typo
            não precisa de spec.
          </li>
          <li>
            • <strong>Não atualizar a spec quando o código muda.</strong> Spec vira mentira. Atualiza junto, no mesmo PR.
          </li>
          <li>
            • <strong>Deixar agent escrever a spec sozinho.</strong> Agent pode rascunhar, mas humano tem que aceitar —
            escrever spec é onde o pensamento acontece.
          </li>
          <li>
            • <strong>Spec &ldquo;genérica demais&rdquo;.</strong> Se não tem exemplo concreto (input→output), vira prosa —
            agent inventa o que quiser.
          </li>
        </ul>
      </Section>

      <Section title="Dois cenários reais de decisão" accent={ACCENT}>
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Bugfix de validação em campo de CEP (5 linhas de código)"
          winner="Sem spec formal"
          why="Ticket + teste que reproduz + PR pequeno resolve. Spec aqui é overhead. Regra: se o código é menor que a spec seria, pula a spec."
          alternatives={[{ name: 'SDD completa', note: 'burocratiza; time perde tempo.' }]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Novo fluxo de reembolso com 4 endpoints e integração com PSP"
          winner="SDD obrigatória"
          why="Escopo ambíguo, múltiplos stakeholders, integração externa, impacto financeiro. Spec de 2 páginas evita 2 semanas de retrabalho."
        />
      </Section>

      <Section title="Onde armazenar a spec" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: '1. Dentro do repo', v: 'docs/specs/<slug>.md. Versionada junto do código. Ideal pra spec técnica.' },
            { k: '2. Linear/Notion', v: 'Boa pra spec de produto com stakeholders externos. Exporte um link no PR.' },
            { k: '3. Mixed', v: 'Spec curta no repo (o contrato técnico), spec de produto no Linear (o porquê). Linka um no outro.' },
          ]}
        />
        <Callout tone="warn">
          <strong>Regra.</strong> A spec técnica vive no repo. Agent precisa lê-la — PDF no Drive não serve.
        </Callout>
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Preciso de spec pra refactor interno?"
          a="Se muda comportamento público (API, schema, contrato) — sim. Se é só reorganização interna com testes preservados — não."
        />
        <QAItem
          q="Agent pode escrever a spec pra mim?"
          a="Pode rascunhar a partir de um ticket e conversa. Mas humano revisa, ajusta e aceita. Delegar esse passo é delegar o pensamento."
        />
        <QAItem
          q="SDD funciona em empresa sem cultura de doc?"
          a="Funciona, mas precisa adoção top-down ou bottom-up com 1-2 early adopters mostrando valor. Comece por 1 feature grande; mostre o ganho em retrabalho evitado."
        />
        <QAItem
          q="Como integrar com PRD do produto?"
          a={
            <>
              PRD responde <em>por quê</em>; SDD responde <em>como</em>. PM escreve PRD; engenheiro escreve SDD linkando ao
              PRD. Ambos vivem. Juntos.
            </>
          }
        />
        <QAItem
          q="E se a spec estiver errada depois de começar?"
          a="Atualiza a spec no mesmo PR ou em PR novo. Spec é viva, não sagrada. O crime é ship sem atualizar — código e spec divergem."
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> (1) SDD é ciclo curto: spec pequena, código, feedback. (2) Critérios de aceite viram testes.
        (3) Não-objetivos evitam scope creep. (4) Spec técnica vive no repo, agent e humano consomem igual. (5) SDD é pra
        feature não-trivial — bugfix de 5 linhas não precisa. (6) Próximo: gerenciar os agents que consomem essa spec.
      </Callout>
    </div>
  );
}
