import { describe, it, expect } from 'vitest';
import { overallProgress, canComplete } from '@/store/selectors';
import type { Doc } from '@/content/types';

const Dummy = () => null;
const doc = (id: string, type: Doc['type'], enforce = false): Doc => ({
  id, partId: 'p', title: 't', description: 'd', type, enforce, Component: Dummy,
});

describe('overallProgress', () => {
  it('is completed count over total', () => {
    expect(overallProgress({ a: true, b: false, c: true }, 4)).toBeCloseTo(0.5);
  });
  it('is 0 with no total', () => {
    expect(overallProgress({}, 0)).toBe(0);
  });
  it('handles all true', () => {
    expect(overallProgress({ a: true, b: true }, 2)).toBe(1);
  });
  it('treats false values as not completed', () => {
    expect(overallProgress({ a: false, b: false }, 2)).toBe(0);
  });
});

describe('canComplete', () => {
  const emptyState = { checks: {}, quizzes: {}, missions: {} };

  it('returns true when enforce is false regardless of state', () => {
    expect(canComplete(doc('d', 'checklist', false), emptyState)).toBe(true);
    expect(canComplete(doc('d', 'mission', false), emptyState)).toBe(true);
    expect(canComplete(doc('d', 'learn', false), emptyState)).toBe(true);
  });

  it('checklist with enforce: requires at least one check and all checked', () => {
    const d = doc('d', 'checklist', true);
    expect(canComplete(d, emptyState)).toBe(false);
    expect(canComplete(d, { ...emptyState, checks: { 'd:a': true, 'd:b': true } })).toBe(true);
    expect(canComplete(d, { ...emptyState, checks: { 'd:a': true, 'd:b': false } })).toBe(false);
  });

  it('checklist ignores checks from other docs', () => {
    const d = doc('d', 'checklist', true);
    expect(canComplete(d, { ...emptyState, checks: { 'other:a': true } })).toBe(false);
  });

  it('mission with enforce: requires non-empty trimmed note', () => {
    const d = doc('d', 'mission', true);
    expect(canComplete(d, emptyState)).toBe(false);
    expect(canComplete(d, { ...emptyState, missions: { d: '   ' } })).toBe(false);
    expect(canComplete(d, { ...emptyState, missions: { d: 'ok' } })).toBe(true);
  });

  it('learn with enforce: requires a quiz answer recorded (any value)', () => {
    const d = doc('d', 'learn', true);
    expect(canComplete(d, emptyState)).toBe(false);
    expect(canComplete(d, { ...emptyState, quizzes: { d: 0 } })).toBe(true);
    expect(canComplete(d, { ...emptyState, quizzes: { d: 3 } })).toBe(true);
  });
});
