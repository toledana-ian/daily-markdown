import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from './input';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    placeholder: 'Search notes',
    className: 'w-80',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    value: 'daily markdown',
    readOnly: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Disabled field',
    readOnly: true,
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search by title or tag',
  },
};
