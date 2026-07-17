import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { NoteCardPreview } from '@/features/notes/components/note-card-preview';

describe('NoteCardPreview', () => {
  beforeAll(() => {
    class MockResizeObserver implements ResizeObserver {
      disconnect() {}

      observe() {}

      unobserve() {}
    }

    Object.defineProperty(globalThis, 'ResizeObserver', {
      writable: true,
      configurable: true,
      value: MockResizeObserver,
    });
  });

  it('blocks markdown interactions and opens the note via the overlay shield', () => {
    const onClick = vi.fn();
    const { container } = render(
      <NoteCardPreview
        content='- [ ] Task\n- [Example link](https://example.com)'
        onClick={onClick}
      />,
    );

    const shield = container.querySelector('.note-card-preview-interaction-shield');
    const markdownLayer = container.querySelector(
      '.note-card-preview-scroll > .pointer-events-none',
    );

    expect(shield).toBeInTheDocument();
    expect(markdownLayer).toBeInTheDocument();
    expect(screen.getByRole('link')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();

    fireEvent.click(shield!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('keeps the scroll indicator markup', () => {
    const { container } = render(<NoteCardPreview content='Scrollable note' onClick={() => {}} />);

    expect(container.querySelector('.note-card-preview-scroll-indicator')).toBeInTheDocument();
    expect(container.querySelector('.note-card-preview-scroll-thumb')).toBeInTheDocument();
  });
});
