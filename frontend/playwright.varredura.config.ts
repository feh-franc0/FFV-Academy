import { defineConfig, devices } from '@playwright/test';

/**
 * Config dedicada à varredura completa de rotas (`e2e/todas-as-rotas.spec.ts`).
 *
 * Ela existe separada da config principal por dois motivos:
 *
 *  - **Porta própria (3100).** A varredura visita centenas de páginas e demora
 *    minutos. Rodá-la na 3000 exigiria derrubar o dev server de quem está
 *    trabalhando, ou reaproveitá-lo — e reaproveitar um servidor em modo de
 *    desenvolvimento mede a coisa errada: compilação sob demanda mascara erro
 *    de build e muda drasticamente o tempo de resposta.
 *
 *  - **Build de produção.** `next start` serve exatamente o que vai ao ar,
 *    incluindo as páginas pré-renderizadas. É a única forma de a varredura
 *    dizer algo sobre produção.
 *
 * ## Limitação conhecida, para não se ler mais garantia do que existe
 *
 * `npm start` avisa que não funciona com `output: "standalone"` — e serve as
 * páginas de qualquer forma, a partir de `.next/`. O contêiner de produção roda
 * `node .next/standalone/server.js`, que exige `.next/static` e `public`
 * copiados para dentro da pasta standalone (o Dockerfile faz isso).
 *
 * Consequência: a varredura valida o HTML PRÉ-RENDERIZADO e o roteamento, que
 * são idênticos nos dois servidores. Ela NÃO valida o empacotamento standalone
 * — arquivo estático faltando na imagem, por exemplo, passaria por aqui e
 * quebraria em produção. Essa verificação pertence a um teste de fumaça contra o
 * contêiner, e não existe hoje.
 *
 * Uso:
 *     npm run build
 *     npm run varredura
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/todas-as-rotas.spec.ts'],
  // A varredura inteira é longa por natureza; o limite por teste está definido
  // dentro do próprio arquivo, por caso.
  timeout: 40 * 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'PORT=3100 npm start',
    url: 'http://localhost:3100',
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
