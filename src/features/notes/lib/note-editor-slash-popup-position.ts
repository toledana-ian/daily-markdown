export type SlashPopupAnchor = {
  bottom: number;
  left: number;
  top: number;
};

export type SlashPopupSize = {
  height: number;
  width: number;
};

export type ViewportSize = {
  height: number;
  width: number;
};

export type SlashPopupLayout = {
  left: number;
  maxHeight: number;
  maxWidth: number;
  top: number;
};

export const SLASH_POPUP_VIEWPORT_PADDING = 8;

// Dialog/drawer content's CSS `transform` makes it the containing block for `fixed` descendants, not the viewport.
export const getFixedPositioningContainerRect = (element: Element | null): DOMRect | null => {
  const container = element?.closest('[data-slot="dialog-content"], [data-slot="drawer-content"]');
  return container?.getBoundingClientRect() ?? null;
};

export const getSlashPopupLayout = (
  anchor: SlashPopupAnchor,
  popupSize: SlashPopupSize,
  viewport: ViewportSize,
  padding = SLASH_POPUP_VIEWPORT_PADDING,
): SlashPopupLayout => {
  const viewportMaxWidth = Math.max(0, viewport.width - padding * 2);
  const maxWidth = viewportMaxWidth;
  const effectiveWidth = Math.min(popupSize.width, maxWidth);

  let left = anchor.left;

  if (left + effectiveWidth + padding > viewport.width) {
    left = viewport.width - effectiveWidth - padding;
  }

  left = Math.max(
    padding,
    Math.min(left, Math.max(padding, viewport.width - effectiveWidth - padding)),
  );

  const spaceBelow = Math.max(0, viewport.height - anchor.bottom - padding);
  const spaceAbove = Math.max(0, anchor.top - padding);
  const viewportMaxHeight = Math.max(0, viewport.height - padding * 2);

  const fitsBelow = popupSize.height <= spaceBelow;
  const fitsAbove = popupSize.height <= spaceAbove;

  const placement = fitsBelow || (!fitsAbove && spaceBelow >= spaceAbove) ? 'below' : 'above';

  const maxHeight = Math.min(placement === 'below' ? spaceBelow : spaceAbove, viewportMaxHeight);
  const effectiveHeight = Math.min(popupSize.height, maxHeight);

  let top = placement === 'below' ? anchor.bottom : anchor.top - effectiveHeight;

  top = Math.max(
    padding,
    Math.min(top, Math.max(padding, viewport.height - effectiveHeight - padding)),
  );

  return {
    left,
    maxHeight,
    maxWidth,
    top,
  };
};
