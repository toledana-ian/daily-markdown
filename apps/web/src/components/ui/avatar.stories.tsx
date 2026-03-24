import type { Meta, StoryObj } from '@storybook/react-vite';
import { RiCheckLine } from '@remixicon/react';

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from './avatar';

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src='https://i.pravatar.cc/80?img=12' alt='User avatar' />
      <AvatarFallback>DM</AvatarFallback>
    </Avatar>
  ),
};

export const FallbackOnly: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>CT</AvatarFallback>
    </Avatar>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <Avatar size='lg'>
      <AvatarImage src='https://i.pravatar.cc/96?img=32' alt='Online user avatar' />
      <AvatarFallback>ON</AvatarFallback>
      <AvatarBadge>
        <RiCheckLine />
      </AvatarBadge>
    </Avatar>
  ),
};

export const Grouped: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar size='sm'>
        <AvatarImage src='https://i.pravatar.cc/64?img=5' alt='Ava' />
        <AvatarFallback>AV</AvatarFallback>
      </Avatar>
      <Avatar size='sm'>
        <AvatarImage src='https://i.pravatar.cc/64?img=6' alt='Noah' />
        <AvatarFallback>NH</AvatarFallback>
      </Avatar>
      <Avatar size='sm'>
        <AvatarFallback>RM</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+4</AvatarGroupCount>
    </AvatarGroup>
  ),
};
