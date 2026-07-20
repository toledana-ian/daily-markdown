import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  NOTE_EDITOR_PREVIEW_EMPTY_MESSAGE,
  NoteEditorDialog,
} from '@/features/notes/components/note-editor-dialog';
import { useTailwindScreen } from '@/hooks/useTailwindScreen';

vi.mock('@/hooks/useTailwindScreen', () => ({
  useTailwindScreen: vi.fn(() => 'lg'),
}));

vi.mock('@uiw/react-codemirror', () => ({
  default: ({
    value,
    onChange,
    'aria-label': ariaLabel,
  }: {
    value: string;
    onChange?: (value: string) => void;
    'aria-label'?: string;
  }) => (
    <textarea
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));

vi.mock('@/components/common/markdown', () => ({
  Markdown: ({ content, emptyMessage }: { content: string; emptyMessage?: string }) => (
    <div data-testid='markdown-preview'>{content.trim() ? content : emptyMessage}</div>
  ),
}));

describe('NoteEditorDialog live preview', () => {
  beforeEach(() => {
    vi.mocked(useTailwindScreen).mockReturnValue('lg');
  });

  it('shows a desktop preview toggle with accessible labels', () => {
    render(
      <NoteEditorDialog initialContent='' onOpenChange={() => undefined} onSave={vi.fn()} open />,
    );

    const toggle = screen.getByRole('button', { name: 'Show live Markdown preview' });

    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByLabelText('Markdown preview')).not.toBeInTheDocument();
  });

  it('reveals a live preview panel without saving when toggled on', () => {
    const onSave = vi.fn();

    render(
      <NoteEditorDialog
        initialContent='# Hello'
        onOpenChange={() => undefined}
        onSave={onSave}
        open
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show live Markdown preview' }));

    expect(screen.getByLabelText('Markdown preview')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-preview')).toHaveTextContent('# Hello');
    expect(screen.getByRole('button', { name: 'Hide live Markdown preview' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows an empty preview state for blank content', () => {
    render(
      <NoteEditorDialog initialContent='' onOpenChange={() => undefined} onSave={vi.fn()} open />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show live Markdown preview' }));

    expect(screen.getByTestId('markdown-preview')).toHaveTextContent(
      NOTE_EDITOR_PREVIEW_EMPTY_MESSAGE,
    );
  });

  it('toggles preview with the keyboard shortcut on desktop', () => {
    render(
      <NoteEditorDialog initialContent='' onOpenChange={() => undefined} onSave={vi.fn()} open />,
    );

    fireEvent.keyDown(window, { key: 'p', ctrlKey: true, shiftKey: true });

    expect(screen.getByLabelText('Markdown preview')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'p', ctrlKey: true, shiftKey: true });

    expect(screen.queryByLabelText('Markdown preview')).not.toBeInTheDocument();
  });

  it('does not show the preview toggle on mobile', () => {
    vi.mocked(useTailwindScreen).mockReturnValue('sm');

    render(
      <NoteEditorDialog initialContent='' onOpenChange={() => undefined} onSave={vi.fn()} open />,
    );

    expect(
      screen.queryByRole('button', { name: /live Markdown preview/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Markdown editor' })).toBeInTheDocument();
  });
});
