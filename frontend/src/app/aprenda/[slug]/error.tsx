'use client';

import { useEffect } from 'react';
import { SegmentError } from '@/components/estado/SegmentError';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[aprenda/[slug]]', error);
  }, [error]);

  return (
    <SegmentError
      title="Não conseguimos abrir este módulo"
      description="Algo deu errado ao carregar o conteúdo. Seu progresso está salvo — o que falhou foi esta página."
      reset={reset}
    />
  );
}
