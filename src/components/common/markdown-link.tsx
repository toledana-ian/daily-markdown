import type { Element } from 'hast';
import type { JSX } from 'react';

export const MarkdownLink = ({
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  node,
  ...props
}: JSX.IntrinsicElements['a'] & { node?: Element }) => {
  return <a {...props} target={'_blank'} className={'flex w-fit underline text-primary'}>{children}</a>;
};
