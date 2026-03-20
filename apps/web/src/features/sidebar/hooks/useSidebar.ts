import { useSidebarStore } from '@/features/sidebar/store/sidebar.ts';

export const useSidebar = () => {
  const isVisible = useSidebarStore((s) => s.isVisible);
  const toggle = useSidebarStore((s) => s.toggle);
  const setVisible = useSidebarStore((s) => s.setVisible);
  return { isVisible, toggle, setVisible };
};
