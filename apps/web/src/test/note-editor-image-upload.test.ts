import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  createFileMarkdown,
  createImageMarkdown,
  replaceImagePlaceholder,
  uploadNoteFile,
  uploadNoteImage,
} from '@/features/notes/lib/note-editor-image-upload.ts';

const { upload, getPublicUrl } = vi.hoisted(() => ({
  upload: vi.fn(),
  getPublicUrl: vi.fn(),
}));

const storageBucket = {
  upload,
  getPublicUrl,
};

const supabase = {
  storage: {
    from: vi.fn(() => storageBucket),
  },
};

describe('note editor image upload', () => {
  beforeEach(() => {
    upload.mockReset();
    getPublicUrl.mockReset();
    supabase.storage.from.mockClear();
  });

  it('uploads a pasted image and returns markdown for the public file url', async () => {
    const file = new File(['image-data'], 'Sprint Plan.png', { type: 'image/png' });

    upload.mockResolvedValue({ data: { path: 'ignored' }, error: null });
    getPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://example.supabase.co/storage/v1/object/public/note-images/u1/a.png' },
    });

    const result = await uploadNoteImage({
      file,
      supabase,
      userId: 'u1',
      bucket: 'note-images',
      now: () => new Date('2026-03-31T10:20:30.000Z'),
      randomId: () => 'abc123',
    });

    expect(supabase.storage.from).toHaveBeenCalledWith('note-images');
    expect(upload).toHaveBeenCalledWith('u1/20260331-102030-abc123-sprint-plan.png', file, {
      cacheControl: '3600',
      contentType: 'image/png',
      upsert: false,
    });
    expect(result).toEqual({
      alt: 'Sprint Plan',
      markdown:
        '![Sprint Plan](https://example.supabase.co/storage/v1/object/public/note-images/u1/a.png)',
      path: 'u1/20260331-102030-abc123-sprint-plan.png',
      publicUrl: 'https://example.supabase.co/storage/v1/object/public/note-images/u1/a.png',
    });
  });

  it('replaces the upload placeholder once the final markdown is available', () => {
    const placeholder = '![Uploading image: Sprint Plan](uploading://abc123)';
    const finalMarkdown = createImageMarkdown(
      'Sprint Plan',
      'https://example.supabase.co/storage/v1/object/public/note-images/u1/a.png',
    );

    expect(
      replaceImagePlaceholder(`Before\n${placeholder}\nAfter`, placeholder, finalMarkdown),
    ).toBe(`Before\n${finalMarkdown}\nAfter`);
  });

  it('uploads a non-image file and returns linked thumbnail markdown for the public file url', async () => {
    const file = new File(['pdf-data'], 'Quarterly Report.pdf', { type: 'application/pdf' });

    upload.mockResolvedValue({ data: { path: 'ignored' }, error: null });
    getPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://example.supabase.co/storage/v1/object/public/note-images/u1/report.pdf' },
    });

    const result = await uploadNoteFile({
      file,
      supabase,
      userId: 'u1',
      bucket: 'note-images',
      now: () => new Date('2026-03-31T10:20:30.000Z'),
      randomId: () => 'abc123',
    });

    expect(supabase.storage.from).toHaveBeenCalledWith('note-images');
    expect(upload).toHaveBeenCalledWith('u1/20260331-102030-abc123-quarterly-report.pdf', file, {
      cacheControl: '3600',
      contentType: 'application/pdf',
      upsert: false,
    });
    expect(result).toEqual({
      alt: 'Quarterly Report',
      isImage: false,
      markdown: createFileMarkdown(
        'Quarterly Report',
        'https://example.supabase.co/storage/v1/object/public/note-images/u1/report.pdf',
        'pdf',
      ),
      path: 'u1/20260331-102030-abc123-quarterly-report.pdf',
      publicUrl: 'https://example.supabase.co/storage/v1/object/public/note-images/u1/report.pdf',
    });
  });
});
