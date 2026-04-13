import { useEffect } from 'react';
import { contentTree, allDocs } from '@/content';
import { useOnboardingStore } from '@/store/onboarding-store';
import { Sidebar } from '@/ui/Sidebar';
import { MainArea } from '@/ui/MainArea';
import { StorageWarning } from '@/ui/StorageWarning';
import { isLocalStorageAvailable } from '@/lib/storage-check';

export default function App() {
  const currentDocId = useOnboardingStore((s) => s.currentDocId);
  const setCurrentDoc = useOnboardingStore((s) => s.setCurrentDoc);
  const setStorageAvailable = useOnboardingStore((s) => s.setStorageAvailable);

  useEffect(() => {
    setStorageAvailable(isLocalStorageAvailable());
  }, [setStorageAvailable]);

  useEffect(() => {
    // Initialize or fall back to first doc if the saved currentDocId no longer exists
    if (currentDocId && allDocs.find((d) => d.id === currentDocId)) return;
    if (allDocs[0]) setCurrentDoc(allDocs[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <StorageWarning />
      <div className="flex h-screen">
        <Sidebar tree={contentTree} />
        <MainArea />
      </div>
    </>
  );
}
