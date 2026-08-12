import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Nenhum componente de cliente decide o que RENDERIZAR olhando o ambiente.
 *
 * ## O defeito real
 *
 * `RequireAuth` tinha, dentro do render:
 *
 *     if (user === null && typeof window === 'undefined') { …esqueleto… }
 *
 * O servidor entregava o esqueleto de "verificando autenticação"; o primeiro
 * render do cliente entregava a tela de login. Isso é **incompatibilidade de
 * hidratação garantida** — e é literalmente o primeiro item que a mensagem de
 * erro do React lista como causa.
 *
 * A página respondia 200, tinha `<h1>`, tinha conteúdo e passava em todas as
 * checagens estruturais da varredura. O defeito só aparecia ao **renderizar de
 * verdade** num navegador e escutar o console — e a varredura só renderizava uma
 * amostra de 4% dos módulos, sem nenhuma rota de simulado.
 *
 * A correção foi de causa: estado real de carregamento no contexto, começando
 * `true` no servidor e no primeiro render do cliente. Ramo por ambiente nunca faz
 * os dois concordarem.
 *
 * ## O que este teste permite e o que ele proíbe
 *
 * `typeof window` é legítimo em EFEITO, em manipulador de evento e em função
 * utilitária — ali o código só roda no cliente, ou o retorno é um valor neutro.
 * O que este teste proíbe é preciso: **condicional de ambiente que governa um
 * retorno de JSX**, porque é isso que faz servidor e cliente desenharem árvores
 * diferentes.
 *
 * A primeira versão do teste era grossa: acusava qualquer `typeof window` em
 * arquivo de cliente e apontou 11 arquivos, todos corretos — guarda dentro de
 * função utilitária (`if (typeof window === 'undefined') return [];`) e dentro de
 * efeito. Gate que acusa código correto ensina o time a desligar gate.
 */

const SRC = join(process.cwd(), 'src');

/** Arquivos que declaram `'use client'` — só eles são hidratados. */
function componentesDeCliente(dir = SRC): string[] {
  const achados: string[] = [];
  for (const e of readdirSync(dir)) {
    const caminho = join(dir, e);
    if (statSync(caminho).isDirectory()) {
      if (e === 'tests' || e === 'node_modules') continue;
      achados.push(...componentesDeCliente(caminho));
      continue;
    }
    if (!/\.(tsx|ts)$/.test(e)) continue;
    const src = readFileSync(caminho, 'utf8');
    if (/^\s*['"]use client['"]/m.test(src)) achados.push(caminho);
  }
  return achados;
}

/** Remove comentário, para o texto de uma nota não ser confundido com código. */
function semComentario(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

/**
 * Trechos em que uma condicional de ambiente governa um retorno de **JSX**.
 *
 * O corte é esse porque é ele que separa o defeito do uso legítimo: devolver
 * `[]`, `''` ou `undefined` sob `typeof window === 'undefined'` é guarda de
 * função utilitária e não desenha nada. Devolver JSX é desenhar árvore diferente
 * da do servidor.
 */
function ramosDeAmbienteComJsx(src: string): string[] {
  const achados: string[] = [];
  const re = /if\s*\(([^)]*typeof\s+(?:window|document)\s*[!=]==?\s*['"]undefined['"][^)]*)\)\s*(\{[\s\S]{0,600}?\n\s*\}|[^\n;]{0,200};)/g;
  for (const m of semComentario(src).matchAll(re)) {
    const corpo = m[2];
    if (/return\s*\(?\s*</.test(corpo)) achados.push(m[1].trim());
  }
  return achados;
}

const CLIENTES = componentesDeCliente();

describe('componentes de cliente', () => {
  it('existem componentes de cliente para verificar', () => {
    expect(CLIENTES.length).toBeGreaterThan(20);
  });

  it('nenhum decide o render por `typeof window` ou `typeof document`', () => {
    const suspeitos: string[] = [];
    for (const caminho of CLIENTES) {
      const ramos = ramosDeAmbienteComJsx(readFileSync(caminho, 'utf8'));
      for (const cond of ramos) {
        suspeitos.push(`${caminho.replace(`${process.cwd()}/`, '')} → if (${cond})`);
      }
    }
    expect(
      suspeitos,
      'condicional de ambiente no caminho de render causa incompatibilidade de hidratação — ' +
      'use estado real (contexto ou `useState` + `useEffect`)',
    ).toEqual([]);
  });

  it('o guarda de autenticação decide por estado de carregamento', () => {
    const src = readFileSync(join(SRC, 'components', 'auth', 'RequireAuth.tsx'), 'utf8');
    expect(src).toContain('carregando');
    // A regressão a impedir é voltar ao ramo por ambiente governando JSX.
    expect(ramosDeAmbienteComJsx(src)).toEqual([]);
  });

  it('o contexto de autenticação expõe o estado de carregamento', () => {
    const contexto = readFileSync(join(SRC, 'hooks', 'useAuth.ts'), 'utf8');
    expect(contexto).toMatch(/carregando:\s*boolean/);
    const provider = readFileSync(join(SRC, 'components', 'auth', 'AuthProvider.tsx'), 'utf8');
    // Começar `true` é o que faz servidor e primeiro render concordarem.
    expect(provider).toMatch(/useState\(true\)/);
    // E precisa sair do carregamento mesmo quando a renovação falha.
    expect(provider).toMatch(/finally/);
  });
});
