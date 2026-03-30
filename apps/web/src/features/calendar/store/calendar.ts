import { create } from 'zustand';

interface CalendarState {
  selectedDate: Date | null;
  displayedMonth: number;
  displayedYear: number;
  setSelectedDate: (selectedDate: Date | null) => void;
  setDisplayedDate: (displayedDate: Date) => void;
}

const initialDisplayedDate = new Date();

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: new Date(),
  displayedMonth: initialDisplayedDate.getMonth(),
  displayedYear: initialDisplayedDate.getFullYear(),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setDisplayedDate: (displayedDate) =>
    set({
      displayedMonth: displayedDate.getMonth(),
      displayedYear: displayedDate.getFullYear(),
    }),
}));
