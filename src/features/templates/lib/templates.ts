export const TEMPLATE_CURSOR_MARKER = '{{cursor}}';

export type TemplateIconKey =
  | 'file'
  | 'calendar'
  | 'calendar-check'
  | 'team'
  | 'list'
  | 'checklist'
  | 'star'
  | 'book';

export const TEMPLATE_ICON_KEYS: TemplateIconKey[] = [
  'file',
  'calendar',
  'calendar-check',
  'team',
  'list',
  'checklist',
  'star',
  'book',
];

export const DEFAULT_TEMPLATE_ICON: TemplateIconKey = 'file';

export const isTemplateIconKey = (value: string): value is TemplateIconKey =>
  TEMPLATE_ICON_KEYS.includes(value as TemplateIconKey);

export type Template = {
  id: string;
  name: string;
  description: string;
  icon: TemplateIconKey;
  content: string;
};

export const BLANK_TEMPLATE: Template = {
  id: 'blank',
  name: 'Blank',
  description: 'Start with an empty note.',
  icon: 'file',
  content: '',
};

export type ResolvedTemplate = {
  content: string;
  cursorOffset: number;
};

export type TemplateSelection = { kind: 'blank' } | { kind: 'user'; templateId: string };

export type TemplateRow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  icon: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type TemplateInput = {
  name: string;
  description: string;
  icon: TemplateIconKey;
  content: string;
};

export const mapTemplateRow = (row: TemplateRow): Template => ({
  id: row.id,
  name: row.name,
  description: row.description,
  icon: isTemplateIconKey(row.icon) ? row.icon : DEFAULT_TEMPLATE_ICON,
  content: row.content,
});

const withCursor = (content: string) => content.replaceAll(TEMPLATE_CURSOR_MARKER, '');

const resolveCursorOffset = (content: string): number => {
  const cursorOffset = content.indexOf(TEMPLATE_CURSOR_MARKER);

  if (cursorOffset === -1) {
    return 0;
  }

  return cursorOffset;
};

export const resolveTemplateContent = (content: string): ResolvedTemplate => ({
  content: withCursor(content),
  cursorOffset: resolveCursorOffset(content),
});
