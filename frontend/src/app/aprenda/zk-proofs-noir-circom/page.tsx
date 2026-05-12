import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue } from '@/components/article/primitives';

export const metadata = getModuleMetadata('zk-proofs-noir-circom');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'O que prova um ZK proof, conceitualmente?',
    options: [
      'Que o prover sabe a senha de outro usuário',
      'Que o prover conhece um valor (witness) que satisfaz uma relação (circuit), sem revelar o valor. Verificador convence-se com altíssima probabilidade sem aprender nada sobre o witness',
      'Apenas hashes',
      'Identidade do usuário',
    ],
    correct: 1,
    explanation: 'ZK = Zero-Knowledge. Prover convince verifier que conhece x tal que f(x) = y, sem revelar x. Completeness: provas válidas convencem. Soundness: provas inválidas não convencem (exceto com probabilidade negligenciável). Zero-knowledge: verifier não aprende nada além da verdade do statement.',
  },
  {
    question: 'Noir (Aztec) vs Circom — diferença principal:',
    options: [
      'São idênticos',
      'Circom é DSL low-level, sintaxe próxima ao circuito (signals, constraints explícitos); Noir tem sintaxe Rust-like, mais ergonômica, abstração maior. Noir compila para ACIR e backend Plonkish/Halo2',
      'Noir é proprietário',
      'Circom não existe',
    ],
    correct: 1,
    explanation: 'Circom é battle-tested mas verbose — você escreve constraints. Noir (lançado 2023 por Aztec) é o equivalente Rust → ASM: sintaxe humana, compilador faz o trabalho. Em 2026, Noir cresce rápido; Circom continua dominante em projetos antigos.',
  },
  {
    question: 'zkEmail permite:',
    options: [
      'Criptografar e-mail',
      'Provar zk-style que você possui um e-mail com certo conteúdo/sender sem revelar o conteúdo todo. Use cases: prova de domínio, KYC parcial, recuperação de wallet via e-mail',
      'Apenas spam',
      'Substituir DKIM',
    ],
    correct: 1,
    explanation: 'zkEmail (Daimo team, 2023) usa o fato de que e-mails têm DKIM (assinatura criptográfica do servidor). Você prova "tenho e-mail assinado por @anthropic.com" sem revelar o e-mail. Permite KYC sem disclosure, account recovery, anti-fraude.',
  },
  {
    question: 'Halo2 destaca-se por:',
    options: [
      'Ser o mais antigo',
      'Suporte nativo a recursive proofs (prova de prova) sem trusted setup; arquitetura Plonkish flexível. Backend de muitos projetos novos (Scroll, Filecoin, Privacy Pass). Mais complexo de aprender que Circom',
      'Funcionar só em Bitcoin',
      'Ser proprietário',
    ],
    correct: 1,
    explanation: 'Halo2 (Electric Coin Co, Zcash team) trouxe Plonk + nookups + IPA polynomial commitment — sem trusted setup. Recursive proofs nativas permitem ZK rollups eficientes. Mais difícil mas mais poderoso.',
  },
  {
    question: 'Custo on-chain de verificar uma ZK proof típica:',
    options: [
      'Zero',
      'Geralmente 200-500k gas em verificador Groth16 (~$2-10 em L1 em momento normal); Plonk pode ser maior; Halo2 com recursion permite amortizar. Custo cai muito em L2',
      'Sempre 1M ETH',
      '50 gas',
    ],
    correct: 1,
    explanation: 'Verificação on-chain é a parte que importa custo. Groth16 é o mais barato em verify gas (~200k); Plonk ~400-500k. Em rollup L2 (Arbitrum, Base), o custo despenca por causa do blob pricing. Por isso ZK em L2 explodiu.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="zk-proofs-noir-circom"
      title="ZK proofs aplicados: Noir, Circom, Halo2"
      icon="🧩"
      xp={80}
      readTime={16}
      trailName="Web3 Engineering Pragmático"
      trailColor={accent}
      nextSlug="defi-primitives"
      nextTitle="DeFi primitives"
      quiz={quiz}
    >
      <Section title="ZK em 60 segundos — para devs (não para pesquisadores)" accent={accent}>
        <p className="text-sm leading-6">
          Zero-Knowledge Proof: você prova que conhece um <i>witness</i> w tal que f(w, x) = y, sem revelar w. Verifier aceita com altíssima probabilidade se a prova é válida, rejeita se inválida. Práticas reais: provar idade {'>'} 18 sem revelar nascimento, provar saldo {'>'} X sem revelar saldo, provar que executou uma computação corretamente (rollups).
        </p>
        <Callout tone="info">
          Você não precisa entender pairing-based crypto para usar ZK em 2026. Você precisa entender o modelo (witness, statement, verifier) e dominar uma DSL (Noir ou Circom).
        </Callout>
      </Section>

      <Section title="Noir — hello world" accent={accent}>
        <CodeBlock lang="rust">{`// circuit.nr
// Prova que conhece dois números cuja soma é pública
fn main(a: Field, b: Field, sum: pub Field) {
    assert(a + b == sum);
}

// 'a' e 'b' são private witness; 'sum' é public input.
// Verifier só vê 'sum'; prover convence sem revelar a, b.`}</CodeBlock>
        <CodeBlock lang="bash">{`# Compilar circuit
nargo compile

# Prover side: gerar prova com witness
nargo prove

# Verifier side: verificar proof
nargo verify

# Gerar Solidity verifier para deploy on-chain
nargo codegen-verifier`}</CodeBlock>
      </Section>

      <Section title="Circom — equivalente low-level" accent={accent}>
        <CodeBlock lang="javascript">{`pragma circom 2.1.0;

template Sum() {
    signal input a;
    signal input b;
    signal input sum;
    sum === a + b;
}

component main { public [sum] } = Sum();`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Constraints explícitos', v: 'Em Circom, você descreve o sistema de equações' },
            { k: 'snarkjs / rapidsnark', v: 'Toolchain padrão para gerar proofs Groth16/Plonk' },
            { k: 'Powers of Tau', v: 'Trusted setup ceremony — circuits Groth16 precisam' },
            { k: 'Ecosystem maduro', v: 'Mais bibliotecas e tutorials que Noir' },
          ]}
        />
      </Section>

      <Section title="Projetos reais usando ZK em 2026" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Projeto', 'O que prova ZK', 'Stack']}
          rows={[
            ['zkEmail', 'Possui e-mail com sender/conteúdo específico', 'Circom + DKIM'],
            ['Anon Aadhaar', 'Cidadania indiana sem revelar identidade', 'Circom + Aadhaar QR'],
            ['zkPassport', 'Passaporte válido sem revelar dados', 'Noir + NFC ICAO'],
            ['Sismo', 'Reputation sem identidade on-chain', 'Custom ZK'],
            ['Worldcoin / World ID', 'Humano único (anti-sybil)', 'Custom + iris scan'],
            ['Privacy Pools (Vitalik)', 'Saldo Tornado-like com pool de honestos', 'Halo2'],
            ['Scroll / Linea / zkSync', 'ZK rollups L2 — provam toda execução EVM', 'Custom prover backends'],
          ]}
        />
      </Section>

      <Section title="Quando ZK faz sentido" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Privacidade obrigatória', v: 'Saldo, identidade, voto, dados médicos' },
            { k: 'Compactar computação', v: 'Rollups L2 — provar execução off-chain é mais barato que repetir on-chain' },
            { k: 'KYC sem disclosure', v: 'Provar "sou maior de 18" sem revelar data exata' },
            { k: 'Cross-chain bridges sem trust', v: 'Provar state de chain A em chain B sem oracle' },
            { k: 'NÃO use quando', v: 'Latência crítica (provas levam segundos a minutos), ou quando dado é público mesmo' },
          ]}
        />
      </Section>

      <Section title="Toolchain 2026" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Tool', 'Linguagem', 'Backend', 'Maturidade']}
          rows={[
            ['Circom + snarkjs', 'Circom DSL', 'Groth16 / Plonk', 'Maduro, padrão'],
            ['Noir (Aztec)', 'Rust-like', 'Plonkish / Halo2-style', 'Crescendo rápido'],
            ['Halo2 (zcash)', 'Rust direct', 'Plonkish + IPA', 'Avançado, complexo'],
            ['Cairo (StarkWare)', 'Cairo DSL', 'STARK', 'Maduro em StarkNet'],
            ['SP1 (Succinct)', 'Rust completo → zkVM', 'STARK + recursion', 'Novo, promissor'],
            ['RISC Zero', 'Rust → zkVM RISC-V', 'STARK', 'Genérico, mais lento'],
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
