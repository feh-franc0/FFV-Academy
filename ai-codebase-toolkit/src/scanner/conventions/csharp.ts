import { ConventionInfo } from '../../core/types';

export async function detectCSharpConventions(
  _rootPath: string
): Promise<Partial<ConventionInfo>> {
  return {
    identifierNaming: 'PascalCase methods/classes/props, camelCase private fields with _ prefix',
  };
}
