import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Quiz } from '@/mdx/Quiz';
import { DocContext } from '@/mdx/provider';
import { useOnboardingStore } from '@/store/onboarding-store';

const wrap = (ui: React.ReactNode, docId = 'doc1') =>
  <DocContext.Provider value={docId}>{ui}</DocContext.Provider>;

beforeEach(() => {
  localStorage.clear();
  useOnboardingStore.getState().reset();
});

describe('<Quiz>', () => {
  it('renders question and options', () => {
    render(wrap(<Quiz question="Q?" options={['A', 'B', 'C']} answer={1} />));
    expect(screen.getByText(/Q\?/)).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('records answer in store when selected', async () => {
    const user = userEvent.setup();
    render(wrap(<Quiz question="Q" options={['A', 'B', 'C']} answer={1} />));
    await user.click(screen.getByRole('radio', { name: 'B' }));
    expect(useOnboardingStore.getState().quizzes['doc1']).toBe(1);
  });

  it('shows correct feedback when answer matches', async () => {
    const user = userEvent.setup();
    render(wrap(<Quiz question="Q" options={['A', 'B', 'C']} answer={1} />));
    await user.click(screen.getByRole('radio', { name: 'B' }));
    expect(screen.getByText(/정답/)).toBeInTheDocument();
  });

  it('shows wrong feedback when answer differs', async () => {
    const user = userEvent.setup();
    render(wrap(<Quiz question="Q" options={['A', 'B', 'C']} answer={1} />));
    await user.click(screen.getByRole('radio', { name: 'A' }));
    expect(screen.getByText(/다시/)).toBeInTheDocument();
  });

  it('reflects prior answer from store', () => {
    useOnboardingStore.getState().setQuizAnswer('doc1', 2);
    render(wrap(<Quiz question="Q" options={['A', 'B', 'C']} answer={2} />));
    const radio = screen.getByRole('radio', { name: 'C' }) as HTMLInputElement;
    expect(radio).toBeChecked();
  });
});
