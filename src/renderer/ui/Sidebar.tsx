import type { ContentTree } from '@/content/types';
import { ProgressSection } from './ProgressSection';
import { PartList } from './PartList';

interface Props {
  tree: ContentTree;
}

export function Sidebar({ tree }: Props) {
  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      <ProgressSection />
      <PartList tree={tree} />
    </aside>
  );
}
