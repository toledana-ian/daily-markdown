import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildNotesExport,
  createExportFilename,
  downloadNotesExport,
  EXPORT_FORMAT_VERSION,
  fetchAllNotesPaginated,
  type NoteExportRow,
} from '@/features/notes/lib/notes-export';

const sampleRow = (overrides: Partial<NoteExportRow> = {}): NoteExportRow => ({
  id: 'note-1',
  content: '# Hello',
  is_pinned: true,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
  ...overrides,
});

describe('buildNotesExport', () => {
  it('includes version metadata and mapped note fields', () => {
    const exportedAt = new Date('2026-07-20T03:42:00.000Z');
    const exportData = buildNotesExport([sampleRow()], exportedAt);

    expect(exportData.version).toBe(EXPORT_FORMAT_VERSION);
    expect(exportData.exportedAt).toBe('2026-07-20T03:42:00.000Z');
    expect(exportData.notes).toEqual([
      {
        id: 'note-1',
        content: '# Hello',
        isPinned: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
    ]);
  });
});

describe('fetchAllNotesPaginated', () => {
  it('fetches a single page when results fit within the page size', async () => {
    const fetchPage = vi.fn().mockResolvedValue({
      data: [sampleRow()],
      error: null,
    });

    const rows = await fetchAllNotesPaginated(fetchPage, { pageSize: 2 });

    expect(rows).toHaveLength(1);
    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(fetchPage).toHaveBeenCalledWith(0, 1);
  });

  it('paginates until a page returns fewer rows than the page size', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({
        data: [sampleRow({ id: 'note-1' }), sampleRow({ id: 'note-2' })],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [sampleRow({ id: 'note-3' })],
        error: null,
      });

    const rows = await fetchAllNotesPaginated(fetchPage, { pageSize: 2 });

    expect(rows.map((row) => row.id)).toEqual(['note-1', 'note-2', 'note-3']);
    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(fetchPage).toHaveBeenNthCalledWith(1, 0, 1);
    expect(fetchPage).toHaveBeenNthCalledWith(2, 2, 3);
  });

  it('throws when a page request fails', async () => {
    const fetchPage = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database unavailable' },
    });

    await expect(fetchAllNotesPaginated(fetchPage, { pageSize: 2 })).rejects.toThrow(
      'Database unavailable',
    );
  });
});

describe('createExportFilename', () => {
  it('uses an ISO date prefix in the filename', () => {
    expect(createExportFilename(new Date('2026-07-20T15:30:00.000Z'))).toBe(
      'daily-md-notes-export-2026-07-20.json',
    );
  });
});

describe('downloadNotesExport', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('downloads pretty-printed JSON via a temporary object URL', () => {
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:export');
    const revokeObjectURL = vi.fn();
    const click = vi.fn();

    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    });

    const anchor = document.createElement('a');
    const createElement = vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    const clickSpy = vi.spyOn(anchor, 'click').mockImplementation(click);

    const exportedAt = new Date('2026-07-20T03:42:00.000Z');
    const exportData = buildNotesExport([sampleRow()], exportedAt);

    downloadNotesExport(exportData, exportedAt);

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0]?.[0];
    expect(blob).toBeInstanceOf(Blob);
    expect((blob as Blob).type).toBe('application/json');

    expect(createElement).toHaveBeenCalledWith('a');
    expect(anchor.download).toBe('daily-md-notes-export-2026-07-20.json');
    expect(anchor.rel).toBe('noopener');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:export');
  });
});
