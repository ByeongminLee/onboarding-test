import { buildContentTree, type RawMdxModule, type RawMetaModule } from './tree';

const mdxModules = import.meta.glob('./part-*/**/*.mdx', { eager: true }) as Record<string, RawMdxModule>;
const metaModules = import.meta.glob('./part-*/_meta.json', { eager: true }) as Record<string, RawMetaModule>;

function normalize<T>(modules: Record<string, T>): Record<string, T> {
  const result: Record<string, T> = {};
  for (const [key, value] of Object.entries(modules)) {
    // Convert './part-1-xxx/file.mdx' -> '/content/part-1-xxx/file.mdx'
    const normalized = key.replace(/^\.\//, '/content/');
    result[normalized] = value;
  }
  return result;
}

export const contentTree = buildContentTree(
  normalize(mdxModules),
  normalize(metaModules),
);

export const allDocs = contentTree.flatMap(p => p.docs);

export function findDoc(id: string) {
  return allDocs.find(d => d.id === id);
}
