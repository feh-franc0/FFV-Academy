import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * O laço de gamificação precisa estar ligado à rota de conteúdo.
 *
 * Durante a auditoria pedagógica de jul/2026 descobri que `markComplete` — que
 * concede XP, move o streak, avalia badge, sobe nível e cria os cards de revisão
 * espaçada — era chamado APENAS pelo `ModuleLayout`, componente legado da época
 * em que cada módulo era um page.tsx escrito à mão. A rota atual
 * (`/aprenda/[slug]`, CMS-driven via BlockRenderer) não chamava nada.
 *
 * Efeito medido: ler qualquer um dos 393 módulos não dava XP, não movia streak e
 * não gerava um único card de SRS — porque `addCardsFromQuiz` é a única fonte de
 * cards e ninguém a alcançava. O SM-2, descrito como diferencial central da
 * escola, nunca recebia material, e /revisar ficava permanentemente vazio.
 *
 * Nada quebrava: a página abria com 200 e o conteúdo aparecia. É exatamente o
 * tipo de desconexão que só um teste estrutural pega.
 */

const APP = join(process.cwd(), 'src', 'app');
const COMPONENTES = join(process.cwd(), 'src', 'components');
const LIB = join(process.cwd(), 'src', 'lib');

const paginaArtigo = readFileSync(join(APP, 'aprenda', '[slug]', 'page.tsx'), 'utf8');
const concluir = readFileSync(join(COMPONENTES, 'article', 'ConcluirModulo.tsx'), 'utf8');
// A extração de quiz morava em ConcluirModulo.tsx e foi para cá em 11/ago/2026
// — rodar no Server Component evita passar `article.blocks` inteiro (a
// árvore do artigo) como prop para um `'use client'`, que duplicava o
// conteúdo do módulo no payload RSC. Ver a nota em article-extract.ts.
const extracao = readFileSync(join(LIB, 'article-extract.ts'), 'utf8');

describe('gamificação ligada à rota de conteúdo', () => {
  it('a rota /aprenda/[slug] renderiza o componente de conclusão', () => {
    expect(paginaArtigo).toContain('<ConcluirModulo');
    expect(paginaArtigo).toMatch(/import \{ ConcluirModulo \}/);
  });

  it('a página extrai o quiz de article.blocks e passa pronto para o componente', () => {
    // sem o quiz extraído não há card de SRS. Extração roda no Server Component
    // (não em ConcluirModulo, que é 'use client') para não duplicar o conteúdo
    // do módulo no payload RSC — ver article-extract.ts.
    expect(paginaArtigo).toMatch(/extrairQuizzes\(article\.blocks\)/);
    expect(paginaArtigo).toMatch(/<ConcluirModulo[\s\S]{0,240}quizzes=\{/);
  });

  it('o componente chama markComplete', () => {
    expect(concluir).toContain('markComplete(');
    expect(concluir).toMatch(/useGameState/);
  });

  it('a extração de quiz traduz correctIndex → correct', () => {
    // O bloco usa `correctIndex`; o engine espera `correct`. Passar data direto
    // criaria card com a resposta errada marcada como certa.
    expect(extracao).toContain('correctIndex');
    expect(extracao).toMatch(/correct[,:]/);
    // e precisa descer na árvore, porque quiz vive dentro de section
    expect(extracao).toMatch(/children/);
  });

  it('markComplete continua existindo no engine com o contrato esperado', () => {
    const engine = readFileSync(join(process.cwd(), 'src', 'lib', 'engine.ts'), 'utf8');
    expect(engine).toContain('addCardsFromQuiz');
    expect(engine).toMatch(/quiz: Array<\{[\s\S]{0,140}correct: number/);
  });

  it('a comemoração de fim de trilha tem gatilho', () => {
    // O TrailCompletionModal também tinha o ModuleLayout como único gatilho: 315
    // linhas de componente com teste de render passando e nenhum caminho que o
    // fizesse aparecer. Terminar SAP-C03 inteiro não produzia marcação de fim.
    // Teste de render verde não prova que a feature existe para o usuário.
    expect(concluir).toContain('TrailCompletionModal');
    expect(concluir).toMatch(/trilha\.modules\.every/);
  });

  it('o gatilho de fim de trilha compara com o estado ANTES da conclusão', () => {
    // Sem a lista pré-conclusão não há como distinguir "fechou agora" de
    // "já estava fechada" — e o modal reapareceria a cada reabertura do módulo.
    expect(concluir).toMatch(/concluidosAntes/);
  });

  it('o ModuleLayout legado não voltou', () => {
    // Enquanto ele existia, havia dois caminhos de conclusão divergentes. Se
    // reaparecer, este teste força a decisão explícita em vez do drift silencioso.
    const { existsSync } = require('node:fs') as typeof import('node:fs');
    expect(existsSync(join(COMPONENTES, 'ModuleLayout.tsx'))).toBe(false);
  });

  it('nenhuma outra rota de conteúdo ficou sem o componente', () => {
    // se surgir outra rota que renderize BlockTree, ela também precisa conceder XP
    const semConclusao: string[] = [];
    const varrer = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const caminho = join(dir, e.name);
        if (e.isDirectory()) {
          varrer(caminho);
        } else if (e.name === 'page.tsx') {
          const src = readFileSync(caminho, 'utf8');
          const rota = caminho.replace(process.cwd() + '/src/app', '').replace('/page.tsx', '');
          // dev-preview é ferramenta de autoria, não consumo — não concede XP
          if (rota.startsWith('/dev-preview')) continue;
          if (src.includes('<BlockTree') && !src.includes('<ConcluirModulo')) {
            semConclusao.push(rota);
          }
        }
      }
    };
    varrer(APP);
    expect(semConclusao).toEqual([]);
  });
});
