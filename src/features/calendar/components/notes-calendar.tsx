import * as React from 'react';
import { format } from 'date-fns';
import type { DayButton } from 'react-day-picker';

import { Calendar, CalendarDayButton } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

//========== Types  ==========//
type NoteCountByDate = {
  date: Date;
  count: number;
};

type NoteCountsByDate = NoteCountByDate[];

type CalendarProps = React.ComponentProps<typeof Calendar>;

interface NotesCalendarProps extends Omit<
  CalendarProps,
  'components' | 'mode' | 'onSelect' | 'selected'
> {
  noteCountsByDate?: NoteCountsByDate;
  onSelect?: (date: Date | null) => void;
  selected?: Date | null;
}

const INTENSITY_STYLES: Record<number, string> = {
  0: 'text-foreground hover:border-[#6bc0c4] hover:bg-[rgba(107,192,196,0.15)]',
  1: 'bg-[#e6f7f8] text-[#0f4f52] hover:bg-[#d8f1f2]',
  2: 'bg-[#bfeaec] text-[#0c4447] hover:bg-[#acdfe2]',
  3: 'bg-[#8fd9dd] text-[#08393c] hover:bg-[#7fcfd4]',
  4: 'bg-[#4fc4c9] text-white hover:bg-[#white] hover:text-white',
  5: 'bg-[#2aa6ab] text-white hover:bg-[#24979b] hover:text-white',
};

//========== Helper Functions  ==========//

function getDateKey(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

function getIntensityLevel(noteCount: number) {
  if (noteCount <= 0) return 0;
  if (noteCount <= 3) return 1;
  if (noteCount <= 6) return 2;
  if (noteCount <= 9) return 3;
  if (noteCount <= 12) return 4;
  return 5;
}

function getNoteCountForDate(noteCountsByDate: NoteCountsByDate, date: Date) {
  const dateKey = getDateKey(date);

  return noteCountsByDate.find((entry) => getDateKey(entry.date) === dateKey)?.count ?? 0;
}

//========== Components  ==========//

export function NotesCalendar(props: NotesCalendarProps) {
  const {
    noteCountsByDate = [],
    onDayClick,
    onSelect,
    selected,
    month,
    defaultMonth,
    ...calendarProps
  } = props;
  const isControlled = Object.prototype.hasOwnProperty.call(props, 'selected');
  const [internalSelected, setInternalSelected] = React.useState<Date | null>(
    selected ?? new Date(),
  );

  const resolvedSelected = isControlled ? selected : internalSelected;

  const handleSelect = React.useCallback(
    (date: Date | undefined) => {
      const nextDate = date ?? null;
      if (!isControlled) {
        setInternalSelected(nextDate);
      }
      onSelect?.(nextDate);
    },
    [isControlled, onSelect],
  );

  return(
    <Calendar
      mode='single'
      selected={resolvedSelected ?? undefined}
      onSelect={handleSelect}
      month={month}
      defaultMonth={defaultMonth ?? resolvedSelected ?? new Date()}
      onDayClick={onDayClick}
      className='bg-transparent'
      components={{
        DayButton: (dayButtonProps) => (
          <NotesCalendarDayButton {...dayButtonProps} noteCountsByDate={noteCountsByDate} />
        ),
      }}
      {...calendarProps}
    />
  );
}

function NotesCalendarDayButton({
  className,
  day,
  modifiers,
  noteCountsByDate,
  ...props
}: React.ComponentProps<typeof DayButton> & {
  noteCountsByDate: NoteCountsByDate;
}) {
  const noteCount = getNoteCountForDate(noteCountsByDate, day.date);
  const intensityLevel = getIntensityLevel(noteCount);
  const isInteractive = !modifiers.disabled && !modifiers.outside;

  return (
    <CalendarDayButton
      day={day}
      modifiers={modifiers}
      data-intensity-level={intensityLevel}
      data-note-count={noteCount}
      className={cn(
        'transition-all duration-200',
        isInteractive && 'border border-transparent',
        isInteractive && !modifiers.selected && INTENSITY_STYLES[intensityLevel],
        isInteractive &&
          modifiers.today &&
          !modifiers.selected &&
          'border-2 border-[#6bc0c4] shadow-none',
        modifiers.outside &&
          'border-transparent bg-transparent text-[#9ca3af] hover:bg-transparent',
        modifiers.disabled &&
          'border-transparent bg-transparent text-[#9ca3af] hover:bg-transparent',
        modifiers.selected &&
          'border-[#0f766e] bg-[#0f766e] text-white shadow-[0_0_0_3px_rgba(107,192,196,0.3)] hover:bg-[#0b5f59]',
        className,
      )}
      {...props}
    />
  );
}