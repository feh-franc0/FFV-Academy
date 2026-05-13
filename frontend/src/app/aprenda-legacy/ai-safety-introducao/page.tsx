import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ai-safety-introducao');
const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre misuse, misalignment e misgeneralization?',
    options: [
      'São sinônimos',
      'Misuse: usuário ou ator malicioso usa o modelo para dano (gerar malware, deepfake). Misalignment: modelo persegue objetivo ligeiramente diferente do intended mesmo sem ator malicioso. Misgeneralization: modelo aplica comportamento aprendido em contexto novo onde falha. Cada categoria tem defesas diferentes',
      'Todos significam jailbreak',
      'Não importa saber',
    ],
    correct: 1,
    explanation: 'Essa taxonomia é central na literatura (Anthropic, DeepMind). Misuse é problema de governança + guardrails. Misalignment é problema de training + Constitutional AI. Misgeneralization é problema de eval + distribution shift. Confundir as três leva a tratamento errado.',
  },
  {
    question: 'Por que o EU AI Act 2025 importa para um engineer em prod?',
    options: [
      'É só regulação europeia',
      'Porque classifica sistemas por risco (unacceptable, high, limited, minimal) e aplica obrigações técnicas concretas: documentação de treinamento, logs, human oversight, disclosure de conteúdo sintético. Empresa que opera na UE precisa evidência técnica — o engineer é quem produz',
      'Só CEO precisa ler',
      'Não se aplica fora da UE',
    ],
    correct: 1,
    explanation: 'AI Act tem efeito extraterritorial como GDPR. Produto vendido na UE cai nas regras. O engineer lida com: conformance matrix, logs de inferência preservados, disclosure de AI em UI, red team documentation para high-risk. Ignorar é passivo legal para a empresa.',
  },
  {
    question: 'Qual a postura correta do engineer frente a safety?',
    options: [
      'Problema de pesquisa, não meu',
      'Postura de engenharia: threat modeling antes de shipping, logs auditáveis, guardrails defensivos em camadas, red team periódico, canal de report de abuse. Tratar safety como feature funcional com definition of done, não como "PR" ou compliance mínimo',
      'Só colocar um filtro',
      'Ignorar',
    ],
    correct: 1,
    explanation: 'Safety deixou de ser problema só de researcher. Em prod, o engineer é quem decide onde colocar filtro, que log preservar, que tool o agent pode chamar. Tratar como feature com DoD (definition of done) evita tanto paralisia quanto negligência — o padrão "vamos ver se dá problema" é inaceitável em 2026.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ai-safety-introducao"
      title="AI Safety: por que importa pra engenheiro"
      icon="🛡️"
      xp={50}
      readTime={12}
      trailName="AI Safety, Red Teaming & Alinhamento"
      trailColor={accent}
      nextSlug="jailbreaks-prompt-injection"
      nextTitle="Jailbreaks e prompt injection: taxonomia e defesas"
      quiz={quiz}
    >
      <Section title="Safety não é marketing de Anthropic" accent={accent}>
        <p>
          O engineer que opera IA em produção em 2026 não tem o luxo de tratar safety como tópico de pesquisa abstrata. Três forças convergiram: (1) modelos ficaram capazes o suficiente para dano real, (2) reguladores (EU AI Act, NIST AI RMF, executive orders nos EUA) criaram obrigações técnicas concretas, (3) casos públicos de falha (data leak via agent, prompt injection exfiltrando secrets, deepfake em fraude) tornaram o risco reputacional tangível.
        </p>
        <p>
          O objetivo desta trilha é equipar você para operar com rigor de engenharia — não com ansiedade nem com desprezo.
        </p>
      </Section>

      <Section title="Taxonomia operacional" accent={accent}>
        <p>
          A literatura consolidou três categorias que ajudam a separar problema e defesa:
        </p>
        <CodeBlock lang="yaml">{`misuse:
  descricao: "Ator humano usa modelo capaz para causar dano"
  exemplos:
    - geração de malware ou phishing em escala
    - deepfake de voz/imagem para fraude
    - CSAM, armas químicas/biológicas
  defesas_principais:
    - policy & refusal training (RLHF, Constitutional AI)
    - content filters pré e pós geração
    - rate limiting e abuse detection

misalignment:
  descricao: "Modelo persegue proxy ligeiramente diferente do objetivo intended"
  exemplos:
    - model otimiza engagement e vira sycophantic
    - agent completa task de forma literal e quebra invariantes
    - reward hacking (explorar brechas da função de recompensa)
  defesas_principais:
    - Constitutional AI / RLAIF
    - evals comportamentais (honesty, helpfulness, harmlessness)
    - scalable oversight, debate, amplification

misgeneralization:
  descricao: "Modelo aplica comportamento aprendido em distribuição nova e falha"
  exemplos:
    - modelo treinado em inglês decide errado em PT-BR
    - agent rag confia em chunk poisoned
    - modelo confidently wrong em edge case não coberto
  defesas_principais:
    - evals fora-de-distribuição
    - detecção de uncertainty
    - fallback a modelo menor/regra`}</CodeBlock>
      </Section>

      <Section title="EU AI Act 2025: o que muda na prática" accent={accent}>
        <p>
          O EU AI Act entrou em vigor em fases a partir de 2024, com obrigações técnicas plenas em 2025-2026. A lei classifica sistemas por risco: <strong>unacceptable</strong> (proibido, ex: social scoring), <strong>high-risk</strong> (RH, crédito, saúde, educação — obrigações pesadas), <strong>limited</strong> (chatbots, deepfakes — disclosure obrigatório), <strong>minimal</strong> (jogos).
        </p>
        <Callout tone="warn" icon="⚠️">
          Se seu produto vai para EU (ou tem usuários EU), cai na lei. Obrigações técnicas concretas para high-risk: technical documentation, logs de inferência preservados, human oversight mecanismo, conformance assessment antes de shipping. Ignorar é passivo de milhões em multa.
        </Callout>
      </Section>

      <Section title="NIST AI RMF e outras molduras" accent={accent}>
        <p>
          Fora da UE, o NIST AI Risk Management Framework é o padrão mais maduro e adotado por empresas americanas (voluntário, mas contratos federais exigem). Quatro funções: <strong>Govern, Map, Measure, Manage</strong>. O engineer contribui principalmente em Map (threat modeling) e Measure (evals).
        </p>
        <CodeBlock lang="markdown">{`# Threat model leve (nível engineer) — template

## Sistema
Agent de suporte ao cliente com tools: buscar pedido, emitir reembolso, criar ticket.

## Assets a proteger
- PII de clientes (CPF, endereço, cartão)
- Integridade financeira (não emitir reembolso indevido)
- Reputação da marca

## Atores de ameaça
- Usuário malicioso via chat
- Prompt injection via email/doc anexado (indirect)
- Funcionário interno com acesso a logs

## Superfícies de ataque
- Input do usuário (texto livre)
- Conteúdo ingested por RAG (email, KB)
- Tool responses que viram contexto

## Controles
- Scope de tool emitir_reembolso limitado por valor e política
- PII scrub antes de log
- Confirmação humana acima de R$ X
- Rate limit por usuário
- Red team trimestral

## O que NÃO cobrimos
- Ataque ao modelo base (responsabilidade do provider)
- DDoS (responsabilidade da infra)`}</CodeBlock>
      </Section>

      <Section title="Safety como feature com DoD" accent={accent}>
        <p>
          A prática que separa time maduro de time amador é tratar safety como feature funcional, com definition of done, não como "vamos ver". Exemplo de DoD para um novo agent em prod:
        </p>
        <CodeBlock lang="markdown">{`# DoD — Safety para shipping de agent novo

- [ ] Threat model escrito e revisado por 1 par
- [ ] Lista explícita de tool scopes (least privilege)
- [ ] Guardrail de input (regex + Llama Guard ou Claude classifier)
- [ ] Guardrail de output (PII scrub, policy check)
- [ ] Logs preservam: prompt, resposta, tool calls, trace id
- [ ] PII scrub antes de log de longo prazo
- [ ] Budget guard (custo por sessão capped)
- [ ] Rate limit por usuário e por IP
- [ ] Canal de report de abuse (email ou form)
- [ ] Playbook de incident response (quem paga on-call)
- [ ] Red team inicial rodado (mínimo 20 prompts de cada categoria)
- [ ] Runbook de desligamento de emergência`}</CodeBlock>
      </Section>

      <Section title="O que esta trilha cobre" accent={accent}>
        <Callout tone="info" icon="💡">
          Próximos 6 módulos: (1) jailbreaks e prompt injection com defesas concretas, (2) data exfiltration em agents, (3) Constitutional AI e como aplicar fora da Anthropic, (4) guardrails práticos (NeMo, Llama Guard, Claude Guardrails), (5) red team playbook, (6) capstone red team do seu agent. Cada um traz código executável.
        </Callout>
      </Section>

      <Section title="Postura operacional" accent={accent}>
        <Callout tone="success" icon="✅">
          Leve deste módulo: safety é disciplina de engenharia, não debate filosófico. Taxonomia (misuse / misalignment / misgen) define defesa certa. EU AI Act e NIST RMF impõem obrigações técnicas concretas. DoD de safety antes de shipping. E lembre: o primeiro incidente tem custo reputacional permanente — gaste 2 semanas agora ou 6 meses depois consertando confiança.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
