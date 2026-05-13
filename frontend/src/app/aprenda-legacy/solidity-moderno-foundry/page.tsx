import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, FlowDiagram, Timeline } from '@/components/article/primitives';

export const metadata = getModuleMetadata('solidity-moderno-foundry');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que custom errors substituíram require com string em Solidity 0.8.4+?',
    options: [
      'São mais bonitos no código',
      'Custom errors fazem ABI-encode de um seletor 4-byte (igual function selector) + argumentos. revert("Mensagem longa") gasta ~50 gas por byte da string. Custom error com 2 args costuma custar ~25% do equivalente em string. Além de gas, ferramentas (Foundry, Etherscan) decodificam o seletor de volta para o nome com tipos',
      'Não rodam mais em EVM antigas',
      'Eliminam a necessidade de testes',
    ],
    correct: 1,
    explanation: 'EIP-838 introduziu o conceito; Solidity 0.8.4 (abril 2021) implementou a sintaxe error Foo(uint a, address b). O compiler gera o seletor keccak256("Foo(uint256,address)")[:4]. Em revert Foo(x, y) o calldata fica seletor + abi.encode(x,y). Comparado a revert("Foo: a is...") que faz string concat e armazena bytes contagem por contagem, a economia em paths de erro frequentes (validações de entrada) é mensurável em deployments com milhões de calls/mês.',
  },
  {
    question: 'Em Foundry, qual é a diferença entre forge test e forge test --via-ir?',
    options: [
      '--via-ir é mais rápido',
      'Sem --via-ir o solc usa o pipeline legado (codegen direto de Yul-like). Com --via-ir o solc primeiro compila para Yul IR e roda otimizações no IR antes de gerar bytecode. Habilita stack-too-deep fixes e otimizações inter-procedurais. Compila ~10x mais lento mas gera bytecode menor/melhor em contratos complexos. Default em produção pra contratos não-triviais',
      '--via-ir desativa testes',
      'São idênticos',
    ],
    correct: 1,
    explanation: 'O pipeline via-IR foi adicionado em solc 0.8.13+ e marcado stable em 0.8.20. O legacy codegen é mais simples mas tem limitações em alocação de stack (16 slots locais máx por scope). via-IR usa SSA-form Yul, permite que o otimizador faça inlining inter-procedural, dead-code elimination melhor, e contorna stack-too-deep automaticamente. Pago em tempo de build (5–20x mais lento) e em casos raros muda gas de hot paths para pior — sempre comparar gas snapshots antes/depois.',
  },
  {
    question: 'Para que serve transient storage (EIP-1153) em Solidity 0.8.24+?',
    options: [
      'Substituir todo SSTORE',
      'Storage por-transação que zera automaticamente ao fim do tx. TSTORE custa ~100 gas vs ~20.000 do SSTORE em slot zero. Casos: reentrancy guards (TSTORE 1 no início, TSTORE 0 no fim, sem precisar refund), passar dados entre calls do mesmo tx (callback patterns Uniswap V4 hooks), allowance de uso único',
      'Cache permanente de leitura',
      'Substitui memory',
    ],
    correct: 1,
    explanation: 'EIP-1153 (Buterin, Robinson, 2018, ativado em Cancun mar/2024) adicionou opcodes TLOAD/TSTORE. O slot vive só dentro do call frame da transação atual e é descartado ao final. O Uniswap V4 usa transient extensivamente para hooks: o callback pode ler estado de "lock" sem custo de SSTORE. Reentrancy guards modernos viraram one-liner: function nonReentrant() { require(tload(0)==0); tstore(0,1); _; tstore(0,0); } sem o custo de 20k+5k de SSTORE/refund.',
  },
  {
    question: 'O que faz forge fuzz se diferente de forge test tradicional?',
    options: [
      'Roda em paralelo',
      'Testes com argumentos fuzzed: function testAdd(uint256 x, uint256 y) { ... } recebe N runs (default 256) com valores aleatórios de x,y dentro do tipo. Shrinking ao falhar: encontra o menor input que reproduz. Invariant testing (forge invariant): define propriedades globais e Foundry chama random sequences de funções pra tentar quebrar',
      'Chama LLM pra gerar testes',
      'É só linting',
    ],
    correct: 1,
    explanation: 'Foundry fuzzing usa property-based testing inspirado em QuickCheck/Hypothesis. Configurável em foundry.toml (runs, max_test_rejects, seed). Diferente de testes unitários que validam casos específicos, fuzzing tenta quebrar invariantes (ex: "soma de deposits sempre igual ao saldo"). Invariant testing vai além: você lista handler functions e Foundry sequencia chamadas aleatórias entre elas, tentando atingir estados quebrados. Trail of Bits popularizou o pattern em audits.',
  },
  {
    question: 'Por que immutable é diferente de constant em Solidity?',
    options: [
      'Não há diferença',
      'constant é inlined em bytecode no compile time (literal). immutable é setado no constructor, gravado uma vez no bytecode em deploy (PUSH32 patched), e leitura é PUSH32 (3 gas) em vez de SLOAD (~2100 gas cold). Use immutable para valores conhecidos em deploy (owner, token endereço); constant para valores fixos no código (CHAIN_ID test, MAX_SUPPLY)',
      'immutable é storage',
      'constant só funciona em libraries',
    ],
    correct: 1,
    explanation: 'Solidity 0.6.5 introduziu immutable. Em deploy, o compiler emite placeholders no runtime bytecode; o constructor escreve o valor uma vez via deployment-time patch. Leituras subsequentes são PUSH de 32 bytes (3 gas), não SLOAD (cold 2100, warm 100). Para contratos chamados milhões de vezes, trocar 5 SLOADs de constantes por immutables economiza ~10k gas por call — algoritmos importantes em DEXs (Uniswap usa imutables para WETH, factory, etc).',
  },
  {
    question: 'Como Foundry cast difere de ferramentas web3.js/ethers no fluxo de dev?',
    options: [
      'Cast é GUI',
      'cast é CLI standalone: cast call 0x... "balanceOf(address)" 0x... --rpc-url $RPC, cast send pra tx, cast 4byte pra decodar selector desconhecido, cast run pra simular tx histórica com trace. Não precisa instalar Node, escrever scripts. Integra com anvil (fork local) e forge script (deployment scripts em Solidity, não JS)',
      'Cast só lê arquivos',
      'Não tem cast',
    ],
    correct: 1,
    explanation: 'Foundry (Paradigm, gakonst, 2021+) escreveu o stack em Rust como crítica explícita ao tooling JS. cast é o canivete suíço: cast call, cast send, cast estimate, cast logs, cast tx, cast block, cast 4byte (decodifica selector via 4byte.directory). cast run <txhash> --rpc-url ... reproduz a tx com trace completo de calls, útil pra debugar exploits. forge script substitui deploy scripts JS por Solidity, mesmo idioma, integrado a vm.startBroadcast() pra deployment determinístico.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="solidity-moderno-foundry"
      title="Solidity 0.8.x moderno + Foundry: o stack 2026"
      icon="⚒️"
      xp={70}
      readTime={14}
      trailName="Web3 Engineering Pragmático"
      trailColor={accent}
      nextSlug="evm-internals"
      nextTitle="EVM internals: opcodes, stack, gas, storage"
      quiz={quiz}
    >
      <Section title="Por que Solidity 0.8.x e Foundry, em 2026" accent={accent}>
        <p>
          O ecossistema EVM amadureceu. Solidity 0.8 (dez/2020) trouxe overflow check default; 0.8.4 trouxe custom errors; 0.8.20 estabilizou via-IR; 0.8.24 (mar/2024, Cancun) habilitou transient storage. Em paralelo, Foundry (Paradigm) destronou Hardhat como ambiente de desenvolvimento padrão: build mais rápido (Rust), testes em Solidity (sem context-switching pra JS), fuzzing nativo, cast como canivete suíço CLI.
        </p>
        <p>
          Este módulo cobre o que mudou entre 2021 e 2026 — e o que parar de copiar de tutoriais antigos.
        </p>
        <Callout tone="warn" icon="⚠️">
          <strong>Se você ainda usa</strong> require com string, Hardhat para projetos novos, ou
          ReentrancyGuard com SSTORE — você está pagando gas por hábito desatualizado.
        </Callout>
      </Section>

      <Section title="O que mudou de 2021 para 2026" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { when: 'Dez 2020', label: 'Solidity 0.8.0', detail: 'Overflow/underflow checks por default (sem SafeMath). unchecked { } para opt-out explícito.' },
            { when: 'Abr 2021', label: 'Solidity 0.8.4 — custom errors', detail: 'error Foo(uint a). Gas drop em paths de erro. Adoção total em DeFi maduro até 2022.' },
            { when: 'Mar 2022', label: 'Foundry 1.0 estável', detail: 'forge, cast, anvil, chisel. Adoção rápida: Optimism, Lido, Uniswap migrando.' },
            { when: 'Mai 2023', label: 'Solidity 0.8.20 — via-IR estável', detail: 'Pipeline Yul IR vira o caminho recomendado para projetos sérios.' },
            { when: 'Mar 2024', label: 'Cancun — EIP-1153 transient', detail: 'TLOAD/TSTORE habilitados em mainnet. Solidity 0.8.24 expõe transient keyword.' },
            { when: 'Mai 2024', label: 'EIP-4844 blobs em produção', detail: 'L2 fees colapsam 10–100x. Foundry e viem ganharam suporte a blobs.' },
            { when: '2025–2026', label: 'Account abstraction (4337/7702) mainstream', detail: 'Bundlers, paymasters e session keys integrados ao stack de testes.' },
          ]}
        />
      </Section>

      <Section title="Estrutura de projeto Foundry típica" accent={accent}>
        <CodeBlock lang="bash">{`forge init meu-projeto
cd meu-projeto

# layout default
# src/         contratos
# test/        testes em .t.sol
# script/      scripts de deploy
# lib/         submodules (forge install)
# foundry.toml configuracao

# instalar dependencias (submodules git)
forge install OpenZeppelin/openzeppelin-contracts
forge install foundry-rs/forge-std

# remappings (auto-gerado, ou editavel)
forge remappings > remappings.txt

# rodar testes
forge test -vv               # logs em sucesso
forge test --match-test testTransfer
forge test --gas-report      # gas por funcao
forge snapshot               # salva gas em .gas-snapshot
forge coverage               # cobertura
forge fmt                    # formatador oficial
forge build --via-ir         # build com IR pipeline`}</CodeBlock>
        <Callout tone="info" icon="📚">
          A documentação canônica está em <InlineCode>book.getfoundry.sh</InlineCode>. Para um
          template robusto, ver <InlineCode>PaulRBerg/foundry-template</InlineCode> ou o template
          do Optimism.
        </Callout>
      </Section>

      <Section title="Custom errors: sintaxe, gas, decodificação" accent={accent}>
        <CodeBlock lang="solidity">{`// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract Vault {
    // Definicao a nivel de contrato ou file
    error InsufficientBalance(uint256 requested, uint256 available);
    error Unauthorized(address caller);
    error ZeroAmount();

    address public immutable owner;
    mapping(address => uint256) public balances;

    constructor(address _owner) {
        owner = _owner;
    }

    function withdraw(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        uint256 bal = balances[msg.sender];
        if (bal < amount) {
            revert InsufficientBalance({ requested: amount, available: bal });
        }
        unchecked { balances[msg.sender] = bal - amount; }
        (bool ok,) = msg.sender.call{value: amount}("");
        if (!ok) revert("transfer failed");
    }

    function adminAction() external {
        if (msg.sender != owner) revert Unauthorized(msg.sender);
    }
}`}</CodeBlock>
        <p>
          O seletor 4-byte de <InlineCode>InsufficientBalance(uint256,uint256)</InlineCode> é
          <InlineCode>keccak256(&quot;InsufficientBalance(uint256,uint256)&quot;)[:4]</InlineCode>. Foundry e
          Etherscan decodificam automaticamente quando o ABI está disponível. Em frontend (viem), o
          decode é nativo:
        </p>
        <CodeBlock lang="ts">{`import { decodeErrorResult } from 'viem';

const decoded = decodeErrorResult({
  abi: vaultAbi,
  data: '0x...erro do revert...',
});
// { errorName: 'InsufficientBalance', args: [100n, 42n] }`}</CodeBlock>
      </Section>

      <Section title="immutable vs constant — quando usar cada" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'constant', 'immutable']}
          rows={[
            ['Quando setado', 'Compile time (literal no código)', 'Deploy time (constructor)'],
            ['Onde fica', 'Inlined em bytecode', 'PUSH32 patched no runtime bytecode'],
            ['Gas leitura', '3 gas (PUSH)', '3 gas (PUSH)'],
            ['vs SLOAD storage', '~700x mais barato (cold)', '~700x mais barato (cold)'],
            ['Pode ler ENV/constructor args?', 'Não', 'Sim'],
            ['Caso típico', 'MAX_SUPPLY, CHAIN_ID_TEST, papel de hash domain', 'owner, WETH addr, factory addr, fee BPs por instância'],
          ]}
        />
        <CodeBlock lang="solidity">{`contract Token {
    uint256 public constant MAX_SUPPLY = 1_000_000e18;     // literal
    address public immutable factory;                        // deploy-time
    address public immutable WETH;                           // injetado por rede

    constructor(address _weth) {
        factory = msg.sender;
        WETH    = _weth;
    }
}`}</CodeBlock>
      </Section>

      <Section title="Transient storage (EIP-1153): o novo padrão de reentrancy guard" accent={accent}>
        <CodeBlock lang="solidity">{`// Solidity 0.8.24+
pragma solidity 0.8.24;

contract NonReentrantTransient {
    // Slot transient explicito
    bytes32 private constant LOCK_SLOT =
        keccak256("nonreentrant.lock");

    error Reentrancy();

    modifier nonReentrant() {
        bytes32 slot = LOCK_SLOT;
        assembly {
            if tload(slot) { revert(0, 0) }
            tstore(slot, 1)
        }
        _;
        assembly { tstore(slot, 0) }
    }

    function deposit() external nonReentrant payable {
        // logica
    }
}`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Gas TSTORE', v: '~100 gas (vs 20.000+ de SSTORE em slot zero)' },
            { k: 'Persistência', v: 'Vive só durante a transação atual' },
            { k: 'Cleanup', v: 'Automático ao fim da tx (não precisa zerar)' },
            { k: 'Caso Uniswap V4', v: 'Hooks usam transient para passar contexto entre poolManager.unlock() e callback' },
            { k: 'Limitação', v: 'Não persiste — não usar para estado de longo prazo' },
          ]}
        />
        <Callout tone="info" icon="📖">
          Buterin et al especificaram EIP-1153 em 2018; foram 6 anos até ativação. O artigo de
          Sam Wilson e Mark Tyneway no blog da Optimism (mar/2024) detalha implementação em clients.
        </Callout>
      </Section>

      <Section title="Fuzzing e invariant testing" accent={accent}>
        <CodeBlock lang="solidity">{`// test/Vault.t.sol
pragma solidity 0.8.24;

import "forge-std/Test.sol";
import {Vault} from "../src/Vault.sol";

contract VaultTest is Test {
    Vault vault;

    function setUp() public {
        vault = new Vault(address(this));
    }

    // Fuzz: Foundry sortei N runs (default 256) de amount
    function testFuzz_DepositWithdraw(uint96 amount) public {
        vm.assume(amount > 0);
        vm.deal(address(this), amount);
        vault.deposit{value: amount}();
        uint256 balBefore = address(this).balance;
        vault.withdraw(amount);
        assertEq(address(this).balance, balBefore + amount);
    }

    // Bounded fuzz: assume estreita o espaco
    function testFuzz_BoundedWithdraw(uint256 dep, uint256 wd) public {
        dep = bound(dep, 1, 1_000 ether);
        wd  = bound(wd,  1, dep);
        vm.deal(address(this), dep);
        vault.deposit{value: dep}();
        vault.withdraw(wd);
    }
}`}</CodeBlock>
        <p>
          Invariant testing vai além: define-se propriedades globais (e.g. &quot;soma de saldos == saldo
          do contrato&quot;) e Foundry chama sequências aleatórias de funções de um handler.
        </p>
        <CodeBlock lang="solidity">{`// test/invariant/Vault.invariant.t.sol
contract VaultInvariantTest is Test {
    Vault vault;
    Handler handler;

    function setUp() public {
        vault   = new Vault(address(this));
        handler = new Handler(vault);
        targetContract(address(handler));
    }

    function invariant_SolvencyHolds() public {
        assertGe(address(vault).balance, handler.ghost_totalDeposited());
    }
}`}</CodeBlock>
        <Callout tone="success" icon="🎯">
          Trail of Bits e Spearbit popularizaram invariants em audits. Echidna (mesma família, mais
          velho) é alternativa em Haskell. Para DeFi sério, sem invariant tests = sem auditoria séria.
        </Callout>
      </Section>

      <Section title="Gas snapshots e --via-ir" accent={accent}>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Workflow de gas regression"
          steps={[
            { label: 'forge snapshot', desc: 'Roda todos testes e salva gas usage em .gas-snapshot' },
            { label: 'commit do snapshot', desc: 'Versionar no git para baseline reproduzível' },
            { label: 'PR alterando contratos', desc: 'CI roda forge snapshot --check e falha se gas regrediu' },
            { label: 'Aprovação consciente', desc: 'Se a regressão é esperada, atualizar snapshot no PR' },
          ]}
        />
        <CodeBlock lang="toml">{`# foundry.toml
[profile.default]
solc_version  = "0.8.24"
optimizer     = true
optimizer_runs = 10_000        # mais alto = melhor para hot paths
via_ir        = true            # IR pipeline
evm_version   = "cancun"
fuzz          = { runs = 1000 }
invariant     = { runs = 256, depth = 64, fail_on_revert = false }

[profile.ci]
fuzz          = { runs = 10000 }
verbosity     = 3`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          <strong>via-IR não é grátis</strong>: build 5–20x mais lento. Em alguns hot paths, gera bytecode pior que o legacy. Sempre comparar gas snapshots antes/depois e medir em forks reais via <InlineCode>forge test --fork-url</InlineCode>.
        </Callout>
      </Section>

      <Section title="cast: o canivete suíço CLI" accent={accent}>
        <CodeBlock lang="bash">{`# decodar selector desconhecido (consulta 4byte.directory)
cast 4byte 0xa9059cbb
# transfer(address,uint256)

# chamar funcao view em mainnet
cast call 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 \\
  "balanceOf(address)(uint256)" \\
  0x... --rpc-url $MAINNET_RPC

# enviar tx
cast send 0x... "approve(address,uint256)" 0xspender 1000 \\
  --private-key $PK --rpc-url $RPC

# simular tx historica com trace
cast run 0x_HASH_DA_TX --rpc-url $RPC

# estimar storage layout
forge inspect Vault storage-layout

# decodar calldata
cast calldata-decode "transfer(address,uint256)" 0xa9059cbb...

# converter unidades
cast --to-wei 1.5 ether
cast --to-unit 1500000000 gwei`}</CodeBlock>
      </Section>

      <Section title="anvil: fork local mainnet" accent={accent}>
        <CodeBlock lang="bash">{`# subir fork de mainnet no bloco atual
anvil --fork-url $MAINNET_RPC

# fork em bloco especifico (reproducibilidade)
anvil --fork-url $MAINNET_RPC --fork-block-number 19000000

# impersonar account (sem precisar PK)
cast rpc anvil_impersonateAccount 0xVITALIK --rpc-url http://localhost:8545
cast send 0xTOKEN "transfer(address,uint256)" 0xME 1000 \\
  --from 0xVITALIK --unlocked --rpc-url http://localhost:8545

# resetar estado para outro bloco no meio do teste
cast rpc anvil_reset \\
  '{"forking":{"jsonRpcUrl":"'$RPC'","blockNumber":19000000}}'`}</CodeBlock>
        <Callout tone="info" icon="🧪">
          Para testes de integração reais (testar contra Uniswap V3 mainnet, por exemplo),{' '}
          <InlineCode>forge test --fork-url $MAINNET_RPC</InlineCode> dá acesso ao estado real sem
          mockar. Cuidado com rate limits do RPC; use Alchemy/Infura archival ou anvil local com
          cache.
        </Callout>
      </Section>

      <Section title="Padrões anti-pattern que ainda aparecem em código novo" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Anti-pattern', 'Por que ruim', 'Correto em 2026']}
          rows={[
            ['require("InsufficientBalance: amount...")', 'String concat gasta gas, decodificação manual', 'error InsufficientBalance(uint a, uint b)'],
            ['SafeMath.add/sub', 'Solidity 0.8+ checa overflow nativo', 'Aritmética normal; unchecked { } onde provado seguro'],
            ['ReentrancyGuard com uint256 storage', 'SSTORE/SLOAD caros mesmo com refund', 'EIP-1153 transient (Cancun+)'],
            ['address public owner; setOwner(...)', 'Sem 2-step transfer = bricks', 'Ownable2Step (OZ) ou access control de role'],
            ['Hardhat + ethers v5 + chai', 'Build lento, JS/Solidity context switch', 'Foundry + forge-std (test em Solidity)'],
            ['tx.origin para auth', 'Vulnerável a phishing contracts', 'msg.sender + signature schemes (ECDSA, EIP-712)'],
            ['block.timestamp como source of randomness', 'Manipulável por validators (±15s)', 'Chainlink VRF, drand, ou esperar EIP-4399 RANDAO'],
          ]}
        />
      </Section>

      <Section title="EIP-712 typed structured data: o padrão de signing" accent={accent}>
        <CodeBlock lang="solidity">{`// Permit: aprovar gastando assinatura, sem precisar approve() + transferFrom()
pragma solidity 0.8.24;

contract Token is EIP712 {
    bytes32 private constant PERMIT_TYPEHASH = keccak256(
        "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
    );

    mapping(address => uint256) public nonces;

    constructor() EIP712("MyToken", "1") {}

    function permit(
        address owner_,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v, bytes32 r, bytes32 s
    ) external {
        require(block.timestamp <= deadline, "expired");
        bytes32 structHash = keccak256(abi.encode(
            PERMIT_TYPEHASH, owner_, spender, value, nonces[owner_]++, deadline
        ));
        bytes32 digest = _hashTypedDataV4(structHash);
        address recovered = ECDSA.recover(digest, v, r, s);
        require(recovered == owner_, "bad sig");
        _approve(owner_, spender, value);
    }
}`}</CodeBlock>
        <p>
          EIP-712 (Latifi, 2017) padroniza signing de structs com domain separator
          (nome+versão+chainId+contrato), evitando replay entre chains e contratos. Hoje é base de
          permit (EIP-2612), Permit2 (Uniswap), meta-tx, ERC-4337 user operations.
        </p>
      </Section>

      <Section title="Quando ainda usar Hardhat" accent={accent}>
        <ul className="ffv-list">
          <li>
            Time grande já investido em scripts JS/TS de deploy/migration que dependem de plugins
            específicos do Hardhat (hardhat-deploy, tenderly plugin, etc).
          </li>
          <li>
            Integração com TypeScript-heavy backend (subgraph generators, indexers) onde o tipo
            gerado pelo TypeChain é amplamente consumido — Foundry tem typegen mas o ecossistema JS
            é mais maduro.
          </li>
          <li>
            Casos onde o legado tem mais peso que ganhos de DX/velocidade. Não comece projetos novos
            em Hardhat se a equipe não tem motivos fortes.
          </li>
        </ul>
        <Callout tone="info" icon="🧭">
          Em 2026, dado o mesmo greenfield, Foundry + viem + wagmi é o stack default. Hardhat
          continua útil onde scripts JS são vantagem; mesmo lá, considerar
          <InlineCode>forge script</InlineCode> em vez de scripts JS.
        </Callout>
      </Section>

      <Section title="Checklist para contrato production-ready" accent={accent}>
        <ul className="ffv-list">
          <li>Solidity ≥ 0.8.20, via-IR habilitado, optimizer_runs apropriado a hot paths.</li>
          <li>Custom errors em todos os reverts (zero require com string).</li>
          <li>immutable para qualquer endereço/parâmetro injetado em deploy.</li>
          <li>Transient storage para reentrancy guards quando 0.8.24+ e Cancun-only.</li>
          <li>Foundry tests com cobertura ≥ 90% + fuzz runs ≥ 1000 + invariants para componentes críticos.</li>
          <li>Gas snapshot versionado e CI bloqueando regressão sem aprovação consciente.</li>
          <li>Ownable2Step (transferência em 2 passos) para roles administrativas.</li>
          <li>EIP-712 + nonces para qualquer signing off-chain consumido on-chain.</li>
          <li>Slither e mythril rodando em CI; resultados triados e justificados.</li>
          <li>Audit externo de pelo menos uma firma sênior (Trail of Bits, Spearbit, OpenZeppelin, Code4rena contests) antes de deploy com valor real.</li>
        </ul>
      </Section>

      <Section title="Leituras recomendadas" accent={accent}>
        <ul className="ffv-list">
          <li>Solidity Docs — <InlineCode>docs.soliditylang.org</InlineCode> (releases notes 0.8.x).</li>
          <li>Foundry Book — <InlineCode>book.getfoundry.sh</InlineCode>.</li>
          <li>EIP-1153 — transient storage (Buterin, Robinson et al).</li>
          <li>EIP-712 — typed structured data hashing and signing (Latifi).</li>
          <li>Paradigm blog — gakonst e o time de Foundry publicam padrões avançados.</li>
          <li>Trail of Bits blog — &quot;Building Secure Contracts&quot; e checklists pós-audit.</li>
          <li>Vitalik&apos;s posts em <InlineCode>vitalik.eth.limo</InlineCode> — context histórico de EIPs e roadmap Ethereum.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
