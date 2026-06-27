import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { NoteCard } from './note-card';

const richMarkdownContent = `# Product sync

Ship the next release with **strong defaults**, _tight feedback loops_, and inline \`pnpm test\` checks.

> Preview cards should make formatting differences obvious at a glance.

## Checklist

- [x] Heading hierarchy
- [x] Emphasis and inline code
- [x] Blockquotes and lists

1. Review API copy
2. Confirm empty state
3. Polish spacing`;

const codeAndMathContent = `# Engineering note

Use fenced code blocks for examples:

\`\`\`ts
export function sum(a: number, b: number) {
  return a + b;
}
\`\`\`

Inline math like $E = mc^2$ and block math:

$$
\\int_0^1 x^2\\,dx = \\frac{1}{3}
$$`;

const diagramContent = `# Release flow

\`\`\`mermaid
flowchart LR
  Draft[Draft note] --> Review[Review content]
  Review --> Publish[Publish update]
\`\`\``;

const meta = {
  title: 'Features/Notes/NoteCard',
  component: NoteCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className='min-h-screen bg-slate-50 p-6'>
        <Story />
      </div>
    ),
  ],
  args: {
    content: richMarkdownContent,
    onSave: fn(),
  },
} satisfies Meta<typeof NoteCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CodeAndMath: Story = {
  args: {
    content: codeAndMathContent,
  },
};

export const MermaidDiagram: Story = {
  args: {
    content: diagramContent,
  },
};

export const Empty: Story = {
  args: {
    content: '',
  },
};
