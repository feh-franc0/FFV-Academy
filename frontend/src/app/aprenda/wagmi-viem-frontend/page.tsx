import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, FlowDiagram } from '@/components/article/primitives';

export const metadata = getModuleMetadata('wagmi-viem-frontend');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que viem substituiu ethers.js no novo stack?',
    options: [
      'É mais popular',
      'viem é tree-shakeable (cada função importada separadamente vs ethers monolitica), type-safe em runtime (ABIs inferidas tipam args/return), 2x menor em bundle, sem WeakMap weirdness do ethers v6, e tem APIs explícitas (getBalance, readContract) em vez de provider.balanceOf encadeado. Trade-off: API mais verbosa em troca de previsibilidade e DX',
      'É deprecated',
      'Faz parte do React',
    ],
    correct: 1,
    explanation: 'viem (wevm team, paradigm-funded, 2023+) repensou a API com TypeScript-first. Funções puras importadas (import { getBalance } from "viem/actions"), clients minimais, ABI typing via `as const` infere args/return em compile-time. ethers v6 herdou complexidade de v5 e era difícil de tree-shake. Bundle size em apps reais: ethers ~120 KB gzip, viem ~40-60 KB gzip dependendo de uso. wagmi v2 reescreveu pra cima de viem.',
  },
  {
    question: 'O que `as const` na ABI faz em wagmi/viem?',
    options: [
      'Nada',
      'TypeScript trata o array como readonly tuple literal (não array genérico). Permite que o type system extraia nomes de função, args e returns em compile-time. useReadContract({ abi: vaultAbi, functionName: "balanceOf", args: [user] }) tem auto-complete e checa tipos. Sem `as const`, o type vira ABI[] genérico — perde inference',
      'Define const variable',
      'Habilita SSR',
    ],
    correct: 1,
    explanation: '`as const` é o gatilho mágico de inference. Em TypeScript, [{...}] é inferido como ABI[]; com [{...}] as const vira readonly [{ text: "balanceOf"; ... }] tuple literal. wagmi/viem usam Conditional Types + Template Literal Types pra extrair functionName válidas, args válidas e tipo do return. Sem isso, todo contract call seria untyped string. abitype (do wevm team) é a library que faz a inferência heavy.',
  },
  {
    question: 'Por que prefere wagmi v2 over fazer fetch direto com viem?',
    options: [
      'Não há motivo',
      'wagmi v2 é o layer React: hooks com cache (TanStack Query), reconexão wallet, sincronização de chainId, multi-wallet UX, mutation state (isPending, isSuccess, isError). useReadContract retorna {data, isLoading, error, refetch}. Sem wagmi, você refaria boilerplate de state management e cache em cada componente. Em apps complexas, é trabalho que economiza dias',
      'wagmi v2 é mais lento',
      'Não funciona com viem',
    ],
    correct: 1,
    explanation: 'wagmi v2 (2024+) é wrapper React sobre viem, integrando TanStack Query (antigo React Query) pra cache, retries, optimistic updates. Hooks principais: useReadContract (queries), useWriteContract (mutations), useAccount, useChainId, useSwitchChain, useSignMessage. Para apps server-side ou backend, usa viem direto. wagmi pesa ~20KB extra mas paga por si em qualquer app com 5+ componentes interagindo com chain.',
  },
  {
    question: 'Qual é o papel de RainbowKit, ConnectKit e Privy?',
    options: [
      'São idênticos',
      'RainbowKit (família Rainbow Wallet): UI plug-and-play de "Connect Wallet", muitos wallets, customizável. ConnectKit (Family.co): similar, design minimalista. Privy: além de wallet, gerencia embedded wallets (usuário sem extension, login via email/social), com KMS server-side ou MPC client-side. Para retail-first, Privy. Para crypto-native, RainbowKit/ConnectKit',
      'Substituem viem',
      'São deprecated',
    ],
    correct: 1,
    explanation: 'Os três resolvem o problema de UX de wallet connection, mas em níveis diferentes. RainbowKit e ConnectKit assumem que o user tem wallet (MetaMask, Coinbase Wallet, Rabby, WalletConnect-compatible). Privy + Dynamic + Magic + Web3Auth são "embedded wallet" providers: criam wallet pro user (com seed gerada server/client com MPC ou TEE), permitem login via Gmail/Apple/SMS. Em 2026, embedded wallets dominam apps consumer; crypto-native ainda usa external.',
  },
  {
    question: 'O que viem chama de "Public Client" vs "Wallet Client"?',
    options: [
      'Nada de diferente',
      'Public Client: leitura on-chain (eth_call, getBalance, getBlockNumber, getLogs). Não assina, não precisa wallet. Tipicamente conecta direto a RPC (Alchemy, Infura, node próprio). Wallet Client: assina mensagens e txs. Conecta a wallet do usuário (window.ethereum) ou hot wallet (privateKeyToAccount). Em apps, separar os dois client é prática — public roda em qualquer lugar, wallet só em ações específicas',
      'Wallet Client é deprecated',
      'Public Client é só pra testes',
    ],
    correct: 1,
    explanation: 'Separação explícita em viem (vs ethers que misturava em Provider/Signer). Public Client (createPublicClient): para reads, indexers, server-side. Wallet Client (createWalletClient): para assinatura, com account injetado (privateKeyToAccount, mnemonicToAccount, ou custom como Privy). Pattern em app React: usePublicClient() para reads, useWalletClient() para writes. Server-side rendering só pode usar Public Client.',
  },
  {
    question: 'Como wagmi/viem lidam com erros de execução de contrato?',
    options: [
      'Ignoram',
      'viem decodifica reverts automaticamente quando ABI disponível: CustomError(args), require strings, panic codes. Retorna ContractFunctionRevertedError com errorName e args. Em wagmi v2, mutation state expõe error pra UI mostrar mensagem específica. Combinado com BaseError.walk(), navega causa-raiz: useWriteContract({...}).error?.walk(e => e instanceof ContractFunctionRevertedError)',
      'Lançam exceção genérica',
      'Não suportam',
    ],
    correct: 1,
    explanation: 'O sistema de errors em viem é hierarquia robusta: BaseError → ContractFunctionExecutionError → ContractFunctionRevertedError com errorName e args já decodificados via ABI. Para custom errors, viem usa o seletor 4-byte e procura no ABI. shortMessage e details estão prontos pra UI. walk() é utility pra subir o stack de causes (rpc → call → revert). Substitui o parsing manual de revert reason que dava bug em ethers.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="wagmi-viem-frontend"
      title="wagmi + viem: o stack frontend Web3 sério"
      icon="🎨"
      xp={60}
      readTime={12}
      trailName="Web3 Engineering Pragmático"
      trailColor={accent}
      nextSlug="account-abstraction-erc4337"
      nextTitle="Account Abstraction (ERC-4337): wallet sem seed phrase"
      quiz={quiz}
    >
      <Section title="O stack frontend que ganhou a década" accent={accent}>
        <p>
          Entre 2018-2022, fazer dApp em React era um mix de ethers.js + web3-react + redux-saga +
          gambiarras para wallet state. Bundle gigante, race conditions em chainSwitch, types
          frouxos. Em 2023, <strong>wevm</strong> (Tom Meagher, Jake Moxey, paradigm-funded)
          publicou <InlineCode>viem</InlineCode> e reescreveu o <InlineCode>wagmi</InlineCode> v2 sobre ele.
        </p>
        <p>
          Em 2026, o stack default para qualquer dApp React sério é:{' '}
          <strong>viem (leitura/escrita low-level) + wagmi v2 (hooks React) + RainbowKit/ConnectKit/Privy
          (UI de connect) + TanStack Query (cache, já embutido em wagmi)</strong>.
        </p>
        <Callout tone="info" icon="📦">
          Bundle típico de dApp moderno usando viem + wagmi v2 + RainbowKit: ~80-120 KB gzip. Com
          ethers v5/v6 + web3-react: 250-350 KB. Diferença sentida em mobile/3G.
        </Callout>
      </Section>

      <Section title="ethers vs viem: o que mudou na API" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Operação', 'ethers v6', 'viem']}
          rows={[
            ['Get balance', 'provider.getBalance(addr)', 'publicClient.getBalance({ address })'],
            ['Read contract', 'contract.balanceOf(addr)', 'publicClient.readContract({ abi, address, functionName, args })'],
            ['Send tx', 'signer.sendTransaction(tx)', 'walletClient.sendTransaction(tx)'],
            ['Encode call', 'iface.encodeFunctionData(name, args)', 'encodeFunctionData({ abi, functionName, args })'],
            ['Parse units', 'ethers.parseEther("1.5")', 'parseEther("1.5")'],
            ['Wait for tx', 'tx.wait(confirmations)', 'publicClient.waitForTransactionReceipt({ hash })'],
            ['Get logs', 'contract.queryFilter(filter)', 'publicClient.getLogs({ event, args, fromBlock, toBlock })'],
          ]}
        />
        <p>
          A filosofia: viem expõe <strong>actions</strong> (funções puras) e
          <strong>clients</strong> (objetos com config). Cada ação é importada separadamente —
          tree-shake funciona. ethers usa OOP com encapsulamento, que é mais &quot;descobrível&quot; mas
          mata tree-shaking.
        </p>
      </Section>

      <Section title="Setup mínimo: Public + Wallet Clients" accent={accent}>
        <CodeBlock lang="ts">{`// src/lib/wagmi.ts
import { http, createConfig } from 'wagmi';
import { mainnet, base, arbitrum, optimism } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

export const config = createConfig({
  chains: [mainnet, base, arbitrum, optimism],
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'My App' }),
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID! }),
  ],
  transports: {
    [mainnet.id]:  http(process.env.NEXT_PUBLIC_MAINNET_RPC),
    [base.id]:     http(process.env.NEXT_PUBLIC_BASE_RPC),
    [arbitrum.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC),
    [optimism.id]: http(process.env.NEXT_PUBLIC_OP_RPC),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}`}</CodeBlock>
        <CodeBlock lang="tsx">{`// src/app/providers.tsx
'use client';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}`}</CodeBlock>
      </Section>

      <Section title="ABI tipada: o segredo da DX moderna" accent={accent}>
        <CodeBlock lang="ts">{`// src/lib/abis/erc20.ts
export const erc20Abi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ text: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { text: 'to', type: 'address' },
      { text: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { text: 'from', type: 'address', indexed: true },
      { text: 'to', type: 'address', indexed: true },
      { text: 'value', type: 'uint256', indexed: false },
    ],
  },
] as const;  // <-- CRITICAL: as const

// Tipos derivados automaticamente — funcao, args, return
// useReadContract({ abi: erc20Abi, functionName: 'balanceOf', args: [user] })
//   ^ functionName autocompleta com 'balanceOf' | 'transfer'
//   ^ args[0] espera Address
//   ^ data inferido como bigint`}</CodeBlock>
        <Callout tone="success" icon="💡">
          Para gerar ABIs tipadas a partir de contratos compilados, use{' '}
          <InlineCode>@wagmi/cli</InlineCode>: lê artifacts de Foundry/Hardhat e gera{' '}
          <InlineCode>generated.ts</InlineCode> com tudo tipado. Adiciona em CI para nunca drift entre
          contrato e frontend.
        </Callout>
      </Section>

      <Section title="Hooks essenciais de wagmi v2" accent={accent}>
        <CodeBlock lang="tsx">{`'use client';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { erc20Abi } from '@/lib/abis/erc20';
import { parseUnits } from 'viem';

export function TokenWidget({ token }: { text: \`0x\${string}\` }) {
  const { address, isConnected } = useAccount();

  // READ — debounce + cache automatico
  const { data: balance, refetch } = useReadContract({
    abi: erc20Abi,
    address: token,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // WRITE — mutation state
  const { writeContract, data: txHash, isPending, error } = useWriteContract();

  // Aguarda receipt + invalida cache
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
  });

  if (!isConnected) return <p>Connect wallet</p>;

  return (
    <div>
      <p>Balance: {balance?.toString() ?? 'loading...'}</p>
      <button
        disabled={isPending || isMining}
        onClick={() =>
          writeContract({
            abi: erc20Abi,
            address: token,
            functionName: 'transfer',
            args: ['0xRecipient...', parseUnits('1', 18)],
          })
        }
      >
        {isPending ? 'Sign...' : isMining ? 'Mining...' : 'Send 1 token'}
      </button>
      {error && <p>Error: {error.message}</p>}
      {isSuccess && <p>Done! <button onClick={() => refetch()}>refresh</button></p>}
    </div>
  );
}`}</CodeBlock>
      </Section>

      <Section title="Connect wallet: as 3 opções dominantes" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'RainbowKit (rainbow.me/rainbowkit)', v: 'UI clássica colorida. Suporta dezenas de wallets. Customizável via tema. Integra com wagmi nativamente. Adoção massiva em DeFi.' },
            { k: 'ConnectKit (family.co/connectkit)', v: 'UI minimalista por Family. Mesmo subset de wallets. Mais sóbrio visualmente — popular em projetos design-forward.' },
            { k: 'Privy (privy.io)', v: 'Embedded wallets: user loga com email/SMS/Apple/Google e ganha wallet automática (MPC client-side). Bridge entre Web2 UX e Web3. Suporta também external wallets se user já tem.' },
          ]}
        />
        <CodeBlock lang="tsx">{`// Exemplo: RainbowKit
'use client';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, ConnectButton, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, base, arbitrum } from 'wagmi/chains';

const config = getDefaultConfig({
  appName: 'My App',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
  chains: [mainnet, base, arbitrum],
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Em qualquer componente:
export function Header() {
  return <ConnectButton />;
}`}</CodeBlock>
      </Section>

      <Section title="Padrões essenciais: approve + transferFrom (ou Permit)" accent={accent}>
        <FlowDiagram
          accent={accent}
          orientation="horizontal"
          title="Fluxo aprovar + gastar (clássico)"
          steps={[
            { label: 'allowance', desc: 'Read: quanto spender pode gastar?' },
            { label: 'approve(spender, amount)', desc: 'Tx 1: usuário aprova. Custo: ~46k gas.' },
            { label: 'spender.transferFrom(user, ...)', desc: 'Tx 2: spender executa.' },
          ]}
        />
        <p>
          Esse fluxo de 2 transações é frustrante. <strong>EIP-2612 permit</strong> e o moderno
          <strong> Permit2</strong> (Uniswap) resolvem com assinatura off-chain + uma única tx:
        </p>
        <CodeBlock lang="ts">{`import { signTypedData } from 'wagmi/actions';
import { config } from '@/lib/wagmi';

// EIP-2612 permit signature
async function signPermit(token, owner, spender, value, deadline) {
  const nonce = await readContract(config, {
    abi: erc20Abi,
    address: token,
    functionName: 'nonces',
    args: [owner],
  });
  return signTypedData(config, {
    domain: { text: 'USDC', version: '2', chainId: 1, verifyingContract: token },
    types: {
      Permit: [
        { text: 'owner', type: 'address' },
        { text: 'spender', type: 'address' },
        { text: 'value', type: 'uint256' },
        { text: 'nonce', type: 'uint256' },
        { text: 'deadline', type: 'uint256' },
      ],
    },
    primaryType: 'Permit',
    message: { owner, spender, value, nonce, deadline },
  });
}`}</CodeBlock>
        <Callout tone="info" icon="🔐">
          Permit2 (Uniswap, 2022) generaliza permit pra qualquer ERC-20 (mesmo os que não
          implementam EIP-2612). Single approve to Permit2 contract; depois assinaturas off-chain.
          Adotado por Uniswap UI, 1inch e outros agregadores.
        </Callout>
      </Section>

      <Section title="Lendo logs e eventos: getLogs e watchEvent" accent={accent}>
        <CodeBlock lang="ts">{`import { parseAbiItem } from 'viem';

// Eventos historicos
const logs = await publicClient.getLogs({
  address: tokenAddr,
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
  args: { from: userAddr },
  fromBlock: BigInt(18_000_000),
  toBlock: 'latest',
});

// Subscribe em real-time (ws transport)
const unwatch = publicClient.watchEvent({
  address: tokenAddr,
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
  onLogs: (logs) => {
    logs.forEach((log) => {
      console.log('Transfer', log.args.from, '->', log.args.to, log.args.value);
    });
  },
});

// Em React: useWatchContractEvent
import { useWatchContractEvent } from 'wagmi';
useWatchContractEvent({
  abi: erc20Abi,
  address: tokenAddr,
  eventName: 'Transfer',
  onLogs(logs) { /* handle */ },
});`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          RPCs públicas geralmente limitam <InlineCode>getLogs</InlineCode> a 10k blocos por
          request. Para indexação histórica completa, use The Graph, Goldsky, Subsquid ou seu
          próprio indexer com Erigon/Reth.
        </Callout>
      </Section>

      <Section title="Multicall: agregar reads em uma única RPC" accent={accent}>
        <CodeBlock lang="ts">{`// Sem multicall: 100 reads = 100 RPC requests
// Com multicall3 (deployado em todos os majors em address fixo)
import { multicall } from 'wagmi/actions';
import { config } from '@/lib/wagmi';

const results = await multicall(config, {
  contracts: holders.map((addr) => ({
    abi: erc20Abi,
    address: token,
    functionName: 'balanceOf' as const,
    args: [addr],
  })),
  allowFailure: true,  // continua mesmo se 1 call falhar
});

// results[i].status === 'success' ou 'failure'
// results[i].result tem o retorno (tipado)`}</CodeBlock>
        <p>
          Multicall3 (contracts.deployer @ <InlineCode>0xcA11bde05977b3631167028862bE2a173976CA11</InlineCode>{' '}
          em ~tudo) agrega N reads em 1 eth_call. wagmi/viem usam internamente quando você faz
          múltiplos <InlineCode>useReadContract</InlineCode> com mesmo block — mas multicall
          explícito dá controle.
        </p>
      </Section>

      <Section title="Tratamento de erros e UX" accent={accent}>
        <CodeBlock lang="tsx">{`import { BaseError, ContractFunctionRevertedError } from 'viem';

function parseError(err: unknown): string {
  if (err instanceof BaseError) {
    const revert = err.walk(e => e instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError) {
      // Custom error decoded
      if (revert.data?.errorName) {
        return \`\${revert.data.errorName}: \${JSON.stringify(revert.data.args)}\`;
      }
      return revert.shortMessage;
    }
    return err.shortMessage;
  }
  return 'Unknown error';
}

const { writeContract, error } = useWriteContract();
{error && <p className="text-red-500">{parseError(error)}</p>}`}</CodeBlock>
      </Section>

      <Section title="Server components Next.js + viem" accent={accent}>
        <CodeBlock lang="ts">{`// Server Component — sem wagmi, viem direto
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const client = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC),
});

export default async function PoolStats({ pool }: { pool: \`0x\${string}\` }) {
  const [reserve0, reserve1, ts] = await Promise.all([
    client.readContract({ abi: poolAbi, address: pool, functionName: 'reserve0' }),
    client.readContract({ abi: poolAbi, address: pool, functionName: 'reserve1' }),
    client.readContract({ abi: poolAbi, address: pool, functionName: 'lastUpdate' }),
  ]);
  return <pre>{JSON.stringify({ reserve0, reserve1, ts }, null, 2)}</pre>;
}`}</CodeBlock>
        <Callout tone="info" icon="🚀">
          viem funciona perfeito em RSC (Next.js, Remix), edge runtimes (Vercel Edge, Cloudflare
          Workers) — não depende de window. wagmi só em client components.
        </Callout>
      </Section>

      <Section title="Anti-padrões em 2026" accent={accent}>
        <ul className="ffv-list">
          <li>Misturar ethers e viem na mesma codebase &quot;por compatibilidade&quot; — escolha um.</li>
          <li>ABIs como string JSON parseada em runtime — perde tipo. Use <InlineCode>as const</InlineCode>.</li>
          <li>Manter <InlineCode>useState</InlineCode> manual para balanceOf — use <InlineCode>useReadContract</InlineCode>.</li>
          <li>Esquecer de invalidar cache do TanStack Query após <InlineCode>useWaitForTransactionReceipt</InlineCode>.</li>
          <li>Hardcodear addresses sem multi-chain map (vai dar bug ao trocar chain).</li>
          <li>Esquecer <InlineCode>query: {`{ enabled: !!address }`}</InlineCode> em hooks que dependem de connection.</li>
          <li>Não tratar <InlineCode>UserRejectedRequestError</InlineCode> diferente de erros reais.</li>
        </ul>
      </Section>

      <Section title="Leituras recomendadas" accent={accent}>
        <ul className="ffv-list">
          <li>viem.sh — documentação oficial, exemplos por action.</li>
          <li>wagmi.sh — hooks reference + cookbook.</li>
          <li>RainbowKit docs — rainbowkit.com.</li>
          <li>Privy docs — privy.io (embedded wallets em produção).</li>
          <li>Paradigm research — posts sobre viem internals e abitype.</li>
          <li>TanStack Query docs — base do cache layer do wagmi.</li>
          <li>Permit2 GitHub — Uniswap/permit2 + post explicativo.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
