import type { Element } from 'hast';
import type { JSX } from 'react';

export const MarkdownListItem = ({
  children,
  ...props
}: JSX.IntrinsicElements['li'] & { node?: Element }) => {
  let renderChildren = children;

  // remove empty lines so that they don't render new line then the list item'
  if (children && Array.isArray(children)) {
    renderChildren = children.filter((child) => child !=='\n');
    renderChildren = renderChildren.map(child=>{
      if (child.props && child.props.node && child.props.node.tagName === 'p') {
        return child.props.children;
      }
      return child;
    })
  }

  // if there is an input in the list item, wrap it in a div so that it does not render a list item checkbox
  if (renderChildren && Array.isArray(renderChildren) && renderChildren.some((child) => child.type === 'input')) {
    return <div>{renderChildren}</div>
  }

  return <li {...props}>{renderChildren}</li>;
};
