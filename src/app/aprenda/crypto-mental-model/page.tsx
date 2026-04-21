import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('crypto-mental-model');

const accent = '#dc2626';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual combinação garante confidencialidade + integridade + autenticidade em um único passe?',
    options: [
      'AES-CBC + SHA-256 em pipeline manual (encrypt-then-mac artesanal)',
      'AEAD moderno: AES-256-GCM ou ChaCha20-Poly1305. Cifra e autentica no mesmo construct, com nonce de 96 bits, evitando bugs clássicos de encrypt-then-mac mal implementado',
      'Apenas SHA-256 do plaintext',
      'AES-ECB com HMAC-MD5',
    ],
    correct: 1,
    explanation: 'AEAD (Authenticated Encryption with Associated Data) resolve os 3 objetivos em um primitivo testado. AES-GCM domina onde existe AES-NI em hardware; ChaCha20-Poly1305 ganha em ARM/mobile sem aceleração. CBC+HMAC artesanal tem histórico de padding oracles e bugs de timing. Regra: use AEAD de uma biblioteca madura (libsodium, Tink, AWS Encryption SDK).',
  },
  {
    question: 'Por que "never roll your own crypto" continua sendo regra em 2026?',
    options: [
      'Porque algoritmos secretos são melhores',
      'Porque side-channels (timing, cache, power), nonce reuse, reuso de IV, escolha de curva, constant-time comparisons e PRNG ruim derrubam implementações ingênuas. Bibliotecas auditadas (libsodium, BoringSSL, ring) concentram décadas de fuzzing e review',
      'Porque cripto é ilegal fora de labs',
      'Porque hardware moderno resolve sozinho',
    ],
    correct: 1,
    explanation: 'O algoritmo é só 10% do problema. Os outros 90% são implementação constant-time, geração segura de nonces, gestão de chaves, side-channels e APIs que não deixem o dev atirar no próprio pé. CVEs recorrentes (Lucky13, Heartbleed, ROCA, Bleichenbacher em libs custom) provam que até engenheiros seniores erram. Use libsodium/Tink e pare de reinventar.',
  },
  {
    question: 'Qual assinatura digital é padrão moderno recomendado em 2026?',
    options: [
      'RSA-1024 com SHA-1',
      'Ed25519 (EdDSA sobre curva Edwards25519): rápido, determinístico, constant-time por design, chaves de 32 bytes, assinaturas de 64 bytes. Alternativa: ECDSA P-256 quando FIPS exigido',
      'DSA clássico',
      'MD5 com salt',
    ],
    correct: 1,
    explanation: 'Ed25519 é o default sensato: sem nonce aleatório (determinístico via hash), imune a falhas de PRNG como a que derrubou PS3 e vários wallets. ECDSA P-256 só quando compliance FIPS 140 obriga. RSA ainda aparece em legacy (certificados X.509 antigos) mas deve ser 3072+ bits. SHA-1 está morto; use SHA-256 ou SHA-3 para hashing.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="crypto-mental-model"
      title="Cripto aplicada: mental model"
      icon="🗝️"
      xp={45}
      readTime={11}
      trailName="Cryptography Applied"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Os três objetivos que não se confundem" accent={accent}>
        <p>
          Criptografia aplicada resolve três problemas distintos: confidencialidade (ninguém lê), integridade (ninguém altera sem detectar) e autenticidade (prova de origem). Confundir os três é o erro número um de quem improvisa. Hash sozinho não cifra. Cifra sozinha não autentica. Assinatura não esconde o conteúdo.
        </p>
        <Callout tone="danger" icon="🚨">
          NEVER roll your own crypto. Esta frase aparece em todo artigo sério desde 1996 e continua verdadeira. Sua missão é escolher primitivos certos e usá-los via biblioteca auditada — não inventar esquema novo.
        </Callout>
      </Section>

      <Section title="Famílias de primitivos" accent={accent}>
        <p>
          Simétrica (mesma chave dos dois lados, rápida): AES-GCM, ChaCha20-Poly1305. Assimétrica (par pública/privada, lenta mas resolve troca de chaves e assinatura): X25519 para ECDH, Ed25519 para assinatura, RSA-OAEP em legacy. Hash (one-way, sem chave): SHA-256, SHA-3, BLAKE3. MAC (hash com chave): HMAC-SHA256, KMAC.
        </p>
        <CodeBlock lang="python">{`# libsodium via PyNaCl — jeito certo de cifrar um segredo
from nacl.secret import SecretBox
from nacl.utils import random

key = random(SecretBox.KEY_SIZE)  # 32 bytes, fonte CSPRNG do SO
box = SecretBox(key)

ciphertext = box.encrypt(b"numero do cartao: 4111...")
# nonce de 24 bytes ja vai embutido, nada de reutilizar manualmente
plaintext = box.decrypt(ciphertext)  # falha com excecao se adulterado

# Assinatura Ed25519
from nacl.signing import SigningKey
sk = SigningKey.generate()
vk = sk.verify_key
signed = sk.sign(b"release v1.2.3 sha256: abc...")
vk.verify(signed)  # raises se alterado`}</CodeBlock>
      </Section>

      <Section title="Tabela rápida de escolhas em 2026" accent={accent}>
        <CodeBlock lang="yaml">{`# Cheat sheet — escolha default sensato
cifrar_arquivo_em_repouso:   AES-256-GCM (ou age via libsodium)
cifrar_stream_mobile:        ChaCha20-Poly1305 (mais rapido sem AES-NI)
trocar_chave_via_rede:       X25519 (ECDH) -> deriva via HKDF-SHA256
assinar_artefato:            Ed25519
hash_senha:                  Argon2id (nunca SHA puro, nunca MD5)
hmac_api_webhook:            HMAC-SHA256 com chave >= 32 bytes
hash_arquivo_integridade:    SHA-256 ou BLAKE3
tls_transporte:              TLS 1.3 (biblioteca do SO cuida)
assinar_jwt_se_precisar:     EdDSA (Ed25519), nunca HS256 com chave fraca
pos_quantico_2026:           ML-KEM (Kyber) em hibrido com X25519`}</CodeBlock>
        <Callout tone="info" icon="🔮">
          NIST publicou FIPS 203 (ML-KEM, ex-Kyber) em agosto de 2024. Navegadores e cloud providers já ativaram hybrid X25519+ML-KEM em TLS 1.3 durante 2024-2025. Migração pós-quântica deixou de ser pesquisa acadêmica.
        </Callout>
      </Section>

      <Section title="Armadilhas que matam sistemas" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          Nonce reuse em AES-GCM com mesma chave quebra confidencialidade e integridade simultaneamente. Conte nonces ou sorteie de 96 bits via CSPRNG. Se volume passa de 2^32 mensagens, rotacione a chave.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          Comparar MAC com == vaza timing. Use hmac.compare_digest (Python), crypto_verify_16 (libsodium), subtle.ConstantTimeCompare (Go). Sempre constant-time em segredos.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          Hash de senha com SHA-256 puro é bug de segurança. Use Argon2id (RFC 9106) com parâmetros calibrados por benchmark no seu hardware. bcrypt ainda aceitável; scrypt ok; PBKDF2 só em compliance legada.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
