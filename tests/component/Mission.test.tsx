import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mission, MissionNote } from '@/mdx/Mission';
import { DocContext } from '@/mdx/provider';
import { useOnboardingStore } from '@/store/onboarding-store';

const wrap = (ui: React.ReactNode, docId = 'doc1') =>
  <DocContext.Provider value={docId}>{ui}</DocContext.Provider>;

beforeEach(() => {
  localStorage.clear();
  useOnboardingStore.getState().reset();
});

describe('<Mission>', () => {
  it('renders title and description', () => {
    render(<Mission title="미션 1" description="Docker 설치" />);
    expect(screen.getByText('미션 1')).toBeInTheDocument();
    expect(screen.getByText('Docker 설치')).toBeInTheDocument();
  });
});

describe('<MissionNote>', () => {
  it('renders empty by default', () => {
    render(wrap(<MissionNote />));
    const ta = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(ta.value).toBe('');
  });

  it('saves typed text to store', async () => {
    const user = userEvent.setup();
    render(wrap(<MissionNote />));
    await user.type(screen.getByRole('textbox'), 'hello');
    expect(useOnboardingStore.getState().missions['doc1']).toBe('hello');
  });

  it('reflects prior note from store', () => {
    useOnboardingStore.getState().setMissionNote('doc1', 'saved');
    render(wrap(<MissionNote />));
    const ta = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(ta.value).toBe('saved');
  });
});
