import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KnapsackStage } from '../components/visualizations/Module5/KnapsackStage';
import { algorithmsApi } from '../api/client';

vi.mock('../api/client', () => ({
  algorithmsApi: {
    runModule5: vi.fn(),
  },
  ApiError: class extends Error {},
}));

describe('KnapsackStage Component', () => {
  const mockRunResponse = {
    steps: [
      {
        step_index: 0,
        type: 'INITIALIZE',
        current_i: 0,
        current_w: 0,
        table: [
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        selected_items: [],
        decision: 'INITIALIZE',
        description: 'Initialize DP table with base cases (zeros).',
      },
      {
        step_index: 1,
        type: 'FILL_CELL',
        current_i: 1,
        current_w: 2,
        table: [
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 3, 0, 0, 0, 0, 0, 0],
        ],
        selected_items: [0],
        decision: 'INCLUDE',
        description: 'Include Item 1 with weight 2 and value 3.',
      },
    ],
    max_value: 3,
    selected_items: [0],
    total_weight: 2,
    metrics: {
      comparisons: 16,
      table_lookups: 32,
      execution_time_ms: 0.12,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial controls, items configuration, and code preview', () => {
    render(<KnapsackStage />);

    expect(screen.getByText('Dynamic Programming II: 0/1 Knapsack')).toBeInTheDocument();
    expect(screen.getByText('Execute 0/1 Knapsack')).toBeInTheDocument();
    expect(screen.getByText('0/1 Knapsack DP Implementation')).toBeInTheDocument();
    expect(screen.getByText('2D DP Table dp[i][w]')).toBeInTheDocument();
  });

  it('runs algorithm and triggers runModule5 API call', async () => {
    (algorithmsApi.runModule5 as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockRunResponse);

    render(<KnapsackStage />);

    const runBtn = screen.getByText('Execute 0/1 Knapsack');
    fireEvent.click(runBtn);

    expect(algorithmsApi.runModule5).toHaveBeenCalled();
  });
});
