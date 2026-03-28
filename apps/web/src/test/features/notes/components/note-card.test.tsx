import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { useEffect, useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@uiw/react-codemirror', () => {
  type MockEditorView = {
    state: {
      doc: {
        lineAt: (pos: number) => { from: number; to: number };
        sliceString: (from: number, to: number) => string;
        lines: number;
        toString: () => string;
      };
      selection: {
        main: {
          head: number;
        };
      };
    };
    dispatch: (transaction: {
      changes?: { from: number; to: number; insert: string };
      selection?: { anchor: number };
    }) => void;
    focus: () => void;
    coordsAtPos: (pos: number) => { left: number; top: number; bottom: number };
  };

  const createDoc = (getValue: () => string) => ({
    lineAt(pos: number) {
      const value = getValue();
      const start = value.lastIndexOf('\n', Math.max(pos - 1, 0)) + 1;
      const nextNewline = value.indexOf('\n', pos);
      const end = nextNewline === -1 ? value.length : nextNewline;

      return { from: start, to: end };
    },
    sliceString(from: number, to: number) {
      return getValue().slice(from, to);
    },
    get lines() {
      return getValue().split('\n').length;
    },
    toString() {
      return getValue();
    },
  });

  function MockCodeMirror(props: {
    className?: string;
    onChange?: (value: string, viewUpdate: { view: MockEditorView }) => void;
    onCreateEditor?: (view: MockEditorView) => void;
    onUpdate?: (viewUpdate: { view: MockEditorView; selectionSet?: boolean; docChanged?: boolean }) => void;
    value: string;
  }) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const valueRef = useRef(props.value);
    const selectionRef = useRef(props.value.length);
    const viewRef = useRef<MockEditorView | null>(null);

    valueRef.current = props.value;

    if (!viewRef.current) {
      viewRef.current = {
        state: {
          doc: createDoc(() => valueRef.current),
          selection: {
            main: {
              head: selectionRef.current,
            },
          },
        },
        dispatch: ({ changes, selection }) => {
          if (changes) {
            valueRef.current =
              valueRef.current.slice(0, changes.from) +
              changes.insert +
              valueRef.current.slice(changes.to);
          }

          if (selection) {
            selectionRef.current = selection.anchor;
            viewRef.current!.state.selection.main.head = selection.anchor;
          }
        },
        focus: () => {
          textareaRef.current?.focus();
        },
        coordsAtPos: (pos: number) => ({
          left: 100 + pos * 8,
          top: 120,
          bottom: 140,
        }),
      };
    }

    useEffect(() => {
      props.onCreateEditor?.(viewRef.current!);
    }, [props]);

    return (
      <textarea
        aria-label='Markdown editor'
        className={props.className}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          const nextSelection = event.currentTarget.selectionStart ?? nextValue.length;

          valueRef.current = nextValue;
          selectionRef.current = nextSelection;
          viewRef.current!.state.selection.main.head = nextSelection;

          props.onChange?.(nextValue, { view: viewRef.current! });
        }}
        onSelect={() => {
          props.onUpdate?.({
            view: viewRef.current!,
            selectionSet: true,
            docChanged: false,
          });
        }}
        ref={textareaRef}
        value={props.value}
      />
    );
  }

  return {
    default: MockCodeMirror,
  };
});

import { NoteCard } from '@/features/notes/components/note-card';

describe('NoteCard', () => {
  it('opens the view dialog on click and renders markdown preview', () => {
    render(<NoteCard content='# Daily note\n\nBody copy' />);

    fireEvent.click(screen.getByRole('button', { name: /open note/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      within(screen.getByRole('document', { name: /preview note/i })).getByRole('heading', {
        name: /daily note/i,
      }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('document', { name: /preview note/i })).getByText(/body copy/i),
    ).toBeInTheDocument();
  });

  it('opens the editor dialog on double click from the note card', () => {
    render(<NoteCard content='Editable body' />);

    fireEvent.doubleClick(screen.getByRole('button', { name: /open note/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/markdown editor/i)).toHaveValue('Editable body');
    expect(screen.queryByText(/preview note/i)).not.toBeInTheDocument();
  });

  it('switches from the view dialog to the editor dialog on double click', () => {
    const onSave = vi.fn();

    render(<NoteCard content='Editable from preview' onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: /open note/i }));
    fireEvent.doubleClick(screen.getByRole('document', { name: /preview note/i }));

    expect(screen.getByLabelText(/markdown editor/i)).toHaveValue('Editable from preview');
    expect(screen.queryByRole('document', { name: /preview note/i })).not.toBeInTheDocument();
  });

  it('opens view from the context menu', () => {
    render(<NoteCard content='Menu actions note' />);

    fireEvent.contextMenu(screen.getByRole('button', { name: /open note/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /view/i }));

    expect(screen.getByRole('document', { name: /preview note/i })).toBeInTheDocument();
  });

  it('opens edit from the context menu', () => {
    render(<NoteCard content='Menu actions note' />);

    fireEvent.contextMenu(screen.getByRole('button', { name: /open note/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /edit/i }));

    expect(screen.getByLabelText(/markdown editor/i)).toHaveValue('Menu actions note');
  });

  it('renders delete as a destructive context menu action and confirms before deleting', () => {
    const onDelete = vi.fn();

    render(<NoteCard content='Delete me' onDelete={onDelete} />);

    fireEvent.contextMenu(screen.getByRole('button', { name: /open note/i }));

    const deleteMenuItem = screen.getByRole('menuitem', { name: /delete/i });
    expect(deleteMenuItem).toHaveAttribute('data-variant', 'destructive');

    fireEvent.click(deleteMenuItem);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/delete note/i)).toBeInTheDocument();
    expect(
      screen.getByText(/this action cannot be undone and will permanently remove this note/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onDelete).not.toHaveBeenCalled();

    cleanup();
    render(<NoteCard content='Delete me' onDelete={onDelete} />);

    fireEvent.contextMenu(screen.getByRole('button', { name: /open note/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /delete/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
