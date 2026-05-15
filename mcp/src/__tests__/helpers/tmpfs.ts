import { mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

export interface TempJsonHandle {
  /** Caminho absoluto do arquivo JSON temporário. */
  path: string;
  /** Remove o diretório temporário recursivamente. */
  cleanup: () => Promise<void>;
}

/**
 * Cria um arquivo JSON temporário com o conteúdo serializado de `initial`.
 * Retorna o caminho e um cleanup que apaga o diretório por inteiro.
 */
export async function withTempJson(initial: unknown): Promise<TempJsonHandle> {
  const dir = await mkdtemp(join(tmpdir(), "ffv-mcp-test-"));
  const path = join(dir, "data.json");
  await writeFile(path, JSON.stringify(initial, null, 2) + "\n", "utf-8");
  return {
    path,
    cleanup: () => rm(dir, { recursive: true, force: true }),
  };
}
