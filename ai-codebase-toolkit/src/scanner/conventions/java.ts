import * as path from 'path';
import { ConventionInfo } from '../../core/types';
import { pathExists, readText } from '../../utils/fs';

export async function detectJavaConventions(
  rootPath: string
): Promise<Partial<ConventionInfo>> {
  const result: Partial<ConventionInfo> = {
    identifierNaming: 'PascalCase classes, camelCase methods/vars, UPPER_SNAKE constants',
  };

  // Check pom.xml for checkstyle / spotless
  const pomContent = await readText(path.join(rootPath, 'pom.xml'));
  if (pomContent) {
    if (/checkstyle/i.test(pomContent)) {
      result.formatter = 'checkstyle';
    } else if (/spotless/i.test(pomContent)) {
      result.formatter = 'spotless';
    }
  }

  // Check build.gradle / build.gradle.kts for checkstyle / spotless
  if (!result.formatter) {
    const [gradleContent, gradleKtsContent] = await Promise.all([
      readText(path.join(rootPath, 'build.gradle')),
      readText(path.join(rootPath, 'build.gradle.kts')),
    ]);
    const combined = (gradleContent ?? '') + (gradleKtsContent ?? '');
    if (/checkstyle/i.test(combined)) {
      result.formatter = 'checkstyle';
    } else if (/spotless/i.test(combined)) {
      result.formatter = 'spotless';
    }
  }

  // Check for google-java-format in .editorconfig
  const hasEditorConfig = await pathExists(path.join(rootPath, '.editorconfig'));
  if (!result.formatter && hasEditorConfig) {
    const editorConfigContent = await readText(path.join(rootPath, '.editorconfig'));
    if (editorConfigContent && /google-java-format/i.test(editorConfigContent)) {
      result.formatter = 'google-java-format';
    }
  }

  return result;
}
