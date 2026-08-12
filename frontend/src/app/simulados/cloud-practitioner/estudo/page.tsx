import type { Metadata } from 'next';
import { EstudoClient } from '@/components/simulado/EstudoClient';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { BASE, social } from '@/lib/metadata-social';

export const metadata: Metadata = {
  // Página envolvida em `RequireAuth`: o rastreador bate numa parede de login.
  // Indexar parede de login entrega resultado inútil e conta como conteúdo raso.
  robots: { index: false, follow: false },
  // Sem "FFV Academy": o template do layout raiz aplica o sufixo.
  title: 'Estudo livre — AWS Cloud Practitioner',
  description:
    'Modo de estudo livre para a certificação AWS Cloud Practitioner (CLF-C02). 335+ questões reais sorteadas do banco com distribuição oficial do blueprint, explicações ricas (por que está certo, por que cada distrator erra) e tutor IA para tirar dúvidas. Gratuito, sem timer.',
  alternates: { canonical: `${BASE}/simulados/cloud-practitioner/estudo` },
  ...social({
    titulo: 'Estudo livre — AWS Cloud Practitioner · FFV Academy',
    descricao: 'Treine para o CLF-C02 no seu ritmo: banco completo, explicações ricas e tutor IA.',
    caminho: '/simulados/cloud-practitioner/estudo',
  }),
};

export default function EstudoCloudPractitionerPage() {
  return (
    <>
      {/*
        O título é renderizado no SERVIDOR, fora do guarda de autenticação.
        A varredura de rotas mostrou esta página respondendo 200 sem nenhum
        <h1> no HTML: o conteúdo inteiro estava atrás do guarda, que só decide
        depois da hidratação. Rastreador e leitor de tela recebiam página sem
        cabeçalho — e o nome da página não é informação privada.
      */}
      <h1 className="sr-only">Modo de estudo — AWS Cloud Practitioner (CLF-C02)</h1>
      <RequireAuth
      reason="acessar os simulados"
      title="Login necessário para o modo de estudo"
      description="Faça login para praticar as questões do CLF-C02, acompanhar seu progresso e usar o tutor IA. É gratuito."
    >
        <EstudoClient />
      </RequireAuth>
    </>
  );
}
