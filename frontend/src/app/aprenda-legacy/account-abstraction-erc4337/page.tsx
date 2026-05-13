import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, ArchFlow, Timeline } from '@/components/article/primitives';

export const metadata = getModuleMetadata('account-abstraction-erc4337');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual problema fundamental ERC-4337 resolve?',
    options: [
      'Latência de tx',
      'EOA (Externally Owned Accounts) clássicas têm regras rígidas: signer único ECDSA secp256k1, nonce sequencial, sem pré-condições programáveis, sem batch, sem paymaster, sem recovery. ERC-4337 introduz "smart accounts" — wallets que são contratos com lógica customizada de validação: multi-sig, social recovery, session keys, gas paid by paymaster, batch ops, signing schemes alternativos (passkeys WebAuthn, ed25519). Sem hard fork',
      'Latência de bloco',
      'Custo de storage',
    ],
    correct: 1,
    explanation: 'Account abstraction é a ideia de tornar contas programáveis. Tentativas prévias (EIP-86, EIP-2938) exigiam mudança de protocolo. ERC-4337 (Buterin, Wahrstätter, Glicksman, Wuille, Tjiam, 2023) é o primeiro design viável sem hard fork: usa mempool separado de UserOperations, contrato singleton EntryPoint, e atores off-chain (bundlers, paymasters). EIP-7702 (Buterin, 2024+) é o passo seguinte: dá superpoder de smart account a EOAs existentes via tx temporária de delegate.',
  },
  {
    question: 'Qual é o papel de cada ator no fluxo ERC-4337?',
    options: [
      'São equivalentes',
      'Smart Account: contrato com função validateUserOp(). EntryPoint: singleton (0x...4337) que recebe UserOperations, invoca validate→execute. Bundler: nó off-chain que coleta UserOps do mempool dedicado e submete bundle (até N) ao EntryPoint via handleOps(). Paymaster: contrato opcional que paga gas em nome do user (gasless UX); aprova ou rejeita patrocínio. Aggregator: opcional, agrega assinaturas (BLS, schnorr) para reduzir custo on-chain',
      'Só EntryPoint importa',
      'Apenas bundler',
    ],
    correct: 1,
    explanation: 'A arquitetura 4337 separa responsabilidades. EntryPoint é o trust anchor (singleton auditado, deployado em address determinístico, 0x...4337). Smart account define lógica de validação (ECDSA, WebAuthn passkey, multi-sig). Bundler é como block proposer mas para UserOps — submete tx que carrega múltiplas UserOps. Paymaster permite "gasless": user assina UserOp, paymaster valida regra (ex: "patrocino se user comprou NFT X") e paga em ETH. Aggregator (opcional) reduz cost com sig aggregation (BLS).',
  },
  {
    question: 'O que diferencia EIP-7702 de ERC-4337?',
    options: [
      'EIP-7702 é deprecated',
      'EIP-7702 (Pectra hard fork, ativado 2025) permite que uma EOA "instale" temporariamente código de smart account via signed delegation. Tx tipo-4 inclui authorization tuple (chain_id, address, nonce, sig); durante a tx, EOA é tratada como tendo o code do delegate. Resolve: usuários com EOA existente ganham features de smart account (batch, paymaster) sem migrar wallet. Complementar a 4337, não substituto',
      'É só para testnet',
      'Não usa smart contracts',
    ],
    correct: 1,
    explanation: 'EIP-7702 (Buterin, fevereiro 2024) preencheu lacuna entre EOAs e smart accounts. Antes: pra usar AA, precisava criar nova smart account address (migração de saldo, ecossistema social não-portável). Com 7702: EOA assina authorization tuple permitindo que code de X seja anexado durante a tx. Smart EOAs ganham batch ops, session keys, paymaster — sem mudar endereço. Implementadas em wagmi v2 via writeContract type-4. Bundlers 4337 estão adaptando para aceitar smart EOAs.',
  },
  {
    question: 'O que são "session keys" e por que importam para UX?',
    options: [
      'São wallets descartáveis',
      'Chave secundária, limitada em escopo (target contract, função, valor máx, tempo de vida), que pode assinar UserOps específicos sem reprompt da chave master. Caso típico: jogo on-chain que precisa de 50 ações/min — user autoriza session key por 1h restrita ao game contract. Wallet master fica offline. Implementado via validateUserOp() que aceita assinatura de session key se policy permitir',
      'Substituem private keys',
      'São deprecated',
    ],
    correct: 1,
    explanation: 'Session keys são o padrão UX-killer de smart accounts. Sem AA, cada tx exige confirmação da master key — destrói flow de jogos, perpetual trading bots, scheduled actions. Com session keys (implementadas em Privy, Biconomy, ZeroDev): user assina uma vez "session válida por 1h, gasta até 0.1 ETH, só pode chamar 0xGame.move()". Bundler aceita UserOps assinadas pela session key durante a janela. Combinado com paymaster, gasless gaming/trading vira viável.',
  },
  {
    question: 'Qual a diferença entre Stackup, Pimlico, ZeroDev e Alchemy AA?',
    options: [
      'Não há diferença',
      'Bundler-as-a-service providers, todos compatíveis com 4337. Stackup (pioneiro, open-source bundler "rip"). Pimlico (full stack: bundler + paymaster + SDK; popular em prod). ZeroDev (SDK Kernel; modular validators, session keys robustas). Alchemy AA (parte da plataforma Alchemy, SDK + bundler + integração com gas manager). Decisão: time já em Alchemy stack → Alchemy AA; gaming/dApps custom → ZeroDev ou Pimlico; auto-hospedado → Stackup',
      'Substituem ERC-4337',
      'São wallets',
    ],
    correct: 1,
    explanation: 'O mercado de infraestrutura AA explodiu em 2023-2025. Cada player oferece bundler RPC compatível (eth_sendUserOperation), paymaster gerenciado (gas sponsorship policies via dashboard), e SDK que abstrai criar/assinar UserOps. ZeroDev se diferencia com Kernel — smart account modular (validators plugaveis para passkey, ECDSA, multi-sig). Pimlico tem o melhor SDK + ergonomia em 2026. Alchemy AA integra com indexers e gas manager. Em projetos novos, ZeroDev e Pimlico dominam mindshare.',
  },
  {
    question: 'Qual é o "gas overhead" de uma tx 4337 vs tx EOA normal?',
    options: [
      'Zero overhead',
      'Tx 4337 carrega UserOp + verificação no EntryPoint + chamada ao smart account + execução. Overhead típico: ~30-60k gas por UserOp acima do equivalente EOA. Batch (várias UserOps numa handleOps) amortiza o overhead. Em L2 com 4844, custo absoluto continua centavos. Trade-off: paga ~2x mais gas que EOA simples, ganha programabilidade total. Vale para apps onde UX > $0.05',
      'Sempre 10x mais caro',
      'Sempre mais barato',
    ],
    correct: 1,
    explanation: 'Overhead vem de: signature verification mais cara (vs PRECOMPILE ECRECOVER), state writes para nonce/limit, chamada cross-contract de EntryPoint → account → target. Em L1 com gas alto, isso é mensurável. Em L2 com EIP-4844, fração de centavo. Estratégias para mitigar: (1) aggregator com BLS sig aggregation reduz ~10k por UserOp em bundle; (2) batch via account.executeBatch() amortiza fixed costs; (3) Kernel-style modular validators reduzem boilerplate.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="account-abstraction-erc4337"
      title="Account Abstraction (ERC-4337): wallet sem seed phrase"
      icon="🔐"
      xp={75}
      readTime={15}
      trailName="Web3 Engineering Pragmático"
      trailColor={accent}
      nextSlug="mev-defesa"
      nextTitle="MEV: como atacantes lucram com seu trade — e como se defender"
      quiz={quiz}
    >
      <Section title="Por que account abstraction destrava Web3 retail" accent={accent}>
        <p>
          O modelo EOA (Externally Owned Account) original do Ethereum tem limitações brutais:
          uma chave ECDSA secp256k1 controla tudo, nonce é sequencial, não há pré-condições nem
          recovery, gas vem do mesmo signer, batch é truque de aplicação. Para retail, isso vira:
          seed phrase de 12 palavras, ETH na carteira antes de fazer qualquer coisa, erro fatal em
          assinatura de phishing.
        </p>
        <p>
          <strong>Account Abstraction</strong> torna contas programáveis: a lógica de validação,
          quem paga gas, como recuperar acesso — tudo vira código. ERC-4337 fez isso sem hard fork
          em 2023. EIP-7702 estendeu para EOAs existentes em 2025.
        </p>
        <Callout tone="success" icon="🎯">
          Em 2026, todos os principais L2s têm AA em produção e adoção crescente:
          Coinbase Smart Wallet (Base), zkSync nativo, Polygon AA, Worldcoin, gaming chains —
          milhões de UserOperations por semana segundo dados de Jiffyscan e Bundlebear.
        </Callout>
      </Section>

      <Section title="Timeline de Account Abstraction" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { when: '2016', label: 'EIP-86 (Buterin)', detail: 'Primeira proposta de AA via tx tipo zero. Não avançou — risco DoS no mempool.' },
            { when: '2020', label: 'EIP-2938', detail: 'Segunda tentativa, mais formal. Travou em complexidade de consenso.' },
            { when: 'Set 2021', label: 'ERC-4337 rascunho', detail: 'Buterin et al propõem AA sem hard fork via mempool alternativo + EntryPoint.' },
            { when: 'Mar 2023', label: 'ERC-4337 v0.6 mainnet', detail: 'EntryPoint deployado em todos os majors. Stackup lança primeiro bundler open-source.' },
            { when: '2024', label: 'EntryPoint v0.7', detail: 'Otimizações de gas, melhor support a paymasters, BLS aggregator.' },
            { when: 'Fev 2024', label: 'EIP-7702 proposto', detail: 'Buterin: EOAs ganham smart account features via signed delegation.' },
            { when: 'Mai 2025', label: 'Pectra hard fork', detail: 'EIP-7702 ativado em mainnet. Wallets como Ambire/MetaMask integram.' },
            { when: '2026', label: 'EntryPoint v0.8 + nativos em L2', detail: 'zkSync, StarkNet têm AA nativo. EIP-7702 mainstream em wallets.' },
          ]}
        />
      </Section>

      <Section title="A arquitetura ERC-4337" accent={accent}>
        <ArchFlow
          accent={accent}
          title="Fluxo de UserOperation"
          columns={[
            {
              header: 'Off-chain',
              items: [
                'User wallet — Cria UserOperation: sender, nonce, callData, gasLimits, paymasterAndData, signature',
                'Mempool 4337 — P2P separado do mempool de tx normais. Bundlers escutam.',
                'Bundler — Simula UserOps, valida, agrega em bundle, envia handleOps() ao EntryPoint via tx EOA',
              ],
            },
            {
              header: 'On-chain',
              items: [
                'EntryPoint singleton — Recebe handleOps([userOps]). Loop: validate → pay gas → execute',
                'Smart Account — validateUserOp(op, hash, prefund): valida sig, sobe nonce, paga prefund. execute(call): roda action',
                'Paymaster (opcional) — validatePaymasterUserOp(op, hash, maxCost): decide se patrocina; postOp() para refund',
              ],
            },
          ]}
        />
      </Section>

      <Section title="UserOperation: a estrutura central" accent={accent}>
        <CodeBlock lang="solidity">{`struct PackedUserOperation {
    address sender;              // smart account
    uint256 nonce;               // nonce do account (key + sequence)
    bytes   initCode;            // se account ainda nao deployado, code+salt pra deploy
    bytes   callData;            // que action executar (geralmente account.execute(target, value, data))
    bytes32 accountGasLimits;    // verificationGasLimit + callGasLimit (packed)
    uint256 preVerificationGas;  // gas off-chain do bundler (overhead da tx EOA)
    bytes32 gasFees;             // maxPriorityFeePerGas + maxFeePerGas (packed)
    bytes   paymasterAndData;    // se vazio = user paga; caso contrario = paymaster contract + data
    bytes   signature;           // assinatura validada pelo smart account
}

// Hash da UserOp (sem signature):
function getUserOpHash(PackedUserOperation op) view returns (bytes32) {
    return keccak256(abi.encode(
        keccak256(abi.encodePacked(
            op.sender, op.nonce, keccak256(op.initCode), keccak256(op.callData),
            op.accountGasLimits, op.preVerificationGas, op.gasFees,
            keccak256(op.paymasterAndData)
        )),
        address(this),  // EntryPoint
        block.chainid
    ));
}`}</CodeBlock>
      </Section>

      <Section title="Smart Account mínimo (validateUserOp)" accent={accent}>
        <CodeBlock lang="solidity">{`// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { IAccount } from "@account-abstraction/contracts/interfaces/ IAccount .sol";
import { PackedUserOperation } from "@account-abstraction/contracts/interfaces/ PackedUserOperation .sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ ECDSA .sol";

contract SimpleAccount is IAccount {
    address public immutable owner;
    address public immutable entryPoint;
    uint256 public nonce;

    error InvalidSignature();
    error InvalidNonce();
    error NotFromEntryPoint();

    constructor(address _owner, address _entryPoint) {
        owner = _owner;
        entryPoint = _entryPoint;
    }

    modifier onlyEntryPoint() {
        if (msg.sender != entryPoint) revert NotFromEntryPoint();
        _;
    }

    function validateUserOp(
        PackedUserOperation calldata op,
        bytes32 userOpHash,
        uint256 missingFunds
    ) external onlyEntryPoint returns (uint256 validationData) {
        // 1. Verifica nonce (simples, sem key separation)
        if (op.nonce != nonce) revert InvalidNonce();
        unchecked { nonce++; }

        // 2. Verifica assinatura ECDSA do owner
        bytes32 ethHash = ECDSA.toEthSignedMessageHash(userOpHash);
        address signer = ECDSA.recover(ethHash, op.signature);
        if (signer != owner) revert InvalidSignature();

        // 3. Pre-paga gas ao EntryPoint
        if (missingFunds > 0) {
            (bool ok,) = payable(entryPoint).call{value: missingFunds}("");
            require(ok, "prefund fail");
        }

        // 4. validationData = 0 = valid, sem time bounds; pode codificar validUntil/validAfter
        return 0;
    }

    function execute(address target, uint256 value, bytes calldata data)
        external onlyEntryPoint returns (bytes memory)
    {
        (bool ok, bytes memory result) = target.call{value: value}(data);
        require(ok, "exec fail");
        return result;
    }

    receive() external payable {}
}`}</CodeBlock>
        <Callout tone="info" icon="🧪">
          Em produção, prefira <strong>Kernel</strong> (ZeroDev), <strong>SimpleAccount</strong> da
          eth-infinitism reference (Yoav et al.), ou <strong>Safe</strong> (Gnosis) com módulo 4337.
          São auditados, modulares e suportam plugins de validação.
        </Callout>
      </Section>

      <Section title="Paymasters: gas patrocinado e UX gasless" accent={accent}>
        <CodeBlock lang="solidity">{`contract SponsorPaymaster is IPaymaster {
    address public immutable entryPoint;
    address public immutable owner;
    mapping(address => bool) public sponsoredApps;

    function validatePaymasterUserOp(
        PackedUserOperation calldata op,
        bytes32 userOpHash,
        uint256 maxCost
    ) external view returns (bytes memory context, uint256 validationData) {
        // Politica: patrocinamos se o callData chama um app conhecido
        address target = address(bytes20(op.callData[16:36]));
        require(sponsoredApps[target], "not sponsored");
        require(maxCost <= 0.01 ether, "too expensive");
        return ("", 0);  // 0 = valid
    }

    function postOp(...) external {
        // Refund logic se necessario
    }
}`}</CodeBlock>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="UX gasless completa"
          steps={[
            { label: 'User abre dApp', desc: 'Sem ETH na wallet. Sem entender gas.' },
            { label: 'dApp prepara UserOp', desc: 'Inclui paymasterAndData com address do sponsor paymaster.' },
            { label: 'User assina', desc: 'Wallet mostra "executar X" — não menciona gas.' },
            { label: 'Bundler submete', desc: 'EntryPoint valida sig + valida paymaster + executa.' },
            { label: 'Paymaster paga ETH', desc: 'Reembolsado off-chain pelo dApp (USDC, fiat, créditos).' },
          ]}
        />
      </Section>

      <Section title="Session keys: o killer feature de gaming/trading" accent={accent}>
        <CodeBlock lang="ts">{`// Pseudocódigo com ZeroDev/Kernel SDK
import { createKernelAccount, createSessionKeySigner } from '@zerodev/sdk';
import { ParamCondition } from '@zerodev/session-key';

// 1. User cria session key restrita
const sessionKey = generatePrivateKey();
const permission = {
  target: GAME_CONTRACT,
  abi: gameAbi,
  functionName: 'move',
  // Permite só certo enum de argumentos
  args: [
    { condition: ParamCondition.LESS_THAN_OR_EQUAL, value: 100n },  // dist max 100
  ],
  valueLimit: parseEther('0'),  // sem ETH
  validAfter: now,
  validUntil: now + 60 * 60,    // 1 hora
};

// 2. Master account assina autorizacao da session key
const enabledKernel = await account.enableSessionKey(sessionKey.address, permission);

// 3. Game backend usa session key para enviar UserOps automaticamente
const sessionSigner = createSessionKeySigner({ sessionKey, kernel: enabledKernel });
await sessionSigner.sendUserOperation({
  callData: encodeFunctionData({ abi: gameAbi, functionName: 'move', args: [42n] }),
});
// Não pede assinatura ao user — session já autorizou`}</CodeBlock>
      </Section>

      <Section title="EIP-7702: smart accounts em EOAs existentes" accent={accent}>
        <CodeBlock lang="ts">{`// Type-4 tx (set code) — viem suporta nativamente
import { walletClient } from '@/lib/wagmi';

// Authorization assina: "EOA permite usar code de X até nonce Y"
const authorization = await walletClient.signAuthorization({
  contractAddress: BATCH_DELEGATE_CONTRACT,
  nonce: currentNonce,
});

// Tx normal + authorization tuple
const hash = await walletClient.sendTransaction({
  authorizationList: [authorization],
  to: walletClient.account.address,    // chama a propria EOA
  data: encodeFunctionData({
    abi: batchDelegateAbi,
    functionName: 'executeBatch',
    args: [calls],
  }),
});`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Vantagem 1', v: 'EOAs existentes ganham batch, paymaster, session keys sem migrar address' },
            { k: 'Vantagem 2', v: 'Compatibilidade total com ecossistema atual — mesma chave, mesmo address' },
            { k: 'Riscos novos', v: 'Phishing de authorization (user assina delegate maligno = wallet drenada). UX de revogação importa.' },
            { k: 'Adoção 2026', v: 'MetaMask, Ambire, Rabby integraram. wagmi v2 expõe via writeContract type-4.' },
          ]}
        />
      </Section>

      <Section title="O ecossistema de infraestrutura 4337" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Provider', 'Forte em', 'SDK', 'Quando escolher']}
          rows={[
            ['Pimlico', 'Bundler + paymaster + permissionless.js', 'Excelente DX, full-stack', 'Stack production-ready com gas sponsorship'],
            ['ZeroDev', 'Kernel smart account modular, validators plug-and-play', 'Kernel SDK, session keys robustas', 'Gaming, social apps com complex permissions'],
            ['Alchemy AA', 'Bundler + paymaster + gas manager + indexer', 'aa-sdk', 'Time já na Alchemy stack'],
            ['Stackup', 'Bundler open-source ("rip")', 'userop.js', 'Self-hosted, indie projects'],
            ['Biconomy', 'Multi-chain, full SDK, MEE (multi-chain bundler)', 'Smart Account SDK', 'Apps cross-chain'],
            ['Safe (Gnosis)', 'Multi-sig com módulo 4337', 'Safe SDK', 'DAOs, treasury management'],
            ['Coinbase Smart Wallet', 'Passkey-first, gasless em Base', 'cb-wallet SDK', 'Apps Base-first, retail'],
          ]}
        />
      </Section>

      <Section title="Padrões de validação não-ECDSA" accent={accent}>
        <ul className="ffv-list">
          <li>
            <strong>WebAuthn / Passkeys</strong>: assinatura via FaceID/TouchID, sem seed.
            Coinbase Smart Wallet pioneiro em produção. Verificação on-chain via P256 precompile
            (RIP-7212) ou solidity puro.
          </li>
          <li>
            <strong>Multi-sig nativo</strong>: smart account aceita N de M assinaturas (Safe pattern).
            Útil pra treasury, multi-device user.
          </li>
          <li>
            <strong>Social recovery</strong>: lista de &quot;guardians&quot; pode recuperar acesso via
            quorum. Argent, Sign Wallet implementam.
          </li>
          <li>
            <strong>BLS aggregation</strong>: aggregator junta N assinaturas em 1 (96 bytes).
            Reduz custo on-chain em bundles grandes.
          </li>
        </ul>
      </Section>

      <Section title="Riscos e armadilhas" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          <strong>Storage access regras estritas no bundler</strong>: validateUserOp tem regras de
          mempool (ERC-7562) que limitam quais slots/storage podem ser lidos durante simulação.
          Bundler rejeita UserOps que violam — sintoma é &quot;not staked&quot; ou similar. Sempre testar
          em mempool real.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>EIP-7702 phishing</strong>: assinar authorization para contrato malicioso = wallet
          drained. Wallets precisam de UX clara separando &quot;delegate code&quot; de &quot;send tx&quot;. Ambire,
          MetaMask publicaram threat models específicos.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>Paymaster denial-of-service</strong>: paymaster patrocinador pode ser abusado pra
          drenar saldo. Sempre rate-limit por user/IP/feature, e simular custo antes de aprovar.
        </Callout>
      </Section>

      <Section title="Leituras recomendadas" accent={accent}>
        <ul className="ffv-list">
          <li>ERC-4337 — leia o texto oficial (Buterin, Wahrstätter et al, eips.ethereum.org).</li>
          <li>EIP-7702 — &quot;Set EOA account code for one transaction&quot; (Buterin, 2024).</li>
          <li>ERC-7562 — &quot;Validation Rules for Account Abstraction&quot;.</li>
          <li>eth-infinitism — github.com/eth-infinitism/account-abstraction (reference impl).</li>
          <li>Yoav Weiss talks — co-autor 4337, explicações no Devcon e ETHGlobal.</li>
          <li>Pimlico, ZeroDev, Alchemy AA — documentação oficial de cada SDK.</li>
          <li>Jiffyscan e Bundlebear — analytics da rede 4337 em produção.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
