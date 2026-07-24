import { describe, expect, it } from 'vitest';
import {
  RESTORE_SCROLL_MAX_FRAMES,
  RESTORE_SCROLL_STABLE_FRAMES,
  canReachScrollTop,
  restoreElementScrollTop,
} from '@/features/notes/lib/restore-element-scroll-top';

const flushAnimationFrames = async (count = 2) => {
  for (let index = 0; index < count; index += 1) {
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });
  }
};

const createScrollContainer = (initialScrollHeight: number, clientHeight = 100) => {
  let scrollHeight = initialScrollHeight;
  const container = document.createElement('div');
  const content = document.createElement('div');
  container.append(content);

  Object.defineProperty(container, 'scrollHeight', {
    configurable: true,
    get: () => scrollHeight,
  });
  Object.defineProperty(container, 'clientHeight', {
    configurable: true,
    get: () => clientHeight,
  });

  return {
    container,
    content,
    setScrollHeight: (nextScrollHeight: number) => {
      scrollHeight = nextScrollHeight;
    },
  };
};

describe('restoreElementScrollTop', () => {
  it('restores immediately when the target offset is already reachable', async () => {
    const { container } = createScrollContainer(500);
    const cleanup = restoreElementScrollTop(container, 240);

    await flushAnimationFrames();

    expect(container.scrollTop).toBe(240);
    cleanup();
  });

  it('retries across animation frames while scrollHeight is still growing', async () => {
    const { container, setScrollHeight } = createScrollContainer(120);
    const cleanup = restoreElementScrollTop(container, 240);

    await flushAnimationFrames();

    expect(canReachScrollTop(container, 240)).toBe(false);
    expect(container.scrollTop).toBe(240);

    setScrollHeight(500);
    await flushAnimationFrames();

    expect(canReachScrollTop(container, 240)).toBe(true);
    expect(container.scrollTop).toBe(240);
    cleanup();
  });

  it('retries when content nodes are added after the initial restore attempt', async () => {
    const { container, content, setScrollHeight } = createScrollContainer(120);
    const cleanup = restoreElementScrollTop(container, 240);

    await flushAnimationFrames();

    setScrollHeight(500);
    const paragraph = document.createElement('p');
    paragraph.textContent = 'Late-rendered markdown paragraph';
    content.append(paragraph);

    await flushAnimationFrames(4);

    expect(canReachScrollTop(container, 240)).toBe(true);
    expect(container.scrollTop).toBe(240);
    cleanup();
  });

  it('gives up after scrollHeight stops growing before the target is reachable', async () => {
    const { container } = createScrollContainer(120);
    const cleanup = restoreElementScrollTop(container, 240);

    await flushAnimationFrames(RESTORE_SCROLL_STABLE_FRAMES + 6);

    expect(canReachScrollTop(container, 240)).toBe(false);
    expect(container.scrollTop).toBe(240);
    cleanup();
  });

  it('stops after a bounded number of animation frames', async () => {
    const { container } = createScrollContainer(120);
    const cleanup = restoreElementScrollTop(container, 240);

    await flushAnimationFrames(RESTORE_SCROLL_MAX_FRAMES + 8);

    expect(canReachScrollTop(container, 240)).toBe(false);
    expect(container.scrollTop).toBe(240);
    cleanup();
  });
});

describe('canReachScrollTop', () => {
  it('reports when a target offset fits inside the scroll range', () => {
    const { container } = createScrollContainer(500, 100);

    expect(canReachScrollTop(container, 400)).toBe(true);
    expect(canReachScrollTop(container, 450)).toBe(false);
  });
});
