import { describe, expect, it } from 'vitest';
import { CURRICULUM, JORNADA, sequenciaPrincipal, etapaDaTrilha } from '@/lib/curriculum';

/**
 * A jornada é a espinha do currículo — e ela só existe enquanto as arestas
 * existirem.
 *
 * ## O defeito que estes testes impedem de voltar
 *
 * Medido em 09/ago/2026: **31 das 38 trilhas terminavam em beco sem saída** e
 * **138 módulos no meio de trilha não tinham `nextSuggested`**. Nada reclamava,
 * porque o currículo compila igual com ou sem a aresta: falta de link não é erro
 * de tipo, é ausência silenciosa. O prejuízo é duplo — o leitor termina uma
 * trilha sem saber o que vem depois, e o rastreador trata a página como folha.
 *
 * ## Por que travar aqui e não no gate de conteúdo
 *
 * Os gates em `scripts/` leem os seeds, que são o CONTEÚDO. A cadeia vive no
 * índice (`curriculum/trails/`), que é outro artefato — e é aqui que uma trilha
 * nova entra. Uma trilha acrescentada sem entrar na jornada reprova no primeiro
 * caso abaixo, que é onde custa menos consertar.
 */
describe('a jornada liga o currículo de ponta a ponta', () => {
  const porId = new Map(CURRICULUM.map(t => [t.id, t]));

  it('toda trilha do currículo está na jornada, exatamente uma vez', () => {
    const citadas = JORNADA.flatMap(e => [...e.trilhas, ...e.opcionais]);
    const repetidas = citadas.filter((t, i) => citadas.indexOf(t) !== i);
    expect(repetidas, 'trilha citada em mais de uma etapa').toEqual([]);

    const inexistentes = citadas.filter(id => !porId.has(id));
    expect(inexistentes, 'jornada cita trilha que não existe no currículo').toEqual([]);

    const forasteiras = CURRICULUM.map(t => t.id).filter(id => !citadas.includes(id));
    expect(
      forasteiras,
      'trilha no currículo e fora da jornada — ela não aparece em /jornada e não recebe link da etapa',
    ).toEqual([]);
  });

  it('o último módulo de cada trilha aponta para fora dela — zero becos sem saída', () => {
    const becos = CURRICULUM.filter(t => {
      const ultimo = t.modules[t.modules.length - 1];
      if (!ultimo) return false;
      const proprios = new Set(t.modules.map(m => m.slug));
      return !(ultimo.nextSuggested ?? []).some(s => !proprios.has(s));
    }).map(t => `${t.id} (último: ${t.modules[t.modules.length - 1]?.slug})`);
    expect(becos, 'trilha que termina sem apontar para outra — o leitor não sabe o que vem depois').toEqual([]);
  });

  it('a sequência principal encadeia: o fim de uma trilha é o começo da próxima', () => {
    const seq = sequenciaPrincipal();
    const quebras: string[] = [];
    for (let i = 0; i < seq.length - 1; i++) {
      const atual = porId.get(seq[i])!;
      const proxima = porId.get(seq[i + 1])!;
      const ultimo = atual.modules[atual.modules.length - 1];
      const esperado = proxima.modules[0]?.slug;
      if (!(ultimo?.nextSuggested ?? []).includes(esperado!)) {
        quebras.push(`${seq[i]} -> ${seq[i + 1]}: ${ultimo?.slug} não sugere ${esperado}`);
      }
    }
    expect(quebras).toEqual([]);
  });

  it('todo módulo tem para onde mandar o leitor', () => {
    const sem = CURRICULUM.flatMap(t => t.modules)
      .filter(m => !m.nextSuggested?.length)
      .map(m => m.slug);
    expect(sem, 'módulo sem nextSuggested: a página termina e não diz o que vem depois').toEqual([]);
  });

  it('todo destino de nextSuggested existe', () => {
    const slugs = new Set(CURRICULUM.flatMap(t => t.modules).map(m => m.slug));
    const quebrados = CURRICULUM.flatMap(t => t.modules).flatMap(m =>
      (m.nextSuggested ?? []).filter(s => !slugs.has(s)).map(s => `${m.slug} -> ${s}`),
    );
    expect(quebrados).toEqual([]);
  });

  it('cada etapa declara pergunta e resultado — conteúdo, não rótulo', () => {
    for (const e of JORNADA) {
      expect(e.pergunta.length, `${e.id}: pergunta rasa`).toBeGreaterThan(25);
      expect(e.resultado.length, `${e.id}: resultado raso`).toBeGreaterThan(60);
      expect(e.trilhas.length, `${e.id}: etapa sem trilha principal`).toBeGreaterThan(0);
    }
  });

  it('as etapas estão numeradas em sequência a partir de zero', () => {
    expect(JORNADA.map(e => e.numero)).toEqual(JORNADA.map((_, i) => i));
  });

  it('etapaDaTrilha encontra a etapa de qualquer trilha do currículo', () => {
    const orfas = CURRICULUM.filter(t => !etapaDaTrilha(t.id)).map(t => t.id);
    expect(orfas).toEqual([]);
  });
});
