import type { ComponentType } from 'react';

export type DocType = 'checklist' | 'mission' | 'learn';

export interface Doc {
  id: string;                   // "part-1-xxx/01-yyy" (no .mdx)
  partId: string;               // folder name "part-1-xxx"
  title: string;
  description: string;
  type: DocType;
  enforce: boolean;
  Component: ComponentType;
}

export interface Part {
  id: string;                   // folder name
  order: number;                // parsed from "part-{N}-*"
  title: string;
  description: string;
  docs: Doc[];
}

export type ContentTree = Part[];
