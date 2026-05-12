import { ConventionInfo } from '../../core/types';

export async function detectRustConventions(
  _rootPath: string
): Promise<Partial<ConventionInfo>> {
  return {
    formatter: 'rustfmt',
    identifierNaming: 'snake_case functions/vars, PascalCase types/traits, UPPER_SNAKE constants',
  };
}
