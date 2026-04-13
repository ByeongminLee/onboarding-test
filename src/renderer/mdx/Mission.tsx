import { useContext } from 'react';
import { DocContext } from './doc-context';
import { useOnboardingStore } from '@/store/onboarding-store';

interface MissionProps {
  title: string;
  description: string;
}

export function Mission({ title, description }: MissionProps) {
  return (
    <div className="my-4 rounded-lg border-l-4 border-[var(--mission)] bg-[var(--surface2)] p-4">
      <h4 className="mb-1 font-semibold text-[var(--mission)]">{title}</h4>
      <p className="text-sm text-[var(--text-dim)]">{description}</p>
    </div>
  );
}

export function MissionNote() {
  const docId = useContext(DocContext);
  if (!docId) throw new Error('<MissionNote> must be used inside a DocContext.Provider');
  const value = useOnboardingStore((s) => s.missions[docId] ?? '');
  const setNote = useOnboardingStore((s) => s.setMissionNote);

  return (
    <label className="my-4 block">
      <span className="mb-1 block text-sm text-[var(--text-dim)]">
        체험 후 느낀 점, 궁금한 점을 자유롭게 적어주세요
      </span>
      <textarea
        className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)]"
        rows={6}
        value={value}
        onChange={(e) => setNote(docId, e.target.value)}
      />
    </label>
  );
}
