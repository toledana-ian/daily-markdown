import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NoteEditorDialog } from '@/features/notes/components/note-editor-dialog.tsx';

const codeMirrorMock = vi.hoisted(() => vi.fn());

vi.mock('@uiw/react-codemirror', () => ({
  default: (props: { className?: string }) => {
    codeMirrorMock(props);
    return <div aria-label='Markdown editor mock' data-testid='codemirror-mock' />;
  },
}));

describe('NoteEditorDialog', () => {
  it('passes wrapping styles to the markdown editor to avoid horizontal overflow', () => {
    window.innerWidth = 1280;

    render(
      <NoteEditorDialog initialContent='' onOpenChange={() => undefined} open onSave={() => undefined} />,
    );

    expect(screen.getByTestId('codemirror-mock')).toBeInTheDocument();
    expect(codeMirrorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        className: expect.stringContaining('[&_.cm-content]:whitespace-pre-wrap'),
      }),
    );
    expect(codeMirrorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        className: expect.stringContaining('[&_.cm-line]:break-words'),
      }),
    );
  });
});
