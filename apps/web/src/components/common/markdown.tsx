import 'katex/dist/katex.min.css';
import 'rehype-github-alerts/styling/css/index.css';
import { rehypeGithubAlerts } from 'rehype-github-alerts';
import rehypeRaw from 'rehype-raw';
import 'streamdown/styles.css';
import { Streamdown, type StreamdownProps } from 'streamdown';
import { markdownComponents, markdownPlugins } from '@/components/common/markdown-renderers';
import { cn } from '@/lib/utils';

const markdownRehypePlugins: NonNullable<StreamdownProps['rehypePlugins']> = [
  rehypeRaw,
  [rehypeGithubAlerts, {}],
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
