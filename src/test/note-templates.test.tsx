import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NoteTemplateChooser } from '@/features/notes/components/note-template-chooser';
import {
  NOTE_TEMPLATES,
  resolveNoteTemplate,
} from '@/features/notes/lib/note-templates';

describe('note templates', () => {
  it('includes the required built-in templates', () => {
    expect(NOTE_TEMPLATES.map((template) => template.id)).toEqual([
      'blank',
      'daily-planning',
      'daily-review',
      'meeting-notes',
    ]);
  });

  it('keeps blank template empty', () => {
    expect(resolveNoteTemplate('blank')).toEqual({
      content: '',
      cursorOffset: 0,
    });
  });

  it('returns markdown scaffolding for structured templates', () => {
    const planning = resolveNoteTemplate('daily-planning');
    const review = resolveNoteTemplate('daily-review');
    const meeting = resolveNoteTemplate('meeting-notes');

    expect(planning.content).toContain('# Daily Planning');
    expect(planning.content).toContain('- [ ]');
    expect(planning.cursorOffset).toBeGreaterThan(0);

    expect(review.content).toContain('# Daily Review');
    expect(review.content).toContain('## Wins');

    expect(meeting.content).toContain('# Meeting Notes');
    expect(meeting.content).toContain('## Action items');
  });

  it('removes cursor markers from resolved template content', () => {
    for (const template of NOTE_TEMPLATES) {
      const resolved = resolveNoteTemplate(template.id);
      expect(resolved.content).not.toContain('{{cursor}}');
    }
  });
});

describe('NoteTemplateChooser', () => {
  it('requires an explicit template selection before continuing', () => {
    const onSelect = vi.fn();

    render(
      <NoteTemplateChooser onOpenChange={() => undefined} onSelect={onSelect} open />,
    );

    expect(screen.getByRole('listbox', { name: 'Note templates' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Blank/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    fireEvent.click(screen.getByRole('option', { name: /Meeting notes/i }));

    expect(onSelect).toHaveBeenCalledWith('meeting-notes');
  });

  it('supports keyboard selection', () => {
    const onSelect = vi.fn();

    render(
      <NoteTemplateChooser onOpenChange={() => undefined} onSelect={onSelect} open />,
    );

    const chooser = screen.getByText('Choose a starting point for your note.').parentElement!;

    fireEvent.keyDown(chooser, { key: 'ArrowDown' });
    fireEvent.keyDown(chooser, { key: 'ArrowDown' });
    fireEvent.keyDown(chooser, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith('daily-review');
  });
});
