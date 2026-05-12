'use client';

/**
 * Web Vitals reporting — reporta métricas ao Plausible como eventos customizados.
 * Usa a Performance API nativa (PerformanceObserver) sem dependências externas.
 *
 * Métricas rastreadas: LCP, FID, CLS, INP, TTFB
 */

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, string | number | boolean> }) => void;
  }
}

function report(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor') {
  try {
    window.plausible?.('web-vitals', {
      props: {
        metric: name,
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        rating,
      },
    });
  } catch { /* ignore */ }
}

function ratingLCP(v: number): 'good' | 'needs-improvement' | 'poor' {
  return v <= 2500 ? 'good' : v <= 4000 ? 'needs-improvement' : 'poor';
}
function ratingCLS(v: number): 'good' | 'needs-improvement' | 'poor' {
  return v <= 0.1 ? 'good' : v <= 0.25 ? 'needs-improvement' : 'poor';
}
function ratingINP(v: number): 'good' | 'needs-improvement' | 'poor' {
  return v <= 200 ? 'good' : v <= 500 ? 'needs-improvement' : 'poor';
}
function ratingTTFB(v: number): 'good' | 'needs-improvement' | 'poor' {
  return v <= 800 ? 'good' : v <= 1800 ? 'needs-improvement' : 'poor';
}

export function initWebVitals() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  // LCP — Largest Contentful Paint
  try {
    const lcpObs = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
      report('LCP', last.startTime, ratingLCP(last.startTime));
    });
    lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch { /* not supported */ }

  // CLS — Cumulative Layout Shift
  try {
    let clsValue = 0;
    const clsObs = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const e = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!e.hadRecentInput) clsValue += e.value;
      }
    });
    clsObs.observe({ type: 'layout-shift', buffered: true });
    // Report CLS on page hide
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        report('CLS', clsValue, ratingCLS(clsValue));
      }
    }, { once: true });
  } catch { /* not supported */ }

  // INP / FID — Interaction to Next Paint / First Input Delay
  try {
    const inpObs = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const e = entry as PerformanceEntry & { processingStart: number; startTime: number; duration: number };
        const delay = e.processingStart - e.startTime;
        report('FID', delay, ratingINP(delay));
      }
    });
    inpObs.observe({ type: 'first-input', buffered: true });
  } catch { /* not supported */ }

  // TTFB — Time to First Byte
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (nav) {
      const ttfb = nav.responseStart - nav.requestStart;
      report('TTFB', ttfb, ratingTTFB(ttfb));
    }
  } catch { /* not supported */ }
}
