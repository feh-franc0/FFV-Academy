import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, FlowDiagram, DecisionBox, Timeline } from '@/components/article/primitives';

export const metadata = getModuleMetadata('l2s-comparados-base-arbitrum');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença fundamental entre Optimistic Rollup e ZK-Rollup?',
    options: [
      'Optimistic é mais barato',
      'Optimistic Rollups (Arbitrum, OP, Base) assumem que as transações são válidas e abrem janela de fraud proof (7 dias) onde qualquer validador pode contestar com prova de fraude. ZK-Rollups (zkSync, Linea, Scroll, Polygon zkEVM) anexam prova zero-knowledge (SNARK/STARK) a cada batch — validade matematicamente provada on-chain, sem janela de challenge. Trade-off: ZK tem prover cost mas withdraw rápido; Optimistic é barato e simples mas 7-day delay para sair sem bridge externa',
      'ZK é mais lenta',
      'São idênticas tecnicamente',
    ],
    correct: 1,
    explanation: 'O modelo de segurança é o ponto: Optimistic confia no operador até alguém provar fraude (challenge period ~7 dias para Arbitrum/OP/Base). ZK gera prova de validade por bloco — L1 verifica em segundos. Custo: prover ZK ainda é caro computacionalmente, mas EIP-4844 + melhorias em provers (STARK recursion, Plonky3) reduziram drasticamente em 2024-2025. Bridges nativas Optimistic precisam dos 7 dias; bridges third-party (Across, Hop) usam liquidity pools pra antecipar.',
  },
  {
    question: 'O que EIP-4844 (proto-danksharding) mudou para L2s em 2024?',
    options: [
      'Nada significativo',
      'Adicionou um novo tipo de tx (blob-carrying tx, type-3) que anexa até 6 blobs de 128 KB cada. Blobs são armazenados em consensus layer por ~18 dias e descartados (não persistem em execution state, daí custo marginal). L2s passaram a publicar calldata como blob em vez de calldata regular — custo de DA caiu 10-100x, gas em Arbitrum/Base/OP caiu para fração de centavos por tx',
      'Apenas mudou ABI',
      'Removeu suporte L2',
    ],
    correct: 1,
    explanation: 'EIP-4844 (Buterin, Feist et al, ativado em Dencun mar/2024) é o primeiro passo do roadmap "danksharding". Blobs são commitments KZG, verificáveis por proof of equivalence mas o conteúdo é descartado da L1 após 4096 epochs (~18 dias). Para rollups, o que importa é DA na hora da publicação — blobs entregam isso ~50x mais barato que calldata. Resultado: Base baixou de $0.05-0.20 para $0.001-0.01 por tx. Próximos passos: full danksharding com peer-DAS e mais blobs por bloco.',
  },
  {
    question: 'O que é "sequencer centralization" e por que importa?',
    options: [
      'Marketing',
      'Hoje (2026), todos os grandes L2s rodam sequencer único operado pela equipe (Offchain Labs em Arbitrum, OP Labs em OP/Base, Matter Labs em zkSync). Sequencer ordena txs, propõe blocos. Se o operador censurar ou ficar offline, usuários perdem liveness. Para sair, usar "force inclusion" via L1 (Arbitrum) ou esperar. Roadmap: shared sequencers (Espresso, Astria), based rollups (sequenciados pela L1), PBS-like leader rotation',
      'Não há centralização',
      'Sequencer é decentralizado desde sempre',
    ],
    correct: 1,
    explanation: 'Sequencer centralization é o elefante na sala de 2026. Mesmo com fault proofs robustas, se o operador censura você, sua única saída é force-inclusion lenta (Arbitrum permite enviar tx diretamente via L1 inbox; OP estará habilitando). Sequencer shared (Espresso, Astria, Radius) propõe que múltiplos rollups compartilhem sequencer descentralizado — em troca de UX cross-rollup melhor. Based rollups (Justin Drake) propõem usar o próprio block proposer do L1 — sem sequencer separado.',
  },
  {
    question: 'Quando escolher Base vs Arbitrum vs OP Mainnet?',
    options: [
      'Sempre o mais barato',
      'Base: melhor distribuição de usuários novos (Coinbase onramp integrado), ecossistema Farcaster forte, throughput alto. Arbitrum: maior TVL e DeFi maduro (GMX, Camelot, Pendle), Stylus para WASM contracts (Rust/C/C++). OP: governança via Optimism Collective, OP Stack permite spinning own chain (Superchain). Decisão depende de target: retail/social → Base; DeFi profundo → Arbitrum; app-specific chain → OP Stack',
      'Sempre Arbitrum',
      'Tanto faz',
    ],
    correct: 1,
    explanation: 'As 3 maiores Optimistic Rollups têm posicionamentos distintos em 2026. Base é o "vale-tudo do retail" com 8M+ DAU e ecossistema social/consumer dominante (Farcaster, Friend.tech sucessores, NFT mints sazonais). Arbitrum mantém liderança em DeFi profissional — derivativos (GMX V2, dYdX migration considerada), perps, vaults complexos. OP é hub de Superchain — quem quer rodar L2 próprio (Worldcoin, Mode, Zora) usa OP Stack. Decisão é estratégica, não só custo.',
  },
  {
    question: 'Como funciona uma withdraw nativa de Optimistic Rollup?',
    options: [
      'Instantânea',
      'Usuario inicia withdrawal no L2 → batch é postado em L1 com state root → começa challenge window de 7 dias → se ninguém prova fraude, withdrawal pode ser finalizado e fundos liberados na L1. Bridges terceiras (Across, Hop, Stargate) antecipam liquidity (cobrando fee) para evitar os 7 dias',
      '2 segundos',
      'Apenas via Discord',
    ],
    correct: 1,
    explanation: 'O fluxo padrão é: tx no L2 → output root publicado na L1 → challenge window de 7 dias (Arbitrum: ~6.4 dias por configuração) → após sem disputa, prove state inclusion + relay. Bridges third-party como Across usam relayers que adiantam tokens em troca de fee (~0.05-0.5%), assumindo o risco até finalização. ZK-rollups têm withdraw em horas/minutos (zkSync ~24h por economic finality; Linea similar). Always check finality em docs de cada rollup.',
  },
  {
    question: 'O que diferencia "EVM-equivalence" de "EVM-compatibility"?',
    options: [
      'Não há diferença',
      'EVM-equivalent: bytecode roda byte-a-byte igual à EVM canônica. Optimism, Arbitrum (stylus excluído), Base são equivalentes. EVM-compatible: precisa adaptação (Solidity recompilado, opcode diferente, precompiles diferentes) — zkSync Era é compatible mas não equivalent (compilador zksolc, alguns opcodes mudam). Para portar contratos sem mudança, prefira equivalent. Para zk-rollups que escolheram trade-offs, compatible',
      'Equivalence é deprecated',
      'Compatibility é melhor sempre',
    ],
    correct: 1,
    explanation: 'Distinção criada por Vitalik em "The different types of ZK-EVMs". Type-1 (Taiko, em progresso): equivalência total com Ethereum, prova consensus. Type-2 (Scroll, Linea): equivalência EVM, pequena divergência em precompiles/state. Type-3 (Polygon zkEVM): mostly compatible, alguns opcodes diferentes. Type-4 (zkSync Era): compatibility level — Solidity recompila pra LLM IR especial. Optimistic Rollups (OP, Arbitrum, Base) são essencialmente type-1 EVM-equivalent. Para libraries que dependem de gas exato ou opcodes raros, equivalence importa.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="l2s-comparados-base-arbitrum"
      title="L2s comparados em 2026: Base, Arbitrum, OP, zkSync"
      icon="🛤️"
      xp={65}
      readTime={13}
      trailName="Web3 Engineering Pragmático"
      trailColor={accent}
      nextSlug="wagmi-viem-frontend"
      nextTitle="wagmi + viem: o stack frontend Web3 sério"
      quiz={quiz}
    >
      <Section title="Por que L2 existe — e por que 2024 foi o ponto de virada" accent={accent}>
        <p>
          Ethereum L1 processa ~15 TPS por design — limite escolhido pra manter
          descentralização e validators home-staking viáveis. Em 2021, congestion + base fees
          fizeram tx de DEX custar $50-$200. L2s (Layer 2) foram a saída: execução em chain
          separada, mas data availability e settlement em L1.
        </p>
        <p>
          <strong>EIP-4844 (Dencun, março 2024)</strong> foi o evento mais importante para L2s
          desde a criação. Custos por tx em Arbitrum/Base/OP caíram para fração de centavo. Em
          2026, L2s movem 5-10x o volume de L1 e dominam DeFi retail e onramps.
        </p>
        <Callout tone="info" icon="📊">
          Em <InlineCode>l2beat.com</InlineCode>: TVL agregada de L2s ultrapassou $50B em 2025;
          Arbitrum + Base + OP responsáveis por ~60% do total. zkSync, Linea e Scroll crescendo.
        </Callout>
      </Section>

      <Section title="Timeline da era L2 (2020-2026)" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { when: 'Out 2020', label: 'Optimism testnet', detail: 'Primeiro Optimistic Rollup conceitual em produção.' },
            { when: 'Set 2021', label: 'Arbitrum One mainnet', detail: 'Offchain Labs lança rollup com fraud proofs e modelo Nitro depois.' },
            { when: 'Dez 2021', label: 'Optimism mainnet GA', detail: 'OP mainnet abre para devs. EVM-equivalent.' },
            { when: 'Mar 2023', label: 'zkSync Era mainnet', detail: 'Primeiro ZK-rollup EVM-compatible production.' },
            { when: 'Jul 2023', label: 'Base lança', detail: 'Coinbase L2 baseada em OP Stack. Onramp integrado, retail-first.' },
            { when: 'Set 2023', label: 'OP Stack Superchain', detail: 'Múltiplos chains compartilhando bridge + security. Worldcoin, Mode, Zora adotam.' },
            { when: 'Mar 2024', label: 'EIP-4844 (Dencun) ativa', detail: 'Blobs cortam custo de DA 10-100x. Custo de tx L2 colapsa.' },
            { when: '2025', label: 'Stage 1 fault proofs em Arbitrum e OP', detail: 'Sistema permissionless de challenge. Roadmap rumo a Stage 2.' },
            { when: '2026', label: 'Shared sequencing pilots (Espresso, Astria)', detail: 'Primeiras integrações em produção para descentralizar sequencer.' },
          ]}
        />
      </Section>

      <Section title="Optimistic vs ZK: o modelo de segurança" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Optimistic Rollup', 'ZK-Rollup']}
          rows={[
            ['Validade do batch', 'Assumida; contestável via fraud proof', 'Provada cripto-matematicamente por SNARK/STARK'],
            ['Withdraw nativa', '~7 dias (challenge window)', 'Horas (zkSync ~24h, Linea similar)'],
            ['Custo de prova', 'Zero (só dado on-chain)', 'Prover compute (caro, mas caindo)'],
            ['Maturidade EVM', 'Equivalent (1:1)', 'Compatible (alguns trade-offs)'],
            ['Exemplos 2026', 'Arbitrum, OP, Base, Blast', 'zkSync Era, Linea, Scroll, Polygon zkEVM, Taiko'],
            ['Sequencer falha', 'Force inclusion via L1 (lenta)', 'Idem; depende de cada chain'],
            ['Quando preferir', 'DeFi maduro, EVM total parity, custo baixo', 'Withdraw rápida, future-proof crypto, privacy potential'],
          ]}
        />
      </Section>

      <Section title="Os 4 grandes Optimistic Rollups" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Arbitrum One', v: 'Maior L2 por TVL. Nitro (custom geth fork). Stylus permite contratos em Rust/C/C++ (Wasm). Forte em DeFi profissional: GMX V2, Camelot, Pendle, Radiant.' },
            { k: 'OP Mainnet', v: 'Origem do OP Stack. Pioneiro em sequencer descentralization roadmap. Bedrock (2023) modularizou stack. Governança via Optimism Collective + RetroPGF.' },
            { k: 'Base (Coinbase)', v: 'Built on OP Stack. Onramp Coinbase integrado = melhor UX de aquisição. Hub de Farcaster, social/consumer apps. ~8M DAU em pico 2024-2025.' },
            { k: 'Blast', v: 'OP Stack fork. Diferencial: native yield em ETH (Lido) e USDB (T-bills via MakerDAO). Polêmico mas large volume em 2024.' },
          ]}
        />
      </Section>

      <Section title="Os 4 grandes ZK-Rollups" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'zkSync Era (Matter Labs)', v: 'Type-4. Compilador zksolc (Solidity → LLVM → bytecode próprio). Account abstraction nativa desde sempre. ZK Stack para Hyperchains.' },
            { k: 'Linea (ConsenSys)', v: 'Type-2 EVM-equivalent. Integrado a MetaMask/Infura. Forte em onboarding via stack ConsenSys. Prover baseado em Vortex+PLONK.' },
            { k: 'Scroll', v: 'Type-2 EVM-equivalent. Foco acadêmico em prover open-source. Bytecode equivalence total. Lançou mainnet 2023.' },
            { k: 'Polygon zkEVM', v: 'Type-3. Parte da estratégia Polygon CDK (Chain Development Kit). AggLayer para interop entre chains zkEVM.' },
          ]}
        />
      </Section>

      <Section title="EIP-4844: o que mudou tecnicamente" accent={accent}>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Fluxo de blob-carrying tx (type-3)"
          steps={[
            { label: 'Rollup sequencer compila batch', desc: 'Coleta milhares de txs L2; comprime em blobs de até 128 KB cada (até 6 blobs/tx, 9 por bloco target).' },
            { label: 'Cria type-3 tx', desc: 'Blob commitments (KZG) vão no header da tx. Conteúdo dos blobs viaja pela consensus layer (beacon chain), não execution.' },
            { label: 'Publica em L1', desc: 'Execution layer registra commitments + cobra blob_base_fee separadamente do gas regular.' },
            { label: 'Blobs persistem ~18 dias', desc: '4096 epochs ≈ 18 dias. Após, descartados. Provers ZK e fraud proof challengers têm janela pra usar.' },
            { label: 'L2s acessam via BLOBHASH opcode', desc: 'Contratos L1 (verifier do rollup) leem hash de blob via BLOBHASH(idx) sem custo de calldata.' },
          ]}
        />
        <Callout tone="success" icon="💰">
          <strong>Antes de 4844</strong>: Arbitrum/Base/OP gastavam $30-300/M de gas em calldata.
          <strong> Depois</strong>: $0.5-5/M em blob space. Multiplicador foi tão grande que muitos
          L2s reescreveram pricing imediatamente. Cuidado: blob_base_fee tem própria EIP-1559-like
          dynamics — em pico, blobs ficam caros temporariamente.
        </Callout>
      </Section>

      <Section title="Sequencer: o ponto mais centralizado" accent={accent}>
        <CodeBlock lang="text">{`Estado em 2026 (l2beat.com Stage 1):

Rollup        Sequencer       Force Include   Fault Proofs    Upgrade Delay
Arbitrum      Single (OL)     Yes (~24h)      Permissionless  Multi-day
OP Mainnet    Single (OP)     In rollout       Permissionless  Multi-day
Base          Single (CB)     Same as OP       Same as OP      Multi-day
zkSync Era    Single (ML)     Validity proof   N/A (ZK)        Multi-day
Linea         Single (CS)     Validity proof   N/A (ZK)        Multi-day

OL = Offchain Labs, OP = Optimism, CB = Coinbase, ML = Matter Labs, CS = ConsenSys`}</CodeBlock>
        <p>
          <strong>Force inclusion</strong> é o &quot;safety valve&quot;: se o sequencer censurar você,
          submeter tx diretamente via inbox L1 força inclusão num bloco subsequente.
          Arbitrum tem isso em produção; OP/Base finalizando rollout.
        </p>
        <Callout tone="warn" icon="⚠️">
          Sequencer offline = chain offline para novos txs (mas state seguro). Em 2024 e 2025 houve
          incidentes de 1-4h de downtime em Arbitrum, OP, Base — usuários não conseguiram trade.
          Shared sequencing (Espresso, Astria) é resposta arquitetural, mas ainda piloto.
        </Callout>
      </Section>

      <Section title="Quando escolher cada L2 — decision framework" accent={accent}>
        <DecisionBox
          scenario="DeFi profissional / derivativos / vaults complexos"
          winner="Arbitrum One"
          winnerColor={accent}
          why="Maior TVL DeFi, ecossistema maduro (GMX V2, Pendle, Radiant), Stylus para extensões em Rust quando gas é crítico."
          alternatives={[
            { label: 'OP Mainnet', text: 'Velocity menor mas governança forte, RetroPGF como funding.' },
            { label: 'Base', text: 'Crescendo em DeFi mas ecossistema retail-first.' },
          ]}
        />
        <DecisionBox
          scenario="Consumer app / social / NFT mint / onboarding retail"
          winner="Base"
          winnerColor={accent}
          why="Coinbase onramp integrado (UX inigualável pra novato), Farcaster ecosystem, melhor distribuição. CDP, drops, e mints frequentes."
          alternatives={[
            { label: 'OP Mainnet', text: 'Quando alinhamento com Superchain importa.' },
            { label: 'Arbitrum', text: 'Quando user já é cripto-nativo.' },
          ]}
        />
        <DecisionBox
          scenario="App-specific chain (precisa de chain própria)"
          winner="OP Stack ou Arbitrum Orbit"
          winnerColor={accent}
          why="OP Stack: maior ecossistema de Superchain (Worldcoin, Mode, Zora, Ink). Arbitrum Orbit: melhor para app-chains DeFi com Stylus. Ambos managed via Caldera, Conduit, Alchemy."
          alternatives={[
            { label: 'ZK Stack (zkSync)', text: 'Quando withdraw rápida importa.' },
            { label: 'Polygon CDK', text: 'Para integrar a AggLayer.' },
          ]}
        />
        <DecisionBox
          scenario="Withdraw rápida importante (e.g. exchange flow)"
          winner="ZK-Rollup (zkSync Era ou Linea)"
          winnerColor={accent}
          why="Sem 7-day challenge window. Withdraw em horas via validity proof. Útil pra integrações com CEXs e bridges institucionais."
          alternatives={[
            { label: 'Bridges third-party em OR', text: 'Across/Hop adiantam fundos em minutos via fee.' },
          ]}
        />
      </Section>

      <Section title="Custos práticos por tipo de operação (mai/2026)" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Operação', 'L1 Ethereum', 'Arbitrum', 'Base/OP', 'zkSync']}
          rows={[
            ['ETH transfer', '$1-5', '$0.02-0.10', '$0.001-0.01', '$0.05-0.15'],
            ['ERC-20 transfer', '$2-10', '$0.05-0.20', '$0.002-0.02', '$0.10-0.30'],
            ['Uniswap V3 swap', '$10-50', '$0.20-1', '$0.01-0.10', '$0.30-0.80'],
            ['NFT mint simple', '$5-30', '$0.10-0.50', '$0.005-0.05', '$0.20-0.60'],
            ['Complex DeFi compose', '$30-200+', '$0.50-3', '$0.05-0.50', '$0.80-2'],
          ]}
        />
        <Callout tone="info" icon="📈">
          Valores aproximados em condições normais. Em picos (e.g. memecoin mania), preços L2 sobem
          mas continuam fração do L1. Para tracking real-time: <InlineCode>l2fees.info</InlineCode>.
        </Callout>
      </Section>

      <Section title="Bridge: como mover fundos entre L1 e L2 (e entre L2s)" accent={accent}>
        <ul className="ffv-list">
          <li>
            <strong>Bridge oficial</strong> (canonical): mais segura, mas withdraw L2→L1 em
            Optimistic leva 7 dias. Deposits L1→L2 são rápidos (~10 min).
          </li>
          <li>
            <strong>Bridges third-party</strong> (Across, Hop, Stargate, Synapse, Squid):
            adiantam tokens via liquidity pool, cobrando fee (0.05-0.5%). Withdraw OR em minutos.
          </li>
          <li>
            <strong>Bridge ZK-Rollup canonical</strong>: withdraw em horas (validity proof), não
            precisa third-party na maioria dos casos.
          </li>
          <li>
            <strong>L2 → L2</strong> (Arbitrum → Base, etc.): hoje sempre passa por third-party.
            Shared sequencers e AggLayer pretendem mudar isso.
          </li>
        </ul>
        <Callout tone="warn" icon="🚨">
          Bridges são alvo histórico de hacks (~$2.5B perdidos 2021-2023 — Ronin $625M, Nomad
          $190M, Wormhole $320M). Mesmo com auditoria, evite manter saldo grande &quot;in transit&quot;.
          Bridges oficiais (canonical) têm risco menor que third-party com pools.
        </Callout>
      </Section>

      <Section title="O que muda para o desenvolvedor" accent={accent}>
        <CodeBlock lang="ts">{`// Endereços do mesmo token em chains diferentes — viem facilita
import { mainnet, base, arbitrum, optimism } from 'viem/chains';

const USDC = {
  [mainnet.id]:  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [base.id]:     '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  [arbitrum.id]: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  [optimism.id]: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
};

// Mesmo bytecode, addresses diferentes — sempre buscar pelo CHAIN_ID
function getUSDC(chainId: number) {
  if (!(chainId in USDC)) throw new Error('USDC not deployed on chain');
  return USDC[chainId as keyof typeof USDC];
}`}</CodeBlock>
        <CodeBlock lang="bash">{`# Foundry: testar em fork de cada L2
forge test --fork-url $ARBITRUM_RPC --match-test testArbitrumIntegration
forge test --fork-url $BASE_RPC      --match-test testBaseIntegration

# Deployar em Base
forge script script/Deploy.s.sol \\
  --rpc-url $BASE_RPC \\
  --private-key $PK \\
  --broadcast \\
  --verify --etherscan-api-key $BASESCAN_KEY`}</CodeBlock>
      </Section>

      <Section title="O caminho à frente: Stage 2 fault proofs e shared sequencing" accent={accent}>
        <ul className="ffv-list">
          <li>
            <strong>Stage 2 fault proofs</strong> (Vitalik framework): permissionless challenges +
            no upgrade key + governança limitada. Hoje todos os majors são Stage 1; meta é Stage 2
            em 2026-2027.
          </li>
          <li>
            <strong>Shared sequencing</strong> (Espresso, Astria, Radius): múltiplos L2s
            compartilham sequencer set descentralizado, habilitando atomic composability cross-L2.
          </li>
          <li>
            <strong>Based rollups</strong> (Justin Drake): usa L1 block proposer como sequencer
            nativo. Sem operator extra. Trade-off: latência maior.
          </li>
          <li>
            <strong>Full danksharding</strong>: roadmap pós-4844 com peer-DAS + mais blobs. Reduzir
            custo de DA mais 10-100x ao longo de 2026-2028.
          </li>
          <li>
            <strong>Native interop em OP Stack e ZK Stack</strong>: messaging cross-chain dentro da
            mesma stack vira parte do protocolo, não bridge.
          </li>
        </ul>
      </Section>

      <Section title="Leituras recomendadas" accent={accent}>
        <ul className="ffv-list">
          <li>Vitalik — &quot;The different types of ZK-EVMs&quot; (vitalik.eth.limo).</li>
          <li>Vitalik — &quot;An Incomplete Guide to Rollups&quot; (2021, ainda canônico).</li>
          <li>L2Beat — <InlineCode>l2beat.com</InlineCode> com Stage tracking e risk analysis.</li>
          <li>EIP-4844 — texto completo, seções rationale e backward compatibility.</li>
          <li>Espresso Systems blog — sobre shared sequencing.</li>
          <li>Justin Drake — talks sobre based rollups e preconfs.</li>
          <li>Documentação oficial: Arbitrum docs (Nitro), OP Stack docs, zkSync docs (ZK Stack), Linea docs.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
