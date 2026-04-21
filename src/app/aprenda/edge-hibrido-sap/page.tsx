import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('edge-hibrido-sap');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando Outposts é a escolha certa?',
    options: [
      'Qualquer on-prem',
      'Latência ultra-baixa pra sistema legado on-prem (trading floor, fábrica), residência de dados obrigatória (regulação bancária local), ou extensão de AWS em site sem conectividade cloud confiável. Outposts entrega API AWS rodando em rack on-prem, gerenciado pela AWS',
      'É igual a EC2',
      'Só pra dev',
    ],
    correct: 1,
    explanation: 'Outposts é caro (contrato 3 anos, 100k+ USD) e só faz sentido quando cloud region não atende: latência sub-ms pra legado, jurisdição com lei de dados locais, site remoto sem fibra. Pra maioria dos casos "quero AWS on-prem", a resposta certa é ECS Anywhere/EKS Anywhere rodando em hardware do cliente — muito mais barato.',
  },
  {
    question: 'Wavelength Zones servem pra quê?',
    options: [
      'DC regional',
      'Deploy de workloads dentro da rede 5G de telcos (Verizon, KDDI, Vodafone) pra aplicações que exigem latência ~10ms com dispositivos móveis/IoT. Use cases: AR/VR, video gaming mobile, inferência ML em edge conectada ao 5G',
      'É só marketing',
      'Igual a CloudFront',
    ],
    correct: 1,
    explanation: 'Wavelength é nicho: latência <20ms pra device móvel 5G local. Não substitui CloudFront (CDN). Se app não tem requisito de latência extrema com 5G, Local Zones (metropolitan ~15ms) ou regions normais resolvem melhor. Prova SAP cobra cenário correto — saber quando rejeitar Wavelength é tão importante quanto quando usar.',
  },
  {
    question: 'Local Zones resolvem qual problema?',
    options: [
      'DR',
      'Workloads que exigem latência sub-15ms pra usuários em cidade específica (ex: Los Angeles, São Paulo, Bogotá) sem gastar com Outposts. Roda serviços como EC2, EBS, FSx, RDS localmente; conecta de volta à região parent transparente',
      'CDN global',
      'Backup',
    ],
    correct: 1,
    explanation: 'Local Zones são extensão de região AWS numa metrópole. Use quando app precisa rodar próximo de usuário metropolitano (gaming, real-time media, regulação local) mas Outposts é overkill. Deploy com mesma API (new AZ-like), latência baixa até endusers na cidade, cobra normal de EC2/EBS com premium.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="edge-hibrido-sap"
      title="Edge e híbrido: Outposts, Wavelength, Local Zones"
      icon="📡"
      xp={55}
      readTime={13}
      trailName="AWS Solutions Architect Professional (SAP-C03)"
      trailColor={accent}
      nextSlug="analytics-bigdata-sap"
      nextTitle="Analytics em escala: Redshift, EMR, Athena, Lake Formation"
      quiz={quiz}
    >
      <Section title="Spectrum do edge AWS" accent={accent}>
        <CodeBlock lang="yaml">{`Região AWS:
  Distância típica: 50-300 km do user
  Latência: 20-80ms
  Uso: maioria dos apps

Local Zone:
  Distância: dentro de uma metrópole
  Latência: 5-15ms para usuário local
  Serviços: EC2, EBS, FSx, RDS, ELB (subset)
  Uso: gaming, streaming, regulação local

Wavelength Zone:
  Dentro da rede 5G de telco
  Latência: ~10ms pra device mobile 5G
  Uso: AR/VR mobile, V2X, inference em edge 5G

Outposts (rack ou servers):
  On-prem do cliente, 100% AWS managed
  Latência: sub-ms interno
  Uso: latência extrema, data residency, fábrica/hospital

Snow Family:
  Snowcone (pequeno), Snowball (~80TB), Snowmobile (PB-scale)
  Uso: transfer offline ou compute em locais sem conectividade`}</CodeBlock>
      </Section>

      <Section title="Híbrido além do edge" accent={accent}>
        <p>
          Para continuidade operacional entre on-prem e cloud, ferramentas são diferentes: Storage Gateway (file/volume/tape para expor S3/EBS/Glacier como protocolo local), DataSync (bulk transfer periódico), Direct Connect (conectividade dedicada), ECS/EKS Anywhere (control plane AWS gerenciando runtime on-prem do cliente), SSM (fleet management on-prem + cloud).
        </p>
        <CodeBlock lang="bash">{`# Storage Gateway File Gateway — expõe S3 como NFS/SMB local
aws storagegateway create-nfs-file-share \
  --client-token unique-token \
  --gateway-arn arn:aws:storagegateway:...:gateway/sgw-xxx \
  --location-arn arn:aws:s3:::my-hybrid-bucket \
  --role arn:aws:iam::111:role/StorageGatewayRole

# Resultado: fileserver on-prem vê mount NFS, dados vivem em S3
# Cache local acelera reads quentes, writes streamam pra S3 async`}</CodeBlock>
      </Section>

      <Section title="Decisão: cloud region, edge ou on-prem?" accent={accent}>
        <p>
          Default moderno é região AWS. Edge entra quando latência for requisito funcional (não "queremos rápido" — mensurável: &lt;15ms, &lt;5ms). Híbrido on-prem permanece para legacy que não pode/vale mover, compliance de residência, ou conectividade offline. A prova SAP cobra justificar com requisitos quantitativos — respostas "Outposts é melhor" sem cenário forte estão erradas.
        </p>
        <Callout tone="success" icon="✅">
          Ordem de preferência de custo: região AWS → Local Zone (cidade) → ECS Anywhere/EKS Anywhere no hardware do cliente → Wavelength → Outposts Servers → Outposts Rack → Snowmobile. Escale complexidade só quando requisito quantitativo exige.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
