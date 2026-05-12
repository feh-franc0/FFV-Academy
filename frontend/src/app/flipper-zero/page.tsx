import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-flipper-zero')!;

export const metadata: Metadata = {
  title: 'Flipper Zero — do Iniciante ao Pentester de Hardware — FFV Academy',
  description:
    'Trilha completa em PT-BR sobre Flipper Zero: 20 módulos do iniciante ao avançado. Hardware (STM32WB55, CC1101, ST25R3916), Sub-GHz (OOK/ASK/FSK, KeeLoq, RollJam), RFID 125 kHz (EM4100, T5577), NFC (MIFARE Crypto1, MFKey32, DESFire EV3, EMV), IR, iButton, BadUSB DuckyScript 3.0, GPIO, Wi-Fi DevBoard ESP32 + Marauder, FAPs em C com ufbt, como zerar o Dolphin. Tudo enquadrado em pentest ético com Lei 14.155/2021, ANATEL, LGPD, PTES, BugHunt.',
  keywords:
    'flipper zero curso completo, flipper zero brasil tutorial, hardware hacking ptbr, sub-ghz cc1101, mifare crypto1 quebra, keeloq rolljam samy kamkar, badusb flipper, ufbt fap c, dolphin zerar nivel, anatel flipper apreensão, pentest ético brasil',
};

export default function FlipperZeroTrailPage() {
  return <TrailBlogClient trail={trail} />;
}
