import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, Timeline } from '@/components/article/primitives';

export const metadata = getModuleMetadata('seguranca-smart-contract');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'O DAO hack de 2016 explorou qual vulnerabilidade?',
    options: [
      'Integer overflow',
      'Reentrancy — função fez external call antes de atualizar state; contrato malicioso reentrava na função em loop, drenando fundos. ~US$60M perdidos (~3.6M ETH na época); causou hard fork ETH/ETC',
      'Frontrunning',
      'SQL injection',
    ],
    correct: 1,
    explanation: 'O DAO hack é o caso fundador. <code>withdraw()</code> mandava ETH antes de zerar saldo. Atacante usou fallback recebendo ETH → re-chamava withdraw → loop. Solução: Checks-Effects-Interactions pattern.',
  },
  {
    question: 'Curve hack de julho/2023 explorou:',
    options: [
      'Reentrancy clássica',
      'Reentrancy em compilador Vyper — bug específico em versões 0.2.15-0.2.16 do Vyper desabilitou o reentrancy lock. Atacante drenou ~US$70M de vários pools',
      'Oracle manipulation',
      'Frontrunning',
    ],
    correct: 1,
    explanation: 'Curve Finance, 2023-07-30: bug no Vyper compiler quebrou o lock reentrancy. Lição: confiar no compiler é parte do trust assumption. Auditar versões do toolchain importa tanto quanto auditar código.',
  },
  {
    question: 'Mango Markets hack (out/2022) usou:',
    options: [
      'Reentrancy',
      'Oracle manipulation — atacante pump-and-dumped o token MNGO em oracle thin, inflando colateral valuation; pegou empréstimo enorme contra colateral fake; dump executou. ~US$110M perdidos. Atacante "negociou" devolver parte com DAO',
      'Phishing',
      'Bug do iOS',
    ],
    correct: 1,
    explanation: 'Mango Markets caso clássico de oracle manipulation. Token thinly traded (sem liquidez profunda) → preço manipulável em short prazo → contrato confiou no preço → empréstimo desproporcional ao real valor. Use TWAP (time-weighted) ou múltiplos oracles.',
  },
  {
    question: 'Slither, Mythril, Foundry invariants, Echidna — qual a diferença?',
    options: [
      'São o mesmo tool',
      'Slither (static analysis, rápido, detector patterns conhecidos); Mythril (symbolic execution, mais profundo, lento); Foundry invariants (test fuzzing properties-based); Echidna (property-based fuzzing, maduro, padrão para audit sério)',
      'Apenas frameworks de teste',
      'Apenas para Solidity 0.7',
    ],
    correct: 1,
    explanation: 'Cada um cobre um eixo: Slither é o lint rápido (CI). Mythril faz análise simbólica. Foundry invariants e Echidna fazem property-based fuzzing — você define invariantes ("total supply nunca diminui exceto via burn"), tool tenta quebrar. Stack completa usa todos.',
  },
  {
    question: 'Trail of Bits, Spearbit, Code4rena — qual modelo cada um?',
    options: [
      'Todos centralizados',
      'Trail of Bits e Spearbit: firmas tradicionais (engagement bilateral, $50-500k+). Code4rena e Cantina: contests competitivos (warden community audita, prizes distribuídos por achados). Modelos complementares: contest para mais olhos, firm para profundidade',
      'Apenas Code4rena existe',
      'São DEXes',
    ],
    correct: 1,
    explanation: 'Modelo "audit firm" oferece responsabilidade contratual + relatório robusto. Modelo "contest" (Code4rena, Cantina, Sherlock) oferece breadth (50-200 wardens) e descobre patterns inesperados. Projeto sério faz AMBOS antes de mainnet.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="seguranca-smart-contract"
      title="Segurança smart contract: top 10 hacks pós-mortem"
      icon="🛡️"
      xp={80}
      readTime={16}
      trailName="Web3 Engineering Pragmático"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="A indústria do hack — bilhões em dólares" accent={accent}>
        <p className="text-sm leading-6">
          DeFi hacks de 2016 a 2025 acumulam <b>US$15+ bilhões</b> em perdas. Cada exploit deixou lição duramente paga. Aprender essa história não é opcional — é ferramenta de trabalho de quem escreve smart contract.
        </p>
      </Section>

      <Section title="Os 10 hacks que todo dev deveria conhecer" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { when: '2016', label: 'The DAO (~$60M)', detail: 'Reentrancy clássica. Causou fork ETH/ETC.', highlight: true },
            { when: '2017', label: 'Parity Multisig Freeze (~$300M)', detail: 'devkill em library contract congelou Parity wallets para sempre. Cuidado com selfdestruct e contracts upgradable.' },
            { when: '2020', label: 'bZx flash loan (~$1M)', detail: 'Primeira vez que flash loan + oracle manipulation virou playbook. Início da era flash loan.', highlight: true },
            { when: '2021', label: 'Poly Network (~$610M)', detail: 'Cross-chain bridge hack — eventualmente devolvido. Bridges = #1 target em 2021-2023.' },
            { when: '2022', label: 'Ronin Bridge (~$625M)', detail: 'Validator keys comprometidas. Game Axie Infinity, players reais perdidos.', highlight: true },
            { when: '2022', label: 'Wormhole (~$320M)', detail: 'Bug em verificação de assinatura permitiu mint sem deposit no Solana side.' },
            { when: '2022', label: 'Mango Markets (~$110M)', detail: 'Oracle manipulation em token thin. Atacante "negociou" devolução.' },
            { when: '2022', label: 'Nomad Bridge (~$190M)', detail: 'Bug em initialize permitiu "free withdraw". Mass looting (>200 atacantes).' },
            { when: '2023', label: 'Curve Vyper compiler (~$70M)', detail: 'Bug do compilador (não do código). Lição: trust também é o toolchain.', highlight: true },
            { when: '2024', label: 'WazirX (~$235M)', detail: 'Multisig social engineering — phishing UI sofisticado em Ledger.' },
            { when: '2025', label: 'Bybit (~$1.4B)', detail: 'Cold wallet hack via UI/signing flaw. Maior hack crypto da história.', highlight: true },
          ]}
        />
      </Section>

      <Section title="Padrões defensivos obrigatórios" accent={accent}>
        <CodeBlock lang="solidity">{`// ❌ Vulnerable: Effects depois de Interactions
function withdraw(uint amount) external {
    require(balance[msg.sender] >= amount);
    (bool success,) = msg.sender.call{value: amount}('');  // Interaction
    require(success);
    balance[msg.sender] -= amount;                          // Effect (tarde demais)
}

// ✅ Checks-Effects-Interactions
function withdraw(uint amount) external {
    require(balance[msg.sender] >= amount);  // Check
    balance[msg.sender] -= amount;            // Effect
    (bool success,) = msg.sender.call{value: amount}('');  // Interaction
    require(success);
}

// ✅ ReentrancyGuard como backup
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
contract Vault is ReentrancyGuard {
    function withdraw(uint amount) external nonReentrant {
        // ...
    }
}`}</CodeBlock>
      </Section>

      <Section title="Toolchain de segurança 2026" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Tool', 'Tipo', 'Quando rodar']}
          rows={[
            ['Slither', 'Static analysis', 'CI em cada PR — ~5s, catches 70% dos patterns conhecidos'],
            ['Mythril', 'Symbolic execution', 'Pre-audit, pode levar minutos'],
            ['Foundry invariants', 'Property-based fuzzing', 'Test suite integrada, runs em CI'],
            ['Echidna', 'Property-based fuzzing avançado', 'Pre-audit, encontra edge cases'],
            ['Halmos', 'Symbolic execution moderna', 'Complement Mythril, mais ergonômico'],
            ['Aderyn', 'Static analysis Rust-based', 'Faster alternative a Slither'],
            ['MEV-protect simulators', 'Pre-deploy simulation', 'Para contracts de DEX/lending'],
          ]}
        />
      </Section>

      <Section title="Auditoria — como funciona em 2026" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Pré-audit (auto)', v: 'Slither + Aderyn em CI; Foundry invariants no test suite' },
            { k: 'Internal audit', v: 'Time interno + check de patterns; idealmente 2 engenheiros distintos' },
            { k: 'Audit firm 1', v: 'Trail of Bits / Spearbit / Zellic / Sigma Prime — $50-300k+, 2-6 semanas' },
            { k: 'Audit firm 2 (opcional)', v: 'Segunda opinião para contracts de alto valor (>$100M TVL projetado)' },
            { k: 'Audit contest', v: 'Code4rena / Cantina / Sherlock — paralelo a firms, breadth de wardens' },
            { k: 'Public bug bounty', v: 'Immunefi para perpetuidade — typical até $1M para crítico' },
            { k: 'Pós-deploy', v: 'Monitoring on-chain (Forta, Tenderly alerts), pause guardian, circuit breakers' },
          ]}
        />
      </Section>

      <Section title="Padrões obrigatórios para contracts em produção" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'OpenZeppelin libs', v: 'Não escreva ERC20/721 do zero. Use OpenZeppelin (audited, battle-tested).' },
            { k: 'Solidity ≥ 0.8.x', v: 'Integer overflow check built-in (não precisa SafeMath)' },
            { k: 'Pull over push para pagamentos', v: 'Receptor sacar, não você enviar — evita gas griefing / reentrancy' },
            { k: 'Timelock em admin actions', v: 'Mudanças críticas com delay de 48h+ — usuários podem sair' },
            { k: 'Pausable como circuit breaker', v: 'Pause function para incident response' },
            { k: 'Multisig para admin', v: 'Nunca EOA single-sig. Use Safe / multisig threshold 3/5 mínimo' },
            { k: 'Immutability quando possível', v: 'Imutable > upgradable. Upgradable só com timelock + multisig.' },
          ]}
        />
      </Section>

      <Section title="Fechando — trilha Web3 Engineering" accent={accent}>
        <Callout tone="success" icon="🎓">
          Você completou os 10 módulos: Solidity moderno + Foundry, EVM internals, L2s, wagmi+viem, Account Abstraction, MEV, ZK proofs, DeFi primitives, stablecoins e agora security. Badge <b>Web3 Engineer</b> desbloqueado. Você sabe construir on-chain sem se queimar.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
