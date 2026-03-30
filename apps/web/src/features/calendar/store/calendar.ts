import { create } from 'zustand';

interface CalendarState {
  selectedDate: Date | null;
  displayedDate: Date;
  setSelectedDate: (selectedDate: Date | null) => void;
  setDisplayedDate: (displayedDate: Date) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: new Date(),
  displayedDate: new Date(),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setDisplayedDate: (displayedDate) => set({ displayedDate }),
}));
