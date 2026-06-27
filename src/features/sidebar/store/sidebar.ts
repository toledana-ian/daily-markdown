import { create } from 'zustand';

interface SidebarState {
  isVisible: boolean;
  toggle: () => void;
  setVisible: (visible: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isVisible: false,
  toggle: () => set((state) => ({ isVisible: !state.isVisible })),
  setVisible: (visible) => set({ isVisible: visible }),
}));
