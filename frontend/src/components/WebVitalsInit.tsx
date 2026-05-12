'use client';

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/web-vitals';

export function WebVitalsInit() {
  useEffect(() => {
    initWebVitals();
  }, []);
  return null;
}
