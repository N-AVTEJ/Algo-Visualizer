import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricsPanel } from '../components/common/MetricsPanel';

describe('MetricsPanel Component', () => {
  it('renders metrics and Big-O complexity badge', () => {
    render(
      <MetricsPanel
        title="Knapsack DP"
        complexity="O(N * W)"
        metrics={{
          comparisons: 42,
          table_lookups: 100,
          is_optimal: true,
        }}
        status="completed"
        statusMessage="Optimal Solution Backtracked"
        accentColor="violet"
      />
    );

    expect(screen.getByText('Knapsack DP Metrics')).toBeInTheDocument();
    expect(screen.getByText('O(N * W)')).toBeInTheDocument();
    expect(screen.getByText('Comparisons')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Table Lookups')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('Optimal Solution Backtracked')).toBeInTheDocument();
  });

  it('renders running status correctly', () => {
    render(
      <MetricsPanel
        title="Merge Sort"
        metrics={{ operations: 15 }}
        status="running"
        statusMessage="Merging Sub-arrays..."
        accentColor="sky"
      />
    );

    expect(screen.getByText('Merge Sort Metrics')).toBeInTheDocument();
    expect(screen.getByText('Merging Sub-arrays...')).toBeInTheDocument();
  });
});
