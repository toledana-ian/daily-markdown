import type { Element } from 'hast';
import type { JSX } from 'react';

const hasImageDescendant = (node: Element): boolean => {
  return node.children.some((child) => {
    if (child.type !== 'element') {
      return false;
    }

    return child.tagName === 'img' || hasImageDescendant(child);
  });
};

const isImageParagraph = (node?: Element) => {
  return node?.tagName === 'p' && hasImageDescendant(node);
};

export const MarkdownParagraph = ({
  children,
  node,
  ...props
}: JSX.IntrinsicElements['p'] & { node?: Element }) => {
  if (isImageParagraph(node)) {
    return <div {...props}>{children}</div>;
  }

  return <p {...props}>{children}</p>;
};
