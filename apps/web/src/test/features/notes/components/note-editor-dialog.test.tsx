import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect, useRef } from 'react';

const mockCursorCoords = {
  left: 100,
  top: 120,
  bottom: 140,
};

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
            const nextValue =
              valueRef.current.slice(0, changes.from) +
              changes.insert +
              valueRef.current.slice(changes.to);

            valueRef.current = nextValue;
          }

          if (selection) {
            selectionRef.current = selection.anchor;
            viewRef.current!.state.selection.main.head = selection.anchor;
          } else if (changes) {
            const head = changes.from + changes.insert.length;
            selectionRef.current = head;
            viewRef.current!.state.selection.main.head = head;
          }
        },
        focus: () => {
          textareaRef.current?.focus();
        },
        coordsAtPos: (pos: number) => ({
          left: mockCursorCoords.left + pos * 8,
          top: mockCursorCoords.top,
          bottom: mockCursorCoords.bottom,
        }),
      };
    }

    useEffect(() => {
      props.onCreateEditor?.(viewRef.current!);
    }, [props]);

    useEffect(() => {
      if (!textareaRef.current) return;

      const head = viewRef.current?.state.selection.main.head ?? props.value.length;
      textareaRef.current.setSelectionRange(head, head);
    }, [props.value]);

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
        onSelect={(event) => {
          const nextSelection = event.currentTarget.selectionStart ?? valueRef.current.length;

          selectionRef.current = nextSelection;
          viewRef.current!.state.selection.main.head = nextSelection;

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

import { NoteEditorDialog } from '@/features/notes/components/note-editor-dialog';

const setViewportWidth = (width: number) => {
  window.innerWidth = width;
  window.dispatchEvent(new Event('resize'));
};

describe('NoteEditorDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockCursorCoords.left = 100;
    mockCursorCoords.top = 120;
    mockCursorCoords.bottom = 140;
    setViewportWidth(1024);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('only autosaves while the dialog is open', () => {
    const onSave = vi.fn<(data: string) => void>();
    const onOpenChange = vi.fn<(open: boolean) => void>();
    const { rerender } = render(
      <NoteEditorDialog
        initialContent='Draft body'
        onOpenChange={onOpenChange}
        onSave={onSave}
        open={false}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(onSave).not.toHaveBeenCalled();

    rerender(
      <NoteEditorDialog
        initialContent='Draft body'
        onOpenChange={onOpenChange}
        onSave={onSave}
        open={true}
      />,
    );

    fireEvent.change(screen.getByRole('textbox', { name: /markdown editor/i }), {
      target: { value: 'Updated draft body', selectionStart: 18 },
    });

    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledWith('Updated draft body');

    rerender(
      <NoteEditorDialog
        initialContent='Draft body'
        onOpenChange={onOpenChange}
        onSave={onSave}
        open={false}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('does not autosave unchanged initial content', () => {
    const onSave = vi.fn<(data: string) => void>();
    const onOpenChange = vi.fn<(open: boolean) => void>();

    render(
      <NoteEditorDialog
        initialContent='Existing note'
        onOpenChange={onOpenChange}
        onSave={onSave}
        open={true}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it('keeps the current dialog width constraints', () => {
    render(
      <NoteEditorDialog
        initialContent='Existing note'
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        open={true}
      />,
    );

    expect(document.querySelector("[data-slot='dialog-content']")).toHaveClass(
      'w-[calc(100%-4rem)]',
      'max-w-5xl',
    );
  });

  it('renders a dialog on desktop', () => {
    render(
      <NoteEditorDialog
        initialContent='Existing note'
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        open={true}
      />,
    );

    expect(document.querySelector("[data-slot='dialog-content']")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='drawer-content']")).not.toBeInTheDocument();
  });

  it('renders a drawer on mobile', () => {
    setViewportWidth(640);

    render(
      <NoteEditorDialog
        initialContent='Existing note'
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        open={true}
      />,
    );

    expect(document.querySelector("[data-slot='drawer-content']")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='dialog-content']")).not.toBeInTheDocument();
  });

  it('saves the latest content when the dialog closes', () => {
    const onSave = vi.fn<(data: string) => void>();
    const onOpenChange = vi.fn<(open: boolean) => void>();
    const { rerender } = render(
      <NoteEditorDialog
        initialContent=''
        onOpenChange={onOpenChange}
        onSave={onSave}
        open={true}
      />,
    );

    fireEvent.change(screen.getByRole('textbox', { name: /markdown editor/i }), {
      target: { value: 'Draft before close', selectionStart: 18 },
    });

    rerender(
      <NoteEditorDialog
        initialContent=''
        onOpenChange={onOpenChange}
        onSave={onSave}
        open={false}
      />,
    );

    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledWith('Draft before close');
  });

  it('shows slash commands only at block start or after whitespace', () => {
    render(
      <NoteEditorDialog initialContent='' onOpenChange={vi.fn()} onSave={vi.fn()} open={true} />,
    );

    const editor = screen.getByRole('textbox', { name: /markdown editor/i });

    fireEvent.change(editor, {
      target: { value: 'hello/table', selectionStart: 11 },
    });
    expect(screen.queryByRole('listbox', { name: /slash commands/i })).not.toBeInTheDocument();

    fireEvent.change(editor, {
      target: { value: 'https://example.com/table', selectionStart: 25 },
    });
    expect(screen.queryByRole('listbox', { name: /slash commands/i })).not.toBeInTheDocument();

    fireEvent.change(editor, {
      target: { value: 'hello /ta', selectionStart: 9 },
    });

    expect(screen.getByRole('listbox', { name: /slash commands/i })).toBeInTheDocument();
    expect(screen.getByText('Insert markdown table')).toBeInTheDocument();
  });

  it('positions the slash command popup beside the cursor', () => {
    render(
      <NoteEditorDialog initialContent='' onOpenChange={vi.fn()} onSave={vi.fn()} open={true} />,
    );

    fireEvent.change(screen.getByRole('textbox', { name: /markdown editor/i }), {
      target: { value: '/ta', selectionStart: 3 },
    });

    const menu = screen.getByRole('listbox', { name: /slash commands/i });

    expect(menu).toHaveStyle({
      left: '124px',
      top: '140px',
    });
  });

  it('keeps the slash command popup aligned to the visible cursor when the editor scrolls', () => {
    mockCursorCoords.top = 24;
    mockCursorCoords.bottom = 44;

    render(
      <NoteEditorDialog initialContent='' onOpenChange={vi.fn()} onSave={vi.fn()} open={true} />,
    );

    fireEvent.change(screen.getByRole('textbox', { name: /markdown editor/i }), {
      target: { value: '/ta', selectionStart: 3 },
    });

    const menu = screen.getByRole('listbox', { name: /slash commands/i });

    expect(menu).toHaveStyle({
      left: '124px',
      top: '44px',
    });
  });

  it('closes the slash command popup when the cursor moves away from the slash command', () => {
    render(
      <NoteEditorDialog initialContent='' onOpenChange={vi.fn()} onSave={vi.fn()} open={true} />,
    );

    const editor = screen.getByRole('textbox', { name: /markdown editor/i }) as HTMLTextAreaElement;

    fireEvent.change(editor, {
      target: { value: '/ta rest', selectionStart: 3 },
    });

    expect(screen.getByRole('listbox', { name: /slash commands/i })).toBeInTheDocument();

    editor.setSelectionRange(8, 8);
    fireEvent.select(editor);

    expect(screen.queryByRole('listbox', { name: /slash commands/i })).not.toBeInTheDocument();
  });

  it('supports arrow keys, enter, and escape for slash commands', () => {
    render(
      <NoteEditorDialog initialContent='' onOpenChange={vi.fn()} onSave={vi.fn()} open={true} />,
    );

    const editor = screen.getByRole('textbox', { name: /markdown editor/i });

    fireEvent.change(editor, {
      target: { value: '/', selectionStart: 1 },
    });

    const menu = screen.getByRole('listbox', { name: /slash commands/i });
    expect(within(menu).getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(editor, { key: 'ArrowDown' });
    expect(within(menu).getByRole('option', { name: /compare-table/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    fireEvent.keyDown(editor, { key: 'ArrowUp' });
    expect(within(menu).getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(editor, { key: 'Escape' });
    expect(screen.queryByRole('listbox', { name: /slash commands/i })).not.toBeInTheDocument();

    fireEvent.change(editor, {
      target: { value: '/c', selectionStart: 2 },
    });
    fireEvent.keyDown(editor, { key: 'Enter' });

    expect(screen.queryByRole('listbox', { name: /slash commands/i })).not.toBeInTheDocument();
    expect(editor).toHaveValue(`| Before | After |
| --- | --- |
| Before value | After value |`);
  });

  it('lists the expanded slash command set', () => {
    render(
      <NoteEditorDialog initialContent='' onOpenChange={vi.fn()} onSave={vi.fn()} open={true} />,
    );

    const editor = screen.getByRole('textbox', { name: /markdown editor/i });

    fireEvent.change(editor, {
      target: { value: '/', selectionStart: 1 },
    });

    const menu = screen.getByRole('listbox', { name: /slash commands/i });

    expect(within(menu).getByText('/table')).toBeInTheDocument();
    expect(within(menu).getByText('/compare-table')).toBeInTheDocument();
    expect(within(menu).getByText('/checklist')).toBeInTheDocument();
    expect(within(menu).getByText('/code')).toBeInTheDocument();
    expect(within(menu).getByText('/divider')).toBeInTheDocument();
    expect(within(menu).getByText('/image')).toBeInTheDocument();
    expect(within(menu).getByText('/important')).toBeInTheDocument();
    expect(within(menu).getByText('/link')).toBeInTheDocument();
    expect(within(menu).getByText('/note')).toBeInTheDocument();
    expect(within(menu).getByText('/tip')).toBeInTheDocument();
    expect(within(menu).getByText('/warning')).toBeInTheDocument();
    expect(within(menu).getByText('/caution')).toBeInTheDocument();
    expect(within(menu).getByText('/mermaid')).toBeInTheDocument();
  });

  it('inserts a note callout from slash commands', () => {
    render(
      <NoteEditorDialog initialContent='' onOpenChange={vi.fn()} onSave={vi.fn()} open={true} />,
    );

    const editor = screen.getByRole('textbox', { name: /markdown editor/i }) as HTMLTextAreaElement;

    fireEvent.change(editor, {
      target: { value: '/no', selectionStart: 3 },
    });
    fireEvent.keyDown(editor, { key: 'Enter' });

    expect(editor.value).toBe(`> [!NOTE]
> `);
  });

  it('moves the cursor into the inserted template', () => {
    render(
      <NoteEditorDialog initialContent='' onOpenChange={vi.fn()} onSave={vi.fn()} open={true} />,
    );

    const editor = screen.getByRole('textbox', { name: /markdown editor/i }) as HTMLTextAreaElement;

    fireEvent.change(editor, {
      target: { value: '/ta', selectionStart: 3 },
    });
    fireEvent.keyDown(editor, { key: 'Enter' });

    expect(editor.value).toBe(`| Column 1 | Column 2 | Column 3 |
| --- | --- | --- |
|  |  |  |`);
  });

  it('inserts a mermaid block from slash commands', () => {
    render(
      <NoteEditorDialog initialContent='' onOpenChange={vi.fn()} onSave={vi.fn()} open={true} />,
    );

    const editor = screen.getByRole('textbox', { name: /markdown editor/i }) as HTMLTextAreaElement;

    fireEvent.change(editor, {
      target: { value: '/mer', selectionStart: 4 },
    });
    fireEvent.keyDown(editor, { key: 'Enter' });

    expect(editor.value).toBe(`\`\`\`mermaid

\`\`\``);
  });

  it('inserts a compare table from slash commands', () => {
    render(
      <NoteEditorDialog initialContent='' onOpenChange={vi.fn()} onSave={vi.fn()} open={true} />,
    );

    const editor = screen.getByRole('textbox', { name: /markdown editor/i }) as HTMLTextAreaElement;

    fireEvent.change(editor, {
      target: { value: '/compare', selectionStart: 8 },
    });
    fireEvent.keyDown(editor, { key: 'Enter' });

    expect(editor.value).toBe(`| Before | After |
| --- | --- |
| Before value | After value |`);
  });
});
