import { describe, expect, it } from 'vitest';
import { buildShareUrl, computeExpiresAt } from '@/features/notes/lib/note-share-expiry';

describe('note share expiry', () => {
  const from = new Date('2026-01-01T12:00:00.000Z');

  it('computes 1 hour expiry', () => {
    expect(computeExpiresAt('1h', from)).toBe('2026-01-01T13:00:00.000Z');
  });

  it('computes 24 hour expiry', () => {
    expect(computeExpiresAt('24h', from)).toBe('2026-01-02T12:00:00.000Z');
  });

  it('computes 7 day expiry', () => {
    expect(computeExpiresAt('7d', from)).toBe('2026-01-08T12:00:00.000Z');
  });

  it('computes 30 day expiry', () => {
    expect(computeExpiresAt('30d', from)).toBe('2026-01-31T12:00:00.000Z');
  });

  it('builds absolute share URLs', () => {
    expect(buildShareUrl('abc-123', 'https://daily.md')).toBe('https://daily.md/share/abc-123');
  });
});
