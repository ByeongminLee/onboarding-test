import { ProgressBar, Label } from '@heroui/react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { overallProgress } from '@/store/selectors';
import { allDocs } from '@/content';

export function ProgressSection() {
  const pct = useOnboardingStore((s) => overallProgress(s.completions, allDocs.length)) * 100;
  return (
    <div className="border-b border-[var(--border)] p-4">
      <ProgressBar aria-label="전체 진행률" value={pct} color="success">
        <Label>전체 진행률</Label>
        <ProgressBar.Output />
        <ProgressBar.Track><ProgressBar.Fill /></ProgressBar.Track>
      </ProgressBar>
    </div>
  );
}
