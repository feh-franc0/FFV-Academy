/**
 * Codec único de (de)serialização do GameState — usado por engine.ts (fonte
 * de escrita canônica) E por progress-sync.ts (sincronização com o backend).
 *
 * Por quê este módulo existe: antes, `engine.ts` gravava o estado comprimido
 * com LZ-string e `progress-sync.ts` lia com `JSON.parse` cru, sem
 * descomprimir. O parse falhava sempre, `pushProgress` desistia antes de
 * chamar a API, e XP/streak/SRS nunca saíam do navegador — em silêncio,
 * porque o teste de integração também semeava o estado como JSON puro (o
 * formato que a engine nunca produz). Ter UM módulo de codec elimina a classe
 * inteira desse defeito: os dois lados não podem mais divergir de formato,
 * porque os dois chamam a mesma função.
 */

import LZString from 'lz-string';

/** Comprime um GameState (ou qualquer objeto serializável) para persistência. */
export function encodeGameState(value: unknown): string {
  return LZString.compress(JSON.stringify(value));
}

/**
 * Decodifica uma string persistida de volta a um objeto solto (sem validação
 * de schema — quem chama decide o que fazer com o formato).
 *
 * Aceita os dois formatos históricos: comprimido (LZ-string, produzido pela
 * engine desde a v2) e JSON puro (formato legado, e o que `pullProgress`
 * grava localmente após um pull do servidor). Retorna `null` se `raw` for
 * vazio ou não puder ser interpretado como JSON de nenhuma das duas formas.
 */
export function decodeGameState(raw: string | null): unknown | null {
  if (!raw) return null;

  // JSON puro começa com '{' — pular o decompress evita que
  // LZString.decompress trave em entrada arbitrária que não é o formato dela.
  let finalStr: string;
  if (raw.charAt(0) === '{') {
    finalStr = raw;
  } else {
    let decompressed: string | null = null;
    try {
      decompressed = LZString.decompress(raw);
    } catch { /* não estava comprimido */ }
    finalStr = decompressed || raw;
  }

  try {
    return JSON.parse(finalStr) as unknown;
  } catch {
    return null;
  }
}
