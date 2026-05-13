import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, KeyValue, Timeline } from '@/components/article/primitives';

export const metadata = getModuleMetadata('stablecoins-por-dentro');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'USDC e USDT são respaldadas por:',
    options: [
      'Algoritmo',
      'Ativos reais — caixa + treasuries de curto prazo + (em USDT, mais variado, incluindo bonds e crédito). USDC tem attestations mensais; USDT tem auditoria menos transparente. Centralizadas: emissor pode congelar contas',
      'Crypto',
      'Outros stablecoins',
    ],
    correct: 1,
    explanation: 'Stablecoins fiat-backed dependem de reservas off-chain. Circle (USDC) publica attestations mensais com firma externa. Tether (USDT) é mais opaco. Ambos podem freeze wallets — happened: USDC bloqueou enderços OFAC-listed, USDT bloqueou após hack.',
  },
  {
    question: 'DAI da MakerDAO é:',
    options: [
      'Fiat-backed',
      'CDP-based (Collateralized Debt Position) — usuário trava ETH/WBTC/USDC etc em Vault e mintsa DAI. Sobrecolateralizada (>150% típico). Estável via incentivos econômicos + DAI Savings Rate. Em 2024, DAI virou USDS sob "Endgame" da Sky',
      'Idêntica a USDC',
      'Pegged em ETH',
    ],
    correct: 1,
    explanation: 'DAI é o stablecoin descentralizado original (2017). Vault aceita colateral, mintsa DAI. Liquidation se collateral cai. Em 2024-2025, MakerDAO rebrand "Sky", DAI → USDS. Ainda CDP-based, com colateral diversificado (incluindo RWA).',
  },
  {
    question: 'Ethena USDe é:',
    options: [
      'Fiat-backed',
      'Delta-neutral synthetic — combina staked ETH (long) com short ETH perpetuo em CEX para neutralizar exposição de preço; yield vem do funding rate dos perps. Inovação 2023-2024',
      'Algorithmic estilo Terra UST',
      'Stablecoin de Bitcoin',
    ],
    correct: 1,
    explanation: 'Ethena (Guy Young, 2023) trouxe modelo delta-neutral: rendimento do perp funding rate paga o yield. Funcionou em bull market 2024; risco em bear market quando funding fica negativo. Reservas de USDe usadas como colateral também — atenção ao loop.',
  },
  {
    question: 'Por que Terra UST colapsou em maio de 2022?',
    options: [
      'Falta de regulação',
      'Algorithmic peg via burn/mint de LUNA: quando UST despeggou, mecanismo de arbitragem requeria mint massiva de LUNA, que diluiu o preço de LUNA, que destruiu confiança, que aumentou pressão de venda — reflexive death spiral. ~US$60B desapareceram',
      'Hack',
      'CEO fugiu',
    ],
    correct: 1,
    explanation: 'Terra UST era algorithmic — sem colateral externo robusto. O mecanismo de arbitragem dependia de demanda contínua. Quando demanda caiu (Anchor 20% yield drying up), arbitragem foi acionada, LUNA inflou, peg quebrou definitivamente. Lição: algorithmic stablecoin sem reserva real é frágil.',
  },
  {
    question: 'GENIUS Act (US) e MiCA (EU):',
    options: [
      'Apenas para gaming',
      'Regulações que entraram em vigor em 2024-2025 para stablecoins: GENIUS Act (US, 2024) define quem pode emitir (bancos + entidades autorizadas), reserva 1:1 obrigatória, auditoria. MiCA (EU) similar — registry, reservas, transparência. USDT teve dificuldades em ambos',
      'Não existem',
      'Apenas regulam crypto',
    ],
    correct: 1,
    explanation: 'GENIUS Act foi sancionado em 2024, MiCA em 2023 (effective em 2024). Ambos exigem reserva real, auditoria, autorização para emitir. USDC adaptou-se; USDT enfrentou pressão de delistagem em alguns mercados EU. Em 2026, paisagem mais regulada.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="stablecoins-por-dentro"
      title="Stablecoins por dentro: USDC, DAI, FRAX, USDe"
      icon="💵"
      xp={60}
      readTime={12}
      trailName="Web3 Engineering Pragmático"
      trailColor={accent}
      nextSlug="seguranca-smart-contract"
      nextTitle="Segurança smart contract"
      quiz={quiz}
    >
      <Section title="Os 4 modelos de stablecoin" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Modelo', 'Mecânica', 'Exemplos', 'Risco principal']}
          rows={[
            ['Fiat-backed centralizado', '1:1 com USD em conta bancária', 'USDC, USDT, PYUSD', 'Custódia, regulação, freeze'],
            ['CDP / Crypto-backed', 'Sobrecolateralizado em crypto, mint contra collateral', 'DAI/USDS, LUSD (Liquity)', 'Volatilidade do colateral, liquidations'],
            ['Algorithmic puro', 'Peg via supply mechanics (burn/mint)', 'UST (colapsou), Ampleforth', 'Death spiral em pressão'],
            ['Delta-neutral synthetic', 'Long staked ETH + short ETH perp', 'Ethena USDe', 'Funding rate negativo, CEX risk'],
            ['RWA-backed', 'Tokenização de treasuries / fundos', 'Ondo USDY, Mountain USDM', 'Custódia legal, KYC'],
          ]}
        />
      </Section>

      <Section title="Linha do tempo — o que aconteceu" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { when: '2014', label: 'USDT lança', detail: 'Tether na Bitfinex — primeiro stablecoin escala' },
            { when: '2017', label: 'DAI MakerDAO', detail: 'Primeiro CDP descentralizado' },
            { when: '2018', label: 'USDC nasce', detail: 'Circle + Coinbase, transparência declarada' },
            { when: '2022-05', label: 'Terra UST colapsa', detail: 'US$60B destruídos. Lição definitiva sobre algorithmic puro.', highlight: true },
            { when: '2023', label: 'Ethena USDe lança', detail: 'Delta-neutral inova; USDe vira top-5 stablecoin em meses', highlight: true },
            { when: '2024', label: 'MiCA + GENIUS Act', detail: 'Regulação séria entra em vigor. USDC bem posicionado.' },
            { when: '2024', label: 'MakerDAO → Sky, DAI → USDS', detail: '"Endgame" plan executa' },
            { when: '2025', label: 'PYUSD (PayPal) escala', detail: 'Stablecoin de instituição tradicional ganha tração' },
            { when: '2026', label: 'Tokenization de treasuries explode', detail: 'BlackRock BUIDL, Ondo, Mountain dominam RWA' },
          ]}
        />
      </Section>

      <Section title="O que importa em produção" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Risco de blacklist', v: 'USDC/USDT podem congelar wallets. Para apps que precisam neutralidade (privacy, política), use DAI/USDS/LUSD.' },
            { k: 'Depeg risk monitoring', v: 'Alerta se preço cai < 99.5% por > 30min. Aconteceu com USDC em mar/2023 (SVB exposure)' },
            { k: 'Reserve transparency', v: 'USDC: attestations mensais. USDT: opaco. DAI: tudo on-chain visível.' },
            { k: 'Yield bearing variants', v: 'USDM, USDY, sUSDe — pagam yield. Útil para tesouraria, complexidade fiscal extra' },
            { k: 'Cross-chain bridges', v: 'CCTP (Circle Cross-Chain Transfer Protocol) para USDC nativo. Para outros, bridges custom (risco)' },
            { k: 'Real Brasil', v: 'BRL stablecoins emergentes (BRZ, USDB-BR-like) — adoption local mas reservas off-shore complicam' },
          ]}
        />
      </Section>

      <Section title="Para devs construindo com stablecoin" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Default safe', v: 'USDC em L2 (Base, Arbitrum) é o "padrão"' },
            { k: 'Para neutralidade', v: 'DAI/USDS (mais permissionless)' },
            { k: 'Para yield embutido', v: 'sUSDS, sUSDe, USDM (cuidado: yield → bond-like risk)' },
            { k: 'Para Brasil', v: 'BRL-on-chain ainda emergente; USDC + pix entry/exit é a stack atual' },
            { k: 'Multi-stable strategy', v: 'Diversificar entre USDC + DAI + (algo) é prudente para tesouraria > $100k' },
          ]}
        />
      </Section>

      <Callout tone="warn">
        Nunca trate stablecoins como livres de risco. SVB collapse derreteu USDC para $0.87 por horas em mar/2023. Terra UST destruiu poupança de muita gente. Diversificação importa.
      </Callout>
    </ModuleLayout>
  );
}
