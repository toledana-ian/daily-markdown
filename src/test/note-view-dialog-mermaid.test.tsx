import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NoteViewDialog } from '@/features/notes/components/note-view-dialog';

vi.mock('@streamdown/mermaid', () => ({
  mermaid: {
    name: 'mermaid',
    type: 'diagram',
    language: 'mermaid',
    getMermaid: () => ({
      initialize: () => undefined,
      render: async () => ({
        svg: '<svg viewBox="0 0 100 50" style="max-width: 100px;"><g></g></svg>',
      }),
    }),
  },
}));

const content = ['Intro paragraph', '', '```mermaid', 'graph TD', '  A --> B', '```'].join('\n');

const renderDialog = () => {
  const onEdit = vi.fn();
  render(<NoteViewDialog content={content} onEdit={onEdit} onOpenChange={vi.fn()} open />);
  return { onEdit };
};

describe('NoteViewDialog Mermaid double-click', () => {
  it('still enters edit mode when double-clicking regular note content', async () => {
    const { onEdit } = renderDialog();

    fireEvent.doubleClick(await screen.findByText('Intro paragraph'));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('does not enter edit mode when double-clicking the inline Mermaid block', async () => {
    const { onEdit } = renderDialog();

    await waitFor(() =>
      expect(document.querySelector('[data-streamdown="mermaid-block"]')).toBeInTheDocument(),
    );
    const block = document.querySelector('[data-streamdown="mermaid-block"]')!;

    fireEvent.doubleClick(block);
    fireEvent.doubleClick(block.querySelector('[data-streamdown="mermaid-block-actions"]')!);

    expect(onEdit).not.toHaveBeenCalled();
  });

  it('does not enter edit mode when double-clicking the portaled fullscreen diagram', async () => {
    const { onEdit } = renderDialog();

    fireEvent.click(await screen.findByTitle('View fullscreen'));

    const chart = await waitFor(() => {
      const fullscreenChart = Array.from(
        document.querySelectorAll('[data-streamdown="mermaid"] [aria-label="Mermaid chart"]'),
      ).find((el) => !el.closest('[data-streamdown="mermaid-block"]'));
      expect(fullscreenChart?.querySelector('svg')).toBeTruthy();
      return fullscreenChart!;
    });

    fireEvent.doubleClick(chart.querySelector('svg')!);
    fireEvent.doubleClick(screen.getByTitle('Zoom in'));

    expect(onEdit).not.toHaveBeenCalled();
  });
});
