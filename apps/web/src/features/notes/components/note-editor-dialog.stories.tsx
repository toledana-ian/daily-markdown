import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from '@/components/ui/button';
import { NoteEditorDialog } from './note-editor-dialog';

const meta = {
  title: 'Features/Notes/NoteEditorDialog',
  component: NoteEditorDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    initialContent: '## Draft note\n\nStart writing here.',
    onSave: fn(),
  },
} satisfies Meta<typeof NoteEditorDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function NoteEditorDialogPreview({
  initialContent,
  onSave,
}: {
  initialContent: string;
  onSave?: (data: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open editor</Button>
      <NoteEditorDialog
        initialContent={initialContent}
        open={open}
        onOpenChange={setOpen}
        onSave={onSave}
      />
    </>
  );
}

export const Default: Story = {
  args: {
    initialContent: '## Draft note\n\nStart writing here.',
    open: false,
    onOpenChange: fn(),
    onSave: fn(),
  },
  render: (args) => (
    <NoteEditorDialogPreview initialContent={args.initialContent} onSave={args.onSave} />
  ),
};
