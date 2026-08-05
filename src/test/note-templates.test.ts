import { describe, expect, it } from 'vitest';
import {
  BLANK_NOTE_TEMPLATE,
  NOTE_TEMPLATE_CURSOR_MARKER,
  mapNoteTemplateRow,
  resolveNoteTemplateContent,
} from '@/features/notes/lib/note-templates';

describe('resolveNoteTemplateContent', () => {
  it('returns empty content and zero cursor offset for blank templates', () => {
    expect(resolveNoteTemplateContent(BLANK_NOTE_TEMPLATE.content)).toEqual({
      content: '',
      cursorOffset: 0,
    });
  });

  it('removes cursor markers and returns the cursor offset', () => {
    const content = `# Title\n\n- [ ] ${NOTE_TEMPLATE_CURSOR_MARKER}\n`;

    expect(resolveNoteTemplateContent(content)).toEqual({
      content: '# Title\n\n- [ ] \n',
      cursorOffset: 15,
    });
  });
});

describe('mapNoteTemplateRow', () => {
  it('maps database rows and falls back to the default icon', () => {
    expect(
      mapNoteTemplateRow({
        id: 'template-id',
        user_id: 'user-id',
        name: 'Daily planning',
        description: 'Plan the day',
        icon: 'calendar',
        content: '# Plan',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      }),
    ).toEqual({
      id: 'template-id',
      name: 'Daily planning',
      description: 'Plan the day',
      icon: 'calendar',
      content: '# Plan',
    });
  });

  it('uses the file icon when the stored icon key is unknown', () => {
    expect(
      mapNoteTemplateRow({
        id: 'template-id',
        user_id: 'user-id',
        name: 'Notes',
        description: 'Generic notes',
        icon: 'unknown-icon',
        content: '',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      }).icon,
    ).toBe('file');
  });
});
