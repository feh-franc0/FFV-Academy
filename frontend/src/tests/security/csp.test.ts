/**
 * CSP / security headers — valida via leitura do arquivo layout.tsx.
 *
 * Como o site é export estático na Hostinger (sem middleware Next),
 * os headers precisam estar presentes como <meta> no <head> do layout raiz.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const layoutSource = readFileSync(
  resolve(__dirname, '../../app/layout.tsx'),
  'utf-8',
);

describe('layout.tsx — headers de segurança via <meta>', () => {
  it('declara Content-Security-Policy com default-src self', () => {
    expect(layoutSource).toMatch(/httpEquiv=["']Content-Security-Policy["']/);
    expect(layoutSource).toMatch(/default-src 'self'/);
  });

  it('inclui js.stripe.com no script-src e frame-src', () => {
    const cspMatch = layoutSource.match(/Content-Security-Policy["'][^]*?content="([^"]+)"/);
    expect(cspMatch).not.toBeNull();
    const csp = cspMatch![1];
    expect(csp).toMatch(/script-src[^;]*https:\/\/js\.stripe\.com/);
    expect(csp).toMatch(/frame-src[^;]*https:\/\/js\.stripe\.com/);
  });

  it('inclui object-src none e base-uri self', () => {
    expect(layoutSource).toMatch(/object-src 'none'/);
    expect(layoutSource).toMatch(/base-uri 'self'/);
  });

  it('declara X-Content-Type-Options: nosniff', () => {
    expect(layoutSource).toMatch(/httpEquiv=["']X-Content-Type-Options["']/);
    expect(layoutSource).toMatch(/content=["']nosniff["']/);
  });

  it('declara Referrer-Policy strict-origin-when-cross-origin', () => {
    expect(layoutSource).toMatch(/name=["']referrer["']/);
    expect(layoutSource).toMatch(/strict-origin-when-cross-origin/);
  });

  it('declara Permissions-Policy bloqueando geo/mic/camera', () => {
    expect(layoutSource).toMatch(/httpEquiv=["']Permissions-Policy["']/);
    expect(layoutSource).toMatch(/geolocation=\(\)/);
    expect(layoutSource).toMatch(/microphone=\(\)/);
    expect(layoutSource).toMatch(/camera=\(\)/);
  });
});
