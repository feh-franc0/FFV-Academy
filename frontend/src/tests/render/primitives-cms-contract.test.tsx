import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { BlockRenderer } from '@/components/article/BlockRenderer';
import { MatrixDiagram, NodeGraph } from '@/components/article/primitives';

/**
 * Regressão de contrato entre o JSON do CMS e os primitives.
 *
 * Os dois casos abaixo derrubavam a PÁGINA INTEIRA em runtime (não só o bloco):
 * MatrixDiagram chamava val.toFixed() em célula de texto, e NodeGraph renderizava
 * a legenda [{label,color}] como filho React. Nenhum teste cobria o formato que
 * o CMS realmente envia — só o formato que os primitives declaravam.
 */

describe('MatrixDiagram — célula de texto (formato do CMS)', () => {
  it('renderiza matriz de texto sem quebrar', () => {
    render(
      <MatrixDiagram
        title="Tiers de modelo"
        rowLabels={['Tier volume', 'Tier raciocínio']}
        colLabels={['Tarefa típica', 'Latência alvo']}
        data={[
          ['Classificar e rotear', 'Sub-segundo'],
          ['Análise longa', '5–30 s'],
        ]}
      />,
    );
    expect(screen.getByText('Classificar e rotear')).toBeInTheDocument();
    expect(screen.getByText('5–30 s')).toBeInTheDocument();
  });

  it('mantém o heatmap numérico funcionando', () => {
    render(
      <MatrixDiagram
        rowLabels={['a']}
        colLabels={['x', 'y']}
        data={[[0.9, 0.1]]}
      />,
    );
    expect(screen.getByText('0.90')).toBeInTheDocument();
    expect(screen.getByText('0.10')).toBeInTheDocument();
  });

  it('aceita matriz mista sem quebrar', () => {
    render(<MatrixDiagram rowLabels={['a']} colLabels={['x', 'y']} data={[[0.5, 'texto']]} />);
    expect(screen.getByText('0.50')).toBeInTheDocument();
    expect(screen.getByText('texto')).toBeInTheDocument();
  });

  it('via BlockRenderer, com o shape exato dos seeds', () => {
    render(
      <BlockRenderer
        block={{
          id: 'm1',
          type: 'matrix_diagram',
          position: 0,
          data: {
            title: 'As três faixas',
            rowLabels: ['Faixa alta'],
            colLabels: ['Sinal', 'Ação'],
            matrix: [['Validação passou', 'Segue direto']],
          },
        }}
      />,
    );
    expect(screen.getByText('Segue direto')).toBeInTheDocument();
  });
});

describe('NodeGraph — legenda em lista (formato do CMS)', () => {
  it('renderiza chips de legenda a partir de [{label,color}]', () => {
    render(
      <NodeGraph
        title="Constelação"
        columns={[{ title: 'Núcleo', nodes: [{ label: 'Bedrock', sub: 'inferência' }] }]}
        legend={[
          { label: 'Guardar', color: '#3b82f6' },
          { label: 'Modelar', color: '#f59e0b' },
        ]}
      />,
    );
    expect(screen.getByText('Guardar')).toBeInTheDocument();
    expect(screen.getByText('Modelar')).toBeInTheDocument();
  });

  it('mantém a legenda em texto livre funcionando', () => {
    render(
      <NodeGraph
        columns={[{ title: 'c', nodes: ['n'] }]}
        legend="linha tracejada = assíncrono"
      />,
    );
    expect(screen.getByText(/linha tracejada/)).toBeInTheDocument();
  });

  it('via BlockRenderer, com o shape exato dos seeds', () => {
    render(
      <BlockRenderer
        block={{
          id: 'n1',
          type: 'node_graph',
          position: 0,
          data: {
            title: 'Camada de dados',
            columns: [{ title: 'Guardar', nodes: [{ label: 'S3', note: 'fonte da verdade' }] }],
            legend: [{ label: 'Guardar', color: '#3b82f6' }],
          },
        }}
      />,
    );
    expect(screen.getByText('S3')).toBeInTheDocument();
    expect(screen.getAllByText('Guardar').length).toBeGreaterThan(0);
  });
});

describe('DecisionBox — a desvantagem tem de chegar à tela', () => {
  /**
   * O defeito, achado em 07/ago/2026 lendo o HTML servido (não em teste):
   *
   *   <span class="font-semibold">EC2 com Auto Scaling</span> — </p>
   *
   * O travessão pendurado, sem nada depois. A caixa de decisão existe para
   * mostrar o que se PERDE em cada alternativa, e era exatamente essa parte que
   * não aparecia.
   *
   * A causa foi um conserto feito só metade do caminho: o adapter em
   * `BlockRenderer.tsx` normaliza a desvantagem para a prop `downside`, e o
   * primitive nunca declarou `downside` — lia `note ?? when`. **82 de 391
   * alternativas, em 120 módulos**, renderizavam vazio.
   *
   * Por que nenhum gate pegou: `validate_primitives_render.py` compara seed
   * contra ADAPTER, e este salto é adapter → PRIMITIVE. Estes testes cobriam
   * `MatrixDiagram` e `NodeGraph`, os dois casos que derrubavam a página; este
   * não derrubava nada, só emudecia o conteúdo.
   */
  const bloco = (alternatives: unknown[]) => ({
    id: 'd1',
    type: 'decision_box' as const,
    position: 0,
    data: {
      scenario: 'Aplicação com estado relacional e equipe pequena.',
      winner: 'ECS Fargate com RDS',
      why: 'Menos operação por unidade de capacidade.',
      alternatives,
    },
  });

  it('lê `downside`, que é a chave que o adapter entrega', () => {
    render(<BlockRenderer block={bloco([
      { name: 'EC2 com Auto Scaling', downside: 'AMI, patch e drenagem passam a ser problema seu.' },
    ])} />);
    expect(screen.getByText(/AMI, patch e drenagem/)).toBeInTheDocument();
  });

  it('continua lendo `note` e `when`, usadas por 237 alternativas existentes', () => {
    render(<BlockRenderer block={bloco([
      { name: 'Lambda', note: 'Cada execução concorrente quer sua conexão.' },
      { label: 'DynamoDB', when: 'Perde consulta relacional ad hoc.' },
    ])} />);
    expect(screen.getByText(/execução concorrente quer sua conexão/)).toBeInTheDocument();
    expect(screen.getByText(/consulta relacional ad hoc/)).toBeInTheDocument();
  });

  it('sem desvantagem escrita, não pendura travessão', () => {
    // 72 das 391 alternativas só têm `name`. Pontuação que promete texto ausente
    // é o mesmo sinal que `validate_texto_sem_lacuna.py` procura na prosa.
    const { container } = render(<BlockRenderer block={bloco([{ name: 'App Runner' }])} />);
    // `p:last-of-type` pegava o parágrafo do `why` — as alternativas ficam num
    // div aninhado, e `last-of-type` é por pai, não por escopo.
    const linhas = [...container.querySelectorAll('[data-ffv-visual="DecisionBox"] p')]
      .map(e => e.textContent ?? '')
      .filter(t => t.startsWith('Alt: '));
    expect(linhas).toEqual(['Alt: App Runner']);
    expect(linhas[0]).not.toContain('—');
  });
});
