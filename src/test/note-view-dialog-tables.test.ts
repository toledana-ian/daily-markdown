import { describe, expect, it } from 'vitest';
import {
  findContentEditableTableSpans,
  isContentEditableTableOpenTag,
  replaceContentEditableTableAtIndex,
  serializeContentEditableTable,
} from '@/features/notes/lib/note-view-dialog-tables';

describe('note-view-dialog table helpers', () => {
  it('detects contenteditable table open tags', () => {
    expect(isContentEditableTableOpenTag('<table contenteditable="true">')).toBe(true);
    expect(isContentEditableTableOpenTag("<table contenteditable='true'>")).toBe(true);
    expect(isContentEditableTableOpenTag('<table contenteditable=true>')).toBe(true);
    expect(isContentEditableTableOpenTag('<table>')).toBe(false);
  });

  it('finds only contenteditable tables in markdown source', () => {
    const content = [
      'Before',
      '<table contenteditable="true"><tr><td>A</td></tr></table>',
      'Middle',
      '<table><tr><td>Static</td></tr></table>',
      'After',
    ].join('\n');

    const spans = findContentEditableTableSpans(content);

    expect(spans).toHaveLength(1);
    expect(spans[0]?.html).toBe(
      '<table contenteditable="true"><tr><td>A</td></tr></table>',
    );
    expect(content.slice(0, spans[0]?.start)).toBe('Before\n');
    expect(content.slice(spans[0]?.end ?? 0)).toBe(
      '\nMiddle\n<table><tr><td>Static</td></tr></table>\nAfter',
    );
  });

  it('replaces a contenteditable table by index without touching surrounding markdown', () => {
    const content = [
      '# Title',
      '',
      '<table contenteditable="true"><tr><td>Old</td></tr></table>',
      '',
      '- [ ] task',
    ].join('\n');
    const updated = replaceContentEditableTableAtIndex(
      content,
      0,
      '<table contenteditable="true"><tr><td>New</td></tr></table>',
    );

    expect(updated).toBe(
      [
        '# Title',
        '',
        '<table contenteditable="true"><tr><td>New</td></tr></table>',
        '',
        '- [ ] task',
      ].join('\n'),
    );
  });

  it('serializes edited table DOM with the original opening tag preserved', () => {
    document.body.innerHTML =
      '<table class="w-full" data-streamdown="table" contenteditable="true"><tbody data-streamdown="table-body"><tr data-streamdown="table-row"><td class="px-4" data-streamdown="table-cell">Edited</td></tr></tbody></table>';
    const table = document.querySelector('table') as HTMLTableElement;
    const original =
      '<table contenteditable="true"><tr><td>Cell</td></tr></table>';

    expect(serializeContentEditableTable(table, original)).toBe(
      '<table contenteditable="true"><tbody><tr><td>Edited</td></tr></tbody></table>',
    );
  });
});
