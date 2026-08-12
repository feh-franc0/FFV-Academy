/**
 * Política de segurança de conteúdo — verificada onde ela realmente vive.
 *
 * ## Por que este arquivo mudou em ago/2026
 *
 * A versão anterior lia `layout.tsx` e exigia uma `<meta http-equiv>`. Isso
 * fazia sentido na época do export estático, quando não havia servidor para
 * emitir header. O projeto migrou para SSR em contêiner, o header passou a
 * existir — e a meta ficou, agora ao lado dele.
 *
 * Duas políticas simultâneas não se somam: o navegador aplica a INTERSEÇÃO, e a
 * mais restritiva vence em cada diretiva. A varredura de rotas com navegador
 * real mostrou o efeito:
 *
 *  - a meta fixava `https://api.fernandofrancovalle.com` no código, então
 *    qualquer ambiente com outra URL de API tinha as chamadas BLOQUEADAS, com
 *    erro apenas no console;
 *  - `js.stripe.com` estava em `script-src` na meta e ausente no header.
 *    Interseção: ausente. O script do checkout não carregaria.
 *
 * A meta foi removida e o header, completado. Este teste passou a verificar o
 * header — e a garantir que a meta não volte, porque ela reintroduziria
 * exatamente esse conflito silencioso.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const configSource = readFileSync(resolve(__dirname, '../../../next.config.ts'), 'utf-8');
const layoutSource = readFileSync(resolve(__dirname, '../../app/layout.tsx'), 'utf-8');

/** O valor do header, montado como array de diretivas em next.config.ts. */
const csp = configSource.slice(
  configSource.indexOf('Content-Security-Policy'),
  configSource.indexOf('X-Frame-Options'),
);

describe('Content-Security-Policy — header HTTP como fonte única', () => {
  it('o header declara a política, em next.config.ts', () => {
    expect(configSource).toMatch(/key:\s*["']Content-Security-Policy["']/);
    expect(csp).toMatch(/default-src 'self'/);
  });

  it('NÃO existe <meta http-equiv> de CSP no layout', () => {
    // Recriar a meta faz o navegador aplicar a interseção das duas políticas —
    // e o conflito não dá erro de build nem de teste, só quebra em produção.
    expect(
      layoutSource,
      'header e meta simultâneos se INTERSECTAM; mantenha só o header',
    ).not.toMatch(/httpEquiv=["']Content-Security-Policy["']/);
  });

  it('a URL da API vem do ambiente, nunca fixa no código', () => {
    expect(csp).toContain('process.env.NEXT_PUBLIC_API_BASE_URL');
    expect(
      csp,
      'URL de produção fixa no código bloqueia todo outro ambiente',
    ).not.toMatch(/connect-src[^`]*https:\/\/api\.fernandofrancovalle\.com/);
  });

  it('Stripe está liberado onde precisa: script e frame', () => {
    expect(csp).toMatch(/script-src[^"]*https:\/\/js\.stripe\.com/);
    expect(csp).toMatch(/frame-src[^"]*https:\/\/js\.stripe\.com/);
    expect(csp).toMatch(/connect-src[^`]*https:\/\/api\.stripe\.com/);
  });

  it('inclui as diretivas de endurecimento que a meta trazia', () => {
    // Elas vieram da meta ao removê-la. Sem esta checagem, a remoção teria
    // afrouxado a política em silêncio.
    expect(csp).toMatch(/object-src 'none'/);
    expect(csp).toMatch(/base-uri 'self'/);
    expect(csp).toMatch(/form-action 'self'/);
  });

  it('frame-ancestors está no header — em <meta> ele é ignorado', () => {
    expect(csp).toMatch(/frame-ancestors 'none'/);
  });
});

describe('script-src — achado P-07 da auditoria de 11/ago/2026', () => {
  /** Só a linha de script-src — img-src legitimamente tem data:/blob:. */
  const scriptSrcLine = csp
    .split('\n')
    .find(line => /"script-src /.test(line)) ?? '';

  it('a linha de script-src existe e foi encontrada', () => {
    expect(scriptSrcLine).not.toBe('');
  });

  it('NÃO contém unsafe-eval', () => {
    // `data:` em script-src anula boa parte da política (qualquer conteúdo
    // que injete um data: URI executa como script de primeira parte).
    // unsafe-eval não é necessário: o único new Function() do projeto
    // (CodePlayground, achado P-16) foi quarentenado pra frontend/drafts/ —
    // fora de src/, fora do bundle de produção. Ver
    // scripts/check-no-code-execution-cdns.mjs para o gate que mede o
    // bundle REAL (não só a ausência de import) e frontend/CLAUDE.md.
    expect(scriptSrcLine).not.toMatch(/unsafe-eval/);
  });

  it('NÃO contém data: nem blob: como fonte de script', () => {
    expect(scriptSrcLine).not.toMatch(/\bdata:/);
    expect(scriptSrcLine).not.toMatch(/\bblob:/);
  });

  it('mantém unsafe-inline — necessário pro payload RSC de hidratação do Next', () => {
    // Testado remover com Playwright contra o build de produção: o App
    // Router injeta múltiplos <script> inline por requisição (payload RSC),
    // com conteúdo que muda a cada build — um hash estático nunca cobre
    // isso, e nonce por request exigiria middleware (desliga cache
    // estático/ISR). Ver next.config.ts para o registro completo da decisão.
    expect(scriptSrcLine).toMatch(/unsafe-inline/);
  });
});

describe('demais headers de segurança', () => {
  it('X-Content-Type-Options: nosniff, no header e no layout', () => {
    expect(configSource).toMatch(/X-Content-Type-Options/);
    expect(layoutSource).toMatch(/httpEquiv=["']X-Content-Type-Options["']/);
  });

  it('Referrer-Policy restritiva', () => {
    expect(configSource).toMatch(/strict-origin-when-cross-origin/);
    expect(layoutSource).toMatch(/name=["']referrer["']/);
  });

  it('Permissions-Policy bloqueia geolocalização, microfone e câmera', () => {
    expect(layoutSource).toMatch(/httpEquiv=["']Permissions-Policy["']/);
    expect(layoutSource).toMatch(/geolocation=\(\)/);
    expect(layoutSource).toMatch(/microphone=\(\)/);
    expect(layoutSource).toMatch(/camera=\(\)/);
  });
});
