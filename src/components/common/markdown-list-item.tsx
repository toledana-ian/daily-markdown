import type { Element } from 'hast';
import { type ReactNode, isValidElement, useLayoutEffect, useRef } from 'react';
import type { JSX } from 'react';
import { MarkdownCheckboxInput } from '@/components/common/markdown-checkbox-input';

const LIST_STYLES = ['disc', 'circle', 'square'];

const isNestedList = (child: ReactNode): boolean => {
  if (!isValidElement(child)) return false;
  const node = (child.props as { node?: Element }).node;
  return node?.tagName === 'ul' || node?.tagName === 'ol';
};

export const MarkdownListItem = ({
  children,
  ...props
}: JSX.IntrinsicElements['li'] & { node?: Element }) => {
  const liRef = useRef<HTMLLIElement>(null);

  useLayoutEffect(() => {
    if (!liRef.current) return;
    // Checkbox items have listStyle: none set via inline style — skip them
    if (liRef.current.style.listStyle === 'none') return;
    let depth = 0;
    let parent = liRef.current.parentElement;
    while (parent) {
      if (parent.tagName === 'UL' || parent.tagName === 'OL') depth++;
      parent = parent.parentElement;
    }
    liRef.current.style.listStyleType = LIST_STYLES[(depth - 1) % LIST_STYLES.length] ?? 'disc';
  }, []);

  let renderChildren: ReactNode = children;

  // remove empty lines so that they don't render new line then the list item
  if (children && Array.isArray(children)) {
    const childArray = children as ReactNode[];
    renderChildren = childArray
      .filter((child) => child !== '\n')
      .map((child: ReactNode) => {
        if (isValidElement(child) && (child.props as { node?: Element }).node?.tagName === 'p') {
          return (child.props as { children?: ReactNode }).children;
        }
        return child;
      });
  }

  // flat() handles the case where paragraph unwrapping returns an array as a child element,
  // burying the input one level deep (e.g. [input, "", strong] as a single array child)
  const flatChildren = Array.isArray(renderChildren) ? renderChildren.flat() : [];
  const isCheckboxItem = flatChildren.some(
    (child) =>
      isValidElement(child) && (child.type === 'input' || child.type === MarkdownCheckboxInput),
  );

  if (isCheckboxItem) {
    const inlineContent = (renderChildren as ReactNode[]).filter((child) => !isNestedList(child));
    const blockContent = (renderChildren as ReactNode[]).filter(isNestedList);

    return (
      <li ref={liRef} {...props} style={{ ...props.style, listStyle: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>{inlineContent}</div>
        {blockContent}
      </li>
    );
  }

  return <li ref={liRef} {...props}>{renderChildren}</li>;
};
