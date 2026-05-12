import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';

const hub = getHubBySlug('seguranca-hardware-hacking')!;

export const metadata: Metadata = {
  title: 'Segurança & Hardware Hacking — Flipper Zero, Pentest Ético — FFV Academy',
  description:
    'Hub Segurança & Hardware Hacking do FFV Academy: a única trilha em PT-BR sobre Flipper Zero com profundidade real (STM32WB55, CC1101, MIFARE Crypto1, KeeLoq, BadUSB, ufbt) + framework legal brasileiro (Lei 14.155/2021, ANATEL, LGPD, PTES, BugHunt). Do iniciante ao pentester profissional.',
  keywords:
    'flipper zero brasil, hardware hacking ptbr, pentest ético, lei 14155 hacking, anatel flipper, mifare crypto1, keeloq rolljam, badusb duckyscript, ufbt fap, bughunt brasil, hackerone bug bounty',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
