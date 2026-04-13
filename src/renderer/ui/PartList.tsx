import type { ContentTree } from '@/content/types';
import { DocItem } from './DocItem';

export function PartList({ tree }: { tree: ContentTree }) {
  return (
    <nav className="overflow-y-auto">
      {tree.map((part) => (
        <div key={part.id} className="py-2">
          <h3 className="px-4 py-1 mono text-xs uppercase text-[var(--text-dim)]">
            {part.title}
          </h3>
          {part.docs.map((d) => <DocItem key={d.id} doc={d} />)}
        </div>
      ))}
    </nav>
  );
}
