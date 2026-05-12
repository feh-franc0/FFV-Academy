import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-web3-pragmatico')!;

export const metadata: Metadata = {
  title: 'Web3 Engineering Pragmático — FFV Academy',
  description:
    'Web3 sem hype, como engenheiro: Solidity moderno + Foundry, EVM internals, L2s comparados (Base/Arbitrum/zkSync), wagmi+viem frontend, Account Abstraction (ERC-4337), MEV defesa, ZK proofs (Noir/Circom), DeFi primitives, stablecoins por dentro, segurança smart contract.',
  keywords: 'solidity foundry, evm internals, l2 ethereum, wagmi viem, account abstraction erc-4337, mev flashbots, zk proofs noir, defi uniswap, smart contract security',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
