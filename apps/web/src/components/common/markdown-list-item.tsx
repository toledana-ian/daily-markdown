import type { Element } from 'hast';
import type { JSX } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';

const LIST_STYLES = ['disc', 'circle', 'square'];

export const MarkdownListItem = ({
  children,
  ...props
}: JSX.IntrinsicElements['li'] & { node?: Element }) => {
  const liRef = useRef<HTMLLIElement>(null);
  const [listStyle, setListStyle] = useState('disc');

  useLayoutEffect(() => {
    if (!liRef.current) return;
    let depth = 0;
    let parent = liRef.current.parentElement;
    while (parent) {
      if (parent.tagName === 'UL' || parent.tagName === 'OL') depth++;
      parent = parent.parentElement;
    }
    setListStyle(LIST_STYLES[(depth - 1) % LIST_STYLES.length] ?? 'disc');
  }, []);

  let renderChildren = children;

  // remove empty lines so that they don't render new line then the list item
  if (children && Array.isArray(children)) {
    renderChildren = children.filter((child) => child !== '\n');
    renderChildren = renderChildren.map(child => {
      if (child.props && child.props.node && child.props.node.tagName === 'p') {
        return child.props.children;
      }
      return child;
    });
  }

  // if there is an input in the list item, suppress the bullet but keep <li> so nested lists retain indentation
  if (renderChildren && Array.isArray(renderChildren) && renderChildren.some((child) => child.type === 'input')) {
    return <li ref={liRef} {...props} style={{ ...props.style, listStyle: 'none' }}>{renderChildren}</li>;
  }

  console.log(renderChildren);

  return <li ref={liRef} {...props} style={{ ...props.style, listStyleType: listStyle }}>{renderChildren}</li>;
};
