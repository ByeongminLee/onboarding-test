declare module '*.mdx' {
  import type { ComponentType } from 'react';
  import type { Frontmatter } from '@/content/schema';
  export const frontmatter: Frontmatter;
  const Component: ComponentType;
  export default Component;
}
