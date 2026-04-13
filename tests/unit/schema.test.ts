import { describe, it, expect } from 'vitest';
import { frontmatterSchema, partMetaSchema } from '@/content/schema';

describe('frontmatterSchema', () => {
  it('accepts valid checklist frontmatter', () => {
    const result = frontmatterSchema.safeParse({
      title: 'Test', description: 'desc', type: 'checklist', enforce: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid type', () => {
    const result = frontmatterSchema.safeParse({
      title: 'T', description: 'd', type: 'bogus', enforce: false,
    });
    expect(result.success).toBe(false);
  });

  it('defaults enforce to false', () => {
    const result = frontmatterSchema.safeParse({
      title: 'T', description: 'd', type: 'learn',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.enforce).toBe(false);
  });

  it('requires title and description', () => {
    expect(frontmatterSchema.safeParse({ type: 'checklist' }).success).toBe(false);
  });

  it('rejects empty title or description', () => {
    expect(frontmatterSchema.safeParse({
      title: '', description: 'd', type: 'checklist',
    }).success).toBe(false);
    expect(frontmatterSchema.safeParse({
      title: 't', description: '', type: 'checklist',
    }).success).toBe(false);
  });
});

describe('partMetaSchema', () => {
  it('accepts title + description', () => {
    expect(partMetaSchema.safeParse({ title: 'a', description: 'b' }).success).toBe(true);
  });
  it('rejects missing description', () => {
    expect(partMetaSchema.safeParse({ title: 'a' }).success).toBe(false);
  });
  it('rejects empty strings', () => {
    expect(partMetaSchema.safeParse({ title: '', description: 'b' }).success).toBe(false);
  });
});
