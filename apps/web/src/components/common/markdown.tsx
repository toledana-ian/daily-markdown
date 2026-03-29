import { cjk } from '@streamdown/cjk';
import { code } from '@streamdown/code';
import { math } from '@streamdown/math';
import { mermaid } from '@streamdown/mermaid';
import type { Element } from 'hast';
import 'katex/dist/katex.min.css';
import 'rehype-github-alerts/styling/css/index.css';
import { rehypeGithubAlerts } from 'rehype-github-alerts';
import 'streamdown/styles.css';
import { Streamdown, type StreamdownProps } from 'streamdown';
import { cn } from '@/lib/utils';

const markdownPlugins: NonNullable<StreamdownProps['plugins']> = {
  cjk,
  code,
  math,
  mermaid,
};

const markdownRehypePlugins: NonNullable<StreamdownProps['rehypePlugins']> = [
  [rehypeGithubAlerts, {}],
];

const hasImageDescendant = (node: Element): boolean => {
  return node.children.some((child) => {
    if (child.type !== 'element') {
      return false;
    }

    return child.tagName === 'img' || hasImageDescendant(child);
  });
};

export const isImageParagraph = (node?: Element) => {
  return node?.tagName === 'p' && hasImageDescendant(node);
};

const markdownComponents: StreamdownProps['components'] = {
  p: ({ children, node, ...props }) => {
    if (isImageParagraph(node)) {
      return <div {...props}>{children}</div>;
    }

    return <p {...props}>{children}</p>;
  },
};

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
      className={cn('markdown-container', className)}
      components={markdownComponents}
      mode='static'
      plugins={markdownPlugins}
      rehypePlugins={markdownRehypePlugins}
    >
      {content}
    </Streamdown>
  );
};
