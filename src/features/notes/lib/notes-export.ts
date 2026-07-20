export const EXPORT_FORMAT_VERSION = '1';

/** PostgREST/Supabase default max rows per request. */
export const NOTES_EXPORT_PAGE_SIZE = 1000;

export interface NoteExportRow {
  id: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExportedNote {
  id: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotesExport {
  version: string;
  exportedAt: string;
  notes: ExportedNote[];
}

export type NotesPageFetcher = (
  rangeStart: number,
  rangeEnd: number,
) => Promise<{ data: NoteExportRow[] | null; error: { message: string } | null }>;

export const mapNoteExportRow = (row: NoteExportRow): ExportedNote => ({
  id: row.id,
  content: row.content,
  isPinned: row.is_pinned,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const buildNotesExport = (
  rows: NoteExportRow[],
  exportedAt: Date = new Date(),
): NotesExport => ({
  version: EXPORT_FORMAT_VERSION,
  exportedAt: exportedAt.toISOString(),
  notes: rows.map(mapNoteExportRow),
});

export const fetchAllNotesPaginated = async (
  fetchPage: NotesPageFetcher,
  options?: { pageSize?: number },
): Promise<NoteExportRow[]> => {
  const pageSize = options?.pageSize ?? NOTES_EXPORT_PAGE_SIZE;
  const allNotes: NoteExportRow[] = [];
  let page = 0;

  while (true) {
    const rangeStart = page * pageSize;
    const rangeEnd = rangeStart + pageSize - 1;
    const { data, error } = await fetchPage(rangeStart, rangeEnd);

    if (error) {
      throw new Error(error.message || 'Failed to fetch notes');
    }

    const rows = data ?? [];
    allNotes.push(...rows);

    if (rows.length < pageSize) {
      break;
    }

    page += 1;
  }

  return allNotes;
};

export const createExportFilename = (exportedAt: Date = new Date()): string => {
  const date = exportedAt.toISOString().slice(0, 10);
  return `daily-md-notes-export-${date}.json`;
};

export const downloadNotesExport = (
  exportData: NotesExport,
  exportedAt: Date = new Date(),
): void => {
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = createExportFilename(exportedAt);
    anchor.rel = 'noopener';
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }
};
