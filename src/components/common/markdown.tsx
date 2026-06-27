import 'katex/dist/katex.min.css';
import 'rehype-github-alerts/styling/css/index.css';
import { rehypeGithubAlerts } from 'rehype-github-alerts';
import rehypeRaw from 'rehype-raw';
import 'streamdown/styles.css';
import { Streamdown, type StreamdownProps } from 'streamdown';
import { visit } from 'unist-util-visit';
import { markdownComponents, markdownPlugins } from '@/components/common/markdown-renderers';
import { cn } from '@/lib/utils';

// Known valid HTML element tag names
const KNOWN_HTML_TAGS = new Set([
  'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base',
  'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption',
  'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del',
  'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset',
  'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5',
  'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img',
  'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'main', 'map',
  'mark', 'menu', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol',
  'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q',
  'rp', 'rt', 'ruby', 's', 'samp', 'script', 'search', 'section', 'select',
  'slot', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary',
  'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th',
  'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr',
]);

function rehypeStripUnknownElements() {
  return (tree: Parameters<typeof visit>[0]) => {
    visit(tree, 'element', (node: { type: string; tagName: string; children: unknown[] }, index, parent) => {
      if (!KNOWN_HTML_TAGS.has(node.tagName) && parent && typeof index === 'number') {
        (parent as { children: unknown[] }).children.splice(index, 1, ...node.children);
        return index;
      }
    });
  };
}

// Leading task marker inside a table cell, e.g. `- [ ] 1` or `[x] done`.
// GFM only turns `- [ ]` into a checkbox inside list items, so table cells keep
// the raw text. This matches that leading marker so we can render a checkbox.
const TABLE_CELL_CHECKBOX_REGEX = /^(\s*(?:- )?)\[([ xX])\](\s?)/;

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

// Convert leading `- [ ]` / `[x]` markers inside table cells into checkbox
// inputs so they render like GFM task-list items. The produced input mirrors
// GFM's output (`<input type="checkbox" disabled>`); interactivity is layered
// on by the input renderer via checkbox context.
function rehypeTableCellCheckbox() {
  return (tree: Parameters<typeof visit>[0]) => {
    visit(tree, 'element', (node: HastNode) => {
      if (node.tagName !== 'td' && node.tagName !== 'th') return;
      const children = node.children;
      if (!children || children.length === 0) return;

      const first = children[0];
      if (first.type !== 'text' || typeof first.value !== 'string') return;

      const match = first.value.match(TABLE_CELL_CHECKBOX_REGEX);
      if (!match) return;

      const checked = match[2].toLowerCase() === 'x';
      const remainder = first.value.slice(match[0].length);

      const input: HastNode = {
        type: 'element',
        tagName: 'input',
        properties: { type: 'checkbox', disabled: true, checked },
        children: [],
      };

      const replacement: HastNode[] = [input];
      if (remainder) {
        replacement.push({ type: 'text', value: remainder });
      }
      children.splice(0, 1, ...replacement);
    });
  };
}

const markdownRehypePlugins: NonNullable<StreamdownProps['rehypePlugins']> = [
  rehypeRaw,
  [rehypeGithubAlerts, {}],
  rehypeTableCellCheckbox,
  rehypeStripUnknownElements,
];

type MarkdownProps = {
  className?: string;
  content: string;
  emptyMessage?: string;
};

export const Markdown = ({ className, content, emptyMessage }: MarkdownProps) => {
  if (!content.trim()) {
    return emptyMessage ? (
      <p className={cn('text-sm text-muted-foreground', className)}>{emptyMessage}</p>
    ) : null;
  }

  return (
    <Streamdown
      key={content}
      className={cn('markdownnote-editor-container', className)}
      components={markdownComponents}
      mode='static'
      plugins={markdownPlugins}
      rehypePlugins={markdownRehypePlugins}
      linkSafety={{ enabled: false }}
      children={content}
    />
  );
};
