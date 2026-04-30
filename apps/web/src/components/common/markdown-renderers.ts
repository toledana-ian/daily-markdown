import { cjk } from '@streamdown/cjk';
import { code } from '@streamdown/code';
import { math } from '@streamdown/math';
import { mermaid } from '@streamdown/mermaid';
import type { StreamdownProps } from 'streamdown';
import { MarkdownCheckboxInput } from '@/components/common/markdown-checkbox-input';
import { MarkdownImage } from '@/components/common/markdown-image';
import { MarkdownListItem } from '@/components/common/markdown-list-item';
import { MarkdownParagraph } from '@/components/common/markdown-paragraph';

export const markdownPlugins: NonNullable<StreamdownProps['plugins']> = {
  cjk,
  code,
  math,
  mermaid,
};

export const markdownComponents = {
  img: MarkdownImage,
  input: MarkdownCheckboxInput,
  li: MarkdownListItem,
  p: MarkdownParagraph,
} satisfies NonNullable<StreamdownProps['components']>;
