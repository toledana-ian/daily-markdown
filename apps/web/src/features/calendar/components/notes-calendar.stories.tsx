import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { NotesCalendar } from './notes-calendar';

const sampleCounts = [
  { date: new Date('2026-03-05T00:00:00Z'), count: 2 },
  { date: new Date('2026-03-06T00:00:00Z'), count: 7 },
  { date: new Date('2026-03-07T00:00:00Z'), count: 12 },
  { date: new Date('2026-03-08T00:00:00Z'), count: 17 },
  { date: new Date('2026-03-09T00:00:00Z'), count: 24 },
  { date: new Date('2026-03-10T00:00:00Z'), count: 0 },
];

const meta = {
  title: 'Features/Calendar/NotesCalendar',
  component: NotesCalendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NotesCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

function NotesCalendarPreview() {
  const [selected, setSelected] = useState<Date | null>(new Date('2026-03-08T00:00:00Z'));

  return (
    <div className='rounded-3xl bg-white p-4 shadow-sm'>
      <NotesCalendar
        defaultMonth={new Date('2026-03-01T00:00:00Z')}
        noteCountsByDate={sampleCounts}
        selected={selected}
        onSelect={setSelected}
      />
    </div>
  );
}

export const Default: Story = {
  args: {},
  render: () => <NotesCalendarPreview />,
};
