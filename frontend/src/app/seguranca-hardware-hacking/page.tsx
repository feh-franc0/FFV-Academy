import type { Metadata } from 'next';
import { ProfissionalBaseHome } from '@/components/base/ProfissionalBaseHome';
import { BaseStructuredData } from '@/components/seo/StructuredData';
import { getHubBySlug, getHubTrails } from '@/lib/curriculum';

const hub = getHubBySlug('seguranca-hardware-hacking')!;
const trails = getHubTrails(hub);
const modulesCount = trails.reduce((acc, t) => acc + t.modules.length, 0);
const workloadHours = Math.round(
  trails.reduce((acc, t) => acc + t.modules.reduce((s, m) => s + m.readTime, 0), 0) / 60,
);

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description: hub.desc,
  keywords: hub.tagline,
  alternates: { canonical: `https://fernandofrancovalle.com/seguranca-hardware-hacking` },
  openGraph: {
    title: `${hub.name} — FFV Academy`,
    description: hub.tagline,
    type: 'website',
    url: `https://fernandofrancovalle.com/seguranca-hardware-hacking`,
    locale: 'pt_BR',
  },
};

export default function Page() {
  return (
    <>
      <BaseStructuredData
        slug="seguranca-hardware-hacking"
        name={hub.name}
        description={hub.desc}
        url="https://fernandofrancovalle.com/seguranca-hardware-hacking"
        modules={modulesCount}
        workloadHours={workloadHours}
        teaches="Flipper Zero · Sub-GHz · NFC · RFID · BadUSB · Hardware Hacking ético"
      />
      <ProfissionalBaseHome hub={hub} heroHighlight="com ciência por baixo" />
    </>
  );
}
