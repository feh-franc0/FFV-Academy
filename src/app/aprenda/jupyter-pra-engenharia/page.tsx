import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('jupyter-pra-engenharia');

const accent = '#3776ab';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o problema clássico de "state oculto" em Jupyter?',
    options: [
      'Não existe',
      'Células podem executar fora de ordem, variáveis antigas persistem, notebook compartilhado pode ter "works on my machine" irreproduzível. Kernel tem state entre cells que não é óbvio',
      'Jupyter é imutável',
      'Células não têm variáveis',
    ],
    correct: 1,
    explanation: 'Problema real. Kernel mantém globals entre cells. Dev executa cell 5, edita cell 3, executa cell 5 de novo — estado depende de ordem de execução. Boas práticas: Restart Kernel + Run All antes de commitar. Marimo resolve via dependency graph automático.',
  },
  {
    question: 'O que jupytext faz?',
    options: [
      'Editor alternativo',
      'Converte .ipynb pra .py (ou .md) com metadata embedded — permite diff amigável em git, code review normal, mas mantém capacidade de abrir como notebook',
      'Só visual',
      'Converte pra PDF',
    ],
    correct: 1,
    explanation: '.ipynb é JSON com output embutido — inviável pra git diff. jupytext cria arquivo pareado .py com cells marcadas. Commitar o .py; .ipynb fica gitignored. Abrir .py como notebook com Jupyter mostra cells. Diff de code review funciona em código, não JSON.',
  },
  {
    question: 'Quando Marimo é uma escolha melhor que Jupyter?',
    options: [
      'Nunca',
      'Quando reprodutibilidade importa: Marimo recomputa automaticamente dependências (grafo reativo), salva como .py plain, não tem state oculto. Feito pra apps interativos de dados além de notebooks',
      'Apenas em Mac',
      'Marimo é legacy',
    ],
    correct: 1,
    explanation: 'Marimo (2024+) é notebook reativo. Mudar célula recalcula dependentes (como Observable/Excel). Arquivo é .py plain — git-friendly nativo. Pode deploy como app (like Streamlit). Replacing Jupyter para muitos casos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="jupyter-pra-engenharia"
      title="Jupyter pra engenharia: notebook reprodutível"
      icon="📓"
      xp={45}
      readTime={10}
      trailName="Python para Engenheiros"
      trailColor={accent}
      nextSlug="capstone-agent-python-completo"
      nextTitle="Capstone: agent Python completo com Claude SDK"
      quiz={quiz}
    >
      <Section title="Jupyter bem usado" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>Exploração</strong>: dados novos, entender shape, viz rápida.</li>
          <li><strong>Relatórios parametrizados</strong>: papermill executa notebook com params, gera artifact.</li>
          <li><strong>Prototipagem de modelo</strong>: treinar, plotar, iterar rápido.</li>
          <li><strong>Documentação executável</strong>: tutoriais.</li>
        </ul>
        <p>
          Jupyter NÃO é: produção. Quando código estabiliza, migrar pra módulo .py + pytest.
        </p>
      </Section>

      <Section title="jupytext pra git diff sadio" accent={accent}>
        <CodeBlock lang="bash">{`uv add --dev jupytext

# Parear notebook com .py
jupytext --set-formats ipynb,py:percent analysis.ipynb

# Agora analysis.py é gerado ao salvar. Commit só o .py:
# .gitignore:
*.ipynb
!notebooks-public/**/*.ipynb  # exceções se precisa

# Abrir .py como notebook:
jupyter notebook analysis.py  # funciona direto`}</CodeBlock>
      </Section>

      <Section title="papermill — notebook como função" accent={accent}>
        <CodeBlock lang="python">{`# cells parametrizadas (tag: parameters)
# date = "2026-04-01"
# client_id = "acme"

# Execute com params
import papermill as pm
pm.execute_notebook(
    "report.ipynb",
    "out/report-acme-20260401.ipynb",
    parameters={"date": "2026-04-01", "client_id": "acme"},
)

# Uso: relatórios mensais, experiments em grid, dashboards programáticos`}</CodeBlock>
      </Section>

      <Section title="Marimo alternativa" accent={accent}>
        <CodeBlock lang="bash">{`uv tool install marimo

# Cria novo
marimo new analysis.py

# Edita (abre browser com UI reativa)
marimo edit analysis.py

# Deploy como app
marimo run analysis.py --port 8080`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Regra: notebook pra exploração, .py+pytest pra código que vai rodar em produção. Marimo ajuda a migrar gradualmente.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
