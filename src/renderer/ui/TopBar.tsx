import { Button } from "@heroui/react";
import { useOnboardingStore } from "@/store/onboarding-store";
import { allDocs, findDoc } from "@/content";
import type { DocType } from "@/content/types";

const TYPE_LABEL: Record<DocType, string> = {
  checklist: "CHECKLIST",
  mission: "MISSION",
  learn: "LEARN",
};

const TYPE_COLOR: Record<DocType, string> = {
  checklist: "var(--accent)",
  mission: "var(--mission)",
  learn: "var(--learn)",
};

export function TopBar() {
  const currentDocId = useOnboardingStore((s) => s.currentDocId);
  const setCurrent = useOnboardingStore((s) => s.setCurrentDoc);
  const doc = currentDocId ? findDoc(currentDocId) : null;
  if (!doc) return null;

  const idx = allDocs.findIndex((d) => d.id === doc.id);
  const prev = idx > 0 ? allDocs[idx - 1] : null;
  const next = idx < allDocs.length - 1 ? allDocs[idx + 1] : null;

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6 py-3">
      <div className="flex items-center gap-3">
        <span
          className="mono rounded px-2 py-1 text-xs font-bold"
          style={{
            background: `color-mix(in oklch, ${TYPE_COLOR[doc.type]} 13%, transparent)`,
            color: TYPE_COLOR[doc.type],
          }}
        >
          {TYPE_LABEL[doc.type]}
        </span>
        <h2 className="font-semibold">{doc.title}</h2>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          className="border border-[var(--border)] bg-[var(--surface2)] text-[var(--text)]"
          isDisabled={!prev}
          onPress={() => prev && setCurrent(prev.id)}
        >
          ◀ 이전
        </Button>
        <Button
          variant="secondary"
          className="border border-[var(--border)] bg-[var(--text)] text-[var(--bg)]"
          isDisabled={!next}
          onPress={() => next && setCurrent(next.id)}
        >
          다음 ▶
        </Button>
      </div>
    </div>
  );
}
