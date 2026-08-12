'use client';

import { useEffect } from 'react';
import { SegmentError } from '@/components/estado/SegmentError';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[simulados]', error);
  }, [error]);

  return (
    <SegmentError
      title="Não conseguimos abrir os simulados"
      description="Algo deu errado ao carregar esta página. Se você estava em prova, sua tentativa continua salva no servidor."
      reset={reset}
    />
  );
}
