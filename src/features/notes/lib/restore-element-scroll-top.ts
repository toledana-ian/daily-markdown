type ScrollContainer = {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
};

const MAX_RESTORE_FRAMES = 90;
const STABLE_SCROLL_HEIGHT_FRAMES = 4;

export const RESTORE_SCROLL_MAX_FRAMES = MAX_RESTORE_FRAMES;
export const RESTORE_SCROLL_STABLE_FRAMES = STABLE_SCROLL_HEIGHT_FRAMES;

export const canReachScrollTop = (container: ScrollContainer, targetTop: number) => {
  const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight);
  return targetTop <= maxScrollTop;
};

const observeContentElements = (
  container: Element,
  resizeObserver: ResizeObserver,
  root: Element | null = container,
) => {
  if (!root) {
    return;
  }

  if (root !== container) {
    resizeObserver.observe(root);
  }

  for (const child of root.children) {
    resizeObserver.observe(child);
  }
};

export const restoreElementScrollTop = (
  container: ScrollContainer & Element,
  targetTop: number,
): (() => void) => {
  let cancelled = false;
  let kickoffFrameId = 0;
  let pollFrameId = 0;
  let mutationObserver: MutationObserver | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let pollFrameCount = 0;
  let stableScrollHeightFrames = 0;
  let lastScrollHeight = -1;

  const cleanup = () => {
    mutationObserver?.disconnect();
    resizeObserver?.disconnect();
    mutationObserver = null;
    resizeObserver = null;

    if (pollFrameId) {
      window.cancelAnimationFrame(pollFrameId);
      pollFrameId = 0;
    }
  };

  const attemptRestore = () => {
    if (cancelled) {
      return true;
    }

    container.scrollTop = targetTop;

    if (targetTop === 0 || canReachScrollTop(container, targetTop)) {
      cleanup();
      return true;
    }

    const scrollHeight = container.scrollHeight;
    if (scrollHeight === lastScrollHeight) {
      stableScrollHeightFrames += 1;
    } else {
      lastScrollHeight = scrollHeight;
      stableScrollHeightFrames = 0;
    }

    if (stableScrollHeightFrames >= STABLE_SCROLL_HEIGHT_FRAMES) {
      cleanup();
      return true;
    }

    return false;
  };

  const schedulePoll = () => {
    if (cancelled || pollFrameId) {
      return;
    }

    pollFrameId = window.requestAnimationFrame(() => {
      pollFrameId = 0;

      if (attemptRestore()) {
        return;
      }

      pollFrameCount += 1;
      if (pollFrameCount < MAX_RESTORE_FRAMES) {
        schedulePoll();
        return;
      }

      cleanup();
    });
  };

  const onContentLayoutChange = () => {
    if (cancelled || attemptRestore()) {
      return;
    }

    pollFrameCount = 0;
    stableScrollHeightFrames = 0;
    schedulePoll();
  };

  const startLayoutWatchers = () => {
    mutationObserver = new MutationObserver((mutations) => {
      if (cancelled) {
        return;
      }

      for (const mutation of mutations) {
        if (!resizeObserver) {
          continue;
        }

        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            observeContentElements(container, resizeObserver, node);
          }
        }
      }

      onContentLayoutChange();
    });

    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        onContentLayoutChange();
      });
      observeContentElements(container, resizeObserver);
    }

    lastScrollHeight = container.scrollHeight;
    schedulePoll();
  };

  kickoffFrameId = window.requestAnimationFrame(() => {
    kickoffFrameId = window.requestAnimationFrame(() => {
      kickoffFrameId = 0;

      if (cancelled) {
        return;
      }

      if (attemptRestore()) {
        return;
      }

      startLayoutWatchers();
    });
  });

  return () => {
    cancelled = true;
    window.cancelAnimationFrame(kickoffFrameId);
    cleanup();
  };
};
