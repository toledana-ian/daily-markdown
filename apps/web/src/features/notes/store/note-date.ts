import { create } from 'zustand';

interface NoteDateState {
  selectedDate: Date;
  setSelectedDate: (selectedDate: Date) => void;
}

export const useNoteDateStore = create<NoteDateState>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
}));
