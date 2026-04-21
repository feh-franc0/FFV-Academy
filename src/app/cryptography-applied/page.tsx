import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail61')!;

export const metadata: Metadata = {
  title: 'Cryptography Applied — FFV Academy',
  description:
    'Cripto aplicada em PT-BR: PKI + X.509, TLS 1.3 deep (incluindo post-quantum ML-KEM 2024), key management (KMS/Vault/HSM), JWT vs PASETO vs sessions, mTLS e zero-trust, SPIFFE/SPIRE.',
  keywords:
    'criptografia aplicada, pki x509, tls 1.3, post quantum ml-kem, aws kms, hashicorp vault, hsm, jwt paseto, mtls zero trust, spiffe spire',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
