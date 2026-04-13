import { z } from 'zod';

export const frontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['checklist', 'mission', 'learn']),
  enforce: z.boolean().default(false),
});

export const partMetaSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
export type PartMeta = z.infer<typeof partMetaSchema>;
