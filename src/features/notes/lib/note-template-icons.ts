import {
  RiBookLine,
  RiCalendarCheckLine,
  RiCalendarLine,
  RiCheckboxLine,
  RiFileLine,
  RiListCheck,
  RiStarLine,
  RiTeamLine,
} from '@remixicon/react';
import type { NoteTemplateIconKey } from '@/features/notes/lib/note-templates';

export const NOTE_TEMPLATE_ICON_COMPONENTS: Record<NoteTemplateIconKey, typeof RiFileLine> = {
  file: RiFileLine,
  calendar: RiCalendarLine,
  'calendar-check': RiCalendarCheckLine,
  team: RiTeamLine,
  list: RiListCheck,
  checklist: RiCheckboxLine,
  star: RiStarLine,
  book: RiBookLine,
};
