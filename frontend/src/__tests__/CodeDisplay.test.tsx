import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CodeDisplay } from '../components/common/CodeDisplay';

describe('CodeDisplay Component', () => {
  const samplePythonCode = `def knapsack(weights, values, W):
    n = len(weights)
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    return dp[n][W]`;

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders code snippet with title and line numbers', () => {
    render(
      <CodeDisplay
        code={samplePythonCode}
        language="python"
        title="0/1 Knapsack Implementation"
        showLineNumbers={true}
      />
    );

    expect(screen.getByText('0/1 Knapsack Implementation')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('copies code to clipboard when Copy is clicked', async () => {
    render(
      <CodeDisplay
        code={samplePythonCode}
        language="python"
      />
    );

    const copyBtn = screen.getByTitle('Copy code to clipboard');
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(samplePythonCode.trim());
  });

  it('handles Export download click', () => {
    // Mock URL.createObjectURL and document.body.appendChild
    const createObjectURLMock = vi.fn().mockReturnValue('blob:http://localhost/mock-blob');
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    render(
      <CodeDisplay
        code={samplePythonCode}
        language="python"
        title="Knapsack"
      />
    );

    const exportBtn = screen.getByTitle('Download algorithm script');
    fireEvent.click(exportBtn);

    expect(createObjectURLMock).toHaveBeenCalled();
  });
});
