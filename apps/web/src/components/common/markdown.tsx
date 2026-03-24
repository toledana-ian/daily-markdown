import { cjk } from '@streamdown/cjk';
import { code } from '@streamdown/code';
import { math } from '@streamdown/math';
import { mermaid } from '@streamdown/mermaid';
import 'katex/dist/katex.min.css';
import 'streamdown/styles.css';
import { Streamdown, type StreamdownProps } from 'streamdown';
import { cn } from '@/lib/utils';

const markdownPlugins: NonNullable<StreamdownProps['plugins']> = {
  cjk,
  code,
  math,
  mermaid,
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
    <Streamdown className={cn('prose', className)} mode='static' plugins={markdownPlugins}>
      {content}
    </Streamdown>
  );
};
