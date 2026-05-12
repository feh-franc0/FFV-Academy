import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram } from '@/components/article/primitives';

export const metadata = getModuleMetadata('llc-americana-faturamento-int');

const accent = '#fbbf24';

const quiz: QuizQuestion[] = [
  { question: 'Por que solo founder brasileiro abre LLC americana?', options: ['Status', 'Razões reais: aceitar pagamento USD via Stripe (BR limitado em features), banking USD (Mercury), credibilidade B2B com clientes US/EU, taxação pass-through (LLC single-member é "disregarded entity" para IRS, não paga corporate tax)', 'Evitar imposto BR', 'Estética'], correct: 1, explanation: 'A motivação prática: Stripe BR não tem full feature set, Mercury permite USD banking, clientes US/EU preferem contratar entidade local, LLC pass-through evita double tax. NÃO evita imposto BR — você ainda declara como pessoa física BR.' },
  { question: 'Stripe Atlas oferece:', options: ['Cartão de crédito', 'Setup completo: Delaware LLC ou C-Corp ($500 one-time), EIN (tax ID), founders agreement, Stripe account ativada, Mercury banking pré-aprovado, contadores parceiros. "LLC in a box" para founder estrangeiro', 'Apenas EIN', 'Empréstimo'], correct: 1, explanation: 'Stripe Atlas (atlas.stripe.com) destravou setup para founders estrangeiros. Processo que levava meses + advogados US agora é em ~2 semanas, $500. Stripe + Mercury + EIN inclusos. Foi mudança radical 2018-2026.' },
  { question: 'W-8BEN serve para:', options: ['Pedir empréstimo', 'Declarar para fontes pagadoras US que você é estrangeiro (não US person), invocar tratado fiscal Brasil-EUA quando aplicável, evitar retenção automática de 30% pelo IRS. Filed com o pagador, não com IRS', 'Imigração', 'Visto'], correct: 1, explanation: 'W-8BEN é o formulário que você dá ao pagador US (Stripe, AdSense, OnlyFans, etc) para declarar não-residência. Sem ele, eles retêm 30% automático. Brasil/EUA não tem tratado tributário pleno (apenas reciprocidade específica), então retenção pode aplicar mesmo com W-8BEN em alguns casos.' },
  { question: 'FBAR (Foreign Bank Account Report):', options: ['Não aplica', 'Aplica se você é US person (cidadão, green card, ou tax resident) E tem $10k+ em contas estrangeiras (i.e., contas brasileiras). NÃO aplica para BR person com Mercury — invertido. Mas se BR person tem conta US > $10k, BR tem CBE (Capitais Brasileiros no Exterior) similar', 'Sempre aplica', 'Apenas para C-Corp'], correct: 1, explanation: 'Confuso para muitos: FBAR é OBRIGAÇÃO US PERSON para contas BR. BR person no Mercury (US) → não FBAR, mas TEM **CBE** do BCB se posição em USD > USD 1 milhão (anual, 1k até 100k vai trimestral também). Imposto separado.' },
  { question: 'Repatriação Brasil — tributação:', options: ['Isento', 'Receita de LLC = renda pessoa física BR (DARF mensal por carnê-leão para renda de fonte estrangeira, alíquota progressiva até 27.5%). Saque do USD para BRL → ganho de variação cambial pode gerar IR. Compliance é OBRIGATÓRIO — Receita Federal sabe via troca de informação (FATCA + CRS)', 'Sem imposto BR', 'Só pelo CNPJ'], correct: 1, explanation: 'BR person trabalhando via LLC US — Receita Federal trata como renda de fonte estrangeira. Carnê-leão mensal (DARF) até dia 30 do mês seguinte. Ganho cambial (USD apreciou entre receber e converter) também tributável. FATCA + CRS = compartilhamento automático entre IRS e RFB. Não tem como esconder em 2026.' },
];

export default function Page() {
  return (
    <ModuleLayout slug="llc-americana-faturamento-int" title="LLC americana + faturamento internacional como BR" icon="🇺🇸" xp={70} readTime={14}
      trailName="Solo SaaS / Indie Hacker Stack" trailColor={accent} nextSlug="solo-stack-completa-2026" nextTitle="Stack completa 2026" quiz={quiz}>
      <Callout tone="danger" icon="⚠️">Este conteúdo é educacional, não aconselhamento jurídico/fiscal. Estrutura LLC + tributação tem mudanças contínuas e nuance individual. Consulte contador especialista BR + advisor US antes de operar.</Callout>
      <Section title="Por que essa estrutura existe" accent={accent}>
        <p className="text-sm leading-6">Você é solo founder BR vendendo SaaS / serviços para clientes US/EU. Estrutura comum: <b>LLC Delaware</b> opera, recebe via <b>Stripe + Mercury USD</b>; você (pessoa física BR) é membro único, retira como distribuição, declara no Brasil via carnê-leão. Cada peça tem motivo.</p>
      </Section>
      <Section title="O fluxo completo" accent={accent}>
        <FlowDiagram title="Solo founder BR + LLC US" accent={accent} orientation="vertical" steps={[
          { icon: '🇧🇷', label: 'Você (BR pessoa física)', desc: 'Único membro da LLC' },
          { icon: '🏢', label: 'LLC Delaware', desc: 'Disregarded entity para IRS — pass-through tax' },
          { icon: '💳', label: 'Stripe US (atlas)', desc: 'Aceita cartões globais em USD' },
          { icon: '🏦', label: 'Mercury USD account', desc: 'Banking + cartão corporativo USD' },
          { icon: '💸', label: 'Distribution para owner', desc: 'Wire Mercury → Wise → Itaú BR' },
          { icon: '📋', label: 'Carnê-leão BR', desc: 'DARF mensal até dia 30 do mês seguinte' },
          { icon: '📅', label: 'DIRPF anual', desc: 'Declarar tudo, anexar bens (Mercury account)' },
        ]} />
      </Section>
      <Section title="Setup via Stripe Atlas" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'Custo', v: '$500 one-time (LLC) ou $1500 (C-Corp). Renewal anual Delaware ~$300' },
          { k: 'O que inclui', v: 'Delaware LLC + EIN + Stripe account + Mercury pre-approved + founders agreement template' },
          { k: 'Prazo', v: '~7-14 dias do pagamento ao banco operacional' },
          { k: 'Stripe Atlas Network', v: 'Acesso a partners (advisors, accountants, lawyers) com discount' },
          { k: 'Alternativas', v: 'doola, Firstbase.io, Clerky — comparable. Atlas é mais conhecido' },
        ]} />
      </Section>
      <Section title="Tributação US — LLC pass-through" accent={accent}>
        <CodeBlock lang="text">{`# Single-member LLC = "Disregarded Entity" para IRS

LLC não paga IRS corporate tax.
Lucro/perda passa direto para o membro (você).

Form 1120 + Schedule K-1 só se C-Corp.
LLC single-member → você declara como pessoa física no SEU país (Brasil).

PORÉM:
- US-source income (clientes US comprando) pode disparar ECI
  (Effectively Connected Income) com US trade or business
- Sales tax (sales tax economic nexus por state) pode aplicar
- Form 5472 + 1120 obrigatório para LLC foreign-owned com US activity

# Conclusão: LLC = veículo operacional + banking.
#            Tributação real acontece NO BRASIL.`}</CodeBlock>
      </Section>
      <Section title="Tributação Brasil — carnê-leão" accent={accent}>
        <CodeBlock lang="text">{`# Renda de fonte estrangeira = carnê-leão obrigatório

# Mensal (DARF código 0190)
Recebeu USD da LLC em outubro/2026?
- Converter USD → BRL pela cotação PTAX do dia
- Aplicar tabela progressiva IRPF (alíquota efetiva 0 a 27.5%)
- Pagar DARF até dia 30 de novembro

# Anual (DIRPF)
Declarar:
- Bens: saldo Mercury em 31/12 (cotação PTAX)
- Rendimentos recebidos no ano (já tributados via carnê-leão)
- Ganho cambial (variação USD/BRL) se aplicável

# Comprovantes que IRS BR pode pedir:
- Extratos Mercury
- Stripe statements
- Wires confirmation
- LLC operating agreement`}</CodeBlock>
      </Section>
      <Section title="CBE — Capitais Brasileiros no Exterior (BCB)" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'Quando', v: 'Posição em ativos no exterior (Mercury, LLC equity, crypto, etc) > USD 1 milhão em 31/12 → declarar CBE Anual' },
          { k: 'Trimestral', v: 'Se posição > USD 100 milhões — declaração trimestral' },
          { k: 'Multa por não declarar', v: 'Até R$ 250k. Severo.' },
          { k: 'Penalidade omissão', v: 'Investigação Receita + BCB + cooperação FATCA/CRS' },
          { k: 'Como', v: 'Sistema CBE online no site do BCB. Contador especialista necessário' },
        ]} />
      </Section>
      <Section title="Pitfalls comuns" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'Misturar dinheiro pessoal e LLC', v: 'PJ veil pierce — você perde proteção limited liability se misturar' },
          { k: 'Não pagar carnê-leão mensal', v: 'Multa 20% + juros SELIC; pode virar CADIN' },
          { k: 'Esquecer DIRPF anual', v: 'Cruzamento Receita via FATCA — não tem como omitir' },
          { k: 'Subestimar contador especialista', v: 'Contador BR comum não entende LLC US. Procure especialista internacional' },
          { k: 'Cartão corporativo para gasto pessoal', v: 'Caracteriza distribution implícita — tributável' },
          { k: 'Não documentar fonte do dinheiro', v: 'Wire grande sem origem comprovada = COAF / BCB suspeita' },
        ]} />
      </Section>
      <Section title="Stack típica BR solo founder 2026" accent={accent}>
        <ComparisonTable accent={accent} headers={['Camada', 'Tool', 'Função']} rows={[
          ['Entidade US', 'Delaware LLC via Stripe Atlas', 'Operating entity'],
          ['Banking US', 'Mercury', 'USD account + cartão + wires'],
          ['Payment', 'Stripe', 'Aceitar cartões clientes globais'],
          ['Câmbio', 'Wise ou Remessa Online', 'USD → BRL com IOF baixo'],
          ['Banking BR', 'Inter / Itaú / Nubank', 'Conta BR pessoa física' ],
          ['Contador BR', 'Especialista internacional', 'Carnê-leão + DIRPF + CBE'],
          ['Contador US', 'Firstbase / specialized', 'Form 5472, sales tax, state filings'],
        ]} />
      </Section>
    </ModuleLayout>
  );
}
