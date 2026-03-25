import { create } from 'zustand';

interface NoteDateState {
  selectedDate: Date | null;
  setSelectedDate: (selectedDate: Date | null) => void;
}

export const useNoteDateStore = create<NoteDateState>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
}));
