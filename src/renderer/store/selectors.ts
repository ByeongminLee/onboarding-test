import type { Doc } from '@/content/types';

export function overallProgress(
  completions: Record<string, boolean>,
  totalDocs: number,
): number {
  if (totalDocs === 0) return 0;
  const done = Object.values(completions).filter(Boolean).length;
  return done / totalDocs;
}

export interface CanCompleteState {
  checks: Record<string, boolean>;
  quizzes: Record<string, number>;
  missions: Record<string, string>;
}

export function canComplete(doc: Doc, s: CanCompleteState): boolean {
  if (!doc.enforce) return true;
  switch (doc.type) {
    case 'checklist': {
      const prefix = `${doc.id}:`;
      const keys = Object.keys(s.checks).filter(k => k.startsWith(prefix));
      if (keys.length === 0) return false;
      return keys.every(k => s.checks[k]);
    }
    case 'mission': {
      return (s.missions[doc.id] ?? '').trim().length > 0;
    }
    case 'learn': {
      return s.quizzes[doc.id] !== undefined;
    }
  }
}
