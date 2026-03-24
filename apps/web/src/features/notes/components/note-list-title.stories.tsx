import type { Meta, StoryObj } from '@storybook/react-vite';

import { NoteListTitle } from './note-list-title';

const meta = {
  title: 'Features/Notes/NoteListTitle',
  component: NoteListTitle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className='min-w-80 p-6 text-center'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NoteListTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Today: Story = {
  args: {
    date: new Date(),
    searchValue: '',
  },
};

export const SearchOnly: Story = {
  args: {
    date: undefined,
    searchValue: 'markdown',
  },
};

export const FilteredDate: Story = {
  args: {
    date: new Date('2026-03-18T00:00:00Z'),
    searchValue: 'meeting',
  },
};
