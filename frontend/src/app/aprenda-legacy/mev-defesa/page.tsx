import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, FlowDiagram, Timeline } from '@/components/article/primitives';

export const metadata = getModuleMetadata('mev-defesa');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é MEV (Maximal Extractable Value)?',
    options: [
      'Imposto da rede',
      'Valor que pode ser extraído por quem controla a ordem das transações dentro de um bloco — inicialmente chamado Miner Extractable Value (PoW), atualizado pra Maximal pós-Merge. Quem ordena (proposer/builder/searcher) pode reorganizar, inserir ou descartar txs para capturar lucro: arbitragem entre DEXs, sandwich, liquidações DeFi, frontrunning de mints. Estimado em $1-2B+ extraído desde 2020',
      'Taxa de validador',
      'Custo de blob',
    ],
    correct: 1,
    explanation: 'MEV (Daian, Goldfeder, Kell et al, "Flash Boys 2.0" 2019) capturou o conceito: na blockchain pública, ordem de transações dentro do bloco é prerrogativa do proposer/miner. Searchers detectam oportunidades (DEX arb, liquidações, sandwich) e pagam priority fee alto para ter prioridade. O proposer captura parte via priority fees + builder bribes. Em Ethereum mainnet, MEV-Boost (Flashbots) intermedia: searchers submetem bundles, builders compõem blocos, proposers pegam o mais lucrativo.',
  },
  {
    question: 'Como funciona um ataque sandwich?',
    options: [
      'Atacante quebra o RPC',
      'Atacante (searcher) observa tx pendente de swap grande (vítima compra TokenX). Insere uma tx própria ANTES (frontrun) que também compra TokenX, empurrando preço pra cima. Tx da vítima executa em preço pior. Atacante imediatamente DEPOIS (backrun) vende TokenX no preço inflado. Lucro = diferença, paga ao searcher. Vítima perde slippage além do esperado',
      'Substitui a tx da vítima',
      'É um bug de Solidity',
    ],
    correct: 1,
    explanation: 'Sandwich é a forma mais visível de MEV "tóxico" (transfere valor da vítima ao searcher, sem agregar nada). Requer: (1) atacante detecta tx pendente no mempool público; (2) calcula tamanho ótimo do frontrun para extrair quase tudo dentro do slippage tolerance da vítima; (3) paga priority fee alto pra garantir ordem. Defesas: enviar via private mempool (Flashbots Protect, MEV-Share, MEV-Blocker), usar DEXs com batch auction (CoW Protocol), slippage tolerance apertada com revert.',
  },
  {
    question: 'O que MEV-Boost mudou no Ethereum pós-Merge?',
    options: [
      'Aboliu MEV',
      'Separou responsabilidades via PBS (Proposer-Builder Separation): proposer (validator com ETH staked) não constrói o bloco — terceiriza para builders que competem por payload mais lucrativo. Relay valida bundles, encaminha header lacrado ao proposer (commit-reveal), evita que proposer roube MEV de searchers. Distribui MEV mais democraticamente entre stakers (em vez de só miners grandes), mas centralizou builders/relays',
      'Eliminou validators',
      'É deprecated',
    ],
    correct: 1,
    explanation: 'MEV-Boost (Flashbots, set/2022, Merge) introduziu PBS off-protocol: proposer (lottery via beacon chain) outsourcing build do bloco. Builders (Flashbots, BloxRoute, Beaverbuild, rsync, etc.) recebem UserOps + bundles de searchers, compõem bloco mais lucrativo. Relay funciona como árbitro confiável: valida payload, repassa só header ao proposer, espera assinatura, então revela tx body. >90% dos blocos em mainnet usam MEV-Boost. Críticas: centralização em ~5 builders, censorship via OFAC-compliant relays.',
  },
  {
    question: 'Como CoW Protocol elimina sandwich?',
    options: [
      'É só hype',
      'CoW (Coincidence of Wants) usa batch auction: ordens de N usuários são agregadas off-chain por solvers em um único batch. Solver encontra preço uniforme onde todos os matches são coincidence (Alice quer ETH, Bob quer DAI, internalizam sem tocar DEX). Sobra vai para DEX, com 1 swap único. Sandwich não funciona — não há mempool de tx individual visível, não há ordem manipulável dentro do batch',
      'Bane atacantes',
      'Não faz nada',
    ],
    correct: 1,
    explanation: 'CoW Protocol (Gnosis, 2021+) inverteu o modelo. Em DEX clássica: cada user envia tx, executor sequencial cria oportunidade de MEV. Em CoW: user assina ordem off-chain (limit + slippage), solver agrega N ordens, calcula uniform clearing price. Solver competition (leilão entre solvers pra preencher batch) garante que MEV de arbitragem entre rotas vai PARA o user (surplus capture). Adotado por instituições. Limites: latência maior (batches a cada ~30s); execução pode falhar se preço move.',
  },
  {
    question: 'O que é MEV-Share e como ajuda usuários normais?',
    options: [
      'Programa de loyalty',
      'Sistema da Flashbots (2023) que oferece "Programmable Privacy". User envia tx com hints (revela só campos selecionados) ao MEV-Share node. Searchers que querem fazer backrun-arbitrage podem ver os hints e submeter bundle. Se backrun rendeu MEV, parte é refundada ao user via mecanismo de payback. User vira beneficiário direto, não vítima. Disponível via RPC https://rpc.mevshare.flashbots.net',
      'É uma DAO',
      'É deprecated',
    ],
    correct: 1,
    explanation: 'MEV-Share (Flashbots, 2023) é um permissive mempool com privacy controlada: user escolhe quais campos da tx ficam visíveis aos searchers (function selector, calldata, log topics — não a tx inteira). Searchers vêem oportunidade de backrun-only (não frontrun/sandwich), submetem bundles. Se MEV foi extraído, payback flow envia 90% do MEV ao user. UX: trocar RPC do wallet para MEV-Share endpoint. Boa defesa default contra sandwich + monetiza MEV "saudável" (arb).',
  },
  {
    question: 'O que é JIT (Just-In-Time) liquidity em Uniswap V3 e por que é problemático?',
    options: [
      'Bug de Solidity',
      'Searcher observa swap grande pendente em Uniswap V3 pool. Imediatamente antes: cria position de liquidez concentrada exatamente na faixa de preço do swap. Coleta fees do swap. Imediatamente depois: remove position. Lucro = fees coletadas - gas. Problemático porque LPs passivos perdem fees ("free lunch" para JIT searchers sem provisão de capital longo prazo). V4 hooks permitem mitigar via fee customization',
      'Imposto extra',
      'É só em V2',
    ],
    correct: 1,
    explanation: 'JIT liquidity é forma sofisticada de MEV exclusiva de AMMs com concentrated liquidity (Uniswap V3+). Searcher monitora pending swaps com value > threshold, calcula a faixa de preço, mint position no tick range exato, paga gas para mint+burn antes/depois. LPs tradicionais (que mantém liquidity dias/semanas) perdem fees para o searcher que só ficou 1 bloco. V4 hooks permitem que pool tenha custom logic (ex: fees variáveis para LPs com TWAP de tempo, rejeitar mint+burn no mesmo bloco).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="mev-defesa"
      title="MEV: como atacantes lucram com seu trade — e como se defender"
      icon="🎯"
      xp={70}
      readTime={14}
      trailName="Web3 Engineering Pragmático"
      trailColor={accent}
      nextSlug="zk-proofs-noir-circom"
      nextTitle="ZK proofs aplicados: Noir, Circom, Halo2"
      quiz={quiz}
    >
      <Section title="O que é MEV em uma frase" accent={accent}>
        <p>
          <strong>MEV (Maximal Extractable Value)</strong> é o valor que pode ser extraído por quem
          decide a ordem das transações em um bloco. Em blockchains públicas, o mempool é
          transparente — quem vê primeiro e pode pagar mais priority fee captura oportunidades:
          arbitragem entre DEXs, sandwich em swaps, liquidações DeFi, NFT mint sniping.
        </p>
        <p>
          A pesquisa &quot;Flash Boys 2.0&quot; (Daian et al, 2019) cunhou o termo. De lá pra cá, MEV virou
          uma indústria de $1-2B+ extraídos. O ecossistema reagiu: MEV-Boost (PBS), MEV-Share,
          CoW Protocol, private mempools. Este módulo cobre <strong>como funciona o ataque
          e como o engenheiro defende usuários</strong>.
        </p>
        <Callout tone="info" icon="📚">
          Leituras canônicas: Flashbots <em>research</em> blog, Pmcgoohan post sobre frontrunning
          de 2014 (descrição original em ethresear.ch), trabalho acadêmico de Phil Daian e
          colaboradores.
        </Callout>
      </Section>

      <Section title="Timeline da era MEV" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { when: '2014', label: 'Pmcgoohan post', detail: 'Bitcoin Talk: descreve risco de miner frontrunning. Largamente ignorado.' },
            { when: '2019', label: 'Flash Boys 2.0 paper', detail: 'Daian, Goldfeder, Kell et al formalizam MEV. Termo "Miner Extractable Value" surge.' },
            { when: '2020', label: 'Flashbots formado', detail: 'Phil Daian e equipe lançam Flashbots Auction (relay privado searchers→miners).' },
            { when: '2021', label: 'MEV em destaque DeFi', detail: 'Sandwich attacks visíveis em Uniswap V2/V3. Custo agregado em centenas de milhões.' },
            { when: 'Set 2022', label: 'Merge + MEV-Boost', detail: 'PBS off-protocol. >90% dos blocos via MEV-Boost em meses.' },
            { when: '2023', label: 'MEV-Share lança', detail: 'Programmable privacy + user-level refund. Defesa default emergente.' },
            { when: '2024', label: 'CoW Protocol amadurece', detail: 'Solver competition; batch auctions absorvem volume institucional.' },
            { when: '2025–2026', label: 'Enshrined PBS em debate', detail: 'EIP propostas: PBS in-protocol para reduzir trust em relays.' },
          ]}
        />
      </Section>

      <Section title="Os 5 vetores principais de MEV" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Vetor', 'Como ataca', 'Quem perde', 'Defesa']}
          rows={[
            ['Arbitragem entre DEXs', 'Bot detecta diff de preço (Uni vs Curve), executa swap atômico nos dois', 'Mercado em geral (preço normaliza)', 'Considerada MEV "saudável" — não há vítima direta'],
            ['Sandwich', 'Frontrun compra + tx vítima + backrun venda', 'Trader que enviou swap', 'Private mempool (Flashbots Protect, MEV-Share), slippage apertado, CoW Protocol'],
            ['Liquidação DeFi', 'Bot monitora posições subcolateralizadas, dispara liquidate() primeiro', 'Borrower (mas é parte do design)', 'N/A — é incentive design intencional'],
            ['NFT mint sniping', 'Frontrun mint de coleção hyped, paga priority fee enorme', 'Usuários honestos', 'Permit list, dutch auction, commit-reveal'],
            ['JIT liquidity', 'Mint position no range do swap, coleta fees, burn imediato', 'LPs passivos de Uniswap V3', 'V4 hooks customizados, fee tiers variáveis'],
          ]}
        />
      </Section>

      <Section title="Anatomia de um sandwich attack" accent={accent}>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Sandwich step-by-step"
          steps={[
            { label: 'Vítima envia swap', desc: 'Quer trocar 100 ETH por USDC em Uniswap V3 pool ETH/USDC. Slippage tolerance: 2%. Tx vai pro mempool público.' },
            { label: 'Searcher detecta', desc: 'Bot monitora mempool, calcula impacto do swap no preço (CFMM curve). Se vale a pena, dispara bundle.' },
            { label: 'Frontrun (tx A)', desc: 'Searcher compra ETH no mesmo pool com X ETH, empurrando preço para cima.' },
            { label: 'Tx vítima executa', desc: 'Pega preço pior — vítima recebe menos USDC, mas dentro do slippage tolerance.' },
            { label: 'Backrun (tx B)', desc: 'Searcher vende o ETH comprado na step 3, agora a preço inflado. Lucro = preço de venda - preço de compra - gas.' },
            { label: 'Pagamento ao proposer', desc: 'Searcher tipicamente paga priority fee alto + tip via coinbase.transfer() para garantir inclusão sequencial.' },
          ]}
        />
        <Callout tone="warn" icon="🩸">
          <strong>Impacto típico</strong>: trader perde 0.5%-1.5% adicional vs preço justo. Em swaps
          de $100k+, conta em centenas de dólares por trade. Para users de DeFi ativos, somatório
          mensal é significativo.
        </Callout>
      </Section>

      <Section title="MEV-Boost e PBS (Proposer-Builder Separation)" accent={accent}>
        <CodeBlock lang="text">{`            ┌──────────────┐
            │  Searchers   │   geram bundles (tx ordenadas) com bid via coinbase.transfer
            └──────┬───────┘
                   │ bundles
                   ▼
            ┌──────────────┐
            │   Builders   │   compõem bloco mais lucrativo (várias bundles + txs do mempool)
            └──────┬───────┘
                   │ blocos completos (payload + bid)
                   ▼
            ┌──────────────┐
            │    Relays    │   validam, encaminham header lacrado ao proposer
            └──────┬───────┘
                   │ header (commit)
                   ▼
            ┌──────────────┐
            │   Proposer   │   assina header → relay revela body → on-chain
            └──────────────┘`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Trust no relay', v: 'Proposer confia que relay não vai roubar; relay confia que builder não trapaceia. Tradeoff de centralização' },
            { k: 'Builders dominantes 2026', v: 'Beaverbuild, Titan, rsync, Flashbots — top 5 fazem ~80% dos blocos' },
            { k: 'Censorship resistance', v: 'Relays OFAC-compliant filtram txs (Tornado Cash etc). Proposer pode escolher relay neutral ou rodar local builder' },
            { k: 'Enshrined PBS', v: 'Proposta de mover PBS para dentro do protocolo (sem relay confiável). EIPs em discussão, sem ETA' },
          ]}
        />
      </Section>

      <Section title="Defesas para o usuário final" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Defesa', 'Como funciona', 'Trade-off']}
          rows={[
            ['Flashbots Protect RPC', 'Trocar RPC do wallet para rpc.flashbots.net — tx vai para private mempool, builders Flashbots não permitem sandwich', 'Latência ligeiramente maior, depende de Flashbots'],
            ['MEV-Share', 'rpc.mevshare.flashbots.net — backrun-only mempool + refund ao user', 'Backrun arb ainda ocorre mas user ganha 90% do MEV'],
            ['MEV Blocker (BloxRoute/CoW)', 'Similar ao Protect, com refund flow', 'Multi-provider mempool privado'],
            ['CoW Protocol', 'Batch auctions — sem mempool individual visível', 'Latência maior (~30s), execução pode falhar em movimentos rápidos'],
            ['1inch Fusion / Uniswap X', 'Order flow auction (OFA) com fillers', 'Fillers cobram fee'],
            ['Slippage apertado (~0.1%)', 'Tx reverte em vez de executar a preço ruim', 'Pode falhar muito em mercados voláteis'],
            ['Atomic multi-hop calldata', 'Combinar swap + verificação em um único contrato (avoid spend window)', 'Mais gas; precisa contract custom'],
          ]}
        />
      </Section>

      <Section title="Defesas no design do smart contract" accent={accent}>
        <CodeBlock lang="solidity">{`// 1. Commit-reveal: user commita hash da intenção, revela depois
contract CommitRevealAuction {
    struct Commit { bytes32 hash; uint256 deadline; }
    mapping(address => Commit) public commits;

    function commit(bytes32 h) external {
        commits[msg.sender] = Commit(h, block.timestamp + 1 minutes);
    }

    function reveal(uint256 amount, uint256 salt) external {
        Commit memory c = commits[msg.sender];
        require(block.timestamp >= c.deadline, "too early");
        require(keccak256(abi.encode(amount, salt)) == c.hash, "invalid");
        // executa com amount sem que searchers tenham visto antes
    }
}

// 2. Slippage on-chain rigoroso
function swap(uint256 amountIn, uint256 minOut, uint256 deadline) external {
    require(block.timestamp <= deadline, "expired");
    uint256 out = _doSwap(amountIn);
    require(out >= minOut, "slippage");
    // Se MEV bot tentar sandwich, ou nao consegue extrair ou tx reverte
}

// 3. Per-block trade limit (anti-JIT em V4 hooks)
mapping(address => uint256) public lastTradeBlock;
function trade(...) external {
    require(lastTradeBlock[msg.sender] < block.number, "1 trade/block");
    lastTradeBlock[msg.sender] = block.number;
}`}</CodeBlock>
      </Section>

      <Section title="MEV como serviço: por dentro de um searcher" accent={accent}>
        <CodeBlock lang="ts">{`// Pseudocódigo de bot de arbitragem entre Uni V3 e Curve
import { createPublicClient, http, parseEther } from 'viem';
import { mainnet } from 'viem/chains';
import { FlashbotsBundleProvider } from '@flashbots/ethers-provider-bundle';

const client = createPublicClient({ chain: mainnet, transport: http() });

async function tick() {
  // 1. Lê reservas Uni V3 (slot0, liquidity) e Curve (get_dy)
  const uniPrice  = await getUniPrice('ETH', 'USDC');
  const curvePrice = await getCurvePrice('ETH', 'USDC');

  // 2. Se diff > custos (gas + impact), arbitra
  const diff = curvePrice - uniPrice;
  const profit = diff * tradeSize - gasEstimate - impactCost;

  if (profit > MIN_PROFIT) {
    // 3. Cria bundle: flashloan + swap em A + swap em B + repay + transfer profit
    const bundle = buildArbBundle({ uniPrice, curvePrice, size: tradeSize });

    // 4. Submete via Flashbots relay (priority fee + tip via coinbase.transfer)
    await flashbots.sendBundle(bundle, currentBlock + 1);
  }
}

setInterval(tick, 100);  // monitora 10x/s`}</CodeBlock>
        <Callout tone="info" icon="🛠️">
          Arbitragem entre DEXs é considerada MEV &quot;saudável&quot; — torna preços consistentes,
          aproveita capital eficientemente. Sandwich é &quot;tóxico&quot; — só transfere valor da vítima.
          Comunidade Flashbots faz essa distinção explícita.
        </Callout>
      </Section>

      <Section title="Roadmap: Enshrined PBS, SUAVE, FOCIL" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Enshrined PBS (ePBS)', v: 'Mover PBS para dentro do protocolo via EIPs (Vitalik, Justin Drake em discussão). Reduz trust em relays. Sem ETA — talvez Glamsterdam.' },
            { k: 'SUAVE (Flashbots)', v: 'Chain dedicada para construção de blocos — searchers e builders interagem com privacy via TEEs e MPC. Em desenvolvimento.' },
            { k: 'FOCIL (Fork-Choice enforced Inclusion Lists)', v: 'EIP-7805. Validators publicam inclusion lists obrigando builders a incluir certas txs. Defesa anti-censorship via consenso.' },
            { k: 'Encrypted mempools', v: 'Threshold encryption do mempool — tx só decryptable após bloco proposto. Pesquisa Shutter, Chainlink Fair Sequencing Services.' },
            { k: 'PEPC (Protocol-Enforced Proposer Commitments)', v: 'Proposer comita off-chain a regras (ex: incluir tx X), enforcement em consenso.' },
          ]}
        />
      </Section>

      <Section title="Checklist para devs de dApp" accent={accent}>
        <ul className="ffv-list">
          <li>UI default sugerir RPC privado (Flashbots Protect ou MEV-Share) para usuários.</li>
          <li>Slippage default apertado (0.5% para tokens líquidos, customizável).</li>
          <li>Para large trades, oferecer rota via CoW Protocol ou 1inch Fusion.</li>
          <li>Contratos: <InlineCode>deadline</InlineCode> e <InlineCode>minAmountOut</InlineCode> sempre obrigatórios.</li>
          <li>Mints high-demand: dutch auction, allowlists com signature, ou commit-reveal — nunca FCFS público.</li>
          <li>Em V4 hooks: implementar fee variável e per-block limits contra JIT.</li>
          <li>Documentar para users que MEV existe — transparência {'>'} esconder.</li>
          <li>Monitorar Eigenphi, libMEV, mev-inspect para tracking de MEV no seu próprio protocolo.</li>
        </ul>
      </Section>

      <Section title="Leituras recomendadas" accent={accent}>
        <ul className="ffv-list">
          <li>Daian, Goldfeder, Kell et al — <em>Flash Boys 2.0</em> (2019, arxiv.org/abs/1904.05234).</li>
          <li>Flashbots Research blog — research.flashbots.net (papers, posts técnicos).</li>
          <li>Vitalik — &quot;State of MEV&quot; posts e &quot;Endgame&quot; (vitalik.eth.limo).</li>
          <li>CoW Protocol whitepaper e docs (docs.cow.fi).</li>
          <li>Eigenphi, libMEV, mev-inspect — ferramentas de análise MEV em produção.</li>
          <li>ethresear.ch — threads sobre ePBS, FOCIL, encrypted mempool.</li>
          <li>Justin Drake e Barnabé Monnot — talks sobre PBS futuro.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
