import { describe, expect, it } from 'vitest';
import {
  API_KEY_PREFIX,
  generateApiKeyToken,
  getApiKeyPrefix,
  getUtcDayBounds,
  hashApiKey,
  isValidDateParam,
} from '@/features/api-keys/lib/api-key-crypto.ts';

describe('api-key-crypto', () => {
  it('generates keys with the dm_ prefix', () => {
    const key = generateApiKeyToken();
    expect(key.startsWith(API_KEY_PREFIX)).toBe(true);
    expect(key.length).toBeGreaterThan(API_KEY_PREFIX.length + 16);
  });

  it('hashes keys deterministically', async () => {
    const key = 'dm_test_key_value';
    const first = await hashApiKey(key);
    const second = await hashApiKey(key);

    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it('extracts a stable prefix for display', () => {
    const key = 'dm_abcdef1234567890';
    expect(getApiKeyPrefix(key)).toBe('dm_abcdef12');
  });

  it('validates YYYY-MM-DD date params', () => {
    expect(isValidDateParam('2026-07-01')).toBe(true);
    expect(isValidDateParam('2026-13-01')).toBe(false);
    expect(isValidDateParam('2026-07-32')).toBe(false);
    expect(isValidDateParam('07-01-2026')).toBe(false);
  });

  it('returns UTC day bounds for a date param', () => {
    const bounds = getUtcDayBounds('2026-07-01');
    expect(bounds.start).toBe('2026-07-01T00:00:00.000Z');
    expect(bounds.end).toBe('2026-07-01T23:59:59.999Z');
  });
});
