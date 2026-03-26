import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NoteEditorDialog } from '@/features/notes/components/note-editor-dialog';

describe('NoteEditorDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers();
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

    fireEvent.change(screen.getByLabelText(/markdown editor/i), {
      target: { value: 'Updated draft body' },
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

  it('keeps viewport-aware spacing at every size', () => {
    render(
      <NoteEditorDialog
        initialContent='Existing note'
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        open={true}
      />,
    );

    expect(screen.getByRole('dialog')).toHaveClass(
      'w-[calc(100%-2rem)]',
      'max-w-[min(80rem,calc(100%-2rem))]',
    );
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

    fireEvent.change(screen.getByLabelText(/markdown editor/i), {
      target: { value: 'Draft before close' },
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
});
