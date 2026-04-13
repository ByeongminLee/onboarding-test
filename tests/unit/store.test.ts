import { beforeEach, describe, it, expect } from 'vitest';
import { useOnboardingStore } from '@/store/onboarding-store';

beforeEach(() => {
  localStorage.clear();
  useOnboardingStore.getState().reset();
});

describe('onboarding store', () => {
  it('toggles check items by doc+check id', () => {
    const { toggleCheck } = useOnboardingStore.getState();
    toggleCheck('doc1', 'a');
    expect(useOnboardingStore.getState().checks['doc1:a']).toBe(true);
    toggleCheck('doc1', 'a');
    expect(useOnboardingStore.getState().checks['doc1:a']).toBe(false);
  });

  it('records quiz answers', () => {
    useOnboardingStore.getState().setQuizAnswer('doc1', 2);
    expect(useOnboardingStore.getState().quizzes['doc1']).toBe(2);
  });

  it('records mission notes', () => {
    useOnboardingStore.getState().setMissionNote('doc1', 'hello');
    expect(useOnboardingStore.getState().missions['doc1']).toBe('hello');
  });

  it('marks and unmarks completion', () => {
    useOnboardingStore.getState().markComplete('doc1');
    expect(useOnboardingStore.getState().completions['doc1']).toBe(true);
    useOnboardingStore.getState().unmarkComplete('doc1');
    expect(useOnboardingStore.getState().completions['doc1']).toBe(false);
  });

  it('sets current doc', () => {
    useOnboardingStore.getState().setCurrentDoc('doc1');
    expect(useOnboardingStore.getState().currentDocId).toBe('doc1');
  });

  it('tracks storage availability flag', () => {
    useOnboardingStore.getState().setStorageAvailable(false);
    expect(useOnboardingStore.getState().storageAvailable).toBe(false);
    useOnboardingStore.getState().setStorageAvailable(true);
    expect(useOnboardingStore.getState().storageAvailable).toBe(true);
  });

  it('reset clears all state', () => {
    const s = useOnboardingStore.getState();
    s.markComplete('d');
    s.toggleCheck('d', 'a');
    s.setQuizAnswer('d', 1);
    s.setMissionNote('d', 'x');
    s.setCurrentDoc('d');
    s.reset();
    const after = useOnboardingStore.getState();
    expect(after.completions).toEqual({});
    expect(after.checks).toEqual({});
    expect(after.quizzes).toEqual({});
    expect(after.missions).toEqual({});
    expect(after.currentDocId).toBe(null);
  });
});
