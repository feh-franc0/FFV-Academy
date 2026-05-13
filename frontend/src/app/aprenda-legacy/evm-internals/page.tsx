import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, StackFlow, AnnotatedFormula } from '@/components/article/primitives';

export const metadata = getModuleMetadata('evm-internals');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que a EVM é uma stack machine de 256 bits e não de 64?',
    options: [
      'Hardware moderno é nativamente 256-bit',
      'Decisão de design para que operações criptográficas (keccak256, ECDSA, EC point coords) caibam num único slot. Custo: aritmética 256-bit é cara em CPUs 64-bit (mais ciclos) — daí gas elevado. Trade-off explícito por simplicidade e match com a criptografia subjacente do Ethereum',
      'Compatibilidade com Windows',
      'Por causa de Solidity',
    ],
    correct: 1,
    explanation: 'Vitalik defende no Yellow Paper e em posts que 256-bit alinhou-se ao tamanho de hashes (keccak256), assinaturas (r, s), endereços (cabem em 256 com padding) e BigInt aritmético tipicamente usado em smart contracts. CPUs modernas processam 256-bit em 4–8 instruções 64-bit, daí ADD custa 3 gas (relativamente caro). MUL é 5, EXP escala com bytes. Otimizar gas é frequentemente otimizar o número de operações 256-bit.',
  },
  {
    question: 'O que muda entre SLOAD cold e SLOAD warm em EIP-2929?',
    options: [
      'Nada',
      'EIP-2929 (Berlin, abril 2021) introduziu access lists: a primeira leitura de um slot na tx custa 2100 gas (cold). Leituras subsequentes do mesmo slot custam 100 gas (warm). Idem para CALL a addr cold (2600) vs warm (100). Reduz incentivo a contracts gigantes e prepara terreno para stateless clients',
      'Cold é grátis',
      'Warm sempre custa 5000',
    ],
    correct: 1,
    explanation: 'Antes de EIP-2929, SLOAD custava 800 gas constante. O EIP mudou: 2100 cold, 100 warm. Mesmo padrão pra SSTORE, BALANCE, EXTCODESIZE, EXTCODECOPY, EXTCODEHASH, CALL family. Motivação dupla: (1) aproximar gas do custo real de I/O do disco no client; (2) habilitar tx access lists (EIP-2930) onde o sender pré-declara slots a serem warmed, baixando gas total. Hot paths em DeFi frequentemente precachem slots na primeira leitura e usam várias vezes.',
  },
  {
    question: 'Qual é a diferença prática entre memory e storage no custo de gas?',
    options: [
      'Memory é mais cara',
      'Memory é linear-quadrática (cresce com expansão), começa praticamente grátis e fica caro só em arrays grandes. Storage é persistente entre txs: SSTORE custa 2100/20000/5000 dependendo do estado anterior do slot (zero→non-zero é 20k, non-zero→non-zero 5k, com refunds parciais ao zerar). Diferença de ordens de magnitude — armazenar struct em storage não-trivial pode custar 100k+ gas',
      'São iguais',
      'Storage é só leitura',
    ],
    correct: 1,
    explanation: 'Memory: gas = 3*words + words²/512 (expansão quadrática para inibir alocação descontrolada). Storage segue EIP-2200: SSTORE em slot que era zero (criação) custa 20000; em slot non-zero mudando para outro non-zero, 5000 (warm) ou 7000 (cold); voltar para zero gera refund de 4800 (limitado a 1/5 do gas total da tx pelo EIP-3529). Move dados para memory ou calldata sempre que possível.',
  },
  {
    question: 'Para que serve o opcode CALLDATACOPY vs CODECOPY?',
    options: [
      'São idênticos',
      'CALLDATACOPY copia bytes do calldata (input da call atual) para memory. CODECOPY copia do bytecode próprio do contrato em execução. EXTCODECOPY de outro contrato. Em proxies, RETURNDATACOPY copia o retorno da última call. Cada um lê de espaço diferente — calldata é read-only por design, code é imutável',
      'CODECOPY é deprecated',
      'Ambos escrevem em storage',
    ],
    correct: 1,
    explanation: 'A EVM tem múltiplos data spaces: calldata (read-only input da call), code (bytecode atual), memory (read/write efêmero), storage (persistente). Cada um tem opcodes próprios. Para fazer ABI decoding em assembly, manipula-se calldata via CALLDATALOAD (32 bytes começando em offset) e CALLDATACOPY (range para memory). Proxies via delegatecall usam CALLDATACOPY + DELEGATECALL + RETURNDATACOPY + RETURN/REVERT em padrão estabelecido (e.g. EIP-1967 proxy slot).',
  },
  {
    question: 'O que é Yul e quando vale a pena escrever assembly em Solidity?',
    options: [
      'Nunca',
      'Yul é a linguagem intermediária do Solidity (Yul = Yet Underused Language). Mais baixo nível que Solidity mas mais legível que opcodes raw. Usado dentro de blocos assembly { } pra hot paths: manipulação de calldata, otimizações de loop, packed storage, EFI evita verificações de Solidity. Trade-off: você assume responsabilidade pelas checagens (overflow, bounds) que o compiler antes garantia',
      'Yul substitui Solidity',
      'Yul é só para zk-circuits',
    ],
    correct: 1,
    explanation: 'Yul é o IR do solc (pipeline via-IR é Solidity → Yul → bytecode). Em código, assembly { ... } permite escrever Yul inline. Útil quando: (1) você precisa de um opcode não exposto direto (EXTCODESIZE, TLOAD/TSTORE pré-0.8.24); (2) hot path mensurado onde Solidity adiciona checks redundantes; (3) decode de calldata customizado. Risco: perde safety nets. Code4rena tem dezenas de bugs onde assembly otimizou demais e quebrou invariante. Sempre auditar.',
  },
  {
    question: 'O que muda entre PUSH0 (EIP-3855) e PUSH1 0x00?',
    options: [
      'Nada — só sintaxe',
      'PUSH0 (Shanghai, abril 2023) é um opcode novo: 1 byte, custa 2 gas. PUSH1 0x00 é 2 bytes (opcode + literal zero), custa 3 gas. Em bytecode com muitos zeros pushados (PUSH1 0x00 aparece com frequência), trocar por PUSH0 economiza ~33% gas naquele opcode e 1 byte de calldata em deploy. Solidity 0.8.20+ emite PUSH0 quando evm_version >= shanghai',
      'PUSH0 é deprecated',
      'PUSH0 só funciona em testnets',
    ],
    correct: 1,
    explanation: 'EIP-3855 (Alex Beregszaszi, 2022) adicionou PUSH0 que empurra 0 no stack sem precisar de literal. Bytecode médio de contratos Solidity tem 2–5% de bytes economizáveis. Importante em chains L1 (deploy cost) e em runtime de hot paths. Cuidado em deploys cross-chain: alguns L2s e EVM-compat chains (BSC older versions, opcode-restricted networks) ainda não suportam Shanghai opcodes — sempre configurar evm_version na chain alvo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="evm-internals"
      title="EVM internals: opcodes, stack, gas, storage"
      icon="🖥️"
      xp={75}
      readTime={15}
      trailName="Web3 Engineering Pragmático"
      trailColor={accent}
      nextSlug="l2s-comparados-base-arbitrum"
      nextTitle="L2s comparados em 2026: Base, Arbitrum, OP, zkSync"
      quiz={quiz}
    >
      <Section title="A EVM em uma frase" accent={accent}>
        <p>
          A Ethereum Virtual Machine é uma <strong>stack machine de 256 bits, determinística,
          quase-Turing-complete (limitada por gas), com múltiplos data spaces e instruções
          que custam gas</strong>. Cada full node executa o mesmo bytecode com o mesmo gas para o
          mesmo input — daí consenso.
        </p>
        <p>
          Entender a EVM não é só curiosidade: é o que separa engenheiros que escrevem Solidity de
          decoração de quem otimiza gas, debuga reverts misteriosos, e audita contratos.
        </p>
        <Callout tone="info" icon="📖">
          A referência canônica é o <strong>Yellow Paper</strong> (Wood, 2014, atualizado). Para
          leitura mais acessível: o <em>EVM Codes</em> (<InlineCode>evm.codes</InlineCode>) catálogo
          de Smarx Wang e o <em>Beige Paper</em> (Trail of Bits, Ethereum Beige Paper).
        </Callout>
      </Section>

      <Section title="Modelo de execução: stack, memory, storage" accent={accent}>
        <StackFlow
          accent={accent}
          title="Data spaces da EVM"
          items={[
            { layer: 'Stack', desc: '1024 slots máx, cada um de 256 bits. Opera em LIFO. Quase toda operação consome ou produz items aqui.' },
            { layer: 'Memory', desc: 'Array byte linear, efêmero (vive uma call). Endereçado em bytes, lido/escrito em 32 bytes. Custo cresce quadraticamente com expansão.' },
            { layer: 'Calldata', desc: 'Input read-only da call atual. Cheap pra ler, decodificado em offset/length.' },
            { layer: 'Storage', desc: 'Persistente entre transações. Mapping de 32-byte slot → 32-byte value, por contrato.' },
            { layer: 'Transient Storage', desc: 'EIP-1153 (Cancun, 2024). Persiste só pela transação atual. TLOAD/TSTORE ~100 gas.' },
            { layer: 'Code', desc: 'Bytecode imutável do contrato. Lido via CODECOPY/EXTCODECOPY.' },
            { layer: 'Returndata', desc: 'Buffer com retorno da última subcall. RETURNDATACOPY/RETURNDATASIZE.' },
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          <strong>Pegadinha clássica</strong>: variável local <InlineCode>uint256 x</InlineCode> em
          função vai pro stack (3 gas push/pop). <InlineCode>uint256[] memory</InlineCode> vai pra
          memory (3 gas/word + expansão). <InlineCode>uint256 public x</InlineCode> vai pra storage
          (SSTORE 20k inicial). Misturar mental model é fonte fértil de bugs.
        </Callout>
      </Section>

      <Section title="Gas: como cada opcode é precificado" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Opcode', 'Gas', 'Categoria', 'Notas']}
          rows={[
            ['ADD, SUB, NOT', '3', 'Verylow', 'Aritmética básica 256-bit'],
            ['MUL, DIV, MOD', '5', 'Low', 'Multiplicação/divisão'],
            ['EXP', '10 + 50*bytes_expoente', 'Mid', 'Caro proporcional ao expoente'],
            ['SHA3 (KECCAK256)', '30 + 6*words', 'Mid', 'Hashing — cuidado com inputs grandes'],
            ['MLOAD, MSTORE', '3 + expansão', 'Verylow', 'Memory expansion é quadrática'],
            ['SLOAD (cold)', '2100', 'Storage', 'EIP-2929 primeira leitura'],
            ['SLOAD (warm)', '100', 'Storage', 'Leituras subsequentes do mesmo slot'],
            ['SSTORE (zero→non-zero)', '20000', 'Storage', 'Criação de slot'],
            ['SSTORE (non-zero→non-zero)', '5000 warm / 7000 cold', 'Storage', 'Update existing'],
            ['SSTORE (non-zero→zero)', '5000 + refund 4800', 'Storage', 'Refund cap 1/5 (EIP-3529)'],
            ['CALL (warm, no value)', '100', 'Call', 'Subcall externa warm'],
            ['CALL (cold)', '2600', 'Call', 'Primeira call ao address na tx'],
            ['CALL (com value > 0)', '+ 9000', 'Call', 'Acrescenta custo de transferência'],
            ['CREATE2', '32000 + initcode', 'Create', 'Deploy determinístico'],
            ['TLOAD, TSTORE', '100', 'Transient', 'EIP-1153, sem expansão'],
            ['LOG0..LOG4', '375 + 375*topics + 8*bytes', 'Log', 'Eventos — caros em payload grande'],
          ]}
        />
      </Section>

      <Section title="EIP-2929 + access lists: warm vs cold" accent={accent}>
        <p>
          Antes da Berlin (abril 2021), SLOAD custava 800 gas constante. EIP-2929 mudou o modelo: a
          primeira leitura/escrita/call para um par (account, slot) numa transação é{' '}
          <strong>cold</strong>, subsequentes são <strong>warm</strong>. Isso aproximou gas do
          custo real de I/O no client.
        </p>
        <CodeBlock lang="solidity">{`// Padrao caro
function bad(address token, address user) external view returns (uint256) {
    uint256 a = IERC20(token).balanceOf(user);   // cold CALL: 2600
    uint256 b = IERC20(token).balanceOf(user);   // warm CALL: 100
    return a + b;
}

// Padrao com tx access list (EIP-2930): pre-declara accounts/slots
// Em viem/ethers, type-1 tx aceita accessList: [{ address, storageKeys }]
// Util quando voce sabe exatamente o que vai tocar — desconta cold cost`}</CodeBlock>
        <Callout tone="info" icon="🧪">
          Em proxies, a primeira chamada a um implementation custa 2600 (cold). Padrões como
          UpgradeableBeacon e proxy clones (EIP-1167) impactam gas dependendo do warming. Etherscan
          mostra trace com gas por step — usar pra investigar regressões.
        </Callout>
      </Section>

      <Section title="Storage slots: como Solidity organiza variáveis" accent={accent}>
        <CodeBlock lang="solidity">{`contract StorageLayout {
    // Slot 0: empacotado em 32 bytes
    uint128 a;          // bytes 0..15
    uint64  b;          // bytes 16..23
    uint64  c;          // bytes 24..31

    // Slot 1
    uint256 d;          // bytes 0..31

    // Slot 2: array dinamico — armazena length aqui;
    // valores em keccak256(2), keccak256(2)+1, ...
    uint256[] arr;

    // Slot 3: mapping — slot ocupa 32 bytes (vazio);
    // valores em keccak256(key . slot)
    mapping(address => uint256) balances;

    // Slot 4: struct — empacota onde couber
    struct Point { uint128 x; uint128 y; } // 1 slot
    Point p;
}`}</CodeBlock>
        <p>
          O layout segue regras determinísticas: variáveis pequenas adjacentes empacotam no mesmo
          slot quando cabem; mappings e arrays dinâmicos têm valores calculados via
          <InlineCode>keccak256</InlineCode>. <InlineCode>forge inspect Contract storage-layout</InlineCode>{' '}
          mostra o mapa exato.
        </p>
        <Callout tone="success" icon="💡">
          <strong>Otimização clássica</strong>: ordenar declarações para empacotar.
          <InlineCode>uint128 a; uint256 b; uint128 c;</InlineCode> usa 3 slots.
          <InlineCode>uint128 a; uint128 c; uint256 b;</InlineCode> usa 2. Em hot paths, isso
          economiza um SSTORE de 20k.
        </Callout>
      </Section>

      <Section title="Memory expansion: a curva quadrática" accent={accent}>
        <AnnotatedFormula
          accent={accent}
          title="Custo de memória"
          formula="memory_gas(a) = 3·a + ⌊a²/512⌋"
          parts={[
            { label: 'a', text: 'Tamanho da memória em words (32 bytes cada)' },
            { label: '3·a', text: 'Custo linear por word — barato para arrays pequenos' },
            { label: 'a²/512', text: 'Termo quadrático — domina em arrays grandes, evita alocação descontrolada' },
            { label: 'Δ', text: 'Pagar só a diferença em relação ao maior offset previamente acessado' },
          ]}
        />
        <CodeBlock lang="solidity">{`// 1 word de memory (32 bytes): 3 gas
// 32 words (1 KB): 96 + 2 = 98 gas
// 1024 words (32 KB): 3072 + 2048 = 5120 gas
// 32768 words (1 MB): 98304 + 2097152 = ~2.2M gas

// Hot path em Solidity: usar storage refs em vez de copiar storage→memory
function bad(uint256 id) external view returns (uint256) {
    Item memory item = items[id];   // copia struct inteira pra memory
    return item.price;
}
function good(uint256 id) external view returns (uint256) {
    Item storage item = items[id];  // pointer pra storage
    return item.price;              // 1 SLOAD do campo necessario
}`}</CodeBlock>
      </Section>

      <Section title="Call family: CALL, DELEGATECALL, STATICCALL, CALLCODE" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Opcode', 'Context', 'msg.sender visto', 'Modifica storage de', 'Caso de uso']}
          rows={[
            ['CALL', 'Novo frame', 'Contrato chamador', 'Contrato chamado', 'Interagir com outro contrato (transferFrom, swap...)'],
            ['DELEGATECALL', 'Mesmo frame', 'msg.sender original', 'Contrato chamador', 'Proxies (EIP-1967, UUPS, Diamond), bibliotecas executáveis'],
            ['STATICCALL', 'Novo frame, read-only', 'Contrato chamador', 'Nada (revert se SSTORE)', 'view/pure cross-contract — garante não-mutação'],
            ['CALLCODE', 'Deprecated', '—', '—', 'Pre-DELEGATECALL legacy, evitar'],
          ]}
        />
        <CodeBlock lang="solidity">{`// Proxy EIP-1967 (UUPS pattern, OpenZeppelin)
contract Proxy {
    bytes32 private constant _IMPL_SLOT =
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    fallback() external payable {
        assembly {
            let impl := sload(_IMPL_SLOT.slot)
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
}`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          DELEGATECALL é poderoso e perigoso: o callee executa no storage do caller. Se o callee
          tem uma função autodestruct e você delega para um endereço atacante-controlado, o proxy
          some. Histórico: <em>parity multisig wallet hack</em> (2017) — $150M+ permanently locked
          por delegatecall a libcontract self-destructed.
        </Callout>
      </Section>

      <Section title="CREATE vs CREATE2: endereços determinísticos" accent={accent}>
        <CodeBlock lang="solidity">{`// CREATE classico: endereco = keccak256(rlp(sender, nonce))[12:]
contract Factory {
    function deployNormal() external returns (address) {
        return address(new Child());  // CREATE — depende do nonce
    }

    // CREATE2: keccak256(0xff . sender . salt . keccak256(initcode))[12:]
    function deployDeterministic(bytes32 salt) external returns (address) {
        return address(new Child{salt: salt}());
    }

    function predict(bytes32 salt, bytes memory initcode) public view returns (address) {
        return address(uint160(uint256(keccak256(abi.encodePacked(
            bytes1(0xff), address(this), salt, keccak256(initcode)
        )))));
    }
}`}</CodeBlock>
        <p>
          CREATE2 (EIP-1014, 2018) habilitou state channels, conta abstrata e padrões como Uniswap
          V3 pools (endereço de pool é determinístico por (token0, token1, fee)). A maioria das L2s
          modernas dependem disso.
        </p>
      </Section>

      <Section title="Yul (assembly) — quando e como" accent={accent}>
        <CodeBlock lang="solidity">{`// Ler um slot de storage diretamente
function readSlot(uint256 slot) external view returns (uint256 value) {
    assembly {
        value := sload(slot)
    }
}

// Decodar calldata custom sem ABI overhead
function decodeBytesPacked(bytes calldata input) external pure returns (address a, uint96 amount) {
    assembly {
        let ptr := input.offset
        // 20 bytes address shifted high
        a := shr(96, calldataload(ptr))
        // 12 bytes amount
        amount := shr(160, calldataload(add(ptr, 20)))
    }
}

// Memcopy otimizada (loop manual)
function memcopy(uint256 dst, uint256 src, uint256 len) internal pure {
    assembly {
        for { let i := 0 } lt(i, len) { i := add(i, 32) } {
            mstore(add(dst, i), mload(add(src, i)))
        }
    }
}`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Assembly retira todas as proteções do compiler (overflow checks, bounds, type safety).
          Use só em hot paths mensurados, comente extensivamente, e audite. Trail of Bits
          recomenda que código em assembly tenha o dobro de teste do código Solidity equivalente.
        </Callout>
      </Section>

      <Section title="Eventos (LOG0..LOG4) e indexed topics" accent={accent}>
        <CodeBlock lang="solidity">{`event Transfer(
    address indexed from,
    address indexed to,
    uint256 value
);

// Compila para:
// LOG3 com:
//   topic0 = keccak256("Transfer(address,address,uint256)")
//   topic1 = padded from
//   topic2 = padded to
//   data   = abi-encoded(value)

emit Transfer(msg.sender, to, amount);`}</CodeBlock>
        <p>
          Eventos são parte do receipt, não do state. Custam 375 gas + 375 por topic indexed + 8 por
          byte de data. Indexers (The Graph, Goldsky, Subsquid) filtram por topics — qualquer
          campo &quot;filtrar por&quot; em frontend precisa ser <InlineCode>indexed</InlineCode>.
          Máximo 3 topics indexed por evento (4º topic é o signature hash).
        </p>
      </Section>

      <Section title="Opcodes modernos: PUSH0, MCOPY, TLOAD/TSTORE" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'PUSH0 (EIP-3855, Shanghai 2023)', v: 'Push zero no stack em 1 byte/2 gas. Reduz size de deploy e gas runtime.' },
            { k: 'MCOPY (EIP-5656, Cancun 2024)', v: 'Memory copy nativo, evita loop manual em Yul. Mais barato pra arrays grandes.' },
            { k: 'TLOAD/TSTORE (EIP-1153, Cancun 2024)', v: 'Transient storage ~100 gas. Casos: reentrancy guards, callback context.' },
            { k: 'BLOBHASH (EIP-4844, Cancun 2024)', v: 'Lê hash de blob anexado à tx. Base do proto-danksharding para L2s.' },
            { k: 'BLOBBASEFEE (EIP-7516)', v: 'Lê base fee atual de blobs. L2 rollups usam pra calcular custo de DA.' },
          ]}
        />
      </Section>

      <Section title="Lendo o Yellow Paper sem desistir" accent={accent}>
        <ul className="ffv-list">
          <li>
            Comece pelo <strong>Appendix H — Virtual Machine Specification</strong>. É onde está a
            tabela de opcodes. Sem mistério matemático.
          </li>
          <li>
            Cap 9 (Execution Model) é uma página, define formalmente <em>μ</em> (machine state)
            e a função de transição. Útil pra entender stack/memory/PC.
          </li>
          <li>
            Pular as seções de PoW (capítulo desatualizado pós-Merge); focar em world state,
            account state e tx execution.
          </li>
          <li>
            Para precificação atualizada, sempre conferir EIPs ativos (EIP-2929, EIP-3529,
            EIP-3860 etc). Yellow Paper é base; EIPs são o &quot;diff&quot;.
          </li>
        </ul>
        <Callout tone="info" icon="📚">
          O artigo de Tim Roughgarden em <em>arxiv.org/abs/2012.00854</em> formaliza EIP-1559;
          combinar com Yellow Paper dá visão completa de fee market + execution.
        </Callout>
      </Section>

      <Section title="Ferramentas de inspeção" accent={accent}>
        <CodeBlock lang="bash">{`# Disassembly de bytecode
forge inspect Contract bytecode
forge inspect Contract assembly
forge inspect Contract storage-layout

# Trace de tx no fork
cast run 0x_HASH --rpc-url $RPC

# Decodar revert reason custom error
cast 4byte-decode 0xd0d12bc6  # consulta 4byte.directory

# Ver opcode interativamente
# evm.codes — site com sandbox por opcode
# tenderly.co — debugger visual com state diffs

# Geth debug API (no node proprio)
debug_traceTransaction(hash)        # retorna call stack opcode-a-opcode`}</CodeBlock>
      </Section>

      <Section title="O que isso muda no dia a dia" accent={accent}>
        <ul className="ffv-list">
          <li>Você lê traces de Etherscan e identifica onde o gas vai (SLOAD cold? subcall warm?).</li>
          <li>Você organiza storage para empacotar e economiza 20k/SSTORE em deploy + saves em update.</li>
          <li>Você usa transient storage em vez de SSTORE pra locks.</li>
          <li>Você decide entre <InlineCode>memory</InlineCode> e <InlineCode>storage</InlineCode> pointers de forma consciente.</li>
          <li>Você lê PRs de OpenZeppelin/Uniswap e entende as otimizações mencionadas.</li>
          <li>Você audita assembly olhando para opcodes, não para &quot;estranheza visual&quot;.</li>
        </ul>
      </Section>

      <Section title="Leituras recomendadas" accent={accent}>
        <ul className="ffv-list">
          <li>Wood, G. — Ethereum Yellow Paper (2014, atualizado continuamente).</li>
          <li><InlineCode>evm.codes</InlineCode> — referência interativa de opcodes (Smarx Wang).</li>
          <li>Buterin, V. — <em>Why proof of stake</em>, <em>Endgame</em> e posts em <InlineCode>vitalik.eth.limo</InlineCode>.</li>
          <li>EIP-2929, EIP-2930, EIP-3529, EIP-1153, EIP-3855, EIP-4844 — leitura direta dos textos.</li>
          <li>Trail of Bits — &quot;Building Secure Contracts&quot;, capítulos sobre EVM gotchas.</li>
          <li>Paradigm Research — posts de gakonst sobre EVM, MEV, e gas optimization.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
