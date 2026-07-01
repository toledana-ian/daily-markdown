const DATE_PARAM_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function hashApiKey(rawKey: string): Promise<string> {
  const data = new TextEncoder().encode(rawKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function isValidDateParam(date: string): boolean {
  if (!DATE_PARAM_PATTERN.test(date)) return false;

  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(Date.UTC(year!, month! - 1, day!));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month! - 1 &&
    parsed.getUTCDate() === day
  );
}

export function getUtcDayBounds(date: string): { start: string; end: string } {
  const [year, month, day] = date.split('-').map(Number);
  const start = new Date(Date.UTC(year!, month! - 1, day!, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year!, month! - 1, day!, 23, 59, 59, 999));

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}
