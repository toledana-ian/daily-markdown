import { cjk } from '@streamdown/cjk';
import { code } from '@streamdown/code';
import { math } from '@streamdown/math';
import { mermaid } from '@streamdown/mermaid';
import type { StreamdownProps } from 'streamdown';
import { MarkdownImage } from '@/components/common/markdown-image';
import { MarkdownParagraph } from '@/components/common/markdown-paragraph';

export const markdownPlugins: NonNullable<StreamdownProps['plugins']> = {
  cjk,
  code,
  math,
  mermaid,
};

export const markdownComponents: StreamdownProps['components'] = {
  img: MarkdownImage,
  p: MarkdownParagraph,
};
