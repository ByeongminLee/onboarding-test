import { describe, it, expect } from 'vitest';
import { buildContentTree, type RawMdxModule, type RawMetaModule } from '@/content/tree';

const Dummy = () => null;

const mdx: Record<string, RawMdxModule> = {
  '/content/part-2-env/01-docker.mdx': {
    default: Dummy,
    frontmatter: { title: 'Docker', description: 'd', type: 'checklist', enforce: false },
  },
  '/content/part-1-account/02-notion.mdx': {
    default: Dummy,
    frontmatter: { title: 'Notion', description: 'd', type: 'checklist', enforce: false },
  },
  '/content/part-1-account/01-github.mdx': {
    default: Dummy,
    frontmatter: { title: 'GitHub', description: 'd', type: 'checklist', enforce: true },
  },
};

const meta: Record<string, RawMetaModule> = {
  '/content/part-1-account/_meta.json': { default: { title: '계정 체크', description: 'a' } },
  '/content/part-2-env/_meta.json':     { default: { title: '환경 세팅', description: 'e' } },
};

describe('buildContentTree', () => {
  it('sorts parts by order prefix', () => {
    const tree = buildContentTree(mdx, meta);
    expect(tree.map(p => p.order)).toEqual([1, 2]);
    expect(tree[0].title).toBe('계정 체크');
  });

  it('sorts docs within part by filename prefix', () => {
    const tree = buildContentTree(mdx, meta);
    expect(tree[0].docs.map(d => d.title)).toEqual(['GitHub', 'Notion']);
  });

  it('assigns doc id as partFolder/docFile without extension', () => {
    const tree = buildContentTree(mdx, meta);
    expect(tree[0].docs[0].id).toBe('part-1-account/01-github');
  });

  it('preserves enforce flag', () => {
    const tree = buildContentTree(mdx, meta);
    expect(tree[0].docs[0].enforce).toBe(true);
    expect(tree[0].docs[1].enforce).toBe(false);
  });

  it('throws if _meta.json missing for a part', () => {
    expect(() => buildContentTree(mdx, {})).toThrow(/missing _meta\.json/i);
  });

  it('throws if frontmatter invalid', () => {
    const bad: Record<string, RawMdxModule> = {
      ...mdx,
      '/content/part-1-account/03-bad.mdx': {
        default: Dummy,
        frontmatter: { title: '', description: 'd', type: 'checklist' },
      },
    };
    expect(() => buildContentTree(bad, meta)).toThrow(/frontmatter/i);
  });

  it('throws if _meta.json fails schema', () => {
    const badMeta = { '/content/part-1-account/_meta.json': { default: { title: '' } } };
    const slim = { '/content/part-1-account/01-github.mdx': mdx['/content/part-1-account/01-github.mdx'] };
    expect(() => buildContentTree(slim, badMeta)).toThrow(/_meta\.json/i);
  });

  it('throws if doc file name does not start with NN-', () => {
    const bad = {
      '/content/part-1-account/bad-name.mdx': mdx['/content/part-1-account/01-github.mdx'],
    };
    const onlyMeta = { '/content/part-1-account/_meta.json': meta['/content/part-1-account/_meta.json'] };
    expect(() => buildContentTree(bad, onlyMeta)).toThrow(/NN-|must start/i);
  });
});
