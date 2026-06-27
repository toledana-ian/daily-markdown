import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { CreateNote } from './create-note';

const meta = {
  title: 'Features/Notes/CreateNote',
  component: CreateNote,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className='w-full max-w-md bg-slate-50 p-6'>
        <Story />
      </div>
    ),
  ],
  args: {
    onSave: fn(),
  },
} satisfies Meta<typeof CreateNote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
