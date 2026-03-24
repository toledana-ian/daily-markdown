import type { Meta, StoryObj } from '@storybook/react-vite';

import { Markdown } from './markdown';

const meta = {
  title: 'Shared/Markdown',
  component: Markdown,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    className: 'prose prose-sm max-w-2xl',
  },
} satisfies Meta<typeof Markdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: `# Daily note

Track ideas with **markdown**, inline \`code\`, and math like $E=mc^2$.

- Capture tasks
- Link related thoughts
- Keep one clean writing surface`,
  },
};

export const EmptyState: Story = {
  args: {
    content: '   ',
    emptyMessage: 'Start writing to preview your note.',
  },
};
