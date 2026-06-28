import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  currentDoc: '',
  currentSelection: { anchor: 0, head: 0 },
  currentScrollTop: 0,
  currentScrollLeft: 0,
  mockView: null as null | ReturnType<typeof createMockView>,
  uploadNoteFileMock: vi.fn(),
}));

type ChangeSpec = { from: number; to: number; insert: string };

const mapPosThroughChange = (pos: number, change: ChangeSpec) => {
  if (pos <= change.from) return pos;
  if (pos >= change.to) return pos + (change.insert.length - (change.to - change.from));
  return change.from + change.insert.length;
};

const createMockView = (initialText: string, initialAnchor: number, initialScrollTop: number) => {
  hoisted.currentDoc = initialText;
  hoisted.currentSelection = { anchor: initialAnchor, head: initialAnchor };
  hoisted.currentScrollTop = initialScrollTop;
  hoisted.currentScrollLeft = 0;

  return {
    dom: { isConnected: true },
    scrollDOM: {
      get scrollTop() {
        return hoisted.currentScrollTop;
      },
      set scrollTop(value: number) {
        hoisted.currentScrollTop = value;
      },
      get scrollLeft() {
        return hoisted.currentScrollLeft;
      },
      set scrollLeft(value: number) {
        hoisted.currentScrollLeft = value;
      },
    },
    state: {
      get doc() {
        return { toString: () => hoisted.currentDoc };
      },
      get selection() {
        return {
          main: {
            anchor: hoisted.currentSelection.anchor,
            head: hoisted.currentSelection.head,
            from: Math.min(hoisted.currentSelection.anchor, hoisted.currentSelection.head),
            to: Math.max(hoisted.currentSelection.anchor, hoisted.currentSelection.head),
          },
        };
      },
    },
    dispatch: (spec: { changes?: ChangeSpec; selection?: { anchor: number; head?: number } }) => {
      if (spec.changes) {
        const { from, to, insert } = spec.changes;
        hoisted.currentDoc =
          hoisted.currentDoc.slice(0, from) + insert + hoisted.currentDoc.slice(to);

        if (spec.selection) {
          const head = spec.selection.head ?? spec.selection.anchor;
          hoisted.currentSelection = { anchor: spec.selection.anchor, head };
        } else {
          hoisted.currentSelection = {
            anchor: mapPosThroughChange(hoisted.currentSelection.anchor, spec.changes),
            head: mapPosThroughChange(hoisted.currentSelection.head, spec.changes),
          };
        }
      } else if (spec.selection) {
        const head = spec.selection.head ?? spec.selection.anchor;
        hoisted.currentSelection = { anchor: spec.selection.anchor, head };
      }
    },
    _setDocFromOutside: (nextText: string) => {
      hoisted.currentDoc = nextText;
      hoisted.currentSelection = { anchor: 0, head: 0 };
      hoisted.currentScrollTop = 0;
      hoisted.currentScrollLeft = 0;
    },
  };
};

vi.mock('@uiw/react-codemirror', () => {
  return {
    __esModule: true,
    default: function MockCodeMirror(props: {
      value: string;
      onCreateEditor?: (view: unknown) => void;
    }) {
      const { onCreateEditor, value } = props;

      React.useEffect(() => {
        if (!hoisted.mockView) return;
        if (typeof onCreateEditor === 'function') {
          onCreateEditor(hoisted.mockView as unknown);
        }
      }, [onCreateEditor]);

      React.useEffect(() => {
        if (!hoisted.mockView) return;
        if (value !== hoisted.currentDoc) {
          hoisted.mockView._setDocFromOutside(value);
        }
      }, [value]);

      return <div data-testid='codemirror' />;
    },
  };
});

vi.mock('@/hooks/useTailwindScreen', () => ({
  useTailwindScreen: () => 'md',
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/drawer', () => ({
  Drawer: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div>{children}</div> : null,
  DrawerContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DrawerDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DrawerTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/lib/supabase/client.ts', () => ({
  supabase: {},
}));

vi.mock('@/features/auth/store/auth.ts', () => ({
  useAuthStore: (selector: (state: { session: { user: { id: string } } }) => unknown) =>
    selector({ session: { user: { id: 'user-1' } } }),
}));

vi.mock('@/features/notes/lib/note-editor-file-upload.ts', async () => {
  const actual = await vi.importActual<
    typeof import('@/features/notes/lib/note-editor-file-upload.ts')
  >('@/features/notes/lib/note-editor-file-upload.ts');

  return {
    ...actual,
    uploadNoteFile: hoisted.uploadNoteFileMock,
  };
});

import { NoteEditorDialog } from '@/features/notes/components/note-editor-dialog';

describe('NoteEditorDialog file upload placeholder replacement', () => {
  beforeEach(() => {
    hoisted.uploadNoteFileMock.mockReset();
    hoisted.mockView = null;

    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: { randomUUID: () => 'token-1' },
    });
  });

  it('preserves selection and scroll on successful upload replacement', async () => {
    let resolveUpload: ((value: { markdown: string }) => void) | null = null;
    hoisted.uploadNoteFileMock.mockImplementation(
      () =>
        new Promise<{ markdown: string }>((resolve) => {
          resolveUpload = resolve;
        }),
    );

    const initialText = `Line 1\nLine 2\nLine 3\n`;
    hoisted.mockView = createMockView(initialText, 7, 120);

    const { getByTestId } = render(
      <NoteEditorDialog open initialContent={initialText} onOpenChange={() => undefined} />,
    );

    const file = new File(['abc'], 'photo.png', { type: 'image/png' });
    fireEvent.drop(getByTestId('codemirror'), {
      dataTransfer: {
        items: [{ kind: 'file', getAsFile: () => file }],
        files: [file],
      },
    });

    expect(hoisted.currentSelection.anchor).not.toBe(0);
    expect(hoisted.currentScrollTop).toBe(120);

    expect(resolveUpload).not.toBeNull();
    resolveUpload!({ markdown: '![photo](https://example.com/photo.png)' });

    await waitFor(() => {
      expect(hoisted.uploadNoteFileMock).toHaveBeenCalledTimes(1);
      expect(hoisted.currentDoc).toContain('https://example.com/photo.png');
    });

    expect(hoisted.currentSelection.anchor).not.toBe(0);
    expect(hoisted.currentScrollTop).toBe(120);
  });

  it('preserves selection and scroll on failed upload placeholder removal', async () => {
    hoisted.uploadNoteFileMock.mockRejectedValueOnce(new Error('Upload failed'));

    const initialText = `Alpha\nBeta\nGamma\n`;
    hoisted.mockView = createMockView(initialText, 8, 200);

    const { getByTestId } = render(
      <NoteEditorDialog open initialContent={initialText} onOpenChange={() => undefined} />,
    );

    const file = new File(['abc'], 'photo.png', { type: 'image/png' });
    fireEvent.drop(getByTestId('codemirror'), {
      dataTransfer: {
        items: [{ kind: 'file', getAsFile: () => file }],
        files: [file],
      },
    });

    await waitFor(() => {
      expect(hoisted.uploadNoteFileMock).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(hoisted.currentDoc).not.toContain('uploading://token-1');
    });

    expect(hoisted.currentSelection.anchor).not.toBe(0);
    expect(hoisted.currentScrollTop).toBe(200);
  });
});
