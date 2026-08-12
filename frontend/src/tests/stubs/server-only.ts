/**
 * Stub de `server-only` para o Vitest.
 *
 * O pacote real é injetado pelo bundler do Next e só existe lá: ele quebra o
 * build de propósito quando um componente de cliente importa um módulo marcado
 * como servidor. Sob Vitest não há bundler, então o import não resolve e o
 * arquivo de teste inteiro falha ao carregar.
 *
 * Este arquivo vazio destrava o teste sem afrouxar nada em produção — a guarda
 * de verdade continua acontecendo no `next build`.
 */
export {};
