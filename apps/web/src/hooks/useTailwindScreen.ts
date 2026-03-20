import { useSyncExternalStore } from 'react';

const TAILWIND_SCREEN_WIDTHS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type TailwindScreen = 'base' | keyof typeof TAILWIND_SCREEN_WIDTHS;

const getTailwindScreen = (width: number): TailwindScreen => {
  if (width >= TAILWIND_SCREEN_WIDTHS['2xl']) return '2xl';
  if (width >= TAILWIND_SCREEN_WIDTHS.xl) return 'xl';
  if (width >= TAILWIND_SCREEN_WIDTHS.lg) return 'lg';
  if (width >= TAILWIND_SCREEN_WIDTHS.md) return 'md';
  if (width >= TAILWIND_SCREEN_WIDTHS.sm) return 'sm';
  return 'base';
};

const subscribe = (onStoreChange: () => void) => {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  window.addEventListener('resize', onStoreChange);
  return () => {
    window.removeEventListener('resize', onStoreChange);
  };
};

const getSnapshot = () => {
  if (typeof window === 'undefined') {
    return 'base' as const;
  }

  return getTailwindScreen(window.innerWidth);
};

export const useTailwindScreen = () => useSyncExternalStore(subscribe, getSnapshot, () => 'base');
