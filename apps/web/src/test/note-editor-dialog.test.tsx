import { act, createEvent, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NoteEditorDialog } from '@/features/notes/components/note-editor-dialog.tsx';

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/drawer', () => ({
  Drawer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DrawerContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DrawerDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DrawerTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/hooks/useTailwindScreen', () => ({
  useTailwindScreen: () => 'md',
}));

vi.mock('@uiw/react-codemirror', () => ({
  default: ({
    className,
  }: {
    className?: string;
  }) => <div aria-label='Markdown editor' className={className} />,
}));

describe('NoteEditorDialog file upload errors', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('hides the file upload error after 3 seconds', () => {
    render(
      <NoteEditorDialog initialContent='' onOpenChange={() => undefined} open />
    );

    const editor = screen.getByLabelText('Markdown editor');
    const largeFile = new File([new Uint8Array(11 * 1024 * 1024)], 'large.png', {
      type: 'image/png',
    });
    const pasteEvent = createEvent.paste(editor);

    Object.defineProperty(pasteEvent, 'clipboardData', {
      value: {
        items: [
          {
            kind: 'file',
            getAsFile: () => largeFile,
          },
        ],
      },
    });

    fireEvent(editor, pasteEvent);

    expect(screen.getByText('Files larger than 10 MB cannot be uploaded.')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2999);
    });

    expect(screen.getByText('Files larger than 10 MB cannot be uploaded.')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(screen.queryByText('Files larger than 10 MB cannot be uploaded.')).not.toBeInTheDocument();
  });
});
