export type CheckboxInfo = {
  index: number;
  lineIndex: number;
  // Index within the line of the state character that sits between the brackets,
  // e.g. the position of `x` (or the space) in `[x]`. Used for precise toggling.
  charIndex: number;
  indentation: number;
  checked: boolean;
  parentIndex: number;
  // Checkboxes that live inside a markdown table cell. They never participate in
  // the nested-list parent/child cascade.
  isTable: boolean;
};

// List checkbox at the start of a line: `  - [ ] text`
const LIST_CHECKBOX_REGEX = /^(\s*)- \[([ xX])\]/;
// Table-cell checkbox: a cell that starts with an optional `- ` then `[ ]`/`[x]`,
// e.g. `| - [ ] 1 |`. Anchoring to the `|` keeps us from matching `[x](link)` text.
const TABLE_CHECKBOX_REGEX = /(\|\s*(?:- )?\[)([ xX])(\])/g;

const isTableRow = (line: string): boolean => line.includes('|');

/**
 * Parse every interactive checkbox in the markdown source — both GFM task-list
 * items and checkboxes embedded inside table cells — in document order. The
 * order matches the DOM order of rendered `input[type="checkbox"]` elements so
 * the view dialog can map a clicked checkbox back to its source line.
 */
export function parseCheckboxes(content: string): CheckboxInfo[] {
  const lines = content.split('\n');
  const checkboxes: CheckboxInfo[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const listMatch = line.match(LIST_CHECKBOX_REGEX);

    if (listMatch) {
      const indentation = listMatch[1].length;
      const checked = listMatch[2].toLowerCase() === 'x';
      // `<indent>- [` is the prefix; the state char follows it.
      const charIndex = indentation + 3;

      // Nearest preceding list checkbox with strictly less indentation is the
      // parent. Table checkboxes never act as parents.
      let parentIndex = -1;
      for (let j = checkboxes.length - 1; j >= 0; j--) {
        if (checkboxes[j].isTable) continue;
        if (checkboxes[j].indentation < indentation) {
          parentIndex = checkboxes[j].index;
          break;
        }
      }

      checkboxes.push({
        index: checkboxes.length,
        lineIndex: i,
        charIndex,
        indentation,
        checked,
        parentIndex,
        isTable: false,
      });
      continue;
    }

    if (!isTableRow(line)) continue;

    TABLE_CHECKBOX_REGEX.lastIndex = 0;
    let tableMatch: RegExpExecArray | null;
    while ((tableMatch = TABLE_CHECKBOX_REGEX.exec(line)) !== null) {
      const checked = tableMatch[2].toLowerCase() === 'x';
      // match[1] is everything up to and including the opening `[`.
      const charIndex = tableMatch.index + tableMatch[1].length;

      checkboxes.push({
        index: checkboxes.length,
        lineIndex: i,
        charIndex,
        indentation: 0,
        checked,
        parentIndex: -1,
        isTable: true,
      });
    }
  }

  return checkboxes;
}

/**
 * Collect a checkbox and all of its nested descendants (for cascading a parent
 * toggle down to its children). Table checkboxes have no descendants.
 */
export function collectDescendants(targetIndex: number, checkboxes: CheckboxInfo[]): number[] {
  const result: number[] = [targetIndex];
  const queue = [targetIndex];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const cb of checkboxes) {
      if (cb.parentIndex === current) {
        result.push(cb.index);
        queue.push(cb.index);
      }
    }
  }

  return result;
}

/**
 * Toggle the given checkbox indices to `newState` by flipping the single state
 * character between the brackets, leaving the rest of the line untouched. This
 * works identically for list and table checkboxes.
 */
export function applyCheckboxToggles(
  content: string,
  indicesToToggle: number[],
  checkboxes: CheckboxInfo[],
  newState: boolean,
): string {
  const lines = content.split('\n');
  const indexSet = new Set(indicesToToggle);
  const stateChar = newState ? 'x' : ' ';

  for (const cb of checkboxes) {
    if (!indexSet.has(cb.index)) continue;
    const line = lines[cb.lineIndex];
    lines[cb.lineIndex] = line.slice(0, cb.charIndex) + stateChar + line.slice(cb.charIndex + 1);
  }

  return lines.join('\n');
}
