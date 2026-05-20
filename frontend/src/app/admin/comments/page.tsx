import type { Metadata } from 'next';
import { AdminCommentsClient } from './AdminCommentsClient';

export const metadata: Metadata = {
  title: 'Moderação de comentários — Admin',
  robots: { index: false, follow: false },
};

export default function AdminCommentsPage() {
  return <AdminCommentsClient />;
}
