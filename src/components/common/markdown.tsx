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

const markdownRehypePlugins: NonNullable<StreamdownProps['rehypePlugins']> = [
  rehypeRaw,
  [rehypeGithubAlerts, {}],
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
