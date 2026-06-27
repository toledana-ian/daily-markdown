import { describe, expect, it } from 'vitest';
import {
  applyCheckboxToggles,
  collectDescendants,
  parseCheckboxes,
} from '@/features/notes/lib/note-checkboxes';

describe('parseCheckboxes', () => {
  it('parses flat list checkboxes', () => {
    const content = '- [ ] one\n- [x] two';
    const result = parseCheckboxes(content);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ index: 0, checked: false, isTable: false, parentIndex: -1 });
    expect(result[1]).toMatchObject({ index: 1, checked: true, isTable: false, parentIndex: -1 });
  });

  it('tracks nested list parents', () => {
    const content = '- [ ] parent\n  - [ ] child\n    - [x] grandchild';
    const result = parseCheckboxes(content);
    expect(result[1].parentIndex).toBe(0);
    expect(result[2].parentIndex).toBe(1);
  });

  it('parses checkboxes inside table cells in document order', () => {
    const content = [
      '| Done | Phase |',
      '|---|---|',
      '| - [ ] 1 | start |',
      '| - [x] 2 | next |',
    ].join('\n');
    const result = parseCheckboxes(content);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ index: 0, checked: false, isTable: true, parentIndex: -1 });
    expect(result[1]).toMatchObject({ index: 1, checked: true, isTable: true, parentIndex: -1 });
  });

  it('parses multiple checkboxes within a single table row left to right', () => {
    const content = '| a | b |\n|---|---|\n| - [ ] x | - [x] y |';
    const result = parseCheckboxes(content);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ checked: false, isTable: true });
    expect(result[1]).toMatchObject({ checked: true, isTable: true });
  });

  it('supports table checkboxes without the leading dash', () => {
    const content = '| a |\n|---|\n| [x] done |';
    const result = parseCheckboxes(content);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ checked: true, isTable: true });
  });

  it('keeps list and table checkboxes in combined document order', () => {
    const content = ['- [ ] list one', '', '| h |', '|---|', '| - [x] table one |'].join('\n');
    const result = parseCheckboxes(content);
    expect(result.map((c) => c.isTable)).toEqual([false, true]);
    expect(result.map((c) => c.checked)).toEqual([false, true]);
  });
});

describe('collectDescendants', () => {
  it('cascades to nested list descendants', () => {
    const content = '- [ ] parent\n  - [ ] child\n    - [ ] grandchild';
    const checkboxes = parseCheckboxes(content);
    expect(collectDescendants(0, checkboxes).sort()).toEqual([0, 1, 2]);
  });

  it('does not cascade across table checkboxes', () => {
    const content = '| h |\n|---|\n| - [ ] a |\n| - [ ] b |';
    const checkboxes = parseCheckboxes(content);
    expect(collectDescendants(0, checkboxes)).toEqual([0]);
  });
});

describe('applyCheckboxToggles', () => {
  it('checks a list checkbox without touching surrounding text', () => {
    const content = '- [ ] one\n- [ ] two';
    const checkboxes = parseCheckboxes(content);
    expect(applyCheckboxToggles(content, [1], checkboxes, true)).toBe('- [ ] one\n- [x] two');
  });

  it('unchecks a list checkbox', () => {
    const content = '- [x] done';
    const checkboxes = parseCheckboxes(content);
    expect(applyCheckboxToggles(content, [0], checkboxes, false)).toBe('- [ ] done');
  });

  it('toggles a checkbox inside a table cell only', () => {
    const content = '| Done | Phase |\n|---|---|\n| - [ ] 1 | start |';
    const checkboxes = parseCheckboxes(content);
    const next = applyCheckboxToggles(content, [0], checkboxes, true);
    expect(next).toBe('| Done | Phase |\n|---|---|\n| - [x] 1 | start |');
  });

  it('toggles only the targeted checkbox in a multi-checkbox row', () => {
    const content = '| a | b |\n|---|---|\n| - [ ] x | - [ ] y |';
    const checkboxes = parseCheckboxes(content);
    const next = applyCheckboxToggles(content, [1], checkboxes, true);
    expect(next).toBe('| a | b |\n|---|---|\n| - [ ] x | - [x] y |');
  });
});
