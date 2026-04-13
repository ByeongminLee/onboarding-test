import { describe, it, expect, vi, afterEach } from 'vitest';
import { isLocalStorageAvailable } from '@/lib/storage-check';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('isLocalStorageAvailable', () => {
  it('returns true in a normal environment', () => {
    expect(isLocalStorageAvailable()).toBe(true);
  });

  it('returns false when setItem throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(isLocalStorageAvailable()).toBe(false);
    spy.mockRestore();
  });
});
