import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from '@/components/ui/button';
import { NoteViewDialog } from './note-view-dialog';

const meta = {
  title: 'Features/Notes/NoteViewDialog',
  component: NoteViewDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    content:
      '# View note\n\nDouble-click the preview to trigger edit mode.\n\n- Capture intent\n- Refine content\n- Save changes',
  },
} satisfies Meta<typeof NoteViewDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function NoteViewDialogPreview({ content }: { content: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant='outline'>
        Open preview
      </Button>
      <NoteViewDialog content={content} open={open} onOpenChange={setOpen} onEdit={() => {}} />
    </>
  );
}

export const Default: Story = {
  args: {
    content:
      '# View note\n\nDouble-click the preview to trigger edit mode.\n\n- Capture intent\n- Refine content\n- Save changes',
    open: false,
    onOpenChange: fn(),
    onEdit: fn(),
  },
  render: (args) => <NoteViewDialogPreview content={args.content} />,
};
