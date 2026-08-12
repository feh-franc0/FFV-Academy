'use client';

import { useEffect } from 'react';
import { SegmentError } from '@/components/estado/SegmentError';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[revisar]', error);
  }, [error]);

  return (
    <SegmentError
      title="Não conseguimos abrir a revisão"
      description="Algo deu errado ao carregar sua fila de cartas. Seu histórico de revisão está salvo."
      reset={reset}
    />
  );
}
