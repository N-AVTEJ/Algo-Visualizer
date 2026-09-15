import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnimationPlayer } from '../components/common/AnimationPlayer';

describe('AnimationPlayer Component', () => {
  const sampleSteps = [
    { name: 'Step 0 - Init', value: 0 },
    { name: 'Step 1 - Compare', value: 1 },
    { name: 'Step 2 - Swap', value: 2 },
    { name: 'Step 3 - Final', value: 3 },
  ];

  it('renders playback controls correctly', () => {
    render(
      <AnimationPlayer
        steps={sampleSteps}
        renderStep={(step) => <div>{step?.name}</div>}
      />
    );

    expect(screen.getByText('Step 0 - Init')).toBeInTheDocument();
    expect(screen.getByText('Play')).toBeInTheDocument();
    expect(screen.getByTitle('Reset to initial frame')).toBeInTheDocument();
    expect(screen.getByTitle('Step Forward')).toBeInTheDocument();
    expect(screen.getByTitle('Step Backward')).toBeInTheDocument();
  });

  it('steps forward and backward upon clicking buttons', () => {
    const onStepChange = vi.fn();
    render(
      <AnimationPlayer
        steps={sampleSteps}
        onStepChange={onStepChange}
        renderStep={(step) => <div>{step?.name}</div>}
      />
    );

    const stepForwardBtn = screen.getByTitle('Step Forward');
    fireEvent.click(stepForwardBtn);

    expect(screen.getByText('Step 1 - Compare')).toBeInTheDocument();
    expect(onStepChange).toHaveBeenCalledWith(1, sampleSteps[1]);

    const stepBackBtn = screen.getByTitle('Step Backward');
    fireEvent.click(stepBackBtn);

    expect(screen.getByText('Step 0 - Init')).toBeInTheDocument();
    expect(onStepChange).toHaveBeenCalledWith(0, sampleSteps[0]);
  });

  it('resets to frame 0 upon clicking reset button', () => {
    const onReset = vi.fn();
    render(
      <AnimationPlayer
        steps={sampleSteps}
        onReset={onReset}
        renderStep={(step) => <div>{step?.name}</div>}
      />
    );

    // Step forward twice
    fireEvent.click(screen.getByTitle('Step Forward'));
    fireEvent.click(screen.getByTitle('Step Forward'));
    expect(screen.getByText('Step 2 - Swap')).toBeInTheDocument();

    // Click reset
    fireEvent.click(screen.getByTitle('Reset to initial frame'));
    expect(screen.getByText('Step 0 - Init')).toBeInTheDocument();
    expect(onReset).toHaveBeenCalled();
  });

  it('handles speed slider adjustment', () => {
    const onSpeedChange = vi.fn();
    render(
      <AnimationPlayer
        steps={sampleSteps}
        onSpeedChange={onSpeedChange}
      />
    );

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '1000' } });
    expect(onSpeedChange).toHaveBeenCalledWith(350);
  });
});
