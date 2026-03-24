import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { NoteCard } from './note-card';

const meta = {
  title: 'Features/Notes/NoteCard',
  component: NoteCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className='bg-slate-50 p-6'>
        <Story />
      </div>
    ),
  ],
  args: {
    content:
      '## Sprint notes\n\n- Ship Storybook coverage\n- Review auth flow\n- Polish note dialogs',
    onSave: fn(),
  },
} satisfies Meta<typeof NoteCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    content: '',
  },
};
