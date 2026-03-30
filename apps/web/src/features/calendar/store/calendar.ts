import { create } from 'zustand';

interface CalendarState {
  selectedDate: Date | null;
  setSelectedDate: (selectedDate: Date | null) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
}));
