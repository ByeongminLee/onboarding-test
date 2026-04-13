import type { ComponentType } from 'react';
import type { ContentTree, Doc, Part } from './types';
import { frontmatterSchema, partMetaSchema, type PartMeta } from './schema';

export interface RawMdxModule {
  default: ComponentType;
  frontmatter: unknown;
}

export interface RawMetaModule {
  default: unknown;
}

const PART_RE = /\/content\/(part-(\d+)-[^/]+)\/([^/]+)\.mdx$/;
const META_RE = /\/content\/(part-\d+-[^/]+)\/_meta\.json$/;
const DOC_FILE_RE = /^(\d+)-/;

export function buildContentTree(
  mdxModules: Record<string, RawMdxModule>,
  metaModules: Record<string, RawMetaModule>,
): ContentTree {
  // Parse part metadata
  const partMeta = new Map<string, PartMeta>();
  for (const [path, mod] of Object.entries(metaModules)) {
    const match = path.match(META_RE);
    if (!match) continue;
    const partId = match[1];
    const parsed = partMetaSchema.safeParse(mod.default);
    if (!parsed.success) {
      throw new Error(`Invalid _meta.json at ${path}: ${parsed.error.message}`);
    }
    partMeta.set(partId, parsed.data);
  }

  // Group docs by part
  const docsByPart = new Map<string, { order: number; doc: Doc }[]>();
  for (const [path, mod] of Object.entries(mdxModules)) {
    const match = path.match(PART_RE);
    if (!match) continue;
    const [, partId, , docFile] = match;

    const fm = frontmatterSchema.safeParse(mod.frontmatter);
    if (!fm.success) {
      throw new Error(`Invalid frontmatter at ${path}: ${fm.error.message}`);
    }

    const docOrderMatch = docFile.match(DOC_FILE_RE);
    if (!docOrderMatch) {
      throw new Error(`Doc file must start with "NN-": ${path}`);
    }
    const order = Number(docOrderMatch[1]);

    const doc: Doc = {
      id: `${partId}/${docFile}`,
      partId,
      title: fm.data.title,
      description: fm.data.description,
      type: fm.data.type,
      enforce: fm.data.enforce,
      Component: mod.default,
    };

    const list = docsByPart.get(partId) ?? [];
    list.push({ order, doc });
    docsByPart.set(partId, list);
  }

  // Build parts
  const parts: Part[] = [];
  for (const [partId, items] of docsByPart.entries()) {
    const meta = partMeta.get(partId);
    if (!meta) throw new Error(`missing _meta.json for ${partId}`);
    const partOrder = Number(partId.match(/^part-(\d+)-/)![1]);
    items.sort((a, b) => a.order - b.order);
    parts.push({
      id: partId,
      order: partOrder,
      title: meta.title,
      description: meta.description,
      docs: items.map(i => i.doc),
    });
  }
  parts.sort((a, b) => a.order - b.order);
  return parts;
}
