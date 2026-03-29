import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NoteCardMenu } from '@/features/notes/components/note-card-menu';

describe('NoteCardMenu', () => {
  it('renders note actions and forwards handlers', () => {
    const onView = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <NoteCardMenu onDelete={onDelete} onEdit={onEdit} onView={onView}>
        <button aria-label='Open note' type='button'>
          Open note
        </button>
      </NoteCardMenu>,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /open note/i }));

    fireEvent.click(screen.getByRole('menuitem', { name: /view/i }));
    expect(onView).toHaveBeenCalledTimes(1);

    fireEvent.contextMenu(screen.getByRole('button', { name: /open note/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledTimes(1);

    fireEvent.contextMenu(screen.getByRole('button', { name: /open note/i }));
    const deleteItem = screen.getByRole('menuitem', { name: /delete/i });
    expect(deleteItem).toHaveAttribute('data-variant', 'destructive');

    fireEvent.click(deleteItem);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
