export type ContentEditableTableSpan = {
  end: number;
  html: string;
  start: number;
};

const CONTENT_EDITABLE_TRUE_RE = /\bcontenteditable\s*=\s*(?:true|"true"|'true')/i;

export function isContentEditableTableOpenTag(openTag: string): boolean {
  return CONTENT_EDITABLE_TRUE_RE.test(openTag);
}

function findTagEnd(content: string, tagStart: number): number {
  return content.indexOf('>', tagStart);
}

export function findContentEditableTableSpans(content: string): ContentEditableTableSpan[] {
  const spans: ContentEditableTableSpan[] = [];
  let searchFrom = 0;

  while (searchFrom < content.length) {
    const openStart = content.indexOf('<table', searchFrom);
    if (openStart === -1) break;

    const openEnd = findTagEnd(content, openStart);
    if (openEnd === -1) break;

    const openTag = content.slice(openStart, openEnd + 1);
    if (!isContentEditableTableOpenTag(openTag)) {
      searchFrom = openStart + 1;
      continue;
    }

    let depth = 1;
    let pos = openEnd + 1;
    let parsed = false;

    while (depth > 0 && pos < content.length) {
      const nextOpen = content.indexOf('<table', pos);
      const nextClose = content.indexOf('</table', pos);

      if (nextClose === -1) break;

      if (nextOpen !== -1 && nextOpen < nextClose) {
        const nestedOpenEnd = findTagEnd(content, nextOpen);
        if (nestedOpenEnd === -1) break;
        depth += 1;
        pos = nestedOpenEnd + 1;
        continue;
      }

      const closeEnd = findTagEnd(content, nextClose);
      if (closeEnd === -1) break;

      depth -= 1;
      if (depth === 0) {
        const end = closeEnd + 1;
        spans.push({ start: openStart, end, html: content.slice(openStart, end) });
        searchFrom = end;
        parsed = true;
      } else {
        pos = closeEnd + 1;
      }
    }

    if (!parsed) {
      searchFrom = openStart + 1;
    }
  }

  return spans;
}

export function replaceContentEditableTableAtIndex(
  content: string,
  index: number,
  newTableHtml: string,
): string {
  const spans = findContentEditableTableSpans(content);
  const span = spans[index];
  if (!span) return content;

  return content.slice(0, span.start) + newTableHtml + content.slice(span.end);
}

function stripStreamdownDecorations(root: Element): void {
  const elements = [root, ...Array.from(root.querySelectorAll('[data-streamdown]'))];
  for (const element of elements) {
    element.removeAttribute('data-streamdown');
    element.removeAttribute('class');
  }
}

export function serializeContentEditableTable(
  table: HTMLTableElement,
  originalTableHtml: string,
): string {
  const openEnd = originalTableHtml.indexOf('>');
  const clone = table.cloneNode(true) as HTMLTableElement;
  stripStreamdownDecorations(clone);

  if (openEnd === -1) {
    clone.setAttribute('contenteditable', 'true');
    return clone.outerHTML;
  }

  return `${originalTableHtml.slice(0, openEnd + 1)}${clone.innerHTML}</table>`;
}
