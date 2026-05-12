import { ConventionInfo } from '../../core/types';

export async function detectGoConventions(
  _rootPath: string
): Promise<Partial<ConventionInfo>> {
  // Go always uses gofmt; no configuration needed
  return {
    formatter: 'gofmt',
    identifierNaming: 'camelCase functions, PascalCase exported, snake_case packages',
  };
}
