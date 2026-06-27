import { type ComponentProps, type JSX } from 'react';
import type { Components } from 'streamdown';
import { useCheckboxContext } from '@/components/common/checkbox-context';

type MarkdownCheckboxInputProps = ComponentProps<
  Exclude<NonNullable<Components['input']>, keyof JSX.IntrinsicElements>
>;

export const MarkdownCheckboxInput = ({
  disabled,
  readOnly,
  ...props
}: MarkdownCheckboxInputProps) => {
  const ctx = useCheckboxContext();

  if (props.type !== 'checkbox' || !ctx?.enabled) {
    return <input disabled={disabled} readOnly={readOnly} {...props} />;
  }

  // Remove disabled so click events can fire; toggle is handled at container level
  return <input {...props} onChange={() => {}} style={{ ...props.style, cursor: 'pointer' }} />;
};
