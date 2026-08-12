import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AwsDiagram } from '@/components/article/AwsDiagram';
import { AwsIcon, AWS_SERVICES, serviceDef } from '@/components/article/AwsIcon';
import { BlockRenderer } from '@/components/article/BlockRenderer';
import { AwsDiagramSchema, BLOCK_DATA_SCHEMAS, BlockTypeSchema } from '@/components/article/blocks/schemas';

// jsdom não implementa ResizeObserver — o componente o usa para medir arestas.
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

const GROUPS = [
  { label: 'Cliente', kind: 'plain' as const, nodes: [{ id: 'u', service: 'browser', label: 'Navegador' }] },
  {
    label: 'Conta AWS',
    kind: 'account' as const,
    nodes: [
      { id: 'gw', service: 'apigateway', note: 'WebSocket' },
      { id: 'fn', service: 'lambda' },
      { id: 'br', service: 'bedrock', label: 'Bedrock', note: 'ConverseStream' },
    ],
  },
];

const EDGES = [
  { from: 'u', to: 'gw', label: 'abre conexão' },
  { from: 'gw', to: 'fn' },
  { from: 'fn', to: 'br', label: 'invoca modelo' },
];

const STEPS = [
  { label: 'Conectar', detail: 'O navegador abre a conexão.', nodes: ['u', 'gw'], edges: ['u>gw'] },
  { label: 'Inferir', detail: 'A função chama o modelo.', nodes: ['fn', 'br'], edges: ['fn>br'] },
];

describe('<AwsDiagram>', () => {
  it('renderiza título, grupos e todos os nós com rótulo', () => {
    render(<AwsDiagram title="Chat com streaming" groups={GROUPS} edges={EDGES} />);
    expect(screen.getByText('Chat com streaming')).toBeInTheDocument();
    expect(screen.getByText('Cliente')).toBeInTheDocument();
    expect(screen.getByText('Navegador')).toBeInTheDocument();
    // Sem label explícito, cai no nome canônico do catálogo
    expect(screen.getByText('API Gateway')).toBeInTheDocument();
    expect(screen.getByText('Lambda')).toBeInTheDocument();
    expect(screen.getByText('WebSocket')).toBeInTheDocument();
  });

  it('mostra a legenda apenas das categorias efetivamente usadas', () => {
    render(<AwsDiagram groups={GROUPS} edges={EDGES} />);
    expect(screen.getByText('Compute')).toBeInTheDocument();
    expect(screen.getByText('IA e machine learning')).toBeInTheDocument();
    // Nenhum nó de banco de dados no diagrama
    expect(screen.queryByText('Banco de dados')).not.toBeInTheDocument();
  });

  it('sem passos, não renderiza o controle de passo a passo', () => {
    render(<AwsDiagram groups={GROUPS} edges={EDGES} />);
    expect(screen.queryByRole('group', { name: /passos do fluxo/i })).not.toBeInTheDocument();
  });

  it('com passos, navega e destaca o passo selecionado', async () => {
    const user = userEvent.setup();
    render(<AwsDiagram groups={GROUPS} edges={EDGES} steps={STEPS} />);

    const controle = screen.getByRole('group', { name: /passos do fluxo/i });
    expect(within(controle).getByRole('button', { name: 'Ver tudo' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(within(controle).getByRole('button', { name: '1' }));
    // O detalhe aparece no painel visível E na lista sr-only (intencional):
    // valide no painel, que é o elemento que carrega o número do passo.
    const painel = screen.getByText(/Passo 1\. Conectar/).closest('p');
    expect(painel).not.toBeNull();
    expect(painel!.textContent).toContain('O navegador abre a conexão.');
    expect(within(controle).getByRole('button', { name: '1' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(within(controle).getByRole('button', { name: '2' }));
    expect(screen.getByText(/Passo 2\. Inferir/)).toBeInTheDocument();
    expect(screen.queryByText(/Passo 1\. Conectar/)).not.toBeInTheDocument();

    await user.click(within(controle).getByRole('button', { name: 'Ver tudo' }));
    expect(screen.queryByText(/Passo 2\. Inferir/)).not.toBeInTheDocument();
  });

  it('descreve o fluxo em texto para leitor de tela', () => {
    const { container } = render(<AwsDiagram groups={GROUPS} edges={EDGES} steps={STEPS} />);
    const lista = container.querySelector('ol.sr-only');
    expect(lista).not.toBeNull();
    expect(lista!.textContent).toContain('Conectar');
    expect(lista!.textContent).toContain('A função chama o modelo.');
  });

  it('não faz nenhuma requisição externa: os ícones são SVG inline', () => {
    const { container } = render(<AwsDiagram groups={GROUPS} edges={EDGES} />);
    expect(container.querySelectorAll('img')).toHaveLength(0);
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0);
  });
});

describe('AwsIcon — catálogo', () => {
  it('serviço desconhecido cai no fallback em vez de quebrar', () => {
    const def = serviceDef('serviço-que-nao-existe');
    expect(def.label).toBe('Serviço');
    const { container } = render(<AwsIcon service="serviço-que-nao-existe" />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('todo serviço do catálogo tem rótulo e categoria', () => {
    for (const [key, def] of Object.entries(AWS_SERVICES)) {
      expect(def.label, `${key} sem label`).toBeTruthy();
      expect(def.cat, `${key} sem categoria`).toBeTruthy();
    }
  });
});

describe('aws_diagram — schema e adapter', () => {
  it('o tipo está registrado no enum e no mapa de schemas', () => {
    expect(BlockTypeSchema.safeParse('aws_diagram').success).toBe(true);
    expect(BLOCK_DATA_SCHEMAS.aws_diagram).toBeDefined();
  });

  it('aceita um diagrama válido e rejeita grupo sem nós', () => {
    expect(AwsDiagramSchema.safeParse({ groups: GROUPS, edges: EDGES }).success).toBe(true);
    expect(AwsDiagramSchema.safeParse({ groups: [{ label: 'vazio', nodes: [] }] }).success).toBe(false);
    expect(AwsDiagramSchema.safeParse({ groups: [] }).success).toBe(false);
  });

  it('o adapter descarta aresta que aponta para nó inexistente', () => {
    const bloco = {
      id: 'd1',
      type: 'aws_diagram' as const,
      position: 0,
      data: {
        title: 'Teste',
        groups: GROUPS,
        edges: [
          { from: 'u', to: 'gw', label: 'aresta válida' },
          { from: 'u', to: 'fantasma', label: 'aresta órfã' },
        ],
      },
    };
    render(<BlockRenderer block={bloco} />);
    expect(screen.getByText(/aresta válida/)).toBeInTheDocument();
    expect(screen.queryByText(/aresta órfã/)).not.toBeInTheDocument();
  });

  it('o adapter não renderiza nada quando não há grupos', () => {
    const bloco = { id: 'd2', type: 'aws_diagram' as const, position: 0, data: { groups: [] } };
    const { container } = render(<BlockRenderer block={bloco} />);
    expect(container.textContent).toBe('');
  });
});
