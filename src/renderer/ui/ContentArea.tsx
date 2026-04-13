import { useOnboardingStore } from "@/store/onboarding-store";
import { findDoc } from "@/content";
import { DocContext } from "@/mdx/doc-context";
import { MdxComponents } from "@/mdx/provider";
import { ErrorBoundary } from "./ErrorBoundary";
import { CompleteButton } from "./CompleteButton";

export function ContentArea() {
  const currentDocId = useOnboardingStore((s) => s.currentDocId);

  if (!currentDocId) {
    return <div className="p-6 text-[var(--text-dim)]">문서를 선택하세요</div>;
  }

  const doc = findDoc(currentDocId);
  if (!doc) {
    return (
      <div className="p-6 text-[var(--text-dim)]">
        문서를 찾을 수 없습니다: {currentDocId}
      </div>
    );
  }

  const Body = doc.Component;

  return (
    <ErrorBoundary docId={doc.id}>
      <DocContext.Provider value={doc.id}>
        <MdxComponents>
          <article className="mx-auto max-w-3xl p-8">
            <div className="mdx-content max-w-none">
              <Body />
            </div>
            <div className="mt-8 border-t border-[var(--border)] pt-6">
              <CompleteButton doc={doc} />
            </div>
          </article>
        </MdxComponents>
      </DocContext.Provider>
    </ErrorBoundary>
  );
}
