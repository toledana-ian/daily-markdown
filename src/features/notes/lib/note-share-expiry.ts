import { addDays, addHours } from 'date-fns';

export const SHARE_DURATIONS = [
  { label: '1 hour', value: '1h' },
  { label: '24 hours', value: '24h' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
] as const;

export type ShareDuration = (typeof SHARE_DURATIONS)[number]['value'];

export const computeExpiresAt = (duration: ShareDuration, from: Date = new Date()): string => {
  switch (duration) {
    case '1h':
      return addHours(from, 1).toISOString();
    case '24h':
      return addHours(from, 24).toISOString();
    case '7d':
      return addDays(from, 7).toISOString();
    case '30d':
      return addDays(from, 30).toISOString();
  }
};

export const buildShareUrl = (shareId: string, origin: string): string => {
  return `${origin}/share/${shareId}`;
};
