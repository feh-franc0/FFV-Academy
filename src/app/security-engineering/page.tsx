import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail22')!;

export const metadata: Metadata = {
  title: 'Security Engineering — FFV Academy',
  description:
    'Segurança como disciplina em PT-BR: threat modeling STRIDE, authn vs authz, OAuth2/OIDC com PKCE, JWT/Paseto/sessions, password hashing moderno (argon2), OWASP Top 10 com código, secrets management (Vault/SOPS), supply chain (SBOM/sigstore), Zero Trust + mTLS, capstone pentest ético.',
  keywords:
    'security engineering, threat modeling stride, oauth2 pkce, owasp top 10 2024, argon2id, sbom sigstore, zero trust mtls, pentest etico, secrets management vault',
};

export default function SecurityEngineeringPage() {
  return <TrailBlogClient trail={trail} />;
}
