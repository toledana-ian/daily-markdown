import { describe, expect, it } from 'vitest';
import {
  getSlashPopupLayout,
  SLASH_POPUP_VIEWPORT_PADDING,
} from '@/features/notes/lib/note-editor-slash-popup-position';

const viewport = { width: 800, height: 600 };
const popupSize = { width: 288, height: 240 };

describe('getSlashPopupLayout', () => {
  it('places the popup below the cursor when there is enough space', () => {
    const anchor = { left: 100, top: 200, bottom: 220 };

    expect(getSlashPopupLayout(anchor, popupSize, viewport)).toEqual({
      left: 100,
      top: 220,
      maxHeight: viewport.height - anchor.bottom - SLASH_POPUP_VIEWPORT_PADDING,
      maxWidth: viewport.width - SLASH_POPUP_VIEWPORT_PADDING * 2,
    });
  });

  it('shifts the popup left when it would overflow the right edge', () => {
    const anchor = { left: 600, top: 200, bottom: 220 };

    expect(getSlashPopupLayout(anchor, popupSize, viewport)).toEqual({
      left: viewport.width - popupSize.width - SLASH_POPUP_VIEWPORT_PADDING,
      top: 220,
      maxHeight: viewport.height - anchor.bottom - SLASH_POPUP_VIEWPORT_PADDING,
      maxWidth: viewport.width - SLASH_POPUP_VIEWPORT_PADDING * 2,
    });
  });

  it('clamps the popup to the left edge when needed', () => {
    const anchor = { left: 2, top: 200, bottom: 220 };

    expect(getSlashPopupLayout(anchor, popupSize, viewport)).toEqual({
      left: SLASH_POPUP_VIEWPORT_PADDING,
      top: 220,
      maxHeight: viewport.height - anchor.bottom - SLASH_POPUP_VIEWPORT_PADDING,
      maxWidth: viewport.width - SLASH_POPUP_VIEWPORT_PADDING * 2,
    });
  });

  it('places the popup above the cursor when there is not enough space below', () => {
    const anchor = { left: 100, top: 500, bottom: 520 };

    expect(getSlashPopupLayout(anchor, popupSize, viewport)).toEqual({
      left: 100,
      top: anchor.top - popupSize.height,
      maxHeight: anchor.top - SLASH_POPUP_VIEWPORT_PADDING,
      maxWidth: viewport.width - SLASH_POPUP_VIEWPORT_PADDING * 2,
    });
  });

  it('prefers below with a scrollable max height when the popup is taller than the viewport', () => {
    const anchor = { left: 100, top: 100, bottom: 120 };
    const tallPopup = { width: 288, height: 800 };
    const maxHeight = viewport.height - anchor.bottom - SLASH_POPUP_VIEWPORT_PADDING;

    expect(getSlashPopupLayout(anchor, tallPopup, viewport)).toEqual({
      left: 100,
      top: anchor.bottom,
      maxHeight,
      maxWidth: viewport.width - SLASH_POPUP_VIEWPORT_PADDING * 2,
    });
  });

  it('places an oversized popup above with a scrollable max height when there is more space above', () => {
    const anchor = { left: 100, top: 300, bottom: 320 };
    const tallPopup = { width: 288, height: 580 };
    const maxHeight = anchor.top - SLASH_POPUP_VIEWPORT_PADDING;

    expect(getSlashPopupLayout(anchor, tallPopup, viewport)).toEqual({
      left: 100,
      top: anchor.top - maxHeight,
      maxHeight,
      maxWidth: viewport.width - SLASH_POPUP_VIEWPORT_PADDING * 2,
    });
  });

  it('constrains oversized popup width to the viewport', () => {
    const narrowViewport = { width: 200, height: 600 };
    const anchor = { left: 50, top: 200, bottom: 220 };
    const widePopup = { width: 288, height: 100 };
    const maxWidth = narrowViewport.width - SLASH_POPUP_VIEWPORT_PADDING * 2;

    expect(getSlashPopupLayout(anchor, widePopup, narrowViewport)).toEqual({
      left: SLASH_POPUP_VIEWPORT_PADDING,
      top: anchor.bottom,
      maxHeight: narrowViewport.height - anchor.bottom - SLASH_POPUP_VIEWPORT_PADDING,
      maxWidth,
    });
  });
});
