import { createFileRoute } from '@tanstack/react-router';
import { SharedNotePage } from '@/features/notes/pages/shared-note-page.tsx';

export const Route = createFileRoute('/_public/share/$shareId')({
  component: SharedNotePage,
});
