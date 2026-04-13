import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompleteButton } from '@/ui/CompleteButton';
import { useOnboardingStore } from '@/store/onboarding-store';
import type { Doc } from '@/content/types';

const Dummy = () => null;
const make = (over: Partial<Doc> = {}): Doc => ({
  id: 'd1', partId: 'p', title: 't', description: '',
  type: 'checklist', enforce: false, Component: Dummy, ...over,
});

beforeEach(() => {
  localStorage.clear();
  useOnboardingStore.getState().reset();
});

describe('<CompleteButton>', () => {
  it('is enabled when enforce is false', () => {
    render(<CompleteButton doc={make()} />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('marks complete on press', async () => {
    const user = userEvent.setup();
    render(<CompleteButton doc={make()} />);
    await user.click(screen.getByRole('button'));
    expect(useOnboardingStore.getState().completions['d1']).toBe(true);
  });

  it('shows completed label and unmarks on second press', async () => {
    const user = userEvent.setup();
    useOnboardingStore.getState().markComplete('d1');
    render(<CompleteButton doc={make()} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent(/완료됨/);
    await user.click(btn);
    expect(useOnboardingStore.getState().completions['d1']).toBe(false);
  });

  it('is disabled when enforce=true + checklist empty', () => {
    render(<CompleteButton doc={make({ enforce: true, type: 'checklist' })} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('enables when enforce=true + all checks true', () => {
    useOnboardingStore.getState().toggleCheck('d1', 'a');  // true
    render(<CompleteButton doc={make({ enforce: true, type: 'checklist' })} />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('disables when enforce=true + mission note empty', () => {
    render(<CompleteButton doc={make({ enforce: true, type: 'mission' })} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('enables when enforce=true + mission note has content', () => {
    useOnboardingStore.getState().setMissionNote('d1', 'hello');
    render(<CompleteButton doc={make({ enforce: true, type: 'mission' })} />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('already completed button is not disabled (to allow unmark)', () => {
    useOnboardingStore.getState().markComplete('d1');
    render(<CompleteButton doc={make({ enforce: true, type: 'checklist' })} />);
    // even if enforce condition fails, the button stays enabled to allow unmark
    expect(screen.getByRole('button')).not.toBeDisabled();
  });
});
