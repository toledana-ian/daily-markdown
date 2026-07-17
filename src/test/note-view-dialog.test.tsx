import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NoteViewDialog } from '@/features/notes/components/note-view-dialog';

// Mirrors real usage: the parent owns `content` and feeds `onSave` results
// back down as a new `content` prop, which is what actually triggers the
// remount that the note-view-dialog has to stay contenteditable through.
function StatefulNoteViewDialog({ initialContent }: { initialContent: string }) {
  const [content, setContent] = useState(initialContent);
  return (
    <NoteViewDialog
      content={content}
      onEdit={vi.fn()}
      onOpenChange={vi.fn()}
      onSave={setContent}
      open
    />
  );
}

vi.mock('@/hooks/useTailwindScreen', () => ({
  useTailwindScreen: () => 'lg',
}));

describe('NoteViewDialog', () => {
  it('persists edits from contenteditable HTML tables via onSave', async () => {
    const onSave = vi.fn();
    const content = [
      'Intro',
      '<table contenteditable="true"><tr><td>Cell</td></tr></table>',
      'Outro',
    ].join('\n');

    render(
      <NoteViewDialog
        content={content}
        onEdit={vi.fn()}
        onOpenChange={vi.fn()}
        onSave={onSave}
        open
      />,
    );

    const cell = await screen.findByText('Cell');
    const table = cell.closest('table');
    expect(table).toHaveAttribute('contenteditable', 'true');

    cell.textContent = 'Updated';
    fireEvent.input(cell, { bubbles: true });
    fireEvent.focusOut(cell, { relatedTarget: document.body, bubbles: true });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    const saved = onSave.mock.calls[0]?.[0] as string;
    expect(saved).toContain('<table contenteditable="true">');
    expect(saved).toContain('Updated');
    expect(saved).toContain('Intro');
    expect(saved).toContain('Outro');
  });

  it('does not warn or leak markers when table cells also carry contenteditable', async () => {
    const errorSpy = vi.spyOn(console, 'error');
    const onSave = vi.fn();
    const content = [
      'Intro',
      '<table contenteditable="true"><tr><td contenteditable="true">Cell</td></tr></table>',
      'Outro',
    ].join('\n');

    render(
      <NoteViewDialog
        content={content}
        onEdit={vi.fn()}
        onOpenChange={vi.fn()}
        onSave={onSave}
        open
      />,
    );

    const cell = await screen.findByText('Cell');
    expect(errorSpy).not.toHaveBeenCalled();

    cell.textContent = 'Updated';
    fireEvent.input(cell, { bubbles: true });
    fireEvent.focusOut(cell, { relatedTarget: document.body, bubbles: true });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    const saved = onSave.mock.calls[0]?.[0] as string;
    expect(saved).not.toContain('data-content-editable');
    expect(saved).toContain('<td contenteditable="true">Updated</td>');
  });

  it('autosaves dirty table edits every 5 seconds without requiring blur', async () => {
    const onSave = vi.fn();
    const content = [
      'Intro',
      '<table contenteditable="true"><tr><td>Cell</td></tr></table>',
      'Outro',
    ].join('\n');

    vi.useFakeTimers();
    try {
      render(
        <NoteViewDialog
          content={content}
          onEdit={vi.fn()}
          onOpenChange={vi.fn()}
          onSave={onSave}
          open
        />,
      );

      const cell = screen.getByText('Cell');
      const table = cell.closest('table')!;

      // Let the dialog's own open-transition auto-focus settle before the
      // user (simulated) clicks into the table, so it doesn't compete with
      // our assertion on where focus ends up after the autosave interval.
      await act(() => vi.advanceTimersByTimeAsync(300));
      table.focus();

      cell.textContent = 'Updated';
      fireEvent.input(cell, { bubbles: true });

      expect(onSave).not.toHaveBeenCalled();

      await act(() => vi.advanceTimersByTimeAsync(5000));

      expect(onSave).toHaveBeenCalledTimes(1);
      const saved = onSave.mock.calls[0]?.[0] as string;
      expect(saved).toContain('Updated');

      // The autosave must not remount the preview and steal focus mid-edit.
      expect(document.activeElement).toBe(table);
    } finally {
      vi.useRealTimers();
    }
  });

  it('stays contenteditable after blur commits the edit and remounts the table', async () => {
    const content = [
      'Intro',
      '<table contenteditable="true"><tr><td>Cell</td></tr></table>',
      'Outro',
    ].join('\n');

    render(<StatefulNoteViewDialog initialContent={content} />);

    const cell = await screen.findByText('Cell');
    cell.textContent = 'Updated';
    fireEvent.input(cell, { bubbles: true });
    fireEvent.focusOut(cell, { relatedTarget: document.body, bubbles: true });

    await waitFor(() => {
      expect(screen.getByText('Updated')).toBeInTheDocument();
    });

    const table = screen.getByText('Updated').closest('table');
    expect(table).toHaveAttribute('contenteditable', 'true');
  });

  it('flushes a dirty table edit when the dialog closes, without blur or the autosave timer', async () => {
    const onSave = vi.fn();
    const content = [
      'Intro',
      '<table contenteditable="true"><tr><td>Cell</td></tr></table>',
      'Outro',
    ].join('\n');

    const { rerender } = render(
      <NoteViewDialog
        content={content}
        onEdit={vi.fn()}
        onOpenChange={vi.fn()}
        onSave={onSave}
        open
      />,
    );

    const cell = await screen.findByText('Cell');
    cell.textContent = 'Updated';
    fireEvent.input(cell, { bubbles: true });

    expect(onSave).not.toHaveBeenCalled();

    rerender(
      <NoteViewDialog
        content={content}
        onEdit={vi.fn()}
        onOpenChange={vi.fn()}
        onSave={onSave}
        open={false}
      />,
    );

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    const saved = onSave.mock.calls[0]?.[0] as string;
    expect(saved).toContain('Updated');
  });

  it('does not save blur on non-contenteditable tables', async () => {
    const onSave = vi.fn();
    const content = '<table><tr><td>Static</td></tr></table>';

    render(
      <NoteViewDialog
        content={content}
        onEdit={vi.fn()}
        onOpenChange={vi.fn()}
        onSave={onSave}
        open
      />,
    );

    const cell = await screen.findByText('Static');
    const table = cell.closest('table');
    expect(table).not.toHaveAttribute('contenteditable', 'true');

    cell.textContent = 'Changed';
    fireEvent.focusOut(table!, { relatedTarget: document.body });

    await waitFor(() => {
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  it('does not save blur on other contenteditable elements', async () => {
    const onSave = vi.fn();
    const content = '<div contenteditable="true">Editable text</div>';

    render(
      <NoteViewDialog
        content={content}
        onEdit={vi.fn()}
        onOpenChange={vi.fn()}
        onSave={onSave}
        open
      />,
    );

    const editable = await screen.findByText('Editable text');
    expect(editable).toHaveAttribute('contenteditable', 'true');

    editable.textContent = 'Changed';
    fireEvent.input(editable, { bubbles: true });
    fireEvent.focusOut(editable, { relatedTarget: document.body });

    await waitFor(() => {
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  it('still toggles checkboxes through onSave', async () => {
    const onSave = vi.fn();
    const content = '- [ ] Buy milk\n- [x] Walk dog';

    render(
      <NoteViewDialog
        content={content}
        onEdit={vi.fn()}
        onOpenChange={vi.fn()}
        onSave={onSave}
        open
      />,
    );

    const checkboxes = await screen.findAllByRole('checkbox');
    fireEvent.click(checkboxes[0]!);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    expect(onSave.mock.calls[0]?.[0]).toBe('- [x] Buy milk\n- [x] Walk dog');
  });

  it('opens the editor on double click', async () => {
    const onEdit = vi.fn();

    render(
      <NoteViewDialog
        content='Preview content'
        onEdit={onEdit}
        onOpenChange={vi.fn()}
        open
      />,
    );

    fireEvent.doubleClick(screen.getByRole('document', { name: 'Preview note' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
