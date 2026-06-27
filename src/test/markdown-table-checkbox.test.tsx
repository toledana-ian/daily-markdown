import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CheckboxContext } from '@/components/common/checkbox-context';
import { Markdown } from '@/components/common/markdown';

const TABLE = [
  '| Done | Phase |',
  '|---|---|',
  '| - [ ] 1 | start |',
  '| - [x] 2 | next |',
].join('\n');

describe('Markdown table checkbox rendering', () => {
  it('renders task markers inside table cells as checkboxes', () => {
    const { container } = render(<Markdown content={TABLE} />);
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes).toHaveLength(2);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(false);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(true);
  });

  it('keeps the remaining cell text alongside the checkbox', () => {
    const { container } = render(<Markdown content={TABLE} />);
    const firstCell = container.querySelector('td');
    expect(firstCell?.textContent).toContain('1');
  });

  it('still renders list task items as checkboxes', () => {
    const { container } = render(<Markdown content={'- [ ] a\n- [x] b'} />);
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes).toHaveLength(2);
  });

  it('makes table checkboxes interactive when checkbox context is enabled', () => {
    const { container } = render(
      <CheckboxContext.Provider value={{ enabled: true }}>
        <Markdown content={TABLE} />
      </CheckboxContext.Provider>,
    );
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox.disabled).toBe(false);
  });
});
