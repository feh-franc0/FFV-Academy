import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, InlineCode, ComparisonTable, KeyValue, AnnotatedFormula } from '@/components/article/primitives';

export const metadata = getModuleMetadata('defi-primitives');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a fórmula do invariant do Uniswap V2?',
    options: [
      'x + y = k',
      'x · y = k (produto constante) — preço marginal = y/x, slippage cresce com tamanho do trade. Liquidez igualmente distribuída em todas faixas de preço (0 a infinito)',
      'x² + y² = k',
      'x − y = k',
    ],
    correct: 1,
    explanation: 'Uniswap V2: x*y = k. Simples e robusto, mas capital ineficiente — só ~1% da liquidez é usada em faixas realistas. V3 resolveu com concentrated liquidity.',
  },
  {
    question: 'Uniswap V3 concentrated liquidity:',
    options: [
      'Reduz capital',
      'Permite que LPs concentrem liquidez em faixas de preço escolhidas — capital eficiente até 4000x em pares estáveis. Trade-off: LP precisa gerenciar ativamente; "fora da faixa" = sem fees',
      'Idêntica a V2',
      'Apenas para ETH',
    ],
    correct: 1,
    explanation: 'V3 (2021) revolucionou AMM: LP escolhe faixa [P_low, P_high]. Fora da faixa, LP fica 100% em um dos tokens (impermanent loss + sem fees). Dentro, capital eficiente. Estratégias ativas viram um ofício (Gamma, Arrakis).',
  },
  {
    question: 'Uniswap V4 hooks:',
    options: [
      'Reescreve V3',
      'Permite plugins customizados em pontos do ciclo do pool (beforeSwap, afterSwap, beforeAddLiquidity, etc) — abilita on-chain limit orders, dynamic fees, JIT liquidity, custom oracles. Singleton + flash accounting (gas savings)',
      'Apenas UI nova',
      'Volta para V2',
    ],
    correct: 1,
    explanation: 'V4 (2024-2025) é arquitetura singleton (todos pools em um contrato), com hooks customizáveis. Permite features que precisavam de contrato externo serem nativas. Gas otimizado via flash accounting.',
  },
  {
    question: 'Aave v3 + Morpho — diferença principal:',
    options: [
      'São idênticos',
      'Aave: pool-based lending (todos suppliers + todos borrowers, risk shared). Morpho: peer-to-peer matching layer sobre Aave/Compound (P2P matching para taxas melhores; quando não casa, cai no pool). Morpho V2 introduz markets isolados',
      'Morpho é centralizado',
      'Aave usa NFT',
    ],
    correct: 1,
    explanation: 'Aave é o "Goldman Sachs" do DeFi lending — pool grande, risco distribuído. Morpho otimiza encontrando match P2P direto, taxas melhores para ambos lados; fallback para Aave/Compound quando não há contraparte.',
  },
  {
    question: 'Oracles em DeFi — qual o trade-off Chainlink vs Pyth?',
    options: [
      'Chainlink é centralizado',
      'Chainlink: push-based (oracle posta on-chain quando preço move >X%), maduro, padrão DeFi. Pyth: pull-based (apps pedem update quando precisam), low-latency (~400ms), fonte direto de market makers institucionais. Pyth ganha em perp DEX low-latency',
      'Pyth não funciona',
      'Chainlink é grátis',
    ],
    correct: 1,
    explanation: 'Push (Chainlink) = preço sempre on-chain mas desatualizado. Pull (Pyth, RedStone) = app paga gas para atualizar quando precisa — preço fresco, custo só quando usa. Perp DEXes (Hyperliquid, dYdX) preferem pull para reduzir oracle MEV.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="defi-primitives"
      title="DeFi primitives: AMMs, lending, perps, oracles"
      icon="🏦"
      xp={65}
      readTime={13}
      trailName="Web3 Engineering Pragmático"
      trailColor={accent}
      nextSlug="stablecoins-por-dentro"
      nextTitle="Stablecoins por dentro"
      quiz={quiz}
    >
      <Section title="Os blocos que constroem DeFi" accent={accent}>
        <p className="text-sm leading-6">
          DeFi de 2026 ainda gira sobre 4 primitivas: AMMs (trocar token), lending (emprestar/pegar emprestado), perpetuals (alavancagem perpétua), oracles (preço externo on-chain). Entender cada uma por dentro é o que separa "uso DEX" de "construo em DEX".
        </p>
      </Section>

      <Section title="AMM — a matemática" accent={accent}>
        <AnnotatedFormula
          title="Uniswap V2 — constant product"
          formula="x · y = k"
          accent={accent}
          parts={[
            { text: 'x', annotation: 'Reserva do token A', highlight: true },
            { text: '·' },
            { text: 'y', annotation: 'Reserva do token B', highlight: true },
            { text: '=' },
            { text: 'k', annotation: 'Invariant — preservado em todo swap' },
          ]}
        />
        <p className="text-sm leading-6">
          Trader envia <InlineCode>Δx</InlineCode> de A, recebe <InlineCode>Δy</InlineCode> de B tal que <InlineCode>(x+Δx)(y-Δy) = k</InlineCode>. Fee 0.30% sai do Δx antes. Slippage proporcional ao tamanho do trade.
        </p>
      </Section>

      <Section title="V2 vs V3 vs V4" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Versão', 'Inovação', 'Trade-off']}
          rows={[
            ['V1 (2018)', 'ETH ↔ ERC20 only, primeiro AMM em escala', 'Limitado'],
            ['V2 (2020)', 'Qualquer par ERC20, oracle TWAP, flash swaps', 'Capital ineficiente'],
            ['V3 (2021)', 'Concentrated liquidity, multiple fee tiers', 'LP precisa gerenciar faixa ativa'],
            ['V4 (2024)', 'Singleton, hooks plugáveis, flash accounting', 'Curva de aprendizado para devs'],
          ]}
        />
      </Section>

      <Section title="Lending — Aave, Morpho, Compound" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Aave v3', v: 'Pool-based. E-mode (correlated assets, LTV até 97%), isolation mode (assets novos), portal (cross-chain liquidity)' },
            { k: 'Morpho Blue', v: 'Markets isolados, primitivos minimal, governança simples — mais "Uniswap V2 de lending" que "Aave"' },
            { k: 'Compound v3', v: 'Single borrow asset por market (foco em USDC), isolated risk' },
            { k: 'Liquidation', v: 'Trigger quando health factor < 1 (collateral × LTV / debt). Keeper bots competem para liquidar, recebem 5-10% premium' },
            { k: 'Interest rate model', v: 'Tipicamente kinked: low utilization → low rate; acima de 80% → exponential rise' },
          ]}
        />
      </Section>

      <Section title="Perpetuals — GMX, dYdX, Hyperliquid" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['DEX', 'Arquitetura', 'Diferencial']}
          rows={[
            ['GMX', 'Multi-asset pool (GLP) como contraparte', 'Sem orderbook, swap-like UX'],
            ['dYdX v4', 'Orderbook off-chain (Cosmos appchain)', 'CEX-like performance, on-chain settlement'],
            ['Hyperliquid', 'L1 customizado, orderbook on-chain', 'Latência ~70ms, foco em pro traders'],
            ['Synthetix Perps v3', 'Synthetic exposure via debt pool', 'Composability com synth assets'],
          ]}
        />
        <Callout tone="warn">
          Perp DEX é a "ponta de lança" do MEV em 2026 — funding rate manipulation, oracle attack via ordering, liquidation cascades. Audit é não-negociável.
        </Callout>
      </Section>

      <Section title="Oracles — Chainlink vs Pyth vs RedStone" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Oracle', 'Modelo', 'Latência', 'Pricing']}
          rows={[
            ['Chainlink Data Feeds', 'Push (heartbeat + deviation)', '~minutos', 'Pago via LINK; subscription-style'],
            ['Pyth Network', 'Pull-on-demand, market makers como publishers', '~400ms', 'Pago via Pyth token + per update'],
            ['RedStone', 'Modular: classic / on-demand / push', 'Configurável', 'Flexível'],
            ['Chronicle (MakerDAO)', 'Push, validator-set', 'Médio', 'Custom para Maker'],
            ['UMA Optimistic Oracle', 'Optimistic (dispute mechanism)', 'Lento mas barato', 'Bom para statements fact-based'],
          ]}
        />
      </Section>

      <Section title="Composability — a magic" accent={accent}>
        <p className="text-sm leading-6">
          DeFi primitives são <i>combinatórios</i>. Um único transaction pode: pegar emprestado USDC no Aave → trocar por ETH no Uniswap → depositar em vault Yearn → minar tokens em farm → trocar tokens recebidos por DAI → pagar empréstimo. Tudo atomicamente, com rollback se qualquer step falhar. É essa composição que faz DeFi diferente de fintech tradicional.
        </p>
      </Section>
    </ModuleLayout>
  );
}
