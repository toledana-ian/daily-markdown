import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
    },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Variants ---

export const Default: Story = {
  args: { children: 'Button' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Button' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Button' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Button' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Button' },
};

export const Link: Story = {
  args: { variant: 'link', children: 'Button' },
};

export const Disabled: Story = {
  args: { children: 'Button', disabled: true },
};

// --- Sizes ---

export const SizeXS: Story = {
  args: { size: 'xs', children: 'XS Button' },
};

export const SizeSM: Story = {
  args: { size: 'sm', children: 'SM Button' },
};

export const SizeLG: Story = {
  args: { size: 'lg', children: 'LG Button' },
};

// --- All Variants Grid ---

export const AllVariants: Story = {
  render: () => (
    <div className='flex flex-wrap gap-2'>
      <Button variant='default'>Default</Button>
      <Button variant='outline'>Outline</Button>
      <Button variant='secondary'>Secondary</Button>
      <Button variant='ghost'>Ghost</Button>
      <Button variant='destructive'>Destructive</Button>
      <Button variant='link'>Link</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className='flex flex-wrap items-center gap-2'>
      <Button size='xs'>XS</Button>
      <Button size='sm'>SM</Button>
      <Button size='default'>Default</Button>
      <Button size='lg'>LG</Button>
    </div>
  ),
};
