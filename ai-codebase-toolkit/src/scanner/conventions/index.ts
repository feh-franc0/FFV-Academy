import { ConventionInfo } from '../../core/types';
import { detectCSharpConventions } from './csharp';
import { detectGoConventions } from './go';
import { detectJavaConventions } from './java';
import { detectPythonConventions } from './python';
import { detectRustConventions } from './rust';

export async function detectConventionsByLanguage(
  rootPath: string,
  language: string
): Promise<Partial<ConventionInfo>> {
  switch (language) {
    case 'python':
      return detectPythonConventions(rootPath);
    case 'go':
      return detectGoConventions(rootPath);
    case 'java':
      return detectJavaConventions(rootPath);
    case 'csharp':
      return detectCSharpConventions(rootPath);
    case 'rust':
      return detectRustConventions(rootPath);
    default:
      return {};
  }
}
