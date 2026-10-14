import { describe, expect, it, vi } from 'vitest';

import {
  computeViewportHeightUnit,
  setViewportHeightCssVar,
  syncVisualViewportHeightCssVar,
} from '@/lib/visual-viewport';

describe('visual-viewport', () => {
  it('computes a 1% viewport height unit', () => {
    expect(computeViewportHeightUnit(900)).toBe('9px');
    expect(computeViewportHeightUnit(812)).toBe('8.12px');
  });

  it('sets a CSS variable on the target element', () => {
    const el = document.createElement('div');
    setViewportHeightCssVar(el, 812, '--vvh');
    expect(el.style.getPropertyValue('--vvh')).toBe('8.12px');
  });

  it('syncs from visualViewport when available', () => {
    const target = document.createElement('div');

    let height = 800;
    const listeners = new Map<string, Set<() => void>>();
    const add = (type: string, cb: () => void) => {
      const set = listeners.get(type) ?? new Set();
      set.add(cb);
      listeners.set(type, set);
    };
    const remove = (type: string, cb: () => void) => {
      listeners.get(type)?.delete(cb);
    };
    const fire = (type: string) => {
      for (const cb of listeners.get(type) ?? []) cb();
    };

    const win = {
      innerHeight: 999,
      visualViewport: {
        get height() {
          return height;
        },
        addEventListener: add,
        removeEventListener: remove,
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Window;

    const cleanup = syncVisualViewportHeightCssVar({ win, target, varName: '--vvh' });

    expect(target.style.getPropertyValue('--vvh')).toBe('8px');

    height = 600;
    fire('resize');
    expect(target.style.getPropertyValue('--vvh')).toBe('6px');

    cleanup();
  });
});
