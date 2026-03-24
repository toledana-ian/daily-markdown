import { create } from 'zustand';

interface NoteDateState {
  selectedDate: Date | undefined;
  setSelectedDate: (selectedDate: Date | undefined) => void;
}

export const useNoteDateStore = create<NoteDateState>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
}));
