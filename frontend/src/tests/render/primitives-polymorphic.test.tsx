/**
 * Locks o contrato polimórfico dos primitives — aceitar strings, aliases de chaves
 * e ReactNodes. Esses testes evitam regressão se alguém "endurecer" os tipos de novo.
 */
import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  FlowDiagram, ArchFlow, StackFlow, NodeGraph, Timeline,
  AnnotatedFormula, ComparisonFlow, KeyValue, Callout, DecisionBox, Kbd,
} from '@/components/article/primitives';

describe('Primitives — shapes polimórficos', () => {
  it('FlowDiagram aceita steps como strings OU objetos', () => {
    const { container } = render(
      <FlowDiagram title="Mix" steps={['Step A', { label: 'Step B', desc: 'with desc' }, 'Step C']} />
    );
    expect(container.textContent).toContain('Step A');
    expect(container.textContent).toContain('Step B');
    expect(container.textContent).toContain('with desc');
    expect(container.textContent).toContain('Step C');
  });

  it('ArchFlow aceita columns com header OU title como alias', () => {
    const { container } = render(
      <ArchFlow title="Stack" columns={[
        { header: 'Header form', items: ['a', 'b'] },
        { title: 'Title form', items: ['c', 'd'] },
      ]} />
    );
    expect(container.textContent).toContain('Header form');
    expect(container.textContent).toContain('Title form');
    expect(container.textContent).toContain('a');
    expect(container.textContent).toContain('c');
  });

  it('StackFlow aceita items como string OU objeto com aliases label/text/layer', () => {
    const { container } = render(
      <StackFlow items={[
        'string puro',
        { label: 'label form' },
        { text: 'text form' },
        { layer: 'layer form' },
        { label: 'with tone', tone: 'normal' },
      ]} />
    );
    expect(container.textContent).toContain('string puro');
    expect(container.textContent).toContain('label form');
    expect(container.textContent).toContain('text form');
    expect(container.textContent).toContain('layer form');
    expect(container.textContent).toContain('with tone');
  });

  it('NodeGraph aceita label OU title em column, e string OU objeto em nodes', () => {
    const { container } = render(
      <NodeGraph columns={[
        { label: 'Col Label', nodes: ['plain string', { label: 'object node', tone: 'emphasis' }] },
        { title: 'Col Title', nodes: [{ label: 'normal-tone', tone: 'normal' }] },
      ]} />
    );
    expect(container.textContent).toContain('Col Label');
    expect(container.textContent).toContain('Col Title');
    expect(container.textContent).toContain('plain string');
    expect(container.textContent).toContain('object node');
    expect(container.textContent).toContain('normal-tone');
  });

  it('Timeline aceita when OU t como alias', () => {
    const { container } = render(
      <Timeline events={[
        { when: '2026', label: 'with when' },
        { t: '2027', label: 'with t alias' },
      ]} />
    );
    expect(container.textContent).toContain('2026');
    expect(container.textContent).toContain('2027');
    expect(container.textContent).toContain('with when');
    expect(container.textContent).toContain('with t alias');
  });

  it('AnnotatedFormula aceita text/label/name e annotation/note como aliases', () => {
    const { container } = render(
      <AnnotatedFormula formula="x = y + z" parts={[
        { text: 'X', annotation: 'with text+annotation' },
        { label: 'Y', note: 'with label+note' },
        { name: 'Z', note: 'with name+note' },
      ]} />
    );
    expect(container.textContent).toContain('X');
    expect(container.textContent).toContain('Y');
    expect(container.textContent).toContain('Z');
    expect(container.textContent).toContain('with text+annotation');
    expect(container.textContent).toContain('with label+note');
    expect(container.textContent).toContain('with name+note');
  });

  it('ComparisonFlow aceita steps como string, ReactNode ou objeto', () => {
    const { container } = render(
      <ComparisonFlow
        left={{ label: 'Left', steps: ['plain', <span key="r">react node</span>, { label: 'object' }] }}
        right={{ label: 'Right', steps: ['a', 'b'] }}
      />
    );
    expect(container.textContent).toContain('plain');
    expect(container.textContent).toContain('react node');
    expect(container.textContent).toContain('object');
  });

  it('KeyValue.k aceita ReactNode (não só string)', () => {
    const { container } = render(
      <KeyValue items={[
        { k: 'string key', v: 'value' },
        { k: <Kbd>Ctrl</Kbd>, v: 'with JSX key' },
      ]} />
    );
    expect(container.textContent).toContain('string key');
    expect(container.textContent).toContain('Ctrl');
    expect(container.textContent).toContain('with JSX key');
  });

  it('Callout aceita tone="tip" como alias de success', () => {
    const { container } = render(<Callout tone="tip">conteúdo</Callout>);
    expect(container.textContent).toContain('conteúdo');
  });

  it('DecisionBox.alternatives aceita text/name/label como alias', () => {
    const { container } = render(
      <DecisionBox scenario="s" winner="w" why="w" alternatives={[
        { name: 'Alt by name', note: 'n1' },
        { label: 'Alt by label', note: 'n2' },
        { text: 'Alt by text', note: 'n3' },
      ]} />
    );
    expect(container.textContent).toContain('Alt by name');
    expect(container.textContent).toContain('Alt by label');
    expect(container.textContent).toContain('Alt by text');
  });
});
