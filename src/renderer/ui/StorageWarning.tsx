import { useOnboardingStore } from '@/store/onboarding-store';

export function StorageWarning() {
  const ok = useOnboardingStore((s) => s.storageAvailable);
  if (ok) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--warn)] p-2 text-center text-sm text-black">
      진행 상황이 저장되지 않을 수 있습니다 (localStorage 접근 불가)
    </div>
  );
}
