import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sidebar } from './sidebar';

const meta = {
  title: 'Shared/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className='min-h-screen bg-muted p-6'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isVisible: true,
    selectedDate: null,
    setSelectedDate: () => {},
    query: '',
    setQuery: () => {},
  },
};

export const Hidden: Story = {
  args: {
    isVisible: false,
    selectedDate: null,
    setSelectedDate: () => {},
    query: '',
    setQuery: () => {},
  },
};
