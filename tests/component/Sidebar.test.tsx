import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '@/ui/Sidebar';
import { useOnboardingStore } from '@/store/onboarding-store';
import type { ContentTree } from '@/content/types';

// Mock @/content so import.meta.glob MDX parsing doesn't run in tests
vi.mock('@/content', () => ({
  contentTree: [],
  allDocs: [],
  findDoc: () => undefined,
}));

const Dummy = () => null;
const tree: ContentTree = [{
  id: 'p1', order: 1, title: '파트 1', description: 'd',
  docs: [
    { id: 'p1/01', partId: 'p1', title: '문서 A', description: '', type: 'checklist', enforce: false, Component: Dummy },
    { id: 'p1/02', partId: 'p1', title: '문서 B', description: '', type: 'mission', enforce: false, Component: Dummy },
  ],
}, {
  id: 'p2', order: 2, title: '파트 2', description: 'd',
  docs: [
    { id: 'p2/01', partId: 'p2', title: '문서 C', description: '', type: 'learn', enforce: false, Component: Dummy },
  ],
}];

beforeEach(() => {
  localStorage.clear();
  useOnboardingStore.getState().reset();
});

describe('<Sidebar>', () => {
  it('renders all part titles and doc titles', () => {
    render(<Sidebar tree={tree} />);
    expect(screen.getByText('파트 1')).toBeInTheDocument();
    expect(screen.getByText('파트 2')).toBeInTheDocument();
    expect(screen.getByText('문서 A')).toBeInTheDocument();
    expect(screen.getByText('문서 B')).toBeInTheDocument();
    expect(screen.getByText('문서 C')).toBeInTheDocument();
  });

  it('marks completed docs with data-completed="true"', () => {
    useOnboardingStore.getState().markComplete('p1/01');
    render(<Sidebar tree={tree} />);
    const btn = screen.getByText('문서 A').closest('[data-doc-id]');
    expect(btn).toHaveAttribute('data-completed', 'true');
    const other = screen.getByText('문서 B').closest('[data-doc-id]');
    expect(other).toHaveAttribute('data-completed', 'false');
  });

  it('marks active doc with data-active="true"', () => {
    useOnboardingStore.getState().setCurrentDoc('p1/02');
    render(<Sidebar tree={tree} />);
    const btn = screen.getByText('문서 B').closest('[data-doc-id]');
    expect(btn).toHaveAttribute('data-active', 'true');
  });

  it('sets current doc on click', async () => {
    const user = userEvent.setup();
    render(<Sidebar tree={tree} />);
    await user.click(screen.getByText('문서 C'));
    expect(useOnboardingStore.getState().currentDocId).toBe('p2/01');
  });
});
