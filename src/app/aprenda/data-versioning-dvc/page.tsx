import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('data-versioning-dvc');

const accent = '#2ea5b3';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que versionar dataset em Git direto é péssima ideia?',
    options: [
      'Porque Git odeia dataset',
      'Git foi desenhado para texto pequeno. Datasets de GB/TB explodem o repo, storage fica duplicado a cada branch, diff não faz sentido em binário e clone vira horas. DVC mantém pointers pequenos no Git e os blobs em object store (S3/GCS)',
      'Porque Git é lento em geral',
      'Porque datasets não mudam',
    ],
    correct: 1,
    explanation: 'DVC substitui o arquivo grande por um .dvc pointer versionado no Git (contém hash e metadados). O blob real vai para S3/GCS/Azure via dvc push. Resultado: o repo Git continua leve, o dataset fica versionado, dvc checkout recupera a versão exata usada naquele commit. Reprodutibilidade sem inchar o Git.',
  },
  {
    question: 'Qual é a diferença pedagógica entre DVC e lakeFS?',
    options: [
      'Nenhuma',
      'DVC é git-like file-level: bom para datasets discretos versionados junto ao código. lakeFS é branch-over-lake: dá branch/merge semântico sobre data lake inteiro (S3), ótimo quando muitos pipelines escrevem no mesmo lake e você quer isolamento transacional',
      'lakeFS é só UI de DVC',
      'DVC é pago, lakeFS é grátis',
    ],
    correct: 1,
    explanation: 'DVC versiona arquivos/diretórios específicos alinhados ao código do projeto. lakeFS introduz branches no próprio lake, permitindo "branch main + branch experiment" sobre buckets S3 inteiros, merge atômico e rollback. Projetos diferentes escolhem diferente: DVC domina em ML repo-centric, lakeFS em data platform multi-time.',
  },
  {
    question: 'Por que reprodutibilidade em ML tem custo real?',
    options: [
      'Não tem, é só commitar tudo',
      'Exige storage extra (cada versão de dataset fica guardada), orquestração para hashear e diffar blobs grandes, disciplina de time (ninguém pode escrever no bucket de dados "cru") e compute para rodar dvc repro quando algo muda. O valor é real, mas precisa orçamento',
      'É de graça',
      'Só exige comprar CPU nova',
    ],
    correct: 1,
    explanation: 'Reprodutibilidade de ML não é flag mágica: é disciplina ativa sustentada por storage extra, compute de revalidação e processo. O retorno aparece quando um auditor pergunta "qual dataset treinou o modelo em prod em janeiro?" e você recupera exatamente aquele snapshot. Sem esse orçamento, o que existe é teatro de reprodutibilidade.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="data-versioning-dvc"
      title="Data versioning: DVC, lakeFS"
      icon="📦"
      xp={50}
      readTime={12}
      trailName="MLOps — ML em produção"
      trailColor={accent}
      nextSlug="ci-cd-para-modelos"
      nextTitle="CI/CD para modelos + monitoring drift"
      quiz={quiz}
    >
      <Section title="O problema: código versionado, dados não" accent={accent}>
        <p>
          Time versiona código religiosamente mas trata dataset como arquivo solto em S3 que qualquer pipeline sobrescreve. Seis meses depois, a auditoria pergunta qual foi exatamente o dataset que treinou o modelo promovido em março — e ninguém sabe. Data versioning resolve isso tratando dataset como artifact imutável e rastreável.
        </p>
      </Section>

      <Section title="DVC — fluxo básico" accent={accent}>
        <CodeBlock lang="bash">{`# inicializar DVC dentro do repo Git
dvc init
git commit -m "chore: init dvc"

# configurar remote de storage
dvc remote add -d s3remote s3://ffv-ml-dvc
dvc remote modify s3remote region us-east-1

# versionar dataset
dvc add data/churn_2026_01.parquet
git add data/churn_2026_01.parquet.dvc .gitignore
git commit -m "data: churn snapshot 2026-01"

# publicar blob no S3
dvc push`}</CodeBlock>
        <p>
          O arquivo <code>.dvc</code> fica no Git com hash do blob. O blob fica no S3. Clonar o repo traz só pointers; <code>dvc pull</code> baixa os blobs sob demanda.
        </p>
      </Section>

      <Section title="Pipeline declarativo com dvc.yaml" accent={accent}>
        <CodeBlock lang="yaml">{`# dvc.yaml — pipeline reproduzivel fim a fim
stages:
  features:
    cmd: python src/features.py
    deps:
      - src/features.py
      - data/churn_2026_01.parquet
    outs:
      - data/features.parquet

  train:
    cmd: python src/train.py
    deps:
      - src/train.py
      - data/features.parquet
    params:
      - train.n_estimators
      - train.max_depth
    outs:
      - models/churn.joblib
    metrics:
      - metrics/train.json:
          cache: false`}</CodeBlock>
        <Callout tone="warn">
          <code>dvc repro</code> só reexecuta stages cujas dependências mudaram. Sem declarar deps/outs corretamente, o caching fica errado e você retreina à toa — ou pior, pula retreino necessário.
        </Callout>
      </Section>

      <Section title="Integração com Git branch" accent={accent}>
        <CodeBlock lang="bash">{`# reproduzir estado exato do commit antigo
git checkout v2025-q4
dvc checkout          # recupera dataset e modelo daquele commit

# comparar metrica entre branches
dvc metrics diff main feature/reranker
# Path               Metric     main    feature   Change
# metrics/train.json f1_golden  0.772   0.791     +0.019`}</CodeBlock>
      </Section>

      <Section title="lakeFS — branch sobre lake inteiro" accent={accent}>
        <CodeBlock lang="bash">{`# criar branch experimental sobre o lake
lakectl branch create lakefs://ffv-lake/exp-reranker \\
  --source lakefs://ffv-lake/main

# pipeline escreve em exp-reranker; main intocado
export AWS_S3_BUCKET=ffv-lake/exp-reranker
python pipelines/retrain.py

# se metrica subir, merge atomico
lakectl merge lakefs://ffv-lake/exp-reranker lakefs://ffv-lake/main

# se nao, descartar inteiro
lakectl branch delete lakefs://ffv-lake/exp-reranker`}</CodeBlock>
        <Callout tone="success" icon="✅">
          DVC + lakeFS não competem: DVC versiona artefatos dentro do projeto, lakeFS dá isolamento transacional sobre o lake. Times maduros usam os dois.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
