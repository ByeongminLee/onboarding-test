import type { ContentTree } from '@/content/types';

interface Props {
  tree: ContentTree;
}

export function Sidebar({ tree: _tree }: Props) {
  return (
    <aside className="w-[260px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)]">
      {/* Progress + Part list — implemented in Task 13 */}
    </aside>
  );
}
