import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface OnboardingState {
  completions: Record<string, boolean>;
  checks: Record<string, boolean>;
  quizzes: Record<string, number>;
  missions: Record<string, string>;
  currentDocId: string | null;
  storageAvailable: boolean;

  toggleCheck: (docId: string, checkId: string) => void;
  setQuizAnswer: (docId: string, optionIdx: number) => void;
  setMissionNote: (docId: string, text: string) => void;
  markComplete: (docId: string) => void;
  unmarkComplete: (docId: string) => void;
  setCurrentDoc: (docId: string | null) => void;
  setStorageAvailable: (ok: boolean) => void;
  reset: () => void;
}

const initial = {
  completions: {} as Record<string, boolean>,
  checks: {} as Record<string, boolean>,
  quizzes: {} as Record<string, number>,
  missions: {} as Record<string, string>,
  currentDocId: null as string | null,
  storageAvailable: true,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initial,
      toggleCheck: (docId, checkId) => set((s) => ({
        checks: { ...s.checks, [`${docId}:${checkId}`]: !s.checks[`${docId}:${checkId}`] },
      })),
      setQuizAnswer: (docId, idx) => set((s) => ({
        quizzes: { ...s.quizzes, [docId]: idx },
      })),
      setMissionNote: (docId, text) => set((s) => ({
        missions: { ...s.missions, [docId]: text },
      })),
      markComplete: (docId) => set((s) => ({
        completions: { ...s.completions, [docId]: true },
      })),
      unmarkComplete: (docId) => set((s) => ({
        completions: { ...s.completions, [docId]: false },
      })),
      setCurrentDoc: (docId) => set({ currentDocId: docId }),
      setStorageAvailable: (ok) => set({ storageAvailable: ok }),
      reset: () => set({ ...initial }),
    }),
    {
      name: 'onboarding-state-v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          useOnboardingStore.getState().setStorageAvailable(false);
        }
      },
      partialize: (s) => ({
        completions: s.completions,
        checks: s.checks,
        quizzes: s.quizzes,
        missions: s.missions,
        currentDocId: s.currentDocId,
      }),
    },
  ),
);
