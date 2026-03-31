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

const getThumbnailSvgFromMarkdown = (markdown: string) => {
  const match = /!\[[^\]]*]\((data:image\/svg\+xml(?:;base64)?,[^)]+)\)/.exec(markdown);

  if (!match) {
    throw new Error('Missing thumbnail data URL');
  }

  const dataUrl = match[1];

  if (dataUrl.startsWith('data:image/svg+xml;base64,')) {
    return Buffer.from(dataUrl.replace('data:image/svg+xml;base64,', ''), 'base64').toString('utf-8');
  }

  return decodeURIComponent(dataUrl.replace('data:image/svg+xml;charset=utf-8,', ''));
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

  it('renders file icon thumbnails as svg data urls', () => {
    const markdown = createFileMarkdown('Quarterly Report', 'https://example.com/report.pdf', 'pdf');
    const svg = getThumbnailSvgFromMarkdown(markdown);
    const embeddedIconTag = svg.match(/<svg x="34" y="26"[^>]+>/)?.[0];

    expect(markdown).toContain('data:image/svg+xml;base64,');
    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox="0 0 40 48"');
    expect(svg).toContain('>PDF<');
    expect(embeddedIconTag?.match(/\bwidth=/g)).toHaveLength(1);
  });

  it('keeps the default width for short titles and expands for long titles', () => {
    const shortSvg = getThumbnailSvgFromMarkdown(
      createFileMarkdown('Quarterly Report', 'https://example.com/report.pdf', 'pdf'),
    );
    const longSvg = getThumbnailSvgFromMarkdown(
      createFileMarkdown(
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        'https://example.com/report.txt',
        'txt',
      ),
    );

    expect(shortSvg).toContain('width="320"');
    expect(shortSvg).toContain('viewBox="0 0 320 160"');
    expect(longSvg).not.toContain('width="320"');
    expect(longSvg).not.toContain('viewBox="0 0 320 160"');
    expect(longSvg).toMatch(/<rect width="(\d+)" height="160" rx="20" fill="#f8fafc"\/>/);
    expect(longSvg).toMatch(/<rect x="20" y="20" width="(\d+)" height="120" rx="16" fill="#e2e8f0"\/>/);
  });

  it('renders distinct react-file-icon variants for common file types and a fallback for unknown types', () => {
    const pdfSvg = getThumbnailSvgFromMarkdown(
      createFileMarkdown('Quarterly Report', 'https://example.com/report.pdf', 'pdf'),
    );
    const docSvg = getThumbnailSvgFromMarkdown(
      createFileMarkdown('Offer Letter', 'https://example.com/offer.docx', 'docx'),
    );
    const zipSvg = getThumbnailSvgFromMarkdown(
      createFileMarkdown('Archive', 'https://example.com/archive.zip', 'zip'),
    );
    const unknownSvg = getThumbnailSvgFromMarkdown(
      createFileMarkdown('Blob', 'https://example.com/blob.xyz', 'xyz'),
    );

    expect(pdfSvg).toContain('#D93831');
    expect(docSvg).toContain('#2C5898');
    expect(zipSvg).toContain('>ZIP<');
    expect(unknownSvg).toContain('>XYZ<');
    expect(pdfSvg).not.toBe(docSvg);
  });
});
