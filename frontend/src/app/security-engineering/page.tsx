import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail22')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Segurança como disciplina em PT-BR: threat modeling STRIDE, authn vs authz, OAuth2/OIDC com PKCE, JWT/Paseto/sessions, password hashing moderno (argon2), OWASP Top 10 com código, secrets management (Vault/SOPS), supply chain (SBOM/sigstore), Zero Trust + mTLS, capstone pentest ético.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/security-engineering` },
  ...social({ titulo: `Security Engineering — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/security-engineering' }),
  title: 'Security Engineering',
  description: DESCRICAO_CARTAO,
  keywords:
    'security engineering, threat modeling stride, oauth2 pkce, owasp top 10 2024, argon2id, sbom sigstore, zero trust mtls, pentest etico, secrets management vault',
};

export default function SecurityEngineeringPage() {
  return <TrailBlogClient trail={trail} />;
}
