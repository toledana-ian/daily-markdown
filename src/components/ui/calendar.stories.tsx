import type { Meta, StoryObj } from '@storybook/react-vite';

import { Calendar } from './calendar';

const meta = {
  title: 'UI/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    mode: 'single',
    month: new Date('2026-03-01T00:00:00Z'),
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selected: new Date('2026-03-24T00:00:00Z'),
  },
};

export const RangeSelection: Story = {
  args: {
    mode: 'range',
    selected: {
      from: new Date('2026-03-18T00:00:00Z'),
      to: new Date('2026-03-24T00:00:00Z'),
    },
  },
};

export const WithWeekNumbers: Story = {
  args: {
    showWeekNumber: true,
    selected: new Date('2026-03-12T00:00:00Z'),
  },
};

export const DropdownCaption: Story = {
  args: {
    captionLayout: 'dropdown',
    fromYear: 2024,
    toYear: 2028,
    selected: new Date('2026-03-08T00:00:00Z'),
  },
};
