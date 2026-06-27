import type { Meta, StoryObj } from '@storybook/react-vite';

import { Spinner } from './spinner';

const meta = {
  title: 'UI/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: { className: 'size-3' },
};

export const Large: Story = {
  args: { className: 'size-8' },
};

export const CustomColor: Story = {
  args: { className: 'text-blue-500' },
};

export const AllSizes: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <Spinner className='size-3' />
      <Spinner className='size-4' />
      <Spinner className='size-6' />
      <Spinner className='size-8' />
      <Spinner className='size-10' />
    </div>
  ),
};
