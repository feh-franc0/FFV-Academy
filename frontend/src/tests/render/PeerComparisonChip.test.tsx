import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PeerComparisonChip } from '@/components/peer/PeerComparisonChip';

describe('<PeerComparisonChip>', () => {
  it('renderiza score arredondado e percentil', () => {
    render(<PeerComparisonChip score={87.6} percentile={73} />);
    expect(screen.getByTestId('peer-comparison-chip')).toBeInTheDocument();
    expect(screen.getByText(/88%/)).toBeInTheDocument();
    expect(screen.getByText(/73%/)).toBeInTheDocument();
  });

  it('aria-label contém score e percentil', () => {
    render(<PeerComparisonChip score={50} percentile={42} />);
    const chip = screen.getByTestId('peer-comparison-chip');
    expect(chip.getAttribute('aria-label')).toContain('50');
    expect(chip.getAttribute('aria-label')).toContain('42');
  });

  it('estiliza diferente para percentil >=50 vs <50', () => {
    const { rerender } = render(<PeerComparisonChip score={60} percentile={60} />);
    const greenChip = screen.getByTestId('peer-comparison-chip');
    const greenBorder = greenChip.getAttribute('style') ?? '';
    rerender(<PeerComparisonChip score={20} percentile={20} />);
    const amberChip = screen.getByTestId('peer-comparison-chip');
    const amberBorder = amberChip.getAttribute('style') ?? '';
    expect(greenBorder).not.toBe(amberBorder);
  });
});
