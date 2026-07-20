export const NOTE_TEMPLATE_CURSOR_MARKER = '{{cursor}}';

export type NoteTemplateId = 'blank' | 'daily-planning' | 'daily-review' | 'meeting-notes';

export type NoteTemplate = {
  id: NoteTemplateId;
  label: string;
  description: string;
  content: string;
};

export type ResolvedNoteTemplate = {
  content: string;
  cursorOffset: number;
};

const withCursor = (content: string) => content.replace(NOTE_TEMPLATE_CURSOR_MARKER, '');

const resolveCursorOffset = (content: string): number => {
  const cursorOffset = content.indexOf(NOTE_TEMPLATE_CURSOR_MARKER);

  if (cursorOffset === -1) {
    return 0;
  }

  return cursorOffset;
};

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'blank',
    label: 'Blank',
    description: 'Start with an empty note.',
    content: '',
  },
  {
    id: 'daily-planning',
    label: 'Daily planning',
    description: 'Plan priorities, schedule, and focus for today.',
    content: `# Daily Planning

## Top priorities
- [ ] ${NOTE_TEMPLATE_CURSOR_MARKER}
- [ ]
- [ ]

## Schedule
| Time | Plan |
| --- | --- |
|  |  |

## Notes
`,
  },
  {
    id: 'daily-review',
    label: 'Daily review',
    description: 'Reflect on wins, challenges, and tomorrow.',
    content: `# Daily Review

## Wins
- ${NOTE_TEMPLATE_CURSOR_MARKER}

## Challenges
-

## Lessons learned
-

## Tomorrow
- [ ]
`,
  },
  {
    id: 'meeting-notes',
    label: 'Meeting notes',
    description: 'Capture agenda, discussion, and action items.',
    content: `# Meeting Notes

**Date:**
**Attendees:**

## Agenda
- ${NOTE_TEMPLATE_CURSOR_MARKER}

## Discussion
-

## Action items
- [ ]
`,
  },
];

export const getNoteTemplateById = (id: NoteTemplateId): NoteTemplate | undefined =>
  NOTE_TEMPLATES.find((template) => template.id === id);

export const resolveNoteTemplate = (id: NoteTemplateId): ResolvedNoteTemplate => {
  const template = getNoteTemplateById(id);

  if (!template) {
    return { content: '', cursorOffset: 0 };
  }

  return {
    content: withCursor(template.content),
    cursorOffset: resolveCursorOffset(template.content),
  };
};
