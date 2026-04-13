import { MDXProvider } from '@mdx-js/react';
import { type ReactNode } from 'react';
import { Check } from './Check';
import { Quiz } from './Quiz';
import { Mission, MissionNote } from './Mission';
import { Glossary } from './Glossary';
import { Head } from './Head';

export { DocContext } from './doc-context';

const components = { Check, Quiz, Mission, MissionNote, Glossary, Head };

export function MdxComponents({ children }: { children: ReactNode }) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}
