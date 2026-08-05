export const NOTE_TEMPLATE_CURSOR_MARKER = '{{cursor}}';

export type NoteTemplateIconKey =
  | 'file'
  | 'calendar'
  | 'calendar-check'
  | 'team'
  | 'list'
  | 'checklist'
  | 'star'
  | 'book';

export const NOTE_TEMPLATE_ICON_KEYS: NoteTemplateIconKey[] = [
  'file',
  'calendar',
  'calendar-check',
  'team',
  'list',
  'checklist',
  'star',
  'book',
];

export const DEFAULT_NOTE_TEMPLATE_ICON: NoteTemplateIconKey = 'file';

export const isNoteTemplateIconKey = (value: string): value is NoteTemplateIconKey =>
  NOTE_TEMPLATE_ICON_KEYS.includes(value as NoteTemplateIconKey);

export type NoteTemplate = {
  id: string;
  name: string;
  description: string;
  icon: NoteTemplateIconKey;
  content: string;
};

export const BLANK_NOTE_TEMPLATE: NoteTemplate = {
  id: 'blank',
  name: 'Blank',
  description: 'Start with an empty note.',
  icon: 'file',
  content: '',
};

export type ResolvedNoteTemplate = {
  content: string;
  cursorOffset: number;
};

export type NoteTemplateSelection = { kind: 'blank' } | { kind: 'user'; templateId: string };

export type NoteTemplateRow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  icon: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type NoteTemplateInput = {
  name: string;
  description: string;
  icon: NoteTemplateIconKey;
  content: string;
};

export const mapNoteTemplateRow = (row: NoteTemplateRow): NoteTemplate => ({
  id: row.id,
  name: row.name,
  description: row.description,
  icon: isNoteTemplateIconKey(row.icon) ? row.icon : DEFAULT_NOTE_TEMPLATE_ICON,
  content: row.content,
});

const withCursor = (content: string) => content.replaceAll(NOTE_TEMPLATE_CURSOR_MARKER, '');

const resolveCursorOffset = (content: string): number => {
  const cursorOffset = content.indexOf(NOTE_TEMPLATE_CURSOR_MARKER);

  if (cursorOffset === -1) {
    return 0;
  }

  return cursorOffset;
};

export const resolveNoteTemplateContent = (content: string): ResolvedNoteTemplate => ({
  content: withCursor(content),
  cursorOffset: resolveCursorOffset(content),
});
