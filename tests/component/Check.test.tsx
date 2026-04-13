import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Check } from '@/mdx/Check';
import { DocContext } from '@/mdx/provider';
import { useOnboardingStore } from '@/store/onboarding-store';

function renderInDoc(ui: React.ReactNode, docId = 'doc1') {
  return render(<DocContext.Provider value={docId}>{ui}</DocContext.Provider>);
}

beforeEach(() => {
  localStorage.clear();
  useOnboardingStore.getState().reset();
});

describe('<Check>', () => {
  it('renders label text', () => {
    renderInDoc(<Check id="a">초대 수락</Check>);
    expect(screen.getByText('초대 수락')).toBeInTheDocument();
  });

  it('is unchecked initially', () => {
    renderInDoc(<Check id="a">초대 수락</Check>);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('reflects store state when already toggled', () => {
    useOnboardingStore.getState().toggleCheck('doc1', 'a');
    renderInDoc(<Check id="a">초대 수락</Check>);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('toggles store state on click', async () => {
    const user = userEvent.setup();
    renderInDoc(<Check id="a">초대 수락</Check>);
    await user.click(screen.getByRole('checkbox'));
    expect(useOnboardingStore.getState().checks['doc1:a']).toBe(true);
    await user.click(screen.getByRole('checkbox'));
    expect(useOnboardingStore.getState().checks['doc1:a']).toBe(false);
  });

  it('renders hint text when provided', () => {
    renderInDoc(<Check id="a" hint="CSV 다운로드">초대 수락</Check>);
    expect(screen.getByText('CSV 다운로드')).toBeInTheDocument();
  });
});
