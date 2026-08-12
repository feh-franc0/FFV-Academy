import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { ArticleJsonLd } from '@/components/article/ArticleJsonLd';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Dados estruturados — o que a página declara sobre si mesma.
 *
 * ## Por que este arquivo existe
 *
 * Em ago/2026 a auditoria de SEO encontrou três defeitos que nenhum teste pegava:
 *
 *  1. `ArticleJsonLd.tsx` existia e **nunca era importado**. A página tinha um
 *     JSON-LD embutido, mais pobre, sem autor e sem trilha de navegação.
 *  2. A `description` desse JSON-LD era gerada por máquina como
 *     `Aprenda X na trilha trail1 (hub hub-ia)` — com os IDENTIFICADORES
 *     INTERNOS. O `generateMetadata` da mesma página já usava as descrições
 *     escritas à mão; o dado estruturado tinha ficado atrás.
 *  3. As 1.247 perguntas visíveis não eram declaradas em lugar nenhum.
 *
 * Nada disso quebrava build, teste ou página. O sintoma era invisível de dentro:
 * só aparece em quem LÊ o HTML — buscador e resumo de IA.
 */

const RAIZ = process.cwd();

/** Extrai e valida como JSON todos os blocos de dado estruturado de um HTML. */
function blocosLd(html: string): Record<string, unknown>[] {
  const achados: Record<string, unknown>[] = [];
  const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  for (const m of html.matchAll(re)) {
    // Um bloco que não parseia é pior que bloco ausente: o buscador descarta
    // tudo em silêncio.
    achados.push(JSON.parse(m[1].replace(/\\u003c/g, '<')));
  }
  return achados;
}

const QUIZ = [
  {
    question: 'Por que compensação não é o mesmo que rollback?',
    options: ['São sinônimos', 'A compensação é uma transação nova, com efeito visível'],
    correctIndex: 1,
    explanation: 'O estorno aparece no extrato ao lado da cobrança — o histórico não é apagado.',
  },
];

function renderizar(props: Partial<Parameters<typeof ArticleJsonLd>[0]> = {}) {
  return renderToStaticMarkup(
    <ArticleJsonLd
      title="Sagas vs 2PC"
      description="Como coordenar transações distribuídas com compensação."
      slug="sagas-2pc"
      readTime={17}
      trailName="Sistemas Distribuídos"
      trailHref="/sistemas-distribuidos"
      hubName="Engenharia de Produção para IA"
      hubHref="/engenharia"
      quizzes={QUIZ}
      {...props}
    />,
  );
}

describe('ArticleJsonLd', () => {
  it('emite Article, BreadcrumbList e Quiz, todos parseáveis', () => {
    const tipos = blocosLd(renderizar()).map(b => b['@type']);
    expect(tipos).toEqual(['Article', 'BreadcrumbList', 'Quiz']);
  });

  it('o Article declara autor e editora', () => {
    const [artigo] = blocosLd(renderizar());
    // Autoria é sinal de experiência e de responsabilidade pelo conteúdo; era
    // exatamente o que faltava no JSON-LD embutido que estava no ar.
    expect((artigo.author as Record<string, string>)?.name).toBe('Fernando Franco Valle');
    expect((artigo.publisher as Record<string, string>)?.name).toBe('FFV Academy');
  });

  it('NUNCA vaza identificador interno na descrição', () => {
    const bruto = renderizar({
      description: 'Como coordenar transações distribuídas com compensação.',
    });
    // Era o defeito real: `na trilha trail1 (hub hub-ia)` no dado estruturado.
    expect(bruto).not.toMatch(/\btrail\d/);
    expect(bruto).not.toMatch(/\bhub-[a-z]/);
  });

  it('a trilha de navegação vai de Início a módulo, sem posição pulada', () => {
    const [, breadcrumb] = blocosLd(renderizar());
    const itens = breadcrumb.itemListElement as { position: number; name: string }[];
    expect(itens.map(i => i.position)).toEqual([1, 2, 3, 4]);
    expect(itens[0].name).toBe('FFV Academy');
    expect(itens.at(-1)?.name).toBe('Sagas vs 2PC');
  });

  it('sem hub e sem trilha, a trilha de navegação não fica com buraco', () => {
    // Posição pulada invalida a lista inteira — e é o erro fácil de cometer ao
    // montar o array condicionalmente.
    const [, breadcrumb] = blocosLd(
      renderizar({ hubName: undefined, hubHref: undefined, trailName: undefined, trailHref: undefined }),
    );
    const itens = breadcrumb.itemListElement as { position: number }[];
    expect(itens.map(i => i.position)).toEqual([1, 2]);
  });

  it('as perguntas são declaradas como Flashcard, com resposta e explicação', () => {
    const [, , quiz] = blocosLd(renderizar());
    const perguntas = quiz.hasPart as Record<string, unknown>[];
    expect(perguntas).toHaveLength(1);
    // A regra do Google é explícita: TODAS as perguntas precisam ser Flashcard,
    // ou a página não é elegível ao carrossel.
    expect(perguntas[0].eduQuestionType).toBe('Flashcard');
    const resposta = perguntas[0].acceptedAnswer as Record<string, unknown>;
    expect(resposta.text).toBe(QUIZ[0].options[QUIZ[0].correctIndex]);
    // A explicação é a parte que ensina; sem ela a resposta é afirmação solta.
    expect((resposta.comment as Record<string, string>).text).toContain('extrato');
  });

  it('quiz sem alternativa correta válida não é declarado', () => {
    // Declarar pergunta sem resposta descreveria algo que não existe na página.
    const tipos = blocosLd(
      renderizar({ quizzes: [{ question: 'Solta?', options: [], correctIndex: 0 }] }),
    ).map(b => b['@type']);
    expect(tipos).toEqual(['Article', 'BreadcrumbList']);
  });

  it('sem perguntas, não emite bloco de Quiz vazio', () => {
    const tipos = blocosLd(renderizar({ quizzes: [] })).map(b => b['@type']);
    expect(tipos).toEqual(['Article', 'BreadcrumbList']);
  });
});

describe('o que deliberadamente NÃO se marca', () => {
  it('não existe FAQPage no repositório', () => {
    // O resultado enriquecido de FAQ deixou de ser exibido no Google em maio de
    // 2026, e antes disso já era restrito a sites de governo e saúde. Marcar FAQ
    // seria trabalho para um recurso que não existe — e o teste registra a
    // decisão para ninguém "corrigir" isso de boa-fé no ano que vem.
    const componente = readFileSync(
      join(RAIZ, 'src', 'components', 'article', 'ArticleJsonLd.tsx'), 'utf8',
    );
    expect(componente).not.toMatch(/["']@type["']:\s*["']FAQPage["']/);
    expect(componente).toMatch(/FAQPage/); // a decisão está documentada
  });

  it('Course não declara módulo como CourseInstance nem inventa crédito', () => {
    const bruto = readFileSync(join(RAIZ, 'src', 'components', 'TrailBlogClient.tsx'), 'utf8');
    // Sem comentários: a primeira versão deste teste acusou a própria NOTA do
    // arquivo, que menciona os dois campos para explicar por que saíram. Gate que
    // reclama de documentação ensina o time a apagar documentação.
    const codigo = bruto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

    // Instância de curso é uma OFERTA (turma, modalidade, datas), não uma aula.
    // Declarar cinco aulas como cinco turmas simultâneas era simplesmente falso.
    expect(codigo).not.toMatch(/hasCourseInstance/);
    // Crédito é unidade acadêmica, e a plataforma não emite nenhum.
    expect(codigo).not.toMatch(/numberOfCredits/);
    expect(codigo).toMatch(/syllabusSections/);
  });
});
