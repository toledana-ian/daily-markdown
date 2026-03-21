import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Calendar } from '@/components/ui/calendar';

describe('Calendar', () => {
  it('uses the small radius token for its cell radius by default', () => {
    const { container } = render(<Calendar />);
    const calendarRoot = container.querySelector('[data-slot="calendar"]');

    expect(calendarRoot).not.toBeNull();
    expect(calendarRoot).toHaveClass('[--cell-radius:var(--radius-sm)]');
  });
});
