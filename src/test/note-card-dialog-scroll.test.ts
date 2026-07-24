import { describe, expect, it } from 'vitest';
import {
  resolveEditorScrollTopOnOpen,
  resolveViewScrollTopOnEditorClose,
} from '@/features/notes/lib/note-card-dialog-scroll';

describe('note-card dialog scroll helpers', () => {
  it('copies preview scroll into editor scroll when opening from view', () => {
    expect(
      resolveEditorScrollTopOnOpen('view', {
        edit: 12,
        view: 480,
      }),
    ).toBe(480);
  });

  it('keeps the saved editor scroll when opening from the card', () => {
    expect(
      resolveEditorScrollTopOnOpen('closed', {
        edit: 120,
        view: 480,
      }),
    ).toBe(120);
  });

  it('copies editor scroll back into preview when closing to view', () => {
    expect(
      resolveViewScrollTopOnEditorClose('view', {
        edit: 360,
        view: 120,
      }),
    ).toBe(360);
  });

  it('does not change preview scroll when closing to the card', () => {
    expect(
      resolveViewScrollTopOnEditorClose('closed', {
        edit: 360,
        view: 120,
      }),
    ).toBeNull();
  });
});
