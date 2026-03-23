import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateNote, type NoteEditorSaveData } from '@/features/notes/components/create-note';

describe('CreateNote', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens the full editor dialog and saves the current markdown payload', () => {
    const onSave = vi.fn<(data: NoteEditorSaveData) => void>();

    render(<CreateNote onSave={onSave} />);

    fireEvent.click(screen.getByText(/take a note/i));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/markdown editor/i), {
      target: { value: '# Hello world' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save note/i }));

    expect(onSave).toHaveBeenCalledWith({
      content: '# Hello world',
      html: '<h1>Hello world</h1>\n',
    });
  });

  it('autosaves every 30 seconds with the latest markdown payload', () => {
    const onSave = vi.fn<(data: NoteEditorSaveData) => void>();

    render(<CreateNote onSave={onSave} />);

    fireEvent.click(screen.getByText(/take a note/i));
    fireEvent.change(screen.getByLabelText(/markdown editor/i), {
      target: { value: 'Initial body' },
    });

    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(onSave).toHaveBeenNthCalledWith(1, {
      content: 'Initial body',
      html: '<p>Initial body</p>\n',
    });

    fireEvent.change(screen.getByLabelText(/markdown editor/i), {
      target: { value: 'Updated body' },
    });

    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(onSave).toHaveBeenNthCalledWith(2, {
      content: 'Updated body',
      html: '<p>Updated body</p>\n',
    });
  });
});
