import { useCalendarStore } from '@/features/calendar/store/calendar.ts';

export const useCalendar = () => {
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate);

  return { selectedDate, setSelectedDate };
};
