import { Button } from '@heroui/react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { canComplete } from '@/store/selectors';
import type { Doc } from '@/content/types';

export function CompleteButton({ doc }: { doc: Doc }) {
  const completed = useOnboardingStore((s) => !!s.completions[doc.id]);
  const ok = useOnboardingStore((s) => canComplete(doc, s));
  const mark = useOnboardingStore((s) => s.markComplete);
  const unmark = useOnboardingStore((s) => s.unmarkComplete);

  // Already-completed docs remain clickable (to allow unmarking) regardless of enforce state.
  const disabled = !completed && !ok;

  // Note: Tooltip.Trigger renders a div[role="button"] that wraps the button, causing
  // getByRole('button') to find multiple elements in jsdom tests. Using a plain span
  // wrapper with `title` instead to convey the tooltip message without breaking test queries.
  const btn = (
    <Button
      variant={completed ? 'secondary' : 'primary'}
      isDisabled={disabled}
      onPress={() => (completed ? unmark(doc.id) : mark(doc.id))}
    >
      {completed ? '✓ 완료됨' : '완료로 표시'}
    </Button>
  );

  if (disabled) {
    return <span title="필수 항목을 먼저 완료하세요">{btn}</span>;
  }
  return btn;
}
