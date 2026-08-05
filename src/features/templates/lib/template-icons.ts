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
import type { TemplateIconKey } from '@/features/templates/lib/templates';

export const TEMPLATE_ICON_COMPONENTS: Record<TemplateIconKey, typeof RiFileLine> = {
  file: RiFileLine,
  calendar: RiCalendarLine,
  'calendar-check': RiCalendarCheckLine,
  team: RiTeamLine,
  list: RiListCheck,
  checklist: RiCheckboxLine,
  star: RiStarLine,
  book: RiBookLine,
};
