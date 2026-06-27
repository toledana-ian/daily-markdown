import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Tag } from './tag';

const meta = {
  title: 'Features/Tags/Tag',
  component: Tag,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    textContent: 'journal',
    onClick: fn(),
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongLabel: Story = {
  args: {
    textContent: 'daily-markdown-notes',
  },
};
