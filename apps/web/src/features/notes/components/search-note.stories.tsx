import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { SearchNote } from './search-note';

const meta = {
  title: 'Features/Notes/SearchNote',
  component: SearchNote,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SearchNote>;

export default meta;
type Story = StoryObj<typeof meta>;

function SearchNotePreview({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);

  return (
    <div className='w-80 space-y-3'>
      <SearchNote query={query} setQuery={setQuery} />
      <div className='text-sm text-muted-foreground'>Current query: {query || 'none'}</div>
    </div>
  );
}

export const Default: Story = {
  args: {
    query: '',
    setQuery: fn(),
  },
  render: () => <SearchNotePreview />,
};

export const WithValue: Story = {
  args: {
    query: 'meeting notes',
    setQuery: fn(),
  },
  render: () => <SearchNotePreview initialQuery='meeting notes' />,
};
