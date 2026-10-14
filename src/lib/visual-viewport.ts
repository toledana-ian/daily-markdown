export type VisualViewportLike = Pick<
  VisualViewport,
  'height' | 'addEventListener' | 'removeEventListener'
>;

export function computeViewportHeightUnit(heightPx: number) {
  const unitPx = heightPx / 100;
  return `${unitPx}px`;
}

export function setViewportHeightCssVar(target: HTMLElement, heightPx: number, varName = '--vvh') {
  target.style.setProperty(varName, computeViewportHeightUnit(heightPx));
}

export function syncVisualViewportHeightCssVar(options?: {
  win?: Window;
  target?: HTMLElement;
  varName?: string;
}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const win = options?.win ?? window;
  const target = options?.target ?? document.documentElement;
  const varName = options?.varName ?? '--vvh';

  const update = () => {
    const heightPx = win.visualViewport?.height ?? win.innerHeight;
    setViewportHeightCssVar(target, heightPx, varName);
  };

  update();

  const vv = win.visualViewport;

  if (!vv) {
    win.addEventListener('resize', update, { passive: true });
    win.addEventListener('orientationchange', update, { passive: true });
    return () => {
      win.removeEventListener('resize', update);
      win.removeEventListener('orientationchange', update);
    };
  }

  vv.addEventListener('resize', update, { passive: true });
  vv.addEventListener('scroll', update, { passive: true });
  win.addEventListener('resize', update, { passive: true });
  win.addEventListener('orientationchange', update, { passive: true });

  return () => {
    vv.removeEventListener('resize', update);
    vv.removeEventListener('scroll', update);
    win.removeEventListener('resize', update);
    win.removeEventListener('orientationchange', update);
  };
}
