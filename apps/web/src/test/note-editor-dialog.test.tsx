import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NoteEditorDialog } from '@/features/notes/components/note-editor-dialog.tsx';
import { useAuthStore } from '@/features/auth/store/auth.ts';

const codeMirrorMock = vi.hoisted(() => vi.fn());
const uploadNoteFileMock = vi.hoisted(() => vi.fn());
const createUploadingFileMarkdownMock = vi.hoisted(() =>
  vi.fn(() => '![Uploading image: test](uploading://token)'),
);
const replaceImagePlaceholderMock = vi.hoisted(() => vi.fn((_content, _placeholder, nextMarkdown) => nextMarkdown));
const editorViewMock = vi.hoisted(() => ({
  dispatch: vi.fn(),
  focus: vi.fn(),
  state: {
    doc: {
      toString: () => '',
    },
    selection: {
      main: {
        from: 0,
        to: 0,
      },
    },
  },
}));

vi.mock('@/features/notes/lib/note-editor-image-upload.ts', () => ({
  createUploadingFileMarkdown: createUploadingFileMarkdownMock,
  noteEditorFileUpload: {
    bucket: 'note-images',
  },
  replaceImagePlaceholder: replaceImagePlaceholderMock,
  uploadNoteFile: uploadNoteFileMock,
}));

vi.mock('@uiw/react-codemirror', () => ({
  default: (props: {
    basicSetup?: { closeBrackets?: boolean };
    className?: string;
    onCreateEditor?: (view: typeof editorViewMock) => void;
  }) => {
    useEffect(() => {
      props.onCreateEditor?.(editorViewMock);
    }, [props]);

    codeMirrorMock(props);
    return <div aria-label='Markdown editor mock' data-testid='codemirror-mock' />;
  },
}));

describe('NoteEditorDialog', () => {
  beforeEach(() => {
    codeMirrorMock.mockClear();
    uploadNoteFileMock.mockReset();
    createUploadingFileMarkdownMock.mockClear();
    replaceImagePlaceholderMock.mockClear();
    editorViewMock.dispatch.mockClear();
    editorViewMock.focus.mockClear();
    useAuthStore.setState({
      loading: false,
      session: {
        user: {
          id: 'user-1',
        },
      } as never,
    });
  });

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
    expect(codeMirrorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        basicSetup: expect.objectContaining({
          closeBrackets: false,
        }),
      }),
    );
  });

  it('uploads an image that is dropped onto the editor', async () => {
    window.innerWidth = 1280;
    uploadNoteFileMock.mockResolvedValue({
      markdown: '![Dropped](https://example.com/dropped.png)',
    });

    render(
      <NoteEditorDialog initialContent='' onOpenChange={() => undefined} open onSave={() => undefined} />,
    );

    const file = new File(['image-data'], 'Dropped.png', { type: 'image/png' });
    const editorShell = screen.getByTestId('codemirror-mock').parentElement;

    if (!editorShell) {
      throw new Error('Missing editor shell');
    }

    fireEvent.drop(editorShell, {
      dataTransfer: {
        files: [file],
        items: [
          {
            getAsFile: () => file,
            kind: 'file',
            type: 'image/png',
          },
        ],
      },
    });

    await waitFor(() => {
      expect(uploadNoteFileMock).toHaveBeenCalledWith(
        expect.objectContaining({
          bucket: 'note-images',
          file,
          supabase: expect.anything(),
          userId: 'user-1',
        }),
      );
    });
  });

  it('uploads a non-image file that is dropped onto the editor', async () => {
    window.innerWidth = 1280;
    uploadNoteFileMock.mockResolvedValue({
      markdown: '[![PDF](data:image/svg+xml;utf8,test)](https://example.com/report.pdf)\n[Open Quarterly Report.pdf](https://example.com/report.pdf)',
    });

    render(
      <NoteEditorDialog initialContent='' onOpenChange={() => undefined} open onSave={() => undefined} />,
    );

    const file = new File(['pdf-data'], 'Quarterly Report.pdf', { type: 'application/pdf' });
    const editorShell = screen.getByTestId('codemirror-mock').parentElement;

    if (!editorShell) {
      throw new Error('Missing editor shell');
    }

    fireEvent.drop(editorShell, {
      dataTransfer: {
        files: [file],
        items: [
          {
            getAsFile: () => file,
            kind: 'file',
            type: 'application/pdf',
          },
        ],
      },
    });

    await waitFor(() => {
      expect(uploadNoteFileMock).toHaveBeenCalledWith(
        expect.objectContaining({
          bucket: 'note-images',
          file,
          supabase: expect.anything(),
          userId: 'user-1',
        }),
      );
    });
  });
});
