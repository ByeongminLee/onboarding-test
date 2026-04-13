import { useOnboardingStore } from '@/store/onboarding-store';
import type { Doc } from '@/content/types';

export function DocItem({ doc }: { doc: Doc }) {
  const completed = useOnboardingStore((s) => !!s.completions[doc.id]);
  const active = useOnboardingStore((s) => s.currentDocId === doc.id);
  const setCurrent = useOnboardingStore((s) => s.setCurrentDoc);

  return (
    <button
      type="button"
      data-doc-id={doc.id}
      data-completed={String(completed)}
      data-active={String(active)}
      onClick={() => setCurrent(doc.id)}
      className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-[var(--surface2)] ${
        active ? 'bg-[var(--surface2)] text-[var(--accent)]' : 'text-[var(--text)]'
      }`}
    >
      <span
        className={`w-4 text-xs ${completed ? 'text-[var(--accent)]' : 'text-[var(--text-dim)]'}`}
      >
        {completed ? '✓' : '○'}
      </span>
      <span>{doc.title}</span>
    </button>
  );
}
