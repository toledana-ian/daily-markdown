import { describe, expect, it, vi } from 'vitest';

import { uploadNoteFile } from '@/features/notes/lib/note-editor-file-upload';

vi.mock('heic2any', () => {
  return {
    default: vi.fn(async () => new Blob(['jpeg'], { type: 'image/jpeg' })),
  };
});

type UploadFn = (
  path: string,
  file: File | Blob,
  options: {
    cacheControl: string;
    contentType: string;
    upsert: boolean;
  },
) => Promise<{ error: Error | null }>;

type GetPublicUrlFn = (path: string) => { data: { publicUrl: string } };

const createSupabaseMock = () => {
  const upload = vi.fn<UploadFn>(async () => ({ error: null }));
  const getPublicUrl = vi.fn<GetPublicUrlFn>((path) => ({
    data: { publicUrl: `https://example.supabase.test/storage/${encodeURIComponent(path)}` },
  }));

  return {
    upload,
    getPublicUrl,
    supabase: {
      storage: {
        from: vi.fn(() => ({ upload, getPublicUrl })),
      },
    },
  };
};

describe('uploadNoteFile', () => {
  it('uploads a normal image without converting', async () => {
    const { supabase, upload } = createSupabaseMock();

    const file = new File(['png'], 'hello.png', { type: 'image/png' });
    const result = await uploadNoteFile({
      bucket: 'note-images',
      file,
      now: () => new Date('2026-01-02T03:04:05.000Z'),
      randomId: () => 'abcd1234',
      supabase,
      userId: 'user-1',
    });

    expect(upload).toHaveBeenCalledTimes(1);
    const [path, uploadedFile, options] = upload.mock.calls[0]!;

    expect(path).toBe('user-1/20260102-030405-abcd1234-hello.png');
    expect(uploadedFile).toBeInstanceOf(File);
    expect((uploadedFile as File).name).toBe('hello.png');
    expect(options.contentType).toBe('image/png');

    expect(result.isImage).toBe(true);
    expect(result.alt).toBe('hello');
    expect(result.path).toBe(path);
    expect(result.markdown).toBe(`![hello](${result.publicUrl})`);
  });

  it('converts HEIC/HEIF uploads to JPEG before uploading', async () => {
    const { supabase, upload } = createSupabaseMock();

    const file = new File(['heic'], 'IMG_1234.HEIC', { type: 'image/heic' });
    const result = await uploadNoteFile({
      bucket: 'note-images',
      file,
      now: () => new Date('2026-01-02T03:04:05.000Z'),
      randomId: () => 'abcd1234',
      supabase,
      userId: 'user-1',
    });

    expect(upload).toHaveBeenCalledTimes(1);
    const [path, uploadedFile, options] = upload.mock.calls[0]!;

    expect(path).toBe('user-1/20260102-030405-abcd1234-img-1234.jpg');
    expect(uploadedFile).toBeInstanceOf(File);
    expect((uploadedFile as File).name).toBe('IMG_1234.jpg');
    expect(options.contentType).toBe('image/jpeg');

    expect(result.isImage).toBe(true);
    expect(result.alt).toBe('IMG_1234');
    expect(result.path).toBe(path);
    expect(result.markdown).toBe(`![IMG_1234](${result.publicUrl})`);
  });
});
